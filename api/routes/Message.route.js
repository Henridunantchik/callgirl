import express from "express";
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  deleteMessage,
} from "../controllers/Message.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import upload from "../config/multer.js";

const MessageRoute = express.Router();

// Authenticated routes
MessageRoute.post("/send", authenticate, sendMessage);
MessageRoute.get("/conversation/:escortId", authenticate, getConversation);
MessageRoute.get("/conversations", authenticate, getUserConversations);
MessageRoute.put("/read/:messageId", authenticate, markAsRead);
MessageRoute.delete("/:messageId", authenticate, deleteMessage);

export default MessageRoute;
