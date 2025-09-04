console.log("🧪 Testing Production API - Photo Display Issue\n");

const API_BASE = "https://api.epicescorts.live";

// Test endpoints
const endpoints = [
  "/debug/files",
  "/api/storage/health",
  "/uploads/avatars/test.jpg",
  "/uploads/gallery/test.png",
];

console.log("🔍 Testing API endpoints...\n");

async function testEndpoint(endpoint) {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log(`📡 Testing: ${url}`);

    const response = await fetch(url);
    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      if (endpoint.includes("/uploads/")) {
        console.log("   ✅ File endpoint accessible");
      } else {
        const data = await response.json();
        console.log("   ✅ API endpoint working");
        if (data.environment) {
          console.log(`   🌍 Environment: ${data.environment}`);
        }
      }
    } else {
      console.log("   ❌ Endpoint failed");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log("");
}

// Test all endpoints
async function runTests() {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }

  console.log("🎯 DIAGNOSIS:");
  console.log(
    "   If /debug/files shows environment=production, config is correct"
  );
  console.log("   If /uploads/* endpoints fail, there's a file serving issue");
  console.log("   Check your browser console for 404 errors on image URLs");
}

runTests();
