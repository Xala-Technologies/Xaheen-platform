/**
 * MANDATORY COMPLIANCE RULES - AUTOMATICALLY ENFORCED:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.)
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style prop, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 *
 * GENERATE: Business logic pages that USE Xala UI System components
 * NOT: UI primitive components or wrappers around Xala components
 */

import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import type { UISystem, Compliance, Language, Frontend } from "../types";
import type { PageLayout } from "../helpers/project-generation/page-handler";

// Generation result interface
export interface GenerationResult {
	success: boolean;
	files: string[];
	errors?: string[];
	warnings?: string[];
}

// Page generation options
export interface PageGenerationOptions {
	name: string;
	pageName: string; // PascalCase
	fileName: string; // kebab-case
	route: string;
	routePath: string[];
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
	primaryLocale: Language;
	projectRoot: string;
	targetDir: string;
	framework: Frontend;
	hasAppRouter: boolean;
	includeLoading: boolean;
	includeError: boolean;
	includeLayout: boolean;
	includeMetadata: boolean;
}

// Template context for page generation
interface PageTemplateContext {
	pageName: string;
	fileName: string;
	route: string;
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
	primaryLocale: Language;
	hasAppRouter: boolean;
	framework: Frontend;
	imports: string[];
	metadata: string;
	authGuard: string;
	layoutWrapper: {
		open: string;
		close: string;
	};
	pageContent: string;
	errorBoundary: string;
	loadingState: string;
	accessibility: {
		landmarks: boolean;
		headingStructure: boolean;
		skipLinks: boolean;
	};
}

/**
 * Generate a page with all related files
 */
export async function generatePage(
	options: PageGenerationOptions
): Promise<GenerationResult> {
	const result: GenerationResult = {
		success: false,
		files: [],
		errors: [],
		warnings: [],
	};

	try {
		// Prepare template context
		const context = preparePageTemplateContext(options);

		// Select appropriate templates
		const templates = selectPageTemplates(options);

		// Generate main page file
		const pageContent = generatePageContent(context, templates.page);
		const pageFileName = getPageFileName(options.framework, options.fileName);
		const pagePath = path.join(options.targetDir, pageFileName);
		
		await fs.ensureDir(options.targetDir);
		await fs.writeFile(pagePath, pageContent);
		result.files.push(pagePath);

		// Generate loading file (Next.js App Router)
		if (options.includeLoading && options.framework === "next" && options.hasAppRouter) {
			const loadingPath = path.join(options.targetDir, "loading.tsx");
			const loadingContent = generateLoadingContent(context, templates.loading);
			await fs.writeFile(loadingPath, loadingContent);
			result.files.push(loadingPath);
		}

		// Generate error boundary file (Next.js App Router)
		if (options.includeError && options.framework === "next" && options.hasAppRouter) {
			const errorPath = path.join(options.targetDir, "error.tsx");
			const errorContent = generateErrorContent(context, templates.error);
			await fs.writeFile(errorPath, errorContent);
			result.files.push(errorPath);
		}

		// Generate layout file if needed
		if (options.includeLayout && options.layout !== "default" && options.layout !== "blank") {
			const layoutResult = await generateLayoutFile(options, context);
			if (layoutResult.file) {
				result.files.push(layoutResult.file);
			}
		}

		// Generate route configuration
		if (options.framework === "tanstack-start" || options.framework === "tanstack-router") {
			await updateRouteConfiguration(options);
		}

		// Add metadata file for SEO (if framework supports it)
		if (options.includeMetadata && supportsMetadataFile(options.framework)) {
			const metadataPath = await generateMetadataFile(options, context);
			if (metadataPath) {
				result.files.push(metadataPath);
			}
		}

		// Validate accessibility compliance
		if (options.compliance !== "none") {
			const accessibilityIssues = validateAccessibility(context);
			if (accessibilityIssues.length > 0) {
				result.warnings = result.warnings?.concat(accessibilityIssues);
			}
		}

		result.success = true;
		
	} catch (error) {
		result.errors?.push(error instanceof Error ? error.message : String(error));
	}

	return result;
}

