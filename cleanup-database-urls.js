#!/usr/bin/env node

/**
 * 🗄️ SCRIPT DE NETTOYAGE DES URLS RENDER DANS LA BASE
 * Instructions pour nettoyer manuellement les anciennes URLs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🗄️  NETTOYAGE DES URLS RENDER DANS LA BASE DE DONNÉES");
console.log("=".repeat(60));

console.log("\n📋 INSTRUCTIONS POUR NETTOYER LA BASE :");
console.log("");

console.log("1️⃣  CONNECTEZ-VOUS À MONGODB :");
console.log("   - Ouvrez MongoDB Compass ou mongo shell");
console.log("   - Connectez-vous à votre base : callgirls");
console.log("");

console.log("2️⃣  NETTOYER LES AVATARS :");
console.log("   db.users.updateMany(");
console.log("     { avatar: { $regex: /render\\.com|localhost/ } },");
console.log('     { $unset: { avatar: "" } }');
console.log("   );");
console.log("");

console.log("3️⃣  NETTOYER LA GALERIE :");
console.log("   db.users.updateMany(");
console.log('     { "gallery.url": { $regex: /render\\.com|localhost/ } },');
console.log(
  "     { $pull: { gallery: { url: { $regex: /render\\.com|localhost/ } } } }"
);
console.log("   );");
console.log("");

console.log("4️⃣  NETTOYER LES VIDÉOS :");
console.log("   db.users.updateMany(");
console.log('     { "videos.url": { $regex: /render\\.com|localhost/ } },');
console.log(
  "     { $pull: { videos: { url: { $regex: /render\\.com|localhost/ } } } }"
);
console.log("   );");
console.log("");

console.log("5️⃣  VÉRIFIER LE NETTOYAGE :");
console.log("   db.users.find({");
console.log("     $or: [");
console.log("       { avatar: { $regex: /render\\.com|localhost/ } },");
console.log('       { "gallery.url": { $regex: /render\\.com|localhost/ } },');
console.log('       { "videos.url": { $regex: /render\\.com|localhost/ } }');
console.log("     ]");
console.log("   }).count();");
console.log("");

console.log("6️⃣  COMPTER LES UTILISATEURS SANS MÉDIAS :");
console.log("   db.users.countDocuments({");
console.log("     $and: [");
console.log(
  "       { $or: [{ avatar: { $exists: false } }, { avatar: null }] },"
);
console.log("       { gallery: { $size: 0 } },");
console.log("       { videos: { $size: 0 } }");
console.log("     ]");
console.log("   });");
console.log("");

console.log("📊 ALTERNATIVE AVEC MONGODB COMPASS :");
console.log('   - Ouvrez la collection "users"');
console.log('   - Utilisez l\'onglet "Aggregations"');
console.log("   - Appliquez les filtres ci-dessus");
console.log('   - Utilisez "Update" pour modifier les documents');
console.log("");

console.log("⚠️  ATTENTION :");
console.log("   - Faites une sauvegarde avant de commencer");
console.log("   - Testez d'abord sur un petit nombre de documents");
console.log("   - Vérifiez les résultats après chaque opération");
console.log("");

console.log("🎯 OBJECTIF :");
console.log(
  '   - Supprimer toutes les URLs contenant "render.com" ou "localhost"'
);
console.log("   - Nettoyer les champs avatar, gallery et videos");
console.log("   - Préparer la base pour les nouveaux uploads Firebase");
console.log("");

console.log("✅ APRÈS LE NETTOYAGE :");
console.log("   - Tous les nouveaux uploads iront vers Firebase");
console.log("   - Plus d'URLs cassées dans votre app");
console.log("   - Base de données propre et optimisée");
console.log("");

console.log("🚀 PRÊT À COMMENCER ?");
console.log("   Copiez-collez les commandes MongoDB ci-dessus");
console.log("   Ou utilisez MongoDB Compass avec l'interface graphique");
console.log("");

console.log("📞 BESOIN D'AIDE ?");
console.log("   - Vérifiez la documentation MongoDB");
console.log("   - Testez sur une base de développement d'abord");
console.log("   - Sauvegardez vos données importantes");
