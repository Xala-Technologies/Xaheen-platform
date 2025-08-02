import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, confirm, multiselect, text } from "@clack/prompts";
import type { ProjectConfig, UISystem, Compliance, Language, Backend } from "../../types";
import { detectProjectConfig } from "./detect-project-config";

// Service types
export type ServiceType = "api" | "business" | "integration" | "utility";

// Service options interface
export interface ServiceOptions {
	type?: ServiceType;
	methods?: string[];
	dependencies?: string[];
	caching?: boolean;
	rateLimit?: boolean;
	monitoring?: boolean;
	authentication?: boolean;
	validation?: boolean;
	testing?: boolean;
	documentation?: boolean;
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	force?: boolean;
}

// Service context interface
interface ServiceContext {
	name: string;
	serviceName: string; // PascalCase
	fileName: string; // kebab-case
	type: ServiceType;
	methods: string[];
	dependencies: string[];
	caching: boolean;
	rateLimit: boolean;
	monitoring: boolean;
	authentication: boolean;
	validation: boolean;
	testing: boolean;
	documentation: boolean;
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	projectRoot: string;
	targetDir: string;
	backend: Backend;
}

/**
 * Generate a service in an existing project
 */
export async function generateServiceHandler(
	name: string,
	options: ServiceOptions = {}
): Promise<void> {
	try {
		// Step 1: Project root detection and validation
		const projectRoot = await detectProjectRoot();
		if (!projectRoot) {
			consola.error("Could not find project root. Are you in a xaheen project?");
			process.exit(1);
		}

		// Step 2: Load project configuration
		const projectConfig = await detectProjectConfig(projectRoot);
		if (!projectConfig) {
			consola.error("Could not detect project configuration. Is this a valid xaheen project?");
			process.exit(1);
		}

		// Step 3: Detect backend framework
		const backend = detectBackend(projectConfig);
		if (!backend) {
			consola.error("Could not detect a supported backend framework.");
			process.exit(1);
		}

		// Step 4: Service naming
		const serviceName = validateAndNormalizeServiceName(name);
		const fileName = toKebabCase(serviceName);

		// Step 5: Service type selection
		const serviceType = options.type || await promptServiceType();

		// Step 6: Service methods configuration
		const methods = options.methods || await promptServiceMethods(serviceType);

		// Step 7: Dependencies configuration
		const dependencies = options.dependencies || await promptDependencies(serviceType);

		// Step 8: Feature flags
		const caching = options.caching ?? await promptFeature("Enable caching?", true);
		const rateLimit = options.rateLimit ?? await promptFeature("Enable rate limiting?", serviceType === "api");
		const monitoring = options.monitoring ?? await promptFeature("Enable monitoring?", true);
		const authentication = options.authentication ?? await promptFeature("Require authentication?", serviceType === "api");
		const validation = options.validation ?? await promptFeature("Enable input validation?", true);
		const testing = options.testing ?? true;
		const documentation = options.documentation ?? true;

		// Step 9: UI and compliance settings
		const ui = options.ui || projectConfig.ui || "default";
		const compliance = options.compliance || projectConfig.compliance || "none";
		const locales = options.locales || projectConfig.locales || ["en"];

		// Step 10: Determine target directory
		const targetDir = await determineTargetDirectory(
			projectRoot,
			backend,
			serviceType
		);

		// Step 11: Check for existing service
		const servicePath = path.join(targetDir, `${fileName}.ts`);
		if (await fs.pathExists(servicePath) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Service ${serviceName} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Service generation cancelled.");
				return;
			}
		}

		// Create service context
		const context: ServiceContext = {
			name,
			serviceName,
			fileName,
			type: serviceType,
			methods,
			dependencies,
			caching,
			rateLimit,
			monitoring,
			authentication,
			validation,
			testing,
			documentation,
			ui,
			compliance,
			locales,
			projectRoot,
			targetDir,
			backend,
		};

		// Generate the service
		log.info(`Generating ${serviceType} service: ${serviceName}`);
		
		// Generate service file
		await generateServiceFile(context);

		// Generate service interface
		await generateServiceInterface(context);

		// Generate service tests
		if (testing) {
			await generateServiceTests(context);
		}

		// Generate service documentation
		if (documentation) {
			await generateServiceDocumentation(context);
		}

		// Generate dependency injection configuration
		await generateDependencyInjection(context);

		// Generate monitoring configuration
		if (monitoring) {
			await generateMonitoringConfig(context);
		}

		log.success(`Service ${serviceName} generated successfully!`);
		
		// Display next steps
		displayNextSteps(context);

	} catch (error) {
		consola.error("Failed to generate service:", error);
		process.exit(1);
	}
}

