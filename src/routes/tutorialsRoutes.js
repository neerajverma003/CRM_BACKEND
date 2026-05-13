import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import Tutorial from "../models/tutorialsModel.js";
import Company from "../models/CompanyModel.js";
import Department from "../models/departmentModel.js";
import { uploadToS3 } from "../utils/s3Upload.js";
import s3 from "../../config/s3.js";

const router = express.Router();

// =====================
// POST /tutorials
// Upload a tutorial file to S3
// =====================
router.post("/", async (req, res) => {
  try {
    const { title, description, company, department, fileType } = req.body;
    const file = req.files ? req.files.file : null;

    if (!title || !company || !department || !fileType || !file) {
      return res.status(400).json({
        success: false,
        message: "Title, company, department, file type, and file are required",
      });
    }

    const companyDoc = await Company.findById(company);
    if (!companyDoc) return res.status(404).json({ success: false, message: "Company not found" });

    const depDoc = await Department.findById(department);
    if (!depDoc) return res.status(404).json({ success: false, message: "Department not found" });

    // S3 Upload
    const companyName = companyDoc.companyName.toLowerCase().replace(/\s+/g, "_");
    const departmentName = depDoc.dep.toLowerCase().replace(/\s+/g, "_");
    const folderPath = `tutorials/${companyName}/${departmentName}`;

    const uploadResult = await uploadToS3(file, file.name, folderPath, file.mimetype);

    const tutorial = await Tutorial.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      fileType,
      company,
      department,
      fileUrl: uploadResult.url,
      key: uploadResult.key,
      originalName: file.name,
    });

    await Company.findByIdAndUpdate(company, { $push: { tutorials: tutorial._id } });

    res.status(201).json({
      success: true,
      message: "Tutorial uploaded successfully",
      data: tutorial,
    });
  } catch (err) {
    console.error("Tutorial upload error:", err);
    res.status(500).json({ success: false, message: "Server error during file upload", error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const tutorials = await Tutorial.find()
      .populate("company", "companyName")
      .populate("department", "dep")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tutorials.length, data: tutorials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching tutorials" });
  }
});

router.get("/company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const tutorials = await Tutorial.find({ company: companyId })
      .populate("company", "companyName")
      .populate("department", "dep")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tutorials.length, data: tutorials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching tutorials" });
  }
});

router.get("/preview/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) return res.status(404).json({ success: false, message: "Tutorial not found" });

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: tutorial.key,
    });

    const s3Response = await s3.send(command);
    
    // Set content type and other headers
    res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', s3Response.ContentLength);
    
    // Stream the body to the response
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ success: false, message: "Error generating preview" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findByIdAndDelete(id);
    if (!tutorial) return res.status(404).json({ success: false, message: "Tutorial not found" });

    await Company.findByIdAndUpdate(tutorial.company, { $pull: { tutorials: id } });
    res.status(200).json({ success: true, message: "Tutorial deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error deleting tutorial" });
  }
});

export default router;