import mongoose from "mongoose";

const operationLeadSchema = new mongoose.Schema({
  originalLeadId: { type: mongoose.Schema.Types.ObjectId },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsAppNo: { type: String },
  departureCity: { type: String },
  destination: { type: String },
  expectedTravelDate: { type: Date },
  noOfDays: { type: String },
  customNoOfDays: { type: String },
  placesToCover: { type: String },
  noOfPerson: { type: Number },
  noOfChild: { type: Number },
  childAges: [{ type: Number }],
  groupNumber: { type: String },
  leadSource: { type: String },
  leadType: { type: String },
  tripType: { type: String },
  leadStatus: { type: String },
  notes: { type: String },
  // Details modal fields (copied from EmployeeLead)
  itinerary: { type: String },
  inclusion: { type: String },
  specialInclusions: { type: String },
  exclusion: { type: String },
  tokenAmount: { type: Number },
  totalAmount: { type: Number },
  advanceRequired: { type: Number },
  discount: { type: Number },
  totalAirfare: { type: Number },
  advanceAirfare: { type: Number },
  discountAirfare: { type: Number },
  documents: [
    {
      personName: { type: String },
      personId: { type: String },
      documentType: { type: String }, // birthCertificate, aadharPanCard, passport, photo
      fileName: { type: String },
      fileUrl: { type: String },
      fileType: { type: String }, // image/jpeg, application/pdf, etc.
      uploadedAt: { type: Date, default: Date.now },
    }
  ],
  routedFromEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  transferredAt: { type: Date, default: Date.now },
  originalCreatedAt: { type: Date },
  messages: [
    {
      text: { type: String },
      senderName: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      sentAt: { type: Date, default: Date.now },
    }
  ],
});

const OperationLead = mongoose.model("OperationLead", operationLeadSchema);
export default OperationLead;
