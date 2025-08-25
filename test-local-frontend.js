#!/usr/bin/env node

/**
 * Test Local Frontend
 * Checks why photos don't show up on localhost:5173/ug
 */

import fetch from "node-fetch";

const LOCAL_API = "http://localhost:5000";
const PROD_API = "https://callgirls-api.onrender.com";

/**
 * Test local API endpoints
 */
const testLocalAPI = async () => {
  console.log("🔍 Testing Local API...\n");

  try {
    // Test 1: API health
    console.log("📡 Testing API health...");
    try {
      const healthResponse = await fetch(`${LOCAL_API}/api/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`  ✅ Local API: ${healthData.status}`);
      } else {
        console.log(
          `  ❌ Local API: ${healthResponse.status} ${healthResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(`  ❌ Local API: Not accessible - ${error.message}`);
    }

    // Test 2: Escort list
    console.log("\n📋 Testing escort list...");
    try {
      const escortResponse = await fetch(`${LOCAL_API}/api/escort/list`);
      if (escortResponse.ok) {
        const escortData = await escortResponse.json();
        console.log(
          `  ✅ Escort list: ${
            escortData.data?.escorts?.length || 0
          } escorts found`
        );

        // Check first escort for media
        if (escortData.data?.escorts?.[0]) {
          const firstEscort = escortData.data.escorts[0];
          console.log(`  📊 First escort: ${firstEscort.name}`);
          console.log(`    Avatar: ${firstEscort.avatar ? "✅" : "❌"}`);
          console.log(
            `    Gallery: ${firstEscort.gallery?.length || 0} photos`
          );
          console.log(`    Videos: ${firstEscort.videos?.length || 0} videos`);
        }
      } else {
        console.log(
          `  ❌ Escort list: ${escortResponse.status} ${escortResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(`  ❌ Escort list: Error - ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Local API test failed:", error);
  }
};

/**
 * Test production API endpoints
 */
const testProductionAPI = async () => {
  console.log("\n☁️ Testing Production API...\n");

  try {
    // Test 1: API health
    console.log("📡 Testing production API health...");
    try {
      const healthResponse = await fetch(`${PROD_API}/api/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`  ✅ Production API: ${healthData.status}`);
      } else {
        console.log(
          `  ❌ Production API: ${healthResponse.status} ${healthResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(`  ❌ Production API: Error - ${error.message}`);
    }

    // Test 2: Escort list
    console.log("\n📋 Testing production escort list...");
    try {
      const escortResponse = await fetch(`${PROD_API}/api/escort/list`);
      if (escortResponse.ok) {
        const escortData = await escortResponse.json();
        console.log(
          `  ✅ Production escort list: ${
            escortData.data?.escorts?.length || 0
          } escorts found`
        );

        // Check first escort for media
        if (escortData.data?.escorts?.[0]) {
          const firstEscort = escortData.data.escorts[0];
          console.log(`  📊 First escort: ${firstEscort.name}`);
          console.log(`    Avatar: ${firstEscort.avatar ? "✅" : "❌"}`);
          console.log(
            `    Gallery: ${firstEscort.gallery?.length || 0} photos`
          );
          console.log(`    Videos: ${firstEscort.videos?.length || 0} videos`);
        }
      } else {
        console.log(
          `  ❌ Production escort list: ${escortResponse.status} ${escortResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(`  ❌ Production escort list: Error - ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Production API test failed:", error);
  }
};

/**
 * Test specific escort profile
 */
const testEscortProfile = async () => {
  console.log("\n👤 Testing specific escort profile...\n");

  try {
    // Test Lola Lala profile
    const slug = "Lola%20Lala";
    console.log(`🔍 Testing profile: ${slug}`);

    // Test local
    try {
      const localResponse = await fetch(
        `${LOCAL_API}/api/escort/profile/${slug}`
      );
      if (localResponse.ok) {
        const localData = await localResponse.json();
        console.log(`  ✅ Local profile: ${localData.data?.escort?.name}`);
        console.log(
          `    Avatar: ${localData.data?.escort?.avatar ? "✅" : "❌"}`
        );
        console.log(
          `    Gallery: ${localData.data?.escort?.gallery?.length || 0} photos`
        );
        console.log(
          `    Videos: ${localData.data?.escort?.videos?.length || 0} videos`
        );
      } else {
        console.log(
          `  ❌ Local profile: ${localResponse.status} ${localResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(`  ❌ Local profile: Error - ${error.message}`);
    }

    // Test production
    try {
      const prodResponse = await fetch(
        `${PROD_API}/api/escort/profile/${slug}`
      );
      if (prodResponse.ok) {
        const prodData = await prodResponse.json();
        console.log(`  ✅ Production profile: ${prodData.data?.escort?.name}`);
        console.log(
          `    Avatar: ${prodData.data?.escort?.avatar ? "✅" : "❌"}`
        );
        console.log(
          `    Gallery: ${prodData.data?.escort?.gallery?.length || 0} photos`
        );
        console.log(
          `    Videos: ${prodData.data?.escort?.videos?.length || 0} videos`
        );
      } else {
        console.log(
          `  ❌ Production profile: ${prodResponse.status} ${prodResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(`  ❌ Production profile: Error - ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Profile test failed:", error);
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log("🔍 Testing Why Photos Don't Show on Localhost:5173/ug...\n");

  try {
    // Test local API
    await testLocalAPI();

    // Test production API
    await testProductionAPI();

    // Test specific profile
    await testEscortProfile();

    console.log("\n🎉 Frontend diagnostic complete!");
    console.log("\n📝 Possible issues:");
    console.log("  1. Local API not running on port 5000");
    console.log("  2. Database still has obsolete media references");
    console.log("  3. Frontend not connecting to correct API");
  } catch (error) {
    console.error("❌ Diagnostic failed:", error);
  }
};

// Run the diagnostic
main().catch(console.error);
