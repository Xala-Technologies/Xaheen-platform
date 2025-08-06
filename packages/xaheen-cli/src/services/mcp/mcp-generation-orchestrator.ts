/**
 * @fileoverview MCP Generation Orchestrator - EPIC 14 Story 14.2 & 14.3
 * @description Intelligent generation orchestrator that bridges xaheen CLI with xala-mcp recommendations
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { mcpClientService } from "./mcp-client.service";

// Schemas for MCP orchestration
const GenerationRequestSchema = z.object({
	type: z.enum([
		"component",
		"service",
		"page",
		"layout",
		"form",
		"data-table",
		"navigation",
		"scaffold",
	]),
	name: z.string().min(1),
	description: z.string().optional(),
	options: z.record(z.any()).optional(),
	platform: z.enum(["react", "nextjs", "vue", "angular", "svelte", "electron", "react-native"]).optional(),
	aiEnhancement: z.boolean().default(false),
});

const MCPRecommendationSchema = z.object({
	templateId: z.string(),
	confidence: z.number().min(0).max(1),
	reason: z.string(),
	suggestedOptions: z.record(z.any()).optional(),
	platformSpecific: z.boolean().default(false),
	aiGenerated: z.boolean().default(false),
});

const GenerationResultSchema = z.object({
	success: z.boolean(),
	files: z.array(z.string()),
	message: z.string(),
	warnings: z.array(z.string()).optional(),
	recommendations: z.array(z.string()).optional(),
	nextSteps: z.array(z.string()).optional(),
	mcpMetadata: z.object({
		templateUsed: z.string(),
		aiEnhanced: z.boolean(),
		generationTime: z.number(),
		confidence: z.number(),
	}),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type MCPRecommendation = z.infer<typeof MCPRecommendationSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;

/**
 * MCP Generation Orchestrator
 * Bridges xaheen CLI generators with xala-mcp intelligent recommendations
 */
export class MCPGenerationOrchestrator {
	private isInitialized = false;
	private readonly mcpFunctions: Map<string, Function> = new Map();

	constructor(
		private readonly projectRoot: string = process.cwd(),
	) {
		this.initializeMCPFunctions();
	}

	/**
	 * Initialize the orchestrator with MCP client
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			logger.info("🎼 Initializing MCP Generation Orchestrator...");

			// Initialize MCP client service
			await mcpClientService.initialize(this.projectRoot);

			// Load project context for intelligent recommendations
			await mcpClientService.loadProjectContext(this.projectRoot);

			this.isInitialized = true;
			logger.success("✅ MCP Generation Orchestrator initialized");
		} catch (error) {
			logger.error("Failed to initialize MCP Generation Orchestrator:", error);
			throw new Error(`Orchestrator initialization failed: ${error.message}`);
		}
	}

	/**
	 * Generate component with MCP intelligence
	 */
	async generateComponent(request: GenerationRequest): Promise<GenerationResult> {
		await this.ensureInitialized();
		
		const startTime = Date.now();
		
		try {
			logger.info(`🎨 Generating component: ${request.name}`);

			// Get MCP recommendations for component generation
			const recommendation = await this.getMCPRecommendation(request);
			
			// Use MCP to generate component code
			const mcpResult = await this.callMCPFunction("mcp__xala-mcp__generate", {
				type: "component",
				name: request.name,
				platform: request.platform || "react",
				category: "components",
				config: {
					...request.options,
					...recommendation.suggestedOptions,
				},
				options: {
					includeDocs: true,
					includeTests: true,
					includeStories: true,
					overwrite: false,
				},
			});

			// Enhance with AI if requested
			let enhancedResult = mcpResult;
			if (request.aiEnhancement && request.description) {
				enhancedResult = await this.enhanceWithAI(mcpResult, request.description);
			}

			// Generate files in the project structure
			const files = await this.writeGeneratedFiles(enhancedResult, request);

			const generationTime = Date.now() - startTime;

			return GenerationResultSchema.parse({
				success: true,
				files,
				message: `Component ${request.name} generated successfully using MCP intelligence`,
				recommendations: [
					`Template used: ${recommendation.templateId}`,
					`Confidence: ${Math.round(recommendation.confidence * 100)}%`,
					"Consider adding unit tests for edge cases",
					"Review accessibility compliance",
				],
				nextSteps: [
					"Import component in your page",
					"Add component to Storybook",
					"Run tests to ensure functionality",
				],
				mcpMetadata: {
					templateUsed: recommendation.templateId,
					aiEnhanced: request.aiEnhancement,
					generationTime,
					confidence: recommendation.confidence,
				},
			});
		} catch (error) {
			logger.error("Component generation failed:", error);
			return {
				success: false,
				files: [],
				message: `Failed to generate component: ${error.message}`,
				mcpMetadata: {
					templateUsed: "none",
					aiEnhanced: false,
					generationTime: Date.now() - startTime,
					confidence: 0,
				},
			};
		}
	}