/**
 * Detect the project root
 */
async function detectProjectRoot(): Promise<string | null> {
	let currentDir = process.cwd();
	const root = path.parse(currentDir).root;

	while (currentDir !== root) {
		const packageJsonPath = path.join(currentDir, "package.json");
		const xaheenConfigPath = path.join(currentDir, "xaheen.config.json");
		const btsstackConfigPath = path.join(currentDir, "btsstack.config.json");

		if (await fs.pathExists(packageJsonPath)) {
			if (await fs.pathExists(xaheenConfigPath) || await fs.pathExists(btsstackConfigPath)) {
				return currentDir;
			}

			try {
				const packageJson = await fs.readJson(packageJsonPath);
				if (packageJson.dependencies?.["@xaheen/cli"] || 
					packageJson.devDependencies?.["@xaheen/cli"] ||
					packageJson.dependencies?.["xaheen-tstack"] ||
					packageJson.devDependencies?.["xaheen-tstack"]) {
					return currentDir;
				}
			} catch (error) {
				// Continue searching
			}
		}

		currentDir = path.dirname(currentDir);
	}

	return null;
}

/**
 * Detect the backend framework from project configuration
 */
function detectBackend(config: any): Backend | null {
	if (config.backend && Array.isArray(config.backend) && config.backend.length > 0) {
		return config.backend[0];
	}
	return "node";
}

/**
 * Validate and normalize service name
 */
function validateAndNormalizeServiceName(name: string): string {
	const cleanName = name.replace(/\.(ts|js)$/, "");

	if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(cleanName)) {
		throw new Error(
			"Service name must start with a letter and contain only letters, numbers, hyphens, and underscores"
		);
	}

	return toPascalCase(cleanName);
}

/**
 * Convert to PascalCase
 */
function toPascalCase(str: string): string {
	return str
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		.replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * Convert to kebab-case
 */
function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.toLowerCase();
}

/**
 * Prompt for service type
 */
async function promptServiceType(): Promise<ServiceType> {
	const type = await select({
		message: "What type of service are you creating?",
		options: [
			{ value: "api", label: "API Service - REST/GraphQL endpoints and controllers" },
			{ value: "business", label: "Business Logic Service - Core business operations" },
			{ value: "integration", label: "Integration Service - Third-party API integrations" },
			{ value: "utility", label: "Utility Service - Helper functions and utilities" },
		],
	});

	return type as ServiceType;
}

/**
 * Prompt for service methods
 */
async function promptServiceMethods(serviceType: ServiceType): Promise<string[]> {
	let defaultMethods: string[] = [];

	switch (serviceType) {
		case "api":
			defaultMethods = ["get", "post", "put", "delete"];
			break;
		case "business":
			defaultMethods = ["create", "update", "delete", "validate"];
			break;
		case "integration":
			defaultMethods = ["authenticate", "request", "webhook"];
			break;
		case "utility":
			defaultMethods = ["format", "validate", "transform"];
			break;
	}

	const methodsInput = await text({
		message: "Service methods (comma-separated):",
		placeholder: defaultMethods.join(", "),
		initialValue: defaultMethods.join(", "),
	});

	return methodsInput?.split(",").map(m => m.trim()).filter(Boolean) || defaultMethods;
}

/**
 * Prompt for dependencies
 */
