import schedule from "node-schedule";
import Employee from "../models/employeeModel.js";
import Attendance from "../models/attendanceModel.js";
import Admin from "../models/Adminmodel.js";
import { AdminAttendance } from "../models/adminAttendance.js";

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ✅ Run every day at 2:05 PM IST
const job = schedule.scheduleJob("5 14 * * *", async () => {
  console.log("⏰ Running daily auto-absent check (2:05 PM)…");

  const { start, end } = getTodayRange();
  const today = new Date();

  /* -------------------------------------------------------------------------- */
  /* 🧑‍💼 EMPLOYEE ATTENDANCE CHECK */
  /* -------------------------------------------------------------------------- */
  try {
    const employees = await Employee.find();
 
    for (const emp of employees) {
      const existing = await Attendance.findOne({
        employee: emp._id,
        company: emp.company,
        date: { $gte: start, $lte: end },
      });

      if (!existing) {
        await Attendance.create({
          employee: emp._id,
          company: emp.company,
          date: today,
          clockIn: null,
          clockOut: null,
          status: "Absent",
          firstHalf: "Absent",
          secondHalf: "Absent",
          remarks: "Did not clock in before 2:00 PM — auto-marked absent",
        });
        // console.log(`❌ [EMPLOYEE] Marked Absent: ${emp.fullName || emp._id}`);
      } else {
        // console.log(`✅ [EMPLOYEE] ${emp.fullName || emp._id} already has attendance.`);
      }
    }
  } catch (err) {
    // console.error("❌ Employee auto-absent error:", err.message);
  }

  /* -------------------------------------------------------------------------- */
  /* 🧑‍🏫 ADMIN ATTENDANCE CHECK */
  /* -------------------------------------------------------------------------- */
  try {
    const admins = await Admin.find();

    for (const adm of admins) {
      const existing = await AdminAttendance.findOne({
        admin: adm._id,
        company: adm.company,
        date: { $gte: start, $lte: end },
      });

      if (!existing) {
        await AdminAttendance.create({
          admin: adm._id,
          company: adm.company,
          date: today,
          clockIn: null,
          clockOut: null,
          status: "Absent",
          firstHalf: "Absent",
          secondHalf: "Absent",
          remarks: "Did not clock in before 2:00 PM — auto-marked absent",
        });
        console.log(`❌ [ADMIN] Marked Absent: ${adm.fullName || adm._id}`);
      } else {
        console.log(`✅ [ADMIN] ${adm.fullName || adm._id} already has attendance.`);
      }
    }

    console.log("✅ Auto-absent marking completed successfully for Admins & Employees!");
  } catch (err) {
    console.error("❌ Admin auto-absent error:", err.message);
  }
});

export default job;