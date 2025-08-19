import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";
import {
  createBlog,
  getAllBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  addComment,
  approveComment,
  likeBlog,
  getBlogCategories,
  getBlogStats,
} from "../controllers/Blog.controller.js";

const router = express.Router();

// ===== BLOG ROUTES =====

// Public routes (no auth required)
router.get("/all", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/categories", getBlogCategories);

// Authenticated routes
router.post("/create", authenticate, createBlog);
router.get("/:blogId", authenticate, getBlogById);
router.put("/:blogId", authenticate, updateBlog);
router.delete("/:blogId", authenticate, deleteBlog);
router.post("/:blogId/comment", authenticate, addComment);
router.post("/:blogId/like", authenticate, likeBlog);

// Admin only routes
router.put("/:blogId/comment/:commentId/approve", authenticate, onlyAdmin, approveComment);
router.get("/stats", authenticate, onlyAdmin, getBlogStats);

export default router;