async function promptDependencies(serviceType: ServiceType): Promise<string[]> {
	const availableDependencies = [
		"database",
		"cache",
		"logger",
		"validator",
		"mailer",
		"storage",
		"queue",
		"scheduler",
		"metrics",
		"config",
	];

	const selectedDeps = await multiselect({
		message: "Select service dependencies:",
		options: availableDependencies.map(dep => ({
			value: dep,
			label: `${dep.charAt(0).toUpperCase()}${dep.slice(1)} Service`,
			selected: ["database", "logger", "config"].includes(dep)
		})),
		required: false,
	});

	return Array.isArray(selectedDeps) ? selectedDeps : [];
}

/**
 * Prompt for feature enabling
 */
async function promptFeature(message: string, defaultValue: boolean): Promise<boolean> {
	const result = await confirm({
		message,
		initialValue: defaultValue,
	});

	return result === true;
}

/**
 * Determine target directory
 */
async function determineTargetDirectory(
	projectRoot: string,
	backend: Backend,
	serviceType: ServiceType
): Promise<string> {
	let baseDir = path.join(projectRoot, "src", "services");

	// Create subdirectory based on service type
	switch (serviceType) {
		case "api":
			baseDir = path.join(projectRoot, "src", "api", "services");
			break;
		case "business":
			baseDir = path.join(projectRoot, "src", "services", "business");
			break;
		case "integration":
			baseDir = path.join(projectRoot, "src", "services", "integrations");
			break;
		case "utility":
			baseDir = path.join(projectRoot, "src", "utils", "services");
			break;
	}

	await fs.ensureDir(baseDir);
	return baseDir;
}

/**
 * Generate service file
 */
async function generateServiceFile(context: ServiceContext): Promise<void> {
	const { serviceName, fileName, targetDir, type, methods, dependencies, backend } = context;
	const servicePath = path.join(targetDir, `${fileName}.ts`);

	const imports = generateServiceImports(context);
	const interfaceCode = generateServiceInterfaceCode(context);
	const classCode = generateServiceClassCode(context);

	const content = `${imports}

${interfaceCode}

${classCode}
`;

	await fs.writeFile(servicePath, content);
}

/**
 * Generate service imports
 */
function generateServiceImports(context: ServiceContext): string {
	const imports: string[] = [];

	// Base imports
	if (context.type === "api") {
		imports.push("import { Request, Response, NextFunction } from 'express';");
	}

	// Dependency imports
	if (context.dependencies.includes("database")) {
		imports.push("import { Database } from '@/lib/database';");
	}
	if (context.dependencies.includes("cache")) {
		imports.push("import { Cache } from '@/lib/cache';");
	}
	if (context.dependencies.includes("logger")) {
		imports.push("import { Logger } from '@/lib/logger';");
	}
	if (context.dependencies.includes("validator")) {
		imports.push("import { Validator } from '@/lib/validator';");
	}

	// Feature imports
	if (context.rateLimit) {
		imports.push("import { RateLimit } from '@/lib/rate-limit';");
	}
	if (context.monitoring) {
		imports.push("import { Metrics } from '@/lib/metrics';");
	}
	if (context.authentication) {
		imports.push("import { Auth } from '@/lib/auth';");
	}

	// Validation imports
	if (context.validation) {
		imports.push("import { z } from 'zod';");
	}

	// Type imports
	imports.push(`import type { ${context.serviceName}Config } from './types';`);

	return imports.join("\n");
}

/**
 * Generate service interface code
 */
function generateServiceInterfaceCode(context: ServiceContext): string {
	const { serviceName, methods } = context;

	const methodSignatures = methods.map(method => {
		switch (context.type) {
			case "api":
				return `  ${method}(req: Request, res: Response, next: NextFunction): Promise<void>;`;
			case "business":
			case "integration":
			case "utility":
				return `  ${method}(data: any): Promise<any>;`;
			default:
				return `  ${method}(): Promise<void>;`;
		}
	}).join("\n");

	return `export interface I${serviceName}Service {
${methodSignatures}
}`;
}

/**
 * Generate service class code
 */
function generateServiceClassCode(context: ServiceContext): string {
	const { serviceName, methods, dependencies } = context;

	const constructorParams = generateConstructorParams(context);
	const constructorBody = generateConstructorBody(context);
	const methodImplementations = generateMethodImplementations(context);

	return `export class ${serviceName}Service implements I${serviceName}Service {
${constructorParams.length > 0 ? `  constructor(${constructorParams.join(", ")}) {${constructorBody}  }` : ""}

${methodImplementations}
}`;
}

