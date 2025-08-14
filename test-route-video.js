const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testVideoRoute() {
  try {
    console.log('🧪 Testing Video Route...\n');

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test if the route exists by making a GET request (should return 405 Method Not Allowed)
    console.log('1️⃣ Testing if route exists...');
    try {
      const response = await axios.get(`${API_BASE_URL}/escort/video/test`);
      console.log('❌ Route should not accept GET requests');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Route exists (Method Not Allowed for GET)');
      } else if (error.response?.status === 404) {
        console.log('❌ Route does not exist (404 Not Found)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test health endpoint to make sure server is running
    console.log('\n2️⃣ Testing server health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVideoRoute();
