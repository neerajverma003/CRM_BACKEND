import Role from "../models/roleModel.js";
import subRoleModel from "../models/subRoleModel.js";
import Admin from "../models/Adminmodel.js";

export const createRole = async (req, res) => {
  try {
    let { role, subRole } = req.body;

    // Ensure subRole is always an array of objects { subRoleName, points }
    if (!Array.isArray(subRole)) {
      subRole = [];
    } else {
      subRole = subRole.map((s) => {
        // If frontend sends a string
        if (typeof s === "string") {
          return { subRoleName: s, points: [] };
        }

        // If frontend sends in { name, points } format
        return {
          subRoleName: s.subRoleName || s.name || "",
          points: Array.isArray(s.points) ? s.points : [],
        };
      });
    }
    const newSubRole=await subRoleModel.insertMany(subRole);
    const newRole = await Role.create({ role, subRole: newSubRole });
    console.log(newRole);
    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllRole = async (req, res) => {
  try {
    const roles = await Role.find().populate("subRole","subRoleName points").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { role, subRole } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "Role id is required" });

    // 1️⃣ Find existing role to get old subRole IDs
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    const oldSubRoleIds = (existingRole.subRole || []).map(sr => sr.toString());

    // 2️⃣ PRESERVE admin assignments: Mark old SubRoles as inactive instead of deleting
    // ✅ This keeps admin assignments intact while removing from role definition
    if (oldSubRoleIds.length > 0) {
      await subRoleModel.updateMany(
        { _id: { $in: oldSubRoleIds } },
        { isActive: false }
      );
    }

    // 3️⃣ Normalize incoming subRole data
    if (!Array.isArray(subRole)) {
      subRole = [];
    }

    // 4️⃣ Create new SubRole documents (marked as active)
    let subRoleIds = [];
    if (subRole.length > 0) {
      const createdSubRoles = await subRoleModel.insertMany(
        subRole.map((s) => ({
          subRoleName: s.subRoleName || s.name || "",
          points: Array.isArray(s.points) ? s.points : [],
          isActive: true, // 🔹 NEW subroles are active
        }))
      );
      subRoleIds = createdSubRoles.map((sr) => sr._id);
    }

    // 5️⃣ Update the Role with new subRole IDs
    const updated = await Role.findByIdAndUpdate(
      id,
      {
        role: role.trim(),
        subRole: subRoleIds,
      },
      { new: true }
    ).populate("subRole", "subRoleName points");

    if (!updated) return res.status(404).json({ success: false, message: "Role not found" });

    // 🔹 Notify all admins to refresh their roles
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateRole error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Role id is required" });

    const deleted = await Role.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, message: "Role deleted" });
  } catch (error) {
    console.error("deleteRole error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
