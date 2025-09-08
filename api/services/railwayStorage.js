// Railway Storage Service
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// multer not needed for this service

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RailwayStorage {
  constructor() {
    this.uploadPath =
      process.env.RAILWAY_STORAGE_PATH ||
      process.env.UPLOADS_PATH ||
      "/data/uploads";
    this.baseUrl =
      process.env.RAILWAY_EXTERNAL_URL || process.env.BASE_URL || "";

    // Initialize directories
    this.initializeDirectories();
  }

  /**
   * Initialize upload directories
   */
  initializeDirectories() {
    const directories = [
      this.uploadPath,
      path.join(this.uploadPath, "images"),
      path.join(this.uploadPath, "gallery"),
      path.join(this.uploadPath, "videos"),
      path.join(this.uploadPath, "avatars"),
      path.join(this.uploadPath, "documents"),
      path.join(this.uploadPath, "message-images"),
      path.join(this.uploadPath, "temp"),
    ];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Upload a file to Railway storage
   */
  async uploadFile(file, category = "images") {
    try {
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      // Create category directory if it doesn't exist
      const categoryPath = path.join(this.uploadPath, category);
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${extension}`;

      const filePath = path.join(categoryPath, filename);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      // Generate public URL
      const publicUrl = `${(this.baseUrl || "").replace(
        /\/$/,
        ""
      )}/uploads/${category}/${filename}`;

      return {
        success: true,
        publicId: filename,
        filePath: filePath,
        url: publicUrl,
        secureUrl: publicUrl,
        originalName: file.originalname,
        size: file.size,
        category: category,
      };
    } catch (error) {
      console.error("Railway storage upload error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a file from Railway storage
   */
  async deleteFile(filePath) {
    try {
      if (!filePath) {
        return { success: false, error: "No file path provided" };
      }

      // Check if file exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
        return { success: true };
      } else {
        console.log(`⚠️ File not found: ${filePath}`);
        return { success: true }; // Consider it successful if file doesn't exist
      }
    } catch (error) {
      console.error("Railway storage delete error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(filePath) {
    if (!filePath) return null;

    // If it's already a full URL, return as is
    if (filePath.startsWith("http")) {
      return filePath;
    }

    // Convert file path to URL
    const relativePath = filePath.replace(this.uploadPath, "");
    return `${(this.baseUrl || "").replace(/\/$/, "")}/uploads${relativePath}`;
  }

  /**
   * Check if file exists
   */
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Get file stats
   */
  getFileStats(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error("Error getting file stats:", error);
      return null;
    }
  }
}

// Create singleton instance
const railwayStorage = new RailwayStorage();

export default railwayStorage;
