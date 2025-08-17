import mongoose from "mongoose";
import config from "./config/env.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect(config.MONGODB_CONN);
console.log("✅ Connected to MongoDB");

// Test message flow
async function testMessageFlow() {
  try {
    console.log("\n🧪 Testing Message Flow...");
    
    // Get some test users
    const users = await User.find().limit(2);
    if (users.length < 2) {
      console.log("❌ Need at least 2 users to test message flow");
      return;
    }
    
    const sender = users[0];
    const recipient = users[1];
    
    console.log(`👤 Sender: ${sender.name} (${sender._id})`);
    console.log(`👤 Recipient: ${recipient.name} (${recipient._id})`);
    
    // Create a test message
    const testMessage = await Message.create({
      sender: sender._id,
      recipient: recipient._id,
      content: "Test message from API",
      type: "text"
    });
    
    console.log(`✅ Message created: ${testMessage._id}`);
    
    // Test conversation retrieval
    const conversation = await Message.find({
      $or: [
        { sender: sender._id, recipient: recipient._id },
        { sender: recipient._id, recipient: sender._id },
      ],
    }).populate("sender", "name alias avatar")
      .populate("recipient", "name alias avatar");
    
    console.log(`✅ Conversation retrieved: ${conversation.length} messages`);
    
    // Test user conversations aggregation
    const userConversations = await Message.aggregate([
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
    
    console.log(`✅ User conversations: ${userConversations.length} conversations`);
    console.log("📋 Conversations:", userConversations.map(c => ({
      user: c.user.name,
      lastMessage: c.lastMessage.content,
      unreadCount: c.unreadCount
    })));
    
    // Clean up test message
    await Message.findByIdAndDelete(testMessage._id);
    console.log("🧹 Test message cleaned up");
    
    console.log("\n✅ Message flow test completed successfully!");
    
  } catch (error) {
    console.error("❌ Message flow test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testMessageFlow();
