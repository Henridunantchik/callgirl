import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Professional Backup Manager
 * Manages file synchronization between local storage and Render
 * Ensures app functionality 24/7 regardless of Render restarts
 */
class BackupManager {
  constructor() {
    this.localBackupPath = path.join(__dirname, "..", "uploads");
    this.renderPath =
      process.env.RENDER_STORAGE_PATH || "/opt/render/project/src/uploads";
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.lastSync = new Date();
    this.syncInProgress = false;
    this.syncStats = {
      totalFiles: 0,
      syncedFiles: 0,
      failedFiles: 0,
      lastSyncTime: null,
      renderStatus: "unknown",
    };

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

      console.log("✅ Backup Manager initialized successfully");
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
    // Monitor every 5 minutes
    setInterval(async () => {
      if (!this.syncInProgress) {
        await this.checkAndSync();
      }
    }, this.syncInterval);

    // Monitor file changes in real-time
    this.watchLocalChanges();

    console.log("🔍 Backup monitoring started");
  }

  /**
   * Watch for local file changes and sync immediately
   */
  watchLocalChanges() {
    const directories = ["avatars", "gallery", "videos", "documents", "images"];

    directories.forEach((dir) => {
      const watchPath = path.join(this.localBackupPath, dir);
      if (fs.existsSync(watchPath)) {
        fs.watch(
          watchPath,
          { recursive: true },
          async (eventType, filename) => {
            if (filename && !filename.startsWith(".")) {
              console.log(`📝 File change detected: ${dir}/${filename}`);
              // Debounce sync to avoid multiple rapid syncs
              clearTimeout(this.syncTimeout);
              this.syncTimeout = setTimeout(() => {
                this.performFullSync();
              }, 2000);
            }
          }
        );
      }
    });
  }

  /**
   * Check Render status and sync if needed
   */
  async checkAndSync() {
    try {
      const renderStatus = await this.checkRenderStatus();

      if (renderStatus.needsSync) {
        console.log("🔄 Render needs sync, starting backup...");
        await this.performFullSync();
      }

      this.syncStats.renderStatus = renderStatus.status;
      this.syncStats.lastSyncTime = new Date();
    } catch (error) {
      console.error("❌ Sync check failed:", error);
      // If we can't check Render, assume it needs sync
      await this.performFullSync();
    }
  }

  /**
   * Check if Render needs synchronization
   */
  async checkRenderStatus() {
    try {
      // Check if Render storage is accessible and has files
      const hasFiles = await this.checkRenderHasFiles();
      const isAccessible = await this.checkRenderAccessibility();

      if (!isAccessible || !hasFiles) {
        return { needsSync: true, status: "needs_sync" };
      }

      return { needsSync: false, status: "healthy" };
    } catch (error) {
      return { needsSync: true, status: "error" };
    }
  }

  /**
   * Check if Render has files
   */
  async checkRenderHasFiles() {
    try {
      if (config.NODE_ENV === "development") {
        return true; // Local development always has files
      }

      // Check if Render storage has any files
      const directories = ["avatars", "gallery", "videos"];
      for (const dir of directories) {
        const renderDir = path.join(this.renderPath, dir);
        if (fs.existsSync(renderDir)) {
          const files = fs.readdirSync(renderDir);
          if (files.length > 0) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if Render storage is accessible
   */
  async checkRenderAccessibility() {
    try {
      if (config.NODE_ENV === "development") {
        return true;
      }

      return fs.existsSync(this.renderPath);
    } catch (error) {
      return false;
    }
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
    console.log("🔄 Starting full synchronization...");

    try {
      const stats = await this.syncAllDirectories();
      this.syncStats = { ...this.syncStats, ...stats };

      console.log(
        `✅ Sync completed: ${stats.syncedFiles}/${stats.totalFiles} files`
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
    const renderDir = path.join(this.renderPath, dirName);

    if (!fs.existsSync(localDir)) {
      return { total: 0, synced: 0, failed: 0 };
    }

    // Ensure render directory exists
    if (!fs.existsSync(renderDir)) {
      fs.mkdirSync(renderDir, { recursive: true });
    }

    const localFiles = fs.readdirSync(localDir);
    let synced = 0;
    let failed = 0;

    for (const file of localFiles) {
      if (file.startsWith(".")) continue; // Skip hidden files

      const localPath = path.join(localDir, file);
      const renderPath = path.join(renderDir, file);

      try {
        // Copy file to render if it doesn't exist or is different
        if (
          !fs.existsSync(renderPath) ||
          this.filesAreDifferent(localPath, renderPath)
        ) {
          fs.copyFileSync(localPath, renderPath);
          synced++;
          console.log(`📁 Synced: ${dirName}/${file}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync ${dirName}/${file}:`, error);
        failed++;
      }
    }

    return { total: localFiles.length, synced, failed };
  }

  /**
   * Check if two files are different
   */
  filesAreDifferent(file1, file2) {
    try {
      const stats1 = fs.statSync(file1);
      const stats2 = fs.statSync(file2);

      // Compare file size and modification time
      return (
        stats1.size !== stats2.size ||
        Math.abs(stats1.mtime.getTime() - stats2.mtime.getTime()) > 1000
      );
    } catch (error) {
      return true; // If we can't compare, assume they're different
    }
  }

  /**
   * Get backup statistics
   */
  getStats() {
    return {
      ...this.syncStats,
      localBackupPath: this.localBackupPath,
      renderPath: this.renderPath,
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
      // First, try to serve from local backup
      const localPath = path.join(this.localBackupPath, directory, filePath);
      if (fs.existsSync(localPath)) {
        return `/uploads/${directory}/${filePath}`;
      }

      // Fallback to render path
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
