import Admin from "../models/Adminmodel.js";
import SubRole from "../models/subRoleModel.js";
import Company from "../models/CompanyModel.js";
import Role from "../models/roleModel.js";
import Leave from "../models/LeaveModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// -------------------- Admin Registration --------------------
export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, accountActive } = req.body;

    if (!fullName || !email || !password || !role || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const duplicate = await Admin.findOne({ email });
    if (duplicate) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const admin = new Admin({
      fullName,
      email,
      password: hashPass,
      role,
      phone,
      accountActive: accountActive !== undefined ? accountActive : true,
    });

    await admin.save();

    return res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Get All Admins --------------------
export const getUser = async (req, res) => {
  try {
    const admins = await Admin.find();
    return res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Get Single Admin --------------------
export const getAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.status(200).json({ message: "Admin fetched successfully", admin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Edit Admin --------------------
export const editAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const updateData = req.body;
    // If password is provided, hash it before updating
    if (updateData && updateData.password && String(updateData.password).trim() !== "") {
      const hashed = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashed;
    }

    const admin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Delete Admin --------------------
export const deleteAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Only superAdmin can delete admins." });
    }

    const { adminId } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ success: true, message: "Admin deleted successfully", deletedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Assign Companies to Admin --------------------
export const assignCompany = async (req, res) => {
  try {
    const { adminId, companyIds } = req.body;

    if (!adminId || !companyIds || !Array.isArray(companyIds)) {
      return res.status(400).json({ message: "adminId and companyIds are required and must be an array" });
    }

    const admin = await Admin.findByIdAndUpdate(adminId, { company: companyIds }, { new: true })
      .populate("company", "companyName email phone address website");

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await Company.updateMany({ _id: { $in: companyIds } }, { $addToSet: { admin: adminId } });

    res.status(200).json({ message: "Companies assigned successfully", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Get Companies by Admin ID --------------------
export const getCompanyByAdminId = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) return res.status(400).json({ message: "Admin ID is required" });

    const admin = await Admin.findById(adminId).populate("company", "companyName email phone address website");

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (!admin.company || admin.company.length === 0) return res.status(404).json({ message: "No company assigned" });

    res.status(200).json({ success: true, adminName: admin.fullName, assignedCompanies: admin.company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const assignWorkRole = async (req, res) => {
  try {
    const { adminId, companyIds, workRoles, subRoles = [], points = [] } = req.body;
    console.log(subRoles);
    
    if (!adminId || !companyIds?.length || !workRoles?.length) {
      return res.status(400).json({
        message: "adminId, companyIds (array), and workRoles (array) are required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Fetch roles from DB
    const roleDocs = await Role.find({ role: { $in: workRoles } });
    if (!roleDocs.length) {
      return res.status(404).json({ message: "No valid roles found" });
    }

    // Process each role
    for (const roleDoc of roleDocs) {
      // Get all valid subRole _ids for THIS specific role (embedded subdocuments)
      const allowedSubRoleIds = (roleDoc.subRole || []).map(sub => sub._id.toString());

      // Filter subRoles: only keep those that belong to THIS role
      const filteredSubRoles = subRoles.filter(subId => {
        console.log(subId);
        
        const subIdStr = subId.toString();
        return allowedSubRoleIds.includes(subIdStr);
      });

      console.log(`Role: ${roleDoc.role}`);
      console.log(`Allowed SubRole IDs:`, allowedSubRoleIds);
      console.log(`Received SubRole IDs:`, subRoles.map(s => s.toString()));
      console.log(`Filtered SubRole IDs:`, filteredSubRoles.map(s => s.toString()));

      // Check if this role is already assigned to any of these companies
      const existingIndex = admin.assignedRoles.findIndex(existing =>
        existing.roleId.toString() === roleDoc._id.toString() &&
        existing.companyIds.some(c => companyIds.includes(c.toString()))
      );

      if (existingIndex !== -1) {
        // Update existing assignment
        // 🔹 MERGE subRoles instead of replacing - keep existing and add new ones
        const existingSubRoles = admin.assignedRoles[existingIndex].subRoles.map(sr => sr.toString());
        const newSubRoles = filteredSubRoles.filter(sr => !existingSubRoles.includes(sr.toString()));
        
        if (newSubRoles.length > 0) {
          admin.assignedRoles[existingIndex].subRoles.push(...newSubRoles);
        }
        
        // 🔹 MERGE points instead of replacing - add new points and avoid duplicates
        const existingPoints = admin.assignedRoles[existingIndex].points || [];
        const newPoints = points.filter(p => !existingPoints.includes(p));
        
        if (newPoints.length > 0) {
          admin.assignedRoles[existingIndex].points = [...existingPoints, ...newPoints];
        }
        
        // Merge company IDs (avoid duplicates)
        const existingCompanyIds = admin.assignedRoles[existingIndex].companyIds.map(c => c.toString());
        const newCompanyIds = companyIds.filter(c => !existingCompanyIds.includes(c.toString()));
        
        if (newCompanyIds.length > 0) {
          admin.assignedRoles[existingIndex].companyIds.push(...newCompanyIds);
        }
      } else {
        // Create new assignment with filtered subRoles for this specific role
        admin.assignedRoles.push({
          roleId: roleDoc._id,
          companyIds,
          subRoles: filteredSubRoles, // Only subRoles that belong to this role
          points,
        });
      }
    }

    await admin.save();

    // Populate the response for better readability
    await admin.populate([
      {
        path: "assignedRoles.roleId",
        select: "role subRole"
      },
      {
        path: "assignedRoles.companyIds",
        select: "companyName email"
      }
    ]);

    return res.status(200).json({
      message: "Roles assigned successfully",
      assignedRoles: admin.assignedRoles,
    });
  } catch (error) {
    console.error("Error assigning work role:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// -------------------- Get All Assigned Roles --------------------
export const getAssignedRoles = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("fullName assignedRoles")
      .populate({
        path: "assignedRoles.roleId",
        select: "role subRole",
        populate: { path: "subRole", select: "name description" }
      })
      .populate("assignedRoles.companyIds", "companyName email");

    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Get Assigned Roles by Admin & Company --------------------
export const getAssignedRolesByAdminAndCompany = async (req, res) => {
  try {
    const { adminId, companyId } = req.params;
    if (!adminId || !companyId) return res.status(400).json({ message: "Admin ID and Company ID are required" });

    const admin = await Admin.findById(adminId)
      .populate({
        path: "assignedRoles.roleId",
        select: "role subRole",
      })
      .populate("assignedRoles.companyIds", "companyName email");

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const rolesForCompany = admin.assignedRoles.filter(role =>
      role.companyIds.some(c => c._id.toString() === companyId)
    );

    // Enrich assigned roles with actual subRole names
    const enrichedRoles = await Promise.all(
      rolesForCompany.map(async (role) => {
        // Fetch subRole names from SubRole collection
        let subRoles = [];
        try {
          // Use role.subRoles (assigned subRoles), NOT role.roleId.subRole (all subRoles)
          if (Array.isArray(role.subRoles) && role.subRoles.length) {
            const subRoleDocs = await SubRole.find({ _id: { $in: role.subRoles } }).lean();
            
            // Create a map for easy lookup
            const map = {};
            subRoleDocs.forEach(sr => {
              map[sr._id.toString()] = sr.subRoleName;
            });

            // Map subRole IDs to their names
            subRoles = role.subRoles.map((id) => ({
              _id: id,
              subRoleName: map[id.toString()] || "Unknown Sub-role",
            }));
          }
        } catch (e) {
          console.error("Error fetching subRole names:", e);
          subRoles = (role.subRoles || []).map((id) => ({
            _id: id,
            subRoleName: "Unknown Sub-role",
          }));
        }

        return {
          roleName: role.roleId?.role || "Unknown",
          subRoles,
          points: role.points || [],
        };
      })
    );

    res.status(200).json({
      success: true,
      adminName: admin.fullName,
      companyId,
      assignedRoles: enrichedRoles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- Leave Management --------------------
export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId", "fullName email").sort({ appliedAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching leave requests", error: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminRemark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const leave = await Leave.findByIdAndUpdate(leaveId, { status, adminRemark }, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating leave", error: error.message });
  }
};


export const getAdminAssignedRolesById = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId)
      .select("fullName assignedRoles")
      .populate({
        path: "assignedRoles.roleId",
        select: "role subRole",
        populate: {
          path: "subRole",
          select: "subRoleName points"
        }
      })
      .populate({
        path: "assignedRoles.companyIds",
        select: "companyName"
      })
      .populate({
        path: "assignedRoles.subRoles",
        select: "subRoleName points"
      });
      console.log(admin.assignedRoles);
      
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ admin });

  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ message: "Server error fetching admin details" });
  }
};


export const getSubRoleName = async (req, res) => {
  try {
    const { subRoleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subRoleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subRole ID format",
      });
    }

    // Find a role document containing that subRole
    const role = await Role.findOne({ "subRole._id": subRoleId });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "SubRole not found in any Role",
      });
    }

    // Extract that subRole’s name
    const subRole = role.subRole.find(
      (s) => s._id.toString() === subRoleId
    );

    res.status(200).json({
      success: true,
      subRoleName: subRole.subRoleName,
    });
  } catch (error) {
    console.error("Error fetching subRole name:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching SubRole name",
      error: error.message,
    });
  }
};



// ==================== DELETE ASSIGNED ROLE ====================
export const deleteAssignedRole = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { roleId } = req.body;

    if (!adminId || !roleId) {
      return res.status(400).json({
        message: "Admin ID and Role ID are required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Find and remove the assigned role
    const initialLength = admin.assignedRoles.length;
    admin.assignedRoles = admin.assignedRoles.filter(
      (role) => role.roleId.toString() !== roleId
    );

    if (admin.assignedRoles.length === initialLength) {
      return res.status(404).json({
        message: "Assigned role not found for this admin",
      });
    }

    await admin.save();

    // Populate response
    await admin.populate([
      {
        path: "assignedRoles.roleId",
        select: "role subRole",
      },
      {
        path: "assignedRoles.companyIds",
        select: "companyName email",
      },
      {
        path: "assignedRoles.subRoles",
        select: "subRoleName points",
      },
    ]);

    res.status(200).json({
      message: "Role deleted successfully",
      assignedRoles: admin.assignedRoles,
    });
  } catch (error) {
    console.error("Error deleting assigned role:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== DELETE SUB-ROLE FROM ASSIGNED ROLE ====================
export const deleteSubRoleFromAssignedRole = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { roleId, subRoleId } = req.body;
    console.log(roleId);
    
    if (!adminId || !roleId || !subRoleId) {
      return res.status(400).json({
        message: "Admin ID, Role ID, and Sub-Role ID are required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Find the assigned role
    const assignedRoleIndex = admin.assignedRoles.findIndex(
      
      (role) => role.roleId.toString() === roleId
    );

    if (assignedRoleIndex === -1) {
      return res.status(404).json({
        message: "Assigned role not found",
      });
    }

    const assignedRole = admin.assignedRoles[assignedRoleIndex];
    console.log(assignedRole);
    console.log(subRoleId);
    
    // Check if sub-role exists
    const subRoleExists = assignedRole.subRoles.some(
      (sr) => sr.toString() === subRoleId.toString()
    );
    console.log(subRoleExists);
    
    if (!subRoleExists) {
      return res.status(404).json({
        message: "Sub-role not found in this assigned role",
      });
    }

    // Remove the sub-role
    assignedRole.subRoles = assignedRole.subRoles.filter(
      (sr) => sr.toString() !== subRoleId.toString()
    );

    // If no sub-roles left, optionally remove the entire assignment
    // Uncomment below if you want to auto-delete when no sub-roles remain
    // if (assignedRole.subRoles.length === 0) {
    //   admin.assignedRoles.splice(assignedRoleIndex, 1);
    // }

    await admin.save();

    // Populate response
    await admin.populate([
      {
        path: "assignedRoles.roleId",
        select: "role subRole",
      },
      {
        path: "assignedRoles.companyIds",
        select: "companyName email",
      },
    ]);

    res.status(200).json({
      message: "Sub-role deleted successfully",
      assignedRoles: admin.assignedRoles,
    });
  } catch (error) {
    console.error("Error deleting sub-role:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== DELETE POINT FROM SUB-ROLE ====================
export const deletePointFromSubRole = async (req, res) => {
  try {
    const { roleId, subRoleId, point, pointIndex } = req.body;
    const { adminId } = req.params; // router: /deletepoint/:adminId

    // If adminId looks like an Admin, perform assignment-level deletion
    if (adminId) {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        // fall through to legacy behavior below
        console.log(`Admin with id ${adminId} not found, falling back to canonical delete`);
      } else {
        if (!roleId || (!point && pointIndex === undefined)) {
          return res.status(400).json({ message: "roleId and point (or pointIndex) are required for admin-level deletion" });
        }

        // Normalize the point value: if point provided use it, otherwise derive from subRole and pointIndex
        let pointToRemove = point;
        if (!pointToRemove && subRoleId && pointIndex !== undefined) {
          const subRoleDoc = await SubRole.findById(subRoleId).lean();
          if (subRoleDoc && Array.isArray(subRoleDoc.points) && subRoleDoc.points[pointIndex] !== undefined) {
            pointToRemove = subRoleDoc.points[pointIndex];
          }
        }

        if (!pointToRemove) {
          return res.status(400).json({ message: "Unable to determine point to remove" });
        }

        // Remove point from matching assignedRoles for this admin
        let modified = false;
        admin.assignedRoles = admin.assignedRoles.map((ar) => {
          const arRoleId = ar.roleId && ar.roleId._id ? ar.roleId._id.toString() : (ar.roleId ? ar.roleId.toString() : null);
          if (arRoleId && arRoleId === roleId.toString()) {
            if (Array.isArray(ar.points) && ar.points.includes(pointToRemove)) {
              modified = true;
              return {
                ...ar.toObject ? ar.toObject() : ar,
                points: ar.points.filter((p) => p !== pointToRemove),
              };
            }
          }
          return ar;
        });

        if (modified) {
          await admin.save();
        }

        await admin.populate([
          { path: "assignedRoles.roleId", select: "role subRole" },
          { path: "assignedRoles.companyIds", select: "companyName" },
          { path: "assignedRoles.subRoles", select: "subRoleName points" }
        ]);

        return res.status(200).json({ message: "Point removed from admin assignment", assignedRoles: admin.assignedRoles });
      }
    }

    // Legacy / fallback: delete from canonical SubRole when no valid adminId found
    if (!subRoleId || pointIndex === undefined) {
      return res.status(400).json({ message: "Sub Role ID and Point Index are required for canonical deletion" });
    }

    const subRole = await SubRole.findById(subRoleId);
    if (!subRole) return res.status(404).json({ message: "subRole not found" });

    if (pointIndex < 0 || pointIndex >= subRole.points.length) {
      return res.status(400).json({ message: "Invalid point index" });
    }

    const removedPoint = subRole.points.splice(pointIndex, 1)[0];
    await subRole.save();

    // Also clean up any admin assignedRoles that referenced this canonical point
    try {
      const adminsToUpdate = await Admin.find({ "assignedRoles.points": removedPoint });
      for (const admin of adminsToUpdate) {
        let modified = false;
        admin.assignedRoles = admin.assignedRoles.map((ar) => {
          if (Array.isArray(ar.points) && ar.points.includes(removedPoint)) {
            modified = true;
            return {
              ...ar.toObject ? ar.toObject() : ar,
              points: ar.points.filter((p) => p !== removedPoint),
            };
          }
          return ar;
        });
        if (modified) await admin.save();
      }
    } catch (e) {
      console.error('Error updating admin assignedRoles after canonical point deletion:', e);
    }

    return res.status(200).json({ message: "Canonical point deleted", subRole: subRole });
  } catch (error) {
    console.error("Error deleting point:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


const getPopulatedSubRoles = async (roleId, subRoleIds) => {
  const roleDoc = await Role.findById(roleId).select("subRole");
  
  return subRoleIds.map(subRoleId => {
    const subRoleObj = roleDoc.subRole.find(
      sr => sr._id.toString() === subRoleId.toString()
    );
    return {
      _id: subRoleId,
      subRoleName: subRoleObj?.subRoleName || "Unknown",
      points: subRoleObj?.points || [],
    };
  });
};
