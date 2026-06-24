const Menu = require("../model/menu.model");

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

// ✅ GET all menu items with filters
exports.getAllMenuItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, available, sortBy = "name", search } = req.query;

    const filters = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      available: available === "true" ? true : available === "false" ? false : undefined,
      sortBy,
      search,
    };

    const result = await Menu.findAllWithFilters(filters);

    res.json(successResponse(result, "Menu items retrieved successfully"));
  } catch (error) {
    console.error("Error getting menu items:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ GET single menu item
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res
        .status(404)
        .json(errorResponse(new Error("Menu item not found"), 404));
    }

    res.json(successResponse(menuItem, "Menu item retrieved successfully"));
  } catch (error) {
    console.error("Error getting menu item:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ CREATE new menu item (with validation)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, category } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res
        .status(400)
        .json(
          errorResponse(
            new Error("Name, price, and category are required"),
            400
          )
        );
    }

    if (price < 0) {
      return res
        .status(400)
        .json(errorResponse(new Error("Price cannot be negative"), 400));
    }

    // Check if item with same name exists
    const existingItem = await Menu.findByName(name);
    if (existingItem) {
      return res
        .status(409)
        .json(
          errorResponse(
            new Error("Menu item with this name already exists"),
            409
          )
        );
    }

    const newMenuItem = await Menu.create(req.body);

    res
      .status(201)
      .json(successResponse(newMenuItem, "Menu item created successfully"));
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ UPDATE menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing ID
    if (updates.id) {
      delete updates.id;
    }

    // Validate price if provided
    if (updates.price !== undefined && updates.price < 0) {
      return res
        .status(400)
        .json(errorResponse(new Error("Price cannot be negative"), 400));
    }

    const updatedMenuItem = await Menu.update(id, updates);

    if (!updatedMenuItem) {
      return res
        .status(404)
        .json(errorResponse(new Error("Menu item not found"), 404));
    }

    res.json(
      successResponse(updatedMenuItem, "Menu item updated successfully")
    );
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ GET items by category
exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { available = "true" } = req.query;

    const menuItems = await Menu.findByCategory(category, available === "true");

    res.json(
      successResponse(menuItems, `Menu items in ${category} category retrieved`)
    );
  } catch (error) {
    console.error("Error getting menu items by category:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ SEARCH menu items
exports.searchMenuItems = async (req, res) => {
  try {
    const query = req.params.query || "";

    if (!query.trim()) {
      const allItems = await Menu.findAll();
      return res.json(successResponse(allItems, "All menu items retrieved"));
    }

    const menuItems = await Menu.search(query);

    res.json(successResponse(menuItems, `Search results for "${query}"`));
  } catch (error) {
    console.error("Error searching menu items:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ GET all categories
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await Menu.getCategories();

    res.json(successResponse(categories, "Categories retrieved successfully"));
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ UPDATE availability
exports.updateMenuItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    if (is_available === undefined) {
      return res
        .status(400)
        .json(errorResponse(new Error("is_available field is required"), 400));
    }

    const updatedItem = await Menu.updateAvailability(id, is_available);

    if (!updatedItem) {
      return res
        .status(404)
        .json(errorResponse(new Error("Menu item not found"), 404));
    }

    res.json(
      successResponse(
        updatedItem,
        `Menu item ${is_available ? "enabled" : "disabled"} successfully`
      )
    );
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ DELETE menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await Menu.findById(id);
    if (!existingItem) {
      return res
        .status(404)
        .json(errorResponse(new Error("Menu item not found"), 404));
    }

    // Check if item is in any active orders
    const hasActiveOrders = await Menu.hasActiveOrders(id);
    if (hasActiveOrders) {
      return res
        .status(400)
        .json(
          errorResponse(
            new Error(
              "Cannot delete menu item with active orders. Disable instead."
            ),
            400
          )
        );
    }

    const deleted = await Menu.delete(id);

    res.json(
      successResponse(
        { id, name: existingItem.name },
        "Menu item deleted successfully"
      )
    );
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json(errorResponse(error));
  }
};

// ✅ NEW: Bulk update availability
exports.bulkUpdateAvailability = async (req, res) => {
  try {
    const { itemIds, is_available } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res
        .status(400)
        .json(
          errorResponse(
            new Error("itemIds array is required and cannot be empty"),
            400
          )
        );
    }

    if (is_available === undefined) {
      return res
        .status(400)
        .json(errorResponse(new Error("is_available field is required"), 400));
    }

    const updatedItems = await Menu.bulkUpdateAvailability(
      itemIds,
      is_available
    );

    res.json(
      successResponse(updatedItems, `Bulk updated ${updatedItems.length} items`)
    );
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json(errorResponse(error));
  }
};
// ✅ ADD THESE METHODS

// Bulk update availability
exports.bulkUpdateAvailability = async (req, res) => {
  try {
    const { itemIds, is_available } = req.body;
    
    // Validate
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "itemIds must be a non-empty array"
      });
    }
    
    // Call model method
    const updatedItems = await Menu.bulkUpdateAvailability(itemIds, is_available);
    
    res.json({
      success: true,
      message: `Updated ${updatedItems.length} items`,
      data: updatedItems
    });
    
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during bulk update"
    });
  }
};

// Upload image
exports.uploadMenuItemImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imageFile = req.file; // Need multer middleware
    
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: "No image file provided"
      });
    }
    
    // Update item with new image URL
    const updatedItem = await Menu.update(id, {
      image_url: `/uploads/menu/${imageFile.filename}`
    });
    
    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: updatedItem
    });
    
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      error: "Server error uploading image"
    });
  }
};

// ✅ UPDATE only preparation time
exports.updatePrepTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { preparation_time } = req.body;

    if (preparation_time === undefined || preparation_time < 0) {
      return res.status(400).json({ 
        success: false, 
        error: "preparation_time is required and must be positive" 
      });
    }

    const db = require('../db/pool');
    
    const result = await db.query(
      `UPDATE menu_items 
       SET preparation_time = $1 
       WHERE id = $2 
       RETURNING *`,
      [preparation_time, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Menu item not found" });
    }

    res.json({ 
      success: true, 
      message: "Preparation time updated successfully",
      data: result.rows[0] 
    });
  } catch (error) {
    console.error("Error updating prep time:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};