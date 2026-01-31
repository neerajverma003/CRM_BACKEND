// import mongoose from "mongoose";

// const tutorialSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     fileUrl: { type: String, required: true },
//     fileType: { type: String, enum: ["image", "video", "pdf", "ppt"], required: true },
//     originalName: { type: String, required: true },
//     company: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Tutorial", tutorialSchema);



// import mongoose from "mongoose";

// const tutorialSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     fileUrl: {
//       type: String,
//       required: true,
//     },
//     fileType: {
//       type: String,
//       required: true,
//       enum: ["image", "video", "pdf", "ppt"], // matches your select options
//     },
//     originalName: {
//       type: String,
//       required: true,
//     },
//     company: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company", // assuming you have a Company model
//       required: true,
//     },
//     department:{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Department",
//     }
//   },
//   { timestamps: true } // automatically adds createdAt and updatedAt
// );

// const Tutorial = mongoose.model("Tutorial", tutorialSchema);

// export default Tutorial;


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
    cloudinaryUrl: {
      type: String,
      required: [true, "Cloudinary URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
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