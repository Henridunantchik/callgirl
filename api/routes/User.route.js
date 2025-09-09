import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import upload from "../config/multer.js";
import {
  getUser,
  updateUser,
  deleteUser,
  updateOnlineStatus,
  getOnlineStatus,
  markOffline,
  getMainAdmin,
} from "../controllers/User.controller.js";

const router = express.Router();

// ===== USER ROUTES =====
router.get("/profile", authenticate, getUser);
// Accept avatar under any plausible field names for compatibility
router.put(
  "/profile",
  authenticate,
  (req, res, next) => {
    // Try common field names seamlessly
    const possible = ["avatar", "file", "image", "photo"];
    // Use multer's any() to accept any single file, controller reads req.file
    return upload.any()(req, res, () => {
      // If multiple files present, pick the first plausible one as req.file
      if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
        const pick =
          req.files.find((f) =>
            possible.includes((f.fieldname || "").toLowerCase())
          ) || req.files[0];
        req.file = pick;
      }
      next();
    });
  },
  updateUser
);
router.delete("/account", authenticate, deleteUser);

// Online status routes
router.put("/online-status", authenticate, updateOnlineStatus);
router.get("/online-status/:userId", getOnlineStatus);
router.put("/offline", authenticate, markOffline);

// Admin routes
router.get("/main-admin", getMainAdmin);

export default router;
