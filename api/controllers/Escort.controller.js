import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import cloudinary from "../config/cloudinary.js";
import config from "../config/env.js";
import { generateToken } from "../utils/security.js";
import fs from "fs";
import mongoose from "mongoose";

/**
 * Get all escorts with filtering and pagination
 * GET /api/escort/all
 */
export const getAllEscorts = asyncHandler(async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      q, // Search query
      city,
      country,
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

    // Build filter object
    const filter = {
      role: "escort",
      isActive: true,
    };

    // Search query - use regex search for better compatibility
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { alias: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
        { services: { $regex: q, $options: "i" } },
      ];
    }

    // Location filters
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (country) filter["location.country"] = { $regex: country, $options: "i" };

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

    // Online status filter (placeholder - will be implemented later)
    if (online === "true") {
      // For now, we'll filter by last active time (within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      filter.lastActive = { $gte: thirtyMinutesAgo };
    }

    // Featured filter
    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Build sort object
    const sort = {};
    if (sortBy === "relevance" && q) {
      // For regex search, sort by name similarity or keep default order
      sort.name = 1;
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

    // Get escorts with pagination
    const escorts = await User.find(filter)
      .select(
        "name alias age location gender rates services gallery stats subscriptionTier isVerified isAgeVerified profileCompletion isFeatured isActive phone bio ethnicity bodyType lastActive profileViews rating reviewCount"
      )
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    // Add subscription benefits and online status to each escort
    const escortsWithBenefits = escorts.map((escort) => {
      const benefits = escort.getSubscriptionBenefits();

      // Parse services if it's a string
      let services = escort.services;
      if (typeof services === "string") {
        try {
          services = JSON.parse(services);
        } catch (e) {
          // If parsing fails, split by comma or space
          services = services.split(/[,\s]+/).filter((s) => s.trim());
        }
      }

      // Calculate online status (active within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const isOnline = escort.lastActive && escort.lastActive >= thirtyMinutesAgo;

      return {
        ...escort.toObject(),
        services,
        benefits,
        subscriptionTier: escort.subscriptionTier || "free",
        isOnline,
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
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        "Escorts retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

/**
 * Get escort by ID
 * GET /api/escort/:id
 */
export const getEscortById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

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
      escort = await User.findOne({
        $or: [
          { alias: id, role: "escort", isActive: true },
          { name: id, role: "escort", isActive: true },
        ],
      }).select("-password");
    }

    if (!escort) {
      throw new ApiError(404, "Escort not found");
    }

    // Increment view count
    escort.stats.views += 1;
    await escort.save();

    // Get subscription benefits
    const benefits = escort.getSubscriptionBenefits();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          escort: {
            ...escort.toObject(),
            benefits,
            subscriptionTier: escort.subscriptionTier || "free",
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
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(mediaFile.path, {
        folder: mediaType === "photo" ? "escort-gallery" : "escort-videos",
        resource_type: "auto",
      });

      // Add media to escort's gallery or videos
      const mediaItem = {
        url: result.secure_url,
        publicId: result.public_id,
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

      // Clean up local file
      fs.unlinkSync(mediaFile.path);

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
      console.error("Cloudinary upload error:", uploadError);
      throw new ApiError(500, "Failed to upload media to cloud storage");
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

    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "escort-gallery",
          resource_type: "auto",
        });

        // Add to gallery
        const mediaItem = {
          url: result.secure_url,
          publicId: result.public_id,
          caption: "",
          isPrivate: false,
          order: escort.gallery.length,
        };

        escort.gallery.push(mediaItem);
        uploadedFiles.push(mediaItem);

        // Clean up local file
        fs.unlinkSync(file.path);
      } catch (uploadError) {
        console.error(
          "Cloudinary upload error for file:",
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
        // Continue with other files even if one fails
      }
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
          subscriptionTier: escort.subscriptionTier || "free",
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
        subscriptionTier: escort.subscriptionTier || "free",
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
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "escort-gallery",
            resource_type: "auto",
          });

          gallery.push({
            url: result.secure_url,
            publicId: result.public_id,
            caption: "",
            isPrivate: false,
            order: gallery.length,
          });

          // Clean up local file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          // If Cloudinary fails, use local file path as fallback
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
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "id-documents",
          resource_type: "auto",
        });
        idDocumentUrl = result.secure_url;

        // Clean up local file
        fs.unlinkSync(file.path);
      } catch (uploadError) {
        console.error("ID document upload error:", uploadError);
        // If Cloudinary fails, use local file path as fallback
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
        subscriptionTier: "free",
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
