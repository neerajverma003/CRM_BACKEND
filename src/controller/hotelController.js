import Hotel from "../models/hotelModel.js";
import cloudinary from "../../config/cloudinary.js";

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

    // Upload images to cloudinary if files are provided
    if (req.files && req.files.hotelImages) {
      const files = Array.isArray(req.files.hotelImages) ? req.files.hotelImages : [req.files.hotelImages];
      
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "hotels",
            resource_type: "auto",
          });
          hotelImages.push(result.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image to cloudinary:", uploadError);
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
      .populate("state", "state country type")  // Working now
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
    // Base update data from body
    const updateData = { ...req.body };

    // Fetch existing hotel to compute final hotelImages
    const existingHotel = await Hotel.findById(req.params.id);
    const existingImages = existingHotel?.hotelImages || [];

    // Parse imagesToRemove if provided (may come as JSON string)
    let imagesToRemove = [];
    if (updateData.imagesToRemove) {
      imagesToRemove = updateData.imagesToRemove;
      if (typeof imagesToRemove === "string") {
        try {
          imagesToRemove = JSON.parse(imagesToRemove);
        } catch (err) {
          imagesToRemove = [imagesToRemove];
        }
      }
      if (!Array.isArray(imagesToRemove)) imagesToRemove = [imagesToRemove];
    }

    // Remove requested images from Cloudinary and from the existingImages list
    if (imagesToRemove.length > 0) {
      for (const imgUrl of imagesToRemove) {
        try {
          const publicId = getPublicIdFromUrl(imgUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      }
    }

    // Start with existing images minus removed ones
    let finalImages = existingImages.filter(img => !imagesToRemove.includes(img));

    // Upload new images if provided and append
    if (req.files && req.files.hotelImages) {
      const files = Array.isArray(req.files.hotelImages) ? req.files.hotelImages : [req.files.hotelImages];
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "hotels",
            resource_type: "auto",
          });
          finalImages.push(result.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image to cloudinary:", uploadError);
        }
      }
    }

    // Set computed images array on updateData
    updateData.hotelImages = finalImages;
    // remove imagesToRemove so it isn't stored on the document
    delete updateData.imagesToRemove;

    const updated = await Hotel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating hotel:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Helper to extract cloudinary public id from a secure url
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // remove query params
    const clean = url.split("?")[0];
    const parts = clean.split("/upload/");
    if (parts.length < 2) return null;
    let afterUpload = parts[1]; // e.g. v1234567890/hotels/abc123.jpg
    // remove version prefix v12345/
    afterUpload = afterUpload.replace(/^v\d+\//, "");
    // remove file extension
    const withoutExt = afterUpload.replace(/\.[^/.]+$/, "");
    return withoutExt; // e.g. hotels/abc123
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
