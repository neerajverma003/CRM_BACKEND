import express from "express";
import {
  saveSalarySummary,
  getSalarySummary,
  getEmployeeSalaryHistory,
  updateSalaryStatus,
  deleteSalaryRecord,
} from "../controller/salaryController.js";

const router = express.Router();

/**
 * POST /salary/save - Save or update salary summary
 */
router.post("/save", saveSalarySummary);

/**
 * GET /salary - Get salary summary for a specific month/year
 * Query params: employeeId, month, year
 */
router.get("/", getSalarySummary);

/**
 * GET /salary/history - Get all salary records for an employee
 * Query params: employeeId
 */
router.get("/history", getEmployeeSalaryHistory);

/**
 * PATCH /salary/:salaryId/status - Update salary status
 * Params: salaryId
 * Body: { status: "Pending" | "Approved" | "Paid" }
 */
router.patch("/:salaryId/status", updateSalaryStatus);

/**
 * DELETE /salary/:salaryId - Delete salary record
 * Params: salaryId
 */
router.delete("/:salaryId", deleteSalaryRecord);

export default router;
