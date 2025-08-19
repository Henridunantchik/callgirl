import mongoose from "mongoose";
import dotenv from "dotenv";
import UpgradeRequest from "./models/upgradeRequest.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_CONN);

async function checkJay() {
  try {
    console.log("🔍 Checking Jay Roland's updated request...");

    const request = await UpgradeRequest.findOne({
      escortEmail: "wildculture.project2024@gmail.com",
      requestedPlan: "premium",
    });

    if (!request) {
      console.log("❌ No premium request found");
      return;
    }

    console.log("📋 Current request details:");
    console.log("ID:", request._id);
    console.log("Plan:", request.requestedPlan);
    console.log("Period:", request.subscriptionPeriod);
    console.log("Amount:", request.paymentAmount);
    console.log("Status:", request.status);
    console.log("Updated At:", request.updatedAt);

    // Check if it's actually annual now
    if (
      request.subscriptionPeriod === "annual" &&
      request.paymentAmount === 60
    ) {
      console.log("✅ Database is correctly updated to annual $60");
    } else {
      console.log(
        "❌ Database still shows:",
        request.subscriptionPeriod,
        request.paymentAmount
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkJay();
