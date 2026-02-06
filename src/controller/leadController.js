import Lead from "../models/LeadModel.js"
import Employee from "../models/employeeModel.js"
import AssignLead from "../models/AssignLeadModel.js";

// Get all leads (only those that are NOT assigned to any employee) with pagination
export const getAllLeads = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Search and filter parameters
    const search = req.query.search || "";
    const status = req.query.status || "";
    const destination = req.query.destination || "";

    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.leadStatus = status;
    }

    if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }

    // Find all lead IDs that have already been assigned to some employee
    const assignedLeadIds = await AssignLead.distinct("lead");
    filter._id = { $nin: assignedLeadIds };

    // Get total count for pagination
    const totalCount = await Lead.countDocuments(filter);

    // Return paginated leads
    const leads = await Lead
      .find(filter)
      .select("name email phone whatsAppNo company destination leadStatus leadSource value createdAt updatedAt groupNumber noOfDays noOfPerson expectedTravelDate")
      .sort({ createdAt: -1 })
      .skip(skip)
      // .limit(limit)
      .lean();

    // const totalPages = Math.ceil(totalCount / limit);
    const totalPages = Math.ceil(totalCount);

    res.status(200).json({ 
      success: true, 
      data: leads,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        // limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getRecentLeads = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Search and filter parameters
    const search = req.query.search || "";
    const status = req.query.status || "";
    const destination = req.query.destination || "";

    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.leadStatus = status;
    }

    if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }

    // Find all lead IDs that have already been assigned to some employee
    const assignedLeadIds = await AssignLead.distinct("lead");
    filter._id = { $nin: assignedLeadIds };

    // Get total count for pagination
    const totalCount = await Lead.countDocuments(filter);

    // Return paginated leads
    const leads = await Lead
      .find(filter)
      .select("name email phone whatsAppNo company destination leadStatus leadSource value createdAt updatedAt groupNumber noOfDays noOfPerson expectedTravelDate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);
    // const totalPages = Math.ceil(totalCount);

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

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMatchedLeads = async (req, res) => {
  try {
    const employeeId = req.user?._id;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID missing from token" });
    }

    // Load employee with destinations field
    const employee = await Employee.findById(employeeId).lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employeeDestinations = (employee.destinations || [])
      .map((d) => d.destination?.trim().toLowerCase())
      .filter(Boolean);

    // If employee has no destinations, return empty
    if (employeeDestinations.length === 0) {
      return res.status(200).json({ matchedLeads: [] });
    }

    // Load all leads
    const leads = await Lead.find().lean();

    // Match destination (case insensitive)
    const matchedLeads = leads.filter((lead) => {
      if (!lead || !lead.destination) return false;

      const leadDest = lead.destination.trim().toLowerCase();
      return employeeDestinations.includes(leadDest);
    });

    return res.status(200).json({ matchedLeads });
  } catch (error) {
    console.error("Error matching destinations:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};


export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    console.log(lead)
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkDeleteLeads = async (req, res) => {
  try {
    const { leadIds } = req.body;
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: "leadIds array is required and must not be empty" });
    }
    
    const result = await Lead.deleteMany({ _id: { $in: leadIds } });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No leads found for deletion" });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} lead(s) deleted successfully`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getLeadsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const leads = await Lead.find({ leadStatus: status }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const hotLeads = await Lead.countDocuments({ leadStatus: 'Hot' });
    const warmLeads = await Lead.countDocuments({ leadStatus: 'Warm' });
    const coldLeads = await Lead.countDocuments({ leadStatus: 'Cold' });
    const convertedLeads = await Lead.countDocuments({ leadStatus: 'Converted' });
    const lostLeads = await Lead.countDocuments({ leadStatus: 'Lost' });
    
    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        hotLeads,
        warmLeads,
        coldLeads,
        convertedLeads,
        lostLeads
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





export const assignLead = async (req, res) => {
  try {
    const { employeeId, leadIds } = req.body;

    if (!employeeId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: "Employee ID and lead IDs are required" });
    }

    // Validate employee
    const employeeExists = await Employee.exists({ _id: employeeId });
    if (!employeeExists) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Validate leads
    const validLeads = await Lead.find({ _id: { $in: leadIds } });
    if (validLeads.length === 0) {
      return res.status(404).json({ success: false, message: "No valid leads found" });
    }

    // Use $addToSet to add leads without touching other fields
    await Employee.updateOne(
      { _id: employeeId },
      { $addToSet: { lead: { $each: leadIds } } }
    );

    const updatedEmployee = await Employee.findById(employeeId).populate("lead");

    res.status(200).json({ success: true, data: updatedEmployee, message: "Leads assigned successfully" });
  } catch (error) {
    console.error("Error assigning leads:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
