// import Salary from "../models/SalaryModel.js";
// import Employee from "../models/employeeModel.js";

// /**
//  * Save/Update Salary Summary
//  */
// export const saveSalarySummary = async (req, res) => {
//   try {
//     const {
//       employeeId,
//       month,
//       year,
//       baseSalary,
//       perDaySalary,
//       workingDays,
//       presentDays,
//       gracePresentDays,
//       earnedAmount,
//       remarkAmount,
//       totalPayable,
//       notes,
//     } = req.body;

//     // Validate required fields
//     if (!employeeId || month === undefined || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID, month, and year are required",
//       });
//     }

//     // Verify employee exists
//     const employee = await Employee.findById(employeeId);
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     // Check if salary record already exists for this employee, month, year
//     let salaryRecord = await Salary.findOne({ employee: employeeId, month, year });

//     if (salaryRecord) {
//       // Update existing record
//       salaryRecord.baseSalary = baseSalary;
//       salaryRecord.perDaySalary = perDaySalary;
//       salaryRecord.workingDays = workingDays;
//       salaryRecord.presentDays = presentDays;
//       salaryRecord.gracePresentDays = gracePresentDays;
//       salaryRecord.earnedAmount = earnedAmount;
//       salaryRecord.remarkAmount = remarkAmount || 0;
//       salaryRecord.totalPayable = totalPayable;
//       salaryRecord.notes = notes || "";
//       salaryRecord.updatedAt = new Date();

//       await salaryRecord.save();

//       return res.status(200).json({
//         success: true,
//         message: "Salary summary updated successfully",
//         data: salaryRecord,
//       });
//     } else {
//       // Create new record
//       const newSalary = new Salary({
//         employee: employeeId,
//         month,
//         year,
//         baseSalary,
//         perDaySalary,
//         workingDays,
//         presentDays,
//         gracePresentDays,
//         earnedAmount,
//         remarkAmount: remarkAmount || 0,
//         totalPayable,
//         notes: notes || "",
//       });

//       await newSalary.save();

//       return res.status(201).json({
//         success: true,
//         message: "Salary summary saved successfully",
//         data: newSalary,
//       });
//     }
//   } catch (error) {
//     console.error("Error saving salary summary:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error saving salary summary",
//       error: error.message,
//     });
//   }
// };

// /**
//  * Get Salary Summary for an Employee in a specific month/year
//  */
// export const getSalarySummary = async (req, res) => {
//   try {
//     const { employeeId, month, year } = req.query;

//     if (!employeeId || month === undefined || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID, month, and year are required",
//       });
//     }

//     const salary = await Salary.findOne({
//       employee: employeeId,
//       month: parseInt(month),
//       year: parseInt(year),
//     }).populate("employee", "fullName email salary");

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Salary record not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: salary,
//     });
//   } catch (error) {
//     console.error("Error fetching salary summary:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching salary summary",
//       error: error.message,
//     });
//   }
// };

// /**
//  * Get all salary records for an employee
//  */
// export const getEmployeeSalaryHistory = async (req, res) => {
//   try {
//     const { employeeId } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required",
//       });
//     }

//     const salaries = await Salary.find({ employee: employeeId })
//       .populate("employee", "fullName email")
//       .sort({ year: -1, month: -1 });

//     res.status(200).json({
//       success: true,
//       data: salaries,
//     });
//   } catch (error) {
//     console.error("Error fetching salary history:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching salary history",
//       error: error.message,
//     });
//   }
// };

// /**
//  * Update salary status (Pending, Approved, Paid)
//  */
// export const updateSalaryStatus = async (req, res) => {
//   try {
//     const { salaryId } = req.params;
//     const { status } = req.body;

//     if (!["Pending", "Approved", "Paid"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status. Must be Pending, Approved, or Paid",
//       });
//     }

//     const salary = await Salary.findByIdAndUpdate(
//       salaryId,
//       { status, updatedAt: new Date() },
//       { new: true }
//     );

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Salary record not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Salary status updated successfully",
//       data: salary,
//     });
//   } catch (error) {
//     console.error("Error updating salary status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating salary status",
//       error: error.message,
//     });
//   }
// };

// /**
//  * Delete salary record
//  */
// export const deleteSalaryRecord = async (req, res) => {
//   try {
//     const { salaryId } = req.params;

