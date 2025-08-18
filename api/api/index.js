import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import config from "../config/env.js";
import ConsolidatedRoutes from "../routes/consolidated.js";

// Load environment variables
dotenv.config();

const app = express();

// Apply CORS - Allow all origins
app.use(
  cors({
    origin: true,
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV || "production",
  });
});

// Consolidated API Routes
app.use("/api", ConsolidatedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
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
