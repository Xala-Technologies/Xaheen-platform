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
 * GENERATE: Advanced layout components using Xala UI System
 * NOT: UI primitive components or wrappers around Xala components
 */

import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import type { UISystem, Compliance, Language } from "../types";

// Layout types
export type LayoutType = 
	| 'base' 
	| 'admin' 
	| 'auth' 
	| 'crud' 
	| 'form' 
	| 'wizard' 
	| 'sidebar' 
	| 'adaptive' 
	| 'desktop' 
	| 'mobile' 
	| 'menu'
	| 'onboarding';

// Layout generation options
export interface LayoutGenerationOptions {
	name: string;
	layoutName: string; // PascalCase
	fileName: string; // kebab-case
	type: LayoutType;
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	primaryLocale: Language;
	projectRoot: string;
	targetDir: string;
	framework: 'next' | 'nuxt' | 'react' | 'vue';
	typescript: boolean;
	includeNavigation: boolean;
	includeSidebar: boolean;
	includeFooter: boolean;
	responsive: boolean;
	multiPlatform: boolean;
}

// Layout generation result
export interface LayoutGenerationResult {
	success: boolean;
	files: string[];
	errors?: string[];
	warnings?: string[];
}

/**
 * Generate advanced layout component
 */
export async function generateLayout(options: LayoutGenerationOptions): Promise<LayoutGenerationResult> {
	try {
		const files: string[] = [];
		
		// Generate main layout component
		const layoutFile = await generateLayoutComponent(options);
		if (layoutFile) files.push(layoutFile);
		
		// Generate layout-specific utilities if needed
		if (options.multiPlatform) {
			const platformUtilsFile = await generatePlatformUtils(options);
			if (platformUtilsFile) files.push(platformUtilsFile);
		}
		
		// Generate layout tests
		const testFile = await generateLayoutTests(options);
		if (testFile) files.push(testFile);
		
		// Generate layout stories for Storybook
		const storyFile = await generateLayoutStories(options);
		if (storyFile) files.push(storyFile);
		
		return {
			success: true,
			files,
		};
	} catch (error) {
		consola.error('Failed to generate layout:', error);
		return {
			success: false,
			files: [],
			errors: [error instanceof Error ? error.message : 'Unknown error'],
		};
	}
}

/**
 * Generate layout component based on type
 */
async function generateLayoutComponent(options: LayoutGenerationOptions): Promise<string | null> {
	const templateName = getLayoutTemplateName(options);
	const templatePath = path.join(__dirname, `../../templates/frontend/react/next/src/components/layouts/${templateName}.hbs`);
	const outputPath = path.join(options.targetDir, `${options.fileName}.tsx`);
	
	if (!await fs.pathExists(templatePath)) {
		consola.warn(`Layout template not found: ${templateName}`);
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = createLayoutTemplateContext(options);
	
	// Simple template replacement (in production, use Handlebars)
	let content = template;
	Object.entries(context).forEach(([key, value]) => {
		const regex = new RegExp(`{{${key}}}`, 'g');
		content = content.replace(regex, String(value));
	});
	
	await fs.ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, content);
	
	return outputPath;
}

/**
 * Get layout template name based on type and options
 */
function getLayoutTemplateName(options: LayoutGenerationOptions): string {
	const { type, ui } = options;
	
	if (ui !== 'xala') {
		return 'BaseLayout.tsx'; // Fallback
	}
	
	const templateMap: Record<LayoutType, string> = {
		base: 'BaseLayout.tsx',
		admin: 'AdminLayout.tsx',
		auth: 'AuthLayout.tsx',
		crud: 'CrudPageLayout.tsx',
		form: 'FormLayout.tsx',
		wizard: 'WizardLayout.tsx',
		sidebar: 'SidebarLayout.tsx',
		adaptive: 'AdaptiveLayout.tsx',
		desktop: 'DesktopLayout.tsx',
		mobile: 'MobileLayout.tsx',
		menu: 'MenuLayout.tsx',
		onboarding: 'OnboardingLayout.tsx',
	};
	
	return templateMap[type] || 'BaseLayout.tsx';
}

/**
 * Create template context for layout generation
 */
