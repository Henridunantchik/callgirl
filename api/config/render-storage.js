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
    documents:
      config.NODE_ENV === "production"
        ? "/opt/render/project/src/uploads/documents"
        : path.join(__dirname, "../uploads/documents"),
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
      ? process.env.RENDER_EXTERNAL_URL || "https://callgirls-api.onrender.com"
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
      console.log("🌍 Environment:", config.NODE_ENV);
      console.log("📁 Upload path:", renderStorageConfig.uploadPath);
      console.log("🌐 Base URL:", renderStorageConfig.baseUrl);
    } catch (error) {
      console.error("❌ Error initializing Render storage:", error);
    }
  },

  // Get file URL - Fixed for production
  getFileUrl: (filePath) => {
    try {
      // For production, we need to handle the Render path correctly
      if (config.NODE_ENV === "production") {
        // Extract the relative path from the full file path
        const relativePath = filePath.replace(
          "/opt/render/project/src/uploads",
          ""
        );
        const cleanPath = relativePath.replace(/\\/g, "/"); // Ensure forward slashes

        // Build the full URL
        const fullUrl = `${renderStorageConfig.baseUrl}/uploads${cleanPath}`;
        console.log(`🔗 Generated URL: ${fullUrl} from path: ${filePath}`);
        return fullUrl;
      } else {
        // Development - use local path
        const relativePath = filePath.replace(
          path.join(__dirname, "../uploads"),
          ""
        );
        // Ensure forward slashes for URLs
        const cleanPath = relativePath.replace(/\\/g, "/");
        return `${renderStorageConfig.baseUrl}/uploads${cleanPath}`;
      }
    } catch (error) {
      console.error("❌ Error generating file URL:", error);
      // Fallback to a basic URL
      return `${renderStorageConfig.baseUrl}/uploads/fallback`;
    }
  },

  // Check available space
  getAvailableSpace: () => {
    try {
      const stats = fs.statSync(renderStorageConfig.uploadPath);
      // This is a simplified check - in production you'd want more sophisticated space monitoring
      return {
        success: true,
        path: renderStorageConfig.uploadPath,
        exists: true,
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: renderStorageConfig.uploadPath,
      };
    }
  },

  // List files in directory
  listFiles: (directory) => {
    try {
      const dirPath = renderStorageConfig.directories[directory] || directory;
      if (!fs.existsSync(dirPath)) {
        return { success: false, error: "Directory not found", files: [] };
      }

      const files = fs.readdirSync(dirPath);
      const fileList = files.map((file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: renderStorageConfig.getFileUrl(filePath),
        };
      });

      return { success: true, files: fileList };
    } catch (error) {
      return { success: false, error: error.message, files: [] };
    }
  },

  // Test file access
  testFileAccess: (filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: "File not found" };
      }

      const stats = fs.statSync(filePath);
      const url = renderStorageConfig.getFileUrl(filePath);

      return {
        success: true,
        exists: true,
        size: stats.size,
        url: url,
        accessible: true,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default renderStorageConfig;
