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
    type: Number,
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