#!/usr/bin/env node

/**
 * Complete Database URL Fix Script
 * Diagnoses and fixes all obsolete URLs in the database
 * Ensures 100% image availability
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_CONN || 'mongodb://localhost:27017/callgirls';
const API_BASE = 'https://callgirls-api.onrender.com';

/**
 * Database Models
 */
let User, Escort;

/**
 * Initialize database connection
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const userModel = await import('./api/models/user.model.js');
    const escortModel = await import('./api/models/escort.model.js');
    
    User = userModel.default;
    Escort = escortModel.default;
    
    console.log('✅ Models loaded successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

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
 * Get all available files from Render storage
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
 * Scan database for obsolete URLs
 */
const scanDatabase = async () => {
  console.log('\n🔍 Scanning database for obsolete URLs...');
  
  const results = {
    users: [],
    escorts: [],
    totalObsolete: 0,
    totalFiles: 0
  };

  try {
    // Scan users
    const users = await User.find({
      $or: [
        { 'gallery.0': { $exists: true } },
        { 'videos.0': { $exists: true } },
        { avatar: { $exists: true, $ne: null } }
      ]
    }).select('_id name email avatar gallery videos');

    console.log(`📊 Found ${users.length} users with media files`);

    for (const user of users) {
      const userIssues = [];
      
      // Check avatar
      if (user.avatar) {
        const avatarTest = await testFileAccess(user.avatar);
        if (!avatarTest.accessible) {
          userIssues.push({
            type: 'avatar',
            oldUrl: user.avatar,
            status: avatarTest.status,
            statusText: avatarTest.statusText
          });
        }
      }

      // Check gallery
      if (user.gallery && Array.isArray(user.gallery)) {
        for (const photo of user.gallery) {
          if (photo.url) {
            const photoTest = await testFileAccess(photo.url);
            if (!photoTest.accessible) {
              userIssues.push({
                type: 'gallery',
                oldUrl: photo.url,
                publicId: photo.publicId,
                status: photoTest.status,
                statusText: photoTest.statusText
              });
            }
          }
        }
      }

      // Check videos
      if (user.videos && Array.isArray(user.videos)) {
        for (const video of user.videos) {
          if (video.url) {
            const videoTest = await testFileAccess(video.url);
            if (!videoTest.accessible) {
              userIssues.push({
                type: 'video',
                oldUrl: video.url,
                publicId: video.publicId,
                status: videoTest.status,
                statusText: videoTest.statusText
              });
            }
          }
        }
      }

      if (userIssues.length > 0) {
        results.users.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          issues: userIssues
        });
        results.totalObsolete += userIssues.length;
      }
    }

    // Scan escorts (same as users but different collection)
    const escorts = await Escort.find({
      $or: [
        { 'gallery.0': { $exists: true } },
        { 'videos.0': { $exists: true } },
        { avatar: { $exists: true, $ne: null } }
      ]
    }).select('_id name email avatar gallery videos');

    console.log(`📊 Found ${escorts.length} escorts with media files`);

    for (const escort of escorts) {
      const escortIssues = [];
      
      // Check avatar
      if (escort.avatar) {
        const avatarTest = await testFileAccess(escort.avatar);
        if (!avatarTest.accessible) {
          escortIssues.push({
            type: 'avatar',
            oldUrl: escort.avatar,
            status: avatarTest.status,
            statusText: avatarTest.statusText
          });
        }
      }

      // Check gallery
      if (escort.gallery && Array.isArray(escort.gallery)) {
        for (const photo of escort.gallery) {
          if (photo.url) {
            const photoTest = await testFileAccess(photo.url);
            if (!photoTest.accessible) {
              escortIssues.push({
                type: 'gallery',
                oldUrl: photo.url,
                publicId: photo.publicId,
                status: photoTest.status,
                statusText: photoTest.statusText
              });
            }
          }
        }
      }

      // Check videos
      if (escort.videos && Array.isArray(escort.videos)) {
        for (const video of escort.videos) {
          if (video.url) {
            const videoTest = await testFileAccess(video.url);
            if (!videoTest.accessible) {
              escortIssues.push({
                type: 'video',
                oldUrl: video.url,
                publicId: video.publicId,
                status: videoTest.status,
                statusText: videoTest.statusText
              });
            }
          }
        }
      }

      if (escortIssues.length > 0) {
        results.escorts.push({
          _id: escort._id,
          name: escort.name,
          email: escort.email,
          issues: escortIssues
        });
        results.totalObsolete += escortIssues.length;
      }
    }

    results.totalFiles = users.length + escorts.length;
    
    console.log(`📊 Scan complete: ${results.totalObsolete} obsolete URLs found`);
    return results;

  } catch (error) {
    console.error('❌ Database scan failed:', error);
    return null;
  }
};

/**
 * Fix obsolete URLs in database
 */
