import mongoose from "mongoose";

const disputeClientsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["client", "vendor"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    issues: {
      type: String,
      maxlength: 8000,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DisputeClients", disputeClientsSchema);
