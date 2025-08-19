import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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
app.use(helmet());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rate limiting strategy for high traffic
// Endpoints sensibles (auth, uploads) - Limites strictes
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2,000 requests per 15 minutes
  message: {
    success: false,
    message: "Rate limit exceeded, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoints privés - Limites modérées
const privateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 5,000 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoints publics - Très haute capacité
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15000, // 15,000 requests per 15 minutes
  message: {
    success: false,
    message: "Service temporarily unavailable, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting based on endpoint type
// Sensitive endpoints (auth, uploads)
app.use("/api/auth", sensitiveLimiter);
app.use("/api/message", sensitiveLimiter);
app.use("/api/upgrade-request", sensitiveLimiter);

// Private endpoints (user data, bookings)
app.use("/api/user", privateLimiter);
app.use("/api/booking", privateLimiter);
app.use("/api/review", privateLimiter);
app.use("/api/favorite", privateLimiter);
app.use("/api/admin", privateLimiter);

// Public endpoints (escorts, stats, categories) - High capacity
app.use("/api/escort", publicLimiter);
app.use("/api/stats", publicLimiter);
app.use("/api/category", publicLimiter);
app.use("/api/blog", publicLimiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Ping endpoint - NO RATE LIMITING
app.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong",
    timestamp: new Date().toISOString(),
  });
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
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ Connected to MongoDB");

    // Start server
    const port = config.PORT || 10000;
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📱 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🔧 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
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
