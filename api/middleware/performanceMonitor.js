import { performance } from "perf_hooks";
import mongoose from "mongoose";

// Performance monitoring middleware
export const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  const startTime = Date.now();
  const queries = [];

  // Simple performance tracking without modifying mongoose prototype

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
export const getPerformanceMetrics = () => {
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

  return {
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  };
};

// Performance health check
export const getPerformanceHealth = () => {
  const metrics = global.performanceMetrics || [];
  const recentMetrics = metrics.slice(-100); // Last 100 requests

  const avgResponseTime =
    recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
        recentMetrics.length
      : 0;

  const slowRequests = recentMetrics.filter(
    (m) => m.responseTime > 1000
  ).length;

  return {
    healthy: avgResponseTime < 2000 && slowRequests < 10,
    averageResponseTime: avgResponseTime,
    slowRequests: slowRequests,
    totalRequests: recentMetrics.length,
    timestamp: new Date().toISOString(),
  };
};
