// Test script for complete user flow: registration -> login -> escort creation
const testCompleteFlow = async () => {
  console.log("🧪 Testing Complete User Flow...");

  try {
    // Step 1: Register a new user
    console.log("1. Registering new user...");
    const registerResponse = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User Flow",
        email: "testflow@example.com",
        password: "password123",
        role: "client"
      }),
    });

    const registerData = await registerResponse.json();
    console.log("✅ Registration response:", registerData.success);

    if (!registerData.success) {
      console.log("⚠️ User might already exist, continuing with login...");
    }

    // Step 2: Login to get token
    console.log("2. Logging in...");
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "testflow@example.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log("✅ Login successful:", loginData.success);

    if (!loginData.success) {
      throw new Error("Login failed");
    }

    const token = loginData.token;
    console.log("✅ Token received");

    // Step 3: Create escort profile
    console.log("3. Creating escort profile...");
    const escortData = {
      name: "Test Flow Escort",
      alias: "TestFlowEscort",
      email: "testflow@example.com",
      phone: "+1234567890",
      age: 25,
      gender: "female",
      country: "ug",
      city: "Kampala",
      services: JSON.stringify(["In-call", "Out-call"]),
      hourlyRate: 100,
      isStandardPricing: true,
    };

    const escortResponse = await fetch(
      "http://localhost:5000/api/escort/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(escortData),
      }
    );

    const escortResult = await escortResponse.json();
    console.log("✅ Escort creation response:", escortResult);

    if (escortResult.success) {
      console.log("🎉 COMPLETE FLOW SUCCESSFUL!");
      console.log("✅ User registered");
      console.log("✅ User logged in");
      console.log("✅ User converted to escort");
      console.log("User role updated to:", escortResult.user.role);
      console.log("Profile completion:", escortResult.user.profileCompletion);
    } else {
      console.log("❌ Escort creation failed:", escortResult.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Run the test
testCompleteFlow();
