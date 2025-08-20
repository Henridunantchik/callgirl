import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Use environment variable for production
  withCredentials: true,
  timeout: 60000, // Increased to 60 seconds for file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error(
      "❌ API Response Error:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Age verification
  verifyAge: () => api.post("/auth/verify-age"),

  // Registration
  register: (userData) => api.post("/auth/register", userData),

  // Login
  login: (credentials) => api.post("/auth/login", credentials),

  // Google Login
  googleLogin: (userData) => api.post("/auth/google-login", userData),

  // Logout
  logout: () => api.post("/auth/logout"),

  // Get current user
  getCurrentUser: () => api.get("/auth/me"),

  // Password reset
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};

// Escort API
export const escortAPI = {
  // Get all escorts with filters
  getAllEscorts: (params = {}) => api.get("/escort/all", { params }),

  // Get escort profile by ID
  getEscortProfile: (id) => api.get(`/escort/profile/${id}`),

  // Search escorts
  searchEscorts: (params) => api.get("/escort/search", { params }),

  // Create escort profile
  createEscortProfile: (formData) => {
    console.log("📤 Creating escort profile with data:", formData);
    return api.post("/escort/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update escort profile
  updateEscortProfile: (id, formData) =>
    api.put(`/escort/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Upload media
  uploadMedia: (id, formData) =>
    api.post(`/escort/media/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Upload gallery photos (using existing media route)
  uploadGallery: (id, formData) =>
    api.post(`/escort/media/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Upload videos (using video route)
  uploadVideo: (id, formData, config = {}) =>
    api.post(`/escort/video/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),

  // Delete gallery image
  deleteGalleryImage: (id, imageId) =>
    api.delete(`/escort/gallery/${id}/${imageId}`),

  // Delete video
  deleteVideo: (id, videoId) => api.delete(`/escort/video/${id}/${videoId}`),

  // Get escort subscription info
  getEscortSubscription: (id) => api.get(`/escort/subscription/${id}`),

  // Get profile completion status
  getProfileCompletion: (id) => api.get(`/escort/profile-completion/${id}`),

  // Get escort statistics
  getEscortStats: (id) => api.get(`/escort/stats/${id}`),

  // Get individual escort statistics with growth metrics
  getIndividualEscortStats: (escortId) =>
    api.get(`/escort/individual-stats/${escortId}`),

  // Get public escort statistics (no auth required)
  getPublicEscortStats: (id) => api.get(`/escort/public-stats/${id}`),
};

// Booking API
export const bookingAPI = {
  // Create booking
  createBooking: (bookingData) => api.post("/booking/create", bookingData),

  // Get user bookings (client or escort)
  getUserBookings: (params = {}) => api.get("/booking/user", { params }),

  // Get escort bookings (escort only)
  getEscortBookings: (params = {}) => api.get("/booking/escort", { params }),

  // Get booking by ID
  getBooking: (id) => api.get(`/booking/${id}`),

  // Update booking status (escort only)
  updateBookingStatus: (id, status, notes) =>
    api.put(`/booking/${id}/status`, { status, notes }),

  // Cancel booking
  cancelBooking: (id, reason) => api.put(`/booking/${id}/cancel`, { reason }),

  // Get escort availability
  getEscortAvailability: (escortId, date) =>
    api.get(`/booking/escort/${escortId}/availability`, { params: { date } }),
};

// Review API
export const reviewAPI = {
  // Create review
  createReview: (reviewData) => api.post("/review/create", reviewData),

  // Get reviews for escort
  getEscortReviews: (escortId, params = {}) =>
    api.get(`/review/escort/${escortId}`, { params }),

  // Get user reviews
  getUserReviews: () => api.get("/review/user"),

  // Update review
  updateReview: (id, reviewData) => api.put(`/review/${id}`, reviewData),

  // Delete review
  deleteReview: (id) => api.delete(`/review/${id}`),

  // Report review
  reportReview: (id, reportData) =>
    api.post(`/review/report/${id}`, reportData),
};

// Favorite API
export const favoriteAPI = {
  // Add to favorites
  addToFavorites: (escortId) => api.post("/favorite/add", { escortId }),

  // Remove from favorites
  removeFromFavorites: (escortId) => api.delete(`/favorite/remove/${escortId}`),

  // Get user favorites
  getUserFavorites: () => api.get("/favorite/user"),

  // Check if escort is favorited
  isFavorited: (escortId) => api.get(`/favorite/check/${escortId}`),
};

// Message API
export const messageAPI = {
  // Send a message
  sendMessage: (messageData) => api.post("/message/send", messageData),

  // Get conversation between users
  getConversation: (escortId, params = {}) =>
    api.get(`/message/conversation/${escortId}`, { params }),

  // Get user's conversations
  getUserConversations: () => api.get("/message/conversations"),

  // Mark message as read
  markAsRead: (messageId) => api.put(`/message/mark-read/${messageId}`),

  // Mark conversation as read
  markConversationAsRead: (escortId) =>
    api.put(`/message/mark-conversation-read/${escortId}`),

  // Delete message
  deleteMessage: (messageId) => api.delete(`/message/delete/${messageId}`),
};

// Payment API
export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: (paymentData) =>
    api.post("/payment/create-intent", paymentData),

  // Confirm payment
  confirmPayment: (paymentId) => api.post(`/payment/confirm/${paymentId}`),

  // Get payment history
  getPaymentHistory: () => api.get("/payment/history"),

  // Get payment by ID
  getPayment: (id) => api.get(`/payment/${id}`),

  // Request payout
  requestPayout: (payoutData) => api.post("/payment/payout", payoutData),

  // Get payout history
  getPayoutHistory: () => api.get("/payment/payouts"),

  // PesaPal specific endpoints
  checkPesaPalStatus: (orderId) =>
    api.get(`/payment/pesapal/status/${orderId}`),
};

// Report API
export const reportAPI = {
  // Create report
  createReport: (reportData) => api.post("/report/create", reportData),

  // Get user reports
  getUserReports: () => api.get("/report/user"),

  // Get all reports (admin)
  getAllReports: (params = {}) => api.get("/report/all", { params }),

  // Update report status
  updateReportStatus: (id, status) =>
    api.put(`/report/status/${id}`, { status }),
};

// User API
export const userAPI = {
  // Get user profile
  getUserProfile: () => api.get("/user/profile"),

  // Get user by ID
  getUser: (userId) => api.get(`/user/get-user/${userId}`),

  // Update user profile
  updateUserProfile: (userData) => api.put("/user/profile", userData),

  // Change password
  changePassword: (passwordData) => api.put("/user/password", passwordData),

  // Delete account
  deleteAccount: () => api.delete("/user/account"),

  // Upload avatar
  uploadAvatar: (formData) =>
    api.put("/user/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Online status
  updateOnlineStatus: () => api.put("/user/online-status"),
  getOnlineStatus: (userId) => api.get(`/user/online-status/${userId}`),
  markOffline: () => api.put("/user/offline"),

  // Get main admin for support
  getMainAdmin: () => api.get("/user/main-admin"),
};

// Stats API
export const statsAPI = {
  // Get global platform statistics
  getGlobalStats: (countryCode) => api.get(`/stats/global/${countryCode}`),
};

// Upgrade Request API
export const upgradeAPI = {
  // Create upgrade request
  createRequest: (requestData) =>
    api.post("/upgrade-request/create", requestData),

  // Get escort's upgrade requests
  getMyRequests: () => api.get("/upgrade-request/my-requests"),

  // Get subscription status
  getSubscriptionStatus: () => api.get("/upgrade-request/subscription-status"),

  // Submit payment proof (escort)
  submitPaymentProof: (requestId, paymentProof) =>
    api.put(`/upgrade-request/submit-payment/${requestId}`, { paymentProof }),

  // Get all upgrade requests (admin)
  getAllRequests: (params = {}) => api.get("/upgrade-request/all", { params }),

  // Send payment instructions (admin)
  sendPaymentInstructions: (requestId, paymentData) =>
    api.put(`/upgrade-request/send-payment/${requestId}`, paymentData),

  // Confirm payment (admin)
  confirmPayment: (requestId, adminNotes) =>
    api.put(`/upgrade-request/confirm-payment/${requestId}`, { adminNotes }),

  // Approve upgrade request (admin)
  approveRequest: (requestId, adminNotes) =>
    api.put(`/upgrade-request/approve/${requestId}`, { adminNotes }),

  // Reject upgrade request (admin)
  rejectRequest: (requestId, adminNotes) =>
    api.put(`/upgrade-request/reject/${requestId}`, { adminNotes }),

  // Get upgrade statistics (admin)
  getStats: () => api.get("/upgrade-request/stats"),
};

// Admin API
export const adminAPI = {
  // Get all users
  getAllUsers: (params = {}) => api.get("/admin/users", { params }),

  // Update user status
  updateUserStatus: (userId, status) =>
    api.put(`/admin/users/${userId}/status`, { status }),

  // Get platform stats
  getPlatformStats: () => api.get("/admin/stats"),

  // Get analytics
  getAnalytics: (params = {}) => api.get("/admin/analytics", { params }),
};

// Blog API
export const blogAPI = {
  // Create blog post
  createBlog: (blogData) => api.post("/blog/create", blogData),

  // Get all published blogs
  getAllBlogs: (params = {}) => api.get("/blog/all", { params }),

  // Get featured blogs
  getFeaturedBlogs: (params = {}) => api.get("/blog/featured", { params }),

  // Get blog by slug
  getBlogBySlug: (slug) => api.get(`/blog/slug/${slug}`),

  // Get blog by ID (for editing)
  getBlogById: (blogId) => api.get(`/blog/${blogId}`),

  // Update blog
  updateBlog: (blogId, blogData) => api.put(`/blog/${blogId}`, blogData),

  // Delete blog
  deleteBlog: (blogId) => api.delete(`/blog/${blogId}`),

  // Add comment
  addComment: (blogId, content) =>
    api.post(`/blog/${blogId}/comment`, { content }),

  // Like blog
  likeBlog: (blogId) => api.post(`/blog/${blogId}/like`),

  // Get blog categories
  getBlogCategories: () => api.get("/blog/categories"),

  // Get blog stats (admin only)
  getBlogStats: () => api.get("/blog/stats"),

  // Approve comment (admin only)
  approveComment: (blogId, commentId) =>
    api.put(`/blog/${blogId}/comment/${commentId}/approve`),
};

export default api;
