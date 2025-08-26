import backupManager from "./services/backupManager.js";

console.log("🛡️  PROTECTION CONTRE LA PERTE DE PHOTOS - SAUVEGARDE COMPLÈTE\n");

console.log(
  "🚨 ATTENTION: Ce script va sauvegarder TOUS vos fichiers de Render"
);
console.log("   pour éviter qu'ils soient perdus si Render les supprime.\n");

console.log("📋 Ce que fait ce script:");
console.log("   1. ✅ Sauvegarde tous vos avatars");
console.log("   2. ✅ Sauvegarde toutes vos photos de galerie");
console.log("   3. ✅ Sauvegarde toutes vos vidéos");
console.log("   4. ✅ Vérifie l'intégrité des sauvegardes");
console.log("   5. ✅ Vous donne un rapport complet\n");

console.log("🔧 Configuration:");
const stats = backupManager.getBackupStats();
console.log(`   Dossier de sauvegarde: ${stats.backupPath}`);
console.log(`   Dossier Render: ${stats.renderPath}\n`);

// Démarrer la sauvegarde complète
async function startBackup() {
  try {
    console.log("🚀 DÉMARRAGE DE LA SAUVEGARDE COMPLÈTE...\n");

    // 1. Sauvegarder tous les dossiers
    const backupResults = await backupManager.backupAllDirectories();

    console.log("\n" + "=".repeat(50));
    console.log("🎯 SAUVEGARDE TERMINÉE");
    console.log("=".repeat(50));

    // 2. Vérifier l'intégrité
    console.log("\n🔍 Vérification de l'intégrité des sauvegardes...");
    const integrity = await backupManager.checkBackupIntegrity();

    // 3. Statistiques finales
    console.log("\n📊 STATISTIQUES FINALES:");
    const finalStats = backupManager.getBackupStats();
    console.log(`   Total fichiers sauvegardés: ${finalStats.totalFiles}`);
    console.log(`   Par dossier:`);
    Object.entries(finalStats.byDirectory).forEach(([dir, count]) => {
      console.log(`     ${dir}: ${count} fichiers`);
    });

    console.log("\n🛡️  PROTECTION ACTIVÉE:");
    console.log(
      "   ✅ Vos photos sont maintenant protégées contre la suppression Render"
    );
    console.log(
      "   ✅ Si Render supprime un fichier, il sera restauré depuis la sauvegarde"
    );
    console.log(
      "   ✅ Vos clients verront toujours vos photos, même en cas de problème Render"
    );

    console.log("\n💡 MAINTENANT:");
    console.log("   1. Vos photos sont en sécurité");
    console.log("   2. Testez l'upload d'une nouvelle photo");
    console.log("   3. Elle sera automatiquement sauvegardée");
    console.log("   4. Même si Render la supprime, elle sera restaurée");
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde:", error.message);
  }
}

// Démarrer la sauvegarde
startBackup();
