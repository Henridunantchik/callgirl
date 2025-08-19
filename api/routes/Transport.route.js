import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  getTransportHistory,
  getTransportStats,
} from "../controllers/Transport.controller.js";

const router = express.Router();

// ===== TRANSPORT ROUTES =====
router.get("/history", authenticate, getTransportHistory);
router.get("/stats", authenticate, getTransportStats);

export default router;
