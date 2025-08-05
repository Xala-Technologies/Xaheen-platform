/**
 * @fileoverview Storybook Integration Generator - EPIC 13 Story 13.6.1
 * @description Automated Storybook setup with comprehensive configuration and sample stories
 * @version 1.0.0
 * @compliance Norwegian Enterprise Standards, WCAG AAA, Storybook Best Practices
 */

import { BaseGenerator } from "../base.generator";
import { promises as fs } from "fs";
import { join, resolve, dirname } from "path";
import { logger } from "../../utils/logger.js";
import type { DocumentationGeneratorOptions, DocumentationResult } from "./index";

export interface StorybookIntegrationOptions extends DocumentationGeneratorOptions {
	readonly enableA11yTesting: boolean;
	readonly enableChromatic: boolean;
	readonly enableViewportTesting: boolean;
	readonly enableControlsAddon: boolean;
	readonly enableActionsAddon: boolean;
	readonly enableDocsAddon: boolean;
	readonly enableInteractionsAddon: boolean;
	readonly enableTestRunner: boolean;
	readonly supportedPlatforms: readonly string[];
	readonly designTokens?: Record<string, any>;
	readonly customTheme?: Record<string, any>;
	readonly mockApiData?: Record<string, any>;
}

export interface StorybookConfiguration {
	readonly main: Record<string, any>;
	readonly preview: Record<string, any>;
	readonly manager: Record<string, any>;
	readonly testRunner?: Record<string, any>;
}

export interface StoryTemplate {
	readonly name: string;
	readonly component: string;
	readonly template: string;
	readonly args: Record<string, any>;
	readonly argTypes: Record<string, any>;
	readonly controls: Record<string, any>;
	readonly actions: string[];
	readonly decorators?: string[];
	readonly parameters?: Record<string, any>;
}

/**
 * Storybook Integration Generator
 * Provides comprehensive Storybook setup with enterprise-grade features
 */
export class StorybookIntegrationGenerator extends BaseGenerator {
	private readonly defaultAddons = [
		"@storybook/addon-essentials",
		"@storybook/addon-a11y",
		"@storybook/addon-viewport",
		"@storybook/addon-interactions",
		"@storybook/addon-docs",
		"@storybook/addon-controls",
		"@storybook/addon-actions",
		"@storybook/addon-backgrounds",
		"@storybook/addon-toolbars",
		"@storybook/addon-measure",
		"@storybook/addon-outline",
	];

	private readonly norwegianA11yConfig = {
		colorContrast: {
			threshold: 4.5, // WCAG AAA standard
		},
		runOptions: {
			skip: [], // Run all accessibility tests
		},
		disable: false,
		manual: false,
	};

