
// import Attendance from "../models/attendanceModel.js";
// import Employee from "../models/employeeModel.js";
// import moment from "moment-timezone";

// /* -------------------------------------------------------------------------- */
// /*  UTILITIES */
// /* -------------------------------------------------------------------------- */

// // Get today's start and end time (UTC-safe)
// const getTodayRange = () => {
//   const now = new Date();
//   const start = new Date(
//     Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
//   );
//   const end = new Date(
//     Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
//   );
//   return { start, end };
// };

// // Calculate difference in minutes
// const diffInMinutes = (later, earlier) =>
//   Math.floor((later - earlier) / (1000 * 60));

// /* -------------------------------------------------------------------------- */
// /*  CLOCK-IN FUNCTION */
// /* -------------------------------------------------------------------------- */

// export const clockIn = async (req, res) => {
//   try {
//     const { employeeId, companyId } = req.body;

//     // Debug logging for mobile issues
//     console.log("🔵 Clock-In Request Received:", {
//       employeeId,
//       companyId,
//       timestamp: new Date().toISOString(),
//       headers: req.headers,
//       body: req.body
//     });

//     if (!employeeId || !companyId)
//       return res
//         .status(400)
//         .json({ message: "Employee and company are required." });

//     const employee = await Employee.findById(employeeId);
//     if (!employee)
//       return res.status(404).json({ message: "Employee not found." });

//     const { start, end } = getTodayRange();

//     //  Define now (IST-based) before using it
//     const now = moment().tz("Asia/Kolkata");
//     const nowDate = now.toDate();
//     const dayOfWeek = now.day(); // 0 = Sunday, 1 = Monday, ...

//     //  If Sunday, stop here
//     if (dayOfWeek === 0) {
//       return res.status(400).json({
//         message: "Today is Sunday (Holiday). Clock-in not required.",
//       });
//     }

//     // Check if already clocked in today
//     const existingRecord = await Attendance.findOne({
//       employee: employeeId,
//       company: companyId,
//       date: { $gte: start, $lte: end },
//     });
//     if (existingRecord)
//       return res.status(400).json({ message: "Already clocked in for today." });

//     // Shift boundaries (IST)
//     const today = moment().tz("Asia/Kolkata").startOf("day");
//     const clockInAllow = today.clone().hour(9).minute(35).toDate();
//     const shiftStart = today.clone().hour(10).minute(1).toDate();
//     const graceEnd = today.clone().hour(10).minute(15).toDate();
//     const lateEnd = today.clone().hour(12).minute(0).toDate();
//     const halfDayEnd = today.clone().hour(14).minute(0).toDate();

//     //  Validate clock-in time
//     if (nowDate < clockInAllow) {
//       return res.status(400).json({
//         message: "Clock-in not allowed before 9:35 AM.",
//       });
//     }

//     if (nowDate > halfDayEnd) {
//       return res.status(400).json({
//         message: "Clock-in not allowed after 2:00 PM. Please contact admin.",
//       });
//     }

//     // Initialize attendance variables
//     let status = "Present";
//     let firstHalf = "Present";
//     let secondHalf = "Present";
//     let remarks = "";
//     let lateMinutes = 0;
//     let isLate = false;

//     // Attendance logic
//     if (clockInAllow <= nowDate && nowDate < shiftStart) {
//       status = "Present";
//       remarks = "On time (Present)";
//     } else if (nowDate >= shiftStart && nowDate <= graceEnd) {
//       status = "Grace Present";
//       remarks = "Within grace period (Present)";
//     } else if (nowDate > graceEnd && nowDate <= lateEnd) {
//       status = "Late";
//       isLate = true;
//       lateMinutes = diffInMinutes(nowDate, shiftStart);
//       remarks = `Late by ${lateMinutes} minutes (Still Present)`;
//     } else if (nowDate > lateEnd && nowDate <= halfDayEnd) {
//       status = "Half Day";
//       firstHalf = "Absent";
//       remarks = "Clocked in between 12:00–2:00 PM (Half Day)";
//     }

//     const attendance = new Attendance({
//       employee: employeeId,
//       company: companyId,
//       clockIn: nowDate,
//       date: start, //  Keep UTC-based date for consistency
//       status,
//       firstHalf,
//       secondHalf,
//       lateMinutes,
//       isLate,
//       remarks,
//     });

//     await attendance.save();

//     return res
//       .status(201)
//       .json({ message: "Clock-in recorded successfully", attendance });
//   } catch (error) {
//     console.error(" Error in clockIn:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /*  CLOCK-OUT FUNCTION */
// /* -------------------------------------------------------------------------- */

