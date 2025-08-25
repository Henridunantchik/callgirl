#!/usr/bin/env node

/**
 * Force Backup Manager Sync
 * Forces immediate synchronization of all files
 */

import fetch from "node-fetch";

const PROD_API = "https://callgirls-api.onrender.com";

const forceSync = async () => {
  console.log("🚀 Forcing Backup Manager Sync...\n");
  
  try {
    // Force sync
    console.log("🔄 Forcing sync...");
    const syncResponse = await fetch(`${PROD_API}/api/storage/sync`, {
      method: 'POST'
    });
    
    if (syncResponse.ok) {
      console.log("✅ Sync forced successfully");
      
      // Wait a moment for sync to complete
      console.log("⏳ Waiting for sync to complete...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check status after sync
      console.log("\n📊 Checking status after sync...");
      const statusResponse = await fetch(`${PROD_API}/debug/files`);
      const statusData = await statusResponse.json();
      
      console.log("✅ Post-sync status:");
      console.log(`   Total Files: ${statusData.data.backupManager.totalFiles}`);
      console.log(`   Synced Files: ${statusData.data.backupManager.syncedFiles}`);
      console.log(`   Failed Files: ${statusData.data.backupManager.failedFiles}`);
      console.log(`   Last Sync: ${statusData.data.backupManager.lastSyncTime}`);
      console.log(`   Render Status: ${statusData.data.backupManager.renderStatus}`);
      
    } else {
      console.log(`❌ Sync failed: ${syncResponse.status} ${syncResponse.statusText}`);
    }
    
  } catch (error) {
    console.error("❌ Force sync failed:", error.message);
  }
};

forceSync().catch(console.error);
