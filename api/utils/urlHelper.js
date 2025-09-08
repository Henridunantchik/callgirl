import config from "../config/env.js";

/**
 * Generate the correct base URL for media files
 * @returns {string} The base URL for media files
 */
export const getBaseUrl = () => {
  const envBase = config.BASE_URL || process.env.RAILWAY_EXTERNAL_URL;

  if (envBase && typeof envBase === "string") {
    return envBase.replace(/\/$/, "");
  }

  if (config.NODE_ENV === "production") {
    return (
      "https://" +
      (process.env.RAILWAY_STATIC_URL ||
        process.env.RAILWAY_PUBLIC_DOMAIN ||
        "localhost")
    );
  }

  return "http://localhost:5000";
};

/**
 * Generate a complete URL for a media file
 * @param {string} filePath - The file path relative to uploads directory
 * @returns {string} The complete URL for the media file
 */
export const generateMediaUrl = (filePath) => {
  if (!filePath) return null;

  const baseUrl = getBaseUrl();

  // If the path already contains a full URL, check if it's localhost and fix it
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    // If it's a localhost URL, replace it with production URL
    if (filePath.includes("localhost:5000")) {
      // Extract the path part after localhost:5000
      const pathPart = filePath
        .replace("http://localhost:5000", "")
        .replace("https://localhost:5000", "");
      // Normalize path separators (handle Windows backslashes)
      const normalizedPath = pathPart.replace(/\\/g, "/");
      return `${baseUrl}${normalizedPath}`;
    }
    // If it's already a production URL, return as is
    return filePath;
  }

  // Remove leading slash if present and normalize path separators
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  const normalizedPath = cleanPath.replace(/\\/g, "/");

  // Ensure the path starts with uploads/
  const uploadsPath = normalizedPath.startsWith("uploads/")
    ? normalizedPath
    : `uploads/${normalizedPath}`;

  return `${baseUrl}/${uploadsPath}`;
};

/**
 * Fix URLs in an object by replacing localhost with production URL
 * @param {Object} obj - The object containing URLs to fix
 * @returns {Object} The object with fixed URLs
 */
export const fixUrlsInObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const fixedObj = { ...obj };

  // Fix avatar URL
  if (fixedObj.avatar && typeof fixedObj.avatar === "string") {
    fixedObj.avatar = generateMediaUrl(fixedObj.avatar);
  }

  // Fix gallery URLs
  if (fixedObj.gallery && Array.isArray(fixedObj.gallery)) {
    fixedObj.gallery = fixedObj.gallery.map((item) => {
      if (typeof item === "string") {
        return generateMediaUrl(item);
      }
      if (item && typeof item === "object" && item.url) {
        return { ...item, url: generateMediaUrl(item.url) };
      }
      return item;
    });
  }

  // Fix video URLs
  if (fixedObj.videos && Array.isArray(fixedObj.videos)) {
    fixedObj.videos = fixedObj.videos.map((item) => {
      if (typeof item === "string") {
        return generateMediaUrl(item);
      }
      if (item && typeof item === "object" && item.url) {
        return { ...item, url: generateMediaUrl(item.url) };
      }
      return item;
    });
  }

  return fixedObj;
};

/**
 * Fix URLs in an array of objects
 * @param {Array} array - The array containing objects with URLs to fix
 * @returns {Array} The array with fixed URLs
 */
export const fixUrlsInArray = (array) => {
  if (!Array.isArray(array)) return array;

  return array.map((item) => fixUrlsInObject(item));
};

export default {
  getBaseUrl,
  generateMediaUrl,
  fixUrlsInObject,
  fixUrlsInArray,
};
