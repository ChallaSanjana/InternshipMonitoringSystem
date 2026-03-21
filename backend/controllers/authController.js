import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const signup = async (req, res) => {
  const { name, email, password, role = 'student', department, semester } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    semester
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: user.toJSON()
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  // Get user with password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    user: user.toJSON()
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    user: user.toJSON()
  });
};
