import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render storage configuration
const renderStorageConfig = {
  // Base upload directory - Use local path for development, Render path for production
  uploadPath:
    config.NODE_ENV === "production"
      ? process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads"
      : path.join(__dirname, "../uploads"),

  // Create directories if they don't exist
  directories: {
    images:
      config.NODE_ENV === "production"
        ? "/opt/render/project/src/uploads/images"
        : path.join(__dirname, "../uploads/images"),
    videos:
      config.NODE_ENV === "production"
        ? "/opt/render/project/src/uploads/videos"
        : path.join(__dirname, "../uploads/videos"),
    avatars:
      config.NODE_ENV === "production"
        ? "/opt/render/project/src/uploads/avatars"
        : path.join(__dirname, "../uploads/avatars"),
    gallery:
      config.NODE_ENV === "production"
        ? "/opt/render/project/src/uploads/gallery"
        : path.join(__dirname, "../uploads/gallery"),
    temp:
      config.NODE_ENV === "production"
        ? "/opt/render/project/src/uploads/temp"
        : path.join(__dirname, "../uploads/temp"),
  },

  // File size limits
  limits: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    avatar: 5 * 1024 * 1024, // 5MB
  },

  // Allowed file types
  allowedTypes: {
    images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    videos: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
  },

  // URL base for serving files - Use localhost for development, Render URL for production
  baseUrl:
    config.NODE_ENV === "production"
      ? "https://callgirls-api.onrender.com"
      : "http://localhost:5000",

  // Initialize storage directories
  init: () => {
    try {
      // Create base upload directory
      if (!fs.existsSync(renderStorageConfig.uploadPath)) {
        fs.mkdirSync(renderStorageConfig.uploadPath, { recursive: true });
        console.log(
          "✅ Created base upload directory:",
          renderStorageConfig.uploadPath
        );
      }

      // Create subdirectories
      Object.values(renderStorageConfig.directories).forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log("✅ Created directory:", dir);
        }
      });

      console.log("✅ Render storage initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Render storage:", error);
    }
  },

  // Get file URL
  getFileUrl: (filePath) => {
    const relativePath = filePath.replace(renderStorageConfig.uploadPath, "");
    return `${renderStorageConfig.baseUrl}/uploads${relativePath}`;
  },

  // Check available space
  getAvailableSpace: () => {
    try {
      const stats = fs.statSync(renderStorageConfig.uploadPath);
      // This is a simplified check - in production you'd want more sophisticated space monitoring
      return {
        total: 1024 * 1024 * 1024, // 1GB (Render free tier)
        used: 0, // Would need to calculate actual usage
        available: 1024 * 1024 * 1024, // Simplified
      };
    } catch (error) {
      console.error("Error checking storage space:", error);
      return { total: 0, used: 0, available: 0 };
    }
  },
};

export default renderStorageConfig;
