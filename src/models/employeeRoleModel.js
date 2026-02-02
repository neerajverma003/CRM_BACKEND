import mongoose from "mongoose";

const employeeRoleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subRole: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubRole" }],
  },
  { timestamps: true }
);

export default mongoose.model("EmployeeRole", employeeRoleSchema);
