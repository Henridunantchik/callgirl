import { ApiError } from "./ApiError.js";

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
  const errorKey = error.constructor.name;
  const errorData = performanceMetrics.errors.get(errorKey) || {
    count: 0,
    lastOccurrence: null,
    examples: [],
  };

  errorData.count++;
  errorData.lastOccurrence = new Date();
  errorData.examples.push({
    message: error.message,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    timestamp: new Date(),
  });

  // Keep only last 10 examples
  if (errorData.examples.length > 10) {
    errorData.examples = errorData.examples.slice(-10);
  }

  performanceMetrics.errors.set(errorKey, errorData);
};

// Cache performance tracking
const trackCachePerformance = (hit) => {
  if (hit) {
    performanceMetrics.cacheStats.hits++;
  } else {
    performanceMetrics.cacheStats.misses++;
  }

  const total =
    performanceMetrics.cacheStats.hits + performanceMetrics.cacheStats.misses;
  performanceMetrics.cacheStats.hitRate =
    total > 0 ? (performanceMetrics.cacheStats.hits / total) * 100 : 0;
};

// Get performance statistics
const getPerformanceStats = () => {
  const endpoints = Array.from(performanceMetrics.endpoints.entries()).map(
    ([key, data]) => ({
      endpoint: key,
      ...data,
    })
  );

  const errors = Array.from(performanceMetrics.errors.entries()).map(
    ([key, data]) => ({
      errorType: key,
      ...data,
    })
  );

  const slowQueries = performanceMetrics.slowQueries.slice(-20); // Last 20 slow queries

  return {
    endpoints,
    errors,
    slowQueries,
    cacheStats: performanceMetrics.cacheStats,
    activeRequests: performanceMetrics.requests.size,
    timestamp: new Date(),
  };
};

// Get endpoint performance
const getEndpointPerformance = (endpoint) => {
  return performanceMetrics.endpoints.get(endpoint) || null;
};

// Get error statistics
const getErrorStats = () => {
  const totalErrors = Array.from(performanceMetrics.errors.values()).reduce(
    (sum, data) => sum + data.count,
    0
  );

  return {
    totalErrors,
    errorTypes: Array.from(performanceMetrics.errors.entries()).map(
      ([key, data]) => ({
        type: key,
        count: data.count,
        lastOccurrence: data.lastOccurrence,
      })
    ),
  };
};

// Performance alert system
const checkPerformanceAlerts = () => {
  const alerts = [];

  // Check for high error rates
  const totalRequests = Array.from(
    performanceMetrics.endpoints.values()
  ).reduce((sum, data) => sum + data.count, 0);
  const totalErrors = Array.from(performanceMetrics.errors.values()).reduce(
    (sum, data) => sum + data.count,
    0
  );
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  if (errorRate > 5) {
    alerts.push({
      type: "HIGH_ERROR_RATE",
      message: `Error rate is ${errorRate.toFixed(2)}%`,
      severity: "high",
    });
  }

  // Check for slow endpoints
  const slowEndpoints = Array.from(performanceMetrics.endpoints.entries())
    .filter(([key, data]) => data.avgDuration > 1000)
    .map(([key, data]) => ({
      endpoint: key,
      avgDuration: data.avgDuration,
    }));

  if (slowEndpoints.length > 0) {
    alerts.push({
      type: "SLOW_ENDPOINTS",
      message: `${slowEndpoints.length} slow endpoints detected`,
      details: slowEndpoints,
      severity: "medium",
    });
  }

  // Check cache hit rate
  if (performanceMetrics.cacheStats.hitRate < 50) {
    alerts.push({
      type: "LOW_CACHE_HIT_RATE",
      message: `Cache hit rate is ${performanceMetrics.cacheStats.hitRate.toFixed(
        2
      )}%`,
      severity: "medium",
    });
  }

  return alerts;
};

// Clean up old data
const cleanupOldData = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  // Clean up old slow queries
  performanceMetrics.slowQueries = performanceMetrics.slowQueries.filter(
    (query) => query.timestamp > oneHourAgo
  );

  // Clean up old request data
  for (const [
    requestId,
    requestData,
  ] of performanceMetrics.requests.entries()) {
    if (requestData.startTime < oneHourAgo) {
      performanceMetrics.requests.delete(requestId);
    }
  }
};

// Schedule cleanup
setInterval(cleanupOldData, 10 * 60 * 1000); // Every 10 minutes

export {
  performanceMiddleware,
  trackError,
  trackCachePerformance,
  getPerformanceStats,
  getEndpointPerformance,
  getErrorStats,
  checkPerformanceAlerts,
};