function createLayoutTemplateContext(options: LayoutGenerationOptions): Record<string, any> {
	const complianceLevels = options.compliance ? options.compliance.split(',').map(c => c.trim()) : [];
	
	return {
		layoutName: options.layoutName,
		fileName: options.fileName,
		type: options.type,
		framework: options.framework,
		typescript: options.typescript,
		includeNavigation: options.includeNavigation,
		includeSidebar: options.includeSidebar,
		includeFooter: options.includeFooter,
		responsive: options.responsive,
		multiPlatform: options.multiPlatform,
		locales: options.locales,
		primaryLocale: options.primaryLocale,
		compliance: options.compliance,
		complianceLevels,
		hasGDPR: complianceLevels.includes('gdpr'),
		hasWCAG: complianceLevels.includes('wcag-aaa'),
		hasISO27001: complianceLevels.includes('iso27001'),
		hasNorwegian: complianceLevels.includes('norwegian'),
		// Generate test IDs for accessibility
		testIds: {
			root: `${options.fileName}-layout`,
			header: `${options.fileName}-header`,
			navigation: `${options.fileName}-nav`,
			sidebar: `${options.fileName}-sidebar`,
			main: `${options.fileName}-main`,
			footer: `${options.fileName}-footer`,
		},
		// ARIA labels for accessibility
		ariaLabels: {
			root: `${options.layoutName} layout`,
			header: `${options.layoutName} header`,
			navigation: `${options.layoutName} navigation`,
			sidebar: `${options.layoutName} sidebar`,
			main: `${options.layoutName} main content`,
			footer: `${options.layoutName} footer`,
		},
	};
}

/**
 * Generate platform utilities for multi-platform layouts
 */
async function generatePlatformUtils(options: LayoutGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/frontend/react/next/src/utils/platform.ts.hbs');
	const outputPath = path.join(options.targetDir, 'utils', 'platform.ts');
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		layoutName: options.layoutName,
		typescript: options.typescript,
	};
	
	let content = template;
	Object.entries(context).forEach(([key, value]) => {
		const regex = new RegExp(`{{${key}}}`, 'g');
		content = content.replace(regex, String(value));
	});
	
	await fs.ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, content);
	
	return outputPath;
}

/**
 * Generate layout tests
 */
async function generateLayoutTests(options: LayoutGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/components/xala/xala-test.hbs');
	const outputPath = path.join(options.targetDir, '__tests__', `${options.fileName}.test.tsx`);
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = createLayoutTemplateContext(options);
	
	let content = template;
	Object.entries(context).forEach(([key, value]) => {
		const regex = new RegExp(`{{${key}}}`, 'g');
		content = content.replace(regex, String(value));
	});
	
	await fs.ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, content);
	
	return outputPath;
}

/**
 * Generate layout stories for Storybook
 */
async function generateLayoutStories(options: LayoutGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/components/xala/xala-story.hbs');
	const outputPath = path.join(options.targetDir, 'stories', `${options.fileName}.stories.tsx`);
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = createLayoutTemplateContext(options);
	
	let content = template;
	Object.entries(context).forEach(([key, value]) => {
		const regex = new RegExp(`{{${key}}}`, 'g');
		content = content.replace(regex, String(value));
	});
	
	await fs.ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, content);
	
	return outputPath;
}

/**
 * Generate all available layouts for a project
 */
export async function generateAllLayouts(options: Omit<LayoutGenerationOptions, 'type' | 'name' | 'layoutName' | 'fileName'>): Promise<LayoutGenerationResult> {
	const results: LayoutGenerationResult[] = [];
	const allFiles: string[] = [];
	const allErrors: string[] = [];
	
	const layoutTypes: LayoutType[] = [
		'base', 'admin', 'auth', 'crud', 'form', 
		'wizard', 'sidebar', 'adaptive', 'desktop', 'mobile'
	];
	
	for (const type of layoutTypes) {
		const layoutOptions: LayoutGenerationOptions = {
			...options,
			type,
			name: `${type}-layout`,
			layoutName: `${type.charAt(0).toUpperCase() + type.slice(1)}Layout`,
			fileName: `${type}-layout`,
		};
		
		const result = await generateLayout(layoutOptions);
		results.push(result);
		
		if (result.success) {
			allFiles.push(...result.files);
		} else {
			allErrors.push(...(result.errors || []));
		}
	}
	
	return {
		success: allErrors.length === 0,
		files: allFiles,
		errors: allErrors.length > 0 ? allErrors : undefined,
	};
}
