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
  authorize("admin"),
  menuController.createMenuItem
);
router.put(
  "/:id",
  verifyToken,
  authorize("admin"),
  menuController.updateMenuItem
);
router.patch(
  "/:id/availability",
  verifyToken,
  authorize("admin", "staff"),
  menuController.updateMenuItemAvailability
);
router.delete(
  "/:id",
  verifyToken,
  authorize("admin"),
  menuController.deleteMenuItem
);

// ✅ NEW: Bulk update availability
router.post(
  "/bulk/availability",
  verifyToken,
  authorize("admin", "staff"),
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

module.exports = router;
