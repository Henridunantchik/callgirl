#!/usr/bin/env node

/**
 * Test Image Access Script
 * This script tests image access from different environments to identify the issue
 */

import fetch from 'node-fetch';

const TEST_URLS = [
  // Test direct image access
  'https://callgirls-api.onrender.com/uploads/gallery/1756030278154-9o8xxjigggo.jpg',
  'https://callgirls-api.onrender.com/uploads/avatars/1755688487198-xgn787so3r.jpg',
  
  // Test API endpoints
  'https://callgirls-api.onrender.com/health',
  'https://callgirls-api.onrender.com/api/status',
  'https://callgirls-api.onrender.com/debug/files',
  
  // Test with different headers
  'https://callgirls-api.onrender.com/uploads/gallery/1756030278156-w8btao1rxje.jpg',
];

const testImageAccess = async () => {
  console.log('🔍 Testing Image Access...\n');
  
  for (const url of TEST_URLS) {
    try {
      console.log(`📡 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,application/json,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        timeout: 10000,
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Length: ${response.headers.get('content-length')}`);
      console.log(`   Cache-Control: ${response.headers.get('cache-control')}`);
      console.log(`   CORS: ${response.headers.get('access-control-allow-origin')}`);
      
      if (response.ok) {
        if (url.includes('/uploads/')) {
          const buffer = await response.buffer();
          console.log(`   ✅ Image loaded successfully (${buffer.length} bytes)`);
        } else {
          const text = await response.text();
          console.log(`   ✅ API response: ${text.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ Failed to load`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test environment detection
  console.log('🌍 Testing Environment Detection...');
  try {
    const envResponse = await fetch('https://callgirls-api.onrender.com/debug/files');
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('   Environment:', envData.data?.environment);
      console.log('   Upload Path:', envData.data?.uploadPath);
      console.log('   Base URL:', envData.data?.baseUrl);
      console.log('   Storage Info:', JSON.stringify(envData.data?.storageInfo, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Could not test environment: ${error.message}`);
  }
};

// Run the test
testImageAccess().catch(console.error);
