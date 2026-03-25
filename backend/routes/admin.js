import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  addMentor,
  getAllMentors,
  updateMentor,
  deleteMentor,
  getAllStudents,
  assignMentorToStudent,
  getStudentDetails,
  deleteStudent,
  getAllInternships,
  updateInternshipStatus,
  approveInternship,
  rejectInternship,
  getAllReports,
  getReportsByInternshipAdmin,
  updateReportFeedback,
  deleteReportFeedback,
  feedbackOnReport,
  getDashboardStats
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all routes with authentication and admin role
router.use(authenticate, authorize(['admin']));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Mentor routes
router.post('/add-mentor', addMentor);
router.get('/mentors', getAllMentors);
router.put('/mentors/:mentorId', updateMentor);
router.delete('/mentors/:mentorId', deleteMentor);

// Student routes
router.get('/students', getAllStudents);
router.put('/students/:studentId/mentor', assignMentorToStudent);
router.get('/students/:studentId', getStudentDetails);
router.delete('/students/:studentId', deleteStudent);

// Internship routes
router.get('/internships', getAllInternships);
router.put('/internships/:id/status', updateInternshipStatus);
router.post('/internships/:internshipId/approve', approveInternship);
router.post('/internships/:internshipId/reject', rejectInternship);

// Report routes
router.get('/reports', getAllReports);
router.get('/internships/:internshipId/reports', getReportsByInternshipAdmin);
router.put('/reports/:id/feedback', updateReportFeedback);
router.delete('/reports/:id/feedback', deleteReportFeedback);
router.post('/reports/:reportId/feedback', feedbackOnReport);

export default router;
