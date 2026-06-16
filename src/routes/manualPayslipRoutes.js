import express from "express";
import {
    saveManualPayslip,
    getManualPayslips,
    getManualPayslipById,
    deleteManualPayslip
} from "../controller/manualPayslipController.js";

const router = express.Router();

router.post("/", saveManualPayslip);
router.get("/", getManualPayslips);
router.get("/:id", getManualPayslipById);
router.delete("/:id", deleteManualPayslip);

export default router;
