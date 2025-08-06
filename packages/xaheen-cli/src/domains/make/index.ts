/**
 * Make Domain - Laravel Artisan-inspired creation commands
 *
 * Provides a consistent, high-quality interface for generating
 * application components with intelligent defaults and AI enhancement.
 */

import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { ConfigManager } from "../../core/config-manager/index";
import { AIGeneratorService } from "../../services/generators/ai-generator.service";
import type { CLICommand } from "../../types/index";
import { logger } from "../../utils/logger";

interface MakeOptions {
	migration?: boolean;
	controller?: boolean;
	resource?: boolean;
	factory?: boolean;
	seeder?: boolean;
	all?: boolean;
	api?: boolean;
	force?: boolean;
	test?: boolean;
	// AI-enhanced options
	ai?: boolean;
	description?: string;
	withStories?: boolean;
	accessibility?: "A" | "AA" | "AAA";
	norwegian?: boolean;
	gdpr?: boolean;
	styling?: "tailwind" | "css-modules" | "styled-components";
	features?: string[];
}

export default class MakeDomain {
	private readonly generators: Map<string, Function>;
	private readonly aiGenerator: AIGeneratorService;
	private readonly configManager: ConfigManager;

	constructor() {
		this.generators = this.initializeGenerators();
		this.configManager = new ConfigManager();
		this.aiGenerator = new AIGeneratorService(this.configManager.getConfig());
	}

	private initializeGenerators(): Map<string, Function> {
		const generators = new Map<string, Function>();

		// Model generators
		generators.set("model", this.makeModel.bind(this));
		generators.set("migration", this.makeMigration.bind(this));
		generators.set("seeder", this.makeSeeder.bind(this));
		generators.set("factory", this.makeFactory.bind(this));

		// Controller generators
		generators.set("controller", this.makeController.bind(this));
		generators.set("request", this.makeRequest.bind(this));
		generators.set("resource", this.makeResource.bind(this));
		generators.set("middleware", this.makeMiddleware.bind(this));

		// Frontend generators
		generators.set("component", this.makeComponent.bind(this));
		generators.set("page", this.makePage.bind(this));
		generators.set("layout", this.makeLayout.bind(this));

		// Service layer generators
		generators.set("service", this.makeService.bind(this));
		generators.set("repository", this.makeRepository.bind(this));
		generators.set("provider", this.makeProvider.bind(this));

		// Job & Event generators
		generators.set("job", this.makeJob.bind(this));
		generators.set("event", this.makeEvent.bind(this));
		generators.set("listener", this.makeListener.bind(this));
		generators.set("observer", this.makeObserver.bind(this));

		// Testing generators
		generators.set("test", this.makeTest.bind(this));
		generators.set("unit-test", this.makeUnitTest.bind(this));
		generators.set("feature-test", this.makeFeatureTest.bind(this));

		// Special generators
		generators.set("crud", this.makeCrud.bind(this));
		generators.set("api-resource", this.makeApiResource.bind(this));
		generators.set("feature", this.makeFeature.bind(this));

		// AI-specific generators
		generators.set("analyze", this.makeAnalyze.bind(this));

		return generators;
	}

	/**
	 * Main entry point for make commands
	 * Follows Laravel's pattern: make:type Name [options]
	 */
	async execute(command: CLICommand): Promise<void> {
		// Parse make:type format
		const makeType = command.action; // e.g., "model", "controller"
		const name = command.target;
		const options = command.options as MakeOptions;

		if (!makeType || !this.generators.has(makeType)) {
			this.showAvailableGenerators();
			return;
		}

		if (!name) {
			logger.error(`Name is required for make:${makeType}`);
			this.showUsageExample(makeType);
			return;
		}

		// Execute the appropriate generator
		const generator = this.generators.get(makeType)!;
		await generator(name, options);
	}

