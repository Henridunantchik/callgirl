import express from "express";
import { getGlobalStats } from "../controllers/Stats.controller.js";

const router = express.Router();

// ===== STATS ROUTES =====
router.get("/global", getGlobalStats);

export default router;
