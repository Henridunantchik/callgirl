import express from "express";
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  deleteConversation,
  getUnreadCount,
} from "../controllers/Message.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import upload from "../config/multer.js";

const MessageRoute = express.Router();

// Authenticated routes
MessageRoute.post("/send", authenticate, upload.single("media"), sendMessage);
MessageRoute.get("/conversation/:userId", authenticate, getConversation);
MessageRoute.get("/conversations", authenticate, getConversations);
MessageRoute.put("/read/:messageId", authenticate, markAsRead);
MessageRoute.delete("/message/:id", authenticate, deleteMessage);
MessageRoute.delete("/conversation/:userId", authenticate, deleteConversation);
MessageRoute.get("/unread-count", authenticate, getUnreadCount);

export default MessageRoute;
