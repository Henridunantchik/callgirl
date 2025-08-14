const axios = require('axios');

async function testRoute() {
  try {
    console.log('🧪 Testing route existence...');
    
    // Test 1: Health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health OK:', health.data.success);
    
    // Test 2: Escort debug endpoint
    console.log('\n2️⃣ Testing escort debug endpoint...');
    const debug = await axios.get('http://localhost:5000/api/escort/debug/all');
    console.log('✅ Debug OK:', debug.data.success);
    
    // Test 3: Try to access video route with GET (should fail with 405)
    console.log('\n3️⃣ Testing video route existence...');
    try {
      await axios.get('http://localhost:5000/api/escort/video/test123');
      console.log('❌ Route accepts GET (should not)');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Route exists (Method Not Allowed)');
      } else if (error.response?.status === 404) {
        console.log('❌ Route does not exist (404)');
      } else {
        console.log('❓ Unexpected status:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoute();
