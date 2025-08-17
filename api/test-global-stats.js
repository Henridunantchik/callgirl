import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test the global stats API
async function testGlobalStats() {
  try {
    console.log('🔍 Testing global stats API...');
    
    // Test with Uganda
    const response = await axios.get(`${API_BASE}/stats/global/ug`);
    console.log('📊 Stats response status:', response.status);
    console.log('📊 Stats data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data.stats) {
      const stats = response.data.data.stats;
      console.log('\n📈 GLOBAL STATS SUMMARY:');
      console.log(`- Total Escorts: ${stats.totalEscorts}`);
      console.log(`- Verified Escorts: ${stats.verifiedEscorts}`);
      console.log(`- Online Escorts: ${stats.onlineEscorts}`);
      console.log(`- Featured Escorts: ${stats.featuredEscorts}`);
      console.log(`- Premium Escorts: ${stats.premiumEscorts}`);
      console.log(`- Cities Covered: ${stats.citiesCovered}`);
      console.log(`- Country Code: ${stats.countryCode}`);
      
      if (stats.topCities && stats.topCities.length > 0) {
        console.log('\n🏙️ TOP CITIES:');
        stats.topCities.forEach((city, index) => {
          console.log(`${index + 1}. ${city._id}: ${city.escortCount} escorts`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testGlobalStats();
