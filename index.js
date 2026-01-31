// // server.js or index.js

// import dotenv from "dotenv";
// dotenv.config(); //  Load env variables

// import express from "express";
// import fileUpload from "express-fileupload";
// const app = express();

// import connectDB from "./config/connection.js"; //  Add .js extension
// import adminRoutes from "./src/routes/adminRoutes.js"; //  Add .js extension
// import companyRoutes from "./src/routes/companyRoutes.js"; //  Add .js extension
// import employeeRoutes from "./src/routes/employeeRoutes.js"; //  Add .js extension
// import attendanceRoute from "./src/routes/attendanceRoute.js"; //  Add .js extension
// import SuperAdminRoutes from "./src/routes/SuperAdminRoutes.js"; //  Add .js extension
// import loginRoutes from "./src/routes/loginRoutes.js"
// import leadRoutes from "./src/routes/leadRoutes.js"
// import chequeRoutes from "./src/routes/chequeRoutes.js"
// import expenseRoutes from "./src/routes/expenseRoutes.js"
// import employeeLeadRoutes from "./src/routes/employeeLeadRoutes.js"
// import departmentRoutes from "./src/routes/departmentRoutes.js"
// import designationRoutes from "./src/routes/designationRoutes.js";
// import roleRoutes from "./src/routes/roleRoutes.js"
// import stateRoutes from "./src/routes/stateRoutes.js"
// import destinationRoutes from "./src/routes/destinationRoutes.js"
// import hotelRoutes from "./src/routes/hotelRoutes.js"
// import transportRoutes from "./src/routes/transportRoutes.js"
// import customerRoutes from "./src/routes/customerCreationRoutes.js"
// import tutorialRoutes from "./src/routes/tutorialsRoutes.js"
// import teamRoutes from "./src/routes/teamRoutes.js"
// import itineraryRoutes from "./src/routes/itineraryRoutes.js"
// import cors from "cors";
// import "./src/utils/scheduleJob.js"
// import { corsOptions } from "./config/corsOptions.js"; //  Add .js extension
// import  AdminAttendance  from "./src/routes/adminAttendance.js"
// import b2bCompanyRoutes from "./src/routes/b2bCompanyRoutes.js";
// import b2bCompanyLeadRoutes from "./src/routes/b2bCompanyLeadRoutes.js";
// import b2bOperationLeadRoutes from "./src/routes/b2bOperationLeadRoutes.js";
// import b2bState from "./src/routes/b2bStateRoutes.js";
// import EmployeeDestinationRoutes from "./src/routes/employeeDestinationRoutes.js"
// import AssignLead from "./src/routes/assignLeadRoutes.js"
// import disputeClientsRoutes from "./src/routes/disputeClientsRoutes.js"
// import invoiceRoutes from "./src/routes/invoiceRoutes.js"
// import salaryRoutes from "./src/routes/salaryRoutes.js";
// import cloudinary from "./config/cloudinary.js";
// connectDB(); //  Connect to MongoDB

// app.use(express.json({ limit: '50mb' })); //  Enable JSON body parsing with limit
// app.use(express.urlencoded({ limit: '50mb', extended: true })); //  Enable form parsing with limit
// app.use(fileUpload({ useTempFiles: true, limits: { fileSize: 50 * 1024 * 1024 } })); //  Enable file upload
// app.use(cors(corsOptions));
// app.use("/b2bcompany", b2bCompanyRoutes);
// app.use("/b2b-leads", b2bCompanyLeadRoutes);
// app.use("/b2b-operation-leads", b2bOperationLeadRoutes);
// app.use("/", adminRoutes);
// app.use("/company", companyRoutes);
// app.use("/leads", leadRoutes);
// app.use("/employee", employeeRoutes);
// app.use("/attendance", attendanceRoute);
// app.use('/AddSuperAdmin', SuperAdminRoutes);
// app.use("/cheque", chequeRoutes)
// app.use('/login' , loginRoutes)
// app.use('/expense',expenseRoutes)
// app.use('/adminAttendance' , AdminAttendance)
// app.use("/employeelead",employeeLeadRoutes)
// app.use('/department',departmentRoutes)
// app.use('/designation',designationRoutes)
// app.use("/role", roleRoutes)
// app.use("/state",stateRoutes)
// app.use("/destination",destinationRoutes)
// app.use("/hotel",hotelRoutes)
// app.use("/transport",transportRoutes)
// app.use("/customer", customerRoutes)
// app.use("/b2bstate", b2bState);
// app.use("/tutorials", tutorialRoutes);
// app.use("/teams", teamRoutes);
// app.use("/itinerary", itineraryRoutes);
// app.use("/employeedestination", EmployeeDestinationRoutes);
// app.use("/assignlead", AssignLead);
// app.use("/dispute-clients", disputeClientsRoutes);
// app.use("/invoice", invoiceRoutes);
// app.use("/salary", salaryRoutes);

