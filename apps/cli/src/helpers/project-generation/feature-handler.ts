import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, confirm, multiselect, text } from "@clack/prompts";
import type { ProjectConfig, UISystem, Compliance, Language, Frontend } from "../../types";
import { detectProjectConfig } from "./detect-project-config";
import { generateComponentHandler, type ComponentOptions } from "./component-handler";
import { generatePageHandler, type PageOptions } from "./page-handler";
import { generateServiceHandler, type ServiceOptions } from "./service-handler";
import { generateHookHandler, type HookOptions } from "./hook-handler";

// Feature types
export type FeatureType = "crud" | "auth" | "dashboard" | "ecommerce" | "blog" | "custom";

// Feature component types
export interface FeatureComponent {
	type: "component" | "page" | "service" | "hook" | "layout";
	name: string;
	options: any;
	dependencies: string[];
}

// Feature options interface
export interface FeatureOptions {
	type?: FeatureType;
	components?: FeatureComponent[];
	routing?: boolean;
	authentication?: boolean;
	testing?: boolean;
	documentation?: boolean;
	deployment?: boolean;
	rollback?: boolean;
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	force?: boolean;
}

// Feature context interface
interface FeatureContext {
	name: string;
	featureName: string; // PascalCase
	fileName: string; // kebab-case
	type: FeatureType;
	components: FeatureComponent[];
	routing: boolean;
	authentication: boolean;
	testing: boolean;
	documentation: boolean;
	deployment: boolean;
	rollback: boolean;
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	projectRoot: string;
	targetDir: string;
	framework: Frontend;
}

/**
 * Generate a complete feature in an existing project
 */
