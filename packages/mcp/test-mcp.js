#!/usr/bin/env node

/**
 * Comprehensive MCP Tools Test Script
 * Tests all available tools in the Xala MCP server
 */

import { spawn } from 'child_process';

const TEST_TIMEOUT = 10000; // 10 seconds per test

// Test cases for all MCP tools
const testCases = [
  {
    name: "List Tools",
    request: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    },
    description: "Get list of all available tools"
  },
  {
    name: "Generate Component - React Button",
    request: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "generate_component",
        arguments: {
          description: "Create a button component",
          platform: "react"
        }
      }
    },
    description: "Generate a React button component"
  },
  {
    name: "Generate Component - Next.js Card",
    request: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "generate_component",
        arguments: {
          description: "Create a card component with header and content",
          platform: "nextjs"
        }
      }
    },
    description: "Generate a Next.js card component"
  },
  {
    name: "Quick Generate - Modal",
    request: {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "quick_generate",
        arguments: {
          type: "modal",
          name: "ConfirmModal",
          platform: "react"
        }
      }
    },
    description: "Quick generate a modal component"
  },
  {
    name: "Get Component Template",
    request: {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "get_component_template",
        arguments: {
          componentType: "button",
          platform: "react"
        }
      }
    },
    description: "Get a component template"
  },
  {
    name: "CLI Style - Create Button",
    request: {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "xala_create",
        arguments: {
          type: "component",
          name: "ActionButton",
          platform: "react"
        }
      }
    },
    description: "CLI style component creation"
  },
  {
    name: "Generate Multi-Platform Component",
    request: {
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "generate_multi_platform_component",
        arguments: {
          description: "Create a loading spinner component",
          platforms: ["react", "vue"],
          componentType: "utility"
        }
      }
    },
    description: "Generate component for multiple platforms"
  },
  {
    name: "Norwegian Compliance Check",
    request: {
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: {
        name: "validate_norwegian_compliance",
        arguments: {
          componentCode: "export const Button = () => <button>Click me</button>",
          platform: "react"
        }
      }
    },
    description: "Validate Norwegian compliance"
  },
  {
    name: "Platform Recommendations",
    request: {
      jsonrpc: "2.0",
      id: 9,
      method: "tools/call",
      params: {
        name: "get_platform_recommendations",
        arguments: {
          projectType: "web-app",
          requirements: ["responsive", "accessibility"]
        }
      }
    },
    description: "Get platform recommendations"
  },
  {
    name: "Shadcn Blocks",
    request: {
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: {
        name: "get_shadcn_block",
        arguments: {
          blockName: "authentication-form",
          variant: "default"
        }
      }
    },
    description: "Get shadcn-ui block"
  }
];

/**
 * Run a single test case
 */
async function runTest(testCase) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    
    const mcpProcess = spawn('node', ['dist/index.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';
    let resolved = false;

    // Set timeout
    const timeout = global.setTimeout(() => {
      if (!resolved) {
        resolved = true;
        mcpProcess.kill('SIGTERM');
        resolve({
          name: testCase.name,
          success: false,
          error: 'Test timed out',
          output: output,
          errorOutput: errorOutput
        });
      }
    }, TEST_TIMEOUT);

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      // Look for JSON response
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.id === testCase.request.id) {
              if (!resolved) {
                resolved = true;
                global.clearTimeout(timeout);
                mcpProcess.kill('SIGTERM');
                
                const success = !response.error && (!response.result?.isError);
                resolve({
                  name: testCase.name,
                  success: success,
                  response: response,
                  output: output,
                  errorOutput: errorOutput
                });
              }
              return;
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        global.clearTimeout(timeout);
        resolve({
          name: testCase.name,
          success: false,
          error: error.message,
          output: output,
          errorOutput: errorOutput
        });
      }
    });

    mcpProcess.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        global.clearTimeout(timeout);
        resolve({
          name: testCase.name,
          success: code === 0,
          exitCode: code,
          output: output,
          errorOutput: errorOutput
        });
      }
    });

    // Send the test request
    try {
      mcpProcess.stdin.write(JSON.stringify(testCase.request) + '\n');
    } catch (error) {
      if (!resolved) {
        resolved = true;
        global.clearTimeout(timeout);
        resolve({
          name: testCase.name,
          success: false,
          error: `Failed to send request: ${error.message}`,
          output: output,
          errorOutput: errorOutput
        });
      }
    }
  });
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Xala MCP Tools Test Suite');
  console.log(`📊 Running ${testCases.length} test cases...\n`);

  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.name}: PASSED`);
    } else {
      console.log(`❌ ${result.name}: FAILED`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.response?.error) {
        console.log(`   MCP Error: ${JSON.stringify(result.response.error, null, 2)}`);
      }
      if (result.errorOutput) {
        console.log(`   Stderr: ${result.errorOutput.slice(0, 200)}...`);
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => global.setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  console.log(`🎯 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.name}: ${result.error || 'Unknown error'}`);
    });
  }

  // Detailed results for debugging
  if (process.argv.includes('--verbose')) {
    console.log('\n🔍 Detailed Results:');
    console.log('===================');
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Success: ${result.success}`);
      if (result.response) {
        console.log(`  Response: ${JSON.stringify(result.response, null, 2).slice(0, 500)}...`);
      }
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
