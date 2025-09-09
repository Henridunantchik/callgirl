import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import firebaseStorage from "../services/firebaseStorage.js";
import sharp from "sharp";
import railwayStorage from "../services/railwayStorage.js";
import config from "../config/env.js";
import { generateToken } from "../utils/security.js";
import fs from "fs";
import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Booking from "../models/booking.model.js";
import Review from "../models/review.model.js";
import Favorite from "../models/favorite.model.js";
import { fixUrlsInObject, fixUrlsInArray } from "../utils/urlHelper.js";
import cacheManager from "../utils/cacheManager.js";
import {
  optimizeQuery,
  createPagination,
  monitorQueryPerformance,
  getQueryHint,
} from "../utils/databaseOptimizer.js";

// Local helpers for lean documents
// Compute benefits by subscription tier (aligns with user.model.js)
const getSubscriptionBenefits = (tier) => {
  const benefits = {
    basic: {
      photos: 10,
      videos: 5,
      features: ["Basic Profile", "Standard Search", "Basic Messaging"],
    },
    verified: {
      photos: 20,
      videos: 10,
      features: [
        "Verified Badge",
        "Priority Search",
        "Enhanced Analytics",
        "Priority Support",
      ],
    },
    premium: {
      photos: -1,
      videos: -1,
      features: [
        "Premium Badge",
        "Featured Placement",
        "Unlimited Media",
        "Direct Contact",
        "Profile Highlighting",
        "Analytics Dashboard",
      ],
    },
    elite: {
      photos: -1,
      videos: -1,
      features: [
        "VIP Badge",
        "Homepage Featured",
        "Priority Booking",
        "Custom Profile",
        "Social Media Integration",
        "Professional Tips",
        "Marketing Support",
      ],
    },
  };
  return benefits[tier] || benefits.basic;
};

