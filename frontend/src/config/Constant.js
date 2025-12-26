// src/config/constants.js
export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: "http://localhost:1994/api",

  // App Info
  APP_NAME: "Restaurant Digital Menu System",
  APP_VERSION: "1.0.0",

  // Feature Flags
  ENABLE_ANALYTICS: false,
  ENABLE_PWA: false,
};

// For development vs production
const env = {
  development: {
    API_BASE_URL: "http://localhost:1994/api",
  },
  production: {
    API_BASE_URL: "https://your-production-api.com/api",
  },
};

// Get current environment
const currentEnv = import.meta.env.MODE || "development";

// Merge configs
export const CONFIG = {
  ...APP_CONFIG,
  ...env[currentEnv],
  ENV: currentEnv,
};

console.log("⚙️ App Configuration:", CONFIG);
