/**
 * @fileoverview Dependency Injection and Adapter Pattern Generator
 * @description Comprehensive DI container and adapter pattern implementation with IoC patterns
 * @author Xaheen CLI
 * @version 2.0.0
 */

import type {
	GeneratorOptions,
	GeneratorResult,
	ProjectInfo,
} from "../../types/index.js";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

/**
 * Dependency Injection Pattern Types
 */
export type DIPatternType =
	| "container"
	| "service-locator"
	| "factory"
	| "provider"
	| "adapter"
	| "decorator"
	| "proxy"
	| "bridge"
	| "facade"
	| "registry"
	| "module-system"
	| "interceptor"
	| "middleware";

/**
 * Adapter Pattern Types
 */
export type AdapterPatternType =
	| "interface-adapter"
	| "class-adapter"
	| "object-adapter"
	| "two-way-adapter"
	| "pluggable-adapter"
	| "chain-adapter";

/**
 * DI Scope Types
 */
export type DIScope =
	| "singleton"
	| "transient"
	| "scoped"
	| "request"
	| "session";

/**
 * Dependency Injection Generator Options
 */
export interface DIGeneratorOptions extends GeneratorOptions {
	readonly patternType: DIPatternType | AdapterPatternType;
	readonly containerName?: string;
	readonly services?: readonly ServiceDefinition[];
	readonly adapters?: readonly AdapterDefinition[];
	readonly providers?: readonly ProviderDefinition[];
	readonly decorators?: readonly DecoratorDefinition[];
	readonly interceptors?: readonly InterceptorDefinition[];
	readonly middleware?: readonly MiddlewareDefinition[];
	readonly modules?: readonly ModuleDefinition[];
	readonly configuration?: DIConfiguration;
	readonly includeTests?: boolean;
	readonly includeDocs?: boolean;
	readonly framework?:
		| "nestjs"
		| "inversify"
		| "awilix"
		| "tsyringe"
		| "generic";
}

/**
 * Service Definition
 */
export interface ServiceDefinition {
	readonly name: string;
	readonly interface?: string;
	readonly implementation: string;
	readonly scope: DIScope;
	readonly dependencies: readonly string[];
	readonly factory?: string;
	readonly tags?: readonly string[];
	readonly configuration?: Record<string, any>;
	readonly description?: string;
}

/**
 * Adapter Definition
 */
export interface AdapterDefinition {
	readonly name: string;
	readonly sourceInterface: string;
	readonly targetInterface: string;
	readonly adapteeClass: string;
	readonly adapterType: AdapterPatternType;
	readonly methods: readonly AdapterMethod[];
	readonly description?: string;
}

/**
 * Provider Definition
 */
export interface ProviderDefinition {
	readonly name: string;
	readonly provides: string;
	readonly useClass?: string;
	readonly useFactory?: FactoryDefinition;
	readonly useValue?: any;
	readonly scope: DIScope;
	readonly inject?: readonly string[];
	readonly description?: string;
}

/**
 * Decorator Definition
 */
export interface DecoratorDefinition {
	readonly name: string;
	readonly target: string;
	readonly type: "class" | "method" | "property" | "parameter";
	readonly metadata?: Record<string, any>;
	readonly behavior?: DecoratorBehavior;
	readonly description?: string;
}

/**
 * Interceptor Definition
 */
export interface InterceptorDefinition {
	readonly name: string;
	readonly target: string | "global";
	readonly order: number;
	readonly beforeExecution?: boolean;
	readonly afterExecution?: boolean;
	readonly onError?: boolean;
	readonly configuration?: Record<string, any>;
	readonly description?: string;
}

/**
 * Middleware Definition
 */
export interface MiddlewareDefinition {
	readonly name: string;
	readonly order: number;
	readonly path?: string;
	readonly method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "ALL";
	readonly configuration?: Record<string, any>;
	readonly description?: string;
}

/**
 * Module Definition
 */
export interface ModuleDefinition {
	readonly name: string;
	readonly imports?: readonly string[];
	readonly providers: readonly string[];
	readonly exports?: readonly string[];
	readonly controllers?: readonly string[];
	readonly configuration?: Record<string, any>;
	readonly description?: string;
}

/**
 * Factory Definition
 */
export interface FactoryDefinition {
	readonly factoryName: string;
	readonly parameters: readonly FactoryParameter[];
	readonly returnType: string;
	readonly implementation: string;
}

/**
 * Factory Parameter
 */
export interface FactoryParameter {
	readonly name: string;
	readonly type: string;
	readonly inject?: string;
	readonly optional?: boolean;
}

/**
 * Adapter Method
 */
export interface AdapterMethod {
	readonly name: string;
	readonly sourceMethod: string;
	readonly targetMethod: string;
	readonly parameters: readonly AdapterParameter[];
	readonly returnType: string;
	readonly transformation?: string;
}

/**
 * Adapter Parameter
 */
export interface AdapterParameter {
	readonly name: string;
	readonly type: string;
	readonly transformation?: string;
}

/**
 * Decorator Behavior
 */
export interface DecoratorBehavior {
	readonly preExecution?: string;
	readonly postExecution?: string;
	readonly errorHandling?: string;
	readonly validation?: string;
}

/**
 * DI Configuration
 */
export interface DIConfiguration {
	readonly autoWiring?: boolean;
	readonly strictMode?: boolean;
	readonly circularDependencyCheck?: boolean;
	readonly lazyLoading?: boolean;
	readonly caching?: boolean;
	readonly logging?: boolean;
	readonly profiling?: boolean;
}

/**
 * Dependency Injection Pattern Generator
 */
export class DependencyInjectionGenerator {
	private readonly projectPath: string;
	private readonly templatesPath: string;

	constructor(projectPath: string) {
		this.projectPath = projectPath;
		this.templatesPath = join(
			__dirname,
			"../../templates/patterns/dependency-injection",
		);
	}

