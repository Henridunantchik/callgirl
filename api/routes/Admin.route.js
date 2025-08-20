import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";
import * as AdminController from "../controllers/Admin.controller.js";

const router = express.Router();

// ===== ADMIN ROUTES =====
router.get("/users", authenticate, onlyAdmin, AdminController.getAllUsers);
router.put(
  "/users/:userId/status",
  authenticate,
  onlyAdmin,
  AdminController.updateUserStatus
);
router.get("/stats", authenticate, onlyAdmin, AdminController.getPlatformStats);
router.get("/analytics", authenticate, onlyAdmin, AdminController.getAnalytics);
router.post(
  "/fix-video-ids",
  authenticate,
  onlyAdmin,
  AdminController.fixVideoIds
);

export default router;
