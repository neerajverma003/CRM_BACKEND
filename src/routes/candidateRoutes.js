import express from "express";
import path from "path";
import fs from "fs";
import upload, { cloudinary } from "../../config/upload.js";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
} from "../controller/candidateController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// (Cloudinary upload config is now used from config/upload.js)

// Routes

// GET /candidates - Get all candidates (optionally filter by createdBy)
router.get("/", getCandidates);

// GET /candidates/:id - Get a single candidate by ID
router.get("/:id", getCandidateById);

// POST /candidates - Create a new candidate
// Middleware to set profileName and candidateName in req.body for Cloudinary folder structure
import Profile from "../models/profileModel.js";
router.post("/", async (req, res, next) => {
  // Multer parses form-data after this middleware, so we use req.body only for urlencoded/json, not file uploads
  // Instead, use a custom field in the form for profileName and candidateName, or fetch profile name here
  // We'll use a workaround: parse fields from req.body (if present) or fetch from DB after upload in controller
  next();
}, upload.single('resume'), createCandidate);

// PUT /candidates/:id - Update a candidate
router.put("/:id", upload.single('resume'), updateCandidate);

// DELETE /candidates/:id - Delete a candidate
router.delete("/:id", deleteCandidate);

export default router;