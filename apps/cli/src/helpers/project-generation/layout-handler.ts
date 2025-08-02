import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, confirm, multiselect, text } from "@clack/prompts";
import type { ProjectConfig, UISystem, Compliance, Language, Frontend } from "../../types";
import { detectProjectConfig } from "./detect-project-config";
import { generateComponent, type ComponentGenerationOptions } from "../../generators/component-generator";

// Layout types
export type LayoutType = "app" | "page" | "component";

// Layout structure
export interface LayoutStructure {
	hasHeader: boolean;
	hasFooter: boolean;
	hasSidebar: boolean;
	sidebarPosition?: "left" | "right";
	hasNavigation: boolean;
	navigationPosition?: "header" | "sidebar" | "both";
	hasBreadcrumbs: boolean;
}

// Layout options interface
export interface LayoutOptions {
	type?: LayoutType;
	structure?: Partial<LayoutStructure>;
	responsive?: boolean;
	mobileFirst?: boolean;
	theme?: "light" | "dark" | "system";
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	skipComponents?: boolean;
	force?: boolean;
}

// Layout context interface
interface LayoutContext {
	name: string;
	layoutName: string; // PascalCase
	fileName: string; // kebab-case
	type: LayoutType;
	structure: LayoutStructure;
	responsive: boolean;
	mobileFirst: boolean;
	theme: "light" | "dark" | "system";
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	projectRoot: string;
	targetDir: string;
	framework: Frontend;
	components: string[]; // Components to generate with the layout
}

/**
 * Generate a layout in an existing project
 */
