import express from "express";
import {
  createOperationLead,
  getAllOperationLeads,
  getOperationLeadById,
  updateOperationLead,
  deleteOperationLead,
  saveOperationLeadMessage,
  saveOperationLeadDetails,
} from "../controller/b2bOperationLeadController.js";

const router = express.Router();

// CRUD routes
router.post("/", createOperationLead);
router.get("/", getAllOperationLeads);
router.get("/:id", getOperationLeadById);
router.put("/:id", updateOperationLead);
router.delete("/:id", deleteOperationLead);

// Message route
router.post("/:id/message", saveOperationLeadMessage);

// Details route
router.post("/:id/details", saveOperationLeadDetails);

export default router;