// export const clockOut = async (req, res) => {
//   try {
//     const { employeeId, companyId } = req.body;

//     // Debug logging for mobile issues
//     console.log("🔴 Clock-Out Request Received:", {
//       employeeId,
//       companyId,
//       timestamp: new Date().toISOString(),
//       headers: req.headers,
//       body: req.body
//     });

//     if (!employeeId || !companyId)
//       return res
//         .status(400)
//         .json({ message: "Employee and company are required." });

//     const { start, end } = getTodayRange();

//     const attendance = await Attendance.findOne({
//       employee: employeeId,
//       company: companyId,
//       date: { $gte: start, $lte: end },
//     });

//     if (!attendance)
//       return res
//         .status(404)
//         .json({ message: "No clock-in record found for today." });

//     if (attendance.clockOut)
//       return res.status(400).json({ message: "Already clocked out today." });

//     //  IST-safe time
//     const now = moment().tz("Asia/Kolkata").toDate();
//     attendance.clockOut = now;

//     const workedHours = Number(
//       ((now - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2)
//     );
//     attendance.workedHours = workedHours;

//     const shiftMid = moment().tz("Asia/Kolkata").hour(13).minute(0).toDate();
//     if (attendance.firstHalf === "Absent" && now >= shiftMid) {
//       attendance.secondHalf = "Present";
//     }

//     const MIN_HOURS_FOR_HALF_DAY = 3;
//     const MIN_HOURS_FOR_FULL_DAY = 7;

//     if (workedHours < MIN_HOURS_FOR_HALF_DAY) {
//       attendance.status = "Absent";
//       attendance.firstHalf = "Absent";
//       attendance.secondHalf = "Absent";
//       attendance.remarks = `Worked ${workedHours} hrs — Absent`;
//     } else if (workedHours < MIN_HOURS_FOR_FULL_DAY) {
//       attendance.status = "Half Day";
//       attendance.remarks = `Worked ${workedHours} hrs — Half Day`;
//     } else {
//       //  Preserve late flag
//       if (attendance.isLate) {
//         attendance.status = "Late";
//         attendance.remarks = `Worked ${workedHours} hrs — Late Present`;
//       } else {
//         attendance.status = "Present";
//         attendance.remarks = `Worked ${workedHours} hrs — Full Day`;
//       }
//     }

//     await attendance.save();

//     return res
//       .status(200)
//       .json({ message: "Clock-out recorded successfully", attendance });
//   } catch (error) {
//     console.error(" Error in clockOut:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /*  GET ALL ATTENDANCE RECORDS */
// /* -------------------------------------------------------------------------- */

// export const getAttendanceForAllEmployee = async (req, res) => {
//   try {
//     const attendanceRecords = await Attendance.find()
//       .populate("employee", "fullName email role department")
//       .populate("company", "name")
//       .select("-__v")
//       .sort({ date: -1 });

//     return res.status(200).json(attendanceRecords);
//   } catch (error) {
//     console.error(" Error fetching attendance records:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /*  CREATE ATTENDANCE RECORD */
// /* -------------------------------------------------------------------------- */

// export const createAttendance = async (req, res) => {
//   try {
//     const { employee, date, clockIn, clockOut, status } = req.body;

//     if (!employee) {
//       return res.status(400).json({ message: "Employee ID is required" });
//     }

//     if (!date) {
//       return res.status(400).json({ message: "Date is required" });
//     }

//     // Check if employee exists
//     const employeeExists = await Employee.findById(employee);
//     if (!employeeExists) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // Create new attendance record
//     const newAttendance = new Attendance({
//       employee,
//       date: new Date(date),
//       clockIn: clockIn ? new Date(clockIn) : null,
//       clockOut: clockOut ? new Date(clockOut) : null,
//       status: status || "Present",
//     });

//     await newAttendance.save();

//     // Populate employee details before returning
//     await newAttendance.populate("employee", "fullName email role department");

//     return res.status(201).json({
//       message: "Attendance record created successfully",
//       attendance: newAttendance,
//     });
//   } catch (error) {
//     console.error(" Error creating attendance record:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /*  EDIT ATTENDANCE */
// /* -------------------------------------------------------------------------- */

// export const editAttendance = async (req, res) => {
//   try {
//     const { attendanceId } = req.params;
//     const updates = req.body;

//     const attendance = await Attendance.findByIdAndUpdate(
//       attendanceId,
//       updates,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!attendance) {
//       return res.status(404).json({ message: "Attendance record not found" });
//     }

