/**
 * Core Tool Handlers - Handles execution of practical MCP tools
 * Provides the implementation for all 10 core tools
 */

import { ComponentGenerator } from "../generators/ComponentGenerator.js";
import { TemplateManager } from "../templates/TemplateManager.js";
import { AITemplateSystem } from "../ai/index.js";
import { NorwegianComplianceGenerator } from "../generators/NorwegianComplianceGenerator.js";
import { NorwegianComplianceValidator } from "../utils/norwegian-compliance-validation.js";
import { practicalToolPrompts } from "../prompts/PracticalToolPrompts.js";
import { ProjectInitializer } from "../utils/ProjectInitializer.js";
import type { 
	MCPToolResult, 
	GetComponentsArgs, 
	GetBlocksArgs, 
	GetRulesArgs, 
	GenerateComponentArgs, 
	GeneratePageArgs, 
	NorwegianComplianceArgs, 
	GDPRComplianceArgs, 
	TransformCodeArgs, 
	AnalyseCodeArgs, 
	InitProjectArgs 
} from "../types/index.js";

export class CoreToolHandlers {
	constructor(
		private componentGenerator: ComponentGenerator,
		private templateManager: TemplateManager,
		private aiTemplateSystem: AITemplateSystem,
		private norwegianComplianceValidator: NorwegianComplianceValidator
	) {}

