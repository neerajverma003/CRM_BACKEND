import express from "express";
import {
  createDisputeClient,
  getAllDisputeClients,
  getDisputeClientById,
  updateDisputeClient,
  deleteDisputeClient,
} from "../controller/disputeClientsController.js";

const router = express.Router();

// Create a new dispute client
router.post("/create", createDisputeClient);

// Get all dispute clients
router.get("/all", getAllDisputeClients);

// Get a single dispute client by ID
router.get("/:id", getDisputeClientById);

// Update a dispute client
router.put("/:id", updateDisputeClient);

// Delete a dispute client
router.delete("/:id", deleteDisputeClient);

export default router;
