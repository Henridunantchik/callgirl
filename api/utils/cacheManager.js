import { performance } from "perf_hooks";

// High-performance cache manager with unlimited scalability
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      memoryUsage: 0,
    };
    this.maxSize = 10000; // Maximum cache entries
    this.cleanupInterval = 60000; // Cleanup every minute

    // Start cleanup process
    this.startCleanup();
  }

  // Set cache with TTL
  set(key, value, ttl = 300000) {
    // Default 5 minutes
    const now = Date.now();
    const expiry = now + ttl;

    // Check if key already exists
    if (this.cache.has(key)) {
      this.stats.sets++;
      this.cache.set(key, {
        value,
        expiry,
        lastAccessed: now,
        accessCount: this.cache.get(key).accessCount + 1,
      });
      return;
    }

    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: now,
      accessCount: 1,
    });

    this.stats.sets++;
    this.stats.size = this.cache.size;
    this.updateMemoryUsage();
  }

  // Get cache value
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    // Update access stats
    item.lastAccessed = Date.now();
    item.accessCount++;

    this.stats.hits++;
    return item.value;
  }

  // Check if key exists and is valid
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  // Delete cache entry
  delete(key) {
    if (this.cache.delete(key)) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.sets = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.deletes = 0;
  }

  // Get cache statistics
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2),
      efficiency: this.calculateEfficiency(),
    };
  }

  // Calculate cache efficiency score (0-100)
  calculateEfficiency() {
    const totalRequests = this.stats.hits + this.stats.misses;
    if (totalRequests === 0) return 100;

    const hitRate = this.stats.hits / totalRequests;
    const memoryEfficiency = Math.max(
      0,
      100 - this.stats.memoryUsage / 1024 / 1024
    ); // MB

    return Math.round(hitRate * 70 + memoryEfficiency * 0.3);
  }

  // Evict least recently used items
  evictLRU() {
    const entries = Array.from(this.cache.entries());

    // Sort by last accessed time and access count
    entries.sort((a, b) => {
      const aScore = a[1].lastAccessed + a[1].accessCount * 1000;
      const bScore = b[1].lastAccessed + b[1].accessCount * 1000;
      return aScore - bScore;
    });

    // Remove 20% of oldest entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    this.stats.size = this.cache.size;
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Start automatic cleanup
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Update memory usage tracking
  updateMemoryUsage() {
    try {
      const memUsage = process.memoryUsage();
      this.stats.memoryUsage = memUsage.heapUsed;
    } catch (error) {
      // Ignore memory usage errors
    }
  }

  // Cache middleware for Express routes
  middleware(ttl = 300000, keyGenerator = null) {
    return (req, res, next) => {
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `${req.method}:${req.originalUrl}`;

      // Try to get from cache
      const cached = this.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data) {
        // Cache the response
        cacheManager.set(cacheKey, data, ttl);

        // Call original method
        return originalJson.call(this, data);
      };

      next();
    };
  }

  // Batch operations for better performance
  mget(keys) {
    const results = {};
    const missing = [];

    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== null) {
        results[key] = value;
      } else {
        missing.push(key);
      }
    });

    return { results, missing };
  }

  mset(entries, ttl = 300000) {
    entries.forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }
}

// Create global cache instance
const cacheManager = new CacheManager();

// Export cache manager and middleware
export default cacheManager;

// Cache decorator for functions
export const cacheable = (ttl = 300000, keyGenerator = null) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const cacheKey = keyGenerator
        ? keyGenerator(...args)
        : `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Try cache first
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      cacheManager.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
};

// Cache utilities
export const cacheUtils = {
  // Generate cache key from request
  generateKey: (req) => {
    const { method, originalUrl, query, body, user } = req;
    const userId = user?.id || "anonymous";
    return `${method}:${originalUrl}:${userId}:${JSON.stringify(
      query
    )}:${JSON.stringify(body)}`;
  },

  // Generate cache key from function call
  generateFunctionKey: (functionName, args) => {
    return `${functionName}:${JSON.stringify(args)}`;
  },

  // Cache with custom TTL
  withTTL: (ttl) => cacheManager.middleware(ttl),

  // Cache with custom key generator
  withKey: (keyGenerator) => cacheManager.middleware(300000, keyGenerator),
};