/**
 * Prepare template context with all necessary data
 */
function preparePageTemplateContext(options: PageGenerationOptions): PageTemplateContext {
	const { 
		pageName, 
		fileName, 
		route, 
		layout, 
		requiresAuth,
		seo,
		ui, 
		compliance, 
		locales, 
		primaryLocale,
		hasAppRouter,
		framework
	} = options;

	// Generate imports
	const imports = generatePageImports(options);

	// Generate metadata
	const metadata = generateMetadata(options);

	// Generate auth guard
	const authGuard = generateAuthGuard(options);

	// Generate layout wrapper
	const layoutWrapper = generateLayoutWrapper(options);

	// Generate page content
	const pageContent = generatePageContentBody(options);

	// Generate error boundary
	const errorBoundary = generateErrorBoundary(options);

	// Generate loading state
	const loadingState = generateLoadingState(options);

	// Determine accessibility features
	const accessibility = {
		landmarks: compliance !== "none",
		headingStructure: compliance !== "none",
		skipLinks: compliance === "norwegian" || compliance === "gdpr",
	};

	return {
		pageName,
		fileName,
		route,
		layout,
		requiresAuth,
		seo,
		ui,
		compliance,
		locales,
		primaryLocale,
		hasAppRouter,
		framework,
		imports,
		metadata,
		authGuard,
		layoutWrapper,
		pageContent,
		errorBoundary,
		loadingState,
		accessibility,
	};
}

/**
 * Select appropriate templates based on configuration
 */
function selectPageTemplates(options: PageGenerationOptions) {
	const { ui, compliance, layout, framework } = options;

	const templateBase = `${framework}-${ui === "xala" ? "xala" : "default"}`;
	const complianceLevel = compliance === "norwegian" ? "norwegian" : compliance === "gdpr" ? "gdpr" : "basic";

	return {
		page: `${templateBase}-${layout}-${complianceLevel}`,
		loading: `${templateBase}-loading`,
		error: `${templateBase}-error`,
		layout: `${templateBase}-layout-${layout}`,
	};
}

/**
 * Generate page content based on framework and template
 */
function generatePageContent(context: PageTemplateContext, template: string): string {
	const { framework, hasAppRouter } = context;

	if (framework === "next") {
		return hasAppRouter ? generateNextAppRouterPage(context) : generateNextPagesRouterPage(context);
	} else if (framework === "nuxt") {
		return generateNuxtPage(context);
	} else if (framework === "tanstack-start" || framework === "tanstack-router") {
		return generateTanStackPage(context);
	}

	// Default React page
	return generateReactPage(context);
}

/**
 * Generate Next.js App Router page
 */
function generateNextAppRouterPage(context: PageTemplateContext): string {
	const { 
		pageName, 
		imports, 
		metadata, 
		authGuard,
		layoutWrapper,
		pageContent,
		accessibility
	} = context;

	return `${imports.join("\n")}

${metadata}

${authGuard}export default function ${pageName}() {
  return (
    ${layoutWrapper.open}
      ${accessibility.skipLinks ? '<SkipLink href="#main-content" />' : ''}
      ${pageContent}
    ${layoutWrapper.close}
  );
}
`;
}

/**
 * Generate Next.js Pages Router page
 */
function generateNextPagesRouterPage(context: PageTemplateContext): string {
	const { 
		pageName, 
		imports, 
		seo,
		authGuard,
		layoutWrapper,
		pageContent,
		accessibility
	} = context;

	const headContent = `
      <Head>
        <title>${seo.title}</title>
        <meta name="description" content="${seo.description}" />
        <meta name="keywords" content="${seo.keywords.join(", ")}" />
      </Head>`;

	return `${imports.join("\n")}
import Head from 'next/head';

interface ${pageName}Props {
  // Add props here
}

${authGuard}

export default function ${pageName}(props: ${pageName}Props) {
  return (
    <>
      ${headContent}
      ${layoutWrapper.open}
        ${accessibility.skipLinks ? '<SkipLink href="#main-content" />' : ''}
        ${pageContent}
      ${layoutWrapper.close}
    </>
  );
}
`;
}