// Compute profile completion for lean objects (rough equivalent of model method)
const calculateProfileCompletion = (escort) => {
  const requiredFields = [
    "name",
    "alias",
    "email",
    "phone",
    "age",
    "gender",
    "location.city",
    "location.country",
    "services",
    "rates.hourly",
    "gallery",
  ];

  const getValue = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);

  const completed = requiredFields.filter((field) => {
    const value = getValue(escort, field);
    return value && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return Math.round((completed / requiredFields.length) * 100);
};

/**
 * Get all escorts with filtering and pagination - OPTIMIZED FOR UNLIMITED PERFORMANCE
 * GET /api/escort/all
 */
export const getAllEscorts = asyncHandler(async (req, res, next) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            escorts: [],
            totalEscorts: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 20,
          },
          "Demo data (database not connected)"
        )
      );
    }

    const {
      page = 1,
      limit = 20,
      q, // Search query
      city,
      country,
      countryCode,
      age,
      bodyType,
      service,
      ethnicity,
      priceRange,
      verified,
      online,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Generate cache key for this query
    const cacheKey = `escorts:${JSON.stringify(req.query)}`;

    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log("🚀 Cache HIT for escort query");
      return res.json(cached);
    }

    console.log("💾 Cache MISS for escort query");

    // Map country codes to country names
    const countryMapping = {
      ug: "Uganda",
      ke: "Kenya",
      tz: "Tanzania",
      rw: "Rwanda",
      bi: "Burundi",
      cd: "DR Congo",
    };

    // Build optimized filter object
    const filter = {
      role: "escort",
      isActive: true,
      isAvailable: true, // Only show available escorts
    };

    // Auto-filter by country if countryCode is provided
    if (countryCode && countryMapping[countryCode]) {
      const countryName = countryMapping[countryCode];
      filter["location.country"] = {
        $in: [countryName, countryCode],
      };
    }

    // Search query - use text search for better performance
    if (q) {
      filter.$text = { $search: q };
    }

    // Location filters
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (country)
      filter["location.country"] = { $regex: country, $options: "i" };

    // Age filter
    if (age) {
      if (age.includes("-")) {
        const [minAge, maxAge] = age.split("-").map(Number);
        filter.age = { $gte: minAge, $lte: maxAge };
      } else if (age.includes("+")) {
        const minAge = parseInt(age.replace("+", ""));
        filter.age = { $gte: minAge };
      } else {
        const targetAge = parseInt(age);
        filter.age = { $gte: targetAge - 5, $lte: targetAge + 5 };
      }
    }

    // Body type filter
    if (bodyType) filter.bodyType = { $regex: bodyType, $options: "i" };

    // Service filter
    if (service) filter["services"] = { $regex: service, $options: "i" };

    // Ethnicity filter
    if (ethnicity) filter.ethnicity = { $regex: ethnicity, $options: "i" };

    // Price range filter
    if (priceRange) {
      if (priceRange.includes("-")) {
        const [minPrice, maxPrice] = priceRange.split("-").map(Number);
        filter["rates.hourly"] = { $gte: minPrice, $lte: maxPrice };
      } else if (priceRange.includes("+")) {
        const minPrice = parseInt(priceRange.replace("+", ""));
        filter["rates.hourly"] = { $gte: minPrice };
      }
    }

    // Verification filter
    if (verified === "true") {
      filter.isVerified = true;
    }

    // Online status filter
    if (online === "true") {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      filter.lastActive = { $gte: thirtyMinutesAgo };
    }

    // Featured filter
    if (featured === "true" || featured === true) {
      filter.$or = [
        { isFeatured: true },
        { subscriptionTier: { $in: ["featured", "premium"] } },
      ];
    }

    // Build optimized sort object
    const sort = {};
    if (sortBy === "relevance" && q) {
      // Use text search score for relevance
      sort.score = { $meta: "textScore" };
    } else if (sortBy === "rating") {
      sort.rating = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "price-low") {
      sort["rates.hourly"] = 1;
    } else if (sortBy === "price-high") {
      sort["rates.hourly"] = -1;
    } else if (sortBy === "newest") {
      sort.createdAt = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "name") {
      sort.name = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "age") {
      sort.age = sortOrder === "desc" ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    // Create pagination
    const pagination = createPagination(page, limit, 100);

    // Start performance monitoring
    const queryStart = Date.now();

    // Get escorts with OPTIMIZED query (safe hint)
    const baseSelect =
      "name alias age location gender rates services gallery stats subscriptionTier isVerified isAgeVerified profileCompletion isFeatured isActive phone bio ethnicity bodyType lastActive profileViews rating reviewCount";
    const hintName = getQueryHint(filter);

    let query = User.find(filter)
      .select(baseSelect)
      .sort(sort)
      .limit(pagination.limit)
      .skip(pagination.skip)
      .lean();

    if (hintName) {
      query = query.hint(hintName);
    }

    let escorts;
    try {
      escorts = await query.exec();
    } catch (hintError) {
      if (hintName) {
        console.warn(
          `⚠️ Hint failed ('${hintName}'): ${hintError.message}. Retrying without hint.`
        );
        escorts = await User.find(filter)
          .select(baseSelect)
          .sort(sort)
          .limit(pagination.limit)
          .skip(pagination.skip)
          .lean()
          .exec();
      } else {
        throw hintError;
      }
    }

    // Monitor query performance
    const queryDuration = monitorQueryPerformance(null, queryStart);

    // Get total count with same filter (cached separately)
    const countCacheKey = `escort_count:${JSON.stringify(filter)}`;
    let total = cacheManager.get(countCacheKey);

    if (total === null) {
      total = await User.countDocuments(filter);
      cacheManager.set(countCacheKey, total, 300000); // Cache count for 5 minutes
    }

    // Process escorts data efficiently
    const escortsWithBenefits = escorts.map((escort) => {
      // Parse services if it's a string
      let services = escort.services;
      if (typeof services === "string") {
        try {
          services = JSON.parse(services);
        } catch (e) {
          services = services.split(/[,\s]+/).filter((s) => s.trim());
        }
      }

      // Calculate online status
      const isOnline =
        escort.lastActive &&
        Date.now() - new Date(escort.lastActive).getTime() < 30 * 60 * 1000;

      // Get subscription benefits
      const benefits = getSubscriptionBenefits(escort.subscriptionTier);

      return {
        ...escort,
        services,
        isOnline,
        benefits,
        // Optimize image URLs
        gallery: escort.gallery ? escort.gallery.slice(0, 3) : [], // Only first 3 images
        // Remove sensitive fields
        phone: undefined,
        // Add computed fields
        profileCompletion: calculateProfileCompletion(escort),
        // Format rates
        rates: {
          hourly: escort.rates?.hourly || 0,
          overnight: escort.rates?.overnight || 0,
          weekend: escort.rates?.weekend || 0,
        },
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / pagination.limit);

    // Prepare response
    const response = {
      escorts: escortsWithBenefits,
      totalEscorts: total,
      totalPages,
      currentPage: pagination.page,
      limit: pagination.limit,
      hasMore: pagination.page < totalPages,
      performance: {
        queryDuration: `${queryDuration}ms`,
        cacheHit: false,
        totalResults: escortsWithBenefits.length,
      },
    };

    // Cache the response for 2 minutes
    cacheManager.set(cacheKey, response, 120000);

    // Log performance metrics
    if (queryDuration > 100) {
      console.warn(
        `🐌 Slow escort query: ${queryDuration}ms for ${escortsWithBenefits.length} results`
      );
    } else {
      console.log(
        `⚡ Fast escort query: ${queryDuration}ms for ${escortsWithBenefits.length} results`
      );
    }

    res.json(new ApiResponse(200, response, "Escorts retrieved successfully"));
  } catch (error) {
    console.error("❌ Error in getAllEscorts:", error);
    next(new ApiError(500, "Failed to retrieve escorts"));
  }
});

