import express from "express";
import { getGlobalStats } from "../controllers/Stats.controller.js";

const router = express.Router();

// ===== STATS ROUTES =====
// New canonical route
router.get("/global/:countryCode", getGlobalStats);

// Backward/compat aliases used by some frontends
router.get("/country/:countryCode", getGlobalStats);
router.get("/:countryCode", getGlobalStats);

export default router;
