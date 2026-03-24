import User from '../models/User.js';
import Internship from '../models/Internship.js';
import ProgressReport from '../models/ProgressReport.js';
import File from '../models/File.js';
import Notification from '../models/Notification.js';
import { sendInternshipStatusEmail } from '../utils/emailService.js';
import { calculateProgress } from '../utils/progressCalculator.js';
import { getEffectiveInternshipStatus } from '../utils/internshipLifecycle.js';

const notifyStudentOnStatusChange = async (internshipId, status) => {
  const internship = await Internship.findById(internshipId)
    .populate('studentId', 'name email')
    .select('companyName role position studentId');

  if (!internship?.studentId?.email) {
    return;
  }

  const isApproved = status === 'approved';
  const title = isApproved ? 'Internship Approved' : 'Internship Rejected';
  const message = `Your internship at ${internship.companyName} for ${internship.role || internship.position || 'Intern'} has been ${isApproved ? 'approved' : 'rejected'} by admin.`;

  await Notification.create({
    userId: internship.studentId._id,
    role: 'student',
    internshipId: internship._id,
    title,
    message,
    type: isApproved ? 'internship_approved' : 'internship_rejected'
  });

  await sendInternshipStatusEmail({
    studentName: internship.studentId.name,
    studentEmail: internship.studentId.email,
    companyName: internship.companyName,
    role: internship.role || internship.position,
    status
  });
};

const notifyStudentOnReportFeedback = async (reportId) => {
  const report = await ProgressReport.findById(reportId)
    .populate('studentId', 'name')
    .populate('internshipId', 'companyName');

  if (!report?.studentId?._id) {
    return;
  }

  const internshipId = report.internshipId?._id;
  const companyName = report.internshipId?.companyName || 'your internship';

  await Notification.create({
    userId: report.studentId._id,
    role: 'student',
    internshipId,
    title: 'Report Feedback Received',
    message: `Admin added feedback on your progress report for ${companyName}.`,
    type: 'report_feedback_added'
  });
};

const rejectOverlappingPendingInternships = async (approvedInternship) => {
  if (!approvedInternship) {
    return;
  }

  await Internship.updateMany(
    {
      studentId: approvedInternship.studentId,
      _id: { $ne: approvedInternship._id },
      status: 'pending',
      startDate: { $lte: approvedInternship.endDate },
      endDate: { $gte: approvedInternship.startDate }
    },
    {
      $set: {
        status: 'rejected'
      }
    }
  );
};

// Get all students
export const getAllStudents = async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });

  res.json({
    success: true,
    students
  });
};

// Get student details
export const getStudentDetails = async (req, res) => {
  const student = await User.findById(req.params.studentId);

  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: 'Student not found' });
  }

  const internships = await Internship.find({ studentId: student._id });
  const reports = await ProgressReport.find({ studentId: student._id });

  const normalizedInternships = internships.map((internship) => {
    const plainInternship = internship.toObject();
    plainInternship.status = getEffectiveInternshipStatus(plainInternship.status, plainInternship.endDate);
    return plainInternship;
  });

  res.json({
    success: true,
    student: student.toJSON(),
    internships: normalizedInternships,
    reports
  });
};

// Get all internships
export const getAllInternships = async (req, res) => {
  const internships = await Internship.find()
    .populate('studentId', 'name email department semester')
    .sort({ createdAt: -1 });

  const internshipIds = internships.map((internship) => internship._id);
  const files = await File.find({ internshipId: { $in: internshipIds } })
    .select('internshipId fileName fileUrl fileType createdAt')
    .sort({ createdAt: -1 });

  const filesByInternship = new Map();

  for (const fileDoc of files) {
    const internshipId = fileDoc.internshipId.toString();
    if (!filesByInternship.has(internshipId)) {
      filesByInternship.set(internshipId, []);
    }
    filesByInternship.get(internshipId).push(fileDoc);
  }

  const internshipsWithFiles = internships.map((internship) => {
    const plainInternship = internship.toObject();
    const effectiveStatus = getEffectiveInternshipStatus(plainInternship.status, plainInternship.endDate);

    plainInternship.status = effectiveStatus;
    plainInternship.files = filesByInternship.get(internship._id.toString()) || [];
    plainInternship.progress = effectiveStatus === 'approved' || effectiveStatus === 'completed'
      ? calculateProgress(internship.startDate, internship.endDate)
      : 0;

    return plainInternship;
  });

  res.json({
    success: true,
    internships: internshipsWithFiles
  });
};

