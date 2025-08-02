import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, text, confirm, multiselect } from "@clack/prompts";
import type { ProjectConfig, UISystem, Compliance, Language, Frontend } from "../../types";
import { detectProjectConfig } from "./detect-project-config";
import { generateComponent, type ComponentGenerationOptions } from "../../generators/component-generator";

// Page layout types
export type PageLayout = "default" | "auth" | "dashboard" | "marketing" | "blank";

// Page options interface
export interface PageOptions {
	route?: string; // e.g., "/about", "/users/[id]"
	layout?: PageLayout;
	requiresAuth?: boolean;
	generateComponents?: boolean;
	seo?: {
		title?: string;
		description?: string;
		keywords?: string[];
	};
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	force?: boolean;
}

// Page context interface
interface PageContext {
	name: string;
	pageName: string; // PascalCase
	fileName: string; // kebab-case
	route: string;
	routePath: string[]; // Split route for nested paths
	layout: PageLayout;
	requiresAuth: boolean;
	seo: {
		title: string;
		description: string;
		keywords: string[];
	};
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	projectRoot: string;
	targetDir: string;
	framework: Frontend;
	hasAppRouter: boolean;
	components: string[]; // Components to generate with the page
}

/**
 * Generate a page in an existing project
 */
export async function generatePageHandler(
	name: string,
	options: PageOptions = {}
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

		// Step 3: Detect framework and validate
		const framework = detectFramework(projectConfig);
		if (!framework) {
			consola.error("Page generation is only supported for Next.js, Nuxt, and TanStack Start projects.");
			process.exit(1);
		}

		// Step 4: Page naming and route handling
		const { pageName, fileName, route } = await processPageNameAndRoute(name, options.route);

		// Step 5: Layout selection
		const layout = options.layout || await promptLayoutSelection();

		// Step 6: Authentication requirement handling
		const requiresAuth = options.requiresAuth ?? await promptAuthRequirement();

		// Step 7: SEO metadata
		const seo = await processSeoMetadata(pageName, options.seo);

		// Step 8: UI and compliance settings
		const ui = options.ui || projectConfig.ui || "default";
		const compliance = options.compliance || projectConfig.compliance || "none";
		const locales = options.locales || projectConfig.locales || ["en"];

		// Step 9: Determine target directory based on framework
		const { targetDir, routePath } = await determineTargetDirectory(
			projectRoot,
			framework,
			route
		);

		// Step 10: Check for route conflicts
		const pageFile = getPageFileName(framework, fileName);
		const pagePath = path.join(targetDir, pageFile);
		
		if (await fs.pathExists(pagePath) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Page at route ${route} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Page generation cancelled.");
				return;
			}
		}

		// Step 11: Determine components to generate
		const components = options.generateComponents 
			? await promptComponentGeneration(pageName)
			: [];

		// Create page context
		const context: PageContext = {
			name,
			pageName,
			fileName,
			route,
			routePath,
			layout,
			requiresAuth,
			seo,
			ui,
			compliance,
			locales,
			projectRoot,
			targetDir,
			framework,
			hasAppRouter: framework === "next" && await hasNextAppRouter(projectRoot),
			components,
		};

		// Generate the page
		log.info(`Generating ${layout} page: ${pageName} at route ${route}`);
		
		// Use the page generator
		const { generatePage, type PageGenerationOptions } = await import("../../generators/page-generator");
		
		const generationOptions: PageGenerationOptions = {
			name,
			pageName,
			fileName,
			route,
			routePath,
			layout,
			requiresAuth,
			seo,
			ui,
			compliance,
			locales,
			primaryLocale: locales[0] || "en",
			projectRoot,
			targetDir,
			framework,
			hasAppRouter: framework === "next" && await hasNextAppRouter(projectRoot),
			includeLoading: layout !== "blank" && framework === "next",
			includeError: layout !== "blank" && framework === "next",
			includeLayout: layout !== "default" && layout !== "blank",
			includeMetadata: true,
		};

		const result = await generatePage(generationOptions);

		if (!result.success) {
			consola.error("Failed to generate page:");
			result.errors?.forEach(error => consola.error(`  - ${error}`));
			process.exit(1);
		}

		result.warnings?.forEach(warning => consola.warn(warning));

		// Generate associated components
		if (components.length > 0) {
			await generatePageComponents(context);
		}

		// Add breadcrumb configuration
		if (layout === "dashboard" || layout === "auth") {
			await addBreadcrumbConfiguration(context);
		}

		log.success(`Page ${pageName} generated successfully at ${route}!`);
		
		// Display next steps
		displayNextSteps(context, result);

	} catch (error) {
		consola.error("Failed to generate page:", error);
		process.exit(1);
	}
}

/**
 * Detect the project root by looking for package.json and xaheen config
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
	const supportedFrameworks: Frontend[] = ["next", "nuxt", "tanstack-start"];
	
	if (config.frontend && Array.isArray(config.frontend)) {
		const framework = config.frontend.find((f: Frontend) => supportedFrameworks.includes(f));
		return framework || null;
	}

	return null;
}

/**
 * Process page name and route
 */