/**
 * Get escort by ID
 * GET /api/escort/:id
 */
export const getEscortById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("🔍 getEscortById called with id:", id);

    // Validate ID parameter
    if (!id || id === "undefined") {
      throw new ApiError(400, "Invalid escort identifier");
    }

    let escort = null;

    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      // Try to find escort by ObjectId first
      escort = await User.findOne({
        _id: id,
        role: "escort",
        isActive: true,
      }).select("-password");
    }

    // If not found by ObjectId or id is not a valid ObjectId, try by alias or name
    if (!escort) {
      // Decode and normalize slug/id (trim, collapse spaces, replace hyphens/underscores with spaces)
      const decodedId = decodeURIComponent(id || "");
      const normalized = decodedId
        .trim()
        .replace(/[\-_]+/g, " ")
        .replace(/\s+/g, " ");
      console.log("🔍 Decoded ID:", decodedId);
      console.log("🔍 Normalized ID:", normalized);

      // Try exact match first
      escort = await User.findOne({
        $or: [
          { alias: decodedId, role: "escort", isActive: true },
          { name: decodedId, role: "escort", isActive: true },
          { alias: normalized, role: "escort", isActive: true },
          { name: normalized, role: "escort", isActive: true },
        ],
      }).select("-password");

      console.log("🔍 Exact match result:", escort ? "Found" : "Not found");

      // If still not found, try case-insensitive search
      if (!escort) {
        escort = await User.findOne({
          $or: [
            {
              alias: { $regex: new RegExp(`^${decodedId}$`, "i") },
              role: "escort",
              isActive: true,
            },
            {
              name: { $regex: new RegExp(`^${decodedId}$`, "i") },
              role: "escort",
              isActive: true,
            },
            {
              alias: { $regex: new RegExp(`^${normalized}$`, "i") },
              role: "escort",
              isActive: true,
            },
            {
              name: { $regex: new RegExp(`^${normalized}$`, "i") },
              role: "escort",
              isActive: true,
            },
          ],
        }).select("-password");

        console.log(
          "🔍 Case-insensitive match result:",
          escort ? "Found" : "Not found"
        );
      }

      // If still not found, try partial match (for backward compatibility)
      if (!escort) {
        escort = await User.findOne({
          $or: [
            {
              alias: { $regex: decodedId, $options: "i" },
              role: "escort",
              isActive: true,
            },
            {
              name: { $regex: decodedId, $options: "i" },
              role: "escort",
              isActive: true,
            },
            {
              alias: { $regex: normalized, $options: "i" },
              role: "escort",
              isActive: true,
            },
            {
              name: { $regex: normalized, $options: "i" },
              role: "escort",
              isActive: true,
            },
          ],
        }).select("-password");

        console.log("🔍 Partial match result:", escort ? "Found" : "Not found");
      }
    }

    if (!escort) {
      throw new ApiError(404, "Escort not found");
    }

    // Increment view count
    escort.stats.views += 1;
    await escort.save();

    // Get subscription benefits
    const benefits = escort.getSubscriptionBenefits();

    // Fix URLs for media files
    const escortWithFixedUrls = fixUrlsInObject(escort.toObject());

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escort: {
            ...escortWithFixedUrls,
            benefits,
            subscriptionTier: escort.subscriptionTier || "basic",
          },
        },
        "Escort retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Update escort profile
 * PUT /api/escort/update
 */
