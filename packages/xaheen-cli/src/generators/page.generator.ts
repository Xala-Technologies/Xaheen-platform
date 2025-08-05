/**
 * Page Generator - Rails-inspired page generation with layout integration
 *
 * Generates Next.js/React pages with routing, layouts, and Norwegian compliance
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-05
 */

import { confirm, isCancel, multiselect, select, text } from '@clack/prompts';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import {
	BaseGenerator,
	BaseGeneratorOptions,
	GeneratorResult,
} from './base.generator.js';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());

export interface PageGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly route?: string;
	readonly layout?: string;
	readonly framework?: 'next' | 'react' | 'vue' | 'angular';
	readonly pageType?: 'static' | 'dynamic' | 'server' | 'client';
	readonly features?: string[];
	readonly seo?: boolean;
	readonly auth?: boolean;
	readonly norwegian?: boolean;
	readonly typescript?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
}

export interface PageFeature {
	readonly name: string;
	readonly description: string;
	readonly dependencies: string[];
	readonly code: string;
}

export class PageGenerator extends BaseGenerator<PageGeneratorOptions> {
	private readonly pageTypes = [
		{
			value: 'static',
			label: 'Static Page',
			hint: 'Pre-rendered at build time (SSG)',
		},
		{
			value: 'dynamic',
			label: 'Dynamic Page',
			hint: 'Server-side rendered (SSR)',
		},
		{
			value: 'server',
			label: 'Server Page',
			hint: 'Server component (React 18+)',
		},
		{
			value: 'client',
			label: 'Client Page',
			hint: 'Client-side rendered (SPA)',
		},
	];

	private readonly availableFeatures = [
		{
			value: 'seo',
			label: 'SEO Optimization',
			hint: 'Meta tags, Open Graph, structured data',
		},
		{
			value: 'auth',
			label: 'Authentication',
			hint: 'Protected page with login requirements',
		},
		{
			value: 'loading',
			label: 'Loading States',
			hint: 'Skeleton loaders and suspense boundaries',
		},
		{
			value: 'error',
			label: 'Error Handling',
			hint: 'Error boundaries and fallback UI',
		},
		{
			value: 'analytics',
			label: 'Analytics',
			hint: 'Page view tracking and user events',
		},
		{
			value: 'i18n',
			label: 'Internationalization',
			hint: 'Multi-language support',
		},
		{
			value: 'accessibility',
			label: 'WCAG AAA Compliance',
			hint: 'Full accessibility features',
		},
		{
			value: 'norwegian',
			label: 'Norwegian Compliance',
			hint: 'UU regulations and Norwegian design patterns',
		},
	];

	getGeneratorType(): string {
		return 'page';
	}

