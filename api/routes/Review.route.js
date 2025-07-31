import express from "express";
import {
  createReview,
  getReviewsByEscort,
  getReviewsByClient,
  updateReview,
  deleteReview,
  getReviewById,
  reportReview,
  approveReview,
  getAllReviews,
} from "../controllers/Review.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";

const ReviewRoute = express.Router();

// Public routes
ReviewRoute.get("/escort/:escortId", getReviewsByEscort);
ReviewRoute.get("/:id", getReviewById);

// Authenticated routes
ReviewRoute.post("/create", authenticate, createReview);
ReviewRoute.put("/update/:id", authenticate, updateReview);
ReviewRoute.delete("/delete/:id", authenticate, deleteReview);
ReviewRoute.post("/report/:id", authenticate, reportReview);

// Admin routes
ReviewRoute.get("/admin/all", authenticate, onlyAdmin, getAllReviews);
ReviewRoute.put("/approve/:id", authenticate, onlyAdmin, approveReview);

export default ReviewRoute;
