#!/usr/bin/env node

/**
 * Test the init_project MCP tool
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

// Test the MCP server with init_project tool
async function testMCPInitProject() {
  console.log('🧪 Testing MCP init_project tool...\n');

  // Start the MCP server
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let error = '';

  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  server.stderr.on('data', (data) => {
    error += data.toString();
  });

  // Send initialization request
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };

  server.stdin.write(JSON.stringify(initRequest) + '\n');

  // Send list tools request
  const listToolsRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };

  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Send init_project tool call
  const initProjectRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "init_project",
      arguments: {
        name: "test-nextjs-app",
        platform: "nextjs",
        type: "web-app",
        features: ["auth", "database"],
        templateStyle: "standard"
      }
    }
  };

  server.stdin.write(JSON.stringify(initProjectRequest) + '\n');

  // Wait for responses
  setTimeout(() => {
    server.kill();
    
    console.log('📤 Server Output:');
    console.log(output);
    
    if (error) {
      console.log('\n❌ Server Errors:');
      console.log(error);
    }
    
    // Check if init_project tool is listed
    if (output.includes('init_project')) {
      console.log('\n✅ init_project tool is available');
    } else {
      console.log('\n❌ init_project tool not found');
    }
    
    // Check response size
    const responses = output.split('\n').filter(line => line.trim().startsWith('{'));
    responses.forEach((response, index) => {
      try {
        const parsed = JSON.parse(response);
        if (parsed.id === 3) { // init_project response
          const responseSize = response.length;
          console.log(`\n📊 init_project response size: ${responseSize} characters`);
          console.log(`📊 Token estimate: ~${Math.ceil(responseSize / 4)} tokens`);
          
          if (responseSize < 100000) { // ~25k tokens
            console.log('✅ Response size is within MCP limits');
          } else {
            console.log('⚠️  Response size may exceed MCP limits');
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });
    
    console.log('\n🎉 MCP test completed!');
  }, 3000);
}

testMCPInitProject().catch(console.error);
