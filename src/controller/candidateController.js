import Candidate from '../models/candidateModel.js';
import Profile from '../models/ProfileModel.js';
import { uploadToS3 } from '../utils/s3Upload.js';

// Create a new candidate
const createCandidate = async (req, res) => {
  try {
    const { name, state, city, experience, profile, createdBy } = req.body;

    if (!name || !state || !city || !experience || !profile || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Handle file upload (S3)
    let resumePath = null;
    let resumeKey = null;
    if (req.files && req.files.resume) {
      const file = req.files.resume;
      const cleanName = name.trim().replace(/[^a-zA-Z0-9-]/g, '_');
      const uploadResult = await uploadToS3(file, file.name, `candidates/${cleanName}`, file.mimetype);
      resumePath = uploadResult.url;
      resumeKey = uploadResult.key;
    }

    const candidate = new Candidate({
      name: name.trim(),
      state: state.trim(),
      city: city.trim(),
      experience: experience.trim(),
      profile,
      resume: resumePath,
      key: resumeKey,
      createdBy: createdBy
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate
    });

  } catch (error) {
    console.error('Error creating candidate:', error);
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

    // Handle file upload (S3)
    let resumePath = candidate.resume;
    if (req.files && req.files.resume) {
      const file = req.files.resume;
      const cleanName = name.trim().replace(/[^a-zA-Z0-9-]/g, '_');
      const uploadResult = await uploadToS3(file.data, file.name, `candidates/${cleanName}`, file.mimetype);
      resumePath = uploadResult.url;
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