	/**
	 * Generate service with MCP intelligence
	 */
	async generateService(request: GenerationRequest): Promise<GenerationResult> {
		await this.ensureInitialized();
		
		const startTime = Date.now();
		
		try {
			logger.info(`⚙️ Generating service: ${request.name}`);

			// Get project context for service generation
			const projectContext = mcpClientService.getProjectContext();
			const framework = projectContext?.framework || "express";

			// Use MCP to generate service boilerplate
			const mcpResult = await this.callMCPFunction("mcp__xala-mcp__generate", {
				type: "project",
				name: request.name,
				projectType: "web-app",
				features: [
					"service-layer",
					"dependency-injection",
					"error-handling",
					"logging",
					"validation",
					...(request.options?.features || []),
				],
				theme: "enterprise",
				config: {
					framework,
					typescript: true,
					testing: true,
					...request.options,
				},
			});

			// Enhance service with AI-generated business logic
			let enhancedResult = mcpResult;
			if (request.aiEnhancement && request.description) {
				enhancedResult = await this.enhanceServiceWithAI(mcpResult, request.description);
			}

			// Generate service files
			const files = await this.writeServiceFiles(enhancedResult, request);

			const generationTime = Date.now() - startTime;

			return GenerationResultSchema.parse({
				success: true,
				files,
				message: `Service ${request.name} generated successfully with MCP intelligence`,
				recommendations: [
					"Implement proper error handling",
					"Add comprehensive logging",
					"Consider caching strategies",
					"Review security implications",
				],
				nextSteps: [
					"Implement business logic methods",
					"Add unit tests for service methods",
					"Configure dependency injection",
					"Add service to controller/router",
				],
				mcpMetadata: {
					templateUsed: "enterprise-service",
					aiEnhanced: request.aiEnhancement,
					generationTime,
					confidence: 0.85,
				},
			});
		} catch (error) {
			logger.error("Service generation failed:", error);
			return {
				success: false,
				files: [],
				message: `Failed to generate service: ${error.message}`,
				mcpMetadata: {
					templateUsed: "none",
					aiEnhanced: false,
					generationTime: Date.now() - startTime,
					confidence: 0,
				},
			};
		}
	}

	/**
	 * Enhance generated code with AI
	 */
	async enhanceCode(
		generatedCode: string,
		enhancementRequest: string,
		codeType: "component" | "service" | "other" = "other"
	): Promise<string> {
		await this.ensureInitialized();

		try {
			logger.info("🤖 Enhancing code with AI...");

			// Use MCP to enhance the code
			const enhancedResult = await this.callMCPFunction("mcp__xala-mcp__generate", {
				type: "component", // Use component type for code enhancement
				name: "enhanced-code",
				platform: "react",
				category: "tools",
				config: {
					originalCode: generatedCode,
					enhancementRequest,
					codeType,
					features: {
						aiEnhanced: true,
						optimization: true,
						bestPractices: true,
					},
				},
			});

			logger.success("✅ Code enhanced successfully");
			return enhancedResult.componentCode || generatedCode;
		} catch (error) {
			logger.warn("AI enhancement failed, returning original code:", error);
			return generatedCode;
		}
	}

