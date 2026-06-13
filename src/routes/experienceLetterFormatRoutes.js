import express from "express";
import { saveFormat, getFormatByCompany } from "../controller/experienceLetterFormatController.js";

const router = express.Router();

router.post("/", saveFormat);
router.get("/", getFormatByCompany);

export default router;
