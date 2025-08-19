import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls_db");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const fixEscortDefaults = async () => {
  try {
    console.log("🔧 Starting escort defaults fix...");

    // Find all escorts
    const escorts = await User.find({ role: "escort" });
    console.log(`📊 Found ${escorts.length} escorts to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const escort of escorts) {
      let needsUpdate = false;
      const updates = {};

      // Check if isAgeVerified needs to be set to true
      if (!escort.isAgeVerified) {
        updates.isAgeVerified = true;
        needsUpdate = true;
        console.log(`🔧 Setting isAgeVerified to true for: ${escort.name || escort.alias}`);
      }

      // Check if isAvailable needs to be set to true
      if (!escort.isAvailable) {
        updates.isAvailable = true;
        needsUpdate = true;
        console.log(`🔧 Setting isAvailable to true for: ${escort.name || escort.alias}`);
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(escort._id, updates);
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log("\n✅ Escort defaults fix completed!");
    console.log(`📊 Updated: ${updatedCount} escorts`);
    console.log(`📊 Skipped: ${skippedCount} escorts (already correct)`);
    console.log(`📊 Total: ${escorts.length} escorts processed`);

    // Verify the changes
    const verifiedEscorts = await User.find({ 
      role: "escort", 
      isAgeVerified: true, 
      isAvailable: true 
    });
    console.log(`✅ Verified: ${verifiedEscorts.length} escorts now have correct defaults`);

  } catch (error) {
    console.error("❌ Error fixing escort defaults:", error);
  }
};

const main = async () => {
  await connectDB();
  await fixEscortDefaults();
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
  process.exit(0);
};

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
