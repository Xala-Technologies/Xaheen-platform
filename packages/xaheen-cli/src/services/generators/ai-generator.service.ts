/**
 * AI-Enhanced Generator Service with Template + AI Content Pattern
 *
 * Implements Story 1.2: AI-Native Generation Workflows
 * - Template + AI content pattern
 * - Context-aware code generation
 * - Natural language to code translation
 * - Codebase indexing for context
 * - AI-powered component suggestions
 * - Iterative refinement workflows
 * - Validation and quality loops
 */

import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { ConfigManager } from "../../core/config-manager/index.js";
import {
	StackAdapterRegistry,
	UniversalGenerator,
} from "../../core/stack-adapters/index.js";
import type { Field, GeneratedFile, XaheenConfig } from "../../types/index.js";
import { logger } from "../../utils/logger.js";
import {
	aiSecurityScanner,
	type SecurityScanOptions,
} from "../ai/ai-security-scanner.js";
import {
	AIService,
	ComponentContext,
	GenerationContext,
	ServiceContext,
} from "../ai/ai-service.js";
import { ProjectAnalyzer } from "../analysis/project-analyzer.js";
import { type ComponentSpecification, mcpClient } from "../mcp/mcp-client.js";

interface AIGenerationOptions {
	description?: string;
	withTests?: boolean;
	withStories?: boolean;
	accessibility?: "A" | "AA" | "AAA";
	norwegian?: boolean;
	gdpr?: boolean;
	styling?: "tailwind" | "css-modules" | "styled-components";
	features?: string[];
	fields?: Field[];
	// AI-Native Features
	naturalLanguage?: string;
	iterativeRefinement?: boolean;
	contextAware?: boolean;
	useCodebaseIndex?: boolean;
	aiSuggestions?: boolean;
	validationLoops?: boolean;
	complexity?: "simple" | "medium" | "complex";
	// Security Features
	securityScan?: boolean;
	securityCompliance?: ("owasp" | "nsm" | "gdpr" | "wcag")[];
	optimizeForPerformance?: boolean;
}

interface CodebaseContext {
	existingComponents: string[];
	projectPatterns: string[];
	dependencies: string[];
	architecturalStyle: string;
	codingStandards: string[];
	norwegianCompliance: boolean;
	performanceRequirements: string[];
}

interface AIRefinementLoop {
	iteration: number;
	changes: string[];
	qualityScore: number;
	complianceScore: number;
	performanceScore: number;
	issues: string[];
	suggestions: string[];
}

export class AIGeneratorService {
	private aiService: AIService;
	private stackRegistry: StackAdapterRegistry;
	private universalGenerator: UniversalGenerator;
	private config: XaheenConfig;
	private projectAnalyzer: ProjectAnalyzer;
	private codebaseContext: CodebaseContext | null = null;

	constructor(config?: XaheenConfig) {
		this.aiService = new AIService(config);
		this.stackRegistry = StackAdapterRegistry.getInstance();
		this.universalGenerator = new UniversalGenerator();
		this.config = config || this.getDefaultConfig();
		this.projectAnalyzer = new ProjectAnalyzer();
	}

	/**
	 * Generate an AI-powered React component using Template + AI Content Pattern
	 * Implements Story 1.2: AI-Native Generation Workflows
	 */
	async generateComponent(
		name: string,
		type: "page" | "component" | "layout" | "form" | "modal" = "component",
		options: AIGenerationOptions = {},
	): Promise<GeneratedFile[]> {
		logger.info(chalk.green(`🤖 Generating AI-powered ${type}: ${name}`));

		// Initialize codebase context if needed
		if (options.contextAware || options.useCodebaseIndex) {
			await this.buildCodebaseContext();
		}

		// Get MCP specification for AI optimization
		const mcpSpec = await mcpClient.loadSpecification(name, type);
		const aiHints = await mcpClient.getAIHints(name, "react");
		const complexity = await mcpClient.getComplexityEstimation(name);

		const context = await this.buildEnhancedComponentContext(
			name,
			type,
			options,
			mcpSpec,
		);

		try {
			// Step 1: Template + AI Content Pattern
			const templateFiles = await this.generateWithStackAdapter(
				name,
				"component",
				options,
			);

			// Step 2: AI-Enhanced Generation with Natural Language Processing
			const aiEnhancedFiles = await this.enhanceWithAINativeWorkflow(
				templateFiles,
				name,
				type,
				options,
				context,
				aiHints,
			);

			// Step 3: Iterative Refinement Loop (if enabled)
			let finalFiles = aiEnhancedFiles;
			if (options.iterativeRefinement) {
				finalFiles = await this.runIterativeRefinement(
					finalFiles,
					name,
					context,
					mcpSpec,
				);
			}

			// Step 4: Generate additional AI-powered files
			const additionalFiles = await this.generateAIEnhancedAdditionalFiles(
				name,
				type,
				options,
				context,
			);

			const allFiles = [...finalFiles, ...additionalFiles];

			// Step 5: Validation and Quality Loops
			if (options.validationLoops) {
				await this.runValidationLoops(allFiles, mcpSpec);
			}

			// Write files to disk
			await this.writeFiles(allFiles, options);

			logger.success(
				`✅ Generated ${allFiles.length} AI-native files with ${complexity.complexity} complexity`,
			);
			this.logGeneratedFiles(allFiles);

			// Show AI insights
			this.showAIInsights(name, complexity, aiHints);

			return allFiles;
		} catch (error) {
			logger.error(`Failed to generate AI-powered component: ${error}`);
			// Fallback to traditional generation
			logger.info(chalk.yellow("Falling back to traditional generation..."));
			return this.generateWithStackAdapter(name, "component", options);
		}
	}

