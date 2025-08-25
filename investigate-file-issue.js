#!/usr/bin/env node

/**
 * Investigate Specific File Issue
 * Finds out why a specific file is not accessible
 */

import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE = 'https://callgirls-api.onrender.com';

/**
 * Test specific problematic file
 */
const investigateFile = async () => {
  const problematicFile = '1756137337383-2d3h6brxzlw.jpg';
  
  console.log(`🔍 Investigating file: ${problematicFile}\n`);
  
  // Check if file exists locally
  const localPath = `./api/uploads/avatars/${problematicFile}`;
  if (fs.existsSync(localPath)) {
    const stats = fs.statSync(localPath);
    console.log(`✅ Local file exists:`);
    console.log(`  Path: ${localPath}`);
    console.log(`  Size: ${stats.size} bytes`);
    console.log(`  Created: ${stats.birthtime}`);
    console.log(`  Modified: ${stats.mtime}`);
  } else {
    console.log(`❌ Local file does NOT exist: ${localPath}`);
  }
  
  // Test direct access
  const url = `${API_BASE}/uploads/avatars/${problematicFile}`;
  console.log(`\n🔍 Testing direct access: ${url}`);
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
  
  // Check backup manager status
  console.log(`\n📁 Checking backup manager for this file...`);
  try {
    const backupResponse = await fetch(`${API_BASE}/debug/files`);
    if (backupResponse.ok) {
      const data = await backupResponse.json();
      const backupManager = data.data?.backupManager;
      
      if (backupManager) {
        console.log(`  Total Files: ${backupManager.totalFiles}`);
        console.log(`  Synced Files: ${backupManager.syncedFiles}`);
        console.log(`  Failed Files: ${backupManager.failedFiles}`);
        console.log(`  Last Sync: ${new Date(backupManager.lastSync).toLocaleString()}`);
      }
    }
  } catch (error) {
    console.log(`  Error checking backup manager: ${error.message}`);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🔍 Starting File Investigation...\n');
  
  try {
    await investigateFile();
    console.log('\n🎉 Investigation complete!');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
};

// Run the investigation
main().catch(console.error);
