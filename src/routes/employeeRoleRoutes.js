import express from "express";
import {
  getAllEmployeeRoles,
  createEmployeeRole,
  getEmployeeRole,
  updateEmployeeRole,
  deleteEmployeeRole,
} from "../controller/employeeRoleController.js";

const router = express.Router();

router.get("/getemployeerole", getAllEmployeeRoles);
router.post("/employeerole", createEmployeeRole);
router.get("/employeerole/:roleId", getEmployeeRole);
router.put("/updateemployeerole/:roleId", updateEmployeeRole);
router.delete("/deleteemployeerole/:roleId", deleteEmployeeRole);

export default router;
