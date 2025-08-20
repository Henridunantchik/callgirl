import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAuthAndOnline() {
  console.log('🧪 Testing Authentication & Online Status...\n');
  
  try {
    // Test 1: Login as an escort
    console.log('📋 Test 1: Login as escort');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'lola@test.com', // Use a test escort email
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test 2: Update online status with auth
    console.log('\n📋 Test 2: Update online status (with auth)');
    const onlineResponse = await axios.put(`${BASE_URL}/user/online-status`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Online status updated:', onlineResponse.data);
    
    // Test 3: Get user info
    console.log('\n📋 Test 3: Get user info');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User info:', userResponse.data.user);
    
    // Test 4: Mark as offline
    console.log('\n📋 Test 4: Mark as offline');
    const offlineResponse = await axios.put(`${BASE_URL}/user/offline`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Marked as offline:', offlineResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthAndOnline();
