import express from "express";
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorited,
} from "../controllers/Favorite.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const FavoriteRoute = express.Router();

// Authenticated routes
FavoriteRoute.post("/add", authenticate, addToFavorites);
FavoriteRoute.delete("/remove/:escortId", authenticate, removeFromFavorites);
FavoriteRoute.get("/user", authenticate, getUserFavorites);
FavoriteRoute.get("/check/:escortId", authenticate, isFavorited);

export default FavoriteRoute;
