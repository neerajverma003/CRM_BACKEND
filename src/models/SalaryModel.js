// import mongoose from "mongoose";

// const salarySchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },
//     month: {
//       type: Number,
//       required: true, // 0-11 for January-December
//     },
//     year: {
//       type: Number,
//       required: true,
//     },
//     baseSalary: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     perDaySalary: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     workingDays: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     presentDays: {
//       type: Number,
//       default: 0,
//     },
//     gracePresentDays: {
//       type: Number,
//       default: 0,
//     },
//     earnedAmount: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     remarkAmount: {
//       type: Number,
//       default: 0,
//     },
//     totalPayable: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Approved", "Paid"],
//       default: "Pending",
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // Ensure unique combination of employee, month, and year
// salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// export default mongoose.model("Salary", salarySchema);


import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: Number,
      required: true, // 0-11 for January-December
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    perDaySalary: {
      type: Number,
      required: true,
      default: 0,
    },
    workingDays: {
      type: Number,
      required: true,
      default: 0,
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    gracePresentDays: {
      type: Number,
      default: 0,
    },
    earnedAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    remarkAmount: {
      type: Number,
      default: 0,
    },
    totalPayable: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Paid"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
    // Attendance Summary Fields
    attendanceSummary: {
      present: {
        type: Number,
        default: 0,
      },
      absent: {
        type: Number,
        default: 0,
      },
      late: {
        type: Number,
        default: 0,
      },
      halfDay: {
        type: Number,
        default: 0,
      },
      gracePresent: {
        type: Number,
        default: 0,
      },
      sunday: {
        type: Number,
        default: 0,
      },
      holiday: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    // Salary Summary Fields
    salarySummary: {
      baseSalary: {
        type: Number,
        default: 0,
      },
      perDaySalary: {
        type: Number,
        default: 0,
      },
      workingDaysAllowed: {
        type: Number,
        default: 0,
      },
      workingDaysPresent: {
        type: Number,
        default: 0,
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
      deductions: {
        type: Number,
        default: 0,
      },
      netPayable: {
        type: Number,
        default: 0,
      },
      attendancePercentage: {
        type: Number,
        default: 0,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure unique combination of employee, month, and year
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Salary", salarySchema);