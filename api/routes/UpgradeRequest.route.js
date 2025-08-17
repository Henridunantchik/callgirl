import { Router } from "express";
import {
  createUpgradeRequest,
  getEscortUpgradeRequests,
  getAllUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  getUpgradeStats,
} from "../controllers/UpgradeRequest.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// Routes pour les escorts
router.post("/create", authenticate, createUpgradeRequest);
router.get("/my-requests", authenticate, getEscortUpgradeRequests);

// Routes pour les admins
router.get("/all", authenticate, getAllUpgradeRequests);
router.put("/approve/:requestId", authenticate, approveUpgradeRequest);
router.put("/reject/:requestId", authenticate, rejectUpgradeRequest);
router.get("/stats", authenticate, getUpgradeStats);

export default router;
