import mongoose from "mongoose";
import User from "../models/user.model.js";
import config from "../config/env.js";

const checkFeaturedEscorts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all escorts with featured or premium subscription
    const featuredEscorts = await User.find({
      role: "escort",
      $or: [{ subscriptionTier: "featured" }, { subscriptionTier: "premium" }],
    });

    console.log(
      `\n📊 Found ${featuredEscorts.length} escorts with Featured/Premium subscription:`
    );

    for (const escort of featuredEscorts) {
      console.log(`\n👤 ${escort.name} (${escort.email}):`);
      console.log(`   - subscriptionTier: ${escort.subscriptionTier}`);
      console.log(`   - isFeatured: ${escort.isFeatured}`);
      console.log(`   - isVerified: ${escort.isVerified}`);

      // Check if isFeatured needs to be updated
      if (
        escort.subscriptionTier === "featured" ||
        escort.subscriptionTier === "premium"
      ) {
        if (escort.isFeatured !== true) {
          console.log(`   ⚠️  Updating isFeatured to true...`);
          escort.isFeatured = true;
          await escort.save();
          console.log(`   ✅ Updated isFeatured to true`);
        } else {
          console.log(`   ✅ isFeatured already set correctly`);
        }
      }
    }

    // Also check escorts with isFeatured = true but wrong subscriptionTier
    const isFeaturedEscorts = await User.find({
      role: "escort",
      isFeatured: true,
    });

    console.log(
      `\n📊 Found ${isFeaturedEscorts.length} escorts with isFeatured = true:`
    );

    for (const escort of isFeaturedEscorts) {
      console.log(`\n👤 ${escort.name} (${escort.email}):`);
      console.log(`   - subscriptionTier: ${escort.subscriptionTier}`);
      console.log(`   - isFeatured: ${escort.isFeatured}`);

      if (
        escort.subscriptionTier !== "featured" &&
        escort.subscriptionTier !== "premium"
      ) {
        console.log(`   ⚠️  subscriptionTier should be featured or premium`);
      }
    }

    console.log("\n✅ Featured escorts check completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the script
checkFeaturedEscorts();
