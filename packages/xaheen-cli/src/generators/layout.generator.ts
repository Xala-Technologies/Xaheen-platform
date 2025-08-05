/**
 * Layout Generator - Reusable layout components with flexible configuration
 *
 * Generates layout components with header, sidebar, footer, and responsive design
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
Handlebars.registerHelper('includes', (array, value) => array && array.includes(value));
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());

export interface LayoutGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly type?: 'admin' | 'web' | 'dashboard' | 'blog' | 'ecommerce' | 'auth' | 'custom';
	readonly components?: string[];
	readonly responsive?: boolean;
	readonly theme?: 'light' | 'dark' | 'auto';
	readonly navigation?: 'sidebar' | 'topbar' | 'both' | 'none';
	readonly norwegian?: boolean;
	readonly accessibility?: boolean;
	readonly typescript?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly semanticUI?: boolean;
	readonly i18n?: boolean;
	readonly designTokens?: boolean;
}

export class LayoutGenerator extends BaseGenerator<LayoutGeneratorOptions> {
	private readonly layoutTypes = [
		{
			value: 'admin',
			label: 'Admin Dashboard',
			hint: 'Full admin layout with sidebar, header, and breadcrumbs',
		},
		{
			value: 'web',
			label: 'Website Layout',
			hint: 'Marketing/content website with header and footer',
		},
		{
			value: 'dashboard',
			label: 'Analytics Dashboard',
			hint: 'Data-focused layout with charts and metrics',
		},
		{
			value: 'auth',
			label: 'Authentication Layout',
			hint: 'Centered layout for login, signup, and auth flows',
		},
		{
			value: 'blog',
			label: 'Blog Layout',
			hint: 'Content-focused layout for articles and posts',
		},
		{
			value: 'ecommerce',
			label: 'E-commerce Layout',
			hint: 'Shopping layout with cart, search, and product displays',
		},
		{
			value: 'custom',
			label: 'Custom Layout',
			hint: 'Build your own layout with selected components',
		},
	];

	private readonly availableComponents = [
		{
			value: 'header',
			label: 'Header',
			hint: 'Top navigation and branding',
			required: true,
		},
		{
			value: 'sidebar',
			label: 'Sidebar',
			hint: 'Side navigation menu',
			required: false,
		},
		{
			value: 'footer',
			label: 'Footer',
			hint: 'Bottom section with links and info',
			required: false,
		},
		{
			value: 'breadcrumbs',
			label: 'Breadcrumbs',
			hint: 'Navigation path indicator',
			required: false,
		},
		{
			value: 'search',
			label: 'Search Bar',
			hint: 'Global search functionality',
			required: false,
		},
		{
			value: 'user-menu',
			label: 'User Menu',
			hint: 'User profile and account options',
			required: false,
		},
		{
			value: 'notifications',
			label: 'Notifications',
			hint: 'Alert and notification center',
			required: false,
		},
		{
			value: 'theme-switcher',
			label: 'Theme Switcher',
			hint: 'Light/dark mode toggle',
			required: false,
		},
		{
			value: 'language-selector',
			label: 'Language Selector',
			hint: 'Multi-language support',
			required: false,
		},
	];

	private readonly navigationTypes = [
		{
			value: 'sidebar',
			label: 'Sidebar Navigation',
			hint: 'Vertical navigation on the left side',
		},
		{
			value: 'topbar',
			label: 'Top Navigation',
			hint: 'Horizontal navigation in header',
		},
		{
			value: 'both',
			label: 'Both Sidebar and Top',
			hint: 'Combination of sidebar and top navigation',
		},
		{
			value: 'none',
			label: 'No Navigation',
			hint: 'Manual navigation setup',
		},
	];

	getGeneratorType(): string {
		return 'layout';
	}

	async generate(options: LayoutGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating layout: ${chalk.cyan(options.name)}`);

		// Interactive prompts for missing options
		const layoutOptions = await this.promptForMissingLayoutOptions(options);

		// Generate layout data
		const naming = this.getNamingConvention(options.name);
		const baseLayoutData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			kebabCase: naming.kebabCase,
			layoutType: layoutOptions.type || 'custom',
			components: this.getLayoutComponents(layoutOptions.type!, layoutOptions.components),
			responsive: layoutOptions.responsive !== false,
			theme: layoutOptions.theme || 'auto',
			navigation: layoutOptions.navigation || 'topbar',
			norwegian: layoutOptions.norwegian || false,
			accessibility: layoutOptions.accessibility !== false,
			typescript: options.typescript !== false,
			hasComponent: (component: string) => layoutOptions.components?.includes(component) || false,
			hasHeader: layoutOptions.components?.includes('header') || this.getLayoutComponents(layoutOptions.type!).includes('header'),
			hasSidebar: layoutOptions.components?.includes('sidebar') || this.getLayoutComponents(layoutOptions.type!).includes('sidebar'),
			hasFooter: layoutOptions.components?.includes('footer') || this.getLayoutComponents(layoutOptions.type!).includes('footer'),
			description: this.getLayoutDescription(layoutOptions.type!),
			...naming,
		};

		// Enhance with semantic UI data
		const layoutData = this.enhanceTemplateData(baseLayoutData, layoutOptions);

		const generatedFiles: string[] = [];

		// Generate main layout component
		const layoutFile = await this.generateLayoutComponent(layoutData, options);
		if (layoutFile) generatedFiles.push(layoutFile);

		// Generate individual components
		for (const component of layoutData.components) {
			const componentFile = await this.generateLayoutSubComponent(layoutData, component, options);
			if (componentFile) generatedFiles.push(componentFile);
		}

		// Generate layout styles
		const stylesFile = await this.generateLayoutStyles(layoutData, options);
		if (stylesFile) generatedFiles.push(stylesFile);

		// Generate responsive utilities
		if (layoutData.responsive) {
			const responsiveFile = await this.generateResponsiveUtilities(layoutData, options);
			if (responsiveFile) generatedFiles.push(responsiveFile);
		}

		// Generate Norwegian compliance features
		if (layoutData.norwegian) {
			const complianceFiles = await this.generateNorwegianFeatures(layoutData, options);
			generatedFiles.push(...complianceFiles);
		}

		// Generate accessibility features
		if (layoutData.accessibility) {
			const a11yFile = await this.generateAccessibilityFeatures(layoutData, options);
			if (a11yFile) generatedFiles.push(a11yFile);
		}

		// Generate layout context/provider
		const contextFile = await this.generateLayoutContext(layoutData, options);
		if (contextFile) generatedFiles.push(contextFile);

		// Generate tests
		if (options.tests !== false) {
			const testFile = await this.generateLayoutTests(layoutData, options);
			if (testFile) generatedFiles.push(testFile);
		}

		// Generate Storybook stories
		if (options.stories !== false) {
			const storiesFile = await this.generateLayoutStories(layoutData, options);
			if (storiesFile) generatedFiles.push(storiesFile);
		}

		this.logger.success(`Layout ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Layout ${options.name} generated successfully`,
			files: generatedFiles,
			commands: this.getRecommendedCommands(layoutData),
			nextSteps: this.getNextSteps(layoutData),
		};
	}

	private async promptForMissingLayoutOptions(options: LayoutGeneratorOptions): Promise<LayoutGeneratorOptions> {
		const result = { ...options };

		// Layout type selection
		if (!result.type) {
			const layoutType = await select({
				message: 'What type of layout would you like to create?',
				options: this.layoutTypes,
			});

			if (!isCancel(layoutType)) {
				result.type = layoutType as any;
			}
		}

		// Navigation type selection
		if (!result.navigation && result.type !== 'custom') {
			const navigation = await select({
				message: 'What navigation style would you like?',
				options: this.navigationTypes,
			});

			if (!isCancel(navigation)) {
				result.navigation = navigation as any;
			}
		}

		// Components selection for custom layouts
		if (result.type === 'custom' && !result.components) {
			const components = await multiselect({
				message: 'Select layout components:',
				options: this.availableComponents.map(comp => ({
					value: comp.value,
					label: comp.label,
					hint: comp.hint,
				})),
				required: false,
			});

			if (!isCancel(components)) {
				result.components = components as string[];
			}
		}

		// Theme selection
		if (!result.theme) {
			const theme = await select({
				message: 'Theme support:',
				options: [
					{ value: 'light', label: 'Light Theme Only' },
					{ value: 'dark', label: 'Dark Theme Only' },
					{ value: 'auto', label: 'Auto (System Preference)' },
				],
			});

			if (!isCancel(theme)) {
				result.theme = theme as any;
			}
		}

		// Norwegian compliance
		if (result.norwegian === undefined) {
			const norwegian = await confirm({
				message: 'Include Norwegian UU compliance features?',
			});

			if (!isCancel(norwegian)) {
				result.norwegian = norwegian as boolean;
			}
		}

		// Responsive design
		if (result.responsive === undefined) {
			const responsive = await confirm({
				message: 'Make layout responsive?',
			});

			if (!isCancel(responsive)) {
				result.responsive = responsive as boolean;
			}
		}

		return result;
	}

	private getLayoutComponents(type: string, customComponents?: string[]): string[] {
		const presets = {
			admin: ['header', 'sidebar', 'breadcrumbs', 'user-menu', 'notifications'],
			web: ['header', 'footer'],
			dashboard: ['header', 'sidebar', 'breadcrumbs', 'search', 'theme-switcher'],
			auth: ['footer'],
			blog: ['header', 'footer', 'search'],
			ecommerce: ['header', 'footer', 'search', 'user-menu'],
			custom: customComponents || ['header'],
		};

		return presets[type as keyof typeof presets] || ['header'];
	}

	private getLayoutDescription(type: string): string {
		const descriptions = {
			admin: 'A comprehensive admin dashboard layout with navigation sidebar, header, and content areas',
			web: 'A clean web layout perfect for marketing sites and content pages',
			dashboard: 'An analytics-focused dashboard layout with data visualization areas',
			auth: 'A centered authentication layout optimized for login, signup, and auth flows',
			blog: 'A content-focused blog layout with article display and navigation',
			ecommerce: 'An e-commerce layout with product displays, search, and shopping features',
			custom: 'A flexible custom layout with your selected components',
		};

		return descriptions[type as keyof typeof descriptions] || 'A flexible layout component';
	}

	private async generateLayoutComponent(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		let templateName: string;
		
		// Use semantic UI template if enabled
		if (layoutData.useSemanticUI !== false) {
			templateName = 'layout/semantic-layout.hbs';
		} else {
			templateName = `layout/${layoutData.layoutType}-layout.hbs`;
		}
		
		const placement = this.getFilePlacement('layout', layoutData.name);
		
		try {
			return await this.generateFile(
				templateName,
				placement.filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			// Fallback to semantic layout template
			try {
				return await this.generateFile(
					'layout/semantic-layout.hbs',
					placement.filePath,
					layoutData,
					{ dryRun: options.dryRun, force: options.force }
				);
			} catch (fallbackError) {
				this.logger.warn(`Failed to generate layout component: ${fallbackError}`);
				return null;
			}
		}
	}

	private async generateLayoutSubComponent(layoutData: any, component: string, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = `layout/components/${component}.hbs`;
		const componentName = this.toPascalCase(component);
		const filePath = path.join(process.cwd(), 'src', 'components', 'layout', `${componentName}.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				{ ...layoutData, componentName },
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate ${component} component: ${error}`);
			return null;
		}
	}

	private async generateLayoutStyles(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = 'layout/layout-styles.hbs';
		const filePath = path.join(process.cwd(), 'src', 'styles', `${layoutData.kebabCase}-layout.css`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate layout styles: ${error}`);
			return null;
		}
	}

	private async generateResponsiveUtilities(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = 'layout/responsive-utils.hbs';
		const filePath = path.join(process.cwd(), 'src', 'utils', 'responsive.ts');
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate responsive utilities: ${error}`);
			return null;
		}
	}

	private async generateNorwegianFeatures(layoutData: any, options: LayoutGeneratorOptions): Promise<string[]> {
		const files: string[] = [];

		// Generate UU compliance banner
		try {
			const bannerFile = await this.generateFile(
				'layout/norwegian/uu-compliance-banner.hbs',
				path.join(process.cwd(), 'src', 'components', 'compliance', 'UUComplianceBanner.tsx'),
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (bannerFile) files.push(bannerFile);
		} catch (error) {
			this.logger.warn(`Failed to generate UU compliance banner: ${error}`);
		}

		// Generate high contrast mode
		try {
			const contrastFile = await this.generateFile(
				'layout/norwegian/high-contrast.hbs',
				path.join(process.cwd(), 'src', 'components', 'accessibility', 'HighContrastMode.tsx'),
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (contrastFile) files.push(contrastFile);
		} catch (error) {
			this.logger.warn(`Failed to generate high contrast mode: ${error}`);
		}

		return files;
	}

	private async generateAccessibilityFeatures(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = 'layout/accessibility-provider.hbs';
		const filePath = path.join(process.cwd(), 'src', 'providers', 'AccessibilityProvider.tsx');
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate accessibility provider: ${error}`);
			return null;
		}
	}

	private async generateLayoutContext(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = 'layout/layout-context.hbs';
		const filePath = path.join(process.cwd(), 'src', 'contexts', `${layoutData.className}Context.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate layout context: ${error}`);
			return null;
		}
	}

	private async generateLayoutTests(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = 'layout/layout-test.hbs';
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'layouts', `${layoutData.className}.test.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate layout tests: ${error}`);
			return null;
		}
	}

	private async generateLayoutStories(layoutData: any, options: LayoutGeneratorOptions): Promise<string | null> {
		const templateName = 'layout/layout-stories.hbs';
		const filePath = path.join(process.cwd(), 'src', 'stories', `${layoutData.className}.stories.tsx`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate layout stories: ${error}`);
			return null;
		}
	}

	private getRecommendedCommands(layoutData: any): string[] {
		const commands = ['npm run type-check', 'npm run lint'];
		
		if (layoutData.responsive) {
			commands.push('npm run test:responsive');
		}
		
		if (layoutData.accessibility) {
			commands.push('npm run test:a11y');
		}
		
		if (layoutData.norwegian) {
			commands.push('npm run validate:uu');
		}

		return commands;
	}

	private getNextSteps(layoutData: any): string[] {
		const steps = [
			`Import and use the ${layoutData.className} layout in your pages`,
			'Customize the layout styling to match your design system',
		];

		if (layoutData.components.includes('sidebar')) {
			steps.push('Configure navigation items for the sidebar');
		}

		if (layoutData.components.includes('user-menu')) {
			steps.push('Implement user authentication and profile management');
		}

		if (layoutData.components.includes('search')) {
			steps.push('Set up search functionality and API endpoints');
		}

		if (layoutData.responsive) {
			steps.push('Test responsive behavior on different screen sizes');
		}

		if (layoutData.norwegian) {
			steps.push('Review UU compliance requirements and test with assistive technologies');
		}

		if (layoutData.accessibility) {
			steps.push('Configure focus management and keyboard navigation');
		}

		steps.push('Create layout-specific documentation and usage examples');

		return steps;
	}
}