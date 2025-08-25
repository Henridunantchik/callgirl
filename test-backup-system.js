#!/usr/bin/env node

/**
 * Backup System Test Script
 * Comprehensive testing of the professional backup system
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = "https://callgirls-api.onrender.com";

/**
 * Test Results Container
 */
class TestResults {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.startTime = new Date();
  }

  addTest(name, success, details = "") {
    const test = { name, success, details, timestamp: new Date() };
    this.tests.push(test);

    if (success) {
      this.passed++;
      console.log(`✅ ${name}: PASSED`);
    } else {
      this.failed++;
      console.log(`❌ ${name}: FAILED - ${details}`);
    }

    return test;
  }

  getSummary() {
    const endTime = new Date();
    const duration = endTime - this.startTime;

    return {
      total: this.tests.length,
      passed: this.passed,
      failed: this.failed,
      successRate: (this.passed / this.tests.length) * 100,
      duration: `${duration}ms`,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
  }

  printSummary() {
    const summary = this.getSummary();
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`Duration: ${summary.duration}`);
    console.log("=".repeat(50));
  }
}

/**
 * Main Test Suite
 */
class BackupSystemTester {
  constructor() {
    this.results = new TestResults();
    this.testFiles = {
      gallery: "test-image.jpg",
      avatars: "test-avatar.png",
      videos: "test-video.mp4",
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🧪 Starting Backup System Tests...\n");

    try {
      // Test 1: API Health
      await this.testAPIHealth();

      // Test 2: Storage Health
      await this.testStorageHealth();

      // Test 3: File Access
      await this.testFileAccess();

      // Test 4: Backup Manager
      await this.testBackupManager();

      // Test 5: Fallback System
      await this.testFallbackSystem();

      // Test 6: Performance
      await this.testPerformance();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    } finally {
      this.results.printSummary();
    }
  }

  /**
   * Test 1: API Health
   */
  async testAPIHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();

      const success = response.ok && data.success;
      this.results.addTest(
        "API Health Check",
        success,
        success ? "API is healthy" : `Status: ${response.status}`
      );

      if (success) {
        console.log(`   Environment: ${data.environment}`);
        console.log(`   Port: ${data.port}`);
      }
    } catch (error) {
      this.results.addTest(
        "API Health Check",
        false,
        `Connection failed: ${error.message}`
      );
    }
  }

  /**
   * Test 2: Storage Health
   */
  async testStorageHealth() {
    try {
      const response = await fetch(`${API_BASE}/api/storage/health`);
      const data = await response.json();

      const success = response.ok && data.success;
      this.results.addTest(
        "Storage Health Check",
        success,
        success ? "Storage system healthy" : "Storage system unhealthy"
      );

      if (success) {
        console.log(
          `   Render Storage: ${data.data.render.accessible ? "✅" : "❌"} (${
            data.data.render.fileCount
          } files)`
        );
        console.log(
          `   Local Backup: ${data.data.local.accessible ? "✅" : "❌"} (${
            data.data.local.fileCount
          } files)`
        );
        console.log(`   Overall Status: ${data.status}`);
      }
    } catch (error) {
      this.results.addTest(
        "Storage Health Check",
        false,
        `Request failed: ${error.message}`
      );
    }
  }

  /**
   * Test 3: File Access
   */
  async testFileAccess() {
    // Test access to known files
    for (const [directory, filename] of Object.entries(this.testFiles)) {
      try {
        const url = `${API_BASE}/uploads/${directory}/${filename}`;
        const response = await fetch(url);

        const success = response.ok;
        this.results.addTest(
          `File Access: ${directory}/${filename}`,
          success,
          success
            ? `File accessible (${response.headers.get(
                "content-length"
              )} bytes)`
            : `Status: ${response.status}`
        );

        if (success) {
          const source = response.headers.get("x-file-source");
          console.log(`   Source: ${source || "unknown"}`);
        }
      } catch (error) {
        this.results.addTest(
          `File Access: ${directory}/${filename}`,
          false,
          `Request failed: ${error.message}`
        );
      }
    }
  }

  /**
   * Test 4: Backup Manager
   */
  async testBackupManager() {
    try {
      const response = await fetch(`${API_BASE}/debug/files`);
      const data = await response.json();

      if (response.ok && data.success) {
        const backupStats = data.data.backupManager;

        const success = backupStats && backupStats.lastSync;
        this.results.addTest(
          "Backup Manager Status",
          success,
          success
            ? "Backup manager operational"
            : "Backup manager not responding"
        );

        if (success) {
          console.log(
            `   Last Sync: ${new Date(backupStats.lastSync).toLocaleString()}`
          );
          console.log(`   Total Files: ${backupStats.totalFiles}`);
          console.log(`   Synced Files: ${backupStats.syncedFiles}`);
          console.log(`   Failed Files: ${backupStats.failedFiles}`);
        }
      } else {
        this.results.addTest(
          "Backup Manager Status",
          false,
          "Debug endpoint failed"
        );
      }
    } catch (error) {
      this.results.addTest(
        "Backup Manager Status",
        false,
        `Request failed: ${error.message}`
      );
    }
  }

  /**
   * Test 5: Fallback System
   */
  async testFallbackSystem() {
    try {
      // Test a file that might not exist in Render but should exist in backup
      const testUrl = `${API_BASE}/uploads/gallery/fallback-test.jpg`;
      const response = await fetch(testUrl);

      // Even if file doesn't exist, the fallback system should handle it gracefully
      const success = response.status !== 500; // Not a server error
      this.results.addTest(
        "Fallback System",
        success,
        success ? "Fallback system operational" : "Fallback system failed"
      );

      if (response.ok) {
        const source = response.headers.get("x-file-source");
        console.log(`   File served from: ${source || "unknown"}`);
      } else if (response.status === 404) {
        console.log(`   File not found (expected for test file)`);
      }
    } catch (error) {
      this.results.addTest(
        "Fallback System",
        false,
        `Request failed: ${error.message}`
      );
    }
  }

  /**
   * Test 6: Performance
   */
  async testPerformance() {
    const startTime = Date.now();

    try {
      // Test multiple concurrent requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(fetch(`${API_BASE}/health`));
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      const success = duration < 5000; // Should complete in under 5 seconds
      this.results.addTest(
        "Performance Test",
        success,
        `Concurrent requests completed in ${duration}ms`
      );

      if (success) {
        console.log(`   Response time: ${duration}ms`);
        console.log(`   Concurrent requests: 5`);
      }
    } catch (error) {
      this.results.addTest(
        "Performance Test",
        false,
        `Performance test failed: ${error.message}`
      );
    }
  }
}

/**
 * Create test files for testing
 */
const createTestFiles = () => {
  console.log("📝 Creating test files...");

  const testDir = path.join(__dirname, "api", "uploads");
  const directories = ["gallery", "avatars", "videos"];

  directories.forEach((dir) => {
    const dirPath = path.join(testDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create a simple test image (1x1 pixel PNG)
  const testImagePath = path.join(testDir, "gallery", "test-image.jpg");
  if (!fs.existsSync(testImagePath)) {
    // Create a minimal JPEG file
    const minimalJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01,
      0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08,
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff,
      0xd9,
    ]);
    fs.writeFileSync(testImagePath, minimalJpeg);
  }

  console.log("✅ Test files created");
};

// Main execution
const main = async () => {
  try {
    // Create test files first
    createTestFiles();

    // Run tests
    const tester = new BackupSystemTester();
    await tester.runAllTests();
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
