import express from "express";
import {
  getAllSuperadminMyleads,
  getSuperadminMyleadById,
  createSuperadminMylead,
  updateSuperadminMylead,
  deleteSuperadminMylead,
  bulkDeleteSuperadminMyleads,
  getSuperadminMyleadsByStatus,
  getSuperadminMyleadStats,
  assignLeadToEmployee,
  getLeadsAssignedToEmployee,
  getMessages,
  addMessage,
  saveDetails,
  transferLeadToOperation,
  getTransferLeadsByAdmin
} from "../controller/superadminMyleadController.js";

const router = express.Router();

// Routes for superadmin myleads
router.get("/:superAdminId", getAllSuperadminMyleads);
router.get("/:superAdminId/status/:status", getSuperadminMyleadsByStatus);
router.get("/stats/:superAdminId", getSuperadminMyleadStats);
router.get("/assigned-to/:employeeId", getLeadsAssignedToEmployee);
router.get("/lead/:id", getSuperadminMyleadById);
router.post("/:superAdminId", createSuperadminMylead);
router.put("/:id", updateSuperadminMylead);
router.put("/assign/:leadId", assignLeadToEmployee);
router.delete("/:id", deleteSuperadminMylead);
router.post("/bulk-delete", bulkDeleteSuperadminMyleads);
router.get("/:leadId/messages", getMessages); 
router.post("/:leadId/messages", addMessage); 
router.post("/:leadId/details", saveDetails);
// router.get("/transfer/:leadId", getOperationLeadById);
router.post("/transfer/:leadId", transferLeadToOperation);
router.get("/transfer/admin", getTransferLeadsByAdmin);



export default router;