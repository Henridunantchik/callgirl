import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testOnlineStatus() {
  console.log('🧪 Testing Online Status API...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('📋 Test 1: Server health check');
    const healthResponse = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test 2: Try to update online status (without auth - should fail)
    console.log('\n📋 Test 2: Update online status (no auth)');
    try {
      await axios.put(`${BASE_URL}/user/online-status`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      console.log('✅ Correctly failed without auth:', error.response?.status);
    }
    
    // Test 3: Check if the route exists
    console.log('\n📋 Test 3: Check route existence');
    try {
      const response = await axios.options(`${BASE_URL}/user/online-status`);
      console.log('✅ Route exists:', response.status);
    } catch (error) {
      console.log('❌ Route might not exist:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running. Start it with: npm run dev');
    }
  }
}

testOnlineStatus();
