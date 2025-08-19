import express from "express";
import { getGlobalStats } from "../controllers/Stats.controller.js";

const router = express.Router();

// ===== STATS ROUTES =====
router.get("/global/:countryCode", getGlobalStats);

export default router;
