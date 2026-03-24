import mongoose from 'mongoose';

const progressReportSchema = new mongoose.Schema(
  {
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    hoursWorked: {
      type: Number,
      required: [true, 'Hours worked is required'],
      min: [0, 'Hours worked cannot be negative']
    },
    adminFeedback: {
      type: String,
      default: ''
    },
    mentorReviewed: {
      type: Boolean,
      default: false
    },
    mentorReviewedAt: {
      type: Date,
      default: null
    },
    mentorReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    mentorFeedback: {
      type: String,
      default: ''
    },
    mentorFeedbackAt: {
      type: Date,
      default: null
    },
    mentorFeedbackBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('ProgressReport', progressReportSchema);
