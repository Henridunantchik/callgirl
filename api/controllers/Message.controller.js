import mongoose from "mongoose";
import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import railwayStorage from "../services/railwayStorage.js";
import sharp from "sharp";

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { escortId, content, type = "text", mediaUrl } = req.body;
  const userId = req.user._id;

  if (!escortId || (!content && !mediaUrl)) {
    throw new ApiError(400, "Escort ID and content or media are required");
  }

  const messageData = {
    sender: userId,
    recipient: escortId,
    type,
  };

  // Add content if provided
  if (content) {
    messageData.content = content;
  }

  // Add mediaUrl if provided (for images/files)
  if (mediaUrl) {
    messageData.mediaUrl = mediaUrl;
  }

  const message = await Message.create(messageData);

  const populatedMessage = await Message.findById(message._id)
    .populate(
      "sender",
      "name alias avatar subscriptionTier isVerified isOnline lastActive"
    )
    .populate(
      "recipient",
      "name alias avatar subscriptionTier isVerified isOnline lastActive"
    );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedMessage, "Message sent successfully"));
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
    .populate(
      "sender",
      "name alias avatar subscriptionTier isVerified isOnline lastActive"
    )
    .populate(
      "recipient",
      "name alias avatar subscriptionTier isVerified isOnline lastActive"
    )
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
    new ApiResponse(
      200,
      {
        messages: messages.reverse(),
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Conversation retrieved successfully"
    )
  );
});

// Get user's conversations
const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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
          subscriptionTier: 1,
          isVerified: 1,
          isOnline: 1,
          lastActive: 1,
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversations,
        "Conversations retrieved successfully"
      )
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
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMessage, "Message marked as read"));
});

// Mark all messages in a conversation as read
const markConversationAsRead = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const userId = req.user._id;

  console.log("📨 Marking conversation as read:", { userId, escortId });

  // Find all unread messages from this escort to the current user
  const unreadMessages = await Message.find({
    sender: escortId,
    recipient: userId,
    isRead: false,
  });

  console.log("📨 Found unread messages:", unreadMessages.length);

  if (unreadMessages.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { count: 0 }, "No unread messages to mark"));
  }

  // Mark all messages as read
  const result = await Message.updateMany(
    {
      sender: escortId,
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  console.log("📨 Marked messages as read:", result.modifiedCount);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: result.modifiedCount },
        "Conversation marked as read"
      )
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

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

// Upload image for message
const uploadMessageImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  try {
    let fileToUpload = req.file;

    // Optimize images before upload (convert to webp, limit width)
    if (req.file.mimetype && req.file.mimetype.startsWith("image/")) {
      try {
        const optimizedBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize({ width: 1280, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        fileToUpload = {
          ...req.file,
          buffer: optimizedBuffer,
          size: optimizedBuffer.length,
          mimetype: "image/webp",
          originalname: req.file.originalname.replace(/\.[^.]+$/, ".webp"),
        };
      } catch (optError) {
        console.warn(
          "Image optimization failed, uploading original:",
          optError?.message
        );
      }
    }

    // Upload to Railway storage
    const result = await railwayStorage.uploadFile(
      fileToUpload,
      "message-images"
    );

    if (!result.success) {
      throw new Error(`Failed to upload file: ${result.error}`);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { url: result.url }, "Image uploaded successfully")
      );
  } catch (error) {
    console.error("Railway storage upload error:", error);
    throw new ApiError(500, "Failed to upload image");
  }
});

export {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  uploadMessageImage,
};