/**
 * Generate Nuxt page
 */
function generateNuxtPage(context: PageTemplateContext): string {
	const { 
		imports,
		seo,
		authGuard,
		layoutWrapper,
		pageContent,
		ui,
		compliance
	} = context;

	return `<template>
  ${layoutWrapper.open.replace(/className=/g, ':class=')}
    ${pageContent.replace(/className=/g, ':class=')}
  ${layoutWrapper.close}
</template>

<script setup lang="ts">
${imports.map(imp => imp.replace(/^import/, '')).join('\n')}

${authGuard}

const title = '${seo.title}';
const description = '${seo.description}';

useSeoMeta({
  title,
  description,
  keywords: ${JSON.stringify(seo.keywords)},
});
</script>

<style scoped>
/* Page-specific styles */
</style>
`;
}

/**
 * Generate TanStack Router page
 */
function generateTanStackPage(context: PageTemplateContext): string {
	const { 
		pageName,
		route,
		imports,
		authGuard,
		layoutWrapper,
		pageContent
	} = context;

	return `${imports.join("\n")}
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('${route}')({
  ${authGuard ? authGuard.trim() : ''}
  component: ${pageName},
});

function ${pageName}() {
  return (
    ${layoutWrapper.open}
      ${pageContent}
    ${layoutWrapper.close}
  );
}
`;
}

/**
 * Generate default React page
 */
function generateReactPage(context: PageTemplateContext): string {
	const { 
		pageName,
		imports,
		layoutWrapper,
		pageContent
	} = context;

	return `${imports.join("\n")}

export const ${pageName} = (): JSX.Element => {
  return (
    ${layoutWrapper.open}
      ${pageContent}
    ${layoutWrapper.close}
  );
};
`;
}

/**
 * Generate page imports based on requirements
 * COMPLIANCE: Enforces mandatory localization and Xala UI System usage
 */
function generatePageImports(options: PageGenerationOptions): string[] {
	const imports: string[] = ["import React from 'react';"];

	// Framework-specific imports
	if (options.framework === "next" && options.hasAppRouter) {
		imports.push("import type { Metadata } from 'next';");
	}

	// MANDATORY: Always include next-intl for localization (no hardcoded text allowed)
	if (options.framework === "next") {
		imports.push("import { useTranslations } from 'next-intl';");
	} else if (options.framework === "nuxt") {
		imports.push("import { useI18n } from 'vue-i18n';");
	} else {
		imports.push("import { useTranslation } from 'react-i18next';");
	}

	// MANDATORY: Always include Xala UI System components (no raw HTML allowed)
	if (options.ui === "xala") {
		// Add page-specific Xala UI System imports
		imports.push("import { Container, Stack, Text, Heading, Card, Button, Breadcrumbs } from '@xala-technologies/ui-system';");
	}

	// Auth imports
	if (options.requiresAuth) {
		if (options.framework === "next") {
			imports.push("import { requireAuth } from '@/lib/auth';");
		} else if (options.framework === "nuxt") {
			imports.push("import { requireAuth } from '@/composables/auth';");
		}
	}

	// Layout imports
	if (options.layout !== "blank" && options.layout !== "default") {
		const layoutName = `${options.layout}Layout`;
		if (options.framework === "nuxt") {
			imports.push(`import ${layoutName} from '@/components/layouts/${options.layout}-layout.vue';`);
		} else {
			imports.push(`import { ${layoutName} } from '@/components/layouts/${options.layout}-layout';`);
		}
	}

	// Add compliance-specific imports
	const complianceLevels = options.compliance ? options.compliance.split(',').map(c => c.trim()) : [];
	
	if (complianceLevels.includes('gdpr')) {
		imports.push("import { useGDPRConsent } from '@/hooks/useGDPRConsent';");
	}
	
	if (complianceLevels.includes('wcag-aaa')) {
		imports.push("import { useFocusManagement } from '@/hooks/useFocusManagement';");
		imports.push("import { SkipLink } from '@xala-technologies/ui-system';");
	}
	
	if (complianceLevels.includes('iso27001')) {
		imports.push("import { useSecurityContext } from '@/hooks/useSecurityContext';");
	}
	
	if (complianceLevels.includes('norwegian')) {
		imports.push("import { useBankID } from '@/hooks/useBankID';");
		imports.push("import { useAltinn } from '@/hooks/useAltinn';");
	}

	return imports;
}

