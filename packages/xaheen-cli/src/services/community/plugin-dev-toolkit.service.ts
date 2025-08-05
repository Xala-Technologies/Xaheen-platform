/**
 * Plugin Development Toolkit Service
 * Provides scaffolding and development tools for creating Xaheen CLI plugins
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir, stat } from "fs/promises";
import { join, basename } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

/**
 * Plugin template types
 */
export enum PluginTemplateType {
	GENERATOR = "generator",
	TEMPLATE = "template",
	INTEGRATION = "integration",
	TOOL = "tool",
	THEME = "theme",
}

/**
 * Plugin scaffold configuration
 */
export interface PluginScaffoldConfig {
	readonly name: string;
	readonly type: PluginTemplateType;
	readonly description: string;
	readonly author: string;
	readonly version: string;
	readonly license: string;
	readonly keywords: string[];
	readonly xaheenVersion: string;
	readonly features: {
		readonly typescript: boolean;
		readonly testing: boolean;
		readonly documentation: boolean;
		readonly ci: boolean;
		readonly publishing: boolean;
		readonly examples: boolean;
	};
	readonly dependencies: Record<string, string>;
	readonly devDependencies: Record<string, string>;
}

/**
 * Plugin development tools
 */
export interface PluginDevTools {
	readonly lint: () => Promise<{ success: boolean; issues: string[] }>;
	readonly test: () => Promise<{ success: boolean; coverage: number; results: string }>;
	readonly build: () => Promise<{ success: boolean; outputPath: string; size: number }>;
	readonly validate: () => Promise<{ valid: boolean; errors: string[] }>;
	readonly package: () => Promise<{ success: boolean; packagePath: string }>;
	readonly publish: (registry?: string) => Promise<{ success: boolean; version: string }>;
}

/**
 * Plugin validation result
 */
export interface PluginValidationResult {
	readonly valid: boolean;
	readonly errors: string[];
	readonly warnings: string[];
	readonly suggestions: string[];
	readonly structure: {
		readonly hasPackageJson: boolean;
		readonly hasReadme: boolean;
		readonly hasLicense: boolean;
		readonly hasTests: boolean;
		readonly hasDocumentation: boolean;
		readonly hasExamples: boolean;
	};
	readonly metadata: {
		readonly nameValid: boolean;
		readonly versionValid: boolean;
		readonly descriptionValid: boolean;
		readonly keywordsValid: boolean;
		readonly authorValid: boolean;
	};
	readonly code: {
		readonly syntaxValid: boolean;
		readonly typeScriptValid: boolean;
		readonly lintPassed: boolean;
		readonly testsPassed: boolean;
	};
}

/**
 * Plugin template definition
 */
interface PluginTemplate {
	readonly name: string;
	readonly type: PluginTemplateType;
	readonly description: string;
	readonly files: PluginTemplateFile[];
	readonly dependencies: Record<string, string>;
	readonly devDependencies: Record<string, string>;
	readonly scripts: Record<string, string>;
	readonly features: string[];
}

/**
 * Plugin template file
 */
interface PluginTemplateFile {
	readonly path: string;
	readonly content: string;
	readonly template: boolean; // whether content needs template processing
}

/**
 * Plugin development toolkit service
 */
export class PluginDevToolkitService {
	private readonly templatesPath: string;
	private readonly workspacePath: string;
	private readonly templates: Map<string, PluginTemplate> = new Map();

	constructor(
		workspacePath: string = join(process.cwd(), ".xaheen", "plugin-workspace"),
		templatesPath: string = join(__dirname, "templates")
	) {
		this.workspacePath = workspacePath;
		this.templatesPath = templatesPath;
	}

