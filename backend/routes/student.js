import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import {
  addInternship,
  getMyInternships,
  getInternshipDetails,
  updateInternship,
  deleteInternship,
  submitReport,
  getReportsByInternship,
  deleteReport,
  uploadFile,
  getFilesByInternship,
  downloadFile,
  deleteFile
} from '../controllers/studentController.js';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticate, authorize(['student']));

// Internship routes
router.post('/internships', addInternship);
router.get('/internships', getMyInternships);
router.get('/internships/:id', getInternshipDetails);
router.put('/internships/:id', updateInternship);
router.delete('/internships/:id', deleteInternship);

// Report routes
router.post('/reports', submitReport);
router.get('/reports/:internshipId', getReportsByInternship);
router.delete('/reports/:id', deleteReport);

// File routes
router.post('/files/upload', upload.single('file'), uploadFile);
router.get('/files/:internshipId', getFilesByInternship);
router.get('/files/download/:id', downloadFile);
router.delete('/files/:id', deleteFile);

export default router;