	/**
	 * Get intelligent template recommendations from MCP
	 */
	private async getMCPRecommendation(request: GenerationRequest): Promise<MCPRecommendation> {
		try {
			// Get project context
			const projectContext = mcpClientService.getProjectContext();
			const contextItems = mcpClientService.getContextItems();

			// Use MCP to get template recommendations
			const platformRecommendation = await this.callMCPFunction(
				"mcp__xala-mcp__get_platform_recommendations",
				{ platform: request.platform || "react" }
			);

			// Analyze project structure for context-aware recommendations
			const contextualRecommendation = this.analyzeProjectContext(request, contextItems);

			return MCPRecommendationSchema.parse({
				templateId: `${request.type}-${request.platform || "react"}`,
				confidence: 0.85,
				reason: "Based on project structure and platform best practices",
				suggestedOptions: {
					...platformRecommendation.defaultConfig,
					...contextualRecommendation,
				},
				platformSpecific: true,
				aiGenerated: false,
			});
		} catch (error) {
			logger.warn("Failed to get MCP recommendation, using defaults:", error);
			return {
				templateId: `default-${request.type}`,
				confidence: 0.5,
				reason: "Default template due to recommendation failure",
				suggestedOptions: {},
				platformSpecific: false,
				aiGenerated: false,
			};
		}
	}

	/**
	 * Analyze project context for contextual recommendations
	 */
	private analyzeProjectContext(request: GenerationRequest, contextItems: any[]): Record<string, any> {
		const recommendations: Record<string, any> = {};

		// Analyze existing components for patterns
		const componentFiles = contextItems.filter(item => 
			item.type === "component" || 
			item.path.includes("/components/")
		);

		if (componentFiles.length > 0) {
			// Detect common patterns
			const hasStorybook = contextItems.some(item => item.path.includes(".stories."));
			const hasTests = contextItems.some(item => item.path.includes(".test.") || item.path.includes(".spec."));
			const hasTailwind = contextItems.some(item => 
				item.content?.includes("tailwindcss") || 
				item.content?.includes("className")
			);

			recommendations.stories = hasStorybook;
			recommendations.tests = hasTests;
			recommendations.styling = hasTailwind ? "tailwind" : "css-modules";
		}

		// Detect framework-specific patterns
		if (request.platform === "nextjs") {
			const hasAppRouter = contextItems.some(item => item.path.includes("/app/"));
			recommendations.appRouter = hasAppRouter;
		}

		return recommendations;
	}

	/**
	 * Enhance component with AI-generated content
	 */
	private async enhanceWithAI(mcpResult: any, description: string): Promise<any> {
		try {
			const enhancedResult = await this.callMCPFunction("mcp__xala-mcp__generate", {
				type: "component",
				name: "ai-enhanced",
				platform: "react",
				category: "components",
				config: {
					originalResult: mcpResult,
					aiDescription: description,
					features: {
						aiEnhanced: true,
						smartDefaults: true,
						contextualContent: true,
					},
				},
			});

			return {
				...mcpResult,
				componentCode: enhancedResult.componentCode || mcpResult.componentCode,
				typesCode: enhancedResult.typesCode || mcpResult.typesCode,
				aiEnhanced: true,
			};
		} catch (error) {
			logger.warn("AI enhancement failed:", error);
			return mcpResult;
		}
	}

	/**
	 * Enhance service with AI-generated business logic
	 */
	private async enhanceServiceWithAI(mcpResult: any, description: string): Promise<any> {
		try {
			const enhancedResult = await this.callMCPFunction("mcp__xala-mcp__generate", {
				type: "project",
				name: "ai-enhanced-service",
				projectType: "web-app",
				features: ["ai-enhanced", "service-layer"],
				config: {
					originalResult: mcpResult,
					aiDescription: description,
					serviceType: "business-logic",
				},
			});

			return {
				...mcpResult,
				serviceCode: enhancedResult.serviceCode || mcpResult.serviceCode,
				aiEnhanced: true,
			};
		} catch (error) {
			logger.warn("Service AI enhancement failed:", error);
			return mcpResult;
		}
	}

