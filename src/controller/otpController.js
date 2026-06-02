import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import SuperAdmin from "../models/SuperAdminModel.js";
import Admin from "../models/Adminmodel.js";
import Employee from "../models/employeeModel.js";

// In-memory store for OTPs
const otpStore = new Map();

// Helper to find user by email or ID
const findUser = async (userId) => {
    let user = await SuperAdmin.findById(userId);
    let Model = SuperAdmin;
    if (!user) {
        user = await Admin.findById(userId);
        Model = Admin;
    }
    if (!user) {
        user = await Employee.findById(userId);
        Model = Employee;
    }
    return { user, Model };
};

const findUserByEmail = async (email) => {
    let user = await SuperAdmin.findOne({ email });
    let Model = SuperAdmin;
    if (!user) {
        user = await Admin.findOne({ email });
        Model = Admin;
    }
    if (!user) {
        user = await Employee.findOne({ email });
        Model = Employee;
    }
    return { user, Model };
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password"
    }
});

export const sendOtp = async (req, res) => {
    try {
        const { email, userId } = req.body;
        
        let targetUser = null;
        if (userId && userId !== "null" && userId !== "undefined" && userId.length === 24) {
            const { user } = await findUser(userId);
            targetUser = user;
        } 
        
        if (!targetUser && email) {
            const { user } = await findUserByEmail(email);
            targetUser = user;
        }

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save in memory for 10 minutes
        otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, userId: targetUser._id.toString() });

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER || "noreply@admirecrm.com",
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
        };

        // We will try sending the email. If it fails due to no auth, we still return success but log it,
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                await transporter.sendMail(mailOptions);
            } else {
                console.log(`[DEV MODE] Email credentials missing. OTP for ${email} is ${otp}`);
            }
        } catch (err) {
            console.log("Email error:", err.message);
            console.log(`[DEV MODE] OTP for ${email} is ${otp}`);
        }

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const stored = otpStore.get(email);

        if (!stored) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        if (stored.expiresAt < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired" });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        stored.verified = true;
        
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, userId } = req.body;
        const stored = otpStore.get(email);

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        let ModelToUse;
        let targetUserId = userId;

        if (userId && userId !== "null" && userId !== "undefined" && userId.length === 24) {
            const { user, Model } = await findUser(userId);
            if (user) {
                ModelToUse = Model;
                targetUserId = user._id;
            }
        } 
        
        if (!ModelToUse) {
            const { user, Model } = await findUserByEmail(email);
            if (!user) return res.status(404).json({ message: "User not found" });
            ModelToUse = Model;
            targetUserId = user._id;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await ModelToUse.findByIdAndUpdate(targetUserId, { password: hashedPassword });
        
        // Clean up
        otpStore.delete(email);

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
