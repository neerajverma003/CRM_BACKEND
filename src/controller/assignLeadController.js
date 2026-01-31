// controllers/assignLeadController.js
import AssignLead from "../models/AssignLeadModel.js";
import Lead from "../models/LeadModel.js";
import Employee from "../models/employeeModel.js";

/**
 * Assign a lead to an employee
 */
export const assignLeadToEmployee = async (req, res) => {
  try {
    const { leadIds, employeeId } = req.body;

    if (!employeeId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "employeeId and leadIds are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const validLeads = await Lead.find({ _id: { $in: leadIds } });
    if (validLeads.length === 0) {
      return res.status(404).json({ message: "No valid leads found" });
    }

    const assignments = await Promise.all(
      validLeads.map((lead) =>
        AssignLead.create({ lead: lead._id, employee: employeeId })
      )
    );

    await Employee.updateOne(
      { _id: employeeId },
      { $addToSet: { assignLeads: { $each: leadIds } } }
    );

    const updatedEmployee = await Employee.findById(employeeId).populate("assignLeads");

    res.status(201).json({
      message: "Leads assigned successfully",
      count: assignments.length,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error assigning lead:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get assigned leads for a specific employee
export const getAssignedLeadsForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) return res.status(400).json({ message: 'employeeId is required' });
    const assignments = await AssignLead.find({ employee: employeeId }).populate({
      path: 'lead',
      // include _id explicitly and commonly used fields
      select: '_id name email phone whatsAppNo destination',
    });
    const leads = assignments.map((a) => ({
      ...a.lead.toObject(),
      assignmentId: a._id, // Add the assignment record's ID for deletion
    })).filter(Boolean);
    return res.status(200).json({ data: leads });
  } catch (error) {
    console.error('Error fetching assigned leads:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Reassign already-assigned leads from one employee to another
 */
export const reassignLeadsForEmployee = async (req, res) => {
  try {
    const { fromEmployeeId, toEmployeeId, leadIds } = req.body;

    if (!fromEmployeeId || !toEmployeeId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        message: "fromEmployeeId, toEmployeeId and leadIds are required",
      });
    }

    if (fromEmployeeId === toEmployeeId) {
      return res.status(400).json({
        message: "Source and destination employees must be different",
      });
    }

    const [fromEmployee, toEmployee] = await Promise.all([
      Employee.findById(fromEmployeeId),
      Employee.findById(toEmployeeId),
    ]);

    if (!fromEmployee) {
      return res.status(404).json({ message: "Source employee not found" });
    }
    if (!toEmployee) {
      return res.status(404).json({ message: "Destination employee not found" });
    }

    // Update assignment records: move selected leads from one employee to another
    const updateResult = await AssignLead.updateMany(
      { employee: fromEmployeeId, lead: { $in: leadIds } },
      { employee: toEmployeeId }
    );

    // Update employees' assignLeads arrays
    await Promise.all([
      Employee.updateOne(
        { _id: fromEmployeeId },
        { $pull: { assignLeads: { $in: leadIds } } }
      ),
      Employee.updateOne(
        { _id: toEmployeeId },
        { $addToSet: { assignLeads: { $each: leadIds } } }
      ),
    ]);

    return res.status(200).json({
      message: "Leads reassigned successfully",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error reassigning leads:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Remove an assigned lead (delete assignment)
 */
export const removeAssignedLead = async (req, res) => {
  try {
    const { assignLeadId } = req.params;
    
    if (!assignLeadId) {
      return res.status(400).json({ message: "assignLeadId is required" });
    }
    
    // Find the assignment to get employee and lead info
    const assignment = await AssignLead.findById(assignLeadId);
    
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    const employeeId = assignment.employee;
    const leadId = assignment.lead;
    
    // Delete the assignment
    await AssignLead.deleteOne({ _id: assignLeadId });
    
    // Remove from employee's assignLeads array
    await Employee.updateOne(
      { _id: employeeId },
      { $pull: { assignLeads: leadId } }
    );
    
    return res.status(200).json({
      message: "Assignment removed successfully",
    });
  } catch (error) {
    console.error("Error removing assigned lead:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Delete multiple assigned leads (bulk delete)
 */
export const bulkDeleteAssignedLeads = async (req, res) => {
  try {
    const { leadIds } = req.body;
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "leadIds array is required and must not be empty" });
    }
    
    // Find all assignments for these leads
    const assignments = await AssignLead.find({ _id: { $in: leadIds } });
    
    if (assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found for the provided IDs" });
    }
    
    // Get unique employee IDs and lead IDs
    const employeeLeadMap = new Map();
    assignments.forEach((assignment) => {
      const empId = assignment.employee.toString();
      if (!employeeLeadMap.has(empId)) {
        employeeLeadMap.set(empId, []);
      }
      employeeLeadMap.get(empId).push(assignment.lead);
    });
    
    // Delete the assignments
    const deleteResult = await AssignLead.deleteMany({ _id: { $in: leadIds } });
    
    // Remove from each employee's assignLeads array
    const updatePromises = Array.from(employeeLeadMap.entries()).map(([empId, leadsToRemove]) => {
      return Employee.updateOne(
        { _id: empId },
        { $pull: { assignLeads: { $in: leadsToRemove } } }
      );
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      message: "Leads deleted successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting assigned leads:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};