import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";
import { onlyEscort } from "../middleware/onlyEscort.js";

// Import controllers
import * as AuthController from "../controllers/Auth.controller.js";
import * as UserController from "../controllers/User.controller.js";
import * as EscortController from "../controllers/Escort.controller.js";
import * as StatsController from "../controllers/Stats.controller.js";

const router = express.Router();

// ===== AUTH ROUTES =====
router.post("/auth/register", AuthController.Register);
router.post("/auth/login", AuthController.Login);
router.post("/auth/logout", AuthController.Logout);
router.get("/auth/me", authenticate, AuthController.getCurrentUser);

// ===== USER ROUTES =====
router.get("/user/profile", authenticate, UserController.getUser);
router.put("/user/profile", authenticate, UserController.updateUser);
router.delete("/user/account", authenticate, UserController.deleteUser);

// ===== ESCORT ROUTES =====
router.get("/escort/all", EscortController.getAllEscorts);
router.get("/escort/profile/:id", EscortController.getEscortById);
router.get("/escort/search", EscortController.searchEscorts);
router.post(
  "/escort/create",
  authenticate,
  onlyEscort,
  EscortController.createEscortProfile
);
router.put(
  "/escort/update",
  authenticate,
  onlyEscort,
  EscortController.updateEscortProfile
);
router.get(
  "/escort/stats",
  authenticate,
  onlyEscort,
  EscortController.getEscortStats
);
router.get(
  "/escort/individual-stats/:escortId",
  authenticate,
  EscortController.getIndividualEscortStats
);

// ===== STATS ROUTES =====
router.get("/stats/global", StatsController.getGlobalStats);

export default router;
