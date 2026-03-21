import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required']
    },
    role: {
      type: String,
      required: [true, 'Role is required']
    },
    position: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: [true, 'Mode is required']
    },
    location: String,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    mentorName: String,
    mentorEmail: String,
    adminFeedback: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Internship', internshipSchema);
