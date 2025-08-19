import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  createReview,
  getEscortReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  reportReview,
} from "../controllers/Review.controller.js";

const router = express.Router();

// ===== REVIEW ROUTES =====
router.post("/create", authenticate, createReview);
router.get("/escort/:escortId", getEscortReviews);
router.get("/user", authenticate, getUserReviews);
router.put("/:reviewId", authenticate, updateReview);
router.delete("/:reviewId", authenticate, deleteReview);
router.post("/report/:id", authenticate, reportReview);

export default router;
