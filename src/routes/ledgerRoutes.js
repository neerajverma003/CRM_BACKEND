import express from "express";
import {
  createLedger,
  getAllLedgers,
  getLedgerById,
  createEntry,
  getEntriesForLedger,
  updateEntry,
  deleteEntry,
  createLedgerGroup,
  getAllLedgerGroups,
  updateLedgerGroup,
  deleteLedgerGroup,
} from "../controller/ledgerController.js";

const router = express.Router();

// Ledger groups CRUD
router.post("/group", createLedgerGroup);
router.get("/group/all", getAllLedgerGroups);
router.put("/group/:id", updateLedgerGroup);
router.delete("/group/:id", deleteLedgerGroup);

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

