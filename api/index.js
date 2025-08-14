import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import config from "./config/env.js";
import { securityHeaders } from "./utils/security.js";
import { authenticate } from "./middleware/authenticate.js";
import { onlyEscort } from "./middleware/onlyEscort.js";
import upload from "./config/multer.js";
import cloudinary from "./config/cloudinary.js";
import User from "./models/user.model.js";

// Import rate limiters
import {
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
  devRateLimiter,
} from "./middleware/rateLimiter.js";

// Import performance optimizations
import { performanceMiddleware } from "./utils/performanceMonitor.js";
import { cacheMiddleware } from "./utils/cache.js";

// Import input validation middleware
import {
  sanitizeAllInput,
  validateEmailInput,
  validatePasswordInput,
  validateFileUpload,
} from "./middleware/validateInput.js";

// Import routes
import AuthRoute from "./routes/Auth.route.js";
import UserRoute from "./routes/User.route.js";
import EscortRoute from "./routes/Escort.route.js";
import CategoryRoute from "./routes/Category.route.js";
import BlogRoute from "./routes/Blog.route.js";
import BloglikeRoute from "./routes/Bloglike.route.js";
import CommentRoute from "./routes/Comment.route.js";
import BookingRoute from "./routes/Booking.route.js";
import FavoriteRoute from "./routes/Favorite.route.js";
import MessageRoute from "./routes/Message.route.js";
import PaymentRoute from "./routes/Payment.route.js";
import ReportRoute from "./routes/Report.route.js";
import ReviewRoute from "./routes/Review.route.js";
import AgeVerificationRoute from "./routes/AgeVerification.route.js";
import AdminAgeVerificationRoute from "./routes/AdminAgeVerification.route.js";
import SubscriptionRoute from "./routes/Subscription.route.js";
import AdminSubscriptionRoute from "./routes/AdminSubscription.route.js";

const app = express();

// Apply security headers
app.use(securityHeaders);

// Apply rate limiting
if (config.NODE_ENV === "development") {
  // Use more lenient rate limiting in development
  app.use("/api/auth", devRateLimiter);
  app.use("/api", devRateLimiter);
  app.use("/api/upload", devRateLimiter);
  app.use("/api/search", devRateLimiter);
} else {
  // Use strict rate limiting in production
  app.use("/api/auth", authRateLimiter);
  app.use("/api", apiRateLimiter);
  app.use("/api/upload", uploadRateLimiter);
  app.use("/api/search", searchRateLimiter);
}

// Apply input sanitization globally
app.use(sanitizeAllInput);

// Apply performance monitoring
app.use(performanceMiddleware);

// Middleware
app.use(
  cors({
    origin:
      config.NODE_ENV === "development"
        ? ["http://localhost:5173", "http://127.0.0.1:5173"]
        : config.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API Health check endpoint (for frontend proxy)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Server is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Performance monitoring endpoint
app.get("/api/performance", async (req, res) => {
  const { getPerformanceStats } = await import("./utils/performanceMonitor.js");
  const stats = getPerformanceStats();
  res.status(200).json({
    success: true,
    data: stats,
    message: "Performance statistics retrieved successfully",
  });
});

// Development endpoint to reset rate limits (only in development)
if (config.NODE_ENV === "development") {
  app.get("/api/dev/reset-rate-limit", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Rate limit reset endpoint available in development mode",
      note: "This endpoint can be used to reset rate limits during testing",
    });
  });

  // Import and setup rate limit clearing
  import("./utils/clearRateLimit.js").then(
    ({ setupRateLimitClearEndpoint }) => {
      setupRateLimitClearEndpoint(app);
    }
  );
}

// API Routes
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/escort", EscortRoute);

app.use("/api/category", CategoryRoute);
app.use("/api/blog", BlogRoute);
app.use("/api/bloglike", BloglikeRoute);
app.use("/api/comment", CommentRoute);
app.use("/api/booking", BookingRoute);
app.use("/api/favorite", FavoriteRoute);
app.use("/api/message", MessageRoute);
app.use("/api/payment", PaymentRoute);
app.use("/api/report", ReportRoute);
app.use("/api/review", ReviewRoute);

// Age verification routes
app.use("/api/auth/age-verification", AgeVerificationRoute);
app.use("/api/admin/age-verification", AdminAgeVerificationRoute);

// Subscription routes
app.use("/api/subscription", SubscriptionRoute);
app.use("/api/admin/subscription", AdminSubscriptionRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(config.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_CONN)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start server
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  });

export default app;
