#!/usr/bin/env node

/**
 * 🔥 SCRIPT DE TEST FIREBASE STORAGE
 * Teste l'upload et la récupération de fichiers
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Configuration
dotenv.config({ path: "./api/.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔥 TEST FIREBASE STORAGE");
console.log("=".repeat(40));

// Vérifier la configuration
const checkConfig = () => {
  console.log("\n📋 VÉRIFICATION CONFIGURATION :");

  const requiredVars = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
  ];

  let allGood = true;
  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} - Configuré`);
    } else {
      console.log(`❌ ${varName} - MANQUANT`);
      allGood = false;
    }
  });

  return allGood;
};

// Vérifier les fichiers Firebase
const checkFiles = () => {
  console.log("\n📁 VÉRIFICATION FICHIERS FIREBASE :");

  const requiredFiles = [
    "api/config/firebase.js",
    "api/services/firebaseStorage.js",
  ];

  let allGood = true;
  requiredFiles.forEach((filePath) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${filePath} - Présent`);
    } else {
      console.log(`❌ ${filePath} - MANQUANT`);
      allGood = false;
    }
  });

  return allGood;
};

// Créer un fichier de test
const createTestFile = () => {
  console.log("\n📝 CRÉATION FICHIER DE TEST :");

  const testDir = path.join(__dirname, "test-files");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log("✅ Dossier test-files créé");
  }

  const testFilePath = path.join(testDir, "test-image.jpg");
  const testContent = Buffer.from("fake-jpeg-data-for-testing");

  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log("✅ Fichier de test créé : test-image.jpg");
    return testFilePath;
  } catch (error) {
    console.log("❌ Erreur création fichier de test:", error.message);
    return null;
  }
};

// Instructions de test manuel
const showManualTestInstructions = () => {
  console.log("\n🧪 INSTRUCTIONS DE TEST MANUEL :");
  console.log("");

  console.log("1️⃣  DÉMARRER L'API :");
  console.log("   cd api");
  console.log("   npm start");
  console.log("");

  console.log("2️⃣  TESTER L'UPLOAD D'AVATAR :");
  console.log("   curl -X POST http://localhost:5000/api/user/update \\");
  console.log('     -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('     -F "avatar=@test-files/test-image.jpg"');
  console.log("");

  console.log("3️⃣  TESTER L'UPLOAD DE GALERIE :");
  console.log(
    "   curl -X POST http://localhost:5000/api/escort/gallery/USER_ID \\"
  );
  console.log('     -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('     -F "gallery=@test-files/test-image.jpg"');
  console.log("");

  console.log("4️⃣  VÉRIFIER DANS FIREBASE :");
  console.log("   - Allez sur Firebase Console");
  console.log("   - Vérifiez Storage > Bucket");
  console.log("   - Vos fichiers doivent apparaître");
  console.log("");

  console.log("5️⃣  VÉRIFIER LES URLS GÉNÉRÉES :");
  console.log("   - Les URLs doivent commencer par :");
  console.log("   - https://firebasestorage.googleapis.com/...");
  console.log("   - PAS par localhost ou render.com");
  console.log("");
};

// Instructions de déploiement
const showDeploymentInstructions = () => {
  console.log("\n🚀 INSTRUCTIONS DE DÉPLOIEMENT :");
  console.log("");

  console.log("1️⃣  VARIABLES D'ENVIRONNEMENT PRODUCTION :");
  console.log("   - Ajoutez les variables Firebase dans votre hébergeur");
  console.log("   - Vérifiez que NODE_ENV=production");
  console.log("");

  console.log("2️⃣  RÈGLES FIREBASE :");
  console.log("   - Copiez le contenu de firebase-storage-rules.rules");
  console.log("   - Collez dans Firebase Console > Storage > Rules");
  console.log("   - Publiez les règles");
  console.log("");

  console.log("3️⃣  TEST DE PRODUCTION :");
  console.log("   - Déployez votre API");
  console.log("   - Testez l'upload d'un fichier");
  console.log("   - Vérifiez que l'URL est Firebase");
  console.log("");
};

// Main execution
const main = () => {
  try {
    // 1. Vérifier la configuration
    const configOk = checkConfig();

    // 2. Vérifier les fichiers
    const filesOk = checkFiles();

    // 3. Créer fichier de test
    const testFile = createTestFile();

    // 4. Résumé
    console.log("\n📊 RÉSUMÉ DES VÉRIFICATIONS :");
    console.log(`   Configuration: ${configOk ? "✅ OK" : "❌ PROBLÈME"}`);
    console.log(`   Fichiers: ${filesOk ? "✅ OK" : "❌ PROBLÈME"}`);
    console.log(`   Fichier de test: ${testFile ? "✅ Créé" : "❌ Échec"}`);

    if (configOk && filesOk) {
      console.log("\n🎉 TOUT EST PRÊT POUR FIREBASE !");
      console.log("   Votre configuration est correcte");
      console.log("   Vous pouvez maintenant tester l'upload");
    } else {
      console.log("\n⚠️  PROBLÈMES DÉTECTÉS :");
      console.log("   Corrigez les erreurs avant de continuer");
    }

    // 5. Instructions de test
    showManualTestInstructions();

    // 6. Instructions de déploiement
    showDeploymentInstructions();
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
};

// Exécuter le script
main();
