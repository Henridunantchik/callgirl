import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
// import rateLimit from "express-rate-limit"; // Removed - no rate limiting needed
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { performanceMiddleware } from "./middleware/performanceMonitor.js";
import {
  createDatabaseIndexes,
  optimizeDatabaseConnection,
} from "./utils/databaseOptimizer.js";

// Import configuration
import config from "./config/env.js";

// Import individual routes
import authRoutes from "./routes/Auth.route.js";
import userRoutes from "./routes/User.route.js";
import escortRoutes from "./routes/Escort.route.js";
import messageRoutes from "./routes/Message.route.js";
import statsRoutes from "./routes/Stats.route.js";
import upgradeRequestRoutes from "./routes/UpgradeRequest.route.js";
import reviewRoutes from "./routes/Review.route.js";
import favoriteRoutes from "./routes/Favorite.route.js";
import categoryRoutes from "./routes/Category.route.js";
import adminRoutes from "./routes/Admin.route.js";
import transportRoutes from "./routes/Transport.route.js";
import bookingRoutes from "./routes/Booking.route.js";
import blogRoutes from "./routes/Blog.route.js";

// Import middleware (not needed in consolidated routes)

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
// Trust proxy for correct secure cookies and req.secure behind Railway
app.set("trust proxy", 1);
// Hide tech stack header
app.disable("x-powered-by");
const server = createServer(app);

// Configure CORS for multiple frontend URLs
const allowedOrigins = config.FRONTEND_URLS
  ? config.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [config.FRONTEND_URL];

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: false,
});

