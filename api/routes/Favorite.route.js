import express from "express";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoritesByClient,
  getFavoriteCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  shareCollection,
} from "../controllers/Favorite.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const FavoriteRoute = express.Router();

// Authenticated routes
FavoriteRoute.post("/add", authenticate, addToFavorites);
FavoriteRoute.delete("/remove/:escortId", authenticate, removeFromFavorites);
FavoriteRoute.get("/client/:clientId", authenticate, getFavoritesByClient);
FavoriteRoute.get(
  "/collections/:clientId",
  authenticate,
  getFavoriteCollections
);
FavoriteRoute.post("/collection", authenticate, createCollection);
FavoriteRoute.put("/collection/:id", authenticate, updateCollection);
FavoriteRoute.delete("/collection/:id", authenticate, deleteCollection);

// Public routes (for shared collections)
FavoriteRoute.get("/shared/:token", shareCollection);

export default FavoriteRoute;
