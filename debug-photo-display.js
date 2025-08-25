#!/usr/bin/env node

import fetch from "node-fetch";

console.log("🔍 DIAGNOSTIC COMPLET DES PHOTOS...\n");

const BACKEND_URL = "https://callgirls-api.onrender.com";
const FRONTEND_URL = "https://callgirls.vercel.app";

async function testPhotoAccess() {
  console.log("1️⃣ TEST ACCÈS BACKEND DIRECT");
  console.log("================================");
  
  try {
    // Test avatar Lola Lala
    const avatarUrl = `${BACKEND_URL}/uploads/avatars/1756139363733-appg9nupzmb.jpg`;
    console.log(`🔍 Testing avatar: ${avatarUrl}`);
    
    const avatarResponse = await fetch(avatarUrl);
    console.log(`   Status: ${avatarResponse.status} ${avatarResponse.statusText}`);
    console.log(`   Content-Type: ${avatarResponse.headers.get('content-type')}`);
    
    if (avatarResponse.ok) {
      console.log("   ✅ Avatar accessible");
    } else {
      console.log("   ❌ Avatar inaccessible");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log("");
  
  try {
    // Test galerie Lola Lala
    const galleryUrl = `${BACKEND_URL}/uploads/gallery/1756143767693-ry1drwpv28.HEIC`;
    console.log(`🔍 Testing gallery: ${galleryUrl}`);
    
    const galleryResponse = await fetch(galleryUrl);
    console.log(`   Status: ${galleryResponse.status} ${galleryResponse.statusText}`);
    console.log(`   Content-Type: ${galleryResponse.headers.get('content-type')}`);
    
    if (galleryResponse.ok) {
      console.log("   ✅ Gallery accessible");
    } else {
      console.log("   ❌ Gallery inaccessible");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log("");
}

async function testBackupManager() {
  console.log("2️⃣ TEST BACKUP MANAGER");
  console.log("=======================");
  
  try {
    const healthUrl = `${BACKEND_URL}/api/storage/health`;
    console.log(`🔍 Testing storage health: ${healthUrl}`);
    
    const response = await fetch(healthUrl);
    const data = await response.json();
    
    if (response.ok) {
      console.log("   ✅ Storage health accessible");
      console.log(`   📊 Total files: ${data.data?.backupManager?.totalFiles || 'N/A'}`);
      console.log(`   📊 Synced files: ${data.data?.backupManager?.syncedFiles || 'N/A'}`);
      console.log(`   📊 Local files: ${data.data?.storageHealth?.local?.fileCount || 'N/A'}`);
      console.log(`   📊 Render files: ${data.data?.storageHealth?.render?.fileCount || 'N/A'}`);
    } else {
      console.log(`   ❌ Storage health failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log("");
}

async function testDatabaseURLs() {
  console.log("3️⃣ TEST URLs BASE DE DONNÉES");
  console.log("=============================");
  
  try {
    // Test endpoint pour obtenir les données de Lola Lala
    const escortUrl = `${BACKEND_URL}/api/escort/profile/Lola%20Lala`;
    console.log(`🔍 Testing escort profile: ${escortUrl}`);
    
    const response = await fetch(escortUrl);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log("   ✅ Escort profile accessible");
      
      const escort = data.data;
      console.log(`   👤 Name: ${escort.name}`);
      console.log(`   🖼️ Avatar: ${escort.avatar}`);
      
      if (escort.gallery && escort.gallery.length > 0) {
        console.log(`   📸 Gallery: ${escort.gallery.length} photos`);
        escort.gallery.forEach((photo, index) => {
          console.log(`      ${index + 1}. ${photo.url}`);
        });
      } else {
        console.log("   ❌ No gallery photos found");
      }
    } else {
      console.log(`   ❌ Escort profile failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log("");
}

async function testFrontendAccess() {
  console.log("4️⃣ TEST ACCÈS FRONTEND");
  console.log("=========================");
  
  try {
    const frontendUrl = `${FRONTEND_URL}/ug/escort/Lola%20Lala`;
    console.log(`🔍 Testing frontend: ${frontendUrl}`);
    
    const response = await fetch(frontendUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log("   ✅ Frontend accessible");
      const html = await response.text();
      if (html.includes("1756139363733-appg9nupzmb.jpg")) {
        console.log("   ✅ Avatar URL found in HTML");
      } else {
        console.log("   ❌ Avatar URL NOT found in HTML");
      }
    } else {
      console.log(`   ❌ Frontend failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log("");
}

async function runDiagnostic() {
  console.log("🚀 DÉMARRAGE DU DIAGNOSTIC...\n");
  
  await testPhotoAccess();
  await testBackupManager();
  await testDatabaseURLs();
  await testFrontendAccess();
  
  console.log("🏁 DIAGNOSTIC TERMINÉ");
  console.log("📋 Vérifiez les résultats ci-dessus pour identifier le problème");
}

runDiagnostic().catch(console.error);
