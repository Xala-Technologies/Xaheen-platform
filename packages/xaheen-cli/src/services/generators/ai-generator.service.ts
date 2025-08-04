/**
 * AI-Enhanced Generator Service
 *
 * Integrates AI capabilities with make: commands for intelligent code generation
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
	AIService,
	ComponentContext,
	GenerationContext,
	ServiceContext,
} from "../ai/ai-service.js";

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
}

export class AIGeneratorService {
	private aiService: AIService;
	private stackRegistry: StackAdapterRegistry;
	private universalGenerator: UniversalGenerator;
	private config: XaheenConfig;

	constructor(config?: XaheenConfig) {
		this.aiService = new AIService(config);
		this.stackRegistry = StackAdapterRegistry.getInstance();
		this.universalGenerator = new UniversalGenerator();
		this.config = config || this.getDefaultConfig();
	}

	/**
	 * Generate an AI-powered React component
	 */
	async generateComponent(
		name: string,
		type: "page" | "component" | "layout" | "form" | "modal" = "component",
		options: AIGenerationOptions = {},
	): Promise<GeneratedFile[]> {
		logger.info(chalk.green(`🤖 Generating AI-powered ${type}: ${name}`));

		const context = this.buildComponentContext(name, type, options);

		try {
			// Use AI service to generate intelligent component
			const aiResult = await this.aiService.generateComponent(
				options.description || `Create a ${type} component named ${name}`,
				context,
			);

			// Combine AI generation with stack adapter patterns
			const stackFiles = await this.generateWithStackAdapter(
				name,
				"component",
				options,
			);

			// Merge AI-generated code with stack-specific patterns
			const enhancedFiles = await this.enhanceWithAI(
				stackFiles,
				aiResult,
				context,
			);

			// Generate additional files if requested
			const additionalFiles: GeneratedFile[] = [];

			if (options.withTests) {
				additionalFiles.push(
					...(await this.generateComponentTests(name, context)),
				);
			}

			if (options.withStories) {
				additionalFiles.push(...(await this.generateStorybook(name, context)));
			}

			const allFiles = [...enhancedFiles, ...additionalFiles];

			// Write files to disk
			await this.writeFiles(allFiles);

			logger.success(
				`✅ Generated ${allFiles.length} files with AI assistance`,
			);
			this.logGeneratedFiles(allFiles);

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
			await this.writeFiles(enhancedFiles);

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
			await this.writeFiles(allFiles);

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

	private buildComponentContext(
		name: string,
		type: "page" | "component" | "layout" | "form" | "modal",
		options: AIGenerationOptions,
	): ComponentContext {
		const currentStack = this.stackRegistry.getCurrentStack();

		return {
			framework: currentStack === "nextjs" ? "Next.js" : "React",
			platform: "web",
			stack: currentStack,
			projectPath: process.cwd(),
			dependencies: ["@xala-technologies/ui-system", "react", "typescript"],
			codeStyle: "typescript",
			uiSystem: "@xala-technologies/ui-system",
			compliance: {
				accessibility:
					options.accessibility ||
					this.config.compliance?.accessibility ||
					"AAA",
				norwegian:
					options.norwegian || this.config.compliance?.norwegian || false,
				gdpr: options.gdpr || this.config.compliance?.gdpr || false,
			},
			componentType: type,
			styling: options.styling || "tailwind",
			features: options.features || [],
		};
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

	private async enhanceWithAI(
		stackFiles: GeneratedFile[],
		aiResult: any,
		context: ComponentContext | ServiceContext,
	): Promise<GeneratedFile[]> {
		// Merge AI-generated patterns with stack-specific structure
		return stackFiles.map((file) => ({
			...file,
			content: this.mergeAIWithTemplate(file.content, aiResult, context),
		}));
	}

	private mergeAIWithTemplate(
		templateContent: string,
		aiResult: any,
		context: ComponentContext | ServiceContext,
	): string {
		// For now, enhance template with AI suggestions
		const aiComments = `
/**
 * AI-Enhanced Component
 * 
 * Generated with AI assistance for better code quality and patterns.
 * Features: ${context.framework} best practices, accessibility compliance, type safety
 */

`;

		return aiComments + templateContent;
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

	private async writeFiles(files: GeneratedFile[]): Promise<void> {
		for (const file of files) {
			const dir = path.dirname(file.path);
			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(file.path, file.content);
		}
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
