const RestInfo = require("../model/restinfo.model");

// Helper for consistent responses
const successResponse = (data, message = "Success") => ({
  success: true,
  message,
  data,
});

const errorResponse = (error, statusCode = 500) => ({
  success: false,
  error: error.message || "Internal server error",
  status: statusCode,
});

// GET - Fetch all restaurant info
exports.getRestaurantInfo = async (req, res) => {
  try {
    const data = await RestInfo.getInfo();
    
    if (!data) {
      return res.status(404).json(errorResponse(new Error("No restaurant info found"), 404));
    }
    
    res.json(successResponse(data, "Restaurant info retrieved successfully"));
  } catch (error) {
    console.error("Error getting restaurant info:", error);
    res.status(500).json(errorResponse(error));
  }
};

// PUT - Update specific section
exports.updateSection = async (req, res) => {
  try {
    const { section } = req.params;
    const data = req.body;
    
    const validSections = ['hero', 'about', 'cta', 'settings'];
    if (!validSections.includes(section)) {
      return res.status(400).json(errorResponse(new Error("Invalid section name"), 400));
    }
    
    const updatedData = await RestInfo.updateSection(section, data);
    res.json(successResponse(updatedData, `${section} section updated successfully`));
  } catch (error) {
    console.error(`Error updating ${section} section:`, error);
    res.status(500).json(errorResponse(error));
  }
};

// POST - Add new stat
exports.addStat = async (req, res) => {
  try {
    const stat = await RestInfo.addStat(req.body);
    res.json(successResponse(stat, "Stat added successfully"));
  } catch (error) {
    console.error("Error adding stat:", error);
    res.status(500).json(errorResponse(error));
  }
};

// PUT - Update stat
exports.updateStat = async (req, res) => {
  try {
    const { id } = req.params;
    const stat = await RestInfo.updateStat(id, req.body);
    res.json(successResponse(stat, "Stat updated successfully"));
  } catch (error) {
    console.error("Error updating stat:", error);
    res.status(500).json(errorResponse(error));
  }
};

// DELETE - Delete stat
exports.deleteStat = async (req, res) => {
  try {
    const { id } = req.params;
    const stat = await RestInfo.deleteStat(id);
    res.json(successResponse(stat, "Stat deleted successfully"));
  } catch (error) {
    console.error("Error deleting stat:", error);
    res.status(500).json(errorResponse(error));
  }
};

// POST - Add team member
exports.addTeamMember = async (req, res) => {
  try {
    const member = await RestInfo.addTeamMember(req.body);
    res.json(successResponse(member, "Team member added successfully"));
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json(errorResponse(error));
  }
};

// PUT - Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await RestInfo.updateTeamMember(id, req.body);
    res.json(successResponse(member, "Team member updated successfully"));
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json(errorResponse(error));
  }
};

// DELETE - Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await RestInfo.deleteTeamMember(id);
    res.json(successResponse(member, "Team member deleted successfully"));
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json(errorResponse(error));
  }
};

// POST - Add milestone
exports.addMilestone = async (req, res) => {
  try {
    const milestone = await RestInfo.addMilestone(req.body);
    res.json(successResponse(milestone, "Milestone added successfully"));
  } catch (error) {
    console.error("Error adding milestone:", error);
    res.status(500).json(errorResponse(error));
  }
};

// PUT - Update milestone
exports.updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await RestInfo.updateMilestone(id, req.body);
    res.json(successResponse(milestone, "Milestone updated successfully"));
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json(errorResponse(error));
  }
};

// DELETE - Delete milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await RestInfo.deleteMilestone(id);
    res.json(successResponse(milestone, "Milestone deleted successfully"));
  } catch (error) {
    console.error("Error deleting milestone:", error);
    res.status(500).json(errorResponse(error));
  }
};

// Initialize restaurant info (first time setup)
exports.initialize = async (req, res) => {
  try {
    const data = await RestInfo.initialize(req.body);
    res.json(successResponse(data, "Restaurant info initialized successfully"));
  } catch (error) {
    console.error("Error initializing restaurant info:", error);
    res.status(500).json(errorResponse(error));
  }
};