	/**
	 * Generate DI pattern based on type
	 */
	async generate(
		name: string,
		options: DIGeneratorOptions,
		projectInfo?: ProjectInfo,
	): Promise<GeneratorResult> {
		try {
			const { patternType } = options;

			// Ensure DI structure exists
			await this.ensureDIStructure();

			switch (patternType) {
				case "container":
					return await this.generateDIContainer(name, options);
				case "service-locator":
					return await this.generateServiceLocator(name, options);
				case "factory":
					return await this.generateFactory(name, options);
				case "provider":
					return await this.generateProvider(name, options);
				case "adapter":
				case "interface-adapter":
				case "class-adapter":
				case "object-adapter":
				case "two-way-adapter":
				case "pluggable-adapter":
				case "chain-adapter":
					return await this.generateAdapter(name, options);
				case "decorator":
					return await this.generateDecorator(name, options);
				case "proxy":
					return await this.generateProxy(name, options);
				case "bridge":
					return await this.generateBridge(name, options);
				case "facade":
					return await this.generateFacade(name, options);
				case "registry":
					return await this.generateRegistry(name, options);
				case "module-system":
					return await this.generateModuleSystem(name, options);
				case "interceptor":
					return await this.generateInterceptor(name, options);
				case "middleware":
					return await this.generateMiddleware(name, options);
				default:
					return {
						success: false,
						message: `Unknown DI pattern type: ${patternType}`,
						error: `Pattern type '${patternType}' is not supported`,
					};
			}
		} catch (error) {
			return {
				success: false,
				message: `Failed to generate DI pattern: ${error instanceof Error ? error.message : "Unknown error"}`,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Generate DI Container
	 */
	private async generateDIContainer(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const {
			services = [],
			providers = [],
			modules = [],
			configuration = {},
			includeTests = true,
			framework = "generic",
		} = options;
		const files: string[] = [];

		// Generate main DI container
		const containerContent = this.generateDIContainerClass(
			name,
			services,
			providers,
			configuration,
			framework,
		);
		files.push(
			await this.writeFile(this.getDIContainerPath(name), containerContent),
		);

		// Generate container interface
		const containerInterfaceContent = this.generateDIContainerInterface(
			name,
			services,
		);
		files.push(
			await this.writeFile(
				this.getDIContainerInterfacePath(name),
				containerInterfaceContent,
			),
		);

		// Generate service registry
		const registryContent = this.generateServiceRegistry(services);
		files.push(
			await this.writeFile(this.getServiceRegistryPath(), registryContent),
		);

		// Generate container configuration
		const configContent = this.generateDIConfiguration(configuration);
		files.push(await this.writeFile(this.getDIConfigPath(), configContent));

		// Generate service definitions
		for (const service of services) {
			const serviceContent = this.generateServiceDefinition(service);
			files.push(
				await this.writeFile(
					this.getServiceDefinitionPath(service.name),
					serviceContent,
				),
			);

			if (service.interface) {
				const interfaceContent = this.generateServiceInterface(service);
				files.push(
					await this.writeFile(
						this.getServiceInterfacePath(service.name),
						interfaceContent,
					),
				);
			}
		}

		// Generate providers
		for (const provider of providers) {
			const providerContent = this.generateProviderClass(provider);
			files.push(
				await this.writeFile(
					this.getProviderPath(provider.name),
					providerContent,
				),
			);
		}

		// Generate modules
		for (const module of modules) {
			const moduleContent = this.generateModuleClass(module, framework);
			files.push(
				await this.writeFile(this.getModulePath(module.name), moduleContent),
			);
		}

		// Generate container builder
		const builderContent = this.generateContainerBuilder(
			name,
			services,
			providers,
			modules,
		);
		files.push(
			await this.writeFile(this.getContainerBuilderPath(name), builderContent),
		);

		// Generate tests if requested
		if (includeTests) {
			const containerTestContent = this.generateContainerTest(name, services);
			files.push(
				await this.writeFile(
					this.getContainerTestPath(name),
					containerTestContent,
				),
			);

			for (const service of services) {
				const serviceTestContent = this.generateServiceTest(service);
				files.push(
					await this.writeFile(
						this.getServiceTestPath(service.name),
						serviceTestContent,
					),
				);
			}
		}

		// Generate documentation
		const docContent = this.generateDIDocumentation(
			name,
			services,
			providers,
			modules,
		);
		files.push(await this.writeFile(this.getDIDocPath(), docContent));

		return {
			success: true,
			message: `DI Container '${name}' generated successfully`,
			files,
			commands: [
				"npm run type-check",
				"npm run lint",
				"npm run test:unit",
				"npm run build",
			],
			nextSteps: [
				`Navigate to src/di to explore the generated DI structure`,
				"Configure service bindings and scopes",
				"Implement service factories for complex objects",
				"Add circular dependency detection",
				"Set up container modules for feature organization",
				"Add performance monitoring and profiling",
				"Configure lazy loading for expensive services",
				"Add container lifecycle management",
				"Implement service discovery mechanisms",
				"Add container health checks and diagnostics",
			],
		};
	}

	/**
	 * Generate Service Locator
	 */
	private async generateServiceLocator(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const { services = [], includeTests = true } = options;
		const files: string[] = [];

		const serviceLocatorContent = this.generateServiceLocatorClass(
			name,
			services,
		);
		files.push(
			await this.writeFile(
				this.getServiceLocatorPath(name),
				serviceLocatorContent,
			),
		);

		const serviceLocatorInterfaceContent =
			this.generateServiceLocatorInterface(name);
		files.push(
			await this.writeFile(
				this.getServiceLocatorInterfacePath(name),
				serviceLocatorInterfaceContent,
			),
		);

		if (includeTests) {
			const testContent = this.generateServiceLocatorTest(name, services);
			files.push(
				await this.writeFile(this.getServiceLocatorTestPath(name), testContent),
			);
		}

		return {
			success: true,
			message: `Service Locator '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Register services with the service locator",
				"Implement service resolution logic",
				"Add error handling for missing services",
				"Configure service scoping",
				"Add service caching if needed",
			],
		};
	}

	/**
	 * Generate Factory
	 */
	private async generateFactory(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const { services = [], includeTests = true } = options;
		const files: string[] = [];

		const factoryContent = this.generateFactoryClass(name, services);
		files.push(await this.writeFile(this.getFactoryPath(name), factoryContent));

		const factoryInterfaceContent = this.generateFactoryInterface(name);
		files.push(
			await this.writeFile(
				this.getFactoryInterfacePath(name),
				factoryInterfaceContent,
			),
		);

		if (includeTests) {
			const testContent = this.generateFactoryTest(name, services);
			files.push(
				await this.writeFile(this.getFactoryTestPath(name), testContent),
			);
		}

		return {
			success: true,
			message: `Factory '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement factory creation logic",
				"Add parameter validation",
				"Configure factory dependencies",
				"Add factory caching if needed",
				"Implement factory strategy patterns",
			],
		};
	}

	/**
	 * Generate Provider
	 */
	private async generateProvider(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const { providers = [], includeTests = true } = options;
		const files: string[] = [];

		if (providers.length === 0) {
			// Generate a basic provider if none specified
			const basicProvider: ProviderDefinition = {
				name: name,
				provides: `I${this.pascalCase(name)}`,
				useClass: this.pascalCase(name),
				scope: "singleton",
			};

			const providerContent = this.generateProviderClass(basicProvider);
			files.push(
				await this.writeFile(this.getProviderPath(name), providerContent),
			);

			if (includeTests) {
				const testContent = this.generateProviderTest(basicProvider);
				files.push(
					await this.writeFile(this.getProviderTestPath(name), testContent),
				);
			}
		} else {
			for (const provider of providers) {
				const providerContent = this.generateProviderClass(provider);
				files.push(
					await this.writeFile(
						this.getProviderPath(provider.name),
						providerContent,
					),
				);

				if (includeTests) {
					const testContent = this.generateProviderTest(provider);
					files.push(
						await this.writeFile(
							this.getProviderTestPath(provider.name),
							testContent,
						),
					);
				}
			}
		}

		return {
			success: true,
			message: `Provider '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement provider logic",
				"Configure provider dependencies",
				"Add provider validation",
				"Set up provider scoping",
				"Add provider error handling",
			],
		};
	}

	/**
	 * Generate Adapter
	 */
	private async generateAdapter(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const { adapters = [], includeTests = true } = options;
		const files: string[] = [];

		if (adapters.length === 0) {
			// Generate a basic adapter if none specified
			const basicAdapter: AdapterDefinition = {
				name: name,
				sourceInterface: `I${this.pascalCase(name)}Source`,
				targetInterface: `I${this.pascalCase(name)}Target`,
				adapteeClass: `${this.pascalCase(name)}Adaptee`,
				adapterType: "interface-adapter",
				methods: [],
			};

			const adapterContent = this.generateAdapterClass(basicAdapter);
			files.push(
				await this.writeFile(this.getAdapterPath(name), adapterContent),
			);

			const sourceInterfaceContent =
				this.generateAdapterSourceInterface(basicAdapter);
			files.push(
				await this.writeFile(
					this.getAdapterSourceInterfacePath(name),
					sourceInterfaceContent,
				),
			);

			const targetInterfaceContent =
				this.generateAdapterTargetInterface(basicAdapter);
			files.push(
				await this.writeFile(
					this.getAdapterTargetInterfacePath(name),
					targetInterfaceContent,
				),
			);

			if (includeTests) {
				const testContent = this.generateAdapterTest(basicAdapter);
				files.push(
					await this.writeFile(this.getAdapterTestPath(name), testContent),
				);
			}
		} else {
			for (const adapter of adapters) {
				const adapterContent = this.generateAdapterClass(adapter);
				files.push(
					await this.writeFile(
						this.getAdapterPath(adapter.name),
						adapterContent,
					),
				);

				const sourceInterfaceContent =
					this.generateAdapterSourceInterface(adapter);
				files.push(
					await this.writeFile(
						this.getAdapterSourceInterfacePath(adapter.name),
						sourceInterfaceContent,
					),
				);

				const targetInterfaceContent =
					this.generateAdapterTargetInterface(adapter);
				files.push(
					await this.writeFile(
						this.getAdapterTargetInterfacePath(adapter.name),
						targetInterfaceContent,
					),
				);

				if (includeTests) {
					const testContent = this.generateAdapterTest(adapter);
					files.push(
						await this.writeFile(
							this.getAdapterTestPath(adapter.name),
							testContent,
						),
					);
				}
			}
		}

		return {
			success: true,
			message: `Adapter '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement adapter methods",
				"Add data transformation logic",
				"Configure adapter dependencies",
				"Add adapter error handling",
				"Test adapter compatibility",
			],
		};
	}

	/**
	 * Generate Decorator
	 */
	private async generateDecorator(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const {
			decorators = [],
			includeTests = true,
			framework = "generic",
		} = options;
		const files: string[] = [];

		if (decorators.length === 0) {
			// Generate a basic decorator if none specified
			const basicDecorator: DecoratorDefinition = {
				name: name,
				target: "method",
				type: "method",
			};

			const decoratorContent = this.generateDecoratorClass(
				basicDecorator,
				framework,
			);
			files.push(
				await this.writeFile(this.getDecoratorPath(name), decoratorContent),
			);

			if (includeTests) {
				const testContent = this.generateDecoratorTest(basicDecorator);
				files.push(
					await this.writeFile(this.getDecoratorTestPath(name), testContent),
				);
			}
		} else {
			for (const decorator of decorators) {
				const decoratorContent = this.generateDecoratorClass(
					decorator,
					framework,
				);
				files.push(
					await this.writeFile(
						this.getDecoratorPath(decorator.name),
						decoratorContent,
					),
				);

				if (includeTests) {
					const testContent = this.generateDecoratorTest(decorator);
					files.push(
						await this.writeFile(
							this.getDecoratorTestPath(decorator.name),
							testContent,
						),
					);
				}
			}
		}

		return {
			success: true,
			message: `Decorator '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement decorator logic",
				"Add metadata handling",
				"Configure decorator behavior",
				"Add decorator validation",
				"Test decorator functionality",
			],
		};
	}

	/**
	 * Generate other patterns (simplified implementations)
	 */
	private async generateProxy(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const files: string[] = [];
		const proxyContent = this.generateProxyClass(name);
		files.push(await this.writeFile(this.getProxyPath(name), proxyContent));

		return {
			success: true,
			message: `Proxy '${name}' generated successfully`,
			files,
			commands: ["npm run type-check"],
			nextSteps: [
				"Implement proxy logic",
				"Add proxy interceptors",
				"Configure proxy behavior",
			],
		};
	}

	private async generateBridge(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const files: string[] = [];
		const bridgeContent = this.generateBridgeClass(name);
		files.push(await this.writeFile(this.getBridgePath(name), bridgeContent));

		return {
			success: true,
			message: `Bridge '${name}' generated successfully`,
			files,
			commands: ["npm run type-check"],
			nextSteps: [
				"Implement bridge logic",
				"Add bridge abstraction",
				"Configure bridge implementations",
			],
		};
	}

	private async generateFacade(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const files: string[] = [];
		const facadeContent = this.generateFacadeClass(name);
		files.push(await this.writeFile(this.getFacadePath(name), facadeContent));

		return {
			success: true,
			message: `Facade '${name}' generated successfully`,
			files,
			commands: ["npm run type-check"],
			nextSteps: [
				"Implement facade methods",
				"Add subsystem coordination",
				"Configure facade dependencies",
			],
		};
	}

	private async generateRegistry(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const files: string[] = [];
		const registryContent = this.generateRegistryClass(name);
		files.push(
			await this.writeFile(this.getRegistryPath(name), registryContent),
		);

		return {
			success: true,
			message: `Registry '${name}' generated successfully`,
			files,
			commands: ["npm run type-check"],
			nextSteps: [
				"Implement registry storage",
				"Add registry queries",
				"Configure registry persistence",
			],
		};
	}

	private async generateModuleSystem(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const { modules = [] } = options;
		const files: string[] = [];

		const moduleSystemContent = this.generateModuleSystemClass(name, modules);
		files.push(
			await this.writeFile(this.getModuleSystemPath(name), moduleSystemContent),
		);

		return {
			success: true,
			message: `Module System '${name}' generated successfully`,
			files,
			commands: ["npm run type-check"],
			nextSteps: [
				"Configure module loading",
				"Add module dependencies",
				"Implement module lifecycle",
			],
		};
	}

	private async generateInterceptor(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const {
			interceptors = [],
			includeTests = true,
			framework = "generic",
		} = options;
		const files: string[] = [];

		if (interceptors.length === 0) {
			const basicInterceptor: InterceptorDefinition = {
				name: name,
				target: "global",
				order: 1,
				beforeExecution: true,
				afterExecution: true,
			};

			const interceptorContent = this.generateInterceptorClass(
				basicInterceptor,
				framework,
			);
			files.push(
				await this.writeFile(this.getInterceptorPath(name), interceptorContent),
			);

			if (includeTests) {
				const testContent = this.generateInterceptorTest(basicInterceptor);
				files.push(
					await this.writeFile(this.getInterceptorTestPath(name), testContent),
				);
			}
		} else {
			for (const interceptor of interceptors) {
				const interceptorContent = this.generateInterceptorClass(
					interceptor,
					framework,
				);
				files.push(
					await this.writeFile(
						this.getInterceptorPath(interceptor.name),
						interceptorContent,
					),
				);

				if (includeTests) {
					const testContent = this.generateInterceptorTest(interceptor);
					files.push(
						await this.writeFile(
							this.getInterceptorTestPath(interceptor.name),
							testContent,
						),
					);
				}
			}
		}

		return {
			success: true,
			message: `Interceptor '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement interceptor logic",
				"Add interceptor ordering",
				"Configure interceptor targets",
				"Add error handling",
				"Test interceptor behavior",
			],
		};
	}

