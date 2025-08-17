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

// Fix featured escorts
const fixFeaturedEscorts = async () => {
  try {
    console.log("🔄 Starting featured escorts fix...");

    // Import the User model
    const User = (await import("../models/user.model.js")).default;

    // Fix Maria Rodriguez - Should be Featured tier
    await User.findOneAndUpdate(
      { name: "Maria Rodriguez" },
      {
        isFeatured: true,
        subscriptionTier: "featured", // Add featured tier
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );
    console.log("✅ Fixed Maria Rodriguez (Featured)");

    // Fix Lola Lala - Should be Elite tier
    await User.findOneAndUpdate(
      { name: "Lola Lala" },
      {
        isFeatured: true,
        subscriptionTier: "elite",
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );
    console.log("✅ Fixed Lola Lala (Elite)");

    // Fix Emma Wilson - Should be Premium tier
    await User.findOneAndUpdate(
      { name: "Emma Wilson" },
      {
        isFeatured: false, // Premium but not featured
        subscriptionTier: "premium",
        isAvailable: true,
        isVerified: true,
        isAgeVerified: true
      }
    );
    console.log("✅ Fixed Emma Wilson (Premium)");

    // Display final status
    console.log("\n📊 Final Featured Escorts Status:");
    const escorts = await User.find({ 
      $or: [
        { isFeatured: true },
        { subscriptionTier: { $in: ["premium", "elite", "featured"] } }
      ]
    }).select("name isAvailable isVerified isAgeVerified subscriptionTier isFeatured");

    escorts.forEach((escort) => {
      console.log(`\n👤 ${escort.name}:`);
      console.log(`   Available: ${escort.isAvailable ? "✅" : "❌"}`);
      console.log(`   Verified: ${escort.isVerified ? "✅" : "❌"}`);
      console.log(`   Age Verified: ${escort.isAgeVerified ? "✅" : "❌"}`);
      console.log(`   Tier: ${escort.subscriptionTier.toUpperCase()}`);
      console.log(`   Featured: ${escort.isFeatured ? "✅" : "❌"}`);
    });

    console.log("\n🎉 Featured escorts fix completed successfully!");

  } catch (error) {
    console.error("❌ Error fixing featured escorts:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

// Run the script
connectDB().then(() => {
  fixFeaturedEscorts();
});
