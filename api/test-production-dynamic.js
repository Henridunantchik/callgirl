console.log("🧪 Testing Production Configuration Dynamically...");

// Simulate production environment BEFORE importing
process.env.NODE_ENV = "production";
process.env.RENDER_EXTERNAL_URL = "https://callgirls-api.onrender.com";

// Now import the config
import("./config/env.js").then(configModule => {
  const config = configModule.default;
  console.log("✅ Config loaded:", config.NODE_ENV);
  
  return import("./config/render-storage.js");
}).then(renderStorageModule => {
  const renderStorageConfig = renderStorageModule.default;
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
}).catch(error => {
  console.error("❌ Test failed:", error);
});
