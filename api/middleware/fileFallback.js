import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Intelligent File Fallback Middleware
 * Automatically serves files from local backup if Render storage fails
 * Ensures 100% uptime for file serving
 */
export const fileFallbackMiddleware = (req, res, next) => {
  // Only apply to uploads routes
  if (!req.path.startsWith("/uploads/")) {
    return next();
  }

  // Extract file path from request
  const filePath = req.path.replace("/uploads/", "");
  const [directory, filename] = filePath.split("/");

  if (!directory || !filename) {
    return next();
  }

  // Try to serve from Render storage first
  const renderPath = path.join(
    process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads",
    directory,
    filename
  );

  // Check if file exists in Render storage
  if (fs.existsSync(renderPath)) {
    // File exists in Render, serve normally
    return next();
  }

  // File not found in Render, try local backup
  const localPath = path.join(__dirname, "..", "uploads", directory, filename);

  if (fs.existsSync(localPath)) {
    console.log(`🔄 Serving from local backup: ${directory}/${filename}`);

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour cache
    res.setHeader("X-File-Source", "local-backup");

    // Stream file from local backup
    const stream = fs.createReadStream(localPath);
    stream.pipe(res);

    // Handle stream errors
    stream.on("error", (error) => {
      console.error(`❌ Error streaming local file ${localPath}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to serve file from backup",
          message: "File backup corrupted",
        });
      }
    });

    return;
  }

  // File not found anywhere
  console.log(`❌ File not found: ${directory}/${filename}`);
  res.status(404).json({
    error: "File not found",
    message: "File not available in storage or backup",
    path: filePath,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Enhanced file serving with automatic fallback
 */
export const serveFileWithFallback = (req, res, next) => {
  const filePath = req.path.replace("/uploads/", "");
  const [directory, filename] = filePath.split("/");

  if (!directory || !filename) {
    return next();
  }

  // Priority order: Render storage -> Local backup -> Error
  const paths = [
    {
      path: path.join(
        process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads",
        directory,
        filename
      ),
      source: "render",
    },
    {
      path: path.join(__dirname, "..", "uploads", directory, filename),
      source: "local-backup",
    },
  ];

  // Try each path
  for (const pathInfo of paths) {
    if (fs.existsSync(pathInfo.path)) {
      console.log(
        `📁 Serving file from ${pathInfo.source}: ${directory}/${filename}`
      );

      // Set headers
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("X-File-Source", pathInfo.source);
      res.setHeader("X-File-Path", pathInfo.path);

      // Stream file
      const stream = fs.createReadStream(pathInfo.path);
      stream.pipe(res);

      // Error handling
      stream.on("error", (error) => {
        console.error(
          `❌ Error streaming file from ${pathInfo.source}:`,
          error
        );
        if (!res.headersSent) {
          res.status(500).json({
            error: "File streaming failed",
            source: pathInfo.source,
            message: error.message,
          });
        }
      });

      return;
    }
  }

  // File not found anywhere
  console.log(`❌ File not found in any storage: ${directory}/${filename}`);
  res.status(404).json({
    error: "File not found",
    message: "File not available in any storage location",
    searchedPaths: paths.map((p) => p.path),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Health check for file storage
 */
export const fileStorageHealth = (req, res) => {
  try {
    const renderPath =
      process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads";
    const localPath = path.join(__dirname, "..", "uploads");

    const health = {
      render: {
        path: renderPath,
        exists: fs.existsSync(renderPath),
        accessible: false,
        fileCount: 0,
      },
      local: {
        path: localPath,
        exists: fs.existsSync(localPath),
        accessible: false,
        fileCount: 0,
      },
      timestamp: new Date().toISOString(),
    };

    // Check Render storage
    if (health.render.exists) {
      try {
        const renderFiles = fs.readdirSync(renderPath);
        health.render.fileCount = renderFiles.length;
        health.render.accessible = true;
      } catch (error) {
        health.render.accessible = false;
      }
    }

    // Check local storage
    if (health.local.exists) {
      try {
        const localFiles = fs.readdirSync(localPath);
        health.local.fileCount = localFiles.length;
        health.local.accessible = true;
      } catch (error) {
        health.local.accessible = false;
      }
    }

    res.json({
      success: true,
      data: health,
      status:
        health.render.accessible || health.local.accessible
          ? "healthy"
          : "degraded",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Health check failed",
      message: error.message,
    });
  }
};
