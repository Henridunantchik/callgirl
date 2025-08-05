import mongoose from "mongoose";
import config from "./config/env.js";

console.log("Testing user model import...");

try {
  const User = await import("./models/user.model.js");
  console.log("✅ User model imported successfully");
  console.log("User model:", User.default);
} catch (error) {
  console.error("❌ User model import failed:", error);
  process.exit(1);
}

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