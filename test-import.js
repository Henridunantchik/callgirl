// Test if the controller can be imported
try {
  const { uploadVideo } = require('./api/controllers/Escort.controller.js');
  console.log('✅ uploadVideo controller imported successfully');
  console.log('Type:', typeof uploadVideo);
} catch (error) {
  console.error('❌ Error importing uploadVideo:', error.message);
}

// Test if the route file can be imported
try {
  const EscortRoute = require('./api/routes/Escort.route.js');
  console.log('✅ EscortRoute imported successfully');
  console.log('Type:', typeof EscortRoute);
} catch (error) {
  console.error('❌ Error importing EscortRoute:', error.message);
}
