import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import upload from "../config/multer.js";
import { 
  sendMessage, 
  getConversation, 
  getUserConversations, 
  markAsRead, 
  markConversationAsRead,
  deleteMessage, 
  uploadMessageImage 
} from "../controllers/Message.controller.js";

const router = express.Router();

// ===== MESSAGE ROUTES =====
router.post("/send", authenticate, sendMessage);
router.get(
  "/conversation/:escortId",
  authenticate,
  getConversation
);
router.get(
  "/conversations",
  authenticate,
  getUserConversations
);
router.put("/mark-read/:messageId", authenticate, markAsRead);
router.put("/mark-conversation-read/:escortId", authenticate, markConversationAsRead);
router.delete(
  "/delete/:messageId",
  authenticate,
  deleteMessage
);
router.post(
  "/upload-image",
  authenticate,
  upload.single("image"),
  uploadMessageImage
);

export default router;