	async generate(options: PageGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating page: ${chalk.cyan(options.name)}`);

		// Detect project structure
		const projectInfo = await this.detectProjectStructure();
		const framework = options.framework || (projectInfo.frameworkType === 'unknown' ? 'next' : projectInfo.frameworkType);

		// Interactive prompts for missing options
		const pageOptions = await this.promptForMissingPageOptions(options);

		// Generate page data
		const naming = this.getNamingConvention(options.name);
		const pageData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			route: pageOptions.route || '/' + naming.kebabCase,
			layout: pageOptions.layout,
			framework,
			pageType: pageOptions.pageType || 'static',
			features: pageOptions.features || [],
			seo: pageOptions.seo !== false,
			auth: pageOptions.auth || false,
			norwegian: pageOptions.norwegian || false,
			typescript: options.typescript !== false,
			hasFeature: (feature: string) => pageOptions.features?.includes(feature) || false,
			...naming,
		};

		const generatedFiles: string[] = [];

		// Generate main page file
		const pageFile = await this.generatePageFile(pageData, options);
		if (pageFile) generatedFiles.push(pageFile);

		// Generate layout if specified
		if (pageData.layout && pageData.layout !== 'default') {
			const layoutFile = await this.generateLayoutFile(pageData, options);
			if (layoutFile) generatedFiles.push(layoutFile);
		}

		// Generate SEO configuration
		if (pageData.hasFeature('seo')) {
			const seoFile = await this.generateSEOConfig(pageData, options);
			if (seoFile) generatedFiles.push(seoFile);
		}

		// Generate Norwegian compliance components if needed
		if (pageData.norwegian || pageData.hasFeature('norwegian')) {
			const complianceFiles = await this.generateNorwegianCompliance(pageData, options);
			generatedFiles.push(...complianceFiles);
		}

		// Generate accessibility features if needed
		if (pageData.hasFeature('accessibility')) {
			const a11yFile = await this.generateAccessibilityFeatures(pageData, options);
			if (a11yFile) generatedFiles.push(a11yFile);
		}

		// Generate tests
		if (options.tests !== false) {
			const testFile = await this.generatePageTests(pageData, options);
			if (testFile) generatedFiles.push(testFile);
		}

		this.logger.success(`Page ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Page ${options.name} generated successfully`,
			files: generatedFiles,
			commands: this.getRecommendedCommands(pageData),
			nextSteps: this.getNextSteps(pageData),
		};
	}

	private async promptForMissingPageOptions(options: PageGeneratorOptions): Promise<PageGeneratorOptions> {
		const result = { ...options };

		// Page type selection
		if (!result.pageType) {
			const pageType = await select({
				message: 'What type of page would you like to create?',
				options: this.pageTypes,
			});

			if (!isCancel(pageType)) {
				result.pageType = pageType as any;
			}
		}

		// Route configuration
		if (!result.route) {
			const route = await text({
				message: 'Page route (URL path):',
				placeholder: `/${this.toKebabCase(options.name)}`,
				defaultValue: `/${this.toKebabCase(options.name)}`,
			});

			if (!isCancel(route)) {
				result.route = route as string;
			}
		}

		// Layout selection
		if (!result.layout) {
			const layout = await text({
				message: 'Layout component name (optional):',
				placeholder: 'Leave empty for default layout',
			});

			if (!isCancel(layout) && layout) {
				result.layout = layout as string;
			}
		}

		// Features selection
		if (!result.features) {
			const features = await multiselect({
				message: 'Select page features:',
				options: this.availableFeatures,
				required: false,
			});

			if (!isCancel(features)) {
				result.features = features as string[];
				
				// Set convenience flags based on selected features
				result.seo = features.includes('seo');
				result.auth = features.includes('auth');
				result.norwegian = features.includes('norwegian');
			}
		}

		return result;
	}

	private async generatePageFile(pageData: any, options: PageGeneratorOptions): Promise<string | null> {
		const templateName = this.getPageTemplate(pageData.framework, pageData.pageType);
		const placement = this.getPageFilePlacement(pageData.framework, pageData.name);
		
		try {
			return await this.generateFile(
				templateName,
				placement.filePath,
				pageData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate page file: ${error}`);
			return null;
		}
	}

	private async generateLayoutFile(pageData: any, options: PageGeneratorOptions): Promise<string | null> {
		const templateName = 'page/layout.hbs';
		const filePath = path.join(process.cwd(), 'src', 'components', 'layouts', `${pageData.layout}.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				pageData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate layout file: ${error}`);
			return null;
		}
	}

	private async generateSEOConfig(pageData: any, options: PageGeneratorOptions): Promise<string | null> {
		const templateName = 'page/seo-config.hbs';
		const filePath = path.join(process.cwd(), 'src', 'seo', `${pageData.kebabCase}-seo.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				{ 
					...pageData,
					title: `${pageData.className} | Your App`,
					description: `${pageData.className} page with full SEO optimization`,
					keywords: [pageData.name.toLowerCase(), 'nextjs', 'react'],
				},
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate SEO config: ${error}`);
			return null;
		}
	}

	private async generateNorwegianCompliance(pageData: any, options: PageGeneratorOptions): Promise<string[]> {
		const files: string[] = [];

		// Generate UU banner component
		try {
			const bannerFile = await this.generateFile(
				'page/norwegian/uu-banner.hbs',
				path.join(process.cwd(), 'src', 'components', 'compliance', 'UUBanner.tsx'),
				pageData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (bannerFile) files.push(bannerFile);
		} catch (error) {
			this.logger.warn(`Failed to generate UU banner: ${error}`);
		}

		// Generate language selector
		try {
			const langFile = await this.generateFile(
				'page/norwegian/language-selector.hbs',
				path.join(process.cwd(), 'src', 'components', 'compliance', 'LanguageSelector.tsx'),
				pageData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (langFile) files.push(langFile);
		} catch (error) {
			this.logger.warn(`Failed to generate language selector: ${error}`);
		}

		return files;
	}

	private async generateAccessibilityFeatures(pageData: any, options: PageGeneratorOptions): Promise<string | null> {
		const templateName = 'page/accessibility-features.hbs';
		const filePath = path.join(process.cwd(), 'src', 'components', 'accessibility', `${pageData.className}A11y.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				pageData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate accessibility features: ${error}`);
			return null;
		}
	}

	private async generatePageTests(pageData: any, options: PageGeneratorOptions): Promise<string | null> {
		const templateName = 'page/page-test.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'pages', `${pageData.kebabCase}.test.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				pageData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate page tests: ${error}`);
			return null;
		}
	}

	private getPageTemplate(framework: string, pageType: string): string {
		const templates = {
			next: {
				static: 'page/nextjs-static-page.hbs',
				dynamic: 'page/nextjs-dynamic-page.hbs',
				server: 'page/nextjs-server-page.hbs',
				client: 'page/nextjs-client-page.hbs',
			},
			react: {
				static: 'page/react-page.hbs',
				dynamic: 'page/react-page.hbs',
				server: 'page/react-page.hbs',
				client: 'page/react-page.hbs',
			},
		};

		return templates[framework as keyof typeof templates]?.[pageType as keyof typeof templates.next] 
			|| 'page/default-page.hbs';
	}

	private getPageFilePlacement(framework: string, name: string): { filePath: string; testPath?: string } {
		const naming = this.getNamingConvention(name);
		
		switch (framework) {
			case 'next':
				return {
					filePath: path.join(process.cwd(), 'src', 'app', naming.kebabCase, 'page.tsx'),
					testPath: path.join(process.cwd(), 'src', '__tests__', 'pages', `${naming.kebabCase}.test.tsx`),
				};
			case 'react':
			default:
				return {
					filePath: path.join(process.cwd(), 'src', 'pages', `${naming.className}.tsx`),
					testPath: path.join(process.cwd(), 'src', '__tests__', 'pages', `${naming.className}.test.tsx`),
				};
		}
	}

	private getRecommendedCommands(pageData: any): string[] {
		const commands = ['npm run type-check'];
		
		if (pageData.hasFeature('seo')) {
			commands.push('npm run build'); // To verify SSG/SSR works
		}
		
		if (pageData.hasFeature('accessibility')) {
			commands.push('npm run test:a11y');
		}
		
		if (pageData.norwegian) {
			commands.push('npm run validate:uu');
		}

		return commands;
	}

	private getNextSteps(pageData: any): string[] {
		const steps = [
			`Navigate to ${pageData.route} to see your new page`,
			'Customize the page content and styling',
		];

		if (pageData.layout && pageData.layout !== 'default') {
			steps.push(`Implement the ${pageData.layout} layout component`);
		}

		if (pageData.hasFeature('auth')) {
			steps.push('Configure authentication guards and login flow');
		}

		if (pageData.hasFeature('seo')) {
			steps.push('Customize SEO metadata for better search rankings');
		}

		if (pageData.norwegian) {
			steps.push('Review UU compliance requirements');
			steps.push('Test with Norwegian screen readers');
		}

		if (pageData.hasFeature('analytics')) {
			steps.push('Set up analytics tracking for page views');
		}

		return steps;
	}
}