import mongoose from "mongoose";
import User from "./models/user.model.js";

const fixVideoIds = async () => {
  try {
    console.log("Starting video ID fix...");

    // Connect to database using the same config as the API
    await mongoose.connect(
      process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls_db"
    );
    console.log("Connected to database");

    // Find all users with videos
    const users = await User.find({ "videos.0": { $exists: true } });
    console.log(`Found ${users.length} users with videos`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      // Check if any video doesn't have _id
      if (user.videos && user.videos.length > 0) {
        for (let i = 0; i < user.videos.length; i++) {
          if (!user.videos[i]._id) {
            // Add _id to this video
            user.videos[i]._id = new mongoose.Types.ObjectId();
            needsUpdate = true;
            console.log(`Adding _id to video ${i} for user: ${user.name}`);
          }
        }
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`Updated user: ${user.name} (${user._id})`);
      }
    }

    console.log(`Fix complete! Updated ${updatedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error("Fix error:", error);
    process.exit(1);
  }
};

fixVideoIds();