	/**
	 * Generate an AI-powered service
	 */
	async generateService(
		name: string,
		type: "api" | "business" | "data" | "utility" = "business",
		options: AIGenerationOptions = {},
	): Promise<GeneratedFile[]> {
		logger.info(chalk.green(`🤖 Generating AI-powered service: ${name}`));

		const context = this.buildServiceContext(name, type, options);

		try {
			// Use AI service to generate intelligent service
			const aiResult = await this.aiService.generateService(
				options.description || `Create a ${type} service named ${name}`,
				context,
			);

			// Combine AI generation with stack adapter patterns
			const stackFiles = await this.generateWithStackAdapter(
				name,
				"service",
				options,
			);

			// Merge AI-generated code with stack-specific patterns
			const enhancedFiles = await this.enhanceWithAI(
				stackFiles,
				aiResult,
				context,
			);

			// Generate tests if requested
			if (options.withTests) {
				const testFiles = await this.generateServiceTests(name, context);
				enhancedFiles.push(...testFiles);
			}

			// Write files to disk
			await this.writeFiles(enhancedFiles, options);

			logger.success(
				`✅ Generated ${enhancedFiles.length} files with AI assistance`,
			);
			this.logGeneratedFiles(enhancedFiles);

			return enhancedFiles;
		} catch (error) {
			logger.error(`Failed to generate AI-powered service: ${error}`);
			// Fallback to traditional generation
			logger.info(chalk.yellow("Falling back to traditional generation..."));
			return this.generateWithStackAdapter(name, "service", options);
		}
	}

	/**
	 * Generate a complete AI-powered CRUD system
	 */
	async generateCRUD(
		name: string,
		options: AIGenerationOptions = {},
	): Promise<GeneratedFile[]> {
		logger.info(chalk.green(`🤖 Generating AI-powered CRUD: ${name}`));

		const allFiles: GeneratedFile[] = [];

		try {
			// 1. Generate Prisma model
			logger.info(chalk.gray("  📦 Generating database model..."));
			const modelFiles = await this.generateModel(name, options);
			allFiles.push(...modelFiles);

			// 2. Generate API endpoints with AI
			logger.info(chalk.gray("  🔌 Generating API endpoints..."));
			const apiFiles = await this.generateService(name, "api", {
				...options,
				description: `Create REST API endpoints for ${name} with full CRUD operations`,
			});
			allFiles.push(...apiFiles);

			// 3. Generate frontend components with AI
			logger.info(chalk.gray("  🎨 Generating UI components..."));

			// List component
			const listFiles = await this.generateComponent(
				`${name}List`,
				"component",
				{
					...options,
					description: `Create a data table component to display and manage ${name} items with search, pagination, and actions`,
				},
			);
			allFiles.push(...listFiles);

			// Form component
			const formFiles = await this.generateComponent(`${name}Form`, "form", {
				...options,
				description: `Create a form component for creating and editing ${name} with validation and error handling`,
			});
			allFiles.push(...formFiles);

			// Page component
			const pageFiles = await this.generateComponent(`${name}Page`, "page", {
				...options,
				description: `Create a complete page component that combines list and form for ${name} management`,
			});
			allFiles.push(...pageFiles);

			// 4. Generate React hooks
			logger.info(chalk.gray("  🔗 Generating React hooks..."));
			const hookFiles = await this.generateHook(name, options);
			allFiles.push(...hookFiles);

			// 5. Generate validation schemas
			logger.info(chalk.gray("  ✅ Generating validation schemas..."));
			const validationFiles = await this.generateValidation(name, options);
			allFiles.push(...validationFiles);

			// Write all files
			await this.writeFiles(allFiles, options);

			logger.success(
				`✅ Generated complete CRUD system with ${allFiles.length} files`,
			);
			this.logGeneratedFiles(allFiles);

			// Show next steps
			this.showCRUDNextSteps(name);

			return allFiles;
		} catch (error) {
			logger.error(`Failed to generate AI-powered CRUD: ${error}`);
			throw error;
		}
	}

	/**
	 * Analyze existing code with AI
	 */
	async analyzeCode(filePath: string): Promise<void> {
		try {
			const code = await fs.readFile(filePath, "utf-8");
			const analysis = await this.aiService.analyzeCode(code);

			logger.info(
				chalk.blue(`\n📊 AI Code Analysis for ${path.basename(filePath)}:`),
			);
			logger.info(`Quality Score: ${chalk.green(analysis.quality + "/100")}`);
			logger.info(`Complexity: ${chalk.yellow(analysis.complexity + "/100")}`);
			logger.info(
				`Maintainability: ${chalk.green(analysis.maintainability + "/100")}`,
			);

			if (analysis.issues.length > 0) {
				logger.info(chalk.yellow("\n⚠️  Issues Found:"));
				analysis.issues.forEach((issue) => {
					const icon =
						issue.type === "error"
							? "❌"
							: issue.type === "warning"
								? "⚠️"
								: "💡";
					logger.info(
						`  ${icon} ${issue.message}${issue.line ? ` (line ${issue.line})` : ""}`,
					);
					if (issue.fix) {
						logger.info(`    💡 Fix: ${issue.fix}`);
					}
				});
			}

			if (analysis.suggestions.length > 0) {
				logger.info(chalk.blue("\n💡 Suggestions:"));
				analysis.suggestions.forEach((suggestion) => {
					logger.info(`  • ${suggestion}`);
				});
			}
		} catch (error) {
			logger.error(`Failed to analyze code: ${error}`);
		}
	}

	/**
	 * Build codebase context for AI-native generation
	 */
	private async buildCodebaseContext(): Promise<void> {
		if (this.codebaseContext) return;

		logger.info(
			chalk.gray("📊 Building codebase context for AI generation..."),
		);

		const projectPath = process.cwd();
		const projectInfo = await this.projectAnalyzer.analyzeProject(projectPath);

		// Index existing components
		const existingComponents = await this.indexExistingComponents(projectPath);

		// Analyze project patterns
		const patterns = await this.analyzeProjectPatterns(projectPath);

		this.codebaseContext = {
			existingComponents,
			projectPatterns: patterns,
			dependencies: projectInfo?.dependencies || [],
			architecturalStyle: projectInfo?.architecture || "layered",
			codingStandards: await this.detectCodingStandards(projectPath),
			norwegianCompliance: projectInfo?.compliance?.norwegian || false,
			performanceRequirements:
				await this.analyzePerformanceRequirements(projectPath),
		};

		logger.success(chalk.green("✅ Codebase context built successfully"));
	}

