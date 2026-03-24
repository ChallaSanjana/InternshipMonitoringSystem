import User from '../models/User.js';
import Internship from '../models/Internship.js';
import ProgressReport from '../models/ProgressReport.js';
import File from '../models/File.js';
import Notification from '../models/Notification.js';
import { calculateProgress } from '../utils/progressCalculator.js';
import { getEffectiveInternshipStatus } from '../utils/internshipLifecycle.js';

export const getAssignedStudents = async (req, res) => {
  const students = await User.find({
    role: 'student',
    mentorId: req.user.id
  })
    .select('name email department semester mentorId')
    .sort({ createdAt: -1 });

  if (students.length === 0) {
    return res.json({
      success: true,
      students: []
    });
  }

  const studentIds = students.map((student) => student._id);
  const internships = await Internship.find({
    studentId: { $in: studentIds }
  })
    .select('studentId companyName role position startDate endDate status mode location description')
    .sort({ createdAt: -1 });

  const internshipsByStudent = new Map();

  for (const internship of internships) {
    const studentId = internship.studentId.toString();
    const plainInternship = internship.toObject();
    const effectiveStatus = getEffectiveInternshipStatus(plainInternship.status, plainInternship.endDate);

    plainInternship.status = effectiveStatus;
    plainInternship.progress = effectiveStatus === 'approved' || effectiveStatus === 'completed'
      ? calculateProgress(plainInternship.startDate, plainInternship.endDate)
      : 0;

    if (!internshipsByStudent.has(studentId)) {
      internshipsByStudent.set(studentId, []);
    }

    internshipsByStudent.get(studentId).push(plainInternship);
  }

  const responseStudents = students.map((student) => ({
    ...student.toObject(),
    internships: internshipsByStudent.get(student._id.toString()) || []
  }));

  return res.json({
    success: true,
    students: responseStudents
  });
};

export const getAssignedStudentDetails = async (req, res) => {
  const student = await User.findOne({
    _id: req.params.studentId,
    role: 'student',
    mentorId: req.user.id
  })
    .select('name email department semester mentorId createdAt phoneNumber collegeName linkedin github about profileImage');

  if (!student) {
    return res.status(404).json({ error: 'Assigned student not found' });
  }

  const internships = await Internship.find({ studentId: student._id })
    .sort({ createdAt: -1 });

  const internshipIds = internships.map((internship) => internship._id);

  const reports = await ProgressReport.find({
    studentId: student._id
  })
    .populate('internshipId', 'companyName role position')
    .sort({ date: -1 });

  const files = await File.find({
    studentId: student._id,
    internshipId: { $in: internshipIds }
  })
    .select('internshipId fileName fileUrl fileType createdAt')
    .sort({ createdAt: -1 });

  const normalizedInternships = internships.map((internship) => {
    const plainInternship = internship.toObject();
    const effectiveStatus = getEffectiveInternshipStatus(plainInternship.status, plainInternship.endDate);

    plainInternship.status = effectiveStatus;
    plainInternship.progress = effectiveStatus === 'approved' || effectiveStatus === 'completed'
      ? calculateProgress(plainInternship.startDate, plainInternship.endDate)
      : 0;

    return plainInternship;
  });

  return res.json({
    success: true,
    student,
    internships: normalizedInternships,
    reports,
    files
  });
};

export const getAssignedStudentReports = async (req, res) => {
  const students = await User.find({
    role: 'student',
    mentorId: req.user.id
  }).select('_id');

  if (students.length === 0) {
    return res.json({
      success: true,
      reports: []
    });
  }

  const studentIds = students.map((student) => student._id);
  const reports = await ProgressReport.find({ studentId: { $in: studentIds } })
    .populate('studentId', 'name email')
    .populate('internshipId', 'companyName role position')
    .sort({ date: -1, createdAt: -1 });

  const internshipIds = [
    ...new Set(
      reports
        .map((report) => report.internshipId?._id?.toString())
        .filter(Boolean)
    )
  ];

  const reportFiles = await File.find({
    studentId: { $in: studentIds },
    internshipId: { $in: internshipIds },
    fileType: 'report'
  })
    .select('internshipId fileName fileUrl fileType createdAt')
    .sort({ createdAt: -1 });

  const latestReportFileByInternship = new Map();
  for (const file of reportFiles) {
    const internshipId = file.internshipId.toString();
    if (!latestReportFileByInternship.has(internshipId)) {
      latestReportFileByInternship.set(internshipId, file.toObject());
    }
  }

  const normalizedReports = reports.map((report) => {
    const plainReport = report.toObject();
    const internshipId = plainReport.internshipId?._id?.toString();

    return {
      ...plainReport,
      reportFile: internshipId ? latestReportFileByInternship.get(internshipId) || null : null
    };
  });

  return res.json({
    success: true,
    reports: normalizedReports
  });
};

export const markReportReviewed = async (req, res) => {
  const report = await ProgressReport.findById(req.params.reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const assignedStudent = await User.findOne({
    _id: report.studentId,
    role: 'student',
    mentorId: req.user.id
  }).select('_id');

  if (!assignedStudent) {
    return res.status(403).json({ error: 'Not authorized to review this report' });
  }

  report.mentorReviewed = true;
  report.mentorReviewedAt = new Date();
  report.mentorReviewedBy = req.user.id;
  await report.save();

  return res.json({
    success: true,
    report
  });
};

export const addReportFeedback = async (req, res) => {
  const { feedback } = req.body;

  if (!feedback || !String(feedback).trim()) {
    return res.status(400).json({ error: 'Please provide feedback' });
  }

  const report = await ProgressReport.findById(req.params.reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const assignedStudent = await User.findOne({
    _id: report.studentId,
    role: 'student',
    mentorId: req.user.id
  }).select('_id');

  if (!assignedStudent) {
    return res.status(403).json({ error: 'Not authorized to provide feedback for this report' });
  }

  report.mentorFeedback = String(feedback).trim();
  report.mentorFeedbackAt = new Date();
  report.mentorFeedbackBy = req.user.id;
  await report.save();

  await Notification.create({
    userId: report.studentId,
    role: 'student',
    internshipId: report.internshipId,
    title: 'Mentor Feedback Received',
    message: 'Your mentor added feedback on your progress report.',
    type: 'report_feedback_added'
  });

  return res.json({
    success: true,
    report
  });
};
