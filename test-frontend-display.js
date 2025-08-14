// Test script to check frontend escort display
const testFrontendDisplay = async () => {
  console.log("🧪 Testing Frontend Escort Display...");

  try {
    // Test 1: Backend API directly
    console.log("1. Testing backend API directly...");
    const backendResponse = await fetch(
      "http://localhost:5000/api/escort/all?featured=true"
    );
    const backendData = await backendResponse.json();
    console.log("✅ Backend API working:", backendData.success);
    console.log(
      "📊 Backend returned",
      backendData.data.escorts.length,
      "featured escorts"
    );

    // Test 2: Frontend proxy
    console.log("2. Testing frontend proxy...");
    const frontendResponse = await fetch(
      "http://localhost:5173/api/escort/all?featured=true"
    );
    const frontendData = await frontendResponse.json();
    console.log("✅ Frontend proxy working:", frontendData.success);
    console.log(
      "📊 Frontend proxy returned",
      frontendData.data.escorts.length,
      "featured escorts"
    );

    // Test 3: Check escort details
    if (backendData.data.escorts.length > 0) {
      console.log("3. Featured escort details:");
      backendData.data.escorts.forEach((escort, index) => {
        console.log(
          `   ${index + 1}. ${escort.name} (${escort.age}) - ${escort.alias}`
        );
      });
    }

    console.log("🎉 Frontend display test completed!");
  } catch (error) {
    console.error("❌ Frontend display test failed:", error.message);
  }
};

// Run the test
testFrontendDisplay();
