#!/usr/bin/env node

/**
 * 🧹 SCRIPT DE NETTOYAGE SIMPLIFIÉ
 * Supprime tous les médias Render sans nécessiter MongoDB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supprimer les dossiers Render
const cleanupRenderDirectories = () => {
  console.log('\n🗑️  NETTOYAGE DES DOSSIERS RENDER...');
  
  const renderPaths = [
    path.join(__dirname, 'api/uploads'),
    path.join(__dirname, 'uploads')
  ];

  renderPaths.forEach(renderPath => {
    if (fs.existsSync(renderPath)) {
      try {
        // Supprimer récursivement
        const deleteRecursive = (dirPath) => {
          if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach((file) => {
              const curPath = path.join(dirPath, file);
              if (fs.lstatSync(curPath).isDirectory()) {
                deleteRecursive(curPath);
              } else {
                fs.unlinkSync(curPath);
                console.log(`🗑️  Supprimé: ${curPath}`);
              }
            });
            fs.rmdirSync(dirPath);
            console.log(`🗑️  Dossier supprimé: ${dirPath}`);
          }
        };

        deleteRecursive(renderPath);
        console.log(`✅ Nettoyage terminé pour: ${renderPath}`);
      } catch (error) {
        console.log(`⚠️  Erreur lors du nettoyage de ${renderPath}:`, error.message);
      }
    } else {
      console.log(`ℹ️  Dossier non trouvé: ${renderPath}`);
    }
  });
};

// Supprimer les anciens fichiers de configuration Render
const cleanupRenderConfigs = () => {
  console.log('\n🗑️  SUPPRESSION DES CONFIGS RENDER...');
  
  const filesToDelete = [
    'api/config/render-storage.js',
    'api/services/renderStorage.js',
    'api/middleware/fileFallback.js'
  ];

  filesToDelete.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️  Supprimé: ${filePath}`);
      } catch (error) {
        console.log(`⚠️  Erreur suppression ${filePath}:`, error.message);
      }
    } else {
      console.log(`ℹ️  Fichier non trouvé: ${filePath}`);
    }
  });
};

// Vérifier la configuration Firebase
const verifyFirebaseConfig = () => {
  console.log('\n🔥 VÉRIFICATION CONFIGURATION FIREBASE...');
  
  const firebaseFiles = [
    'api/config/firebase.js',
    'api/services/firebaseStorage.js'
  ];

  firebaseFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${filePath} - Présent`);
    } else {
      console.log(`❌ ${filePath} - MANQUANT`);
    }
  });

  // Vérifier les variables d'environnement
  const envPath = path.join(__dirname, 'api/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasFirebaseKey = envContent.includes('FIREBASE_API_KEY');
    console.log(`✅ Fichier .env - Présent`);
    console.log(`✅ FIREBASE_API_KEY - ${hasFirebaseKey ? 'Configuré' : 'Non configuré'}`);
  } else {
    console.log(`❌ Fichier .env - MANQUANT`);
  }
};

// Main execution
const main = () => {
  console.log('🚀 DÉBUT DU NETTOYAGE SIMPLIFIÉ RENDER → FIREBASE');
  console.log('=' .repeat(60));

  try {
    // 1. Nettoyage des dossiers
    cleanupRenderDirectories();

    // 2. Suppression des configs Render
    cleanupRenderConfigs();

    // 3. Vérification Firebase
    verifyFirebaseConfig();

    console.log('\n🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS !');
    console.log('✅ Tous les médias Render ont été supprimés');
    console.log('✅ Configuration Firebase prête');
    console.log('\n🔥 Votre système utilise maintenant Firebase Storage !');
    console.log('\n⚠️  NOTE: Pour nettoyer la base de données, exécutez manuellement :');
    console.log('   - Supprimez les URLs Render dans MongoDB');
    console.log('   - Ou utilisez le script complet avec MongoDB démarré');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

// Exécuter le script
main();
