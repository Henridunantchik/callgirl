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

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Age verification middleware
app.use((req, res, next) => {
  // Skip age verification for certain routes
  const skipRoutes = [
    "/api/auth/age-verification",
    "/api/legal/terms",
    "/api/legal/privacy",
  ];
  if (skipRoutes.includes(req.path)) {
    return next();
  }

  // Check if user has verified age
  const ageVerified = req.cookies.ageVerified;
  if (!ageVerified && req.path !== "/api/auth/verify-age") {
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

mongoose
  .connect(process.env.MONGODB_CONN, { dbName: "escort_directory" })
  .then(() => console.log("Database connected."))
  .catch((err) => console.log("Database connection failed.", err));

app.listen(PORT, () => {
  console.log("Escort Directory API running on port:", PORT);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
