#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

console.log(`🚀 Starting frontend on port ${port}`);

// Start vite preview with the correct port
const viteProcess = spawn('npx', ['vite', 'preview', '--port', port, '--host', '0.0.0.0'], {
  stdio: 'inherit',
  cwd: __dirname
});

viteProcess.on('error', (error) => {
  console.error('❌ Failed to start Vite:', error);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  viteProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  viteProcess.kill('SIGINT');
});
