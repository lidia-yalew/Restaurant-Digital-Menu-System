// controllers/menu.controller.js
const Menu = require("../model/menu.model");

exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.findAll();
    res.json(menuItems);
  } catch (error) {
    console.error("Error getting menu items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    console.error("Error getting menu item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const newMenuItem = await Menu.create(req.body);
    res.status(201).json(newMenuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const updatedMenuItem = await Menu.update(req.params.id, req.body);
    if (!updatedMenuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(updatedMenuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ ADD THIS - Get items by category
exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const menuItems = await Menu.findByCategory(category);
    res.json(menuItems);
  } catch (error) {
    console.error("Error getting menu items by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ ADD THIS - Search menu items
exports.searchMenuItems = async (req, res) => {
  try {
    const query = req.params.query || "";
    if (!query.trim()) {
      const allItems = await Menu.findAll();
      return res.json(allItems);
    }
    const menuItems = await Menu.search(query);
    res.json(menuItems);
  } catch (error) {
    console.error("Error searching menu items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ ADD THIS - Get all categories
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await Menu.getCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ ADD THIS - Update availability
exports.updateMenuItemAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;
    const updatedItem = await Menu.updateAvailability(req.params.id, is_available);
    
    if (!updatedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
exports.deleteMenuItem = async (req, res) => {
  try {
    const deleted = await Menu.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
