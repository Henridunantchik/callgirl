// Single Vercel entry point - handles all API routes
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
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
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
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

// Apply CORS
app.use(
  cors({
    origin: config.FRONTEND_URL || "http://localhost:5173",
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
      console.log("⚠️ MongoDB connection string not found, running in demo mode");
      return;
    }
    
    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.log("⚠️ Running in demo mode without database");
  }
};

connectToMongoDB().then(() => {

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
              isOnline: true,
            });

            // Join user to their personal room
            socket.join(`user_${userId}`);

            // Update user's online status in database
            const User = mongoose.model("User");
            await User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastActive: new Date(),
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

          console.log(
            `📨 Message from ${senderId} to ${recipientId}: ${content}`
          );

          // Save message to database
          const Message = mongoose.model("Message");
          const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content,
            messageId,
          });

          // Populate sender info
          await message.populate("sender", "name avatar");

          // Send to recipient if online
          const recipientSocket = onlineUsers.get(recipientId);
          if (recipientSocket) {
            io.to(`user_${recipientId}`).emit("new_message", {
              message: {
                _id: message._id,
                sender: message.sender,
                recipient: message.recipient,
                content: message.content,
                createdAt: message.createdAt,
                isRead: message.isRead,
              },
            });
          }

          // Send confirmation to sender
          socket.emit("message_sent", {
            messageId: message._id,
            success: true,
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
          io.to(`user_${recipientId}`).emit("user_stopped_typing", {
            senderId,
          });
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
            readAt: new Date(),
          });

          // Notify sender that message was read
          const message = await Message.findById(messageId).populate("sender");
          if (message && message.sender._id.toString() !== readerId) {
            const senderSocket = onlineUsers.get(message.sender._id.toString());
            if (senderSocket) {
              io.to(`user_${message.sender._id}`).emit("message_read", {
                messageId,
              });
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
            lastActive: new Date(),
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
