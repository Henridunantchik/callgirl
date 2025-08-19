import mongoose from "mongoose";
import dotenv from "dotenv";
import UpgradeRequest from "./models/upgradeRequest.model.js";

dotenv.config();

console.log("🔍 Environment check:");
console.log("MONGODB_CONN:", process.env.MONGODB_CONN ? "Present" : "Missing");
console.log("NODE_ENV:", process.env.NODE_ENV);

if (!process.env.MONGODB_CONN) {
  console.error("❌ MONGODB_CONN is missing from environment variables");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_CONN);

async function fixJay() {
  try {
    console.log("🔍 Finding Jay Roland premium request...");

    const request = await UpgradeRequest.findOne({
      escortEmail: "wildculture.project2024@gmail.com",
      requestedPlan: "premium",
    });

    if (!request) {
      console.log("❌ No premium request found");
      return;
    }

    console.log(
      "📋 Current:",
      request.subscriptionPeriod,
      request.paymentAmount
    );

    if (request.subscriptionPeriod === "monthly") {
      await UpgradeRequest.findByIdAndUpdate(request._id, {
        subscriptionPeriod: "annual",
        paymentAmount: 60,
      });
      console.log("✅ Updated to annual $60");
    } else {
      console.log("✅ Already annual");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

fixJay();
