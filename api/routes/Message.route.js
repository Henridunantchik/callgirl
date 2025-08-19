import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { 
  sendMessage, 
  getConversation, 
  getUserConversations, 
  markAsRead, 
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
router.delete(
  "/delete/:messageId",
  authenticate,
  deleteMessage
);
router.post(
  "/upload-image",
  authenticate,
  uploadMessageImage
);

export default router;
