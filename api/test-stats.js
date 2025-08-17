import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test the escort stats API
async function testEscortStats() {
  try {
    console.log('🔍 Testing escort stats API...');
    
    // First, let's get the escort ID for Lola Lala
    const escortResponse = await axios.get(`${API_BASE}/escort/profile/Lola%20Lala`);
    console.log('📋 Escort profile response status:', escortResponse.status);
    
    if (escortResponse.data && escortResponse.data.data && escortResponse.data.data.escort) {
      const escortId = escortResponse.data.data.escort._id;
      console.log('🎯 Found escort ID:', escortId);
      
      // Test the stats API
      const statsResponse = await axios.get(`${API_BASE}/escort/public-stats/${escortId}`);
      console.log('📊 Stats response status:', statsResponse.status);
      console.log('📊 Stats data:', JSON.stringify(statsResponse.data, null, 2));
      
      if (statsResponse.data && statsResponse.data.data && statsResponse.data.data.stats) {
        const stats = statsResponse.data.data.stats;
        console.log('\n📈 STATS SUMMARY:');
        console.log(`- Profile Views: ${stats.profileViews}`);
        console.log(`- Messages: ${stats.messages}`);
        console.log(`- Bookings: ${stats.bookings}`);
        console.log(`- Favorites: ${stats.favorites}`);
        console.log(`- Reviews: ${stats.reviews}`);
        console.log(`- Rating: ${stats.rating}`);
        console.log(`- Earnings: $${stats.earnings}`);
      }
    } else {
      console.log('❌ Could not find escort profile');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testEscortStats();
