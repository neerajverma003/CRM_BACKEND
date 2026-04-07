import mongoose from "mongoose";

const offerLetterFormatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Offer Letter Format",
    },
    jobResponsibilities: { type: String, trim: true },
    workHours: { type: String, trim: true },
    confidentiality: { type: String, trim: true },
    atWillEmployment: { type: String, trim: true },
    noticePeriod: { type: String, trim: true },
    relievingAndFinalSettlement: { type: String, trim: true },
    confidentialityAndNda: { type: String, trim: true },
    paymentInLieuOfNotice: { type: String, trim: true },
    exitInterview: { type: String, trim: true },
    legalCompliance: { type: String, trim: true },
    postEmploymentBenefits: { type: String, trim: true },
    annexureA: { type: String, trim: true },
    nonDisclosureAgreement: { type: String, trim: true },
    companyId: { type: String, trim: true, index: true },
    companyName: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("OfferLetterFormat", offerLetterFormatSchema);