import NodeCache from "node-cache";

// Cache configuration
const cacheConfig = {
  stdTTL: 300, // 5 minutes default
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false,
  deleteOnExpire: true,
};

// Initialize cache
const cache = new NodeCache(cacheConfig);

// Cache keys
const CACHE_KEYS = {
  USER_PROFILE: "user_profile",
  ESCORT_LIST: "escort_list",
  CATEGORIES: "categories",
  SUBSCRIPTION_PRICING: "subscription_pricing",
  BLOG_POSTS: "blog_posts",
  SEARCH_RESULTS: "search_results",
};

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = `${req.method}_${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original send method
    const originalSend = res.json;

    // Override send method to cache response
    res.json = function (data) {
      cache.set(key, data, duration);
      originalSend.call(this, data);
    };

    next();
  };
};

// Cache database query results
const cacheQuery = async (key, queryFunction, ttl = 300) => {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const result = await queryFunction();
  cache.set(key, result, ttl);
  return result;
};

// Cache with tags for invalidation
const cacheWithTags = async (key, tags, queryFunction, ttl = 300) => {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const result = await queryFunction();
  cache.set(key, result, ttl);

  // Store tags for invalidation
  const tagData = cache.get("_tags") || {};
  tags.forEach((tag) => {
    if (!tagData[tag]) tagData[tag] = [];
    tagData[tag].push(key);
  });
  cache.set("_tags", tagData);

  return result;
};

// Invalidate cache by tags
const invalidateByTags = (tags) => {
  const tagData = cache.get("_tags") || {};
  const keysToDelete = [];

  tags.forEach((tag) => {
    if (tagData[tag]) {
      keysToDelete.push(...tagData[tag]);
      delete tagData[tag];
    }
  });

  keysToDelete.forEach((key) => cache.del(key));
  cache.set("_tags", tagData);
};

// Invalidate cache by pattern
const invalidateByPattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key) => key.includes(pattern));
  matchingKeys.forEach((key) => cache.del(key));
};

// Clear all cache
const clearCache = () => {
  cache.flushAll();
};

// Get cache stats
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    keyspace: cache.keys(),
  };
};

// Cache for user profiles
const cacheUserProfile = async (userId, userData, ttl = 600) => {
  const key = `${CACHE_KEYS.USER_PROFILE}_${userId}`;
  cache.set(key, userData, ttl);
};

// Cache for escort lists
const cacheEscortList = async (filters, escortList, ttl = 300) => {
  const key = `${CACHE_KEYS.ESCORT_LIST}_${JSON.stringify(filters)}`;
  cache.set(key, escortList, ttl);
};

// Cache for categories
const cacheCategories = async (categories, ttl = 1800) => {
  cache.set(CACHE_KEYS.CATEGORIES, categories, ttl);
};

// Cache for subscription pricing
const cacheSubscriptionPricing = async (country, pricing, ttl = 3600) => {
  const key = `${CACHE_KEYS.SUBSCRIPTION_PRICING}_${country}`;
  cache.set(key, pricing, ttl);
};

// Cache for search results
const cacheSearchResults = async (query, results, ttl = 300) => {
  const key = `${CACHE_KEYS.SEARCH_RESULTS}_${query}`;
  cache.set(key, results, ttl);
};

// Invalidate user-related cache
const invalidateUserCache = (userId) => {
  const keys = [
    `${CACHE_KEYS.USER_PROFILE}_${userId}`,
    CACHE_KEYS.ESCORT_LIST,
    CACHE_KEYS.SEARCH_RESULTS,
  ];

  keys.forEach((key) => {
    if (key.includes("*")) {
      invalidateByPattern(key.replace("*", ""));
    } else {
      cache.del(key);
    }
  });
};

// Invalidate escort-related cache
const invalidateEscortCache = () => {
  invalidateByPattern(CACHE_KEYS.ESCORT_LIST);
  invalidateByPattern(CACHE_KEYS.SEARCH_RESULTS);
};

// Invalidate subscription cache
const invalidateSubscriptionCache = () => {
  invalidateByPattern(CACHE_KEYS.SUBSCRIPTION_PRICING);
};

export {
  cache,
  cacheMiddleware,
  cacheQuery,
  cacheWithTags,
  invalidateByTags,
  invalidateByPattern,
  clearCache,
  getCacheStats,
  cacheUserProfile,
  cacheEscortList,
  cacheCategories,
  cacheSubscriptionPricing,
  cacheSearchResults,
  invalidateUserCache,
  invalidateEscortCache,
  invalidateSubscriptionCache,
  CACHE_KEYS,
};
