import mongoose from "mongoose";

const employeeDataSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    motherName: {
      type: String,
      required: true,
      trim: true,
    },
    employeePhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    parentAddress: {
      type: String,
      required: true,
      trim: true,
    },
    presentAddress: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    documents: {
      panCard: {
        url: { type: String },
        public_id: { type: String },
        filename: { type: String },
        uploadedAt: { type: Date },
      },
      aadharCard: {
        url: { type: String },
        public_id: { type: String },
        filename: { type: String },
        uploadedAt: { type: Date },
      },
      accountDetails: {
        url: { type: String },
        public_id: { type: String },
        filename: { type: String },
        uploadedAt: { type: Date },
      },
      pcc: {
        url: { type: String },
        public_id: { type: String },
        filename: { type: String },
        uploadedAt: { type: Date },
      },
      educationQualifications: [
        {
          url: { type: String },
          public_id: { type: String },
          filename: { type: String },
          uploadedAt: { type: Date },
        },
      ],
      previousCompanyOfferLetters: [
        {
          url: { type: String },
          public_id: { type: String },
          filename: { type: String },
          uploadedAt: { type: Date },
        },
      ],
      relievingLetters: [
        {
          url: { type: String },
          public_id: { type: String },
          filename: { type: String },
          uploadedAt: { type: Date },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmployeeData", employeeDataSchema);
