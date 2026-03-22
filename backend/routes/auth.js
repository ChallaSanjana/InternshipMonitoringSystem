import express from 'express';
import { signup, login, getCurrentUser, updateProfile, updateProfileImage } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/image', authenticate, upload.single('image'), updateProfileImage);

export default router;