	/**
	 * Make Model - Creates a model with optional related files
	 * Usage: xaheen make:model User --migration --controller --resource
	 */
	private async makeModel(name: string, options: MakeOptions): Promise<void> {
		const startTime = Date.now();

		logger.info(chalk.green("Creating model..."));

		// Generate model file
		const modelPath = await this.generateModel(name);
		logger.success(
			`  ${chalk.green("✓")} Model created: ${chalk.dim(modelPath)}`,
		);

		// Handle --all flag (creates everything)
		if (options.all) {
			options.migration = true;
			options.factory = true;
			options.seeder = true;
			options.controller = true;
			options.resource = true;
		}

		// Generate related files based on options
		if (options.migration) {
			const migrationPath = await this.generateMigration(name);
			logger.success(
				`  ${chalk.green("✓")} Migration created: ${chalk.dim(migrationPath)}`,
			);
		}

		if (options.factory) {
			const factoryPath = await this.generateFactory(name);
			logger.success(
				`  ${chalk.green("✓")} Factory created: ${chalk.dim(factoryPath)}`,
			);
		}

		if (options.seeder) {
			const seederPath = await this.generateSeeder(name);
			logger.success(
				`  ${chalk.green("✓")} Seeder created: ${chalk.dim(seederPath)}`,
			);
		}

		if (options.controller) {
			const controllerPath = await this.generateController(name, {
				resource: options.resource,
				api: options.api,
			});
			logger.success(
				`  ${chalk.green("✓")} Controller created: ${chalk.dim(controllerPath)}`,
			);
		}

		const elapsed = Date.now() - startTime;
		logger.info(chalk.gray(`\nCompleted in ${elapsed}ms`));
	}

	/**
	 * Make Controller - Creates a controller with optional resource methods
	 * Usage: xaheen make:controller UserController --resource --api
	 */
	private async makeController(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		const controllerPath = await this.generateController(name, options);
		logger.success(
			`Controller created successfully: ${chalk.cyan(controllerPath)}`,
		);

		if (options.resource) {
			logger.info(
				chalk.gray(
					"  Resource methods: index, create, store, show, edit, update, destroy",
				),
			);
		}

		if (options.api) {
			logger.info(
				chalk.gray("  API methods: index, store, show, update, destroy"),
			);
		}
	}

	/**
	 * Make Migration - Creates a database migration file
	 * Usage: xaheen make:migration create_users_table
	 */
	private async makeMigration(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		const migrationPath = await this.generateMigration(name);
		logger.success(
			`Migration created successfully: ${chalk.cyan(migrationPath)}`,
		);
		logger.info(chalk.gray("\nRun migrations with:"));
		logger.info(chalk.cyan("  xaheen migrate"));
	}

	/**
	 * Make Component - Creates a frontend component
	 * Usage: xaheen make:component UserCard --ai --description "A user profile card with avatar and actions"
	 */
	private async makeComponent(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		if (options.ai) {
			// Use AI-powered generation
			logger.info(chalk.blue("🤖 Using AI-powered component generation..."));

			const files = await this.aiGenerator.generateComponent(
				name,
				"component",
				{
					description: options.description,
					withTests: options.test,
					withStories: options.withStories,
					accessibility: options.accessibility,
					norwegian: options.norwegian,
					gdpr: options.gdpr,
					styling: options.styling,
					features: options.features,
				},
			);

			logger.success(`AI-powered component created with ${files.length} files`);
		} else {
			// Use traditional generation
			const componentPath = await this.generateComponent(name, options);
			logger.success(
				`Component created successfully: ${chalk.cyan(componentPath)}`,
			);

			if (options.test) {
				const testPath = await this.generateComponentTest(name);
				logger.success(`Test created: ${chalk.cyan(testPath)}`);
			}
		}
	}

	/**
	 * Make Service - Creates a service class
	 * Usage: xaheen make:service UserService --ai --description "A service for managing user authentication and profiles"
	 */
	private async makeService(name: string, options: MakeOptions): Promise<void> {
		if (options.ai) {
			// Use AI-powered generation
			logger.info(chalk.blue("🤖 Using AI-powered service generation..."));

			const files = await this.aiGenerator.generateService(name, "business", {
				description: options.description,
				withTests: options.test,
				features: options.features,
			});

			logger.success(`AI-powered service created with ${files.length} files`);
		} else {
			// Use traditional generation
			const servicePath = await this.generateService(name);
			logger.success(
				`Service created successfully: ${chalk.cyan(servicePath)}`,
			);
		}
	}

