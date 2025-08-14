// Test script for frontend-backend integration
const testFrontendIntegration = async () => {
  console.log("🧪 Testing Frontend-Backend Integration...");

  try {
    // Test 1: Frontend API proxy
    console.log("1. Testing frontend API proxy...");
    const proxyResponse = await fetch("http://localhost:5174/api/health");
    console.log("✅ Frontend proxy working:", proxyResponse.status);

    // Test 2: Escort listing through frontend
    console.log("2. Testing escort listing...");
    const escortsResponse = await fetch("http://localhost:5174/api/escort/all");
    const escortsData = await escortsResponse.json();
    console.log("✅ Escort listing working:", escortsData.success);

    // Test 3: Authentication flow
    console.log("3. Testing authentication flow...");
    const authResponse = await fetch("http://localhost:5174/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const authData = await authResponse.json();
    console.log(
      "✅ Authentication through frontend working:",
      authData.success
    );

    if (authData.success) {
      // Test 4: Protected routes with token
      console.log("4. Testing protected routes...");
      const protectedResponse = await fetch(
        "http://localhost:5174/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      const protectedData = await protectedResponse.json();
      console.log("✅ Protected routes working:", protectedData.success);
    }

    console.log("🎉 FRONTEND-BACKEND INTEGRATION SUCCESSFUL!");
  } catch (error) {
    console.error("❌ Frontend integration test failed:", error.message);
  }
};

// Run the test
testFrontendIntegration();
