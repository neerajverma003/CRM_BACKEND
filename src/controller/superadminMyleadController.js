import SuperadminMylead from "../models/SuperadminMyleadModel.js";
import SuperAdmin from "../models/SuperAdminModel.js";

// Get all myleads for a superadmin
export const getAllSuperadminMyleads = async (req, res) => {
  try {
    const { superAdminId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";
    const destination = req.query.destination || "";

    let filter = { superAdminId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.leadStatus = status;
    }

    if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }

    const totalCount = await SuperadminMylead.countDocuments(filter);

    const leads = await SuperadminMylead
      .find(filter)
      .select("name email phone whatsAppNo destination leadStatus leadSource createdAt updatedAt groupNumber noOfDays noOfPerson expectedTravelDate assignedEmployee leadInterestStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mylead by ID
export const getSuperadminMyleadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await SuperadminMylead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Mylead not found' });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new mylead for superadmin
export const createSuperadminMylead = async (req, res) => {
  try {
    const { superAdminId } = req.params;
    const leadData = { ...req.body, superAdminId };
    const lead = await SuperadminMylead.create(leadData);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update mylead
export const updateSuperadminMylead = async (req, res) => {
  try {
    const lead = await SuperadminMylead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Mylead not found' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete mylead
export const deleteSuperadminMylead = async (req, res) => {
  try {
    const lead = await SuperadminMylead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Mylead not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk delete myleads
export const bulkDeleteSuperadminMyleads = async (req, res) => {
  try {
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: "leadIds array is required and must not be empty" });
    }

    const result = await SuperadminMylead.deleteMany({ _id: { $in: leadIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No myleads found for deletion" });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} mylead(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get myleads by status
export const getSuperadminMyleadsByStatus = async (req, res) => {
  try {
    const { superAdminId, status } = req.params;
    const leads = await SuperadminMylead.find({ superAdminId, leadStatus: status }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stats for superadmin leads
export const getSuperadminMyleadStats = async (req, res) => {
  try {
    const { superAdminId } = req.params;

    const leads = await SuperadminMylead.find({ superAdminId });

    const stats = {
      totalLeads: leads.length,
      followUp: leads.filter(lead => (lead.leadInterestStatus || '').toLowerCase() === 'follow up').length,
      interested: leads.filter(lead => (lead.leadInterestStatus || '').toLowerCase() === 'interested').length,
      connected: leads.filter(lead => (lead.leadInterestStatus || '').toLowerCase() === 'connected').length,
      notConnected: leads.filter(lead => (lead.leadInterestStatus || '').toLowerCase() === 'not connected').length,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign lead to employee (superadmin only)
export const assignLeadToEmployee = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { employeeId } = req.body;

    const lead = await SuperadminMylead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.assignedEmployee = employeeId;
    lead.updatedAt = Date.now();
    await lead.save();

    res.status(200).json({ success: true, message: 'Lead assigned to employee successfully', data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leads assigned to a specific employee
export const getLeadsAssignedToEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leads = await SuperadminMylead.find({ assignedEmployee: employeeId })
      .populate('superAdminId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};