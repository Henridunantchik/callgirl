#!/usr/bin/env node

/**
 * Test File Upload and Storage
 * This script tests if files can be uploaded and accessed correctly
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import renderStorageConfig from "./config/render-storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFileStorage() {
  console.log("🧪 Testing File Storage Configuration...\n");

  try {
    // Initialize storage
    renderStorageConfig.init();

    console.log("📁 Storage Configuration:");
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Upload Path: ${renderStorageConfig.uploadPath}`);
    console.log(`   Base URL: ${renderStorageConfig.baseUrl}`);
    console.log("");

    // Test directory creation
    console.log("📂 Testing Directory Creation:");
    Object.entries(renderStorageConfig.directories).forEach(([name, dir]) => {
      if (fs.existsSync(dir)) {
        console.log(`   ✅ ${name}: ${dir}`);
      } else {
        console.log(`   ❌ ${name}: ${dir} (NOT FOUND)`);
      }
    });
    console.log("");

    // Test file URL generation
    console.log("🔗 Testing URL Generation:");
    const testFiles = [
      "/opt/render/project/src/uploads/gallery/test-image.jpg",
      "/opt/render/project/src/uploads/avatars/test-avatar.png",
      "/opt/render/project/src/uploads/videos/test-video.mp4",
    ];

    testFiles.forEach((filePath) => {
      const url = renderStorageConfig.getFileUrl(filePath);
      console.log(`   ${filePath} → ${url}`);
    });
    console.log("");

    // Test file access
    console.log("📄 Testing File Access:");
    const testDir = renderStorageConfig.directories.gallery;
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      if (files.length > 0) {
        console.log(`   ✅ Gallery directory has ${files.length} files`);
        files.slice(0, 5).forEach((file) => {
          const filePath = path.join(testDir, file);
          const url = renderStorageConfig.getFileUrl(filePath);
          console.log(`     ${file} → ${url}`);
        });
      } else {
        console.log("   ⚠️  Gallery directory is empty");
      }
    } else {
      console.log("   ❌ Gallery directory not found");
    }
    console.log("");

    // Test environment variables
    console.log("🌍 Environment Variables:");
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
    console.log(
      `   RENDER_STORAGE_PATH: ${
        process.env.RENDER_STORAGE_PATH || "undefined"
      }`
    );
    console.log(
      `   RENDER_EXTERNAL_URL: ${
        process.env.RENDER_EXTERNAL_URL || "undefined"
      }`
    );
    console.log("");

    // Test static file serving
    console.log("🌐 Static File Serving Test:");
    const testUrls = [
      `${renderStorageConfig.baseUrl}/uploads/gallery/test-image.jpg`,
      `${renderStorageConfig.baseUrl}/uploads/avatars/test-avatar.png`,
      `${renderStorageConfig.baseUrl}/uploads/videos/test-video.mp4`,
    ];

    testUrls.forEach((url) => {
      console.log(`   Test URL: ${url}`);
    });

    console.log("\n🎯 Test Summary:");
    console.log("   If you see any ❌ marks above, those need to be fixed.");
    console.log("   Check that all directories exist and are accessible.");
    console.log(
      "   Verify environment variables are set correctly in production."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFileStorage();
}

export default testFileStorage;