export async function generateFeatureHandler(
	name: string,
	options: FeatureOptions = {}
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

		// Step 3: Detect framework
		const framework = detectFramework(projectConfig);
		if (!framework) {
			consola.error("Could not detect a supported frontend framework.");
			process.exit(1);
		}

		// Step 4: Feature naming
		const featureName = validateAndNormalizeFeatureName(name);
		const fileName = toKebabCase(featureName);

		// Step 5: Feature type selection
		const featureType = options.type || await promptFeatureType();

		// Step 6: Feature components configuration
		const components = options.components || await configureFeatureComponents(featureType);

		// Step 7: Feature flags
		const routing = options.routing ?? await promptFeature("Generate routing configuration?", true);
		const authentication = options.authentication ?? await promptFeature("Include authentication?", featureType !== "blog");
		const testing = options.testing ?? true;
		const documentation = options.documentation ?? true;
		const deployment = options.deployment ?? await promptFeature("Generate deployment configuration?", false);
		const rollback = options.rollback ?? await promptFeature("Enable rollback capabilities?", false);

		// Step 8: UI and compliance settings
		const ui = options.ui || projectConfig.ui || "default";
		const compliance = options.compliance || projectConfig.compliance || "none";
		const locales = options.locales || projectConfig.locales || ["en"];

		// Step 9: Determine target directory
		const targetDir = await determineTargetDirectory(projectRoot, framework, featureName);

		// Step 10: Check for existing feature
		if (await fs.pathExists(targetDir) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Feature ${featureName} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Feature generation cancelled.");
				return;
			}
		}

		// Create feature context
		const context: FeatureContext = {
			name,
			featureName,
			fileName,
			type: featureType,
			components,
			routing,
			authentication,
			testing,
			documentation,
			deployment,
			rollback,
			ui,
			compliance,
			locales,
			projectRoot,
			targetDir,
			framework,
		};

		// Generate the feature
		log.info(`Generating ${featureType} feature: ${featureName}`);
		
		// Create feature backup if rollback is enabled
		if (rollback) {
			await createFeatureBackup(context);
		}

		// Generate feature structure
		await generateFeatureStructure(context);

		// Generate feature components
		await generateFeatureComponents(context);

		// Generate feature routing
		if (routing) {
			await generateFeatureRouting(context);
		}

		// Generate feature tests
		if (testing) {
			await generateFeatureTests(context);
		}

		// Generate feature documentation
		if (documentation) {
			await generateFeatureDocumentation(context);
		}

		// Generate deployment configuration
		if (deployment) {
			await generateDeploymentConfig(context);
		}

		log.success(`Feature ${featureName} generated successfully!`);
		
		// Display next steps
		displayNextSteps(context);

	} catch (error) {
		consola.error("Failed to generate feature:", error);
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
 * Detect the framework from project configuration
 */
function detectFramework(config: any): Frontend | null {
	if (config.frontend && Array.isArray(config.frontend) && config.frontend.length > 0) {
		return config.frontend[0];
	}
	return null;
}

/**
 * Validate and normalize feature name
 */
function validateAndNormalizeFeatureName(name: string): string {
	const cleanName = name.replace(/\.(ts|tsx|js|jsx)$/, "");

	if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(cleanName)) {
		throw new Error(
			"Feature name must start with a letter and contain only letters, numbers, hyphens, and underscores"
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
 * Prompt for feature type
 */
async function promptFeatureType(): Promise<FeatureType> {
	const type = await select({
		message: "What type of feature are you creating?",
		options: [
			{ value: "crud", label: "CRUD Feature - Create, Read, Update, Delete operations" },
			{ value: "auth", label: "Authentication Feature - Login, signup, user management" },
			{ value: "dashboard", label: "Dashboard Feature - Analytics and data visualization" },
			{ value: "ecommerce", label: "E-commerce Feature - Products, cart, checkout" },
			{ value: "blog", label: "Blog Feature - Posts, comments, categories" },
			{ value: "custom", label: "Custom Feature - Define your own components" },
		],
	});

	return type as FeatureType;
}

/**
 * Configure feature components based on type
 */
async function configureFeatureComponents(featureType: FeatureType): Promise<FeatureComponent[]> {
	const components: FeatureComponent[] = [];

	switch (featureType) {
		case "crud":
			components.push(
				{ type: "page", name: "List", options: { layout: "dashboard" }, dependencies: [] },
				{ type: "page", name: "Detail", options: { layout: "dashboard" }, dependencies: ["List"] },
				{ type: "page", name: "Create", options: { layout: "dashboard" }, dependencies: ["List"] },
				{ type: "page", name: "Edit", options: { layout: "dashboard" }, dependencies: ["List", "Detail"] },
				{ type: "component", name: "Table", options: { type: "display" }, dependencies: [] },
				{ type: "component", name: "Form", options: { type: "form" }, dependencies: [] },
				{ type: "service", name: "Api", options: { type: "api" }, dependencies: [] },
				{ type: "hook", name: "Data", options: { type: "custom" }, dependencies: ["Api"] }
			);
			break;

		case "auth":
			components.push(
				{ type: "page", name: "Login", options: { layout: "auth" }, dependencies: [] },
				{ type: "page", name: "Register", options: { layout: "auth" }, dependencies: [] },
				{ type: "page", name: "Profile", options: { layout: "dashboard", auth: true }, dependencies: [] },
				{ type: "component", name: "LoginForm", options: { type: "form" }, dependencies: [] },
				{ type: "component", name: "RegisterForm", options: { type: "form" }, dependencies: [] },
				{ type: "service", name: "Auth", options: { type: "business" }, dependencies: [] },
				{ type: "hook", name: "Auth", options: { type: "custom" }, dependencies: ["Auth"] }
			);
			break;

		case "dashboard":
			components.push(
				{ type: "page", name: "Overview", options: { layout: "dashboard" }, dependencies: [] },
				{ type: "page", name: "Analytics", options: { layout: "dashboard" }, dependencies: [] },
				{ type: "component", name: "StatCard", options: { type: "display" }, dependencies: [] },
				{ type: "component", name: "Chart", options: { type: "display" }, dependencies: [] },
				{ type: "component", name: "DataTable", options: { type: "display" }, dependencies: [] },
				{ type: "service", name: "Analytics", options: { type: "api" }, dependencies: [] },
				{ type: "hook", name: "Dashboard", options: { type: "custom" }, dependencies: ["Analytics"] }
			);
			break;

		case "ecommerce":
			components.push(
				{ type: "page", name: "Products", options: { layout: "default" }, dependencies: [] },
				{ type: "page", name: "Product", options: { layout: "default" }, dependencies: ["Products"] },
				{ type: "page", name: "Cart", options: { layout: "default" }, dependencies: [] },
				{ type: "page", name: "Checkout", options: { layout: "default", auth: true }, dependencies: ["Cart"] },
				{ type: "component", name: "ProductCard", options: { type: "display" }, dependencies: [] },
				{ type: "component", name: "CartItem", options: { type: "display" }, dependencies: [] },
				{ type: "service", name: "Products", options: { type: "api" }, dependencies: [] },
				{ type: "service", name: "Cart", options: { type: "business" }, dependencies: [] },
				{ type: "hook", name: "Cart", options: { type: "custom" }, dependencies: ["Cart"] }
			);
			break;

		case "blog":
			components.push(
				{ type: "page", name: "Posts", options: { layout: "default" }, dependencies: [] },
				{ type: "page", name: "Post", options: { layout: "default" }, dependencies: ["Posts"] },
				{ type: "page", name: "Category", options: { layout: "default" }, dependencies: [] },
				{ type: "component", name: "PostCard", options: { type: "display" }, dependencies: [] },
				{ type: "component", name: "PostContent", options: { type: "display" }, dependencies: [] },
				{ type: "component", name: "CommentForm", options: { type: "form" }, dependencies: [] },
				{ type: "service", name: "Blog", options: { type: "api" }, dependencies: [] },
				{ type: "hook", name: "Posts", options: { type: "custom" }, dependencies: ["Blog"] }
			);
			break;

		case "custom":
			return await promptCustomComponents();
	}

	return components;
}

/**
 * Prompt for custom components
 */
async function promptCustomComponents(): Promise<FeatureComponent[]> {
	const components: FeatureComponent[] = [];
	
	consola.info("Define your custom feature components:");

	let addMore = true;
	while (addMore) {
		const componentType = await select({
			message: "Select component type:",
			options: [
				{ value: "component", label: "React Component" },
				{ value: "page", label: "Page Component" },
				{ value: "service", label: "Service" },
				{ value: "hook", label: "React Hook" },
				{ value: "layout", label: "Layout Component" },
			],
		}) as FeatureComponent["type"];

		const componentName = await text({
			message: "Component name:",
			placeholder: "ComponentName",
		});

		if (componentName) {
			components.push({
				type: componentType,
				name: componentName,
				options: {},
				dependencies: [],
			});
		}

		addMore = await confirm({
			message: "Add another component?",
			initialValue: false,
		});
	}

	return components;
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
	framework: Frontend,
	featureName: string
): Promise<string> {
	let baseDir = path.join(projectRoot, "src", "features", toKebabCase(featureName));

	await fs.ensureDir(baseDir);
	return baseDir;
}

/**
 * Create feature backup for rollback
 */
async function createFeatureBackup(context: FeatureContext): Promise<void> {
	const { targetDir, featureName } = context;
	const backupDir = path.join(context.projectRoot, ".xaheen", "backups", `${context.fileName}-${Date.now()}`);

	if (await fs.pathExists(targetDir)) {
		await fs.ensureDir(path.dirname(backupDir));
		await fs.copy(targetDir, backupDir);
		consola.info(`Backup created at: ${backupDir}`);
	}
}

/**
 * Generate feature structure
 */
async function generateFeatureStructure(context: FeatureContext): Promise<void> {
	const { targetDir } = context;

	// Create feature directory structure
	const directories = [
		"components",
		"pages",
		"services",
		"hooks",
		"types",
		"utils",
		"__tests__",
		"docs",
	];

	for (const dir of directories) {
		await fs.ensureDir(path.join(targetDir, dir));
	}

	// Create feature index file
	await generateFeatureIndex(context);

	// Create feature types file
	await generateFeatureTypes(context);

	// Create feature constants file
	await generateFeatureConstants(context);
}

/**
 * Generate feature index file
 */
async function generateFeatureIndex(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, components } = context;
	const indexPath = path.join(targetDir, "index.ts");

	const exports: string[] = [];

	// Export components
	components.forEach(component => {
		const componentName = `${featureName}${component.name}`;
		switch (component.type) {
			case "component":
				exports.push(`export { ${componentName} } from './components/${toKebabCase(component.name)}';`);
				break;
			case "page":
				exports.push(`export { ${componentName}Page } from './pages/${toKebabCase(component.name)}';`);
				break;
			case "service":
				exports.push(`export { ${componentName}Service } from './services/${toKebabCase(component.name)}';`);
				break;
			case "hook":
				exports.push(`export { use${componentName} } from './hooks/${toKebabCase(component.name)}';`);
				break;
		}
	});

	// Export types
	exports.push(`export type * from './types';`);

	// Export constants
	exports.push(`export * from './constants';`);

	const content = `// ${featureName} Feature Exports
${exports.join("\n")}
`;

	await fs.writeFile(indexPath, content);
}

/**
 * Generate feature types file
 */
async function generateFeatureTypes(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, type } = context;
	const typesPath = path.join(targetDir, "types", "index.ts");

	let content = `// ${featureName} Feature Types

export interface ${featureName}Config {
  enabled: boolean;
  settings: ${featureName}Settings;
}

export interface ${featureName}Settings {
  // TODO: Define feature-specific settings
  [key: string]: any;
}

export interface ${featureName}State {
  loading: boolean;
  error: string | null;
  data: any;
}
`;

	// Add type-specific interfaces
	switch (type) {
		case "crud":
			content += `
export interface ${featureName}Item {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: Add item-specific fields
}

export interface ${featureName}ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, any>;
}

export interface ${featureName}CreateInput {
  // TODO: Define create input fields
}

export interface ${featureName}UpdateInput {
  // TODO: Define update input fields
}`;
			break;

		case "auth":
			content += `
export interface ${featureName}User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface ${featureName}LoginInput {
  email: string;
  password: string;
}

export interface ${featureName}RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface ${featureName}Session {
  user: ${featureName}User;
  token: string;
  expiresAt: string;
}`;
			break;
	}

	await fs.writeFile(typesPath, content);
}

/**
 * Generate feature constants file
 */
async function generateFeatureConstants(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, type } = context;
	const constantsPath = path.join(targetDir, "constants.ts");

	let content = `// ${featureName} Feature Constants

export const ${featureName.toUpperCase()}_FEATURE = {
  NAME: '${context.fileName}',
  VERSION: '1.0.0',
  ENABLED: true,
} as const;

export const ${featureName.toUpperCase()}_ROUTES = {
  ROOT: '/${context.fileName}',
`;

	// Add type-specific routes
	switch (type) {
		case "crud":
			content += `  LIST: '/${context.fileName}',
  CREATE: '/${context.fileName}/create',
  DETAIL: '/${context.fileName}/[id]',
  EDIT: '/${context.fileName}/[id]/edit',`;
			break;

		case "auth":
			content += `  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  LOGOUT: '/logout',`;
			break;

		case "dashboard":
			content += `  OVERVIEW: '/${context.fileName}',
  ANALYTICS: '/${context.fileName}/analytics',`;
			break;

		case "ecommerce":
			content += `  PRODUCTS: '/${context.fileName}/products',
  PRODUCT: '/${context.fileName}/products/[id]',
  CART: '/${context.fileName}/cart',
  CHECKOUT: '/${context.fileName}/checkout',`;
			break;

		case "blog":
			content += `  POSTS: '/${context.fileName}',
  POST: '/${context.fileName}/[slug]',
  CATEGORY: '/${context.fileName}/category/[slug]',`;
			break;
	}

	content += `
} as const;

export const ${featureName.toUpperCase()}_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CACHE_TTL: 300000, // 5 minutes
} as const;
`;

	await fs.writeFile(constantsPath, content);
}

