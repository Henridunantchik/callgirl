console.log("🔍 QUICK CHECK - Photo Display Issues\n");

// Check environment
console.log("🌍 Environment Check:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
console.log(
  `   RENDER_STORAGE_PATH: ${process.env.RENDER_STORAGE_PATH || "undefined"}`
);
console.log(
  `   RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL || "undefined"}`
);
console.log("");

// Check if we can import the config
try {
  import("./config/env.js")
    .then((configModule) => {
      const config = configModule.default;
      console.log("✅ Config loaded successfully");
      console.log(`   Environment: ${config.NODE_ENV}`);
      console.log(`   Base URL: ${config.BASE_URL}`);
      console.log("");

      return import("./config/render-storage.js");
    })
    .then((renderStorageModule) => {
      const renderStorageConfig = renderStorageModule.default;
      console.log("✅ Render storage config loaded");
      console.log(`   Base URL: ${renderStorageConfig.baseUrl}`);
      console.log(`   Upload Path: ${renderStorageConfig.uploadPath}`);
      console.log("");

      // Test URL generation
      console.log("🔗 Testing URL Generation:");
      const testPath = "/opt/render/project/src/uploads/avatars/test.jpg";
      const url = renderStorageConfig.getFileUrl(testPath);
      console.log(`   Test path: ${testPath}`);
      console.log(`   Generated URL: ${url}`);
      console.log("");

      // Check if URL looks correct
      if (url.includes("localhost:5000")) {
        console.log(
          "❌ PROBLEM: URL contains localhost - this will cause display issues!"
        );
        console.log(
          "   Solution: Set NODE_ENV=production in your environment variables"
        );
      } else if (url.includes("callgirls-api.onrender.com")) {
        console.log("✅ URL looks correct for production");
      } else {
        console.log("⚠️  URL format is unusual, may need investigation");
      }

      console.log("\n📋 SUMMARY:");
      console.log(
        "   If you see 'localhost:5000' in URLs, that's the problem!"
      );
      console.log(
        "   Set NODE_ENV=production in your Render environment variables"
      );
      console.log("   Then redeploy your API");
    })
    .catch((error) => {
      console.error("❌ Error loading config:", error.message);
    });
} catch (error) {
  console.error("❌ Import error:", error.message);
}
