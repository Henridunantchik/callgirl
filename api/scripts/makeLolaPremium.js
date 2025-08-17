import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Try multiple MongoDB URIs
    const mongoUris = [
      process.env.MONGODB_URI,
      "mongodb+srv://callgirls:callgirls@cluster0.mongodb.net/callgirls",
      "mongodb://159.41.78.197:27017/callgirls",
      "mongodb://159.41.78.164:27017/callgirls",
      "mongodb://159.41.78.188:27017/callgirls",
      "mongodb://localhost:27017/callgirls"
    ];

    let connected = false;
    for (const uri of mongoUris) {
      if (!uri) continue;
      try {
        console.log(`🔗 Trying to connect to: ${uri}`);
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");
        connected = true;
        break;
      } catch (err) {
        console.log(`❌ Failed to connect to: ${uri}`);
      }
    }

    if (!connected) {
      throw new Error("Could not connect to any MongoDB instance");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Make Lola Lala Premium
const makeLolaPremium = async () => {
  console.log("\n👑 Making Lola Lala Premium...\n");

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

    console.log("\n🎉 Lola Lala is now Premium in the database!");
    console.log("   She will see the Premium interface instead of upgrade options.");

  } catch (error) {
    console.error("❌ Error updating Lola:", error);
  }
};

// Run the update
const runUpdate = async () => {
  await connectDB();
  await makeLolaPremium();
  
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
