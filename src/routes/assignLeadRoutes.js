// routes/assignLeadRoutes.js
import express from "express";
import {
  assignLeadToEmployee,
  getAssignedLeadsForEmployee,
  reassignLeadsForEmployee,
  removeAssignedLead,
  bulkDeleteAssignedLeads,
} from "../controller/assignLeadController.js";

const router = express.Router();

// POST /assignlead/ -> assign new leads to an employee
router.post("/", assignLeadToEmployee);

// POST /assignlead/reassign -> move leads from one employee to another
router.post("/reassign", reassignLeadsForEmployee);

// POST /assignlead/bulk-delete -> delete multiple assigned leads
router.post("/bulk-delete", bulkDeleteAssignedLeads);

// GET /assignlead/:employeeId -> get assigned leads for an employee
router.get("/:employeeId", getAssignedLeadsForEmployee);

// DELETE /assignlead/:assignLeadId -> remove an assigned lead
router.delete("/:assignLeadId", removeAssignedLead);

export default router;
