const axios = require('axios');

async function testGalleryRoute() {
  try {
    console.log('🧪 Testing Gallery Route...');
    
    // Test if gallery route exists
    console.log('\n1️⃣ Testing gallery route existence...');
    try {
      await axios.get('http://localhost:5000/api/escort/gallery/test123');
      console.log('❌ Gallery route accepts GET (should not)');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Gallery route exists (Method Not Allowed)');
      } else if (error.response?.status === 404) {
        console.log('❌ Gallery route does not exist (404)');
      } else {
        console.log('❓ Gallery route status:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGalleryRoute();
