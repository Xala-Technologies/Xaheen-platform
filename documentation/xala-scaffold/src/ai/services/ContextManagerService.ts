/**
 * Context Manager Service Implementation
 *
 * Tracks and manages project context, user preferences, and generation history.
 * Follows SOLID principles and Norwegian compliance requirements.
 *
 * Features:
 * - Project analysis and context tracking
 * - User preference management
 * - Generation history and learning
 * - Adaptation insights
 * - Norwegian compliance context
 */

import { EventEmitter } from "events";
import { promises as fs } from "fs";
import path from "path";
import {
	IConfigurationService,
	IFileSystemService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { LocaleCode, NorwegianCompliance } from "../../types/compliance.js";
import {
	IAdaptationInsights,
	ICodeStylePreferences,
	IContextManagerService,
	IGenerationHistoryEntry,
	IGenerationPreferences,
	IModelPerformanceInsight,
	IProjectContext,
	IProjectMetrics,
	IProjectStructure,
	IUserFeedback,
	IUserPreferences,
} from "../interfaces.js";

/**
 * Project analysis result
 */
interface IProjectAnalysisResult {
	projectType: "nextjs" | "react" | "nestjs" | "library";
	framework: string;
	version: string;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	structure: IProjectStructure;
	codeStyle: ICodeStylePreferences;
	metrics: IProjectMetrics;
}

/**
 * Context Manager Service Implementation
 */
export class ContextManagerService
	extends EventEmitter
	implements IContextManagerService
{
	public readonly name = "ContextManagerService";
	public readonly version = "1.0.0";

	private initialized = false;
	private currentProjectContext: IProjectContext | null = null;
	private userPreferences: IUserPreferences;
	private generationHistory: IGenerationHistoryEntry[] = [];
	private readonly contextStorePath: string;
	private readonly maxHistoryEntries = 1000;

	// Default user preferences with Norwegian focus
	private readonly DEFAULT_USER_PREFERENCES: IUserPreferences = {
		defaultLocale: "nb-NO" as LocaleCode,
		preferredModels: ["codellama:7b", "deepseek-coder:6.7b"],
		generationStyle: "balanced",
		verbosity: "standard",
		autoValidation: true,
		autoTesting: true,
		learningEnabled: true,
		complianceStrictness: "standard",
	};

	// Default code style preferences
	private readonly DEFAULT_CODE_STYLE: ICodeStylePreferences = {
		indentation: "spaces",
		indentSize: 2,
		quotes: "single",
		semicolons: true,
		trailingComma: true,
		bracketSpacing: true,
		arrowParens: "avoid",
		endOfLine: "lf",
		printWidth: 100,
	};

	// Default generation preferences with Norwegian compliance
	private readonly DEFAULT_GENERATION_PREFERENCES: IGenerationPreferences = {
		preferredVariant: "functional",
		includeTests: true,
		includeStories: false,
		includeDocumentation: true,
		accessibilityLevel: "AAA",
		complianceLevel: "standard",
		templatePreference: "standard",
	};

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		private readonly fileSystem: IFileSystemService,
	) {
		super();

		this.contextStorePath = this.config.get<string>(
			"ai.context.storePath",
			"./context-store",
		);
		this.userPreferences = { ...this.DEFAULT_USER_PREFERENCES };
	}

	/**
	 * Initialize the context manager service
	 */
	async initialize(): Promise<void> {
		try {
			this.logger.info("Initializing Context Manager Service");

			// Ensure context store directory exists
			await this.ensureContextStoreDirectory();

			// Load user preferences
			await this.loadUserPreferences();

			// Load generation history
			await this.loadGenerationHistory();

			this.initialized = true;
			this.emit("initialized");

			this.logger.info("Context Manager Service initialized successfully", {
				hasProjectContext: !!this.currentProjectContext,
				historyEntries: this.generationHistory.length,
			});
		} catch (error) {
			this.logger.error(
				"Failed to initialize Context Manager Service",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Dispose of the service and clean up resources
	 */
	async dispose(): Promise<void> {
		try {
			this.logger.info("Disposing Context Manager Service");

			// Save current state
			await this.saveUserPreferences();
			await this.saveGenerationHistory();

			// Clear memory
			this.currentProjectContext = null;
			this.generationHistory = [];

			this.initialized = false;

			this.emit("disposed");
			this.removeAllListeners();

			this.logger.info("Context Manager Service disposed successfully");
		} catch (error) {
			this.logger.error(
				"Error disposing Context Manager Service",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Health check for the service
	 */
	async healthCheck(): Promise<boolean> {
		try {
			if (!this.initialized) {
				return false;
			}

			// Check if context store directory is accessible
			const exists = await this.fileSystem.exists(this.contextStorePath);
			return exists;
		} catch (error) {
			this.logger.error("Health check failed", error as Error);
			return false;
		}
	}

	/**
	 * Analyze project and create context
	 */
	async analyzeProject(projectPath: string): Promise<IProjectContext> {
		try {
			this.logger.info("Analyzing project", { path: projectPath });

			const exists = await this.fileSystem.exists(projectPath);
			if (!exists) {
				throw new Error(`Project path does not exist: ${projectPath}`);
			}

			// Perform project analysis
			const analysis = await this.performProjectAnalysis(projectPath);

			// Detect Norwegian compliance requirements
			const compliance = await this.detectNorwegianCompliance(
				projectPath,
				analysis,
			);

			// Detect locale preferences
			const locale = await this.detectLocalePreferences(projectPath, analysis);

			// Create project context
			const projectContext: IProjectContext = {
				projectPath,
				projectName: path.basename(projectPath),
				projectType: analysis.projectType,
				framework: analysis.framework,
				version: analysis.version,
				dependencies: analysis.dependencies,
				devDependencies: analysis.devDependencies,
				structure: analysis.structure,
				codeStyle: analysis.codeStyle,
				compliance,
				locale,
				generationPreferences: { ...this.DEFAULT_GENERATION_PREFERENCES },
				analyzedAt: new Date(),
				metrics: analysis.metrics,
			};

			// Update current context
			this.currentProjectContext = projectContext;

			// Save context
			await this.saveProjectContext(projectContext);

			this.emit("projectAnalyzed", {
				projectPath,
				projectType: analysis.projectType,
			});

			this.logger.info("Project analysis completed", {
				projectType: analysis.projectType,
				framework: analysis.framework,
				dependencies: Object.keys(analysis.dependencies).length,
				compliance: compliance.nsmClassification,
			});

			return projectContext;
		} catch (error) {
			this.logger.error("Failed to analyze project", error as Error, {
				projectPath,
			});
			throw error;
		}
	}

	/**
	 * Update project context
	 */
	async updateProjectContext(context: Partial<IProjectContext>): Promise<void> {
		try {
			if (!this.currentProjectContext) {
				throw new Error("No current project context to update");
			}

			this.logger.debug("Updating project context", {
				updates: Object.keys(context),
			});

			// Merge updates
			this.currentProjectContext = {
				...this.currentProjectContext,
				...context,
				analyzedAt: new Date(),
			};

			// Save updated context
			await this.saveProjectContext(this.currentProjectContext);

			this.emit("projectContextUpdated", {
				context: this.currentProjectContext,
			});

			this.logger.debug("Project context updated successfully");
		} catch (error) {
			this.logger.error("Failed to update project context", error as Error);
			throw error;
		}
	}

	/**
	 * Get current project context
	 */
	getProjectContext(): IProjectContext | null {
		return this.currentProjectContext;
	}

	/**
	 * Get user preferences
	 */
	getUserPreferences(): IUserPreferences {
		return { ...this.userPreferences };
	}

	/**
	 * Update user preferences
	 */
	async updateUserPreferences(
		preferences: Partial<IUserPreferences>,
	): Promise<void> {
		try {
			this.logger.debug("Updating user preferences", {
				updates: Object.keys(preferences),
			});

			// Merge preferences
			this.userPreferences = {
				...this.userPreferences,
				...preferences,
			};

			// Save preferences
			await this.saveUserPreferences();

			this.emit("userPreferencesUpdated", {
				preferences: this.userPreferences,
			});

			this.logger.debug("User preferences updated successfully");
		} catch (error) {
			this.logger.error("Failed to update user preferences", error as Error);
			throw error;
		}
	}

	/**
	 * Add generation history entry
	 */
	async addGenerationHistory(entry: IGenerationHistoryEntry): Promise<void> {
		try {
			this.logger.debug("Adding generation history entry", {
				id: entry.id,
				type: entry.type,
				success: entry.success,
			});

			// Add to history
			this.generationHistory.unshift(entry);

			// Maintain history size limit
			if (this.generationHistory.length > this.maxHistoryEntries) {
				this.generationHistory = this.generationHistory.slice(
					0,
					this.maxHistoryEntries,
				);
			}

			// Save history periodically (every 10 entries)
			if (this.generationHistory.length % 10 === 0) {
				await this.saveGenerationHistory();
			}

			this.emit("generationHistoryAdded", { entryId: entry.id });

			this.logger.debug("Generation history entry added successfully");
		} catch (error) {
			this.logger.error(
				"Failed to add generation history entry",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Get generation history
	 */
	async getGenerationHistory(
		limit: number = 50,
	): Promise<IGenerationHistoryEntry[]> {
		try {
			const history = this.generationHistory.slice(0, limit);

			this.logger.debug("Retrieved generation history", {
				count: history.length,
			});

			return history;
		} catch (error) {
			this.logger.error("Failed to get generation history", error as Error);
			throw error;
		}
	}

	/**
	 * Record user feedback for a generation
	 */
	async recordUserFeedback(
		generationId: string,
		feedback: IUserFeedback,
	): Promise<void> {
		try {
			this.logger.debug("Recording user feedback", {
				generationId,
				rating: feedback.rating,
			});

			// Find the generation entry
			const entry = this.generationHistory.find((e) => e.id === generationId);
			if (!entry) {
				throw new Error(`Generation entry not found: ${generationId}`);
			}

			// Update entry with feedback
			entry.userFeedback = feedback;

			// Save history
			await this.saveGenerationHistory();

			this.emit("userFeedbackRecorded", { generationId, feedback });

			this.logger.debug("User feedback recorded successfully");
		} catch (error) {
			this.logger.error("Failed to record user feedback", error as Error);
			throw error;
		}
	}

	/**
	 * Get adaptation insights based on history and feedback
	 */
	async getAdaptationInsights(): Promise<IAdaptationInsights> {
		try {
			this.logger.debug("Generating adaptation insights");

			const insights = await this.analyzeGenerationHistory();

			this.logger.debug("Adaptation insights generated", {
				commonPatterns: insights.commonPatterns.length,
				modelCount: Object.keys(insights.modelPerformance).length,
			});

			return insights;
		} catch (error) {
			this.logger.error("Failed to get adaptation insights", error as Error);
			throw error;
		}
	}

	// === Private Helper Methods ===

	private async ensureContextStoreDirectory(): Promise<void> {
		const exists = await this.fileSystem.exists(this.contextStorePath);
		if (!exists) {
			await this.fileSystem.createDirectory(this.contextStorePath);
		}
	}

	private async loadUserPreferences(): Promise<void> {
		try {
			const preferencesPath = path.join(
				this.contextStorePath,
				"user-preferences.json",
			);
			const exists = await this.fileSystem.exists(preferencesPath);

			if (exists) {
				const content = await this.fileSystem.read(preferencesPath);
				const savedPreferences = JSON.parse(content) as IUserPreferences;

				// Merge with defaults to handle new preference fields
				this.userPreferences = {
					...this.DEFAULT_USER_PREFERENCES,
					...savedPreferences,
				};

				this.logger.debug("User preferences loaded successfully");
			} else {
				this.logger.debug("No saved user preferences found, using defaults");
			}
		} catch (error) {
			this.logger.warn("Failed to load user preferences, using defaults", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
			this.userPreferences = { ...this.DEFAULT_USER_PREFERENCES };
		}
	}

	private async saveUserPreferences(): Promise<void> {
		try {
			const preferencesPath = path.join(
				this.contextStorePath,
				"user-preferences.json",
			);
			const content = JSON.stringify(this.userPreferences, null, 2);
			await this.fileSystem.write(preferencesPath, content);
		} catch (error) {
			this.logger.warn("Failed to save user preferences", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private async loadGenerationHistory(): Promise<void> {
		try {
			const historyPath = path.join(
				this.contextStorePath,
				"generation-history.json",
			);
			const exists = await this.fileSystem.exists(historyPath);

			if (exists) {
				const content = await this.fileSystem.read(historyPath);
				const history = JSON.parse(content) as IGenerationHistoryEntry[];

				// Convert date strings back to Date objects
				this.generationHistory = history.map((entry) => ({
					...entry,
					timestamp: new Date(entry.timestamp),
					userFeedback: entry.userFeedback
						? {
								...entry.userFeedback,
								timestamp: new Date(entry.userFeedback.timestamp),
							}
						: undefined,
				}));

				this.logger.debug("Generation history loaded successfully", {
					entries: this.generationHistory.length,
				});
			}
		} catch (error) {
			this.logger.warn("Failed to load generation history", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
			this.generationHistory = [];
		}
	}

	private async saveGenerationHistory(): Promise<void> {
		try {
			const historyPath = path.join(
				this.contextStorePath,
				"generation-history.json",
			);
			const content = JSON.stringify(this.generationHistory, null, 2);
			await this.fileSystem.write(historyPath, content);
		} catch (error) {
			this.logger.warn("Failed to save generation history", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private async saveProjectContext(context: IProjectContext): Promise<void> {
		try {
			const contextPath = path.join(
				this.contextStorePath,
				"project-context.json",
			);
			const content = JSON.stringify(context, null, 2);
			await this.fileSystem.write(contextPath, content);
		} catch (error) {
			this.logger.warn("Failed to save project context", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private async performProjectAnalysis(
		projectPath: string,
	): Promise<IProjectAnalysisResult> {
		// Analyze package.json
		const packageJsonPath = path.join(projectPath, "package.json");
		let packageJson: any = {};
		let projectType: "nextjs" | "react" | "nestjs" | "library" = "library";
		let framework = "unknown";
		let version = "1.0.0";

		try {
			const packageContent = await this.fileSystem.read(packageJsonPath);
			packageJson = JSON.parse(packageContent);

			version = packageJson.version || "1.0.0";

			// Detect project type
			if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
				projectType = "nextjs";
				framework = "nextjs";
			} else if (
				packageJson.dependencies?.react ||
				packageJson.devDependencies?.react
			) {
				projectType = "react";
				framework = "react";
			} else if (
				packageJson.dependencies?.["@nestjs/core"] ||
				packageJson.devDependencies?.["@nestjs/core"]
			) {
				projectType = "nestjs";
				framework = "nestjs";
			}
		} catch (error) {
			this.logger.warn("Failed to read package.json", { projectPath });
		}

		// Analyze project structure
		const structure = await this.analyzeProjectStructure(projectPath);

		// Detect code style
		const codeStyle = await this.detectCodeStyle(projectPath);

		// Calculate metrics
		const metrics = await this.calculateProjectMetrics(projectPath, structure);

		return {
			projectType,
			framework,
			version,
			dependencies: packageJson.dependencies || {},
			devDependencies: packageJson.devDependencies || {},
			structure,
			codeStyle,
			metrics,
		};
	}

	private async analyzeProjectStructure(
		projectPath: string,
	): Promise<IProjectStructure> {
		const structure: IProjectStructure = {
			srcDirectory: "src",
			componentsDirectory: undefined,
			pagesDirectory: undefined,
			apiDirectory: undefined,
			testDirectory: undefined,
			configFiles: [],
			importantFiles: [],
			totalFiles: 0,
			codeFiles: 0,
		};

		try {
			const files = await this.fileSystem.list(projectPath);

			for (const file of files) {
				const filePath = path.join(projectPath, file);
				const stats = await this.fileSystem.getStats(filePath);

				if (stats.isDirectory) {
					// Check for common directories
					if (file === "src" || file === "source") {
						structure.srcDirectory = file;
					} else if (file === "components") {
						structure.componentsDirectory = file;
					} else if (file === "pages") {
						structure.pagesDirectory = file;
					} else if (file === "api") {
						structure.apiDirectory = file;
					} else if (file.includes("test") || file.includes("spec")) {
						structure.testDirectory = file;
					}
				} else if (stats.isFile) {
					structure.totalFiles++;

					// Check for config files
					if (this.isConfigFile(file)) {
						structure.configFiles.push(file);
					}

					// Check for important files
					if (this.isImportantFile(file)) {
						structure.importantFiles.push(file);
					}

					// Check for code files
					if (this.isCodeFile(file)) {
						structure.codeFiles++;
					}
				}
			}

			// Look for nested directories if src exists
			if (structure.srcDirectory) {
				const srcPath = path.join(projectPath, structure.srcDirectory);
				const srcExists = await this.fileSystem.exists(srcPath);

				if (srcExists) {
					const srcFiles = await this.fileSystem.list(srcPath);

					for (const file of srcFiles) {
						const filePath = path.join(srcPath, file);
						const stats = await this.fileSystem.getStats(filePath);

						if (stats.isDirectory) {
							if (file === "components") {
								structure.componentsDirectory = path.join(
									structure.srcDirectory,
									file,
								);
							} else if (file === "pages") {
								structure.pagesDirectory = path.join(
									structure.srcDirectory,
									file,
								);
							} else if (file === "api") {
								structure.apiDirectory = path.join(
									structure.srcDirectory,
									file,
								);
							}
						}
					}
				}
			}
		} catch (error) {
			this.logger.warn("Failed to analyze project structure", {
				projectPath,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}

		return structure;
	}

	private async detectCodeStyle(
		projectPath: string,
	): Promise<ICodeStylePreferences> {
		let codeStyle = { ...this.DEFAULT_CODE_STYLE };

		try {
			// Check for Prettier config
			const prettierFiles = [
				".prettierrc",
				".prettierrc.json",
				".prettierrc.js",
				"prettier.config.js",
			];

			for (const file of prettierFiles) {
				const configPath = path.join(projectPath, file);
				const exists = await this.fileSystem.exists(configPath);

				if (exists) {
					try {
						const content = await this.fileSystem.read(configPath);
						let config: any = {};

						if (file.endsWith(".json") || file === ".prettierrc") {
							config = JSON.parse(content);
						}

						// Apply Prettier config to code style
						if (config.useTabs !== undefined) {
							codeStyle.indentation = config.useTabs ? "tabs" : "spaces";
						}
						if (config.tabWidth !== undefined) {
							codeStyle.indentSize = config.tabWidth;
						}
						if (config.singleQuote !== undefined) {
							codeStyle.quotes = config.singleQuote ? "single" : "double";
						}
						if (config.semi !== undefined) {
							codeStyle.semicolons = config.semi;
						}
						if (config.trailingComma !== undefined) {
							codeStyle.trailingComma = config.trailingComma !== "none";
						}
						if (config.bracketSpacing !== undefined) {
							codeStyle.bracketSpacing = config.bracketSpacing;
						}
						if (config.arrowParens !== undefined) {
							codeStyle.arrowParens = config.arrowParens;
						}
						if (config.endOfLine !== undefined) {
							codeStyle.endOfLine = config.endOfLine;
						}
						if (config.printWidth !== undefined) {
							codeStyle.printWidth = config.printWidth;
						}

						break;
					} catch (error) {
						this.logger.warn("Failed to parse Prettier config", { file });
					}
				}
			}

			// Check for ESLint config for additional style info
			const eslintFiles = [
				".eslintrc",
				".eslintrc.json",
				".eslintrc.js",
				"eslint.config.js",
			];

			for (const file of eslintFiles) {
				const configPath = path.join(projectPath, file);
				const exists = await this.fileSystem.exists(configPath);

				if (exists) {
					// ESLint config detected - indicates attention to code style
					break;
				}
			}
		} catch (error) {
			this.logger.warn("Failed to detect code style", {
				projectPath,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}

		return codeStyle;
	}

	private async calculateProjectMetrics(
		projectPath: string,
		structure: IProjectStructure,
	): Promise<IProjectMetrics> {
		const metrics: IProjectMetrics = {
			totalLines: 0,
			codeLines: 0,
			commentLines: 0,
			testLines: 0,
			testCoverage: undefined,
			complexity: 0,
			maintainabilityIndex: 75, // Default value
			technicalDebt: 0,
			lastAnalyzed: new Date(),
		};

		try {
			// Analyze code files for metrics
			await this.analyzeCodeFiles(projectPath, metrics);

			// Calculate maintainability index based on metrics
			metrics.maintainabilityIndex =
				this.calculateMaintainabilityIndex(metrics);

			// Estimate technical debt
			metrics.technicalDebt = this.estimateTechnicalDebt(metrics, structure);
		} catch (error) {
			this.logger.warn("Failed to calculate project metrics", {
				projectPath,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}

		return metrics;
	}

	private async analyzeCodeFiles(
		projectPath: string,
		metrics: IProjectMetrics,
	): Promise<void> {
		// This is a simplified implementation
		// In a real implementation, you would recursively analyze all code files

		try {
			const files = await this.fileSystem.list(projectPath);

			for (const file of files) {
				if (this.isCodeFile(file)) {
					const filePath = path.join(projectPath, file);
					const content = await this.fileSystem.read(filePath);
					const lines = content.split("\n");

					metrics.totalLines += lines.length;

					for (const line of lines) {
						const trimmed = line.trim();

						if (
							trimmed === "" ||
							trimmed.startsWith("//") ||
							trimmed.startsWith("/*") ||
							trimmed.startsWith("*")
						) {
							metrics.commentLines++;
						} else {
							metrics.codeLines++;

							// Simple complexity calculation
							if (
								trimmed.includes("if") ||
								trimmed.includes("for") ||
								trimmed.includes("while") ||
								trimmed.includes("switch") ||
								trimmed.includes("catch")
							) {
								metrics.complexity++;
							}
						}

						// Check for test lines
						if (
							file.includes("test") ||
							file.includes("spec") ||
							trimmed.includes("test(") ||
							trimmed.includes("it(") ||
							trimmed.includes("describe(")
						) {
							metrics.testLines++;
						}
					}
				}
			}
		} catch (error) {
			this.logger.warn("Failed to analyze code files for metrics");
		}
	}

	private calculateMaintainabilityIndex(metrics: IProjectMetrics): number {
		// Simplified maintainability index calculation
		let index = 100;

		// Reduce based on complexity
		index -= Math.min(30, metrics.complexity * 0.5);

		// Reduce based on code-to-comment ratio
		const commentRatio = metrics.commentLines / Math.max(1, metrics.codeLines);
		if (commentRatio < 0.1) {
			index -= 10; // Penalty for low documentation
		}

		// Reduce based on file size
		const avgLinesPerFile =
			metrics.totalLines / Math.max(1, metrics.codeLines / 100);
		if (avgLinesPerFile > 200) {
			index -= 10; // Penalty for large files
		}

		return Math.max(0, Math.min(100, index));
	}

	private estimateTechnicalDebt(
		metrics: IProjectMetrics,
		structure: IProjectStructure,
	): number {
		// Simplified technical debt estimation in hours
		let debt = 0;

		// Debt based on complexity
		debt += metrics.complexity * 0.1;

		// Debt based on code without tests
		const testRatio = metrics.testLines / Math.max(1, metrics.codeLines);
		if (testRatio < 0.3) {
			debt += (0.3 - testRatio) * metrics.codeLines * 0.01;
		}

		// Debt based on maintainability
		if (metrics.maintainabilityIndex < 60) {
			debt += (60 - metrics.maintainabilityIndex) * 0.5;
		}

		return Math.round(debt);
	}

	private async detectNorwegianCompliance(
		projectPath: string,
		analysis: IProjectAnalysisResult,
	): Promise<NorwegianCompliance> {
		let compliance: NorwegianCompliance = {
			nsmClassification: "OPEN",
			gdprCompliant: false,
			wcagLevel: "A",
		};

		try {
			// Check for compliance indicators in dependencies
			const deps = { ...analysis.dependencies, ...analysis.devDependencies };

			if (
				deps["@xala-technologies/norwegian-compliance"] ||
				deps["@xala-technologies/enterprise-standards"]
			) {
				compliance.gdprCompliant = true;
				compliance.wcagLevel = "AAA";
			}

			// Check for NSM classification in source files
			const srcPath = path.join(projectPath, analysis.structure.srcDirectory);
			const srcExists = await this.fileSystem.exists(srcPath);

			if (srcExists) {
				// Look for NSM classification indicators
				const hasNSMIndicators = await this.checkForNSMIndicators(srcPath);
				if (hasNSMIndicators.hasRestricted) {
					compliance.nsmClassification = "RESTRICTED";
				}
				if (hasNSMIndicators.hasConfidential) {
					compliance.nsmClassification = "CONFIDENTIAL";
				}
				if (hasNSMIndicators.hasSecret) {
					compliance.nsmClassification = "SECRET";
				}
			}

			// Check for GDPR indicators
			const hasGDPRIndicators = await this.checkForGDPRIndicators(projectPath);
			if (hasGDPRIndicators) {
				compliance.gdprCompliant = true;
			}

			// Check for WCAG indicators
			const wcagLevel = await this.checkForWCAGIndicators(projectPath);
			if (wcagLevel) {
				compliance.wcagLevel = wcagLevel;
			}
		} catch (error) {
			this.logger.warn("Failed to detect Norwegian compliance", {
				projectPath,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}

		return compliance;
	}

	private async detectLocalePreferences(
		projectPath: string,
		analysis: IProjectAnalysisResult,
	): Promise<LocaleCode> {
		try {
			// Check for i18n configuration
			const i18nFiles = [
				"i18n.js",
				"i18n.ts",
				"next-i18next.config.js",
				"locales.json",
			];

			for (const file of i18nFiles) {
				const filePath = path.join(projectPath, file);
				const exists = await this.fileSystem.exists(filePath);

				if (exists) {
					const content = await this.fileSystem.read(filePath);

					// Look for Norwegian locale indicators
					if (
						content.includes("nb-NO") ||
						content.includes("no-NO") ||
						content.includes("nor")
					) {
						return "nb-NO" as LocaleCode;
					}
					if (content.includes("nn-NO")) {
						return "nn-NO" as LocaleCode;
					}
				}
			}

			// Check package.json for locale hints
			const packageJsonPath = path.join(projectPath, "package.json");
			const exists = await this.fileSystem.exists(packageJsonPath);

			if (exists) {
				const content = await this.fileSystem.read(packageJsonPath);
				if (
					content.includes("norway") ||
					content.includes("norwegian") ||
					content.includes("norge")
				) {
					return "nb-NO" as LocaleCode;
				}
			}
		} catch (error) {
			this.logger.warn("Failed to detect locale preferences");
		}

		return "nb-NO" as LocaleCode; // Default to Norwegian
	}

	private async checkForNSMIndicators(
		srcPath: string,
	): Promise<{
		hasRestricted: boolean;
		hasConfidential: boolean;
		hasSecret: boolean;
	}> {
		// Simplified check - would recursively check all files in real implementation
		const result = {
			hasRestricted: false,
			hasConfidential: false,
			hasSecret: false,
		};

		try {
			const files = await this.fileSystem.list(srcPath);

			for (const file of files.slice(0, 10)) {
				// Check first 10 files for performance
				if (this.isCodeFile(file)) {
					const filePath = path.join(srcPath, file);
					const content = await this.fileSystem.read(filePath);

					if (content.includes("RESTRICTED")) result.hasRestricted = true;
					if (content.includes("CONFIDENTIAL")) result.hasConfidential = true;
					if (content.includes("SECRET")) result.hasSecret = true;
				}
			}
		} catch (error) {
			// Ignore errors
		}

		return result;
	}

	private async checkForGDPRIndicators(projectPath: string): Promise<boolean> {
		try {
			// Check for GDPR-related files or content
			const files = await this.fileSystem.list(projectPath);

			for (const file of files.slice(0, 10)) {
				if (this.isCodeFile(file)) {
					const filePath = path.join(projectPath, file);
					const content = await this.fileSystem.read(filePath);

					if (
						content.includes("gdpr") ||
						content.includes("GDPR") ||
						content.includes("consent") ||
						content.includes("privacy")
					) {
						return true;
					}
				}
			}
		} catch (error) {
			// Ignore errors
		}

		return false;
	}

	private async checkForWCAGIndicators(
		projectPath: string,
	): Promise<"A" | "AA" | "AAA" | undefined> {
		try {
			const files = await this.fileSystem.list(projectPath);

			let hasWCAG = false;
			let hasAriaLabels = false;
			let hasScreenReaderSupport = false;

			for (const file of files.slice(0, 10)) {
				if (this.isCodeFile(file)) {
					const filePath = path.join(projectPath, file);
					const content = await this.fileSystem.read(filePath);

					if (content.includes("wcag") || content.includes("WCAG"))
						hasWCAG = true;
					if (
						content.includes("aria-label") ||
						content.includes("aria-describedby")
					)
						hasAriaLabels = true;
					if (content.includes("screen reader") || content.includes("sr-only"))
						hasScreenReaderSupport = true;
				}
			}

			if (hasWCAG && hasAriaLabels && hasScreenReaderSupport) return "AAA";
			if (hasAriaLabels && hasScreenReaderSupport) return "AA";
			if (hasAriaLabels) return "A";
		} catch (error) {
			// Ignore errors
		}

		return undefined;
	}

	private async analyzeGenerationHistory(): Promise<IAdaptationInsights> {
		const insights: IAdaptationInsights = {
			commonPatterns: [],
			preferredStyles: { ...this.DEFAULT_CODE_STYLE },
			successfulPrompts: [],
			problematicAreas: [],
			improvementAreas: [],
			modelPerformance: {},
		};

		try {
			const recentHistory = this.generationHistory.slice(0, 100); // Analyze last 100 generations

			// Analyze common patterns
			const patternCounts = new Map<string, number>();
			const successfulPrompts = new Map<string, number>();
			const modelStats = new Map<
				string,
				{
					total: number;
					successful: number;
					avgRating: number;
					ratings: number[];
				}
			>();

			for (const entry of recentHistory) {
				// Track patterns
				if (entry.success) {
					const pattern = `${entry.type}`;
					patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);

					// Track successful prompts
					const prompt = entry.requirements.substring(0, 100);
					successfulPrompts.set(
						prompt,
						(successfulPrompts.get(prompt) || 0) + 1,
					);
				}

				// Track model performance
				if (!modelStats.has(entry.model)) {
					modelStats.set(entry.model, {
						total: 0,
						successful: 0,
						avgRating: 0,
						ratings: [],
					});
				}

				const modelStat = modelStats.get(entry.model)!;
				modelStat.total++;

				if (entry.success) {
					modelStat.successful++;
				}

				if (entry.userFeedback) {
					modelStat.ratings.push(entry.userFeedback.rating);
				}
			}

			// Extract insights
			insights.commonPatterns = Array.from(patternCounts.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([pattern]) => pattern);

			insights.successfulPrompts = Array.from(successfulPrompts.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([prompt]) => prompt);

			// Analyze model performance
			for (const [model, stats] of modelStats.entries()) {
				const avgRating =
					stats.ratings.length > 0
						? stats.ratings.reduce((sum, rating) => sum + rating, 0) /
							stats.ratings.length
						: 0;

				const successRate =
					stats.total > 0 ? stats.successful / stats.total : 0;

				const performance: IModelPerformanceInsight = {
					model,
					averageRating: avgRating,
					successRate,
					averageComplianceScore: 75, // Would calculate from actual compliance scores
					commonIssues: this.identifyCommonIssues(recentHistory, model),
					recommendations: this.generateModelRecommendations(
						model,
						successRate,
						avgRating,
					),
				};

				insights.modelPerformance[model] = performance;
			}

			// Identify problematic areas
			insights.problematicAreas = this.identifyProblematicAreas(recentHistory);

			// Identify improvement areas
			insights.improvementAreas = this.identifyImprovementAreas(recentHistory);
		} catch (error) {
			this.logger.warn("Failed to analyze generation history for insights", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}

		return insights;
	}

	private identifyCommonIssues(
		history: IGenerationHistoryEntry[],
		model: string,
	): string[] {
		const issues: string[] = [];

		const modelEntries = history.filter(
			(entry) => entry.model === model && !entry.success,
		);

		if (modelEntries.length > 0) {
			// Analyze failed generations for common patterns
			const failureReasons = new Set<string>();

			for (const entry of modelEntries) {
				if (entry.complianceScore < 70) {
					failureReasons.add("Norwegian compliance issues");
				}
				if (entry.qualityScore < 60) {
					failureReasons.add("Code quality issues");
				}
				if (entry.type === "component" && entry.requirements.includes("form")) {
					failureReasons.add("Form component generation");
				}
			}

			issues.push(...Array.from(failureReasons));
		}

		return issues;
	}

	private generateModelRecommendations(
		model: string,
		successRate: number,
		avgRating: number,
	): string[] {
		const recommendations: string[] = [];

		if (successRate < 0.7) {
			recommendations.push(
				"Consider using more specific prompts for better results",
			);
		}

		if (avgRating < 3) {
			recommendations.push(
				"Review generated code quality and consider alternative models",
			);
		}

		if (model.includes("codellama")) {
			recommendations.push(
				"CodeLlama works best with detailed technical requirements",
			);
		}

		if (model.includes("deepseek")) {
			recommendations.push("Deepseek Coder excels at complex algorithmic code");
		}

		return recommendations;
	}

	private identifyProblematicAreas(
		history: IGenerationHistoryEntry[],
	): string[] {
		const areas: string[] = [];
		const failedTypes = new Map<string, number>();

		for (const entry of history) {
			if (!entry.success) {
				failedTypes.set(entry.type, (failedTypes.get(entry.type) || 0) + 1);
			}
		}

		for (const [type, count] of failedTypes.entries()) {
			if (count > 3) {
				areas.push(`${type} generation`);
			}
		}

		return areas;
	}

	private identifyImprovementAreas(
		history: IGenerationHistoryEntry[],
	): string[] {
		const areas: string[] = [];

		const lowComplianceCount = history.filter(
			(entry) => entry.complianceScore < 80,
		).length;
		const lowQualityCount = history.filter(
			(entry) => entry.qualityScore < 70,
		).length;
		const lowRatingCount = history.filter(
			(entry) => entry.userFeedback && entry.userFeedback.rating < 3,
		).length;

		if (lowComplianceCount > 5) {
			areas.push("Norwegian compliance adherence");
		}

		if (lowQualityCount > 5) {
			areas.push("Code quality and maintainability");
		}

		if (lowRatingCount > 3) {
			areas.push("User satisfaction and code accuracy");
		}

		return areas;
	}

	private isConfigFile(filename: string): boolean {
		const configExtensions = [".json", ".js", ".ts", ".yml", ".yaml", ".toml"];
		const configNames = [
			"package.json",
			"tsconfig.json",
			".eslintrc",
			".prettierrc",
			"jest.config",
			"vite.config",
			"webpack.config",
			"next.config",
			"tailwind.config",
		];

		return (
			configNames.some((name) => filename.startsWith(name)) ||
			(filename.startsWith(".") &&
				configExtensions.some((ext) => filename.endsWith(ext)))
		);
	}

	private isImportantFile(filename: string): boolean {
		const importantFiles = [
			"README.md",
			"LICENSE",
			"CHANGELOG.md",
			"package.json",
			"index.ts",
			"index.js",
			"main.ts",
			"main.js",
			"app.ts",
			"app.js",
		];

		return importantFiles.includes(filename);
	}

	private isCodeFile(filename: string): boolean {
		const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
		return codeExtensions.some((ext) => filename.endsWith(ext));
	}
}
