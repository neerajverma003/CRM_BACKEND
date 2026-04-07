import express from "express";
import {
  createOfferLetterFormat,
  getAllOfferLetterFormats,
  getOfferLetterFormatById,
  updateOfferLetterFormat,
  deleteOfferLetterFormat,
} from "../controller/offerLetterFormatController.js";

const router = express.Router();

router.post("/", createOfferLetterFormat);
router.get("/", getAllOfferLetterFormats);
router.get("/:id", getOfferLetterFormatById);
router.put("/:id", updateOfferLetterFormat);
router.delete("/:id", deleteOfferLetterFormat);

export default router;