	/**
	 * Write generated component files to the project
	 */
	private async writeGeneratedFiles(mcpResult: any, request: GenerationRequest): Promise<string[]> {
		const files: string[] = [];

		try {
			// Component file
			if (mcpResult.componentCode) {
				const extension = request.platform === "vue" ? ".vue" : ".tsx";
				const componentPath = join(this.projectRoot, "src", "components", `${request.name}${extension}`);
				
				await this.ensureDirectoryExists(join(this.projectRoot, "src", "components"));
				await fs.writeFile(componentPath, mcpResult.componentCode);
				files.push(componentPath);
			}

			// Types file
			if (mcpResult.typesCode) {
				const typesPath = join(this.projectRoot, "src", "types", `${request.name}.types.ts`);
				
				await this.ensureDirectoryExists(join(this.projectRoot, "src", "types"));
				await fs.writeFile(typesPath, mcpResult.typesCode);
				files.push(typesPath);
			}

			// Stories file
			if (mcpResult.storiesCode || request.options?.stories) {
				const storiesPath = join(this.projectRoot, "src", "components", `${request.name}.stories.tsx`);
				const storiesContent = mcpResult.storiesCode || this.generateDefaultStories(request.name);
				
				await fs.writeFile(storiesPath, storiesContent);
				files.push(storiesPath);
			}

			// Test file
			if (mcpResult.testCode || request.options?.tests) {
				const testPath = join(this.projectRoot, "src", "components", "__tests__", `${request.name}.test.tsx`);
				const testContent = mcpResult.testCode || this.generateDefaultTest(request.name);
				
				await this.ensureDirectoryExists(join(this.projectRoot, "src", "components", "__tests__"));
				await fs.writeFile(testPath, testContent);
				files.push(testPath);
			}

			logger.success(`Generated ${files.length} files`);
			return files;
		} catch (error) {
			logger.error("Failed to write generated files:", error);
			throw error;
		}
	}

	/**
	 * Write generated service files to the project
	 */
	private async writeServiceFiles(mcpResult: any, request: GenerationRequest): Promise<string[]> {
		const files: string[] = [];

		try {
			// Service implementation
			if (mcpResult.serviceCode) {
				const servicePath = join(this.projectRoot, "src", "services", `${request.name}.service.ts`);
				
				await this.ensureDirectoryExists(join(this.projectRoot, "src", "services"));
				await fs.writeFile(servicePath, mcpResult.serviceCode);
				files.push(servicePath);
			}

			// Service interface
			if (mcpResult.interfaceCode) {
				const interfacePath = join(this.projectRoot, "src", "interfaces", `${request.name}.interface.ts`);
				
				await this.ensureDirectoryExists(join(this.projectRoot, "src", "interfaces"));
				await fs.writeFile(interfacePath, mcpResult.interfaceCode);
				files.push(interfacePath);
			}

			// Service tests
			if (mcpResult.testCode || request.options?.tests) {
				const testPath = join(this.projectRoot, "src", "services", "__tests__", `${request.name}.service.test.ts`);
				const testContent = mcpResult.testCode || this.generateDefaultServiceTest(request.name);
				
				await this.ensureDirectoryExists(join(this.projectRoot, "src", "services", "__tests__"));
				await fs.writeFile(testPath, testContent);
				files.push(testPath);
			}

			logger.success(`Generated ${files.length} service files`);
			return files;
		} catch (error) {
			logger.error("Failed to write service files:", error);
			throw error;
		}
	}

	/**
	 * Initialize MCP function mappings
	 */
	private initializeMCPFunctions(): void {
		// Map MCP function names to their implementations
		// These would connect to the actual xala-mcp package functions
		this.mcpFunctions.set("mcp__xala-mcp__generate", this.mockMCPGenerate.bind(this));
		this.mcpFunctions.set("mcp__xala-mcp__get_platform_recommendations", this.mockGetPlatformRecommendations.bind(this));
	}