export const updateEscortProfile = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const {
      password,
      email,
      role,
      isActive,
      isVerified,
      isAgeVerified,
      subscriptionTier,
      subscriptionStatus,
      ...safeUpdateData
    } = updateData;

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Update escort data
    Object.assign(escort, safeUpdateData);

    // Update profile completion percentage
    escort.profileCompletion = escort.getProfileCompletionPercentage();

    await escort.save();

    return res
      .status(200)
      .json(new ApiResponse(200, escort, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
});

/**
 * Upload media (photos/videos) for escort
 * POST /api/escort/upload-media
 */
export const uploadMedia = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mediaType, caption } = req.body;

    if (!req.files || !req.files.media) {
      throw new ApiError(400, "Media file is required");
    }

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Check media upload limits based on subscription
    const currentCount =
      mediaType === "photo" ? escort.gallery.length : escort.videos.length;
    const canUpload = escort.canUploadMedia(mediaType, currentCount);

    if (!canUpload) {
      const limit =
        mediaType === "photo"
          ? escort.subscriptionTier === "verified"
            ? 20
            : 10
          : escort.subscriptionTier === "verified"
          ? 10
          : 5;

      throw new ApiError(
        403,
        `Media upload limit reached. You can upload up to ${limit} ${mediaType}s with your current subscription. Upgrade to upload more.`
      );
    }

    const mediaFile = req.files.media;

    try {
      // Upload to Firebase storage
      let fileToUpload = mediaFile;
      if (mediaType === "photo") {
        try {
          const optimizedBuffer = await sharp(mediaFile.buffer)
            .rotate()
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
          fileToUpload = {
            ...mediaFile,
            buffer: optimizedBuffer,
            size: optimizedBuffer.length,
            mimetype: "image/webp",
            originalname: mediaFile.originalname.replace(/\.[^.]+$/, ".webp"),
          };
        } catch (e) {
          console.warn(
            "Photo optimization failed, uploading original:",
            e?.message
          );
        }
      }

      const result = await firebaseStorage.uploadFile(
        fileToUpload,
        mediaType === "photo" ? "gallery" : "video"
      );

      if (!result.success) {
        console.error("Upload failed:", result.error);
        return res
          .status(502)
          .json(new ApiResponse(502, null, "Storage upload failed"));
      }

      // Add media to escort's gallery or videos
      const mediaItem = {
        url: result.url,
        publicId: result.publicId,
        caption: caption || "",
        isPrivate: false,
      };

      if (mediaType === "photo") {
        mediaItem.order = escort.gallery.length;
        escort.gallery.push(mediaItem);
      } else if (mediaType === "video") {
        mediaItem.type = "gallery";
        escort.videos.push(mediaItem);
      } else {
        throw new ApiError(
          400,
          "Invalid media type. Must be 'photo' or 'video'"
        );
      }

      // No local cleanup needed with memory storage

      await escort.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            mediaItem,
            currentCount:
              mediaType === "photo"
                ? escort.gallery.length
                : escort.videos.length,
            subscriptionTier: escort.subscriptionTier,
            benefits: escort.getSubscriptionBenefits(),
          },
          "Media uploaded successfully"
        )
      );
    } catch (uploadError) {
      console.error("Railway storage upload error:", uploadError);
      throw new ApiError(502, "Failed to upload media to storage");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Upload gallery photos for escort
 * POST /api/escort/gallery/:id
 */
export const uploadGallery = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id !== userId) {
      throw new ApiError(403, "You can only upload to your own profile");
    }

    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "Gallery files are required");
    }

    // If upload.any() was used, filter images by mimetype
    const imageFiles = (req.files || []).filter((f) =>
      (f.mimetype || "").startsWith("image/")
    );
    const filesToProcess = imageFiles.length > 0 ? imageFiles : req.files;

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Check upload limits
    const canUpload = escort.canUploadMedia("photo", escort.gallery.length);
    if (!canUpload) {
      const limit = escort.subscriptionTier === "verified" ? 20 : 10;
      throw new ApiError(
        403,
        `Gallery upload limit reached. You can upload up to ${limit} photos with your current subscription.`
      );
    }

    const uploadedFiles = [];

    for (const file of filesToProcess) {
      try {
        // Upload to Firebase storage
        const result = await firebaseStorage.uploadFile(file, "gallery");

        if (!result.success) {
          throw new Error(`Failed to upload file: ${result.error}`);
        }

        // Add to gallery
        const mediaItem = {
          url: result.url,
          publicId: result.publicId,
          filePath: result.filePath,
          caption: "",
          isPrivate: false,
          order: escort.gallery.length,
        };

        escort.gallery.push(mediaItem);
        uploadedFiles.push(mediaItem);

        // No local cleanup needed with memory storage
      } catch (uploadError) {
        console.error(
          "Railway storage upload error for file:",
          file.originalname,
          uploadError
        );
        // Continue with other files even if one fails
      }
    }

    await escort.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escort: { gallery: escort.gallery },
          uploadedFiles,
          currentCount: escort.gallery.length,
        },
        "Gallery uploaded successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Upload videos for escort
 * POST /api/escort/video/:id
 */
