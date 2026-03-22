import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

export const updateProfile = async (req, res) => {
  const { name, email, department, semester, phoneNumber, collegeName, linkedin, github, about } = req.body;

  const isValidHttpUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  // Cannot update role
  const update = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (department !== undefined) update.department = department;
  if (semester !== undefined) update.semester = semester;
  if (phoneNumber !== undefined) update.phoneNumber = phoneNumber;
  if (collegeName !== undefined) update.collegeName = collegeName;
  if (linkedin !== undefined) update.linkedin = linkedin;
  if (github !== undefined) update.github = github;
  if (about !== undefined) update.about = about;

  try {
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
    }

    if (linkedin && !isValidHttpUrl(linkedin)) {
      return res.status(400).json({ error: 'LinkedIn URL must start with http:// or https://' });
    }

    if (github && !isValidHttpUrl(github)) {
      return res.status(400).json({ error: 'GitHub URL must start with http:// or https://' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image file' });
  }

  if (!req.file.mimetype.startsWith('image/')) {
    const uploadedPath = path.join(__dirname, '..', 'uploads', req.file.filename);
    if (fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }
    return res.status(400).json({ error: 'Only image files are allowed' });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.profileImage) {
    const oldRelativePath = user.profileImage.replace(/^\/+/, '');
    const oldImagePath = path.join(__dirname, '..', oldRelativePath);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  user.profileImage = `/uploads/${req.file.filename}`;
  await user.save();

  return res.json({
    success: true,
    message: 'Profile image updated successfully',
    user: user.toJSON()
  });
};
