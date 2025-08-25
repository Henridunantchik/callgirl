#!/usr/bin/env node

/**
 * Debug Escort Profile Script
 * Tests the escort profile API to see what data is returned
 */

import fetch from "node-fetch";

const API_BASE = "https://callgirls-api.onrender.com";

const testEscortProfile = async () => {
  try {
    console.log("🔍 Testing Escort Profile API...\n");

    // Test 1: Get escort by slug
    const slug = "Lola%20Lala";
    const decodedSlug = decodeURIComponent(slug);
    console.log(`📝 Testing slug: "${slug}" (decoded: "${decodedSlug}")`);

    const response = await fetch(
      `${API_BASE}/api/escort/profile/${decodedSlug}`
    );
    console.log(
      `📡 Response status: ${response.status} ${response.statusText}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response received");
      console.log("📊 Response structure:", {
        hasData: !!data.data,
        hasEscort: !!data.data?.escort,
        hasGallery: !!data.data?.escort?.gallery,
        galleryLength: data.data?.escort?.gallery?.length || 0,
      });

      if (data.data?.escort?.gallery) {
        console.log("\n🖼️ Gallery data:");
        data.data.escort.gallery.forEach((photo, index) => {
          console.log(`  Photo ${index + 1}:`, {
            url: photo.url,
            publicId: photo.publicId,
            caption: photo.caption,
            isPrivate: photo.isPrivate,
          });
        });

        // Test direct image access
        console.log("\n🔍 Testing direct image access...");
        for (const photo of data.data.escort.gallery) {
          try {
            const imgResponse = await fetch(photo.url);
            console.log(
              `  ${photo.url}: ${imgResponse.status} ${imgResponse.statusText}`
            );

            if (imgResponse.ok) {
              const contentType = imgResponse.headers.get("content-type");
              const contentLength = imgResponse.headers.get("content-length");
              console.log(
                `    ✅ Content-Type: ${contentType}, Size: ${contentLength} bytes`
              );
            }
          } catch (error) {
            console.log(`  ❌ ${photo.url}: Error - ${error.message}`);
          }
        }
      } else {
        console.log("❌ No gallery data found in response");
        console.log("🔍 Full response data:", JSON.stringify(data, null, 2));
      }
    } else {
      console.log("❌ API request failed");
      const errorText = await response.text();
      console.log("Error response:", errorText);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Run the test
testEscortProfile();
