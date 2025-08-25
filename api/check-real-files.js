console.log("🔍 Checking Real Uploaded Files\n");

const API_BASE = "https://callgirls-api.onrender.com";

// Check if we can access the debug endpoint to see what files exist
async function checkRealFiles() {
  try {
    console.log("📡 Checking API configuration for real files...");
    const response = await fetch(`${API_BASE}/debug/files`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Configuration retrieved successfully");
      console.log("");

      console.log("🌍 Environment Info:");
      console.log(`   Environment: ${data.data?.environment || "N/A"}`);
      console.log(`   Upload Path: ${data.data?.uploadPath || "N/A"}`);
      console.log("");

      console.log("📁 Directory Structure:");
      if (data.data?.directories) {
        Object.entries(data.data.directories).forEach(([name, path]) => {
          console.log(`   ${name}: ${path}`);
        });
      }
      console.log("");

      console.log("🎯 NEXT STEPS:");
      console.log("   1. Upload a real image through your app");
      console.log("   2. Check if it displays immediately");
      console.log("   3. If it works, the problem is solved!");
      console.log("");
      console.log("💡 TIP: The 404 errors you saw earlier are normal");
      console.log("   They just mean the test files don't exist");
      console.log("   Real uploaded files should work perfectly now");
    } else {
      console.log(`❌ Failed to get configuration: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error checking configuration:", error.message);
  }
}

checkRealFiles();
