import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyEscort } from "../middleware/onlyEscort.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";
import {
  createUpgradeRequest,
  getEscortUpgradeRequests,
  getAllUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  getUpgradeStats,
  sendPaymentInstructions,
  confirmPayment,
  submitPaymentProof,
  getSubscriptionStatus,
} from "../controllers/UpgradeRequest.controller.js";

const router = express.Router();

// ===== UPGRADE REQUEST ROUTES =====
router.post("/create", authenticate, onlyEscort, createUpgradeRequest);
router.get("/my-requests", authenticate, onlyEscort, getEscortUpgradeRequests);
router.get("/all", authenticate, onlyAdmin, getAllUpgradeRequests);
router.get("/stats", authenticate, onlyAdmin, getUpgradeStats);
router.put("/approve/:id", authenticate, onlyAdmin, approveUpgradeRequest);
router.put("/reject/:id", authenticate, onlyAdmin, rejectUpgradeRequest);
router.put(
  "/send-payment/:id",
  authenticate,
  onlyAdmin,
  sendPaymentInstructions
);
router.put("/confirm-payment/:id", authenticate, onlyAdmin, confirmPayment);
router.put("/submit-payment/:id", authenticate, onlyEscort, submitPaymentProof);
router.get(
  "/subscription-status",
  authenticate,
  onlyEscort,
  getSubscriptionStatus
);

export default router;
