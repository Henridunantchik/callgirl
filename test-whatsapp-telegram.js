const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testWhatsAppTelegram() {
  try {
    console.log('🧪 Testing WhatsApp & Telegram Integration...\n');

    // 1. Test login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'hdchikuru7@gmail.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful\n');

    // 2. Test updating WhatsApp and Telegram
    console.log('2️⃣ Updating WhatsApp and Telegram...');
    const updateResponse = await axios.put(`${API_BASE_URL}/user/update`, {
      whatsapp: '+256708326238',
      telegram: 'lola_lala_escort'
    }, { headers });

    console.log('✅ Update response:', updateResponse.data);
    console.log('WhatsApp saved:', updateResponse.data.user.whatsapp);
    console.log('Telegram saved:', updateResponse.data.user.telegram);

    // 3. Test getting escort profile by slug
    console.log('\n3️⃣ Testing escort profile fetch...');
    const profileResponse = await axios.get(`${API_BASE_URL}/escort/lola%20lala`);
    
    console.log('✅ Profile response status:', profileResponse.status);
    console.log('Profile data structure:', Object.keys(profileResponse.data));
    
    if (profileResponse.data.data && profileResponse.data.data.escort) {
      const escort = profileResponse.data.data.escort;
      console.log('WhatsApp in profile:', escort.whatsapp);
      console.log('Telegram in profile:', escort.telegram);
    } else if (profileResponse.data.escort) {
      const escort = profileResponse.data.escort;
      console.log('WhatsApp in profile:', escort.whatsapp);
      console.log('Telegram in profile:', escort.telegram);
    } else {
      console.log('❌ No escort data found in response');
    }

    console.log('\n🎉 WhatsApp & Telegram test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWhatsAppTelegram();
