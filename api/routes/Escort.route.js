import express from "express";
import {
  getAllEscorts,
  getEscortProfile,
  createEscortProfile,
  updateEscortProfile,
  deleteEscortProfile,
  searchEscorts,
  getEscortsByLocation,
  getEscortsByCategory,
  updateEscortStatus,
  uploadGallery,
  deleteGalleryImage,
  reorderGallery,
  uploadVideo,
  deleteVideo,
  verifyEscort,
  getEscortStats,
  getEscortAnalytics,
} from "../controllers/Escort.controller.js";
import upload from "../config/multer.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyEscort } from "../middleware/onlyEscort.js";

const EscortRoute = express.Router();

// Public routes (age verification required)
EscortRoute.get("/all", getAllEscorts);
EscortRoute.get("/profile/:id", getEscortProfile);
EscortRoute.get("/search", searchEscorts);
EscortRoute.get("/location/:city", getEscortsByLocation);
EscortRoute.get("/category/:category", getEscortsByCategory);

// Public routes (for registration)
EscortRoute.post(
  "/create",
  authenticate,
  upload.array("gallery", 20),
  createEscortProfile
);

// Authenticated routes
EscortRoute.put(
  "/update/:id",
  authenticate,
  onlyEscort,
  upload.array("gallery", 20),
  updateEscortProfile
);
EscortRoute.delete(
  "/delete/:id",
  authenticate,
  onlyEscort,
  deleteEscortProfile
);
EscortRoute.put("/status/:id", authenticate, onlyEscort, updateEscortStatus);

// Gallery management
EscortRoute.post(
  "/gallery/:id",
  authenticate,
  onlyEscort,
  upload.array("images", 10),
  uploadGallery
);
EscortRoute.delete(
  "/gallery/:id/:imageId",
  authenticate,
  onlyEscort,
  deleteGalleryImage
);
EscortRoute.put(
  "/gallery/reorder/:id",
  authenticate,
  onlyEscort,
  reorderGallery
);

// Video management
EscortRoute.post(
  "/video/:id",
  authenticate,
  onlyEscort,
  upload.single("video"),
  uploadVideo
);
EscortRoute.delete(
  "/video/:id/:videoId",
  authenticate,
  onlyEscort,
  deleteVideo
);

// Admin routes
EscortRoute.put("/verify/:id", authenticate, verifyEscort);
EscortRoute.get("/stats/:id", authenticate, onlyEscort, getEscortStats);
EscortRoute.get("/analytics/:id", authenticate, onlyEscort, getEscortAnalytics);

export default EscortRoute;
