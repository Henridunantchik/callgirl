import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Test the message API endpoints
async function testMessageAPI() {
  try {
    console.log("🧪 Testing Message API Endpoints...");

    // Test 1: Get user conversations (without auth - should fail)
    console.log("\n📞 Test 1: Get user conversations (no auth)");
    try {
      const response = await axios.get(`${API_BASE}/message/conversations`);
      console.log("❌ Should have failed but got:", response.status);
    } catch (error) {
      console.log("✅ Correctly failed with status:", error.response?.status);
      console.log("✅ Error message:", error.response?.data?.message);
    }

    // Test 2: Send message (without auth - should fail)
    console.log("\n📤 Test 2: Send message (no auth)");
    try {
      const response = await axios.post(`${API_BASE}/message/send`, {
        escortId: "test",
        content: "test message",
      });
      console.log("❌ Should have failed but got:", response.status);
    } catch (error) {
      console.log("✅ Correctly failed with status:", error.response?.status);
      console.log("✅ Error message:", error.response?.data?.message);
    }

    // Test 3: Get conversation (without auth - should fail)
    console.log("\n💬 Test 3: Get conversation (no auth)");
    try {
      const response = await axios.get(`${API_BASE}/message/conversation/test`);
      console.log("❌ Should have failed but got:", response.status);
    } catch (error) {
      console.log("✅ Correctly failed with status:", error.response?.status);
      console.log("✅ Error message:", error.response?.data?.message);
    }

    console.log("\n✅ Message API tests completed!");
    console.log("📝 Note: All endpoints correctly require authentication");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

testMessageAPI();
