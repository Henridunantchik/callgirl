import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
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
import renderStorageConfig from "./config/render-storage.js";

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
const server = createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(performanceMiddleware); // Performance monitoring
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: [
      config.FRONTEND_URL,
      "https://callgirls.vercel.app",
      "https://accounts.google.com", // Google OAuth
      "https://www.googleapis.com", // Google APIs
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-File-Source",
      "X-Client-Version", // Google OAuth headers
    ],
    exposedHeaders: ["Set-Cookie", "X-File-Source", "X-File-Path"],
    preflightContinue: false,
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
import backupManager from "./services/backupManager.js";
import {
  fileFallbackMiddleware,
  serveFileWithFallback,
  fileStorageHealth,
} from "./middleware/fileFallback.js";

// Static files with INTELLIGENT FALLBACK SYSTEM
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Credentials", "false");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    // NO AUTHENTICATION for static files - they should be publicly accessible
    next();
  },
  // Use intelligent fallback middleware for file serving
  fileFallbackMiddleware,
  // Fallback to static serving if middleware doesn't handle it
  express.static(path.join(__dirname, "uploads"))
);

// Health check endpoints - NO RATE LIMITING
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Escort Directory API is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    port: config.PORT,
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
    // Get backup manager stats
    const backupStats = backupManager.getStats();

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
        uploadPath:
          process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads",
        baseUrl:
          process.env.RENDER_EXTERNAL_URL ||
          "https://callgirls-api.onrender.com",
        directories: {
          images: "/opt/render/project/src/uploads/images",
          gallery: "/opt/render/project/src/uploads/gallery",
          videos: "/opt/render/project/src/uploads/videos",
        },
        envVars: {
          NODE_ENV: process.env.NODE_ENV,
          RENDER_STORAGE_PATH: process.env.RENDER_STORAGE_PATH,
          RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
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
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      config.NODE_ENV === "development" ? err.message : "Something went wrong",
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
    // Optimize database connection
    optimizeDatabaseConnection();

    // Connect to MongoDB with optimized settings
    await mongoose.connect(config.MONGODB_CONN, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB");

    // Create database indexes for performance
    await createDatabaseIndexes();

    // Start server
    const port = config.PORT || 10000;
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📱 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🔧 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
      console.log(
        `📊 Performance metrics: http://localhost:${port}/api/performance`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

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