	/**
	 * Make CRUD - Creates complete CRUD operations
	 * Usage: xaheen make:crud Product --ai --description "A product management system with inventory tracking"
	 */
	private async makeCrud(name: string, options: MakeOptions): Promise<void> {
		if (options.ai) {
			// Use AI-powered CRUD generation
			logger.info(chalk.blue("🤖 Using AI-powered CRUD generation..."));

			const files = await this.aiGenerator.generateCRUD(name, {
				description: options.description,
				withTests: options.test,
				withStories: options.withStories,
				accessibility: options.accessibility,
				norwegian: options.norwegian,
				gdpr: options.gdpr,
				styling: options.styling,
				features: options.features,
			});

			logger.success(
				`AI-powered CRUD system created with ${files.length} files`,
			);
		} else {
			// Use traditional generation
			logger.info(chalk.green("Creating complete CRUD..."));

			const files = await this.generateCrud(name, options);

			files.forEach((file) => {
				logger.success(`  ${chalk.green("✓")} Created: ${chalk.dim(file)}`);
			});

			logger.info(chalk.yellow("\n📋 Next steps:"));
			logger.info("  1. Run migrations: " + chalk.cyan("xaheen migrate"));
			logger.info("  2. Add routes to your router");
			logger.info("  3. Update navigation links");
		}
	}

	// Generator implementations
	private async generateModel(name: string): Promise<string> {
		const modelName = this.pascalCase(name);
		const tableName = this.snakeCase(name) + "s";
		const prismaPath = `./prisma/schema.prisma`;

		// Generate Prisma model
		const prismaModel = `
model ${modelName} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Add your fields here
  name      String
  email     String?  @unique
  status    Status   @default(ACTIVE)
  
  // Relations
  // posts     Post[]
  
  @@map("${tableName}")
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}`;

		// Append to Prisma schema
		try {
			const existingSchema = await fs.readFile(prismaPath, "utf-8");
			if (!existingSchema.includes(`model ${modelName}`)) {
				await fs.writeFile(prismaPath, existingSchema + "\n" + prismaModel);
				logger.info(`  ${chalk.gray("Added to Prisma schema")}`);
			}
		} catch (error) {
			logger.warn("  Prisma schema not found, creating model file instead");
			await this.writeFile(`./prisma/models/${modelName}.prisma`, prismaModel);
		}

		// Generate TypeScript types
		const typePath = `./src/types/${this.kebabCase(name)}.ts`;
		const typeContent = `// Auto-generated types for ${modelName}
import { Prisma, ${modelName} as Prisma${modelName} } from '@prisma/client';

export type ${modelName} = Prisma${modelName};

export type ${modelName}CreateInput = Prisma.${modelName}CreateInput;
export type ${modelName}UpdateInput = Prisma.${modelName}UpdateInput;
export type ${modelName}WhereInput = Prisma.${modelName}WhereInput;
export type ${modelName}OrderByInput = Prisma.${modelName}OrderByWithRelationInput;

export interface ${modelName}WithRelations extends ${modelName} {
  // Add relation types here
  // posts?: Post[];
}

export interface ${modelName}Response {
  data: ${modelName} | ${modelName}[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}`;

		await this.writeFile(typePath, typeContent);

		return prismaPath;
	}

