/**
 * Frontend URL Helper - Fixes localhost URLs to production URLs
 */

/**
 * Get the correct base URL for the current environment
 * @returns {string} The base URL for the current environment
 */
export const getBaseUrl = () => {
  // Check if we're in production (deployed on Vercel/Netlify)
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://epic-escorts-production.up.railway.app"; // Use Railway backend
  }

  // In development, use localhost
  return "http://localhost:5000";
};

/**
 * Fix a URL by replacing localhost with the correct production URL
 * @param {string} url - The URL to fix
 * @returns {string} The fixed URL
 */
export const fixUrl = (url) => {
  if (!url) return url;

  // If the URL already contains a full domain, return it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Only fix localhost URLs
    if (url.includes("localhost:5000")) {
      return url.replace("http://localhost:5000", getBaseUrl());
    }
    return url;
  }

  // If it's a relative URL, prepend the base URL
  const baseUrl = getBaseUrl();
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

/**
 * Fix URLs in an object recursively
 * @param {Object} obj - The object to fix URLs in
 * @returns {Object} The object with fixed URLs
 */
export const fixUrlsInObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const fixed = { ...obj };

  for (const [key, value] of Object.entries(fixed)) {
    if (
      typeof value === "string" &&
      (key === "url" ||
        key === "avatar" ||
        key.includes("image") ||
        key.includes("photo"))
    ) {
      fixed[key] = fixUrl(value);
    } else if (Array.isArray(value)) {
      fixed[key] = fixUrlsInArray(value);
    } else if (typeof value === "object" && value !== null) {
      fixed[key] = fixUrlsInObject(value);
    }
  }

  return fixed;
};

/**
 * Fix URLs in an array
 * @param {Array} arr - The array to fix URLs in
 * @returns {Array} The array with fixed URLs
 */
export const fixUrlsInArray = (arr) => {
  if (!Array.isArray(arr)) return arr;

  return arr.map((item) => {
    if (typeof item === "object" && item !== null) {
      return fixUrlsInObject(item);
    }
    return item;
  });
};

/**
 * Fix URLs in user/escort data
 * @param {Object} data - The user or escort data
 * @returns {Object} The data with fixed URLs
 */
export const fixUserUrls = (data) => {
  if (!data) return data;

  const fixed = { ...data };

  // Fix avatar URL
  if (fixed.avatar) {
    fixed.avatar = fixUrl(fixed.avatar);
  }

  // Fix gallery URLs
  if (fixed.gallery && Array.isArray(fixed.gallery)) {
    fixed.gallery = fixed.gallery.map((item) => {
      if (typeof item === "string") {
        return fixUrl(item);
      }
      if (typeof item === "object" && item.url) {
        return { ...item, url: fixUrl(item.url) };
      }
      return item;
    });
  }

  // Fix video URLs
  if (fixed.videos && Array.isArray(fixed.videos)) {
    fixed.videos = fixed.videos.map((item) => {
      if (typeof item === "string") {
        return fixUrl(item);
      }
      if (typeof item === "object" && item.url) {
        return { ...item, url: fixUrl(item.url) };
      }
      return item;
    });
  }

  return fixed;
};
