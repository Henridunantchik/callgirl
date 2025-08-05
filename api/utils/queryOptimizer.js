import { ApiError } from "./ApiError.js";

// Pagination helper
const createPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit),
    page: parseInt(page),
  };
};

// Sort helper
const createSort = (sortBy = "createdAt", sortOrder = "desc") => {
  const order = sortOrder === "asc" ? 1 : -1;
  return { [sortBy]: order };
};

// Filter helper for escort queries
const createEscortFilters = (filters = {}) => {
  const query = { role: "escort", isActive: true };

  if (filters.location) {
    query["location.city"] = { $regex: filters.location, $options: "i" };
  }

  if (filters.age) {
    const [minAge, maxAge] = filters.age.split("-").map(Number);
    query.age = { $gte: minAge, $lte: maxAge };
  }

  if (filters.services && filters.services.length > 0) {
    query.services = { $in: filters.services };
  }

  if (filters.subscriptionTier) {
    query.subscriptionTier = filters.subscriptionTier;
  }

  if (filters.isAgeVerified !== undefined) {
    query.isAgeVerified = filters.isAgeVerified;
  }

  if (filters.isProfileComplete !== undefined) {
    query.isProfileComplete = filters.isProfileComplete;
  }

  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);
    query["rates.hourly"] = { $gte: minPrice, $lte: maxPrice };
  }

  return query;
};

// Search helper with text indexing
const createSearchQuery = (
  searchTerm,
  fields = ["name", "bio", "location.city"]
) => {
  if (!searchTerm) return {};

  const searchRegex = { $regex: searchTerm, $options: "i" };
  const searchConditions = fields.map((field) => ({ [field]: searchRegex }));

  return { $or: searchConditions };
};

// Aggregation pipeline for escort statistics
const createEscortStatsPipeline = (filters = {}) => {
  const matchStage = createEscortFilters(filters);

  return [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        averageAge: { $avg: "$age" },
        averagePrice: { $avg: "$rates.hourly" },
        verifiedCount: {
          $sum: { $cond: ["$isAgeVerified", 1, 0] },
        },
        premiumCount: {
          $sum: {
            $cond: [{ $in: ["$subscriptionTier", ["premium", "elite"]] }, 1, 0],
          },
        },
        locationStats: {
          $push: "$location.city",
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        averageAge: { $round: ["$averageAge", 1] },
        averagePrice: { $round: ["$averagePrice", 2] },
        verifiedCount: 1,
        premiumCount: 1,
        locationStats: 1,
      },
    },
  ];
};

// Optimized escort list query
const createOptimizedEscortQuery = (
  filters = {},
  pagination = {},
  sort = {}
) => {
  const query = createEscortFilters(filters);
  const { skip, limit } = createPagination(pagination.page, pagination.limit);
  const sortOptions = createSort(sort.sortBy, sort.sortOrder);

  return {
    query,
    options: {
      skip,
      limit,
      sort: sortOptions,
      select:
        "name email age location services rates gallery subscriptionTier isAgeVerified profileCompletion lastActive",
      lean: true, // Return plain JavaScript objects instead of Mongoose documents
    },
  };
};

// Subscription analytics pipeline
const createSubscriptionAnalyticsPipeline = (dateRange = {}) => {
  const matchStage = { role: "escort" };

  if (dateRange.startDate) {
    matchStage.createdAt = { $gte: new Date(dateRange.startDate) };
  }

  if (dateRange.endDate) {
    matchStage.createdAt = {
      ...matchStage.createdAt,
      $lte: new Date(dateRange.endDate),
    };
  }

  return [
    { $match: matchStage },
    {
      $group: {
        _id: "$subscriptionTier",
        count: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $in: ["$subscriptionTier", ["verified", "premium", "elite"]] },
              "$subscriptionTier",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        tier: "$_id",
        count: 1,
        percentage: {
          $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
        },
      },
    },
    { $sort: { count: -1 } },
  ];
};

// Performance monitoring
const createPerformanceQuery = (operation, startTime) => {
  const duration = Date.now() - startTime;

  return {
    operation,
    duration,
    timestamp: new Date(),
    performance:
      duration < 100 ? "excellent" : duration < 500 ? "good" : "slow",
  };
};

// Index recommendations
const getIndexRecommendations = () => {
  return [
    // User indexes
    { collection: "users", fields: { email: 1 }, unique: true },
    { collection: "users", fields: { role: 1, isActive: 1 } },
    {
      collection: "users",
      fields: { subscriptionTier: 1, subscriptionStatus: 1 },
    },

    // Escort-specific indexes
    {
      collection: "users",
      fields: { role: 1, "location.city": 1, isActive: 1 },
    },
    { collection: "users", fields: { role: 1, age: 1, isAgeVerified: 1 } },
    { collection: "users", fields: { role: 1, services: 1, isActive: 1 } },
    {
      collection: "users",
      fields: { role: 1, "rates.hourly": 1, isActive: 1 },
    },
    {
      collection: "users",
      fields: { role: 1, subscriptionTier: 1, lastActive: 1 },
    },

    // Search indexes
    {
      collection: "users",
      fields: { name: "text", bio: "text", "location.city": "text" },
    },

    // Subscription indexes
    { collection: "subscriptions", fields: { userId: 1 } },
    { collection: "subscriptions", fields: { status: 1, tier: 1 } },
    { collection: "subscriptions", fields: { "payment.nextBillingDate": 1 } },

    // Booking indexes
    { collection: "bookings", fields: { userId: 1, escortId: 1 } },
    { collection: "bookings", fields: { status: 1, date: 1 } },

    // Review indexes
    { collection: "reviews", fields: { escortId: 1, rating: 1 } },
    { collection: "reviews", fields: { userId: 1, createdAt: 1 } },
  ];
};

// Query validation
const validateQuery = (query, allowedFields = []) => {
  const invalidFields = Object.keys(query).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new ApiError(
      400,
      `Invalid query fields: ${invalidFields.join(", ")}`
    );
  }

  return true;
};

// Rate limiting for expensive queries
const createQueryRateLimit = (maxQueries = 100, windowMs = 60000) => {
  const queryCounts = new Map();

  return (userId) => {
    const now = Date.now();
    const userQueries = queryCounts.get(userId) || [];

    // Remove old queries outside the window
    const recentQueries = userQueries.filter((time) => now - time < windowMs);

    if (recentQueries.length >= maxQueries) {
      throw new ApiError(429, "Too many queries. Please try again later.");
    }

    recentQueries.push(now);
    queryCounts.set(userId, recentQueries);

    return true;
  };
};

export {
  createPagination,
  createSort,
  createEscortFilters,
  createSearchQuery,
  createEscortStatsPipeline,
  createOptimizedEscortQuery,
  createSubscriptionAnalyticsPipeline,
  createPerformanceQuery,
  getIndexRecommendations,
  validateQuery,
  createQueryRateLimit,
};
