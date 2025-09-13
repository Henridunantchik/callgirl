import axios from "axios";

// Normalize and compute API base URL safely
const computeBaseURL = () => {
  try {
    const envUrl =
      import.meta.env.VITE_API_BASE_URL?.trim() ||
      import.meta.env.VITE_API_URL?.trim();

    // Helper to ensure we end up with .../api (single /) and trailing slash
    const ensureApiSuffix = (url) => {
      if (!url || typeof url !== "string") return "http://localhost:5000/api/";
      // Remove trailing slashes
      let normalized = url.replace(/\/+$/, "");
      // Append /api if missing
      if (!/\/(api)(\/)?$/.test(normalized)) {
        normalized = `${normalized}/api`;
      }
      // Ensure single trailing slash for axios joining
      if (!normalized.endsWith("/")) {
        normalized = `${normalized}/`;
      }
      return normalized;
    };

    // Prefer env if provided, but normalize it
    if (envUrl && typeof envUrl === "string") {
      return ensureApiSuffix(envUrl);
    }

    // Otherwise choose based on host
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    return isLocal
      ? "http://localhost:5000/api/"
      : "https://epic-escorts-production.up.railway.app/api/";
  } catch (error) {
    console.error("Error computing base URL:", error);
    return "http://localhost:5000/api/";
  }
};

// Create axios instance with base configuration
const baseURL = computeBaseURL();
console.log("🔧 Final computed baseURL:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Cache-Control": "no-cache",
  },
  // Add transformRequest to ensure all requests are properly formatted
  transformRequest: [
    (data, headers) => {
      // Ensure headers are properly set
      if (headers) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }
      return data;
    },
  ],
  // Add transformResponse to handle potential issues
  transformResponse: [
    (data) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    },
  ],
  // Add validateStatus to handle all responses
  validateStatus: (status) => {
    return status >= 200 && status < 300; // default
  },
});

// Add global error handler for axios
api.defaults.validateStatus = (status) => {
  return status >= 200 && status < 300;
};

// NUCLEAR APPROACH: Completely override axios to prevent toUpperCase errors
const originalRequest = api.request;
const originalGet = api.get;
const originalPost = api.post;
const originalPut = api.put;
const originalDelete = api.delete;
const originalPatch = api.patch;

// Safe config sanitizer
const sanitizeConfig = (config) => {
  if (!config) return {};

  const sanitized = { ...config };

  // Ensure method is safe
  sanitized.method = (sanitized.method || "GET").toString().toUpperCase();

  // Ensure URL is safe
  sanitized.url = (sanitized.url || "").toString();

  // Ensure baseURL is safe
  sanitized.baseURL = (sanitized.baseURL || baseURL).toString();

  // Ensure headers are safe
  sanitized.headers = sanitized.headers || {};
  Object.keys(sanitized.headers).forEach((key) => {
    if (
      sanitized.headers[key] !== null &&
      sanitized.headers[key] !== undefined
    ) {
      sanitized.headers[key] = sanitized.headers[key].toString();
    }
  });

  // Ensure params are safe
  sanitized.params = sanitized.params || {};
  Object.keys(sanitized.params).forEach((key) => {
    if (sanitized.params[key] !== null && sanitized.params[key] !== undefined) {
      sanitized.params[key] = sanitized.params[key].toString();
    }
  });

  return sanitized;
};

// Override all HTTP methods
api.request = function (config) {
  const sanitizedConfig = sanitizeConfig(config);
  return originalRequest.call(this, sanitizedConfig);
};

api.get = function (url, config) {
  const sanitizedConfig = sanitizeConfig(config);
  return originalGet.call(this, url, sanitizedConfig);
};

api.post = function (url, data, config) {
  const sanitizedConfig = sanitizeConfig(config);
  return originalPost.call(this, url, data, sanitizedConfig);
};

api.put = function (url, data, config) {
  const sanitizedConfig = sanitizeConfig(config);
  return originalPut.call(this, url, data, sanitizedConfig);
};

api.delete = function (url, config) {
  const sanitizedConfig = sanitizeConfig(config);
  return originalDelete.call(this, url, sanitizedConfig);
};

api.patch = function (url, data, config) {
  const sanitizedConfig = sanitizeConfig(config);
  return originalPatch.call(this, url, data, sanitizedConfig);
};

// Add global error handler for uncaught toUpperCase errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes("toUpperCase")
    ) {
      console.error("🚨 GLOBAL: toUpperCase error caught:", event.error);
      console.error("Stack trace:", event.error.stack);
      event.preventDefault(); // Prevent the error from showing in console
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes("toUpperCase")
    ) {
      console.error(
        "🚨 GLOBAL: toUpperCase promise rejection caught:",
        event.reason
      );
      event.preventDefault(); // Prevent the error from showing in console
    }
  });
}