//     const salary = await Salary.findByIdAndDelete(salaryId);

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Salary record not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Salary record deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting salary record:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting salary record",
//       error: error.message,
//     });
//   }
// };



import Salary from "../models/SalaryModel.js";
import Employee from "../models/employeeModel.js";

/**
 * Save/Update Salary Summary with Attendance Summary
 */
export const saveSalarySummary = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      baseSalary,
      perDaySalary,
      workingDays,
      presentDays,
      gracePresentDays,
      earnedAmount,
      remarkAmount,
      totalPayable,
      notes,
      status,
      // Attendance Summary Fields
      attendanceSummary,
      // Salary Summary Fields
      salarySummary,
    } = req.body;

    // Validate required fields
    if (!employeeId || month === undefined || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, month, and year are required",
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if salary record already exists for this employee, month, year
    let salaryRecord = await Salary.findOne({ employee: employeeId, month, year });

    if (salaryRecord) {
      // Update existing record
      salaryRecord.baseSalary = baseSalary;
      salaryRecord.perDaySalary = perDaySalary;
      salaryRecord.workingDays = workingDays;
      salaryRecord.presentDays = presentDays;
      salaryRecord.gracePresentDays = gracePresentDays;
      salaryRecord.earnedAmount = earnedAmount;
      salaryRecord.remarkAmount = remarkAmount || 0;
      salaryRecord.totalPayable = totalPayable;
      salaryRecord.status = status || "Pending";
      salaryRecord.notes = notes || "";
      
      // Store attendance summary if provided
      if (attendanceSummary) {
        salaryRecord.attendanceSummary = attendanceSummary;
      }
      
      // Store salary summary if provided
      if (salarySummary) {
        salaryRecord.salarySummary = salarySummary;
      }
      
      salaryRecord.updatedAt = new Date();

      await salaryRecord.save();

      return res.status(200).json({
        success: true,
        message: "Salary summary updated successfully",
        data: salaryRecord,
      });
    } else {
      // Create new record
      const newSalary = new Salary({
        employee: employeeId,
        month,
        year,
        baseSalary,
        perDaySalary,
        workingDays,
        presentDays,
        gracePresentDays,
        earnedAmount,
        remarkAmount: remarkAmount || 0,
        totalPayable,
        status: status || "Pending",
        notes: notes || "",
      });

      // Store attendance summary if provided
      if (attendanceSummary) {
        newSalary.attendanceSummary = attendanceSummary;
      }
      
      // Store salary summary if provided
      if (salarySummary) {
        newSalary.salarySummary = salarySummary;
      }

      await newSalary.save();

      return res.status(201).json({
        success: true,
        message: "Salary summary saved successfully",
        data: newSalary,
      });
    }
  } catch (error) {
    console.error("Error saving salary summary:", error);
    res.status(500).json({
      success: false,
      message: "Error saving salary summary",
      error: error.message,
    });
  }
};

/**
 * Get Salary Summary for an Employee in a specific month/year
 */
export const getSalarySummary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId || month === undefined || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, month, and year are required",
      });
    }

    const salary = await Salary.findOne({
      employee: employeeId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate("employee", "fullName email salary");

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: salary,
    });
  } catch (error) {
    console.error("Error fetching salary summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary summary",
      error: error.message,
    });
  }
};

/**
 * Get all salary records for an employee
 */
export const getEmployeeSalaryHistory = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const salaries = await Salary.find({ employee: employeeId })
      .populate("employee", "fullName email")
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: salaries,
    });
  } catch (error) {
    console.error("Error fetching salary history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary history",
      error: error.message,
    });
  }
};

/**
 * Update salary status (Pending, Approved, Paid)
 */
export const updateSalaryStatus = async (req, res) => {
  try {
    const { salaryId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Pending, Approved, or Paid",
      });
    }

    const salary = await Salary.findByIdAndUpdate(
      salaryId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary status updated successfully",
      data: salary,
    });
  } catch (error) {
    console.error("Error updating salary status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating salary status",
      error: error.message,
    });
  }
};

/**
 * Delete salary record
 */
export const deleteSalaryRecord = async (req, res) => {
  try {
    const { salaryId } = req.params;

    const salary = await Salary.findByIdAndDelete(salaryId);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting salary record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting salary record",
      error: error.message,
    });
  }
};