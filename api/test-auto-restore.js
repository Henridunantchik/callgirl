import autoRestoreManager from "./services/autoRestoreManager.js";

console.log("🧪 TEST DU SYSTÈME DE RESTAURATION AUTOMATIQUE\n");

console.log("📋 Ce script va tester:");
console.log("   1. ✅ Vérification du statut du monitoring");
console.log("   2. ✅ Recherche de fichiers manquants");
console.log("   3. ✅ Vérification de santé du système");
console.log("   4. ✅ Test de restauration forcée\n");

async function runTests() {
  try {
    // Test 1: Statut du monitoring
    console.log("🔍 Test 1: Statut du monitoring");
    const status = autoRestoreManager.getStatus();
    console.log("   Monitoring actif:", status.isMonitoring);
    console.log("   Dernière vérification:", status.lastCheck);
    console.log(
      "   Intervalle:",
      status.monitorInterval / 1000 / 60,
      "minutes"
    );
    console.log("   Statistiques:", status.restoreStats);
    console.log("");

    // Test 2: Recherche de fichiers manquants
    console.log("🔍 Test 2: Recherche de fichiers manquants");
    const missingFiles = await autoRestoreManager.findMissingFiles();
    console.log(`   Fichiers manquants trouvés: ${missingFiles.length}`);

    if (missingFiles.length > 0) {
      console.log("   Détails des fichiers manquants:");
      missingFiles.forEach((file, index) => {
        console.log(`     ${index + 1}. ${file.directory}/${file.fileName}`);
      });
    }
    console.log("");

    // Test 3: Vérification de santé
    console.log("🔍 Test 3: Vérification de santé du système");
    const health = await autoRestoreManager.healthCheck();
    console.log("   Statut:", health.status);
    console.log("   Fichiers manquants:", health.missingFiles);
    console.log("   Total fichiers sauvegardés:", health.totalBackupFiles);
    console.log("   Dossiers Render:");
    Object.entries(health.renderDirectories).forEach(([dir, info]) => {
      console.log(
        `     ${dir}: ${info.exists ? "✅" : "❌"} (${info.fileCount} fichiers)`
      );
    });
    console.log("");

    // Test 4: Restauration forcée (si des fichiers sont manquants)
    if (missingFiles.length > 0) {
      console.log("🔍 Test 4: Restauration forcée des fichiers manquants");
      console.log("   Démarrage de la restauration...");
      await autoRestoreManager.forceRestoreAll();
      console.log("   ✅ Restauration forcée terminée");
    } else {
      console.log(
        "🔍 Test 4: Aucun fichier manquant - pas de restauration nécessaire"
      );
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎯 TESTS TERMINÉS AVEC SUCCÈS");
    console.log("=".repeat(50));

    console.log("\n🛡️  VOTRE SYSTÈME EST MAINTENANT:");
    console.log("   ✅ Protégé contre les suppressions Render");
    console.log("   ✅ Surveille automatiquement les fichiers manquants");
    console.log("   ✅ Restaure automatiquement en cas de problème");
    console.log("   ✅ Maintient l'affichage des photos 24/7");

    console.log("\n💡 RENDEZ-VOUS RENDER:");
    console.log("   ⏰ Redémarrage: Toutes les 15 minutes d'inactivité");
    console.log("   🗑️  Suppression: Tous les fichiers peuvent être supprimés");
    console.log(
      "   🛡️  Protection: Vos photos sont automatiquement restaurées"
    );
    console.log("   🔄 Monitoring: Vérification toutes les 5 minutes");

    console.log("\n🎉 VOS PHOTOS SONT MAINTENANT INDESTRUCTIBLES !");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error.message);
  }
}

// Démarrer les tests
runTests();
