import express from "express";
import {
  createLedger,
  getAllLedgers,
  getLedgerById,
  createEntry,
  getEntriesForLedger,
  updateEntry,
  deleteEntry,
} from "../controller/ledgerController.js";

const router = express.Router();

// create a ledger
router.post("/", createLedger);

// list all ledgers
router.get("/all", getAllLedgers);

// single ledger detail (optional)
router.get("/:id", getLedgerById);

// ledger transaction entries
router.post("/:id/entry", createEntry);
router.put("/:id/entry/:entryId", updateEntry);
router.delete("/:id/entry/:entryId", deleteEntry);
router.get("/:id/entries", getEntriesForLedger);

export default router;
