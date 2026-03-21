import User from '../models/User.js';
import Internship from '../models/Internship.js';
import ProgressReport from '../models/ProgressReport.js';

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

  res.json({
    success: true,
    student: student.toJSON(),
    internships,
    reports
  });
};

// Get all internships
export const getAllInternships = async (req, res) => {
  const internships = await Internship.find()
    .populate('studentId', 'name email department semester')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    internships
  });
};

// Approve internship
export const approveInternship = async (req, res) => {
  const { feedback } = req.body;

  let internship = await Internship.findById(req.params.internshipId);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  internship = await Internship.findByIdAndUpdate(
    req.params.internshipId,
    {
      status: 'approved',
      adminFeedback: feedback
    },
    { new: true }
  );

  res.json({
    success: true,
    internship
  });
};

// Reject internship
export const rejectInternship = async (req, res) => {
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ error: 'Please provide feedback for rejection' });
  }

  let internship = await Internship.findById(req.params.internshipId);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  internship = await Internship.findByIdAndUpdate(
    req.params.internshipId,
    {
      status: 'rejected',
      adminFeedback: feedback
    },
    { new: true }
  );

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