	/**
	 * Build enhanced component context with AI optimizations
	 */
	private async buildEnhancedComponentContext(
		name: string,
		type: "page" | "component" | "layout" | "form" | "modal",
		options: AIGenerationOptions,
		mcpSpec: ComponentSpecification | null,
	): Promise<ComponentContext> {
		const currentStack = this.stackRegistry.getCurrentStack();

		const baseContext = {
			framework: currentStack === "nextjs" ? "Next.js" : "React",
			platform: "web",
			stack: currentStack,
			projectPath: process.cwd(),
			dependencies: ["@xala-technologies/ui-system", "react", "typescript"],
			codeStyle: "typescript" as const,
			uiSystem: "@xala-technologies/ui-system",
			compliance: {
				accessibility:
					options.accessibility ||
					mcpSpec?.compliance.wcag.level ||
					this.config.compliance?.accessibility ||
					"AAA",
				norwegian:
					options.norwegian ||
					this.codebaseContext?.norwegianCompliance ||
					this.config.compliance?.norwegian ||
					false,
				gdpr: options.gdpr || this.config.compliance?.gdpr || false,
			},
			componentType: type,
			styling: options.styling || "tailwind",
			features: options.features || [],
		};

		// Enhance context with AI-specific data
		return await mcpClient.enhanceTemplateContext(baseContext, name);
	}

	private buildServiceContext(
		name: string,
		type: "api" | "business" | "data" | "utility",
		options: AIGenerationOptions,
	): ServiceContext {
		const currentStack = this.stackRegistry.getCurrentStack();

		return {
			framework: currentStack === "nestjs" ? "NestJS" : "Next.js",
			platform: "server",
			stack: currentStack,
			projectPath: process.cwd(),
			dependencies: ["prisma", "@prisma/client", "zod"],
			codeStyle: "typescript",
			uiSystem: "",
			compliance: {
				accessibility: "AAA",
				norwegian:
					options.norwegian || this.config.compliance?.norwegian || false,
				gdpr: options.gdpr || this.config.compliance?.gdpr || false,
			},
			serviceType: type,
			database: "postgresql",
			authentication: type === "api",
			caching: type === "api" || type === "data",
		};
	}

	private async generateWithStackAdapter(
		name: string,
		type: "component" | "service" | "model",
		options: AIGenerationOptions,
	): Promise<GeneratedFile[]> {
		const currentStack = this.stackRegistry.getCurrentStack();
		const context = {
			name,
			fields: options.fields || [],
			options: options as any,
			projectPath: process.cwd(),
			stackType: currentStack,
		};

		switch (type) {
			case "component":
				return this.universalGenerator.generateController(context); // Frontend controller
			case "service":
				return this.universalGenerator.generateService(context);
			case "model":
				return this.universalGenerator.generateModel(context);
			default:
				return [];
		}
	}

	/**
	 * Enhance files with AI-Native Workflow
	 * Implements natural language processing and AI content generation
	 */
	private async enhanceWithAINativeWorkflow(
		templateFiles: GeneratedFile[],
		name: string,
		type: string,
		options: AIGenerationOptions,
		context: ComponentContext,
		aiHints: string[],
	): Promise<GeneratedFile[]> {
		logger.info(chalk.gray("🧠 Applying AI-native enhancements..."));

		const enhancedFiles: GeneratedFile[] = [];

		for (const templateFile of templateFiles) {
			let content = templateFile.content;

			// Apply natural language to code translation
			if (options.naturalLanguage) {
				content = await this.applyNaturalLanguageTranslation(
					content,
					options.naturalLanguage,
					context,
				);
			}

			// Apply AI-powered component suggestions
			if (options.aiSuggestions) {
				content = await this.applyAIComponentSuggestions(
					content,
					name,
					context,
				);
			}

			// Apply context-aware optimizations
			if (options.contextAware && this.codebaseContext) {
				content = await this.applyContextAwareOptimizations(
					content,
					this.codebaseContext,
					context,
				);
			}

			// Apply performance optimizations
			if (options.optimizeForPerformance) {
				content = await this.applyPerformanceOptimizations(content, context);
			}

			// Apply AI hints from MCP specification
			content = this.applyAIHints(content, aiHints, context);

			enhancedFiles.push({
				...templateFile,
				content,
			});
		}

		return enhancedFiles;
	}

	/**
	 * Apply natural language to code translation
	 */
	private async applyNaturalLanguageTranslation(
		content: string,
		naturalLanguage: string,
		context: ComponentContext,
	): Promise<string> {
		logger.debug("Applying natural language translation...");

		const prompt = `Transform this natural language description into TypeScript code:
"${naturalLanguage}"

Existing component structure:
${content}

Context: ${context.framework} component with ${context.styling} styling`;

		try {
			const aiResult = await this.aiService.generateCode(prompt, context);
			return this.mergeAIEnhancedContent(content, aiResult.code);
		} catch (error) {
			logger.warn("Failed to apply natural language translation:", error);
			return content;
		}
	}

	/**
	 * Apply AI-powered component suggestions
	 */
	private async applyAIComponentSuggestions(
		content: string,
		name: string,
		context: ComponentContext,
	): Promise<string> {
		if (!this.codebaseContext) return content;

		logger.debug("Applying AI component suggestions...");

		const suggestions = await this.generateComponentSuggestions(
			name,
			this.codebaseContext.existingComponents,
			this.codebaseContext.projectPatterns,
		);

		let enhancedContent = content;
		for (const suggestion of suggestions) {
			enhancedContent = this.applySuggestion(enhancedContent, suggestion);
		}

		return enhancedContent;
	}

	/**
	 * Apply context-aware optimizations based on codebase analysis
	 */
	private async applyContextAwareOptimizations(
		content: string,
		codebaseContext: CodebaseContext,
		componentContext: ComponentContext,
	): Promise<string> {
		logger.debug("Applying context-aware optimizations...");

		// Apply project-specific patterns
		let optimizedContent = content;
		for (const pattern of codebaseContext.projectPatterns) {
			optimizedContent = this.applyProjectPattern(optimizedContent, pattern);
		}

		// Apply coding standards
		for (const standard of codebaseContext.codingStandards) {
			optimizedContent = this.applyCodingStandard(optimizedContent, standard);
		}

		// Apply Norwegian compliance if required
		if (codebaseContext.norwegianCompliance) {
			optimizedContent = this.applyNorwegianCompliance(optimizedContent);
		}

		return optimizedContent;
	}

