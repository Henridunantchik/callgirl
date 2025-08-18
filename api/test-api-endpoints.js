// Test API endpoints
import express from "express";
import cors from "cors";

const app = express();

// Basic CORS
app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Stats endpoint (without database)
app.get("/api/stats/global", (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        totalEscorts: 0,
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0
      }
    }
  });
});

// Escorts endpoint (without database)
app.get("/api/escort/all", (req, res) => {
  res.json({
    success: true,
    data: {
      escorts: [],
      totalEscorts: 0,
      totalPages: 0,
      currentPage: 1
    }
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats endpoint: http://localhost:${PORT}/api/stats/global`);
  console.log(`👥 Escorts endpoint: http://localhost:${PORT}/api/escort/all`);
});

export default app;
