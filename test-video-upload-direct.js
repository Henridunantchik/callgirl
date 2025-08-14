const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';

async function testVideoUploadDirect() {
  try {
    console.log('🧪 Testing Video Upload Direct...\n');

    // 1. Login with existing user
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');
    console.log('User ID:', loginResponse.data.user._id);
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Test video upload endpoint
    console.log('2️⃣ Testing video upload endpoint...');
    
    // Create a test video file
    const testVideoPath = path.join(__dirname, 'test-video.mp4');
    
    // Create a dummy video file for testing
    console.log('📁 Creating test video file...');
    const dummyContent = Buffer.from('dummy video content for testing');
    fs.writeFileSync(testVideoPath, dummyContent);

    const formData = new FormData();
    formData.append('video', fs.createReadStream(testVideoPath));

    console.log('📤 Uploading video to:', `${API_BASE_URL}/escort/video/${loginResponse.data.user._id}`);
    console.log('📦 FormData fields:', formData.getHeaders());

    const uploadResponse = await axios.post(
      `${API_BASE_URL}/escort/video/${loginResponse.data.user._id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...headers
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('✅ Upload response:', uploadResponse.data);
    console.log('🎉 Video upload test completed!');

    // Clean up test file
    fs.unlinkSync(testVideoPath);

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.status === 413) {
      console.log('💡 File too large - check file size limits');
    } else if (error.response?.status === 400) {
      console.log('💡 Bad request - check file format and field name');
    } else if (error.response?.status === 403) {
      console.log('💡 Forbidden - check authentication and permissions');
    } else if (error.response?.status === 404) {
      console.log('💡 Not found - check route and user ID');
    } else if (error.code === 'ECONNRESET') {
      console.log('💡 Connection reset - server might be down or route not found');
    }
  }
}

testVideoUploadDirect();
