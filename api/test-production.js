console.log("🧪 Testing Production Configuration...");

// Simulate production environment
process.env.NODE_ENV = "production";
process.env.RENDER_EXTERNAL_URL = "https://callgirls-api.onrender.com";

import config from "./config/env.js";
console.log("✅ Config loaded:", config.NODE_ENV);

import renderStorageConfig from "./config/render-storage.js";
console.log("✅ Render storage config loaded");

console.log("🔗 Base URL:", renderStorageConfig.baseUrl);
console.log("📁 Upload Path:", renderStorageConfig.uploadPath);

// Test production URL generation
const testPaths = [
  "/opt/render/project/src/uploads/avatars/test-avatar.jpg",
  "/opt/render/project/src/uploads/gallery/test-photo.png",
  "/opt/render/project/src/uploads/videos/test-video.mp4",
];

console.log("\n🔗 Testing Production URL Generation:");
for (const testPath of testPaths) {
  try {
    const url = renderStorageConfig.getFileUrl(testPath);
    console.log(`   ${testPath}`);
    console.log(`   → ${url}`);
    console.log("");
  } catch (error) {
    console.error(`   ❌ Error with ${testPath}:`, error.message);
  }
}

console.log("✅ Production test completed");
