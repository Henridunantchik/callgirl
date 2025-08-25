#!/usr/bin/env node

/**
 * Test Production URLs
 * Finds the correct production API endpoints
 */

import fetch from "node-fetch";

const PROD_BASE = "https://callgirls-api.onrender.com";

/**
 * Test various API endpoints
 */
const testEndpoints = async () => {
  console.log("🔍 Testing Production API Endpoints...\n");

  const endpoints = [
    "/api/health",
    "/api/escort/list",
    "/api/escort/profile/Lola%20Lala",
    "/debug/files",
    "/api/storage/health",
    "/api/storage/sync",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${PROD_BASE}${endpoint}`);
      const status = response.ok ? "✅" : "❌";
      console.log(
        `${status} ${endpoint}: ${response.status} ${response.statusText}`
      );

      if (response.ok && endpoint.includes("escort")) {
        try {
          const data = await response.json();
          if (data.data?.escort) {
            const escort = data.data.escort;
            console.log(
              `    📊 ${escort.name}: Avatar=${!!escort.avatar}, Gallery=${
                escort.gallery?.length || 0
              }, Videos=${escort.videos?.length || 0}`
            );
          }
        } catch (parseError) {
          console.log(`    📊 Response not JSON`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
    }
  }
};

/**
 * Test file serving
 */
const testFileServing = async () => {
  console.log("\n📁 Testing File Serving...\n");

  try {
    // Get available files
    const response = await fetch(`${PROD_BASE}/debug/files`);
    if (response.ok) {
      const data = await response.json();
      const backupManager = data.data?.backupManager;

      if (backupManager) {
        console.log(`📊 Backup Manager Status:`);
        console.log(`  Total Files: ${backupManager.totalFiles}`);
        console.log(`  Synced Files: ${backupManager.syncedFiles}`);
        console.log(`  Failed Files: ${backupManager.failedFiles}`);
        console.log(
          `  Last Sync: ${new Date(backupManager.lastSync).toLocaleString()}`
        );
      }
    }
  } catch (error) {
    console.log(`❌ File serving test failed: ${error.message}`);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log("🚀 Testing Production API...\n");

  try {
    await testEndpoints();
    await testFileServing();

    console.log("\n🎉 Production API test complete!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
main().catch(console.error);
