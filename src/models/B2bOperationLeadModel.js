import mongoose from "mongoose";

const B2bOperationLeadSchema = new mongoose.Schema(
  {
    // Reference from original lead
    originalLeadId: { type: String, required: false },
    
    // Company Information
    companyName: { type: String, required: true },
    companyId: { type: String, required: false },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    whatsAppNo: { type: String, required: false },
    referenceId: { type: String, unique: true, required: true, index: true },

    // Travel Information
    departureCity: { type: String, required: false },
    destination: { type: String, required: false },
    expectedTravelDate: { type: Date, required: false },
    noOfDays: { type: String, required: false },
    customNoOfDays: { type: String, required: false },
    placesToCover: { type: String, required: false },
    placesToCoverArray: [{ type: String, required: false }],

    // Passengers Information
    noOfPerson: { type: String, required: false },
    noOfChild: { type: String, required: false },
    childAges: [{ type: String, required: false }],
    groupNumber: { type: String, required: false },

    // Lead Management
    leadSource: { type: String, required: false },
    leadType: { type: String, required: false },
    tripType: { type: String, required: false },
    leadStatus: { type: String, default: "Follow Up", enum: ["Hot", "Warm", "Cold", "Converted", "Lost", "Follow Up"] },
    notes: { type: String, required: false },

    // Messages
    messages: [
      {
        text: { type: String, required: false },
        sentAt: { type: Date, default: Date.now }
      }
    ],

    // Details Section
    itinerary: { type: String, required: false },
    inclusion: { type: String, required: false },
    specialInclusions: { type: String, required: false },
    exclusion: { type: String, required: false },
    tokenAmount: { type: String, required: false },
    totalAmount: { type: String, required: false },
    advanceRequired: { type: String, required: false },
    discount: { type: String, required: false },
    totalAirfare: { type: String, required: false },
    advanceAirfare: { type: String, required: false },
    discountAirfare: { type: String, required: false },

    // Timestamps
    confirmedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const B2bOperationLead =
  mongoose.models.B2bOperationLead ||
  mongoose.model("B2bOperationLead", B2bOperationLeadSchema);

export default B2bOperationLead;
