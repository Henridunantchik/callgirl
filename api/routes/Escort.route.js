import express from "express";
import User from "../models/user.model.js";
import {
  getAllEscorts,
  getEscortById,
  createEscortProfile,
  updateEscortProfile,
  uploadMedia,
  getEscortSubscription,
  getProfileCompletion,
  searchEscorts,
  updateEscortFeaturedStatus,
} from "../controllers/Escort.controller.js";
import upload from "../config/multer.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyEscort } from "../middleware/onlyEscort.js";

const EscortRoute = express.Router();

// Public routes (age verification required)
EscortRoute.get("/all", getAllEscorts);
EscortRoute.get("/profile/:id", getEscortById);
EscortRoute.get("/search", searchEscorts);

// Create escort profile (requires authentication)
EscortRoute.post(
  "/create",
  authenticate,
  upload.fields([
    { name: "gallery", maxCount: 20 },
    { name: "idDocument", maxCount: 1 },
  ]),
  createEscortProfile
);

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

// Authenticated routes
EscortRoute.put(
  "/update/:id",
  authenticate,
  onlyEscort,
  upload.array("gallery", 20),
  updateEscortProfile
);

// Media upload
EscortRoute.post(
  "/media/:id",
  authenticate,
  onlyEscort,
  upload.array("media", 10),
  uploadMedia
);

// Subscription and profile info
EscortRoute.get("/subscription/:id", authenticate, onlyEscort, getEscortSubscription);
EscortRoute.get("/profile-completion/:id", authenticate, onlyEscort, getProfileCompletion);

// Admin route to update featured status
EscortRoute.put("/featured/:id", updateEscortFeaturedStatus);

export default EscortRoute;
