#!/usr/bin/env node

/**
 * Performance Testing Script
 * Run this to test your API performance in development vs production
 *
 * Usage:
 * - Development: node performance-test.js dev
 * - Production: node performance-test.js prod
 * - Compare: node performance-test.js compare
 */

import fetch from "node-fetch";
import { performance } from "perf_hooks";

const BASE_URLS = {
  dev: "http://localhost:5000",
  prod: "https://api.epicescorts.live", // Railway production URL
};

const ENDPOINTS = [
  "/health",
  "/api/status",
  "/api/performance",
  "/api/performance/health",
  "/ping",
];

class PerformanceTester {
  constructor() {
    this.results = {};
    this.testCount = 10; // Number of requests per endpoint
  }

  async testEndpoint(baseUrl, endpoint) {
    const times = [];
    const errors = [];

    console.log(`\n🔍 Testing ${baseUrl}${endpoint}...`);

    for (let i = 0; i < this.testCount; i++) {
      try {
        const start = performance.now();
        const response = await fetch(`${baseUrl}${endpoint}`);
        const end = performance.now();

        const duration = end - start;
        times.push(duration);

        if (!response.ok) {
          errors.push(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errors.push(error.message);
      }
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successRate = ((times.length - errors.length) / this.testCount) * 100;

    return {
      endpoint,
      avgTime: Math.round(avgTime),
      minTime: Math.round(minTime),
      maxTime: Math.round(maxTime),
      successRate: Math.round(successRate),
      errors: errors.length > 0 ? errors.slice(0, 3) : [], // Show first 3 errors
      totalRequests: this.testCount,
    };
  }

  async testEnvironment(env) {
    console.log(`\n🚀 Testing ${env.toUpperCase()} environment...`);
    console.log(`Base URL: ${BASE_URLS[env]}`);

    this.results[env] = {};

    for (const endpoint of ENDPOINTS) {
      this.results[env][endpoint] = await this.testEndpoint(
        BASE_URLS[env],
        endpoint
      );
    }
  }

  async runAllTests() {
    console.log("🎯 Starting Performance Tests...");
    console.log("=====================================");

    // Test development
    if (BASE_URLS.dev) {
      await this.testEnvironment("dev");
    }

    // Test production
    if (BASE_URLS.prod) {
      await this.testEnvironment("prod");
    }

    this.printResults();
    this.generateRecommendations();
  }

  printResults() {
    console.log("\n📊 PERFORMANCE TEST RESULTS");
    console.log("=====================================");

    Object.keys(this.results).forEach((env) => {
      console.log(`\n🌍 ${env.toUpperCase()} ENVIRONMENT:`);
      console.log("─".repeat(50));

      Object.values(this.results[env]).forEach((result) => {
        const status = result.successRate === 100 ? "✅" : "⚠️";
        console.log(`${status} ${result.endpoint}`);
        console.log(
          `   Avg: ${result.avgTime}ms | Min: ${result.minTime}ms | Max: ${result.maxTime}ms`
        );
        console.log(`   Success Rate: ${result.successRate}%`);
        if (result.errors.length > 0) {
          console.log(`   Errors: ${result.errors.join(", ")}`);
        }
        console.log("");
      });
    });
  }

  generateRecommendations() {
    console.log("\n💡 PERFORMANCE RECOMMENDATIONS");
    console.log("=====================================");

    if (this.results.dev && this.results.prod) {
      console.log("\n📈 Development vs Production Comparison:");

      ENDPOINTS.forEach((endpoint) => {
        const dev = this.results.dev[endpoint];
        const prod = this.results.prod[endpoint];

        if (dev && prod) {
          const diff = prod.avgTime - dev.avgTime;
          const percentDiff = (diff / dev.avgTime) * 100;

          if (diff > 0) {
            console.log(
              `⚠️  ${endpoint}: Production is ${Math.round(
                percentDiff
              )}% slower`
            );
            if (percentDiff > 50) {
              console.log(
                `   🔧 Consider: Database optimization, CDN, caching`
              );
            }
          } else {
            console.log(
              `✅ ${endpoint}: Production is ${Math.round(
                Math.abs(percentDiff)
              )}% faster`
            );
          }
        }
      });
    }

    // General recommendations
    console.log("\n🔧 General Optimization Tips:");
    console.log("• Enable database connection pooling");
    console.log("• Implement Redis caching for frequently accessed data");
    console.log("• Use CDN for static assets");
    console.log("• Optimize database queries with proper indexes");
    console.log("• Consider serverless functions for heavy operations");
    console.log("• Monitor memory usage and implement garbage collection");
  }

  async testSpecificEndpoint(env, endpoint) {
    console.log(`\n🎯 Testing specific endpoint: ${endpoint}`);
    const result = await this.testEndpoint(BASE_URLS[env], endpoint);
    console.log("\n📊 Result:", result);
    return result;
  }

  async stressTest(env, endpoint, concurrent = 10) {
    console.log(
      `\n🔥 Stress testing ${endpoint} with ${concurrent} concurrent requests...`
    );

    const start = performance.now();
    const promises = [];

    for (let i = 0; i < concurrent; i++) {
      promises.push(
        fetch(`${BASE_URLS[env]}${endpoint}`)
          .then((response) => ({
            success: response.ok,
            status: response.status,
          }))
          .catch((error) => ({ success: false, error: error.message }))
      );
    }

    const results = await Promise.all(promises);
    const end = performance.now();

    const successCount = results.filter((r) => r.success).length;
    const successRate = (successCount / concurrent) * 100;
    const totalTime = end - start;

    console.log(`📊 Stress Test Results:`);
    console.log(`   Total Time: ${Math.round(totalTime)}ms`);
    console.log(`   Success Rate: ${Math.round(successRate)}%`);
    console.log(`   Concurrent Requests: ${concurrent}`);

    return { successRate, totalTime, concurrent };
  }
}

// CLI interface
async function main() {
  const tester = new PerformanceTester();
  const args = process.argv.slice(2);

  try {
    if (args.length === 0) {
      await tester.runAllTests();
    } else if (args[0] === "dev") {
      await tester.testEnvironment("dev");
      tester.printResults();
    } else if (args[0] === "prod") {
      await tester.testEnvironment("prod");
      tester.printResults();
    } else if (args[0] === "compare") {
      await tester.runAllTests();
    } else if (args[0] === "stress") {
      const env = args[1] || "dev";
      const endpoint = args[2] || "/health";
      const concurrent = parseInt(args[3]) || 10;
      await tester.stressTest(env, endpoint, concurrent);
    } else if (args[0] === "test") {
      const env = args[1] || "dev";
      const endpoint = args[2] || "/health";
      await tester.testSpecificEndpoint(env, endpoint);
    } else {
      console.log(`
🎯 Performance Testing Tool

Usage:
  node performance-test.js                    # Run all tests
  node performance-test.js dev               # Test development only
  node performance-test.js prod              # Test production only
  node performance-test.js compare           # Compare dev vs prod
  node performance-test.js stress [env] [endpoint] [concurrent]  # Stress test
  node performance-test.js test [env] [endpoint]                 # Test specific endpoint

Examples:
  node performance-test.js stress prod /health 20
  node performance-test.js test dev /api/performance
      `);
    }
  } catch (error) {
    console.error("❌ Error during testing:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default PerformanceTester;
