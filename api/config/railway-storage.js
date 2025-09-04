// Railway Storage Configuration
import path from "path";
import fs from "fs";

const railwayStorageConfig = {
  // Railway storage paths
  uploadPath: process.env.RAILWAY_STORAGE_PATH || "/app/uploads",
  baseUrl: process.env.RAILWAY_EXTERNAL_URL || "https://api.epicescorts.live",

  // Directory structure
  directories: {
    images: "/app/uploads/images",
    gallery: "/app/uploads/gallery",
    videos: "/app/uploads/videos",
    avatars: "/app/uploads/avatars",
    documents: "/app/uploads/documents",
    temp: "/app/uploads/temp",
  },

  // Initialize directories
  initializeDirectories: () => {
    const basePath = railwayStorageConfig.uploadPath;

    // Create base upload directory
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
      console.log(`✅ Created base upload directory: ${basePath}`);
    }

    // Create subdirectories
    Object.values(railwayStorageConfig.directories).forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });

    console.log("✅ Railway storage initialized successfully");
  },

  // Get file URL
  getFileUrl: (filePath) => {
    const relativePath = filePath.replace(railwayStorageConfig.uploadPath, "");
    return `${railwayStorageConfig.baseUrl}/uploads${relativePath}`;
  },
};

export default railwayStorageConfig;
