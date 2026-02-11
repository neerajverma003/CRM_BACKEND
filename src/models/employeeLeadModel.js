import mongoose from "mongoose";

const employeeLeadSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, // Employee ID reference
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // Company ID reference
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsAppNo: { type: String },
  departureCity: { type: String },
  destination: { type: String },
  expectedTravelDate: { type: Date },
  noOfDays: { type: String },           // e.g., "1n/2d", "Others"
  customNoOfDays: { type: String },    // only if "Others" selected
  placesToCover: { type: String },
  noOfPerson: { type: Number },
  noOfChild: { type: Number },
  childAges: [{ type: Number }],       // dynamic array of child ages
  groupNumber: { type: String },       //  added to match frontend
  leadSource: { type: String },
  leadType: { type: String },
  tripType: { type: String },
  leadStatus: { type: String, default: "Hot" },
  leadInterestStatus: { type: String, enum: ["", "Interested", "Not Interested", "Connected", "Not Connected", "Follow Up"], default: "" }, // Track lead interest status
  // Messages left by employee for this lead (appended as array)
  messages: [
    {
      text: { type: String },
      sentAt: { type: Date, default: Date.now },
      sender: { type: String }, // optional: who sent the message (employee id or name)
    },
  ],
  notes: { type: String },
  // Details modal fields
  itinerary: { type: String }, // filename of uploaded itinerary
  inclusion: { type: String }, // inclusions in package
  specialInclusions: { type: String }, // special inclusions (optional)
  exclusion: { type: String }, // exclusions from package
  tokenAmount: { type: Number }, // token amount (optional)
  totalAmount: { type: Number }, // total land package cost
  advanceRequired: { type: Number }, // advance for land package
  discount: { type: Number }, // discount on land package
  totalAirfare: { type: Number }, // total airfare/train fare cost
  advanceAirfare: { type: Number }, // advance for airfare
  discountAirfare: { type: Number }, // discount on airfare
  routedFromEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null }, // Track which employee routed this lead
  isActioned: { type: Boolean, default: false }, // Track if employee has taken action on routed lead
  createdAt: { type: Date, default: Date.now },
});

// ==========================================
// PERFORMANCE INDEXES
// ==========================================
// Index on employee for filtering by employee
employeeLeadSchema.index({ employee: 1 });

// Index on createdAt for sorting
employeeLeadSchema.index({ createdAt: -1 });

// Index on leadStatus for filtering
employeeLeadSchema.index({ leadStatus: 1 });

// Index on destination for filtering
employeeLeadSchema.index({ destination: 1 });

// Text search index for name, email, phone
employeeLeadSchema.index({ name: "text", email: "text", phone: "text" });

// Compound index for common filtering patterns
employeeLeadSchema.index({ employee: 1, createdAt: -1 });
employeeLeadSchema.index({ employee: 1, leadStatus: 1 });

// Sparse indexes for optional fields
employeeLeadSchema.index({ email: 1 }, { sparse: true });
employeeLeadSchema.index({ phone: 1 }, { sparse: true });

const EmployeeLead = mongoose.model("EmployeeLead", employeeLeadSchema);
export default EmployeeLead;
