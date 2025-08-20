import mongoose from "mongoose";
import dotenv from "dotenv";
import UpgradeRequest from "./models/upgradeRequest.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_CONN);

async function checkLatestRequest() {
  try {
    console.log("🔍 Checking the latest upgrade request...");

    // Find the most recent request for Jay Roland
    const request = await UpgradeRequest.findOne({
      escortEmail: "wildculture.project2024@gmail.com",
    }).sort({ createdAt: -1 });

    if (!request) {
      console.log("❌ No request found for Jay Roland");
      return;
    }

    console.log("📋 Latest request details:");
    console.log("ID:", request._id);
    console.log("Escort Name:", request.escortName);
    console.log("Email:", request.escortEmail);
    console.log("Requested Plan:", request.requestedPlan);
    console.log("Subscription Period:", request.subscriptionPeriod);
    console.log("Payment Amount:", request.paymentAmount);
    console.log("Status:", request.status);
    console.log("Created At:", request.createdAt);
    console.log("Updated At:", request.updatedAt);

    // Check if this matches what we expect
    if (
      request.requestedPlan === "premium" &&
      request.subscriptionPeriod === "annual"
    ) {
      console.log("✅ Database shows annual premium correctly");
    } else {
      console.log(
        "❌ Database shows:",
        request.subscriptionPeriod,
        "instead of annual"
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkLatestRequest();
