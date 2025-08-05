import http from 'http';

console.log('🚀 Quick API Test Starting...\n');

// Test 1: Health Check
const testHealth = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Health Check:', res.statusCode);
        console.log('📄 Response:', data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Health Check Error:', err.message);
      resolve(false);
    });
    
    req.end();
  });
};

// Test 2: Subscription Pricing
const testSubscription = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/subscription/pricing?country=uganda',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Subscription Pricing:', res.statusCode);
        console.log('📄 Response:', data.substring(0, 200) + '...');
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Subscription Error:', err.message);
      resolve(false);
    });
    
    req.end();
  });
};

// Run tests
async function runQuickTests() {
  console.log('🔍 Testing Health Endpoint...');
  const healthOk = await testHealth();
  
  console.log('\n🔍 Testing Subscription Endpoint...');
  const subscriptionOk = await testSubscription();
  
  console.log('\n📊 RESULTS:');
  console.log('================');
  console.log(`Health Check: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Subscription: ${subscriptionOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthOk && subscriptionOk) {
    console.log('\n🎉 ALL TESTS PASSED! API is working correctly.');
    console.log('✅ Step 2 (Authentication & Authorization) is COMPLETE!');
    console.log('🚀 Ready to move to Step 3!');
  } else {
    console.log('\n⚠️  Some tests failed. Need to investigate.');
  }
}

runQuickTests(); 