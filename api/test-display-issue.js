console.log("🔍 Testing Photo Display Issue...\n");

// Simulate production environment
process.env.NODE_ENV = "production";
process.env.RENDER_EXTERNAL_URL = "https://callgirls-api.onrender.com";

console.log("🌍 Environment variables set:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL}`);
console.log("");

// Test URL generation
import("./config/render-storage.js").then(module => {
  const config = module.default;
  
  console.log("✅ Render storage config loaded");
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   Upload Path: ${config.uploadPath}`);
  console.log("");
  
  // Test different file types
  const testFiles = [
    "/opt/render/project/src/uploads/avatars/profile.jpg",
    "/opt/render/project/src/uploads/gallery/photo1.png",
    "/opt/render/project/src/uploads/videos/video1.mp4"
  ];
  
  console.log("🔗 Testing URL Generation:");
  testFiles.forEach(filePath => {
    const url = config.getFileUrl(filePath);
    console.log(`   ${filePath}`);
    console.log(`   → ${url}`);
    
    // Check if URL is correct
    if (url.includes("localhost:5000")) {
      console.log("   ❌ PROBLEM: URL contains localhost!");
    } else if (url.includes("callgirls-api.onrender.com")) {
      console.log("   ✅ URL looks correct for production");
    } else {
      console.log("   ⚠️  URL format is unusual");
    }
    console.log("");
  });
  
  console.log("📋 DIAGNOSIS:");
  if (process.env.NODE_ENV === "production") {
    console.log("   ✅ NODE_ENV is set to production");
  } else {
    console.log("   ❌ NODE_ENV is not production");
  }
  
  console.log("\n🎯 SOLUTION:");
  console.log("   1. Set NODE_ENV=production in Render environment variables");
  console.log("   2. Set RENDER_EXTERNAL_URL=https://callgirls-api.onrender.com");
  console.log("   3. Redeploy your API");
  console.log("   4. Test upload again");
  
}).catch(error => {
  console.error("❌ Error:", error.message);
});
