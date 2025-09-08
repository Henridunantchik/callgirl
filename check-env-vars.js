#!/usr/bin/env node

/**
 * Check Environment Variables
 * This script verifies that all required environment variables are set
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🔍 Checking Environment Variables...\n");

const requiredVars = {
  // Database
  MONGODB_CONN: "MongoDB connection string",
  JWT_SECRET: "JWT secret key for authentication",

  // Environment
  NODE_ENV: "Environment (development/production)",

  // Railway specific
  RAILWAY_STORAGE_PATH: "Storage path for uploads (e.g., /data/uploads)",
  BASE_URL: "Backend base URL (e.g., https://api.example.com)",
  FRONTEND_URLS: "Comma-separated list of allowed frontend URLs",
};

const missingVars = [];
const warningVars = [];

console.log("📋 Required Variables:");
for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];

  if (!value) {
    missingVars.push(varName);
    console.log(`   ❌ ${varName}: ${description} - MISSING`);
  } else {
    // Mask sensitive values
    const displayValue =
      varName.includes("SECRET") ||
      varName.includes("PASSWORD") ||
      varName.includes("KEY")
        ? value.substring(0, 8) + "..."
        : value;

    console.log(`   ✅ ${varName}: ${description} - ${displayValue}`);

    // Check for common issues
    if (
      varName === "NODE_ENV" &&
      value !== "production" &&
      value !== "development"
    ) {
      warningVars.push(
        `${varName} should be 'production' or 'development', got '${value}'`
      );
    }

    if (varName === "RAILWAY_STORAGE_PATH" && !value.startsWith("/")) {
      warningVars.push(
        `${varName} should be an absolute path like '/data/uploads'`
      );
    }

    if (varName === "BASE_URL" && !/^https?:\/\//i.test(value)) {
      warningVars.push(`${varName} should start with 'http://' or 'https://'`);
    }
  }
}

console.log("\n⚠️  Warnings:");
if (warningVars.length === 0) {
  console.log("   None");
} else {
  warningVars.forEach((warning) => console.log(`   ${warning}`));
}

console.log("\n📊 Summary:");
if (missingVars.length === 0) {
  console.log("   ✅ All required environment variables are set!");
} else {
  console.log(`   ❌ Missing ${missingVars.length} required variables:`);
  missingVars.forEach((varName) => console.log(`      - ${varName}`));
}

console.log("\n📝 Example .env file:");
console.log("NODE_ENV=development");
console.log("MONGODB_CONN=mongodb://localhost:27017/your-database");
console.log("JWT_SECRET=your-super-secret-jwt-key");
console.log("RAILWAY_STORAGE_PATH=/data/uploads");
console.log("BASE_URL=http://localhost:5000");
console.log("FRONTEND_URLS=http://localhost:5173");
