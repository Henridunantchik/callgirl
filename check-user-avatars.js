import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./api/models/user.model.js";
import UpgradeRequest from "./api/models/upgradeRequest.model.js";

// Load environment variables
dotenv.config();

const checkUserAvatars = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls");
    console.log("✅ Connected to MongoDB");

    // Get all users with role "escort"
    const escorts = await User.find({ role: "escort" }).select("name email avatar");
    console.log(`📊 Found ${escorts.length} escorts in database`);

    console.log("\n👥 Escort avatars:");
    escorts.forEach((escort, index) => {
      console.log(`${index + 1}. ${escort.name} (${escort.email})`);
      console.log(`   Avatar: ${escort.avatar ? escort.avatar : 'No avatar'}`);
    });

    // Check upgrade requests and their escort data
    console.log("\n📋 Upgrade requests with escort data:");
    const upgradeRequests = await UpgradeRequest.find()
      .populate("escort", "name email avatar")
      .limit(5);

    upgradeRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.escortName}`);
      console.log(`   Escort ID: ${request.escort?._id}`);
      console.log(`   Escort Name: ${request.escort?.name}`);
      console.log(`   Escort Avatar: ${request.escort?.avatar ? request.escort.avatar : 'No avatar'}`);
      console.log(`   Status: ${request.status}`);
      console.log("---");
    });

    // Check if there are any users with avatars
    const usersWithAvatars = await User.find({ 
      role: "escort", 
      avatar: { $exists: true, $ne: null, $ne: "" } 
    }).select("name email avatar");

    console.log(`\n🖼️ Users with avatars: ${usersWithAvatars.length}`);
    usersWithAvatars.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.avatar}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

checkUserAvatars();
