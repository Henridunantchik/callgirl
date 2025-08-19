import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { 
  getUser, 
  updateUser, 
  deleteUser,
  updateOnlineStatus,
  getOnlineStatus,
  markOffline
} from "../controllers/User.controller.js";

const router = express.Router();

// ===== USER ROUTES =====
router.get("/profile", authenticate, getUser);
router.put("/profile", authenticate, updateUser);
router.delete("/account", authenticate, deleteUser);

// Online status routes
router.put("/online-status", authenticate, updateOnlineStatus);
router.get("/online-status/:userId", getOnlineStatus);
router.put("/offline", authenticate, markOffline);

export default router;
