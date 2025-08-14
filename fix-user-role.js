const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function fixUserRole() {
  try {
    console.log('🔧 Fixing user role...\n');

    // 1. Login with existing user
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'hdchikuru7@gmail.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');
    console.log('User role:', loginResponse.data.user.role);
    console.log('User ID:', loginResponse.data.user._id);

    // 2. Update user role to escort
    console.log('\n2️⃣ Updating user role to escort...');
    const updateResponse = await axios.put(
      `${API_BASE_URL}/user/update`,
      { role: 'escort' },
      { headers }
    );

    console.log('✅ Role updated:', updateResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixUserRole();
