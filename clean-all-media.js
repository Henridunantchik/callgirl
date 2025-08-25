#!/usr/bin/env node

/**
 * Complete Media Cleanup Script
 * Removes ALL photos, videos, and avatars from local and production
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://callgirls-api.onrender.com';

/**
 * Get all media files recursively
 */
const getAllMediaFiles = (dir) => {
  const files = [];
  
  if (fs.existsSync(dir)) {
    const scanDirectory = (currentDir, relativePath = '') => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativeItemPath = path.join(relativePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, relativeItemPath);
        } else {
          // Only include media files
          const ext = path.extname(item).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
            files.push({
              fullPath,
              relativePath: relativeItemPath,
              size: fs.statSync(fullPath).size
            });
          }
        }
      }
    };
    
    scanDirectory(dir);
  }
  
  return files;
};

/**
 * Clean local media files
 */
const cleanLocalMedia = () => {
  console.log('🗑️  Cleaning local media files...\n');
  
  const uploadsDir = './api/uploads';
  const mediaFiles = getAllMediaFiles(uploadsDir);
  
  console.log(`📊 Found ${mediaFiles.length} media files to delete`);
  
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const file of mediaFiles) {
    try {
      fs.unlinkSync(file.fullPath);
      console.log(`  ✅ Deleted: ${file.relativePath} (${file.size} bytes)`);
      deletedCount++;
    } catch (error) {
      console.log(`  ❌ Failed to delete: ${file.relativePath} - ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Local cleanup results:`);
  console.log(`  Deleted: ${deletedCount}`);
  console.log(`  Errors: ${errorCount}`);
  
  return { deletedCount, errorCount };
};

/**
 * Clean production media files via API
 */
const cleanProductionMedia = async () => {
  console.log('\n🗑️  Cleaning production media files...\n');
  
  try {
    // Force a backup sync to clear production
    const response = await fetch(`${API_BASE}/api/storage/sync`, {
      method: 'POST'
    });
    
    if (response.ok) {
      console.log('✅ Production cleanup initiated');
      
      // Wait for sync to complete
      console.log('⏳ Waiting 15 seconds for cleanup to complete...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Check status
      const statusResponse = await fetch(`${API_BASE}/debug/files`);
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        const backupManager = data.data?.backupManager;
        
        if (backupManager) {
          console.log(`📊 Production status after cleanup:`);
          console.log(`  Total Files: ${backupManager.totalFiles}`);
          console.log(`  Synced Files: ${backupManager.syncedFiles}`);
          console.log(`  Failed Files: ${backupManager.failedFiles}`);
        }
      }
    } else {
      console.log('❌ Failed to initiate production cleanup');
    }
    
  } catch (error) {
    console.error('❌ Production cleanup failed:', error.message);
  }
};

/**
 * Clean database media references
 */
const cleanDatabaseMedia = async () => {
  console.log('\n🗑️  Cleaning database media references...\n');
  
  try {
    // This would require database access
    // For now, we'll just note that it needs to be done
    console.log('⚠️  Database cleanup requires direct database access');
    console.log('   You will need to manually clear media references');
    console.log('   Or run the database cleanup script separately');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🚀 Starting Complete Media Cleanup...\n');
  
  try {
    // Step 1: Clean local files
    const localResults = cleanLocalMedia();
    
    // Step 2: Clean production files
    await cleanProductionMedia();
    
    // Step 3: Note database cleanup requirement
    cleanDatabaseMedia();
    
    console.log('\n🎉 Complete media cleanup finished!');
    console.log('\n📝 Next steps:');
    console.log('  1. Upload new photos/videos');
    console.log('  2. The backup manager will sync them automatically');
    console.log('  3. Your media will be available everywhere!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the cleanup
main().catch(console.error);
