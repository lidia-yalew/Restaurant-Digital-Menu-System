import { apiRequest } from "./apiconfig";

// ✅ GET all menu items
export const getMenuItems = async () => {
  return await apiRequest("/menu");
};

// ✅ GET menu items by category (NOW USING BACKEND)
export const getMenuItemsByCategory = async (category) => {
  return await apiRequest(`/menu/category/${category}`);
};

// ✅ GET single menu item by ID
export const getMenuItemById = async (id) => {
  return await apiRequest(`/menu/${id}`);
};

// ✅ CREATE new menu item (ADMIN ONLY) - FIXED to include is_available
export const createMenuItem = async (itemData) => {
  return await apiRequest("/menu", {
    method: "POST",
    body: JSON.stringify({
      name: itemData.name,
      description: itemData.description,
      price: parseFloat(itemData.price), // Ensure it's a number
      category: itemData.category,
      image_url: itemData.image_url || itemData.imageUrl, // Handle both naming conventions
      is_available:
        itemData.is_available !== undefined ? itemData.is_available : true,
    }),
  });
};

// ✅ UPDATE menu item (ADMIN ONLY) - FIXED to include is_available
export const updateMenuItem = async (id, itemData) => {
  return await apiRequest(`/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: itemData.name,
      description: itemData.description,
      price: parseFloat(itemData.price),
      category: itemData.category,
      image_url: itemData.image_url || itemData.imageUrl,
      is_available:
        itemData.is_available !== undefined ? itemData.is_available : true,
    }),
  });
};

// ✅ NEW: Update availability only (for kitchen quick toggle)
export const updateMenuItemAvailability = async (id, isAvailable) => {
  return await apiRequest(`/menu/${id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ is_available: isAvailable }),
  });
};

// ✅ DELETE menu item (ADMIN ONLY)
export const deleteMenuItem = async (id) => {
  return await apiRequest(`/menu/${id}`, {
    method: "DELETE",
  });
};

// api/menu.api.js - Update search function
export const searchMenuItems = async (query) => {
  // Validate query is not empty
  if (!query || query.trim() === "") {
    console.log("Empty search query, returning empty array");
    return [];
  }
  return await apiRequest(`/menu/search/${encodeURIComponent(query)}`);
};

// ✅ NEW: Get all categories
export const getMenuCategories = async () => {
  return await apiRequest("/menu/categories/all");
};

// ✅ NEW: Toggle availability (convenience function)
export const toggleMenuItemAvailability = async (id, currentStatus) => {
  return await updateMenuItemAvailability(id, !currentStatus);
};
