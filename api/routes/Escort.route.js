import express from "express";
import User from "../models/user.model.js";
import {
  getAllEscorts,
  getEscortProfile,
  getEscortBySlug,
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
EscortRoute.get("/slug/:slug", getEscortBySlug);
EscortRoute.get("/search", searchEscorts);
EscortRoute.get("/location/:city", getEscortsByLocation);
EscortRoute.get("/category/:category", getEscortsByCategory);

// Debug route to see all escorts
EscortRoute.get("/debug/all", async (req, res) => {
  try {
    const escorts = await User.find({ role: "escort" })
      .select("alias name _id isActive")
      .limit(20);
    res.json({ success: true, escorts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test route for specific escort
EscortRoute.get("/debug/test/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("🧪 TESTING SLUG:", slug);

    // Test toutes les méthodes de recherche
    const exactAlias = await User.findOne({ alias: slug, role: "escort" });
    const exactName = await User.findOne({ name: slug, role: "escort" });
    const caseInsensitiveAlias = await User.findOne({
      alias: { $regex: new RegExp(`^${slug}$`, "i") },
      role: "escort",
    });
    const caseInsensitiveName = await User.findOne({
      name: { $regex: new RegExp(`^${slug}$`, "i") },
      role: "escort",
    });

    // Montrer tous les escorts
    const allEscorts = await User.find({ role: "escort" })
      .select("alias name _id email")
      .limit(5);

    res.json({
      success: true,
      searchedFor: slug,
      results: {
        exactAlias: exactAlias
          ? {
              id: exactAlias._id,
              name: exactAlias.name,
              alias: exactAlias.alias,
            }
          : null,
        exactName: exactName
          ? { id: exactName._id, name: exactName.name, alias: exactName.alias }
          : null,
        caseInsensitiveAlias: caseInsensitiveAlias
          ? {
              id: caseInsensitiveAlias._id,
              name: caseInsensitiveAlias.name,
              alias: caseInsensitiveAlias.alias,
            }
          : null,
        caseInsensitiveName: caseInsensitiveName
          ? {
              id: caseInsensitiveName._id,
              name: caseInsensitiveName.name,
              alias: caseInsensitiveName.alias,
            }
          : null,
      },
      allEscorts: allEscorts.map((e) => ({
        id: e._id,
        name: e.name,
        alias: e.alias,
        email: e.email,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete diagnostic route
EscortRoute.get("/debug/complete", async (req, res) => {
  try {
    console.log("🔬 COMPLETE DIAGNOSTIC");

    // 1. Compter tous les utilisateurs par rôle
    const userCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // 2. Obtenir tous les escorts avec leurs détails
    const allEscorts = await User.find({ role: "escort" })
      .select("alias name _id email phone age location")
      .limit(20);

    // 3. Analyser les champs alias et name
    const aliasAnalysis = await User.aggregate([
      { $match: { role: "escort" } },
      {
        $group: {
          _id: null,
          totalEscorts: { $sum: 1 },
          withAlias: { $sum: { $cond: [{ $ne: ["$alias", null] }, 1, 0] } },
          withName: { $sum: { $cond: [{ $ne: ["$name", null] }, 1, 0] } },
          uniqueAliases: { $addToSet: "$alias" },
          uniqueNames: { $addToSet: "$name" },
        },
      },
    ]);

    res.json({
      success: true,
      diagnostic: {
        userCounts,
        escortCount: allEscorts.length,
        escorts: allEscorts.map((e) => ({
          id: e._id,
          name: e.name,
          alias: e.alias,
          email: e.email,
          age: e.age,
          location: e.location,
        })),
        analysis: aliasAnalysis[0] || {},
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public routes (for registration)
EscortRoute.post(
  "/create",
  (req, res, next) => {
    console.log("=== ESCORT CREATE ROUTE HIT ===");
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);
    console.log("Request headers:", req.headers);
    next();
  },
  authenticate,
  (req, res, next) => {
    console.log("=== AFTER AUTHENTICATION ===");
    console.log("User:", req.user);
    next();
  },
  upload.fields([
    { name: "gallery", maxCount: 20 },
    { name: "idDocument", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("=== AFTER MULTER ===");
    console.log("Files:", req.files);
    console.log("Body:", req.body);
    next();
  },
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
  upload.array("gallery", 10),
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
