import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test getAllEscorts without any filters
async function testAllEscorts() {
  try {
    console.log('🔍 Testing getAllEscorts without filters...');
    
    // Test without countryCode (should show all escorts)
    const response = await axios.get(`${API_BASE}/escort/all`, {
      params: {
        limit: 10
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.data && response.data.data) {
      const escorts = response.data.data.escorts || [];
      const total = response.data.data.total || 0;
      
      console.log(`📈 ALL ESCORTS (no filters):`);
      console.log(`- Total escorts: ${total}`);
      console.log(`- Escorts returned: ${escorts.length}`);
      
      if (escorts.length > 0) {
        console.log(`👥 Sample escorts:`);
        escorts.forEach((escort, index) => {
          console.log(`  ${index + 1}. ${escort.name || escort.alias || 'No name'}`);
          console.log(`     - Country: ${escort.location?.country || 'NOT SET'}`);
          console.log(`     - City: ${escort.location?.city || 'NOT SET'}`);
          console.log(`     - Active: ${escort.isActive}`);
          console.log(`     - Featured: ${escort.isFeatured}`);
          console.log(`     - Verified: ${escort.isVerified}`);
          console.log(`     ---`);
        });
      } else {
        console.log(`👥 No escorts found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testAllEscorts();