	private async generateMiddleware(
		name: string,
		options: DIGeneratorOptions,
	): Promise<GeneratorResult> {
		const {
			middleware = [],
			includeTests = true,
			framework = "generic",
		} = options;
		const files: string[] = [];

		if (middleware.length === 0) {
			const basicMiddleware: MiddlewareDefinition = {
				name: name,
				order: 1,
				method: "ALL",
			};

			const middlewareContent = this.generateMiddlewareClass(
				basicMiddleware,
				framework,
			);
			files.push(
				await this.writeFile(this.getMiddlewarePath(name), middlewareContent),
			);

			if (includeTests) {
				const testContent = this.generateMiddlewareTest(basicMiddleware);
				files.push(
					await this.writeFile(this.getMiddlewareTestPath(name), testContent),
				);
			}
		} else {
			for (const middlewareItem of middleware) {
				const middlewareContent = this.generateMiddlewareClass(
					middlewareItem,
					framework,
				);
				files.push(
					await this.writeFile(
						this.getMiddlewarePath(middlewareItem.name),
						middlewareContent,
					),
				);

				if (includeTests) {
					const testContent = this.generateMiddlewareTest(middlewareItem);
					files.push(
						await this.writeFile(
							this.getMiddlewareTestPath(middlewareItem.name),
							testContent,
						),
					);
				}
			}
		}

		return {
			success: true,
			message: `Middleware '${name}' generated successfully`,
			files,
			commands: ["npm run type-check", "npm run test:unit"],
			nextSteps: [
				"Implement middleware logic",
				"Add middleware ordering",
				"Configure middleware paths",
				"Add error handling",
				"Test middleware behavior",
			],
		};
	}

