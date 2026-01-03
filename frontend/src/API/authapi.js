// src/api/auth.api.js
import { apiRequest } from "./apiconfig";

// Store token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};
//get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};
// Remove token from localStorage
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

// ✅ REGISTER NEW USER (with auto-login)
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: userData,
    });

    // ✅ AUTO-LOGIN: Token is now returned from register
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

// ✅ UPDATE USER PROFILE (FIXED ROUTE)
export const updateProfile = async (userData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // ✅ FIXED: Now uses correct route /auth/profile
    return await apiRequest("/auth/profile", {
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

// ✅ VERIFY AUTH STATUS (UPDATED for consistent format)
export const verifyAuth = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      return { 
        isAuthenticated: false, 
        user: null, 
        message: "No token found" 
      };
    }

    try {
      const response = await apiRequest("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ UPDATED: Check response.success instead of response.valid
      if (response.success && response.valid) {
        localStorage.setItem("user", JSON.stringify(response.user));
        return {
          isAuthenticated: true,
          user: response.user,
          token: token,
        };
      }

      removeAuthToken();
      return { 
        isAuthenticated: false, 
        user: null, 
        message: "Invalid token" 
      };
      
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
    return { 
      isAuthenticated: false, 
      user: null 
    };
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
// ✅ REFRESH TOKEN
export const refreshToken = async () => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error("No token to refresh");
    }

    const response = await apiRequest("/auth/refresh-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.token) {
      setAuthToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  } catch {
    // If refresh fails, user needs to login again
    removeAuthToken();
    throw new Error("Session expired. Please login again.");
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
