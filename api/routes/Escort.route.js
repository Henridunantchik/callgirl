import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { onlyEscort } from "../middleware/onlyEscort.js";
import upload from "../config/multer.js";
import {
  getAllEscorts,
  getEscortById,
  searchEscorts,
  createEscortProfile,
  updateEscortProfile,
  getEscortStats,
  getIndividualEscortStats,
} from "../controllers/Escort.controller.js";

const router = express.Router();

// ===== ESCORT ROUTES =====
router.get("/all", getAllEscorts);
router.get("/profile/:id", getEscortById);
router.get("/search", searchEscorts);
router.post(
  "/create",
  authenticate,
  upload.fields([
    { name: "gallery", maxCount: 10 },
    { name: "idDocument", maxCount: 1 },
  ]),
  createEscortProfile
);
router.put("/update", authenticate, onlyEscort, updateEscortProfile);
router.get("/stats", authenticate, onlyEscort, getEscortStats);
router.get(
  "/individual-stats/:escortId",
  authenticate,
  getIndividualEscortStats
);
router.get("/public-stats/:escortId", getEscortStats);

export default router;