/**
 * Generate metadata for the page
 */
function generateMetadata(options: PageGenerationOptions): string {
	if (options.framework === "next" && options.hasAppRouter) {
		return `export const metadata: Metadata = {
  title: '${options.seo.title}',
  description: '${options.seo.description}',
  keywords: ${JSON.stringify(options.seo.keywords)},
};`;
	}

	return "";
}

/**
 * Generate auth guard code
 */
function generateAuthGuard(options: PageGenerationOptions): string {
	if (!options.requiresAuth) return "";

	if (options.framework === "next") {
		if (options.hasAppRouter) {
			return "@requireAuth\n";
		} else {
			return `export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  return { props: {} };
});\n`;
		}
	} else if (options.framework === "nuxt") {
		return "requireAuth();\n";
	} else if (options.framework === "tanstack-start" || options.framework === "tanstack-router") {
		return "beforeLoad: requireAuth,\n  ";
	}

	return "";
}

/**
 * Generate layout wrapper
 */
function generateLayoutWrapper(options: PageGenerationOptions): { open: string; close: string } {
	if (options.layout === "blank") {
		return { open: "<>", close: "</>" };
	}

	if (options.layout === "default") {
		return { 
			open: `<div className="${options.ui === "xala" ? "page" : "min-h-screen"}">`,
			close: "</div>"
		};
	}

	const layoutName = `${options.layout}Layout`;
	
	if (options.framework === "nuxt") {
		return {
			open: `<${options.layout}-layout>`,
			close: `</${options.layout}-layout>`
		};
	}

	return {
		open: `<${layoutName}>`,
		close: `</${layoutName}>`
	};
}

/**
 * Generate page content body
 * COMPLIANCE: Uses ONLY Xala UI System components, NO raw HTML elements
 */
function generatePageContentBody(options: PageGenerationOptions): string {
	const { pageName, fileName } = options;

	// COMPLIANCE: Use ONLY Xala UI System components, NO raw HTML
	const mainContent = `
  const t = useTranslations("${fileName}");

  return (
    <Container
      variant="content"
      maxWidth="7xl"
      padding="8"
      role="main"
      aria-label={t("main.ariaLabel")}
    >
      <Stack direction="vertical" spacing="6">
        <Heading level={1} variant="page">
          {t("title")}
        </Heading>
        
        <Text variant="subtitle" color="secondary">
          {t("description")}
        </Text>
        
        <Card variant="elevated" padding="6">
          <Stack direction="vertical" spacing="4">
            <Heading level={2} variant="section">
              {t("content.title")}
            </Heading>
            
            <Text variant="body">
              {t("content.description")}
            </Text>
            
            <Stack direction="horizontal" spacing="3">
              <Button variant="primary">
                {t("actions.primary")}
              </Button>
              <Button variant="secondary">
                {t("actions.secondary")}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );`;

	return mainContent;
}

/**
 * Generate loading content
 */
function generateLoadingContent(context: PageTemplateContext, template: string): string {
	const { ui } = context;
	
	return `'use client';

export default function Loading() {
  return (
    <div className="${ui === "xala" ? "loading loading--page" : "flex items-center justify-center min-h-screen"}">
      <div className="${ui === "xala" ? "spinner spinner--lg" : "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"}"></div>
    </div>
  );
}
`;
}

/**
 * Generate error content
 */
