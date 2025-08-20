import renderStorageConfig from './config/render-storage.js';

console.log('=== RENDER URL TEST ===');
console.log('Base URL:', renderStorageConfig.baseUrl);

// Test different file paths
const testPaths = [
  '/opt/render/project/src/uploads/avatars/test.jpg',
  '/opt/render/project/src/uploads/gallery/test.jpg',
  '/opt/render/project/src/uploads/videos/test.mp4'
];

testPaths.forEach(filePath => {
  const url = renderStorageConfig.getFileUrl(filePath);
  console.log(`File: ${filePath}`);
  console.log(`URL: ${url}`);
  console.log('---');
});

console.log('✅ URL generation test complete');