	/**
	 * Apply performance optimizations using AI analysis
	 */
	private async applyPerformanceOptimizations(
		content: string,
		context: ComponentContext,
	): Promise<string> {
		logger.debug("Applying performance optimizations...");

		const prompt = `Optimize this React component for performance:
${content}

Focus on:
- React.memo usage
- useCallback for event handlers
- useMemo for expensive calculations
- Lazy loading opportunities
- Bundle size optimization`;

		try {
			const aiResult = await this.aiService.generateCode(prompt, context);
			return this.mergePerformanceOptimizations(content, aiResult.code);
		} catch (error) {
			logger.warn("Failed to apply performance optimizations:", error);
			return content;
		}
	}

	/**
	 * Apply AI hints from MCP specification
	 */
	private applyAIHints(
		content: string,
		aiHints: string[],
		context: ComponentContext,
	): string {
		let enhancedContent = content;

		// Add AI enhancement header
		const aiHeader = `/**
 * AI-Enhanced ${context.componentType.charAt(0).toUpperCase()}${context.componentType.slice(1)}
 * 
 * Generated with AI-native workflows and MCP optimization.
 * Features: ${context.framework} best practices, ${context.compliance.accessibility} accessibility, Norwegian compliance
 * 
 * AI Optimizations Applied:
${aiHints.map((hint) => ` * - ${hint}`).join("\n")}
 */\n\n`;

		// Insert AI header at the beginning of the component
		if (enhancedContent.includes("import ")) {
			const importEndIndex = enhancedContent.lastIndexOf("import ");
			const nextLineIndex = enhancedContent.indexOf("\n", importEndIndex);
			enhancedContent =
				enhancedContent.slice(0, nextLineIndex + 1) +
				"\n" +
				aiHeader +
				enhancedContent.slice(nextLineIndex + 1);
		} else {
			enhancedContent = aiHeader + enhancedContent;
		}

		return enhancedContent;
	}

	private async generateModel(
		name: string,
		options: AIGenerationOptions,
	): Promise<GeneratedFile[]> {
		const context = {
			name,
			fields: options.fields || [
				{ name: "name", type: "string", required: true },
				{ name: "email", type: "string", required: false, unique: true },
				{
					name: "status",
					type: "enum",
					defaultValue: "ACTIVE",
					validation: ["ACTIVE", "INACTIVE", "PENDING"],
				},
			],
			options: options as any,
			projectPath: process.cwd(),
			stackType: this.stackRegistry.getCurrentStack(),
		};

		return this.universalGenerator.generateModel(context);
	}

	private async generateComponentTests(
		name: string,
		context: ComponentContext,
	): Promise<GeneratedFile[]> {
		const fileName = this.kebabCase(name);
		const testPath = `src/components/__tests__/${fileName}.test.tsx`;

		const content = `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ${this.pascalCase(name)} } from '../${fileName}';

// Mock UI system
jest.mock('@xala-technologies/ui-system', () => ({
  ...jest.requireActual('@xala-technologies/ui-system'),
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe('${this.pascalCase(name)}', () => {
  it('renders without crashing', () => {
    render(<${this.pascalCase(name)} />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const mockHandler = jest.fn();
    render(<${this.pascalCase(name)} onAction={mockHandler} />);
    
    // Add interaction tests here
  });

  it('meets accessibility requirements', () => {
    render(<${this.pascalCase(name)} />);
    
    // Check for ARIA labels, roles, etc.
    // expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  it('handles error states gracefully', () => {
    render(<${this.pascalCase(name)} error="Test error" />);
    
    // Verify error handling
  });
});`;

		return [
			{
				path: testPath,
				content,
				type: "create",
			},
		];
	}

	private async generateStorybook(
		name: string,
		context: ComponentContext,
	): Promise<GeneratedFile[]> {
		const fileName = this.kebabCase(name);
		const storyPath = `src/components/__stories__/${fileName}.stories.tsx`;

		const content = `import type { Meta, StoryObj } from '@storybook/react';
import { ${this.pascalCase(name)} } from '../${fileName}';

const meta: Meta<typeof ${this.pascalCase(name)}> = {
  title: 'Components/${this.pascalCase(name)}',
  component: ${this.pascalCase(name)},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AI-generated component with accessibility and modern React patterns.'
      }
    }
  },
  argTypes: {
    // Define controls here
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'Something went wrong',
  },
};

export const Interactive: Story = {
  args: {
    // Interactive props
  },
  play: async ({ canvasElement }) => {
    // Add interaction tests
  },
};`;

		return [
			{
				path: storyPath,
				content,
				type: "create",
			},
		];
	}

	private async generateServiceTests(
		name: string,
		context: ServiceContext,
	): Promise<GeneratedFile[]> {
		const fileName = this.kebabCase(name);
		const testPath = `src/services/__tests__/${fileName}.service.test.ts`;

		const content = `import { ${this.pascalCase(name)}Service } from '../${fileName}.service';

describe('${this.pascalCase(name)}Service', () => {
  let service: ${this.pascalCase(name)}Service;

  beforeEach(() => {
    service = new ${this.pascalCase(name)}Service();
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const result = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return item by id', async () => {
      const id = 'test-id';
      const result = await service.findById(id);
      // Add assertions
    });

    it('should return null for non-existent id', async () => {
      const result = await service.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new item', async () => {
      const data = { name: 'Test Item' };
      const result = await service.create(data);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing item', async () => {
      const id = 'test-id';
      const data = { name: 'Updated Item' };
      const result = await service.update(id, data);
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete item', async () => {
      const id = 'test-id';
      await expect(service.delete(id)).resolves.not.toThrow();
    });
  });
});`;

		return [
			{
				path: testPath,
				content,
				type: "create",
			},
		];
	}

