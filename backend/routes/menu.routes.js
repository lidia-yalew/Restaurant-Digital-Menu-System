// routes/menu.routes.js
const express = require("express");
const router = express.Router();
const menuController = require("../Controllers/menu.controller");

// GET all menu items
router.get("/", menuController.getAllMenuItems);

// GET single menu item
router.get("/:id", menuController.getMenuItemById);

// POST create new menu item
router.post("/", menuController.createMenuItem);

// PUT update menu item
router.put("/:id", menuController.updateMenuItem);

// DELETE menu item
router.delete("/:id", menuController.deleteMenuItem);

// ✅ ADD THESE NEW ROUTES:

// GET items by category
router.get("/category/:category", menuController.getMenuItemsByCategory);

// GET all categories
router.get("/categories/all", menuController.getMenuCategories);

// GET search menu items
router.get("/search/:query", menuController.searchMenuItems);

// PATCH update availability
router.patch("/:id/availability", menuController.updateMenuItemAvailability);

module.exports = router;
