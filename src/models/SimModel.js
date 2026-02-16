import mongoose from 'mongoose';

const SimSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }, // Current assignment
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
    ]
  },
  { timestamps: true }
);

const SimModel = mongoose.model('SimNumber', SimSchema);
export default SimModel;
