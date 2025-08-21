import mongoose from "mongoose";
import User from "./api/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const fixImageUrls = async () => {
  try {
    console.log("🔧 Starting image URL fix...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls");
    console.log("✅ Connected to database");

    // Production backend URL
    const productionUrl = "https://callgirls-api.onrender.com";
    const localhostUrl = "http://localhost:5000";
    
    console.log(`🔄 Replacing ${localhostUrl} with ${productionUrl}`);

    // Find all users with gallery or avatar
    const users = await User.find({
      $or: [
        { "gallery.0": { $exists: true } },
        { avatar: { $exists: true, $ne: null } },
        { "videos.0": { $exists: true } }
      ]
    });
    
    console.log(`📊 Found ${users.length} users with media files`);

    let updatedCount = 0;
    let totalFixed = 0;

    for (const user of users) {
      let needsUpdate = false;
      
      // Fix avatar URL
      if (user.avatar && user.avatar.includes(localhostUrl)) {
        user.avatar = user.avatar.replace(localhostUrl, productionUrl);
        needsUpdate = true;
        console.log(`🖼️  Fixed avatar for ${user.name || user.alias}`);
      }
      
      // Fix gallery URLs
      if (user.gallery && user.gallery.length > 0) {
        for (let i = 0; i < user.gallery.length; i++) {
          if (user.gallery[i].url && user.gallery[i].url.includes(localhostUrl)) {
            user.gallery[i].url = user.gallery[i].url.replace(localhostUrl, productionUrl);
            needsUpdate = true;
            totalFixed++;
          }
        }
      }
      
      // Fix video URLs
      if (user.videos && user.videos.length > 0) {
        for (let i = 0; i < user.videos.length; i++) {
          if (user.videos[i].url && user.videos[i].url.includes(localhostUrl)) {
            user.videos[i].url = user.videos[i].url.replace(localhostUrl, productionUrl);
            needsUpdate = true;
            totalFixed++;
          }
        }
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`✅ Updated user: ${user.name || user.alias} (${user._id})`);
      }
    }

    console.log(`\n🎉 Image URL fix complete!`);
    console.log(`📈 Updated ${updatedCount} users`);
    console.log(`🖼️  Fixed ${totalFixed} media files`);
    console.log(`🔗 All localhost URLs replaced with production URLs`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing image URLs:", error);
    process.exit(1);
  }
};

fixImageUrls();
