import mongoose from "mongoose";

// Advanced database optimization utilities for unlimited scalability
export const createDatabaseIndexes = async () => {
  try {
    console.log(
      "🔧 Creating advanced database indexes for unlimited performance..."
    );

    // User collection - Comprehensive indexes for escort queries
    await mongoose.connection.db
      .collection("users")
      .createIndex({ email: 1 }, { unique: true, background: true });

    // Compound indexes for escort filtering (most common queries)
    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, isActive: 1, isAvailable: 1 },
        { background: true, name: "escort_availability" }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, "location.country": 1, "location.city": 1, isActive: 1 },
        { background: true, name: "escort_location" }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, age: 1, isAgeVerified: 1, isActive: 1 },
        { background: true, name: "escort_age" }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, services: 1, isActive: 1, isAvailable: 1 },
        { background: true, name: "escort_services" }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, "rates.hourly": 1, isActive: 1 },
        { background: true, name: "escort_pricing" }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, subscriptionTier: 1, lastActive: 1, isActive: 1 },
        { background: true, name: "escort_subscription" }
      );

    // Featured and online status indexes
    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, isFeatured: 1, isActive: 1, lastActive: 1 },
        { background: true, name: "escort_featured" }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, lastActive: 1, isActive: 1 },
        { background: true, name: "escort_online" }
      );

    // Text search indexes for fast search
    await mongoose.connection.db.collection("users").createIndex(
      {
        name: "text",
        alias: "text",
        bio: "text",
        "location.city": "text",
        services: "text",
      },
      {
        background: true,
        name: "escort_text_search",
        weights: {
          name: 10,
          alias: 8,
          bio: 5,
          "location.city": 7,
          services: 6,
        },
      }
    );

    // Geospatial index for location-based queries
    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { "location.coordinates": "2dsphere" },
        { background: true, sparse: true, name: "escort_geospatial" }
      );

    // Review collection indexes
    await mongoose.connection.db
      .collection("reviews")
      .createIndex(
        { escortId: 1, rating: 1, createdAt: -1 },
        { background: true, name: "review_escort_rating" }
      );

    await mongoose.connection.db
      .collection("reviews")
      .createIndex(
        { userId: 1, createdAt: -1 },
        { background: true, name: "review_user" }
      );

    // Favorite collection indexes
    await mongoose.connection.db
      .collection("favorites")
      .createIndex(
        { userId: 1, escortId: 1 },
        { background: true, unique: true, name: "favorite_unique" }
      );

    await mongoose.connection.db
      .collection("favorites")
      .createIndex(
        { userId: 1, createdAt: -1 },
        { background: true, name: "favorite_user" }
      );

    // Message collection indexes
    await mongoose.connection.db
      .collection("messages")
      .createIndex(
        { conversationId: 1, createdAt: -1 },
        { background: true, name: "message_conversation" }
      );

    await mongoose.connection.db
      .collection("messages")
      .createIndex(
        { senderId: 1, receiverId: 1, createdAt: -1 },
        { background: true, name: "message_participants" }
      );

    // Booking collection indexes
    await mongoose.connection.db
      .collection("bookings")
      .createIndex(
        { userId: 1, escortId: 1, status: 1, date: 1 },
        { background: true, name: "booking_user_escort" }
      );

    await mongoose.connection.db
      .collection("bookings")
      .createIndex(
        { escortId: 1, status: 1, date: 1 },
        { background: true, name: "booking_escort_status" }
      );

    // Subscription collection indexes
    await mongoose.connection.db
      .collection("subscriptions")
      .createIndex(
        { userId: 1, status: 1, tier: 1 },
        { background: true, name: "subscription_user_status" }
      );

    await mongoose.connection.db
      .collection("subscriptions")
      .createIndex(
        { status: 1, "payment.nextBillingDate": 1 },
        { background: true, name: "subscription_billing" }
      );

    // Blog collection indexes
    await mongoose.connection.db
      .collection("blogs")
      .createIndex(
        { category: 1, isPublished: 1, createdAt: -1 },
        { background: true, name: "blog_category_published" }
      );

    await mongoose.connection.db.collection("blogs").createIndex(
      { title: "text", content: "text", tags: "text" },
      {
        background: true,
        name: "blog_text_search",
        weights: {
          title: 10,
          content: 5,
          tags: 8,
        },
      }
    );

    console.log("✅ Advanced database indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating database indexes:", error);
  }
};

