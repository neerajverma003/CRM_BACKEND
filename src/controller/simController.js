import SimModel from "../models/SimModel.js";

export const createSim = async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, message: "Number is required" });

    const sim = await SimModel.create({ number });
    res.status(201).json({ success: true, data: sim });
  } catch (error) {
    console.error("createSim error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSims = async (req, res) => {
  try {
    const sims = await SimModel.find()
      .populate('assignedTo', 'fullName email')
      .populate('assignmentHistory.assignedTo', 'fullName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sims });
  } catch (error) {
    console.error("getSims error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSim = async (req, res) => {
  try {
    const { id } = req.params;
    const sim = await SimModel.findByIdAndDelete(id);
    if (!sim) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("deleteSim error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignSim = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId, assignedToType, assignedToName } = req.body;

    if (!id || !assignedToId || !assignedToType || !assignedToName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const sim = await SimModel.findById(id);
    if (!sim) return res.status(404).json({ success: false, message: "SIM not found" });

    // If already assigned, move to history
    if (sim.assignedTo) {
      sim.assignmentHistory.push({
        assignedTo: sim.assignedTo,
        assignedToType: sim.assignedToType,
        assignedToName: sim.assignedToName,
        assignedAt: sim.updatedAt || new Date(),
        unassignedAt: new Date()
      });
    }

    // Assign new person
    sim.assignedTo = assignedToId;
    sim.assignedToType = assignedToType;
    sim.assignedToName = assignedToName;
    await sim.save();

    res.status(200).json({ success: true, data: sim, message: "Assigned successfully" });
  } catch (error) {
    console.error("assignSim error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unassignSim = async (req, res) => {
  try {
    const { id } = req.params;
    const sim = await SimModel.findById(id);
    if (!sim) return res.status(404).json({ success: false, message: "SIM not found" });

    // Add to history before unassigning
    if (sim.assignedTo) {
      sim.assignmentHistory.push({
        assignedTo: sim.assignedTo,
        assignedToType: sim.assignedToType,
        assignedToName: sim.assignedToName,
        assignedAt: sim.updatedAt || new Date(),
        unassignedAt: new Date()
      });
    }

    sim.assignedTo = null;
    sim.assignedToType = null;
    sim.assignedToName = null;
    await sim.save();

    res.status(200).json({ success: true, data: sim, message: "Unassigned successfully" });
  } catch (error) {
    console.error("unassignSim error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
