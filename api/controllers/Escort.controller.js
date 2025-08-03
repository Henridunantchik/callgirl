import User from "../models/user.model.js";
import { handleError } from "../helpers/handleError.js";
import cloudinary from "../config/cloudinary.js";

// Get all active escorts with pagination and filters
export const getAllEscorts = async (req, res) => {
  try {
    console.log("=== GET ALL ESCORTS DEBUG ===");
    console.log("Request query:", req.query);

    const {
      page = 1,
      limit = 20,
      country,
      city,
      ageMin,
      ageMax,
      services,
      verified,
      online,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {
      role: "escort",
      isActive: true,
    };

    // Apply filters
    if (country) {
      query["location.country"] = country;
    }
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }
    if (services) {
      query.services = { $in: services.split(",") };
    }
    if (verified === "true") {
      query.isVerified = true;
    }
    if (online === "true") {
      query.isOnline = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("Query:", query);

    const escorts = await User.find(query)
      .select("-password -twoFactorSecret -loginAttempts -lockUntil")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    console.log("Found escorts:", escorts.length);
    console.log("Total escorts:", total);
    console.log("First escort:", escorts[0]);

    res.json({
      success: true,
      escorts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error creating escort profile:", error);
    handleError(res, error);
  }
};

// Get single escort profile
export const getEscortProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const escort = await User.findById(id)
      .select("-password -twoFactorSecret -loginAttempts -lockUntil")
      .populate("agency.agencyId", "name isVerified");

    if (!escort || escort.role !== "escort") {
      return res.status(404).json({
        success: false,
        message: "Escort profile not found",
      });
    }

    if (!escort.isActive) {
      return res.status(404).json({
        success: false,
        message: "Profile is not available",
      });
    }

    // Increment profile views
    await User.findByIdAndUpdate(id, {
      $inc: { "stats.profileViews": 1 },
    });

    res.json({
      success: true,
      escort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Create escort profile
export const createEscortProfile = async (req, res) => {
  try {
    console.log("=== CREATE ESCORT PROFILE REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("Request user:", req.user);

    const escortData = req.body;
    const files = req.files || {};
    const galleryFiles = files.gallery || [];
    const idDocumentFile = files.idDocument ? files.idDocument[0] : null;

    console.log("=== FILES DEBUG ===");
    console.log("req.files:", req.files);
    console.log("files object:", files);
    console.log("files.gallery:", files.gallery);
    console.log("galleryFiles:", galleryFiles);
    console.log("galleryFiles.length:", galleryFiles.length);

    const userId = req.user._id;
    console.log("User ID from request:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    const user = await User.findById(userId);
    console.log("Found user:", user ? user._id : "User not found");

    // Check if user already has an escort profile
    if (user.role === "escort") {
      return res.status(400).json({
        success: false,
        message: "You already have an escort profile",
      });
    }

    // Check if user is admin (admin cannot become escort)
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot create escort profiles",
      });
    }

    // Process gallery images - NEW APPROACH
    const gallery = [];
    if (galleryFiles && galleryFiles.length > 0) {
      console.log(`Processing ${galleryFiles.length} gallery files for upload`);

      for (let i = 0; i < galleryFiles.length; i++) {
        try {
          const file = galleryFiles[i];
          console.log(
            `Processing gallery file ${i + 1}/${galleryFiles.length}:`,
            file.originalname
          );
          console.log(`File path:`, file.path);
          console.log(`File size:`, file.size);

          // Read the file from disk and convert to base64 - OPTIMIZED
          const fs = await import("fs");
          console.log(`Reading file from disk: ${file.path}`);
          const fileBuffer = fs.readFileSync(file.path);
          console.log(`File size: ${fileBuffer.length} bytes`);

          // Convert to base64 more efficiently
          const base64String = fileBuffer.toString("base64");
          const mimeType = file.mimetype;
          const dataUrl = `data:${mimeType};base64,${base64String}`;

          console.log(
            `Created data URL for gallery file ${i + 1} (${Math.round(
              dataUrl.length / 1024
            )}KB)`
          );

          gallery.push({
            url: dataUrl,
            isPrivate: false,
            isWatermarked: false,
            order: i,
            isApproved: false,
          });

          // Clean up the temporary file
          fs.unlinkSync(file.path);
          console.log(`Cleaned up temporary file:`, file.path);
        } catch (uploadError) {
          console.error("Error processing gallery image:", uploadError);
          // Fallback to placeholder if processing fails
          const placeholderUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=Error+${
            i + 1
          }`;
          gallery.push({
            url: placeholderUrl,
            isPrivate: false,
            isWatermarked: false,
            order: i,
            isApproved: false,
          });
        }
      }
    } else {
      console.log("=== NO GALLERY FILES FOUND ===");
      console.log("galleryFiles is empty or undefined");
      console.log("This means photos were not uploaded correctly");
    }

    // Process ID document if provided
    if (idDocumentFile) {
      console.log("Processing ID document:", idDocumentFile.originalname);
      // For now, just log that we received the ID document
      // In production, you might want to store this securely
    }

    // Parse services from string to array
    let services = [];
    if (escortData.services) {
      try {
        services = JSON.parse(escortData.services);
      } catch (e) {
        services = escortData.services.split(",").map((s) => s.trim());
      }
    }

    // Create escort profile
    const escortProfile = {
      name: escortData.name,
      alias: escortData.alias,
      email: escortData.email,
      phone: escortData.phone,
      gender: escortData.gender,
      age: parseInt(escortData.age),
      location: {
        city: escortData.city,
        country: escortData.country || "ug",
        subLocation: escortData.subLocation || "",
      },
      services,
      rates: {
        hourly: parseFloat(escortData.hourlyRate),
        isStandardPricing: escortData.isStandardPricing === "true",
      },
      gallery,
      isActive: true,
      isOnline: false,
      lastSeen: new Date(),
      stats: {
        profileViews: 0,
        favorites: 0,
        reviews: 0,
        averageRating: 0,
      },
    };

    console.log("=== ESCORT PROFILE TO SAVE ===");
    console.log("Escort profile:", JSON.stringify(escortProfile, null, 2));

    console.log("=== SAVING TO DATABASE ===");
    console.log("User ID:", userId);

    // First, update the role to "escort" to satisfy conditional validation
    await User.findByIdAndUpdate(
      userId,
      { role: "escort" },
      { runValidators: false }
    );

    // Then update all other fields
    const updatedUser = await User.findByIdAndUpdate(userId, escortProfile, {
      new: true,
      runValidators: false,
    }).select("-password -twoFactorSecret");

    console.log("=== SAVE SUCCESSFUL ===");
    console.log("Updated user ID:", updatedUser._id);

    res.status(201).json({
      success: true,
      message: "Escort profile created successfully",
      escort: updatedUser,
    });
  } catch (error) {
    console.error("=== ERROR IN CREATE ESCORT PROFILE ===");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    console.error("Error validation errors:", error.errors);

    // Send detailed error response for debugging
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
      validationErrors: error.errors
        ? Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          }))
        : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Update escort profile
export const updateEscortProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = JSON.parse(req.body.data || "{}");
    const files = req.files || [];

    // Verify ownership
    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    // Handle gallery uploads
    if (files.length > 0) {
      const newGallery = [];
      for (let i = 0; i < files.length; i++) {
        const result = await cloudinary.uploader.upload(files[i].path, {
          folder: "escort_gallery",
          transformation: [
            { width: 800, height: 600, crop: "fill" },
            { overlay: "watermark", opacity: 30 },
          ],
        });
        newGallery.push({
          url: result.secure_url,
          isPrivate: false,
          isWatermarked: true,
          order: i,
          isApproved: false,
        });
      }
      updateData.gallery = newGallery;
    }

    const updatedEscort = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -twoFactorSecret");

    res.json({
      success: true,
      message: "Profile updated successfully",
      escort: updatedEscort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete escort profile
export const deleteEscortProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own profile",
      });
    }

    await User.findByIdAndUpdate(id, {
      isActive: false,
      isOnline: false,
    });

    res.json({
      success: true,
      message: "Profile deactivated successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Search escorts
export const searchEscorts = async (req, res) => {
  try {
    const {
      q,
      city,
      ageMin,
      ageMax,
      services,
      priceMin,
      priceMax,
      verified,
      online,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      role: "escort",
      isActive: true,
    };

    // Text search
    if (q) {
      query.$or = [
        { alias: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
        { services: { $in: [new RegExp(q, "i")] } },
      ];
    }

    // Apply filters
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }
    if (services) {
      query.services = { $in: services.split(",") };
    }
    if (priceMin || priceMax) {
      query["rates.hourly"] = {};
      if (priceMin) query["rates.hourly"].$gte = parseInt(priceMin);
      if (priceMax) query["rates.hourly"].$lte = parseInt(priceMax);
    }
    if (verified === "true") {
      query.isVerified = true;
    }
    if (online === "true") {
      query.isOnline = true;
    }

    const escorts = await User.find(query)
      .select("-password -twoFactorSecret")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      escorts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get escorts by location
export const getEscortsByLocation = async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const escorts = await User.find({
      role: "escort",
      isActive: true,
      "location.city": { $regex: city, $options: "i" },
    })
      .select("-password -twoFactorSecret")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments({
      role: "escort",
      isActive: true,
      "location.city": { $regex: city, $options: "i" },
    });

    res.json({
      success: true,
      escorts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get escorts by category (services)
export const getEscortsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const escorts = await User.find({
      role: "escort",
      isActive: true,
      services: { $in: [new RegExp(category, "i")] },
    })
      .select("-password -twoFactorSecret")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments({
      role: "escort",
      isActive: true,
      services: { $in: [new RegExp(category, "i")] },
    });

    res.json({
      success: true,
      escorts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update escort status (online/offline)
export const updateEscortStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own status",
      });
    }

    const updatedEscort = await User.findByIdAndUpdate(
      id,
      {
        isOnline,
        lastSeen: new Date(),
      },
      { new: true }
    ).select("-password -twoFactorSecret");

    res.json({
      success: true,
      message: `Status updated to ${isOnline ? "online" : "offline"}`,
      escort: updatedEscort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Upload gallery images
export const uploadGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const files = req.files || [];

    console.log("=== UPLOAD GALLERY DEBUG ===");
    console.log("User ID:", userId);
    console.log("Target ID:", id);
    console.log("Files received:", files.length);

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only upload to your own gallery",
      });
    }

    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        console.log(
          `Processing gallery file ${i + 1}/${files.length}:`,
          file.originalname
        );
        console.log(`File path:`, file.path);
        console.log(`File size:`, file.size);

        // Read the file from disk and convert to base64
        const fs = await import("fs");
        console.log(`Reading file from disk: ${file.path}`);
        const fileBuffer = fs.readFileSync(file.path);
        console.log(`File size: ${fileBuffer.length} bytes`);

        // Convert to base64 more efficiently
        const base64String = fileBuffer.toString("base64");
        const mimeType = file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64String}`;

        console.log(
          `Created data URL for gallery file ${i + 1} (${Math.round(
            dataUrl.length / 1024
          )}KB)`
        );

        newImages.push({
          url: dataUrl,
          isPrivate: false,
          isWatermarked: false,
          order: i,
          isApproved: false,
        });

        // Clean up the temporary file
        fs.unlinkSync(file.path);
        console.log(`Cleaned up temporary file:`, file.path);
      } catch (uploadError) {
        console.error("Error processing gallery image:", uploadError);
        // Skip this file and continue with others
        continue;
      }
    }

    if (newImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid images were processed",
      });
    }

    const escort = await User.findByIdAndUpdate(
      id,
      { $push: { gallery: { $each: newImages } } },
      { new: true }
    ).select("-password -twoFactorSecret");

    console.log(`Successfully added ${newImages.length} images to gallery`);

    res.json({
      success: true,
      message: `${newImages.length} images uploaded successfully`,
      escort,
    });
  } catch (error) {
    console.error("Upload gallery error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload gallery images",
      error: error.message,
    });
  }
};

// Delete gallery image
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user._id;

    console.log("=== DELETE GALLERY IMAGE ===");
    console.log("User ID:", userId);
    console.log("Target ID:", id);
    console.log("Image ID:", imageId);

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete from your own gallery",
      });
    }

    // Find the user first
    const escort = await User.findById(id);
    if (!escort) {
      return res.status(404).json({
        success: false,
        message: "Escort not found",
      });
    }

    console.log("Current gallery:", escort.gallery);
    console.log("Gallery length:", escort.gallery.length);

    // Try to find image by _id first, then by index
    let imageIndex = -1;

    if (imageId && imageId !== "undefined") {
      console.log("Looking for image with ID:", imageId);
      // Try to find by _id
      imageIndex = escort.gallery.findIndex(
        (img) => img._id && img._id.toString() === imageId
      );
      console.log("Found by _id at index:", imageIndex);
    }

    // If not found by _id, try to find by index (for old images without _id)
    if (imageIndex === -1) {
      const index = parseInt(imageId);
      console.log("Trying to find by index:", index);
      if (!isNaN(index) && index >= 0 && index < escort.gallery.length) {
        imageIndex = index;
        console.log("Found by index:", imageIndex);
      }
    }

    console.log("Final image index to delete:", imageIndex);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Remove the image at the found index
    escort.gallery.splice(imageIndex, 1);
    console.log("Image removed from array, saving...");

    await escort.save();
    console.log("Escort saved successfully");

    console.log("Image deleted successfully");

    res.json({
      success: true,
      message: "Image deleted successfully",
      escort: escort.select("-password -twoFactorSecret"),
    });
  } catch (error) {
    console.error("Delete gallery image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

// Reorder gallery
export const reorderGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { galleryOrder } = req.body;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only reorder your own gallery",
      });
    }

    // Update gallery order
    const escort = await User.findById(id);
    if (!escort) {
      return res.status(404).json({
        success: false,
        message: "Escort not found",
      });
    }

    // Reorder gallery based on provided order
    const reorderedGallery = galleryOrder
      .map((imageId, index) => {
        const image = escort.gallery.find(
          (img) => img._id.toString() === imageId
        );
        if (image) {
          image.order = index;
          return image;
        }
      })
      .filter(Boolean);

    escort.gallery = reorderedGallery;
    await escort.save();

    res.json({
      success: true,
      message: "Gallery reordered successfully",
      escort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Upload video
export const uploadVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type = "gallery" } = req.body;
    const file = req.file;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only upload to your own profile",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "escort_videos",
      transformation: [{ width: 640, height: 480, crop: "fill" }],
    });

    const newVideo = {
      url: result.secure_url,
      type,
      isPrivate: false,
      isApproved: false,
    };

    const escort = await User.findByIdAndUpdate(
      id,
      { $push: { videos: newVideo } },
      { new: true }
    ).select("-password -twoFactorSecret");

    res.json({
      success: true,
      message: "Video uploaded successfully",
      escort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete from your own profile",
      });
    }

    const escort = await User.findByIdAndUpdate(
      id,
      { $pull: { videos: { _id: videoId } } },
      { new: true }
    ).select("-password -twoFactorSecret");

    res.json({
      success: true,
      message: "Video deleted successfully",
      escort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Verify escort (admin only)
export const verifyEscort = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationType } = req.body;

    const escort = await User.findById(id);
    if (!escort || escort.role !== "escort") {
      return res.status(404).json({
        success: false,
        message: "Escort not found",
      });
    }

    // Update verification status
    if (verificationType === "id") {
      escort.verification.idVerified = true;
    } else if (verificationType === "selfie") {
      escort.verification.selfieVerified = true;
    } else if (verificationType === "video") {
      escort.verification.videoVerified = true;
    }

    // Mark as verified if all verifications are complete
    if (escort.verification.idVerified && escort.verification.selfieVerified) {
      escort.isVerified = true;
    }

    await escort.save();

    res.json({
      success: true,
      message: "Escort verified successfully",
      escort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get escort statistics
export const getEscortStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own stats",
      });
    }

    const escort = await User.findById(id).select("stats");
    if (!escort) {
      return res.status(404).json({
        success: false,
        message: "Escort not found",
      });
    }

    res.json({
      success: true,
      stats: escort.stats,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get escort analytics
export const getEscortAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own analytics",
      });
    }

    // This would typically include more detailed analytics
    // For now, returning basic stats
    const escort = await User.findById(id).select("stats lastSeen isOnline");
    if (!escort) {
      return res.status(404).json({
        success: false,
        message: "Escort not found",
      });
    }

    res.json({
      success: true,
      analytics: {
        profileViews: escort.stats.profileViews,
        favorites: escort.stats.favorites,
        reviews: escort.stats.reviews,
        averageRating: escort.stats.averageRating,
        lastSeen: escort.lastSeen,
        isOnline: escort.isOnline,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
