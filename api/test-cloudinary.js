import cloudinary from "./config/cloudinary.js";
import config from "./config/env.js";

console.log("=== CLOUDINARY DIAGNOSTIC TEST ===");
console.log("Cloud Name:", config.CLOUDINARY_APP_NAME);
console.log("API Key:", config.CLOUDINARY_API_KEY ? "***" : "undefined");
console.log("API Secret:", config.CLOUDINARY_API_SECRET ? "***" : "undefined");

// Test 1: Configuration
console.log("\n1. Testing configuration...");
try {
  const configTest = cloudinary.config();
  console.log("✅ Configuration loaded successfully");
  console.log("Cloud name from config:", configTest.cloud_name);
} catch (error) {
  console.log("❌ Configuration error:", error.message);
}

// Test 2: Simple upload test
console.log("\n2. Testing simple upload...");
try {
  // Create a simple test image (1x1 pixel)
  const testImage = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );

  const result = await cloudinary.uploader
    .upload_stream(
      {
        folder: "test",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.log("❌ Upload test failed:", error.message);
          console.log("Error details:", error);
        } else {
          console.log("✅ Upload test successful!");
          console.log("Public ID:", result.public_id);
          console.log("URL:", result.secure_url);
        }
      }
    )
    .end(testImage);
} catch (error) {
  console.log("❌ Upload test error:", error.message);
  console.log("Full error:", error);
}

// Test 3: Account info
console.log("\n3. Testing account info...");
try {
  const accountInfo = await cloudinary.api.ping();
  console.log("✅ Account ping successful");
  console.log("Account info:", accountInfo);
} catch (error) {
  console.log("❌ Account ping failed:", error.message);
  console.log("This confirms the account is disabled or credentials are wrong");
}

console.log("\n=== DIAGNOSTIC COMPLETE ===");
