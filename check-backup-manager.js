#!/usr/bin/env node

/**
 * Backup Manager Diagnostic Script
 * Checks why the backup manager is not syncing all files
 */

import fetch from 'node-fetch';

const API_BASE = 'https://callgirls-api.onrender.com';

/**
 * Check backup manager status
 */
const checkBackupManager = async () => {
  console.log('🔍 Checking Backup Manager Status...\n');
  
  try {
    // Get backup manager stats
    const response = await fetch(`${API_BASE}/debug/files`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const backupManager = data.data?.backupManager;
    
    if (!backupManager) {
      console.log('❌ No backup manager data found');
      return;
    }
    
    console.log('📊 Backup Manager Status:');
    console.log(`  Total Files: ${backupManager.totalFiles}`);
    console.log(`  Synced Files: ${backupManager.syncedFiles}`);
    console.log(`  Failed Files: ${backupManager.failedFiles}`);
    console.log(`  Last Sync: ${new Date(backupManager.lastSync).toLocaleString()}`);
    console.log(`  Render Status: ${backupManager.renderStatus}`);
    console.log(`  Local Backup Path: ${backupManager.localBackupPath}`);
    console.log(`  Render Path: ${backupManager.renderPath}`);
    
    // Check storage health
    const healthResponse = await fetch(`${API_BASE}/api/storage/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('\n📁 Storage Health:');
      console.log(`  Render Storage: ${healthData.data.render.accessible ? '✅' : '❌'} (${healthData.data.render.fileCount} files)`);
      console.log(`  Local Backup: ${healthData.data.local.accessible ? '✅' : '❌'} (${healthData.data.local.fileCount} files)`);
      console.log(`  Overall Status: ${healthData.status}`);
    }
    
    // Check if there's a mismatch
    if (backupManager.totalFiles !== backupManager.syncedFiles) {
      console.log('\n⚠️  SYNC MISMATCH DETECTED!');
      console.log(`  Expected: ${backupManager.totalFiles} files`);
      console.log(`  Actually synced: ${backupManager.syncedFiles} files`);
      console.log(`  Failed: ${backupManager.failedFiles} files`);
    }
    
  } catch (error) {
    console.error('❌ Backup manager check failed:', error.message);
  }
};

/**
 * Check file synchronization
 */
const checkFileSync = async () => {
  console.log('\n🔄 Checking File Synchronization...\n');
  
  try {
    // Get available files from backup manager
    const response = await fetch(`${API_BASE}/debug/files`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const backupManager = data.data?.backupManager;
    
    if (!backupManager) {
      console.log('❌ No backup manager data found');
      return;
    }
    
    // Check if local backup has more files than Render
    const localPath = backupManager.localBackupPath;
    const renderPath = backupManager.renderPath;
    
    console.log('📁 File Count Analysis:');
    console.log(`  Local Backup: ${backupManager.totalFiles} files`);
    console.log(`  Render Storage: ${backupManager.syncedFiles} files`);
    
    if (backupManager.totalFiles > backupManager.syncedFiles) {
      console.log('\n🚨 SYNCHRONIZATION ISSUE DETECTED!');
      console.log(`  Local backup has ${backupManager.totalFiles} files`);
      console.log(`  But only ${backupManager.syncedFiles} were synced to Render`);
      console.log(`  ${backupManager.totalFiles - backupManager.syncedFiles} files are missing from Render`);
      
      // Check if this is a path issue
      if (localPath !== renderPath) {
        console.log('\n🔍 Path Mismatch Detected:');
        console.log(`  Local: ${localPath}`);
        console.log(`  Render: ${renderPath}`);
        console.log('  This might cause sync issues!');
      }
    }
    
  } catch (error) {
    console.error('❌ File sync check failed:', error.message);
  }
};

/**
 * Test specific file access
 */
const testSpecificFiles = async () => {
  console.log('\n🧪 Testing Specific File Access...\n');
  
  const testFiles = [
    'https://callgirls-api.onrender.com/uploads/gallery/1755688746998-nlkxr0ahkxd.jpg',
    'https://callgirls-api.onrender.com/uploads/gallery/1756129637337-erzgr4i91l5.jpg',
    'https://callgirls-api.onrender.com/uploads/avatars/1755688487198-xgn787so3r.jpg'
  ];
  
  for (const fileUrl of testFiles) {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const status = response.ok ? '✅' : '❌';
      const details = response.ok 
        ? `${response.headers.get('content-type')} (${response.headers.get('content-length')} bytes)`
        : `${response.status} ${response.statusText}`;
      
      console.log(`${status} ${fileUrl}: ${details}`);
    } catch (error) {
      console.log(`❌ ${fileUrl}: Error - ${error.message}`);
    }
  }
};

/**
 * Force backup sync
 */
const forceBackupSync = async () => {
  console.log('\n🚀 Forcing Backup Sync...\n');
  
  try {
    const response = await fetch(`${API_BASE}/api/storage/sync`, {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backup sync initiated:', data.message);
      
      // Wait a bit and check status again
      console.log('⏳ Waiting 10 seconds for sync to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log('🔍 Checking sync status after forced sync...');
      await checkBackupManager();
      
    } else {
      console.log('❌ Failed to force backup sync:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Force sync failed:', error.message);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🔍 Starting Backup Manager Diagnostic...\n');
  
  try {
    // Step 1: Check backup manager status
    await checkBackupManager();
    
    // Step 2: Check file synchronization
    await checkFileSync();
    
    // Step 3: Test specific files
    await testSpecificFiles();
    
    // Step 4: Force backup sync if needed
    console.log('\n❓ Do you want to force a backup sync? (y/n)');
    // For now, let's force it automatically
    await forceBackupSync();
    
    console.log('\n🎉 Backup manager diagnostic complete!');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
};

// Run the diagnostic
main().catch(console.error);
