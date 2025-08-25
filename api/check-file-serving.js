console.log("🔍 Checking File Serving Configuration\n");

const API_BASE = "https://callgirls-api.onrender.com";

// Test the debug endpoint to see the current configuration
async function checkConfiguration() {
  try {
    console.log("📡 Checking API configuration...");
    const response = await fetch(`${API_BASE}/debug/files`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Configuration retrieved successfully");
      console.log("");

      console.log("🌍 Environment Info:");
      console.log(`   Environment: ${data.data?.environment || "N/A"}`);
      console.log(`   Upload Path: ${data.data?.uploadPath || "N/A"}`);
      console.log(`   Base URL: ${data.data?.baseUrl || "N/A"}`);
      console.log("");

      console.log("📁 Directory Info:");
      if (data.data?.directories) {
        Object.entries(data.data.directories).forEach(([name, path]) => {
          console.log(`   ${name}: ${path}`);
        });
      }
      console.log("");

      console.log("🔧 Environment Variables:");
      if (data.data?.envVars) {
        Object.entries(data.data.envVars).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      console.log("");

      // Analyze the issue
      console.log("🎯 ANALYSIS:");
      if (data.data?.environment === "production") {
        console.log("   ✅ Environment is production");
      } else {
        console.log("   ❌ Environment is not production");
      }

      if (data.data?.uploadPath?.includes("/opt/render/project/src/uploads")) {
        console.log("   ✅ Upload path is correct for Render");
      } else {
        console.log("   ❌ Upload path is incorrect");
      }

      console.log("");
      console.log("🚨 LIKELY ISSUE:");
      console.log(
        "   Your API is not serving static files from the uploads directory"
      );
      console.log("   This is why /uploads/* endpoints return 404");
      console.log("");
      console.log("🔧 SOLUTION:");
      console.log("   1. Check if the uploads directory exists on Render");
      console.log("   2. Verify file permissions");
      console.log("   3. Check the static file middleware in your API");
    } else {
      console.log(`❌ Failed to get configuration: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error checking configuration:", error.message);
  }
}

checkConfiguration();
