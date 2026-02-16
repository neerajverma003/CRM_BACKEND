import EmployeeData from "../models/employeeDataModel.js";
import streamifier from "streamifier";
import { cloudinary } from "../../config/upload.js";

// Create new employee data
export const createEmployeeData = async (req, res) => {
  try {
    const {
      employeeName,
      fatherName,
      motherName,
      employeePhoneNumber,
      emergencyPhoneNumber,
      email,
      parentAddress,
      presentAddress,
      company,
      department,
      designation,
    } = req.body;

    // Validate required fields
    if (
      !employeeName ||
      !fatherName ||
      !motherName ||
      !employeePhoneNumber ||
      !emergencyPhoneNumber ||
      !email ||
      !parentAddress ||
      !presentAddress ||
      !company ||
      !department ||
      !designation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const employeeData = await EmployeeData.create({
      employeeName,
      fatherName,
      motherName,
      employeePhoneNumber,
      emergencyPhoneNumber,
      email,
      parentAddress,
      presentAddress,
      company,
      department,
      designation,
    });

    // Populate references before sending response
    await employeeData.populate("company department designation");

    res.status(201).json({
      success: true,
      message: "Employee data created successfully",
      data: employeeData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating employee data",
    });
  }
};

// Get all employee data with pagination and search
export const getAllEmployeeData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    let filter = {};

    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeePhoneNumber: { $regex: search, $options: "i" } },
        { presentAddress: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await EmployeeData.countDocuments(filter);

    const employeeDataList = await EmployeeData.find(filter)
      .populate("company", "companyName")
      .populate("department", "dep")
      .populate("designation", "designation")
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: employeeDataList,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching employee data",
    });
  }
};

// Get single employee data by ID
export const getEmployeeDataById = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeData = await EmployeeData.findById(id)
      .populate("company", "companyName")
      .populate("department", "dep")
      .populate("designation", "designation");

    if (!employeeData) {
      return res
        .status(404)
        .json({ success: false, message: "Employee data not found" });
    }

    res.status(200).json({
      success:true,
      data: employeeData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching employee data",
    });
  }
};

// Update employee data
export const updateEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee data ID is required" });
    }

    const updatedData = await EmployeeData.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("company", "companyName")
      .populate("department", "dep")
      .populate("designation", "designation");

    if (!updatedData) {
      return res
        .status(404)
        .json({ success: false, message: "Employee data not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating employee data",
    });
  }
};

// Delete employee data
export const deleteEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee data ID is required" });
    }

    const deletedData = await EmployeeData.findByIdAndDelete(id);

    if (!deletedData) {
      return res
        .status(404)
        .json({ success: false, message: "Employee data not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee data deleted successfully",
      data: deletedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting employee data",
    });
  }
};

// Upload employee documents (PDFs etc.)
export const uploadEmployeeDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Employee ID required" });
    }

    const employee = await EmployeeData.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const files = req.files || {};

    // Prepare Cloudinary folder based on employee name
    const sanitize = (str) =>
      String(str)
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-]/g, "_")
        .substring(0, 200);

    const folderBase = `EmployeeData/${sanitize(employee.employeeName)}/documents`;

    // Helper to upload a buffer to Cloudinary and return metadata
    const uploadBuffer = (buffer, filename) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderBase,
            resource_type: "auto",
            public_id: `${Date.now()}-${filename.split(".")[0]}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    // Single-file fields
    const singleFields = ["panCard", "aadharCard", "accountDetails", "pcc"];
    for (const field of singleFields) {
      if (files[field] && files[field][0]) {
        const file = files[field][0];
        const result = await uploadBuffer(file.buffer, file.originalname);
        employee.documents = employee.documents || {};
        employee.documents[field] = {
          url: result.secure_url || result.url,
          public_id: result.public_id,
          filename: file.originalname,
          uploadedAt: new Date(),
        };
      }
    }

    // Multi-file fields
    const multiFields = [
      { field: "educationQualifications", target: "educationQualifications" },
      { field: "offerLetters", target: "previousCompanyOfferLetters" },
      { field: "relievingLetters", target: "relievingLetters" },
    ];

    for (const map of multiFields) {
      const f = map.field;
      const target = map.target;
      if (files[f] && files[f].length > 0) {
        employee.documents = employee.documents || {};
        employee.documents[target] = employee.documents[target] || [];
        for (const file of files[f]) {
          const result = await uploadBuffer(file.buffer, file.originalname);
          employee.documents[target].push({
            url: result.secure_url || result.url,
            public_id: result.public_id,
            filename: file.originalname,
            uploadedAt: new Date(),
          });
        }
      }
    }

    await employee.save();

    const populated = await EmployeeData.findById(id)
      .populate("company", "companyName")
      .populate("department", "dep")
      .populate("designation", "designation");

    res.status(200).json({ success: true, message: "Documents uploaded", data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Error uploading documents" });
  }
};