export const uploadVideo = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id !== userId) {
      throw new ApiError(403, "You can only upload to your own profile");
    }

    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "Video files are required");
    }

    // If upload.any() was used, filter videos by mimetype
    const videoFiles = (req.files || []).filter((f) =>
      (f.mimetype || "").startsWith("video/")
    );
    const filesToProcess = videoFiles.length > 0 ? videoFiles : req.files;

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Check upload limits
    const canUpload = escort.canUploadMedia("video", escort.videos.length);
    if (!canUpload) {
      const limit = escort.subscriptionTier === "verified" ? 10 : 5;
      throw new ApiError(
        403,
        `Video upload limit reached. You can upload up to ${limit} videos with your current subscription.`
      );
    }

    const uploadedFiles = [];

    for (const file of filesToProcess) {
      try {
        console.log("Attempting to upload file:", file.originalname);
        console.log("File size:", file.size);

        // Upload to Firebase storage
        const result = await firebaseStorage.uploadFile(file, "video");

        if (!result.success) {
          throw new Error(`Failed to upload file: ${result.error}`);
        }

        console.log("Railway storage upload successful:", result.publicId);

        // Add to videos
        const mediaItem = {
          url: result.url,
          publicId: result.publicId,
          filePath: result.filePath,
          caption: "",
          type: "gallery",
          isPrivate: false,
        };

        escort.videos.push(mediaItem);
        uploadedFiles.push(mediaItem);

        // No local cleanup needed with memory storage
      } catch (uploadError) {
        console.error(
          "Railway storage upload error for file:",
          file.originalname,
          uploadError
        );
        // Continue with other files even if one fails
      }
    }

    // Check if any files were successfully uploaded
    if (uploadedFiles.length === 0) {
      throw new ApiError(500, "Failed to upload any videos. Please try again.");
    }

    await escort.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escort: { videos: escort.videos },
          uploadedFiles,
          currentCount: escort.videos.length,
        },
        "Videos uploaded successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Get escort's subscription status and benefits
 * GET /api/escort/subscription
 */
export const getEscortSubscription = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Get active subscription
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    const benefits = escort.getSubscriptionBenefits();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          subscriptionTier: escort.subscriptionTier || "basic",
          subscriptionStatus: escort.subscriptionStatus || "active",
          benefits,
          subscription: subscription || null,
          profileCompletion: escort.profileCompletion,
          isAgeVerified: escort.isAgeVerified,
          mediaCounts: {
            photos: escort.gallery.length,
            videos: escort.videos.length,
          },
        },
        "Subscription information retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Get escort's profile completion status
 * GET /api/escort/profile-completion
 */
export const getProfileCompletion = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    const requiredFields = [
      "name",
      "alias",
      "email",
      "phone",
      "age",
      "gender",
      "location.city",
      "location.country",
      "services",
      "rates.hourly",
      "gallery",
    ];

    const completionStatus = requiredFields.map((field) => {
      const value = escort.get(field);
      const isComplete =
        value && (Array.isArray(value) ? value.length > 0 : value);
      return {
        field,
        isComplete,
        value: isComplete ? "✓" : "✗",
      };
    });

    const completedFields = completionStatus.filter(
      (field) => field.isComplete
    ).length;
    const completionPercentage = Math.round(
      (completedFields / requiredFields.length) * 100
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          completionPercentage,
          completedFields,
          totalFields: requiredFields.length,
          fields: completionStatus,
          isProfileComplete: escort.isProfileComplete(),
          missingFields: completionStatus
            .filter((field) => !field.isComplete)
            .map((field) => field.field),
        },
        "Profile completion status retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Search escorts with advanced filters
 * GET /api/escort/search
 */
