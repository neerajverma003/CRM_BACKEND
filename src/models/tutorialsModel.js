import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      enum: ["image", "video", "pdf", "ppt"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    key: {
      type: String,
      required: [true, "Storage key is required"],
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
  },
  { timestamps: true }
);

const Tutorial = mongoose.model("Tutorial", tutorialSchema);

export default Tutorial;