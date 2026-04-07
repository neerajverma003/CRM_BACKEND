import OfferLetterFormat from "../models/OfferLetterFormatModel.js";

export const createOfferLetterFormat = async (req, res) => {
  try {
    const body = {
      ...req.body,
      createdBy: req.body.createdBy || null,
    };

    if (body.companyId) {
      const updatedObject = await OfferLetterFormat.findOneAndUpdate(
        { companyId: body.companyId },
        body,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      return res.status(200).json({ success: true, data: updatedObject });
    }

    const object = await OfferLetterFormat.create(body);
    return res.status(201).json({ success: true, data: object });
  } catch (error) {
    console.error("Error creating/updating offer letter format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOfferLetterFormats = async (req, res) => {
  try {
    const filter = {};
    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }
    const list = await OfferLetterFormat.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching formats:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfferLetterFormatById = async (req, res) => {
  try {
    const { id } = req.params;
    const format = await OfferLetterFormat.findById(id);
    if (!format) return res.status(404).json({ success: false, message: "Format not found" });
    return res.status(200).json({ success: true, data: format });
  } catch (error) {
    console.error("Error fetching format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOfferLetterFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await OfferLetterFormat.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Format not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOfferLetterFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OfferLetterFormat.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Format not found" });
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};