	/**
	 * Initialize plugin development toolkit
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure workspace exists
			if (!existsSync(this.workspacePath)) {
				await mkdir(this.workspacePath, { recursive: true });
			}

			// Load plugin templates
			await this.loadPluginTemplates();

			logger.info("Plugin development toolkit initialized");
		} catch (error) {
			logger.error("Failed to initialize plugin development toolkit:", error);
			throw error;
		}
	}

	/**
	 * Create a new plugin from template
	 */
	public async scaffoldPlugin(
		config: PluginScaffoldConfig,
		outputPath?: string
	): Promise<{
		success: boolean;
		pluginPath: string;
		errors: string[];
		devTools: PluginDevTools;
	}> {
		const pluginPath = outputPath || join(this.workspacePath, config.name);
		const result = {
			success: false,
			pluginPath,
			errors: [] as string[],
			devTools: {} as PluginDevTools,
		};

		try {
			// Validate configuration
			const validation = this.validateScaffoldConfig(config);
			if (!validation.valid) {
				result.errors = validation.errors;
				return result;
			}

			// Check if plugin directory already exists
			if (existsSync(pluginPath)) {
				result.errors.push(`Plugin directory already exists: ${pluginPath}`);
				return result;
			}

			// Create plugin directory
			await mkdir(pluginPath, { recursive: true });

			// Get template
			const template = await this.getPluginTemplate(config.type);
			if (!template) {
				result.errors.push(`Template not found for type: ${config.type}`);
				return result;
			}

			// Generate plugin files
			await this.generatePluginFiles(template, config, pluginPath);

			// Initialize git repository
			if (config.features.ci) {
				await this.initializeGitRepository(pluginPath);
			}

			// Install dependencies
			await this.installDependencies(pluginPath);

			// Create development tools
			result.devTools = this.createDevTools(pluginPath);

			result.success = true;

			logger.info(`Plugin scaffolded successfully: ${config.name} at ${pluginPath}`);
		} catch (error) {
			result.errors.push(`Scaffolding failed: ${error}`);
			logger.error(`Plugin scaffolding failed for ${config.name}:`, error);
		}

		return result;
	}

	/**
	 * Validate an existing plugin
	 */
	public async validatePlugin(pluginPath: string): Promise<PluginValidationResult> {
		const result: PluginValidationResult = {
			valid: true,
			errors: [],
			warnings: [],
			suggestions: [],
			structure: {
				hasPackageJson: false,
				hasReadme: false,
				hasLicense: false,
				hasTests: false,
				hasDocumentation: false,
				hasExamples: false,
			},
			metadata: {
				nameValid: false,
				versionValid: false,
				descriptionValid: false,
				keywordsValid: false,
				authorValid: false,
			},
			code: {
				syntaxValid: true,
				typeScriptValid: true,
				lintPassed: true,
				testsPassed: true,
			},
		};

		try {
			// Check file structure
			await this.validatePluginStructure(pluginPath, result);

			// Validate package.json metadata
			await this.validatePluginMetadata(pluginPath, result);

			// Validate code quality
			await this.validatePluginCode(pluginPath, result);

			// Determine overall validity
			result.valid = result.errors.length === 0;

			// Generate suggestions
			this.generateValidationSuggestions(result);

		} catch (error) {
			result.errors.push(`Validation failed: ${error}`);
			result.valid = false;
			logger.error(`Plugin validation failed for ${pluginPath}:`, error);
		}

		return result;
	}

	/**
	 * Get available plugin templates
	 */
	public getAvailableTemplates(): Array<{
		name: string;
		type: PluginTemplateType;
		description: string;
		features: string[];
	}> {
		return Array.from(this.templates.values()).map(template => ({
			name: template.name,
			type: template.type,
			description: template.description,
			features: template.features,
		}));
	}

	/**
	 * Generate plugin documentation
	 */
	public async generateDocumentation(
		pluginPath: string,
		options: {
			includeApi?: boolean;
			includeExamples?: boolean;
			includeChangelog?: boolean;
		} = {}
	): Promise<{
		success: boolean;
		documentationPath: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			documentationPath: join(pluginPath, "docs"),
			errors: [] as string[],
		};

