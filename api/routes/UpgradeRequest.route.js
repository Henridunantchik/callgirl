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
} from "../controllers/UpgradeRequest.controller.js";

const router = express.Router();

// ===== UPGRADE REQUEST ROUTES =====
router.post("/create", authenticate, onlyEscort, createUpgradeRequest);
router.get("/user", authenticate, onlyEscort, getEscortUpgradeRequests);
router.get("/admin/all", authenticate, onlyAdmin, getAllUpgradeRequests);
router.put(
  "/admin/approve/:id",
  authenticate,
  onlyAdmin,
  approveUpgradeRequest
);
router.put("/admin/reject/:id", authenticate, onlyAdmin, rejectUpgradeRequest);

export default router;
