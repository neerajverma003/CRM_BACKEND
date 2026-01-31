import mongoose from "mongoose";

const B2bCompanyLeadSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "B2bCompany",
      required: false,
    },
    companyName: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      match: [/^[A-Z0-9]{8}$/, "Invalid referenceId format"],
    },
    companyEmail: {
      type: String,
      required: true,
    },
    companyPhone: {
      type: String,
      required: false,
    },
    companyWhatsApp: {
      type: String,
      required: false,
    },
    departureCity: {
      type: String,
      required: false,
    },
    destination: {
      type: String,
      required: false,
    },
    expectedTravelDate: {
      type: Date,
      required: false,
    },
    noOfDays: {
      type: String,
      required: false,
    },
    customNoOfDays: {
      type: String,
      required: false,
    },
    placesToCover: {
      type: String,
      required: false,
    },
    placesToCoverArray: {
      type: [String],
      required: false,
    },
    noOfPerson: {
      type: Number,
      required: false,
    },
    noOfChild: {
      type: Number,
      required: false,
    },
    childAges: {
      type: [Number],
      required: false,
    },
    groupNumber: {
      type: String,
      required: false,
    },
    leadSource: {
      type: String,
      required: false,
    },
    leadType: {
      type: String,
      required: false,
    },
    tripType: {
      type: String,
      required: false,
    },
    leadStatus: {
      type: String,
      enum: ["Hot", "Warm", "Cold", "Converted", "Lost"],
      default: "Hot",
    },
    notes: {
      type: String,
      required: false,
    },
    messages: {
      type: [
        {
          text: String,
          sentAt: { type: Date, default: Date.now },
        },
      ],
      required: false,
      default: [],
    },
    details: {
      type: String,
      required: false,
    },
    confirmedForTransfer: {
      type: Boolean,
      required: false,
      default: false,
    },
    itinerary: {
      type: String,
      required: false,
    },
    inclusion: {
      type: String,
      required: false,
    },
    specialInclusions: {
      type: String,
      required: false,
    },
    exclusion: {
      type: String,
      required: false,
    },
    tokenAmount: {
      type: String,
      required: false,
    },
    totalAmount: {
      type: String,
      required: false,
    },
    advanceRequired: {
      type: String,
      required: false,
    },
    discount: {
      type: String,
      required: false,
    },
    totalAirfare: {
      type: String,
      required: false,
    },
    advanceAirfare: {
      type: String,
      required: false,
    },
    discountAirfare: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("B2bCompanyLead", B2bCompanyLeadSchema);
