const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:5000/api";

async function testAvatarUpload() {
  try {
    console.log("=== TESTING AVATAR UPLOAD ===");

    // First, login to get a token
    console.log("1. Logging in...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    if (!loginResponse.data.success) {
      console.log("❌ Login failed:", loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user._id;

    console.log("✅ Login successful");
    console.log("User ID:", userId);
    console.log("Current avatar:", loginResponse.data.user.avatar);

    // Create a test image file (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, "test-avatar.png");
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, testImageBuffer);

    // Upload avatar
    console.log("\n2. Uploading avatar...");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(testImagePath));

    const uploadResponse = await axios.put(
      `${API_BASE}/user/update`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Upload response status:", uploadResponse.status);
    console.log(
      "Upload response data:",
      JSON.stringify(uploadResponse.data, null, 2)
    );

    if (uploadResponse.data.success) {
      console.log("✅ Avatar upload successful");
      console.log("New avatar URL:", uploadResponse.data.user.avatar);

      // Verify the avatar was saved by fetching user profile
      console.log("\n3. Verifying avatar was saved...");
      const profileResponse = await axios.get(`${API_BASE}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Profile response:",
        JSON.stringify(profileResponse.data, null, 2)
      );
      console.log("Avatar in profile:", profileResponse.data.user.avatar);

      if (
        profileResponse.data.user.avatar === uploadResponse.data.user.avatar
      ) {
        console.log("✅ Avatar successfully saved to database");
      } else {
        console.log("❌ Avatar not saved to database");
      }
    } else {
      console.log("❌ Avatar upload failed");
    }

    // Clean up
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testAvatarUpload();
