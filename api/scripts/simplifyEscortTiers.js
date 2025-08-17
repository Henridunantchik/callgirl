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

// Simplify escort tiers
const simplifyEscortTiers = async () => {
  try {
    console.log("🔄 Starting escort tiers simplification...");

    // Import the User model
    const User = (await import("../models/user.model.js")).default;

    // Update Lola Lala - Premium tier
    await User.findOneAndUpdate(
      { name: "Lola Lala" },
      {
        subscriptionTier: "premium",
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );
    console.log("✅ Updated Lola Lala (Premium)");

    // Update Maria Rodriguez - Featured tier
    await User.findOneAndUpdate(
      { name: "Maria Rodriguez" },
      {
        subscriptionTier: "featured",
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );
    console.log("✅ Updated Maria Rodriguez (Featured)");

    // Update Emma Wilson - Featured tier
    await User.findOneAndUpdate(
      { name: "Emma Wilson" },
      {
        subscriptionTier: "featured",
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );
    console.log("✅ Updated Emma Wilson (Featured)");

    // Update all other escorts to basic tier
    const result = await User.updateMany(
      {
        role: "escort",
        name: { $nin: ["Lola Lala", "Emma Wilson", "Maria Rodriguez"] }
      },
      {
        subscriptionTier: "basic",
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} other escorts to Basic`);

    // Display final status
    console.log("\n📊 Final Simplified Escort Status:");
    const escorts = await User.find({ role: "escort" }).select(
      "name isAvailable isVerified isAgeVerified subscriptionTier"
    );

    escorts.forEach((escort) => {
      console.log(`\n👤 ${escort.name}:`);
      console.log(`   Available: ${escort.isAvailable ? "✅" : "❌"}`);
      console.log(`   Verified: ${escort.isVerified ? "✅" : "❌"}`);
      console.log(`   Age Verified: ${escort.isAgeVerified ? "✅" : "❌"}`);
      console.log(`   Tier: ${escort.subscriptionTier.toUpperCase()}`);
    });

    console.log("\n🎉 Escort tiers simplification completed successfully!");

  } catch (error) {
    console.error("❌ Error simplifying escort tiers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

// Run the script
connectDB().then(() => {
  simplifyEscortTiers();
});