/**
 * Generate feature components
 */
async function generateFeatureComponents(context: FeatureContext): Promise<void> {
	const { components, featureName, ui, compliance, locales } = context;

	for (const component of components) {
		const componentName = `${featureName}${component.name}`;

		try {
			switch (component.type) {
				case "component":
					await generateComponentHandler(componentName, {
						...component.options,
						ui,
						compliance,
						locales,
						force: true,
					} as ComponentOptions);
					break;

				case "page":
					await generatePageHandler(`${componentName}Page`, {
						...component.options,
						ui,
						compliance,
						locales,
						force: true,
					} as PageOptions);
					break;

				case "service":
					await generateServiceHandler(`${componentName}Service`, {
						...component.options,
						ui,
						compliance,
						locales,
						force: true,
					} as ServiceOptions);
					break;

				case "hook":
					await generateHookHandler(`use${componentName}`, {
						...component.options,
						ui,
						compliance,
						locales,
						force: true,
					} as HookOptions);
					break;
			}

			log.info(`Generated ${component.type}: ${componentName}`);
		} catch (error) {
			consola.warn(`Failed to generate ${component.type} ${componentName}:`, error);
		}
	}
}

/**
 * Generate feature routing
 */
async function generateFeatureRouting(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, framework, components } = context;

	if (framework === "next") {
		await generateNextJSRouting(context);
	} else {
		await generateGenericRouting(context);
	}
}

