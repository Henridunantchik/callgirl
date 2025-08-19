import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getUser, updateUser, deleteUser } from "../controllers/User.controller.js";

const router = express.Router();

// ===== USER ROUTES =====
router.get("/profile", authenticate, getUser);
router.put("/profile", authenticate, updateUser);
router.delete("/account", authenticate, deleteUser);

export default router;
