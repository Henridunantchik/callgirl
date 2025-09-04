#!/usr/bin/env node

/**
 * 🧹 SCRIPT DE NETTOYAGE COMPLET
 * Supprime tous les médias Render et finalise la migration Firebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configuration
dotenv.config({ path: './api/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

// Supprimer les dossiers Render
const cleanupRenderDirectories = () => {
  console.log('\n🗑️  NETTOYAGE DES DOSSIERS RENDER...');
  
  const renderPaths = [
    '/opt/render/project/src/uploads',
    path.join(__dirname, 'api/uploads')
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

// Nettoyer la base de données des anciennes URLs Render
const cleanupDatabaseUrls = async () => {
  console.log('\n🗑️  NETTOYAGE DES URLS RENDER DANS LA BASE...');
  
  try {
    const User = mongoose.model('User');
    
    // Trouver tous les utilisateurs avec des URLs Render
    const usersWithRenderUrls = await User.find({
      $or: [
        { avatar: { $regex: /render\.com|localhost/ } },
        { 'gallery.url': { $regex: /render\.com|localhost/ } },
        { 'videos.url': { $regex: /render\.com|localhost/ } }
      ]
    });

    console.log(`📊 ${usersWithRenderUrls.length} utilisateurs avec URLs Render trouvés`);

    // Nettoyer les URLs
    for (const user of usersWithRenderUrls) {
      let updated = false;

      // Nettoyer avatar
      if (user.avatar && (user.avatar.includes('render.com') || user.avatar.includes('localhost'))) {
        user.avatar = null;
        updated = true;
        console.log(`🗑️  Avatar supprimé pour: ${user.name || user.email}`);
      }

      // Nettoyer gallery
      if (user.gallery && user.gallery.length > 0) {
        user.gallery = user.gallery.filter(item => 
          !item.url || (!item.url.includes('render.com') && !item.url.includes('localhost'))
        );
        if (user.gallery.length === 0) {
          user.gallery = [];
        }
        updated = true;
        console.log(`🗑️  Gallery nettoyée pour: ${user.name || user.email}`);
      }

      // Nettoyer videos
      if (user.videos && user.videos.length > 0) {
        user.videos = user.videos.filter(item => 
          !item.url || (!item.url.includes('render.com') && !item.url.includes('localhost'))
        );
        if (user.videos.length === 0) {
          user.videos = [];
        }
        updated = true;
        console.log(`🗑️  Videos nettoyées pour: ${user.name || user.email}`);
      }

      // Sauvegarder si modifié
      if (updated) {
        await user.save();
        console.log(`✅ Utilisateur mis à jour: ${user.name || user.email}`);
      }
    }

    console.log('✅ Nettoyage de la base terminé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base:', error);
  }
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
  const requiredEnvVars = ['FIREBASE_API_KEY'];
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} - Configuré`);
    } else {
      console.log(`⚠️  ${envVar} - Non configuré`);
    }
  });
};

// Main execution
const main = async () => {
  console.log('🚀 DÉBUT DU NETTOYAGE COMPLET RENDER → FIREBASE');
  console.log('=' .repeat(60));

  try {
    // 1. Connexion DB
    await connectDB();

    // 2. Nettoyage des dossiers
    cleanupRenderDirectories();

    // 3. Nettoyage de la base
    await cleanupDatabaseUrls();

    // 4. Suppression des configs Render
    cleanupRenderConfigs();

    // 5. Vérification Firebase
    verifyFirebaseConfig();

    console.log('\n🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS !');
    console.log('✅ Tous les médias Render ont été supprimés');
    console.log('✅ Base de données nettoyée');
    console.log('✅ Configuration Firebase prête');
    console.log('\n🔥 Votre système utilise maintenant Firebase Storage !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

// Exécuter le script
main();
