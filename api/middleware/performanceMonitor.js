import { performance } from "perf_hooks";
import mongoose from "mongoose";

// Performance monitoring middleware
export const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  const startTime = Date.now();

  // Track database queries
  const originalQuery = mongoose.Query.prototype.exec;
  const queries = [];

  mongoose.Query.prototype.exec = function () {
    const queryStart = performance.now();
    const queryStr = this.getQuery();
    const collection = this.mongooseCollection.name;

    return originalQuery.apply(this, arguments).then((result) => {
      const queryDuration = performance.now() - queryStart;
      queries.push({
        collection,
        query: queryStr,
        duration: queryDuration,
        timestamp: Date.now(),
      });

      // Log slow queries (>100ms)
      if (queryDuration > 100) {
        console.warn(
          `🐌 Slow query detected: ${collection} took ${queryDuration.toFixed(
            2
          )}ms`
        );
      }

      return result;
    });
  };

  // Track response
  res.on("finish", () => {
    const duration = performance.now() - start;
    const responseTime = Date.now() - startTime;

    // Performance metrics
    const metrics = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration.toFixed(2),
      responseTime: responseTime,
      queries: queries.length,
      slowQueries: queries.filter((q) => q.duration > 100).length,
      timestamp: new Date().toISOString(),
    };

    // Log performance data
    if (duration > 500) {
      console.warn(
        `🐌 Slow endpoint: ${req.method} ${req.url} took ${duration.toFixed(
          2
        )}ms`
      );
    }

    // Store metrics for analysis
    if (!global.performanceMetrics) {
      global.performanceMetrics = [];
    }
    global.performanceMetrics.push(metrics);

    // Keep only last 1000 metrics
    if (global.performanceMetrics.length > 1000) {
      global.performanceMetrics = global.performanceMetrics.slice(-1000);
    }
  });

  next();
};

// Performance analytics endpoint
export const getPerformanceMetrics = (req, res) => {
  const metrics = global.performanceMetrics || [];

  // Calculate performance statistics
  const stats = {
    totalRequests: metrics.length,
    averageResponseTime:
      metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
    slowRequests: metrics.filter((m) => m.duration > 500).length,
    slowQueries: metrics.reduce((sum, m) => sum + m.slowQueries, 0),
    endpointPerformance: {},
    recentSlowRequests: metrics.filter((m) => m.duration > 1000).slice(-10),
  };

  // Group by endpoint
  metrics.forEach((m) => {
    const key = `${m.method} ${m.url}`;
    if (!stats.endpointPerformance[key]) {
      stats.endpointPerformance[key] = {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }
    stats.endpointPerformance[key].count++;
    stats.endpointPerformance[key].totalDuration += parseFloat(m.duration);
  });

  // Calculate averages
  Object.keys(stats.endpointPerformance).forEach((key) => {
    const ep = stats.endpointPerformance[key];
    ep.averageDuration = ep.totalDuration / ep.count;
  });

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
};
