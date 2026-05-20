import mongoose from "mongoose";

const { Schema } = mongoose;

const ledgerGroupSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    members: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        alias: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const LedgerGroup = mongoose.model("LedgerGroup", ledgerGroupSchema);
export default LedgerGroup;
