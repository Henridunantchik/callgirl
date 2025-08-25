#!/usr/bin/env node

/**
 * Simple Database URL Fix Script
 * Fixes obsolete URLs for photos, videos, and avatars
 */

import fetch from 'node-fetch';

const API_BASE = 'https://callgirls-api.onrender.com';

/**
 * Test file accessibility
 */
const testFileAccess = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    };
  } catch (error) {
    return {
      accessible: false,
      status: 'ERROR',
      statusText: error.message,
      contentType: null,
      contentLength: null
    };
  }
};

/**
 * Get escort profile data
 */
const getEscortProfile = async (slug) => {
  try {
    const response = await fetch(`${API_BASE}/api/escort/profile/${slug}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get escort profile:', error);
    return null;
  }
};

/**
 * Test all media files for an escort
 */
const testEscortMedia = async (slug) => {
  console.log(`\n🔍 Testing escort: ${slug}`);
  
  const profile = await getEscortProfile(slug);
  if (!profile || !profile.data?.escort) {
    console.log('❌ No profile data found');
    return;
  }
  
  const escort = profile.data.escort;
  console.log(`📊 Profile: ${escort.name} (${escort.email})`);
  
  // Test avatar
  if (escort.avatar) {
    console.log('\n👤 Testing Avatar:');
    const avatarTest = await testFileAccess(escort.avatar);
    if (avatarTest.accessible) {
      console.log(`  ✅ ${escort.avatar}: ${avatarTest.contentType} (${avatarTest.contentLength} bytes)`);
    } else {
      console.log(`  ❌ ${escort.avatar}: ${avatarTest.status} ${avatarTest.statusText}`);
    }
  }
  
  // Test gallery photos
  if (escort.gallery && Array.isArray(escort.gallery)) {
    console.log(`\n📸 Testing Gallery (${escort.gallery.length} photos):`);
    for (const photo of escort.gallery) {
      const photoTest = await testFileAccess(photo.url);
      if (photoTest.accessible) {
        console.log(`  ✅ ${photo.url}: ${photoTest.contentType} (${photoTest.contentLength} bytes)`);
      } else {
        console.log(`  ❌ ${photo.url}: ${photoTest.status} ${photoTest.statusText}`);
      }
    }
  }
  
  // Test videos
  if (escort.videos && Array.isArray(escort.videos)) {
    console.log(`\n🎥 Testing Videos (${escort.videos.length} videos):`);
    for (const video of escort.videos) {
      const videoTest = await testFileAccess(video.url);
      if (videoTest.accessible) {
        console.log(`  ✅ ${video.url}: ${videoTest.contentType} (${videoTest.contentLength} bytes)`);
      } else {
        console.log(`  ❌ ${video.url}: ${videoTest.status} ${videoTest.statusText}`);
      }
    }
  }
};

/**
 * Get available files from backup manager
 */
const getAvailableFiles = async () => {
  try {
    const response = await fetch(`${API_BASE}/debug/files`);
    if (response.ok) {
      const data = await response.json();
      return data.data?.backupManager || null;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get available files:', error);
    return null;
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🔍 Starting Media File Test...\n');
  
  try {
    // Test specific escort
    await testEscortMedia('Lola%20Lala');
    
    // Get available files info
    console.log('\n📁 Checking Backup Manager Status:');
    const backupManager = await getAvailableFiles();
    if (backupManager) {
      console.log(`  Total Files: ${backupManager.totalFiles}`);
      console.log(`  Synced Files: ${backupManager.syncedFiles}`);
      console.log(`  Failed Files: ${backupManager.failedFiles}`);
      console.log(`  Last Sync: ${new Date(backupManager.lastSync).toLocaleString()}`);
    }
    
    console.log('\n🎉 Media test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
main().catch(console.error);