	/**
	 * Call MCP function with fallback handling
	 */
	private async callMCPFunction(functionName: string, args: any): Promise<any> {
		const mcpFunction = this.mcpFunctions.get(functionName);
		
		if (!mcpFunction) {
			logger.warn(`MCP function ${functionName} not found, using fallback`);
			return this.getFallbackResult(functionName, args);
		}

		try {
			return await mcpFunction(args);
		} catch (error) {
			logger.warn(`MCP function ${functionName} failed, using fallback:`, error);
			return this.getFallbackResult(functionName, args);
		}
	}

	/**
	 * Mock MCP generate function (would be replaced with actual MCP integration)
	 */
	private async mockMCPGenerate(args: any): Promise<any> {
		// This is a mock implementation
		// In the real implementation, this would call the actual xala-mcp functions
		return {
			componentCode: this.generateMockComponent(args.name, args.platform),
			typesCode: this.generateMockTypes(args.name),
			storiesCode: this.generateMockStories(args.name),
			testCode: this.generateMockTest(args.name),
			files: [],
			dependencies: [],
		};
	}

	/**
	 * Mock platform recommendations function
	 */
	private async mockGetPlatformRecommendations(args: any): Promise<any> {
		const platformDefaults = {
			react: { typescript: true, hooks: true, stories: true },
			nextjs: { appRouter: true, serverComponents: true },
			vue: { compositionApi: true, scriptSetup: true },
			angular: { standaloneComponents: true },
			svelte: { svelteKit: true },
		};

		return {
			defaultConfig: platformDefaults[args.platform] || platformDefaults.react,
			bestPractices: [`Use ${args.platform} best practices`],
		};
	}

	/**
	 * Generate fallback results when MCP functions fail
	 */
	private getFallbackResult(functionName: string, args: any): any {
		logger.info(`Using fallback for ${functionName}`);
		
		switch (functionName) {
			case "mcp__xala-mcp__generate":
				return {
					componentCode: this.generateMockComponent(args.name, args.platform),
					typesCode: this.generateMockTypes(args.name),
				};
			case "mcp__xala-mcp__get_platform_recommendations":
				return { defaultConfig: { typescript: true, tests: true } };
			default:
				return {};
		}
	}

	/**
	 * Utility methods for mock generation
	 */
	private generateMockComponent(name: string, platform: string = "react"): string {
		return `// Generated ${name} component for ${platform}
import React from 'react';

interface ${name}Props {
  readonly className?: string;
}

export const ${name} = ({ className }: ${name}Props): JSX.Element => {
  return (
    <div className={className}>
      <h2>${name} Component</h2>
      <p>Generated with MCP intelligence</p>
    </div>
  );
};
`;
	}

	private generateMockTypes(name: string): string {
		return `// Types for ${name}
export interface ${name}Props {
  readonly className?: string;
}
`;
	}

	private generateDefaultStories(name: string): string {
		return `// Storybook stories for ${name}
import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;
	}

	private generateDefaultTest(name: string): string {
		return `// Tests for ${name}
import { render, screen } from '@testing-library/react';
import { ${name} } from '../${name}';

describe('${name}', () => {
  it('renders successfully', () => {
    render(<${name} />);
    expect(screen.getByText('${name} Component')).toBeInTheDocument();
  });
});
`;
	}

	private generateDefaultServiceTest(name: string): string {
		return `// Tests for ${name}Service
import { ${name}Service } from '../${name}.service';

describe('${name}Service', () => {
  let service: ${name}Service;

  beforeEach(() => {
    service = new ${name}Service();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
`;
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await fs.access(dirPath);
		} catch {
			await fs.mkdir(dirPath, { recursive: true });
		}
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize();
		}
	}
}

/**
 * Create singleton orchestrator instance
 */
export const mcpGenerationOrchestrator = new MCPGenerationOrchestrator();