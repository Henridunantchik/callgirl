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

// Update escort badges
const updateEscortBadges = async () => {
  try {
    console.log("🔄 Starting escort badges update...");

    // Import the User model
    const User = (await import("../models/user.model.js")).default;

    // Update Lola Lala (Elite escort)
    await User.findOneAndUpdate(
      { name: "Lola Lala" },
      {
        isAvailable: true,
        isVerified: true, // Document verification for becoming escort
        isAgeVerified: true,
        subscriptionTier: "elite",
        isFeatured: true,
      }
    );
    console.log("✅ Updated Lola Lala (Elite)");

    // Update Emma Wilson (Premium escort)
    await User.findOneAndUpdate(
      { name: "Emma Wilson" },
      {
        isAvailable: true,
        isVerified: true, // Document verification for becoming escort
        isAgeVerified: true,
        subscriptionTier: "premium",
        isFeatured: false,
      }
    );
    console.log("✅ Updated Emma Wilson (Premium)");

    // Update Maria Rodriguez (Featured escort)
    await User.findOneAndUpdate(
      { name: "Maria Rodriguez" },
      {
        isAvailable: true,
        isVerified: true, // Document verification for becoming escort
        isAgeVerified: true,
        subscriptionTier: "basic",
        isFeatured: true,
      }
    );
    console.log("✅ Updated Maria Rodriguez (Featured)");

    // Update all other escorts to have basic verification
    const result = await User.updateMany(
      {
        role: "escort",
        name: { $nin: ["Lola Lala", "Emma Wilson", "Maria Rodriguez"] },
      },
      {
        isAvailable: true,
        isVerified: true, // All escorts should be verified (uploaded documents)
        isAgeVerified: true, // All escorts should have age verification
        subscriptionTier: "basic",
        isFeatured: false,
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} other escorts`);

    // Display final status
    console.log("\n📊 Final Escort Status:");
    const escorts = await User.find({ role: "escort" }).select(
      "name isAvailable isVerified isAgeVerified subscriptionTier isFeatured"
    );

    escorts.forEach((escort) => {
      console.log(`\n👤 ${escort.name}:`);
      console.log(`   Available: ${escort.isAvailable ? "✅" : "❌"}`);
      console.log(
        `   Verified: ${escort.isVerified ? "✅" : "❌"} (Documents)`
      );
      console.log(`   Age Verified: ${escort.isAgeVerified ? "✅" : "❌"}`);
      console.log(`   Tier: ${escort.subscriptionTier.toUpperCase()}`);
      console.log(`   Featured: ${escort.isFeatured ? "✅" : "❌"}`);
    });

    console.log("\n🎉 Escort badges update completed successfully!");
  } catch (error) {
    console.error("❌ Error updating escort badges:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

// Run the script
connectDB().then(() => {
  updateEscortBadges();
});
