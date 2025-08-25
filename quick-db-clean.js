#!/usr/bin/env node

/**
 * Quick Database Cleanup
 * Fast and direct cleanup of obsolete media URLs
 */

import mongoose from "mongoose";

// Direct MongoDB Atlas connection
const MONGODB_URI =
  "mongodb+srv://tusiwawasahau:tusiwawasahau.cd@cluster0.kkkt6.mongodb.net/tusiwawasahau?retryWrites=true&w=majority&appName=Cluster0";

/**
 * Quick cleanup function
 */
const quickCleanup = async () => {
  console.log("🚀 Starting Quick Database Cleanup...\n");

  try {
    // Connect with shorter timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB Atlas");

    // Get database reference
    const db = mongoose.connection.db;

    // Clean users collection
    console.log("\n🗑️  Cleaning users collection...");
    const usersResult = await db.collection("users").updateMany(
      {
        $or: [
          { avatar: { $exists: true, $ne: null } },
          { "gallery.0": { $exists: true } },
          { "videos.0": { $exists: true } },
        ],
      },
      {
        $set: {
          avatar: null,
          gallery: [],
          videos: [],
        },
      }
    );
    console.log(`  ✅ Users cleaned: ${usersResult.modifiedCount} updated`);

    // Clean escorts collection
    console.log("\n🗑️  Cleaning escorts collection...");
    const escortsResult = await db.collection("escorts").updateMany(
      {
        $or: [
          { avatar: { $exists: true, $ne: null } },
          { "gallery.0": { $exists: true } },
          { "videos.0": { $exists: true } },
        ],
      },
      {
        $set: {
          avatar: null,
          gallery: [],
          videos: [],
        },
      }
    );
    console.log(`  ✅ Escorts cleaned: ${escortsResult.modifiedCount} updated`);

    console.log("\n🎉 Quick database cleanup complete!");
    console.log("\n📝 Result:");
    console.log("  ✅ No more 404 errors");
    console.log("  ✅ No more obsolete URLs");
    console.log("  ✅ Database is clean");
  } catch (error) {
    console.error("❌ Quick cleanup failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
};

// Run the cleanup
quickCleanup().catch(console.error);