// Update internship status (approve/reject)
export const updateInternshipStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Please provide internship status' });
  }

  const normalizedStatus = status.toLowerCase();
  const mappedStatus = normalizedStatus === 'approve'
    ? 'approved'
    : normalizedStatus === 'reject'
      ? 'rejected'
      : normalizedStatus;

  if (!['approved', 'rejected'].includes(mappedStatus)) {
    return res.status(400).json({ error: 'Status must be approve/reject or approved/rejected' });
  }

  let internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  internship = await Internship.findByIdAndUpdate(
    req.params.id,
    {
      status: mappedStatus,
      adminFeedback: ''
    },
    { new: true }
  );

  if (mappedStatus === 'approved') {
    await rejectOverlappingPendingInternships(internship);
  }

  try {
    await notifyStudentOnStatusChange(req.params.id, mappedStatus);
  } catch (error) {
    console.error('Failed to send internship status email:', error.message);
  }

  res.json({
    success: true,
    internship
  });
};

// Approve internship
export const approveInternship = async (req, res) => {
  let internship = await Internship.findById(req.params.internshipId);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  internship = await Internship.findByIdAndUpdate(
    req.params.internshipId,
    {
      status: 'approved',
      adminFeedback: ''
    },
    { new: true }
  );

  await rejectOverlappingPendingInternships(internship);

  try {
    await notifyStudentOnStatusChange(req.params.internshipId, 'approved');
  } catch (error) {
    console.error('Failed to send internship approval email:', error.message);
  }

  res.json({
    success: true,
    internship
  });
};

// Reject internship
export const rejectInternship = async (req, res) => {
  let internship = await Internship.findById(req.params.internshipId);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  internship = await Internship.findByIdAndUpdate(
    req.params.internshipId,
    {
      status: 'rejected',
      adminFeedback: ''
    },
    { new: true }
  );

  try {
    await notifyStudentOnStatusChange(req.params.internshipId, 'rejected');
  } catch (error) {
    console.error('Failed to send internship rejection email:', error.message);
  }

  res.json({
    success: true,
    internship
  });
};

// Get all reports
export const getAllReports = async (req, res) => {
  const reports = await ProgressReport.find()
    .populate('studentId', 'name email')
    .populate('internshipId', 'companyName role position')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    reports
  });
};

// Get reports by internship
export const getReportsByInternshipAdmin = async (req, res) => {
  const reports = await ProgressReport.find({ internshipId: req.params.internshipId })
    .populate('studentId', 'name email')
    .sort({ date: -1 });

  res.json({
    success: true,
    reports
  });
};

// Give feedback on report
export const feedbackOnReport = async (req, res) => {
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ error: 'Please provide feedback' });
  }

  let report = await ProgressReport.findById(req.params.reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report = await ProgressReport.findByIdAndUpdate(
    req.params.reportId,
    {
      adminFeedback: feedback
    },
    { new: true }
  );

  try {
    await notifyStudentOnReportFeedback(req.params.reportId);
  } catch (error) {
    console.error('Failed to create report feedback notification:', error.message);
  }

  res.json({
    success: true,
    report
  });
};

// Update report feedback
export const updateReportFeedback = async (req, res) => {
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ error: 'Please provide feedback' });
  }

  let report = await ProgressReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report = await ProgressReport.findByIdAndUpdate(
    req.params.id,
    { adminFeedback: feedback },
    { new: true }
  );

  try {
    await notifyStudentOnReportFeedback(req.params.id);
  } catch (error) {
    console.error('Failed to create report feedback notification:', error.message);
  }

  res.json({
    success: true,
    report
  });
};

// Delete report feedback
export const deleteReportFeedback = async (req, res) => {
  let report = await ProgressReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report = await ProgressReport.findByIdAndUpdate(
    req.params.id,
    { adminFeedback: '' },
    { new: true }
  );

  res.json({
    success: true,
    report
  });
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInternships = await Internship.countDocuments();
  const pendingInternships = await Internship.countDocuments({ status: 'pending' });
  const approvedInternships = await Internship.countDocuments({ status: 'approved' });
  const totalReports = await ProgressReport.countDocuments();

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalInternships,
      pendingInternships,
      approvedInternships,
      totalReports
    }
  });
};
