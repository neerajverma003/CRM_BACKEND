import Itinerary from "../models/ItineraryModel.js";
import { uploadToS3 } from "../utils/s3Upload.js";

// ================= CREATE ITINERARY (multiple PDFs) =================
export const createItinerary = async (req, res) => {
  try {
    const { Destination, NoOfDay, TravelType } = req.body;

    if (!TravelType || !Destination || !NoOfDay || !req.files || !req.files.Upload) {
      return res.status(400).json({
        success: false,
        message: "Destination, NoOfDay, TravelType and at least one PDF are required",
      });
    }

    // Normalize files to array
    const files = Array.isArray(req.files.Upload) ? req.files.Upload : [req.files.Upload];

    // Upload all files to S3
    const uploadedFiles = [];
    const cleanDest = Destination.trim().replace(/[^a-zA-Z0-9-]/g, '_');
    const cleanDays = NoOfDay.trim().replace(/[^a-zA-Z0-9-]/g, '_');
    const folderPath = `itineraries/${cleanDest}/${cleanDays}`;

    for (const file of files) {
      const result = await uploadToS3(file, file.name, folderPath, file.mimetype);
      uploadedFiles.push({ url: result.url, key: result.key });
    }

    const newItinerary = await Itinerary.create({
      Destination,
      TravelType,
      NoOfDay,
      Upload: uploadedFiles, // array of objects {url, key}
    });

    return res.status(201).json({
      success: true,
      message: "Itinerary created successfully",
      data: newItinerary,
    });
  } catch (error) {
    console.error("Create Itinerary Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= GET ALL ITINERARIES =================
export const getAllItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find();
    res.status(200).json({ success: true, data: itineraries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= GET ITINERARY BY ID =================
export const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= UPDATE ITINERARY =================
export const updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= DELETE ITINERARY =================
export const deleteItinerary = async (req, res) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
