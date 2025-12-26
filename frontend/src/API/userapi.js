// src/api/user.api.js
import { apiRequest } from "./apiconfig";
import { getAuthToken } from "./authapi";

// ✅ GET ALL USERS (ADMIN ONLY)
export const getAllUsers = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return await apiRequest("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ GET USER BY ID
export const getUserById = async (id) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return await apiRequest(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ UPDATE USER
export const updateUser = async (id, userData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return await apiRequest(`/users/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: userData,
  });
};

// ✅ DELETE USER (ADMIN ONLY)
export const deleteUser = async (id) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return await apiRequest(`/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ GET CURRENT USER DETAILS
export const getCurrentUserDetails = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return await apiRequest("/users/me/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ✅ UPDATE CURRENT USER
export const updateCurrentUser = async (userData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return await apiRequest("/users/me/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: userData,
  });
};
