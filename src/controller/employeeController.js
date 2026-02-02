// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
// import Role from "../models/roleModel.js"
// import Employee from "../models/employeeModel.js";
// import Leave from "../models/LeaveModel.js";
// import Company from "../models/CompanyModel.js"
// import Designation from "../models/designationModel.js";




// export const getAllBDEEmployees = async (req, res) => {
//   try {
//     // Populate designation and filter employees with designation title "BDE"
//     const employees = await Employee.find()
//       .populate({
//         path: "designation",
//         select: "title _id", // Only fetch title and _id
//       });

//     // Filter employees whose designation title is "BDE"
//     const bdeEmployees = employees.filter(
//       (emp) => emp.designation && emp.designation.title === "BDE"
//     );

//     res.status(200).json({
//       success: true,
//       employees: bdeEmployees,
//       message: "BDE employees fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error fetching BDE employees:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };





// export const AddEmployee = async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       phone,
//       officialNo,
//       emergencyNo,
//       department,
//       designation,
//       company,
//       password,
//       role,
//       salary,
//       accountActive = true,
//     } = req.body;

//     // 1️⃣ All roles must have these
//     if (
//       !fullName ||
//       !email ||
//       !phone ||
//       !password ||
//       !officialNo ||
//       !emergencyNo ||
//       !role
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     // 2️⃣ Employee-specific required fields
//     if (role === "Employee") {
//       if (!company) {
//         return res.status(400).json({
//           success: false,
//           message: "Company is required for Employee",
//         });
//       }

//       if (!mongoose.Types.ObjectId.isValid(company)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid company ID",
//         });
//       }

//       if (!department) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Department is required" });
//       }

//       if (!designation) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Designation is required" });
//       }
//     }

//     // 3️⃣ Admin role → these values become NULL (optional)
//     const companyValue =
//       role === "Admin" || role === "superadmin" ? null : company;

//     const departmentValue =
//       role === "Admin" || role === "superadmin" ? null : department;

//     const designationValue =
//       role === "Admin" || role === "superadmin" ? null : designation;

//     // 4️⃣ Check duplicates
//     const existingUser = await Employee.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Employee already exists with this email or phone",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new Employee({
//       fullName,
//       email,
//       phone,
//       officialNo,
//       emergencyNo,
//       role,
//       password: hashedPassword,
//       accountActive,
//       salary: salary || 0,
//       company: companyValue,
//       department: departmentValue,
//       designation: designationValue,
//     });

//     await newUser.save();

//     res.status(201).json({
//       success: true,
//       message: "Employee added successfully",
//       employee: newUser,
//     });
//   } catch (error) {
//     console.error("AddEmployee Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// /* ===========================
//       GET ALL EMPLOYEES
// =========================== */
// // export const getAllEmployee = async (req, res) => {
// //   try {
// //     const employees = await Employee.find()
// //       .populate("company", "name")
// //       .select("-password"); // Hide sensitive data

// //     return res.status(200).json({
// //       success: true,
// //       message: "Employees fetched successfully",
// //       employees,
// //     });
// //   } catch (error) {
// //     console.error("Error in getAllEmployee:", error);
// //     return res.status(500).json({ message: "Server error", error: error.message });
// //   } 
// // };


// export const getAllEmployee = async (req, res) => {
//   try {
//     const employees = await Employee.find()
//       .populate("company", "companyName")       // fetch company name
//       .populate("designation", "designation")   // fetch designation title
//       .populate("department", "dep")           // fetch department name
//       .populate("destinations", "destination") // fetch assigned destinations
//       .select("-password");                     // hide sensitive data

//     return res.status(200).json({
//       success: true,
//       message: "Employees fetched successfully",
//       employees,
//     });
//   } catch (error) {
//     console.error("Error in getAllEmployee:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// /* ===========================
//       DELETE EMPLOYEE
// =========================== */
// export const deleteEmployee = async (req, res) => {
//   try {
//     // Check if user is superAdmin
//     if (!req.user || req.user.role !== "superAdmin") {
//       return res.status(403).json({ message: "Only superAdmin can delete employees." });
//     }

//     const { employeeId } = req.params;

//     const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
//     if (!deletedEmployee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Employee deleted successfully",
//       deletedEmployee,
//     });
//   } catch (error) {
//     console.error("Error deleting employee:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /* ===========================
//       EDIT EMPLOYEE (ADMIN)
// =========================== */
// export const editEmployee = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const updates = req.body;

