import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./api/models/user.model.js";
import UpgradeRequest from "./api/models/upgradeRequest.model.js";

// Load environment variables
dotenv.config();

const createTestUpgradeRequests = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_CONN || "mongodb://localhost:27017/callgirls");
    console.log("✅ Connected to MongoDB");

    // Find or create a test escort
    let testEscort = await User.findOne({ role: "escort" });
    
    if (!testEscort) {
      console.log("🔄 Creating test escort...");
      testEscort = await User.create({
        name: "Test Escort",
        email: "test.escort@example.com",
        password: "test123",
        role: "escort",
        subscriptionTier: "basic",
        countryCode: "ug",
      });
      console.log("✅ Created test escort:", testEscort.name);
    } else {
      console.log("✅ Found existing escort:", testEscort.name);
    }

    // Check existing upgrade requests
    const existingCount = await UpgradeRequest.countDocuments();
    console.log(`📊 Existing upgrade requests: ${existingCount}`);

    if (existingCount > 0) {
      console.log("⚠️ Upgrade requests already exist. Skipping creation.");
      return;
    }

    // Create test upgrade requests
    console.log("🔄 Creating test upgrade requests...");

    const testRequests = [
      {
        escort: testEscort._id,
        escortName: testEscort.name,
        escortPhone: "+256701234567",
        escortEmail: testEscort.email,
        currentPlan: "basic",
        requestedPlan: "featured",
        contactMethod: "whatsapp",
        paymentAmount: 12,
        status: "pending",
        countryCode: "ug",
      },
      {
        escort: testEscort._id,
        escortName: testEscort.name,
        escortPhone: "+256701234567",
        escortEmail: testEscort.email,
        currentPlan: "basic",
        requestedPlan: "premium",
        subscriptionPeriod: "monthly",
        contactMethod: "messenger",
        paymentAmount: 5,
        status: "approved",
        countryCode: "ug",
      },
      {
        escort: testEscort._id,
        escortName: testEscort.name,
        escortPhone: "+256701234567",
        escortEmail: testEscort.email,
        currentPlan: "featured",
        requestedPlan: "premium",
        subscriptionPeriod: "annual",
        contactMethod: "whatsapp",
        paymentAmount: 60,
        status: "rejected",
        countryCode: "ug",
      }
    ];

    const createdRequests = await UpgradeRequest.insertMany(testRequests);
    console.log(`✅ Created ${createdRequests.length} test upgrade requests`);

    // Show the created requests
    createdRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.escortName} - ${req.currentPlan} → ${req.requestedPlan} (${req.status}) - $${req.paymentAmount}`);
    });

    console.log("\n🎉 Test data created successfully!");
    console.log("💡 Now refresh the upgrade requests page to see the stats");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createTestUpgradeRequests();
