import mongoose from "mongoose";
import config from "./config/env.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect(config.MONGODB_CONN);
console.log("✅ Connected to MongoDB");

// Test the fixed aggregation query
async function testFixedConversations() {
  try {
    console.log("\n🧪 Testing Fixed Conversations Query...");
    
    const userId = "68a1a4a78aa66a7f624528f3";
    
    // Test the exact query from the controller
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { recipient: new mongoose.Types.ObjectId(userId) }],
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
                    { $eq: ["$recipient", new mongoose.Types.ObjectId(userId)] },
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
    
    console.log(`📞 Fixed query conversations found: ${conversations.length}`);
    conversations.forEach((conv, i) => {
      console.log(`  ${i + 1}. ${conv.user.name} - "${conv.lastMessage.content}" (${conv.unreadCount} unread)`);
    });
    
    console.log("\n✅ Fixed conversations test completed!");
    
  } catch (error) {
    console.error("❌ Fixed conversations test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testFixedConversations();
