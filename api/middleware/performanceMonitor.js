import { ApiError } from "../utils/ApiError.js";

// Performance metrics storage
const performanceMetrics = {
  requests: new Map(),
  endpoints: new Map(),
  errors: new Map(),
  slowQueries: [],
  cacheStats: {
    hits: 0,
    misses: 0,
    hitRate: 0,
  },
};

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId =
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Store request start time
  performanceMetrics.requests.set(requestId, {
    method: req.method,
    url: req.originalUrl,
    startTime,
    userId: req.user?.id || "anonymous",
    ip: req.ip,
  });

  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function (data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update request metrics
    const requestData = performanceMetrics.requests.get(requestId);
    if (requestData) {
      requestData.duration = duration;
      requestData.statusCode = res.statusCode;
      requestData.responseSize = JSON.stringify(data).length;

      // Track slow requests (>500ms)
      if (duration > 500) {
        performanceMetrics.slowQueries.push({
          ...requestData,
          timestamp: new Date(),
        });
      }
    }

    // Update endpoint metrics
    const endpointKey = `${req.method} ${req.originalUrl}`;
    const endpointData = performanceMetrics.endpoints.get(endpointKey) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: 0,
    };

    endpointData.count++;
    endpointData.totalDuration += duration;
    endpointData.avgDuration = endpointData.totalDuration / endpointData.count;
    endpointData.minDuration = Math.min(endpointData.minDuration, duration);
    endpointData.maxDuration = Math.max(endpointData.maxDuration, duration);

    if (res.statusCode >= 400) {
      endpointData.errors++;
    }

    performanceMetrics.endpoints.set(endpointKey, endpointData);

    // Clean up old request data
    performanceMetrics.requests.delete(requestId);

    // Log performance for slow requests
    if (duration > 1000) {
      console.warn(
        `🐌 Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`
      );
    }

    return originalJson.call(this, data);
  };

  next();
};

// Error tracking
const trackError = (error, req) => {
  const errorKey = error.message || "Unknown error";
  const errorData = performanceMetrics.errors.get(errorKey) || {
    count: 0,
    lastOccurrence: null,
    endpoints: new Set(),
  };

  errorData.count++;
  errorData.lastOccurrence = new Date();
  errorData.endpoints.add(req.originalUrl);

  performanceMetrics.errors.set(errorKey, errorData);
};

// Get performance metrics
const getPerformanceMetrics = () => {
  // Calculate cache hit rate
  const totalRequests =
    performanceMetrics.cacheStats.hits + performanceMetrics.cacheStats.misses;
  performanceMetrics.cacheStats.hitRate =
    totalRequests > 0
      ? (performanceMetrics.cacheStats.hits / totalRequests) * 100
      : 0;

  return {
    requests: {
      total: performanceMetrics.requests.size,
      slow: performanceMetrics.slowQueries.length,
    },
    endpoints: Array.from(performanceMetrics.endpoints.entries()).map(
      ([key, data]) => ({
        endpoint: key,
        ...data,
      })
    ),
    errors: Array.from(performanceMetrics.errors.entries()).map(
      ([key, data]) => ({
        error: key,
        ...data,
        endpoints: Array.from(data.endpoints),
      })
    ),
    cache: performanceMetrics.cacheStats,
    slowQueries: performanceMetrics.slowQueries.slice(-10), // Last 10 slow queries
  };
};

// Cache hit/miss tracking
const trackCacheHit = () => {
  performanceMetrics.cacheStats.hits++;
};

const trackCacheMiss = () => {
  performanceMetrics.cacheStats.misses++;
};

// Clean up old data
const cleanupOldData = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  // Clean up old slow queries
  performanceMetrics.slowQueries = performanceMetrics.slowQueries.filter(
    (query) => query.timestamp.getTime() > oneHourAgo
  );

  // Clean up old requests
  for (const [id, data] of performanceMetrics.requests.entries()) {
    if (data.startTime < oneHourAgo) {
      performanceMetrics.requests.delete(id);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);

export {
  performanceMiddleware,
  trackError,
  getPerformanceMetrics,
  trackCacheHit,
  trackCacheMiss,
};