/**
 * Generate constructor parameters
 */
function generateConstructorParams(context: ServiceContext): string[] {
	const params: string[] = [];

	context.dependencies.forEach(dep => {
		switch (dep) {
			case "database":
				params.push("private database: Database");
				break;
			case "cache":
				params.push("private cache: Cache");
				break;
			case "logger":
				params.push("private logger: Logger");
				break;
			case "validator":
				params.push("private validator: Validator");
				break;
			default:
				params.push(`private ${dep}: any`);
		}
	});

	return params;
}

/**
 * Generate constructor body
 */
function generateConstructorBody(context: ServiceContext): string {
	let body = "\n";

	if (context.monitoring) {
		body += "    this.setupMetrics();\n";
	}

	if (context.dependencies.length > 0) {
		body += "    this.initializeDependencies();\n";
	}

	body += "  ";
	return body;
}

/**
 * Generate method implementations
 */
function generateMethodImplementations(context: ServiceContext): string {
	const { methods, type, authentication, validation, caching, monitoring } = context;

	return methods.map(method => {
		let implementation = "";

		// Method signature
		switch (type) {
			case "api":
				implementation += `  async ${method}(req: Request, res: Response, next: NextFunction): Promise<void> {\n`;
				break;
			default:
				implementation += `  async ${method}(data: any): Promise<any> {\n`;
		}

		// Method body
		implementation += "    try {\n";

		// Authentication check
		if (authentication && type === "api") {
			implementation += "      await this.authenticateRequest(req);\n";
		}

		// Input validation
		if (validation) {
			implementation += "      const validatedData = await this.validateInput(data || req.body);\n";
		}

		// Rate limiting
		if (context.rateLimit && type === "api") {
			implementation += "      await this.checkRateLimit(req);\n";
		}

		// Caching check
		if (caching && method === "get") {
			implementation += "      const cached = await this.checkCache(req.params);\n";
			implementation += "      if (cached) return res.json(cached);\n";
		}

		// Monitoring
		if (monitoring) {
			implementation += "      const startTime = Date.now();\n";
		}

		// Main logic placeholder
		implementation += `      // TODO: Implement ${method} logic\n`;
		implementation += "      const result = await this.processRequest(validatedData || data);\n";

		// Cache result
		if (caching && method === "get") {
			implementation += "      await this.cacheResult(req.params, result);\n";
		}

		// Monitoring
		if (monitoring) {
			implementation += "      this.recordMetrics('${method}', Date.now() - startTime);\n";
		}

		// Response handling
		if (type === "api") {
			implementation += "      res.json({ success: true, data: result });\n";
		} else {
			implementation += "      return result;\n";
		}

		implementation += "    } catch (error) {\n";
		implementation += "      this.handleError(error);\n";
		if (type === "api") {
			implementation += "      next(error);\n";
		} else {
			implementation += "      throw error;\n";
		}
		implementation += "    }\n";
		implementation += "  }\n";

		return implementation;
	}).join("\n");
}

/**
 * Generate service interface file
 */
async function generateServiceInterface(context: ServiceContext): Promise<void> {
	const { targetDir, fileName } = context;
	const interfacePath = path.join(targetDir, "types.ts");

	const configInterface = generateConfigInterface(context);
	const dataInterfaces = generateDataInterfaces(context);

	const content = `${configInterface}

${dataInterfaces}
`;

	// Append to existing types file or create new one
	if (await fs.pathExists(interfacePath)) {
		const existingContent = await fs.readFile(interfacePath, "utf-8");
		if (!existingContent.includes(`${context.serviceName}Config`)) {
			await fs.appendFile(interfacePath, `\n${content}`);
		}
	} else {
		await fs.writeFile(interfacePath, content);
	}
}

/**
 * Generate config interface
 */
