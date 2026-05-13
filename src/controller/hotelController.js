import Hotel from "../models/hotelModel.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";
import fs from "fs";

// ------------------- CREATE HOTEL -------------------
export const createHotel = async (req, res) => {
  try {
    const {
      type,
      country,
      state,
      destination,
      hotelName,
      hotelPhone,
      hotelAddress,
      hotelEmail,
      whatsappNumber,
      contactPersonNumber,
      rating,
    } = req.body;

    if (!type || !country || !state || !destination || !hotelName ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let hotelImages = [];

    // Upload images to S3 if files are provided
    if (req.files && req.files.hotelImages) {
      const files = Array.isArray(req.files.hotelImages) ? req.files.hotelImages : [req.files.hotelImages];
      
      const cleanName = hotelName.trim().replace(/[^a-zA-Z0-9-]/g, '_');
      const folderPath = `hotels/${cleanName}`;
      
      for (const file of files) {
        try {
          const result = await uploadToS3(file, file.name, folderPath, file.mimetype);
          hotelImages.push({ url: result.url, key: result.key });
        } catch (uploadError) {
          console.error("Error uploading image to S3:", uploadError);
        }
      }
    }

    const newHotel = await Hotel.create({
      type,
      country,
      state,
      destination,
      hotelName,
      hotelPhone,
      hotelAddress,
      hotelEmail,
      whatsappNumber,
      contactPersonNumber,
      rating,
      hotelImages,
    });

    res.status(201).json(newHotel);
  } catch (error) {
    console.error("Error creating hotel:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("state", "state country type")
      .populate("destination", "destinationName type country state");

    res.status(200).json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ------------------- GET HOTEL BY ID -------------------
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("state", "state country type")
      .populate("destination", "destinationName type country state");

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.error("Error fetching hotel:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ------------------- UPDATE HOTEL -------------------
export const updateHotel = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const existingHotel = await Hotel.findById(req.params.id);
    if (!existingHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const existingImages = existingHotel.hotelImages || [];
    let imagesToRemove = [];
    if (updateData.imagesToRemove) {
      imagesToRemove = updateData.imagesToRemove;
      if (typeof imagesToRemove === "string") {
        try { imagesToRemove = JSON.parse(imagesToRemove); } catch (err) { imagesToRemove = [imagesToRemove]; }
      }
      if (!Array.isArray(imagesToRemove)) imagesToRemove = [imagesToRemove];
    }

    // Remove requested images from S3
    if (imagesToRemove.length > 0) {
      for (const imgUrl of imagesToRemove) {
        try {
          const key = getKeyFromUrl(imgUrl);
          if (key) await deleteFromS3(key);
        } catch (err) {
          console.error("Error deleting image from S3:", err);
        }
      }
    }

    let finalImages = existingImages.filter(img => {
      const url = typeof img === 'string' ? img : img.url;
      return !imagesToRemove.includes(url);
    });

    // Upload new images to S3
    if (req.files && req.files.hotelImages) {
      const files = Array.isArray(req.files.hotelImages) ? req.files.hotelImages : [req.files.hotelImages];
      const nameToUse = updateData.hotelName || existingHotel.hotelName || 'unnamed';
      const cleanName = nameToUse.trim().replace(/[^a-zA-Z0-9-]/g, '_');
      const folderPath = `hotels/${cleanName}`;

      for (const file of files) {
        try {
          const result = await uploadToS3(file, file.name, folderPath, file.mimetype);
          finalImages.push({ url: result.url, key: result.key });
        } catch (uploadError) {
          console.error("Error uploading image to S3:", uploadError);
        }
      }
    }

    updateData.hotelImages = finalImages;
    delete updateData.imagesToRemove;

    const updated = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating hotel:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Helper to extract S3 key from URL
const getKeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    if (pathname.startsWith('/')) {
      return pathname.substring(1);
    }
    return pathname;
  } catch (err) {
    return null;
  }
};

// ------------------- DELETE HOTEL -------------------
export const deleteHotel = async (req, res) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
