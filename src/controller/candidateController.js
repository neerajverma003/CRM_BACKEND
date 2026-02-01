import Candidate from '../models/candidateModel.js';
import Profile from '../models/ProfileModel.js';
import path from 'path';
import fs from 'fs';

// Create a new candidate
const createCandidate = async (req, res) => {
  try {
    const { name, state, city, experience, profile, createdBy } = req.body;

    // Validate required fields
    if (!name || !state || !city || !experience || !profile || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }



    // Debug: log incoming form fields and file
    console.log('Candidate upload req.body:', req.body);
    console.log('Candidate upload req.file:', req.file);

    // Handle file upload (Cloudinary)
    let resumePath = null;
    if (req.file && req.file.path) {
      // If using disk storage fallback (should not happen)
      resumePath = req.file.path.replace(/\\/g, '/');
    } else if (req.file && req.file.filename && req.file.destination) {
      // fallback for disk
      resumePath = path.join(req.file.destination, req.file.filename).replace(/\\/g, '/');
    } else if (req.file && req.file.path === undefined && req.file.filename === undefined && req.file.destination === undefined && req.file.url) {
      // Cloudinary upload
      resumePath = req.file.url;
    }

    // If using Cloudinary, set folder structure dynamically
    if (req.file && req.file.filename === undefined && req.file.destination === undefined && req.file.url) {
      // Already uploaded to Cloudinary, nothing to do
    } else if (req.file) {
      // If not uploaded to Cloudinary, upload now (should not happen)
      // (Optional: implement fallback logic here)
    }

    // Create new candidate
    const candidate = new Candidate({
      name: name.trim(),
      state: state.trim(),
      city: city.trim(),
      experience: experience.trim(),
      profile,
      resume: resumePath,
      createdBy
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate
    });

  } catch (error) {
    console.error('Error creating candidate:', error);

    // If file was uploaded but candidate creation failed, delete the file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('Error deleting uploaded file:', fileError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create candidate',
      error: error.message
    });
  }
};

// Get all candidates for a user
const getCandidates = async (req, res) => {
  try {
    const { createdBy } = req.query;

    let query = { isActive: true };

    if (createdBy) {
      query.createdBy = createdBy;
    }

    const candidates = await Candidate.find(query).populate('profile', 'name').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Candidates retrieved successfully',
      data: candidates
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: error.message
    });
  }
};

// Get a single candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id).populate('profile', 'name');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidate retrieved successfully',
      data: candidate
    });

  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate',
      error: error.message
    });
  }
};

// Update a candidate
const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state, city, experience, profile } = req.body;

    // Validate required fields
    if (!name || !state || !city || !experience || !profile) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Handle file upload - delete old file if new one is uploaded
    let resumePath = candidate.resume;
    if (req.file) {
      // Delete old file if it exists
      if (candidate.resume) {
        try {
          const oldFilePath = path.resolve(candidate.resume);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (fileError) {
          console.error('Error deleting old file:', fileError);
        }
      }
      resumePath = req.file.path.replace(/\\/g, '/');
    }

    // Update candidate
    candidate.name = name.trim();
    candidate.state = state.trim();
    candidate.city = city.trim();
    candidate.experience = experience.trim();
    candidate.profile = profile;
    candidate.resume = resumePath;

    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate
    });

  } catch (error) {
    console.error('Error updating candidate:', error);

    // If file was uploaded but update failed, delete the file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('Error deleting uploaded file:', fileError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update candidate',
      error: error.message
    });
  }
};

// Delete a candidate (soft delete)
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findOne({ _id: id, isActive: true });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Soft delete - mark as inactive
    candidate.isActive = false;
    await candidate.save();

    // Optionally delete the resume file
    if (candidate.resume) {
      try {
        const filePath = path.resolve(candidate.resume);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting resume file:', fileError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete candidate',
      error: error.message
    });
  }
};;

export {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
};