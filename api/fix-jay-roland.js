const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const UpgradeRequest = require('./models/upgradeRequest.model');

async function fixJayRoland() {
  try {
    console.log('🔍 Finding Jay Roland\'s premium request...');
    
    const request = await UpgradeRequest.findOne({
      'escortEmail': 'wildculture.project2024@gmail.com',
      'requestedPlan': 'premium'
    });
    
    if (!request) {
      console.log('❌ No premium request found for Jay Roland');
      return;
    }
    
    console.log('📋 Current request:');
    console.log('ID:', request._id);
    console.log('Plan:', request.requestedPlan);
    console.log('Period:', request.subscriptionPeriod);
    console.log('Amount:', request.paymentAmount);
    console.log('Status:', request.status);
    
    if (request.subscriptionPeriod === 'monthly') {
      console.log('\n🔧 Updating to annual...');
      
      const updated = await UpgradeRequest.findByIdAndUpdate(
        request._id,
        {
          subscriptionPeriod: 'annual',
          paymentAmount: 60
        },
        { new: true }
      );
      
      console.log('✅ Updated successfully!');
      console.log('New Period:', updated.subscriptionPeriod);
      console.log('New Amount:', updated.paymentAmount);
    } else {
      console.log('✅ Already annual');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixJayRoland();
