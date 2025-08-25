#!/usr/bin/env node

/**
 * Test File Loading
 * Checks if Lola Lala's photos and videos actually load
 */

import fetch from "node-fetch";

const PROD_BASE = "https://callgirls-api.onrender.com";

/**
 * Test specific file loading
 */
const testFileLoading = async () => {
  console.log("🔍 Testing File Loading for Lola Lala...\n");

  try {
    // Get Lola Lala's profile first
    const profileResponse = await fetch(
      `${PROD_BASE}/api/escort/profile/Lola%20Lala`
    );
    if (!profileResponse.ok) {
      console.log("❌ Cannot get Lola Lala profile");
      return;
    }

    const profileData = await profileResponse.json();
    const escort = profileData.data?.escort;

    if (!escort) {
      console.log("❌ No escort data found");
      return;
    }

    console.log(`📊 Profile: ${escort.name}`);
    console.log(`  Avatar: ${escort.avatar || "None"}`);
    console.log(`  Gallery: ${escort.gallery?.length || 0} photos`);
    console.log(`  Videos: ${escort.videos?.length || 0} videos`);

    // Test avatar loading
    if (escort.avatar) {
      console.log(`\n👤 Testing Avatar: ${escort.avatar}`);
      try {
        const avatarResponse = await fetch(escort.avatar);
        if (avatarResponse.ok) {
          const contentType = avatarResponse.headers.get("content-type");
          const contentLength = avatarResponse.headers.get("content-length");
          console.log(
            `  ✅ Avatar loads: ${contentType} (${contentLength} bytes)`
          );
        } else {
          console.log(
            `  ❌ Avatar fails: ${avatarResponse.status} ${avatarResponse.statusText}`
          );
        }
      } catch (error) {
        console.log(`  ❌ Avatar error: ${error.message}`);
      }
    }

    // Test gallery photos loading
    if (escort.gallery && escort.gallery.length > 0) {
      console.log(`\n📸 Testing Gallery Photos:`);
      for (let i = 0; i < escort.gallery.length; i++) {
        const photo = escort.gallery[i];
        console.log(`  Photo ${i + 1}: ${photo.url}`);

        try {
          const photoResponse = await fetch(photo.url);
          if (photoResponse.ok) {
            const contentType = photoResponse.headers.get("content-type");
            const contentLength = photoResponse.headers.get("content-length");
            console.log(
              `    ✅ Loads: ${contentType} (${contentLength} bytes)`
            );
          } else {
            console.log(
              `    ❌ Fails: ${photoResponse.status} ${photoResponse.statusText}`
            );
          }
        } catch (error) {
          console.log(`    ❌ Error: ${error.message}`);
        }
      }
    }

    // Test videos loading
    if (escort.videos && escort.videos.length > 0) {
      console.log(`\n🎥 Testing Videos:`);
      for (let i = 0; i < escort.videos.length; i++) {
        const video = escort.videos[i];
        console.log(`  Video ${i + 1}: ${video.url}`);

        try {
          const videoResponse = await fetch(video.url);
          if (videoResponse.ok) {
            const contentType = videoResponse.headers.get("content-type");
            const contentLength = videoResponse.headers.get("content-length");
            console.log(
              `    ✅ Loads: ${contentType} (${contentLength} bytes)`
            );
          } else {
            console.log(
              `    ❌ Fails: ${videoResponse.status} ${videoResponse.statusText}`
            );
          }
        } catch (error) {
          console.log(`    ❌ Error: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ File loading test failed:", error);
  }
};

/**
 * Test backup manager status
 */
const testBackupManager = async () => {
  console.log("\n📁 Testing Backup Manager...\n");

  try {
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
        console.log(`  Render Status: ${backupManager.renderStatus}`);
      }
    }
  } catch (error) {
    console.log(`❌ Backup manager test failed: ${error.message}`);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log("🚀 Testing Why Files Don't Load...\n");

  try {
    await testFileLoading();
    await testBackupManager();

    console.log("\n🎉 File loading test complete!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
main().catch(console.error);
