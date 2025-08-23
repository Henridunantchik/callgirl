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
  // Add real-time performance tracking
  realTime: {
    currentRequests: 0,
    peakRequests: 0,
    avgResponseTime: 0,
    totalRequests: 0,
    startTime: Date.now(),
  },
  // Add memory and system metrics
  system: {
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    uptime: process.uptime(),
  },
};

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId =
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Track current active requests
  performanceMetrics.realTime.currentRequests++;
  performanceMetrics.realTime.totalRequests++;
  performanceMetrics.realTime.peakRequests = Math.max(
    performanceMetrics.realTime.peakRequests,
    performanceMetrics.realTime.currentRequests
  );

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

    // Update real-time metrics
    performanceMetrics.realTime.currentRequests--;
    performanceMetrics.realTime.avgResponseTime =
      (performanceMetrics.realTime.avgResponseTime *
        (performanceMetrics.realTime.totalRequests - 1) +
        duration) /
      performanceMetrics.realTime.totalRequests;

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

      // Alert for very slow requests (>2s)
      if (duration > 2000) {
        console.error(
          `🚨 CRITICAL: Very slow request: ${req.method} ${req.originalUrl} - ${duration}ms`
        );
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
      lastRequest: null,
    };

    endpointData.count++;
    endpointData.totalDuration += duration;
    endpointData.avgDuration = endpointData.totalDuration / endpointData.count;
    endpointData.minDuration = Math.min(endpointData.minDuration, duration);
    endpointData.maxDuration = Math.max(endpointData.maxDuration, duration);
    endpointData.lastRequest = new Date();

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
  // Update system metrics
  performanceMetrics.system.memoryUsage = process.memoryUsage();
  performanceMetrics.system.uptime = process.uptime();

  // Calculate cache hit rate
  const totalRequests =
    performanceMetrics.cacheStats.hits + performanceMetrics.cacheStats.misses;
  performanceMetrics.cacheStats.hitRate =
    totalRequests > 0
      ? (performanceMetrics.cacheStats.hits / totalRequests) * 100
      : 0;

  // Calculate performance score (0-100)
  const avgResponseTime = performanceMetrics.realTime.avgResponseTime;
  let performanceScore = 100;

  if (avgResponseTime > 1000) performanceScore = 60;
  else if (avgResponseTime > 500) performanceScore = 80;
  else if (avgResponseTime > 200) performanceScore = 90;
  else if (avgResponseTime > 100) performanceScore = 95;

  return {
    requests: {
      total: performanceMetrics.realTime.totalRequests,
      current: performanceMetrics.realTime.currentRequests,
      peak: performanceMetrics.realTime.peakRequests,
      slow: performanceMetrics.slowQueries.length,
    },
    performance: {
      avgResponseTime: Math.round(avgResponseTime),
      performanceScore,
      uptime: Math.round(performanceMetrics.system.uptime),
    },
    endpoints: Array.from(performanceMetrics.endpoints.entries()).map(
      ([key, data]) => ({
        endpoint: key,
        ...data,
        lastRequest: data.lastRequest?.toISOString(),
      })
    ),
    errors: Array.from(performanceMetrics.errors.entries()).map(
      ([key, data]) => ({
        error: key,
        ...data,
        endpoints: Array.from(data.endpoints),
        lastOccurrence: data.lastOccurrence?.toISOString(),
      })
    ),
    cache: performanceMetrics.cacheStats,
    slowQueries: performanceMetrics.slowQueries.slice(-10), // Last 10 slow queries
    system: {
      memory: {
        used: Math.round(
          performanceMetrics.system.memoryUsage.used / 1024 / 1024
        ),
        total: Math.round(
          performanceMetrics.system.memoryUsage.heapTotal / 1024 / 1024
        ),
        external: Math.round(
          performanceMetrics.system.memoryUsage.external / 1024 / 1024
        ),
      },
      uptime: Math.round(performanceMetrics.system.uptime),
    },
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

  // Reset peak requests every hour
  performanceMetrics.realTime.peakRequests =
    performanceMetrics.realTime.currentRequests;
};

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);

// Performance health check
const getPerformanceHealth = () => {
  const metrics = getPerformanceMetrics();
  const health = {
    status: "healthy",
    issues: [],
    recommendations: [],
  };

  // Check response time
  if (metrics.performance.avgResponseTime > 1000) {
    health.status = "warning";
    health.issues.push("High average response time");
    health.recommendations.push(
      "Consider adding caching or optimizing database queries"
    );
  }

  // Check error rate
  const totalErrors = metrics.errors.reduce((sum, err) => sum + err.count, 0);
  const errorRate = (totalErrors / metrics.requests.total) * 100;
  if (errorRate > 5) {
    health.status = "critical";
    health.issues.push("High error rate");
    health.recommendations.push("Investigate and fix error patterns");
  }

  // Check memory usage
  const memoryUsagePercent =
    (metrics.system.memory.used / metrics.system.memory.total) * 100;
  if (memoryUsagePercent > 80) {
    health.status = "warning";
    health.issues.push("High memory usage");
    health.recommendations.push("Consider memory optimization or scaling");
  }

  return health;
};

export {
  performanceMiddleware,
  trackError,
  getPerformanceMetrics,
  getPerformanceHealth,
  trackCacheHit,
  trackCacheMiss,
};
