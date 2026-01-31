import DisputeClients from "../models/DisputeClientsModel.js";

// Create a new dispute client
const createDisputeClient = async (req, res) => {
  try {
    const { fullName, type, phone, whatsapp, email, location, issues } = req.body;

    if (!fullName || !type || !phone) {
      return res.status(400).json({
        success: false,
        message: "fullName, type, and phone are required",
      });
    }

    const newDispute = new DisputeClients({
      fullName,
      type,
      phone,
      whatsapp,
      email,
      location,
      issues,
    });

    await newDispute.save();

    return res.status(201).json({
      success: true,
      message: "Dispute client created successfully",
      data: newDispute,
    });
  } catch (error) {
    console.error("Error creating dispute client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all dispute clients
const getAllDisputeClients = async (req, res) => {
  try {
    const disputes = await DisputeClients.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Dispute clients retrieved successfully",
      data: disputes,
    });
  } catch (error) {
    console.error("Error fetching dispute clients:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a single dispute client by ID
const getDisputeClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const dispute = await DisputeClients.findById(id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dispute client retrieved successfully",
      data: dispute,
    });
  } catch (error) {
    console.error("Error fetching dispute client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a dispute client
const updateDisputeClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, type, phone, whatsapp, email, location, issues } = req.body;

    const dispute = await DisputeClients.findByIdAndUpdate(
      id,
      {
        fullName,
        type,
        phone,
        whatsapp,
        email,
        location,
        issues,
      },
      { new: true, runValidators: true }
    );

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dispute client updated successfully",
      data: dispute,
    });
  } catch (error) {
    console.error("Error updating dispute client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a dispute client
const deleteDisputeClient = async (req, res) => {
  try {
    const { id } = req.params;

    const dispute = await DisputeClients.findByIdAndDelete(id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dispute client deleted successfully",
      data: dispute,
    });
  } catch (error) {
    console.error("Error deleting dispute client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  createDisputeClient,
  getAllDisputeClients,
  getDisputeClientById,
  updateDisputeClient,
  deleteDisputeClient,
};
