import OfferLetter from "../models/OfferLetterModel.js";

export const createOfferLetter = async (req, res) => {
  try {
    const {
      employee,
      candidateName,
      designation,
      department,
      joiningDate,
      salary,
      expiryDate,
      status,
      letterContent,
    } = req.body;

    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    if (!candidateName || !candidateName.trim()) {
      return res.status(400).json({ success: false, message: "Candidate name is required" });
    }

    const offerLetter = await OfferLetter.create({
      employee,
      candidateName: candidateName.trim(),
      designation: designation?.trim(),
      department: department?.trim(),
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      salary: salary?.trim(),
      status: status || "Draft",
      letterContent: letterContent?.trim(),
      createdBy: req.body.createdBy || null,
    });

    res.status(201).json({ success: true, data: offerLetter });
  } catch (error) {
    console.error("Error creating offer letter:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOfferLetters = async (req, res) => {
  try {
    const offerLetters = await OfferLetter.find()
      .populate("employee", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: offerLetters });
  } catch (error) {
    console.error("Error fetching offer letters:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfferLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    const offerLetter = await OfferLetter.findById(id).populate("employee", "fullName email");

    if (!offerLetter) {
      return res.status(404).json({ success: false, message: "Offer letter not found" });
    }

    res.status(200).json({ success: true, data: offerLetter });
  } catch (error) {
    console.error("Error fetching offer letter by id:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.candidateName && updates.candidateName.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Candidate name is required" });
    }

    const updatedOffer = await OfferLetter.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedOffer) {
      return res.status(404).json({ success: false, message: "Offer letter not found" });
    }

    res.status(200).json({ success: true, data: updatedOffer });
  } catch (error) {
    console.error("Error updating offer letter:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const offerLetter = await OfferLetter.findByIdAndDelete(id);

    if (!offerLetter) {
      return res.status(404).json({ success: false, message: "Offer letter not found" });
    }

    res.status(200).json({ success: true, message: "Offer letter deleted" });
  } catch (error) {
    console.error("Error deleting offer letter:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
