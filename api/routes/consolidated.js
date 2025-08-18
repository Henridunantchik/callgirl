import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";
import { onlyEscort } from "../middleware/onlyEscort.js";

// Import controllers
import * as AuthController from "../controllers/Auth.controller.js";
import * as UserController from "../controllers/User.controller.js";
import * as EscortController from "../controllers/Escort.controller.js";
import * as CategoryController from "../controllers/Category.controller.js";
import * as BlogController from "../controllers/Blog.controller.js";
import * as BookingController from "../controllers/Booking.controller.js";
import * as FavoriteController from "../controllers/Favorite.controller.js";
import * as MessageController from "../controllers/Message.controller.js";
import * as PaymentController from "../controllers/Payment.controller.js";
import * as ReportController from "../controllers/Report.controller.js";
import * as ReviewController from "../controllers/Review.controller.js";
import * as AgeVerificationController from "../controllers/AgeVerification.controller.js";
import * as SubscriptionController from "../controllers/Subscription.controller.js";
import * as TransportController from "../controllers/Transport.controller.js";
import * as StatsController from "../controllers/Stats.controller.js";
import * as UpgradeRequestController from "../controllers/UpgradeRequest.controller.js";
import * as AdminController from "../controllers/admin.controller.js";

const router = express.Router();

// ===== AUTH ROUTES =====
router.post("/auth/verify-age", AuthController.verifyAge);
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.post("/auth/google-login", AuthController.googleLogin);
router.post("/auth/logout", AuthController.logout);
router.get("/auth/me", authenticate, AuthController.getCurrentUser);
router.post("/auth/forgot-password", AuthController.forgotPassword);
router.post("/auth/reset-password", AuthController.resetPassword);

// ===== USER ROUTES =====
router.get("/user/profile", authenticate, UserController.getUserProfile);
router.put("/user/profile", authenticate, UserController.updateUserProfile);
router.delete("/user/account", authenticate, UserController.deleteAccount);
router.post(
  "/user/change-password",
  authenticate,
  UserController.changePassword
);

// ===== ESCORT ROUTES =====
router.get("/escort/all", EscortController.getAllEscorts);
router.get("/escort/profile/:id", EscortController.getEscortProfile);
router.get("/escort/search", EscortController.searchEscorts);
router.post(
  "/escort/create",
  authenticate,
  onlyEscort,
  EscortController.createEscortProfile
);
router.put(
  "/escort/update",
  authenticate,
  onlyEscort,
  EscortController.updateEscortProfile
);
router.delete(
  "/escort/delete",
  authenticate,
  onlyEscort,
  EscortController.deleteEscortProfile
);
router.get(
  "/escort/stats",
  authenticate,
  onlyEscort,
  EscortController.getEscortStats
);
router.get(
  "/escort/individual-stats/:escortId",
  authenticate,
  EscortController.getIndividualEscortStats
);

// ===== CATEGORY ROUTES =====
router.get("/category/all", CategoryController.getAllCategories);
router.get("/category/:id", CategoryController.getCategoryById);
router.post(
  "/category/create",
  authenticate,
  onlyAdmin,
  CategoryController.createCategory
);
router.put(
  "/category/:id",
  authenticate,
  onlyAdmin,
  CategoryController.updateCategory
);
router.delete(
  "/category/:id",
  authenticate,
  onlyAdmin,
  CategoryController.deleteCategory
);

// ===== BLOG ROUTES =====
router.get("/blog/all", BlogController.getAllBlogs);
router.get("/blog/:id", BlogController.getBlogById);
router.get("/blog/category/:categoryId", BlogController.getBlogsByCategory);
router.post("/blog/create", authenticate, onlyAdmin, BlogController.createBlog);
router.put("/blog/:id", authenticate, onlyAdmin, BlogController.updateBlog);
router.delete("/blog/:id", authenticate, onlyAdmin, BlogController.deleteBlog);
router.post("/blog/:id/like", authenticate, BlogController.likeBlog);
router.delete("/blog/:id/like", authenticate, BlogController.unlikeBlog);

// ===== BOOKING ROUTES =====
router.post("/booking/create", authenticate, BookingController.createBooking);
router.get("/booking/user", authenticate, BookingController.getUserBookings);
router.get(
  "/booking/escort",
  authenticate,
  onlyEscort,
  BookingController.getEscortBookings
);
router.put(
  "/booking/:id/status",
  authenticate,
  BookingController.updateBookingStatus
);
router.delete("/booking/:id", authenticate, BookingController.cancelBooking);

// ===== FAVORITE ROUTES =====
router.post("/favorite/add", authenticate, FavoriteController.addToFavorites);
router.delete(
  "/favorite/remove",
  authenticate,
  FavoriteController.removeFromFavorites
);
router.get("/favorite/user", authenticate, FavoriteController.getUserFavorites);
router.get(
  "/favorite/check",
  authenticate,
  FavoriteController.checkIfFavorited
);

