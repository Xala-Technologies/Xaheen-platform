import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, multiselect, text, confirm } from "@clack/prompts";
import { z } from "zod";
import type { ProjectConfig, UISystem, Compliance, Language } from "../../types";
import { detectProjectConfig } from "./detect-project-config";
import { generateComponent, type ComponentGenerationOptions } from "../../generators/component-generator";

// Component types
export type ComponentType = "display" | "form" | "layout";

// Prop type schema
const PropTypeSchema = z.enum(["string", "number", "boolean", "Date", "object", "array", "function"]);
type PropType = z.infer<typeof PropTypeSchema>;

// Component prop interface
interface ComponentProp {
	name: string;
	type: PropType;
	optional: boolean;
	defaultValue?: string;
}

// Component options interface
export interface ComponentOptions {
	type?: ComponentType;
	props?: string[]; // Format: "name:string", "count:number?", etc.
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	skipTests?: boolean;
	skipStories?: boolean;
	directory?: string;
	force?: boolean;
}

// Component generation context
interface ComponentContext {
	name: string;
	componentName: string; // PascalCase version
	fileName: string;
	type: ComponentType;
	props: ComponentProp[];
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	projectRoot: string;
	targetDir: string;
	hasTests: boolean;
	hasStories: boolean;
}

/**
 * Generate a component in an existing project
 */