function generateConfigInterface(context: ServiceContext): string {
	const { serviceName, caching, rateLimit, monitoring } = context;

	const configFields: string[] = [];

	if (caching) {
		configFields.push("  cache: { ttl: number; keyPrefix: string; };");
	}
	if (rateLimit) {
		configFields.push("  rateLimit: { requests: number; window: number; };");
	}
	if (monitoring) {
		configFields.push("  monitoring: { enabled: boolean; metricsInterval: number; };");
	}

	configFields.push("  environment: 'development' | 'staging' | 'production';");

	return `export interface ${serviceName}Config {
${configFields.join("\n")}
}`;
}

/**
 * Generate data interfaces
 */
function generateDataInterfaces(context: ServiceContext): string {
	const { serviceName, type, methods } = context;

	const interfaces: string[] = [];

	// Request/Response interfaces for API services
	if (type === "api") {
		methods.forEach(method => {
			const methodName = method.charAt(0).toUpperCase() + method.slice(1);
			interfaces.push(`export interface ${serviceName}${methodName}Request {
  // TODO: Define request payload structure
  [key: string]: any;
}`);

			interfaces.push(`export interface ${serviceName}${methodName}Response {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}`);
		});
	}

	// Error interface
	interfaces.push(`export interface ${serviceName}Error {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}`);

	return interfaces.join("\n\n");
}

/**
 * Generate service tests
 */
async function generateServiceTests(context: ServiceContext): Promise<void> {
	const { serviceName, fileName, projectRoot, methods, type } = context;
	const testsDir = path.join(projectRoot, "src", "__tests__", "services");
	await fs.ensureDir(testsDir);

	const testPath = path.join(testsDir, `${fileName}.test.ts`);

	const imports = [
		"import { describe, it, expect, beforeEach, jest } from '@jest/globals';",
		`import { ${serviceName}Service } from '../services/${fileName}';`
	];

	// Mock dependencies
	const mockSetup = generateTestMockSetup(context);

	// Test cases
	const testCases = methods.map(method => `
  describe('${method}', () => {
    it('should ${method} successfully', async () => {
      // TODO: Implement test for ${method}
      expect(true).toBe(true);
    });

    it('should handle ${method} errors', async () => {
      // TODO: Implement error handling test for ${method}
      expect(true).toBe(true);
    });
  });`).join("");

	const content = `${imports.join("\n")}

${mockSetup}

describe('${serviceName}Service', () => {
  let service: ${serviceName}Service;

  beforeEach(() => {
    service = new ${serviceName}Service(/* mock dependencies */);
  });
${testCases}
});
`;

	await fs.writeFile(testPath, content);
}

/**
 * Generate test mock setup
 */
function generateTestMockSetup(context: ServiceContext): string {
	const mocks: string[] = [];

	context.dependencies.forEach(dep => {
		mocks.push(`const mock${dep.charAt(0).toUpperCase()}${dep.slice(1)} = {
  // TODO: Add mock methods for ${dep}
};`);
	});

	return mocks.join("\n\n");
}

/**
 * Generate service documentation
 */
async function generateServiceDocumentation(context: ServiceContext): Promise<void> {
	const { serviceName, fileName, projectRoot, type, methods, dependencies } = context;
	const docsDir = path.join(projectRoot, "docs", "services");
	await fs.ensureDir(docsDir);

	const docPath = path.join(docsDir, `${fileName}.md`);

	const content = `# ${serviceName} Service

## Overview

${getServiceDescription(type)}

## Methods

${methods.map(method => `### ${method}

TODO: Document the ${method} method

**Parameters:**
- \`data\`: Input data for the method

**Returns:**
- Promise resolving to the method result

**Example:**
\`\`\`typescript
const result = await ${serviceName.toLowerCase()}Service.${method}(data);
\`\`\`
`).join("\n")}

## Dependencies

${dependencies.length > 0 ? dependencies.map(dep => `- ${dep}`).join("\n") : "None"}

## Configuration

See \`${serviceName}Config\` interface for configuration options.

## Error Handling

All methods throw typed errors that implement the \`${serviceName}Error\` interface.

## Testing

Run tests with:
\`\`\`bash
npm test -- ${fileName}.test.ts
\`\`\`
`;

	await fs.writeFile(docPath, content);
}

/**
 * Get service description based on type
 */