// // Global error handler for uncaught errors
// app.use((err, req, res, next) => {
//   console.error("Global error handler:", err);
//   res.status(500).json({ 
//     success: false, 
//     message: err.message || "Internal server error",
//     error: process.env.NODE_ENV === 'development' ? err : undefined
//   });
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
// });

// // Simple healthcheck / connectivity probe to verify server + CORS
// app.get('/ping', (req, res) => {
//   res.setHeader('Cache-Control', 'no-store');
//   res.status(200).json({ success: true, message: 'pong', time: new Date().toISOString() });
// });

// // File upload endpoint for itinerary PDFs (Cloudinary)
// app.post('/upload', async (req, res) => {
//   try {
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ success: false, message: 'No file provided' });
//     }

//     const file = req.files.file;
//     const { leadName } = req.body; // Get lead name from request body
    
//     const allowedMimes = ['application/pdf'];
    
//     if (!allowedMimes.includes(file.mimetype)) {
//       return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
//     }

//     const maxSize = 10 * 1024 * 1024; // 10 MB
//     if (file.size > maxSize) {
//       return res.status(400).json({ success: false, message: 'File size exceeds 10 MB limit' });
//     }

//     // Create folder path: customer_data/{leadName}
//     const folderPath = leadName ? `customer_data/${leadName.replace(/\s+/g, '_')}` : 'customer_data/itineraries';

//     // Upload to Cloudinary with organized folder structure
//     const result = await cloudinary.uploader.upload(file.tempFilePath, {
//       resource_type: 'raw',
//       folder: folderPath,
//       use_filename: true,
//       access_mode: 'public',
//     });

//     console.log('Cloudinary upload result:', { secure_url: result.secure_url, public_id: result.public_id });
//     res.status(200).json({ success: true, fileUrl: result.secure_url, message: 'File uploaded successfully' });
//   } catch (error) {
//     console.error('Upload endpoint error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Serve uploaded files statically
// app.use('/uploads', express.static('uploads'));

// app.listen(process.env.PORT, () => {
//   console.log(`Server started on port ${process.env.PORT}`);
// });


// server.js or index.js

import dotenv from "dotenv";
dotenv.config(); //  Load env variables

import express from "express";
import fileUpload from "express-fileupload";
const app = express();

import connectDB from "./config/connection.js"; //  Add .js extension
import adminRoutes from "./src/routes/adminRoutes.js"; //  Add .js extension
import companyRoutes from "./src/routes/companyRoutes.js"; //  Add .js extension
import employeeRoutes from "./src/routes/employeeRoutes.js"; //  Add .js extension
import attendanceRoute from "./src/routes/attendanceRoute.js"; //  Add .js extension
import SuperAdminRoutes from "./src/routes/SuperAdminRoutes.js"; //  Add .js extension
import loginRoutes from "./src/routes/loginRoutes.js"
import leadRoutes from "./src/routes/leadRoutes.js"
import chequeRoutes from "./src/routes/chequeRoutes.js"
import expenseRoutes from "./src/routes/expenseRoutes.js"
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
import { corsOptions } from "./config/corsOptions.js"; //  Add .js extension
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
import cloudinary from "./config/cloudinary.js";
connectDB(); //  Connect to MongoDB

app.use(express.json({ limit: '50mb' })); //  Enable JSON body parsing with limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); //  Enable form parsing with limit
app.use(cors(corsOptions));

// Note: fileUpload middleware is skipped because it conflicts with multer in tutorialsRoutes
// Routes that need file uploads (like /tutorials) use multer directly instead
app.use("/b2bcompany", b2bCompanyRoutes);
app.use("/b2b-leads", b2bCompanyLeadRoutes);
app.use("/b2b-operation-leads", b2bOperationLeadRoutes);
app.use("/", adminRoutes);
app.use("/company", companyRoutes);
app.use("/leads", leadRoutes);
app.use("/employee", employeeRoutes);
app.use("/attendance", attendanceRoute);
app.use('/AddSuperAdmin', SuperAdminRoutes);
app.use("/cheque", chequeRoutes)
app.use('/login' , loginRoutes)
app.use('/expense',expenseRoutes)
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
app.use("/candidates", candidateRoutes);

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    success: false, 
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Simple healthcheck / connectivity probe to verify server + CORS
app.get('/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ success: true, message: 'pong', time: new Date().toISOString() });
});

// File upload endpoint for itinerary PDFs (Cloudinary)
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const file = req.files.file;
    const { leadName } = req.body; // Get lead name from request body
    
    const allowedMimes = ['application/pdf'];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return res.status(400).json({ success: false, message: 'File size exceeds 10 MB limit' });
    }

    // Create folder path: customer_data/{leadName}
    const folderPath = leadName ? `customer_data/${leadName.replace(/\s+/g, '_')}` : 'customer_data/itineraries';

    // Upload to Cloudinary with organized folder structure
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'raw',
      folder: folderPath,
      use_filename: true,
      access_mode: 'public',
    });

    console.log('Cloudinary upload result:', { secure_url: result.secure_url, public_id: result.public_id });
    res.status(200).json({ success: true, fileUrl: result.secure_url, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});