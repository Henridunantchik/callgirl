import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import {
  Register,
  Login,
  GoogleLogin,
  Logout,
  getCurrentUser,
  RefreshToken,
} from "../controllers/Auth.controller.js";

const router = express.Router();

// ===== AUTH ROUTES =====
router.post("/register", authRateLimiter, Register);
router.post("/login", authRateLimiter, Login);
router.post("/google-login", authRateLimiter, GoogleLogin);
// Backward/compat alias expected by some clients
router.post("/google", authRateLimiter, GoogleLogin);
router.post("/logout", Logout);
router.post("/refresh-token", authRateLimiter, RefreshToken);
router.get("/me", authenticate, getCurrentUser);

export default router;
