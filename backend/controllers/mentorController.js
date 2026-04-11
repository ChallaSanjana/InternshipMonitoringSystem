import User from '../models/User.js';
import Internship from '../models/Internship.js';
import ProgressReport from '../models/ProgressReport.js';
import File from '../models/File.js';
import Notification from '../models/Notification.js';
import { calculateProgressWithBreakdown } from '../utils/progressCalculator.js';
import { getEffectiveInternshipStatus } from '../utils/internshipLifecycle.js';
import { analyzeReportContent } from '../utils/reportProgressModel.js';

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

  const internshipIds = internships.map((internship) => internship._id);
  const [reports, files] = await Promise.all([
    ProgressReport.find({ internshipId: { $in: internshipIds } })
      .select('internshipId date description hoursWorked mentorReviewed mentorFeedback adminFeedback analysis'),
    File.find({ internshipId: { $in: internshipIds } })
      .select('internshipId fileType createdAt')
  ]);

  const reportsByInternship = new Map();
  const filesByInternship = new Map();

  for (const report of reports) {
    const internshipId = report.internshipId.toString();
    if (!reportsByInternship.has(internshipId)) {
      reportsByInternship.set(internshipId, []);
    }
    reportsByInternship.get(internshipId).push(report.toObject());
  }

  for (const file of files) {
    const internshipId = file.internshipId.toString();
    if (!filesByInternship.has(internshipId)) {
      filesByInternship.set(internshipId, []);
    }
    filesByInternship.get(internshipId).push(file.toObject());
  }

  const internshipsByStudent = new Map();

  for (const internship of internships) {
    const studentId = internship.studentId.toString();
    const plainInternship = internship.toObject();
    const effectiveStatus = getEffectiveInternshipStatus(plainInternship.status, plainInternship.endDate);

    plainInternship.status = effectiveStatus;
    if (effectiveStatus === 'approved' || effectiveStatus === 'completed') {
      const { progress, breakdown } = calculateProgressWithBreakdown(
        plainInternship.startDate,
        plainInternship.endDate,
        {
          reports: reportsByInternship.get(internship._id.toString()) || [],
          files: filesByInternship.get(internship._id.toString()) || []
        }
      );

      plainInternship.progress = progress;
      plainInternship.progressBreakdown = breakdown;
    } else {
      plainInternship.progress = 0;
      plainInternship.progressBreakdown = null;
    }

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
    .populate('mentorId', 'name email department')
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
    if (effectiveStatus === 'approved' || effectiveStatus === 'completed') {
      const internshipReports = reports
        .filter((report) => report.internshipId?._id?.toString() === internship._id.toString())
        .map((report) => report.toObject());
      const internshipFiles = files
        .filter((file) => file.internshipId.toString() === internship._id.toString())
        .map((file) => file.toObject());

      const { progress, breakdown } = calculateProgressWithBreakdown(
        plainInternship.startDate,
        plainInternship.endDate,
        {
          reports: internshipReports,
          files: internshipFiles
        }
      );

      plainInternship.progress = progress;
      plainInternship.progressBreakdown = breakdown;
    } else {
      plainInternship.progress = 0;
      plainInternship.progressBreakdown = null;
    }

    return plainInternship;
  });

  return res.json({
    success: true,
    student,
    mentor: student.mentorId || null,
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
  report.analysis = analyzeReportContent({
    description: report.description,
    hoursWorked: report.hoursWorked,
    mentorReviewed: report.mentorReviewed,
    mentorFeedback: report.mentorFeedback,
    adminFeedback: report.adminFeedback
  });
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
  report.analysis = analyzeReportContent({
    description: report.description,
    hoursWorked: report.hoursWorked,
    mentorReviewed: report.mentorReviewed,
    mentorFeedback: report.mentorFeedback,
    adminFeedback: report.adminFeedback
  });
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
