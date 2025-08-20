import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Subscription from "./models/subscription.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_CONN);

async function checkLolaSubscription() {
  try {
    console.log("🔍 Checking Lola Lala's subscription status...");

    // Find Lola Lala
    const user = await User.findOne({
      name: "Lola Lala",
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("📋 User details:");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Subscription Tier:", user.subscriptionTier);
    console.log("Subscription Status:", user.subscriptionStatus);
    console.log("Subscription Details:", user.subscriptionDetails);

    // Check if there's a separate Subscription document
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    });

    if (subscription) {
      console.log("📋 Subscription document found:");
      console.log("Tier:", subscription.tier);
      console.log("Status:", subscription.status);
      console.log("Start Date:", subscription.startDate);
      console.log("End Date:", subscription.endDate);
      console.log("Days Remaining:", subscription.daysRemaining);
    } else {
      console.log("❌ No separate Subscription document found");
      console.log("🔧 User only has subscriptionTier in User model");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkLolaSubscription();
