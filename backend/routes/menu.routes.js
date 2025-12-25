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

module.exports = router;
