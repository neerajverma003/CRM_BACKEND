import mongoose from "mongoose";

const manualPayslipSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    salaryMonth: { type: String, required: true },
    employeeId: { type: String },
    employeeName: { type: String },
    gender: { type: String },
    dob: { type: String },
    designation: { type: String },
    department: { type: String },
    dateOfJoining: { type: String },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },
    panNumber: { type: String },
    uanNumber: { type: String },
    pfAccount: { type: String },
    esiAccount: { type: String },
    location: { type: String },
    bankName: { type: String },
    bankIfscCode: { type: String },
    accountNumber: { type: String },
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    pf: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    generatedDate: { type: String },
    status: { type: String, default: "Draft" },
  },
  { timestamps: true }
);

export default mongoose.model("ManualPayslip", manualPayslipSchema);
