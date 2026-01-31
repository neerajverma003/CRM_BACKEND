import mongoose from "mongoose";

const customerCreatioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    groupNo: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String },

    // Additional fields copied from OperationLead
    employee: { type: mongoose.Schema.Types.Mixed },
    whatsAppNo: { type: String },
    departureCity: { type: String },
    destination: { type: String },
    expectedTravelDate: { type: Date },
    noOfDays: { type: String },
    customNoOfDays: { type: String },
    placesToCover: { type: String },
    noOfPerson: { type: Number },
    noOfChild: { type: Number },
    childAges: { type: [String] },
    groupNumber: { type: String },
    leadSource: { type: String },
    leadType: { type: String },
    tripType: { type: String },
    leadStatus: { type: String },
    notes: { type: String },
    routedFromEmployee: { type: mongoose.Schema.Types.Mixed },
    originalLeadId: { type: String },
    originalCreatedAt: { type: Date },

    documents: [
      {
        personName: { type: String },
        personId: { type: String },
        documentType: { type: String },
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        cloudinaryPublicId: { type: String },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("CustomerCreation", customerCreatioSchema);