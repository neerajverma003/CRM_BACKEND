import Bank from "../models/bankModel.js";

// ✅ Create a new bank
export const createBank = async (req, res) => {
  try {
    const { bankName } = req.body;

    if (!bankName) {
      return res.status(400).json({ message: "Bank name is required" });
    }

    // Check if bank already exists
    const existingBank = await Bank.findOne({ bankName });
    if (existingBank) {
      return res.status(400).json({ message: "Bank already exists" });
    }

    const newBank = new Bank({ bankName });
    const savedBank = await newBank.save();

    res.status(201).json(savedBank);
  } catch (error) {
    console.error("Error creating bank:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get all banks
export const getBanks = async (req, res) => {
  try {
    const banks = await Bank.find().sort({ createdAt: -1 });
    res.status(200).json(banks);
  } catch (error) {
    console.error("Error fetching banks:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get bank by ID
export const getBankById = async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await Bank.findById(id);

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json(bank);
  } catch (error) {
    console.error("Error fetching bank:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update bank
export const updateBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName } = req.body;

    if (!bankName) {
      return res.status(400).json({ message: "Bank name is required" });
    }

    // Check if new name already exists (excluding current bank)
    const existingBank = await Bank.findOne({ bankName, _id: { $ne: id } });
    if (existingBank) {
      return res.status(400).json({ message: "Bank name already exists" });
    }

    const updatedBank = await Bank.findByIdAndUpdate(
      id,
      { bankName },
      { new: true }
    );

    if (!updatedBank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json(updatedBank);
  } catch (error) {
    console.error("Error updating bank:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Delete bank
export const deleteBank = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBank = await Bank.findByIdAndDelete(id);

    if (!deletedBank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    console.error("Error deleting bank:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
