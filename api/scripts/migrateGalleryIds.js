import mongoose from "mongoose";
import User from "../models/user.model.js";

const migrateGalleryIds = async () => {
  try {
    console.log("Starting gallery migration...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/callgirls");
    console.log("Connected to database");

    // Find all users with gallery
    const users = await User.find({ "gallery.0": { $exists: true } });
    console.log(`Found ${users.length} users with gallery`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      
      // Check if any gallery item doesn't have _id
      for (let i = 0; i < user.gallery.length; i++) {
        if (!user.gallery[i]._id) {
          // Add _id to this gallery item
          user.gallery[i]._id = new mongoose.Types.ObjectId();
          needsUpdate = true;
        }
      }

      // Check if any video doesn't have _id
      if (user.videos && user.videos.length > 0) {
        for (let i = 0; i < user.videos.length; i++) {
          if (!user.videos[i]._id) {
            // Add _id to this video
            user.videos[i]._id = new mongoose.Types.ObjectId();
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`Updated user: ${user.name} (${user._id})`);
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrateGalleryIds(); 