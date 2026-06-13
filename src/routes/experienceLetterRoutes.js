import express from "express";
import { getAllexperienceLetter, createExperienceLetter, updateExperienceLetter, deleteExperienceLetter, getNextRefNumber, getExperienceLetterById } from "../controller/experienceLetterController.js";
const router = express.Router();

router.get('/', getAllexperienceLetter);
router.post('/', createExperienceLetter);
router.put('/:id', updateExperienceLetter);
router.delete('/:id', deleteExperienceLetter);
router.get('/ref', getNextRefNumber);
router.get('/:id', getExperienceLetterById);

export default router;