//     // --- Whitelisted fields only ---
//     const allowedFields = [
//       "fullName",
//       "email",
//       "phone",
//       "department",
//       "designation",
//       "company",
//       "role",
//       "salary",
//       "accountActive",
//       "lateCount",
//       "totalLateDays",
//       "totalLateMinutes",
//       "halfDays",
//     ];

//     const filteredUpdates = {};
//     Object.keys(updates).forEach((key) => {
//       if (allowedFields.includes(key)) filteredUpdates[key] = updates[key];
//     });

//     // --- Handle password update (if admin wants to reset it) ---
//     if (updates.password) {
//       filteredUpdates.password = await bcrypt.hash(updates.password, 10);
//     }

//     const employee = await Employee.findByIdAndUpdate(employeeId, filteredUpdates, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Employee updated successfully",
//       employee,
//     });
//   } catch (error) {
//     console.error("Error updating employee:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /* ===========================
//       GET SINGLE EMPLOYEE
// =========================== */
// export const getEmployee = async (req, res) => {
//   try {
//     const { empId } = req.params;
//     if (!empId) {
//       return res.status(400).json({ message: "Employee ID is required" });
//     }

//     const employee = await Employee.findById(empId)
//       .populate("company", "companyName")
//       .populate("designation", "designation") 
//       .populate("department", "dep") 
//       .select("-password");

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Employee fetched successfully",
//       employee,
//     });
//   } catch (error) {
//     console.error("Error fetching employee:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// /* ===========================
//       APPLY LEAVE
// =========================== */
// export const applyLeave = async (req, res) => {
//   try {
//     const { employeeId, companyId, leaveType, startDate, endDate, reason } = req.body;

//     if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const leave = new Leave({
//       employeeId,
//       companyId,
//       leaveType,
//       startDate,
//       endDate,
//       reason,
//     });

//     await leave.save();
//     res.status(201).json({
//       success: true,
//       message: "Leave applied successfully",
//       leave,
//     });
//   } catch (error) {
//     console.error("Error applying leave:", error);
//     res.status(500).json({ message: "Error applying leave", error: error.message });
//   }
// };

// /* ===========================
//       GET EMPLOYEE LEAVES
// =========================== */
// export const getMyLeaves = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     //  FIXED: use "companyId" not "company"
//     const leaves = await Leave.find({ employeeId })
//       .populate("companyId", "name") //  Correct field name
//       .sort({ appliedAt: -1 });

//     if (!leaves || leaves.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No leaves found for this employee",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Leaves fetched successfully",
//       leaves,
//     });
//   } catch (error) {
//     console.error(" Error fetching leaves:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching leaves",
//       error: error.message,
//     });
//   }
// };


// export const getAssignedRoles = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     // Convert string to ObjectId
//     if (!mongoose.Types.ObjectId.isValid(employeeId)) {
//       return res.status(400).json({ success: false, message: "Invalid employee ID" });
//     }

//     const assigned = await Employee.findById(employeeId).lean();

//     if (!assigned) {
//       return res.json({ success: true, assignedRoles: [] });
//     }

//     const assignedRoles = assigned.assignedRoles || [];

//     // Enrich assignedRoles with role names and subRole names for frontend
//     const enriched = await Promise.all(
//       assignedRoles.map(async (ar) => {
//         // Resolve role names
//         let roleNames = [];
//         try {
//           if (Array.isArray(ar.roleId) && ar.roleId.length) {
//             const rolesDocs = await Role.find({ _id: { $in: ar.roleId } }).select("role");
//             roleNames = rolesDocs.map((d) => d.role);
//           }
//         } catch (e) {
//           roleNames = [];
//         }

//         // Resolve subRole names
//         let subRoles = [];
//         try {
//           if (Array.isArray(ar.subRoles) && ar.subRoles.length) {
//             // Find roles that contain these subRole ids
//             const allRoles = await Role.find({ 'subRole._id': { $in: ar.subRoles } }).lean();
//             // Build a map of subRoleId -> name
//             const map = {};
//             for (const r of allRoles) {
//               for (const s of r.subRole || []) {
//                 map[s._id.toString()] = s.subRoleName;
//               }
//             }

//             subRoles = ar.subRoles.map((sid) => ({ _id: sid, name: map[sid.toString()] || sid }));
//           }
//         } catch (e) {
//           subRoles = (ar.subRoles || []).map((sid) => ({ _id: sid, name: sid }));
//         }

