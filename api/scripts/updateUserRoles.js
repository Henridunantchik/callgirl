import mongoose from "mongoose";
import config from "../config/env.js";

// Connect to MongoDB
mongoose.connect(config.MONGODB_CONN);

// Import User model
import User from "../models/user.model.js";

const updateUserRoles = async () => {
  try {
    console.log("🔄 Starting user role migration...");
    
    // Find all users with role "user" and update them to "client"
    const result = await User.updateMany(
      { role: "user" },
      { role: "client" }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users from 'user' to 'client' role`);
    
    // Get count of users by role
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log("📊 Current user role distribution:");
    roleCounts.forEach(role => {
      console.log(`   ${role._id}: ${role.count} users`);
    });
    
    console.log("✅ User role migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the migration
updateUserRoles();
