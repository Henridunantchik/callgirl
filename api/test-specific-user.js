import mongoose from "mongoose";
import config from "./config/env.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect(config.MONGODB_CONN);
console.log("✅ Connected to MongoDB");

// Test conversations for specific user
async function testSpecificUser() {
  try {
    console.log("\n🧪 Testing Conversations for Specific User...");

    const userId = "68a1a4a78aa66a7f624528f3";

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return;
    }

    console.log(`👤 User found: ${user.name} (${user._id})`);

    // Check all messages involving this user
    const userMessages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    });

    console.log(
      `📨 Total messages involving this user: ${userMessages.length}`
    );

    if (userMessages.length > 0) {
      console.log("📋 Recent messages:");
      userMessages.slice(-5).forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg.content} (${msg.createdAt})`);
        console.log(`     Sender: ${msg.sender}, Recipient: ${msg.recipient}`);
      });
    }

    // Test the exact aggregation query used in the API
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$recipient", new mongoose.Types.ObjectId(userId)],
                    },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            alias: 1,
            avatar: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
    ]);

    console.log(`\n📞 Conversations found: ${conversations.length}`);
    conversations.forEach((conv, i) => {
      console.log(
        `  ${i + 1}. ${conv.user.name} - "${conv.lastMessage.content}" (${
          conv.unreadCount
        } unread)`
      );
    });

    // Check if there are any messages at all in the database
    const totalMessages = await Message.countDocuments();
    console.log(`\n📊 Total messages in database: ${totalMessages}`);

    // Check all users
    const allUsers = await User.find().select("name _id");
    console.log(`👥 Total users in database: ${allUsers.length}`);
    console.log(
      "Users:",
      allUsers.map((u) => `${u.name} (${u._id})`)
    );

    console.log("\n✅ Specific user test completed!");
  } catch (error) {
    console.error("❌ Specific user test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testSpecificUser();