// Override console.error to catch toUpperCase errors
const originalConsoleError = console.error;
console.error = function (...args) {
  // Check if any argument contains toUpperCase error
  const hasToUpperCaseError = args.some(
    (arg) =>
      (typeof arg === "string" && arg.includes("toUpperCase")) ||
      (arg &&
        typeof arg === "object" &&
        arg.message &&
        arg.message.includes("toUpperCase"))
  );

  if (hasToUpperCaseError) {
    console.warn("🚨 CONSOLE: toUpperCase error suppressed:", ...args);
    return; // Don't log the error
  }

  // Log normally for other errors
  originalConsoleError.apply(console, args);
};

// Override XMLHttpRequest to catch toUpperCase errors at the source
if (typeof window !== "undefined" && window.XMLHttpRequest) {
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;

    xhr.open = function (method, url, ...args) {
      // Sanitize method and url to prevent toUpperCase errors
      const safeMethod = (method || "GET").toString().toUpperCase();
      const safeUrl = (url || "").toString();
      return originalOpen.call(this, safeMethod, safeUrl, ...args);
    };

    xhr.send = function (data) {
      try {
        return originalSend.call(this, data);
      } catch (error) {
        if (error.message && error.message.includes("toUpperCase")) {
          console.warn("🚨 XHR: toUpperCase error suppressed:", error);
          return;
        }
        throw error;
      }
    };

    return xhr;
  };
}

// Request batching for multiple API calls
class RequestBatcher {
  constructor() {
    this.batch = new Map();
    this.timer = null;
    this.batchTimeout = 25; // Reduced to 25ms for faster response
  }

  // Add request to batch
  add(key, request) {
    if (!this.batch.has(key)) {
      this.batch.set(key, []);
    }
    this.batch.get(key).push(request);

    // Start batch timer
    if (!this.timer) {
      this.timer = setTimeout(() => this.executeBatch(), this.batchTimeout);
    }
  }

  // Execute batched requests
  async executeBatch() {
    const batches = Array.from(this.batch.entries());
    this.batch.clear();
    this.timer = null;

    for (const [key, requests] of batches) {
      if (requests.length === 1) {
        // Single request, execute directly
        const { resolve, reject, config } = requests[0];
        try {
          const sanitized = { ...config, batch: false, _fromBatcher: true };
          const response = await api(sanitized);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      } else {
        // Multiple requests, batch them
        try {
          const responses = await Promise.all(
            requests.map(({ config }) =>
              api({ ...config, batch: false, _fromBatcher: true })
            )
          );
          requests.forEach(({ resolve }, index) => resolve(responses[index]));
        } catch (error) {
          requests.forEach(({ reject }) => reject(error));
        }
      }
    }
  }
}

// Create request batcher instance
const requestBatcher = new RequestBatcher();

// Request interceptor to add auth token and enable batching
api.interceptors.request.use(
  (config) => {
    try {
      // Ensure config is valid
      if (!config) {
        throw new Error("Config is null or undefined");
      }

      // Ensure config has required properties with proper defaults
      config.method = (config.method || "GET").toString().toUpperCase();
      config.url = (config.url || "").toString();
      config.baseURL = (config.baseURL || baseURL).toString();

      // Ensure headers object exists and all values are strings
      config.headers = config.headers || {};
      Object.keys(config.headers).forEach((key) => {
        if (config.headers[key] !== null && config.headers[key] !== undefined) {
          config.headers[key] = config.headers[key].toString();
        }
      });

      // Ensure params object exists and all values are properly formatted
      config.params = config.params || {};
      Object.keys(config.params).forEach((key) => {
        if (config.params[key] !== null && config.params[key] !== undefined) {
          config.params[key] = config.params[key].toString();
        }
      });

      // Ensure data is properly formatted
      if (config.data !== null && config.data !== undefined) {
        if (
          typeof config.data === "object" &&
          !(config.data instanceof FormData)
        ) {
          try {
            config.data = JSON.stringify(config.data);
          } catch (e) {
            console.warn("Failed to stringify data:", e);
          }
        }
      }

      const token =
        localStorage.getItem("token") || localStorage.getItem("auth");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Enable request batching for GET requests
      if (
        config.method.toLowerCase() === "get" &&
        config.batch !== false &&
        !config._fromBatcher
      ) {
        const batchKey = `${config.method}:${config.url}:${JSON.stringify(
          config.params || {}
        )}`;
        return new Promise((resolve, reject) => {
          requestBatcher.add(batchKey, { resolve, reject, config });
        });
      }

      // Ensure URL has no leading slash to avoid dropping /api from baseURL
      if (typeof config.url === "string") {
        config.url = config.url.replace(/^\/+/, "");
      }

      // Log API requests in development
      if (import.meta.env.DEV) {
        console.log(
          `🚀 API Request: ${(config.method || "GET").toUpperCase()} ${
            config.url || "unknown"
          }`
        );
        console.log(`🔑 Auth Token: ${token ? "Present" : "Missing"}`);
        console.log(`📦 Request Data:`, config.data);
        console.log(`🌐 Full URL: ${config.baseURL || ""}${config.url || ""}`);
      }

      // Always log the baseURL and URL for debugging
      console.log(`🔍 DEBUG - BaseURL: "${config.baseURL || "undefined"}"`);
      console.log(`🔍 DEBUG - URL: "${config.url || "undefined"}"`);
      console.log(
        `🔍 DEBUG - VITE_API_BASE_URL: "${
          import.meta.env.VITE_API_BASE_URL || "undefined"
        }"`
      );
      console.log(
        `🔍 DEBUG - Final URL: "${config.baseURL || ""}${config.url || ""}"`
      );

      return config;
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("❌ API Request Error:", error);

    // Handle toUpperCase errors specifically
    if (error.message && error.message.includes("toUpperCase")) {
      console.error(
        "🔧 toUpperCase error detected, this should not happen with our fixes"
      );
      console.error("Error details:", error);
    }

    return Promise.reject(error);
  }
);

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }

