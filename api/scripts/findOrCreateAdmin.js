import mongoose from "mongoose";
import config from "../config/env.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

// Connect to MongoDB
mongoose.connect(config.MONGODB_CONN);

const findOrCreateAdmin = async () => {
  try {
    console.log("🔍 Looking for admin user...");

    // First, try to find existing admin user
    const existingAdmin = await User.findOne({
      email: "congogenocidememorial@gmail.com",
    });

    if (existingAdmin) {
      console.log("✅ Found existing admin user:");
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Is Active: ${existingAdmin.isActive}`);

      // Check if user is already admin
      if (existingAdmin.role === "admin") {
        console.log("✅ User is already an admin!");
        console.log(`📋 Use this ID in your modal: "${existingAdmin._id}"`);
      } else {
        console.log("⚠️  User exists but is not admin. Updating role...");
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✅ User role updated to admin!");
        console.log(`📋 Use this ID in your modal: "${existingAdmin._id}"`);
      }
    } else {
      console.log("❌ Admin user not found. Creating new admin user...");

      // Create new admin user
      const hashedPassword = await bcryptjs.hash("Admin123!", 12);

      const newAdmin = new User({
        name: "Admin",
        email: "congogenocidememorial@gmail.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        isVerified: true,
        isAgeVerified: true,
        subscriptionTier: "premium",
      });

      await newAdmin.save();

      console.log("✅ New admin user created:");
      console.log(`   ID: ${newAdmin._id}`);
      console.log(`   Name: ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   Password: Admin123! (change this after first login)`);
      console.log(`📋 Use this ID in your modal: "${newAdmin._id}"`);
    }

    // Also show all admin users in the system
    console.log("\n📊 All admin users in the system:");
    const allAdmins = await User.find({ role: "admin" });
    allAdmins.forEach((admin, index) => {
      console.log(
        `   ${index + 1}. ${admin.name} (${admin.email}) - ID: ${admin._id}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the script
findOrCreateAdmin();
