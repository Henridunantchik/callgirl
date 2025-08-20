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
  uploadGallery,
  uploadVideo,
  deleteGalleryImage,
  deleteVideo,
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

// Media upload routes
router.post(
  "/media/:id",
  authenticate,
  onlyEscort,
  upload.array("gallery", 10),
  uploadGallery
);

router.post(
  "/video/:id",
  authenticate,
  onlyEscort,
  upload.array("video", 5),
  uploadVideo
);

// Delete routes
router.delete(
  "/gallery/:id/:imageId",
  authenticate,
  onlyEscort,
  deleteGalleryImage
);

router.delete(
  "/video/:id/:videoId",
  authenticate,
  onlyEscort,
  deleteVideo
);

export default router;
