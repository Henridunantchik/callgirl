import axios from "axios";

// Normalize and compute API base URL safely
const computeBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  // Helper to ensure we end up with .../api (single /) and trailing slash
  const ensureApiSuffix = (url) => {
    if (!url) return url;
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
  if (envUrl) {
    return ensureApiSuffix(envUrl);
  }

  // Otherwise choose based on host
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return isLocal
    ? "http://localhost:5000/api/"
    : ensureApiSuffix(window.location.origin);
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: computeBaseURL(),
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Cache-Control": "no-cache",
  },
});

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
    const token = localStorage.getItem("token") || localStorage.getItem("auth");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Enable request batching for GET requests
    if (
      config.method === "get" &&
      config.batch !== false &&
      !config._fromBatcher
    ) {
      const batchKey = `${config.method}:${config.url}:${JSON.stringify(
        config.params
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
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      console.log(`🔑 Auth Token: ${token ? "Present" : "Missing"}`);
      console.log(`📦 Request Data:`, config.data);
      console.log(`🌐 Full URL: ${config.baseURL}${config.url}`);
    }

    // Always log the baseURL and URL for debugging
    console.log(`🔍 DEBUG - BaseURL: "${config.baseURL}"`);
    console.log(`🔍 DEBUG - URL: "${config.url}"`);
    console.log(`🔍 DEBUG - VITE_API_URL: "${import.meta.env.VITE_API_URL}"`);
    console.log(`🔍 DEBUG - Final URL: "${config.baseURL}${config.url}"`);

    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
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
    console.error(
      "❌ API Response Error:",
      error.response?.status,
      error.response?.data
    );

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
  searchEscorts: (params, config = {}) =>
    api.get("escort/search", { params, ...config }),
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
  googleLogin: (data) => api.post("auth/google", data),
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
};

// Booking API
export const bookingAPI = {
  getUserBookings: (config = {}) => api.get("booking/user", config),
  getEscortBookings: (config = {}) => api.get("booking/escort", config),
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
