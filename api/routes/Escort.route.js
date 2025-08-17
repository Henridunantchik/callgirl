import express from "express";
import User from "../models/user.model.js";
import {
  getAllEscorts,
  getEscortById,
  createEscortProfile,
  updateEscortProfile,
  uploadMedia,
  uploadGallery,
  uploadVideo,
  getEscortSubscription,
  getProfileCompletion,
  searchEscorts,
  updateEscortFeaturedStatus,
  getEscortStats,
} from "../controllers/Escort.controller.js";
import upload from "../config/multer.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyEscort } from "../middleware/onlyEscort.js";

const EscortRoute = express.Router();

// Public routes (age verification required)
EscortRoute.get("/all", getAllEscorts);
EscortRoute.get("/profile/:id", getEscortById);
EscortRoute.get("/search", searchEscorts);

// Escort statistics (requires authentication)
EscortRoute.get("/stats/:id", authenticate, getEscortStats);

// Public escort statistics (no authentication required)
EscortRoute.get("/public-stats/:id", getEscortStats);

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
  upload.array("video", 5),
  uploadVideo
);

// Gallery upload
EscortRoute.post(
  "/gallery/:id",
  authenticate,
  onlyEscort,
  upload.array("gallery", 20),
  uploadGallery
);

// Video upload
EscortRoute.post(
  "/video/:id",
  authenticate,
  onlyEscort,
  upload.array("video", 5),
  uploadVideo
);

// Delete gallery image
EscortRoute.delete(
  "/gallery/:id/:imageId",
  authenticate,
  onlyEscort,
  async (req, res) => {
    try {
      const { id, imageId } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Remove image from gallery
      user.gallery = user.gallery.filter(
        (img) => img._id.toString() !== imageId
      );
      await user.save();

      res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete video
EscortRoute.delete(
  "/video/:id/:videoId",
  authenticate,
  onlyEscort,
  async (req, res) => {
    try {
      const { id, videoId } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Remove video from videos array
      user.videos = user.videos.filter(
        (video) => video._id.toString() !== videoId
      );
      await user.save();

      res.json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Subscription and profile info
EscortRoute.get(
  "/subscription/:id",
  authenticate,
  onlyEscort,
  getEscortSubscription
);
EscortRoute.get(
  "/profile-completion/:id",
  authenticate,
  onlyEscort,
  getProfileCompletion
);

// Admin route to update featured status
EscortRoute.put("/featured/:id", updateEscortFeaturedStatus);

// Simple video upload route (temporary fix)
EscortRoute.post(
  "/media/:id",
  authenticate,
  onlyEscort,
  upload.array("video", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      if (id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only upload to your own profile",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Video files are required" });
      }

      const escort = await User.findById(userId);
      if (!escort || escort.role !== "escort") {
        return res
          .status(404)
          .json({ success: false, message: "Escort not found" });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        try {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "escort-videos",
            resource_type: "video",
          });

          // Add to videos
          const mediaItem = {
            url: result.secure_url,
            publicId: result.public_id,
            caption: "",
            type: "gallery",
            isPrivate: false,
          };

          escort.videos.push(mediaItem);
          uploadedFiles.push(mediaItem);

          // Clean up local file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error(
            "Cloudinary upload error for file:",
            file.originalname,
            uploadError
          );
        }
      }

      await escort.save();

      res.json({
        success: true,
        escort: { videos: escort.videos },
        uploadedFiles,
        currentCount: escort.videos.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default EscortRoute;
