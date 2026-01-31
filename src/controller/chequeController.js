import Cheque from "../models/ChequeModel.js"

export const createCheque = async (req, res) => {
  try {
    // Prevent duplicates: enforce unique chequeNumber
    const { chequeNumber } = req.body;
    if (chequeNumber) {
      const existing = await Cheque.findOne({ chequeNumber: chequeNumber.toString().trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Duplicate cheque entry', existing });
      }
    }

    const cheque = await Cheque.create(req.body);
    console.log(" Cheque Created:", cheque);
    res.status(201).json({ success: true, data: cheque });
  } catch (error) {
    console.error(" Error creating cheque:", error);
    // Handle duplicate key error from MongoDB (race conditions)
    if (error && error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate cheque entry (unique constraint)', error });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllCheque = async(req,res)=>{
    try {
    // Return newest cheques first so UI shows the latest on top
    const data = await Cheque.find({}).sort({ createdAt: -1 });
    // Always return 200 with array (empty if none), letting frontend handle empty state
    return res.status(200).json(data || []);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const updateCheque = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent entryDate from being changed via update
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'entryDate')) {
      delete req.body.entryDate;
    }
    // Validate required fields for status changes
    if (req.body.status === 'cancelled' && !(req.body.cancelReason && req.body.cancelReason.trim())) {
      return res.status(400).json({ success: false, message: 'cancelReason is required when status is cancelled' });
    }
    if (req.body.status === 'clear' && !req.body.clearedDate) {
      return res.status(400).json({ success: false, message: 'clearedDate is required when status is clear' });
    }
    // Validate shifted: when status is 'shifted', require 'shiftRemark' (reason for shifting)
    if (req.body.status === 'shifted' && !(req.body.shiftRemark && req.body.shiftRemark.trim())) {
      return res.status(400).json({ success: false, message: 'shiftRemark is required when status is shifted' });
    }
    // Prevent duplicates on update by chequeNumber only
    const existingDoc = await Cheque.findById(id);
    if (!existingDoc) return res.status(404).json({ success: false, message: 'Cheque not found' });
    const targetChequeNumber = req.body.chequeNumber !== undefined ? (req.body.chequeNumber || '').toString().trim() : (existingDoc.chequeNumber || '').toString().trim();
    if (targetChequeNumber) {
      const duplicate = await Cheque.findOne({ chequeNumber: targetChequeNumber, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Duplicate cheque entry', existing: duplicate });
      }
    }
    const updatePayload = { ...req.body };
    // Normalize clearedDate to Date if present
    if (updatePayload.clearedDate) updatePayload.clearedDate = new Date(updatePayload.clearedDate);
    const updated = await Cheque.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Cheque not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(" Error updating cheque:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};