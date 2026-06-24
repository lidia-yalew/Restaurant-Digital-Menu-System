import { apiRequest } from "./apiconfig";
import { getAuthToken } from "./authapi";

// ✅ GET ALL USERS (ADMIN DASHBOARD)
export const getAllUsers = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required");

  return await apiRequest("/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ UPDATE USER ROLE (ADMIN ONLY)
export const updateUserRole = async (userId, newRole) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required");

  return await apiRequest(`/user/${userId}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: { role: newRole },
  });
};

// ✅ DELETE USER (ADMIN ONLY)
export const deleteUser = async (userId) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required");

  return await apiRequest(`/user/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ GET USER STATISTICS (ADMIN DASHBOARD)
export const getUserStats = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required");

  return await apiRequest("/user/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ SEARCH USERS (ADMIN ONLY)
export const searchUsers = async (searchTerm) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required");

  return await apiRequest(`/user/search?q=${encodeURIComponent(searchTerm)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