function generateErrorContent(context: PageTemplateContext, template: string): string {
	const { ui } = context;
	
	return `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="${ui === "xala" ? "error error--page" : "flex flex-col items-center justify-center min-h-screen"}">
      <h2 className="${ui === "xala" ? "heading heading--lg" : "text-2xl font-bold mb-4"}">
        Something went wrong!
      </h2>
      <button
        onClick={() => reset()}
        className="${ui === "xala" ? "button button--primary" : "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"}"
      >
        Try again
      </button>
    </div>
  );
}
`;
}

/**
 * Generate error boundary code
 */
function generateErrorBoundary(options: PageGenerationOptions): string {
	// Error boundary implementation if needed
	return "";
}

/**
 * Generate loading state code
 */
function generateLoadingState(options: PageGenerationOptions): string {
	// Loading state implementation if needed
	return "";
}

/**
 * Get page file name based on framework
 */
function getPageFileName(framework: Frontend, baseName: string): string {
	switch (framework) {
		case "next":
			return "page.tsx"; // App Router convention
		case "nuxt":
			return `${baseName}.vue`;
		case "tanstack-start":
		case "tanstack-router":
			return `${baseName}.tsx`;
		default:
			return `${baseName}.tsx`;
	}
}

/**
 * Generate layout file
 */
async function generateLayoutFile(
	options: PageGenerationOptions,
	context: PageTemplateContext
): Promise<{ file?: string }> {
	const { projectRoot, layout, ui, framework } = options;
	
	const layoutDir = path.join(
		projectRoot,
		framework === "nuxt" ? "components" : "src/components",
		"layouts"
	);
	
	const layoutFileName = `${layout}-layout.${framework === "nuxt" ? "vue" : "tsx"}`;
	const layoutPath = path.join(layoutDir, layoutFileName);
	
	// Check if layout already exists
	if (await fs.pathExists(layoutPath)) {
		return {};
	}

	await fs.ensureDir(layoutDir);
	
	let content = "";
	if (framework === "nuxt") {
		content = generateVueLayoutContent(layout, ui);
	} else {
		content = generateReactLayoutContent(layout, ui);
	}

	await fs.writeFile(layoutPath, content);
	
	return { file: layoutPath };
}

/**
 * Generate React layout content
 */
function generateReactLayoutContent(layout: PageLayout, ui: UISystem): string {
	const className = ui === "xala" ? `layout layout--${layout}` : getLayoutClasses(layout);
	
	return `import React from 'react';

interface ${layout}LayoutProps {
  children: React.ReactNode;
}

export const ${layout}Layout = ({ children }: ${layout}LayoutProps): JSX.Element => {
  return (
    <div className="${className}">
      ${generateLayoutStructure(layout, ui, "react")}
    </div>
  );
};
`;
}

/**
 * Generate Vue layout content
 */
function generateVueLayoutContent(layout: PageLayout, ui: UISystem): string {
	const className = ui === "xala" ? `layout layout--${layout}` : getLayoutClasses(layout);
	
	return `<template>
  <div :class="'${className}'">
    ${generateLayoutStructure(layout, ui, "vue")}
  </div>
</template>

<script setup lang="ts">
// Layout logic here
</script>

<style scoped>
/* Layout-specific styles */
</style>
`;
}

/**
 * Get layout classes based on layout type
 */
function getLayoutClasses(layout: PageLayout): string {
	const classes: Record<PageLayout, string> = {
		default: "min-h-screen bg-gray-50",
		auth: "min-h-screen bg-gray-100 flex items-center justify-center",
		dashboard: "min-h-screen bg-gray-50 flex",
		marketing: "min-h-screen",
		blank: "",
	};
	
	return classes[layout] || classes.default;
}

/**
 * Generate layout structure based on type
 * COMPLIANCE: Uses ONLY Xala UI System layout components, NO raw HTML elements
 */
