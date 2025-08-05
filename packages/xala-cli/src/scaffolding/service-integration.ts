/**
 * @fileoverview Service Integration for Hybrid Scaffolding
 * @description Integrates scaffolding services with existing ServiceRegistry and ServiceInjector
 */

import { logger } from "../utils/logger.js";
import { HybridScaffoldingOrchestrator } from "./hybrid-orchestrator.js";
import {
	GenerationResult,
	HybridScaffoldingOptions,
	ScaffoldingContext,
	ScaffoldingError,
	ScaffoldingService,
	ServiceRegistration,
} from "./types.js";

// ===== SERVICE REGISTRY =====

export class ScaffoldingServiceRegistry {
	private readonly services: Map<string, ScaffoldingService> = new Map();
	private readonly factories: Map<string, () => ScaffoldingService> = new Map();
	private readonly dependencies: Map<string, readonly string[]> = new Map();

	register(
		registration: ServiceRegistration & { service: ScaffoldingService },
	): void {
		const { name, service, dependencies = [] } = registration;

		this.services.set(name, service);
		this.dependencies.set(name, dependencies);

		logger.debug(
			`Registered scaffolding service: ${name} (Tier ${service.tier})`,
		);
	}

	registerFactory(
		name: string,
		factory: () => ScaffoldingService,
		dependencies: readonly string[] = [],
	): void {
		this.factories.set(name, factory);
		this.dependencies.set(name, dependencies);

		logger.debug(`Registered scaffolding service factory: ${name}`);
	}

	get(name: string): ScaffoldingService | undefined {
		// Try to get existing service
		let service = this.services.get(name);

		if (!service) {
			// Try to create from factory
			const factory = this.factories.get(name);
			if (factory) {
				service = factory();
				this.services.set(name, service);
			}
		}

		return service;
	}

	has(name: string): boolean {
		return this.services.has(name) || this.factories.has(name);
	}

	list(): readonly string[] {
		const serviceNames = new Set([
			...this.services.keys(),
			...this.factories.keys(),
		]);

		return Array.from(serviceNames);
	}

	getDependencies(name: string): readonly string[] {
		return this.dependencies.get(name) || [];
	}

	clear(): void {
		this.services.clear();
		this.factories.clear();
		this.dependencies.clear();
	}
}

// ===== SERVICE INJECTOR =====

export class ScaffoldingServiceInjector {
	private readonly registry: ScaffoldingServiceRegistry;
	private readonly cache: Map<string, ScaffoldingService> = new Map();

	constructor(registry: ScaffoldingServiceRegistry) {
		this.registry = registry;
	}

	inject(name: string): ScaffoldingService {
		// Check cache first
		const cached = this.cache.get(name);
		if (cached) {
			return cached;
		}

		// Resolve dependencies and create service
		const service = this.resolveService(name);
		this.cache.set(name, service);

		return service;
	}

	injectAll(names: readonly string[]): Record<string, ScaffoldingService> {
		const services: Record<string, ScaffoldingService> = {};

		for (const name of names) {
			services[name] = this.inject(name);
		}

		return services;
	}

	private resolveService(name: string): ScaffoldingService {
		const visited = new Set<string>();
		const resolving = new Set<string>();

		const resolve = (serviceName: string): ScaffoldingService => {
			if (resolving.has(serviceName)) {
				throw new ScaffoldingError(
					`Circular dependency detected: ${serviceName}`,
					"CIRCULAR_DEPENDENCY",
				);
			}

			if (visited.has(serviceName)) {
				const service = this.cache.get(serviceName);
				if (service) {
					return service;
				}
			}

			resolving.add(serviceName);

			// Get service dependencies
			const dependencies = this.registry.getDependencies(serviceName);

			// Resolve dependencies first
			for (const dep of dependencies) {
				resolve(dep);
			}

			// Get or create the service
			const service = this.registry.get(serviceName);
			if (!service) {
				throw new ScaffoldingError(
					`Service not found: ${serviceName}`,
					"SERVICE_NOT_FOUND",
				);
			}

			resolving.delete(serviceName);
			visited.add(serviceName);

			return service;
		};

		return resolve(name);
	}
}

// ===== BUILT-IN SERVICES =====

export class ComponentGeneratorService implements ScaffoldingService {
	readonly name = "component-generator";
	readonly tier = 3 as const;

