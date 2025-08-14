const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE_URL = "http://localhost:5000/api";

async function testVideoUpload() {
  try {
    console.log("🧪 Testing Video Upload...\n");

    // 1. Login
    console.log("1️⃣ Logging in...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "hdchikuru7@gmail.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log("✅ Login successful\n");

    // 2. Test video upload endpoint
    console.log("2️⃣ Testing video upload endpoint...");

    // Create a test video file (or use existing one)
    const testVideoPath = path.join(__dirname, "test-video.mp4");

    // Check if test video exists, if not create a dummy one
    if (!fs.existsSync(testVideoPath)) {
      console.log("⚠️ No test video found, creating dummy file...");
      // Create a dummy video file for testing
      const dummyContent = Buffer.from("dummy video content");
      fs.writeFileSync(testVideoPath, dummyContent);
    }

    const formData = new FormData();
    formData.append("video", fs.createReadStream(testVideoPath));

    console.log("📤 Uploading video...");
    const uploadResponse = await axios.post(
      `${API_BASE_URL}/escort/video/67bca60f2a1df3d303d09bff`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...headers,
        },
      }
    );

    console.log("✅ Upload response:", uploadResponse.data);
    console.log("🎉 Video upload test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.response?.status === 413) {
      console.log("💡 File too large - check file size limits");
    } else if (error.response?.status === 400) {
      console.log("💡 Bad request - check file format and field name");
    } else if (error.response?.status === 403) {
      console.log("💡 Forbidden - check authentication and permissions");
    }
  }
}

testVideoUpload();