	/**
	 * Get UI components from design system with enhanced prompt guidance
	 */
	async handleGetComponents(args: GetComponentsArgs): Promise<MCPToolResult> {
		try {
			const { name, platform, category, variant } = args;
			
			// Use enhanced prompt for better context and recommendations
			const promptTemplate = practicalToolPrompts['get-components-enhanced'];
			if (!promptTemplate) {
				throw new Error('Enhanced prompt template not found');
			}
			
			const enhancedPrompt = promptTemplate.handler({
				componentName: name,
				platform,
				category,
				useCase: 'component-retrieval',
				designStyle: 'modern'
			});
			
			const components = await this.retrieveComponentsEnhanced(name, platform, category, variant, enhancedPrompt);

			return {
				content: [{
					type: "text",
					text: JSON.stringify({
						components,
						guidance: enhancedPrompt.messages[0]?.content?.text || 'No guidance available',
						recommendations: this.generateComponentRecommendations(components, args)
					}, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error retrieving components: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Get UI blocks and layouts
	 */
	async handleGetBlocks(args: GetBlocksArgs): Promise<MCPToolResult> {
		try {
			const { name, platform, type, theme } = args;
			
			const blocks = await this.retrieveBlocks(name, platform, type, theme);

			return {
				content: [{
					type: "text",
					text: JSON.stringify(blocks, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error retrieving blocks: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Get design system rules and guidelines
	 */
	async handleGetRules(args: GetRulesArgs): Promise<MCPToolResult> {
		try {
			const { type, platform, severity, context } = args;
			
			const rules = await this.getDesignSystemRules(type, platform, severity, context);

			return {
				content: [{
					type: "text",
					text: JSON.stringify(rules, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error retrieving rules: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Generate new components with enhanced prompt guidance
	 */
	async handleGenerateComponent(args: GenerateComponentArgs): Promise<MCPToolResult> {
		try {
			const { name, platform, description, baseComponents, variant, features } = args;
			
			// Use enhanced prompt for sophisticated component generation
			const promptTemplate = practicalToolPrompts['generate-component-enhanced'];
			if (!promptTemplate) {
				throw new Error('Enhanced prompt template not found');
			}
			
			const enhancedPrompt = promptTemplate.handler({
				componentName: name,
				platform,
				description,
				baseComponents: baseComponents?.join(',') || '',
				features: features?.join(',') || '',
				designStyle: 'modern',
				accessibility: 'WCAG 2.1 AA'
			});
			
			const component = await this.generateComponentEnhanced(args, enhancedPrompt);

			return {
				content: [{
					type: "text",
					text: JSON.stringify({
						component,
						guidance: enhancedPrompt.messages[0]?.content?.text || 'No guidance available',
						usageExamples: this.generateUsageExamples(name, platform),
						testingSuggestions: this.generateTestingSuggestions(name, features)
					}, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error generating component: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Generate complete pages with enhanced prompt guidance
	 */
	async handleGeneratePage(args: GeneratePageArgs): Promise<MCPToolResult> {
		try {
			const { name, platform, description, layout, components, routing } = args;
			
			// Use enhanced prompt for comprehensive page generation
			const promptTemplate = practicalToolPrompts['generate-page-enhanced'];
			if (!promptTemplate) {
				throw new Error('Enhanced prompt template not found');
			}
			
			const enhancedPrompt = promptTemplate.handler({
				pageName: name,
				pageType: this.inferPageType(name, description),
				platform,
				layout: layout || 'sidebar',
				features: components?.join(',') || '',
				dataRequirements: 'mock data with TypeScript interfaces'
			});
			
			const page = await this.generatePageEnhanced(args, enhancedPrompt);

			return {
				content: [{
					type: "text",
					text: JSON.stringify({
						page,
						guidance: enhancedPrompt.messages[0]?.content?.text || 'No guidance available',
						architecture: this.generatePageArchitecture(name, platform),
						performanceConsiderations: this.generatePerformanceGuidance(platform)
					}, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error generating page: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Validate Norwegian compliance with enhanced prompt guidance
	 */
	async handleNorwegianCompliance(args: NorwegianComplianceArgs): Promise<MCPToolResult> {
		try {
			const { code, platform, type, strictMode } = args;
			
			// Use enhanced prompt for comprehensive compliance validation
			const promptTemplate = practicalToolPrompts['compliance-validation-enhanced'];
			if (!promptTemplate) {
				throw new Error('Enhanced compliance prompt template not found');
			}
			
			const enhancedPrompt = promptTemplate.handler({
				code,
				complianceType: 'norwegian',
				platform,
				strictMode: strictMode?.toString() || 'false',
				context: type || 'general'
			});
			
			const validation = await this.validateNorwegianComplianceEnhanced(code, platform, type, strictMode, enhancedPrompt);

			return {
				content: [{
					type: "text",
					text: JSON.stringify({
						validation,
						guidance: enhancedPrompt.messages[0]?.content?.text || 'No guidance available',
						complianceLevel: strictMode ? 'strict' : 'standard'
					}, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error validating Norwegian compliance: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Validate GDPR compliance
	 */
	async handleGDPRCompliance(args: GDPRComplianceArgs): Promise<MCPToolResult> {
		try {
			const { code, platform, type, dataTypes } = args;
			
			const validation = await this.validateGDPRCompliance(code, platform, type, dataTypes);

			return {
				content: [{
					type: "text",
					text: JSON.stringify(validation, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error validating GDPR compliance: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Transform code between platforms
	 */
	async handleTransformCode(args: TransformCodeArgs): Promise<MCPToolResult> {
		try {
			const { code, fromPlatform, toPlatform, conventions, preserveLogic } = args;
			
			const transformedCode = await this.transformCode(code, fromPlatform, toPlatform, conventions, preserveLogic);

			return {
				content: [{
					type: "text",
					text: transformedCode
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error transforming code: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Analyze code for issues
	 */
	async handleAnalyseCode(args: AnalyseCodeArgs): Promise<MCPToolResult> {
		try {
			const { code, platform, analysisType, detailLevel } = args;
			
			const analysis = await this.analyzeCode(code, platform, analysisType, detailLevel);

			return {
				content: [{
					type: "text",
					text: JSON.stringify(analysis, null, 2)
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error analyzing code: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	/**
	 * Initialize new projects
	 */
	async handleInitProject(args: InitProjectArgs): Promise<MCPToolResult> {
		try {
			const { name, projectPath, platform, type, features, templateStyle, analyze, dryRun } = args;
			
			// Determine operation mode
			if (analyze && projectPath) {
				// Analyze existing project
				const analysis = await this.analyzeProject(projectPath, platform, features);
				return {
					content: [{
						type: "text",
						text: JSON.stringify(analysis, null, 2)
					}]
				};
			} else if (name) {
				// Create new project
				const project = await this.initializeProject(name, platform, type || 'web-app', features, templateStyle);
				return {
					content: [{
						type: "text",
						text: JSON.stringify(project, null, 2)
					}]
				};
			} else {
				return await this.enhanceExistingProject(projectPath!, platform, features, dryRun);
			}
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `Error: ${error instanceof Error ? error.message : String(error)}`
				}]
			};
		}
	}

	// Private implementation methods
	private async retrieveComponents(name?: string, platform?: string, category?: string, variant?: string): Promise<any> {
		// Mock implementation - replace with actual component retrieval logic
		return {
			components: [
				{
					name: name || 'Button',
					platform: platform || 'react',
					category: category || 'input',
					variant: variant || 'primary',
					code: `// ${name || 'Button'} component for ${platform || 'react'}`
				}
			]
		};
	}

	private async retrieveBlocks(name?: string, platform?: string, type?: string, theme?: string): Promise<any> {
		// Mock implementation - replace with actual block retrieval logic
		return {
			blocks: [
				{
					name: name || 'Dashboard',
					platform: platform || 'react',
					type: type || 'layout',
					theme: theme || 'default',
					code: `// ${name || 'Dashboard'} block for ${platform || 'react'}`
				}
			]
		};
	}

	private async getDesignSystemRules(type: string, platform?: string, severity?: string, context?: string): Promise<any> {
		// Mock implementation - replace with actual rules retrieval logic
		return {
			rules: [
				{
					id: 'accessibility-1',
					type,
					platform,
					severity: severity || 'warning',
					title: 'Use semantic HTML elements',
					description: 'Always use semantic HTML elements for better accessibility'
				}
			]
		};
	}

	private async generateNewComponent(name: string, platform: string, description: string, baseComponents?: string[], variant?: string, features?: string[]): Promise<string> {
		// Mock implementation - replace with actual component generation logic
		return `// Generated ${name} component for ${platform}\n// ${description}\n// Uses: ${baseComponents?.join(', ') || 'base components'}`;
	}

	private async generateNewPage(name: string, platform: string, description: string, layout?: string, components?: string[], routing?: boolean): Promise<string> {
		// Mock implementation - replace with actual page generation logic
		return `// Generated ${name} page for ${platform}\n// ${description}\n// Layout: ${layout || 'default'}\n// Components: ${components?.join(', ') || 'none'}`;
	}

	private async validateNorwegianCompliance(code: string, platform: string, type: string, strictMode?: boolean): Promise<any> {
		// Mock implementation - replace with actual Norwegian compliance validation logic
		return {
			compliant: true,
			issues: [],
			warnings: [],
			suggestions: [
				'Ensure Norwegian language support is implemented',
				'Verify accessibility compliance with WCAG 2.1 AA',
				'Check data protection measures align with Norwegian regulations'
			]
		};
	}

	private async validateGDPRCompliance(code: string, platform: string, type: string, dataTypes?: string[]): Promise<any> {
		// Mock implementation - replace with actual GDPR validation logic
		return {
			compliant: true,
			issues: [],
			warnings: [],
			suggestions: [
				'Consider adding explicit consent mechanisms',
				'Ensure data minimization principles are followed'
			]
		};
	}

	private async transformCode(code: string, fromPlatform: string, toPlatform: string, conventions?: string[], preserveLogic?: boolean): Promise<string> {
		// Mock implementation - replace with actual code transformation logic
		return `// Transformed from ${fromPlatform} to ${toPlatform}\n// Conventions applied: ${conventions?.join(', ') || 'none'}\n// Logic preserved: ${preserveLogic || false}\n\n${code}`;
	}

	private async analyzeCode(code: string, platform: string, analysisType: string, detailLevel?: string): Promise<any> {
		// Mock implementation - replace with actual code analysis logic
		return {
			analysisType,
			platform,
			detailLevel: detailLevel || 'basic',
			results: {
				performance: { score: 85, issues: [] },
				security: { score: 90, vulnerabilities: [] },
				accessibility: { score: 88, violations: [] },
				maintainability: { score: 82, suggestions: [] }
			}
		};
	}

	private async analyzeProject(projectPath: string, platform: string, features?: string[]): Promise<any> {
		try {
			const fs = await import('fs');
			const path = await import('path');
			
			// Check if project exists
			if (!fs.existsSync(projectPath)) {
				throw new Error(`Project path does not exist: ${projectPath}`);
			}
			
			// Analyze package.json
			const packageJsonPath = path.join(projectPath, 'package.json');
			let packageJson: any = {};
			let detectedFramework = platform;
			let detectedFeatures: string[] = [];
			let dependencies: string[] = [];
			
			if (fs.existsSync(packageJsonPath)) {
				const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
				packageJson = JSON.parse(packageContent);
				
				// Detect framework from dependencies
				const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
				dependencies = Object.keys(allDeps);
				
				if (allDeps.next) detectedFramework = 'nextjs';
				else if (allDeps.react) detectedFramework = 'react';
				else if (allDeps.vue) detectedFramework = 'vue';
				else if (allDeps['@angular/core']) detectedFramework = 'angular';
				else if (allDeps.svelte) detectedFramework = 'svelte';
				
				// Detect features
				if (allDeps['next-auth'] || allDeps['@auth/nextjs'] || allDeps['@supabase/auth-helpers-nextjs']) {
					detectedFeatures.push('auth');
				}
				if (allDeps.prisma || allDeps['@prisma/client'] || allDeps.mongoose || allDeps.typeorm) {
					detectedFeatures.push('database');
				}
				if (allDeps['next-i18next'] || allDeps['react-i18next'] || allDeps.i18next) {
					detectedFeatures.push('i18n');
				}
				if (allDeps.tailwindcss || allDeps['@tailwindcss/forms']) {
					detectedFeatures.push('tailwind');
				}
				if (allDeps['@xala-technologies/ui-system']) {
					detectedFeatures.push('xala-ui-system');
				}
			}
			
			// Check for configuration files
			const configFiles = [
				'next.config.js', 'next.config.ts', 'next.config.mjs',
				'tailwind.config.js', 'tailwind.config.ts',
				'tsconfig.json', 'jsconfig.json',
				'prisma/schema.prisma',
				'.env.local', '.env.example'
			].filter(file => fs.existsSync(path.join(projectPath, file)));
			
			// Generate recommendations
			const recommendations = [];
			const nextSteps = [];
			
			if (features?.includes('auth') && !detectedFeatures.includes('auth')) {
				recommendations.push('Add authentication system (NextAuth.js or Supabase Auth)');
				nextSteps.push('Install authentication dependencies');
			}
			
			if (features?.includes('database') && !detectedFeatures.includes('database')) {
				recommendations.push('Add database integration (Prisma or similar ORM)');
				nextSteps.push('Set up database schema and connection');
			}
			
			if (features?.includes('i18n') && !detectedFeatures.includes('i18n')) {
				recommendations.push('Add internationalization support (next-i18next)');
				nextSteps.push('Configure i18n routing and translations');
			}
			
			if (!detectedFeatures.includes('xala-ui-system')) {
				recommendations.push('Integrate Xala UI System for consistent design');
				nextSteps.push('Install @xala-technologies/ui-system package');
			}
			
			return {
				success: true,
				analysis: {
					projectPath,
					framework: detectedFramework,
					packageManager: fs.existsSync(path.join(projectPath, 'yarn.lock')) ? 'yarn' : 
									 fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml')) ? 'pnpm' :
									 fs.existsSync(path.join(projectPath, 'bun.lockb')) ? 'bun' : 'npm',
					dependencies,
					features: detectedFeatures,
					configFiles,
					projectName: packageJson.name || path.basename(projectPath)
				},
				recommendations,
				nextSteps,
				requested: {
					platform,
					features: features || []
				}
			};
		} catch (error) {
			return {
				success: false,
				platform,
				features: features || [],
				templateStyle: 'standard',
				files: [],
				setupInstructions: [],
				nextSteps: [],
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	private async initializeProject(name: string, platform: string, type: string, features?: string[], templateStyle?: string): Promise<any> {
		try {
			const projectInitializer = new ProjectInitializer();
			return await projectInitializer.createProject({
				name,
				platform: platform as "react" | "vue" | "angular" | "svelte" | "nextjs" | "electron" | "react-native",
				type,
				features: features || [],
				templateStyle: (templateStyle || 'standard') as "minimal" | "standard" | "enterprise"
			});
		} catch (error) {
			return {
				error: `Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`,
				projectName: name,
				platform,
				type,
				features: features || [],
				templateStyle: templateStyle || 'standard'
			};
		}
	}

	/**
	 * Enhance an existing project with recommended improvements
	 */
	private async enhanceExistingProject(
		projectPath: string, 
		platform?: string, 
		features?: string[], 
		dryRun?: boolean
	): Promise<MCPToolResult> {
		// First analyze the project to get recommendations
		const analysisResult = await this.handleInitProject({
			projectPath,
			platform: platform as any,
			features,
			analyze: true
		});
		const analysisData = JSON.parse(analysisResult.content[0]?.text || '{}');
		
		if (!analysisData.success) {
			throw new Error("Failed to analyze project before enhancement");
		}
		
		const recommendations = analysisData.recommendations || [];
		const nextSteps = analysisData.nextSteps || [];
		
		if (dryRun) {
			return {
				content: [{
					type: "text",
					text: JSON.stringify({
						success: true,
						mode: "dry-run",
						analysis: analysisData.analysis,
						plannedEnhancements: [...recommendations, ...nextSteps],
						message: "Dry run complete. Use analyze: false to apply changes."
					}, null, 2)
				}]
			};
		}
		
		// Apply the enhancements
		const { ProjectInitializer } = await import("../utils/ProjectInitializer.js");
		const projectInitializer = new ProjectInitializer();
		const enhancementResult = await projectInitializer.enhanceExistingProject(projectPath, [...recommendations, ...nextSteps]);
		
		return {
			content: [{
				type: "text",
				text: JSON.stringify({
					success: enhancementResult.success,
					mode: "enhancement",
					originalAnalysis: analysisData.analysis,
					appliedFixes: enhancementResult.appliedFixes,
					errors: enhancementResult.errors,
					nextSteps: enhancementResult.nextSteps,
					message: enhancementResult.success ? 
						"Project enhanced successfully!" : 
						"Some enhancements failed. Check errors for details."
				}, null, 2)
			}]
		};
	}

	// Enhanced methods for prompt integration
	private async retrieveComponentsEnhanced(
		name?: string, 
		platform?: string, 
		category?: string, 
		variant?: string, 
		enhancedPrompt?: any
	): Promise<any> {
		// Enhanced component retrieval with prompt context
		const baseComponents = await this.retrieveComponents(name, platform, category, variant);
		
		return {
			...baseComponents,
			enhancedContext: {
				promptGuidance: enhancedPrompt?.messages?.[0]?.content?.text || '',
				analysisDepth: 'enhanced',
				recommendations: this.generateComponentRecommendations(baseComponents, { name, platform, category, variant })
			}
		};
	}

	private generateComponentRecommendations(components: any, args: any): string[] {
		return [
			`Consider using ${args.platform || 'React'} best practices for component composition`,
			`Ensure accessibility compliance with WCAG 2.1 AA standards`,
			`Implement proper TypeScript types for better development experience`,
			`Add responsive design patterns for mobile compatibility`,
			`Consider performance optimizations like lazy loading`
		];
	}

	private async generateComponentEnhanced(args: GenerateComponentArgs, enhancedPrompt: any): Promise<string> {
		// Enhanced component generation with prompt guidance
		const baseComponent = await this.generateNewComponent(
			args.name, 
			args.platform, 
			args.description, 
			args.baseComponents, 
			args.variant, 
			args.features
		);
		
		return `// Enhanced ${args.name} Component\n// Generated with prompt guidance\n// Platform: ${args.platform}\n\n${baseComponent}`;
	}

	private generateUsageExamples(componentName: string, platform: string): string[] {
		return [
			`// Basic usage\n<${componentName} />`,
			`// With props\n<${componentName} variant="primary" size="large" />`,
			`// With children\n<${componentName}>\n  <span>Content</span>\n</${componentName}>`,
			`// ${platform} specific patterns\n// Add platform-specific examples here`
		];
	}

	private generateTestingSuggestions(componentName: string, features?: string[]): string[] {
		return [
			`Test ${componentName} renders correctly with default props`,
			`Test all component variants and states`,
			`Test accessibility with screen readers`,
			`Test responsive behavior across breakpoints`,
			...(features?.map(feature => `Test ${feature} functionality`) || [])
		];
	}

	private inferPageType(name: string, description?: string): string {
		const nameLower = name.toLowerCase();
		const descLower = description?.toLowerCase() || '';
		
		if (nameLower.includes('dashboard') || descLower.includes('dashboard')) return 'dashboard';
		if (nameLower.includes('profile') || descLower.includes('profile')) return 'profile';
		if (nameLower.includes('settings') || descLower.includes('settings')) return 'settings';
		if (nameLower.includes('auth') || nameLower.includes('login') || descLower.includes('auth')) return 'auth';
		if (nameLower.includes('admin') || descLower.includes('admin')) return 'admin';
		if (nameLower.includes('landing') || descLower.includes('landing')) return 'landing';
		
		return 'custom';
	}

	private async generatePageEnhanced(args: GeneratePageArgs, enhancedPrompt: any): Promise<string> {
		// Enhanced page generation with prompt guidance
		const basePage = await this.generateNewPage(
			args.name, 
			args.platform, 
			args.description, 
			args.layout, 
			args.components, 
			args.routing
		);
		
		return `// Enhanced ${args.name} Page\n// Generated with prompt guidance\n// Platform: ${args.platform}\n\n${basePage}`;
	}

	private generatePageArchitecture(pageName: string, platform: string): any {
		return {
			pageName,
			platform,
			architecture: {
				componentHierarchy: [
					'Layout',
					'Header',
					'Navigation',
					'Main Content',
					'Footer'
				],
				stateManagement: platform === 'svelte' ? 'Svelte stores/runes' : 'React hooks/context',
				routing: platform === 'nextjs' ? 'Next.js App Router' : 'React Router',
				styling: 'Tailwind CSS with design tokens'
			},
			bestPractices: [
				'Implement proper SEO meta tags',
				'Add loading states and error boundaries',
				'Ensure responsive design',
				'Implement accessibility features'
			]
		};
	}

	private generatePerformanceGuidance(platform: string): any {
		return {
			platform,
			optimizations: [
				'Implement code splitting and lazy loading',
				'Optimize images with next/image or similar',
				'Use proper caching strategies',
				'Minimize bundle size with tree shaking',
				platform === 'svelte' ? 'Leverage Svelte\'s compile-time optimizations' : 'Use React.memo and useMemo appropriately'
			],
			metrics: {
				targetLCP: '< 2.5s',
				targetFID: '< 100ms',
				targetCLS: '< 0.1'
			},
			tools: [
				'Lighthouse for performance auditing',
				'Web Vitals for monitoring',
				'Bundle analyzer for size optimization'
			]
		};
	}

	// Enhanced compliance and analysis methods
	private async validateNorwegianComplianceEnhanced(
		code: string, 
		platform: string, 
		type?: string, 
		strictMode?: boolean, 
		enhancedPrompt?: any
	): Promise<any> {
		// Enhanced Norwegian compliance validation with prompt context
		const baseValidation = await this.validateNorwegianCompliance(code, platform, type || 'general', strictMode);
		
		return {
			...baseValidation,
			enhancedContext: {
				promptGuidance: enhancedPrompt?.messages?.[0]?.content?.text || '',
				validationDepth: strictMode ? 'strict' : 'standard',
				regulatory: {
					nsm: 'Norwegian Security Authority compliance',
					gdpr: 'GDPR compliance for Norwegian context',
					accessibility: 'Norwegian accessibility standards'
				}
			}
		};
	}

	private async analyzeCodeEnhanced(
		code: string, 
		platform: string, 
		analysisType: string, 
		detailLevel?: string, 
		enhancedPrompt?: any
	): Promise<any> {
		// Enhanced code analysis with prompt context
		const baseAnalysis = await this.analyzeCode(code, platform, analysisType, detailLevel);
		
		return {
			...baseAnalysis,
			enhancedContext: {
				promptGuidance: enhancedPrompt?.messages?.[0]?.content?.text || '',
				analysisDepth: detailLevel || 'standard',
				insights: this.generateAnalysisInsights(analysisType, platform),
				actionableItems: this.generateActionableItems(baseAnalysis)
			}
		};
	}

	private generateCodeImprovements(analysis: any, platform: string): string[] {
		return [
			`Optimize ${platform} specific patterns for better performance`,
			'Implement comprehensive error handling and validation',
			'Add proper TypeScript types and interfaces',
			'Ensure accessibility compliance with WCAG 2.1 AA',
			'Follow security best practices for data handling',
			'Implement proper testing coverage and documentation'
		];
	}

	private generateAnalysisInsights(analysisType: string, platform: string): string[] {
		return [
			`${analysisType} analysis for ${platform} platform`,
			'Code quality metrics and recommendations',
			'Performance optimization opportunities',
			'Security vulnerability assessment',
			'Accessibility compliance evaluation'
		];
	}

	private generateActionableItems(analysis: any): string[] {
		return [
			'Review and fix identified code quality issues',
			'Implement suggested performance optimizations',
			'Address security vulnerabilities and risks',
			'Improve accessibility compliance',
			'Update documentation and add missing tests'
		];
	}
}
