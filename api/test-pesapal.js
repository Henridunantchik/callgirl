import pesapalService from './utils/pesapalService.js';
import pesapalConfig from './config/pesapal.js';

console.log('🧪 Testing PesaPal Integration...\n');

// Test configuration
console.log('📋 PesaPal Configuration:');
console.log('Environment:', pesapalConfig.environment);
console.log('Base URL:', pesapalConfig.endpoints.getBaseUrl());
console.log('Consumer Key:', pesapalConfig.consumerKey.substring(0, 10) + '...');
console.log('Consumer Secret:', pesapalConfig.consumerSecret.substring(0, 10) + '...\n');

// Test access token
async function testAccessToken() {
  console.log('🔑 Testing Access Token...');
  try {
    const token = await pesapalService.getAccessToken();
    console.log('✅ Access token obtained successfully');
    console.log('Token:', token.substring(0, 20) + '...\n');
    return token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    return null;
  }
}

// Test payment order creation
async function testPaymentOrder() {
  console.log('💳 Testing Payment Order Creation...');
  try {
    const orderData = {
      orderId: `TEST_${Date.now()}`,
      amount: 10.00,
      description: 'Test payment for Call Girls platform',
      type: 'MERCHANT',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      currency: 'USD'
    };

    const response = await pesapalService.createPaymentOrder(orderData);
    
    if (response.success) {
      console.log('✅ Payment order created successfully');
      console.log('Order ID:', response.orderId);
      console.log('Redirect URL:', response.redirectUrl);
      console.log('Full Response:', JSON.stringify(response, null, 2));
      return response.orderId;
    } else {
      console.error('❌ Failed to create payment order');
    }
  } catch (error) {
    console.error('❌ Error creating payment order:', error.message);
  }
  return null;
}

// Test payment status query
async function testPaymentStatus(orderId) {
  if (!orderId) {
    console.log('⏭️ Skipping payment status test (no order ID)');
    return;
  }

  console.log('📊 Testing Payment Status Query...');
  try {
    const response = await pesapalService.queryPaymentStatus(orderId);
    
    if (response.success) {
      console.log('✅ Payment status queried successfully');
      console.log('Status:', response.status);
      console.log('Tracking ID:', response.trackingId);
      console.log('Full Response:', JSON.stringify(response, null, 2));
    } else {
      console.error('❌ Failed to query payment status');
    }
  } catch (error) {
    console.error('❌ Error querying payment status:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting PesaPal Integration Tests...\n');
  
  // Test 1: Access Token
  const token = await testAccessToken();
  
  if (token) {
    // Test 2: Payment Order Creation
    const orderId = await testPaymentOrder();
    
    // Test 3: Payment Status Query
    await testPaymentStatus(orderId);
  }
  
  console.log('\n✅ PesaPal Integration Tests Completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Update your .env file with PesaPal credentials');
  console.log('2. Test the payment flow in your application');
  console.log('3. Configure IPN (Instant Payment Notification)');
  console.log('4. Set up proper error handling and logging');
}

// Run the tests
runTests().catch(console.error);
