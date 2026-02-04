import mongoose, { Schema } from 'mongoose';

const superadminMyleadSchema = new mongoose.Schema({
  superAdminId: {
    type: Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  whatsAppNo: {
    type: String,
  },
  departureCity: {
    type: String,
  },
  destination: {
    type: String,
  },
  expectedTravelDate: {
    type: Date,
  },
  noOfDays: {
    type: String,
  },
  placesToCover: {
    type: String,
  },
  noOfPerson: {
    type: Number,
  },
  noOfChild: {
    type: Number,
  },
  childAges: {
    type: [Number],
    default: []
  },
  leadSource: {
    type: String,
  },
  leadType: {
    type: String,
  },
  tripType: {
    type: String,
  },
  leadStatus: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold', 'Converted', 'Lost'],
    default: 'Hot'
  },
  leadInterestStatus: {
    type: String,
    enum: ["", "Interested", "Not Interested", "Connected", "Not Connected", "Follow Up"],
    default: ""
  }, // Track lead interest status
  assignedEmployee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }, // Employee assigned by superadmin
  groupNumber: {
    type: String,
  },
  lastContact: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
superadminMyleadSchema.index({ superAdminId: 1 });
superadminMyleadSchema.index({ createdAt: -1 });
superadminMyleadSchema.index({ leadStatus: 1 });
superadminMyleadSchema.index({ destination: 1 });
superadminMyleadSchema.index({ assignedEmployee: 1 });
superadminMyleadSchema.index({ name: "text", email: "text", phone: "text" });
superadminMyleadSchema.index({ email: 1 }, { sparse: true });
superadminMyleadSchema.index({ phone: 1 }, { sparse: true });

export default mongoose.model("SuperadminMylead", superadminMyleadSchema);