// ===== MESSAGE ROUTES =====
router.post("/message/send", authenticate, MessageController.sendMessage);
router.get(
  "/message/conversations",
  authenticate,
  MessageController.getConversations
);
router.get(
  "/message/:conversationId",
  authenticate,
  MessageController.getMessages
);
router.put(
  "/message/:messageId/read",
  authenticate,
  MessageController.markAsRead
);
router.delete(
  "/message/:messageId",
  authenticate,
  MessageController.deleteMessage
);

// ===== PAYMENT ROUTES =====
router.post(
  "/payment/initiate",
  authenticate,
  PaymentController.initiatePayment
);
router.post("/payment/verify", authenticate, PaymentController.verifyPayment);
router.get(
  "/payment/history",
  authenticate,
  PaymentController.getPaymentHistory
);
router.post("/payment/webhook", PaymentController.handleWebhook);

// ===== REPORT ROUTES =====
router.post("/report/create", authenticate, ReportController.createReport);
router.get(
  "/report/all",
  authenticate,
  onlyAdmin,
  ReportController.getAllReports
);
router.put(
  "/report/:id/status",
  authenticate,
  onlyAdmin,
  ReportController.updateReportStatus
);
router.delete(
  "/report/:id",
  authenticate,
  onlyAdmin,
  ReportController.deleteReport
);

// ===== REVIEW ROUTES =====
router.post("/review/create", authenticate, ReviewController.createReview);
router.get("/review/escort/:escortId", ReviewController.getEscortReviews);
router.put("/review/:id", authenticate, ReviewController.updateReview);
router.delete("/review/:id", authenticate, ReviewController.deleteReview);

// ===== AGE VERIFICATION ROUTES =====
router.post(
  "/auth/age-verification/submit",
  authenticate,
  AgeVerificationController.submitVerification
);
router.get(
  "/auth/age-verification/status",
  authenticate,
  AgeVerificationController.getVerificationStatus
);
router.get(
  "/admin/age-verification/all",
  authenticate,
  onlyAdmin,
  AgeVerificationController.getAllVerifications
);
router.put(
  "/admin/age-verification/:id/approve",
  authenticate,
  onlyAdmin,
  AgeVerificationController.approveVerification
);
router.put(
  "/admin/age-verification/:id/reject",
  authenticate,
  onlyAdmin,
  AgeVerificationController.rejectVerification
);

// ===== SUBSCRIPTION ROUTES =====
router.post(
  "/subscription/upgrade",
  authenticate,
  SubscriptionController.upgradeSubscription
);
router.get(
  "/subscription/status",
  authenticate,
  SubscriptionController.getSubscriptionStatus
);
router.post(
  "/subscription/cancel",
  authenticate,
  SubscriptionController.cancelSubscription
);
router.get(
  "/admin/subscription/all",
  authenticate,
  onlyAdmin,
  SubscriptionController.getAllSubscriptions
);
router.put(
  "/admin/subscription/:id/status",
  authenticate,
  onlyAdmin,
  SubscriptionController.updateSubscriptionStatus
);

// ===== TRANSPORT ROUTES =====
router.post(
  "/transport/request",
  authenticate,
  TransportController.requestTransport
);
router.get(
  "/transport/user",
  authenticate,
  TransportController.getUserTransportRequests
);
router.get(
  "/transport/escort",
  authenticate,
  onlyEscort,
  TransportController.getEscortTransportRequests
);
router.put(
  "/transport/:id/status",
  authenticate,
  TransportController.updateTransportStatus
);

// ===== STATS ROUTES =====
router.get("/stats/global", StatsController.getGlobalStats);
router.get("/stats/country/:countryCode", StatsController.getCountryStats);

// ===== UPGRADE REQUEST ROUTES =====
router.post(
  "/upgrade-request/create",
  authenticate,
  UpgradeRequestController.createUpgradeRequest
);
router.get(
  "/upgrade-request/user",
  authenticate,
  UpgradeRequestController.getUserUpgradeRequests
);
router.get(
  "/upgrade-request/all",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.getAllUpgradeRequests
);
router.put(
  "/upgrade-request/:id/approve",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.approveUpgradeRequest
);
router.put(
  "/upgrade-request/:id/reject",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.rejectUpgradeRequest
);
router.put(
  "/upgrade-request/:id/confirm-payment",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.confirmPayment
);

// ===== ADMIN ROUTES =====
router.get(
  "/admin/dashboard",
  authenticate,
  onlyAdmin,
  AdminController.getDashboard
);
router.get(
  "/admin/users",
  authenticate,
  onlyAdmin,
  AdminController.getAllUsers
);
router.put(
  "/admin/user/:id/status",
  authenticate,
  onlyAdmin,
  AdminController.updateUserStatus
);
router.delete(
  "/admin/user/:id",
  authenticate,
  onlyAdmin,
  AdminController.deleteUser
);
router.get(
  "/admin/escorts",
  authenticate,
  onlyAdmin,
  AdminController.getAllEscorts
);
router.put(
  "/admin/escort/:id/status",
  authenticate,
  onlyAdmin,
  AdminController.updateEscortStatus
);
router.delete(
  "/admin/escort/:id",
  authenticate,
  onlyAdmin,
  AdminController.deleteEscort
);

export default router;
