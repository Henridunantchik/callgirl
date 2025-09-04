import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ULTRA-AGGRESSIVE Backup Manager
 * Re-uploads files to Render every 30 seconds to counter deletion
 * This ensures files are ALWAYS available on Render
 */
class BackupManager {
  constructor() {
    // Railway storage paths
    this.localBackupPath = process.env.RAILWAY_STORAGE_PATH || "/app/uploads";
    this.railwayPath = process.env.RAILWAY_STORAGE_PATH || "/app/uploads";
    this.syncInterval = 30 * 1000; // 30 SECONDES (ultra-agressif)
    this.lastSync = new Date();
    this.syncInProgress = false;
    this.syncStats = {
      totalFiles: 0,
      syncedFiles: 0,
      failedFiles: 0,
      lastSyncTime: null,
      renderStatus: "unknown",
    };

    console.log(`🔧 Backup Manager - Local path: ${this.localBackupPath}`);
    console.log(`🔧 Backup Manager - Railway path: ${this.railwayPath}`);

    this.initializeBackupSystem();
  }

  /**
   * Initialize the backup system
   */
  async initializeBackupSystem() {
    try {
      // Ensure local backup directories exist
      await this.createBackupDirectories();

      // Start monitoring
      this.startMonitoring();

      // Initial sync
      await this.performFullSync();

      console.log(
        "✅ ULTRA-AGGRESSIVE Backup Manager initialized successfully"
      );
      console.log(
        "🔄 Will re-upload files every 30 seconds to maintain Railway storage"
      );
    } catch (error) {
      console.error("❌ Failed to initialize Backup Manager:", error);
    }
  }