	async generate(
		context: ScaffoldingContext,
		options: { name: string; type?: string; features?: string[] },
	): Promise<GenerationResult> {
		const { name, type = "functional", features = [] } = options;

		logger.info(`Generating ${type} component: ${name}`);

		const files: string[] = [];
		const componentPath = `src/components/${name}`;

		// Generate component file
		const componentContent = this.generateComponentContent(
			name,
			type,
			features,
		);
		files.push(`${componentPath}/${name}.tsx`);

		// Generate test file
		const testContent = this.generateTestContent(name);
		files.push(`${componentPath}/${name}.test.tsx`);

		// Generate story file if requested
		if (features.includes("storybook")) {
			const storyContent = this.generateStoryContent(name);
			files.push(`${componentPath}/${name}.stories.tsx`);
		}

		return {
			success: true,
			files,
			errors: [],
			warnings: [],
		};
	}

	async validate(
		context: ScaffoldingContext,
		options: unknown,
	): Promise<readonly string[]> {
		const errors: string[] = [];
		const opts = options as { name?: string; type?: string };

		if (!opts.name) {
			errors.push("Component name is required");
		}

		if (opts.name && !/^[A-Z][a-zA-Z0-9]*$/.test(opts.name)) {
			errors.push(
				"Component name must start with uppercase letter and contain only alphanumeric characters",
			);
		}

		return errors;
	}

	async preview(
		context: ScaffoldingContext,
		options: unknown,
	): Promise<readonly string[]> {
		const opts = options as { name: string; features?: string[] };
		const { name, features = [] } = opts;

		const files = [
			`src/components/${name}/${name}.tsx`,
			`src/components/${name}/${name}.test.tsx`,
		];

		if (features.includes("storybook")) {
			files.push(`src/components/${name}/${name}.stories.tsx`);
		}

		return files;
	}

	private generateComponentContent(
		name: string,
		type: string,
		features: string[],
	): string {
		const hasProps = features.includes("props");
		const hasState = features.includes("state");

		return `/**
 * @fileoverview ${name} Component
 * @description Generated by Xala CLI
 */

import React${hasState ? ", { useState }" : ""} from 'react';

${
	hasProps
		? `
interface ${name}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
}
`
		: ""
}

export const ${name} = (${hasProps ? `{ className, children }: ${name}Props` : ""}): JSX.Element => {
  ${hasState ? "const [state, setState] = useState<unknown>(null);" : ""}

  return (
    <div${hasProps ? " className={className}" : ""}>
      <h1>${name} Component</h1>
      ${hasProps ? "{children}" : ""}
    </div>
  );
};
`;
	}

	private generateTestContent(name: string): string {
		return `/**
 * @fileoverview ${name} Component Tests
 * @description Generated by Xala CLI
 */

import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name} Component')).toBeInTheDocument();
  });
});
`;
	}

	private generateStoryContent(name: string): string {
		return `/**
 * @fileoverview ${name} Component Stories
 * @description Generated by Xala CLI
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
`;
	}
}

export class PageGeneratorService implements ScaffoldingService {
	readonly name = "page-generator";
	readonly tier = 3 as const;

	async generate(
		context: ScaffoldingContext,
		options: { name: string; route?: string; layout?: string },
	): Promise<GenerationResult> {
		const { name, route, layout = "default" } = options;

		logger.info(`Generating page: ${name}`);

		const files: string[] = [];
		const pagePath = `src/pages/${name}`;

		// Generate page component
		const pageContent = this.generatePageContent(name, route, layout);
		files.push(`${pagePath}/index.tsx`);

		// Generate page layout if custom
		if (layout !== "default") {
			const layoutContent = this.generateLayoutContent(name, layout);
			files.push(`${pagePath}/layout.tsx`);
		}

		return {
			success: true,
			files,
			errors: [],
			warnings: [],
		};
	}

	async validate(
		context: ScaffoldingContext,
		options: unknown,
	): Promise<readonly string[]> {
		const errors: string[] = [];
		const opts = options as { name?: string; route?: string };

		if (!opts.name) {
			errors.push("Page name is required");
		}

		if (opts.route && !opts.route.startsWith("/")) {
			errors.push("Route must start with forward slash");
		}

		return errors;
	}

	async preview(
		context: ScaffoldingContext,
		options: unknown,
	): Promise<readonly string[]> {
		const opts = options as { name: string; layout?: string };
		const { name, layout = "default" } = opts;

		const files = [`src/pages/${name}/index.tsx`];

		if (layout !== "default") {
			files.push(`src/pages/${name}/layout.tsx`);
		}

		return files;
	}

