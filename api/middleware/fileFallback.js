import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple file fallback middleware
export const fileFallbackMiddleware = (req, res, next) => {
  // For now, just pass through to the next middleware
  // This can be enhanced later with actual fallback logic
  next();
};

// Simple file serving with fallback
export const serveFileWithFallback = (req, res, next) => {
  // For now, just pass through to the next middleware
  next();
};

// File storage health check
export const fileStorageHealth = async (req, res) => {
  try {
    const uploadPath = process.env.RAILWAY_STORAGE_PATH || "/app/uploads";

    // Check if upload directory exists
    const dirExists = fs.existsSync(uploadPath);

    // Check if we can write to the directory
    let writable = false;
    if (dirExists) {
      try {
        const testFile = path.join(uploadPath, "test-write.tmp");
        fs.writeFileSync(testFile, "test");
        fs.unlinkSync(testFile);
        writable = true;
      } catch (error) {
        writable = false;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        uploadPath,
        directoryExists: dirExists,
        writable,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "File storage health check failed",
      error: error.message,
    });
  }
};
