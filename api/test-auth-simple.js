import pesapalSimple from './utils/pesapalSimple.js';

console.log('🧪 Testing PesaPal Simple Authentication...\n');

async function testAuth() {
  try {
    console.log('🔑 Testing PesaPal Authentication...');
    const result = await pesapalSimple.testAuth();
    console.log('✅ Authentication successful!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

testAuth();
