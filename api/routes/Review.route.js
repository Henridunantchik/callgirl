import express from "express";
import {
  createReview,
  getEscortReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  reportReview,
} from "../controllers/Review.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const ReviewRoute = express.Router();

// Public routes
ReviewRoute.get("/escort/:escortId", getEscortReviews);

// Authenticated routes
ReviewRoute.post("/create", authenticate, createReview);
ReviewRoute.get("/user", authenticate, getUserReviews);
ReviewRoute.put("/:id", authenticate, updateReview);
ReviewRoute.delete("/:id", authenticate, deleteReview);
ReviewRoute.post("/report/:id", authenticate, reportReview);

export default ReviewRoute;