async function processPageNameAndRoute(
	name: string,
	providedRoute?: string
): Promise<{ pageName: string; fileName: string; route: string }> {
	// Clean the name
	const cleanName = name.replace(/\.(tsx?|jsx?|vue)$/, "");
	
	// Determine route
	let route = providedRoute;
	if (!route) {
		// Convert name to route format
		route = "/" + cleanName
			.replace(/([a-z])([A-Z])/g, "$1-$2")
			.toLowerCase()
			.replace(/\s+/g, "-");
		
		const customRoute = await text({
			message: "Enter the route path:",
			initialValue: route,
			validate: (value) => {
				if (!value || !value.startsWith("/")) {
					return "Route must start with /";
				}
				return;
			},
		});

		if (typeof customRoute === "symbol") {
			throw new Error("Route input cancelled");
		}

		route = customRoute;
	}

	// Generate page name from route
	const pageName = route
		.split("/")
		.filter(Boolean)
		.map(segment => {
			// Handle dynamic segments
			if (segment.startsWith("[") && segment.endsWith("]")) {
				const param = segment.slice(1, -1);
				return param.charAt(0).toUpperCase() + param.slice(1) + "Page";
			}
			return segment
				.split("-")
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
				.join("");
		})
		.join("") || "Home";

	const fileName = pageName
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.toLowerCase()
		.replace(/page$/, "");

	return { pageName: pageName + "Page", fileName, route };
}

/**
 * Prompt for layout selection
 */
async function promptLayoutSelection(): Promise<PageLayout> {
	const layout = await select({
		message: "Select a layout for this page:",
		options: [
			{ value: "default", label: "Default - Standard page layout" },
			{ value: "auth", label: "Auth - For login/register pages" },
			{ value: "dashboard", label: "Dashboard - Admin/user dashboard" },
			{ value: "marketing", label: "Marketing - Landing/marketing pages" },
			{ value: "blank", label: "Blank - No layout wrapper" },
		],
	});

	return layout as PageLayout;
}

/**
 * Prompt for authentication requirement
 */
async function promptAuthRequirement(): Promise<boolean> {
	const requiresAuth = await confirm({
		message: "Does this page require authentication?",
		initialValue: false,
	});

	return typeof requiresAuth === "symbol" ? false : requiresAuth;
}

/**
 * Process SEO metadata
 */
async function processSeoMetadata(
	pageName: string,
	providedSeo?: PageOptions["seo"]
): Promise<PageContext["seo"]> {
	const defaultTitle = pageName.replace(/Page$/, "").replace(/([A-Z])/g, " $1").trim();
	
	if (providedSeo) {
		return {
			title: providedSeo.title || defaultTitle,
			description: providedSeo.description || `${defaultTitle} page`,
			keywords: providedSeo.keywords || [],
		};
	}

	const wantsSeo = await confirm({
		message: "Do you want to add SEO metadata?",
		initialValue: true,
	});

	if (typeof wantsSeo === "symbol" || !wantsSeo) {
		return {
			title: defaultTitle,
			description: `${defaultTitle} page`,
			keywords: [],
		};
	}

	const title = await text({
		message: "Page title:",
		initialValue: defaultTitle,
	});

	const description = await text({
		message: "Page description:",
		initialValue: `${defaultTitle} page`,
	});

	const keywordsInput = await text({
		message: "Keywords (comma-separated):",
		initialValue: "",
	});

	const keywords = typeof keywordsInput === "string" 
		? keywordsInput.split(",").map(k => k.trim()).filter(Boolean)
		: [];

	return {
		title: typeof title === "string" ? title : defaultTitle,
		description: typeof description === "string" ? description : `${defaultTitle} page`,
		keywords,
	};
}

/**
 * Determine target directory based on framework and route
 */
async function determineTargetDirectory(
	projectRoot: string,
	framework: Frontend,
	route: string
): Promise<{ targetDir: string; routePath: string[] }> {
	const routePath = route.split("/").filter(Boolean);
	
	let baseDir = projectRoot;
	
	if (framework === "next") {
		// Check for app directory (App Router)
		const appDir = path.join(projectRoot, "app");
		const srcAppDir = path.join(projectRoot, "src", "app");
		
		if (await fs.pathExists(srcAppDir)) {
			baseDir = srcAppDir;
		} else if (await fs.pathExists(appDir)) {
			baseDir = appDir;
		} else {
			// Pages directory (Pages Router)
			const pagesDir = path.join(projectRoot, "pages");
			const srcPagesDir = path.join(projectRoot, "src", "pages");
			
			if (await fs.pathExists(srcPagesDir)) {
				baseDir = srcPagesDir;
			} else if (await fs.pathExists(pagesDir)) {
				baseDir = pagesDir;
			} else {
				// Create app directory
				baseDir = srcAppDir;
				await fs.ensureDir(baseDir);
			}
		}
	} else if (framework === "nuxt") {
		const pagesDir = path.join(projectRoot, "pages");
		baseDir = pagesDir;
		await fs.ensureDir(baseDir);
	} else if (framework === "tanstack-start") {
		const routesDir = path.join(projectRoot, "src", "routes");
		baseDir = routesDir;
		await fs.ensureDir(baseDir);
	}

	// Create nested directories for the route
	const targetDir = path.join(baseDir, ...routePath);
	await fs.ensureDir(targetDir);

	return { targetDir, routePath };
}