function getServiceDescription(type: ServiceType): string {
	switch (type) {
		case "api":
			return "This service handles API endpoints and HTTP request/response processing.";
		case "business":
			return "This service contains core business logic and operations.";
		case "integration":
			return "This service manages third-party API integrations and external communications.";
		case "utility":
			return "This service provides utility functions and helper methods.";
		default:
			return "This service provides specialized functionality for the application.";
	}
}

/**
 * Generate dependency injection configuration
 */
async function generateDependencyInjection(context: ServiceContext): Promise<void> {
	const { serviceName, dependencies, projectRoot } = context;
	const diConfigPath = path.join(projectRoot, "src", "di", "services.ts");
	
	await fs.ensureDir(path.dirname(diConfigPath));

	const serviceRegistration = `
// ${serviceName} Service Registration
container.register('${serviceName.toLowerCase()}Service', {
  useClass: ${serviceName}Service,
  dependencies: [${dependencies.map(dep => `'${dep}'`).join(", ")}],
});`;

	// Append to existing DI config or create new one
	if (await fs.pathExists(diConfigPath)) {
		const existingContent = await fs.readFile(diConfigPath, "utf-8");
		if (!existingContent.includes(`${serviceName.toLowerCase()}Service`)) {
			await fs.appendFile(diConfigPath, serviceRegistration);
		}
	} else {
		const content = `import { container } from '@/lib/di';
import { ${serviceName}Service } from '../services/${toKebabCase(serviceName)}';
${serviceRegistration}
`;
		await fs.writeFile(diConfigPath, content);
	}
}

/**
 * Generate monitoring configuration
 */
async function generateMonitoringConfig(context: ServiceContext): Promise<void> {
	const { serviceName, methods, projectRoot } = context;
	const monitoringConfigPath = path.join(projectRoot, "src", "monitoring", "services.ts");
	
	await fs.ensureDir(path.dirname(monitoringConfigPath));

	const metricsConfig = `
// ${serviceName} Service Metrics
export const ${serviceName.toLowerCase()}Metrics = {
  ${methods.map(method => `${method}: {
    name: '${serviceName.toLowerCase()}_${method}_duration',
    help: 'Duration of ${serviceName} ${method} method execution',
    labelNames: ['status', 'error_type']
  }`).join(",\n  ")}
};`;

	// Append to existing monitoring config or create new one
	if (await fs.pathExists(monitoringConfigPath)) {
		const existingContent = await fs.readFile(monitoringConfigPath, "utf-8");
		if (!existingContent.includes(`${serviceName.toLowerCase()}Metrics`)) {
			await fs.appendFile(monitoringConfigPath, metricsConfig);
		}
	} else {
		const content = `import { register, Histogram } from 'prom-client';
${metricsConfig}

// Register metrics
Object.values(${serviceName.toLowerCase()}Metrics).forEach(metric => {
  const histogram = new Histogram(metric);
  register.registerMetric(histogram);
});
`;
		await fs.writeFile(monitoringConfigPath, content);
	}
}

/**
 * Display next steps
 */
function displayNextSteps(context: ServiceContext): void {
	const { serviceName, type, methods, dependencies, testing, documentation } = context;

	const steps = [
		`Service ${serviceName} created successfully!`,
		"",
		"Generated files:",
		`  - ${context.fileName}.ts (main service)`,
		`  - types.ts (interfaces and types)`,
	];

	if (testing) {
		steps.push(`  - __tests__/services/${context.fileName}.test.ts`);
	}

	if (documentation) {
		steps.push(`  - docs/services/${context.fileName}.md`);
	}

	steps.push("", "Next steps:");
	steps.push("1. Implement the service methods with your business logic");
	steps.push("2. Configure the service dependencies and injection");
	
	if (testing) {
		steps.push("3. Write comprehensive tests for all methods");
	}

	if (dependencies.length > 0) {
		steps.push(`${testing ? "4" : "3"}. Set up the required dependencies: ${dependencies.join(", ")}`);
	}

	if (context.monitoring) {
		steps.push(`${steps.length - 5}. Configure monitoring and metrics collection`);
	}

	if (context.authentication && type === "api") {
		steps.push(`${steps.length - 5}. Set up authentication middleware`);
	}

	consola.box(steps.join("\n"));
}