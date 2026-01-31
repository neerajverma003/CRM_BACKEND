import B2bCompanyLead from "../models/B2bCompanyLeadModel.js";

// CREATE NEW LEAD
export const createLead = async (req, res) => {
  try {
    // ensure referenceId exists and is unique; generate if missing
    if (!req.body.referenceId) {
      req.body.referenceId = (await generateUniqueReferenceId()).toUpperCase();
    } else {
      req.body.referenceId = String(req.body.referenceId).toUpperCase();
    }

    const newLead = new B2bCompanyLead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(500).json({ message: "Failed to create lead", error });
  }
};

// helper: random 8-char uppercase alphanumeric
const generateRandomRef = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
};

// helper: loop until unique referenceId found
const generateUniqueReferenceId = async () => {
  let attempts = 0;
  while (attempts < 50) {
    const ref = generateRandomRef();
    // check existence
    const exists = await B2bCompanyLead.findOne({ referenceId: ref });
    if (!exists) return ref;
    attempts++;
  }
  // fallback: timestamp-based (uppercased and trimmed to 8 chars)
  return String(Date.now()).slice(-8).toUpperCase();
};

// endpoint: provide a pre-generated unique reference id
export const generateReferenceId = async (req, res) => {
  try {
    const referenceId = await generateUniqueReferenceId();
    res.status(200).json({ referenceId });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate referenceId", error });
  }
};

// GET ALL LEADS
export const getLeads = async (req, res) => {
  try {
    const leads = await B2bCompanyLead.find()
      .populate("companyId", "companyName email whatsapp")
      .sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads", error });
  }
};

// GET LEAD BY ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await B2bCompanyLead.findById(req.params.id)
      .populate("companyId", "companyName email whatsapp");
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lead", error });
  }
};

// UPDATE LEAD
export const updateLead = async (req, res) => {
  try {
    // prevent changing referenceId via update
    const updateData = { ...req.body };
    if (updateData.referenceId) delete updateData.referenceId;

    const updatedLead = await B2bCompanyLead.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate("companyId", "companyName email whatsapp");

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead", error });
  }
};

// DELETE LEAD
export const deleteLead = async (req, res) => {
  try {
    const deletedLead = await B2bCompanyLead.findByIdAndDelete(req.params.id);
    if (!deletedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Lead deleted successfully", deletedLead });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lead", error });
  }
};

// GET LEADS BY COMPANY ID
export const getLeadsByCompanyId = async (req, res) => {
  try {
    const leads = await B2bCompanyLead.find({ companyId: req.params.companyId })
      .populate("companyId", "companyName email whatsapp")
      .sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch company leads", error });
  }
};

// GET LEADS BY STATUS
export const getLeadsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const leads = await B2bCompanyLead.find({ leadStatus: status })
      .populate("companyId", "companyName email whatsapp")
      .sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads by status", error });
  }
};

// SAVE MESSAGE TO LEAD
export const saveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const updatedLead = await B2bCompanyLead.findByIdAndUpdate(
      id,
      { $push: { messages: { text: message, sentAt: new Date() } } },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Message saved", lead: updatedLead });
  } catch (error) {
    res.status(500).json({ message: "Failed to save message", error });
  }
};

// SAVE DETAILS TO LEAD
export const saveDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { details } = req.body;

    const updatedLead = await B2bCompanyLead.findByIdAndUpdate(
      id,
      { details },
      { new: true, runValidators: false }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Details saved", lead: updatedLead });
  } catch (error) {
    res.status(500).json({ message: "Failed to save details", error });
  }
};