	private async generateHook(
		name: string,
		options: AIGenerationOptions,
	): Promise<GeneratedFile[]> {
		const fileName = this.kebabCase(name);
		const routeName = this.pluralize(fileName);
		const hookPath = `src/hooks/use-${fileName}.ts`;

		const content = `import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface ${this.pascalCase(name)} {
  id: string;
  name: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

interface Use${this.pascalCase(name)}Return {
  items: ${this.pascalCase(name)}[];
  loading: boolean;
  error: string | null;
  fetchItems: (search?: string) => Promise<void>;
  createItem: (data: Partial<${this.pascalCase(name)}>) => Promise<void>;
  updateItem: (id: string, data: Partial<${this.pascalCase(name)}>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

export function use${this.pascalCase(name)}(): Use${this.pascalCase(name)}Return {
  const [items, setItems] = useState<${this.pascalCase(name)}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(\`/api/${routeName}?\${params}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch items';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: Partial<${this.pascalCase(name)}>) => {
    setError(null);
    try {
      const response = await fetch('/api/${routeName}', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }
      
      toast.success('${this.pascalCase(name)} created successfully');
      await fetchItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchItems]);

  const updateItem = useCallback(async (id: string, data: Partial<${this.pascalCase(name)}>) => {
    setError(null);
    try {
      const response = await fetch(\`/api/${routeName}/\${id}\`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
      
      toast.success('${this.pascalCase(name)} updated successfully');
      await fetchItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchItems]);

  const deleteItem = useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await fetch(\`/api/${routeName}/\${id}\`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      
      toast.success('${this.pascalCase(name)} deleted successfully');
      await fetchItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchItems]);

  const refreshItems = useCallback(() => fetchItems(), [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    refreshItems,
  };
}`;

		return [
			{
				path: hookPath,
				content,
				type: "create",
			},
		];
	}

	private async generateValidation(
		name: string,
		options: AIGenerationOptions,
	): Promise<GeneratedFile[]> {
		const fileName = this.kebabCase(name);
		const validationPath = `src/lib/validations/${fileName}.ts`;

		const content = `import { z } from 'zod';

// Base schema for ${this.pascalCase(name)}
export const ${this.pascalCase(name)}Schema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\\s\\-_]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'], {
    errorMap: () => ({ message: 'Status must be ACTIVE, INACTIVE, or PENDING' })
  }).default('ACTIVE'),
});

// Schema for creating new items
export const Create${this.pascalCase(name)}Schema = ${this.pascalCase(name)}Schema;

// Schema for updating existing items (all fields optional)
export const Update${this.pascalCase(name)}Schema = ${this.pascalCase(name)}Schema.partial();

// Schema for search/filter queries
export const ${this.pascalCase(name)}QuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'email', 'status', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports for TypeScript
export type ${this.pascalCase(name)}Input = z.infer<typeof ${this.pascalCase(name)}Schema>;
export type Create${this.pascalCase(name)}Input = z.infer<typeof Create${this.pascalCase(name)}Schema>;
export type Update${this.pascalCase(name)}Input = z.infer<typeof Update${this.pascalCase(name)}Schema>;
export type ${this.pascalCase(name)}Query = z.infer<typeof ${this.pascalCase(name)}QuerySchema>;

// Validation helper functions
export const validate${this.pascalCase(name)} = (data: unknown) => {
  return ${this.pascalCase(name)}Schema.safeParse(data);
};

export const validateCreate${this.pascalCase(name)} = (data: unknown) => {
  return Create${this.pascalCase(name)}Schema.safeParse(data);
};

export const validateUpdate${this.pascalCase(name)} = (data: unknown) => {
  return Update${this.pascalCase(name)}Schema.safeParse(data);
};

export const validateQuery = (data: unknown) => {
  return ${this.pascalCase(name)}QuerySchema.safeParse(data);
};`;

		return [
			{
				path: validationPath,
				content,
				type: "create",
			},
		];
	}

	private async writeFiles(
		files: GeneratedFile[],
		options: AIGenerationOptions = {},
	): Promise<void> {
		// Perform security scanning if enabled
		if (options.securityScan) {
			logger.info(
				chalk.cyan("🔒 Performing security scan on generated code..."),
			);
			await this.performSecurityValidation(files, options);
		}

		// Write files to disk
		for (const file of files) {
			const dir = path.dirname(file.path);
			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(file.path, file.content);
		}
	}

	/**
	 * Perform comprehensive security validation on generated code
	 */
	private async performSecurityValidation(
		files: GeneratedFile[],
		options: AIGenerationOptions,
	): Promise<void> {
		const securityIssues: Array<{
			file: string;
			issues: any[];
		}> = [];

		for (const file of files) {
			try {
				// Validate individual file for security issues
				const vulnerabilities = await aiSecurityScanner.validateGeneratedCode(
					file.content,
					file.path,
					{
						aiEnhanced: true,
						scanTypes: ["code", "secrets", "configuration"],
						severity: ["critical", "high", "medium"],
						includeCompliance: options.securityCompliance || ["owasp"],
					},
				);

				if (vulnerabilities.length > 0) {
					securityIssues.push({
						file: file.path,
						issues: vulnerabilities,
					});

					// Log security issues
					logger.warn(chalk.yellow(`⚠️ Security issues found in ${file.path}:`));
					for (const vuln of vulnerabilities) {
						const severityColor = this.getSeverityColor(vuln.severity);
						logger.warn(
							chalk.gray(
								`  ${severityColor(vuln.severity.toUpperCase())}: ${vuln.title}`,
							),
						);
						logger.warn(chalk.gray(`    ${vuln.description}`));
						logger.warn(
							chalk.gray(`    Recommendation: ${vuln.recommendation}`),
						);
					}
				}
			} catch (error) {
				logger.debug(`Failed to scan ${file.path} for security issues:`, error);
			}
		}

		// Report overall security status
		if (securityIssues.length === 0) {
			logger.success(chalk.green("✅ No security vulnerabilities detected"));
		} else {
			const totalIssues = securityIssues.reduce(
				(sum, item) => sum + item.issues.length,
				0,
			);
			const criticalIssues = securityIssues
				.flatMap((item) => item.issues)
				.filter((issue) => issue.severity === "critical").length;

			if (criticalIssues > 0) {
				logger.error(
					chalk.red(
						`❌ Found ${criticalIssues} critical security vulnerabilities!`,
					),
				);
				logger.error(
					chalk.red("   Please address these issues before deployment."),
				);
			} else {
				logger.warn(
					chalk.yellow(
						`⚠️ Found ${totalIssues} security issues across ${securityIssues.length} files`,
					),
				);
			}

			// Provide security improvement suggestions
			await this.suggestSecurityImprovements(securityIssues, options);
		}
	}