	private async generateController(
		name: string,
		options: any,
	): Promise<string> {
		const resourceName = name.replace(/Controller$/i, "");
		const modelName = this.pascalCase(resourceName);
		const routeName = this.kebabCase(resourceName) + "s";

		// Generate Next.js App Router API routes
		const apiDir = `./src/app/api/${routeName}`;

		// Route handler for collection (GET all, POST create)
		const routeHandlerPath = `${apiDir}/route.ts`;
		const routeHandlerContent = `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ${modelName}Schema } from '@/lib/validations/${this.kebabCase(resourceName)}';
import { z } from 'zod';

// GET /api/${routeName}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    
    const [items, total] = await Promise.all([
      prisma.${this.camelCase(modelName)}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.${this.camelCase(modelName)}.count({ where }),
    ]);
    
    return NextResponse.json({
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/${routeName} error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/${routeName}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = ${modelName}Schema.parse(body);
    
    const item = await prisma.${this.camelCase(modelName)}.create({
      data: validated,
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('POST /api/${routeName} error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;

		await this.writeFile(routeHandlerPath, routeHandlerContent);

		// Route handler for individual items (GET one, PUT update, DELETE)
		const itemRoutePath = `${apiDir}/[id]/route.ts`;
		const itemRouteContent = `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ${modelName}UpdateSchema } from '@/lib/validations/${this.kebabCase(resourceName)}';
import { z } from 'zod';

// GET /api/${routeName}/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.${this.camelCase(modelName)}.findUnique({
      where: { id: params.id },
    });
    
    if (!item) {
      return NextResponse.json(
        { error: '${modelName} not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('GET /api/${routeName}/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/${routeName}/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = ${modelName}UpdateSchema.parse(body);
    
    const item = await prisma.${this.camelCase(modelName)}.update({
      where: { id: params.id },
      data: validated,
    });
    
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('PUT /api/${routeName}/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/${routeName}/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.${this.camelCase(modelName)}.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/${routeName}/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;

		await this.writeFile(itemRoutePath, itemRouteContent);

		// Generate validation schema
		const validationPath = `./src/lib/validations/${this.kebabCase(resourceName)}.ts`;
		const validationContent = `import { z } from 'zod';

export const ${modelName}Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('ACTIVE'),
});

export const ${modelName}UpdateSchema = ${modelName}Schema.partial();

export type ${modelName}Input = z.infer<typeof ${modelName}Schema>;
export type ${modelName}UpdateInput = z.infer<typeof ${modelName}UpdateSchema>;`;

		await this.writeFile(validationPath, validationContent);

		return apiDir;
	}

	private async generateMigration(name: string): Promise<string> {
		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, "-")
			.split("-")
			.slice(0, -1)
			.join("");
		const fileName = `${timestamp}_${this.snakeCase(name)}.ts`;
		const migrationPath = `./database/migrations/${fileName}`;

		const tableName = this.extractTableName(name);
		const isCreate = name.toLowerCase().includes("create");

		const content = isCreate
			? `import { Migration } from '@/core/migration';

export class ${this.pascalCase(name)} extends Migration {
  async up(): Promise<void> {
    await this.schema.createTable('${tableName}', (table) => {
      table.uuid('id').primary();
      table.timestamps(true, true);
    });
  }
  
  async down(): Promise<void> {
    await this.schema.dropTable('${tableName}');
  }
}`
			: `import { Migration } from '@/core/migration';

export class ${this.pascalCase(name)} extends Migration {
  async up(): Promise<void> {
    await this.schema.table('${tableName}', (table) => {
      // Add modifications here
    });
  }
  
  async down(): Promise<void> {
    await this.schema.table('${tableName}', (table) => {
      // Reverse modifications here
    });
  }
}`;

		await this.writeFile(migrationPath, content);
		return migrationPath;
	}

	private async generateFactory(name: string): Promise<string> {
		const modelName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const factoryPath = `./database/factories/${fileName}.factory.ts`;

		const content = `import { Factory } from '@/core/factory';
import { ${modelName} } from '@/models/${fileName}.model';
import { faker } from '@faker-js/faker';

export class ${modelName}Factory extends Factory<${modelName}> {
  model = ${modelName};
  
  definition(): Partial<${modelName}> {
    return {
      id: faker.datatype.uuid(),
      // Add factory attributes here
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }
}`;

		await this.writeFile(factoryPath, content);
		return factoryPath;
	}

	private async generateSeeder(name: string): Promise<string> {
		const seederName = this.pascalCase(name) + "Seeder";
		const fileName = this.kebabCase(name) + ".seeder";
		const seederPath = `./database/seeders/${fileName}.ts`;

		const content = `import { Seeder } from '@/core/seeder';
import { ${this.pascalCase(name)}Factory } from '@/database/factories/${this.kebabCase(name)}.factory';

export class ${seederName} extends Seeder {
  async run(): Promise<void> {
    // Create 10 records
    await new ${this.pascalCase(name)}Factory().createMany(10);
    
    console.log('✓ ${seederName} completed');
  }
}`;

		await this.writeFile(seederPath, content);
		return seederPath;
	}

	private async generateComponent(name: string, options: any): Promise<string> {
		const componentName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const componentPath = `./src/components/${fileName}.tsx`;

		const content = `'use client';

import React from 'react';
import { 
  Card, 
  Button, 
  Badge,
  Container,
  Flex,
  Text 
} from '@xala-technologies/ui-system';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className,
  children 
}) => {
  return (
    <Card className={className} variant="elevated" padding="lg">
      <Flex direction="column" gap="md">
        <Text variant="h3">${componentName}</Text>
        {children}
      </Flex>
    </Card>
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};`;

		await this.writeFile(componentPath, content);
		return componentPath;
	}

	private async generateComponentTest(name: string): Promise<string> {
		const componentName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const testPath = `./src/components/__tests__/${fileName}.test.tsx`;

		const content = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from '../${fileName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });
  
  // Add more tests here
});`;

		await this.writeFile(testPath, content);
		return testPath;
	}

	private async generateService(name: string): Promise<string> {
		const serviceName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const servicePath = `./src/services/${fileName}.service.ts`;

		const content = `import { Service } from '@/core/service';

export class ${serviceName} extends Service {
  /**
   * Service implementation
   */
  async findAll(): Promise<any[]> {
    // Implementation here
    return [];
  }
  
  async findById(id: string): Promise<any | null> {
    // Implementation here
    return null;
  }
  
  async create(data: any): Promise<any> {
    // Implementation here
    return data;
  }
  
  async update(id: string, data: any): Promise<any> {
    // Implementation here
    return data;
  }
  
  async delete(id: string): Promise<void> {
    // Implementation here
  }
}`;

		await this.writeFile(servicePath, content);
		return servicePath;
	}

	private async generateCrud(name: string, options: any): Promise<string[]> {
		const files: string[] = [];
		const modelName = this.pascalCase(name);

		logger.info(
			chalk.gray(`\n  Generating full-stack CRUD for ${modelName}...`),
		);

		// 1. Database layer (Prisma)
		logger.info(chalk.gray("  📦 Database layer..."));
		files.push(await this.generateModel(name));

		// 2. API layer (Next.js API routes)
		logger.info(chalk.gray("  🔌 API layer..."));
		files.push(
			await this.generateController(name, { resource: true, api: true }),
		);

		// 3. Frontend components
		logger.info(chalk.gray("  🎨 UI components..."));
		files.push(await this.generatePage(name));
		files.push(await this.generateFormComponent(name));
		files.push(await this.generateTableComponent(name));

		// 4. Hooks for data fetching
		logger.info(chalk.gray("  🔗 React hooks..."));
		files.push(await this.generateHook(name));

		// 5. Generate factory and seeder for testing
		if (options.test || options.seed) {
			logger.info(chalk.gray("  🧪 Test utilities..."));
			files.push(await this.generateFactory(name));
			files.push(await this.generateSeeder(name));
		}

		return files;
	}

	private async generateFormComponent(name: string): Promise<string> {
		const componentName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const componentPath = `./src/components/${fileName}-form.tsx`;

		const content = `'use client';

import React, { useState } from 'react';
import { 
  Button,
  Input,
  Select,
  Card,
  Flex,
  Text
} from '@xala-technologies/ui-system';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ${componentName}Schema } from '@/lib/validations/${fileName}';
import type { ${componentName}Input } from '@/lib/validations/${fileName}';

