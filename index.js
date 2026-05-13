
import dotenv from "dotenv";
dotenv.config(); //  Load env variables

import express from "express";
import fileUpload from "express-fileupload";
const app = express();

import connectDB from "./config/connection.js"; 
import adminRoutes from "./src/routes/adminRoutes.js"; 
import companyRoutes from "./src/routes/companyRoutes.js"; 
import employeeRoutes from "./src/routes/employeeRoutes.js"; 
import attendanceRoute from "./src/routes/attendanceRoute.js"; 
import SuperAdminRoutes from "./src/routes/SuperAdminRoutes.js"; 
import superadminMyleadRoutes from "./src/routes/superadminMyleadRoutes.js";
import loginRoutes from "./src/routes/loginRoutes.js"
import leadRoutes from "./src/routes/leadRoutes.js"
import chequeRoutes from "./src/routes/chequeRoutes.js"
import expenseRoutes from "./src/routes/expenseRoutes.js"
import ledgerRoutes from "./src/routes/ledgerRoutes.js"
import employeeLeadRoutes from "./src/routes/employeeLeadRoutes.js"
import departmentRoutes from "./src/routes/departmentRoutes.js"
import designationRoutes from "./src/routes/designationRoutes.js";
import roleRoutes from "./src/routes/roleRoutes.js"
import stateRoutes from "./src/routes/stateRoutes.js"
import destinationRoutes from "./src/routes/destinationRoutes.js"
import hotelRoutes from "./src/routes/hotelRoutes.js"
import transportRoutes from "./src/routes/transportRoutes.js"
import customerRoutes from "./src/routes/customerCreationRoutes.js"
import tutorialRoutes from "./src/routes/tutorialsRoutes.js"
import teamRoutes from "./src/routes/teamRoutes.js"
import itineraryRoutes from "./src/routes/itineraryRoutes.js"
import cors from "cors";
import "./src/utils/scheduleJob.js"
import { corsOptions } from "./config/corsOptions.js"; 
import  AdminAttendance  from "./src/routes/adminAttendance.js"
import b2bCompanyRoutes from "./src/routes/b2bCompanyRoutes.js";
import b2bCompanyLeadRoutes from "./src/routes/b2bCompanyLeadRoutes.js";
import b2bOperationLeadRoutes from "./src/routes/b2bOperationLeadRoutes.js";
import b2bState from "./src/routes/b2bStateRoutes.js";
import EmployeeDestinationRoutes from "./src/routes/employeeDestinationRoutes.js"
import AssignLead from "./src/routes/assignLeadRoutes.js"
import disputeClientsRoutes from "./src/routes/disputeClientsRoutes.js"
import invoiceRoutes from "./src/routes/invoiceRoutes.js"
import salaryRoutes from "./src/routes/salaryRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";
import employeeRoleRoutes from "./src/routes/employeeRoleRoutes.js";
import employeeDataRoutes from "./src/routes/employeeDataRoutes.js";
import simRoutes from "./src/routes/simRoutes.js";
import emailRoutes from "./src/routes/emailRoutes.js";
import taskAssignRoutes from "./src/routes/taskAssignRoutes.js";
import offerLetterRoutes from "./src/routes/offerLetterRoutes.js";
import offerLetterFormatRoutes from "./src/routes/offerLetterFormatRoutes.js";
import bankRoutes from "./src/routes/bankRoutes.js";
import { uploadToS3 } from "./src/utils/s3Upload.js";
import mediaRoutes from "./src/routes/mediaRoutes.js";

connectDB(); //  Connect to MongoDB

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 
app.use(cors(corsOptions));

// Enable file upload via express-fileupload
app.use(fileUpload({ 
  useTempFiles: true, 
  tempFileDir: 'tmp',
  limits: { fileSize: 500 * 1024 * 1024 } 
}));

app.use("/b2bcompany", b2bCompanyRoutes);
app.use("/b2b-leads", b2bCompanyLeadRoutes);
app.use("/b2b-operation-leads", b2bOperationLeadRoutes);
app.use("/", adminRoutes);
app.use("/company", companyRoutes);
app.use("/leads", leadRoutes);
app.use("/employee", employeeRoutes);
app.use("/attendance", attendanceRoute);
app.use('/AddSuperAdmin', SuperAdminRoutes);
app.use('/superadminmylead', superadminMyleadRoutes);
app.use("/cheque", chequeRoutes)
app.use('/login' , loginRoutes)
app.use('/expense',expenseRoutes)
app.use('/ledger', ledgerRoutes)
app.use('/adminAttendance' , AdminAttendance)
app.use("/employeelead",employeeLeadRoutes)
app.use('/department',departmentRoutes)
app.use('/designation',designationRoutes)
app.use("/role", roleRoutes)
app.use("/state",stateRoutes)
app.use("/destination",destinationRoutes)
app.use("/hotel",hotelRoutes)
app.use("/transport",transportRoutes)
app.use("/customer", customerRoutes)
app.use("/b2bstate", b2bState);
app.use("/tutorials", tutorialRoutes);
app.use("/teams", teamRoutes);
app.use("/itinerary", itineraryRoutes);
app.use("/employeedestination", EmployeeDestinationRoutes);
app.use("/assignlead", AssignLead);
app.use("/dispute-clients", disputeClientsRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/salary", salaryRoutes);
app.use("/profiles", profileRoutes);
app.use("/api/media", mediaRoutes);
app.use("/candidates", candidateRoutes);
app.use("/employeerole", employeeRoleRoutes);
app.use("/employeedata", employeeDataRoutes);
app.use('/inventory/sim', simRoutes);
app.use('/inventory/email', emailRoutes);
app.use("/tasks", taskAssignRoutes);
app.use("/offer-letter", offerLetterRoutes);
app.use("/offer-letter-format", offerLetterFormatRoutes);
app.use("/bank", bankRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    success: false, 
    message: err.message || "Internal server error",
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.get('/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ success: true, message: 'pong', time: new Date().toISOString() });
});

import mongoose from "mongoose";
app.get('/db-check', (req, res) => {
  const status = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({ 
    success: status === 1, 
    status: states[status],
    database: mongoose.connection.name 
  });
});

// File upload endpoint for itinerary PDFs (S3)
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const file = req.files.file;
    const { leadName } = req.body;
    
    const allowedMimes = ['application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
    }

    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return res.status(400).json({ success: false, message: 'File size exceeds 50 MB limit' });
    }

    const folderPath = leadName ? `customer_data/${leadName.replace(/\s+/g, '_')}` : 'customer_data/itineraries';

    const result = await uploadToS3(file, file.name, folderPath, file.mimetype);
    
    console.log('S3 upload result:', result);
    res.status(200).json({ success: true, fileUrl: result.url, key: result.key, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});