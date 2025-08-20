import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Subscription from "./models/subscription.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_CONN);

async function createSubscriptionForLola() {
  try {
    console.log("🔍 Creating subscription document for Lola Lala...");

    // Find Lola Lala
    const user = await User.findOne({
      name: "Lola Lala",
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("📋 User found:", user.name);

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    });

    if (existingSubscription) {
      console.log("✅ Subscription already exists");
      console.log("Days remaining:", existingSubscription.daysRemaining);
      return;
    }

    // Create subscription document
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    const subscription = new Subscription({
      userId: user._id,
      tier: "premium",
      status: "active",
      startDate: startDate,
      endDate: endDate,
      country: "uganda",
      autoRenew: false,
      payment: {
        method: "mtn_uganda",
        amount: 5, // $5/month for premium
        currency: "USD",
        transactionId: "MANUAL_LOLA_" + Date.now(),
        paymentDate: new Date(),
        nextBillingDate: endDate,
      },
      limits: {
        photos: -1, // Unlimited
        videos: -1, // Unlimited
        featuredPlacement: true,
        prioritySearch: true,
        analytics: true,
        directContact: true,
        customProfile: true,
        marketingSupport: true,
      },
      features: {
        verifiedBadge: true,
        premiumBadge: true,
        homepageFeatured: false,
        priorityBooking: true,
        socialMediaIntegration: false,
        professionalTips: false,
      },
    });

    await subscription.save();

    console.log("✅ Subscription created successfully!");
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Days Remaining:", subscription.daysRemaining);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

createSubscriptionForLola();
