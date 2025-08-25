#!/usr/bin/env node

/**
 * Debug Backup Manager
 * Detailed debugging of why files are not detected
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debugBackupManager = () => {
  console.log("🔍 Debugging Backup Manager...\n");
  
  // Check current directory
  console.log("📍 Current directory:", __dirname);
  
  // Check local backup path calculation
  const localBackupPath = path.join(__dirname, "api", "services", "..", "uploads");
  console.log("📁 Calculated local backup path:", localBackupPath);
  
  // Check if path exists
  const pathExists = fs.existsSync(localBackupPath);
  console.log("✅ Path exists:", pathExists);
  
  if (pathExists) {
    // List all directories
    const directories = fs.readdirSync(localBackupPath);
    console.log("📂 Directories found:", directories);
    
    // Check avatars directory
    const avatarsPath = path.join(localBackupPath, "avatars");
    if (fs.existsSync(avatarsPath)) {
      const avatarFiles = fs.readdirSync(avatarsPath);
      console.log("📸 Avatar files:", avatarFiles);
      
      // Check file sizes
      avatarFiles.forEach(file => {
        const filePath = path.join(avatarsPath, file);
        const stats = fs.statSync(filePath);
        console.log(`   ${file}: ${stats.size} bytes, modified: ${stats.mtime}`);
      });
    } else {
      console.log("❌ Avatars directory not found");
    }
    
    // Check gallery directory
    const galleryPath = path.join(localBackupPath, "gallery");
    if (fs.existsSync(galleryPath)) {
      const galleryFiles = fs.readdirSync(galleryPath);
      console.log("🖼️ Gallery files:", galleryFiles);
    } else {
      console.log("❌ Gallery directory not found");
    }
    
    // Check videos directory
    const videosPath = path.join(localBackupPath, "videos");
    if (fs.existsSync(videosPath)) {
      const videoFiles = fs.readdirSync(videosPath);
      console.log("🎥 Video files:", videoFiles);
    } else {
      console.log("❌ Videos directory not found");
    }
  }
  
  console.log("\n🎯 Debug complete!");
};

debugBackupManager();
