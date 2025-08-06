import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api", // This will be proxied to http://localhost:5000
  withCredentials: true,
  timeout: 60000, // Increased to 60 seconds for file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
    console.error("❌ API Response Error:", error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
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
  createEscortProfile: (formData) =>
    api.post("/escort/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

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

  // Get escort subscription info
  getEscortSubscription: (id) => api.get(`/escort/subscription/${id}`),

  // Get profile completion status
  getProfileCompletion: (id) => api.get(`/escort/profile-completion/${id}`),
};

// Booking API
export const bookingAPI = {
  // Create booking
  createBooking: (bookingData) => api.post("/booking/create", bookingData),

  // Get user bookings
  getUserBookings: () => api.get("/booking/user"),

  // Get escort bookings
  getEscortBookings: () => api.get("/booking/escort"),

  // Get booking by ID
  getBooking: (id) => api.get(`/booking/${id}`),

  // Update booking status
  updateBookingStatus: (id, status) =>
    api.put(`/booking/status/${id}`, { status }),

  // Cancel booking
  cancelBooking: (id) => api.put(`/booking/cancel/${id}`),

  // Get availability
  getAvailability: (escortId, date) =>
    api.get(`/booking/availability/${escortId}`, { params: { date } }),
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
  // Send message
  sendMessage: (messageData) => api.post("/message/send", messageData),

  // Get conversation
  getConversation: (escortId) => api.get(`/message/conversation/${escortId}`),

  // Get user conversations
  getUserConversations: () => api.get("/message/conversations"),

  // Mark message as read
  markAsRead: (messageId) => api.put(`/message/read/${messageId}`),

  // Delete message
  deleteMessage: (messageId) => api.delete(`/message/${messageId}`),
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
  updateUserProfile: (userData) => api.put("/user/update", userData),

  // Change password
  changePassword: (passwordData) => api.put("/user/password", passwordData),

  // Delete account
  deleteAccount: () => api.delete("/user/account"),

  // Upload avatar
  uploadAvatar: (formData) =>
    api.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
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

export default api;