//     return res.status(200).json({
//       message: "Attendance record updated successfully",
//       attendance,
//     });
//   } catch (error) {
//     console.error(" Error updating attendance record:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /*  GET ATTENDANCE BY EMPLOYEE ID */
// /* -------------------------------------------------------------------------- */

// export const getAttendanceByEmployeeId = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     const attendanceRecords = await Attendance.find({
//       employee: employeeId,
//     })
//       .populate("employee")
//       .select("-__v");

//     if (!attendanceRecords || attendanceRecords.length === 0) {
//       return res.status(404).json({
//         message: "No attendance records found for this employee",
//       });
//     }

//     return res
//       .status(200)
//       .json({ message: "Attendance found", data: attendanceRecords });
//   } catch (error) {
//     console.error(" Error fetching attendance by employee:", error);
//     return res
//       .status(500)
//       .json({ message: "Server Error", error: error.message });
//   }
// };


import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import moment from "moment-timezone";

/* -------------------------------------------------------------------------- */
/*  UTILITIES */
/* -------------------------------------------------------------------------- */

// Get today's start and end time (UTC-safe)
const getTodayRange = () => {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  );
  return { start, end };
};

// Calculate difference in minutes
const diffInMinutes = (later, earlier) =>
  Math.floor((later - earlier) / (1000 * 60));

/* -------------------------------------------------------------------------- */
/*  CLOCK-IN FUNCTION */
/* -------------------------------------------------------------------------- */