/**
 * Generate Next.js routing configuration
 */
async function generateNextJSRouting(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, components } = context;
	const routingPath = path.join(targetDir, "routing.ts");

	const routes = components
		.filter(c => c.type === "page")
		.map(page => {
			const pageName = `${featureName}${page.name}Page`;
			return {
				path: `/${context.fileName}${page.name === "List" ? "" : `/${toKebabCase(page.name)}`}`,
				component: pageName,
				auth: page.options.auth || false,
			};
		});

	const content = `// ${featureName} Feature Routing Configuration

export const ${featureName.toLowerCase()}Routes = [
${routes.map(route => `  {
    path: '${route.path}',
    component: '${route.component}',
    auth: ${route.auth},
  }`).join(",\n")}
] as const;

export type ${featureName}Route = typeof ${featureName.toLowerCase()}Routes[number];
`;

	await fs.writeFile(routingPath, content);
}

/**
 * Generate generic routing configuration
 */
async function generateGenericRouting(context: FeatureContext): Promise<void> {
	const { targetDir, featureName } = context;
	const routingPath = path.join(targetDir, "routing.ts");

	const content = `// ${featureName} Feature Routing Configuration
// TODO: Configure routing for your specific framework

export const ${featureName.toLowerCase()}Routes = {
  // Define your routes here
} as const;
`;

	await fs.writeFile(routingPath, content);
}

