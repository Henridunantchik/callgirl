#!/usr/bin/env node

/**
 * Backup System Startup Script
 * Launches the professional backup system automatically
 * Ensures 24/7 file availability
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting Professional Backup System...");

// Start the backup manager
const startBackupManager = () => {
  console.log("📁 Initializing Backup Manager...");

  try {
    // Import and start backup manager
    const backupManagerPath = path.join(
      __dirname,
      "api",
      "services",
      "backupManager.js"
    );

    // Start backup manager in a separate process for reliability
    const backupProcess = spawn("node", [backupManagerPath], {
      stdio: "inherit",
      detached: true,
    });

    backupProcess.on("error", (error) => {
      console.error("❌ Backup Manager failed to start:", error);
      // Restart after 5 seconds
      setTimeout(startBackupManager, 5000);
    });

    backupProcess.on("exit", (code) => {
      if (code !== 0) {
        console.log(
          `⚠️ Backup Manager exited with code ${code}, restarting...`
        );
        setTimeout(startBackupManager, 5000);
      }
    });

    console.log("✅ Backup Manager started successfully");
    return backupProcess;
  } catch (error) {
    console.error("❌ Failed to start Backup Manager:", error);
    // Retry after 10 seconds
    setTimeout(startBackupManager, 10000);
  }
};

// Start the main API server
const startAPIServer = () => {
  console.log("🌐 Starting API Server...");

  try {
    const apiPath = path.join(__dirname, "api", "index.js");

    const apiProcess = spawn("node", [apiPath], {
      stdio: "inherit",
      detached: true,
    });

    apiProcess.on("error", (error) => {
      console.error("❌ API Server failed to start:", error);
      setTimeout(startAPIServer, 10000);
    });

    apiProcess.on("exit", (code) => {
      if (code !== 0) {
        console.log(`⚠️ API Server exited with code ${code}, restarting...`);
        setTimeout(startAPIServer, 10000);
      }
    });

    console.log("✅ API Server started successfully");
    return apiProcess;
  } catch (error) {
    console.error("❌ Failed to start API Server:", error);
    setTimeout(startAPIServer, 10000);
  }
};

// Main startup sequence
const main = async () => {
  console.log("🎯 Starting complete backup system...");

  try {
    // Start backup manager first
    const backupProcess = startBackupManager();

    // Wait a bit for backup manager to initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Start API server
    const apiProcess = startAPIServer();

    // Keep the main process alive
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down backup system...");
      if (backupProcess) backupProcess.kill();
      if (apiProcess) apiProcess.kill();
      process.exit(0);
    });

    console.log("🎉 Backup system startup complete!");
    console.log(
      "📊 Monitor at: https://callgirls-api.onrender.com/debug/files"
    );
    console.log(
      "💾 Force sync at: https://callgirls-api.onrender.com/api/storage/sync"
    );
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
};

// Run the startup sequence
main().catch(console.error);
