import config from "../config/env.js";

/**
 * Generate the correct base URL for media files
 * @returns {string} The base URL for media files
 */
export const getBaseUrl = () => {
  // In production, use the production URL
  if (config.NODE_ENV === "production") {
    return "https://callgirls-api.onrender.com";
  }
  
  // In development, use localhost
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
  
  // If the path already contains a full URL, return it as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Ensure the path starts with uploads/
  const uploadsPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  
  return `${baseUrl}/${uploadsPath}`;
};

/**
 * Fix URLs in an object by replacing localhost with production URL
 * @param {Object} obj - The object containing URLs to fix
 * @returns {Object} The object with fixed URLs
 */
export const fixUrlsInObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const fixedObj = { ...obj };
  
  // Fix avatar URL
  if (fixedObj.avatar && typeof fixedObj.avatar === 'string') {
    fixedObj.avatar = generateMediaUrl(fixedObj.avatar);
  }
  
  // Fix gallery URLs
  if (fixedObj.gallery && Array.isArray(fixedObj.gallery)) {
    fixedObj.gallery = fixedObj.gallery.map(item => {
      if (typeof item === 'string') {
        return generateMediaUrl(item);
      }
      if (item && typeof item === 'object' && item.url) {
        return { ...item, url: generateMediaUrl(item.url) };
      }
      return item;
    });
  }
  
  // Fix video URLs
  if (fixedObj.videos && Array.isArray(fixedObj.videos)) {
    fixedObj.videos = fixedObj.videos.map(item => {
      if (typeof item === 'string') {
        return generateMediaUrl(item);
      }
      if (item && typeof item === 'object' && item.url) {
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
  
  return array.map(item => fixUrlsInObject(item));
};

export default {
  getBaseUrl,
  generateMediaUrl,
  fixUrlsInObject,
  fixUrlsInArray
};
