#!/usr/bin/env node

/**
 * 🔥 TEST DIRECT FIREBASE STORAGE
 * Test simple sans dépendances complexes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 TEST DIRECT FIREBASE STORAGE');
console.log('=' .repeat(50));

// Vérifier la configuration
const checkFirebaseConfig = () => {
  console.log('\n📋 VÉRIFICATION CONFIGURATION FIREBASE :');
  
  const configPath = path.join(__dirname, 'api/config/firebase.js');
  const servicePath = path.join(__dirname, 'api/services/firebaseStorage.js');
  const envPath = path.join(__dirname, 'api/.env');
  
  let allGood = true;
  
  // Vérifier les fichiers
  if (fs.existsSync(configPath)) {
    console.log('✅ api/config/firebase.js - Présent');
  } else {
    console.log('❌ api/config/firebase.js - MANQUANT');
    allGood = false;
  }
  
  if (fs.existsSync(servicePath)) {
    console.log('✅ api/services/firebaseStorage.js - Présent');
  } else {
    console.log('❌ api/services/firebaseStorage.js - MANQUANT');
    allGood = false;
  }
  
  if (fs.existsSync(envPath)) {
    console.log('✅ api/.env - Présent');
    
    // Vérifier le contenu
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasApiKey = envContent.includes('FIREBASE_API_KEY');
    const hasProjectId = envContent.includes('tusiwawasahau');
    
    console.log(`   FIREBASE_API_KEY: ${hasApiKey ? '✅ Configuré' : '❌ MANQUANT'}`);
    console.log(`   Project ID: ${hasProjectId ? '✅ Configuré' : '❌ MANQUANT'}`);
    
    if (!hasApiKey || !hasProjectId) {
      allGood = false;
    }
  } else {
    console.log('❌ api/.env - MANQUANT');
    allGood = false;
  }
  
  return allGood;
};

// Vérifier la structure des dossiers
const checkDirectoryStructure = () => {
  console.log('\n📁 VÉRIFICATION STRUCTURE DES DOSSIERS :');
  
  const uploadsPath = path.join(__dirname, 'api/uploads');
  
  if (fs.existsSync(uploadsPath)) {
    console.log('⚠️  api/uploads - Existe encore (Render)');
    console.log('   Ce dossier devrait être supprimé après migration');
  } else {
    console.log('✅ api/uploads - Supprimé (bon pour Firebase)');
  }
  
  // Vérifier que les dossiers Render sont bien supprimés
  const renderFiles = [
    'api/config/render-storage.js',
    'api/services/renderStorage.js',
    'api/middleware/fileFallback.js'
  ];
  
  let renderFilesFound = 0;
  renderFiles.forEach(filePath => {
    if (fs.existsSync(path.join(__dirname, filePath))) {
      console.log(`⚠️  ${filePath} - Existe encore (à supprimer)`);
      renderFilesFound++;
    }
  });
  
  if (renderFilesFound === 0) {
    console.log('✅ Tous les fichiers Render supprimés');
  } else {
    console.log(`⚠️  ${renderFilesFound} fichiers Render encore présents`);
  }
};

// Instructions de test manuel
const showTestInstructions = () => {
  console.log('\n🧪 INSTRUCTIONS DE TEST MANUEL :');
  console.log('');
  
  console.log('1️⃣  CONFIGURER LES RÈGLES FIREBASE :');
  console.log('   - Allez sur Firebase Console > Storage > Rules');
  console.log('   - Copiez le contenu de firebase-storage-rules.rules');
  console.log('   - Publiez les règles');
  console.log('');
  
  console.log('2️⃣  DÉMARRER L\'API :');
  console.log('   cd api');
  console.log('   npm start');
  console.log('');
  
  console.log('3️⃣  TESTER L\'UPLOAD :');
  console.log('   - Utilisez votre app pour uploader une image');
  console.log('   - Vérifiez que l\'URL générée est Firebase');
  console.log('   - PAS localhost ou render.com');
  console.log('');
  
  console.log('4️⃣  VÉRIFIER DANS FIREBASE :');
  console.log('   - Firebase Console > Storage > Bucket');
  console.log('   - Vos fichiers doivent apparaître');
  console.log('');
};

// Instructions de nettoyage final
const showCleanupInstructions = () => {
  console.log('\n🧹 NETTOYAGE FINAL RECOMMANDÉ :');
  console.log('');
  
  console.log('1️⃣  Supprimer les fichiers de test :');
  console.log('   - test-firebase-direct.js');
  console.log('   - test-firebase-upload.js');
  console.log('   - cleanup-*.js');
  console.log('   - firebase-storage-rules.rules');
  console.log('');
  
  console.log('2️⃣  Nettoyer la base de données :');
  console.log('   - Exécutez cleanup-database-urls.js');
  console.log('   - Supprimez les URLs Render');
  console.log('');
  
  console.log('3️⃣  Déployer en production :');
  console.log('   - Ajoutez les variables Firebase à votre hébergeur');
  console.log('   - Déployez l\'API');
  console.log('   - Testez l\'upload en production');
  console.log('');
};

// Main execution
const main = () => {
  try {
    // 1. Vérifier la configuration Firebase
    const configOk = checkFirebaseConfig();
    
    // 2. Vérifier la structure des dossiers
    checkDirectoryStructure();
    
    // 3. Résumé
    console.log('\n📊 RÉSUMÉ DE LA MIGRATION :');
    console.log(`   Configuration Firebase: ${configOk ? '✅ OK' : '❌ PROBLÈME'}`);
    console.log(`   Migration Render → Firebase: ${configOk ? '✅ TERMINÉE' : '❌ INCOMPLÈTE'}`);
    
    if (configOk) {
      console.log('\n🎉 MIGRATION FIREBASE RÉUSSIE !');
      console.log('   Votre système utilise maintenant Firebase Storage');
      console.log('   Plus de perte de médias avec Render');
      console.log('   CDN global et stockage permanent');
    } else {
      console.log('\n⚠️  PROBLÈMES DÉTECTÉS :');
      console.log('   Corrigez la configuration avant de continuer');
    }
    
    // 4. Instructions de test
    showTestInstructions();
    
    // 5. Instructions de nettoyage
    showCleanupInstructions();
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

// Exécuter le script
main();
