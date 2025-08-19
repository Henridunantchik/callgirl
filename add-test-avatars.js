import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./api/models/user.model.js";

// Load environment variables
dotenv.config();

const addTestAvatars = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls"
    );
    console.log("✅ Connected to MongoDB");

    // Find escorts without avatars
    const escortsWithoutAvatars = await User.find({
      role: "escort",
      $or: [{ avatar: { $exists: false } }, { avatar: null }, { avatar: "" }],
    });

    console.log(
      `📊 Found ${escortsWithoutAvatars.length} escorts without avatars`
    );

    // Add test avatars using placeholder services
    const testAvatars = [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    ];

    for (let i = 0; i < escortsWithoutAvatars.length; i++) {
      const escort = escortsWithoutAvatars[i];
      const avatarIndex = i % testAvatars.length;

      escort.avatar = testAvatars[avatarIndex];
      await escort.save();

      console.log(
        `✅ Added avatar to ${escort.name}: ${testAvatars[avatarIndex]}`
      );
    }

    console.log("\n🎉 Test avatars added successfully!");
    console.log("💡 Refresh the upgrade requests page to see the avatars");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

addTestAvatars();
