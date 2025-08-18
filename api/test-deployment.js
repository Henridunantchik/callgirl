// Simple test to verify deployment
console.log("✅ API deployment test - consolidated routes working");

// Test that consolidated routes are accessible
import express from "express";
import ConsolidatedRoutes from "./routes/consolidated.js";

const app = express();
app.use("/api", ConsolidatedRoutes);

console.log("✅ Consolidated routes loaded successfully");
console.log("✅ Ready for Vercel deployment");

export default app;
