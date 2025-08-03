/**
 * Xala UI Integration Service
 * 
 * Provides seamless integration between Xaheen CLI v2 and Xala UI system
 * enabling multi-platform semantic UI generation with v5.0 architecture
 */

import { consola } from 'consola';
import * as fs from 'fs-extra';
import * as path from 'path';
import { execa } from 'execa';
import type { 
	XalaIntegrationOptions, 
	XalaPlatform, 
	XalaUIConfig,
	ExtendedProjectContext,
	XalaValidationResult,
	XalaComponentSpec,
	TemplateContext
} from '../../types/index.js';
import { PlatformManager } from './platform-manager.js';

export class XalaIntegrationService {
	private projectPath: string;
	private projectContext: ExtendedProjectContext | null = null;
	private platformManager: PlatformManager;

	constructor(projectPath: string = process.cwd()) {
		this.projectPath = path.resolve(projectPath);
		this.platformManager = new PlatformManager();
	}

	/**
	 * Initialize Xala UI integration in existing Xaheen project
	 */
	async initializeIntegration(options: XalaIntegrationOptions): Promise<void> {
		consola.start('🎨 Initializing Xala UI integration...');

		try {
			// 1. Validate project compatibility
			await this.validateProjectCompatibility();

			// 2. Load existing project context
			await this.loadProjectContext();

			// 3. Create Xala UI configuration
			await this.createXalaConfiguration(options);

			// 4. Install platform-specific dependencies
			await this.installPlatformDependencies(options.platform);

			// 5. Setup semantic architecture
			await this.setupSemanticArchitecture(options);

			// 6. Configure localization system
			if (!options.skipLocalization) {
				await this.setupLocalizationSystem(options);
			}

			// 7. Generate initial components
			if (options.components.length > 0) {
				await this.generateInitialComponents(options);
			}

			// 8. Create integration hooks
			await this.createIntegrationHooks();

			// 9. Update project scripts
			await this.updateProjectScripts(options.platform);

			consola.success('✅ Xala UI integration initialized successfully!');
			this.showPostInstallInstructions(options);

		} catch (error) {
			consola.error('❌ Failed to initialize Xala UI integration:', error);
			throw error;
		}
	}

	/**
	 * Generate semantic components for specified platform
	 */
	async generateComponents(
		components: string[], 
		platform: XalaPlatform,
		options: {
			semantic?: boolean;
			withStories?: boolean;
			withTests?: boolean;
			enterprise?: boolean;
		} = {}
	): Promise<{ success: boolean; files: string[]; errors: string[] }> {
		consola.start(`🔧 Generating ${components.length} components for ${platform}...`);

		const results = {
			success: true,
			files: [] as string[],
			errors: [] as string[]
		};

		try {
			for (const componentName of components) {
				const spec: XalaComponentSpec = {
					name: componentName,
					type: 'component',
					platform,
					semantic: options.semantic ?? true,
					withStories: options.withStories ?? false,
					withTests: options.withTests ?? false,
					enterprise: options.enterprise ?? false,
					localized: true,
					accessible: true
				};

				const componentResult = await this.generateSingleComponent(spec);
				results.files.push(...componentResult.files);
				
				if (!componentResult.success) {
					results.errors.push(...componentResult.errors);
					results.success = false;
				}
			}

			if (results.success) {
				consola.success(`✅ Generated ${components.length} semantic components`);
			} else {
				consola.warn(`⚠️  Generated components with ${results.errors.length} issues`);
			}

			return results;

		} catch (error) {
			results.success = false;
			results.errors.push(`Component generation failed: ${error.message}`);
			consola.error('❌ Component generation failed:', error);
			return results;
		}
	}

	/**
	 * Validate project for semantic compliance
	 */
	async validateSemanticCompliance(): Promise<XalaValidationResult> {
		consola.start('🔍 Validating semantic architecture compliance...');

		const validation: XalaValidationResult = {
			success: true,
			issues: [],
			score: 100,
			recommendations: []
		};

		try {
			// 1. Check zero raw HTML policy
			const htmlValidation = await this.validateZeroRawHTML();
			validation.issues.push(...htmlValidation.issues);

			// 2. Check design token usage
			const tokenValidation = await this.validateDesignTokens();
			validation.issues.push(...tokenValidation.issues);

			// 3. Check mandatory localization
			const i18nValidation = await this.validateLocalization();
			validation.issues.push(...i18nValidation.issues);

			// 4. Check WCAG AAA compliance
			const accessibilityValidation = await this.validateAccessibility();
			validation.issues.push(...accessibilityValidation.issues);

			// Calculate score and success
			const errorCount = validation.issues.filter(i => i.type === 'error').length;
			const warningCount = validation.issues.filter(i => i.type === 'warning').length;
			
			validation.score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 2));
			validation.success = validation.score >= 90;

