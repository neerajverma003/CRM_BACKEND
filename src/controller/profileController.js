import Profile from "../models/ProfileModel.js";
import Admin from "../models/Adminmodel.js";

// Create a new profile
export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.userInfo?.id || req.body.createdBy; // Get from auth middleware or request body

    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Profile name and creator are required"
      });
    }

    // Check if profile with same name already exists for this user
    const existingProfile = await Profile.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      createdBy,
      isActive: true
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "A profile with this name already exists"
      });
    }

    const newProfile = await Profile.create({
      name: name.trim(),
      createdBy,
    });

    // Populate createdBy for response
    await newProfile.populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: newProfile
    });
  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating profile"
    });
  }
};

// Get all profiles (optionally filter by createdBy)
export const getAllProfiles = async (req, res) => {
  try {
    const createdBy = req.query.createdBy; // Only use query param, not req.userInfo
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (createdBy) {
      query.createdBy = createdBy;
    }

    const total = await Profile.countDocuments(query);

    const profiles = await Profile.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: profiles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProfiles: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profiles"
    });
  }
};

// Get profile by ID
export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.userInfo?.id;

    const profile = await Profile.findOne({
      _id: id,
      createdBy,
      isActive: true
    }).populate('createdBy', 'fullName email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const createdBy = req.userInfo?.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Profile name is required"
      });
    }

    // Check if another profile with same name exists
    const existingProfile = await Profile.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      createdBy,
      _id: { $ne: id },
      isActive: true
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "A profile with this name already exists"
      });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: id, createdBy, isActive: true },
      {
        name: name.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName email');

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile"
    });
  }
};

// Delete profile (soft delete)
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProfile = await Profile.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!deletedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting profile"
    });
  }
};

// Search profiles
export const searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    const createdBy = req.userInfo?.id;

    if (!q || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Search query and user ID are required"
      });
    }

    const profiles = await Profile.find({
      createdBy,
      isActive: true,
      name: { $regex: q, $options: 'i' }
    })
    .populate('createdBy', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(20);

    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (err) {
    console.error("Error searching profiles:", err);
    res.status(500).json({
      success: false,
      message: "Server error while searching profiles"
    });
  }
};