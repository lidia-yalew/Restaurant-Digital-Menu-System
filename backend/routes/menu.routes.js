const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { verifyToken, authorize } = require("../middleware/auth");
const multer = require("multer"); // Add for image upload

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/menu/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ✅ PUBLIC ROUTES (Everyone can access)
router.get("/", menuController.getAllMenuItems);
router.get("/search/:query", menuController.searchMenuItems);
router.get("/category/:category", menuController.getMenuItemsByCategory);
router.get("/categories/all", menuController.getMenuCategories);
router.get("/:id", menuController.getMenuItemById);

// ✅ PROTECTED ROUTES (Admin only)
router.post(
  "/",
  verifyToken,
  authorize("manager","admin"),
  menuController.createMenuItem
);
router.put(
  "/:id",
  verifyToken,
  authorize("manager","admin","chef"),
  menuController.updateMenuItem
);
router.patch(
  "/:id/availability",
  verifyToken,
  authorize("admin","chef"),
  menuController.updateMenuItemAvailability
);
router.delete(
  "/:id",
  verifyToken,
  authorize("admin","manager"),
  menuController.deleteMenuItem
);

// ✅ NEW: Bulk update availability
router.post(
  "/bulk/availability",
  verifyToken,
  authorize("admin", "chef"),
  menuController.bulkUpdateAvailability
);

// ✅ NEW: Upload menu item image
router.post(
  "/:id/image",
  verifyToken,
  authorize("admin"),
  upload.single("image"), // Multer middleware
  menuController.uploadMenuItemImage
);
// NEW: Update only preparation time
// Add this route after your other routes
router.patch(
  '/:id/prep-time',
  verifyToken,
  authorize('admin','chef'),
  menuController.updatePrepTime
);
module.exports = router;