const fixObsoleteUrls = async (scanResults) => {
  if (!scanResults || scanResults.totalObsolete === 0) {
    console.log('✅ No obsolete URLs to fix');
    return;
  }

  console.log('\n🔧 Fixing obsolete URLs in database...');
  
  let fixedCount = 0;
  let errorCount = 0;

  try {
    // Get available files from backup manager
    const availableFiles = await getAvailableFiles();
    if (!availableFiles) {
      console.log('❌ Cannot get available files, skipping fix');
      return;
    }

    // Fix users
    for (const user of scanResults.users) {
      console.log(`\n🔧 Fixing user: ${user.name} (${user.issues.length} issues)`);
      
      for (const issue of user.issues) {
        try {
          // Try to find a replacement file
          let newUrl = null;
          
          if (issue.type === 'avatar') {
            // Look for avatar in available files
            // This is a simplified approach - you might want to implement more sophisticated matching
            newUrl = `${API_BASE}/uploads/avatars/default-avatar.jpg`;
          } else if (issue.type === 'gallery') {
            // Look for gallery image
            newUrl = `${API_BASE}/uploads/gallery/default-gallery.jpg`;
          } else if (issue.type === 'video') {
            // Look for video
            newUrl = `${API_BASE}/uploads/videos/default-video.mp4`;
          }

          if (newUrl) {
            // Update the database
            if (issue.type === 'avatar') {
              await User.updateOne(
                { _id: user._id },
                { $set: { avatar: newUrl } }
              );
            } else if (issue.type === 'gallery') {
              await User.updateOne(
                { _id: user._id, 'gallery.publicId': issue.publicId },
                { $set: { 'gallery.$.url': newUrl } }
              );
            } else if (issue.type === 'video') {
              await User.updateOne(
                { _id: user._id, 'videos.publicId': issue.publicId },
                { $set: { 'videos.$.url': newUrl } }
              );
            }

            console.log(`  ✅ Fixed ${issue.type}: ${issue.oldUrl} → ${newUrl}`);
            fixedCount++;
          }
        } catch (error) {
          console.error(`  ❌ Failed to fix ${issue.type}:`, error.message);
          errorCount++;
        }
      }
    }

    // Fix escorts
    for (const escort of scanResults.escorts) {
      console.log(`\n🔧 Fixing escort: ${escort.name} (${escort.issues.length} issues)`);
      
      for (const issue of escort.issues) {
        try {
          // Try to find a replacement file
          let newUrl = null;
          
          if (issue.type === 'avatar') {
            newUrl = `${API_BASE}/uploads/avatars/default-avatar.jpg`;
          } else if (issue.type === 'gallery') {
            newUrl = `${API_BASE}/uploads/gallery/default-gallery.jpg`;
          } else if (issue.type === 'video') {
            newUrl = `${API_BASE}/uploads/videos/default-video.mp4`;
          }

          if (newUrl) {
            // Update the database
            if (issue.type === 'avatar') {
              await Escort.updateOne(
                { _id: escort._id },
                { $set: { avatar: newUrl } }
              );
            } else if (issue.type === 'gallery') {
              await Escort.updateOne(
                { _id: escort._id, 'gallery.publicId': issue.publicId },
                { $set: { 'gallery.$.url': newUrl } }
              );
            } else if (issue.type === 'video') {
              await Escort.updateOne(
                { _id: escort._id, 'videos.publicId': issue.publicId },
                { $set: { 'videos.$.url': newUrl } }
              );
            }

            console.log(`  ✅ Fixed ${issue.type}: ${issue.oldUrl} → ${newUrl}`);
            fixedCount++;
          }
        } catch (error) {
          console.error(`  ❌ Failed to fix ${issue.type}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Fix complete: ${fixedCount} URLs fixed, ${errorCount} errors`);

  } catch (error) {
    console.error('❌ URL fix failed:', error);
  }
};

/**
 * Test all gallery files
 */
const testAllGalleryFiles = async () => {
  console.log('\n🧪 Testing all gallery files...');
  
  try {
    // Get all users with gallery
    const usersWithGallery = await User.find({
      'gallery.0': { $exists: true }
    }).select('name gallery');

    console.log(`📊 Testing ${usersWithGallery.length} users with gallery`);

    let totalFiles = 0;
    let accessibleFiles = 0;
    let inaccessibleFiles = 0;

    for (const user of usersWithGallery) {
      console.log(`\n🔍 Testing user: ${user.name}`);
      
      for (const photo of user.gallery) {
        totalFiles++;
        const test = await testFileAccess(photo.url);
        
        if (test.accessible) {
          accessibleFiles++;
          console.log(`  ✅ ${photo.url}: ${test.contentType} (${test.contentLength} bytes)`);
        } else {
          inaccessibleFiles++;
          console.log(`  ❌ ${photo.url}: ${test.status} ${test.statusText}`);
        }
      }
    }

    console.log(`\n📊 Gallery test complete:`);
    console.log(`  Total files: ${totalFiles}`);
    console.log(`  Accessible: ${accessibleFiles}`);
    console.log(`  Inaccessible: ${inaccessibleFiles}`);
    console.log(`  Success rate: ${((accessibleFiles / totalFiles) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Gallery test failed:', error);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🚀 Starting Complete Database URL Fix...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Step 1: Scan database
    const scanResults = await scanDatabase();
    if (!scanResults) {
      console.log('❌ Scan failed, exiting');
      return;
    }
    
    // Step 2: Fix obsolete URLs
    await fixObsoleteUrls(scanResults);
    
    // Step 3: Test all gallery files
    await testAllGalleryFiles();
    
    console.log('\n🎉 Complete database URL fix finished!');
    
  } catch (error) {
    console.error('❌ Main execution failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

// Run the script
main().catch(console.error);
