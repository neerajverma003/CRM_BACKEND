import mongoose from "mongoose";
const { Schema } = mongoose;

const TaskAssignSchema = new Schema(
  {
    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ["description", "numbers"],
      default: "description",
    },
    numberData: [
      {
        row: {
          type: Number,
          required: true,
        },
        col1: {
          type: String,
          default: "",
        },
        col2: {
          type: String,
          default: "",
        },
        col3: {
          type: String,
          default: "",
        },
        col4: {
          type: String,
          default: "",
        },
      },
    ],
    originalNumberData: [
      {
        row: {
          type: Number,
          required: true,
        },
        col1: {
          type: String,
          default: "",
        },
        col2: {
          type: String,
          default: "",
        },
        col3: {
          type: String,
          default: "",
        },
        col4: {
          type: String,
          default: "",
        },
      },
    ],
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    taskStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    statusChangeHistory: [
      {
        oldStatus: {
          type: String,
          required: true,
        },
        newStatus: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("TaskAssign", TaskAssignSchema);
