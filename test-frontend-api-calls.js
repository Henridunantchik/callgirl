// Comprehensive test for frontend escort fetching
const testFrontendEscortFetching = async () => {
  console.log("🧪 Testing Frontend Escort Fetching...");

  try {
    // Test 1: Direct backend call
    console.log("\n1. Testing direct backend call...");
    const backendResponse = await fetch("http://localhost:5000/api/escort/all");
    const backendData = await backendResponse.json();
    console.log("✅ Backend API working:", backendData.success);
    console.log(
      "📊 Backend returned",
      backendData.data.escorts.length,
      "escorts"
    );

    // Test 2: Frontend proxy call
    console.log("\n2. Testing frontend proxy call...");
    const frontendResponse = await fetch(
      "http://localhost:5173/api/escort/all"
    );
    const frontendData = await frontendResponse.json();
    console.log("✅ Frontend proxy working:", frontendData.success);
    console.log(
      "📊 Frontend proxy returned",
      frontendData.data.escorts.length,
      "escorts"
    );

    // Test 3: Featured escorts call
    console.log("\n3. Testing featured escorts call...");
    const featuredResponse = await fetch(
      "http://localhost:5173/api/escort/all?featured=true"
    );
    const featuredData = await featuredResponse.json();
    console.log("✅ Featured escorts working:", featuredData.success);
    console.log(
      "📊 Featured escorts returned",
      featuredData.data.escorts.length,
      "escorts"
    );

    // Test 4: Check escort details
    console.log("\n4. Escort details:");
    if (backendData.data.escorts.length > 0) {
      backendData.data.escorts.forEach((escort, index) => {
        console.log(
          `   ${index + 1}. ${escort.name} (${escort.age}) - ${
            escort.alias
          } - Featured: ${escort.isFeatured}`
        );
      });
    }

    // Test 5: Check if your profile is included
    console.log("\n5. Looking for your profile...");
    const yourProfile = backendData.data.escorts.find(
      (escort) => escort.name === "henri dunant chikuru"
    );
    if (yourProfile) {
      console.log(
        "✅ Your profile found:",
        yourProfile.name,
        "-",
        yourProfile.alias
      );
      console.log("   Age:", yourProfile.age, "Gender:", yourProfile.gender);
      console.log("   Featured:", yourProfile.isFeatured);
    } else {
      console.log("❌ Your profile not found in the list");
    }

    console.log("\n🎉 Frontend escort fetching test completed!");
  } catch (error) {
    console.error("❌ Frontend escort fetching test failed:", error.message);
  }
};

// Run the test
testFrontendEscortFetching();