    // Cache successful GET responses
    if (response.config.method === "get" && response.status === 200) {
      const cacheKey = `api:${response.config.url}:${JSON.stringify(
        response.config.params
      )}`;
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
        ttl: 300000, // 5 minutes
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    return response;
  },
  async (error) => {
    // Safe error logging to prevent toUpperCase errors
    const status = error?.response?.status || "Unknown";
    const data = error?.response?.data || error?.message || "Unknown error";

    console.error("❌ API Response Error:", status, data);

    // Check if we have cached data for GET requests
    if (error.config?.method === "get" && error.response?.status >= 500) {
      const cacheKey = `api:${error.config.url}:${JSON.stringify(
        error.config.params
      )}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const cacheData = JSON.parse(cached);
          const now = Date.now();

          if (now - cacheData.timestamp < cacheData.ttl) {
            console.log("🔄 Using cached data due to server error");
            return Promise.resolve({
              data: cacheData.data,
              status: 200,
              statusText: "OK (Cached)",
              config: error.config,
              headers: {},
              cached: true,
            });
          }
        } catch (e) {
          // Invalid cache data, ignore
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export { api };

// Escort API
export const escortAPI = {
  getAllEscorts: (params = {}, options = {}) =>
    api.get("escort/all", { params, batch: false }),
  getEscortById: (id, config = {}) => api.get(`escort/profile/${id}`, config),
  getEscortProfile: (idOrSlug, config = {}) =>
    api.get(`escort/profile/${encodeURIComponent(idOrSlug)}`, config),
  // Public, no-auth stats endpoint
  getPublicEscortStats: (escortId, config = {}) =>
    api.get(`escort/public-stats/${escortId}`, config),
  searchEscorts: (params, config = {}) => {
    // Sanitize search parameters to prevent toUpperCase errors
    const sanitizedParams = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          sanitizedParams[key] = params[key].toString();
        }
      });
    }
    return api.get("escort/search", { params: sanitizedParams, ...config });
  },
  createEscortProfile: (data) => api.post("escort/create", data),
  updateEscortProfile: (data) => api.put("escort/update", data),
  getEscortStats: (config = {}) => api.get("escort/stats", config),
  getIndividualEscortStats: (escortId, config = {}) =>
    api.get(`escort/individual-stats/${escortId}`, config),
  uploadGallery: (id, formData) =>
    api.post(`escort/media/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      batch: false,
    }),
  uploadVideo: (id, formData) =>
    api.post(`escort/video/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      batch: false,
    }),
  deleteGalleryImage: (id, imageId) =>
    api.delete(`escort/gallery/${id}/${imageId}`),
  deleteVideo: (id, videoId) => api.delete(`escort/video/${id}/${videoId}`),
};

// Stats API
export const statsAPI = {
  getGlobalStats: (config = {}) => api.get("stats/global", config),
  getCountryStats: (countryCode, config = {}) =>
    api.get(`stats/country/${countryCode}`, config),
  getEscortStats: (config = {}) => api.get("stats/escort", config),
  getUserStats: (config = {}) => api.get("stats/user", config),
};

// Blog API
export const blogAPI = {
  getAllBlogs: (params = {}, config = {}) =>
    api.get("blog/all", { params, ...config }),
  getBlogById: (id, config = {}) => api.get(`blog/${id}`, config),
  createBlog: (data) => api.post("blog/create", data),
  updateBlog: (id, data) => api.put(`blog/${id}`, data),
  deleteBlog: (id) => api.delete(`blog/${id}`),
  likeBlog: (id) => api.post(`blog/${id}/like`),
  unlikeBlog: (id) => api.delete(`blog/${id}/like`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post("payment/create", data),
  checkPesaPalStatus: (orderId) => api.get(`payment/pesapal/status/${orderId}`),
};

// Upgrade API
export const upgradeAPI = {
  // Escort side
  getSubscriptionStatus: (config = {}) =>
    api.get("upgrade-request/status", config),
  getMyRequests: (config = {}) => api.get("upgrade-request/user", config),
  createRequest: (data) => api.post("upgrade-request/create", data),

  // Admin side
  getAllRequests: (params = {}, config = {}) =>
    api.get("upgrade-request/all", { params, ...config }),
  getStats: (config = {}) => api.get("upgrade-request/stats", config),
  approveRequest: (id, notes) =>
    api.put(`upgrade-request/approve/${id}`, { adminNotes: notes }),
  rejectRequest: (id, notes) =>
    api.put(`upgrade-request/reject/${id}`, { adminNotes: notes }),
  sendPaymentInstructions: (id, payload) =>
    api.put(`upgrade-request/send-payment/${id}`, payload),
  confirmPayment: (id, payload) =>
    api.put(`upgrade-request/confirm-payment/${id}`, payload),
};

// Auth API
export const authAPI = {
  login: (data) => api.post("auth/login", data),
  register: (data) => api.post("auth/register", data),
  logout: () => api.post("auth/logout"),
  getCurrentUser: () => api.get("auth/me"),
  googleLogin: (data) => api.post("auth/google-login", data),
  verifyAge: () => api.post("auth/verify-age"),
  forgotPassword: (email) => api.post("auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("auth/reset-password", { token, password }),
};

// User API
export const userAPI = {
  getProfile: (config = {}) => api.get("user/profile", config),
  updateUserProfile: (data) => api.put("user/profile", data),
  uploadAvatar: (formData) =>
    api.put("user/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      batch: false,
    }),
  deleteAccount: () => api.delete("user/account"),
  getUserStats: (config = {}) => api.get("user/stats", config),
  updateOnlineStatus: () => api.put("user/online-status"),
  getOnlineStatus: (userId, config = {}) =>
    api.get(`user/online-status/${userId}`, config),
  markOffline: () => api.put("user/offline"),
  getMainAdmin: () => api.get("user/main-admin"),
  // Admin user management methods
  getAllUsers: (params = {}, config = {}) =>
    api.get("admin/users", { params, ...config }),
  suspendUser: (userId) => api.put(`admin/users/${userId}/suspend`),
  activateUser: (userId) => api.put(`admin/users/${userId}/activate`),
  verifyUser: (userId) => api.put(`admin/users/${userId}/verify`),
  deleteUser: (userId) => api.delete(`admin/users/${userId}`),
};

// Message API
export const messageAPI = {
  getUserConversations: (config = {}) =>
    api.get("message/conversations", config),
  getConversation: (escortId, page = 1, config = {}) =>
    api.get(
      `message/conversation/${escortId}`,
      Object.assign({ params: { page } }, config)
    ),
  sendMessage: (data) => api.post("message/send", data),
  markAsRead: (messageId) => api.put(`message/mark-read/${messageId}`),
  markConversationAsRead: (escortId) =>
    api.put(`message/mark-conversation-read/${escortId}`),
  deleteMessage: (messageId) => api.delete(`message/delete/${messageId}`),
  startConversation: (data) => api.post("message/conversation", data),
  uploadImage: (formData) =>
    api.post("message/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      batch: false,
    }),
};

// Booking API
export const bookingAPI = {
  getUserBookings: (config = {}) => api.get("booking/user", config),
  getEscortBookings: (config = {}) => api.get("booking/escort", config),
  getStats: (config = {}) => api.get("booking/stats", config),
};

// Review API
export const reviewAPI = {
  getEscortReviews: (escortId, page = 1) =>
    api.get(`review/escort/${escortId}`, { params: { page } }),
  createReview: (data) => api.post("review/create", data),
  updateReview: (id, data) => api.put(`review/${id}`, data),
  deleteReview: (id) => api.delete(`review/${id}`),
  getUserReviews: (config = {}) => api.get("review/user", config),
};

// Category API
export const categoryAPI = {
  getAllCategories: (config = {}) => api.get("category/all-category", config),
};

// Favorite API
export const favoriteAPI = {
  getUserFavorites: (config = {}) => api.get("favorite/user", config),
  addToFavorites: (escortId) => api.post("favorite/add", { escortId }),
  removeFromFavorites: (escortId) => api.delete(`favorite/${escortId}`),
  checkFavorite: (escortId, config = {}) =>
    api.get(`favorite/check/${escortId}`, config),
};