//         return {
//           ...ar,
//           roleNames,
//           subRoles,
//         };
//       })
//     );

//     return res.json({ success: true, assignedRoles: enriched });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error fetching roles" });
//   }
// };




// export const assignCompany = async (req, res) => {
//   try {
//     const { employeeId, companyIds } = req.body;

//     if (!employeeId || !companyIds || !Array.isArray(companyIds)) {
//       return res.status(400).json({ message: "adminId and companyIds are required and must be an array" });
//     }

//     const admin = await Employee.findByIdAndUpdate(employeeId, { company: companyIds }, { new: true })
//       .populate("company", "companyName email phone address website");

//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     await Company.updateMany({ _id: { $in: companyIds } }, { $addToSet: { admin: employeeId } });
//     console.log(admin)
//     res.status(200).json({ message: "Companies assigned successfully", admin });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// const { Types } = mongoose;

// export const assignWorkRole = async (req, res) => {
//   try {
//     const { employeeId, companyIds, workRoles, subRoles = [], points = [] } = req.body;

//     // 1️ Validation
//     if (!employeeId || !companyIds?.length || !workRoles?.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee, company, and at least one role are required",
//       });
//     }

//     // 2️ Fetch employee
//     const employee = await Employee.findById(employeeId);
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     // 3️ Convert all IDs to ObjectId
//     const companyObjectIds = companyIds.map(c => new Types.ObjectId(c));
//     const workRoleObjectIds = workRoles.map(r => new Types.ObjectId(r));
//     const subRoleObjectIds = subRoles.map(s => new Types.ObjectId(s));

//     // 4️ Check for duplicates in assignedRoles
//     const isDuplicate = employee.assignedRoles.some((ar) => {
//       const roleMatch = ar.roleId.some(r => workRoleObjectIds.includes(r));
//       const companyMatch = ar.companyIds.some(c => companyObjectIds.includes(c));
//       const subRoleMatch = ar.subRoles.some(s => subRoleObjectIds.includes(s));
//       const pointsMatch = points.every(p => ar.points.includes(p));
//       return roleMatch && companyMatch && subRoleMatch && pointsMatch;
//     });

//     if (isDuplicate) {
//       return res.status(400).json({
//         success: false,
//         message: "This role assignment already exists for the employee",
//       });
//     }

//     // 5️ Push new assignedRole
//     employee.assignedRoles.push({
//       roleId: workRoleObjectIds,
//       companyIds: companyObjectIds,
//       subRoles: subRoleObjectIds,
//       points: Array.from(new Set(points)), // remove duplicate points
//     });

//     await employee.save();

//     return res.status(200).json({
//       success: true,
//       message: "Roles, subRoles, and points assigned successfully",
//       data: employee,
//     });

//   } catch (error) {
//     console.error(" Error in assignWorkRole:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


// export const getCompanyByEmployeeId = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId) 
//       return res.status(400).json({ message: "Employee ID is required" });

//     // Fetch employee and populate assigned companies
//     const employee = await Employee.findById(employeeId).populate(
//       "company",
//       "companyName email phone address website"
//     );

//     if (!employee) 
//       return res.status(404).json({ message: "Employee not found" });

//     if (!employee.company || employee.company.length === 0) 
//       return res.status(404).json({ message: "No company assigned" });

//     res.status(200).json({
//       success: true,
//       employeeName: employee.fullName,
//       assignedCompanies: employee.company,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



// export const getDepartments = async (req, res) => {
//   try {
//     // Fetch only the 'department' field
//     const departments = await Employee.find({}, { department: 1, _id: 0 });

//     res.status(200).json({
//       success: true,
//       data: departments,
//     });
//   } catch (error) {
//     console.error("Error fetching departments:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching departments",
//     });
//   }
// };


// export const getSubRoleName = async (req, res) => {
//   try {
//     const { subRoleId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(subRoleId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid subRole ID format",
//       });
//     }

//     // Find a role document containing that subRole
//     const role = await Role.findOne({ "subRole._id": subRoleId });
//     if (!role) {
//       return res.status(404).json({
//         success: false,
//         message: "SubRole not found in any Role",
//       });
//     }

//     // Extract that subRole’s name
//     const subRole = role.subRole.find(
//       (s) => s._id.toString() === subRoleId
//     );