/**
 * Generate feature tests
 */
async function generateFeatureTests(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, components } = context;
	const testsDir = path.join(targetDir, "__tests__");

	// Generate integration test
	const integrationTestPath = path.join(testsDir, `${context.fileName}.integration.test.ts`);
	const integrationContent = `// ${featureName} Feature Integration Tests

import { describe, it, expect } from '@jest/globals';

describe('${featureName} Feature Integration', () => {
  it('should initialize correctly', () => {
    // TODO: Add integration tests
    expect(true).toBe(true);
  });

  it('should handle component interactions', () => {
    // TODO: Add component interaction tests
    expect(true).toBe(true);
  });

  it('should handle routing', () => {
    // TODO: Add routing tests
    expect(true).toBe(true);
  });
});
`;

	await fs.writeFile(integrationTestPath, integrationContent);

	// Generate end-to-end test
	const e2eTestPath = path.join(testsDir, `${context.fileName}.e2e.test.ts`);
	const e2eContent = `// ${featureName} Feature End-to-End Tests

import { describe, it, expect } from '@jest/globals';

describe('${featureName} Feature E2E', () => {
  it('should complete full user workflow', () => {
    // TODO: Add end-to-end tests
    expect(true).toBe(true);
  });
});
`;

	await fs.writeFile(e2eTestPath, e2eContent);
}

/**
 * Generate feature documentation
 */
async function generateFeatureDocumentation(context: FeatureContext): Promise<void> {
	const { targetDir, featureName, type, components } = context;
	const docsDir = path.join(targetDir, "docs");

	// Generate README
	const readmePath = path.join(docsDir, "README.md");
	const readmeContent = `# ${featureName} Feature

## Overview

${getFeatureDescription(type)} This feature provides a complete implementation with components, services, and routing.

## Components

${components.map(component => `### ${component.name} (${component.type})

TODO: Document the ${component.name} ${component.type}

**Dependencies:** ${component.dependencies.length > 0 ? component.dependencies.join(", ") : "None"}
`).join("\n")}

## Usage

\`\`\`typescript
import { ${featureName} } from '@/features/${context.fileName}';

// TODO: Add usage examples
\`\`\`

## API

### Routes

${getRouteDocumentation(context)}

### Types

See \`types/index.ts\` for all TypeScript interfaces and types.

## Testing

Run feature tests with:

\`\`\`bash
npm test -- ${context.fileName}
\`\`\`

## Deployment

${context.deployment ? "Deployment configuration is available in the deployment directory." : "No deployment configuration generated."}
`;

	await fs.writeFile(readmePath, readmeContent);

	// Generate API documentation
	const apiDocPath = path.join(docsDir, "api.md");
	const apiContent = `# ${featureName} API Documentation

## Endpoints

TODO: Document API endpoints

## Authentication

${context.authentication ? "This feature requires authentication." : "This feature does not require authentication."}

## Error Handling

TODO: Document error responses and handling
`;

	await fs.writeFile(apiDocPath, apiContent);
}

/**
 * Get feature description based on type
 */
