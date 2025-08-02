/**
 * MANDATORY COMPLIANCE RULES - AUTOMATICALLY ENFORCED:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.)
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style={{}}, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 *
 * GENERATE: Configuration files for Xala UI System integration
 * NOT: UI primitive components or wrappers around Xala components
 */

import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import type { UISystem, Compliance, Language } from "../types";

// Configuration generation options
export interface ConfigGenerationOptions {
	projectName: string;
	projectRoot: string;
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	primaryLocale: Language;
	framework: 'next' | 'nuxt' | 'react' | 'vue';
	typescript: boolean;
	includeAccessibility: boolean;
	includeTesting: boolean;
	includeLocalization: boolean;
	includePlatform: boolean;
}

// Configuration generation result
export interface ConfigGenerationResult {
	success: boolean;
	files: string[];
	errors?: string[];
	warnings?: string[];
}

/**
 * Generate Xala UI System configuration files
 */
export async function generateXalaConfig(options: ConfigGenerationOptions): Promise<ConfigGenerationResult> {
	try {
		const files: string[] = [];
		
		// Generate core configuration files
		if (options.ui === 'xala') {
			// UI System configuration
			const uiConfigFile = await generateUISystemConfig(options);
			if (uiConfigFile) files.push(uiConfigFile);
			
			// Tailwind configuration with Xala tokens
			const tailwindConfigFile = await generateTailwindConfig(options);
			if (tailwindConfigFile) files.push(tailwindConfigFile);
			
			// TypeScript configuration
			if (options.typescript) {
				const tsConfigFile = await generateTSConfig(options);
				if (tsConfigFile) files.push(tsConfigFile);
			}
			
			// ESLint configuration with compliance rules
			const eslintConfigFile = await generateESLintConfig(options);
			if (eslintConfigFile) files.push(eslintConfigFile);
			
			// Package.json with Xala dependencies
			const packageJsonFile = await generatePackageJson(options);
			if (packageJsonFile) files.push(packageJsonFile);
		}
		
		// Generate compliance-specific configurations
		const complianceLevels = options.compliance ? options.compliance.split(',').map(c => c.trim()) : [];
		
		if (options.includeAccessibility || complianceLevels.includes('wcag-aaa')) {
			const accessibilityConfigFile = await generateAccessibilityConfig(options);
			if (accessibilityConfigFile) files.push(accessibilityConfigFile);
		}
		
		if (options.includeLocalization || options.locales.length > 1) {
			const localizationConfigFile = await generateLocalizationConfig(options);
			if (localizationConfigFile) files.push(localizationConfigFile);
		}
		
		if (options.includeTesting) {
			const testingConfigFile = await generateTestingConfig(options);
			if (testingConfigFile) files.push(testingConfigFile);
		}
		
		if (options.includePlatform) {
			const platformConfigFile = await generatePlatformConfig(options);
			if (platformConfigFile) files.push(platformConfigFile);
			
			const responsiveConfigFile = await generateResponsiveConfig(options);
			if (responsiveConfigFile) files.push(responsiveConfigFile);
		}
		
		return {
			success: true,
			files,
		};
	} catch (error) {
		consola.error('Failed to generate Xala configuration:', error);
		return {
			success: false,
			files: [],
			errors: [error instanceof Error ? error.message : 'Unknown error'],
		};
	}
}

/**
 * Generate UI System configuration
 */
async function generateUISystemConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/frontend/react/next/ui-system.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'ui-system.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		consola.warn('UI System config template not found');
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		typescript: options.typescript,
		compliance: options.compliance,
		locales: options.locales,
		primaryLocale: options.primaryLocale,
	};
	
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
 * Generate Tailwind configuration with Xala design tokens
 */
async function generateTailwindConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/frontend/react/next/tailwind.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'tailwind.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		consola.warn('Tailwind config template not found');
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		typescript: options.typescript,
		framework: options.framework,
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
 * Generate TypeScript configuration
 */
async function generateTSConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/tsconfig.json.hbs');
	const outputPath = path.join(options.projectRoot, 'tsconfig.json');
	
	if (!await fs.pathExists(templatePath)) {
		consola.warn('TypeScript config template not found');
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		framework: options.framework,
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
 * Generate ESLint configuration with compliance rules
 */
async function generateESLintConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/eslint.config.js.hbs');
	const outputPath = path.join(options.projectRoot, 'eslint.config.js');
	
	if (!await fs.pathExists(templatePath)) {
		consola.warn('ESLint config template not found');
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		typescript: options.typescript,
		compliance: options.compliance,
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
 * Generate package.json with Xala dependencies
 */
async function generatePackageJson(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/package.json.hbs');
	const outputPath = path.join(options.projectRoot, 'package.json');
	
	if (!await fs.pathExists(templatePath)) {
		consola.warn('Package.json template not found');
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		framework: options.framework,
		typescript: options.typescript,
		compliance: options.compliance,
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
 * Generate accessibility configuration
 */
async function generateAccessibilityConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/accessibility.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'accessibility.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
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
 * Generate localization configuration
 */
async function generateLocalizationConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/localization.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'localization.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		locales: options.locales,
		primaryLocale: options.primaryLocale,
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
 * Generate testing configuration
 */
async function generateTestingConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/testing.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'testing.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
		framework: options.framework,
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
 * Generate platform configuration
 */
async function generatePlatformConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/platform.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'platform.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
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
 * Generate responsive configuration
 */
async function generateResponsiveConfig(options: ConfigGenerationOptions): Promise<string | null> {
	const templatePath = path.join(__dirname, '../../templates/config/xala/responsive.config.ts.hbs');
	const outputPath = path.join(options.projectRoot, 'responsive.config.ts');
	
	if (!await fs.pathExists(templatePath)) {
		return null;
	}
	
	const template = await fs.readFile(templatePath, 'utf-8');
	const context = {
		projectName: options.projectName,
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
