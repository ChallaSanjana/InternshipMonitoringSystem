import ChatMessage from '../models/ChatMessage.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const ensureStudentMentorPair = async ({ studentId, mentorId }) => {
  const student = await User.findOne({
    _id: studentId,
    role: 'student',
    mentorId
  }).select('_id mentorId');

  if (!student) {
    return null;
  }

  const mentor = await User.findOne({
    _id: mentorId,
    role: 'mentor'
  }).select('_id');

  if (!mentor) {
    return null;
  }

  return { studentId: student._id, mentorId: mentor._id };
};

const getConversationPair = async (req) => {
  if (req.user.role === 'student') {
    const student = await User.findOne({
      _id: req.user.id,
      role: 'student'
    }).select('_id mentorId');

    if (!student?.mentorId) {
      return { error: 'No mentor assigned yet', status: 404 };
    }

    const pair = await ensureStudentMentorPair({
      studentId: student._id,
      mentorId: student.mentorId
    });

    if (!pair) {
      return { error: 'Assigned mentor not found', status: 404 };
    }

    return { pair };
  }

  if (req.user.role === 'mentor') {
    const studentId = req.query.studentId || req.body.studentId;

    if (!studentId) {
      return { error: 'studentId is required for mentor chat access', status: 400 };
    }

    const pair = await ensureStudentMentorPair({
      studentId,
      mentorId: req.user.id
    });

    if (!pair) {
      return { error: 'Student is not assigned to you', status: 403 };
    }

    return { pair };
  }

  return { error: 'Only students and mentors can access chat', status: 403 };
};

export const getConversationMessages = async (req, res) => {
  const { pair, error, status } = await getConversationPair(req);

  if (!pair) {
    return res.status(status).json({ error });
  }

  const messages = await ChatMessage.find({
    studentId: pair.studentId,
    mentorId: pair.mentorId
  })
    .select('studentId mentorId senderId message createdAt')
    .sort({ createdAt: 1 })
    .limit(500);

  return res.json({
    success: true,
    messages
  });
};

export const sendConversationMessage = async (req, res) => {
  const { pair, error, status } = await getConversationPair(req);

  if (!pair) {
    return res.status(status).json({ error });
  }

  const rawMessage = req.body?.message;
  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const chatMessage = await ChatMessage.create({
    studentId: pair.studentId,
    mentorId: pair.mentorId,
    senderId: req.user.id,
    message
  });

  try {
    const sender = await User.findById(req.user.id).select('name role');

    if (sender) {
      const receiverUserId = sender.role === 'student' ? pair.mentorId : pair.studentId;
      const receiverRole = sender.role === 'student' ? 'mentor' : 'student';
      const preview = message.length > 80 ? `${message.slice(0, 80)}...` : message;

      await Notification.create({
        userId: receiverUserId,
        role: receiverRole,
        title: 'New Chat Message',
        message: `${sender.name}: ${preview}`,
        type: 'general',
        isRead: false
      });
    }
  } catch (notificationError) {
    // Do not fail message delivery if notification creation fails.
    console.error('Failed to create chat notification:', notificationError.message);
  }

  return res.status(201).json({
    success: true,
    message: chatMessage
  });
};

export const deleteConversationMessage = async (req, res) => {
  const { pair, error, status } = await getConversationPair(req);

  if (!pair) {
    return res.status(status).json({ error });
  }

  const chatMessage = await ChatMessage.findOne({
    _id: req.params.messageId,
    studentId: pair.studentId,
    mentorId: pair.mentorId
  });

  if (!chatMessage) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (chatMessage.senderId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'You can delete only your own messages' });
  }

  await ChatMessage.findByIdAndDelete(chatMessage._id);

  return res.json({
    success: true,
    message: 'Message deleted successfully'
  });
};
