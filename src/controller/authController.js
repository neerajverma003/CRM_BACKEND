// // controllers/authController.js
// import jwt from "jsonwebtoken";
// import bcrypt from 'bcrypt';
// import SuperAdmin from "../models/SuperAdminModel.js";
// import Admin from "../models/Adminmodel.js";
// import Employee from "../models/employeeModel.js";

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     let Model;
//     if (role === "superAdmin") Model = SuperAdmin;
//     else if (role === "admin") Model = Admin;
//     else if (role === "employee") Model = Employee;
//     else return res.status(400).json({ message: "Invalid role" });

//     const user = await Model.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log(isMatch);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//       const token = jwt.sign(
//       { id: user._id, role },
//       process.env.JWT,
//       console.log(process.env.JWT),  
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         username: user.fullName,
//         role,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import SuperAdmin from "../models/SuperAdminModel.js";
import Admin from "../models/Adminmodel.js";
import Employee from "../models/employeeModel.js";

const resolveRole = (role = "") => {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === "superadmin") {
    return { Model: SuperAdmin, roleKey: "superAdmin" };
  }
  if (normalizedRole === "admin") {
    return { Model: Admin, roleKey: "admin" };
  }
  if (normalizedRole === "employee") {
    return { Model: Employee, roleKey: "employee" };
  }

  return { Model: null, roleKey: null };
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const { Model, roleKey } = resolveRole(role || "");
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, role: roleKey };

    if (roleKey === "employee" || roleKey === "admin") {
      payload.companyId = user.company;
    }

    const token = jwt.sign(payload, process.env.JWT, { expiresIn: "1d" });

    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.fullName,
      role: roleKey,
    };

    if (roleKey === "employee" || roleKey === "admin") {
      userResponse.companyId = user.company;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, role, currentPassword, newPassword } = req.body;

    if (!userId || !role || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long." });
    }

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from the current password." });
    }

    const { Model } = resolveRole(role || "");
    if (!Model) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to update password. Please try again." });
  }
};
