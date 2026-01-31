import mongoose, { Schema } from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,  // use String to allow multiple numbers/comma separated
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
    type: [Number], // array of numbers for multiple child ages
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

// ==========================================
// PERFORMANCE INDEXES
// ==========================================
// Index on createdAt for sorting (most common operation)
leadSchema.index({ createdAt: -1 });

// Index on leadStatus for filtering
leadSchema.index({ leadStatus: 1 });

// Index on destination for destination-based searches
leadSchema.index({ destination: 1 });

// Compound index for common search + filter combinations
leadSchema.index({ name: "text", email: "text", phone: "text", company: "text" });

// Sparse index on email for fast email lookups
leadSchema.index({ email: 1 }, { sparse: true });

// Index on phone for lead matching
leadSchema.index({ phone: 1 }, { sparse: true });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
