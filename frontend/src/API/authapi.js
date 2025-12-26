// src/api/auth.api.js
import { apiRequest } from "./apiconfig";

// Store token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ✅ USER LOGIN
export const login = async (username, password) => {
  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
    });

    if (response.token) {
      setAuthToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    removeAuthToken();
    throw new Error(error.message || "Login failed");
  }
};

// ✅ USER LOGOUT
export const logout = async () => {
  try {
    // Try to logout on server
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } catch {
    // Server logout failed, continue with client cleanup
    console.warn("Server logout failed, clearing client storage only");
  } finally {
    // Always clear client-side storage
    removeAuthToken();
  }

  return { success: true, message: "Logged out successfully" };
};

// ✅ REGISTER NEW USER
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: userData,
    });

    // Auto-login after registration if token is returned
    if (response.token) {
      setAuthToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
};

// ✅ GET USER PROFILE
export const getProfile = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    return await apiRequest("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error(error.message || "Failed to get profile");
  }
};

// ✅ UPDATE USER PROFILE
export const updateProfile = async (userData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    return await apiRequest("/users/me/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: userData,
    });
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
};

// ✅ CHANGE PASSWORD
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    return await apiRequest("/auth/change-password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { currentPassword, newPassword },
    });
  } catch (error) {
    throw new Error(error.message || "Failed to change password");
  }
};

// ✅ VERIFY AUTH STATUS
export const verifyAuth = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      return { isAuthenticated: false, user: null, message: "No token found" };
    }

    try {
      const response = await apiRequest("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.valid) {
        localStorage.setItem("user", JSON.stringify(response.user));
        return {
          isAuthenticated: true,
          user: response.user,
          token: token,
        };
      }

      removeAuthToken();
      return { isAuthenticated: false, user: null, message: "Invalid token" };
    } catch {
      // If /auth/verify doesn't exist or fails, try getProfile
      console.warn("/auth/verify failed, trying getProfile");

      try {
        const profileResponse = await getProfile();
        if (profileResponse.user) {
          return {
            isAuthenticated: true,
            user: profileResponse.user,
            token: token,
          };
        }
      } catch {
        removeAuthToken();
        return {
          isAuthenticated: false,
          user: null,
          message: "Token verification failed",
        };
      }
    }

    removeAuthToken();
    return { isAuthenticated: false, user: null };
  } catch {
    removeAuthToken();
    return {
      isAuthenticated: false,
      user: null,
      message: "Authentication error",
    };
  }
};

// ✅ GET CURRENT USER (SYNCHRONOUS - from localStorage)
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    const token = getAuthToken();

    if (!token || !userStr) {
      return null;
    }

    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// ✅ CHECK IF USER IS ADMIN
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === "admin";
};

// ✅ CHECK IF USER IS STAFF
export const isStaff = () => {
  const user = getCurrentUser();
  return user && (user.role === "admin" || user.role === "staff");
};

// ✅ CHECK IF USER IS CUSTOMER
export const isCustomer = () => {
  const user = getCurrentUser();
  return user && user.role === "customer";
};

// ✅ GET AUTH HEADERS FOR API REQUESTS
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ REMOVE AUTH TOKEN (helper)
export { removeAuthToken, getAuthToken, setAuthToken };
