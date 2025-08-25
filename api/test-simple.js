console.log("🧪 Simple Test Starting...");

import config from "./config/env.js";
console.log("✅ Config loaded:", config.NODE_ENV);

import renderStorageConfig from "./config/render-storage.js";
console.log("✅ Render storage config loaded");

console.log("🔗 Base URL:", renderStorageConfig.baseUrl);
console.log("📁 Upload Path:", renderStorageConfig.uploadPath);

// Test one URL generation
const testPath = "/opt/render/project/src/uploads/avatars/test.jpg";
console.log("🔗 Testing URL generation for:", testPath);

try {
  const url = renderStorageConfig.getFileUrl(testPath);
  console.log("✅ Generated URL:", url);
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("✅ Test completed"); 