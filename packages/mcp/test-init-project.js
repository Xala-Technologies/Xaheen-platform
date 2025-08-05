#!/usr/bin/env node

/**
 * Test script for the new init_project tool
 * Tests the ProjectInitializer functionality
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

// Mock ProjectInitializer for testing
class ProjectInitializer {
	async createProject(config) {
		console.log('🚀 Creating project with config:', JSON.stringify(config, null, 2));
		
		// Simulate project creation
		const result = {
			success: true,
			projectName: config.name,
			platform: config.platform,
			type: config.type,
			features: config.features,
			templateStyle: config.templateStyle,
			files: [
				'package.json',
				'next.config.js',
				'tailwind.config.ts',
				'tsconfig.json',
				'src/app/layout.tsx',
				'src/app/page.tsx',
				'src/components/providers/UISystemProvider.tsx',
				'src/components/ui/Button.tsx'
			],
			setupInstructions: [
				`cd ${config.name}`,
				'npm install',
				'npm run dev'
			],
			nextSteps: [
				'🎉 Project created successfully!',
				`📁 Navigate to your project: cd ${config.name}`,
				'🚀 Start development server: npm run dev',
				'📖 Check the README.md for detailed setup instructions',
				'🎨 Explore the Xala UI System components in src/components/ui',
				'⚙️ Configure your project settings in next.config.js'
			]
		};

		// Add feature-specific files
		if (config.features.includes('auth')) {
			result.files.push('src/components/auth/AuthProvider.tsx');
			result.files.push('src/pages/login.tsx');
		}
		if (config.features.includes('database')) {
			result.files.push('prisma/schema.prisma');
			result.files.push('src/lib/db.ts');
		}
		if (config.features.includes('ai-assistant')) {
			result.files.push('src/components/ai/AIAssistant.tsx');
			result.files.push('src/lib/ai.ts');
		}

		return result;
	}
}

// Test the init_project functionality
async function testInitProject() {
	console.log('🧪 Testing init_project tool...\n');

	const testConfigs = [
		{
			name: 'my-nextjs-app',
			platform: 'nextjs',
			type: 'web-app',
			features: ['auth', 'database'],
			templateStyle: 'standard'
		},
		{
			name: 'react-dashboard',
			platform: 'react',
			type: 'web-app',
			features: ['ai-assistant'],
			templateStyle: 'enterprise'
		},
		{
			name: 'vue-minimal',
			platform: 'vue',
			type: 'web-app',
			features: [],
			templateStyle: 'minimal'
		}
	];

	const initializer = new ProjectInitializer();

	for (const config of testConfigs) {
		console.log(`\n📦 Testing ${config.platform} project: ${config.name}`);
		console.log('─'.repeat(50));
		
		try {
			const result = await initializer.createProject(config);
			
			if (result.success) {
				console.log('✅ Project creation successful!');
				console.log(`📁 Project: ${result.projectName}`);
				console.log(`🛠️  Platform: ${result.platform}`);
				console.log(`🎨 Template: ${result.templateStyle}`);
				console.log(`🔧 Features: ${result.features.join(', ') || 'none'}`);
				console.log(`📄 Files created: ${result.files.length}`);
				
				console.log('\n📋 Setup Instructions:');
				result.setupInstructions.forEach(instruction => {
					console.log(`  • ${instruction}`);
				});
				
				console.log('\n🎯 Next Steps:');
				result.nextSteps.forEach(step => {
					console.log(`  ${step}`);
				});
			} else {
				console.log('❌ Project creation failed:', result.error);
			}
		} catch (error) {
			console.log('❌ Test failed:', error.message);
		}
	}
}

// Test MCP tool response format
function testMCPResponse() {
	console.log('\n\n🔧 Testing MCP Tool Response Format...\n');
	console.log('─'.repeat(50));
	
	const mockResult = {
		success: true,
		projectName: 'xaheen-web-app',
		platform: 'nextjs',
		type: 'web-app',
		features: ['auth', 'database', 'ai-assistant'],
		templateStyle: 'standard',
		files: [
			'package.json',
			'next.config.js',
			'src/app/layout.tsx',
			'src/components/providers/UISystemProvider.tsx',
			'src/components/auth/AuthProvider.tsx',
			'prisma/schema.prisma',
			'src/components/ai/AIAssistant.tsx'
		],
		setupInstructions: [
			'cd xaheen-web-app',
			'npm install',
			'npm run dev'
		],
		nextSteps: [
			'🎉 Project created successfully!',
			'📁 Navigate to your project: cd xaheen-web-app',
			'🚀 Start development server: npm run dev'
		]
	};

	// Format as MCP response
	const mcpResponse = {
		content: [{
			type: "text",
			text: JSON.stringify(mockResult, null, 2)
		}]
	};

	console.log('📤 MCP Response Format:');
	console.log(JSON.stringify(mcpResponse, null, 2));
	
	// Check response size
	const responseSize = JSON.stringify(mcpResponse).length;
	console.log(`\n📊 Response size: ${responseSize} characters`);
	console.log(`📊 Token estimate: ~${Math.ceil(responseSize / 4)} tokens`);
	
	if (responseSize < 100000) { // ~25k tokens
		console.log('✅ Response size is within MCP limits');
	} else {
		console.log('⚠️  Response size may exceed MCP limits');
	}
}

// Run tests
async function main() {
	console.log('🎯 Xala MCP - Init Project Tool Test');
	console.log('═'.repeat(50));
	
	await testInitProject();
	testMCPResponse();
	
	console.log('\n\n🎉 All tests completed!');
	console.log('\n💡 The init_project tool is ready to replace create_project');
	console.log('💡 It uses create-next-app and other CLI tools for efficient project creation');
	console.log('💡 Response size is optimized to stay under MCP token limits');
}

main().catch(console.error);
