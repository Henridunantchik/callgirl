import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_CONN);

async function checkJayRolandStatus() {
  try {
    console.log("🔍 Checking Jay Roland's user status...");

    const user = await User.findOne({
      email: "wildculture.project2024@gmail.com",
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("📋 User details:");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Subscription Tier:", user.subscriptionTier);
    console.log("Subscription Status:", user.subscriptionStatus);
    console.log("Is Featured:", user.isFeatured);
    console.log("Is Verified:", user.isVerified);
    console.log("Profile Completion:", user.profileCompletion);

    // Check if he should be premium
    if (user.subscriptionTier !== "premium") {
      console.log(
        "❌ User is not premium, current tier:",
        user.subscriptionTier
      );
      console.log("🔧 Should update to premium");
    } else {
      console.log("✅ User is already premium");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkJayRolandStatus();
