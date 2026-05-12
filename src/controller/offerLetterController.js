import OfferLetter from "../models/OfferLetterModel.js";

export const createOfferLetter = async (req, res) => {
  try {
    const {
      refNumber,
      offerDate,
      candidateName,
      fatherName,
      candidateEmail,
      candidatePhone,
      candidateAddress,
      jobTitle,
      joiningDate,
      employmentType,
      reportingTo,
      salary,
      benefits,
      jobResponsibilities,
      status,
      companyId,
      companyName,
      formatId,
      createdBy,
    } = req.body;

    if (!refNumber) {
      return res.status(400).json({ success: false, message: "Reference number is required" });
    }
    if (!candidateName || !candidateName.trim()) {
      return res.status(400).json({ success: false, message: "Candidate name is required" });
    }

    const offerLetter = await OfferLetter.create({
      refNumber,
      offerDate: offerDate ? new Date(offerDate) : new Date(),
      candidateName: candidateName.trim(),
      fatherName: fatherName ? fatherName.trim() : "",
      candidateEmail,
      candidatePhone,
      candidateAddress,
      jobTitle,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      employmentType,
      reportingTo,
      salary,
      benefits,
      jobResponsibilities,
      status: status || "Draft",
      companyId,
      companyName,
      formatId,
      createdBy: createdBy || null,
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
      .populate("createdBy", "fullName email")
      .populate("companyId")
      .populate("formatId", "title")
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
    const offerLetter = await OfferLetter.findById(id)
      .populate("createdBy", "fullName email")
      .populate("companyId")
      .populate("formatId");

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