function getFeatureDescription(type: FeatureType): string {
	switch (type) {
		case "crud":
			return "A complete CRUD (Create, Read, Update, Delete) feature with list, detail, create, and edit functionality.";
		case "auth":
			return "A comprehensive authentication feature with login, registration, and user management.";
		case "dashboard":
			return "A dashboard feature with analytics, data visualization, and overview components.";
		case "ecommerce":
			return "An e-commerce feature with product listing, cart, and checkout functionality.";
		case "blog":
			return "A blog feature with post listing, detail views, and content management.";
		case "custom":
			return "A custom feature with user-defined components and functionality.";
		default:
			return "A feature with specialized functionality.";
	}
}

/**
 * Get route documentation
 */
function getRouteDocumentation(context: FeatureContext): string {
	const { type, fileName } = context;

	switch (type) {
		case "crud":
			return `- \`/${fileName}\` - List view
- \`/${fileName}/create\` - Create new item
- \`/${fileName}/[id]\` - Item detail view
- \`/${fileName}/[id]/edit\` - Edit item`;

		case "auth":
			return `- \`/login\` - User login
- \`/register\` - User registration
- \`/profile\` - User profile management`;

		case "dashboard":
			return `- \`/${fileName}\` - Dashboard overview
- \`/${fileName}/analytics\` - Analytics view`;

		case "ecommerce":
			return `- \`/${fileName}/products\` - Product listing
- \`/${fileName}/products/[id]\` - Product detail
- \`/${fileName}/cart\` - Shopping cart
- \`/${fileName}/checkout\` - Checkout process`;

		case "blog":
			return `- \`/${fileName}\` - Blog post listing
- \`/${fileName}/[slug]\` - Post detail
- \`/${fileName}/category/[slug]\` - Category view`;

		default:
			return "TODO: Document feature routes";
	}
}

/**
 * Generate deployment configuration
 */
async function generateDeploymentConfig(context: FeatureContext): Promise<void> {
	const { targetDir, featureName } = context;
	const deploymentDir = path.join(targetDir, "deployment");
	await fs.ensureDir(deploymentDir);

	// Generate Docker configuration
	const dockerfilePath = path.join(deploymentDir, "Dockerfile");
	const dockerContent = `# ${featureName} Feature Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy feature files
COPY . .

# Install dependencies
RUN npm install

# Build feature
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`;

	await fs.writeFile(dockerfilePath, dockerContent);

	// Generate deployment manifest
	const manifestPath = path.join(deploymentDir, "manifest.yml");
	const manifestContent = `# ${featureName} Feature Deployment Manifest
apiVersion: v1
kind: Deployment
metadata:
  name: ${context.fileName}-feature
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${context.fileName}-feature
  template:
    metadata:
      labels:
        app: ${context.fileName}-feature
    spec:
      containers:
      - name: ${context.fileName}
        image: ${context.fileName}-feature:latest
        ports:
        - containerPort: 3000
`;

	await fs.writeFile(manifestPath, manifestContent);
}

/**
 * Display next steps
 */
function displayNextSteps(context: FeatureContext): void {
	const { featureName, components, routing, testing, documentation, deployment } = context;

	const steps = [
		`Feature ${featureName} created successfully!`,
		"",
		"Generated components:",
		...components.map(c => `  - ${c.type}: ${featureName}${c.name}`),
		"",
		"Generated files:",
		`  - index.ts (feature exports)`,
		`  - types/index.ts (TypeScript types)`,
		`  - constants.ts (feature constants)`,
	];

	if (routing) {
		steps.push(`  - routing.ts (routing configuration)`);
	}

	if (testing) {
		steps.push(`  - __tests__/ (integration and e2e tests)`);
	}

	if (documentation) {
		steps.push(`  - docs/ (feature documentation)`);
	}

	if (deployment) {
		steps.push(`  - deployment/ (deployment configuration)`);
	}

	steps.push("", "Next steps:");
	steps.push("1. Implement the component logic and business requirements");
	steps.push("2. Configure routing and navigation");
	
	if (testing) {
		steps.push("3. Write comprehensive tests for all components");
	}

	steps.push(`${testing ? "4" : "3"}. Update the feature documentation`);

	if (context.authentication) {
		steps.push(`${steps.length - 5}. Set up authentication guards and permissions`);
	}

	if (deployment) {
		steps.push(`${steps.length - 5}. Configure deployment pipeline`);
	}

	if (context.rollback) {
		steps.push(`${steps.length - 5}. Backup created for rollback if needed`);
	}

	consola.box(steps.join("\n"));
}