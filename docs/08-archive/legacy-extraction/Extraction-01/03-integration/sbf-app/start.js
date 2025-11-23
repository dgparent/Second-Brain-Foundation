#!/usr/bin/env node
/**
 * SBF Startup Script
 * 
 * Starts both server and UI in development mode
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Second Brain Foundation...\n');

// Start server
const serverPath = path.join(__dirname, 'packages', 'server');
console.log('📡 Starting API server...');
const server = spawn('pnpm', ['dev'], {
  cwd: serverPath,
  shell: true,
  stdio: 'inherit'
});

// Wait 2 seconds then start UI
setTimeout(() => {
  const uiPath = path.join(__dirname, 'packages', 'ui');
  console.log('\n💻 Starting UI...');
  const ui = spawn('pnpm', ['dev'], {
    cwd: uiPath,
    shell: true,
    stdio: 'inherit'
  });

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Shutting down...');
    server.kill();
    ui.kill();
    process.exit(0);
  });
}, 2000);
