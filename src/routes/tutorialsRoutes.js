// import express from "express";
// import Tutorial from "../models/tutorialsModel.js";
// import Company from "../models/CompanyModel.js";
// import Department from "../models/departmentModel.js";
// import upload from "../../config/upload.js";

// const router = express.Router();

// // =====================
// // POST /tutorials
// // Upload a tutorial file
// // =====================
// router.post("/", upload.single("file"), async (req, res) => {
//   try {
//     const { title, company, department } = req.body;
//     const file = req.file;

//     if (!title || !company || !department || !file) {
//       return res.status(400).json({ message: "Title, company, department, and file are required" });
//     }

//     const depDoc = await Department.findById(department);
//     if (!depDoc) {
//       return res.status(400).json({ message: "Invalid department" });
//     }
//     if (String(depDoc.company) !== String(company)) {
//       return res.status(400).json({ message: "Department does not belong to the selected company" });
//     }

//     // Determine file type
//     const mimeType = file.mimetype.split("/")[0];
//     let fileType = "unknown";
//     if (mimeType === "image") fileType = "image";
//     else if (mimeType === "video") fileType = "video";
//     else if (file.mimetype === "application/pdf") fileType = "pdf";
//     else if (
//       file.mimetype ===
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation"
//     ) {
//       fileType = "ppt";
//     }

//     // Create tutorial in DB
//     const tutorial = await Tutorial.create({
//       title,
//       company,
//       fileUrl: file.path,
//       fileType,
//       department,
//       originalName: file.originalname,
//     });

//     // Associate tutorial with company
//     await Company.findByIdAndUpdate(company, { $push: { tutorials: tutorial._id } });

//     res.status(201).json(tutorial);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // =====================
// // GET /tutorials/all
// // Get all tutorials
// // =====================
// router.get("/all", async (req, res) => {
//   try {
//     const tutorials = await Tutorial.find()
//       .populate("company", "companyName")
//       .populate("department", "dep")
//       .sort({ createdAt: -1 });
//     res.status(200).json({ tutorials });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // =====================
// // GET /tutorials/company/:companyId
// // Get tutorials by company
// // =====================
// router.get("/company/:companyId", async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const { department } = req.query;
//     const query = { company: companyId };
//     if (department) query.department = department;
//     const tutorials = await Tutorial.find(query)
//       .sort({ createdAt: -1 })
//       .populate("company", "companyName")
//       .populate("department", "dep");
//     res.status(200).json({ tutorials });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// export default router;


import express from "express";
import multer from "multer";
import cloudinary from "../../config/cloudinary.js";
import Tutorial from "../models/tutorialsModel.js";
import Company from "../models/CompanyModel.js";
import Department from "../models/departmentModel.js";

const router = express.Router();

// Configure multer for memory storage (file will be uploaded to Cloudinary in the handler)
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Log all incoming files for debugging
    console.log(`[Multer] Received file: ${file.originalname}, MIME: ${file.mimetype}`);
    // Accept all file types - we'll validate by extension and fileType in the handler
    cb(null, true);
  },
});

