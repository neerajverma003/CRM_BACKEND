import Ledger from "../models/LedgerModel.js";
import LedgerEntry from "../models/LedgerEntryModel.js";

// create a new ledger entry
export const createLedger = async (req, res) => {
  try {
    const { name, alias } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const existing = await Ledger.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Ledger with this name already exists" });
    }

    const ledger = await Ledger.create({ name: name.trim(), alias: alias?.trim() });
    res.status(201).json({ success: true, data: ledger });
  } catch (error) {
    console.error("Error creating ledger:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all ledger entries
export const getAllLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find({}).sort({ createdAt: -1 });
    res.status(200).json(ledgers);
  } catch (error) {
    console.error("Error fetching ledgers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get single ledger by id
export const getLedgerById = async (req, res) => {
  try {
    const { id } = req.params;
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: "Ledger not found" });
    }
    res.status(200).json({ success: true, data: ledger });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// create a transaction entry for a ledger
export const createEntry = async (req, res) => {
  try {
    const { id } = req.params; // ledger id
    const { date, narration, voucherType = "", voucherNumber = "", debit = 0, credit = 0 } = req.body;

    // validate ledger exists
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: "Ledger not found" });
    }

    // calculate previous balance
    const lastEntry = await LedgerEntry.findOne({ ledger: id }).sort({ date: -1, createdAt: -1 });
    const prevBalance = lastEntry ? lastEntry.balance : 0;
    const newBalance = prevBalance + Number(credit || 0) - Number(debit || 0);

    const entry = await LedgerEntry.create({
      ledger: id,
      date: date ? new Date(date) : new Date(),
      narration,
      voucherType,
      voucherNumber,
      debit: Number(debit) || 0,
      credit: Number(credit) || 0,
      balance: newBalance,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error("Error creating ledger entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// helper to recalc balances for all entries of a ledger
async function recalcBalances(ledgerId) {
  const entries = await LedgerEntry.find({ ledger: ledgerId }).sort({ date: 1, createdAt: 1 });
  let running = 0;
  for (const e of entries) {
    running = running + (e.credit || 0) - (e.debit || 0);
    if (e.balance !== running) {
      e.balance = running;
      await e.save();
    }
  }
}

// fetch entries for a ledger
export const getEntriesForLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: "Ledger not found" });
    }
    const entries = await LedgerEntry.find({ ledger: id }).sort({ date: 1, createdAt: 1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching ledger entries:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// update an existing entry
export const updateEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const { date, narration, debit = 0, credit = 0 } = req.body;
    const ledger = await Ledger.findById(id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });

    const entry = await LedgerEntry.findById(entryId);
    if (!entry || entry.ledger.toString() !== id) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    entry.date = date ? new Date(date) : entry.date;
    entry.narration = narration;
    entry.voucherType = voucherType;
    entry.voucherNumber = voucherNumber;
    entry.debit = Number(debit) || 0;
    entry.credit = Number(credit) || 0;
    await entry.save();

    // recalc all balances since this entry
    await recalcBalances(id);

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// delete an entry
export const deleteEntry = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const ledger = await Ledger.findById(id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });

    const entry = await LedgerEntry.findById(entryId);
    if (!entry || entry.ledger.toString() !== id) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    await entry.remove();

    // recalc all remaining balances
    await recalcBalances(id);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};
