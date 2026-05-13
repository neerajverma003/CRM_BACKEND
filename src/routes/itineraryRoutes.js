import express from "express";
import {
  createItinerary,
  getAllItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
} from "../controller/itineraryController.js";

const router = express.Router();

// Create itinerary (multiple PDFs)
router.post("/create", createItinerary); // note `array` instead of `single`

// CRUD routes
router.get("/", getAllItineraries);
router.get("/:id", getItineraryById);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

export default router;
