import mongoose from "mongoose";
import User from "./models/user.model.js";
import config from "./config/env.js";

const migrateCloudinaryToRender = async () => {
  try {
    console.log("🔄 Starting Cloudinary to Render migration...");
    
    // Connect to database
    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ Connected to database");

    // Find all users with Cloudinary URLs
    const users = await User.find({
      $or: [
        { "gallery.url": { $regex: /cloudinary\.com/, $options: "i" } },
        { "videos.url": { $regex: /cloudinary\.com/, $options: "i" } },
        { avatar: { $regex: /cloudinary\.com/, $options: "i" } }
      ]
    });
    
    console.log(`📊 Found ${users.length} users with Cloudinary URLs`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      
      // Update gallery images
      if (user.gallery && user.gallery.length > 0) {
        for (let i = 0; i < user.gallery.length; i++) {
          if (user.gallery[i].url && user.gallery[i].url.includes('cloudinary.com')) {
            // Extract filename from Cloudinary URL
            const cloudinaryUrl = user.gallery[i].url;
            const filename = cloudinaryUrl.split('/').pop().split('?')[0];
            
            // Create new Render URL
            const renderUrl = `${config.NODE_ENV === 'production' 
              ? 'https://callgirls-api.onrender.com' 
              : 'http://localhost:5000'}/uploads/gallery/${filename}`;
            
            user.gallery[i].url = renderUrl;
            needsUpdate = true;
            console.log(`🖼️ Updated gallery image: ${cloudinaryUrl} -> ${renderUrl}`);
          }
        }
      }

      // Update videos
      if (user.videos && user.videos.length > 0) {
        for (let i = 0; i < user.videos.length; i++) {
          if (user.videos[i].url && user.videos[i].url.includes('cloudinary.com')) {
            // Extract filename from Cloudinary URL
            const cloudinaryUrl = user.videos[i].url;
            const filename = cloudinaryUrl.split('/').pop().split('?')[0];
            
            // Create new Render URL
            const renderUrl = `${config.NODE_ENV === 'production' 
              ? 'https://callgirls-api.onrender.com' 
              : 'http://localhost:5000'}/uploads/videos/${filename}`;
            
            user.videos[i].url = renderUrl;
            needsUpdate = true;
            console.log(`🎥 Updated video: ${cloudinaryUrl} -> ${renderUrl}`);
          }
        }
      }

      // Update avatar
      if (user.avatar && user.avatar.includes('cloudinary.com')) {
        const cloudinaryUrl = user.avatar;
        const filename = cloudinaryUrl.split('/').pop().split('?')[0];
        
        // Create new Render URL
        const renderUrl = `${config.NODE_ENV === 'production' 
          ? 'https://callgirls-api.onrender.com' 
          : 'http://localhost:5000'}/uploads/avatars/${filename}`;
        
        user.avatar = renderUrl;
        needsUpdate = true;
        console.log(`👤 Updated avatar: ${cloudinaryUrl} -> ${renderUrl}`);
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`✅ Updated user: ${user.name} (${user._id})`);
      }
    }

    console.log(`🎉 Migration complete! Updated ${updatedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

migrateCloudinaryToRender();
