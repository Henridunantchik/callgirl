import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";
import { onlyEscort } from "../middleware/onlyEscort.js";

// Import controllers
import * as AuthController from "../controllers/Auth.controller.js";
import * as UserController from "../controllers/User.controller.js";
import * as EscortController from "../controllers/Escort.controller.js";
import * as StatsController from "../controllers/Stats.controller.js";
import * as MessageController from "../controllers/Message.controller.js";
import * as UpgradeRequestController from "../controllers/UpgradeRequest.controller.js";
import * as ReviewController from "../controllers/Review.controller.js";
import * as FavoriteController from "../controllers/Favorite.controller.js";
import * as CategoryController from "../controllers/Category.controller.js";

const router = express.Router();

// ===== AUTH ROUTES =====
router.post("/auth/register", AuthController.Register);
router.post("/auth/login", AuthController.Login);
router.post("/auth/google-login", AuthController.GoogleLogin);
router.post("/auth/logout", AuthController.Logout);
router.get("/auth/me", authenticate, AuthController.getCurrentUser);

// ===== USER ROUTES =====
router.get("/user/profile", authenticate, UserController.getUser);
router.put("/user/profile", authenticate, UserController.updateUser);
router.delete("/user/account", authenticate, UserController.deleteUser);

// ===== ESCORT ROUTES =====
router.get("/escort/all", EscortController.getAllEscorts);
router.get("/escort/profile/:id", EscortController.getEscortById);
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

// ===== STATS ROUTES =====
router.get("/stats/global", StatsController.getGlobalStats);

// ===== MESSAGE ROUTES =====
router.post("/message/send", authenticate, MessageController.sendMessage);
router.get(
  "/message/conversation/:escortId",
  authenticate,
  MessageController.getConversation
);
router.get(
  "/message/conversations",
  authenticate,
  MessageController.getUserConversations
);
router.put(
  "/message/mark-read/:messageId",
  authenticate,
  MessageController.markAsRead
);
router.delete(
  "/message/delete/:messageId",
  authenticate,
  MessageController.deleteMessage
);
router.post(
  "/message/upload-image",
  authenticate,
  MessageController.uploadMessageImage
);

// ===== UPGRADE REQUEST ROUTES =====
router.post(
  "/upgrade-request/create",
  authenticate,
  onlyEscort,
  UpgradeRequestController.createUpgradeRequest
);
router.get(
  "/upgrade-request/user",
  authenticate,
  onlyEscort,
  UpgradeRequestController.getUserUpgradeRequests
);
router.get(
  "/upgrade-request/admin/all",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.getAllUpgradeRequests
);
router.put(
  "/upgrade-request/admin/approve/:id",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.approveUpgradeRequest
);
router.put(
  "/upgrade-request/admin/reject/:id",
  authenticate,
  onlyAdmin,
  UpgradeRequestController.rejectUpgradeRequest
);

// ===== REVIEW ROUTES =====
router.post("/review/create", authenticate, ReviewController.createReview);
router.get("/review/escort/:escortId", ReviewController.getEscortReviews);
router.get("/review/user", authenticate, ReviewController.getUserReviews);
router.put("/review/:id", authenticate, ReviewController.updateReview);
router.delete("/review/:id", authenticate, ReviewController.deleteReview);
router.post("/review/report/:id", authenticate, ReviewController.reportReview);

// ===== FAVORITE ROUTES =====
router.post("/favorite/add", authenticate, FavoriteController.addToFavorites);
router.delete(
  "/favorite/remove",
  authenticate,
  FavoriteController.removeFromFavorites
);
router.get("/favorite/user", authenticate, FavoriteController.getUserFavorites);

// ===== CATEGORY ROUTES =====
router.get("/category/all-category", CategoryController.getAllCategories);

export default router;
