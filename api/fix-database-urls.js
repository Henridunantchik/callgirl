import mongoose from "mongoose";
import config from "./config/env.js";
import User from "./models/user.model.js";

console.log("🔧 Fixing Database URLs...\n");

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

// Fix URLs in user data
function fixUserUrls(user) {
  const fixed = { ...user.toObject() };

  // Fix avatar URL
  if (fixed.avatar) {
    if (fixed.avatar.includes("localhost:5000")) {
      fixed.avatar = fixed.avatar.replace(
        "http://localhost:5000",
        "https://api.epicescorts.live"
      );
      console.log(`   🔗 Fixed avatar: ${fixed.avatar}`);
    }
  }

  // Fix gallery URLs
  if (fixed.gallery && Array.isArray(fixed.gallery)) {
    fixed.gallery = fixed.gallery.map((item) => {
      if (typeof item === "string") {
        if (item.includes("localhost:5000")) {
          const fixedUrl = item.replace(
            "http://localhost:5000",
            "https://api.epicescorts.live"
          );
          console.log(`   🔗 Fixed gallery item: ${fixedUrl}`);
          return fixedUrl;
        }
        return item;
      }
      if (typeof item === "object" && item.url) {
        if (item.url.includes("localhost:5000")) {
          const fixedUrl = item.url.replace(
            "http://localhost:5000",
            "https://api.epicescorts.live"
          );
          console.log(`   🔗 Fixed gallery item URL: ${fixedUrl}`);
          return { ...item, url: fixedUrl };
        }
        return item;
      }
      return item;
    });
  }

  // Fix video URLs
  if (fixed.videos && Array.isArray(fixed.videos)) {
    fixed.videos = fixed.videos.map((item) => {
      if (typeof item === "string") {
        if (item.includes("localhost:5000")) {
          const fixedUrl = item.replace(
            "http://localhost:5000",
            "https://api.epicescorts.live"
          );
          console.log(`   🔗 Fixed video: ${fixedUrl}`);
          return fixedUrl;
        }
        return item;
      }
      if (typeof item === "object" && item.url) {
        if (item.url.includes("localhost:5000")) {
          const fixedUrl = item.url.replace(
            "http://localhost:5000",
            "https://api.epicescorts.live"
          );
          console.log(`   🔗 Fixed video URL: ${fixedUrl}`);
          return { ...item, url: fixedUrl };
        }
        return item;
      }
      return item;
    });
  }

  return fixed;
}

// Main function
async function fixDatabaseUrls() {
  try {
    await connectDB();

    console.log("🔍 Finding users with localhost URLs...\n");

    // Find users with localhost URLs
    const users = await User.find({
      $or: [
        { avatar: { $regex: "localhost:5000" } },
        { "gallery.url": { $regex: "localhost:5000" } },
        { "videos.url": { $regex: "localhost:5000" } },
      ],
    });

    console.log(`📊 Found ${users.length} users with localhost URLs\n`);

    if (users.length === 0) {
      console.log("✅ No users with localhost URLs found");
      return;
    }

    let fixedCount = 0;

    for (const user of users) {
      console.log(
        `👤 Processing user: ${user.name || user.email} (${user._id})`
      );

      const fixedData = fixUserUrls(user);

      // Update user in database
      await User.findByIdAndUpdate(user._id, fixedData);
      fixedCount++;

      console.log(`   ✅ Updated user: ${user.name || user.email}\n`);
    }

    console.log(`🎉 Successfully fixed ${fixedCount} users`);
  } catch (error) {
    console.error("❌ Error fixing database URLs:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the script
fixDatabaseUrls();
