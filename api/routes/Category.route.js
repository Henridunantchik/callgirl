import express from "express";
import { getAllCategory } from "../controllers/Category.controller.js";

const router = express.Router();

// ===== CATEGORY ROUTES =====
router.get("/all-category", getAllCategory);

export default router;
