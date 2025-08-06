import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

export const onlyEscort = asyncHandler(async (req, res, next) => {
  try {
    // Check if user exists in request (set by authenticate middleware)
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    // Check if user has escort role
    if (req.user.role !== "escort") {
      // Log unauthorized access attempt
      console.warn(
        `Unauthorized escort access attempt by user ${req.user._id} (${req.user.email})`
      );

      throw new ApiError(403, "Escort access required");
    }

    // Verify user still exists in database and is active
    const user = await User.findById(req.user._id).select("+isActive +role");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    if (user.role !== "escort") {
      throw new ApiError(403, "Escort privileges required");
    }

    // Log successful escort access
    console.log(
      `Escort access granted to user ${req.user._id} (${req.user.email})`
    );

    next();
  } catch (error) {
    // Log security events
    console.error(`Escort authorization failed: ${error.message}`, {
      userId: req.user?._id,
      userEmail: req.user?.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });

    next(error);
  }
});

// Enhanced escort middleware with profile completion check
export const escortWithCompleteProfile = asyncHandler(
  async (req, res, next) => {
    try {
      // This should run after onlyEscort middleware
      const user = req.user;

      if (!user.isProfileComplete()) {
        throw new ApiError(
          403,
          "Profile completion required. Please complete your profile before accessing this feature"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

// Middleware to ensure escort has verified age
export const escortWithVerifiedAge = asyncHandler(async (req, res, next) => {
  try {
    // This should run after onlyEscort middleware
    const user = req.user;

    if (!user.isAgeVerified) {
      throw new ApiError(
        403,
        "Age verification required. Please verify your age before accessing this feature"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to ensure escort has active subscription
export const escortWithActiveSubscription = asyncHandler(
  async (req, res, next) => {
    try {
      // This should run after onlyEscort middleware
      const user = req.user;

      if (user.subscriptionTier === "free") {
        throw new ApiError(
          403,
          "Active subscription required. Please upgrade your subscription to access this feature"
        );
      }

      if (user.subscriptionStatus !== "active") {
        throw new ApiError(
          403,
          "Active subscription required. Your subscription is not active"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

// Middleware to ensure escort has premium or elite subscription
export const escortWithPremiumSubscription = asyncHandler(
  async (req, res, next) => {
    try {
      // This should run after onlyEscort middleware
      const user = req.user;

      if (!["premium", "elite"].includes(user.subscriptionTier)) {
        throw new ApiError(
          403,
          "Premium subscription required. Please upgrade to premium or elite to access this feature"
        );
      }

      if (user.subscriptionStatus !== "active") {
        throw new ApiError(
          403,
          "Active subscription required. Your subscription is not active"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

// Middleware to ensure escort has elite subscription
export const escortWithEliteSubscription = asyncHandler(
  async (req, res, next) => {
    try {
      // This should run after onlyEscort middleware
      const user = req.user;

      if (user.subscriptionTier !== "elite") {
        throw new ApiError(
          403,
          "Elite subscription required. Please upgrade to elite to access this feature"
        );
      }

      if (user.subscriptionStatus !== "active") {
        throw new ApiError(
          403,
          "Active subscription required. Your subscription is not active"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

// Middleware to check media upload limits based on subscription
export const checkMediaUploadLimit = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    const { mediaType } = req.body; // 'photo' or 'video'

    if (!mediaType) {
      throw new ApiError(400, "Media type is required");
    }

    const currentCount =
      mediaType === "photo" ? user.gallery.length : user.videos.length;
    const canUpload = user.canUploadMedia(mediaType, currentCount);

    if (!canUpload) {
      const limit =
        mediaType === "photo"
          ? user.subscriptionTier === "verified"
            ? 20
            : 10
          : user.subscriptionTier === "verified"
          ? 10
          : 5;

      throw new ApiError(
        403,
        `Media upload limit reached. You can upload up to ${limit} ${mediaType}s with your current subscription. Upgrade to upload more.`
      );
    }

    // Add media count info to request for use in controller
    req.mediaInfo = {
      mediaType,
      currentCount,
      canUpload,
      limit:
        user.subscriptionTier === "verified"
          ? mediaType === "photo"
            ? 20
            : 10
          : mediaType === "photo"
          ? 10
          : 5,
    };

    next();
  } catch (error) {
    next(error);
  }
});
