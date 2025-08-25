#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Testing Fixed Backup Manager...\n");

// Simuler les chemins du Backup Manager
const localBackupPath = "/opt/render/project/src/uploads";
const renderPath = "/opt/render/project/src/uploads";

console.log(`🔧 Local backup path: ${localBackupPath}`);
console.log(`🔧 Render path: ${renderPath}\n`);

// Vérifier chaque dossier
const directories = ["avatars", "gallery", "videos", "documents", "images"];

directories.forEach((dir) => {
  const localDir = path.join(localBackupPath, dir);
  const renderDir = path.join(renderPath, dir);
  
  console.log(`📁 Directory: ${dir}`);
  console.log(`   Local: ${localDir}`);
  console.log(`   Render: ${renderDir}`);
  
  if (fs.existsSync(localDir)) {
    const files = fs.readdirSync(localDir);
    console.log(`   ✅ Exists with ${files.length} files: ${files.join(', ')}`);
  } else {
    console.log(`   ❌ Does not exist`);
  }
  console.log("");
});

console.log("🧪 Test completed!");