	/**
	 * Generate comprehensive Storybook integration
	 */
	async generate(options: StorybookIntegrationOptions): Promise<DocumentationResult> {
		const startTime = Date.now();
		logger.info("📚 Generating Storybook integration...");

		try {
			// Detect project framework and setup
			const projectInfo = await this.analyzeProject(options.outputDir);
			
			// Generate Storybook configuration files
			const storybookConfig = this.generateStorybookConfiguration(options, projectInfo);
			
			// Create configuration files
			const configFiles = await this.createConfigurationFiles(
				options.outputDir,
				storybookConfig,
				options
			);

			// Generate sample stories
			const storyFiles = await this.generateSampleStories(options, projectInfo);

			// Create package.json updates
			const packageUpdates = this.generatePackageUpdates(options, projectInfo);

			// Generate documentation files
			const docsFiles = await this.generateStorybookDocs(options);

			// Create NPM scripts
			const scripts = this.generateNPMScripts(options);

			const generationTime = Date.now() - startTime;
			
			return {
				success: true,
				message: `Storybook integration generated successfully in ${generationTime}ms`,
				files: [
					...configFiles,
					...storyFiles,
					...docsFiles,
				],
				commands: [
					"npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-a11y",
					...packageUpdates.devDependencies.map(dep => `npm install --save-dev ${dep}`),
					"npx storybook@latest init --no-dev",
					"npm run storybook",
				],
				nextSteps: [
					"Storybook Integration Setup Complete:",
					"• Run 'npm run storybook' to start the development server",
					"• Visit http://localhost:6006 to view your stories",
					"• Add new stories using the generated templates",
					"• Configure Chromatic for visual regression testing",
					"• Set up CI/CD integration for automated testing",
					"• Review accessibility testing results in the A11y addon",
					"• Customize design tokens in .storybook/preview.js",
					...scripts,
				],
			};
		} catch (error) {
			logger.error("Failed to generate Storybook integration:", error);
			return {
				success: false,
				message: "Failed to generate Storybook integration",
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Analyze project structure and framework
	 */
	private async analyzeProject(projectRoot: string): Promise<{
		framework: string;
		packageManager: string;
		hasTypeScript: boolean;
		existingDependencies: Record<string, string>;
		buildTool: string;
	}> {
		try {
			const packageJsonPath = join(projectRoot, "package.json");
			let packageJson: any = {};

			try {
				const content = await fs.readFile(packageJsonPath, "utf-8");
				packageJson = JSON.parse(content);
			} catch {
				logger.warn("No package.json found, using default configuration");
			}

			const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
			
			// Detect framework
			let framework = "react"; // default
			if (deps.next) framework = "nextjs";
			else if (deps.vue) framework = "vue";
			else if (deps["@angular/core"]) framework = "angular";
			else if (deps.svelte) framework = "svelte";

			// Detect build tool
			let buildTool = "webpack";
			if (deps.vite) buildTool = "vite";
			else if (framework === "nextjs") buildTool = "nextjs";

			// Detect TypeScript
			const hasTypeScript = Boolean(deps.typescript || deps["@types/node"]);

			// Detect package manager
			let packageManager = "npm";
			try {
				await fs.access(join(projectRoot, "yarn.lock"));
				packageManager = "yarn";
			} catch {
				try {
					await fs.access(join(projectRoot, "pnpm-lock.yaml"));
					packageManager = "pnpm";
				} catch {
					// Default to npm
				}
			}

			return {
				framework,
				packageManager,
				hasTypeScript,
				existingDependencies: deps,
				buildTool,
			};
		} catch (error) {
			logger.warn("Failed to analyze project, using defaults:", error);
			return {
				framework: "react",
				packageManager: "npm",
				hasTypeScript: false,
				existingDependencies: {},
				buildTool: "webpack",
			};
		}
	}

	/**
	 * Generate Storybook configuration objects
	 */
	private generateStorybookConfiguration(
		options: StorybookIntegrationOptions,
		projectInfo: any
	): StorybookConfiguration {
		const addons = [
			...this.defaultAddons,
			...(options.enableChromatic ? ["@storybook/addon-chromatic"] : []),
			...(projectInfo.hasTypeScript ? ["@storybook/addon-typescript"] : []),
		];

		const main = {
			stories: [
				"../src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
				"../docs/**/*.stories.@(js|jsx|ts|tsx|mdx)",
			],
			addons,
			framework: {
				name: this.getStorybookFramework(projectInfo.framework, projectInfo.buildTool),
				options: {},
			},
			features: {
				enableCrash: false,
				buildStoriesJson: true,
				storyStoreV7: true,
				argTypeTargetsV7: true,
			},
			typescript: projectInfo.hasTypeScript ? {
				check: false,
				reactDocgen: "react-docgen-typescript",
				reactDocgenTypescriptOptions: {
					shouldExtractLiteralValuesFromEnum: true,
					propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
				},
			} : undefined,
			docs: {
				autodocs: true,
			},
		};

		const preview = {
			parameters: {
				actions: { argTypesRegex: "^on[A-Z].*" },
				controls: {
					matchers: {
						color: /(background|color)$/i,
						date: /Date$/,
					},
				},
				a11y: this.norwegianA11yConfig,
				viewport: {
					viewports: {
						...this.getResponsiveViewports(),
						...this.getNorwegianDeviceViewports(),
					},
				},
				backgrounds: {
					default: "light",
					values: [
						{ name: "light", value: "#ffffff" },
						{ name: "dark", value: "#1a1a1a" },
						{ name: "gray", value: "#f5f5f5" },
					],
				},
				docs: {
					theme: options.customTheme || this.getDefaultTheme(),
				},
			},
			globalTypes: {
				theme: {
					description: "Global theme for components",
					defaultValue: "light",
					toolbar: {
						title: "Theme",
						icon: "paintbrush",
						items: [
							{ value: "light", title: "Light" },
							{ value: "dark", title: "Dark" },
						],
						dynamicTitle: true,
					},
				},
				locale: {
					description: "Internationalization locale",
					defaultValue: "en",
					toolbar: {
						title: "Locale",
						icon: "globe",
						items: [
							{ value: "en", title: "English" },
							{ value: "nb-NO", title: "Norsk (Bokmål)" },
						],
						dynamicTitle: true,
					},
				},
			},
		};

		const manager = {
			theme: options.customTheme || this.getDefaultTheme(),
		};

		const testRunner = options.enableTestRunner ? {
			async preRender(page: any) {
				await page.waitForLoadState("networkidle");
			},
			async postRender(page: any) {
				await page.waitForTimeout(500);
			},
		} : undefined;

		return {
			main,
			preview,
			manager,
			testRunner,
		};
	}

	/**
	 * Create Storybook configuration files
	 */
	private async createConfigurationFiles(
		outputDir: string,
		config: StorybookConfiguration,
		options: StorybookIntegrationOptions
	): Promise<string[]> {
		const storybookDir = join(outputDir, ".storybook");
		await fs.mkdir(storybookDir, { recursive: true });

		const files: string[] = [];

		// main.js/ts
		const mainFile = join(storybookDir, "main.js");
		const mainContent = this.generateMainConfig(config.main);
		await fs.writeFile(mainFile, mainContent, "utf-8");
		files.push(mainFile);

		// preview.js/ts
		const previewFile = join(storybookDir, "preview.js");
		const previewContent = this.generatePreviewConfig(config.preview, options);
		await fs.writeFile(previewFile, previewContent, "utf-8");
		files.push(previewFile);

		// manager.js
		const managerFile = join(storybookDir, "manager.js");
		const managerContent = this.generateManagerConfig(config.manager);
		await fs.writeFile(managerFile, managerContent, "utf-8");
		files.push(managerFile);

		// Custom webpack config if needed
		if (options.enableCustomWebpack) {
			const webpackFile = join(storybookDir, "webpack.config.js");
			const webpackContent = this.generateWebpackConfig();
			await fs.writeFile(webpackFile, webpackContent, "utf-8");
			files.push(webpackFile);
		}

		// Test runner config
		if (config.testRunner) {
			const testRunnerFile = join(storybookDir, "test-runner.js");
			const testRunnerContent = this.generateTestRunnerConfig(config.testRunner);
			await fs.writeFile(testRunnerFile, testRunnerContent, "utf-8");
			files.push(testRunnerFile);
		}

		return files;
	}

	/**
	 * Generate sample stories for different component types
	 */
	private async generateSampleStories(
		options: StorybookIntegrationOptions,
		projectInfo: any
	): Promise<string[]> {
		const storiesDir = join(options.outputDir, "src", "stories");
		await fs.mkdir(storiesDir, { recursive: true });

		const files: string[] = [];

		// Generate basic component stories
		const storyTemplates = this.getStoryTemplates(projectInfo.framework, projectInfo.hasTypeScript);

		for (const template of storyTemplates) {
			const storyFile = join(storiesDir, `${template.name}.stories.${projectInfo.hasTypeScript ? 'ts' : 'js'}${projectInfo.framework === 'react' ? 'x' : ''}`);
			const storyContent = this.generateStoryContent(template, options);
			await fs.writeFile(storyFile, storyContent, "utf-8");
			files.push(storyFile);
		}

		// Generate component files if they don't exist
		const componentsDir = join(options.outputDir, "src", "components");
		await fs.mkdir(componentsDir, { recursive: true });

		for (const template of storyTemplates) {
			const componentFile = join(componentsDir, `${template.name}.${projectInfo.hasTypeScript ? 'tsx' : 'jsx'}`);
			
			try {
				await fs.access(componentFile);
				// Component exists, skip
			} catch {
				// Component doesn't exist, create it
				const componentContent = this.generateComponentFile(template, projectInfo);
				await fs.writeFile(componentFile, componentContent, "utf-8");
				files.push(componentFile);
			}
		}

		return files;
	}

	/**
	 * Generate Storybook documentation files
	 */
	private async generateStorybookDocs(options: StorybookIntegrationOptions): Promise<string[]> {
		const docsDir = join(options.outputDir, "docs", "storybook");
		await fs.mkdir(docsDir, { recursive: true });

		const files: string[] = [];

		// Introduction MDX
		const introFile = join(docsDir, "Introduction.stories.mdx");
		const introContent = this.generateIntroductionMDX(options);
		await fs.writeFile(introFile, introContent, "utf-8");
		files.push(introFile);

		// Design Tokens documentation
		if (options.designTokens) {
			const tokensFile = join(docsDir, "DesignTokens.stories.mdx");
			const tokensContent = this.generateDesignTokensMDX(options.designTokens);
			await fs.writeFile(tokensFile, tokensContent, "utf-8");
			files.push(tokensFile);
		}

		// Norwegian Accessibility Guide
		const a11yFile = join(docsDir, "AccessibilityGuide.stories.mdx");
		const a11yContent = this.generateAccessibilityGuideMDX(options);
		await fs.writeFile(a11yFile, a11yContent, "utf-8");
		files.push(a11yFile);

		// Component Development Guide
		const devGuideFile = join(docsDir, "ComponentDevelopment.stories.mdx");
		const devGuideContent = this.generateDevelopmentGuideMDX(options);
		await fs.writeFile(devGuideFile, devGuideContent, "utf-8");
		files.push(devGuideFile);

		return files;
	}

	// Configuration content generators

	private generateMainConfig(config: any): string {
		return `module.exports = ${JSON.stringify(config, null, 2)};`;
	}

	private generatePreviewConfig(config: any, options: StorybookIntegrationOptions): string {
		return `import { addDecorator } from '@storybook/react';
import { withA11y } from '@storybook/addon-a11y';

// Add accessibility decorator globally
addDecorator(withA11y);

export const parameters = ${JSON.stringify(config.parameters, null, 2)};

export const globalTypes = ${JSON.stringify(config.globalTypes, null, 2)};

// Theme decorator
const withTheme = (Story, context) => {
  const theme = context.globals.theme;
  return (
    <div className={\`theme-\${theme}\`} data-theme={theme}>
      <Story {...context} />
    </div>
  );
};

// Locale decorator
const withLocale = (Story, context) => {
  const locale = context.globals.locale;
  return (
    <div lang={locale}>
      <Story {...context} />
    </div>
  );
};

export const decorators = [withTheme, withLocale];`;
	}

	private generateManagerConfig(config: any): string {
		return `import { addons } from '@storybook/addons';

addons.setConfig(${JSON.stringify(config, null, 2)});`;
	}

	private generateWebpackConfig(): string {
		return `module.exports = ({ config }) => {
  // Custom webpack configuration
  config.module.rules.push({
    test: /\\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
  });

  return config;
};`;
	}

	private generateTestRunnerConfig(config: any): string {
		return `module.exports = {
  ${JSON.stringify(config, null, 2).slice(1, -1)}
};`;
	}

	// Story template generators

	private getStoryTemplates(framework: string, hasTypeScript: boolean): StoryTemplate[] {
		const baseTemplates = [
			{
				name: "Button",
				component: "Button",
				template: "button-story",
				args: {
					primary: false,
					backgroundColor: undefined,
					size: "medium",
					label: "Button",
				},
				argTypes: {
					backgroundColor: { control: "color" },
					onClick: { action: "clicked" },
				},
				controls: {
					primary: { type: "boolean" },
					size: { 
						type: "select",
						options: ["small", "medium", "large"],
					},
				},
				actions: ["onClick"],
			},
			{
				name: "Input",
				component: "Input",
				template: "input-story",
				args: {
					placeholder: "Enter text...",
					disabled: false,
					type: "text",
				},
				argTypes: {
					onChange: { action: "changed" },
					onFocus: { action: "focused" },
					onBlur: { action: "blurred" },
				},
				controls: {
					type: {
						type: "select",
						options: ["text", "email", "password", "number"],
					},
				},
				actions: ["onChange", "onFocus", "onBlur"],
			},
			{
				name: "Card",
				component: "Card",
				template: "card-story",
				args: {
					title: "Sample Card",
					content: "This is a sample card component with some content.",
					elevated: false,
				},
				argTypes: {},
				controls: {
					elevated: { type: "boolean" },
				},
				actions: [],
			},
		];

		return baseTemplates;
	}

	private generateStoryContent(template: StoryTemplate, options: StorybookIntegrationOptions): string {
		const isTypeScript = options.projectType?.includes("typescript") || false;
		const fileExtension = isTypeScript ? "tsx" : "jsx";

		return `import type { Meta, StoryObj } from '@storybook/react';
import { ${template.component} } from '../components/${template.component}';

const meta: Meta<typeof ${template.component}> = {
  title: 'Components/${template.component}',
  component: ${template.component},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A ${template.component.toLowerCase()} component with comprehensive accessibility and Norwegian compliance features.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            options: { noScroll: true },
          },
          {
            id: 'focus-order-semantics',
            options: { noScroll: true },
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: ${JSON.stringify(template.argTypes, null, 4)},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: ${JSON.stringify(template.args, null, 4)},
};

// Interactive story with all controls
export const Interactive: Story = {
  args: ${JSON.stringify(template.args, null, 4)},
  parameters: {
    docs: {
      description: {
        story: 'Interactive version with all available controls. Use the Controls panel to experiment with different props.',
      },
    },
  },
};

// Norwegian locale story
export const Norwegian: Story = {
  args: {
    ...Default.args,
    ${template.name === 'Button' ? 'label: "Knapp"' : template.name === 'Input' ? 'placeholder: "Skriv inn tekst..."' : 'title: "Eksempel Kort"'},
  },
  parameters: {
    locale: 'nb-NO',
    docs: {
      description: {
        story: 'Norwegian localized version demonstrating i18n support.',
      },
    },
  },
};

// Accessibility focused story
export const AccessibilityTest: Story = {
  args: Default.args,
  parameters: {
    a11y: {
      manual: false,
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
        ],
      },
    },
    docs: {
      description: {
        story: 'Story optimized for accessibility testing with enhanced a11y rules.',
      },
    },
  },
};

// Dark theme story
export const DarkTheme: Story = {
  args: Default.args,
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Component rendered with dark theme.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="theme-dark" data-theme="dark">
        <Story />
      </div>
    ),
  ],
};`;
	}

	private generateComponentFile(template: StoryTemplate, projectInfo: any): string {
		const isTypeScript = projectInfo.hasTypeScript;

		if (template.name === "Button") {
			return this.generateButtonComponent(isTypeScript);
		} else if (template.name === "Input") {
			return this.generateInputComponent(isTypeScript);
		} else if (template.name === "Card") {
			return this.generateCardComponent(isTypeScript);
		}

		return "";
	}

	private generateButtonComponent(isTypeScript: boolean): string {
		const typeDefinitions = isTypeScript ? `
interface ButtonProps {
  readonly primary?: boolean;
  readonly backgroundColor?: string;
  readonly size?: 'small' | 'medium' | 'large';
  readonly label: string;
  readonly onClick?: () => void;
}

export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  onClick,
  ...props
}: ButtonProps): JSX.Element => {` : `
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  onClick,
  ...props
}) => {`;

		return `import React from 'react';
import './button.css';
${typeDefinitions}
  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  
  return (
    <button
      type="button"
      className={[\`storybook-button\`, \`storybook-button--\${size}\`, mode].join(' ')}
      style={{ backgroundColor }}
      onClick={onClick}
      aria-label={label}
      {...props}
    >
      {label}
    </button>
  );
};`;
	}

	private generateInputComponent(isTypeScript: boolean): string {
		const typeDefinitions = isTypeScript ? `
interface InputProps {
  readonly type?: 'text' | 'email' | 'password' | 'number';
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly value?: string;
  readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export const Input = ({
  type = 'text',
  placeholder,
  disabled = false,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}: InputProps): JSX.Element => {` : `
export const Input = ({
  type = 'text',
  placeholder,
  disabled = false,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {`;

		return `import React from 'react';
import './input.css';
${typeDefinitions}
  return (
    <input
      type={type}
      className="storybook-input"
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={placeholder}
      {...props}
    />
  );
};`;
	}

	private generateCardComponent(isTypeScript: boolean): string {
		const typeDefinitions = isTypeScript ? `
interface CardProps {
  readonly title: string;
  readonly content: string;
  readonly elevated?: boolean;
  readonly children?: React.ReactNode;
}

export const Card = ({
  title,
  content,
  elevated = false,
  children,
  ...props
}: CardProps): JSX.Element => {` : `
export const Card = ({
  title,
  content,
  elevated = false,
  children,
  ...props
}) => {`;

		return `import React from 'react';
import './card.css';
${typeDefinitions}
  const elevationClass = elevated ? 'storybook-card--elevated' : '';
  
  return (
    <div
      className={[\`storybook-card\`, elevationClass].filter(Boolean).join(' ')}
      {...props}
    >
      <h3 className="storybook-card__title">{title}</h3>
      <p className="storybook-card__content">{content}</p>
      {children && <div className="storybook-card__children">{children}</div>}
    </div>
  );
};`;
	}

	// MDX documentation generators

	private generateIntroductionMDX(options: StorybookIntegrationOptions): string {
		return `import { Meta } from '@storybook/addon-docs';

<Meta title="Documentation/Introduction" />

# Welcome to ${options.projectName} Storybook

This Storybook contains the component library for **${options.projectName}**, built with Norwegian enterprise standards and WCAG AAA accessibility compliance.

## Features

- 🎨 **Component Library**: Comprehensive collection of reusable UI components
- ♿ **Accessibility**: WCAG AAA compliant with Norwegian standards
- 🌍 **Internationalization**: Full support for Norwegian (Bokmål) and English
- 📱 **Responsive Design**: Mobile-first approach with Norwegian device testing
- 🔧 **Developer Experience**: Hot reload, TypeScript support, and comprehensive testing
- 📊 **Design Tokens**: Consistent design system implementation

## Getting Started

1. **Browse Components**: Navigate through the component categories in the sidebar
2. **Interactive Controls**: Use the Controls panel to experiment with component props
3. **Accessibility Testing**: Check the A11y panel for accessibility compliance
4. **Responsive Testing**: Use the Viewport addon to test different screen sizes
5. **Documentation**: Read component documentation in the Docs tab

## Norwegian Compliance

This component library follows Norwegian enterprise standards including:

- **NSM Security Guidelines**: Appropriate classification and handling
- **Norwegian Digital Standards**: UU compliance and best practices  
- **GDPR Compliance**: Privacy-first design patterns
- **Accessibility Standards**: Beyond WCAG AAA requirements

## Design System

Our design system is built on these principles:

- **Consistency**: Unified visual language across all components
- **Accessibility**: Universal design for all users
- **Flexibility**: Customizable components for different contexts
- **Performance**: Optimized for Norwegian network conditions

## Contributing

When adding new components:

1. Follow the established naming conventions
2. Include comprehensive accessibility testing
3. Add Norwegian translations where applicable
4. Write detailed documentation and examples
5. Ensure responsive design compliance

---

*Built with ❤️ for Norwegian enterprises*`;
	}

	private generateDesignTokensMDX(designTokens: Record<string, any>): string {
		return `import { Meta } from '@storybook/addon-docs';
import { ColorPalette, ColorItem } from '@storybook/addon-docs';

<Meta title="Design System/Design Tokens" />

# Design Tokens

Design tokens are the visual design atoms of our design system. They provide a single source of truth for colors, typography, spacing, and other design decisions.

## Colors

### Primary Colors
<ColorPalette>
  ${Object.entries(designTokens.colors?.primary || {}).map(([name, value]) => 
    `<ColorItem title="${name}" subtitle="Primary" colors={['${value}']} />`
  ).join('\n  ')}
</ColorPalette>

### Secondary Colors
<ColorPalette>
  ${Object.entries(designTokens.colors?.secondary || {}).map(([name, value]) => 
    `<ColorItem title="${name}" subtitle="Secondary" colors={['${value}']} />`
  ).join('\n  ')}
</ColorPalette>

### Semantic Colors
<ColorPalette>
  ${Object.entries(designTokens.colors?.semantic || {}).map(([name, value]) => 
    `<ColorItem title="${name}" subtitle="Semantic" colors={['${value}']} />`
  ).join('\n  ')}
</ColorPalette>

## Typography

### Font Family
- **Primary**: ${designTokens.typography?.fontFamily?.primary || 'Inter, system-ui, sans-serif'}
- **Secondary**: ${designTokens.typography?.fontFamily?.secondary || 'Inter, system-ui, sans-serif'}
- **Monospace**: ${designTokens.typography?.fontFamily?.monospace || 'Fira Code, monospace'}

### Font Sizes
${Object.entries(designTokens.typography?.fontSize || {}).map(([size, value]) =>
  `- **${size}**: ${value}`
).join('\n')}

## Spacing

Our spacing system uses a consistent scale based on 8px increments:

${Object.entries(designTokens.spacing || {}).map(([size, value]) =>
  `- **${size}**: ${value}`
).join('\n')}

## Border Radius

${Object.entries(designTokens.borderRadius || {}).map(([size, value]) =>
  `- **${size}**: ${value}`
).join('\n')}

## Shadows

${Object.entries(designTokens.shadows || {}).map(([level, value]) =>
  `- **${level}**: ${value}`
).join('\n')}

---

*These tokens ensure consistency across all components and applications.*`;
	}

	private generateAccessibilityGuideMDX(options: StorybookIntegrationOptions): string {
		return `import { Meta } from '@storybook/addon-docs';

<Meta title="Guidelines/Accessibility" />

# Accessibility Guide

This guide outlines our accessibility standards and best practices, ensuring WCAG AAA compliance and Norwegian digital accessibility requirements.

## WCAG AAA Standards

We exceed standard accessibility requirements by implementing WCAG AAA guidelines:

### Color Contrast
- **Text**: Minimum contrast ratio of 7:1 for normal text
- **Large Text**: Minimum contrast ratio of 4.5:1 for large text (18pt+ or 14pt+ bold)
- **UI Components**: Minimum contrast ratio of 3:1 for interactive elements

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators must be clearly visible
- Tab order must be logical and predictable
- Skip links provided for main content areas

### Screen Reader Support
- Semantic HTML elements used appropriately
- ARIA labels and descriptions provided where needed
- Form labels properly associated with inputs
- Status messages announced appropriately

## Norwegian Digital Standards

### UU (Universal Design) Requirements
Our components comply with Norwegian UU regulations:

- **Perceivable**: Information presented in multiple ways
- **Operable**: Interface usable with various input methods
- **Understandable**: Clear language and predictable functionality
- **Robust**: Compatible with assistive technologies

### Language Support
- Primary language declared on all content
- Language changes marked appropriately
- Norwegian terminology used consistently
- Clear, simple language preferred

## Testing Accessibility

### Automated Testing
Use the A11y addon in Storybook to:

1. **Run Accessibility Audits**: Automatically check for common issues
2. **Review Violations**: Address any reported accessibility problems
3. **Monitor Compliance**: Continuously validate accessibility standards

### Manual Testing
Perform manual accessibility testing:

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows)
3. **Color Blindness**: Verify usability without color perception
4. **Magnification**: Test with 200% zoom and screen magnifiers

### Norwegian Testing Tools
Recommended tools for Norwegian accessibility testing:

- **UU-kollen**: Norwegian accessibility checker
- **Kvalitetsmål**: Government accessibility framework
- **NVDA Norwegian**: Screen reader with Norwegian voice pack

## Component Guidelines

### Buttons
- Clear, descriptive labels
- Appropriate ARIA roles and states
- Sufficient size (44x44px minimum)
- Clear focus indicators

### Forms
- Descriptive labels for all inputs
- Error messages clearly associated
- Required fields properly marked
- Validation feedback accessible

### Navigation
- Logical heading structure (h1-h6)
- Breadcrumb navigation where appropriate
- Skip links for main content
- Clear current page indicators

## Norwegian-Specific Considerations

### Language and Culture
- Use "du" form for user-facing text
- Follow Norwegian government style guides
- Respect cultural context and expectations
- Provide Norwegian keyboard shortcuts where applicable

### Legal Requirements
- Comply with Diskriminerings- og tilgjengelighetsloven
- Meet WCAG 2.1 AA minimum requirements (we exceed with AAA)
- Document accessibility features and testing
- Provide accessibility statements where required

## Resources

### Norwegian Resources
- [UU-tilsynet Guidelines](https://www.uutilsynet.no/)
- [Norwegian Design System](https://designsystemet.no/)
- [Digital Standards Norway](https://www.digdir.no/digitale-felleslosninger/digital-standards/1480)

### International Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Resources](https://webaim.org/)

---

*Accessibility is not optional - it's fundamental to inclusive design.*`;
	}

	private generateDevelopmentGuideMDX(options: StorybookIntegrationOptions): string {
		return `import { Meta } from '@storybook/addon-docs';

<Meta title="Guidelines/Component Development" />

# Component Development Guide

This guide provides standards and best practices for developing components in the ${options.projectName} design system.

## Component Structure

### File Organization
\`\`\`
src/components/ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
├── ComponentName.module.css   # Component styles
├── index.ts                   # Exports
└── README.md                  # Component documentation
\`\`\`

### Naming Conventions
- **Components**: PascalCase (\`Button\`, \`InputField\`)
- **Props**: camelCase (\`isDisabled\`, \`onClick\`)
- **CSS Classes**: kebab-case (\`component-name\`, \`component-name--variant\`)
- **Files**: Match component name (\`Button.tsx\`, \`Button.stories.tsx\`)

## TypeScript Standards

### Component Props
Always define readonly interfaces for props:

\`\`\`typescript
interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'destructive';
  readonly size?: 'small' | 'medium' | 'large';
  readonly disabled?: boolean;
  readonly children: React.ReactNode;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick,
  ...props
}: ButtonProps): JSX.Element => {
  // Component implementation
};
\`\`\`

### Return Types
- Always specify \`: JSX.Element\` return type
- Use strict TypeScript configuration
- Avoid \`any\` types completely

## Styling Guidelines

### CSS Modules
Use CSS Modules for component styling:

\`\`\`css
/* Button.module.css */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-primary);
  transition: all 0.2s ease;
}

.button--primary {
  background-color: var(--color-primary-500);
  color: var(--color-white);
}

.button--secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-800);
}
\`\`\`

### Design Tokens
Always use design tokens instead of hardcoded values:

\`\`\`typescript
// ✅ Good
className={styles.button}
style={{ marginTop: 'var(--spacing-lg)' }}

// ❌ Bad
style={{ marginTop: '24px', backgroundColor: '#3b82f6' }}
\`\`\`

## Accessibility Requirements

### ARIA Attributes
Include appropriate ARIA attributes:

\`\`\`typescript
<button
  className={styles.button}
  disabled={disabled}
  aria-label={ariaLabel}
  aria-pressed={isPressed}
  onClick={onClick}
>
  {children}
</button>
\`\`\`

### Keyboard Support
Ensure full keyboard accessibility:

\`\`\`typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick?.(event);
  }
};
\`\`\`

## Storybook Stories

### Story Structure
Create comprehensive stories for each component:

\`\`\`typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A accessible button component with Norwegian compliance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Norwegian: Story = {
  args: {
    children: 'Knapp',
  },
  parameters: {
    locale: 'nb-NO',
  },
};
\`\`\`

### Required Stories
Every component must include:

1. **Default**: Basic usage example
2. **Interactive**: All props controllable
3. **Norwegian**: Localized version
4. **Accessibility**: A11y focused testing
5. **All Variants**: Each variant documented

## Testing Standards

### Unit Tests
Write comprehensive unit tests:

\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible via keyboard', () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

## Norwegian Localization

### Text Content
- Use Norwegian terminology where appropriate
- Follow Norwegian government style guides
- Provide both English and Norwegian examples

### Cultural Considerations
- Use appropriate Norwegian greeting forms
- Respect Norwegian design conventions
- Consider Norwegian accessibility requirements

## Documentation

### Component README
Each component should include:

\`\`\`markdown
# Button Component

A accessible button component with Norwegian enterprise compliance.

## Usage

\\\`\\\`\\\`tsx
import { Button } from '@/components/Button';

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
\\\`\\\`\\\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \\| 'secondary' \\| 'destructive' | 'primary' | Button style variant |
| size | 'small' \\| 'medium' \\| 'large' | 'medium' | Button size |
| disabled | boolean | false | Whether button is disabled |

## Accessibility

- Fully keyboard accessible
- WCAG AAA compliant
- Screen reader friendly
- Norwegian accessibility standards
\`\`\`

## Checklist

Before submitting a component:

- [ ] TypeScript interfaces with readonly props
- [ ] CSS Modules with design tokens
- [ ] Full accessibility implementation
- [ ] Comprehensive Storybook stories
- [ ] Unit tests with >90% coverage
- [ ] Norwegian localization examples
- [ ] Component documentation
- [ ] Accessibility testing completed

---

*Quality components make quality applications.*`;
	}

	// Utility methods

	private getStorybookFramework(framework: string, buildTool: string): string {
		const frameworkMap: Record<string, string> = {
			"react-webpack": "@storybook/react-webpack5",
			"react-vite": "@storybook/react-vite",
			"nextjs": "@storybook/nextjs",
			"vue-webpack": "@storybook/vue3-webpack5",
			"vue-vite": "@storybook/vue3-vite",
			"angular": "@storybook/angular",
			"svelte-webpack": "@storybook/svelte-webpack5",
			"svelte-vite": "@storybook/svelte-vite",
		};

		const key = buildTool === "vite" ? `${framework}-vite` : `${framework}-webpack`;
		return frameworkMap[key] || "@storybook/react-webpack5";
	}

	private getResponsiveViewports() {
		return {
			mobile: {
				name: "Mobile",
				styles: { width: "375px", height: "667px" },
			},
			tablet: {
				name: "Tablet",
				styles: { width: "768px", height: "1024px" },
			},
			desktop: {
				name: "Desktop",
				styles: { width: "1440px", height: "900px" },
			},
		};
	}

	private getNorwegianDeviceViewports() {
		return {
			norwegianMobile: {
				name: "Norwegian Mobile (Common)",
				styles: { width: "414px", height: "896px" },
			},
			norwegianTablet: {
				name: "Norwegian Tablet (Common)",
				styles: { width: "820px", height: "1180px" },
			},
		};
	}

	private getDefaultTheme() {
		return {
			base: "light",
			colorPrimary: "#3b82f6",
			colorSecondary: "#6b7280",
			appBg: "#ffffff",
			appContentBg: "#ffffff",
			appBorderColor: "#e5e7eb",
			textColor: "#1f2937",
			barTextColor: "#4b5563",
			barSelectedColor: "#3b82f6",
			barBg: "#ffffff",
			inputBg: "#ffffff",
			inputBorder: "#d1d5db",
			inputTextColor: "#1f2937",
			inputBorderRadius: 8,
		};
	}

	private generatePackageUpdates(
		options: StorybookIntegrationOptions,
		projectInfo: any
	): { devDependencies: string[] } {
		const devDependencies = [
			"@storybook/react",
			"@storybook/react-vite",
			"@storybook/addon-essentials",
			"@storybook/addon-a11y",
			"@storybook/addon-viewport",
			"@storybook/addon-interactions",
			"@storybook/addon-docs",
			"@storybook/addon-controls",
			"@storybook/addon-actions",
			"@storybook/addon-backgrounds",
			"@storybook/addon-toolbars",
			"@storybook/addon-measure",
			"@storybook/addon-outline",
		];

		if (options.enableChromatic) {
			devDependencies.push("@storybook/addon-chromatic", "chromatic");
		}

		if (options.enableTestRunner) {
			devDependencies.push("@storybook/test-runner", "@storybook/jest");
		}

		if (projectInfo.hasTypeScript) {
			devDependencies.push("@storybook/addon-typescript");
		}

		return { devDependencies };
	}

	private generateNPMScripts(options: StorybookIntegrationOptions): string[] {
		return [
			'Add these scripts to your package.json:',
			'"storybook": "storybook dev -p 6006"',
			'"build-storybook": "storybook build"',
			'"storybook:test": "test-storybook"',
			'"chromatic": "chromatic --project-token=<your-token>"',
		];
	}
}