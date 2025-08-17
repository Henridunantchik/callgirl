import axios from "axios";

console.log("🧪 Testing PesaPal API 3.0 Integration...\n");

const baseUrl = "https://cybqa.pesapal.com/pesapalv3";
const consumerKey = "C+/fgSKFvYTRpZeC3bD+yymF3ZsjFgZ/";
const consumerSecret = "G7z8k/euaoycKJcmPSqEzRmWc1s=";

async function testAuth() {
  try {
    console.log("🔑 Testing PesaPal API 3.0 Authentication...");
    console.log("URL:", `${baseUrl}/api/Auth/RequestToken`);
    console.log("Consumer Key:", consumerKey);
    console.log("Consumer Secret:", consumerSecret);

    const authData = {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    };

    console.log("Request Data:", JSON.stringify(authData, null, 2));

    const response = await axios.post(
      `${baseUrl}/api/Auth/RequestToken`,
      authData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("✅ Response Status:", response.status);
    console.log("✅ Response Headers:", response.headers);
    console.log("✅ Response Data:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error("❌ Authentication Error:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Headers:", error.response?.headers);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    if (error.response?.data) {
      console.error(
        "Error Response:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    throw error;
  }
}

async function testEndpoint() {
  try {
    console.log("\n🔍 Testing PesaPal API 3.0 Endpoint...");
    const response = await axios.get(baseUrl, { timeout: 5000 });
    console.log("✅ Endpoint accessible - Status:", response.status);
    return true;
  } catch (error) {
    console.log("❌ Endpoint not accessible:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting Detailed PesaPal Tests...\n");

  // Test 1: Check if endpoint is accessible
  const isAccessible = await testEndpoint();

  if (isAccessible) {
    // Test 2: Try authentication
    try {
      const result = await testAuth();
      console.log("\n✅ Authentication successful!");
      console.log("Token:", result.token);
    } catch (error) {
      console.log("\n❌ Authentication failed");
    }
  }

  console.log("\n📝 Next Steps:");
  console.log("1. Check the error response above");
  console.log("2. Verify your PesaPal credentials");
  console.log("3. Check if your account is activated");
  console.log("4. Contact PesaPal support if needed");
}

runTests().catch(console.error);
