import mongoose from "mongoose";
import User from "../models/user.model.js";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/callgirls", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateEscortStatus() {
  try {
    console.log("🔧 Updating escort status...\n");

    // Get all escorts
    const escorts = await User.find({ role: "escort" });

    console.log(`📊 Found ${escorts.length} escorts\n`);

    // Update escorts to ensure proper status
    for (const escort of escorts) {
      console.log(`Processing: ${escort.name}`);

      // Check current status
      const currentTier = escort.subscriptionTier;
      const currentFeatured = escort.isFeatured;
      const currentStatus = escort.subscriptionStatus;

      console.log(
        `  Current: Tier=${currentTier}, Featured=${currentFeatured}, Status=${currentStatus}`
      );

      // For testing purposes, let's make some escorts featured
      // In a real scenario, you would set this based on business logic
      let updates = {};

      // Example: Make the first escort featured for testing
      if (escort.name === "Lola Lala") {
        updates.isFeatured = true;
        console.log(`  → Making ${escort.name} featured`);
      }

      // Example: Make some escorts premium for testing
      if (escort.name === "Emma Wilson") {
        updates.subscriptionTier = "premium";
        console.log(`  → Making ${escort.name} premium`);
      }

      if (escort.name === "Maria Rodriguez") {
        updates.subscriptionTier = "elite";
        console.log(`  → Making ${escort.name} elite`);
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(escort._id, updates);
        console.log(`  ✅ Updated ${escort.name}`);
      } else {
        console.log(`  ⏭️  No changes needed for ${escort.name}`);
      }

      console.log("");
    }

    console.log("✅ Escort status update completed!");

    // Show final status
    console.log("\n📈 Final Status:");
    const finalEscorts = await User.find({ role: "escort" }).select(
      "name subscriptionTier subscriptionStatus isFeatured"
    );

    finalEscorts.forEach((escort) => {
      const hasPremiumAccess =
        escort.subscriptionTier === "premium" ||
        escort.subscriptionTier === "elite" ||
        escort.isFeatured === true;

      console.log(
        `  ${escort.name}: ${escort.subscriptionTier}${
          escort.isFeatured ? " (Featured)" : ""
        } - Premium Access: ${hasPremiumAccess ? "✅" : "❌"}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

updateEscortStatus();
