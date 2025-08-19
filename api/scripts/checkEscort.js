import mongoose from "mongoose";
import config from "../config/env.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Check escort
const checkEscort = async () => {
  try {
    console.log("🔍 Checking escort 'Jay Roland'...");

    // Import the User model
    const User = (await import("../models/user.model.js")).default;

    // Search for Jay Roland
    const escort = await User.findOne({
      $or: [
        { name: "Jay Roland" },
        { name: { $regex: "Jay Roland", $options: 'i' } },
        { alias: "Jay Roland" },
        { alias: { $regex: "Jay Roland", $options: 'i' } }
      ],
      role: "escort"
    });

    if (escort) {
      console.log("✅ Found escort:");
      console.log(`   Name: ${escort.name}`);
      console.log(`   Email: ${escort.email}`);
      console.log(`   Role: ${escort.role}`);
      console.log(`   Subscription Tier: ${escort.subscriptionTier}`);
      console.log(`   Is Active: ${escort.isActive}`);
      console.log(`   Is Available: ${escort.isAvailable}`);
    } else {
      console.log("❌ Escort 'Jay Roland' not found");
      
      // List all escorts
      console.log("\n📋 All escorts in database:");
      const allEscorts = await User.find({ role: "escort" }).select("name alias subscriptionTier isActive");
      allEscorts.forEach(escort => {
        console.log(`   - ${escort.name} (${escort.alias || 'no alias'}) - Tier: ${escort.subscriptionTier} - Active: ${escort.isActive}`);
      });
    }

  } catch (error) {
    console.error("❌ Error checking escort:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

// Run the script
connectDB().then(() => {
  checkEscort();
});