export async function generateLayoutHandler(
	name: string,
	options: LayoutOptions = {}
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

		// Step 4: Layout naming
		const layoutName = validateAndNormalizeLayoutName(name);
		const fileName = toKebabCase(layoutName);

		// Step 5: Layout type selection
		const layoutType = options.type || await promptLayoutType();

		// Step 6: Layout structure configuration
		const structure = await configureLayoutStructure(options.structure);

		// Step 7: Responsive and theme settings
		const responsive = options.responsive ?? true;
		const mobileFirst = options.mobileFirst ?? true;
		const theme = options.theme || await promptTheme();

		// Step 8: UI and compliance settings
		const ui = options.ui || projectConfig.ui || "default";
		const compliance = options.compliance || projectConfig.compliance || "none";
		const locales = options.locales || projectConfig.locales || ["en"];

		// Step 9: Determine target directory
		const targetDir = await determineTargetDirectory(
			projectRoot,
			framework,
			layoutType
		);

		// Step 10: Check for existing layout
		const layoutPath = path.join(targetDir, `${fileName}.${getFileExtension(framework)}`);
		if (await fs.pathExists(layoutPath) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Layout ${layoutName} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Layout generation cancelled.");
				return;
			}
		}

		// Step 11: Determine components to generate
		const components = await determineLayoutComponents(structure, layoutName, options.skipComponents);

		// Create layout context
		const context: LayoutContext = {
			name,
			layoutName,
			fileName,
			type: layoutType,
			structure,
			responsive,
			mobileFirst,
			theme,
			ui,
			compliance,
			locales,
			projectRoot,
			targetDir,
			framework,
			components,
		};

		// Generate the layout
		log.info(`Generating ${layoutType} layout: ${layoutName}`);
		
		// Generate layout file
		await generateLayoutFile(context);

		// Generate associated components
		if (components.length > 0 && !options.skipComponents) {
			await generateLayoutComponents(context);
		}

		// Generate theme configuration if needed
		if (theme === "system") {
			await generateThemeConfiguration(context);
		}

		// Add accessibility features
		if (compliance !== "none") {
			await addAccessibilityFeatures(context);
		}

		log.success(`Layout ${layoutName} generated successfully!`);
		
		// Display next steps
		displayNextSteps(context);

	} catch (error) {
		consola.error("Failed to generate layout:", error);
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
 * Validate and normalize layout name
 */
function validateAndNormalizeLayoutName(name: string): string {
	const cleanName = name.replace(/\.(tsx?|jsx?|vue)$/, "");

	if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(cleanName)) {
		throw new Error(
			"Layout name must start with a letter and contain only letters, numbers, hyphens, and underscores"
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
 * Prompt for layout type
 */
async function promptLayoutType(): Promise<LayoutType> {
	const type = await select({
		message: "What type of layout are you creating?",
		options: [
			{ value: "app", label: "App Layout - Root layout for the entire application" },
			{ value: "page", label: "Page Layout - Shared layout for a section of pages" },
			{ value: "component", label: "Component Layout - Reusable layout component" },
		],
	});

	return type as LayoutType;
}

/**
 * Configure layout structure
 */
async function configureLayoutStructure(
	providedStructure?: Partial<LayoutStructure>
): Promise<LayoutStructure> {
	if (providedStructure && isCompleteStructure(providedStructure)) {
		return providedStructure as LayoutStructure;
	}

	const components = await multiselect({
		message: "Select layout components:",
		options: [
			{ value: "header", label: "Header", selected: true },
			{ value: "footer", label: "Footer", selected: true },
			{ value: "sidebar", label: "Sidebar" },
			{ value: "navigation", label: "Navigation", selected: true },
			{ value: "breadcrumbs", label: "Breadcrumbs" },
		],
		required: false,
	});

	const componentList = Array.isArray(components) ? components : [];
	const structure: LayoutStructure = {
		hasHeader: componentList.includes("header"),
		hasFooter: componentList.includes("footer"),
		hasSidebar: componentList.includes("sidebar"),
		hasNavigation: componentList.includes("navigation"),
		hasBreadcrumbs: componentList.includes("breadcrumbs"),
	};

	// Configure sidebar position if selected
	if (structure.hasSidebar) {
		const sidebarPosition = await select({
			message: "Sidebar position:",
			options: [
				{ value: "left", label: "Left" },
				{ value: "right", label: "Right" },
			],
		});
		structure.sidebarPosition = sidebarPosition as "left" | "right";
	}

	// Configure navigation position if selected
	if (structure.hasNavigation) {
		const navigationPosition = await select({
			message: "Navigation position:",
			options: [
				{ value: "header", label: "In Header" },
				{ value: "sidebar", label: "In Sidebar" },
				{ value: "both", label: "Both Header and Sidebar" },
			],
		});
		structure.navigationPosition = navigationPosition as "header" | "sidebar" | "both";
	}

	return structure;
}

/**
 * Check if structure is complete
 */
function isCompleteStructure(structure: Partial<LayoutStructure>): boolean {
	return (
		structure.hasHeader !== undefined &&
		structure.hasFooter !== undefined &&
		structure.hasSidebar !== undefined &&
		structure.hasNavigation !== undefined &&
		structure.hasBreadcrumbs !== undefined
	);
}

/**
 * Prompt for theme
 */
async function promptTheme(): Promise<"light" | "dark" | "system"> {
	const theme = await select({
		message: "Select theme support:",
		options: [
			{ value: "light", label: "Light theme only" },
			{ value: "dark", label: "Dark theme only" },
			{ value: "system", label: "System theme (light/dark toggle)" },
		],
	});

	return theme as "light" | "dark" | "system";
}

/**
 * Determine target directory
 */
async function determineTargetDirectory(
	projectRoot: string,
	framework: Frontend,
	layoutType: LayoutType
): Promise<string> {
	let baseDir = projectRoot;

	if (framework === "next") {
		// Next.js App Router
		const appDir = path.join(projectRoot, "app");
		const srcAppDir = path.join(projectRoot, "src", "app");
		
		if (await fs.pathExists(srcAppDir)) {
			baseDir = srcAppDir;
		} else if (await fs.pathExists(appDir)) {
			baseDir = appDir;
		} else {
			// Pages Router layouts
			baseDir = path.join(projectRoot, "src", "components", "layouts");
		}
	} else if (framework === "nuxt") {
		baseDir = path.join(projectRoot, "layouts");
	} else {
		// Generic location for other frameworks
		baseDir = path.join(projectRoot, "src", "layouts");
	}

	// Create subdirectory based on layout type
	if (layoutType === "component") {
		baseDir = path.join(projectRoot, "src", "components", "layouts");
	}

	await fs.ensureDir(baseDir);
	return baseDir;
}

/**
 * Get file extension based on framework
 */
function getFileExtension(framework: Frontend): string {
	switch (framework) {
		case "nuxt":
			return "vue";
		case "svelte":
			return "svelte";
		case "solid":
			return "tsx";
		default:
			return "tsx";
	}
}

/**
 * Determine layout components to generate
 */
async function determineLayoutComponents(
	structure: LayoutStructure,
	layoutName: string,
	skipComponents?: boolean
): Promise<string[]> {
	if (skipComponents) {
		return [];
	}

	const components: string[] = [];

	if (structure.hasHeader) {
		components.push(`${layoutName}Header`);
	}
	if (structure.hasFooter) {
		components.push(`${layoutName}Footer`);
	}
	if (structure.hasSidebar) {
		components.push(`${layoutName}Sidebar`);
	}
	if (structure.hasNavigation && structure.navigationPosition !== "both") {
		components.push(`${layoutName}Navigation`);
	} else if (structure.hasNavigation && structure.navigationPosition === "both") {
		components.push(`${layoutName}MainNavigation`);
		components.push(`${layoutName}SideNavigation`);
	}
	if (structure.hasBreadcrumbs) {
		components.push(`${layoutName}Breadcrumbs`);
	}

	return components;
}

/**
 * Generate layout file
 */
async function generateLayoutFile(context: LayoutContext): Promise<void> {
	const { framework, targetDir, fileName } = context;
	const extension = getFileExtension(framework);
	const layoutPath = path.join(targetDir, `${fileName}.${extension}`);

	let content = "";

	if (framework === "next") {
		content = generateNextLayoutContent(context);
	} else if (framework === "nuxt") {
		content = generateNuxtLayoutContent(context);
	} else if (framework === "svelte") {
		content = generateSvelteLayoutContent(context);
	} else {
		content = generateReactLayoutContent(context);
	}

	await fs.writeFile(layoutPath, content);
}

/**
 * Generate Next.js layout content
 */
function generateNextLayoutContent(context: LayoutContext): string {
	const { layoutName, structure, ui, responsive, mobileFirst, theme, compliance } = context;
	
	const imports = generateLayoutImports(context);
	const className = generateLayoutClassName(context);
	const layoutStructure = generateLayoutStructure(context);

	if (context.type === "app") {
		// App Router root layout
		return `${imports}

export default function ${layoutName}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" ${theme === "system" ? 'className={theme}' : ''}>
      <body className="${className}">
        ${compliance !== "none" ? '<SkipToContent />' : ''}
        ${layoutStructure}
      </body>
    </html>
  );
}
`;
	} else {
		// Regular layout component
		return `${imports}

interface ${layoutName}LayoutProps {
  children: React.ReactNode;
}

export default function ${layoutName}Layout({ children }: ${layoutName}LayoutProps) {
  return (
    <div className="${className}">
      ${compliance !== "none" ? '<SkipToContent />' : ''}
      ${layoutStructure}
    </div>
  );
}
`;
	}
}

/**
 * Generate Nuxt layout content
 */
function generateNuxtLayoutContent(context: LayoutContext): string {
	const { structure, ui, responsive, mobileFirst, theme, compliance } = context;
	
	const className = generateLayoutClassName(context);
	const layoutStructure = generateLayoutStructureVue(context);

	return `<template>
  <div :class="'${className}'">
    ${compliance !== "none" ? '<SkipToContent />' : ''}
    ${layoutStructure}
  </div>
</template>

<script setup lang="ts">
${structure.hasNavigation ? "import { ref } from 'vue';\n" : ""}
${theme === "system" ? "import { useTheme } from '@/composables/theme';\n" : ""}

${theme === "system" ? "const { theme } = useTheme();" : ""}
${structure.hasSidebar ? "const sidebarOpen = ref(false);" : ""}
</script>

<style scoped>
/* Layout-specific styles */
</style>
`;
}

/**
 * Generate Svelte layout content
 */
function generateSvelteLayoutContent(context: LayoutContext): string {
	const { structure, ui } = context;
	const className = generateLayoutClassName(context);
	const layoutStructure = generateLayoutStructureSvelte(context);

	return `<script lang="ts">
  ${structure.hasSidebar ? "let sidebarOpen = false;" : ""}
  ${context.theme === "system" ? "import { theme } from '$lib/stores/theme';" : ""}
</script>

<div class="${className}">
  ${context.compliance !== "none" ? '<SkipToContent />' : ''}
  ${layoutStructure}
</div>

<style>
  /* Layout-specific styles */
</style>
`;
}

/**
 * Generate React layout content
 */
function generateReactLayoutContent(context: LayoutContext): string {
	const { layoutName, structure, ui } = context;
	const imports = generateLayoutImports(context);
	const className = generateLayoutClassName(context);
	const layoutStructure = generateLayoutStructure(context);

	return `${imports}

interface ${layoutName}LayoutProps {
  children: React.ReactNode;
}

export const ${layoutName}Layout = ({ children }: ${layoutName}LayoutProps): JSX.Element => {
  ${structure.hasSidebar ? "const [sidebarOpen, setSidebarOpen] = useState(false);" : ""}
  ${context.theme === "system" ? "const { theme, toggleTheme } = useTheme();" : ""}

  return (
    <div className="${className}">
      ${context.compliance !== "none" ? '<SkipToContent />' : ''}
      ${layoutStructure}
    </div>
  );
};
`;
}

/**
 * Generate layout imports
 */
function generateLayoutImports(context: LayoutContext): string[] {
	const imports: string[] = ["import React from 'react';"];

	if (context.structure.hasSidebar) {
		imports.push("import { useState } from 'react';");
	}

	// Import components
	context.components.forEach(component => {
		imports.push(`import { ${component} } from './${toKebabCase(component)}';`);
	});

	// Theme imports
	if (context.theme === "system") {
		imports.push("import { useTheme } from '@/hooks/use-theme';");
	}

	// Accessibility imports
	if (context.compliance !== "none") {
		imports.push("import { SkipToContent } from '@/components/accessibility';");
	}

	// UI system imports
	if (context.ui === "xala") {
		imports.push("import '@xala-technologies/ui-system/styles';");
	}

	return imports.join("\n");
}

/**
 * Generate layout class name
 */
function generateLayoutClassName(context: LayoutContext): string {
	const { ui, responsive, mobileFirst, structure } = context;
	
	let classes: string[] = [];

	if (ui === "xala") {
		classes.push("layout");
		classes.push(`layout--${context.type}`);
		if (structure.hasSidebar) {
			classes.push(`layout--sidebar-${structure.sidebarPosition}`);
		}
	} else {
		classes.push("min-h-screen");
		if (context.theme === "dark") {
			classes.push("bg-gray-900 text-white");
		} else {
			classes.push("bg-gray-50");
		}
		
		if (structure.hasSidebar) {
			classes.push("flex");
		}
	}

	if (responsive) {
		classes.push(mobileFirst ? "md:grid" : "grid md:block");
	}

	return classes.join(" ");
}

/**
 * Generate layout structure
 */
function generateLayoutStructure(context: LayoutContext): string {
	const { structure, ui, components } = context;
	let content = "";

	// Header
	if (structure.hasHeader) {
		const headerComponent = components.find(c => c.includes("Header"));
		content += `      <${headerComponent} ${structure.hasNavigation && structure.navigationPosition === "header" ? "hasNavigation" : ""} />\n`;
	}

	// Main content area
	content += `      <div className="${ui === "xala" ? "layout__body" : "flex flex-1"}">\n`;

	// Sidebar
	if (structure.hasSidebar) {
		const sidebarComponent = components.find(c => c.includes("Sidebar"));
		content += `        <${sidebarComponent} ${structure.hasNavigation && structure.navigationPosition === "sidebar" ? "hasNavigation" : ""} />\n`;
	}

	// Main content
	content += `        <main className="${ui === "xala" ? "layout__main" : "flex-1 p-6"}" id="main-content">\n`;
	
	// Breadcrumbs
	if (structure.hasBreadcrumbs) {
		const breadcrumbsComponent = components.find(c => c.includes("Breadcrumbs"));
		content += `          <${breadcrumbsComponent} />\n`;
	}

	content += `          {children}\n`;
	content += `        </main>\n`;
	content += `      </div>\n`;

	// Footer
	if (structure.hasFooter) {
		const footerComponent = components.find(c => c.includes("Footer"));
		content += `      <${footerComponent} />\n`;
	}

	return content;
}

/**
 * Generate layout structure for Vue
 */
function generateLayoutStructureVue(context: LayoutContext): string {
	const { structure, ui } = context;
	let content = "";

	if (structure.hasHeader) {
		content += `    <LayoutHeader ${structure.hasNavigation && structure.navigationPosition === "header" ? ":has-navigation='true'" : ""} />\n`;
	}

	content += `    <div :class="${ui === "xala" ? "'layout__body'" : "'flex flex-1'"}">\n`;

	if (structure.hasSidebar) {
		content += `      <LayoutSidebar v-model:open="sidebarOpen" ${structure.hasNavigation && structure.navigationPosition === "sidebar" ? ":has-navigation='true'" : ""} />\n`;
	}

	content += `      <main :class="${ui === "xala" ? "'layout__main'" : "'flex-1 p-6'"}" id="main-content">\n`;
	
	if (structure.hasBreadcrumbs) {
		content += `        <LayoutBreadcrumbs />\n`;
	}

	content += `        <slot />\n`;
	content += `      </main>\n`;
	content += `    </div>\n`;

	if (structure.hasFooter) {
		content += `    <LayoutFooter />\n`;
	}

	return content;
}

/**
 * Generate layout structure for Svelte
 */
function generateLayoutStructureSvelte(context: LayoutContext): string {
	const { structure, ui } = context;
	let content = "";

	if (structure.hasHeader) {
		content += `  <LayoutHeader ${structure.hasNavigation && structure.navigationPosition === "header" ? "hasNavigation={true}" : ""} />\n`;
	}

	content += `  <div class="${ui === "xala" ? "layout__body" : "flex flex-1"}">\n`;

	if (structure.hasSidebar) {
		content += `    <LayoutSidebar bind:open={sidebarOpen} ${structure.hasNavigation && structure.navigationPosition === "sidebar" ? "hasNavigation={true}" : ""} />\n`;
	}

	content += `    <main class="${ui === "xala" ? "layout__main" : "flex-1 p-6"}" id="main-content">\n`;
	
	if (structure.hasBreadcrumbs) {
		content += `      <LayoutBreadcrumbs />\n`;
	}

	content += `      <slot />\n`;
	content += `    </main>\n`;
	content += `  </div>\n`;

	if (structure.hasFooter) {
		content += `  <LayoutFooter />\n`;
	}

	return content;
}

/**
 * Generate layout components
 */
async function generateLayoutComponents(context: LayoutContext): Promise<void> {
	const { components, projectRoot, ui, compliance, locales } = context;

	for (const componentName of components) {
		let componentType: "display" | "form" | "layout" = "layout";
		
		// Determine component type based on name
		if (componentName.includes("Navigation") || componentName.includes("Breadcrumbs")) {
			componentType = "display";
		}

		const componentOptions: ComponentGenerationOptions = {
			name: componentName,
			componentName,
			fileName: toKebabCase(componentName),
			type: componentType,
			props: getComponentProps(componentName, context),
			ui,
			compliance,
			locales,
			primaryLocale: locales[0] || "en",
			projectRoot,
			targetDir: context.targetDir,
			includeTests: true,
			includeStories: false,
			includeStyles: ui === "xala",
		};

		await generateComponent(componentOptions);
	}
}

/**
 * Get component props based on component type
 */
function getComponentProps(componentName: string, context: LayoutContext): any[] {
	const props: any[] = [];

	if (componentName.includes("Header") || componentName.includes("Footer")) {
		if (context.structure.hasNavigation) {
			props.push({ name: "hasNavigation", type: "boolean", optional: true });
		}
	}

	if (componentName.includes("Sidebar")) {
		props.push({ name: "open", type: "boolean", optional: false });
		props.push({ name: "onOpenChange", type: "function", optional: false });
		if (context.structure.hasNavigation) {
			props.push({ name: "hasNavigation", type: "boolean", optional: true });
		}
	}

	if (componentName.includes("Navigation")) {
		props.push({ name: "variant", type: "string", optional: true });
	}

	return props;
}

/**
 * Generate theme configuration
 */
async function generateThemeConfiguration(context: LayoutContext): Promise<void> {
	const { projectRoot, framework } = context;
	
	// Create theme hook/composable
	if (framework === "next" || framework === "react") {
		const hooksDir = path.join(projectRoot, "src", "hooks");
		await fs.ensureDir(hooksDir);
		
		const themeHookPath = path.join(hooksDir, "use-theme.ts");
		const themeHookContent = generateThemeHook();
		await fs.writeFile(themeHookPath, themeHookContent);
	} else if (framework === "nuxt" || framework === "vue") {
		const composablesDir = path.join(projectRoot, "composables");
		await fs.ensureDir(composablesDir);
		
		const themeComposablePath = path.join(composablesDir, "theme.ts");
		const themeComposableContent = generateThemeComposable();
		await fs.writeFile(themeComposablePath, themeComposableContent);
	}

	// Create theme provider component
	await generateThemeProvider(context);
}

/**
 * Generate theme hook for React
 */
function generateThemeHook(): string {
	return `import { useState, useEffect, createContext, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setThemeState(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
`;
}

/**
 * Generate theme composable for Vue
 */
function generateThemeComposable(): string {
	return `import { ref, computed, watch } from 'vue';

type Theme = 'light' | 'dark';

const theme = ref<Theme>('light');

export function useTheme() {
  // Initialize theme
  if (process.client) {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    theme.value = savedTheme || systemTheme;
    document.documentElement.classList.toggle('dark', theme.value === 'dark');
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    if (process.client) {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light');
  };

  return {
    theme: computed(() => theme.value),
    setTheme,
    toggleTheme,
  };
}
`;
}

/**
 * Generate theme provider component
 */
async function generateThemeProvider(context: LayoutContext): Promise<void> {
	// Implementation depends on framework
	// This would create a theme provider component that wraps the app
}

/**
 * Add accessibility features
 */
async function addAccessibilityFeatures(context: LayoutContext): Promise<void> {
	const { projectRoot, framework } = context;
	
	// Create accessibility components directory
	const accessibilityDir = path.join(projectRoot, "src", "components", "accessibility");
	await fs.ensureDir(accessibilityDir);

	// Generate SkipToContent component
	const skipToContentPath = path.join(accessibilityDir, `skip-to-content.${getFileExtension(framework)}`);
	const skipToContentContent = generateSkipToContent(framework);
	await fs.writeFile(skipToContentPath, skipToContentContent);

	// Generate focus management utilities
	const focusUtilsPath = path.join(projectRoot, "src", "utils", "focus-management.ts");
	await fs.ensureDir(path.dirname(focusUtilsPath));
	const focusUtilsContent = generateFocusManagement();
	await fs.writeFile(focusUtilsPath, focusUtilsContent);
}

/**
 * Generate SkipToContent component
 */
function generateSkipToContent(framework: Frontend): string {
	if (framework === "vue" || framework === "nuxt") {
		return `<template>
  <a 
    href="#main-content"
    class="skip-to-content"
    @click="handleClick"
  >
    {{ t('accessibility.skipToContent') }}
  </a>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const handleClick = (e: Event) => {
  e.preventDefault();
  const main = document.getElementById('main-content');
  if (main) {
    main.focus();
    main.scrollIntoView();
  }
};
</script>

<style scoped>
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1rem;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 0.25rem;
}

.skip-to-content:focus {
  left: 1rem;
  top: 1rem;
}
</style>
`;
	}

	// React/Next.js version
	return `import React from 'react';

export const SkipToContent = (): JSX.Element => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  };

  return (
    <a 
      href="#main-content"
      className="skip-to-content"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
};

// Add these styles to your global CSS
const styles = \`
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1rem;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 0.25rem;
}

.skip-to-content:focus {
  left: 1rem;
  top: 1rem;
}
\`;
`;
}

/**
 * Generate focus management utilities
 */
function generateFocusManagement(): string {
	return `/**
 * Focus management utilities for accessibility
 */

/**
 * Trap focus within an element
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstFocusableElement = focusableElements[0] as HTMLElement;
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    const isTabPressed = e.key === 'Tab';

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Restore focus to previous element
 */
export function restoreFocus(previouslyFocusedElement: HTMLElement | null) {
  if (previouslyFocusedElement && previouslyFocusedElement.focus) {
    previouslyFocusedElement.focus();
  }
}

/**
 * Get currently focused element
 */
export function getFocusedElement(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}
`;
}

/**
 * Display next steps
 */
function displayNextSteps(context: LayoutContext): void {
	const { layoutName, type, components, structure, theme } = context;

	const steps = [
		`Layout ${layoutName} created successfully!`,
		"",
		"Generated files:",
		`  - ${context.fileName}.${getFileExtension(context.framework)}`,
	];

	if (components.length > 0) {
		steps.push("", "Generated components:");
		components.forEach(comp => {
			steps.push(`  - ${toKebabCase(comp)}.tsx`);
		});
	}

	steps.push("", "Next steps:");
	steps.push("1. Customize the layout structure and styling");
	
	if (components.length > 0) {
		steps.push("2. Implement the generated layout components");
	}

	if (theme === "system") {
		steps.push(`${components.length > 0 ? "3" : "2"}. Configure theme switching UI`);
	}

	if (structure.hasNavigation) {
		steps.push(`${steps.length - 5}. Add navigation items and routes`);
	}

	if (context.responsive) {
		steps.push(`${steps.length - 5}. Test responsive breakpoints`);
	}

	consola.box(steps.join("\n"));
}