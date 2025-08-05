import mongoose from "mongoose";
import config from "./config/env.js";

console.log("Testing simplified user model...");

try {
  const User = await import("./models/user-simple.model.js");
  console.log("✅ Simplified user model imported successfully");
  
  // Test mongoose connection
  mongoose
    .connect(config.MONGODB_CONN)
    .then(() => {
      console.log("✅ MongoDB connection successful");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error);
      process.exit(1);
    });
} catch (error) {
  console.error("❌ Simplified user model import failed:", error);
  process.exit(1);
} 