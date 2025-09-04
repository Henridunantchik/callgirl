#!/usr/bin/env node

// Simple startup test script
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🧪 Testing server startup...");

// Set minimal environment variables for testing
const env = {
  ...process.env,
  NODE_ENV: "test",
  PORT: "5001",
  MONGODB_CONN: "mongodb://localhost:27017/test_db",
  JWT_SECRET: "test-secret-key-for-testing-purposes-only",
  FRONTEND_URL: "http://localhost:3000",
};

// Start the server
const server = spawn("node", ["index.js"], {
  cwd: __dirname,
  env,
  stdio: "pipe",
});

let output = "";
let errorOutput = "";

server.stdout.on("data", (data) => {
  output += data.toString();
  console.log("STDOUT:", data.toString());
});

server.stderr.on("data", (data) => {
  errorOutput += data.toString();
  console.error("STDERR:", data.toString());
});

server.on("close", (code) => {
  console.log(`Server exited with code ${code}`);
  if (code === 0) {
    console.log("✅ Server started successfully");
  } else {
    console.log("❌ Server failed to start");
    console.log("Error output:", errorOutput);
  }
  process.exit(code);
});

// Kill the server after 10 seconds
setTimeout(() => {
  console.log("⏰ Killing server after 10 seconds...");
  server.kill("SIGTERM");
}, 10000);
