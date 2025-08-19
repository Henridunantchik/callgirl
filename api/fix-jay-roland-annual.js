const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const UpgradeRequest = require('./models/upgradeRequest.model');

async function fixJayRolandRequest() {
  try {
    console.log('🔍 Finding Jay Roland\'s premium request...');
    
    // Find the premium request for Jay Roland
    const request = await UpgradeRequest.findOne({
      'escort.email': 'wildculture.project2024@gmail.com',
      requestedPlan: 'premium'
    });
    
    if (!request) {
      console.log('❌ No premium request found for Jay Roland');
      return;
    }
    
    console.log('📋 Current request details:');
    console.log('ID:', request._id);
    console.log('Requested Plan:', request.requestedPlan);
    console.log('Subscription Period:', request.subscriptionPeriod);
    console.log('Payment Amount:', request.paymentAmount);
    console.log('Status:', request.status);
    
    // Update to annual
    if (request.subscriptionPeriod === 'monthly') {
      console.log('\n🔧 Updating to annual...');
      
      const updatedRequest = await UpgradeRequest.findByIdAndUpdate(
        request._id,
        {
          subscriptionPeriod: 'annual',
          paymentAmount: 60
        },
        { new: true }
      );
      
      console.log('✅ Updated successfully!');
      console.log('New Subscription Period:', updatedRequest.subscriptionPeriod);
      console.log('New Payment Amount:', updatedRequest.paymentAmount);
    } else {
      console.log('✅ Already annual, no update needed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixJayRolandRequest();
