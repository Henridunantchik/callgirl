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
  MONGODB_URI: "MongoDB connection string",
  JWT_SECRET: "JWT secret key for authentication",

  // Environment
  NODE_ENV: "Environment (development/production)",

  // Render specific
  RENDER_STORAGE_PATH: "Render storage path for uploads",
  RENDER_EXTERNAL_URL: "Render external URL for file serving",

  // Optional but recommended
  PORT: "Server port (defaults to 5000)",
  CORS_ORIGIN: "CORS allowed origins",
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

    if (
      varName === "RENDER_STORAGE_PATH" &&
      !value.includes("/opt/render/project/src/uploads")
    ) {
      warningVars.push(
        `${varName} should contain '/opt/render/project/src/uploads' for production`
      );
    }

    if (varName === "RENDER_EXTERNAL_URL" && !value.startsWith("https://")) {
      warningVars.push(
        `${varName} should start with 'https://' for production`
      );
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

console.log("\n🔧 Next Steps:");
if (missingVars.length > 0) {
  console.log("   1. Create a .env file in your project root");
  console.log("   2. Add the missing variables");
  console.log(
    "   3. For Render deployment, set these in your Render dashboard"
  );
  console.log("   4. Restart your application");
} else {
  console.log("   1. Your environment is properly configured!");
  console.log(
    "   2. Make sure to set the same variables in your production environment"
  );
  console.log("   3. Test your file uploads and serving");
}

console.log("\n📝 Example .env file:");
console.log("NODE_ENV=development");
console.log("MONGODB_URI=mongodb://localhost:27017/your-database");
console.log("JWT_SECRET=your-super-secret-jwt-key");
console.log("RENDER_STORAGE_PATH=/opt/render/project/src/uploads");
console.log("RENDER_EXTERNAL_URL=https://your-app.onrender.com");
console.log("PORT=5000");
console.log("CORS_ORIGIN=http://localhost:3000");