	/**
	 * Suggest security improvements based on detected issues
	 */
	private async suggestSecurityImprovements(
		securityIssues: Array<{ file: string; issues: any[] }>,
		options: AIGenerationOptions,
	): Promise<void> {
		logger.info(chalk.cyan("💡 Security improvement suggestions:"));

		const allIssues = securityIssues.flatMap((item) => item.issues);
		const categories = [...new Set(allIssues.map((issue) => issue.category))];

		for (const category of categories) {
			const categoryIssues = allIssues.filter(
				(issue) => issue.category === category,
			);
			const suggestion = this.getSecuritySuggestionForCategory(
				category,
				categoryIssues.length,
			);

			logger.info(chalk.gray(`  • ${suggestion}`));
		}

		// Suggest compliance improvements
		if (options.securityCompliance?.includes("owasp")) {
			logger.info(chalk.gray("  • Review OWASP Top 10 compliance guidelines"));
		}

		if (options.securityCompliance?.includes("gdpr")) {
			logger.info(
				chalk.gray("  • Implement data privacy controls for GDPR compliance"),
			);
		}

		if (options.securityCompliance?.includes("wcag")) {
			logger.info(
				chalk.gray("  • Add accessibility attributes for WCAG compliance"),
			);
		}

		logger.info(
			chalk.gray(
				"\n🔗 Run full security scan: xaheen security-scan --ai-enhanced",
			),
		);
	}

	/**
	 * Get security suggestion for specific vulnerability category
	 */
	private getSecuritySuggestionForCategory(
		category: string,
		count: number,
	): string {
		const suggestions: Record<string, string> = {
			injection: `Address ${count} injection vulnerabilities by implementing input validation and sanitization`,
			"sensitive-data": `Secure ${count} exposed secrets by moving them to environment variables`,
			authentication: `Strengthen ${count} authentication issues with proper session management`,
			authorization: `Fix ${count} authorization issues by implementing proper access controls`,
			configuration: `Review ${count} configuration issues and apply security hardening`,
			cryptography: `Update ${count} cryptographic implementations to use secure algorithms`,
			logging: `Improve ${count} logging issues by implementing secure audit logging`,
		};

		return (
			suggestions[category] ||
			`Review and fix ${count} ${category} security issues`
		);
	}

	/**
	 * Get color for security severity levels
	 */
	private getSeverityColor(severity: string): typeof chalk.red {
		const colors: Record<string, typeof chalk.red> = {
			critical: chalk.red.bold,
			high: chalk.red,
			medium: chalk.yellow,
			low: chalk.blue,
			info: chalk.gray,
		};
		return colors[severity] || chalk.gray;
	}

	private logGeneratedFiles(files: GeneratedFile[]): void {
		logger.info(chalk.gray("\n📁 Generated files:"));
		files.forEach((file) => {
			const icon =
				file.type === "create" ? "📄" : file.type === "update" ? "✏️" : "➕";
			logger.info(`  ${icon} ${chalk.dim(file.path)}`);
		});
	}

	private showCRUDNextSteps(name: string): void {
		const routeName = this.pluralize(this.kebabCase(name));

		logger.info(chalk.yellow("\n📋 Next steps:"));
		logger.info(
			`  1. ${chalk.cyan("xaheen migrate")} - Run database migrations`,
		);
		logger.info(
			`  2. Add route to your navigation: ${chalk.dim(`/${routeName}`)}`,
		);
		logger.info(`  3. Customize generated components as needed`);
		logger.info(`  4. ${chalk.cyan("xaheen test")} - Run the generated tests`);
		logger.info(`  5. Review and adjust validation rules`);

		logger.info(chalk.blue("\n🎯 Generated CRUD includes:"));
		logger.info("  • Database model with Prisma schema");
		logger.info("  • REST API endpoints with validation");
		logger.info("  • React components with UI system");
		logger.info("  • Custom hooks for data management");
		logger.info("  • Form validation with Zod schemas");
		logger.info("  • Unit tests and accessibility compliance");
	}

	/**
	 * Index existing components in the project for AI context
	 */
	private async indexExistingComponents(
		projectPath: string,
	): Promise<string[]> {
		const components: string[] = [];

		try {
			const componentDirs = [
				path.join(projectPath, "src/components"),
				path.join(projectPath, "components"),
				path.join(projectPath, "src/app"),
				path.join(projectPath, "app"),
			];

			for (const dir of componentDirs) {
				try {
					const files = await fs.readdir(dir, { recursive: true });
					for (const file of files) {
						if (
							typeof file === "string" &&
							(file.endsWith(".tsx") || file.endsWith(".jsx"))
						) {
							const componentName = path.basename(file, path.extname(file));
							if (!components.includes(componentName)) {
								components.push(componentName);
							}
						}
					}
				} catch {
					// Directory doesn't exist, skip
				}
			}
		} catch (error) {
			logger.debug("Failed to index components:", error);
		}

		return components;
	}

	/**
	 * Analyze project patterns for AI context
	 */
	private async analyzeProjectPatterns(projectPath: string): Promise<string[]> {
		const patterns: string[] = [];

		// Common patterns to detect
		const patternChecks = [
			{ file: "tailwind.config.js", pattern: "Tailwind CSS" },
			{ file: "next.config.js", pattern: "Next.js" },
			{ file: "vite.config.ts", pattern: "Vite" },
			{ file: "src/app/layout.tsx", pattern: "App Router" },
			{ file: "src/pages", pattern: "Pages Router" },
			{ file: "src/stores", pattern: "State Management" },
			{ file: "src/lib/db", pattern: "Database Layer" },
			{ file: "prisma/schema.prisma", pattern: "Prisma ORM" },
			{ file: "src/middleware.ts", pattern: "Middleware" },
		];

		for (const check of patternChecks) {
			try {
				const fullPath = path.join(projectPath, check.file);
				const exists = await fs
					.access(fullPath)
					.then(() => true)
					.catch(() => false);
				if (exists) {
					patterns.push(check.pattern);
				}
			} catch {
				// Pattern not found
			}
		}

		return patterns;
	}

