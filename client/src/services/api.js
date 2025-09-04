import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? "https://api.epicescorts.live/api" // Use custom domain
      : "http://localhost:5000/api"), // Use environment variable for production
  withCredentials: true,
  timeout: 10000, // Reduced to 10 seconds for better UX
  // Add performance headers
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
          const response = await api(config);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      } else {
        // Multiple requests, batch them
        try {
          const responses = await Promise.all(
            requests.map(({ config }) => api(config))
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
    if (config.method === "get" && config.batch !== false) {
      const batchKey = `${config.method}:${config.url}:${JSON.stringify(
        config.params
      )}`;
      return new Promise((resolve, reject) => {
        requestBatcher.add(batchKey, { resolve, reject, config });
      });
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

    if (error.response?.status === 401) {
      // Try to refresh token first
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await api.post("auth/refresh-token", {
            refreshToken,
          });

          if (refreshResponse.data.token) {
            localStorage.setItem("token", refreshResponse.data.token);
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // If refresh fails, redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Age verification
  verifyAge: () => api.post("auth/verify-age"),

  // Registration
  register: (userData) => api.post("auth/register", userData),

  // Login
  login: (credentials) => api.post("auth/login", credentials),

  // Google Login
  googleLogin: (token) => api.post("auth/google-login", { token }),

  // Logout
  logout: () => api.post("auth/logout"),

  // Refresh token
  refreshToken: (refreshToken) =>
    api.post("auth/refresh-token", { refreshToken }),

  // Forgot password
  forgotPassword: (email) => api.post("auth/forgot-password", { email }),

  // Reset password
  resetPassword: (token, newPassword) =>
    api.post("auth/reset-password", { token, newPassword }),

  // Verify email
  verifyEmail: (token) => api.post("auth/verify-email", { token }),
};

// Escort API with batching and caching
export const escortAPI = {
  // Get all escorts with optimized caching
  getAllEscorts: (params = {}, options = {}) => {
    const cacheKey = `escorts:${JSON.stringify(params)}`;

    // Check cache first
    if (!options.skipCache) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cacheData = JSON.parse(cached);
          const now = Date.now();

          if (now - cacheData.timestamp < 120000) {
            // 2 minutes cache
            console.log("🚀 Using cached escort data");
            return Promise.resolve({
              data: cacheData.data,
              status: 200,
              cached: true,
            });
          }
        } catch (e) {
          // Invalid cache data, ignore
        }
      }
    }

    return api.get("escort/all", { params, batch: false });
  },

  // Get escort by ID
  getEscortById: (id) => api.get(`escort/profile/${id}`),

  // Search escorts
  searchEscorts: (params) => api.get("escort/search", { params }),

  // Create escort profile
  createEscortProfile: (data) => api.post("escort/create", data),

  // Update escort profile
  updateEscortProfile: (data) => api.put("escort/update", data),

  // Get escort stats
  getEscortStats: () => api.get("escort/stats"),

  // Get individual escort stats
  getIndividualEscortStats: (escortId) =>
    api.get(`escort/individual-stats/${escortId}`),

  // Upload gallery
  uploadGallery: (id, formData) => api.post(`escort/media/${id}`, formData),

  // Upload video
  uploadVideo: (id, formData) => api.post(`escort/video/${id}`, formData),

  // Delete gallery image
  deleteGalleryImage: (id, imageId) =>
    api.delete(`escort/gallery/${id}/${imageId}`),

  // Delete video
  deleteVideo: (id, videoId) => api.delete(`escort/video/${id}/${videoId}`),
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: () => api.get("user/profile"),

  // Update user profile
  updateProfile: (data) => api.put("user/profile", data),

  // Update user avatar
  updateAvatar: (formData) => api.put("user/avatar", formData),

  // Delete user account
  deleteAccount: () => api.delete("user/account"),

  // Get user stats
  getUserStats: () => api.get("user/stats"),

  // Update user location
  updateLocation: (data) => api.put("user/location", data),

  // Update user preferences
  updatePreferences: (data) => api.put("user/preferences", data),
};

// Message API with real-time support
export const messageAPI = {
  // Get conversations
  getConversations: () => api.get("message/conversations"),

  // Get messages for a conversation
  getMessages: (conversationId, page = 1) =>
    api.get(`message/conversation/${conversationId}`, {
      params: { page },
    }),

  // Send message
  sendMessage: (data) => api.post("message/send", data),

  // Mark message as read
  markAsRead: (messageId) => api.put(`message/${messageId}/read`),

  // Delete message
  deleteMessage: (messageId) => api.delete(`message/${messageId}`),

  // Start conversation
  startConversation: (data) => api.post("message/conversation", data),
};

// Booking API
export const bookingAPI = {
  // Get user bookings
  getUserBookings: () => api.get("booking/user"),

  // Get escort bookings
  getEscortBookings: () => api.get("booking/escort"),

  // Create booking
  createBooking: (data) => api.post("booking/create", data),

  // Update booking
  updateBooking: (id, data) => api.put(`booking/${id}`, data),

  // Cancel booking
  cancelBooking: (id) => api.put(`booking/${id}/cancel`),

  // Accept booking
  acceptBooking: (id) => api.put(`booking/${id}/accept`),

  // Reject booking
  rejectBooking: (id) => api.put(`booking/${id}/reject`),

  // Complete booking
  completeBooking: (id) => api.put(`booking/${id}/complete`),
};

// Review API
export const reviewAPI = {
  // Get reviews for escort
  getEscortReviews: (escortId, page = 1) =>
    api.get(`review/escort/${escortId}`, { params: { page } }),

  // Create review
  createReview: (data) => api.post("review/create", data),

  // Update review
  updateReview: (id, data) => api.put(`review/${id}`, data),

  // Delete review
  deleteReview: (id) => api.delete(`review/${id}`),

  // Get user reviews
  getUserReviews: () => api.get("review/user"),
};

// Favorite API
export const favoriteAPI = {
  // Get user favorites
  getUserFavorites: () => api.get("favorite/user"),

  // Add to favorites
  addToFavorites: (escortId) => api.post("favorite/add", { escortId }),

  // Remove from favorites
  removeFromFavorites: (escortId) => api.delete(`favorite/${escortId}`),

  // Check if escort is favorited
  checkFavorite: (escortId) => api.get(`favorite/check/${escortId}`),
};

// Stats API
export const statsAPI = {
  // Get global stats
  getGlobalStats: () => api.get("stats/global"),

  // Get country stats
  getCountryStats: (countryCode) => api.get(`stats/country/${countryCode}`),

  // Get escort stats
  getEscortStats: () => api.get("stats/escort"),

  // Get user stats
  getUserStats: () => api.get("stats/user"),
};

// Category API
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => api.get("category/all-category"),

  // Get category by ID
  getCategoryById: (id) => api.get(`category/${id}`),

  // Create category (admin only)
  createCategory: (data) => api.post("category/create", data),

  // Update category (admin only)
  updateCategory: (id, data) => api.put(`category/${id}`, data),

  // Delete category (admin only)
  deleteCategory: (id) => api.delete(`category/${id}`),
};

// Blog API
export const blogAPI = {
  // Get all blogs
  getAllBlogs: (params = {}) => api.get("blog/all", { params }),

  // Get blog by ID
  getBlogById: (id) => api.get(`blog/${id}`),

  // Create blog (admin only)
  createBlog: (data) => api.post("blog/create", data),

  // Update blog (admin only)
  updateBlog: (id, data) => api.put(`blog/${id}`, data),

  // Delete blog (admin only)
  deleteBlog: (id) => api.delete(`blog/${id}`),

  // Like blog
  likeBlog: (id) => api.post(`blog/${id}/like`),

  // Unlike blog
  unlikeBlog: (id) => api.delete(`blog/${id}/like`),
};

// Payment API
export const paymentAPI = {
  // Check PesaPal payment status
  checkPesaPalStatus: (orderId) => api.get(`payment/pesapal/status/${orderId}`),

  // Create PesaPal payment
  createPesaPalPayment: (data) => api.post("payment/pesapal/create", data),

  // Process payment callback
  processPaymentCallback: (data) => api.post("payment/callback", data),

  // Get payment history
  getPaymentHistory: () => api.get("payment/history"),

  // Refund payment
  refundPayment: (paymentId) => api.post(`payment/${paymentId}/refund`),
};

// Upgrade API
export const upgradeAPI = {
  // Get subscription status
  getSubscriptionStatus: () => api.get("upgrade-request/status"),

  // Create upgrade request
  createUpgradeRequest: (data) => api.post("upgrade-request/create", data),

  // Get user upgrade requests
  getUserUpgradeRequests: () => api.get("upgrade-request/user"),

  // Cancel upgrade request
  cancelUpgradeRequest: (id) => api.put(`upgrade-request/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  // Get admin dashboard
  getDashboard: () => api.get("admin/dashboard"),

  // Get all users
  getAllUsers: (params = {}) => api.get("admin/users", { params }),

  // Update user role
  updateUserRole: (userId, role) =>
    api.put(`admin/users/${userId}/role`, { role }),

  // Ban user
  banUser: (userId) => api.put(`admin/users/${userId}/ban`),

  // Unban user
  unbanUser: (userId) => api.put(`admin/users/${userId}/unban`),

  // Get upgrade requests
  getUpgradeRequests: () => api.get("admin/upgrade-requests"),

  // Approve upgrade request
  approveUpgradeRequest: (id) =>
    api.put(`admin/upgrade-requests/${id}/approve`),

  // Reject upgrade request
  rejectUpgradeRequest: (id) => api.put(`admin/upgrade-requests/${id}/reject`),
};

// Utility functions
export const apiUtils = {
  // Clear all cached data
  clearCache: () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("api:") || key.startsWith("escorts:")) {
        localStorage.removeItem(key);
      }
    });
    console.log("🧹 API cache cleared");
  },

  // Get cache statistics
  getCacheStats: () => {
    const keys = Object.keys(localStorage);
    const apiKeys = keys.filter((key) => key.startsWith("api:"));
    const escortKeys = keys.filter((key) => key.startsWith("escorts:"));

    return {
      total: keys.length,
      api: apiKeys.length,
      escorts: escortKeys.length,
      totalSize: JSON.stringify(localStorage).length,
    };
  },

  // Batch multiple API calls
  batch: (requests) => {
    return Promise.all(requests);
  },

  // Retry failed requests
  retry: async (request, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  },
};

// Export default API instance
export default api;
