import axios from 'axios';

console.log('🧪 Testing PesaPal API Connectivity...\n');

// Test different PesaPal endpoints
const endpoints = [
  'https://demo.pesapal.com',
  'https://www.pesapal.com',
  'https://cybqa.pesapal.com'
];

async function testEndpoint(url) {
  try {
    console.log(`Testing: ${url}`);
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ ${url} - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoint(baseUrl) {
  try {
    const authUrl = `${baseUrl}/api/Auth/RequestToken`;
    console.log(`Testing Auth: ${authUrl}`);
    
    const response = await axios.post(authUrl, '', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      timeout: 10000
    });
    
    console.log(`✅ Auth endpoint working - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Auth endpoint failed - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing PesaPal API endpoints...\n');
  
  for (const endpoint of endpoints) {
    const isAccessible = await testEndpoint(endpoint);
    if (isAccessible) {
      await testAuthEndpoint(endpoint);
      break;
    }
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Check which endpoint is accessible');
  console.log('2. Update the base URL in config/pesapal.js');
  console.log('3. Verify your PesaPal credentials');
  console.log('4. Contact PesaPal support if needed');
}

runTests().catch(console.error);
