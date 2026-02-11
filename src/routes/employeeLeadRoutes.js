import express from "express";
import {
  createLead,
  getAllEmployeeLeads,
  getAllLeads,
  getLeadsByEmployeeId,
  getLeadById,
  getOperationLeadById,
  updateLead,
  markLeadAsActioned,
  addMessage,
  getMessages,
  transferLeadToOperation,
  updateOperationLead,
  getTransferLeadsByEmployee,
  getAllTransferLeads,
  migrateTransferFlags,
  uploadTransferLeadDocuments,
  deleteTransferDocument,
  moveTransferLeadToCustomer,
  saveDetails,
  getEmployeeLeadStats,
  getAllEmployeeLead,
} from "../controller/employeeLeadController.js";
import { documentUpload } from "../../config/upload.js";

const router = express.Router();

//  Create a new lead
router.post("/", createLead);

//  Get all leads
router.get("/get", getAllLeads);
router.get("/getallemployeelead",getAllEmployeeLead)

//  Get all employee leads (must come before /:leadId to avoid route conflict)
router.get("/all", getAllEmployeeLeads);

//  Get leads by employee ID (or for superadmin, get all leads)
router.get("/employee/:employeeId", getLeadsByEmployeeId);

//  Get stats (must come before /:leadId to avoid route conflict)
router.get("/stats", getEmployeeLeadStats);

//  Get a single lead by ID (with all details)
router.get("/:leadId", getLeadById);

//  Update a lead by lead ID
router.put("/:leadId", updateLead);

// Add a message to a lead
router.post("/:leadId/message", addMessage);

// Get paginated messages for a lead
router.get("/:leadId/messages", getMessages);

// Save details for a lead (itinerary, inclusions, costs, etc.)
router.post("/:leadId/details", saveDetails);

//  Mark lead as actioned (when employee takes action on routed lead)
router.put("/action/:leadId", markLeadAsActioned);

// Transfer a lead to Operation collection
router.post("/transfer/:leadId", transferLeadToOperation);
router.post("/move-to-customer/:leadId", moveTransferLeadToCustomer);

// Upload documents for transfer leads (must come before /transfer/:leadId PUT)
router.post("/upload-documents", uploadTransferLeadDocuments);

// Delete a document (Cloudinary + DB)
router.delete("/document", deleteTransferDocument);

// Update an operation lead
router.put("/transfer/:leadId", updateOperationLead);
// Get all transfer leads (must come before /transfer/employee/:employeeId)
router.get("/transfer/all", getAllTransferLeads);
// Get transfer leads for an employee
router.get("/transfer/employee/:employeeId", getTransferLeadsByEmployee);
// Get a single transfer/operation lead by ID (specific - placed after other /transfer routes)
router.get("/transfer/:leadId", getOperationLeadById);
// Migrate any flagged leads (one-time helper)
router.post("/migrate-transfers", migrateTransferFlags);

export default router;
