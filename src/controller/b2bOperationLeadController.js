import B2bOperationLead from "../models/B2bOperationLeadModel.js";

// Create new operation lead (when confirmed from company leads)
export const createOperationLead = async (req, res) => {
  try {
    const leadData = req.body;
    const newOperationLead = new B2bOperationLead({
      ...leadData,
      confirmedAt: new Date(),
    });
    await newOperationLead.save();
    res.status(201).json(newOperationLead);
  } catch (error) {
    console.error("Error creating operation lead:", error);
    res.status(400).json({ message: error.message || "Error creating operation lead" });
  }
};

// Get all operation leads
export const getAllOperationLeads = async (req, res) => {
  try {
    const leads = await B2bOperationLead.find().sort({ confirmedAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching operation leads:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get single operation lead by ID
export const getOperationLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await B2bOperationLead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Operation lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error fetching operation lead:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update operation lead
export const updateOperationLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await B2bOperationLead.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: false }
    );
    if (!lead) {
      return res.status(404).json({ message: "Operation lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error updating operation lead:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete operation lead
export const deleteOperationLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await B2bOperationLead.findByIdAndDelete(id);
    if (!lead) {
      return res.status(404).json({ message: "Operation lead not found" });
    }
    res.status(200).json({ message: "Operation lead deleted successfully", lead });
  } catch (error) {
    console.error("Error deleting operation lead:", error);
    res.status(400).json({ message: error.message });
  }
};

// Save message to operation lead
export const saveOperationLeadMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const lead = await B2bOperationLead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Operation lead not found" });
    }

    lead.messages.push({ text: message, sentAt: new Date() });
    await lead.save();
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(400).json({ message: error.message });
  }
};

// Save details to operation lead
export const saveOperationLeadDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await B2bOperationLead.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: false }
    );
    if (!lead) {
      return res.status(404).json({ message: "Operation lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error saving details:", error);
    res.status(400).json({ message: error.message });
  }
};
