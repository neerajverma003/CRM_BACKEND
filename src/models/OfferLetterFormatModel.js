import mongoose from "mongoose";

const offerLetterFormatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Offer Letter Format",
    },
    // Format-specific sections
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
    // Non Disclosure Agreement Fields
    nonDisclosureAgreement: { type: String, trim: true },
    ndaWhereas: { type: String, trim: true },
    ndaDefinitionOfConfidential: { type: String, trim: true },
    ndaObligationOfConfidentiality: { type: String, trim: true },
    ndaExclusions: { type: String, trim: true },
    ndaTerm: { type: String, trim: true },
    ndaReturnOfMaterials: { type: String, trim: true },
    ndaBreachAndRemedies: { type: String, trim: true },
    ndaGoverningLaw: { type: String, trim: true },
    ndaAdditionalObligations: { type: String, trim: true },
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