#!/usr/bin/env node

/**
 * Test Synchronization Status
 * Simple test to check why Backup Manager reports 0 files
 */

import fetch from "node-fetch";

const PROD_API = "https://callgirls-api.onrender.com";

const testSyncStatus = async () => {
  console.log("🔍 Testing Synchronization Status...\n");
  
  try {
    // Test backup manager status
    console.log("📊 Testing Backup Manager...");
    const backupResponse = await fetch(`${PROD_API}/debug/files`);
    const backupData = await backupResponse.json();
    
    console.log("✅ Backup Manager Response:");
    console.log(`   Total Files: ${backupData.data.backupManager.totalFiles}`);
    console.log(`   Synced Files: ${backupData.data.backupManager.syncedFiles}`);
    console.log(`   Failed Files: ${backupData.data.backupManager.failedFiles}`);
    console.log(`   Last Sync: ${backupData.data.backupManager.lastSyncTime}`);
    console.log(`   Render Status: ${backupData.data.backupManager.renderStatus}`);
    
    // Test storage health
    console.log("\n📁 Testing Storage Health...");
    const healthResponse = await fetch(`${PROD_API}/api/storage/health`);
    const healthData = await healthResponse.json();
    
    console.log("✅ Storage Health:");
    console.log(`   Render Files: ${healthData.data.storageHealth.render.fileCount}`);
    console.log(`   Local Files: ${healthData.data.storageHealth.local.fileCount}`);
    console.log(`   Upload Path: ${healthData.data.storageHealth.render.path}`);
    
    // Test specific file access
    console.log("\n📸 Testing File Access...");
    const testFile = "1756139363733-appg9nupzmb.jpg";
    const fileUrl = `${PROD_API}/uploads/avatars/${testFile}`;
    
    try {
      const fileResponse = await fetch(fileUrl);
      console.log(`   Avatar ${testFile}: ${fileResponse.status} ${fileResponse.statusText}`);
    } catch (error) {
      console.log(`   Avatar ${testFile}: ❌ ${error.message}`);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testSyncStatus().catch(console.error);
