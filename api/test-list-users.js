import mongoose from "mongoose";
import User from "./models/user.model.js";
import config from "./config/env.js";

async function listUsers() {
  console.log("🧪 Listing Users...\n");

  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_CONN);
    console.log("✅ Connected to database");

    // Get all users
    const users = await User.find({})
      .select("name email role isOnline lastActive")
      .limit(10);

    console.log(`📋 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - Role: ${
          user.role
        } - Online: ${user.isOnline}`
      );
    });

    // Get escorts specifically
    const escorts = await User.find({ role: "escort" })
      .select("name email isOnline lastActive")
      .limit(5);

    console.log(`\n📋 Found ${escorts.length} escorts:`);
    escorts.forEach((escort, index) => {
      console.log(
        `${index + 1}. ${escort.name} (${escort.email}) - Online: ${
          escort.isOnline
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
