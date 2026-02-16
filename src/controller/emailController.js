import EmailModel from "../models/EmailModel.js";

export const createEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const entry = await EmailModel.create({ email });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error("createEmail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmails = async (req, res) => {
  try {
    const entries = await EmailModel.find()
      .populate('assignedTo', 'fullName email')
      .populate('assignmentHistory.assignedTo', 'fullName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error("getEmails error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await EmailModel.findByIdAndDelete(id);
    if (!entry) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("deleteEmail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId, assignedToType, assignedToName } = req.body;

    if (!id || !assignedToId || !assignedToType || !assignedToName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const email = await EmailModel.findById(id);
    if (!email) return res.status(404).json({ success: false, message: "Email not found" });

    // If already assigned, move to history
    if (email.assignedTo) {
      email.assignmentHistory.push({
        assignedTo: email.assignedTo,
        assignedToType: email.assignedToType,
        assignedToName: email.assignedToName,
        assignedAt: email.updatedAt || new Date(),
        unassignedAt: new Date()
      });
    }

    // Assign new person
    email.assignedTo = assignedToId;
    email.assignedToType = assignedToType;
    email.assignedToName = assignedToName;
    await email.save();

    res.status(200).json({ success: true, data: email, message: "Assigned successfully" });
  } catch (error) {
    console.error("assignEmail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unassignEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await EmailModel.findById(id);
    if (!email) return res.status(404).json({ success: false, message: "Email not found" });

    // Add to history before unassigning
    if (email.assignedTo) {
      email.assignmentHistory.push({
        assignedTo: email.assignedTo,
        assignedToType: email.assignedToType,
        assignedToName: email.assignedToName,
        assignedAt: email.updatedAt || new Date(),
        unassignedAt: new Date()
      });
    }

    email.assignedTo = null;
    email.assignedToType = null;
    email.assignedToName = null;
    await email.save();

    res.status(200).json({ success: true, data: email, message: "Unassigned successfully" });
  } catch (error) {
    console.error("unassignEmail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
