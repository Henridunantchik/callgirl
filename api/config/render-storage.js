// Minimal render-storage.js to prevent import errors
// This file exists to prevent Railway deployment crashes

const renderStorageConfig = {
  uploadPath: process.env.RAILWAY_STORAGE_PATH || "/app/uploads",
  baseUrl: process.env.RAILWAY_EXTERNAL_URL || "https://api.epicescorts.live",

  // Minimal implementation
  getFileUrl: (filePath) => {
    return `/uploads/${filePath}`;
  },

  // No-op functions to prevent errors
  init: () => {},
  initializeDirectories: () => {},
};

export default renderStorageConfig;