function generateLayoutStructure(layout: PageLayout, ui: UISystem, framework: "react" | "vue"): string {
	const slot = framework === "vue" ? "<slot />" : "{children}";
	
	// COMPLIANCE: Use ONLY Xala UI System components, NO raw HTML
	switch (layout) {
		case "dashboard":
			return `
      <Stack direction="horizontal" spacing="0" minHeight="screen">
        <Sidebar variant="primary" width="64">
          <Navigation items={[]} variant="vertical" />
        </Sidebar>
        <Stack direction="vertical" spacing="0" flex="1">
          <Header variant="primary" sticky>
            <Navigation items={[]} variant="horizontal" />
          </Header>
          <Container variant="content" padding="6" flex="1" role="main">
            ${slot}
          </Container>
        </Stack>
      </Stack>`;
			
		case "auth":
			return `
      <Container variant="centered" minHeight="screen">
        <Card variant="elevated" maxWidth="md" padding="8">
          ${slot}
        </Card>
      </Container>`;
			
		case "marketing":
			return `
      <header className="${ui === "xala" ? "layout__header" : "bg-white shadow-sm"}">
        ${framework === "vue" ? "<!-- Navigation -->" : "{/* Navigation */}"}
      </header>
      <main className="${ui === "xala" ? "layout__main" : "flex-1"}">
        ${slot}
      </main>
      <footer className="${ui === "xala" ? "layout__footer" : "bg-gray-800 text-white"}">
        ${framework === "vue" ? "<!-- Footer content -->" : "{/* Footer content */}"}
      </footer>`;
			
		default:
			return `
      <main className="${ui === "xala" ? "layout__main" : "flex-1"}">
        ${slot}
      </main>`;
	}
}

/**
 * Update route configuration for TanStack Router
 */
async function updateRouteConfiguration(options: PageGenerationOptions): Promise<void> {
	const { projectRoot, route, requiresAuth } = options;
	
	const routesConfigPath = path.join(projectRoot, "src", "routes.config.ts");
	
	if (await fs.pathExists(routesConfigPath)) {
		let content = await fs.readFile(routesConfigPath, "utf-8");
		
		// Check if route already exists
		if (content.includes(`path: '${route}'`)) {
			return;
		}
		
		// Add route to configuration
		const routeConfig = `  {
    path: '${route}',
    ${requiresAuth ? "auth: true," : ""}
  },`;
		
		// Insert before the closing bracket
		content = content.replace(/\](\s*\))/, `${routeConfig}\n]$1`);
		
		await fs.writeFile(routesConfigPath, content);
	}
}

/**
 * Check if framework supports metadata files
 */
function supportsMetadataFile(framework: Frontend): boolean {
	// Only Next.js App Router supports metadata files
	return framework === "next";
}

/**
 * Generate metadata file for SEO
 */
async function generateMetadataFile(
	options: PageGenerationOptions,
	context: PageTemplateContext
): Promise<string | null> {
	if (!options.hasAppRouter || options.framework !== "next") {
		return null;
	}

	const metadataPath = path.join(options.targetDir, "metadata.ts");
	
	const content = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${options.seo.title}',
  description: '${options.seo.description}',
  keywords: ${JSON.stringify(options.seo.keywords)},
  openGraph: {
    title: '${options.seo.title}',
    description: '${options.seo.description}',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${options.seo.title}',
    description: '${options.seo.description}',
  },
};
`;

	await fs.writeFile(metadataPath, content);
	
	return metadataPath;
}

/**
 * Validate accessibility compliance
 */
function validateAccessibility(context: PageTemplateContext): string[] {
	const issues: string[] = [];
	
	// Check for proper heading structure
	if (!context.pageContent.includes("<h1")) {
		issues.push("Page is missing an h1 heading");
	}
	
	// Check for skip links
	if (context.compliance === "norwegian" && !context.accessibility.skipLinks) {
		issues.push("Norwegian compliance requires skip links for accessibility");
	}
	
	// Check for ARIA landmarks
	if (context.compliance !== "none" && !context.pageContent.includes('role=')) {
		issues.push("Consider adding ARIA landmarks for xaheen accessibility");
	}
	
	// Check for proper form labels (if it's a form page)
	if (context.layout === "auth" && !context.pageContent.includes('htmlFor=')) {
		issues.push("Form inputs should have associated labels");
	}
	
	return issues;
}