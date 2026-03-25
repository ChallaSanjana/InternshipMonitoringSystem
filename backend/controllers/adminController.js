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

const notifyAssignedMentorOnInternshipStatusChange = async (internshipId, status) => {
  const internship = await Internship.findById(internshipId)
    .select('studentId');

  if (!internship?.studentId) {
    return;
  }

  const student = await User.findById(internship.studentId).select('mentorId');

  if (!student?.mentorId) {
    return;
  }

  const isApproved = status === 'approved';

  await Notification.create({
    userId: student.mentorId,
    role: 'mentor',
    internshipId,
    title: isApproved ? 'Internship Approved' : 'Internship Rejected',
    message: isApproved
      ? "Your assigned student's internship has been approved by admin"
      : "Your assigned student's internship has been rejected by admin",
    type: isApproved ? 'internship_approved' : 'internship_rejected',
    isRead: false
  });
};

// Add mentor (admin only)
export const addMentor = async (req, res) => {
  const { name, email, password, department } = req.body;

  const normalizedName = String(name || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');
  const normalizedDepartment = String(department || '').trim();

  if (!normalizedName || !normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ error: 'Please provide name, email and password' });
  }

  if (normalizedPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const mentor = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: normalizedPassword,
    role: 'mentor',
    department: normalizedDepartment
  });

  res.status(201).json({
    success: true,
    mentor: mentor.toJSON()
  });
};

// Get all mentors (admin only)
export const getAllMentors = async (req, res) => {
  const mentors = await User.find({ role: 'mentor' }).sort({ createdAt: -1 });

  res.json({
    success: true,
    mentors
  });
};

// Update mentor (admin only)
export const updateMentor = async (req, res) => {
  const mentor = await User.findById(req.params.mentorId);

  if (!mentor || mentor.role !== 'mentor') {
    return res.status(404).json({ error: 'Mentor not found' });
  }

  const normalizedName = String(req.body.name || '').trim();
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  const normalizedDepartment = String(req.body.department || '').trim();

  if (!normalizedName || !normalizedEmail) {
    return res.status(400).json({ error: 'Please provide mentor name and email' });
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: mentor._id }
  });

  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  mentor.name = normalizedName;
  mentor.email = normalizedEmail;
  mentor.department = normalizedDepartment;
  await mentor.save();

  res.json({
    success: true,
    mentor: mentor.toJSON()
  });
};

// Delete mentor (admin only)
export const deleteMentor = async (req, res) => {
  const mentor = await User.findById(req.params.mentorId).select('_id role');

  if (!mentor || mentor.role !== 'mentor') {
    return res.status(404).json({ error: 'Mentor not found' });
  }

  await User.updateMany(
    { role: 'student', mentorId: mentor._id },
    { $set: { mentorId: null } }
  );

  await Notification.deleteMany({ userId: mentor._id });

  await User.findByIdAndDelete(mentor._id);

  return res.json({
    success: true,
    message: 'Mentor deleted successfully'
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
  const students = await User.find({ role: 'student' })
    .populate('mentorId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    students
  });
};

// Assign mentor to student
export const assignMentorToStudent = async (req, res) => {
  const { mentorId } = req.body;

  if (!mentorId) {
    return res.status(400).json({ error: 'Please provide mentorId' });
  }

  const student = await User.findById(req.params.studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: 'Student not found' });
  }

  const mentor = await User.findById(mentorId);
  if (!mentor || mentor.role !== 'mentor') {
    return res.status(404).json({ error: 'Mentor not found' });
  }

  student.mentorId = mentor._id;
  await student.save();

  await Notification.create({
    userId: mentor._id,
    role: 'mentor',
    title: 'New Student Assigned',
    message: 'You have been assigned a new student',
    type: 'general',
    isRead: false
  });

  const updatedStudent = await User.findById(student._id)
    .populate('mentorId', 'name email');

  res.json({
    success: true,
    student: updatedStudent
  });
};

// Get student details
export const getStudentDetails = async (req, res) => {
  const student = await User.findById(req.params.studentId)
    .populate('mentorId', 'name email department');

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
    mentor: student.mentorId || null,
    internships: normalizedInternships,
    reports
  });
};

// Delete student and related data
export const deleteStudent = async (req, res) => {
  const student = await User.findById(req.params.studentId);

  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: 'Student not found' });
  }

  const internships = await Internship.find({ studentId: student._id }).select('_id');
  const internshipIds = internships.map((internship) => internship._id);

  // Delete dependent records first, then remove internships and user.
  await ProgressReport.deleteMany({
    $or: [{ studentId: student._id }, { internshipId: { $in: internshipIds } }]
  });

  await File.deleteMany({
    $or: [{ studentId: student._id }, { internshipId: { $in: internshipIds } }]
  });

  await Notification.deleteMany({
    $or: [{ userId: student._id }, { internshipId: { $in: internshipIds } }]
  });

  await Internship.deleteMany({ studentId: student._id });
  await User.findByIdAndDelete(student._id);

  res.json({
    success: true,
    message: 'Student and related internships deleted successfully'
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

  try {
    await notifyAssignedMentorOnInternshipStatusChange(req.params.id, mappedStatus);
  } catch (error) {
    console.error('Failed to notify assigned mentor on internship status change:', error.message);
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

  try {
    await notifyAssignedMentorOnInternshipStatusChange(req.params.internshipId, 'approved');
  } catch (error) {
    console.error('Failed to notify assigned mentor on internship approval:', error.message);
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

  try {
    await notifyAssignedMentorOnInternshipStatusChange(req.params.internshipId, 'rejected');
  } catch (error) {
    console.error('Failed to notify assigned mentor on internship rejection:', error.message);
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
