#!/usr/bin/env node

/**
 * Streamlined Xala MCP Tools Test Suite
 * Tests the 6 core tools: generate, get_template, validate, recommend, transform, get_block
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test cases for the 6 streamlined core tools
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
        name: "generate",
        arguments: {
          type: "component",
          platform: "react",
          name: "Button",
          description: "A reusable button component"
        }
      }
    },
    description: "Generate a React button component"
  },
  {
    name: "Generate Layout - Next.js Dashboard",
    request: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "generate",
        arguments: {
          type: "layout",
          platform: "nextjs",
          name: "DashboardLayout",
          description: "Dashboard layout with sidebar and header"
        }
      }
    },
    description: "Generate a Next.js dashboard layout"
  },
  {
    name: "Generate Form - Contact Form",
    request: {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "generate",
        arguments: {
          type: "form",
          platform: "react",
          name: "ContactForm",
          description: "Contact form with validation"
        }
      }
    },
    description: "Generate a contact form"
  },
  {
    name: "Get Template - Button Templates",
    request: {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "get_template",
        arguments: {
          category: "components",
          platform: "react"
        }
      }
    },
    description: "Get component templates"
  },
  {
    name: "Validate Component - Norwegian Compliance",
    request: {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "validate",
        arguments: {
          code: "const Button = () => <button>Click me</button>;",
          type: "component",
          platform: "react",
          rules: ["norwegian-compliance", "accessibility"]
        }
      }
    },
    description: "Validate component for Norwegian compliance"
  },
  {
    name: "Get Recommendations - Modern Stack",
    request: {
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "recommend",
        arguments: {
          context: "Building a modern web application for Norwegian government",
          requirements: ["accessibility", "performance", "security", "norwegian-compliance"]
        }
      }
    },
    description: "Get platform and technology recommendations"
  },
  {
    name: "Transform Code - React to Vue",
    request: {
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: {
        name: "transform",
        arguments: {
          code: "const Button = ({ children, onClick }) => <button onClick={onClick}>{children}</button>;",
          fromPlatform: "react",
          toPlatform: "vue",
          conventions: ["xala-patterns", "typescript"]
        }
      }
    },
    description: "Transform React component to Vue"
  },
  {
    name: "Get UI Block - Login Form",
    request: {
      jsonrpc: "2.0",
      id: 9,
      method: "tools/call",
      params: {
        name: "get_block",
        arguments: {
          name: "login-form",
          platform: "react",
          variant: "enterprise"
        }
      }
    },
    description: "Get pre-built login form UI block"
  },
  {
    name: "Generate Project - Complete App",
    request: {
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: {
        name: "generate",
        arguments: {
          type: "project",
          platform: "nextjs",
          name: "AdminDashboard",
          description: "Complete admin dashboard application"
        }
      }
    },
    description: "Generate a complete project structure"
  }
];

async function runTest(testCase) {
  return new Promise((resolve) => {
    const mcpPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [mcpPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send the test request
    child.stdin.write(JSON.stringify(testCase.request) + '\n');

    setTimeout(() => {
      child.kill();
      
      try {
        const lines = output.split('\n').filter(line => line.trim());
        const lastLine = lines[lines.length - 1];
        
        if (lastLine) {
          const response = JSON.parse(lastLine);
          
          if (testCase.request.method === "tools/list") {
            const hasTools = response.result && response.result.tools && response.result.tools.length > 0;
            const hasExpectedTools = response.result.tools.some(tool => 
              ['generate', 'get_template', 'validate', 'recommend', 'transform', 'get_block'].includes(tool.name)
            );
            resolve({ 
              success: hasTools && hasExpectedTools, 
              response: response,
              toolCount: response.result.tools.length,
              tools: response.result.tools
            });
          } else {
            const hasContent = response.result && response.result.content && response.result.content.length > 0;
            const content = hasContent ? response.result.content[0].text : 'No content';
            resolve({ 
              success: hasContent, 
              response: response,
              content: content
            });
          }
        } else {
          resolve({ success: false, error: 'No response received' });
        }
      } catch (error) {
        resolve({ success: false, error: error.message, output, errorOutput });
      }
    }, 2000);
  });
}

async function runAllTests() {
  console.log('🚀 Starting Streamlined Xala MCP Tools Test Suite');
  console.log(`📊 Running ${testCases.length} test cases...\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`🧪 Testing: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    
    const result = await runTest(testCase);
    
    if (result.success) {
      console.log(`✅ ${testCase.name}: PASSED`);
      if (testCase.name === "List Tools" && result.toolCount) {
        console.log(`   📋 Found ${result.toolCount} tools:`);
        result.tools.forEach(tool => {
          console.log(`      • ${tool.name}: ${tool.description}`);
        });
      } else if (result.content) {
        console.log(`   💡 Output preview: ${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}`);
      }
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: FAILED`);
      if (result.error) {
        console.log(`   🔍 Error: ${result.error}`);
      }
      failed++;
    }
    console.log('');
  }

  console.log('📋 Test Summary:');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${testCases.length}`);
  console.log(`🎯 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The streamlined MCP server is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
}

runAllTests().catch(console.error);
