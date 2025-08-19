import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls_db"
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const updateEscortDefaults = async () => {
  try {
    console.log("🔧 Updating escort defaults...");

    const result = await User.updateMany(
      { role: "escort" },
      {
        $set: {
          isAgeVerified: true,
          isAvailable: true,
          "verification.isVerified": true,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} escorts`);
    console.log(`📊 Total escorts found: ${result.matchedCount}`);
  } catch (error) {
    console.error("❌ Error updating escorts:", error);
  }
};

const main = async () => {
  await connectDB();
  await updateEscortDefaults();
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
  process.exit(0);
};

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
