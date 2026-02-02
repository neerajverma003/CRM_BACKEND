import EmployeeRole from "../models/employeeRoleModel.js";
import SubRole from "../models/subRoleModel.js";

// ================== GET ALL EMPLOYEE ROLES ==================
export const getAllEmployeeRoles = async (req, res) => {
  try {
    const roles = await EmployeeRole.find().populate("subRole", "subRoleName points").lean();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error("Error fetching employee roles:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ================== CREATE EMPLOYEE ROLE ==================
export const createEmployeeRole = async (req, res) => {
  try {
    const { role, subRole } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: "Role name is required" });
    }

    // Check if role already exists
    const existingRole = await EmployeeRole.findOne({ role: role.trim() });
    if (existingRole) {
      return res.status(409).json({ success: false, message: "Role already exists" });
    }

    // Format and validate subRoles
    let subRoleIds = [];
    if (Array.isArray(subRole) && subRole.length > 0) {
      const formattedSubRoles = subRole
        .filter((s) => s && s.subRoleName && s.subRoleName.trim())
        .map((s) => ({
          subRoleName: s.subRoleName.trim(),
          points: (s.points || []).filter((p) => p && p.trim()),
        }));

      if (formattedSubRoles.length > 0) {
        // Create SubRole documents
        const createdSubRoles = await SubRole.insertMany(formattedSubRoles);
        subRoleIds = createdSubRoles.map((sr) => sr._id);
      }
    }

    const newEmployeeRole = new EmployeeRole({
      role: role.trim(),
      subRole: subRoleIds,
    });

    await newEmployeeRole.save();
    await newEmployeeRole.populate("subRole", "subRoleName points");

    res.status(201).json({ success: true, message: "Employee role created successfully", data: newEmployeeRole });
  } catch (error) {
    console.error("Error creating employee role:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ================== GET SINGLE EMPLOYEE ROLE ==================
export const getEmployeeRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await EmployeeRole.findById(roleId).populate("subRole", "subRoleName points").lean();
    if (!role) {
      return res.status(404).json({ success: false, message: "Employee role not found" });
    }

    res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error("Error fetching employee role:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ================== UPDATE EMPLOYEE ROLE ==================
export const updateEmployeeRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { role, subRole } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: "Role name is required" });
    }

    // Check if another role has the same name
    const existingRole = await EmployeeRole.findOne({ role: role.trim(), _id: { $ne: roleId } });
    if (existingRole) {
      return res.status(409).json({ success: false, message: "Role name already exists" });
    }

    let subRoleIds = [];
    if (Array.isArray(subRole) && subRole.length > 0) {
      // Separate new subRoles from existing ones
      const newSubRoles = [];
      const existingSubRoleIds = [];

      for (const s of subRole) {
        if (s._id) {
          // Existing subRole
          existingSubRoleIds.push(s._id);
          // Update it
          await SubRole.findByIdAndUpdate(
            s._id,
            { subRoleName: s.subRoleName, points: s.points || [] },
            { new: true }
          );
        } else if (s.subRoleName && s.subRoleName.trim()) {
          // New subRole
          newSubRoles.push({
            subRoleName: s.subRoleName.trim(),
            points: (s.points || []).filter((p) => p && p.trim()),
          });
        }
      }

      // Create new subRoles
      if (newSubRoles.length > 0) {
        const createdSubRoles = await SubRole.insertMany(newSubRoles);
        existingSubRoleIds.push(...createdSubRoles.map((sr) => sr._id));
      }

      subRoleIds = existingSubRoleIds;
    }

    const updatedRole = await EmployeeRole.findByIdAndUpdate(
      roleId,
      { role: role.trim(), subRole: subRoleIds },
      { new: true, runValidators: true }
    ).populate("subRole", "subRoleName points");

    if (!updatedRole) {
      return res.status(404).json({ success: false, message: "Employee role not found" });
    }

    res.status(200).json({ success: true, message: "Employee role updated successfully", data: updatedRole });
  } catch (error) {
    console.error("Error updating employee role:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ================== DELETE EMPLOYEE ROLE ==================
export const deleteEmployeeRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const deletedRole = await EmployeeRole.findByIdAndDelete(roleId);
    if (!deletedRole) {
      return res.status(404).json({ success: false, message: "Employee role not found" });
    }

    res.status(200).json({ success: true, message: "Employee role deleted successfully", data: deletedRole });
  } catch (error) {
    console.error("Error deleting employee role:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
