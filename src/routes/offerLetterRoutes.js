import express from "express";
import {
  createOfferLetter,
  getAllOfferLetters,
  getOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
} from "../controller/offerLetterController.js";

const router = express.Router();

router.post("/", createOfferLetter);
router.get("/", getAllOfferLetters);
router.get("/:id", getOfferLetterById);
router.put("/:id", updateOfferLetter);
router.delete("/:id", deleteOfferLetter);

export default router;