/**
 * Check if Next.js project uses App Router
 */
async function hasNextAppRouter(projectRoot: string): Promise<boolean> {
	const appDir = path.join(projectRoot, "app");
	const srcAppDir = path.join(projectRoot, "src", "app");
	
	return await fs.pathExists(appDir) || await fs.pathExists(srcAppDir);
}

/**
 * Get page file name based on framework
 */
function getPageFileName(framework: Frontend, baseName: string): string {
	switch (framework) {
		case "next":
			return "page.tsx"; // App Router uses page.tsx
		case "nuxt":
			return `${baseName}.vue`;
		case "tanstack-start":
			return `${baseName}.tsx`;
		default:
			return `${baseName}.tsx`;
	}
}

/**
 * Prompt for component generation
 */
async function promptComponentGeneration(pageName: string): Promise<string[]> {
	const wantsComponents = await confirm({
		message: "Do you want to generate components for this page?",
		initialValue: true,
	});

	if (typeof wantsComponents === "symbol" || !wantsComponents) {
		return [];
	}

	const componentTypes = await multiselect({
		message: "Select components to generate:",
		options: [
			{ value: `${pageName}Header`, label: "Page Header" },
			{ value: `${pageName}Content`, label: "Main Content" },
			{ value: `${pageName}Sidebar`, label: "Sidebar" },
			{ value: `${pageName}Footer`, label: "Page Footer" },
			{ value: `${pageName}Hero`, label: "Hero Section" },
			{ value: `${pageName}Form`, label: "Form Component" },
		],
		required: false,
	});

	return typeof componentTypes === "symbol" ? [] : componentTypes as string[];
}

/**
 * Generate page components
 */
async function generatePageComponents(context: PageContext): Promise<void> {
	const { components, projectRoot, ui, compliance, locales } = context;
	
	for (const componentName of components) {
		const componentOptions: ComponentGenerationOptions = {
			name: componentName,
			componentName,
			fileName: componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
			type: componentName.includes("Form") ? "form" : "display",
			props: [],
			ui,
			compliance,
			locales,
			primaryLocale: locales[0] || "en",
			projectRoot,
			targetDir: path.join(projectRoot, "src/components", "pages"),
			includeTests: true,
			includeStories: false,
			includeStyles: ui === "xala",
		};

		await generateComponent(componentOptions);
	}
}

/**
 * Add breadcrumb configuration
 */
async function addBreadcrumbConfiguration(context: PageContext): Promise<void> {
	const { projectRoot, route, pageName } = context;
	
	const breadcrumbConfigPath = path.join(projectRoot, "src", "config", "breadcrumbs.ts");
	
	if (await fs.pathExists(breadcrumbConfigPath)) {
		let content = await fs.readFile(breadcrumbConfigPath, "utf-8");
		
		// Add breadcrumb entry
		const breadcrumbEntry = `  '${route}': {
    label: '${pageName.replace(/Page$/, "")}',
    parent: '${route.split("/").slice(0, -1).join("/") || "/"}',
  },`;
		
		// Insert before the closing bracket
		content = content.replace(/\}(\s*\);?)$/, `${breadcrumbEntry}\n}$1`);
		
		await fs.writeFile(breadcrumbConfigPath, content);
	}
}

/**
 * Display next steps
 */
function displayNextSteps(context: PageContext, result: import("../../generators/page-generator").GenerationResult): void {
	const { pageName, route, framework, components, requiresAuth, layout } = context;
	
	const files = result.files.map(f => path.relative(context.projectRoot, f));
	
	const steps = [
		`Page ${pageName} created at route: ${route}`,
		"",
		`Generated files:`,
		...files.map(f => `  - ${f}`),
		"",
		"Next steps:",
		"1. Implement your page logic",
	];

	if (components.length > 0) {
		steps.push(`2. Implement the generated components: ${components.join(", ")}`);
	}

	if (requiresAuth) {
		steps.push(`${components.length > 0 ? "3" : "2"}. Configure authentication middleware`);
	}

	if (layout !== "default" && layout !== "blank") {
		steps.push(`${steps.length - 3}. Customize the ${layout} layout`);
	}

	if (framework === "next") {
		steps.push(`${steps.length - 3}. Run 'npm run dev' to see your page`);
	}

	consola.box(steps.join("\n"));
}