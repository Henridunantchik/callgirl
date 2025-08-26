import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupManager {
  constructor() {
    // Chemin de sauvegarde locale
    this.localBackupPath = path.join(__dirname, "..", "backups");

    // Chemin Render (production)
    this.renderPath =
      process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads";

    // Créer le dossier de sauvegarde s'il n'existe pas
    if (!fs.existsSync(this.localBackupPath)) {
      fs.mkdirSync(this.localBackupPath, { recursive: true });
    }

    console.log("✅ Backup Manager initialized");
    console.log(`   Local backup: ${this.localBackupPath}`);
    console.log(`   Render path: ${this.renderPath}`);
  }

  // Sauvegarder un fichier spécifique
  async backupFile(filePath, folder = "general") {
    try {
      // Déterminer le dossier de sauvegarde
      const backupDir = path.join(this.localBackupPath, folder);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Nom du fichier
      const fileName = path.basename(filePath);
      const backupPath = path.join(backupDir, fileName);

      // Copier le fichier vers la sauvegarde
      if (fs.existsSync(filePath)) {
        await fs.promises.copyFile(filePath, backupPath);
        console.log(`✅ File backed up: ${fileName} → ${backupPath}`);
        return { success: true, backupPath };
      } else {
        console.log(`⚠️  File not found for backup: ${filePath}`);
        return { success: false, error: "File not found" };
      }
    } catch (error) {
      console.error(`❌ Backup failed for ${filePath}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Sauvegarder tous les fichiers d'un dossier
  async backupDirectory(directoryName) {
    try {
      const sourceDir = path.join(this.renderPath, directoryName);
      const backupDir = path.join(this.localBackupPath, directoryName);

      if (!fs.existsSync(sourceDir)) {
        console.log(`⚠️  Source directory not found: ${sourceDir}`);
        return { success: false, error: "Source directory not found" };
      }

      // Créer le dossier de sauvegarde
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Lister tous les fichiers
      const files = fs.readdirSync(sourceDir);
      let backedUpCount = 0;
      let errors = [];

      console.log(
        `🔄 Starting backup of ${files.length} files from ${directoryName}...`
      );

      for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const backupPath = path.join(backupDir, file);

        try {
          // Vérifier si c'est un fichier (pas un dossier)
          const stats = fs.statSync(sourcePath);
          if (stats.isFile()) {
            await fs.promises.copyFile(sourcePath, backupPath);
            backedUpCount++;
            console.log(`   ✅ ${file}`);
          }
        } catch (error) {
          console.error(`   ❌ ${file}: ${error.message}`);
          errors.push({ file, error: error.message });
        }
      }

      console.log(
        `🎉 Backup completed: ${backedUpCount}/${files.length} files backed up`
      );

      if (errors.length > 0) {
        console.log(`⚠️  ${errors.length} files had errors during backup`);
      }

      return {
        success: true,
        backedUpCount,
        totalFiles: files.length,
        errors,
      };
    } catch (error) {
      console.error(
        `❌ Directory backup failed for ${directoryName}:`,
        error.message
      );
      return { success: false, error: error.message };
    }
  }

  // Sauvegarder tous les dossiers importants
  async backupAllDirectories() {
    const directories = ["avatars", "gallery", "videos", "images", "documents"];
    const results = {};

    console.log("🚀 Starting full backup of all directories...\n");

    for (const dir of directories) {
      console.log(`📁 Backing up ${dir}...`);
      results[dir] = await this.backupDirectory(dir);
      console.log("");
    }

    // Résumé
    console.log("📊 BACKUP SUMMARY:");
    let totalFiles = 0;
    let totalErrors = 0;

    Object.entries(results).forEach(([dir, result]) => {
      if (result.success) {
        console.log(
          `   ✅ ${dir}: ${result.backedUpCount}/${result.totalFiles} files`
        );
        totalFiles += result.backedUpCount;
        totalErrors += result.errors?.length || 0;
      } else {
        console.log(`   ❌ ${dir}: ${result.error}`);
      }
    });

    console.log(
      `\n🎯 Total: ${totalFiles} files backed up, ${totalErrors} errors`
    );

    return results;
  }

  // Restaurer un fichier depuis la sauvegarde
  async restoreFile(fileName, folder = "general") {
    try {
      const backupPath = path.join(this.localBackupPath, folder, fileName);
      const restorePath = path.join(this.renderPath, folder, fileName);

      if (!fs.existsSync(backupPath)) {
        return { success: false, error: "Backup file not found" };
      }

      // Créer le dossier de destination si nécessaire
      const restoreDir = path.dirname(restorePath);
      if (!fs.existsSync(restoreDir)) {
        fs.mkdirSync(restoreDir, { recursive: true });
      }

      // Restaurer le fichier
      await fs.promises.copyFile(backupPath, restorePath);
      console.log(`✅ File restored: ${fileName} → ${restorePath}`);

      return { success: true, restoredPath: restorePath };
    } catch (error) {
      console.error(`❌ Restore failed for ${fileName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Vérifier l'intégrité des sauvegardes
  async checkBackupIntegrity() {
    try {
      const directories = [
        "avatars",
        "gallery",
        "videos",
        "images",
        "documents",
      ];
      const integrity = {};

      console.log("🔍 Checking backup integrity...\n");

      for (const dir of directories) {
        const renderDir = path.join(this.renderPath, dir);
        const backupDir = path.join(this.localBackupPath, dir);

        if (!fs.existsSync(renderDir) || !fs.existsSync(backupDir)) {
          integrity[dir] = {
            status: "missing",
            render: fs.existsSync(renderDir),
            backup: fs.existsSync(backupDir),
          };
          continue;
        }

        const renderFiles = fs
          .readdirSync(renderDir)
          .filter((f) => fs.statSync(path.join(renderDir, f)).isFile());
        const backupFiles = fs
          .readdirSync(backupDir)
          .filter((f) => fs.statSync(path.join(backupDir, f)).isFile());

        const missingInBackup = renderFiles.filter(
          (f) => !backupFiles.includes(f)
        );
        const missingInRender = backupFiles.filter(
          (f) => !renderFiles.includes(f)
        );

        integrity[dir] = {
          status: "ok",
          renderCount: renderFiles.length,
          backupCount: backupFiles.length,
          missingInBackup,
          missingInRender,
        };
      }

      // Afficher le rapport
      console.log("📊 INTEGRITY REPORT:");
      Object.entries(integrity).forEach(([dir, info]) => {
        if (info.status === "ok") {
          console.log(
            `   ✅ ${dir}: ${info.renderCount} files in Render, ${info.backupCount} in backup`
          );
          if (info.missingInBackup.length > 0) {
            console.log(
              `      ⚠️  ${info.missingInBackup.length} files missing in backup`
            );
          }
          if (info.missingInRender.length > 0) {
            console.log(
              `      ⚠️  ${info.missingInRender.length} files missing in Render`
            );
          }
        } else {
          console.log(`   ❌ ${dir}: ${info.status}`);
        }
      });

      return integrity;
    } catch (error) {
      console.error("❌ Integrity check failed:", error.message);
      return { error: error.message };
    }
  }

  // Obtenir les statistiques des sauvegardes
  getBackupStats() {
    try {
      const directories = [
        "avatars",
        "gallery",
        "videos",
        "images",
        "documents",
      ];
      const stats = {};

      directories.forEach((dir) => {
        const backupDir = path.join(this.localBackupPath, dir);
        if (fs.existsSync(backupDir)) {
          const files = fs.readdirSync(backupDir).filter((f) => {
            const filePath = path.join(backupDir, f);
            return fs.statSync(filePath).isFile();
          });
          stats[dir] = files.length;
        } else {
          stats[dir] = 0;
        }
      });

      return {
        totalFiles: Object.values(stats).reduce((a, b) => a + b, 0),
        byDirectory: stats,
        backupPath: this.localBackupPath,
        renderPath: this.renderPath,
      };
    } catch (error) {
      console.error("❌ Failed to get backup stats:", error.message);
      return { error: error.message };
    }
  }
}

export default new BackupManager();
