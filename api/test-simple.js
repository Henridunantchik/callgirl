import mongoose from "mongoose";
import config from "./config/env.js";

console.log("Testing basic imports...");
console.log("Config loaded:", config.PORT);

// Test simple mongoose connection
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