// Database connection optimization for unlimited scalability
export const optimizeDatabaseConnection = async () => {
  try {
    // Optimize connection settings
    mongoose.set("debug", false); // Disable debug mode in production
    mongoose.set("strictQuery", false);

    // Connection pool optimization
    const connectionOptions = {
      maxPoolSize: 50, // Increased for unlimited scalability
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      // Enable read preferences for better performance
      readPreference: "secondaryPreferred",
      // Enable write concern for data consistency
      writeConcern: { w: 1, j: false },
      // Enable retry writes for better reliability
      retryWrites: true,
      // Enable compression for network efficiency
      compressors: ["zlib"],
      zlibCompressionLevel: 6,
    };

    // Apply connection options
    mongoose.connection.on("connected", () => {
      console.log("🚀 MongoDB connected with optimized settings");
      console.log(`📊 Connection pool size: ${connectionOptions.maxPoolSize}`);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    // Monitor connection pool
    setInterval(() => {
      const poolStatus = mongoose.connection.pool?.status();
      if (poolStatus) {
        console.log(`📊 Connection pool status: ${JSON.stringify(poolStatus)}`);
      }
    }, 60000); // Check every minute

    return connectionOptions;
  } catch (error) {
    console.error("❌ Error optimizing database connection:", error);
    process.exit(1);
  }
};

// Advanced query optimization helpers
export const optimizeQuery = (query, options = {}) => {
  const optimizedQuery = { ...query };
  const optimizedOptions = { ...options };

  // Always use lean() for read operations (faster, less memory)
  if (options.lean !== false) {
    optimizedOptions.lean = true;
  }

  // Selective field projection for better performance
  if (!options.select) {
    optimizedOptions.select =
      "-__v -createdAt -updatedAt -password -refreshToken";
  }

  // Add pagination limits for safety
  if (!options.limit && options.limit !== 0) {
    optimizedOptions.limit = 100;
  }

  // Enable query caching hints
  optimizedOptions.hint = getQueryHint(optimizedQuery);

  return { query: optimizedQuery, options: optimizedOptions };
};

// Get optimal query hint based on query structure
const getQueryHint = (query) => {
  if (query.role === "escort" && query.isActive) {
    if (query["location.country"]) return "escort_location";
    if (query.age) return "escort_age";
    if (query.services) return "escort_services";
    if (query["rates.hourly"]) return "escort_pricing";
    if (query.isFeatured) return "escort_featured";
    if (query.lastActive) return "escort_online";
    return "escort_availability";
  }
  return null;
};

// Advanced pagination helper with performance optimization
export const createPagination = (page = 1, limit = 20, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
    maxLimit,
  };
};

// Batch query optimization for multiple operations
export const batchQuery = async (queries, batchSize = 100) => {
  const results = [];

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((query) => query.exec()));
    results.push(...batchResults);
  }

  return results;
};

// Query performance monitoring
export const monitorQueryPerformance = (query, startTime) => {
  const duration = Date.now() - startTime;

  if (duration > 100) {
    console.warn(`🐌 Slow query detected: ${duration}ms`);
    console.log("Query:", JSON.stringify(query.getQuery()));
    console.log("Collection:", query.mongooseCollection.name);
  }

  return duration;
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    const status = mongoose.connection.readyState;
    const poolStatus = mongoose.connection.pool?.status();

    const health = {
      status: status === 1 ? "connected" : "disconnected",
      readyState: status,
      poolStatus,
      timestamp: new Date().toISOString(),
    };

    // Check connection pool health
    if (poolStatus) {
      health.poolHealthy = poolStatus.available >= 5;
      health.availableConnections = poolStatus.available;
      health.totalConnections = poolStatus.total;
    }

    return health;
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Performance recommendations
export const getPerformanceRecommendations = () => {
  return [
    {
      category: "Indexing",
      recommendations: [
        "Use compound indexes for multi-field queries",
        "Create text indexes for search functionality",
        "Use sparse indexes for optional fields",
        "Monitor index usage with explain()",
      ],
    },
    {
      category: "Query Optimization",
      recommendations: [
        "Use lean() for read-only operations",
        "Project only required fields",
        "Use pagination for large result sets",
        "Implement query result caching",
      ],
    },
    {
      category: "Connection Management",
      recommendations: [
        "Optimize connection pool size",
        "Use read preferences for read operations",
        "Enable compression for network efficiency",
        "Monitor connection pool health",
      ],
    },
  ];
};
