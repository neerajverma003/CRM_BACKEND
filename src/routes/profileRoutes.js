import express from "express";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  searchProfiles
} from "../controller/profileController.js";
import Auth from "../middleware/Auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(Auth);

// Routes for profile management
router.post("/", createProfile); // Create new profile
router.get("/", getAllProfiles); // Get all profiles (optionally filter by createdBy)
router.get("/search", searchProfiles); // Search profiles
router.get("/:id", getProfileById); // Get profile by ID
router.put("/:id", updateProfile); // Update profile
router.delete("/:id", deleteProfile); // Delete profile (soft delete)

export default router;