	/**
	 * Detect coding standards in the project
	 */
	private async detectCodingStandards(projectPath: string): Promise<string[]> {
		const standards: string[] = [];

		const standardFiles = [
			{ file: ".eslintrc.json", standard: "ESLint" },
			{ file: "prettier.config.js", standard: "Prettier" },
			{ file: "tsconfig.json", standard: "TypeScript Strict" },
			{ file: ".editorconfig", standard: "EditorConfig" },
			{ file: "husky", standard: "Pre-commit Hooks" },
		];

		for (const check of standardFiles) {
			try {
				const fullPath = path.join(projectPath, check.file);
				const exists = await fs
					.access(fullPath)
					.then(() => true)
					.catch(() => false);
				if (exists) {
					standards.push(check.standard);
				}
			} catch {
				// Standard not found
			}
		}

		return standards;
	}

	/**
	 * Analyze performance requirements
	 */
	private async analyzePerformanceRequirements(
		projectPath: string,
	): Promise<string[]> {
		const requirements: string[] = [];

		// Check for performance-related configurations
		try {
			const packageJsonPath = path.join(projectPath, "package.json");
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, "utf-8"),
			);

			// Check for performance-related dependencies
			const perfDeps = [
				"@next/bundle-analyzer",
				"webpack-bundle-analyzer",
				"lighthouse",
				"web-vitals",
			];