interface ${componentName}FormProps {
  initialData?: Partial<${componentName}Input>;
  onSubmit: (data: ${componentName}Input) => Promise<void>;
  onCancel?: () => void;
}

export const ${componentName}Form: React.FC<${componentName}FormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<${componentName}Input>({
    resolver: zodResolver(${componentName}Schema),
    defaultValues: initialData
  });

  const handleFormSubmit = async (data: ${componentName}Input) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Flex direction="column" gap="md">
        <div>
          <Text variant="label">Name</Text>
          <Input
            {...register('name')}
            placeholder="Enter name"
            error={errors.name?.message}
          />
        </div>

        <div>
          <Text variant="label">Email</Text>
          <Input
            {...register('email')}
            type="email"
            placeholder="Enter email"
            error={errors.email?.message}
          />
        </div>

        <div>
          <Text variant="label">Status</Text>
          <Select {...register('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </Select>
        </div>

        <Flex gap="sm" justify="end">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};`;

		await this.writeFile(componentPath, content);
		return componentPath;
	}

	private async generateTableComponent(name: string): Promise<string> {
		const componentName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const componentPath = `./src/components/${fileName}-table.tsx`;

		const content = `'use client';

import React from 'react';
import { 
  Table,
  Button,
  Badge,
  Flex
} from '@xala-technologies/ui-system';
import { Edit, Trash } from 'lucide-react';

interface ${componentName} {
  id: string;
  name: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

interface ${componentName}TableProps {
  items: ${componentName}[];
  onEdit?: (item: ${componentName}) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export const ${componentName}Table: React.FC<${componentName}TableProps> = ({
  items,
  onEdit,
  onDelete,
  loading
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500">No items found</div>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.email || '-'}</td>
            <td>
              <Badge 
                variant={
                  item.status === 'ACTIVE' ? 'success' : 
                  item.status === 'PENDING' ? 'warning' : 
                  'default'
                }
              >
                {item.status}
              </Badge>
            </td>
            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            <td>
              <Flex gap="sm">
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </Flex>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};`;

		await this.writeFile(componentPath, content);
		return componentPath;
	}

	private async generateHook(name: string): Promise<string> {
		const modelName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const routeName = this.pluralize(fileName);
		const hookPath = `./src/hooks/use-${fileName}.ts`;

		const content = `import { useState, useEffect, useCallback } from 'react';

interface ${modelName} {
  id: string;
  name: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

interface Use${modelName}Return {
  items: ${modelName}[];
  loading: boolean;
  error: string | null;
  fetchItems: (search?: string) => Promise<void>;
  createItem: (data: Partial<${modelName}>) => Promise<void>;
  updateItem: (id: string, data: Partial<${modelName}>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export function use${modelName}(): Use${modelName}Return {
  const [items, setItems] = useState<${modelName}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(\`/api/${routeName}?\${params}\`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setItems(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: Partial<${modelName}>) => {
    setError(null);
    try {
      const response = await fetch('/api/${routeName}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [fetchItems]);

  const updateItem = useCallback(async (id: string, data: Partial<${modelName}>) => {
    setError(null);
    try {
      const response = await fetch(\`/api/${routeName}/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [fetchItems]);

  const deleteItem = useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await fetch(\`/api/${routeName}/\${id}\`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [fetchItems]);

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
  };
}`;

		await this.writeFile(hookPath, content);
		return hookPath;
	}

	private async generateRequest(name: string): Promise<string> {
		const requestName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const requestPath = `./src/requests/${fileName}.request.ts`;

		const content = `import { Request } from '@/core/request';
import { z } from 'zod';

export class ${requestName} extends Request {
  schema = z.object({
    // Define validation rules here
  });
  
  messages = {
    // Custom error messages
  };
}`;

		await this.writeFile(requestPath, content);
		return requestPath;
	}

	private async generateResource(name: string): Promise<string> {
		const resourceName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const resourcePath = `./src/resources/${fileName}.resource.ts`;

		const content = `import { Resource } from '@/core/resource';

export class ${resourceName}Resource extends Resource {
  toArray(): any {
    return {
      id: this.id,
      // Map resource fields here
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}`;

		await this.writeFile(resourcePath, content);
		return resourcePath;
	}

	private async generatePage(name: string): Promise<string> {
		const pageName = this.pascalCase(name);
		const fileName = this.kebabCase(name);
		const routeName = this.pluralize(fileName);
		const pagePath = `./src/app/${routeName}/page.tsx`;

		const content = `'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container,
  Card,
  Button,
  Input,
  Table,
  Badge,
  Flex,
  Text,
  Modal
} from '@xala-technologies/ui-system';
import { Plus, Search, Edit, Trash } from 'lucide-react';

interface ${pageName} {
  id: string;
  name: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export default function ${pageName}Page() {
  const [items, setItems] = useState<${pageName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(\`/api/${routeName}?\${params}\`);
      const data = await response.json();
      setItems(data.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await fetch(\`/api/${routeName}/\${id}\`, { method: 'DELETE' });
      await fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <Container size="xl" padding="lg">
      <Flex justify="between" align="center" className="mb-6">
        <Text variant="h1">${this.pluralize(pageName)}</Text>
        <Button 
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add ${pageName}
        </Button>
      </Flex>

      <Card variant="elevated" padding="lg">
        <div className="mb-4">
          <Input
            placeholder="Search ${routeName}..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No ${routeName} found
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email || '-'}</td>
                  <td>
                    <Badge 
                      variant={
                        item.status === 'ACTIVE' ? 'success' : 
                        item.status === 'PENDING' ? 'warning' : 
                        'default'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Flex gap="sm">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create ${pageName}"
      >
        {/* Add form component here */}
        <div>Form coming soon...</div>
      </Modal>
    </Container>
  );
}`;

		await this.writeFile(pagePath, content);
		return pagePath;
	}

	// Stub methods for remaining generators
	private async makeSeeder(name: string, options: MakeOptions): Promise<void> {
		const seederPath = await this.generateSeeder(name);
		logger.success(`Seeder created successfully: ${chalk.cyan(seederPath)}`);
	}

	private async makeFactory(name: string, options: MakeOptions): Promise<void> {
		const factoryPath = await this.generateFactory(name);
		logger.success(`Factory created successfully: ${chalk.cyan(factoryPath)}`);
	}

	private async makeRequest(name: string, options: MakeOptions): Promise<void> {
		const requestPath = await this.generateRequest(name);
		logger.success(`Request created successfully: ${chalk.cyan(requestPath)}`);
	}

	private async makeResource(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		const resourcePath = await this.generateResource(name);
		logger.success(
			`Resource created successfully: ${chalk.cyan(resourcePath)}`,
		);
	}

	private async makeMiddleware(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Middleware generator coming soon...");
	}

	private async makePage(name: string, options: MakeOptions): Promise<void> {
		const pagePath = await this.generatePage(name);
		logger.success(`Page created successfully: ${chalk.cyan(pagePath)}`);
	}

	private async makeLayout(name: string, options: MakeOptions): Promise<void> {
		logger.info("Layout generator coming soon...");
	}

	private async makeRepository(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Repository generator coming soon...");
	}

	private async makeProvider(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Provider generator coming soon...");
	}

	private async makeJob(name: string, options: MakeOptions): Promise<void> {
		logger.info("Job generator coming soon...");
	}

	private async makeEvent(name: string, options: MakeOptions): Promise<void> {
		logger.info("Event generator coming soon...");
	}

	private async makeListener(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Listener generator coming soon...");
	}

	private async makeObserver(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Observer generator coming soon...");
	}

	private async makeTest(name: string, options: MakeOptions): Promise<void> {
		logger.info("Test generator coming soon...");
	}

	private async makeUnitTest(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Unit test generator coming soon...");
	}

	private async makeFeatureTest(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("Feature test generator coming soon...");
	}

	private async makeApiResource(
		name: string,
		options: MakeOptions,
	): Promise<void> {
		logger.info("API resource generator coming soon...");
	}

	private async makeFeature(name: string, options: MakeOptions): Promise<void> {
		logger.info("Feature generator coming soon...");
	}

	/**
	 * Make Analyze - AI code analysis
	 * Usage: xaheen make:analyze src/components/UserCard.tsx
	 */
	private async makeAnalyze(
		filePath: string,
		options: MakeOptions,
	): Promise<void> {
		if (!filePath) {
			logger.error("File path is required for analysis");
			logger.info(
				chalk.gray("Example: xaheen make:analyze src/components/UserCard.tsx"),
			);
			return;
		}

		try {
			await this.aiGenerator.analyzeCode(filePath);
		} catch (error) {
			logger.error(`Failed to analyze code: ${error}`);
		}
	}

	// Helper methods
	private async writeFile(filePath: string, content: string): Promise<void> {
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(filePath, content);
	}

	private showAvailableGenerators(): void {
		logger.info(chalk.yellow("\n📚 Available make commands:\n"));

		const commands = [
			{
				cmd: "make:model User --migration --controller --resource",
				desc: "Create a model class",
			},
			{
				cmd: "make:controller UserController --resource",
				desc: "Create a controller class",
			},
			{
				cmd: "make:migration create_users_table",
				desc: "Create a migration file",
			},
			{ cmd: "make:seeder UserSeeder", desc: "Create a seeder class" },
			{ cmd: "make:factory UserFactory", desc: "Create a model factory" },
			{ cmd: "make:request StoreUserRequest", desc: "Create a form request" },
			{ cmd: "make:resource UserResource", desc: "Create a resource class" },
			{ cmd: "make:service UserService", desc: "Create a service class" },
			{ cmd: "make:component UserCard", desc: "Create a React component" },
			{ cmd: "make:page users/index", desc: "Create a page component" },
			{ cmd: "make:crud Product --api", desc: "Create complete CRUD" },
		];

		commands.forEach(({ cmd, desc }) => {
			logger.info(`  ${chalk.cyan(cmd.padEnd(50))} ${chalk.gray(desc)}`);
		});

		logger.info(chalk.blue("\n🤖 AI-Enhanced Commands (add --ai flag):"));
		const aiCommands = [
			{
				cmd: 'make:component UserCard --ai --description "Card component with avatar"',
				desc: "AI-powered component",
			},
			{
				cmd: 'make:service AuthService --ai --description "JWT authentication service"',
				desc: "AI-powered service",
			},
			{
				cmd: 'make:crud Product --ai --description "E-commerce product manager"',
				desc: "AI-powered CRUD system",
			},
			{
				cmd: "make:analyze src/components/UserCard.tsx",
				desc: "AI code analysis & suggestions",
			},
		];

		aiCommands.forEach(({ cmd, desc }) => {
			logger.info(`  ${chalk.magenta(cmd.padEnd(65))} ${chalk.gray(desc)}`);
		});

		logger.info(chalk.blue("\n💡 AI Options:"));
		logger.info(
			`  ${chalk.dim("--ai")}                    Enable AI-powered generation`,
		);
		logger.info(
			`  ${chalk.dim('--description "..."')}      Describe what you want to build`,
		);
		logger.info(
			`  ${chalk.dim("--test")}                  Generate unit tests`,
		);
		logger.info(
			`  ${chalk.dim("--withStories")}           Generate Storybook stories`,
		);
		logger.info(
			`  ${chalk.dim("--accessibility AAA")}     Set accessibility level (A/AA/AAA)`,
		);
		logger.info(
			`  ${chalk.dim("--norwegian")}             Enable Norwegian compliance`,
		);
		logger.info(
			`  ${chalk.dim("--gdpr")}                  Enable GDPR compliance`,
		);

		logger.info(
			chalk.gray("\nFor more information, run: xaheen help make:<command>"),
		);
	}

	private showUsageExample(type: string): void {
		const examples: Record<string, string> = {
			model: "xaheen make:model User --migration --controller --resource",
			controller: "xaheen make:controller UserController --resource --api",
			migration: "xaheen make:migration create_users_table",
			component: "xaheen make:component UserCard --typescript",
			service: "xaheen make:service UserService",
		};

		if (examples[type]) {
			logger.info(chalk.gray(`\nExample: ${examples[type]}`));
		}
	}

	private extractTableName(migrationName: string): string {
		// Extract table name from migration name
		// create_users_table -> users
		// add_email_to_users -> users
		const match = migrationName.match(
			/(?:create_)?(\w+)(?:_table)?|(?:to_)(\w+)/,
		);
		return match ? match[1] || match[2] : "table";
	}

	// String transformation utilities
	private pascalCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toUpperCase());
	}

	private camelCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toLowerCase());
	}

	private kebabCase(str: string): string {
		return str
			.replace(/([A-Z])/g, "-$1")
			.toLowerCase()
			.replace(/^-/, "")
			.replace(/\s+/g, "-");
	}

	private snakeCase(str: string): string {
		return str
			.replace(/([A-Z])/g, "_$1")
			.toLowerCase()
			.replace(/^_/, "")
			.replace(/\s+/g, "_");
	}

	private pluralize(str: string): string {
		// Simple pluralization
		if (str.endsWith("y")) {
			return str.slice(0, -1) + "ies";
		} else if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch")) {
			return str + "es";
		} else {
			return str + "s";
		}
	}
}
