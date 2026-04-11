import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { deleteConversationMessage, getConversationMessages, sendConversationMessage } from '../controllers/chatController.js';

const router = express.Router();

router.use(authenticate, authorize(['student', 'mentor']));

router.get('/messages', getConversationMessages);
router.post('/messages', sendConversationMessage);
router.delete('/messages/:messageId', deleteConversationMessage);

export default router;
