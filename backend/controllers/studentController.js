import Internship from '../models/Internship.js';
import ProgressReport from '../models/ProgressReport.js';
import File from '../models/File.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Internship Controllers
export const addInternship = async (req, res) => {
  const { companyName, role, position, startDate, endDate, mode, location, description, mentorName, mentorEmail } = req.body;

  if (!companyName || !(role || position) || !startDate || !endDate || !mode) {
    return res.status(400).json({ error: 'Please provide required fields' });
  }

  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'End date cannot be before start date' });
  }

  const normalizedRole = role || position;

  const internship = await Internship.create({
    studentId: req.user.id,
    companyName,
    role: normalizedRole,
    position: normalizedRole,
    startDate,
    endDate,
    mode,
    location,
    description,
    mentorName,
    mentorEmail
  });

  res.status(201).json({
    success: true,
    internship
  });
};

export const getMyInternships = async (req, res) => {
  const internships = await Internship.find({ studentId: req.user.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    internships
  });
};

export const getInternshipDetails = async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  if (internship.studentId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  res.json({
    success: true,
    internship
  });
};

export const updateInternship = async (req, res) => {
  const { companyName, role, position, startDate, endDate, mode, location, description, mentorName, mentorEmail } = req.body;

  let internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  if (internship.studentId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'End date cannot be before start date' });
  }

  const normalizedRole = role || position;

  internship = await Internship.findByIdAndUpdate(
    req.params.id,
    {
      companyName,
      role: normalizedRole,
      position: normalizedRole,
      startDate,
      endDate,
      mode,
      location,
      description,
      mentorName,
      mentorEmail
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    internship
  });
};

export const deleteInternship = async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  if (internship.studentId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const files = await File.find({ internshipId: internship._id, studentId: req.user.id });
  for (const fileDoc of files) {
    const relativeFileUrl = fileDoc.fileUrl.replace(/^\/+/, '');
    const filePath = path.join(__dirname, '..', relativeFileUrl);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await File.deleteMany({ internshipId: internship._id, studentId: req.user.id });
  await ProgressReport.deleteMany({ internshipId: internship._id, studentId: req.user.id });
  await Internship.findByIdAndDelete(req.params.id);

  return res.json({
    success: true,
    message: 'Internship deleted successfully'
  });
};

// Progress Report Controllers
export const submitReport = async (req, res) => {
  const { internshipId, date, description, hoursWorked } = req.body;

  if (!internshipId || !date || !description || hoursWorked === undefined) {
    return res.status(400).json({ error: 'Please provide internshipId, date, description and hoursWorked' });
  }

  const internship = await Internship.findById(internshipId);
  if (!internship || internship.studentId.toString() !== req.user.id) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  const reportDate = new Date(date);
  if (Number.isNaN(reportDate.getTime())) {
    return res.status(400).json({ error: 'Invalid report date' });
  }

  const normalizedReportDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate()).getTime();
  const internshipStart = new Date(internship.startDate);
  const normalizedStart = new Date(internshipStart.getFullYear(), internshipStart.getMonth(), internshipStart.getDate()).getTime();
  const internshipEnd = new Date(internship.endDate);
  const normalizedEnd = new Date(internshipEnd.getFullYear(), internshipEnd.getMonth(), internshipEnd.getDate()).getTime();

  if (normalizedReportDate < normalizedStart || normalizedReportDate > normalizedEnd) {
    return res.status(400).json({ error: 'Report date must be between internship start date and end date' });
  }

  const report = await ProgressReport.create({
    internshipId,
    studentId: req.user.id,
    date,
    description,
    hoursWorked
  });

  res.status(201).json({
    success: true,
    report
  });
};

export const getReportsByInternship = async (req, res) => {
  const { internshipId } = req.params;

  const internship = await Internship.findById(internshipId);
  if (!internship || internship.studentId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const reports = await ProgressReport.find({ internshipId, studentId: req.user.id }).sort({ date: -1 });

  res.json({
    success: true,
    reports
  });
};

export const deleteReport = async (req, res) => {
  const report = await ProgressReport.findById(req.params.id);

  if (!report || report.studentId.toString() !== req.user.id) {
    return res.status(404).json({ error: 'Report not found' });
  }

  await ProgressReport.findByIdAndDelete(req.params.id);

  return res.json({
    success: true,
    message: 'Report deleted successfully'
  });
};

// File Controllers
export const uploadFile = async (req, res) => {
  const { internshipId, fileType } = req.body;

  if (!internshipId || !fileType) {
    return res.status(400).json({ error: 'Please provide internshipId and fileType' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Please attach a file' });
  }

  const internship = await Internship.findById(internshipId);
  if (!internship || internship.studentId.toString() !== req.user.id) {
    return res.status(404).json({ error: 'Internship not found' });
  }

  const uploadedFile = await File.create({
    studentId: req.user.id,
    internshipId,
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    fileType
  });

  res.status(201).json({
    success: true,
    file: uploadedFile
  });
};

export const getFilesByInternship = async (req, res) => {
  const { internshipId } = req.params;

  const internship = await Internship.findById(internshipId);
  if (!internship || internship.studentId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const files = await File.find({ internshipId, studentId: req.user.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    files
  });
};

export const downloadFile = async (req, res) => {
  const fileDoc = await File.findById(req.params.id);

  if (!fileDoc || fileDoc.studentId.toString() !== req.user.id) {
    return res.status(404).json({ error: 'File not found' });
  }

  const relativeFileUrl = fileDoc.fileUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '..', relativeFileUrl);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Stored file not found on server' });
  }

  return res.download(filePath, fileDoc.fileName);
};

export const deleteFile = async (req, res) => {
  const fileDoc = await File.findById(req.params.id);

  if (!fileDoc || fileDoc.studentId.toString() !== req.user.id) {
    return res.status(404).json({ error: 'File not found' });
  }

  const relativeFileUrl = fileDoc.fileUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '..', relativeFileUrl);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await File.findByIdAndDelete(req.params.id);

  return res.json({
    success: true,
    message: 'File deleted successfully'
  });
};
