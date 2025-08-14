// Test script to verify frontend-backend connection
const testConnection = async () => {
  console.log("🧪 Testing Frontend-Backend Connection...");

  try {
    // Test 1: Direct backend connection
    console.log("1. Testing direct backend connection...");
    const backendResponse = await fetch("http://localhost:5000/api/health");
    const backendData = await backendResponse.json();
    console.log("✅ Backend health check:", backendData.success);

    // Test 2: Frontend proxy connection
    console.log("2. Testing frontend proxy connection...");
    const frontendResponse = await fetch("http://localhost:5173/api/health");
    const frontendData = await frontendResponse.json();
    console.log("✅ Frontend proxy health check:", frontendData.success);

    // Test 3: Escort API endpoint
    console.log("3. Testing escort API endpoint...");
    const escortResponse = await fetch("http://localhost:5000/api/escort/all");
    const escortData = await escortResponse.json();
    console.log("✅ Escort API working:", escortData.success);

    console.log("🎉 ALL CONNECTIONS WORKING!");

  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
  }
};

// Run the test
testConnection();
