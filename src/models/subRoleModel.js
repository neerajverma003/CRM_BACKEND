import mongoose from "mongoose";


const subRoleSchema = new mongoose.Schema({
  subRoleName: { type: String, required: true },
  points: [String],
  isActive: { type: Boolean, default: true }, // 🔹 NEW: Track if subrole is still in use
}, { timestamps: true });

export default mongoose.model("SubRole", subRoleSchema);
