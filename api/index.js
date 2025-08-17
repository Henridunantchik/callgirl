import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
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
import TransportRoute from "./routes/Transport.route.js";
import StatsRoute from "./routes/Stats.route.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store online users
const onlineUsers = new Map();

// Make io available to routes
app.set("io", io);
app.set("onlineUsers", onlineUsers);

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

// Transport routes
app.use("/api/transport", TransportRoute);
app.use("/api/stats", StatsRoute);

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

    // Setup Socket.io connection handling after database is connected
    io.on("connection", (socket) => {
      console.log("🔌 User connected:", socket.id);

      // Handle user authentication
      socket.on("authenticate", async (data) => {
        try {
          const { token, userId } = data;
          
          if (token && userId) {
            // Store user connection
            onlineUsers.set(userId, {
              socketId: socket.id,
              connectedAt: new Date(),
              isOnline: true
            });
            
            // Join user to their personal room
            socket.join(`user_${userId}`);
            
            // Update user's online status in database
            const User = mongoose.model("User");
            await User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastActive: new Date()
            });
            
            // Broadcast to all clients that this user is online
            socket.broadcast.emit("user_online", { userId });
            
            console.log(`🟢 User ${userId} is now online`);
          }
        } catch (error) {
          console.error("Socket authentication error:", error);
        }
      });

      // Handle private messages
      socket.on("send_message", async (data) => {
        try {
          const { senderId, recipientId, content, messageId } = data;
          
          console.log(`📨 Message from ${senderId} to ${recipientId}: ${content}`);
          
          // Save message to database
          const Message = mongoose.model("Message");
          const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content,
            type: "text"
          });
          
          console.log(`💾 Message saved to database: ${message._id}`);
          
          // Emit to recipient if online (using user room)
          const recipientSocket = onlineUsers.get(recipientId);
          if (recipientSocket) {
            console.log(`📤 Emitting to recipient ${recipientId} in room user_${recipientId}`);
            io.to(`user_${recipientId}`).emit("new_message", {
              message: {
                _id: message._id,
                sender: senderId,
                recipient: recipientId,
                content,
                type: "text",
                isRead: false,
                createdAt: message.createdAt
              }
            });
          } else {
            console.log(`📤 Recipient ${recipientId} is offline`);
          }
          
          // Emit back to sender for confirmation
          socket.emit("message_sent", {
            messageId: message._id,
            success: true
          });
          
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("message_error", { error: "Failed to send message" });
        }
      });

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        const { senderId, recipientId } = data;
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) {
          io.to(`user_${recipientId}`).emit("user_typing", { senderId });
        }
      });

      socket.on("typing_stop", (data) => {
        const { senderId, recipientId } = data;
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) {
          io.to(`user_${recipientId}`).emit("user_stopped_typing", { senderId });
        }
      });

      // Handle message read receipts
      socket.on("mark_read", async (data) => {
        try {
          const { messageId, readerId } = data;
          
          // Update message in database
          const Message = mongoose.model("Message");
          await Message.findByIdAndUpdate(messageId, {
            isRead: true,
            readAt: new Date()
          });
          
          // Notify sender that message was read
          const message = await Message.findById(messageId).populate("sender");
          if (message && message.sender._id.toString() !== readerId) {
            const senderSocket = onlineUsers.get(message.sender._id.toString());
            if (senderSocket) {
              io.to(`user_${message.sender._id}`).emit("message_read", { messageId });
            }
          }
          
        } catch (error) {
          console.error("Mark read error:", error);
        }
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        console.log("🔌 User disconnected:", socket.id);
        
        // Find and remove user from online users
        let disconnectedUserId = null;
        for (const [userId, userData] of onlineUsers.entries()) {
          if (userData.socketId === socket.id) {
            disconnectedUserId = userId;
            break;
          }
        }
        
        if (disconnectedUserId) {
          onlineUsers.delete(disconnectedUserId);
          
          // Update user's online status in database
          const User = mongoose.model("User");
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastActive: new Date()
          });
          
          // Broadcast to all clients that this user is offline
          socket.broadcast.emit("user_offline", { userId: disconnectedUserId });
          
          console.log(`🔴 User ${disconnectedUserId} is now offline`);
        }
      });
    });

    // Start server
    server.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🔌 Socket.io server ready for real-time messaging`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  });

export default app;
