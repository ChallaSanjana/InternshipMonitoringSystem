import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
	getAssignedStudents,
	getAssignedStudentDetails,
	getAssignedStudentReports,
	markReportReviewed,
	addReportFeedback
} from '../controllers/mentorController.js';

const router = express.Router();

router.use(authenticate, authorize(['mentor']));

router.get('/students', getAssignedStudents);
router.get('/students/:studentId', getAssignedStudentDetails);
router.get('/reports', getAssignedStudentReports);
router.put('/reports/:reportId/review', markReportReviewed);
router.put('/reports/:reportId/feedback', addReportFeedback);

export default router;
