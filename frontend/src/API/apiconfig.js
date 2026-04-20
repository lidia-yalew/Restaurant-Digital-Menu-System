import { CONFIG } from "../config/Constant";

const API_BASE_URL = CONFIG.API_BASE_URL;

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Don't set Content-Type for FormData
  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (config.body && typeof config.body !== "string" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("❌ API request failed:", { url, error: error.message });
    throw error;
  }
};

export const authRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }
  
  return apiRequest(endpoint, { ...options, headers });
};

export { API_BASE_URL };