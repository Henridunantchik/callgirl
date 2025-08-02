import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import AuthRoute from "./routes/Auth.route.js";
import UserRoute from "./routes/User.route.js";
import CategoryRoute from "./routes/Category.route.js";
import BlogRoute from "./routes/Blog.route.js";
import CommentRouote from "./routes/Comment.route.js";
import BlogLikeRoute from "./routes/Bloglike.route.js";

// New routes for escort directory
import EscortRoute from "./routes/Escort.route.js";
import ReviewRoute from "./routes/Review.route.js";
import BookingRoute from "./routes/Booking.route.js";
import FavoriteRoute from "./routes/Favorite.route.js";
import MessageRoute from "./routes/Message.route.js";
import PaymentRoute from "./routes/Payment.route.js";
import ReportRoute from "./routes/Report.route.js";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

// Debug environment variables
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "***" : "undefined");
console.log("MONGODB_CONN:", process.env.MONGODB_CONN ? "***" : "undefined");

// Use hardcoded values for development
const JWT_SECRET =
  "88fe387324347ce1cd8213b17241b52c204d4170800170770a305968db3e04ca";
const MONGODB_CONN =
  "mongodb+srv://tusiwawasahau:tusiwawasahau.cd@cluster0.kkkt6.mongodb.net/tusiwawasahau";
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cookieParser());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Age verification middleware
app.use((req, res, next) => {
  console.log("=== AGE VERIFICATION MIDDLEWARE ===");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);

  // Skip age verification for certain routes
  const skipRoutes = [
    "/api/auth/age-verification",
    "/api/auth/verify-age",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google-login",
    "/api/auth/logout",
    "/api/auth/me",
    "/api/legal/terms",
    "/api/legal/privacy",
    "/api/health",
    "/api/category/all-category",
    "/api/escort/all",
    "/api/escort/search",
    "/api/escort/location",
    "/api/escort/category",
    "/api/escort/create",
    "/api/user/update",
    "/api/user/update-user",
  ];

  // Check if the current path matches any skip route
  const shouldSkip = skipRoutes.some((route) => {
    if (route.includes("*")) {
      // Handle wildcard routes
      const pattern = route.replace("*", ".*");
      return new RegExp(pattern).test(req.path);
    }
    return req.path.startsWith(route);
  });

  console.log("Should skip age verification:", shouldSkip);
  console.log("Skip routes:", skipRoutes);

  if (shouldSkip) {
    console.log("Skipping age verification for:", req.path);
    return next();
  }

  // Check if user has verified age
  const ageVerified = req.cookies.ageVerified;

  // Skip age verification for authenticated users (they've already verified during registration)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log("User is authenticated, skipping age verification");
    return next();
  }

  if (!ageVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Age verification required. You must be 18 or older to access this site.",
    });
  }

  next();
});

// route setup - Legacy routes (to be deprecated)
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/blog", BlogRoute);
app.use("/api/comment", CommentRouote);
app.use("/api/blog-like", BlogLikeRoute);

// New escort directory routes
app.use("/api/escort", EscortRoute);
app.use("/api/review", ReviewRoute);
app.use("/api/booking", BookingRoute);
app.use("/api/favorite", FavoriteRoute);
app.use("/api/message", MessageRoute);
app.use("/api/payment", PaymentRoute);
app.use("/api/report", ReportRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Escort Directory API is running",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint for debugging
app.post("/api/test", (req, res) => {
  console.log("Test endpoint hit");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);
  res.json({
    success: true,
    message: "Test endpoint working",
    body: req.body,
    files: req.files ? req.files.length : 0,
  });
});

mongoose
  .connect(MONGODB_CONN, { dbName: "escort_directory" })
  .then(() => console.log("Database connected."))
  .catch((err) => console.log("Database connection failed.", err));

// Global error handlers to prevent server crashes
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("Stack trace:", error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

app.listen(PORT, () => {
  console.log("Escort Directory API running on port:", PORT);
});

app.use((err, req, res, next) => {
  console.error("Express error handler caught:", err);
  console.error("Error stack:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
