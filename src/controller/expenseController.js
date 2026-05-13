import Expense from "../models/ExpenseModel.js";
import { uploadToS3 } from "../utils/s3Upload.js";

export const createExpense = async (req, res) => {
  try {
    if (!req.files || !req.files.bill) {
      return res.status(400).json({ success: false, message: "No bill file uploaded" });
    }

    const file = req.files.bill;
    const cleanReason = (req.body.reason || 'misc').trim().replace(/[^a-zA-Z0-9-]/g, '_');
    const d = new Date(req.body.date || Date.now());
    const yearMonth = `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}`;
    const folderPath = `expenses/${yearMonth}/${cleanReason}`;

    const uploadResult = await uploadToS3(file, file.name, folderPath, file.mimetype);

    const { AmountPaid, PaymentMethod, reason, date } = req.body;

    const expense = await Expense.create({
      AmountPaid,
      PaymentMethod,
      reason,
      date,
      bill: uploadResult.url,
      key: uploadResult.key,
    });

    console.log("✅ Expense Created:", expense);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("❌ Error creating expense:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getAllCheque = async(req,res)=>{
    try {
        const data = await Expense.find({})
        if(!data){
            return res.status(400).json({message:"No cheque record found"})
        }
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"})
    }
}


// import Expense from "../models/ExpenseModel.js";

// Fetch only the bill URL for a given expense ID
export const getExpenseBill = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the expense by ID and select only the 'bill' field
    const expense = await Expense.findById(id).select("bill");

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (!expense.bill) {
      return res.status(404).json({ success: false, message: "No bill attached for this expense" });
    }

    // Return the bill URL
    res.status(200).json({ success: true, billUrl: expense.bill });
  } catch (error) {
    console.error("❌ Error fetching bill:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
