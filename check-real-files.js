#!/usr/bin/env node

/**
 * Check Real Files on Server
 * Finds out which files actually exist on the server
 */

import fetch from "node-fetch";

const PROD_BASE = "https://callgirls-api.onrender.com";

/**
 * Test file existence
 */
const testFileExistence = async () => {
  console.log("🔍 Testing Which Files Actually Exist on Server...\n");

  // Test files we know should exist
  const testFiles = [
    // Files that worked before
    "/uploads/gallery/1755688746998-nlkxr0ahkxd.jpg",
    "/uploads/avatars/1755688487198-xgn787so3r.jpg",

    // Files from Lola Lala that don't work
    "/uploads/avatars/1756137337383-2d3h6brxzlw.jpg",
    "/uploads/gallery/1756137362955-3gt7tdzxh9f.jpg",
    "/uploads/videos/1756137374496-kf25xqwng6m.mp4",

    // Random test files
    "/uploads/test.jpg",
    "/uploads/random-file.jpg",
  ];

  for (const filePath of testFiles) {
    const url = `${PROD_BASE}${filePath}`;
    try {
      const response = await fetch(url, { method: "HEAD" });
      const status = response.ok ? "✅" : "❌";
      const details = response.ok
        ? `${response.headers.get("content-type")} (${response.headers.get(
            "content-length"
          )} bytes)`
        : `${response.status} ${response.statusText}`;

      console.log(`${status} ${filePath}: ${details}`);
    } catch (error) {
      console.log(`❌ ${filePath}: Error - ${error.message}`);
    }
  }
};

/**
 * Check backup manager details
 */
const checkBackupManagerDetails = async () => {
  console.log("\n📁 Checking Backup Manager Details...\n");

  try {
    const response = await fetch(`${PROD_BASE}/debug/files`);
    if (response.ok) {
      const data = await response.json();
      const backupManager = data.data?.backupManager;

      if (backupManager) {
        console.log(`📊 Backup Manager Details:`);
        console.log(`  Total Files: ${backupManager.totalFiles}`);
        console.log(`  Synced Files: ${backupManager.syncedFiles}`);
        console.log(`  Failed Files: ${backupManager.failedFiles}`);
        console.log(
          `  Last Sync: ${new Date(backupManager.lastSync).toLocaleString()}`
        );
        console.log(`  Render Status: ${backupManager.renderStatus}`);
        console.log(`  Local Backup Path: ${backupManager.localBackupPath}`);
        console.log(`  Render Path: ${backupManager.renderPath}`);

        // Check if there's a mismatch
        if (backupManager.totalFiles !== backupManager.syncedFiles) {
          console.log(`\n⚠️  MISMATCH DETECTED!`);
          console.log(`  Expected: ${backupManager.totalFiles} files`);
          console.log(`  Actually synced: ${backupManager.syncedFiles} files`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Backup manager check failed: ${error.message}`);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log("🚀 Checking Real Files on Server...\n");

  try {
    await testFileExistence();
    await checkBackupManagerDetails();

    console.log("\n🎉 File existence check complete!");
  } catch (error) {
    console.error("❌ Check failed:", error);
  }
};

// Run the check
main().catch(console.error);
