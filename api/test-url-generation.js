import renderStorageConfig from "./config/render-storage.js";
import config from "./config/env.js";

console.log("🧪 Testing URL Generation...\n");

console.log("🌍 Environment:", config.NODE_ENV);
console.log("🔗 Base URL:", renderStorageConfig.baseUrl);
console.log("📁 Upload Path:", renderStorageConfig.uploadPath);
console.log("");

// Test different file paths
const testPaths = [
  "/opt/render/project/src/uploads/avatars/test-avatar.jpg",
  "/opt/render/project/src/uploads/gallery/test-photo.png",
  "/opt/render/project/src/uploads/videos/test-video.mp4",
  "C:\\Github\\callgirls\\api\\uploads\\avatars\\local-avatar.jpg",
];

console.log("🔗 Testing URL Generation:");
for (const filePath of testPaths) {
  try {
    const url = renderStorageConfig.getFileUrl(filePath);
    console.log(`   ${filePath}`);
    console.log(`   → ${url}`);
    console.log("");
  } catch (error) {
    console.error(`   ❌ Error with ${filePath}:`, error.message);
  }
}

console.log("✅ URL generation test completed");
