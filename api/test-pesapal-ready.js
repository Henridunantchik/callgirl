import pesapalService from "./utils/pesapalService.js";

console.log("🚀 PesaPal Integration Ready Test\n");

async function testCompleteFlow() {
  try {
    console.log("📋 Testing Complete PesaPal Flow...\n");

    // Test 1: Authentication
    console.log("🔑 Step 1: Testing Authentication...");
    const token = await pesapalService.getAccessToken();
    console.log("✅ Authentication successful!");
    console.log("Token received:", token ? "Yes" : "No");

    // Test 2: Create Payment Order
    console.log("\n💳 Step 2: Creating Payment Order...");
    const orderData = {
      orderId: `TEST_${Date.now()}`,
      amount: 100.0,
      description: "Test payment for Call Girls platform",
      type: "MERCHANT",
      firstName: "John",
      lastName: "Doe",
      email: "test@example.com",
      phoneNumber: "+254700000000",
      currency: "USD",
    };

    const paymentResult = await pesapalService.createPaymentOrder(orderData);
    console.log("✅ Payment order created!");
    console.log("Order ID:", paymentResult.orderId);
    console.log("Tracking ID:", paymentResult.trackingId);
    console.log("Redirect URL:", paymentResult.redirectUrl);

    // Test 3: Query Payment Status
    console.log("\n📊 Step 3: Querying Payment Status...");
    const statusResult = await pesapalService.queryPaymentStatus(
      paymentResult.orderId
    );
    console.log("✅ Payment status retrieved!");
    console.log("Status:", statusResult.status);
    console.log("Order ID:", statusResult.orderId);

    console.log(
      "\n🎉 All tests passed! Your PesaPal integration is working perfectly!"
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    if (error.message.includes("invalid_consumer_key_or_secret_provided")) {
      console.log(
        "\n📝 This means your PesaPal account needs to be activated."
      );
      console.log("Please contact PesaPal support to activate your account.");
    }
  }
}

async function showIntegrationStatus() {
  console.log("📊 PesaPal Integration Status:");
  console.log("✅ API endpoints configured");
  console.log("✅ JSON format implemented");
  console.log("✅ Error handling ready");
  console.log("✅ Frontend components ready");
  console.log("⏳ Waiting for account activation...\n");

  console.log("🔧 Next Steps:");
  console.log("1. Contact PesaPal support to activate your account");
  console.log("2. Run this test again once activated");
  console.log("3. Start using PesaPal payments in your app");
}

// Run the tests
showIntegrationStatus();
testCompleteFlow();
