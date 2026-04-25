import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bank", bankSchema);
