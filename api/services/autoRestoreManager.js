import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import backupManager from "./backupManager.js";
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoRestoreManager {
  constructor() {
    this.renderPath =
      process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads";
    this.backupPath = path.join(__dirname, "..", "backups");

    // ⚡ SURVEILLANCE ULTRA-RAPIDE - 30 secondes au lieu de 5 minutes !
    this.monitorInterval = 30 * 1000; // 30 SECONDES (ultra-réactif)
    this.isMonitoring = false;
    this.lastCheck = null;
    this.restoreStats = {
      totalRestored: 0,
      lastRestore: null,
      renderRestarts: 0,
    };

    console.log("🔄 Auto-Restore Manager initialized");
    console.log(`   Render path: ${this.renderPath}`);
    console.log(`   Backup path: ${this.backupPath}`);
    console.log(
      `   ⚡ Monitoring interval: ${this.monitorInterval / 1000} SECONDES (ULTRA-RAPIDE)`
    );
  }

  // Démarrer la surveillance automatique
  startMonitoring() {
    if (this.isMonitoring) {
      console.log("⚠️  Monitoring already active");
      return;
    }

    this.isMonitoring = true;
    console.log("🚀 Starting ULTRA-FAST automatic file restoration monitoring...");
    
    // Première vérification immédiate
    this.checkAndRestore();
    
    // ⚡ Vérification ULTRA-RAPIDE toutes les 30 secondes
    setInterval(() => {
      this.checkAndRestore();
    }, this.monitorInterval);
    
    // 🔥 SURVEILLANCE EN TEMPS RÉEL - Détection immédiate des suppressions
    this.startRealTimeMonitoring();
    
    console.log("✅ ULTRA-FAST auto-restore monitoring started successfully");
    console.log("⚡ Files will be restored within 30 seconds of deletion!");
  }

  // 🔥 SURVEILLANCE EN TEMPS RÉEL pour détection immédiate
  startRealTimeMonitoring() {
    console.log("🔥 Starting real-time file monitoring...");
    
    const directories = ["avatars", "gallery", "videos", "images", "documents"];
    
    directories.forEach(dir => {
      const renderDir = path.join(this.renderPath, dir);
      
      if (fs.existsSync(renderDir)) {
        // Surveiller les changements en temps réel
        fs.watch(renderDir, { recursive: true }, async (eventType, filename) => {
          if (filename && !filename.startsWith(".")) {
            console.log(`🔥 REAL-TIME: File ${eventType} detected: ${dir}/${filename}`);
            
            // Si un fichier est supprimé, le restaurer IMMÉDIATEMENT
            if (eventType === "rename" && !fs.existsSync(path.join(renderDir, filename))) {
              console.log(`🚨 FILE DELETED: ${dir}/${filename} - RESTORING IMMEDIATELY!`);
              
              // Restaurer immédiatement
              const backupPath = path.join(this.backupPath, dir, filename);
              if (fs.existsSync(backupPath)) {
                try {
                  const renderPath = path.join(renderDir, filename);
                  await fs.promises.copyFile(backupPath, renderPath);
                  console.log(`⚡ INSTANT RESTORE: ${dir}/${filename} restored in milliseconds!`);
                  
                  // Mettre à jour les stats
                  this.restoreStats.totalRestored++;
                  this.restoreStats.lastRestore = new Date();
                } catch (error) {
                  console.error(`❌ Instant restore failed for ${dir}/${filename}:`, error.message);
                }
              }
            }
          }
        });
        
        console.log(`   ✅ Real-time monitoring active for: ${dir}`);
      }
    });
    
    console.log("🔥 Real-time monitoring started - files will be restored INSTANTLY!");
  }

  // Arrêter la surveillance
  stopMonitoring() {
    this.isMonitoring = false;
    console.log("⏹️  Auto-restore monitoring stopped");
  }

  // Vérifier et restaurer automatiquement
  async checkAndRestore() {
    try {
      console.log("\n🔍 Checking for missing files in Render...");

      const missingFiles = await this.findMissingFiles();

      if (missingFiles.length === 0) {
        console.log("✅ All files are present in Render");
        this.lastCheck = new Date();
        return;
      }

      console.log(`🚨 Found ${missingFiles.length} missing files in Render`);
      console.log("🔄 Starting automatic restoration...");

      let restoredCount = 0;
      let failedCount = 0;

      for (const fileInfo of missingFiles) {
        try {
          const result = await this.restoreFile(fileInfo);
          if (result.success) {
            restoredCount++;
            console.log(`   ✅ Restored: ${fileInfo.fileName}`);
          } else {
            failedCount++;
            console.log(`   ❌ Failed: ${fileInfo.fileName} - ${result.error}`);
          }
        } catch (error) {
          failedCount++;
          console.log(
            `   ❌ Error restoring ${fileInfo.fileName}: ${error.message}`
          );
        }
      }

      // Mettre à jour les statistiques
      this.restoreStats.totalRestored += restoredCount;
      this.restoreStats.lastRestore = new Date();
      this.restoreStats.renderRestarts++;

      console.log(`\n🎯 Restoration completed:`);
      console.log(`   ✅ Restored: ${restoredCount} files`);
      console.log(`   ❌ Failed: ${failedCount} files`);
      console.log(
        `   📊 Total restored since start: ${this.restoreStats.totalRestored}`
      );
      console.log(
        `   🔄 Render restarts detected: ${this.restoreStats.renderRestarts}`
      );

      this.lastCheck = new Date();
    } catch (error) {
      console.error("❌ Auto-restore check failed:", error.message);
    }
  }

  // Trouver les fichiers manquants dans Render
  async findMissingFiles() {
    const missingFiles = [];
    const directories = ["avatars", "gallery", "videos", "images", "documents"];

    for (const dir of directories) {
      const backupDir = path.join(this.backupPath, dir);
      const renderDir = path.join(this.renderPath, dir);

      // Vérifier si le dossier de sauvegarde existe
      if (!fs.existsSync(backupDir)) {
        continue;
      }

      // Vérifier si le dossier Render existe
      if (!fs.existsSync(renderDir)) {
        // Dossier Render manquant - tous les fichiers sont manquants
        const backupFiles = fs.readdirSync(backupDir).filter((f) => {
          const filePath = path.join(backupDir, f);
          return fs.statSync(filePath).isFile();
        });

        backupFiles.forEach((fileName) => {
          missingFiles.push({
            fileName,
            directory: dir,
            backupPath: path.join(backupDir, fileName),
            renderPath: path.join(renderDir, fileName),
          });
        });

        continue;
      }

      // Comparer les fichiers
      const backupFiles = fs.readdirSync(backupDir).filter((f) => {
        const filePath = path.join(backupDir, f);
        return fs.statSync(filePath).isFile();
      });

      const renderFiles = fs.readdirSync(renderDir).filter((f) => {
        const filePath = path.join(renderDir, f);
        return fs.statSync(filePath).isFile();
      });

      // Trouver les fichiers manquants dans Render
      const missingInRender = backupFiles.filter(
        (f) => !renderFiles.includes(f)
      );

      missingInRender.forEach((fileName) => {
        missingFiles.push({
          fileName,
          directory: dir,
          backupPath: path.join(backupDir, fileName),
          renderPath: path.join(renderDir, fileName),
        });
      });
    }

    return missingFiles;
  }

  // Restaurer un fichier spécifique
  async restoreFile(fileInfo) {
    try {
      const { fileName, directory, backupPath, renderPath } = fileInfo;

      // Vérifier que le fichier de sauvegarde existe
      if (!fs.existsSync(backupPath)) {
        return { success: false, error: "Backup file not found" };
      }

      // Créer le dossier de destination si nécessaire
      const renderDir = path.dirname(renderPath);
      if (!fs.existsSync(renderDir)) {
        fs.mkdirSync(renderDir, { recursive: true });
        console.log(`   📁 Created directory: ${renderDir}`);
      }

      // Copier le fichier de la sauvegarde vers Render
      await fs.promises.copyFile(backupPath, renderPath);

      return { success: true, restoredPath: renderPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Restaurer tous les fichiers manquants immédiatement
  async forceRestoreAll() {
    console.log("🚀 Force restore all missing files...");
    await this.checkAndRestore();
  }

  // Obtenir le statut du monitoring
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      lastCheck: this.lastCheck,
      monitorInterval: this.monitorInterval,
      restoreStats: this.restoreStats,
      renderPath: this.renderPath,
      backupPath: this.backupPath,
    };
  }

  // Vérifier la santé du système
  async healthCheck() {
    try {
      const missingFiles = await this.findMissingFiles();
      const backupStats = backupManager.getBackupStats();

      return {
        status: "healthy",
        missingFiles: missingFiles.length,
        totalBackupFiles: backupStats.totalFiles,
        renderDirectories: this.checkRenderDirectories(),
        lastCheck: this.lastCheck,
        restoreStats: this.restoreStats,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  // Vérifier les dossiers Render
  checkRenderDirectories() {
    const directories = ["avatars", "gallery", "videos", "images", "documents"];
    const status = {};

    directories.forEach((dir) => {
      const renderDir = path.join(this.renderPath, dir);
      status[dir] = {
        exists: fs.existsSync(renderDir),
        fileCount: fs.existsSync(renderDir)
          ? fs.readdirSync(renderDir).length
          : 0,
      };
    });

    return status;
  }
}

export default new AutoRestoreManager();
