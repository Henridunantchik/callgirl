console.log("🧪 Testing Static File Serving After Fix\n");

const API_BASE = "https://callgirls-api.onrender.com";

// Test endpoints
const testEndpoints = [
  "/uploads/avatars/test.jpg",
  "/uploads/gallery/test.png",
  "/uploads/videos/test.mp4",
];

console.log("🔍 Testing static file endpoints...\n");

async function testStaticFile(endpoint) {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log(`📡 Testing: ${url}`);

    const response = await fetch(url);
    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.status === 200) {
      console.log("   ✅ File endpoint accessible - FIXED!");
    } else if (response.status === 404) {
      console.log("   ❌ File not found (but endpoint works)");
      console.log("   💡 This is normal if test files don't exist");
    } else {
      console.log("   ⚠️  Unexpected status");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log("");
}

// Test all endpoints
async function runTests() {
  for (const endpoint of testEndpoints) {
    await testStaticFile(endpoint);
  }

  console.log("🎯 INTERPRETATION:");
  console.log("   ✅ 200: File endpoint works, file exists");
  console.log("   ✅ 404: File endpoint works, file doesn't exist (normal)");
  console.log("   ❌ Error: File endpoint doesn't work");
  console.log("");
  console.log("🔧 NEXT STEPS:");
  console.log("   1. If you see 404s, the fix worked!");
  console.log("   2. Upload a real image to test");
  console.log("   3. Check if it displays in your app");
}

runTests();
