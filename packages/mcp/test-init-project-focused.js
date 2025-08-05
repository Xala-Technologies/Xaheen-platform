#!/usr/bin/env node

/**
 * Focused test for init_project tool with xaheen-ui-v2 analysis
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'index.js');
const targetProject = '/Volumes/Development/Xaheen Enterprise/xaheen/apps/xaheen-ui-v2';

console.log('🧪 Testing init_project tool with xaheen-ui-v2');
console.log('Target:', targetProject);
console.log('='.repeat(50));

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responses = [];

server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const parsed = JSON.parse(line);
      responses.push(parsed);
    } catch (e) {
      // Skip non-JSON lines
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('Server:', data.toString().trim());
});

// Step 1: Initialize
setTimeout(() => {
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
  
  console.log('📤 1. Initializing MCP server...');
  server.stdin.write(JSON.stringify(initMessage) + '\n');
}, 500);

// Step 2: Call init_project tool
setTimeout(() => {
  const toolCall = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'init_project',
      arguments: {
        projectPath: targetProject,
        platform: 'nextjs',
        features: ['auth', 'database', 'i18n'],
        analyze: true
      }
    }
  };
  
  console.log('📤 2. Calling init_project tool...');
  console.log('   - Project Path:', targetProject);
  console.log('   - Platform: Next.js');
  console.log('   - Features: auth, database, i18n');
  console.log('   - Mode: Analysis');
  
  server.stdin.write(JSON.stringify(toolCall) + '\n');
}, 1500);

// Step 3: Process results
setTimeout(() => {
  console.log('\n📊 Processing Results...');
  console.log('='.repeat(50));
  
  const initResponse = responses.find(r => r.id === 1);
  const toolResponse = responses.find(r => r.id === 2);
  
  if (initResponse) {
    console.log('✅ Server initialized successfully');
    console.log('   Version:', initResponse.result?.serverInfo?.version || 'Unknown');
  }
  
  if (toolResponse) {
    console.log('\n🎯 init_project Tool Results:');
    
    if (toolResponse.error) {
      console.log('❌ Tool Error:', toolResponse.error.message);
      console.log('   Code:', toolResponse.error.code);
    } else if (toolResponse.result) {
      const result = toolResponse.result;
      
      // Display content
      if (result.content) {
        console.log('\n📋 Analysis Results:');
        result.content.forEach(item => {
          if (item.type === 'text') {
            console.log(item.text);
          }
        });
      }
      
      // Check response size
      const responseSize = JSON.stringify(result).length;
      console.log('\n📏 Response Metrics:');
      console.log('   Size:', responseSize, 'characters');
      console.log('   Tokens (est):', Math.ceil(responseSize / 4));
      
      if (responseSize > 25000) {
        console.log('   ⚠️  WARNING: Exceeds MCP token limits!');
      } else {
        console.log('   ✅ Within MCP token limits');
      }
    }
  } else {
    console.log('❌ No tool response received');
  }
  
  server.kill();
}, 3000);

server.on('close', (code) => {
  console.log('\n🏁 Test completed');
  process.exit(code || 0);
});
