// Test script for escort profile creation
const testEscortCreation = async () => {
  console.log("🧪 Testing Escort Profile Creation...");

  try {
    // Step 1: Login to get token
    console.log("1. Logging in...");
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test2@example.com",
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

    // Step 2: Create escort profile
    console.log("2. Creating escort profile...");
    const escortData = {
      name: "Test Escort 2",
      alias: "TestEscort2",
      email: "test2@example.com",
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
      console.log("🎉 ESCORT PROFILE CREATION SUCCESSFUL!");
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
testEscortCreation();
