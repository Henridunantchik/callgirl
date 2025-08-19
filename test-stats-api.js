const axios = require('axios');

async function testStatsAPI() {
  try {
    console.log('🔍 Testing upgrade stats API...');
    
    // Test the stats endpoint
    const response = await axios.get('http://localhost:5000/api/upgrade-request/stats', {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // You'll need to replace this with a real admin token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', response.data);
    console.log('✅ Stats Data:', response.data.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status);
    console.error('❌ Error Data:', error.response?.data);
    console.error('❌ Full Error:', error.message);
  }
}

testStatsAPI();
