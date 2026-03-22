import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllStudents,
  getStudentDetails,
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

// Student routes
router.get('/students', getAllStudents);
router.get('/students/:studentId', getStudentDetails);

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
