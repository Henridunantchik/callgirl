import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { escortId, content, type = "text" } = req.body;
  const userId = req.user._id;

  if (!escortId || !content) {
    throw new ApiError(400, "Escort ID and content are required");
  }

  const message = await Message.create({
    sender: userId,
    recipient: escortId,
    content,
    type,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name alias avatar")
    .populate("recipient", "name alias avatar");

  return res.status(201).json(
    new ApiResponse(201, populatedMessage, "Message sent successfully")
  );
});

// Get conversation between users
const getConversation = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 50 } = req.query;

  const skip = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: escortId },
      { sender: escortId, recipient: userId },
    ],
  })
    .populate("sender", "name alias avatar")
    .populate("recipient", "name alias avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments({
    $or: [
      { sender: userId, recipient: escortId },
      { sender: escortId, recipient: userId },
    ],
  });

  return res.status(200).json(
    new ApiResponse(200, {
      messages: messages.reverse(),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Conversation retrieved successfully")
  );
});

// Get user's conversations
const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", userId] },
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
                  { $eq: ["$recipient", userId] },
                  { $eq: ["$read", false] },
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

  return res.status(200).json(
    new ApiResponse(200, conversations, "Conversations retrieved successfully")
  );
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    { read: true },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedMessage, "Message marked as read")
  );
});

// Delete message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  await Message.findByIdAndDelete(messageId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Message deleted successfully")
  );
});

export {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  deleteMessage,
}; 