import express from "express";
import {
  createOfferLetter,
  getAllOfferLetters,
  getOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  getNextRefNumber,
} from "../controller/offerLetterController.js";

const router = express.Router();

router.get("/get-next-ref", getNextRefNumber);
router.post("/", createOfferLetter);
router.get("/", getAllOfferLetters);
router.get("/:id", getOfferLetterById);
router.put("/:id", updateOfferLetter);
router.delete("/:id", deleteOfferLetter);

export default router;