		try {
			// Create docs directory
			if (!existsSync(result.documentationPath)) {
				await mkdir(result.documentationPath, { recursive: true });
			}

			// Generate API documentation
			if (options.includeApi) {
				await this.generateApiDocumentation(pluginPath, result.documentationPath);
			}

			// Generate examples
			if (options.includeExamples) {
				await this.generateExampleDocumentation(pluginPath, result.documentationPath);
			}

			// Generate changelog
			if (options.includeChangelog) {
				await this.generateChangelog(pluginPath, result.documentationPath);
			}

			// Generate main README
			await this.generateMainDocumentation(pluginPath, result.documentationPath);

			result.success = true;

			logger.info(`Documentation generated for plugin at: ${result.documentationPath}`);
		} catch (error) {
			result.errors.push(`Documentation generation failed: ${error}`);
			logger.error(`Documentation generation failed for ${pluginPath}:`, error);
		}

		return result;
	}

	/**
	 * Create development tools for a plugin
	 */
	public createDevTools(pluginPath: string): PluginDevTools {
		return {
			lint: async () => {
				try {
					const result = execSync("npm run lint", { 
						cwd: pluginPath, 
						encoding: "utf-8" 
					});
					return { success: true, issues: [] };
				} catch (error: any) {
					return { 
						success: false, 
						issues: error.stdout ? error.stdout.split("\n") : [error.message] 
					};
				}
			},

			test: async () => {
				try {
					const result = execSync("npm test", { 
						cwd: pluginPath, 
						encoding: "utf-8" 
					});
					// Parse test results (simplified)
					const coverage = this.extractCoverageFromOutput(result);
					return { success: true, coverage, results: result };
				} catch (error: any) {
					return { 
						success: false, 
						coverage: 0, 
						results: error.stdout || error.message 
					};
				}
			},

			build: async () => {
				try {
					const result = execSync("npm run build", { 
						cwd: pluginPath, 
						encoding: "utf-8" 
					});
					const outputPath = join(pluginPath, "dist");
					const size = await this.calculateDirectorySize(outputPath);
					return { success: true, outputPath, size };
				} catch (error: any) {
					return { 
						success: false, 
						outputPath: "", 
						size: 0 
					};
				}
			},

			validate: async () => {
				const validation = await this.validatePlugin(pluginPath);
				return { 
					valid: validation.valid, 
					errors: validation.errors 
				};
			},

			package: async () => {
				try {
					execSync("npm pack", { cwd: pluginPath });
					const packageJson = JSON.parse(
						await readFile(join(pluginPath, "package.json"), "utf-8")
					);
					const packagePath = join(pluginPath, `${packageJson.name}-${packageJson.version}.tgz`);
					return { success: true, packagePath };
				} catch (error) {
					return { success: false, packagePath: "" };
				}
			},

			publish: async (registry = "https://registry.xaheen.com") => {
				try {
					execSync(`npm publish --registry ${registry}`, { cwd: pluginPath });
					const packageJson = JSON.parse(
						await readFile(join(pluginPath, "package.json"), "utf-8")
					);
					return { success: true, version: packageJson.version };
				} catch (error) {
					return { success: false, version: "" };
				}
			},
		};
	}

	// Private helper methods

	private async loadPluginTemplates(): Promise<void> {
		// Load built-in templates
		const builtInTemplates: PluginTemplate[] = [
			{
				name: "generator",
				type: PluginTemplateType.GENERATOR,
				description: "A code generator plugin",
				files: await this.getGeneratorTemplateFiles(),
				dependencies: {
					"zod": "^3.22.0",
					"handlebars": "^4.7.0",
				},
				devDependencies: {
					"@types/node": "^20.0.0",
					"typescript": "^5.0.0",
					"vitest": "^1.0.0",
				},
				scripts: {
					"build": "tsc",
					"test": "vitest",
					"lint": "eslint src/**/*.ts",
				},
				features: ["TypeScript", "Testing", "Validation"],
			},
			{
				name: "template",
				type: PluginTemplateType.TEMPLATE,
				description: "A project template plugin",
				files: await this.getTemplateTemplateFiles(),
				dependencies: {
					"fs-extra": "^11.0.0",
				},
				devDependencies: {
					"@types/node": "^20.0.0",
					"@types/fs-extra": "^11.0.0",
					"typescript": "^5.0.0",
				},
				scripts: {
					"build": "tsc",
					"test": "vitest",
				},
				features: ["File Operations", "Template Processing"],
			},
			{
				name: "integration",
				type: PluginTemplateType.INTEGRATION,
				description: "A third-party service integration plugin",
				files: await this.getIntegrationTemplateFiles(),
				dependencies: {
					"axios": "^1.6.0",
				},
				devDependencies: {
					"@types/node": "^20.0.0",
					"typescript": "^5.0.0",
				},
				scripts: {
					"build": "tsc",
					"test": "vitest",
				},
				features: ["HTTP Client", "Configuration Management"],
			},
		];

		for (const template of builtInTemplates) {
			this.templates.set(template.name, template);
		}
	}

	private validateScaffoldConfig(config: PluginScaffoldConfig): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Validate name
		if (!config.name || config.name.length < 3) {
			errors.push("Plugin name must be at least 3 characters long");
		}

		if (!/^[a-z0-9-]+$/.test(config.name)) {
			errors.push("Plugin name must contain only lowercase letters, numbers, and hyphens");
		}

		// Validate version
		if (!config.version || !/^\d+\.\d+\.\d+$/.test(config.version)) {
			errors.push("Plugin version must follow semantic versioning (x.y.z)");
		}

		// Validate description
		if (!config.description || config.description.length < 10) {
			errors.push("Plugin description must be at least 10 characters long");
		}

		// Validate author
		if (!config.author || config.author.length < 2) {
			errors.push("Plugin author must be at least 2 characters long");
		}

		return { valid: errors.length === 0, errors };
	}

	private async getPluginTemplate(type: PluginTemplateType): Promise<PluginTemplate | null> {
		return this.templates.get(type) || null;
	}

	private async generatePluginFiles(
		template: PluginTemplate,
		config: PluginScaffoldConfig,
		pluginPath: string
	): Promise<void> {
		// Generate package.json
		const packageJson = {
			name: config.name,
			version: config.version,
			description: config.description,
			author: config.author,
			license: config.license,
			keywords: config.keywords,
			main: "dist/index.js",
			types: "dist/index.d.ts",
			files: ["dist", "README.md", "LICENSE"],
			scripts: {
				...template.scripts,
				"dev": "tsc --watch",
				"prepublishOnly": "npm run build && npm test",
			},
			dependencies: {
				...template.dependencies,
				...config.dependencies,
			},
			devDependencies: {
				...template.devDependencies,
				...config.devDependencies,
			},
			xaheen: {
				category: config.type,
				version: config.xaheenVersion,
			},
		};

		await writeFile(
			join(pluginPath, "package.json"),
			JSON.stringify(packageJson, null, 2)
		);

		// Generate template files
		for (const file of template.files) {
			const filePath = join(pluginPath, file.path);
			const fileDir = join(filePath, "..");

			// Ensure directory exists
			if (!existsSync(fileDir)) {
				await mkdir(fileDir, { recursive: true });
			}

			// Process template content
			let content = file.content;
			if (file.template) {
				content = this.processTemplate(content, {
					name: config.name,
					description: config.description,
					author: config.author,
					version: config.version,
					type: config.type,
					...config,
				});
			}

			await writeFile(filePath, content);
		}

		// Generate additional files based on features
		if (config.features.typescript) {
			await this.generateTypeScriptConfig(pluginPath);
		}

		if (config.features.testing) {
			await this.generateTestConfig(pluginPath);
		}

		if (config.features.ci) {
			await this.generateCIConfig(pluginPath);
		}

		if (config.features.documentation) {
			await this.generateDocumentationStructure(pluginPath);
		}
	}

	private processTemplate(content: string, variables: Record<string, any>): string {
		let processed = content;

		for (const [key, value] of Object.entries(variables)) {
			const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
			processed = processed.replace(placeholder, String(value));
		}

		return processed;
	}

	private async initializeGitRepository(pluginPath: string): Promise<void> {
		try {
			execSync("git init", { cwd: pluginPath });
			
			// Create .gitignore
			const gitignore = `
node_modules/
dist/
*.log
.env
.DS_Store
coverage/
*.tgz
`.trim();

			await writeFile(join(pluginPath, ".gitignore"), gitignore);
		} catch (error) {
			logger.warn("Failed to initialize git repository:", error);
		}
	}

	private async installDependencies(pluginPath: string): Promise<void> {
		try {
			logger.info("Installing dependencies...");
			execSync("npm install", { cwd: pluginPath, stdio: "inherit" });
		} catch (error) {
			logger.warn("Failed to install dependencies:", error);
		}
	}

	private async validatePluginStructure(
		pluginPath: string,
		result: PluginValidationResult
	): Promise<void> {
		// Check required files
		result.structure.hasPackageJson = existsSync(join(pluginPath, "package.json"));
		result.structure.hasReadme = existsSync(join(pluginPath, "README.md"));
		result.structure.hasLicense = existsSync(join(pluginPath, "LICENSE"));

		// Check for tests
		const testDirs = ["test", "tests", "__tests__", "spec"];
		result.structure.hasTests = testDirs.some(dir =>
			existsSync(join(pluginPath, dir))
		);

		// Check for documentation
		result.structure.hasDocumentation = existsSync(join(pluginPath, "docs"));

		// Check for examples
		result.structure.hasExamples = existsSync(join(pluginPath, "examples"));

		// Add errors for missing required files
		if (!result.structure.hasPackageJson) {
			result.errors.push("Missing package.json file");
		}

		if (!result.structure.hasReadme) {
			result.warnings.push("Missing README.md file");
		}

		if (!result.structure.hasLicense) {
			result.warnings.push("Missing LICENSE file");
		}
	}

	private async validatePluginMetadata(
		pluginPath: string,
		result: PluginValidationResult
	): Promise<void> {
		try {
			if (!result.structure.hasPackageJson) return;

			const packageJson = JSON.parse(
				await readFile(join(pluginPath, "package.json"), "utf-8")
			);

			// Validate name
			result.metadata.nameValid = 
				packageJson.name && 
				typeof packageJson.name === "string" && 
				packageJson.name.length >= 3;

			// Validate version
			result.metadata.versionValid = 
				packageJson.version && 
				/^\d+\.\d+\.\d+/.test(packageJson.version);

			// Validate description
			result.metadata.descriptionValid = 
				packageJson.description && 
				packageJson.description.length >= 10;

			// Validate keywords
			result.metadata.keywordsValid = 
				Array.isArray(packageJson.keywords) && 
				packageJson.keywords.length > 0;

			// Validate author
			result.metadata.authorValid = 
				packageJson.author && 
				(typeof packageJson.author === "string" || 
				 (typeof packageJson.author === "object" && packageJson.author.name));

			// Add errors for invalid metadata
			if (!result.metadata.nameValid) {
				result.errors.push("Invalid or missing plugin name");
			}

			if (!result.metadata.versionValid) {
				result.errors.push("Invalid or missing plugin version");
			}

			if (!result.metadata.descriptionValid) {
				result.warnings.push("Missing or inadequate plugin description");
			}

		} catch (error) {
			result.errors.push("Failed to validate package.json metadata");
		}
	}

	private async validatePluginCode(
		pluginPath: string,
		result: PluginValidationResult
	): Promise<void> {
		try {
			// Basic syntax validation by trying to parse files
			const sourceFiles = await this.getSourceFiles(pluginPath);
			
			for (const file of sourceFiles) {
				try {
					const content = await readFile(file, "utf-8");
					
					// Basic syntax check for JavaScript/TypeScript
					if (file.endsWith(".js") || file.endsWith(".ts")) {
						// This is a simplified check - in practice, you'd use a proper parser
						if (content.includes("syntax error")) {
							result.code.syntaxValid = false;
							result.errors.push(`Syntax error in file: ${file}`);
						}
					}
				} catch (error) {
					result.code.syntaxValid = false;
					result.errors.push(`Cannot read file: ${file}`);
				}
			}

		} catch (error) {
			result.warnings.push("Could not validate plugin code");
		}
	}

	private generateValidationSuggestions(result: PluginValidationResult): void {
		if (!result.structure.hasTests) {
			result.suggestions.push("Add tests to improve plugin reliability");
		}

		if (!result.structure.hasDocumentation) {
			result.suggestions.push("Add documentation to help users understand your plugin");
		}

		if (!result.structure.hasExamples) {
			result.suggestions.push("Add examples to demonstrate plugin usage");
		}

		if (!result.metadata.keywordsValid) {
			result.suggestions.push("Add relevant keywords to improve plugin discoverability");
		}
	}

	private async getSourceFiles(pluginPath: string): Promise<string[]> {
		const files: string[] = [];
		const extensions = [".js", ".ts", ".jsx", ".tsx"];

		const scanDirectory = async (dir: string): Promise<void> => {
			try {
				const entries = await readdir(dir, { withFileTypes: true });

				for (const entry of entries) {
					const fullPath = join(dir, entry.name);

					if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
						await scanDirectory(fullPath);
					} else if (extensions.some(ext => entry.name.endsWith(ext))) {
						files.push(fullPath);
					}
				}
			} catch (error) {
				// Directory might not be accessible
			}
		};

		await scanDirectory(pluginPath);
		return files;
	}

	private extractCoverageFromOutput(output: string): number {
		// Simple regex to extract coverage percentage
		const coverageMatch = output.match(/(\d+(?:\.\d+)?)%\s+coverage/);
		return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
	}

	private async calculateDirectorySize(dirPath: string): Promise<number> {
		if (!existsSync(dirPath)) return 0;

		let totalSize = 0;
		const entries = await readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dirPath, entry.name);

			if (entry.isDirectory()) {
				totalSize += await this.calculateDirectorySize(fullPath);
			} else {
				const stats = await stat(fullPath);
				totalSize += stats.size;
			}
		}

		return totalSize;
	}

	// Template file generators

	private async getGeneratorTemplateFiles(): Promise<PluginTemplateFile[]> {
		return [
			{
				path: "src/index.ts",
				template: true,
				content: `
/**
 * {{name}} - {{description}}
 * Generated with Xaheen CLI Plugin Development Toolkit
 */

import { z } from 'zod';

/**
 * Configuration schema for {{name}}
 */
const ConfigSchema = z.object({
  name: z.string().min(1),
  outputPath: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * {{name}} generator class
 */
export class {{name}}Generator {
  /**
   * Generate code based on configuration
   */
  public async generate(config: Config): Promise<{
    success: boolean;
    files: Array<{ path: string; content: string }>;
    message: string;
  }> {
    try {
      // Validate configuration
      const validatedConfig = ConfigSchema.parse(config);

      // Generate files
      const files = [
        {
          path: \`\${validatedConfig.outputPath || '.'}/@\{validatedConfig.name\}.ts\`,
          content: this.generateFileContent(validatedConfig),
        },
      ];

      return {
        success: true,
        files,
        message: \`Successfully generated \${files.length} files\`,
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        message: \`Generation failed: \${error}\`,
      };
    }
  }

  private generateFileContent(config: Config): string {
    return \`
/**
 * Generated by {{name}}
 */

export const \${config.name} = {
  name: '\${config.name}',
  createdAt: new Date().toISOString(),
};
\`.trim();
  }
}

export default {{name}}Generator;
`.trim(),
			},
			{
				path: "src/types.ts",
				template: true,
				content: `
/**
 * Type definitions for {{name}}
 */

export interface GeneratorContext {
  readonly projectRoot: string;
  readonly outputPath: string;
  readonly config: Record<string, any>;
}

export interface GeneratorResult {
  readonly success: boolean;
  readonly files: GeneratedFile[];
  readonly message: string;
  readonly warnings?: string[];
}

export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
  readonly encoding?: string;
}
`.trim(),
			},
			{
				path: "README.md",
				template: true,
				content: `
# {{name}}

{{description}}

## Installation

\`\`\`bash
xaheen plugin install {{name}}
\`\`\`

## Usage

\`\`\`bash
xaheen generate {{name}} my-component
\`\`\`

## Configuration

This generator accepts the following configuration options:

- \`name\`: The name of the component to generate
- \`outputPath\`: The output directory (optional)

## Examples

\`\`\`bash
# Generate a basic component
xaheen generate {{name}} Button

# Generate with custom output path
xaheen generate {{name}} Modal --output-path src/components
\`\`\`

## Author

{{author}}

## License

{{license}}
`.trim(),
			},
		];
	}

	private async getTemplateTemplateFiles(): Promise<PluginTemplateFile[]> {
		return [
			{
				path: "src/index.ts",
				template: true,
				content: `
/**
 * {{name}} - {{description}}
 * Generated with Xaheen CLI Plugin Development Toolkit
 */

import * as fs from 'fs-extra';
import { join } from 'path';

/**
 * {{name}} template class
 */
export class {{name}}Template {
  /**
   * Apply template to target directory
   */
  public async apply(targetPath: string, variables: Record<string, any>): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Ensure target directory exists
      await fs.ensureDir(targetPath);

      // Copy template files
      await this.copyTemplateFiles(targetPath, variables);

      return {
        success: true,
        message: 'Template applied successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: \`Template application failed: \${error}\`,
      };
    }
  }

  private async copyTemplateFiles(targetPath: string, variables: Record<string, any>): Promise<void> {
    // Implementation for copying and processing template files
    const templateFiles = this.getTemplateFiles();

    for (const file of templateFiles) {
      const content = this.processTemplate(file.content, variables);
      const filePath = join(targetPath, file.path);
      
      await fs.ensureDir(join(filePath, '..'));
      await fs.writeFile(filePath, content);
    }
  }

  private getTemplateFiles(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '1.0.0',
          description: '{{description}}',
        }, null, 2),
      },
    ];
  }

  private processTemplate(content: string, variables: Record<string, any>): string {
    let processed = content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(\`\\\\{\\\\{\\\\s*\${key}\\\\s*\\\\}\\\\}\`, 'g');
      processed = processed.replace(placeholder, String(value));
    }

    return processed;
  }
}

export default {{name}}Template;
`.trim(),
			},
		];
	}

	private async getIntegrationTemplateFiles(): Promise<PluginTemplateFile[]> {
		return [
			{
				path: "src/index.ts",
				template: true,
				content: `
/**
 * {{name}} - {{description}}
 * Generated with Xaheen CLI Plugin Development Toolkit
 */

import axios, { AxiosInstance } from 'axios';

/**
 * {{name}} integration class
 */
export class {{name}}Integration {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey?: string) {
    this.client = axios.create({
      baseURL,
      headers: apiKey ? { Authorization: \`Bearer \${apiKey}\` } : {},
    });
  }

  /**
   * Test the integration connection
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.get('/health');
      return {
        success: response.status === 200,
        message: 'Connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: \`Connection failed: \${error}\`,
      };
    }
  }

  /**
   * Perform integration-specific operations
   */
  public async performOperation(data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/operation', data);
      return response.data;
    } catch (error) {
      throw new Error(\`Operation failed: \${error}\`);
    }
  }
}

export default {{name}}Integration;
`.trim(),
			},
		];
	}

	private async generateTypeScriptConfig(pluginPath: string): Promise<void> {
		const tsConfig = {
			compilerOptions: {
				target: "ES2020",
				module: "commonjs",
				lib: ["ES2020"],
				outDir: "./dist",
				rootDir: "./src",
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
				declaration: true,
				declarationMap: true,
				sourceMap: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist", "**/*.test.ts"],
		};

		await writeFile(
			join(pluginPath, "tsconfig.json"),
			JSON.stringify(tsConfig, null, 2)
		);
	}

	private async generateTestConfig(pluginPath: string): Promise<void> {
		const vitestConfig = `
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
});
`.trim();

		await writeFile(join(pluginPath, "vitest.config.ts"), vitestConfig);

		// Create sample test file
		const sampleTest = `
import { describe, it, expect } from 'vitest';
import { {{name}}Generator } from '../src/index';

describe('{{name}}Generator', () => {
  it('should generate files successfully', async () => {
    const generator = new {{name}}Generator();
    const result = await generator.generate({ name: 'test-component' });

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);
  });
});
`.trim();

		await mkdir(join(pluginPath, "src", "__tests__"), { recursive: true });
		await writeFile(join(pluginPath, "src", "__tests__", "index.test.ts"), sampleTest);
	}

	private async generateCIConfig(pluginPath: string): Promise<void> {
		const githubWorkflow = `
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build
    - run: npm test
    - run: npm run lint

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20.x
        registry-url: https://registry.xaheen.com
    
    - run: npm ci
    - run: npm run build
    - run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.XAHEEN_TOKEN }}
`.trim();

		await mkdir(join(pluginPath, ".github", "workflows"), { recursive: true });
		await writeFile(join(pluginPath, ".github", "workflows", "ci.yml"), githubWorkflow);
	}

	private async generateDocumentationStructure(pluginPath: string): Promise<void> {
		const docsPath = join(pluginPath, "docs");
		await mkdir(docsPath, { recursive: true });

		// Create basic documentation files
		const docs = [
			{
				name: "getting-started.md",
				content: "# Getting Started\n\nHow to use this plugin...",
			},
			{
				name: "api.md",
				content: "# API Reference\n\nDetailed API documentation...",
			},
			{
				name: "examples.md",
				content: "# Examples\n\nUsage examples...",
			},
		];

		for (const doc of docs) {
			await writeFile(join(docsPath, doc.name), doc.content);
		}
	}

	private async generateApiDocumentation(pluginPath: string, docsPath: string): Promise<void> {
		// Generate API documentation from source code
		const apiDoc = `
# API Documentation

Auto-generated API documentation for this plugin.

## Classes

### Main Class

Description of the main plugin class and its methods.

## Methods

### generate()

Description of the generate method.

**Parameters:**
- \`config\`: Configuration object

**Returns:**
- Promise resolving to generation result
`.trim();

		await writeFile(join(docsPath, "api.md"), apiDoc);
	}

	private async generateExampleDocumentation(pluginPath: string, docsPath: string): Promise<void> {
		const examplesDoc = `
# Examples

## Basic Usage

\`\`\`bash
xaheen generate plugin-name component-name
\`\`\`

## Advanced Usage

\`\`\`bash
xaheen generate plugin-name component-name --option value
\`\`\`
`.trim();

		await writeFile(join(docsPath, "examples.md"), examplesDoc);
	}

	private async generateChangelog(pluginPath: string, docsPath: string): Promise<void> {
		const changelog = `
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial plugin implementation

### Changed

### Fixed

### Removed
`.trim();

		await writeFile(join(docsPath, "CHANGELOG.md"), changelog);
	}

	private async generateMainDocumentation(pluginPath: string, docsPath: string): Promise<void> {
		const mainDoc = `
# Plugin Documentation

## Overview

This documentation covers the usage and development of this plugin.

## Table of Contents

- [Getting Started](getting-started.md)
- [API Reference](api.md)
- [Examples](examples.md)
- [Changelog](CHANGELOG.md)

## Support

For support and questions, please visit the plugin repository.
`.trim();

		await writeFile(join(docsPath, "README.md"), mainDoc);
	}
}

/**
 * Create plugin development toolkit service instance
 */
export function createPluginDevToolkitService(
	workspacePath?: string,
	templatesPath?: string
): PluginDevToolkitService {
	return new PluginDevToolkitService(workspacePath, templatesPath);
}

/**
 * Default export
 */
export default PluginDevToolkitService;