const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import the UpgradeRequest model
const UpgradeRequest = require('./models/upgradeRequest.model');

async function checkJayRolandRequest() {
  try {
    console.log('🔍 Checking Jay Roland\'s upgrade request...');
    
    // Find Jay Roland's request
    const request = await UpgradeRequest.findOne({
      'escort.email': 'wildculture.project2024@gmail.com'
    }).populate('escort', 'name email phone avatar');
    
    if (!request) {
      console.log('❌ No request found for Jay Roland');
      return;
    }
    
    console.log('📋 Request Details:');
    console.log('ID:', request._id);
    console.log('Escort Name:', request.escort?.name);
    console.log('Email:', request.escort?.email);
    console.log('Requested Plan:', request.requestedPlan);
    console.log('Subscription Period:', request.subscriptionPeriod);
    console.log('Payment Amount:', request.paymentAmount);
    console.log('Status:', request.status);
    console.log('Created At:', request.createdAt);
    console.log('Updated At:', request.updatedAt);
    
    // Check if this should be annual
    if (request.requestedPlan === 'premium' && request.subscriptionPeriod === 'monthly') {
      console.log('\n⚠️  ISSUE DETECTED:');
      console.log('This is a premium request but subscriptionPeriod is "monthly"');
      console.log('It should probably be "annual" based on the user\'s message');
      
      // Check if we should update it
      console.log('\n🔧 Would you like to update this to annual? (y/n)');
      // For now, just show the issue
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkJayRolandRequest();
