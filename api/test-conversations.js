import mongoose from "mongoose";
import config from "./config/env.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect(config.MONGODB_CONN);
console.log("✅ Connected to MongoDB");

// Test conversation flow
async function testConversations() {
  try {
    console.log("\n🧪 Testing Conversations...");
    
    // Get some test users
    const users = await User.find().limit(2);
    if (users.length < 2) {
      console.log("❌ Need at least 2 users to test conversations");
      return;
    }
    
    const sender = users[0];
    const recipient = users[1];
    
    console.log(`👤 Sender: ${sender.name} (${sender._id})`);
    console.log(`👤 Recipient: ${recipient.name} (${recipient._id})`);
    
    // Check existing messages
    const existingMessages = await Message.find({
      $or: [
        { sender: sender._id, recipient: recipient._id },
        { sender: recipient._id, recipient: sender._id },
      ],
    });
    
    console.log(`📨 Existing messages between users: ${existingMessages.length}`);
    
    if (existingMessages.length > 0) {
      console.log("📋 Recent messages:");
      existingMessages.slice(-3).forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg.content} (${msg.createdAt})`);
      });
    }
    
    // Test user conversations aggregation for sender
    const senderConversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: sender._id }, { recipient: sender._id }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", sender._id] },
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
                    { $eq: ["$recipient", sender._id] },
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
    
    console.log(`\n📞 Sender conversations: ${senderConversations.length}`);
    senderConversations.forEach((conv, i) => {
      console.log(`  ${i + 1}. ${conv.user.name} - "${conv.lastMessage.content}" (${conv.unreadCount} unread)`);
    });
    
    // Test user conversations aggregation for recipient
    const recipientConversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: recipient._id }, { recipient: recipient._id }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", recipient._id] },
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
                    { $eq: ["$recipient", recipient._id] },
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
    
    console.log(`\n📞 Recipient conversations: ${recipientConversations.length}`);
    recipientConversations.forEach((conv, i) => {
      console.log(`  ${i + 1}. ${conv.user.name} - "${conv.lastMessage.content}" (${conv.unreadCount} unread)`);
    });
    
    console.log("\n✅ Conversation test completed successfully!");
    
  } catch (error) {
    console.error("❌ Conversation test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testConversations();
