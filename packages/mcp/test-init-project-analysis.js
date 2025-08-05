#!/usr/bin/env node

/**
 * Test script for xala-mcp init_project tool
 * Tests the tool's ability to analyze existing projects
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  serverPath: join(__dirname, 'dist', 'index.js'),
  targetProject: '/Volumes/Development/Xaheen Enterprise/xaheen/apps/xaheen-ui-v2',
  toolName: 'init_project'
};

/**
 * Test the init_project tool with project analysis
 */
async function testInitProjectAnalysis() {
  console.log('🧪 Testing xala-mcp init_project tool...\n');
  
  return new Promise((resolve, reject) => {
    // Start the MCP server
    const server = spawn('node', [TEST_CONFIG.serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let responseData = '';
    let errorData = '';

    // Handle server output
    server.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Send MCP initialization
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    // Send tool call after initialization
    setTimeout(() => {
      const toolCallMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'init_project',
          arguments: {
            projectPath: TEST_CONFIG.targetProject,
            platform: 'nextjs',
            features: ['auth', 'database', 'i18n'],
            analyze: true, // Request analysis of existing project
            dryRun: true   // Don't create files, just analyze
          }
        }
      };

      console.log('📤 Sending init_project tool call...');
      console.log('Target Project:', TEST_CONFIG.targetProject);
      console.log('Platform: Next.js');
      console.log('Features: auth, database, i18n');
      console.log('Mode: Analysis + Dry Run\n');

      server.stdin.write(JSON.stringify(toolCallMessage) + '\n');
    }, 1000);

    // Handle server close
    server.on('close', (code) => {
      console.log('\n📊 Test Results:');
      console.log('================');
      
      if (code === 0) {
        console.log('✅ Server exited successfully');
        
        // Parse and display responses
        const responses = responseData.split('\n').filter(line => line.trim());
        
        responses.forEach((response, index) => {
          try {
            const parsed = JSON.parse(response);
            
            if (parsed.method === 'tools/call' && parsed.result) {
              console.log('\n🎯 init_project Tool Response:');
              console.log('==============================');
              
              const result = parsed.result;
              
              // Display project analysis
              if (result.analysis) {
                console.log('\n📋 Project Analysis:');
                console.log('- Framework:', result.analysis.framework || 'Not detected');
                console.log('- Package Manager:', result.analysis.packageManager || 'Not detected');
                console.log('- Dependencies:', result.analysis.dependencies?.length || 0);
                console.log('- Features Detected:', result.analysis.features?.join(', ') || 'None');
              }
              
              // Display recommendations
              if (result.recommendations) {
                console.log('\n💡 Recommendations:');
                result.recommendations.forEach((rec, i) => {
                  console.log(`${i + 1}. ${rec}`);
                });
              }
              
              // Display next steps
              if (result.nextSteps) {
                console.log('\n🚀 Next Steps:');
                result.nextSteps.forEach((step, i) => {
                  console.log(`${i + 1}. ${step}`);
                });
              }
              
              // Display file operations (if any)
              if (result.files && result.files.length > 0) {
                console.log('\n📁 Files to be Created/Modified:');
                result.files.forEach(file => {
                  console.log(`- ${file.path} (${file.type})`);
                });
              }
              
              // Display commands
              if (result.commands && result.commands.length > 0) {
                console.log('\n⚡ Commands to Run:');
                result.commands.forEach(cmd => {
                  console.log(`- ${cmd}`);
                });
              }
              
              // Check response size
              const responseSize = JSON.stringify(result).length;
              console.log('\n📏 Response Metrics:');
              console.log('- Response Size:', responseSize, 'characters');
              console.log('- Token Estimate:', Math.ceil(responseSize / 4), 'tokens');
              
              if (responseSize > 25000) {
                console.log('⚠️  WARNING: Response size exceeds MCP limits!');
              } else {
                console.log('✅ Response size within MCP limits');
              }
            }
          } catch (e) {
            // Skip non-JSON responses
          }
        });
        
        resolve();
      } else {
        console.log('❌ Server exited with code:', code);
        if (errorData) {
          console.log('Error output:', errorData);
        }
        reject(new Error(`Server failed with code ${code}`));
      }
    });

    // Send initialization
    server.stdin.write(JSON.stringify(initMessage) + '\n');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      server.kill();
      reject(new Error('Test timeout'));
    }, 30000);
  });
}

// Run the test
testInitProjectAnalysis()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });
