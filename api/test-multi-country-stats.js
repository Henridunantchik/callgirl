import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test the global stats API with different countries
async function testMultiCountryStats() {
  const countries = ['ug', 'ke', 'tz', 'rw', 'bi', 'cd'];
  
  for (const country of countries) {
    try {
      console.log(`\n🔍 Testing stats for ${country.toUpperCase()}...`);
      
      const response = await axios.get(`${API_BASE}/stats/global/${country}`);
      console.log(`📊 ${country.toUpperCase()} response status:`, response.status);
      
      if (response.data && response.data.data && response.data.data.stats) {
        const stats = response.data.data.stats;
        console.log(`📈 ${country.toUpperCase()} STATS:`);
        console.log(`- Total Escorts: ${stats.totalEscorts}`);
        console.log(`- Verified Escorts: ${stats.verifiedEscorts}`);
        console.log(`- Online Escorts: ${stats.onlineEscorts}`);
        console.log(`- Featured Escorts: ${stats.featuredEscorts}`);
        console.log(`- Premium Escorts: ${stats.premiumEscorts}`);
        console.log(`- Cities Covered: ${stats.citiesCovered}`);
        console.log(`- Country Code: ${stats.countryCode}`);
        
        if (stats.topCities && stats.topCities.length > 0) {
          console.log(`🏙️ ${country.toUpperCase()} TOP CITIES:`);
          stats.topCities.forEach((city, index) => {
            console.log(`  ${index + 1}. ${city._id}: ${city.escortCount} escorts`);
          });
        } else {
          console.log(`🏙️ ${country.toUpperCase()}: No cities found`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${country.toUpperCase()}:`, error.response?.data || error.message);
    }
  }
}

testMultiCountryStats();
