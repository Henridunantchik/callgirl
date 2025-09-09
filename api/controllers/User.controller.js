import firebaseStorage from "../services/firebaseStorage.js";
import railwayStorage from "../services/railwayStorage.js";
import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { fixUrlsInObject, fixUrlsInArray } from "../utils/urlHelper.js";

export const getUser = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const authenticatedUserId = req.user._id;

    // Check if user is requesting their own data or is admin
    if (userid !== authenticatedUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied - you can only access your own profile",
      });
    }

    const user = await User.findOne({ _id: userid }).lean().exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fix URLs for media files
    const userWithFixedUrls = fixUrlsInObject(user);

    res.status(200).json({
      success: true,
      message: "User data found.",
      user: userWithFixedUrls,
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const data = req.body;
    const authenticatedUserId = req.user._id;

    const user = await User.findById(authenticatedUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Basic fields for all users (only update if provided)
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.whatsapp !== undefined) user.whatsapp = data.whatsapp;
    if (data.telegram !== undefined) user.telegram = data.telegram;

    // Escort-specific fields (only update if provided)
    if (user.role === "escort") {
      if (data.alias !== undefined) user.alias = data.alias;
      if (data.age !== undefined) user.age = data.age;
      if (data.gender !== undefined) user.gender = data.gender;
      if (data.height !== undefined) user.height = data.height;
      if (data.weight !== undefined) user.weight = data.weight;
      if (data.bodyType !== undefined) user.bodyType = data.bodyType;
      if (data.ethnicity !== undefined) user.ethnicity = data.ethnicity;
      if (data.hairColor !== undefined) user.hairColor = data.hairColor;
      if (data.eyeColor !== undefined) user.eyeColor = data.eyeColor;
      if (data.experience !== undefined) user.experience = data.experience;
      if (data.services !== undefined) user.services = data.services || [];
      if (data.languages !== undefined) user.languages = data.languages || [];

      // Location (only update if provided)
      if (data.location) {
        if (!user.location) user.location = {};
        if (data.location.city !== undefined)
          user.location.city = data.location.city;
        if (data.location.subLocation !== undefined)
          user.location.subLocation = data.location.subLocation;
      }

      // Rates (only update if provided)
      if (data.rates) {
        if (!user.rates) user.rates = {};
        if (data.rates.hourly !== undefined)
          user.rates.hourly = data.rates.hourly;
      }

      // Pricing type
      if (data.isStandardPricing !== undefined)
        user.isStandardPricing = data.isStandardPricing;
    }

    // Password update (only if provided and valid)
    if (data.password && data.password.length >= 8) {
      const hashedPassword = bcryptjs.hashSync(data.password);
      user.password = hashedPassword;
    }

    // Avatar upload (if file provided)
    if (req.file) {
      let uploadResult = await firebaseStorage.uploadFile(req.file, "avatars");

      if (!uploadResult.success) {
        console.error("Avatar upload error (Firebase):", uploadResult.error);
        // Fallback to Railway storage
        try {
          const railwayResult = await railwayStorage.uploadFile(
            req.file,
            "avatars"
          );
          if (railwayResult.success) {
            uploadResult = railwayResult;
          }
        } catch (e) {
          console.error("Avatar upload fallback (Railway) failed:", e?.message);
        }
      }

      if (uploadResult?.success && uploadResult.url) {
        user.avatar = uploadResult.url;
      }
    }

    await user.save();

    const newUser = user.toObject({ getters: true });
    delete newUser.password;

    // Fix URLs for media files
    const userWithFixedUrls = fixUrlsInObject(newUser);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userWithFixedUrls,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    // Fix URLs for media files in all users
    const usersWithFixedUrls = fixUrlsInArray(users);

    res.status(200).json({
      success: true,
      user: usersWithFixedUrls,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Data deleted.",
    });
  } catch (error) {
    next(error);
  }
};

// Update user's online status
export const updateOnlineStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Update last active time
  await User.findByIdAndUpdate(userId, {
    lastActive: new Date(),
    isOnline: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isOnline: true }, "Online status updated"));
});

// Get user's online status
export const getOnlineStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("lastActive isOnline");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Calculate if user is online (active within last 30 minutes)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const isOnline = user.lastActive && user.lastActive >= thirtyMinutesAgo;

  return res
    .status(200)
    .json(new ApiResponse(200, { isOnline }, "Online status retrieved"));
});

// Mark user as offline
export const markOffline = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    isOnline: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isOnline: false }, "Marked as offline"));
});

// Get main admin for support
export const getMainAdmin = asyncHandler(async (req, res) => {
  try {
    // Find the first admin user (or create one if none exists)
    let admin = await User.findOne({ role: "admin" }).select(
      "_id name email avatar"
    );

    if (!admin) {
      // Create a default admin if none exists
      admin = await User.create({
        name: "Support Team",
        email: "support@callgirls.com",
        role: "admin",
        isActive: true,
        avatar: "https://via.placeholder.com/150/3B82F6/FFFFFF?text=Support",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { admin }, "Main admin retrieved"));
  } catch (error) {
    console.error("Error getting main admin:", error);
    throw new ApiError(500, "Failed to get admin information");
  }
});
