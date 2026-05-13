import express from "express";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
} from "../controller/candidateController.js";

const router = express.Router();

// Routes
// GET /candidates - Get all candidates (optionally filter by createdBy)
router.get("/", getCandidates);

// GET /candidates/:id - Get a single candidate by ID
router.get("/:id", getCandidateById);

// POST /candidates - Create a new candidate
router.post("/", createCandidate);

// PUT /candidates/:id - Update a candidate
router.put("/:id", updateCandidate);

// DELETE /candidates/:id - Delete a candidate
router.delete("/:id", deleteCandidate);

export default router;