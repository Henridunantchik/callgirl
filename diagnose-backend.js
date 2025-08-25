#!/usr/bin/env node

/**
 * Backend Diagnosis Script
 * Comprehensive backend health check
 */

import fetch from "node-fetch";

const BACKEND_URL = "https://callgirls-api.onrender.com";

const testEndpoint = async (endpoint, description) => {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`);
    const status = response.status;
    const statusText = response.statusText;
    
    if (status === 200) {
      console.log(`✅ ${description}: ${status} ${statusText}`);
      try {
        const data = await response.json();
        console.log(`   📊 Data: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (e) {
        console.log(`   📄 Response: ${await response.text().substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ ${description}: ${status} ${statusText}`);
    }
  } catch (error) {
    console.log(`🚨 ${description}: ${error.message}`);
  }
};

const diagnoseBackend = async () => {
  console.log("🔍 Backend Diagnosis Starting...\n");
  
  // Test basic endpoints
  await testEndpoint("/", "Root endpoint");
  await testEndpoint("/api", "API base");
  await testEndpoint("/api/health", "Health check");
  await testEndpoint("/api/escort/list", "Escort list");
  
  // Test specific endpoints
  await testEndpoint("/api/escort/profile/Lola%20Lala", "Lola Lala profile");
  
  // Test debug endpoints
  await testEndpoint("/debug/files", "Debug files");
  await testEndpoint("/api/storage/health", "Storage health");
  await testEndpoint("/api/storage/sync", "Storage sync");
  
  // Test file serving
  await testEndpoint("/uploads", "Uploads directory");
  await testEndpoint("/uploads/avatars", "Avatars directory");
  await testEndpoint("/uploads/gallery", "Gallery directory");
  
  console.log("\n🎯 Diagnosis Complete!");
  console.log("\n📝 If most endpoints return 404:");
  console.log("   🚨 Your backend is not running properly");
  console.log("   🔧 Check Render deployment status");
  console.log("   📱 Check Render logs for errors");
};

diagnoseBackend().catch(console.error);
