import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", required: true },
    date: { type: Date, default: Date.now },
    narration: { type: String, trim: true, default: "" },
    voucherType: { type: String, trim: true, default: "" },
    voucherNumber: { type: String, trim: true, default: "" },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// index on ledger for faster queries
ledgerEntrySchema.index({ ledger: 1, date: 1 });

export default mongoose.model("LedgerEntry", ledgerEntrySchema);
