import ManualPayslip from "../models/ManualPayslipModel.js";

// Create or update a manual payslip
export const saveManualPayslip = async (req, res) => {
    try {
        let payslip;
        if (req.body._id) {
            payslip = await ManualPayslip.findByIdAndUpdate(req.body._id, req.body, { new: true });
        } else {
            payslip = new ManualPayslip(req.body);
            await payslip.save();
        }
        res.status(200).json({ success: true, message: "Payslip saved successfully", data: payslip });
    } catch (error) {
        console.error("Error saving manual payslip:", error);
        res.status(500).json({ success: false, message: "Error saving payslip", error: error.message });
    }
};

// Get all manual payslips
export const getManualPayslips = async (req, res) => {
    try {
        const payslips = await ManualPayslip.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payslips });
    } catch (error) {
        console.error("Error fetching payslips:", error);
        res.status(500).json({ success: false, message: "Error fetching payslips", error: error.message });
    }
};

// Get a single manual payslip
export const getManualPayslipById = async (req, res) => {
    try {
        const payslip = await ManualPayslip.findById(req.params.id);
        if (!payslip) return res.status(404).json({ success: false, message: "Payslip not found" });
        res.status(200).json({ success: true, data: payslip });
    } catch (error) {
        console.error("Error fetching payslip:", error);
        res.status(500).json({ success: false, message: "Error fetching payslip", error: error.message });
    }
};

// Delete a manual payslip
export const deleteManualPayslip = async (req, res) => {
    try {
        const payslip = await ManualPayslip.findByIdAndDelete(req.params.id);
        if (!payslip) return res.status(404).json({ success: false, message: "Payslip not found" });
        res.status(200).json({ success: true, message: "Payslip deleted successfully" });
    } catch (error) {
        console.error("Error deleting payslip:", error);
        res.status(500).json({ success: false, message: "Error deleting payslip", error: error.message });
    }
};
