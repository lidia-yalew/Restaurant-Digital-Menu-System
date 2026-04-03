import * as menuAPI from "../API/menuapi";
import { formatData } from "../utils/formatter";
import { validateFields } from "../utils/validator";
import { MENU_CATEGORIES } from "../pages/Manager/Menu/menuConstants";

// Fetch categories - returns array of category strings
export const fetchMenuCategoriesService = async () => {
  try {
    const response = await menuAPI.getMenuCategories();
    console.log('Categories API response:', response);
    
    // Extract array from response safely
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      if (response.data.length > 0 && typeof response.data[0] === 'object') {
        return response.data.map(cat => cat.category || cat.name || cat);
      }
      return response.data;
    }
    if (response?.categories && Array.isArray(response.categories)) {
      return response.categories;
    }
    
    return MENU_CATEGORIES;
  } catch (error) {
    console.error('Error in fetchMenuCategoriesService:', error);
    return MENU_CATEGORIES;
  }
};

// Create menu item
export const createMenuItemService = async (data) => {
  try {
    validateFields(data, ["name", "price", "category"]);
    
    const formattedData = formatData({
      ...data,
      price: Number(data.price),
      preparation_time: Number(data.preparation_time) || 15,
      is_available: data.is_available !== false,
      image_url: data.image_url || ""
    });
    
    return await menuAPI.createMenuItemAPI(formattedData);
  } catch (error) {
    console.error('Error in createMenuItemService:', error);
    throw error;
  }
};

// Get menu items
export const fetchMenuService = async () => {
  try {
    const response = await menuAPI.getMenuItems();
    
    if (Array.isArray(response)) return response;
    if (response?.data?.items && Array.isArray(response.data.items)) return response.data.items;
    if (response?.items && Array.isArray(response.items)) return response.items;
    
    return [];
  } catch (error) {
    console.error('Error in fetchMenuService:', error);
    return [];
  }
};

export const fetchMenuByIdService = async (id) => {
  return await menuAPI.getMenuItemById(id);
};

export const updateMenuService = async (id, data) => {
  const formattedData = formatData(data);
  return await menuAPI.updateMenuItemAPI(id, formattedData);
};

export const deleteMenuService = async (id) => {
  return await menuAPI.deleteMenuItem(id);
};

export const toggleMenuItemAvailabilityService = async (id, currentStatus) => {
  return await menuAPI.toggleMenuItemAvailability(id, currentStatus);
};