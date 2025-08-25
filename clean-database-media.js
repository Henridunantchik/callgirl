#!/usr/bin/env node

/**
 * Database Media Cleanup Script
 * Removes ALL media references from the database
 */

import mongoose from "mongoose";

// Use direct MongoDB Atlas connection
const MONGODB_URI =
  "mongodb+srv://tusiwawasahau:tusiwawasahau.cd@cluster0.kkkt6.mongodb.net/tusiwawasahau?retryWrites=true&w=majority&appName=Cluster0";

/**
 * Database Models
 */
let User, Escort;

/**
 * Initialize database connection
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Import models
    const userModel = await import("./api/models/user.model.js");
    const escortModel = await import("./api/models/escort.model.js");

    User = userModel.default;
    Escort = escortModel.default;

    console.log("✅ Models loaded successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

/**
 * Clean user media references
 */
const cleanUserMedia = async () => {
  console.log("\n🗑️  Cleaning user media references...\n");

  try {
    // Find all users with media
    const usersWithMedia = await User.find({
      $or: [
        { "gallery.0": { $exists: true } },
        { "videos.0": { $exists: true } },
        { avatar: { $exists: true, $ne: null } },
      ],
    });

    console.log(`📊 Found ${usersWithMedia.length} users with media to clean`);

    let cleanedCount = 0;

    for (const user of usersWithMedia) {
      const updates = {};

      // Clear avatar
      if (user.avatar) {
        updates.avatar = null;
        console.log(`  🧹 Clearing avatar for: ${user.name}`);
      }

      // Clear gallery
      if (user.gallery && user.gallery.length > 0) {
        updates.gallery = [];
        console.log(
          `  🧹 Clearing gallery (${user.gallery.length} photos) for: ${user.name}`
        );
      }

      // Clear videos
      if (user.videos && user.videos.length > 0) {
        updates.videos = [];
        console.log(
          `  🧹 Clearing videos (${user.videos.length} videos) for: ${user.name}`
        );
      }

      // Update user
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        cleanedCount++;
      }
    }

    console.log(`\n📊 User cleanup complete: ${cleanedCount} users cleaned`);
  } catch (error) {
    console.error("❌ User cleanup failed:", error);
  }
};

/**
 * Clean escort media references
 */
const cleanEscortMedia = async () => {
  console.log("\n🗑️  Cleaning escort media references...\n");

  try {
    // Find all escorts with media
    const escortsWithMedia = await Escort.find({
      $or: [
        { "gallery.0": { $exists: true } },
        { "videos.0": { $exists: true } },
        { avatar: { $exists: true, $ne: null } },
      ],
    });

    console.log(
      `📊 Found ${escortsWithMedia.length} escorts with media to clean`
    );

    let cleanedCount = 0;

    for (const escort of escortsWithMedia) {
      const updates = {};

      // Clear avatar
      if (escort.avatar) {
        updates.avatar = null;
        console.log(`  🧹 Clearing avatar for: ${escort.name}`);
      }

      // Clear gallery
      if (escort.gallery && escort.gallery.length > 0) {
        updates.gallery = [];
        console.log(
          `  🧹 Clearing gallery (${escort.gallery.length} photos) for: ${escort.name}`
        );
      }

      // Clear videos
      if (escort.videos && escort.videos.length > 0) {
        updates.videos = [];
        console.log(
          `  🧹 Clearing videos (${escort.videos.length} videos) for: ${escort.name}`
        );
      }

      // Update escort
      if (Object.keys(updates).length > 0) {
        await Escort.updateOne({ _id: escort._id }, { $set: updates });
        cleanedCount++;
      }
    }

    console.log(
      `\n📊 Escort cleanup complete: ${cleanedCount} escorts cleaned`
    );
  } catch (error) {
    console.error("❌ Escort cleanup failed:", error);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log("🚀 Starting Database Media Cleanup...\n");

  try {
    // Connect to database
    await connectDB();

    // Clean user media
    await cleanUserMedia();

    // Clean escort media
    await cleanEscortMedia();

    console.log("\n🎉 Database media cleanup finished!");
    console.log("\n📝 Next steps:");
    console.log("  1. Upload new photos/videos through your app");
    console.log("  2. The backup manager will sync them automatically");
    console.log("  3. Your media will be available everywhere!");
  } catch (error) {
    console.error("❌ Database cleanup failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
};

// Run the cleanup
main().catch(console.error);
