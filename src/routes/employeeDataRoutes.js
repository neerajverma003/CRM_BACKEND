import express from "express";
import {
  createEmployeeData,
  getAllEmployeeData,
  getEmployeeDataById,
  updateEmployeeData,
  deleteEmployeeData,
  uploadEmployeeDocuments,
} from "../controller/employeeDataController.js";
import { documentUpload } from "../../config/upload.js";

const router = express.Router();

// Create employee data
router.post("/", createEmployeeData);

// Get all employee data with pagination and search
router.get("/", getAllEmployeeData);

// Get employee data by ID
router.get("/:id", getEmployeeDataById);

// Update employee data
router.put("/:id", updateEmployeeData);

// Delete employee data
router.delete("/:id", deleteEmployeeData);

// Upload documents for an employee
router.post(
  "/:id/upload",
  documentUpload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "accountDetails", maxCount: 1 },
    { name: "pcc", maxCount: 1 },
    { name: "educationQualifications", maxCount: 10 },
    { name: "offerLetters", maxCount: 10 },
    { name: "relievingLetters", maxCount: 10 },
  ]),
  uploadEmployeeDocuments
);

export default router;
