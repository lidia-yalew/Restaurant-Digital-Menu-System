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
  try {
    const response = await menuAPI.getMenuItemById(id);
    console.log('Raw API response from getMenuItemById:', response);
    
    // Handle different response structures
    let item = null;
    
    if (response?.data && typeof response.data === 'object') {
      item = response.data;
    } else if (response && typeof response === 'object') {
      item = response;
    }
    
    if (!item || !item.id) {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid menu item data received');
    }
    
    console.log('Extracted menu item:', item);
    return item;
  } catch (error) {
    console.error('Error in fetchMenuByIdService:', error);
    throw error;
  }
};

// menuservice.js - Update these functions

export const updateMenuService = async (id, data) => {
  try {
    console.log('========== UPDATE MENU SERVICE ==========');
    console.log('1. Received id:', id);
    console.log('2. Received data:', JSON.stringify(data, null, 2));
    console.log('3. Data name value:', data.name);
    console.log('4. Data name type:', typeof data.name);
    console.log('5. Is name empty?', !data.name);
    
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      console.error('Name is missing or empty!');
      throw new Error('Name is required');
    }
    
    if (!data.price || data.price <= 0) {
      console.error('Price is invalid!');
      throw new Error('Valid price is required');
    }
    
    if (!data.category) {
      console.error('Category is missing!');
      throw new Error('Category is required');
    }
    
    const formattedData = formatData(data);
    console.log('6. Formatted data:', JSON.stringify(formattedData, null, 2));
    console.log('7. Formatted name:', formattedData.name);
    
    const response = await menuAPI.updateMenuItemAPI(id, formattedData);
    console.log('8. Update response:', response);
    console.log('=========================================');
    return response;
  } catch (error) {
    console.error('Error in updateMenuService:', error);
    throw error;
  }
};

export const deleteMenuService = async (id) => {
  return await menuAPI.deleteMenuItem(id);
};

export const toggleMenuItemAvailabilityService = async (id, currentStatus) => {
  return await menuAPI.toggleMenuItemAvailability(id, currentStatus);
};

// ✅ NEW: Upload image service
export const uploadImageService = async (imageFile) => {
  try {
    // Validate file
    if (!imageFile) {
      throw new Error('No image file provided');
    }
    
    // Call the API to upload
    const response = await menuAPI.uploadImage(imageFile);
    
    if (response.success) {
      return response.imageUrl;
    }
    throw new Error(response.error || 'Upload failed');
  } catch (error) {
    console.error('Error in uploadImageService:', error);
    throw error;
  }
};

// ✅ NEW: Delete uploaded image service (optional)
export const deleteUploadedImageService = async (filename) => {
  try {
    if (!filename) {
      throw new Error('No filename provided');
    }
    
    const response = await menuAPI.deleteUploadedImage(filename);
    return response;
  } catch (error) {
    console.error('Error in deleteUploadedImageService:', error);
    throw error;
  }
};