export const searchEscorts = asyncHandler(async (req, res, next) => {
  try {
    const {
      query,
      city,
      country,
      ageRange,
      bodyType,
      services,
      priceRange,
      availability,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build search filter
    const filter = {
      role: "escort",
      isActive: true,
    };

    // Text search
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { alias: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { services: { $regex: query, $options: "i" } },
      ];
    }

    // Location filters
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (country)
      filter["location.country"] = { $regex: country, $options: "i" };

    // Age range filter
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split("-").map(Number);
      filter.age = { $gte: minAge, $lte: maxAge };
    }

    // Body type filter
    if (bodyType) filter.bodyType = bodyType;

    // Services filter
    if (services) {
      const serviceArray = services.split(",");
      filter["services"] = { $in: serviceArray };
    }

    // Price range filter
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      filter["rates.hourly"] = { $gte: minPrice, $lte: maxPrice };
    }

    // Availability filter
    if (availability) {
      filter[`availability.${availability}`] = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get escorts with pagination
    const escorts = await User.find(filter)
      .select(
        "name alias age location gender rates services gallery stats subscriptionTier isVerified isAgeVerified profileCompletion"
      )
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    // Add subscription benefits to each escort
    const escortsWithBenefits = escorts.map((escort) => {
      const benefits = escort.getSubscriptionBenefits();
      return {
        ...escort.toObject(),
        benefits,
        subscriptionTier: escort.subscriptionTier || "basic",
      };
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escorts: escortsWithBenefits,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          filters: {
            query,
            city,
            country,
            ageRange,
            bodyType,
            services,
            priceRange,
            availability,
          },
        },
        "Search results retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Create escort profile
 * POST /api/escort/create
 */
export const createEscortProfile = asyncHandler(async (req, res, next) => {
  try {
    console.log("=== CREATE ESCORT PROFILE DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("req.user:", req.user);

    const userId = req.user._id;

    // Only clients can convert to escort
    const requester = await User.findById(userId).select("role");
    if (!requester) {
      throw new ApiError(404, "User not found");
    }
    if (requester.role !== "client") {
      throw new ApiError(403, "Only clients can join as escorts");
    }

    // Check if user already has an escort profile
    const existingEscort = await User.findOne({ _id: userId, role: "escort" });
    if (existingEscort) {
      throw new ApiError(400, "Escort profile already exists");
    }

    // Extract data from request
    const {
      name,
      alias,
      email,
      phone,
      age,
      gender,
      country,
      city,
      subLocation,
      services,
      hourlyRate,
      isStandardPricing,
    } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !country || !city || !hourlyRate) {
      throw new ApiError(400, "Missing required fields");
    }

    // Parse services if it's a string
    const servicesArray =
      typeof services === "string" ? JSON.parse(services) : services;

    // Handle file uploads
    const gallery = [];
    if (req.files && req.files.gallery) {
      const files = Array.isArray(req.files.gallery)
        ? req.files.gallery
        : [req.files.gallery];

      for (const file of files) {
        try {
          // Upload to Firebase storage
          const result = await firebaseStorage.uploadFile(file, "gallery");

          if (!result.success) {
            throw new Error(`Upload failed: ${result.error}`);
          }

          gallery.push({
            url: result.url,
            publicId: result.publicId,
            caption: "",
            isPrivate: false,
            order: gallery.length,
          });

          // Clean up local file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("Railway storage upload error:", uploadError);
          // If upload fails, use local file path as fallback
          gallery.push({
            url: file.path,
            publicId: `local-${Date.now()}`,
            caption: "",
            isPrivate: false,
            order: gallery.length,
          });
        }
      }
    }

    // Handle ID document upload
    let idDocumentUrl = null;
    if (req.files && req.files.idDocument) {
      const file = req.files.idDocument;
      try {
        const result = await railwayStorage.uploadFile(file, "documents");

        if (!result.success) {
          throw new Error(`Upload failed: ${result.error}`);
        }

        idDocumentUrl = result.url;

        // Clean up local file
        fs.unlinkSync(file.path);
      } catch (uploadError) {
        console.error("ID document upload error:", uploadError);
        // If upload fails, use local file path as fallback
        idDocumentUrl = file.path;
      }
    }

    // Update user with escort profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role: "escort",
        name,
        alias,
        email,
        phone,
        age: parseInt(age),
        gender,
        location: {
          country,
          city,
          subLocation,
          // Only set coordinates if provided
          ...(req.body.latitude &&
            req.body.longitude && {
              coordinates: {
                type: "Point",
                coordinates: [
                  parseFloat(req.body.longitude),
                  parseFloat(req.body.latitude),
                ],
              },
            }),
        },
        services: servicesArray,
        rates: {
          hourly: parseFloat(hourlyRate),
          isStandardPricing: isStandardPricing === "true",
          currency: "USD", // Default currency
        },
        gallery,
        idDocument: idDocumentUrl,
        isAgeVerified: !!idDocumentUrl, // Set to true if ID document is uploaded
        subscriptionTier: "basic",
        subscriptionStatus: "active",
        isActive: true,
        isAvailable: true,
        stats: {
          views: 0,
          favorites: 0,
          reviews: 0,
          rating: 0,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(500, "Failed to update user profile");
    }

    // Ensure password is not returned
    const userObject = updatedUser.toObject({ getters: true });
    delete userObject.password;

    // Issue a fresh JWT reflecting updated role
    const token = generateToken({
      _id: userObject._id,
      name: userObject.name,
      email: userObject.email,
      role: userObject.role,
    });

    // Set secure cookie (mirrors auth controller behavior)
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return consistent shape with user and token
    return res.status(201).json({
      success: true,
      user: userObject,
      token,
      message: "Escort profile created successfully",
    });
  } catch (error) {
    console.error("Escort profile creation error:", error);
    next(error);
  }
});

/**
 * Update escort featured status (Admin only)
 * PUT /api/escort/featured/:id
 */
export const updateEscortFeaturedStatus = asyncHandler(
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      // Validate ID parameter
      if (!id || id === "undefined") {
        throw new ApiError(400, "Invalid escort ID");
      }

      // Check if user is admin (you can add admin middleware here)
      // For now, we'll allow this endpoint to be called

      const escort = await User.findOneAndUpdate(
        { _id: id, role: "escort" },
        { isFeatured: isFeatured },
        { new: true }
      ).select("-password");

      if (!escort) {
        throw new ApiError(404, "Escort not found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { escort },
            `Escort featured status updated to ${isFeatured}`
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get escort statistics for dashboard
 * GET /api/escort/stats/:id
 */
export const getEscortStats = asyncHandler(async (req, res, next) => {
  try {
    const { escortId, id } = req.params;
    const finalId = escortId || id;

    // Validate ID parameter
    if (!finalId || finalId === "undefined") {
      throw new ApiError(400, "Invalid escort ID");
    }

    // Check if escort exists
    const escort = await User.findOne({ _id: finalId, role: "escort" });
    if (!escort) {
      throw new ApiError(404, "Escort not found");
    }

    // Get current month for earnings calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate statistics
    const [
      totalMessages,
      totalBookings,
      totalReviews,
      totalFavorites,
      monthlyEarnings,
      averageRating,
    ] = await Promise.all([
      // Total messages received
      Message.countDocuments({ recipient: finalId }),

      // Total bookings
      Booking.countDocuments({ escortId: finalId }),

      // Total reviews
      Review.countDocuments({ escort: finalId }),

      // Total favorites
      Favorite.countDocuments({ escort: finalId }),

      // Monthly earnings (from completed bookings)
      Booking.aggregate([
        {
          $match: {
            escortId: new mongoose.Types.ObjectId(finalId),
            status: "completed",
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      // Average rating
      Review.aggregate([
        {
          $match: { escort: new mongoose.Types.ObjectId(finalId) },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    // Extract values from aggregation results
    const earnings = monthlyEarnings[0]?.total || 0;
    const rating = averageRating[0]?.averageRating || 0;

    // Get profile views from escort stats
    const profileViews = escort.stats?.views || 0;

    const stats = {
      profileViews,
      messages: totalMessages,
      bookings: totalBookings,
      favorites: totalFavorites,
      reviews: totalReviews,
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
      earnings: Math.round(earnings * 100) / 100, // Round to 2 decimal places
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { stats },
          "Escort statistics retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching escort stats:", error);
    next(error);
  }
});

/**
 * Get individual escort statistics with growth metrics
 * GET /api/escort/stats/:escortId
 */
export const getIndividualEscortStats = asyncHandler(async (req, res, next) => {
  try {
    const { escortId } = req.params;

    // Get current month and last month dates
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get escort data
    const escort = await User.findById(escortId).lean();
    if (!escort) {
      throw new ApiError(404, "Escort not found");
    }

    // Get current month stats
    const currentMonthStats = await Promise.all([
      // Profile views (from stats field)
      Promise.resolve(escort.stats?.views || 0),

      // Messages received this month
      Message.countDocuments({
        recipient: escortId,
        createdAt: { $gte: currentMonth },
      }),

      // Bookings this month
      Booking.countDocuments({
        escort: escortId,
        createdAt: { $gte: currentMonth },
      }),

      // Revenue this month (sum of booking amounts)
      Booking.aggregate([
        {
          $match: {
            escort: new mongoose.Types.ObjectId(escortId),
            createdAt: { $gte: currentMonth },
            status: { $in: ["completed", "confirmed"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]).then((result) => result[0]?.total || 0),
    ]);

    // Get last month stats for growth calculation
    const lastMonthStats = await Promise.all([
      // Profile views last month (approximate)
      Promise.resolve(Math.floor((escort.stats?.views || 0) * 0.8)), // Estimate

      // Messages received last month
      Message.countDocuments({
        recipient: escortId,
        createdAt: { $gte: lastMonth, $lt: currentMonth },
      }),

      // Bookings last month
      Booking.countDocuments({
        escort: escortId,
        createdAt: { $gte: lastMonth, $lt: currentMonth },
      }),

      // Revenue last month
      Booking.aggregate([
        {
          $match: {
            escort: new mongoose.Types.ObjectId(escortId),
            createdAt: { $gte: lastMonth, $lt: currentMonth },
            status: { $in: ["completed", "confirmed"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]).then((result) => result[0]?.total || 0),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      profileViews: currentMonthStats[0],
      profileViewsGrowth: calculateGrowth(
        currentMonthStats[0],
        lastMonthStats[0]
      ),
      messages: currentMonthStats[1],
      messagesGrowth: calculateGrowth(currentMonthStats[1], lastMonthStats[1]),
      bookings: currentMonthStats[2],
      bookingsGrowth: calculateGrowth(currentMonthStats[2], lastMonthStats[2]),
      revenue: currentMonthStats[3],
      revenueGrowth: calculateGrowth(currentMonthStats[3], lastMonthStats[3]),
      // Additional stats
      totalViews: escort.stats?.views || 0,
      totalFavorites: escort.stats?.favorites || 0,
      totalReviews: escort.stats?.reviews || 0,
      averageRating: escort.stats?.rating || 0,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { stats },
          "Individual escort statistics retrieved successfully"
        )
      );
  } catch (error) {
    next(error);
  }
});

/**
 * Delete gallery image for escort
 * DELETE /api/escort/gallery/:id/:imageId
 */
export const deleteGalleryImage = asyncHandler(async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user._id;

    if (id !== userId) {
      throw new ApiError(403, "You can only delete from your own profile");
    }

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Find the image in gallery
    const imageIndex = escort.gallery.findIndex(
      (img) => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      throw new ApiError(404, "Image not found in gallery");
    }

    const image = escort.gallery[imageIndex];

    // Delete from Railway storage if filePath exists
    if (image.filePath) {
      try {
        await railwayStorage.deleteFile(image.filePath);
      } catch (deleteError) {
        console.error("Railway storage delete error:", deleteError);
        // Continue even if delete fails
      }
    }

    // Remove from gallery array
    escort.gallery.splice(imageIndex, 1);

    // Reorder remaining images
    escort.gallery.forEach((img, index) => {
      img.order = index;
    });

    await escort.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escort: { gallery: escort.gallery },
          deletedImage: image,
        },
        "Gallery image deleted successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Delete video for escort
 * DELETE /api/escort/video/:id/:videoId
 */
export const deleteVideo = asyncHandler(async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;

    if (id !== userId) {
      throw new ApiError(403, "You can only delete from your own profile");
    }

    const escort = await User.findById(userId);
    if (!escort || escort.role !== "escort") {
      throw new ApiError(404, "Escort not found");
    }

    // Find the video in videos array
    const videoIndex = escort.videos.findIndex(
      (video) =>
        (video._id && video._id.toString() === videoId) ||
        videoId === escort.videos.indexOf(video).toString()
    );

    if (videoIndex === -1) {
      throw new ApiError(404, "Video not found");
    }

    const video = escort.videos[videoIndex];

    // Delete from Railway storage if filePath exists
    if (video.filePath) {
      try {
        await railwayStorage.deleteFile(video.filePath);
      } catch (deleteError) {
        console.error("Railway storage delete error:", deleteError);
        // Continue even if delete fails
      }
    }

    // Remove from videos array
    escort.videos.splice(videoIndex, 1);

    await escort.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escort: { videos: escort.videos },
          deletedVideo: video,
        },
        "Video deleted successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});