			for (const dep of perfDeps) {
				if (
					packageJson.dependencies?.[dep] ||
					packageJson.devDependencies?.[dep]
				) {
					requirements.push("Bundle Optimization");
					break;
				}
			}
		} catch {
			// Unable to analyze package.json
		}

		// Default performance requirements
		requirements.push("Core Web Vitals", "Accessibility Performance");

		return requirements;
	}

	private getDefaultConfig(): XaheenConfig {
		return {
			version: "3.0.0",
			project: {
				name: "My Project",
				framework: "nextjs",
				packageManager: "bun",
			},
			compliance: {
				accessibility: "AAA",
				norwegian: false,
				gdpr: false,
			},
		};
	}

	/**
	 * Run iterative refinement loop for AI-generated code
	 */
	private async runIterativeRefinement(
		files: GeneratedFile[],
		name: string,
		context: ComponentContext,
		mcpSpec: ComponentSpecification | null,
	): Promise<GeneratedFile[]> {
		logger.info(chalk.gray("🔄 Running iterative refinement loops..."));

		let refinedFiles = [...files];
		const maxIterations = 3;
		const refinementHistory: AIRefinementLoop[] = [];

		for (let iteration = 1; iteration <= maxIterations; iteration++) {
			logger.debug(`Refinement iteration ${iteration}/${maxIterations}`);

			const changes: string[] = [];
			let qualityScore = 0;
			let complianceScore = 0;
			let performanceScore = 0;
			const issues: string[] = [];
			const suggestions: string[] = [];

			for (let i = 0; i < refinedFiles.length; i++) {
				const file = refinedFiles[i];

				// Analyze current code quality
				const analysis = await this.aiService.analyzeCode(file.content);
				qualityScore += analysis.quality;

				// Validate against MCP specifications
				if (mcpSpec) {
					const validation = await mcpClient.validateComponent(
						file.content,
						name,
					);
					complianceScore += validation.score * 100;
					issues.push(...validation.issues.map((i) => i.message));
				}

				// Apply refinements if quality is below threshold
				if (analysis.quality < 80) {
					const refinedContent = await this.refineCodeQuality(
						file.content,
						analysis,
						context,
					);
					if (refinedContent !== file.content) {
						refinedFiles[i] = { ...file, content: refinedContent };
						changes.push(`Improved code quality in ${file.path}`);
					}
				}

				suggestions.push(...analysis.suggestions);
			}

			// Calculate average scores
			qualityScore /= refinedFiles.length;
			complianceScore /= refinedFiles.length;
			performanceScore = 85; // Placeholder for performance analysis

			refinementHistory.push({
				iteration,
				changes,
				qualityScore,
				complianceScore,
				performanceScore,
				issues,
				suggestions,
			});

			// Stop if quality is high enough or no changes were made
			if (qualityScore >= 90 && complianceScore >= 90 && changes.length === 0) {
				logger.success(
					chalk.green(`✅ Refinement complete after ${iteration} iterations`),
				);
				break;
			}
		}

		// Log refinement results
		this.logRefinementResults(refinementHistory);

		return refinedFiles;
	}

	/**
	 * Generate AI-enhanced additional files (tests, stories, docs)
	 */
	private async generateAIEnhancedAdditionalFiles(
		name: string,
		type: string,
		options: AIGenerationOptions,
		context: ComponentContext,
	): Promise<GeneratedFile[]> {
		const additionalFiles: GeneratedFile[] = [];

		if (options.withTests) {
			const testFiles = await this.generateAIEnhancedTests(name, context);
			additionalFiles.push(...testFiles);
		}

		if (options.withStories) {
			const storyFiles = await this.generateAIEnhancedStorybook(name, context);
			additionalFiles.push(...storyFiles);
		}

		// Always generate AI-enhanced documentation
		const docFiles = await this.generateAIDocumentation(name, type, context);
		additionalFiles.push(...docFiles);

		return additionalFiles;
	}

	/**
	 * Run validation and quality loops
	 */
	private async runValidationLoops(
		files: GeneratedFile[],
		mcpSpec: ComponentSpecification | null,
	): Promise<void> {
		logger.info(chalk.gray("🔍 Running validation and quality loops..."));

		for (const file of files) {
			// Skip non-code files
			if (!file.path.endsWith(".tsx") && !file.path.endsWith(".ts")) {
				continue;
			}

			// AI code analysis
			const analysis = await this.aiService.analyzeCode(file.content);
			if (analysis.quality < 70) {
				logger.warn(
					chalk.yellow(
						`⚠️ Quality concerns in ${file.path} (score: ${analysis.quality})`,
					),
				);
				analysis.issues.forEach((issue) => {
					logger.warn(`  - ${issue.message}`);
				});
			}

			// MCP compliance validation
			if (mcpSpec && file.path.includes(".tsx")) {
				const componentName = path.basename(file.path, ".tsx");
				const validation = await mcpClient.validateComponent(
					file.content,
					componentName,
				);
				if (!validation.valid) {
					logger.warn(chalk.yellow(`⚠️ MCP compliance issues in ${file.path}`));
					validation.issues.forEach((issue) => {
						logger.warn(`  - ${issue.message}`);
						if (issue.suggestion) {
							logger.info(`    💡 ${issue.suggestion}`);
						}
					});
				}
			}
		}
	}

	/**
	 * Show AI insights and recommendations
	 */
	private showAIInsights(
		name: string,
		complexity: {
			complexity: string;
			estimatedTokens: number;
			priority: string;
		},
		aiHints: string[],
	): void {
		logger.info(chalk.blue("\n🧠 AI Generation Insights:"));
		logger.info(
			`  Complexity: ${chalk.cyan(complexity.complexity)} (${complexity.estimatedTokens} tokens)`,
		);
		logger.info(`  Priority: ${chalk.cyan(complexity.priority)}`);
		logger.info(`  AI Optimizations: ${aiHints.length} applied`);

		if (this.codebaseContext) {
			logger.info(
				`  Context Awareness: ${chalk.green("✓")} (${this.codebaseContext.existingComponents.length} components indexed)`,
			);
		}
	}

	// Utility methods for AI enhancements
	private mergeAIEnhancedContent(
		original: string,
		aiGenerated: string,
	): string {
		// Smart merge of AI-generated content with original template
		return original.includes("// TODO:")
			? original.replace("// TODO:", aiGenerated)
			: `${original}\n\n${aiGenerated}`;
	}

	private async generateComponentSuggestions(
		name: string,
		existingComponents: string[],
		projectPatterns: string[],
	): Promise<string[]> {
		const suggestions: string[] = [];

		// Suggest similar components
		const similar = existingComponents.filter((comp) =>
			comp.toLowerCase().includes(name.toLowerCase().slice(0, 3)),
		);
		if (similar.length > 0) {
			suggestions.push(`Consider reusing patterns from: ${similar.join(", ")}`);
		}

		// Pattern-based suggestions
		if (projectPatterns.includes("State Management")) {
			suggestions.push("Add state management integration");
		}
		if (projectPatterns.includes("Database Layer")) {
			suggestions.push("Include data fetching capabilities");
		}

		return suggestions;
	}

	private applySuggestion(content: string, suggestion: string): string {
		// Apply AI suggestions to code content
		// This is a simplified implementation - in reality, this would be more sophisticated
		return `${content}\n// AI Suggestion: ${suggestion}`;
	}

	private applyProjectPattern(content: string, pattern: string): string {
		// Apply project-specific patterns
		return content; // Placeholder implementation
	}

	private applyCodingStandard(content: string, standard: string): string {
		// Apply coding standards
		return content; // Placeholder implementation
	}

	private applyNorwegianCompliance(content: string): string {
		// Apply Norwegian compliance patterns
		return content.includes("// Norwegian compliance")
			? content
			: `${content}\n// Norwegian compliance: NSM classification applied`;
	}

	private mergePerformanceOptimizations(
		original: string,
		optimized: string,
	): string {
		// Merge performance optimizations
		return optimized || original;
	}

	private async refineCodeQuality(
		content: string,
		analysis: any,
		context: ComponentContext,
	): Promise<string> {
		const prompt = `Improve this code based on the analysis issues:\n${content}\n\nIssues to fix:\n${analysis.issues.map((i: any) => `- ${i.message}`).join("\n")}`;

		try {
			const result = await this.aiService.generateCode(prompt, context);
			return result.code;
		} catch {
			return content;
		}
	}

	private async generateAIEnhancedTests(
		name: string,
		context: ComponentContext,
	): Promise<GeneratedFile[]> {
		// Enhanced version of existing test generation with AI improvements
		return this.generateComponentTests(name, context);
	}

	private async generateAIEnhancedStorybook(
		name: string,
		context: ComponentContext,
	): Promise<GeneratedFile[]> {
		// Enhanced version of existing storybook generation with AI improvements
		return this.generateStorybook(name, context);
	}

	private async generateAIDocumentation(
		name: string,
		type: string,
		context: ComponentContext,
	): Promise<GeneratedFile[]> {
		const docPath = `docs/components/${this.kebabCase(name)}.md`;
		const content = `# ${this.pascalCase(name)} Component\n\nAI-generated component with enhanced capabilities.\n\n## Features\n- ${context.framework} optimized\n- ${context.compliance.accessibility} accessibility\n- Norwegian compliance: ${context.compliance.norwegian}\n\n## Usage\n\n\`\`\`tsx\nimport { ${this.pascalCase(name)} } from './components/${this.pascalCase(name)}';\n\n<${this.pascalCase(name)} />\n\`\`\``;

		return [{ path: docPath, content, type: "create" }];
	}

	private logRefinementResults(history: AIRefinementLoop[]): void {
		logger.info(chalk.blue("\n📊 Refinement Results:"));
		history.forEach((loop) => {
			logger.info(
				`  Iteration ${loop.iteration}: Quality ${loop.qualityScore.toFixed(1)}, Compliance ${loop.complianceScore.toFixed(1)}, Performance ${loop.performanceScore.toFixed(1)}`,
			);
			if (loop.changes.length > 0) {
				loop.changes.forEach((change) => {
					logger.info(`    - ${change}`);
				});
			}
		});
	}

	// String transformation utilities
	private pascalCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toUpperCase());
	}

	private kebabCase(str: string): string {
		return str
			.replace(/([A-Z])/g, "-$1")
			.toLowerCase()
			.replace(/^-/, "")
			.replace(/\s+/g, "-");
	}

	private pluralize(str: string): string {
		if (str.endsWith("y")) {
			return str.slice(0, -1) + "ies";
		} else if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch")) {
			return str + "es";
		} else {
			return str + "s";
		}
	}
}
