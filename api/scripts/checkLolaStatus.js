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

// Check Lola Lala's status
const checkLolaStatus = async () => {
  console.log("\n🔍 Checking Lola Lala's status...\n");

  try {
    // Find Lola Lala by name (case insensitive)
    const lola = await User.findOne({
      name: { $regex: /lola/i }
    });

    if (!lola) {
      console.log("❌ Lola Lala not found in database");
      return;
    }

    console.log("📋 Lola Lala's Profile:");
    console.log(`   Name: ${lola.name}`);
    console.log(`   Email: ${lola.email}`);
    console.log(`   Role: ${lola.role}`);
    console.log(`   Subscription Tier: ${lola.subscriptionTier || 'basic'}`);
    console.log(`   Is Verified: ${lola.isVerified || false}`);
    console.log(`   Country: ${lola.location?.country || 'N/A'}`);
    console.log(`   City: ${lola.location?.city || 'N/A'}`);

    // Check if she should be Premium
    if (lola.subscriptionTier !== "premium") {
      console.log("\n⚠️  Lola Lala is NOT Premium!");
      console.log("   Current tier:", lola.subscriptionTier);
      console.log("   Should be: premium");
      
      // Ask if we should upgrade her
      console.log("\n🔄 Do you want to upgrade Lola Lala to Premium? (y/n)");
      // For now, let's just show the current status
    } else {
      console.log("\n✅ Lola Lala is already Premium!");
    }

    // Show all escorts with their tiers
    console.log("\n📊 All Escorts Subscription Tiers:");
    const allEscorts = await User.find({ role: "escort" }).select("name subscriptionTier isVerified");
    
    allEscorts.forEach((escort, index) => {
      console.log(`   ${index + 1}. ${escort.name}: ${escort.subscriptionTier || 'basic'} ${escort.isVerified ? '(Verified)' : ''}`);
    });

  } catch (error) {
    console.error("❌ Error checking Lola's status:", error);
  }
};

// Run the check
const runCheck = async () => {
  await connectDB();
  await checkLolaStatus();
  
  console.log("\n🏁 Check completed. Disconnecting from database...");
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
  process.exit(0);
};

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Run the check
runCheck();
