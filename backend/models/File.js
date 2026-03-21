import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true
    },
    fileName: {
      type: String,
      required: [true, 'File name is required']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileType: {
      type: String,
      enum: ['offer_letter', 'report', 'certificate'],
      required: [true, 'File type is required']
    }
  },
  { timestamps: true }
);

export default mongoose.model('File', fileSchema);