//     res.status(200).json({
//       success: true,
//       subRoleName: subRole.subRoleName,
//     });
//   } catch (error) {
//     console.error("Error fetching subRole name:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching SubRole name",
//       error: error.message,
//     });
//   }
// };



// export const getEmployeeById = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid employee ID is required",
//       });
//     }

//     const employee = await Employee.findById(employeeId)
//       .populate("company", "companyName email phone address website")
//       .populate("designation", "title")
//       .populate("department", "dep")
//       .populate("destinations", "destination") // populate destination field
//       .select("-password");

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Employee fetched successfully",
//       employee,
//     });
//   } catch (error) {
//     console.error("Error fetching employee by ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };




import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Role from "../models/roleModel.js"
import Employee from "../models/employeeModel.js";
import Leave from "../models/LeaveModel.js";
import Company from "../models/CompanyModel.js"
import Designation from "../models/designationModel.js";
import SubRole from "../models/subRoleModel.js";
import EmployeeRole from "../models/employeeRoleModel.js";




export const getAllBDEEmployees = async (req, res) => {
  try {
    // Populate designation and filter employees with designation title "BDE"
    const employees = await Employee.find()
      .populate({
        path: "designation",
        select: "title _id", // Only fetch title and _id
      });

    // Filter employees whose designation title is "BDE"
    const bdeEmployees = employees.filter(
      (emp) => emp.designation && emp.designation.title === "BDE"
    );

    res.status(200).json({
      success: true,
      employees: bdeEmployees,
      message: "BDE employees fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching BDE employees:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





export const AddEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      officialNo,
      emergencyNo,
      department,
      designation,
      company,
      password,
      role,
      salary,
      accountActive = true,
    } = req.body;

    // 1️⃣ All roles must have these
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !officialNo ||
      !emergencyNo ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 2️⃣ Employee-specific required fields
    if (role === "Employee") {
      if (!company) {
        return res.status(400).json({
          success: false,
          message: "Company is required for Employee",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(company)) {
        return res.status(400).json({
          success: false,
          message: "Invalid company ID",
        });
      }

      if (!department) {
        return res
          .status(400)
          .json({ success: false, message: "Department is required" });
      }

      if (!designation) {
        return res
          .status(400)
          .json({ success: false, message: "Designation is required" });
      }
    }

    // 3️⃣ Admin role → these values become NULL (optional)
    const companyValue =
      role === "Admin" || role === "superadmin" ? null : company;

    const departmentValue =
      role === "Admin" || role === "superadmin" ? null : department;

    const designationValue =
      role === "Admin" || role === "superadmin" ? null : designation;

    // 4️⃣ Check duplicates
    const existingUser = await Employee.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Employee already exists with this email or phone",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Employee({
      fullName,
      email,
      phone,
      officialNo,
      emergencyNo,
      role,
      password: hashedPassword,
      accountActive,
      salary: salary || 0,
      company: companyValue,
      department: departmentValue,
      designation: designationValue,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: newUser,
    });
  } catch (error) {
    console.error("AddEmployee Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


/* ===========================
      GET ALL EMPLOYEES
=========================== */
// export const getAllEmployee = async (req, res) => {
//   try {
//     const employees = await Employee.find()
//       .populate("company", "name")
//       .select("-password"); // Hide sensitive data

//     return res.status(200).json({
//       success: true,
//       message: "Employees fetched successfully",
//       employees,
//     });
//   } catch (error) {
//     console.error("Error in getAllEmployee:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   } 
// };


export const getAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("company", "companyName")       // fetch company name
      .populate("designation", "designation")   // fetch designation title
      .populate("department", "dep")           // fetch department name
      .populate("destinations", "destination") // fetch assigned destinations
      .select("-password");                     // hide sensitive data

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      employees,
    });
  } catch (error) {
    console.error("Error in getAllEmployee:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


/* ===========================
      DELETE EMPLOYEE
=========================== */
export const deleteEmployee = async (req, res) => {
  try {
    // Check if user is superAdmin
    if (!req.user || req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Only superAdmin can delete employees." });
    }

    const { employeeId } = req.params;

    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      deletedEmployee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
      EDIT EMPLOYEE (ADMIN)
=========================== */
export const editEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    // --- Whitelisted fields only ---
    const allowedFields = [
      "fullName",
      "email",
      "phone",
      "department",
      "designation",
      "company",
      "role",
      "salary",
      "accountActive",
      "lateCount",
      "totalLateDays",
      "totalLateMinutes",
      "halfDays",
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) filteredUpdates[key] = updates[key];
    });

    // --- Handle password update (if admin wants to reset it) ---
    if (updates.password) {
      filteredUpdates.password = await bcrypt.hash(updates.password, 10);
    }

    const employee = await Employee.findByIdAndUpdate(employeeId, filteredUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
      GET SINGLE EMPLOYEE
=========================== */
export const getEmployee = async (req, res) => {
  try {
    const { empId } = req.params;
    if (!empId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const employee = await Employee.findById(empId)
      .populate("company", "companyName")
      .populate("designation", "designation") 
      .populate("department", "dep") 
      .select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/* ===========================
      APPLY LEAVE
=========================== */
export const applyLeave = async (req, res) => {
  try {
    const { employeeId,appliedByModel, companyId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = new Leave({
      employeeId,
      appliedByModel,
      companyId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leave.save();
    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    console.error("Error applying leave:", error);
    res.status(500).json({ message: "Error applying leave", error: error.message });
  }
};

/* ===========================
      GET EMPLOYEE LEAVES
=========================== */
export const getMyLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;

    //  FIXED: use "companyId" not "company"
    const leaves = await Leave.find({ employeeId })
      .populate("companyId", "companyName") //  Correct field name
      .sort({ appliedAt: -1 });

    if (!leaves || leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leaves found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leaves fetched successfully",
      leaves,
    });
  } catch (error) {
    console.error(" Error fetching leaves:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaves",
      error: error.message,
    });
  }
};


export const getAssignedRoles = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Convert string to ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: "Invalid employee ID" });
    }

    const assigned = await Employee.findById(employeeId).lean();

    if (!assigned) {
      return res.json({ success: true, assignedRoles: [] });
    }

    const assignedRoles = assigned.assignedRoles || [];

    // Enrich assignedRoles with role names, canonical subRole names+points, and assigned points for frontend
    const enriched = await Promise.all(
      assignedRoles.map(async (ar) => {
        // 1️⃣ Fetch role names from roleId array (search in EmployeeRole collection)
        let roleNames = [];
        try {
          if (Array.isArray(ar.roleId) && ar.roleId.length) {
            const rolesDocs = await EmployeeRole.find({ _id: { $in: ar.roleId } }).select("role").lean();
            roleNames = rolesDocs.map((d) => d.role);
          }
        } catch (e) {
          console.error("Error fetching role names:", e);
          roleNames = [];
        }

        // 2️⃣ Fetch canonical subRole documents (to get subRoleName and their canonical points)
        let subRoles = [];
        try {
          if (Array.isArray(ar.subRoles) && ar.subRoles.length) {
            const subRoleDocs = await SubRole.find({ _id: { $in: ar.subRoles } }).lean();

            // Build map id -> { subRoleName, points }
            const map = {};
            subRoleDocs.forEach(sr => {
              map[sr._id.toString()] = { subRoleName: sr.subRoleName, points: sr.points || [] };
            });

            // Attach canonical points to each subRole
            subRoles = ar.subRoles.map((id) => {
              const key = id.toString();
              const info = map[key] || { subRoleName: "Unknown Sub-role", points: [] };
              return { _id: id, subRoleName: info.subRoleName, points: info.points };
            });
          }
        } catch (e) {
          console.error("Error fetching subRole docs:", e);
          subRoles = (ar.subRoles || []).map((id) => ({ _id: id, subRoleName: "Unknown Sub-role", points: [] }));
        }

        // 3️⃣ Build the final object: include assigned points at role-level (ar.points)
        return {
          ...ar,
          roleNames,
          subRoles,
          points: ar.points || [], // assigned points for this role assignment
        };
      })
    );

    return res.json({ success: true, assignedRoles: enriched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching roles" });
  }
};




export const assignCompany = async (req, res) => {
  try {
    const { employeeId, companyIds } = req.body;

    if (!employeeId || !companyIds || !Array.isArray(companyIds)) {
      return res.status(400).json({ message: "adminId and companyIds are required and must be an array" });
    }

    const admin = await Employee.findByIdAndUpdate(employeeId, { company: companyIds }, { new: true })
      .populate("company", "companyName email phone address website");

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await Company.updateMany({ _id: { $in: companyIds } }, { $addToSet: { admin: employeeId } });
    console.log(admin)
    res.status(200).json({ message: "Companies assigned successfully", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const { Types } = mongoose;

export const assignWorkRole = async (req, res) => {
  try {
    const { employeeId, companyIds, workRoles, subRoles = [], points = [] } = req.body;

    if (!employeeId || !companyIds?.length || !workRoles?.length) {
      return res.status(400).json({
        success: false,
        message: "employeeId, companyIds (array) and workRoles are required",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    // Normalize company IDs to ObjectId
    const companyObjectIds = companyIds.map(c => new Types.ObjectId(c));

    // Support both role names and role _id values from frontend
    // Search in EmployeeRole collection (for employee-specific roles)
    const isIdArray = Array.isArray(workRoles) && workRoles.every(w => mongoose.Types.ObjectId.isValid(w));
    const roleDocs = isIdArray
      ? await EmployeeRole.find({ _id: { $in: workRoles } })
      : await EmployeeRole.find({ role: { $in: workRoles } });

    if (!roleDocs.length) return res.status(404).json({ success: false, message: "No valid employee roles found" });

    // For each role, create or merge an assignedRoles entry (mirror admin logic)
    for (const roleDoc of roleDocs) {
      // Allowed subRole ids for this role
      const allowedSubRoleIds = (roleDoc.subRole || []).map(s => s.toString());

      // Keep only subRoles that belong to this role
      const filteredSubRoles = (subRoles || []).filter(sr => allowedSubRoleIds.includes(sr.toString()));

      // Find existing assignment for this role and overlapping companies
      const existingIndex = employee.assignedRoles.findIndex(existing => {
        const existingRoleIds = Array.isArray(existing.roleId)
          ? existing.roleId.map(r => r.toString())
          : [String(existing.roleId)];

        const roleMatch = existingRoleIds.includes(roleDoc._id.toString());
        const companyMatch = Array.isArray(existing.companyIds) && existing.companyIds.some(c =>
          companyObjectIds.some(co => co.toString() === c.toString())
        );

        return roleMatch && companyMatch;
      });

      if (existingIndex !== -1) {
        // Merge subRoles
        const existingSubRoles = (employee.assignedRoles[existingIndex].subRoles || []).map(s => s.toString());
        const toAddSub = filteredSubRoles.filter(s => !existingSubRoles.includes(s.toString()));
        if (toAddSub.length) employee.assignedRoles[existingIndex].subRoles.push(...toAddSub.map(s => new Types.ObjectId(s)));

        // Merge points
        const existingPoints = employee.assignedRoles[existingIndex].points || [];
        const newPoints = points.filter(p => !existingPoints.includes(p));
        if (newPoints.length) employee.assignedRoles[existingIndex].points = [...existingPoints, ...newPoints];

        // Merge companies
        const existingCompanyIds = (employee.assignedRoles[existingIndex].companyIds || []).map(c => c.toString());
        const newCompanyIds = companyObjectIds.filter(c => !existingCompanyIds.includes(c.toString()));
        if (newCompanyIds.length) employee.assignedRoles[existingIndex].companyIds.push(...newCompanyIds);
      } else {
        // Create new assignment entry for this specific role
        employee.assignedRoles.push({
          roleId: [roleDoc._id],
          companyIds: companyObjectIds,
          subRoles: filteredSubRoles.map(s => new Types.ObjectId(s)),
          points: Array.from(new Set(points || [])),
        });
      }
    }

    await employee.save();

    return res.status(200).json({ success: true, message: "Roles assigned successfully", assignedRoles: employee.assignedRoles });
  } catch (error) {
    console.error("Error in employee assignWorkRole:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


export const getCompanyByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) 
      return res.status(400).json({ message: "Employee ID is required" });

    // Fetch employee and populate assigned companies
    const employee = await Employee.findById(employeeId).populate(
      "company",
      "companyName email phone address website"
    );

    if (!employee) 
      return res.status(404).json({ message: "Employee not found" });

    if (!employee.company || employee.company.length === 0) 
      return res.status(404).json({ message: "No company assigned" });

    res.status(200).json({
      success: true,
      employeeName: employee.fullName,
      assignedCompanies: employee.company,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getDepartments = async (req, res) => {
  try {
    // Fetch only the 'department' field
    const departments = await Employee.find({}, { department: 1, _id: 0 });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching departments",
    });
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



export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Valid employee ID is required",
      });
    }

    const employee = await Employee.findById(employeeId)
      .populate("company", "companyName email phone address website")
      .populate("designation", "title")
      .populate("department", "dep")
      .populate("destinations", "destination") // populate destination field
      .select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};