import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }, // Current assignment
    assignedToType: { type: String, enum: ['Admin', 'Employee'], default: null }, // Who it's assigned to
    assignedToName: { type: String, default: null }, // Store name for quick access
    assignmentHistory: [
      {
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        assignedToType: { type: String, enum: ['Admin', 'Employee'] },
        assignedToName: { type: String },
        assignedAt: { type: Date, default: Date.now },
        unassignedAt: { type: Date, default: null }
      }
    ]  },
  { timestamps: true }
);

const EmailModel = mongoose.model('EmailEntry', EmailSchema);
export default EmailModel;