	// Path generation methods
	private getDIBasePath(): string {
		return join(this.projectPath, "src", "di");
	}

	private getDIContainerPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"container",
			`${this.kebabCase(name)}.container.ts`,
		);
	}

	private getDIContainerInterfacePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interfaces",
			`${this.kebabCase(name)}.container.interface.ts`,
		);
	}

	private getServiceRegistryPath(): string {
		return join(this.getDIBasePath(), "registry", "service.registry.ts");
	}

	private getDIConfigPath(): string {
		return join(this.getDIBasePath(), "config", "di.config.ts");
	}

	private getServiceDefinitionPath(serviceName: string): string {
		return join(
			this.getDIBasePath(),
			"services",
			`${this.kebabCase(serviceName)}.service.ts`,
		);
	}

	private getServiceInterfacePath(serviceName: string): string {
		return join(
			this.getDIBasePath(),
			"interfaces",
			`${this.kebabCase(serviceName)}.service.interface.ts`,
		);
	}

	private getProviderPath(providerName: string): string {
		return join(
			this.getDIBasePath(),
			"providers",
			`${this.kebabCase(providerName)}.provider.ts`,
		);
	}

	private getModulePath(moduleName: string): string {
		return join(
			this.getDIBasePath(),
			"modules",
			`${this.kebabCase(moduleName)}.module.ts`,
		);
	}

	private getContainerBuilderPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"builders",
			`${this.kebabCase(name)}.builder.ts`,
		);
	}

	private getServiceLocatorPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"locators",
			`${this.kebabCase(name)}.locator.ts`,
		);
	}

	private getServiceLocatorInterfacePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interfaces",
			`${this.kebabCase(name)}.locator.interface.ts`,
		);
	}

	private getFactoryPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"factories",
			`${this.kebabCase(name)}.factory.ts`,
		);
	}

	private getFactoryInterfacePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interfaces",
			`${this.kebabCase(name)}.factory.interface.ts`,
		);
	}

	private getAdapterPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"adapters",
			`${this.kebabCase(name)}.adapter.ts`,
		);
	}

	private getAdapterSourceInterfacePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interfaces",
			`${this.kebabCase(name)}.source.interface.ts`,
		);
	}

	private getAdapterTargetInterfacePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interfaces",
			`${this.kebabCase(name)}.target.interface.ts`,
		);
	}

	private getDecoratorPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"decorators",
			`${this.kebabCase(name)}.decorator.ts`,
		);
	}

	private getProxyPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"proxies",
			`${this.kebabCase(name)}.proxy.ts`,
		);
	}

	private getBridgePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"bridges",
			`${this.kebabCase(name)}.bridge.ts`,
		);
	}

	private getFacadePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"facades",
			`${this.kebabCase(name)}.facade.ts`,
		);
	}

	private getRegistryPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"registries",
			`${this.kebabCase(name)}.registry.ts`,
		);
	}

	private getModuleSystemPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"systems",
			`${this.kebabCase(name)}.system.ts`,
		);
	}

	private getInterceptorPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interceptors",
			`${this.kebabCase(name)}.interceptor.ts`,
		);
	}

	private getMiddlewarePath(name: string): string {
		return join(
			this.getDIBasePath(),
			"middleware",
			`${this.kebabCase(name)}.middleware.ts`,
		);
	}

	private getDIDocPath(): string {
		return join(this.getDIBasePath(), "README.md");
	}

	// Test path methods
	private getContainerTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"container",
			`${this.kebabCase(name)}.container.spec.ts`,
		);
	}

	private getServiceTestPath(serviceName: string): string {
		return join(
			this.getDIBasePath(),
			"services",
			`${this.kebabCase(serviceName)}.service.spec.ts`,
		);
	}

	private getServiceLocatorTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"locators",
			`${this.kebabCase(name)}.locator.spec.ts`,
		);
	}

	private getFactoryTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"factories",
			`${this.kebabCase(name)}.factory.spec.ts`,
		);
	}

	private getProviderTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"providers",
			`${this.kebabCase(name)}.provider.spec.ts`,
		);
	}

	private getAdapterTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"adapters",
			`${this.kebabCase(name)}.adapter.spec.ts`,
		);
	}

	private getDecoratorTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"decorators",
			`${this.kebabCase(name)}.decorator.spec.ts`,
		);
	}

	private getInterceptorTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"interceptors",
			`${this.kebabCase(name)}.interceptor.spec.ts`,
		);
	}

	private getMiddlewareTestPath(name: string): string {
		return join(
			this.getDIBasePath(),
			"middleware",
			`${this.kebabCase(name)}.middleware.spec.ts`,
		);
	}

	/**
	 * Ensure DI structure exists
	 */
	private async ensureDIStructure(): Promise<void> {
		const basePath = this.getDIBasePath();
		const directories = [
			"container",
			"services",
			"providers",
			"modules",
			"factories",
			"adapters",
			"decorators",
			"interceptors",
			"middleware",
			"proxies",
			"bridges",
			"facades",
			"registries",
			"systems",
			"locators",
			"builders",
			"interfaces",
			"registry",
			"config",
		];

		for (const dir of directories) {
			const fullPath = join(basePath, dir);
			if (!existsSync(fullPath)) {
				mkdirSync(fullPath, { recursive: true });
			}
		}
	}

	/**
	 * Write file and return relative path
	 */
	private async writeFile(filePath: string, content: string): Promise<string> {
		const fs = await import("fs/promises");
		const dir = join(filePath, "..");
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		await fs.writeFile(filePath, content, "utf-8");
		return filePath.replace(this.projectPath + "/", "");
	}

	// Content generation methods (simplified for brevity)
	private generateDIContainerClass(
		name: string,
		services: readonly ServiceDefinition[],
		providers: readonly ProviderDefinition[],
		configuration: DIConfiguration,
		framework: string,
	): string {
		const servicesCode = services
			.map(
				(service) =>
					`    this.bind<${service.interface || service.implementation}>('${service.name}').to(${service.implementation}).inScope('${service.scope}');`,
			)
			.join("\n");

		return `/**
 * ${name} DI Container
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { Container, interfaces } from 'inversify';
import { I${this.pascalCase(name)}Container } from '../interfaces/${this.kebabCase(name)}.container.interface';

export class ${this.pascalCase(name)}Container implements I${this.pascalCase(name)}Container {
  private container: Container;

  constructor() {
    this.container = new Container({
      autoBindInjectable: ${configuration.autoWiring || false},
      defaultScope: 'Singleton',
      skipBaseClassChecks: ${!configuration.strictMode || true},
    });
    this.configure();
  }

  private configure(): void {
${servicesCode}
  }

  get<T>(identifier: string): T {
    return this.container.get<T>(identifier);
  }

  getAll<T>(identifier: string): T[] {
    return this.container.getAll<T>(identifier);
  }

  isBound(identifier: string): boolean {
    return this.container.isBound(identifier);
  }

  bind<T>(identifier: string): interfaces.BindingToSyntax<T> {
    return this.container.bind<T>(identifier);
  }

  unbind(identifier: string): void {
    this.container.unbind(identifier);
  }

  snapshot(): void {
    this.container.snapshot();
  }

  restore(): void {
    this.container.restore();
  }
}
`;
	}

	private generateDIContainerInterface(
		name: string,
		services: readonly ServiceDefinition[],
	): string {
		return `/**
 * ${name} DI Container Interface
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface I${this.pascalCase(name)}Container {
  get<T>(identifier: string): T;
  getAll<T>(identifier: string): T[];
  isBound(identifier: string): boolean;
  bind<T>(identifier: string): any;
  unbind(identifier: string): void;
  snapshot(): void;
  restore(): void;
}
`;
	}

	private generateServiceRegistry(
		services: readonly ServiceDefinition[],
	): string {
		const serviceTokens = services
			.map(
				(service) =>
					`  ${this.constantCase(service.name)}: Symbol.for('${service.name}'),`,
			)
			.join("\n");

		return `/**
 * Service Registry
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export const SERVICE_TOKENS = {
${serviceTokens}
};

export interface ServiceMetadata {
  name: string;
  interface?: string;
  implementation: string;
  scope: string;
  dependencies: string[];
  tags: string[];
}

export class ServiceRegistry {
  private services = new Map<string, ServiceMetadata>();

  register(metadata: ServiceMetadata): void {
    this.services.set(metadata.name, metadata);
  }

  get(name: string): ServiceMetadata | undefined {
    return this.services.get(name);
  }

  getAll(): ServiceMetadata[] {
    return Array.from(this.services.values());
  }

  getByTag(tag: string): ServiceMetadata[] {
    return this.getAll().filter(service => service.tags.includes(tag));
  }
}
`;
	}

	private generateDIConfiguration(configuration: DIConfiguration): string {
		return `/**
 * DI Configuration
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface DIConfig {
  autoWiring: boolean;
  strictMode: boolean;
  circularDependencyCheck: boolean;
  lazyLoading: boolean;
  caching: boolean;
  logging: boolean;
  profiling: boolean;
}

export const defaultDIConfig: DIConfig = {
  autoWiring: ${configuration.autoWiring || false},
  strictMode: ${configuration.strictMode || true},
  circularDependencyCheck: ${configuration.circularDependencyCheck || true},
  lazyLoading: ${configuration.lazyLoading || false},
  caching: ${configuration.caching || true},
  logging: ${configuration.logging || false},
  profiling: ${configuration.profiling || false},
};
`;
	}

	private generateServiceDefinition(service: ServiceDefinition): string {
		const dependenciesCode = service.dependencies
			.map(
				(dep) =>
					`    @inject('${dep}') private readonly ${this.camelCase(dep)}: ${this.pascalCase(dep)},`,
			)
			.join("\n");

		return `/**
 * ${service.name} Service
 * ${service.description || ""}
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { injectable, inject } from 'inversify';
${service.interface ? `import { ${service.interface} } from '../interfaces/${this.kebabCase(service.name)}.service.interface';` : ""}

@injectable()
export class ${this.pascalCase(service.implementation)}${service.interface ? ` implements ${service.interface}` : ""} {
  constructor(
${dependenciesCode}
  ) {}

  // TODO: Implement service methods
}
`;
	}

	private generateServiceInterface(service: ServiceDefinition): string {
		return `/**
 * ${service.name} Service Interface
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface ${service.interface} {
  // TODO: Define service interface methods
}
`;
	}

	private generateProviderClass(provider: ProviderDefinition): string {
		if (provider.useFactory) {
			return `/**
 * ${provider.name} Provider
 * ${provider.description || ""}
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { FactoryProvider } from '@nestjs/common';

export const ${this.pascalCase(provider.name)}Provider: FactoryProvider = {
  provide: '${provider.provides}',
  useFactory: ${provider.useFactory.factoryName},
  inject: [${provider.inject?.map((dep) => `'${dep}'`).join(", ") || ""}],
  scope: '${provider.scope}',
};
`;
		} else if (provider.useValue) {
			return `/**
 * ${provider.name} Provider
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { ValueProvider } from '@nestjs/common';

export const ${this.pascalCase(provider.name)}Provider: ValueProvider = {
  provide: '${provider.provides}',
  useValue: ${JSON.stringify(provider.useValue, null, 2)},
};
`;
		} else {
			return `/**
 * ${provider.name} Provider
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { ClassProvider } from '@nestjs/common';

export const ${this.pascalCase(provider.name)}Provider: ClassProvider = {
  provide: '${provider.provides}',
  useClass: ${provider.useClass},
  scope: '${provider.scope}',
};
`;
		}
	}

	private generateModuleClass(
		module: ModuleDefinition,
		framework: string,
	): string {
		const imports =
			module.imports?.map((imp) => this.pascalCase(imp)).join(", ") || "";
		const providers = module.providers
			.map((prov) => this.pascalCase(prov))
			.join(", ");
		const exports =
			module.exports?.map((exp) => this.pascalCase(exp)).join(", ") || "";
		const controllers =
			module.controllers?.map((ctrl) => this.pascalCase(ctrl)).join(", ") || "";

		if (framework === "nestjs") {
			return `/**
 * ${module.name} Module
 * ${module.description || ""}
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { Module } from '@nestjs/common';

@Module({
  imports: [${imports}],
  providers: [${providers}],
  controllers: [${controllers}],
  exports: [${exports}],
})
export class ${this.pascalCase(module.name)}Module {}
`;
		} else {
			return `/**
 * ${module.name} Module
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export class ${this.pascalCase(module.name)}Module {
  // TODO: Implement module configuration
}
`;
		}
	}

	private generateContainerBuilder(
		name: string,
		services: readonly ServiceDefinition[],
		providers: readonly ProviderDefinition[],
		modules: readonly ModuleDefinition[],
	): string {
		return `/**
 * ${name} Container Builder
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { ${this.pascalCase(name)}Container } from '../container/${this.kebabCase(name)}.container';

export class ${this.pascalCase(name)}ContainerBuilder {
  private container: ${this.pascalCase(name)}Container;

  constructor() {
    this.container = new ${this.pascalCase(name)}Container();
  }

  build(): ${this.pascalCase(name)}Container {
    return this.container;
  }

  // TODO: Add builder methods for dynamic configuration
}
`;
	}

	private generateServiceLocatorClass(
		name: string,
		services: readonly ServiceDefinition[],
	): string {
		return `/**
 * ${name} Service Locator
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { I${this.pascalCase(name)}ServiceLocator } from '../interfaces/${this.kebabCase(name)}.locator.interface';

export class ${this.pascalCase(name)}ServiceLocator implements I${this.pascalCase(name)}ServiceLocator {
  private services = new Map<string, any>();

  register<T>(identifier: string, service: T): void {
    this.services.set(identifier, service);
  }

  get<T>(identifier: string): T {
    const service = this.services.get(identifier);
    if (!service) {
      throw new Error(\`Service '\${identifier}' not found\`);
    }
    return service as T;
  }

  has(identifier: string): boolean {
    return this.services.has(identifier);
  }

  remove(identifier: string): boolean {
    return this.services.delete(identifier);
  }
}
`;
	}

	private generateServiceLocatorInterface(name: string): string {
		return `/**
 * ${name} Service Locator Interface
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface I${this.pascalCase(name)}ServiceLocator {
  register<T>(identifier: string, service: T): void;
  get<T>(identifier: string): T;
  has(identifier: string): boolean;
  remove(identifier: string): boolean;
}
`;
	}

	private generateFactoryClass(
		name: string,
		services: readonly ServiceDefinition[],
	): string {
		return `/**
 * ${name} Factory
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { I${this.pascalCase(name)}Factory } from '../interfaces/${this.kebabCase(name)}.factory.interface';

export class ${this.pascalCase(name)}Factory implements I${this.pascalCase(name)}Factory {
  create<T>(type: string, ...args: any[]): T {
    // TODO: Implement factory creation logic
    throw new Error('Factory method not implemented');
  }

  canCreate(type: string): boolean {
    // TODO: Implement creation capability check
    return false;
  }
}
`;
	}

	private generateFactoryInterface(name: string): string {
		return `/**
 * ${name} Factory Interface
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface I${this.pascalCase(name)}Factory {
  create<T>(type: string, ...args: any[]): T;
  canCreate(type: string): boolean;
}
`;
	}

	private generateAdapterClass(adapter: AdapterDefinition): string {
		const methodsCode = adapter.methods
			.map(
				(method) =>
					`  ${method.name}(${method.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}): ${method.returnType} {\n    // TODO: Adapt ${method.sourceMethod} to ${method.targetMethod}\n    throw new Error('Adapter method not implemented');\n  }`,
			)
			.join("\n\n");

		return `/**
 * ${adapter.name} Adapter
 * ${adapter.description || ""}
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { ${adapter.sourceInterface} } from '../interfaces/${this.kebabCase(adapter.name)}.source.interface';
import { ${adapter.targetInterface} } from '../interfaces/${this.kebabCase(adapter.name)}.target.interface';

export class ${this.pascalCase(adapter.name)}Adapter implements ${adapter.targetInterface} {
  constructor(private readonly adaptee: ${adapter.sourceInterface}) {}

${methodsCode}
}
`;
	}

	private generateAdapterSourceInterface(adapter: AdapterDefinition): string {
		return `/**
 * ${adapter.name} Source Interface
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface ${adapter.sourceInterface} {
  // TODO: Define source interface methods
}
`;
	}

	private generateAdapterTargetInterface(adapter: AdapterDefinition): string {
		return `/**
 * ${adapter.name} Target Interface
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export interface ${adapter.targetInterface} {
  // TODO: Define target interface methods
}
`;
	}

	private generateDecoratorClass(
		decorator: DecoratorDefinition,
		framework: string,
	): string {
		if (framework === "nestjs" || decorator.type === "method") {
			return `/**
 * ${decorator.name} Decorator
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export function ${this.pascalCase(decorator.name)}(${decorator.metadata ? `metadata?: ${JSON.stringify(decorator.metadata)}` : ""}) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      // Method decorator
      const originalMethod = descriptor.value;
      
      descriptor.value = function (...args: any[]) {
        // TODO: Add pre-execution logic
        ${decorator.behavior?.preExecution || ""}
        
        try {
          const result = originalMethod.apply(this, args);
          
          // TODO: Add post-execution logic
          ${decorator.behavior?.postExecution || ""}
          
          return result;
        } catch (error) {
          // TODO: Add error handling logic
          ${decorator.behavior?.errorHandling || "throw error;"}
        }
      };
    } else if (propertyKey) {
      // Property decorator
      // TODO: Implement property decoration
    } else {
      // Class decorator
      // TODO: Implement class decoration
    }
  };
}
`;
		} else {
			return `/**
 * ${decorator.name} Decorator
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export function ${this.pascalCase(decorator.name)}(target: any): any {
  // TODO: Implement decorator logic
  return target;
}
`;
		}
	}

	private generateInterceptorClass(
		interceptor: InterceptorDefinition,
		framework: string,
	): string {
		if (framework === "nestjs") {
			return `/**
 * ${interceptor.name} Interceptor
 * ${interceptor.description || ""}
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class ${this.pascalCase(interceptor.name)}Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    ${interceptor.beforeExecution ? "// TODO: Add before execution logic" : ""}
    
    return next
      .handle()
      .pipe(
        ${interceptor.afterExecution ? "tap(() => {\n          // TODO: Add after execution logic\n        })," : ""}
        ${interceptor.onError ? "catchError(error => {\n          // TODO: Add error handling logic\n          throw error;\n        })" : ""}
      );
  }
}
`;
		} else {
			return `/**
 * ${interceptor.name} Interceptor
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export class ${this.pascalCase(interceptor.name)}Interceptor {
  intercept(context: any, next: Function): any {
    // TODO: Implement interceptor logic
    return next();
  }
}
`;
		}
	}

	private generateMiddlewareClass(
		middleware: MiddlewareDefinition,
		framework: string,
	): string {
		if (framework === "nestjs") {
			return `/**
 * ${middleware.name} Middleware
 * ${middleware.description || ""}
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ${this.pascalCase(middleware.name)}Middleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement middleware logic
    next();
  }
}
`;
		} else {
			return `/**
 * ${middleware.name} Middleware
 * Generated by Xaheen CLI - Dependency Injection Generator
 */

export function ${this.camelCase(middleware.name)}Middleware(req: any, res: any, next: Function) {
  // TODO: Implement middleware logic
  next();
}
`;
		}
	}

	// Simplified implementations for other patterns
	private generateProxyClass(name: string): string {
		return `export class ${this.pascalCase(name)}Proxy {\n  // TODO: Implement proxy pattern\n}`;
	}

	private generateBridgeClass(name: string): string {
		return `export class ${this.pascalCase(name)}Bridge {\n  // TODO: Implement bridge pattern\n}`;
	}

	private generateFacadeClass(name: string): string {
		return `export class ${this.pascalCase(name)}Facade {\n  // TODO: Implement facade pattern\n}`;
	}

	private generateRegistryClass(name: string): string {
		return `export class ${this.pascalCase(name)}Registry {\n  // TODO: Implement registry pattern\n}`;
	}

	private generateModuleSystemClass(
		name: string,
		modules: readonly ModuleDefinition[],
	): string {
		return `export class ${this.pascalCase(name)}ModuleSystem {\n  // TODO: Implement module system\n}`;
	}

	private generateDIDocumentation(
		name: string,
		services: readonly ServiceDefinition[],
		providers: readonly ProviderDefinition[],
		modules: readonly ModuleDefinition[],
	): string {
		return `# ${this.pascalCase(name)} Dependency Injection System

This DI system was generated using the Xaheen CLI Dependency Injection Generator.

## Services
${services.map((service) => `- **${service.name}**: ${service.description || "Service implementation"}`).join("\n")}

## Providers  
${providers.map((provider) => `- **${provider.name}**: ${provider.description || "Provider implementation"}`).join("\n")}

## Modules
${modules.map((module) => `- **${module.name}**: ${module.description || "Module implementation"}`).join("\n")}

## Getting Started

1. Configure service bindings
2. Register providers
3. Set up modules
4. Initialize container
5. Add tests and documentation
`;
	}

	// Test generation methods (simplified)
	private generateContainerTest(
		name: string,
		services: readonly ServiceDefinition[],
	): string {
		return `describe('${this.pascalCase(name)} Container', () => {\n  it('should resolve services', () => {\n    // TODO: Implement container tests\n  });\n});`;
	}

	private generateServiceTest(service: ServiceDefinition): string {
		return `describe('${service.name} Service', () => {\n  it('should work correctly', () => {\n    // TODO: Implement service tests\n  });\n});`;
	}

	private generateServiceLocatorTest(
		name: string,
		services: readonly ServiceDefinition[],
	): string {
		return `describe('${this.pascalCase(name)} Service Locator', () => {\n  it('should locate services', () => {\n    // TODO: Implement service locator tests\n  });\n});`;
	}

	private generateFactoryTest(
		name: string,
		services: readonly ServiceDefinition[],
	): string {
		return `describe('${this.pascalCase(name)} Factory', () => {\n  it('should create objects', () => {\n    // TODO: Implement factory tests\n  });\n});`;
	}

	private generateProviderTest(provider: ProviderDefinition): string {
		return `describe('${provider.name} Provider', () => {\n  it('should provide service', () => {\n    // TODO: Implement provider tests\n  });\n});`;
	}

	private generateAdapterTest(adapter: AdapterDefinition): string {
		return `describe('${adapter.name} Adapter', () => {\n  it('should adapt interfaces', () => {\n    // TODO: Implement adapter tests\n  });\n});`;
	}

	private generateDecoratorTest(decorator: DecoratorDefinition): string {
		return `describe('${decorator.name} Decorator', () => {\n  it('should decorate correctly', () => {\n    // TODO: Implement decorator tests\n  });\n});`;
	}

	private generateInterceptorTest(interceptor: InterceptorDefinition): string {
		return `describe('${interceptor.name} Interceptor', () => {\n  it('should intercept correctly', () => {\n    // TODO: Implement interceptor tests\n  });\n});`;
	}

	private generateMiddlewareTest(middleware: MiddlewareDefinition): string {
		return `describe('${middleware.name} Middleware', () => {\n  it('should process requests', () => {\n    // TODO: Implement middleware tests\n  });\n});`;
	}

	// Utility methods
	private pascalCase(str: string): string {
		return (
			str.charAt(0).toUpperCase() +
			str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
		);
	}

	private camelCase(str: string): string {
		return (
			str.charAt(0).toLowerCase() +
			str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
		);
	}

	private kebabCase(str: string): string {
		return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	}

	private constantCase(str: string): string {
		return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
	}
}
