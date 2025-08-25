#!/usr/bin/env node

/**
 * Test Local Upload to Production
 * Checks if local files are accessible in production
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const API_BASE = "https://callgirls-api.onrender.com";

/**
 * Get list of local files
 */
const getLocalFiles = () => {
  const uploadsDir = "./api/uploads";
  const files = [];

  if (fs.existsSync(uploadsDir)) {
    const scanDirectory = (dir, relativePath = "") => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);

        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, relativeItemPath);
        } else {
          files.push({
            localPath: fullPath,
            relativePath: relativeItemPath,
            url: `${API_BASE}/uploads/${relativeItemPath}`,
            size: fs.statSync(fullPath).size,
          });
        }
      }
    };

    scanDirectory(uploadsDir);
  }

  return files;
};

/**
 * Test file accessibility in production
 */
const testFileAccess = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return {
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    };
  } catch (error) {
    return {
      accessible: false,
      status: "ERROR",
      statusText: error.message,
      contentType: null,
      contentLength: null,
    };
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log("🔍 Testing Local Files in Production...\n");

  try {
    // Get local files
    const localFiles = getLocalFiles();
    console.log(`📁 Found ${localFiles.length} local files`);

    // Test first 10 files
    const testFiles = localFiles.slice(0, 10);
    console.log(`\n🧪 Testing first ${testFiles.length} files in production:`);

    let accessibleCount = 0;
    let inaccessibleCount = 0;

    for (const file of testFiles) {
      console.log(`\n🔍 Testing: ${file.relativePath}`);
      console.log(`  Local: ${file.localPath} (${file.size} bytes)`);
      console.log(`  URL: ${file.url}`);

      const test = await testFileAccess(file.url);

      if (test.accessible) {
        accessibleCount++;
        console.log(
          `  ✅ Production: ${test.contentType} (${test.contentLength} bytes)`
        );
      } else {
        inaccessibleCount++;
        console.log(`  ❌ Production: ${test.status} ${test.statusText}`);
      }
    }

    console.log(`\n📊 Test Results:`);
    console.log(`  Total tested: ${testFiles.length}`);
    console.log(`  Accessible in production: ${accessibleCount}`);
    console.log(`  Inaccessible in production: ${inaccessibleCount}`);
    console.log(
      `  Success rate: ${((accessibleCount / testFiles.length) * 100).toFixed(
        1
      )}%`
    );

    if (inaccessibleCount > 0) {
      console.log(
        `\n⚠️  ${inaccessibleCount} files are NOT accessible in production!`
      );
      console.log("   This means the backup manager is not syncing all files.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
main().catch(console.error);