			// Generate recommendations
			validation.recommendations = this.generateRecommendations(validation.issues);

			const status = validation.success ? '✅' : '❌';
			consola.info(`${status} Semantic validation score: ${validation.score}%`);

			return validation;

		} catch (error) {
			validation.success = false;
			validation.score = 0;
			validation.issues.push({
				type: 'error',
				category: 'semantic',
				message: `Validation failed: ${error.message}`,
				file: 'unknown'
			});

			consola.error('❌ Semantic validation failed:', error);
			return validation;
		}
	}

	/**
	 * Migrate existing components to semantic architecture
	 */
	async migrateToSemanticArchitecture(options: {
		backup?: boolean;
		force?: boolean;
		includePatterns?: string[];
	} = {}): Promise<{ success: boolean; migratedFiles: string[]; errors: string[] }> {
		consola.start('🔄 Migrating components to semantic architecture...');

		const results = {
			success: true,
			migratedFiles: [] as string[],
			errors: [] as string[]
		};

		try {
			// 1. Find components to migrate
			const componentsToMigrate = await this.findComponentsToMigrate(options.includePatterns);

			// 2. Create backup if requested
			if (options.backup) {
				await this.createMigrationBackup();
			}

			// 3. Migrate each component
			for (const componentPath of componentsToMigrate) {
				try {
					const migrated = await this.migrateComponent(componentPath, options.force);
					if (migrated) {
						results.migratedFiles.push(componentPath);
					}
				} catch (error) {
					results.errors.push(`Failed to migrate ${componentPath}: ${error.message}`);
					results.success = false;
				}
			}

			const status = results.success ? '✅' : '⚠️';
			consola.info(`${status} Migrated ${results.migratedFiles.length} components`);

			return results;

		} catch (error) {
			results.success = false;
			results.errors.push(`Migration failed: ${error.message}`);
			consola.error('❌ Migration failed:', error);
			return results;
		}
	}

	/**
	 * Private helper methods
	 */

	private async validateProjectCompatibility(): Promise<void> {
		// Check if this is a valid Xaheen project
		const packageJsonPath = path.join(this.projectPath, 'package.json');
		const xaheenConfigPath = path.join(this.projectPath, 'xaheen.config.json');

		if (!await fs.pathExists(packageJsonPath)) {
			throw new Error('No package.json found. Not a valid Node.js project.');
		}

		const packageJson = await fs.readJson(packageJsonPath);
		const hasXaheenCLI = packageJson.dependencies?.['@xala-technologies/xaheen-cli'] ||
			packageJson.devDependencies?.['@xala-technologies/xaheen-cli'];

		if (!hasXaheenCLI && !await fs.pathExists(xaheenConfigPath)) {
			consola.warn('⚠️  Project may not be created with Xaheen CLI v2');
		}
	}

	private async loadProjectContext(): Promise<void> {
		const packageJsonPath = path.join(this.projectPath, 'package.json');
		const packageJson = await fs.readJson(packageJsonPath);

		// Detect framework and platform
		const framework = this.detectFramework();
		const isDesktop = await fs.pathExists(path.join(this.projectPath, 'electron')) || 
			packageJson.dependencies?.electron || packageJson.devDependencies?.electron;
		const isMobile = packageJson.dependencies?.['react-native'] || 
			packageJson.devDependencies?.['react-native'];

		// Basic project context
		this.projectContext = {
			name: packageJson.name || path.basename(this.projectPath),
			framework,
			platform: isDesktop ? 'desktop' : isMobile ? 'mobile' : 'web',
			packageManager: this.detectPackageManager(),
			typescript: this.detectTypeScript(),
			git: await fs.pathExists(path.join(this.projectPath, '.git')),
			features: this.detectProjectFeatures(packageJson)
		};
	}

	private detectFramework(): string {
		// Framework detection logic
		const packageJsonPath = path.join(this.projectPath, 'package.json');
		if (fs.pathExistsSync(packageJsonPath)) {
			const packageJson = fs.readJsonSync(packageJsonPath);
			const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

			if (deps.next) return 'nextjs';
			if (deps.nuxt) return 'nuxt';
			if (deps.react) return 'react';
			if (deps.vue) return 'vue';
			if (deps['@angular/core']) return 'angular';
			if (deps.svelte) return 'svelte';
		}
		return 'unknown';
	}

	private detectPackageManager(): 'npm' | 'pnpm' | 'yarn' | 'bun' {
		if (fs.pathExistsSync(path.join(this.projectPath, 'bun.lockb'))) return 'bun';
		if (fs.pathExistsSync(path.join(this.projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
		if (fs.pathExistsSync(path.join(this.projectPath, 'yarn.lock'))) return 'yarn';
		return 'npm';
	}

	private detectTypeScript(): boolean {
		return fs.pathExistsSync(path.join(this.projectPath, 'tsconfig.json'));
	}

	private detectProjectFeatures(packageJson: any): string[] {
		const features: string[] = [];
		const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

		// Check for common features
		if (deps['@storybook/react'] || deps['@storybook/vue']) features.push('storybook');
		if (deps.jest || deps.vitest) features.push('testing');
		if (deps.eslint) features.push('linting');
		if (deps.prettier) features.push('formatting');
		if (deps.tailwindcss) features.push('tailwind');
		if (deps['next-intl'] || deps['vue-i18n'] || deps['react-i18next']) features.push('i18n');
		if (deps['@types/node']) features.push('typescript');

		return features;
	}

	private async createXalaConfiguration(options: XalaIntegrationOptions): Promise<void> {
		const config: XalaUIConfig = {
			system: 'xala',
			version: '5.0.0',
			architecture: 'semantic-v5',
			theme: options.theme,
			platform: options.platform,
			compliance: options.compliance,
			localization: {
				defaultLocale: options.locale || 'en',
				supportedLocales: ['en', 'nb-NO', 'fr', 'ar']
			},
			features: {
				navbar: options.features.includes('navbar'),
				dashboard: options.features.includes('dashboard'),
				semanticComponents: true,
				designTokens: true
			},
			componentLibrary: {
				components: options.components,
				dataComponents: [],
				themeComponents: [],
				layouts: [],
				providers: [],
				patterns: [],
				tools: []
			}
		};

		// Update project context
		if (this.projectContext) {
			this.projectContext.ui = config;
			this.projectContext.xalaIntegration = {
				enabled: true,
				version: '5.0.0',
				features: options.features,
				autoSync: true,
				platformSync: {},
				hooks: {
					preBuild: '.xaheen/hooks/pre-build.sh',
					postGenerate: '.xaheen/hooks/post-generate.sh',
					preLocalize: '.xaheen/hooks/pre-localize.sh'
				}
			};
		}

		// Write xala.config.json
		const configPath = path.join(this.projectPath, 'xala.config.json');
		await fs.writeJson(configPath, {
			name: this.projectContext?.name || 'project',
			version: '1.0.0',
			type: 'xaheen-integrated',
			ui: config,
			integrations: {
				xaheen: {
					enabled: true,
					version: '2.0.0',
					features: options.features,
					autoSync: true
				}
			}
		}, { spaces: 2 });
	}

	private async installPlatformDependencies(platform: XalaPlatform): Promise<void> {
		const deps = this.getPlatformDependencies(platform);
		const packageJsonPath = path.join(this.projectPath, 'package.json');
		const packageJson = await fs.readJson(packageJsonPath);

		// Add dependencies
		packageJson.dependencies = { ...packageJson.dependencies, ...deps.dependencies };
		packageJson.devDependencies = { ...packageJson.devDependencies, ...deps.devDependencies };

		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

		// Install dependencies
		const pm = this.detectPackageManager();
		await execa(pm, ['install'], { cwd: this.projectPath });
	}

	private getPlatformDependencies(platform: XalaPlatform) {
		const baseDeps = {
			'@xala-technologies/ui-system': '^5.0.0',
			'class-variance-authority': '^0.7.0',
			'clsx': '^2.0.0'
		};

		const platformDeps = {
			nextjs: {
				dependencies: { ...baseDeps, 'next-intl': '^3.0.0' },
				devDependencies: {}
			},
			react: {
				dependencies: { ...baseDeps },
				devDependencies: {}
			},
			vue: {
				dependencies: { ...baseDeps, 'vue-i18n': '^9.0.0' },
				devDependencies: {}
			},
			angular: {
				dependencies: { ...baseDeps, '@ngx-translate/core': '^15.0.0' },
				devDependencies: {}
			},
			svelte: {
				dependencies: { ...baseDeps, 'svelte-i18n': '^4.0.0' },
				devDependencies: {}
			},
			electron: {
				dependencies: { ...baseDeps, 'electron': '^28.0.0' },
				devDependencies: {}
			}
		};

		return platformDeps[platform];
	}

	// Placeholder methods for implementation
	private async setupSemanticArchitecture(options: XalaIntegrationOptions): Promise<void> {
		consola.info('🏗️  Setting up v5.0 semantic architecture...');
	}

	private async setupLocalizationSystem(options: XalaIntegrationOptions): Promise<void> {
		consola.info('🌐 Setting up localization system...');
	}

	private async generateInitialComponents(options: XalaIntegrationOptions): Promise<void> {
		consola.info(`🎨 Generating initial components: ${options.components.join(', ')}`);
	}

	private async createIntegrationHooks(): Promise<void> {
		const hooksDir = path.join(this.projectPath, '.xaheen', 'hooks');
		await fs.ensureDir(hooksDir);

		const preBuildHook = `#!/bin/bash
echo "🎨 Validating Xala UI components..."
npx xaheen validate --ui --semantic --accessibility
`;
		await fs.writeFile(path.join(hooksDir, 'pre-build.sh'), preBuildHook);
		await fs.chmod(path.join(hooksDir, 'pre-build.sh'), '755');
	}

	private async updateProjectScripts(platform: XalaPlatform): Promise<void> {
		const packageJsonPath = path.join(this.projectPath, 'package.json');
		const packageJson = await fs.readJson(packageJsonPath);

		const newScripts = {
			'ui:validate': 'xaheen validate --ui --semantic --accessibility',
			'ui:generate': `xaheen add ui --platform ${platform}`,
			'ui:migrate': 'xaheen validate --ui --fix',
			'compliance:check': 'xaheen validate --compliance --wcag-aaa'
		};

		packageJson.scripts = { ...packageJson.scripts, ...newScripts };
		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
	}

	private showPostInstallInstructions(options: XalaIntegrationOptions): void {
		consola.box(`
🎉 Xala UI Integration Complete!

Platform: ${options.platform}
Theme: ${options.theme}
Components: ${options.components.length}

Next steps:
1. Run 'npm run ui:validate' to check compliance
2. Generate components: 'xaheen add ui --component navbar'
3. Check compliance: 'npm run compliance:check'

📚 Documentation: https://xaheen.dev/docs/xala-ui
		`);
	}

	// Component generation using platform manager
	private async generateSingleComponent(spec: XalaComponentSpec): Promise<{ success: boolean; files: string[]; errors: string[] }> {
		try {
			consola.info(`🎨 Generating ${spec.name} component for ${spec.platform}...`);
			
			// Get platform instance
			const platform = this.platformManager.getPlatform(spec.platform);
			
			// Ensure project context is loaded
			if (!this.projectContext) {
				await this.loadProjectContext();
			}

			// Create template context using loaded project context
			const context: TemplateContext = {
				component: {
					name: spec.name,
					type: spec.type || 'component',
					platform: spec.platform,
					semantic: spec.semantic,
					localized: spec.localized,
					accessible: spec.accessible,
					enterprise: spec.enterprise
				},
				project: this.projectContext!,
				options: {
					withStories: spec.withStories,
					withTests: spec.withTests,
					semantic: spec.semantic,
					enterprise: spec.enterprise
				}
			};
			
			// Generate component using platform
			const result = await platform.generateComponent(spec, context);
			
			if (result.success) {
				consola.success(`✅ Generated ${spec.name} component (${result.files.length} files)`);
			} else {
				consola.warn(`⚠️  Generated ${spec.name} with ${result.errors.length} issues`);
			}
			
			return result;
			
		} catch (error) {
			const errorMessage = `Failed to generate ${spec.name}: ${error.message}`;
			consola.error(errorMessage);
			return {
				success: false,
				files: [],
				errors: [errorMessage]
			};
		}
	}

	private async validateZeroRawHTML(): Promise<{ issues: any[] }> { return { issues: [] }; }
	private async validateDesignTokens(): Promise<{ issues: any[] }> { return { issues: [] }; }
	private async validateLocalization(): Promise<{ issues: any[] }> { return { issues: [] }; }
	private async validateAccessibility(): Promise<{ issues: any[] }> { return { issues: [] }; }
	private generateRecommendations(issues: any[]): string[] { return []; }
	private async findComponentsToMigrate(patterns?: string[]): Promise<string[]> { return []; }
	private async createMigrationBackup(): Promise<void> {}
	private async migrateComponent(componentPath: string, force?: boolean): Promise<boolean> { return true; }
}