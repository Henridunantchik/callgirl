const axios = require("axios");

async function testMediaRoute() {
  try {
    console.log("🧪 Testing Media Route...");

    // Test if media route exists
    console.log("\n1️⃣ Testing media route existence...");
    try {
      await axios.get("http://localhost:5000/api/escort/media/test123");
      console.log("❌ Media route accepts GET (should not)");
    } catch (error) {
      if (error.response?.status === 405) {
        console.log("✅ Media route exists (Method Not Allowed)");
      } else if (error.response?.status === 404) {
        console.log("❌ Media route does not exist (404)");
      } else {
        console.log("❓ Media route status:", error.response?.status);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testMediaRoute();
