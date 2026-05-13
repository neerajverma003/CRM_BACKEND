import express from "express";
import {
  createEmployeeData,
  getAllEmployeeData,
  getEmployeeDataById,
  updateEmployeeData,
  deleteEmployeeData,
  uploadEmployeeDocuments,
} from "../controller/employeeDataController.js";


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
  uploadEmployeeDocuments
);

export default router;
