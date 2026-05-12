import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
    // Offer Details
    refNumber: {
      type: String,
      trim: true,
      required: true,
    },
    offerDate: {
      type: Date,
      required: true,
    },
    // Candidate Information
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    candidateEmail: {
      type: String,
      trim: true,
    },
    candidatePhone: {
      type: String,
      trim: true,
    },
    candidateAddress: {
      type: String,
      trim: true,
    },
    // Employment Terms
    jobTitle: {
      type: String,
      trim: true,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    employmentType: {
      type: String,
      trim: true,
    },
    reportingTo: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
      required: true,
    },
    benefits: {
      type: String,
      trim: true,
    },
    // Job Responsibilities
    jobResponsibilities: {
      type: String,
      trim: true,
    },
    // Status
    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Rejected"],
      default: "Draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    companyName: {
      type: String,
      trim: true,
    },
    formatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfferLetterFormat",
    },
  },
  { timestamps: true }
);

export default mongoose.model("OfferLetter", offerLetterSchema);
