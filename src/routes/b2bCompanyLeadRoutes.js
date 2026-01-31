import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsByCompanyId,
  getLeadsByStatus,
  generateReferenceId,
  saveMessage,
  saveDetails,
} from "../controller/b2bCompanyLeadController.js";

const router = express.Router();

router.post("/", createLead);
router.get("/", getLeads);
router.get("/generate-ref", generateReferenceId);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);
router.post("/:id/message", saveMessage);
router.post("/:id/details", saveDetails);
router.get("/company/:companyId", getLeadsByCompanyId);
router.get("/status/:status", getLeadsByStatus);

export default router;
