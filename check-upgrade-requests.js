import mongoose from "mongoose";
import dotenv from "dotenv";
import UpgradeRequest from "./api/models/upgradeRequest.model.js";

// Load environment variables
dotenv.config();

const checkUpgradeRequests = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls"
    );
    console.log("✅ Connected to MongoDB");

    // Check total count
    const totalCount = await UpgradeRequest.countDocuments();
    console.log(`📊 Total upgrade requests: ${totalCount}`);

    if (totalCount === 0) {
      console.log("⚠️ No upgrade requests found in database!");
      console.log("💡 This explains why stats are showing zeros");
      return;
    }

    // Get stats by status
    const stats = await UpgradeRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$paymentAmount" },
        },
      },
    ]);

    console.log("📊 Stats by status:");
    stats.forEach((stat) => {
      console.log(
        `  ${stat._id}: ${stat.count} requests, $${stat.totalAmount} total`
      );
    });

    // Get a few sample requests
    const sampleRequests = await UpgradeRequest.find()
      .limit(3)
      .populate("escort", "name email");
    console.log("\n📝 Sample requests:");
    sampleRequests.forEach((req, index) => {
      console.log(
        `  ${index + 1}. ${req.escortName} - ${req.currentPlan} → ${
          req.requestedPlan
        } (${req.status}) - $${req.paymentAmount}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

checkUpgradeRequests();
