import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/callgirls";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Update Lola Lala to Premium
const updateLolaToPremium = async () => {
  console.log("\n👑 Updating Lola Lala to Premium...\n");

  try {
    // Find Lola Lala by name (case insensitive)
    const lola = await User.findOne({
      name: { $regex: /lola/i }
    });

    if (!lola) {
      console.log("❌ Lola Lala not found in database");
      return;
    }

    console.log("📋 Before update:");
    console.log(`   Name: ${lola.name}`);
    console.log(`   Current tier: ${lola.subscriptionTier || 'basic'}`);
    console.log(`   Is Verified: ${lola.isVerified || false}`);

    // Update to Premium
    lola.subscriptionTier = "premium";
    lola.isVerified = true;

    await lola.save();

    console.log("\n✅ After update:");
    console.log(`   Name: ${lola.name}`);
    console.log(`   New tier: ${lola.subscriptionTier}`);
    console.log(`   Is Verified: ${lola.isVerified}`);

    console.log("\n🎉 Lola Lala has been successfully updated to Premium!");
    console.log("   She will now see the Premium interface instead of upgrade options.");

  } catch (error) {
    console.error("❌ Error updating Lola:", error);
  }
};

// Run the update
const runUpdate = async () => {
  await connectDB();
  await updateLolaToPremium();
  
  console.log("\n🏁 Update completed. Disconnecting from database...");
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
  process.exit(0);
};

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Run the update
runUpdate();
