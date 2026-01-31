import express from "express";
import {
  register,
  getUser,
  deleteAdmin,
  editAdmin,
  getAdmin,
  getAllLeaveRequests,
  updateLeaveStatus,
  assignCompany,
  getCompanyByAdminId,
  assignWorkRole,
  getAssignedRoles,
  getAssignedRolesByAdminAndCompany,
  getAdminAssignedRolesById,
  getSubRoleName,
  deleteAssignedRole,
  deleteSubRoleFromAssignedRole,
  deletePointFromSubRole
} from "../controller/adminController.js";

const router = express.Router();

// Admin CRUD
router.post("/addAdmin", register);
router.get("/getAdmins", getUser);  // all admins
router.get("/getAdmin/:adminId", getAdmin); // single admin
router.put("/editAdmin/:adminId", editAdmin);
router.delete("/deleteAdmin/:adminId", deleteAdmin);

// Company assignment
router.post("/assign", assignCompany);
router.get("/getCompanyByAdminId/:adminId", getCompanyByAdminId);

// Role assignment
router.post("/assignRole", assignWorkRole);
router.get("/getAssignedRoles", getAssignedRoles);
router.get("/getAssignedRoles/:adminId/:companyId", getAssignedRolesByAdminAndCompany);

// Leave management
router.get("/admin/all-leaves", getAllLeaveRequests);
router.put("/admin/update-leave/:leaveId", updateLeaveStatus);
router.get("/getassignedroles/:adminId", getAdminAssignedRolesById);
router.get("/getSubRoleName/:subRoleId", getSubRoleName);


// ==================== Delete Operations ====================
// Delete entire assigned role
router.delete("/deleteassignedrole/:adminId", deleteAssignedRole);

// Delete specific sub-role from assigned role
router.delete("/deletesubrole/:adminId", deleteSubRoleFromAssignedRole);

// Delete specific point from sub-role (for specific admin and company)
router.delete("/deletepoint/:adminId", deletePointFromSubRole);

export default router;
