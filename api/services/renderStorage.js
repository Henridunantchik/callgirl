import fs from "fs";
import path from "path";
import renderStorageConfig from "../config/render-storage.js";

class RenderStorageService {
  constructor() {
    // Initialize storage on startup
    renderStorageConfig.init();
  }

  // Upload file to Render storage
  async uploadFile(file, folder = "general") {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${timestamp}-${randomId}${fileExtension}`;

      // Determine upload directory based on folder
      let uploadDir;
      switch (folder) {
        case "avatar":
          uploadDir = renderStorageConfig.directories.avatars;
          break;
        case "gallery":
          uploadDir = renderStorageConfig.directories.gallery;
          break;
        case "video":
          uploadDir = renderStorageConfig.directories.videos;
          break;
        case "documents":
          uploadDir = renderStorageConfig.directories.documents;
          break;
        default:
          uploadDir = renderStorageConfig.directories.images;
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);

      // Move file to destination
      await fs.promises.copyFile(file.path, filePath);

      // Clean up temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Generate public URL
      const publicUrl = renderStorageConfig.getFileUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        publicId: fileName,
        filePath: filePath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      console.error("Error uploading file to Render storage:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete file from Render storage
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
      return { success: false, error: "File not found" };
    } catch (error) {
      console.error("Error deleting file from Render storage:", error);
      return { success: false, error: error.message };
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          success: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: renderStorageConfig.getFileUrl(filePath),
        };
      }
      return { success: false, error: "File not found" };
    } catch (error) {
      console.error("Error getting file info:", error);
      return { success: false, error: error.message };
    }
  }

  // List files in directory
  async listFiles(directory) {
    try {
      const dirPath = renderStorageConfig.directories[directory] || directory;
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        return {
          success: true,
          files: files.map((file) => ({
            name: file,
            path: path.join(dirPath, file),
            url: renderStorageConfig.getFileUrl(path.join(dirPath, file)),
          })),
        };
      }
      return { success: false, error: "Directory not found" };
    } catch (error) {
      console.error("Error listing files:", error);
      return { success: false, error: error.message };
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const stats = renderStorageConfig.getAvailableSpace();
      return {
        success: true,
        total: stats.total,
        used: stats.used,
        available: stats.available,
        usagePercentage: ((stats.used / stats.total) * 100).toFixed(2),
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new RenderStorageService();
