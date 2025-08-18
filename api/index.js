import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
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

// Import consolidated routes
import ConsolidatedRoutes from "./routes/consolidated.js";

// Load environment variables
dotenv.config();

const app = express();

// Apply security headers
app.use(securityHeaders);

// Apply rate limiting
if (config.NODE_ENV === "development") {
  app.use("/api/auth", devRateLimiter);
  app.use("/api", devRateLimiter);
  app.use("/api/upload", devRateLimiter);
  app.use("/api/search", devRateLimiter);
} else {
  app.use("/api/auth", authRateLimiter);
  app.use("/api", apiRateLimiter);
  app.use("/api/upload", uploadRateLimiter);
  app.use("/api/search", searchRateLimiter);
}

// Apply CORS - More permissive for debugging
app.use(
  cors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// Handle preflight requests
app.options("*", cors());

// Apply middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Apply input validation middleware
app.use(sanitizeAllInput);

// Apply performance monitoring
app.use(performanceMiddleware);

// Apply caching middleware
app.use(cacheMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Consolidated API Routes - Single serverless function
app.use("/api", ConsolidatedRoutes);

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

// Connect to MongoDB (with fallback for missing env vars)
const connectToMongoDB = async () => {
  try {
    if (!config.MONGODB_CONN) {
      console.log(
        "⚠️ MongoDB connection string not found, running in demo mode"
      );
      return;
    }

    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.log("⚠️ Running in demo mode without database");
  }
};

// Initialize MongoDB connection
connectToMongoDB();

export default app;
