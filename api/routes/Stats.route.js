import { Router } from "express";
import { getGlobalStats } from "../controllers/Stats.controller.js";

const router = Router();

// Get global platform statistics
router.get("/global/:countryCode", getGlobalStats);

export default router;