// =====================
// POST /tutorials
// Upload a tutorial file to Cloudinary
// =====================
router.post("/", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error
      console.error("[Multer Error]", err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      // Custom error from fileFilter
      console.error("[FileFilter Error]", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid file type",
      });
    }
    // File upload successful, proceed to handler
    next();
  });
}, async (req, res) => {
  try {
    const { title, description, company, department, fileType } = req.body;
    const file = req.file;

    // ===== Validation =====
    if (!title || !company || !department || !fileType || !file) {
      return res.status(400).json({
        success: false,
        message:
          "Title, company, department, file type, and file are required",
      });
    }

    // Validate title length
    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 3 characters long",
      });
    }

    // Validate fileType enum
    if (!["image", "video", "pdf", "ppt"].includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Must be: image, video, pdf, or ppt",
      });
    }

    // Validate file extension matches fileType
    const fileName = file.originalname.toLowerCase();
    const allowedExtensions = {
      image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
      video: [".mp4", ".mov", ".avi", ".mpeg", ".webm", ".3gp"],
      pdf: [".pdf"],
      ppt: [".ppt", ".pptx"],
    };
    const fileExt = fileName.substring(fileName.lastIndexOf("."));
    const validExts = allowedExtensions[fileType];
    if (!validExts || !validExts.includes(fileExt)) {
      console.warn(
        `[File Validation] Rejected: ${fileName} with fileType=${fileType}. Valid extensions: ${validExts.join(", ")}`
      );
      return res.status(400).json({
        success: false,
        message: `File extension ${fileExt} does not match selected file type (${fileType}). Valid extensions: ${validExts.join(", ")}`,
      });
    }

    // Validate company exists
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Validate department exists and belongs to company
    const depDoc = await Department.findById(department);
    if (!depDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (String(depDoc.company) !== String(company)) {
      return res.status(400).json({
        success: false,
        message: "Department does not belong to the selected company",
      });
    }

    // ===== Cloudinary Upload =====
    // Create folder structure: company_name/department_name
    const companyName = companyDoc.companyName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const departmentName = depDoc.dep
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const folderPath = `tutorials/${companyName}/${departmentName}`;

    // Upload file to Cloudinary using buffer
    // Choose resource type that matches the fileType to avoid corruption (PDFs/PPTs -> 'raw')
    const resourceType = fileType === 'video' ? 'video' : (fileType === 'image' ? 'image' : 'raw');

    // --- Quick buffer inspection for PDFs ---
    const isPdf = String(fileType).toLowerCase() === 'pdf';
    try {
      if (isPdf) {
        const header = file.buffer && file.buffer.slice(0, 8).toString('utf8');
        console.log('[Tutorial Upload] PDF header (first 8 chars):', header);
        if (!header || !header.startsWith('%PDF')) {
          console.warn('[Tutorial Upload] Warning: uploaded buffer does not start with %PDF header');
        }
      }
    } catch (e) {
      console.warn('[Tutorial Upload] Failed to inspect buffer header', e.message);
    }

    // Primary upload via upload_stream
    let uploadResult = null;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
            use_filename: true,
            unique_filename: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (uploadErr) {
      console.warn('[Tutorial Upload] upload_stream failed:', uploadErr && uploadErr.message);
      uploadResult = null;
    }

    // If result looks invalid (missing URL/bytes or wrong resource_type for PDFs), attempt retry using base64 upload
    const needsRetry = !uploadResult || !uploadResult.secure_url || (isPdf && (!uploadResult.bytes || uploadResult.bytes === 0 || uploadResult.resource_type !== 'raw'));
    if (needsRetry) {
      console.warn('[Tutorial Upload] Upload looks invalid or failed, attempting fallback upload via data URI...');
      try {
        if (isPdf) {
          const dataUri = `data:application/pdf;base64,${file.buffer.toString('base64')}`;
          // Use uploader.upload which accepts data URI; explicitly set resource_type 'raw'
          const retry = await cloudinary.uploader.upload(dataUri, {
            folder: folderPath,
            resource_type: 'raw',
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}-retry`,
            use_filename: true,
            unique_filename: false,
          });
          uploadResult = retry;
          console.log('[Tutorial Upload] Retry upload result:', { public_id: retry.public_id, secure_url: retry.secure_url, resource_type: retry.resource_type, bytes: retry.bytes });
        } else {
          // For non-PDFs we could also retry with uploader.upload (optional)
          const retry = await cloudinary.uploader.upload_stream({ folder: folderPath, resource_type: resourceType }, () => {});
          // no-op; skipping detailed retry for non-pdfs for now
        }
      } catch (retryErr) {
        console.error('[Tutorial Upload] Retry upload failed:', retryErr && retryErr.message);
      }
    }

    // Log important upload details for debugging
    console.log('[Tutorial Upload] Cloudinary result:', {
      public_id: uploadResult && uploadResult.public_id,
      resource_type: uploadResult && uploadResult.resource_type,
      secure_url: uploadResult && uploadResult.secure_url,
      bytes: uploadResult && uploadResult.bytes,
    });

    // ===== Create Tutorial Document =====
    const tutorial = await Tutorial.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      fileType,
      company,
      department,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      originalName: file.originalname,
    });

    // Populate references for response - use findById instead of chaining on saved doc
    const populatedTutorial = await Tutorial.findById(tutorial._id)
      .populate("company", "companyName")
      .populate("department", "dep");

    // Update company with tutorial reference
    await Company.findByIdAndUpdate(company, {
      $push: { tutorials: tutorial._id },
    });

    res.status(201).json({
      success: true,
      message: "Tutorial uploaded successfully",
      data: populatedTutorial,
    });
  } catch (err) {
    console.error("Tutorial upload error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during file upload",
      error: err.message,
    });
  }
});

// =====================
// GET /tutorials/all
// Get all tutorials
// =====================
router.get("/all", async (req, res) => {
  try {
    const tutorials = await Tutorial.find()
      .populate("company", "companyName")
      .populate("department", "dep")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tutorials.length,
      data: tutorials,
    });
  } catch (err) {
    console.error("Fetch tutorials error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching tutorials",
      error: err.message,
    });
  }
});

// =====================
// GET /tutorials/company/:companyId
// Get tutorials by company (optionally filtered by department)
// =====================
router.get("/company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { department } = req.query;

    // Validate company exists
    const companyDoc = await Company.findById(companyId);
    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const query = { company: companyId };
    if (department) {
      query.department = department;
    }

    const tutorials = await Tutorial.find(query)
      .populate("company", "companyName")
      .populate("department", "dep")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tutorials.length,
      data: tutorials,
    });
  } catch (err) {
    console.error("Fetch company tutorials error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching tutorials",
      error: err.message,
    });
  }
});

// =====================
// GET /tutorials/department/:departmentId
// Get tutorials by department
// =====================
router.get("/department/:departmentId", async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Validate department exists
    const depDoc = await Department.findById(departmentId);
    if (!depDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const tutorials = await Tutorial.find({ department: departmentId })
      .populate("company", "companyName")
      .populate("department", "dep")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tutorials.length,
      data: tutorials,
    });
  } catch (err) {
    console.error("Fetch department tutorials error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching tutorials",
      error: err.message,
    });
  }
});

// =====================
// GET /tutorials/:id
// Get tutorial by ID
// =====================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findById(id)
      .populate("company", "companyName")
      .populate("department", "dep");

    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tutorial,
    });
  } catch (err) {
    console.error("Fetch tutorial error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching tutorial",
      error: err.message,
    });
  }
});

// =====================
// DELETE /tutorials/:id
// Delete tutorial and remove from Cloudinary
// =====================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(tutorial.cloudinaryPublicId);
    } catch (cloudErr) {
      console.warn("Cloudinary deletion warning:", cloudErr.message);
      // Continue even if Cloudinary deletion fails
    }

    // Delete from database
    await Tutorial.findByIdAndDelete(id);

    // Remove from company
    await Company.findByIdAndUpdate(tutorial.company, {
      $pull: { tutorials: id },
    });

    res.status(200).json({
      success: true,
      message: "Tutorial deleted successfully",
    });
  } catch (err) {
    console.error("Tutorial deletion error:", err);
    res.status(500).json({
      success: false,
      message: "Server error deleting tutorial",
      error: err.message,
    });
  }
});

// =====================
// PUT /tutorials/:id
// Update tutorial (title and description only)
// =====================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });
    }

    // Update fields
    if (title) {
      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Title must be at least 3 characters long",
        });
      }
      tutorial.title = title.trim();
    }

    if (description !== undefined) {
      tutorial.description = description ? description.trim() : null;
    }

    await tutorial.save();

    const updatedTutorial = await tutorial
      .populate("company", "companyName")
      .populate("department", "dep");

    res.status(200).json({
      success: true,
      message: "Tutorial updated successfully",
      data: updatedTutorial,
    });
  } catch (err) {
    console.error("Tutorial update error:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating tutorial",
      error: err.message,
    });
  }
});

// =====================
// GET /tutorials/preview/:id
// Proxy file for preview (helps with CORS and provides a stable URL for viewers)
// =====================
router.get('/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }

    const url = tutorial.cloudinaryUrl || tutorial.fileUrl;
    if (!url) {
      return res.status(404).json({ success: false, message: 'No file URL available for preview' });
    }

    const upstreamRes = await fetch(url);
    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => null);
      console.warn('Preview upstream fetch failed', { status: upstreamRes.status, text });
      return res.status(502).json({ success: false, message: 'Failed to fetch file for preview', status: upstreamRes.status, upstreamMessage: text });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // Set Content-Disposition using the original filename (helps browsers/viewers pick correct filename and rendering)
    try {
      const safeName = tutorial.originalName ? tutorial.originalName.replace(/"/g, '') : (`file-${tutorial._id}`);
      // Use inline for viewable formats like PDFs so browser can render them; include filename fallback
      res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    } catch (e) {
      console.warn('Failed to set Content-Disposition header for preview', e.message);
    }

    // Stream upstream response to client
    upstreamRes.body.pipe(res);
  } catch (err) {
    console.error('Preview fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching preview', error: err.message });
  }
});

export default router;