export async function generateComponentHandler(
	name: string,
	options: ComponentOptions = {}
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

		// Step 3: Component naming convention validation
		const componentName = validateAndNormalizeComponentName(name);
		const fileName = toKebabCase(componentName);

		// Step 4: Component type selection
		const componentType = options.type || await promptComponentType();

		// Step 5: Props parsing and validation
		const props = options.props ? parseProps(options.props) : await promptForProps();

		// Step 6: UI system integration
		const uiSystem = options.ui || projectConfig.ui || "default";

		// Step 7: Compliance feature integration
		const compliance = options.compliance || projectConfig.compliance || "none";

		// Step 8: Localization integration
		const locales = options.locales || projectConfig.locales || ["en"];

		// Step 9: Determine target directory
		const targetDir = await determineTargetDirectory(
			projectRoot,
			componentType,
			options.directory
		);

		// Step 10: Check for existing component conflicts
		const componentPath = path.join(targetDir, `${fileName}.tsx`);
		if (await fs.pathExists(componentPath) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Component ${componentName} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Component generation cancelled.");
				return;
			}
		}

		// Create component context
		const context: ComponentContext = {
			name,
			componentName,
			fileName,
			type: componentType,
			props,
			ui: uiSystem,
			compliance,
			locales,
			projectRoot,
			targetDir,
			hasTests: !options.skipTests,
			hasStories: !options.skipStories,
		};

		// Generate the component
		log.info(`Generating ${componentType} component: ${componentName}`);
		
		// Prepare generation options
		const generationOptions: ComponentGenerationOptions = {
			name,
			componentName,
			fileName,
			type: componentType,
			props,
			ui: uiSystem,
			compliance,
			locales,
			primaryLocale: locales[0] || "en",
			projectRoot,
			targetDir,
			includeTests: !options.skipTests,
			includeStories: !options.skipStories,
			includeStyles: uiSystem === "xala",
		};

		// Generate component files
		const result = await generateComponent(generationOptions);

		if (!result.success) {
			consola.error("Failed to generate component:");
			result.errors?.forEach(error => consola.error(`  - ${error}`));
			process.exit(1);
		}

		result.warnings?.forEach(warning => consola.warn(warning));

		log.success(`Component ${componentName} generated successfully!`);
		
		// Display next steps
		displayNextSteps(context, result);

	} catch (error) {
		consola.error("Failed to generate component:", error);
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
			// Check if it's a xaheen project
			if (await fs.pathExists(xaheenConfigPath) || await fs.pathExists(btsstackConfigPath)) {
				return currentDir;
			}

			// Check package.json for xaheen dependencies
			try {
				const packageJson = await fs.readJson(packageJsonPath);
				if (packageJson.dependencies?.["@xaheen/cli"] || 
					packageJson.devDependencies?.["@xaheen/cli"] ||
					packageJson.dependencies?.["better-tstack"] ||
					packageJson.devDependencies?.["better-tstack"]) {
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
 * Validate and normalize component name to PascalCase
 */
function validateAndNormalizeComponentName(name: string): string {
	// Remove file extension if provided
	const cleanName = name.replace(/\.(tsx?|jsx?)$/, "");

	// Check for invalid characters
	if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(cleanName)) {
		throw new Error(
			"Component name must start with a letter and contain only letters, numbers, hyphens, and underscores"
		);
	}

	// Convert to PascalCase
	return toPascalCase(cleanName);
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
	return str
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		.replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();
}

/**
 * Prompt for component type
 */
async function promptComponentType(): Promise<ComponentType> {
	const type = await select({
		message: "What type of component are you creating?",
		options: [
			{ value: "display", label: "Display - For showing data (cards, lists, etc.)" },
			{ value: "form", label: "Form - For user input (forms, inputs, etc.)" },
			{ value: "layout", label: "Layout - For page structure (headers, sidebars, etc.)" },
		],
	});

	return type as ComponentType;
}

/**
 * Parse props from string array
 */
function parseProps(propStrings: string[]): ComponentProp[] {
	const props: ComponentProp[] = [];

	for (const propString of propStrings) {
		const match = propString.match(/^([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z]+)(\?)?$/);
		if (!match) {
			throw new Error(
				`Invalid prop format: ${propString}. Expected format: "name:type" or "name:type?"`
			);
		}

		const [, propName, propType, optional] = match;
		
		// Validate prop type
		const validTypes = ["string", "number", "boolean", "Date", "object", "array", "function"];
		if (!validTypes.includes(propType)) {
			throw new Error(
				`Invalid prop type: ${propType}. Valid types are: ${validTypes.join(", ")}`
			);
		}

		props.push({
			name: propName,
			type: propType as PropType,
			optional: !!optional,
		});
	}

	return props;
}

/**
 * Prompt for component props
 */
async function promptForProps(): Promise<ComponentProp[]> {
	const props: ComponentProp[] = [];
	
	const wantsProps = await confirm({
		message: "Do you want to add props to this component?",
		initialValue: true,
	});

	if (!wantsProps) {
		return props;
	}

	let addingProps = true;
	while (addingProps) {
		const propName = await text({
			message: "Prop name:",
			validate: (value) => {
				if (!value) return "Prop name is required";
				if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
					return "Invalid prop name format";
				}
				if (props.some(p => p.name === value)) {
					return "Prop name already exists";
				}
				return;
			},
		});

		if (typeof propName === "symbol") break;

		const propType = await select({
			message: "Prop type:",
			options: [
				{ value: "string", label: "string" },
				{ value: "number", label: "number" },
				{ value: "boolean", label: "boolean" },
				{ value: "Date", label: "Date" },
				{ value: "object", label: "object" },
				{ value: "array", label: "array" },
				{ value: "function", label: "function" },
			],
		});

		if (typeof propType === "symbol") break;

		const isOptional = await confirm({
			message: "Is this prop optional?",
			initialValue: false,
		});

		if (typeof isOptional === "symbol") break;

		props.push({
			name: propName,
			type: propType as PropType,
			optional: isOptional,
		});

		const addAnother = await confirm({
			message: "Add another prop?",
			initialValue: false,
		});

		if (typeof addAnother === "symbol" || !addAnother) {
			addingProps = false;
		}
	}

	return props;
}

/**
 * Determine the target directory for the component
 */
async function determineTargetDirectory(
	projectRoot: string,
	componentType: ComponentType,
	customDirectory?: string
): Promise<string> {
	if (customDirectory) {
		return path.join(projectRoot, customDirectory);
	}

	// Check common directory structures
	const possibleDirs = [
		path.join(projectRoot, "src", "components", componentType),
		path.join(projectRoot, "src", "components"),
		path.join(projectRoot, "components", componentType),
		path.join(projectRoot, "components"),
		path.join(projectRoot, "app", "components", componentType),
		path.join(projectRoot, "app", "components"),
	];

	// Find the first existing directory
	for (const dir of possibleDirs) {
		if (await fs.pathExists(dir)) {
			return dir;
		}
	}

	// If no directory exists, create one in the most common location
	const defaultDir = path.join(projectRoot, "src", "components", componentType);
	await fs.ensureDir(defaultDir);
	return defaultDir;
}

/**
 * Display next steps after component generation
 */
function displayNextSteps(context: ComponentContext, result: import("../../generators/component-generator").GenerationResult): void {
	const files = result.files.map(f => path.relative(context.projectRoot, f));
	
	consola.box(
		`Component ${context.componentName} created successfully!\n\n` +
		`Generated files:\n${files.map(f => `  - ${f}`).join("\n")}\n\n` +
		`Next steps:\n` +
		`1. Import and use your component\n` +
		`2. Implement the component logic\n` +
		(context.hasTests ? `3. Run tests with your test runner\n` : "") +
		(context.hasStories ? `4. View stories in Storybook\n` : "") +
		(context.locales.length > 1 ? `5. Add translations for all locales\n` : "")
	);
}