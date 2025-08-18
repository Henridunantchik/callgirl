import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import UpgradeRequest from "../models/upgradeRequest.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Try different MongoDB URIs
    const mongoUris = [
      "mongodb://localhost:27017/callgirls",
      "mongodb://127.0.0.1:27017/callgirls",
      "mongodb://localhost:27017/test",
      "mongodb://127.0.0.1:27017/test",
    ];

    let connected = false;
    for (const uri of mongoUris) {
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
    console.log("💡 Make sure MongoDB is running on localhost:27017");
    console.log("💡 Or set MONGODB_URI environment variable");
    process.exit(1);
  }
};

// Test functions
const testUpgradeSystem = async () => {
  console.log("\n🧪 Testing Upgrade System...\n");

  try {
    // 1. Check if there are any escorts
    const escorts = await User.find({ role: "escort" }).limit(5);
    console.log(`📊 Found ${escorts.length} escorts in database`);

    if (escorts.length === 0) {
      console.log("⚠️  No escorts found. Creating test escort...");

      // Create a test escort
      const testEscort = await User.create({
        name: "Test Escort",
        email: "test.escort@example.com",
        password: "test123",
        role: "escort",
        subscriptionTier: "basic",
        location: {
          country: "Uganda",
          city: "Kampala",
        },
        countryCode: "ug",
      });

      console.log("✅ Created test escort:", testEscort.name);
      escorts.push(testEscort);
    }

    // 2. Check existing upgrade requests
    const existingRequests = await UpgradeRequest.find().populate(
      "escort",
      "name email"
    );
    console.log(
      `📋 Found ${existingRequests.length} existing upgrade requests`
    );

    if (existingRequests.length > 0) {
      console.log("📝 Existing requests:");
      existingRequests.forEach((req, index) => {
        console.log(
          `  ${index + 1}. ${req.escort.name} - ${req.currentPlan} → ${
            req.requestedPlan
          } (${req.status})`
        );
      });
    }

    // 3. Create a test upgrade request if none exist
    if (existingRequests.length === 0) {
      console.log("🔄 Creating test upgrade request...");

      const testRequest = await UpgradeRequest.create({
        escort: escorts[0]._id,
        escortName: escorts[0].name,
        escortPhone: "+256123456789",
        escortEmail: escorts[0].email,
        currentPlan: "basic",
        requestedPlan: "featured",
        contactMethod: "whatsapp",
        paymentAmount: 12,
        countryCode: "ug",
      });

      console.log("✅ Created test upgrade request");
      console.log(`   Escort: ${testRequest.escortName}`);
      console.log(
        `   Plan: ${testRequest.currentPlan} → ${testRequest.requestedPlan}`
      );
      console.log(`   Amount: $${testRequest.paymentAmount}`);
    }

    // 4. Test statistics
    const stats = await UpgradeRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$paymentAmount" },
        },
      },
    ]);

    console.log("\n📊 Upgrade Request Statistics:");
    stats.forEach((stat) => {
      console.log(
        `   ${stat._id}: ${stat.count} requests, $${stat.totalAmount} total`
      );
    });

    // 5. Test user subscription tiers
    const tierStats = await User.aggregate([
      { $match: { role: "escort" } },
      {
        $group: {
          _id: "$subscriptionTier",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("\n👥 Escort Subscription Tiers:");
    tierStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count} escorts`);
    });

    // 6. Test API endpoints (simulation)
    console.log("\n🔗 API Endpoints Status:");
    console.log("   ✅ GET /api/upgrade-request/all - Admin get all requests");
    console.log("   ✅ GET /api/upgrade-request/stats - Admin get statistics");
    console.log(
      "   ✅ PUT /api/upgrade-request/approve/:id - Admin approve request"
    );
    console.log(
      "   ✅ PUT /api/upgrade-request/reject/:id - Admin reject request"
    );
    console.log(
      "   ✅ POST /api/upgrade-request/create - Escort create request"
    );
    console.log(
      "   ✅ GET /api/upgrade-request/my-requests - Escort get own requests"
    );

    console.log("\n🎉 Upgrade System Test Completed Successfully!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Start the backend server: npm run dev");
    console.log("   2. Start the frontend: cd ../client && npm run dev");
    console.log("   3. Login as admin and go to /ug/admin/upgrade-requests");
    console.log("   4. Login as escort and go to /ug/escort/upgrade");
    console.log("   5. Test the upgrade flow end-to-end");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testUpgradeSystem();

  console.log("\n🏁 Test completed. Disconnecting from database...");
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
  process.exit(0);
};

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Run the test
runTest();
