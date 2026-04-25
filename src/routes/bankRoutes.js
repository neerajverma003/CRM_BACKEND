import express from "express";
import {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank,
} from "../controller/bankController.js";

const router = express.Router();

router.post("/", createBank);
router.get("/", getBanks);
router.get("/:id", getBankById);
router.put("/:id", updateBank);
router.delete("/:id", deleteBank);

export default router;
