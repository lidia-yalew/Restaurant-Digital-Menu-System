import { apiRequest, authRequest } from "./apiconfig";

// ✅ PUBLIC: Get all menu items with filters
export const getMenuItems = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.category) queryParams.append("category", filters.category);
  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
  if (filters.available !== undefined)
    queryParams.append("available", filters.available);
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.page) queryParams.append("page", filters.page);
  if (filters.limit) queryParams.append("limit", filters.limit);

  const queryString = queryParams.toString();
  const url = queryString ? `/menu?${queryString}` : "/menu";

  return await apiRequest(url);
};

// ✅ PUBLIC: Get menu items by category
export const getMenuItemsByCategory = async (category, filters = {}) => {
  return await getMenuItems({ category, ...filters });
};

// ✅ PUBLIC: Search menu items
export const searchMenuItems = async (query, filters = {}) => {
  if (!query || query.trim() === "") {
    return await getMenuItems(filters);
  }
  return await apiRequest(`/menu/search/${encodeURIComponent(query)}`);
};

// ✅ PUBLIC: Get single menu item
export const getMenuItemById = async (id) => {
  return await apiRequest(`/menu/${id}`);
};

// ✅ PUBLIC: Get all categories
export const getMenuCategories = async () => {
  return await apiRequest("/menu/categories/all");
};

// ✅ ADMIN: Create new menu item
export const createMenuItemAPI = (payload) => {
  return authRequest("/menu", {
    method: "POST",
    body: payload,
  });
};
// ✅ update menu item
export const updateMenuItemAPI = (id, payload) => {
  return authRequest(`/menu/${id}`, {
    method: "PUT",
    body: payload,
  });
};

// ✅ STAFF/ADMIN: Toggle availability
export const toggleMenuItemAvailability = async (id, currentStatus) => {
  return await authRequest(`/menu/${id}/availability`, {
    method: "PATCH",
    body: { is_available: !currentStatus },
  });
};

// ✅ ADMIN: Delete menu item
export const deleteMenuItem = async (id) => {
  return await authRequest(`/menu/${id}`, {
    method: "DELETE",
  });
};

// ✅ NEW: Bulk update availability
export const bulkUpdateAvailability = async (itemIds, isAvailable) => {
  return await authRequest("/menu/bulk/availability", {
    method: "POST",
    body: { itemIds, is_available: isAvailable },
  });
};

// ✅ NEW: Upload menu item image
export const uploadMenuItemImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return await authRequest(`/menu/${id}/image`, {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};