  /**
   * Create all necessary backup directories
   */
  async createBackupDirectories() {
    const directories = [
      "avatars",
      "gallery",
      "videos",
      "documents",
      "images",
      "temp",
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.localBackupPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created backup directory: ${dir}`);
      }
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    // Monitor every 30 seconds (ULTRA-AGGRESSIVE)
    setInterval(async () => {
      if (!this.syncInProgress) {
        await this.performFullSync(); // ALWAYS SYNC
      }
    }, this.syncInterval);

    // Monitor file changes in real-time
    this.watchLocalChanges();

    console.log("🔍 ULTRA-AGGRESSIVE monitoring started - 30 second intervals");
  }

  /**
   * Watch for local file changes and sync immediately
   */
  watchLocalChanges() {
    const directories = ["avatars", "gallery", "videos", "documents", "images"];

    directories.forEach((dir) => {
      const watchPath = path.join(this.localBackupPath, dir);
      if (fs.existsSync(watchPath)) {
        try {
          // Check if recursive watching is supported on this platform
          const watchOptions =
            process.platform === "win32"
              ? { recursive: true }
              : { recursive: true };

          fs.watch(watchPath, watchOptions, async (eventType, filename) => {
            if (filename && !filename.startsWith(".")) {
              console.log(
                `📝 File change detected: ${dir}/${filename} - SYNCING IMMEDIATELY`
              );
              // Sync immediately, no debounce
              this.performFullSync();
            }
          });
        } catch (error) {
          if (error.code === "ERR_FEATURE_UNAVAILABLE_ON_PLATFORM") {
            console.log(
              `⚠️ Recursive file watching not supported on this platform for ${dir}, falling back to polling`
            );
            // Fall back to polling-based monitoring for this directory
            this.startPollingForDirectory(dir);
          } else {
            console.error(`❌ Failed to watch directory ${dir}:`, error);
          }
        }
      }
    });
  }

  /**
   * Start polling-based monitoring for directories where fs.watch is not supported
   */
  startPollingForDirectory(dirName) {
    const watchPath = path.join(this.localBackupPath, dirName);
    let lastFiles = new Set();

    // Initial scan
    try {
      if (fs.existsSync(watchPath)) {
        const files = fs.readdirSync(watchPath);
        lastFiles = new Set(files.filter((f) => !f.startsWith(".")));
      }
    } catch (error) {
      console.error(`❌ Failed to scan directory ${dirName}:`, error);
      return;
    }

    // Poll every 10 seconds for changes
    setInterval(() => {
      try {
        if (fs.existsSync(watchPath)) {
          const currentFiles = new Set(
            fs.readdirSync(watchPath).filter((f) => !f.startsWith("."))
          );

          // Check for new or modified files
          const newFiles = [...currentFiles].filter((f) => !lastFiles.has(f));
          const removedFiles = [...lastFiles].filter(
            (f) => !currentFiles.has(f)
          );

          if (newFiles.length > 0 || removedFiles.length > 0) {
            console.log(
              `📝 Polling detected changes in ${dirName}: ${newFiles.length} new, ${removedFiles.length} removed`
            );
            this.performFullSync();
            lastFiles = currentFiles;
          }
        }
      } catch (error) {
        console.error(`❌ Polling error for directory ${dirName}:`, error);
      }
    }, 10000); // Poll every 10 seconds
  }

  /**
   * Perform full synchronization
   */
  async performFullSync() {
    if (this.syncInProgress) {
      console.log("⏳ Sync already in progress, skipping...");
      return;
    }

    this.syncInProgress = true;
    console.log("🔄 Starting ULTRA-AGGRESSIVE synchronization...");
    console.log(
      `🔧 Will sync directories: avatars, gallery, videos, documents, images`
    );
    console.log(`🔧 Local backup path: ${this.localBackupPath}`);

    try {
      const stats = await this.syncAllDirectories();
      this.syncStats = { ...this.syncStats, ...stats };

      console.log(
        `✅ ULTRA-AGGRESSIVE sync completed: ${stats.syncedFiles}/${stats.totalFiles} files`
      );
      this.lastSync = new Date();
    } catch (error) {
      console.error("❌ Full sync failed:", error);
      this.syncStats.failedFiles++;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync all directories
   */
  async syncAllDirectories() {
    const directories = ["avatars", "gallery", "videos", "documents", "images"];
    let totalFiles = 0;
    let syncedFiles = 0;
    let failedFiles = 0;

    for (const dir of directories) {
      const result = await this.syncDirectory(dir);
      totalFiles += result.total;
      syncedFiles += result.synced;
      failedFiles += result.failed;
    }

    return { totalFiles, syncedFiles, failedFiles };
  }

  /**
   * Sync a specific directory
   */
  async syncDirectory(dirName) {
    const localDir = path.join(this.localBackupPath, dirName);
    const railwayDir = path.join(this.railwayPath, dirName);

    console.log(`🔍 Checking directory: ${dirName}`);
    console.log(`🔍 Local path: ${localDir}`);
    console.log(`🔍 Railway path: ${railwayDir}`);

    if (!fs.existsSync(localDir)) {
      console.log(`❌ Local directory does not exist: ${localDir}`);
      return { total: 0, synced: 0, failed: 0 };
    }

    // Ensure railway directory exists
    if (!fs.existsSync(railwayDir)) {
      fs.mkdirSync(railwayDir, { recursive: true });
      console.log(`📁 Created railway directory: ${railwayDir}`);
    }

    const localFiles = fs.readdirSync(localDir);
    console.log(
      `📊 Found ${localFiles.length} files in ${dirName}: ${localFiles.join(
        ", "
      )}`
    );

    let synced = 0;
    let failed = 0;

    for (const file of localFiles) {
      if (file.startsWith(".")) continue; // Skip hidden files

      const localPath = path.join(localDir, file);
      const railwayPath = path.join(railwayDir, file);

      try {
        // ALWAYS COPY to railway (ultra-aggressive)
        fs.copyFileSync(localPath, railwayPath);
        synced++;
        console.log(`📁 ULTRA-AGGRESSIVE sync: ${dirName}/${file}`);
      } catch (error) {
        console.error(`❌ Failed to sync ${dirName}/${file}:`, error);
        failed++;
      }
    }

    console.log(
      `✅ Directory ${dirName}: ${synced} synced, ${failed} failed out of ${localFiles.length} total`
    );
    return { total: localFiles.length, synced, failed };
  }

  /**
   * Get backup statistics
   */
  getStats() {
    return {
      ...this.syncStats,
      localBackupPath: this.localBackupPath,
      railwayPath: this.railwayPath,
      lastSync: this.lastSync,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Force immediate sync
   */
  async forceSync() {
    console.log("🚀 Force sync requested...");
    await this.performFullSync();
  }

  /**
   * Get file URL with fallback
   */
  getFileUrl(filePath, directory = "gallery") {
    try {
      // Always serve from railway path since we're ultra-aggressive
      return `/uploads/${directory}/${filePath}`;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }
}

// Create singleton instance
const backupManager = new BackupManager();

export default backupManager;
