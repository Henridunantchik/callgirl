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

// Fix subscription tiers
const fixSubscriptionTiers = async () => {
  try {
    console.log("🔄 Starting subscription tier fix...");

    // Import the User model
    const User = (await import("../models/user.model.js")).default;

    // Find all users with subscriptionTier: "free"
    const usersWithFreeTier = await User.find({ subscriptionTier: "free" });
    console.log(
      `📊 Found ${usersWithFreeTier.length} users with subscriptionTier: "free"`
    );

    if (usersWithFreeTier.length > 0) {
      console.log("\n👥 Users with 'free' tier:");
      usersWithFreeTier.forEach((user) => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      });

      // Update all users with subscriptionTier: "free" to "basic"
      const result = await User.updateMany(
        { subscriptionTier: "free" },
        { subscriptionTier: "basic" }
      );

      console.log(
        `\n✅ Updated ${result.modifiedCount} users from 'free' to 'basic'`
      );
    } else {
      console.log("✅ No users found with subscriptionTier: 'free'");
    }

    // Display final status
    console.log("\n📊 Final Subscription Tier Status:");
    const tierCounts = await User.aggregate([
      {
        $group: {
          _id: "$subscriptionTier",
          count: { $sum: 1 },
        },
      },
    ]);

    tierCounts.forEach((tier) => {
      console.log(`   ${tier._id || "null"}: ${tier.count} users`);
    });

    console.log("\n🎉 Subscription tier fix completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing subscription tiers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

// Run the script
connectDB().then(() => {
  fixSubscriptionTiers();
});
