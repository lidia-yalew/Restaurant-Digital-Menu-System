import * as AboutAPI from "../API/menuapi";
import { formatData } from "../utils/formatter";
import { validateFields } from "../utils/validator";


export const createMenuItemService = async (data) => {
  validateFields(data, ["name", "price", "category"]);

  const formatted = formatData({
    ...data,
    price: Number(data.price),
    is_available: data.is_available !== false,
    image_url: data.image_url || "/images/default.jpg",
    ingredients: data.ingredients || [],
  });

  return AboutAPI.createMenuItemAPI(formatted);
};

export async function fetchMenuService() {
  return AboutAPI.getMenuItems()
}

export async function fetchMenuByIdService(id) {
  return AboutAPI.getMenuItemById(id);
}

export async function fetchMenuCategoriesService() {
  return AboutAPI.getMenuCategories();
}

export async function fetchMenuByCategoryService(category, filters) {
  return AboutAPI.getMenuItemsByCategory(category, filters);
}

export async function searchMenuService(query, filters) {
  return AboutAPI.searchMenuItems(query, filters);
}
export async function updateMenuService(id,data) {
    const formatData = formatData(data);
  return AboutAPI.updateMenuItemAPI(id, formatData);
}

export async function deleteMenuService(id) {
  return AboutAPI.deleteMenuItem(id);
}


export async function toggleMenuItemAvailabilityService(id, currentStatus) {
  return AboutAPI.toggleMenuItemAvailability(id, currentStatus);
}

export async function bulkUpdateAvailabilityService(ids, status) {
  return AboutAPI.bulkUpdateAvailability(ids, status);
}

export async function uploadMenuItemImageService(file) {
  return AboutAPI.uploadMenuItemImage(file);
}