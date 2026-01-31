import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeLead', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },
      // Snapshot of the lead/customer at time of invoice creation
      customerSnapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      // Common lead fields copied for easy access
      departureCity: { type: String },
      destination: { type: String },
      expectedTravelDate: { type: Date },
      noOfDays: { type: String },
      noOfPerson: { type: Number },
      noOfChild: { type: Number },
      childAges: [{ type: Number }],
      tripType: { type: String },
      totalAmount: { type: Number },
      advanceRequired: { type: Number },
      totalAirfare: { type: Number },
      advanceAirfare: { type: Number },
      // Additional lead fields
      discount: { type: Number },
      discountAirfare: { type: Number },
      tokenAmount: { type: Number },
      inclusion: { type: String },
      specialInclusions: { type: String },
      exclusion: { type: String },
    date: { type: Date, required: true },
    endDate: { type: Date },
    amount: { type: Number, required: true },
    advancePayment: { type: Number, default: 0 },
    costType: { type: String, enum: ['land', 'airfare'], required: true },
    paymentMode: { type: String, required: true },
    inclusions: { type: String },
    termsConditions: { type: String },
    paymentPolicy: { type: String },
    status: { type: String, enum: ['draft', 'issued', 'paid', 'overdue'], default: 'draft' }
  },
  { timestamps: true }
)

const Invoice = mongoose.model('Invoice', invoiceSchema)

export default Invoice
