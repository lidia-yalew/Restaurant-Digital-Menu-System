const express = require("express");
const router = express.Router();
const resinfoController = require("../Controllers/resinfo.controller");
const { verifyToken, authorize } = require("../middleware/auth");

// ✅ PUBLIC ROUTES
router.get("/info", resinfoController.getRestaurantInfo);

// ✅ INITIALIZATION (Admin only)
router.post(
  "/initialize",
  verifyToken,
  authorize("admin"),
  resinfoController.initialize
);

// ✅ SECTION UPDATES (Admin/Manager only)
router.put(
  "/section/:section",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.updateSection
);

// ✅ STATS MANAGEMENT
router.post(
  "/stats",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.addStat
);
router.put(
  "/stats/:id",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.updateStat
);
router.delete(
  "/stats/:id",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.deleteStat
);

// ✅ TEAM MEMBERS MANAGEMENT
router.post(
  "/team",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.addTeamMember
);
router.put(
  "/team/:id",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.updateTeamMember
);
router.delete(
  "/team/:id",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.deleteTeamMember
);

// ✅ MILESTONES MANAGEMENT
router.post(
  "/milestones",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.addMilestone
);
router.put(
  "/milestones/:id",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.addMilestone
);
router.delete(
  "/milestones/:id",
  verifyToken,
  authorize("manager", "admin"),
  resinfoController.deleteMilestone
);

module.exports = router;