import { Router } from "express";
import {
  createUpgradeRequest,
  getEscortUpgradeRequests,
  getAllUpgradeRequests,
  sendPaymentInstructions,
  submitPaymentProof,
  approveUpgradeRequest,
  confirmPayment,
  rejectUpgradeRequest,
  getUpgradeStats,
  getUserSubscriptionStatus,
} from "../controllers/UpgradeRequest.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// Routes pour les escorts
router.post("/create", authenticate, createUpgradeRequest);
router.get("/my-requests", authenticate, getEscortUpgradeRequests);
router.put("/submit-payment/:requestId", authenticate, submitPaymentProof);
router.get("/subscription-status", authenticate, getUserSubscriptionStatus);

// Routes pour les admins
router.get("/all", authenticate, getAllUpgradeRequests);
router.put("/send-payment/:requestId", authenticate, sendPaymentInstructions);
router.put("/confirm-payment/:requestId", authenticate, confirmPayment);
router.put("/approve/:requestId", authenticate, approveUpgradeRequest);
router.put("/reject/:requestId", authenticate, rejectUpgradeRequest);
router.get("/stats", authenticate, getUpgradeStats);

export default router;