	private generatePageContent(
		name: string,
		route?: string,
		layout?: string,
	): string {
		return `/**
 * @fileoverview ${name} Page
 * @description Generated by Xala CLI
 */

import React from 'react';
${layout !== "default" ? `import { Layout } from './layout';` : ""}

export default function ${name}Page(): JSX.Element {
  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${name}</h1>
      <p className="text-gray-600">
        This page was generated by Xala CLI.
      </p>
    </div>
  );

  ${
		layout !== "default"
			? `
  return (
    <Layout>
      {content}
    </Layout>
  );`
			: "return content;"
	}
}

${
	route
		? `
// Route configuration
export const routeConfig = {
  path: '${route}',
  component: ${name}Page,
};`
		: ""
}
`;
	}

	private generateLayoutContent(name: string, layout: string): string {
		return `/**
 * @fileoverview ${name} Page Layout
 * @description Generated by Xala CLI
 */

import React from 'react';

interface LayoutProps {
  readonly children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">${name}</h1>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          <p>&copy; 2024 Generated by Xala CLI</p>
        </div>
      </footer>
    </div>
  );
};
`;
	}
}

// ===== FACTORY FUNCTIONS =====

export function createScaffoldingServiceRegistry(): ScaffoldingServiceRegistry {
	const registry = new ScaffoldingServiceRegistry();

	// Register built-in services
	registry.register({
		name: "component-generator",
		type: "singleton",
		factory: () => new ComponentGeneratorService(),
		service: new ComponentGeneratorService(),
	});

	registry.register({
		name: "page-generator",
		type: "singleton",
		factory: () => new PageGeneratorService(),
		service: new PageGeneratorService(),
	});

	return registry;
}

export function createScaffoldingServiceInjector(
	registry?: ScaffoldingServiceRegistry,
): ScaffoldingServiceInjector {
	const serviceRegistry = registry || createScaffoldingServiceRegistry();
	return new ScaffoldingServiceInjector(serviceRegistry);
}

// ===== INTEGRATION WITH ORCHESTRATOR =====

export class ServiceIntegratedOrchestrator extends HybridScaffoldingOrchestrator {
	private readonly serviceRegistry: ScaffoldingServiceRegistry;
	private readonly serviceInjector: ScaffoldingServiceInjector;

	constructor(projectPath: string, registry?: ScaffoldingServiceRegistry) {
		super(projectPath);

		this.serviceRegistry = registry || createScaffoldingServiceRegistry();
		this.serviceInjector = new ScaffoldingServiceInjector(this.serviceRegistry);

		// Register services with orchestrator
		this.registerBuiltinServices();
	}

	async generateWithServices(
		context: ScaffoldingContext,
		options: HybridScaffoldingOptions & {
			services?: Record<string, unknown>;
		},
	): Promise<GenerationResult> {
		const results: GenerationResult[] = [];

		// Execute regular tiers first
		const orchestrationResult = await this.orchestrate(context, options);
		results.push(orchestrationResult);

		// Execute services if specified
		if (options.services) {
			for (const [serviceName, serviceOptions] of Object.entries(
				options.services,
			)) {
				try {
					const service = this.serviceInjector.inject(serviceName);
					const serviceResult = await service.generate(context, serviceOptions);
					results.push(serviceResult);
				} catch (error) {
					results.push({
						success: false,
						files: [],
						errors: [error instanceof Error ? error.message : String(error)],
						warnings: [],
					});
				}
			}
		}

		return this.combineResults(results);
	}

	registerService(
		service: ScaffoldingService,
		dependencies: string[] = [],
	): void {
		this.serviceRegistry.register({
			name: service.name,
			type: "singleton",
			factory: () => service,
			service,
			dependencies,
		});

		// Also register with parent orchestrator
		super.registerService(service);
	}

	getServiceRegistry(): ScaffoldingServiceRegistry {
		return this.serviceRegistry;
	}

	getServiceInjector(): ScaffoldingServiceInjector {
		return this.serviceInjector;
	}

	private registerBuiltinServices(): void {
		const services = [
			new ComponentGeneratorService(),
			new PageGeneratorService(),
		];

		for (const service of services) {
			this.registerService(service);
		}
	}

	private combineResults(
		results: readonly GenerationResult[],
	): GenerationResult {
		const allFiles = results.flatMap((r) => r.files);
		const allErrors = results.flatMap((r) => r.errors);
		const allWarnings = results.flatMap((r) => r.warnings);

		return {
			success: allErrors.length === 0,
			files: [...new Set(allFiles)], // Remove duplicates
			errors: allErrors,
			warnings: allWarnings,
		};
	}
}
