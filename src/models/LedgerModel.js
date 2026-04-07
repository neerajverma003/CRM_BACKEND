import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    alias: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// create text index on name for search if needed later
ledgerSchema.index({ name: "text" });

export default mongoose.model("Ledger", ledgerSchema);
