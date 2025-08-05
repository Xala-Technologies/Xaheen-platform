#!/usr/bin/env node

/**
 * Simple test to verify MCP server startup and tool registration
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'index.js');

console.log('🚀 Testing MCP server startup...');
console.log('Server path:', serverPath);

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString().trim());
});

// Send initialization message
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' }
  }
};

setTimeout(() => {
  console.log('\n📤 Sending initialization...');
  server.stdin.write(JSON.stringify(initMessage) + '\n');
}, 1000);

// List tools after initialization
setTimeout(() => {
  const listToolsMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  };
  
  console.log('\n📋 Requesting tools list...');
  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 2000);

// Kill server after 5 seconds
setTimeout(() => {
  console.log('\n🛑 Stopping server...');
  server.kill();
}, 5000);

server.on('close', (code) => {
  console.log('\n📊 Server closed with code:', code);
  if (errorOutput) {
    console.log('❌ Errors:', errorOutput);
  }
});
