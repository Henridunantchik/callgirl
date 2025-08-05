import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import {
  cacheEscortList,
  invalidateEscortCache,
  cacheQuery,
} from "../utils/cache.js";
import {
  createOptimizedEscortQuery,
  createEscortStatsPipeline,
  createPerformanceQuery,
  createPagination,
  createSort,
} from "../utils/queryOptimizer.js";

// Get all escorts with optimization
const getAllEscorts = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // Extract query parameters
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    location,
    age,
    services,
    subscriptionTier,
    isAgeVerified,
    isProfileComplete,
    priceRange,
    search,
  } = req.query;

  // Create filters
  const filters = {
    location,
    age,
    services: services ? services.split(",") : undefined,
    subscriptionTier,
    isAgeVerified: isAgeVerified === "true",
    isProfileComplete: isProfileComplete === "true",
    priceRange,
  };

  // Create cache key
  const cacheKey = `escorts_${JSON.stringify({
    filters,
    page,
    limit,
    sortBy,
    sortOrder,
  })}`;

  // Try to get from cache first
  const cachedResult = await cacheQuery(
    cacheKey,
    async () => {
      const { query, options } = createOptimizedEscortQuery(
        filters,
        { page, limit },
        { sortBy, sortOrder }
      );

      // Get total count for pagination
      const total = await User.countDocuments(query);

      // Get escorts with optimization
      const escorts = await User.find(query, options.select, options)
        .lean()
        .exec();

      // Add subscription benefits to each escort
      const escortsWithBenefits = escorts.map((escort) => ({
        ...escort,
        benefits: escort.getSubscriptionBenefits
          ? escort.getSubscriptionBenefits()
          : null,
      }));

      return {
        escorts: escortsWithBenefits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    },
    300
  ); // Cache for 5 minutes

  // Log performance
  const performance = createPerformanceQuery("getAllEscorts", startTime);
  console.log(
    `Performance: ${performance.operation} - ${performance.duration}ms (${performance.performance})`
  );

  res
    .status(200)
    .json(new ApiResponse(200, cachedResult, "Escorts retrieved successfully"));
});

// Get escort by ID with caching
const getEscortById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();

  const cacheKey = `escort_${id}`;

  const escort = await cacheQuery(
    cacheKey,
    async () => {
      const escortData = await User.findById(id)
        .select("-password")
        .lean()
        .exec();

      if (!escortData) {
        throw new ApiError(404, "Escort not found");
      }

      // Increment view count (non-blocking)
      User.findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
        .exec()
        .catch(console.error);

      return {
        ...escortData,
        benefits: escortData.getSubscriptionBenefits
          ? escortData.getSubscriptionBenefits()
          : null,
      };
    },
    600
  ); // Cache for 10 minutes

  const performance = createPerformanceQuery("getEscortById", startTime);
  console.log(
    `Performance: ${performance.operation} - ${performance.duration}ms (${performance.performance})`
  );

  res
    .status(200)
    .json(new ApiResponse(200, escort, "Escort retrieved successfully"));
});

// Get escort statistics
const getEscortStats = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { location, age, services, subscriptionTier } = req.query;

  const filters = {
    location,
    age,
    services: services ? services.split(",") : undefined,
    subscriptionTier,
  };
  const cacheKey = `escort_stats_${JSON.stringify(filters)}`;

  const stats = await cacheQuery(
    cacheKey,
    async () => {
      const pipeline = createEscortStatsPipeline(filters);
      const result = await User.aggregate(pipeline);
      return (
        result[0] || {
          total: 0,
          averageAge: 0,
          averagePrice: 0,
          verifiedCount: 0,
          premiumCount: 0,
        }
      );
    },
    1800
  ); // Cache for 30 minutes

  const performance = createPerformanceQuery("getEscortStats", startTime);
  console.log(
    `Performance: ${performance.operation} - ${performance.duration}ms (${performance.performance})`
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Escort statistics retrieved successfully")
    );
});

// Search escorts with optimization
const searchEscorts = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const {
    q,
    page = 1,
    limit = 10,
    sortBy = "relevance",
    sortOrder = "desc",
  } = req.query;

  if (!q) {
    throw new ApiError(400, "Search query is required");
  }

  const cacheKey = `search_${q}_${page}_${limit}_${sortBy}_${sortOrder}`;

  const searchResults = await cacheQuery(
    cacheKey,
    async () => {
      const { skip, limit: limitNum } = createPagination(page, limit);
      const sortOptions = createSort(sortBy, sortOrder);

      // Create search query
      const searchQuery = {
        role: "escort",
        isActive: true,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },
          { "location.city": { $regex: q, $options: "i" } },
          { services: { $regex: q, $options: "i" } },
        ],
      };

      const total = await User.countDocuments(searchQuery);
      const escorts = await User.find(searchQuery)
        .select(
          "name email age location services rates gallery subscriptionTier isAgeVerified profileCompletion lastActive"
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec();

      return {
        escorts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    },
    300
  ); // Cache for 5 minutes

  const performance = createPerformanceQuery("searchEscorts", startTime);
  console.log(
    `Performance: ${performance.operation} - ${performance.duration}ms (${performance.performance})`
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        searchResults,
        "Search results retrieved successfully"
      )
    );
});

// Update escort profile with cache invalidation
const updateEscortProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const startTime = Date.now();

  // Validate user can update this profile
  if (req.user._id.toString() !== id && req.user.role !== "admin") {
    throw new ApiError(403, "You can only update your own profile");
  }

  // Get current user
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update only allowed fields
  const allowedFields = [
    "name",
    "bio",
    "age",
    "location",
    "bodyType",
    "height",
    "weight",
    "services",
    "rates",
    "phone",
    "whatsapp",
    "telegram",
    "instagram",
    "twitter",
    "availability",
    "preferences",
    "settings",
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: filteredData },
    { new: true, runValidators: true }
  ).select("-password");

  // Invalidate related cache
  invalidateEscortCache();

  const performance = createPerformanceQuery("updateEscortProfile", startTime);
  console.log(
    `Performance: ${performance.operation} - ${performance.duration}ms (${performance.performance})`
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

// Get escort subscription details
const getEscortSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();

  const cacheKey = `escort_subscription_${id}`;

  const subscriptionData = await cacheQuery(
    cacheKey,
    async () => {
      const user = await User.findById(id)
        .select(
          "subscriptionTier subscriptionStatus profileCompletion isAgeVerified gallery videos"
        )
        .lean()
        .exec();

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return {
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        profileCompletion: user.profileCompletion,
        isAgeVerified: user.isAgeVerified,
        mediaCounts: {
          photos: user.gallery ? user.gallery.length : 0,
          videos: user.videos ? user.videos.length : 0,
        },
        benefits: user.getSubscriptionBenefits
          ? user.getSubscriptionBenefits()
          : null,
      };
    },
    600
  ); // Cache for 10 minutes

  const performance = createPerformanceQuery(
    "getEscortSubscription",
    startTime
  );
  console.log(
    `Performance: ${performance.operation} - ${performance.duration}ms (${performance.performance})`
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptionData,
        "Subscription details retrieved successfully"
      )
    );
});

export {
  getAllEscorts,
  getEscortById,
  getEscortStats,
  searchEscorts,
  updateEscortProfile,
  getEscortSubscription,
};
