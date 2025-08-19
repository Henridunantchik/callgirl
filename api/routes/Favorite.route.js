import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
} from "../controllers/Favorite.controller.js";

const router = express.Router();

// ===== FAVORITE ROUTES =====
router.post("/add", authenticate, addToFavorites);
router.delete("/remove", authenticate, removeFromFavorites);
router.get("/user", authenticate, getUserFavorites);

export default router;