export const clockIn = async (req, res) => {
  try {
    const { employeeId, companyId } = req.body;

    // Debug logging for mobile issues
    console.log("🔵 Clock-In Request Received:", {
      employeeId,
      companyId,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    });

    if (!employeeId || !companyId)
      return res
        .status(400)
        .json({ message: "Employee and company are required." });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found." });

    const { start, end } = getTodayRange();

    //  Define now (IST-based) before using it
    const now = moment().tz("Asia/Kolkata");
    const nowDate = now.toDate();
    const dayOfWeek = now.day(); // 0 = Sunday, 1 = Monday, ...

    //  If Sunday, stop here
    if (dayOfWeek === 0) {
      return res.status(400).json({
        message: "Today is Sunday (Holiday). Clock-in not required.",
      });
    }

    // Check if already clocked in today
    const existingRecord = await Attendance.findOne({
      employee: employeeId,
      company: companyId,
      date: { $gte: start, $lte: end },
    });
    if (existingRecord)
      return res.status(400).json({ message: "Already clocked in for today." });

    // Shift boundaries (IST)
    const today = moment().tz("Asia/Kolkata").startOf("day");
    const clockInAllow = today.clone().hour(9).minute(35).toDate();
    const shiftStart = today.clone().hour(10).minute(1).toDate();
    const graceEnd = today.clone().hour(10).minute(15).toDate();
    const lateEnd = today.clone().hour(12).minute(0).toDate();
    const halfDayEnd = today.clone().hour(14).minute(0).toDate();

    //  Validate clock-in time
    if (nowDate < clockInAllow) {
      return res.status(400).json({
        message: "Clock-in not allowed before 9:35 AM.",
      });
    }

    if (nowDate > halfDayEnd) {
      return res.status(400).json({
        message: "Clock-in not allowed after 2:00 PM. Please contact admin.",
      });
    }

    // Initialize attendance variables
    let status = "Present";
    let firstHalf = "Present";
    let secondHalf = "Present";
    let remarks = "";
    let lateMinutes = 0;
    let isLate = false;

    // Attendance logic
    if (clockInAllow <= nowDate && nowDate < shiftStart) {
      status = "Present";
      remarks = "On time (Present)";
    } else if (nowDate >= shiftStart && nowDate <= graceEnd) {
      status = "Grace Present";
      remarks = "Within grace period (Present)";
    } else if (nowDate > graceEnd && nowDate <= lateEnd) {
      status = "Late";
      isLate = true;
      lateMinutes = diffInMinutes(nowDate, shiftStart);
      remarks = `Late by ${lateMinutes} minutes (Still Present)`;
    } else if (nowDate > lateEnd && nowDate <= halfDayEnd) {
      status = "Half Day";
      firstHalf = "Absent";
      remarks = "Clocked in between 12:00–2:00 PM (Half Day)";
    }

    const attendance = new Attendance({
      employee: employeeId,
      company: companyId,
      clockIn: nowDate,
      date: start, //  Keep UTC-based date for consistency
      status,
      firstHalf,
      secondHalf,
      lateMinutes,
      isLate,
      remarks,
    });

    await attendance.save();

    return res
      .status(201)
      .json({ message: "Clock-in recorded successfully", attendance });
  } catch (error) {
    console.error(" Error in clockIn:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*  CLOCK-OUT FUNCTION */
/* -------------------------------------------------------------------------- */

export const clockOut = async (req, res) => {
  try {
    const { employeeId, companyId } = req.body;

    // Debug logging for mobile issues
    console.log("🔴 Clock-Out Request Received:", {
      employeeId,
      companyId,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    });

    if (!employeeId || !companyId)
      return res
        .status(400)
        .json({ message: "Employee and company are required." });

    const { start, end } = getTodayRange();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      company: companyId,
      date: { $gte: start, $lte: end },
    });

    if (!attendance)
      return res
        .status(404)
        .json({ message: "No clock-in record found for today." });

    if (attendance.clockOut)
      return res.status(400).json({ message: "Already clocked out today." });

    //  IST-safe time
    const now = moment().tz("Asia/Kolkata").toDate();
    attendance.clockOut = now;

    const workedHours = Number(
      ((now - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2)
    );
    attendance.workedHours = workedHours;

    const shiftMid = moment().tz("Asia/Kolkata").hour(13).minute(0).toDate();
    if (attendance.firstHalf === "Absent" && now >= shiftMid) {
      attendance.secondHalf = "Present";
    }

    const MIN_HOURS_FOR_HALF_DAY = 3;
    const MIN_HOURS_FOR_FULL_DAY = 7;

    if (workedHours < MIN_HOURS_FOR_HALF_DAY) {
      attendance.status = "Absent";
      attendance.firstHalf = "Absent";
      attendance.secondHalf = "Absent";
      attendance.remarks = `Worked ${workedHours} hrs — Absent`;
    } else if (workedHours < MIN_HOURS_FOR_FULL_DAY) {
      attendance.status = "Half Day";
      attendance.remarks = `Worked ${workedHours} hrs — Half Day`;
    } else {
      //  Preserve late flag
      if (attendance.isLate) {
        attendance.status = "Late";
        attendance.remarks = `Worked ${workedHours} hrs — Late Present`;
      } else {
        attendance.status = "Present";
        attendance.remarks = `Worked ${workedHours} hrs — Full Day`;
      }
    }

    await attendance.save();

    return res
      .status(200)
      .json({ message: "Clock-out recorded successfully", attendance });
  } catch (error) {
    console.error(" Error in clockOut:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*  GET ALL ATTENDANCE RECORDS */
/* -------------------------------------------------------------------------- */

export const getAttendanceForAllEmployee = async (req, res) => {
  try {
    const { date, employeeId, startDate, endDate } = req.query;
    let filter = {};

    // Filter by specific date (today's attendance)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter by employee ID
    if (employeeId) {
      filter.employee = employeeId;
    }

    // Filter by date range (monthly attendance)
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("employee", "fullName email role department")
      .populate("company", "name")
      .select("-__v")
      .sort({ date: -1 });

    return res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(" Error fetching attendance records:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*  CREATE ATTENDANCE RECORD */
/* -------------------------------------------------------------------------- */

export const createAttendance = async (req, res) => {
  try {
    const { employee, date, clockIn, clockOut, status } = req.body;

    if (!employee) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Check if employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      employee,
      date: new Date(date),
      clockIn: clockIn ? new Date(clockIn) : null,
      clockOut: clockOut ? new Date(clockOut) : null,
      status: status || "Present",
    });

    await newAttendance.save();

    // Populate employee details before returning
    await newAttendance.populate("employee", "fullName email role department");

    return res.status(201).json({
      message: "Attendance record created successfully",
      attendance: newAttendance,
    });
  } catch (error) {
    console.error(" Error creating attendance record:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*  EDIT ATTENDANCE */
/* -------------------------------------------------------------------------- */

export const editAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const updates = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.status(200).json({
      message: "Attendance record updated successfully",
      attendance,
    });
  } catch (error) {
    console.error(" Error updating attendance record:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*  GET ATTENDANCE BY EMPLOYEE ID */
/* -------------------------------------------------------------------------- */

export const getAttendanceByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const attendanceRecords = await Attendance.find({
      employee: employeeId,
    })
      .populate("employee")
      .select("-__v");

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({
        message: "No attendance records found for this employee",
      });
    }

    return res
      .status(200)
      .json({ message: "Attendance found", data: attendanceRecords });
  } catch (error) {
    console.error(" Error fetching attendance by employee:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};