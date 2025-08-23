import mongoose from "mongoose";

// Database optimization utilities
export const createDatabaseIndexes = async () => {
  try {
    console.log("🔧 Creating database indexes for performance...");

    // User collection indexes
    await mongoose.connection.db
      .collection("users")
      .createIndex({ email: 1 }, { unique: true, background: true });

    await mongoose.connection.db
      .collection("users")
      .createIndex({ role: 1, isActive: 1 }, { background: true });

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { "location.country": 1, "location.city": 1 },
        { background: true }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex({ role: 1, age: 1, isAgeVerified: 1 }, { background: true });

    await mongoose.connection.db
      .collection("users")
      .createIndex({ role: 1, services: 1, isActive: 1 }, { background: true });

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, "rates.hourly": 1, isActive: 1 },
        { background: true }
      );

    await mongoose.connection.db
      .collection("users")
      .createIndex(
        { role: 1, subscriptionTier: 1, lastActive: 1 },
        { background: true }
      );

    // Text search indexes - check if exists first
    try {
      const existingIndexes = await mongoose.connection.db
        .collection("users")
        .listIndexes()
        .toArray();
      
      const hasTextIndex = existingIndexes.some(
        index => index.key && index.key._fts === "text"
      );
      
      if (!hasTextIndex) {
        await mongoose.connection.db.collection("users").createIndex(
          {
            name: "text",
            alias: "text",
            bio: "text",
            "location.city": "text",
            "location.country": "text",
            services: "text",
          },
          {
            background: true,
            weights: {
              name: 1,
              alias: 1,
              bio: 1,
              "location.city": 1,
              "location.country": 1,
              services: 1,
            },
          }
        );
      } else {
        console.log("✅ Text search index already exists, skipping...");
      }
    } catch (error) {
      console.log("⚠️ Error with text search index:", error.message);
    }

    // Message collection indexes
    await mongoose.connection.db
      .collection("messages")
      .createIndex(
        { sender: 1, recipient: 1, createdAt: -1 },
        { background: true }
      );

    await mongoose.connection.db
      .collection("messages")
      .createIndex({ conversationId: 1, createdAt: -1 }, { background: true });

    // Booking collection indexes
    await mongoose.connection.db
      .collection("bookings")
      .createIndex({ userId: 1, escortId: 1, date: 1 }, { background: true });

    await mongoose.connection.db
      .collection("bookings")
      .createIndex({ status: 1, date: 1 }, { background: true });

    // Review collection indexes
    await mongoose.connection.db
      .collection("reviews")
      .createIndex({ escortId: 1, rating: 1 }, { background: true });

    await mongoose.connection.db
      .collection("reviews")
      .createIndex({ userId: 1, createdAt: -1 }, { background: true });

    // Favorite collection indexes - check if exists first
    try {
      const existingIndexes = await mongoose.connection.db
        .collection("favorites")
        .listIndexes()
        .toArray();
      
      const hasIndex = existingIndexes.some(
        index => 
          index.key && 
          index.key.userId === 1 && 
          index.key.escortId === 1
      );
      
      if (!hasIndex) {
        await mongoose.connection.db
          .collection("favorites")
          .createIndex(
            { userId: 1, escortId: 1 },
            { background: true }
          );
      } else {
        console.log("✅ Favorites index already exists, skipping...");
      }
    } catch (error) {
      console.log("⚠️ Error with favorites index:", error.message);
    }

    console.log("✅ Database indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating database indexes:", error);
  }
};

// Database connection optimization
export const optimizeDatabaseConnection = () => {
  // Set connection options for better performance
  mongoose.set("bufferCommands", false);

  // Connection event handlers
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("🔌 MongoDB disconnected");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during MongoDB shutdown:", err);
      process.exit(1);
    }
  });
};

// Query optimization helpers
export const optimizeQuery = (query, options = {}) => {
  const optimizedQuery = { ...query };

  // Add lean() for read-only queries to improve performance
  if (options.lean !== false) {
    options.lean = true;
  }

  // Add select() to only fetch required fields
  if (!options.select) {
    options.select = "-__v -createdAt -updatedAt";
  }

  // Add limit for safety
  if (!options.limit && !options.limit === 0) {
    options.limit = 100;
  }

  return { query: optimizedQuery, options };
};

// Pagination helper
export const createPagination = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, skip };
};

// Sort helper
export const createSort = (sortBy = "createdAt", sortOrder = "desc") => {
  const validSortFields = [
    "name",
    "age",
    "rating",
    "price",
    "createdAt",
    "lastActive",
    "profileViews",
  ];

  if (!validSortFields.includes(sortBy)) {
    sortBy = "createdAt";
  }

  const sortDirection = sortOrder === "asc" ? 1 : -1;

  return { [sortBy]: sortDirection };
};

// Cache helper for frequently accessed data
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedQuery = (key) => {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

export const setCachedQuery = (key, data) => {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Clean up old cache entries
  if (queryCache.size > 100) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }
};

export const clearCache = () => {
  queryCache.clear();
};
