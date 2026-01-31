import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Profile name is required"],
      trim: true,
      minlength: [2, "Profile name must be at least 2 characters long"],
      maxlength: [100, "Profile name cannot exceed 100 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Created by is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
profileSchema.index({ createdBy: 1, createdAt: -1 });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;