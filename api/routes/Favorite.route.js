import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorited,
} from "../controllers/Favorite.controller.js";

const router = express.Router();

// ===== FAVORITE ROUTES =====
router.post("/add", authenticate, addToFavorites);
router.delete("/remove/:escortId", authenticate, removeFromFavorites);
router.get("/user", authenticate, getUserFavorites);
router.get("/check/:escortId", authenticate, isFavorited);

export default router;
