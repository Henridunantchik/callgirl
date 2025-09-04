#!/usr/bin/env node

// Simple deployment test - just check if the server can start
console.log("🧪 Testing deployment configuration...");

// Check if all required files exist
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  "index.js",
  "package.json",
  "Dockerfile",
  "healthcheck.js",
  "config/env.js",
  "middleware/performanceMonitor.js",
  "middleware/fileFallback.js",
];

console.log("📁 Checking required files...");
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log("❌ Some required files are missing!");
  process.exit(1);
}

// Check package.json
console.log("📦 Checking package.json...");
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
  );

  if (packageJson.type !== "module") {
    console.log('❌ package.json must have "type": "module"');
    process.exit(1);
  }

  if (!packageJson.main || packageJson.main !== "index.js") {
    console.log('❌ package.json main should be "index.js"');
    process.exit(1);
  }

  console.log("✅ package.json configuration is correct");
} catch (error) {
  console.log("❌ Error reading package.json:", error.message);
  process.exit(1);
}

// Check Dockerfile
console.log("🐳 Checking Dockerfile...");
try {
  const dockerfile = fs.readFileSync(
    path.join(__dirname, "Dockerfile"),
    "utf8"
  );

  if (!dockerfile.includes("FROM node:18-alpine")) {
    console.log("❌ Dockerfile should use node:18-alpine");
    process.exit(1);
  }

  if (!dockerfile.includes('CMD ["node", "index.js"]')) {
    console.log("❌ Dockerfile should start with node index.js");
    process.exit(1);
  }

  console.log("✅ Dockerfile configuration is correct");
} catch (error) {
  console.log("❌ Error reading Dockerfile:", error.message);
  process.exit(1);
}

console.log("✅ All deployment checks passed!");
console.log("🚀 Ready for deployment");
