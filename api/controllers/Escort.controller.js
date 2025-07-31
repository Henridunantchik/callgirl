import User from "../models/user.model.js";
import { handleError } from "../helpers/handleError.js";
import cloudinary from "../config/cloudinary.js";

// Get all active escorts with pagination and filters
export const getAllEscorts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
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

    const escorts = await User.find(query)
      .select("-password -twoFactorSecret -loginAttempts -lockUntil")
      .sort(sortOptions)
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
    const userId = req.user._id;
    const escortData = JSON.parse(req.body.data || "{}");
    const files = req.files || [];

    // Check if user already has an escort profile
    const existingEscort = await User.findOne({ _id: userId, role: "escort" });
    if (existingEscort) {
      return res.status(400).json({
        success: false,
        message: "You already have an escort profile",
      });
    }

    // Upload gallery images
    const gallery = [];
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const result = await cloudinary.uploader.upload(files[i].path, {
          folder: "escort_gallery",
          transformation: [
            { width: 800, height: 600, crop: "fill" },
            { overlay: "watermark", opacity: 30 },
          ],
        });
        gallery.push({
          url: result.secure_url,
          isPrivate: false,
          isWatermarked: true,
          order: i,
          isApproved: false,
        });
      }
    }

    // Create escort profile
    const escortProfile = {
      ...escortData,
      role: "escort",
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

    const updatedUser = await User.findByIdAndUpdate(userId, escortProfile, {
      new: true,
      runValidators: true,
    }).select("-password -twoFactorSecret");

    res.status(201).json({
      success: true,
      message: "Escort profile created successfully",
      escort: updatedUser,
    });
  } catch (error) {
    handleError(res, error);
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

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only upload to your own gallery",
      });
    }

    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const result = await cloudinary.uploader.upload(files[i].path, {
        folder: "escort_gallery",
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { overlay: "watermark", opacity: 30 },
        ],
      });
      newImages.push({
        url: result.secure_url,
        isPrivate: false,
        isWatermarked: true,
        order: i,
        isApproved: false,
      });
    }

    const escort = await User.findByIdAndUpdate(
      id,
      { $push: { gallery: { $each: newImages } } },
      { new: true }
    ).select("-password -twoFactorSecret");

    res.json({
      success: true,
      message: "Images uploaded successfully",
      escort,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete gallery image
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user._id;

    if (id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete from your own gallery",
      });
    }

    const escort = await User.findByIdAndUpdate(
      id,
      { $pull: { gallery: { _id: imageId } } },
      { new: true }
    ).select("-password -twoFactorSecret");

    res.json({
      success: true,
      message: "Image deleted successfully",
      escort,
    });
  } catch (error) {
    handleError(res, error);
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
