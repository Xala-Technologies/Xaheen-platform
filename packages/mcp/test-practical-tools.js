#!/usr/bin/env node

/**
 * Test script for the 10 practical MCP tools with enhanced prompts
 * Tests all core functionality with realistic scenarios and prompt integration
 */

import { XalaUISystemServer } from './src/server/XalaUISystemServer.js';
import { CORE_TOOLS } from './src/tools/CoreTools.js';
import { practicalToolPrompts } from './src/prompts/PracticalToolPrompts.js';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PATH = join(__dirname, 'src', 'index.ts');

// Test scenarios for each tool
const testScenarios = [
  {
    name: 'get_components',
    description: 'Retrieve React button component',
    args: {
      platform: 'react',
      category: 'input',
      name: 'Button'
    }
  },
  {
    name: 'get_blocks',
    description: 'Get dashboard layout block',
    args: {
      platform: 'react',
      type: 'dashboard',
      name: 'AdminDashboard'
    }
  },
  {
    name: 'get_rules',
    description: 'Get accessibility rules',
    args: {
      type: 'accessibility',
      platform: 'react',
      severity: 'error'
    }
  },
  {
    name: 'generate_component',
    description: 'Generate a custom search component',
    args: {
      name: 'SearchBox',
      platform: 'react',
      description: 'A reusable search input with autocomplete functionality',
      baseComponents: ['Input', 'Dropdown', 'Icon'],
      variant: 'primary',
      features: ['autocomplete', 'keyboard-navigation', 'debounced-search']
    }
  },
  {
    name: 'generate_page',
    description: 'Generate a user profile page',
    args: {
      name: 'UserProfile',
      platform: 'nextjs',
      description: 'User profile page with editable fields and settings',
      layout: 'sidebar',
      components: ['Avatar', 'Form', 'Button', 'Card'],
      routing: true
    }
  },
  {
    name: 'norwegian_compliance',
    description: 'Validate Norwegian compliance for a form',
    args: {
      code: `
        const ContactForm = () => {
          return (
            <form>
              <input type="text" placeholder="Navn" required />
              <input type="email" placeholder="E-post" required />
              <button type="submit">Send</button>
            </form>
          );
        };
      `,
      platform: 'react',
      type: 'form',
      strictMode: true
    }
  },
  {
    name: 'gdpr_compliance',
    description: 'Validate GDPR compliance for data handling',
    args: {
      code: `
        const UserData = {
          collectUserData: (email, name) => {
            localStorage.setItem('user', JSON.stringify({ email, name }));
          }
        };
      `,
      platform: 'react',
      type: 'data-handling',
      dataTypes: ['email', 'name']
    }
  },
  {
    name: 'transform_code',
    description: 'Transform React component to Vue',
    args: {
      code: `
        const Button = ({ children, onClick, variant = 'primary' }) => {
          return (
            <button 
              className={\`btn btn-\${variant}\`}
              onClick={onClick}
            >
              {children}
            </button>
          );
        };
      `,
      fromPlatform: 'react',
      toPlatform: 'vue',
      conventions: ['composition-api', 'typescript'],
      preserveLogic: true
    }
  },
  {
    name: 'analyse_code',
    description: 'Analyze component for all issues',
    args: {
      code: `
        const UserList = ({ users }) => {
          return (
            <div>
              {users.map(user => (
                <div key={user.id} onClick={() => alert(user.name)}>
                  <img src={user.avatar} />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          );
        };
      `,
      platform: 'react',
      analysisType: 'all',
      detailLevel: 'comprehensive'
    }
  },
  {
    name: 'init_project',
    description: 'Initialize a new React component library',
    args: {
      name: 'my-design-system',
      platform: 'react',
      type: 'component-library',
      features: ['typescript', 'storybook', 'testing', 'documentation'],
      templateStyle: 'enterprise'
    }
  }
];

async function testPracticalTools() {
  console.log('🧪 Testing Practical MCP Tools with Enhanced Prompts');
  console.log('====================================================\n');

  const server = new XalaUISystemServer();

  // Test enhanced prompts availability
  console.log('📋 Available Enhanced Prompts:');
  Object.keys(practicalToolPrompts).forEach(promptName => {
    console.log(`  - ${promptName}: ${practicalToolPrompts[promptName].description}`);
  });
  console.log();

  // Test 1: Get Components with Enhanced Prompt
  console.log('📋 Testing: get_components');
  console.log('   Description: Retrieve React button component');
  
  try {
    const result = await server.handleToolCall({
      method: 'tools/call',
      params: {
        name: 'get_components',
        arguments: {
          platform: 'react',
          category: 'input',
          name: 'Button'
        }
      }
    });
    console.log('   ✅ Success: ', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('   ❌ Error: ', error.message);
  }
  console.log();

  // Test 2: Generate Component with Enhanced Prompt
  console.log('4️⃣ Testing generate_component with enhanced prompts...');
  try {
    // Test enhanced prompt generation
    const promptTemplate = practicalToolPrompts['generate-component-enhanced'];
    if (promptTemplate) {
      const enhancedPrompt = promptTemplate.handler({
        componentName: 'UserCard',
        platform: 'react',
        description: 'A card component to display user information with avatar and actions',
        baseComponents: 'Card,Avatar,Button',
        features: 'responsive,accessible,themeable',
        designStyle: 'modern',
        accessibility: 'WCAG 2.1 AA'
      });
      console.log('📝 Enhanced component generation guidance preview:');
      console.log(enhancedPrompt.messages[0].content.text.substring(0, 300) + '...');
      console.log();
    }

    const result = await server.handleToolCall({
      method: 'tools/call',
      params: {
        name: 'generate_component',
        arguments: {
          name: 'UserCard',
          platform: 'react',
          description: 'A card component to display user information with avatar and actions',
          baseComponents: ['Card', 'Avatar', 'Button'],
          features: ['responsive', 'accessible', 'themeable']
        }
      }
    });
    console.log('✅ generate_component result with enhanced guidance:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ generate_component error:', error.message);
  }
  console.log();

  // Run tests for each scenario
  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    
    try {
      const result = await server.handleToolCall({
        method: 'tools/call',
        params: {
          name: scenario.name,
          arguments: scenario.args
        }
      });
      console.log(`   ✅ Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎉 All tests completed!');
}

function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['-r', 'tsx/esm', SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });

    // Send MCP request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      child.kill();
      reject(new Error('Tool call timed out'));
    }, 10000);
  });
}

function truncateOutput(output, maxLength = 100) {
  if (output.length <= maxLength) {
    return output.trim();
  }
  return output.substring(0, maxLength).trim() + '...';
}

// Run tests
testMCPServer().catch(console.error);
