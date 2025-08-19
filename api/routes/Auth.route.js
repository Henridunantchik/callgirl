import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { Register, Login, GoogleLogin, Logout, getCurrentUser } from "../controllers/Auth.controller.js";

const router = express.Router();

// ===== AUTH ROUTES =====
router.post("/register", Register);
router.post("/login", Login);
router.post("/google-login", GoogleLogin);
router.post("/logout", Logout);
router.get("/me", authenticate, getCurrentUser);

export default router;