// Middleware
app.use(performanceMiddleware); // Performance monitoring
app.use(
  helmet({
    // Allow OAuth popups like Google to close themselves without COOP blocking
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    // Avoid cross-origin isolation which can interfere with third-party popups
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://js.stripe.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.epicescorts.live",
          "https://callgirls.vercel.app",
          "https://epicescorts.live",
          "https://www.epicescorts.live",
          "wss://api.epicescorts.live",
        ],
        imgSrc: ["'self'", "data:", "blob:", "https://*"],
        mediaSrc: ["'self'", "data:", "blob:", "https://*"],
        frameSrc: ["'self'", "https://js.stripe.com"],
      },
      reportOnly: true,
    },
  })
);
// Enable gzip compression for all responses
app.use(
  compression({
    threshold: 1024,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches any of the allowed patterns
      const isAllowed = allowedOrigins.some((allowedUrl) => {
        if (allowedUrl.includes("localhost")) {
          return origin.includes("localhost");
        }
        return origin === allowedUrl;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // Log the rejected origin for debugging
      console.log(`CORS: Rejected origin: ${origin}`);
      console.log(`CORS: Allowed origins: ${allowedOrigins.join(", ")}`);

      // Do not throw; respond without CORS headers (browser will block), avoiding 5xx/502
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

// Ensure all preflight requests are handled with the same dynamic CORS config
app.options(
  "*",
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowedUrl) => {
        if (allowedUrl.includes("localhost"))
          return origin.includes("localhost");
        return origin === allowedUrl;
      });
      if (isAllowed) return callback(null, true);
      console.log(`CORS (OPTIONS): Rejected origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
    ],
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// NO RATE LIMITING AT ALL - Allow unlimited scaling
// This enables the app to handle thousands of concurrent users
// Rate limiting is handled by the infrastructure (load balancers, CDN, etc.)

// app.use("/api/auth", ...); // NO LIMIT
// app.use("/api/admin", ...); // NO LIMIT
// app.use("/api/upgrade-request", ...); // NO LIMIT

// NO RATE LIMITING for all other endpoints - they can handle unlimited traffic
// This allows the app to scale to thousands of concurrent users
// app.use("/api/escort", ...); // NO LIMIT
// app.use("/api/stats", ...); // NO LIMIT
// app.use("/api/category", ...); // NO LIMIT
// app.use("/api/blog", ...); // NO LIMIT
// app.use("/api/message", ...); // NO LIMIT
// app.use("/api/booking", ...); // NO LIMIT
// app.use("/api/review", ...); // NO LIMIT
// app.use("/api/favorite", ...); // NO LIMIT
// app.use("/api/user", ...); // NO LIMIT

// Import backup manager and file fallback middleware
import {
  fileFallbackMiddleware,
  serveFileWithFallback,
  fileStorageHealth,
} from "./middleware/fileFallback.js";
import {
  apiRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  searchRateLimiter,
} from "./middleware/rateLimiter.js";

// Static files with INTELLIGENT FALLBACK SYSTEM
app.use(
  "/uploads",
  (req, res, next) => {
    // Use the same CORS logic as the main middleware
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    } else if (!origin) {
      // Allow requests with no origin (like mobile apps or curl requests)
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    // Cache static files aggressively
    res.header("Cache-Control", "public, max-age=31536000, immutable");

    // NO AUTHENTICATION for static files - they should be publicly accessible
    next();
  },
  // Use intelligent fallback middleware for file serving
  fileFallbackMiddleware,
  // Use production path for Railway, local path for development
  config.NODE_ENV === "production"
    ? express.static(process.env.RAILWAY_STORAGE_PATH || "/data/uploads")
    : express.static(path.join(__dirname, "uploads"))
);

// Health check endpoints - NO RATE LIMITING
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const statusCode =
    dbConnected || config.NODE_ENV !== "production" ? 200 : 503;
  res.status(statusCode).json({
    success: statusCode === 200,
    message: dbConnected
      ? "Escort Directory API is running"
      : "Database not connected",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    port: config.PORT,
    dbConnected,
  });
});

// API status endpoint - NO RATE LIMITING
app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is operational",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Performance metrics endpoint
app.get("/api/performance", async (req, res) => {
  try {
    const { getPerformanceMetrics } = await import(
      "./middleware/performanceMonitor.js"
    );
    const metrics = getPerformanceMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting performance metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get performance metrics",
      error:
        config.NODE_ENV === "development" ? error.message : "Internal error",
    });
  }
});

// Performance health check endpoint
app.get("/api/performance/health", async (req, res) => {
  try {
    const { getPerformanceHealth } = await import(
      "./middleware/performanceMonitor.js"
    );
    const health = getPerformanceHealth();

    res.status(200).json({
      success: true,
      data: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting performance health:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get performance health",
      error:
        config.NODE_ENV === "development" ? error.message : "Internal error",
    });
  }
});

// Ping endpoint - NO RATE LIMITING
app.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});

// Enhanced file debugging endpoint with backup manager integration
app.get("/debug/files", async (req, res) => {
  try {
    // Get backup manager stats (if available)
    let backupStats = null;
    try {
      const backupManagerModule = await import("./services/backupManager.js");
      const backupManager = backupManagerModule.default;
      backupStats = backupManager.getStats();
    } catch (error) {
      backupStats = { error: "Backup manager not available" };
    }

    // Get file storage health
    const healthResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api/storage/health`
    );
    const healthData = healthResponse.ok ? await healthResponse.json() : null;

    res.status(200).json({
      success: true,
      data: {
        environment: config.NODE_ENV,
        backupManager: backupStats,
        storageHealth: healthData?.data || null,
        uploadPath: process.env.RAILWAY_STORAGE_PATH || "/data/uploads",
        baseUrl: process.env.RAILWAY_EXTERNAL_URL || process.env.BASE_URL || "",
        directories: {
          images: `${
            process.env.RAILWAY_STORAGE_PATH || "/data/uploads"
          }/images`,
          gallery: `${
            process.env.RAILWAY_STORAGE_PATH || "/data/uploads"
          }/gallery`,
          videos: `${
            process.env.RAILWAY_STORAGE_PATH || "/data/uploads"
          }/videos`,
        },
        envVars: {
          NODE_ENV: process.env.NODE_ENV,
          RAILWAY_STORAGE_PATH: process.env.RAILWAY_STORAGE_PATH,
          RAILWAY_EXTERNAL_URL: process.env.RAILWAY_EXTERNAL_URL,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error debugging files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to debug files",
      error:
        config.NODE_ENV === "development" ? error.message : "Internal error",
    });
  }
});

// File storage health endpoint
app.get("/api/storage/health", fileStorageHealth);

// Force backup sync endpoint
app.post("/api/storage/sync", async (req, res) => {
  try {
    const backupManagerModule = await import("./services/backupManager.js");
    const backupManager = backupManagerModule.default;
    await backupManager.forceSync();
    res.json({
      success: true,
      message: "Backup sync initiated",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Sync failed",
      message: error.message,
    });
  }
});

// Global CORS handler for all API routes
app.use("/api", (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Apply modest, non-breaking rate limiting
if (config.NODE_ENV === "production") {
  // Global API limiter
  app.use("/api", apiRateLimiter);
}

// Debug middleware to log all API requests (development only)
if (config.NODE_ENV === "development") {
  app.use("/api", (req, res, next) => {
    console.log(`🔍 API Request: ${req.method} ${req.url}`);
    next();
  });
}

// API routes (individual)
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/escort", escortRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upgrade-request", upgradeRequestRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/blog", blogRoutes);

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "API endpoint not found",
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err);

  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle different types of errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      error: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      error: "Invalid ID provided",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "Authentication failed",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: "Please login again",
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    error:
      process.env.NODE_ENV === "development"
        ? err.stack
        : "Something went wrong",
  });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on("send-message", (data) => {
    io.to(data.roomId).emit("new-message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("user-typing", data);
  });

  socket.on("stop-typing", (data) => {
    socket.to(data.roomId).emit("user-stop-typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Internal server error";
  const errors = err?.errors || undefined;
  if (status >= 500) {
    console.error("Unhandled Error:", err);
  }
  res.status(status).json({
    success: false,
    message,
    errors,
    error:
      config.NODE_ENV === "development"
        ? err?.stack || err?.message
        : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    console.log(`🔧 Environment: ${config.NODE_ENV}`);
    console.log(`📦 Node version: ${process.version}`);
    console.log(
      `💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    );

    // Log environment variables (without sensitive data)
    console.log("🔧 Environment variables:");
    console.log(`   PORT: ${process.env.PORT || "not set"}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
    console.log(
      `   MONGODB_CONN: ${process.env.MONGODB_CONN ? "set" : "not set"}`
    );
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? "set" : "not set"}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || "not set"}`);

    // Optimize database connection
    optimizeDatabaseConnection();

    // Connect to MongoDB with optimized settings
    console.log("🔌 Connecting to MongoDB...");
    console.log(
      `   Connection string: ${config.MONGODB_CONN.substring(0, 20)}...`
    );

    try {
      await mongoose.connect(config.MONGODB_CONN, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000, // Increased timeout
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000, // Added connection timeout
      });
      console.log("✅ Connected to MongoDB");
    } catch (dbError) {
      console.error("❌ MongoDB connection failed:", dbError.message);
      if (config.NODE_ENV === "production") {
        console.error("Exiting: DB is required in production");
        process.exit(1);
      }
      console.log("⚠️ Continuing without database connection (non-production)");
    }

    // Create database indexes for performance (only if connected)
    if (mongoose.connection.readyState === 1) {
      console.log("📊 Creating database indexes...");
      try {
        await createDatabaseIndexes();
        console.log("✅ Database indexes created");
      } catch (indexError) {
        console.warn(
          "⚠️ Failed to create database indexes:",
          indexError.message
        );
      }
    } else {
      console.log("⚠️ Skipping database indexes (not connected)");
    }

    // Start server
    const port = process.env.PORT || config.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📱 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🔧 Environment: ${config.NODE_ENV}`);
      console.log(
        `🌐 Health check: ${
          config.BASE_URL || `http://localhost:${port}`
        }/health`
      );
      console.log(
        `📊 Performance metrics: ${
          config.BASE_URL || `http://localhost:${port}`
        }/api/performance`
      );
      console.log("✅ Server startup complete");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Error details:", {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

// Start the server
startServer();
