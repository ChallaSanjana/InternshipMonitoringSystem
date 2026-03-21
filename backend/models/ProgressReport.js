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
    }
  },
  { timestamps: true }
);

export default mongoose.model('ProgressReport', progressReportSchema);
