/**
 * Enhanced MCP (Model Context Protocol) Client Integration
 *
 * Story 1.2 Implementation: Enhanced MCP server for generator context
 * - Integrates with Xala UI Component Specification System
 * - Provides AI-optimized template generation
 * - Implements existing pattern recognition
 * - Supports project structure analysis
 * - Enables AI prompt optimization
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 * @updated 2025-01-04 - Added AI-native generation capabilities
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { consola } from "consola";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ComponentSpecification {
	metadata: {
		name: string;
		version: string;
		category:
			| "basic"
			| "composite"
			| "layout"
			| "navigation"
			| "feedback"
			| "overlay"
			| "form"
			| "data-display"
			| "specialized";
		description: string;
		keywords?: string[];
		stability: "experimental" | "beta" | "stable" | "deprecated";
	};
	compliance: {
		wcag: { level: "A" | "AA" | "AAA" };
		norwegian: {
			nsmClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
		};
		i18n: { supportedLocales: string[] };
	};
	props: {
		schema: Record<string, PropDefinition>;
		groups: PropGroups;
	};
	accessibility: {
		role: { primary: string };
		keyboardNavigation: KeyboardNavigation;
		screenReader: ScreenReaderSupport;
	};
	platforms: {
		supported: string[];
		implementations: Record<string, PlatformImplementation>;
	};
	ai?: AIOptimization;
}

export interface PropDefinition {
	type: string;
	description?: string;
	required?: boolean;
	default?: any;
	enum?: string[];
	signature?: string;
}

export interface PropGroups {
	required?: string[];
	optional?: string[];
	advanced?: string[];
}

export interface KeyboardNavigation {
	supported: boolean;
	patterns?: Array<{ key: string; action: string }>;
}

export interface ScreenReaderSupport {
	announcements?: string[];
	labels?: Record<string, string>;
}

export interface PlatformImplementation {
	dependencies?: string[];
	imports?: string[];
	ai?: {
		hints?: string[];
		patterns?: Array<{
			pattern: string;
			context: string;
			recommendation: string;
		}>;
	};
}

export interface AIOptimization {
	optimization: {
		hints: string[];
		patterns: Array<{
			pattern: string;
			context: string;
			recommendation: string;
		}>;
		antiPatterns: Array<{
			pattern: string;
			reason: string;
			alternative: string;
		}>;
	};
	generation: {
		priority: "low" | "medium" | "high";
		complexity: "simple" | "medium" | "complex";
		estimatedTokens: number;
	};
	documentation?: {
		autoGenerate: boolean;
		templates: string[];
	};
}

export interface MCPGenerationOptions {
	platform: string;
	includeTests?: boolean;
	includeStories?: boolean;
	includeDocs?: boolean;
	aiOptimized?: boolean;
	complexity?: "simple" | "medium" | "complex";
	nsmClassification?: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
}

export interface MCPGenerationResult {
	success: boolean;
	component: string;
	files: Array<{
		path: string;
		content: string;
		type: "component" | "test" | "story" | "docs";
	}>;
	metadata: {
		tokensUsed: number;
		complexity: string;
		aiHints: string[];
		complianceLevel: string;
	};
	errors?: string[];
	warnings?: string[];
}

export class MCPClient {
	private specCache: Map<string, ComponentSpecification> = new Map();
	private patternCache: Map<string, PatternSpecification> = new Map();
	private projectAnalysisCache: Map<string, any> = new Map();
	private mcpPath: string;

	constructor() {
		this.mcpPath = path.resolve(__dirname, "../../../mcp");
	}

	/**
	 * Load component specification from MCP system
	 */
	async loadSpecification(
		componentName: string,
		category?: string,
	): Promise<ComponentSpecification | null> {
		const cacheKey = `${category || "unknown"}:${componentName}`;

		// Check cache first
		if (this.specCache.has(cacheKey)) {
			return this.specCache.get(cacheKey)!;
		}

		try {
			// Try to find the specification file
			const specPath = await this.findSpecificationPath(
				componentName,
				category,
			);
			if (!specPath) {
				consola.warn(`MCP specification not found for ${componentName}`);
				return null;
			}

			const specContent = await fs.readFile(specPath, "utf-8");
			const spec: ComponentSpecification = JSON.parse(specContent);

			// Cache the specification
			this.specCache.set(cacheKey, spec);

			consola.debug(
				`Loaded MCP specification for ${componentName} from ${specPath}`,
			);
			return spec;
		} catch (error) {
			consola.error(
				`Failed to load MCP specification for ${componentName}:`,
				error,
			);
			return null;
		}
	}

	/**
	 * Get AI optimization hints for component generation
	 */
	async getAIHints(
		componentName: string,
		platform: string = "react",
	): Promise<string[]> {
		const spec = await this.loadSpecification(componentName);
		if (!spec?.ai?.optimization) {
			return this.getDefaultAIHints(platform);
		}

		const hints = [...spec.ai.optimization.hints];

		// Add platform-specific hints
		const platformImpl = spec.platforms.implementations[platform];
		if (platformImpl?.ai?.hints) {
			hints.push(...platformImpl.ai.hints);
		}

		return hints;
	}

	/**
	 * Get complexity estimation for token usage planning
	 */
	async getComplexityEstimation(componentName: string): Promise<{
		complexity: "simple" | "medium" | "complex";
		estimatedTokens: number;
		priority: "low" | "medium" | "high";
	}> {
		const spec = await this.loadSpecification(componentName);

		if (spec?.ai?.generation) {
			return {
				complexity: spec.ai.generation.complexity,
				estimatedTokens: spec.ai.generation.estimatedTokens,
				priority: spec.ai.generation.priority,
			};
		}

		// Default estimation based on component name patterns
		return this.estimateComplexity(componentName);
	}

	/**
	 * Get component patterns and anti-patterns
	 */
	async getPatterns(componentName: string): Promise<{
		patterns: Array<{
			pattern: string;
			context: string;
			recommendation: string;
		}>;
		antiPatterns: Array<{
			pattern: string;
			reason: string;
			alternative: string;
		}>;
	}> {
		const spec = await this.loadSpecification(componentName);

		return {
			patterns: spec?.ai?.optimization?.patterns || [],
			antiPatterns: spec?.ai?.optimization?.antiPatterns || [],
		};
	}

	/**
	 * Generate enhanced template context with MCP data
	 */
	async enhanceTemplateContext(
		context: any,
		componentName?: string,
	): Promise<any> {
		if (!componentName) {
			return context;
		}

		const spec = await this.loadSpecification(componentName);
		if (!spec) {
			return context;
		}

		return {
			...context,
			mcp: {
				specification: spec,
				aiHints: await this.getAIHints(
					componentName,
					context.platform || "react",
				),
				complexity: await this.getComplexityEstimation(componentName),
				patterns: await this.getPatterns(componentName),
				compliance: {
					wcag: spec.compliance.wcag,
					norwegian: spec.compliance.norwegian,
					i18n: spec.compliance.i18n,
				},
			},
		};
	}

	/**
	 * Validate component against MCP specifications
	 */
	async validateComponent(
		componentCode: string,
		componentName: string,
	): Promise<{
		valid: boolean;
		score: number;
		issues: Array<{
			type: "error" | "warning" | "info";
			message: string;
			line?: number;
			suggestion?: string;
		}>;
	}> {
		const spec = await this.loadSpecification(componentName);
		if (!spec) {
			return {
				valid: true,
				score: 0.5,
				issues: [{ type: "warning", message: "No MCP specification found" }],
			};
		}

		const issues = [];
		let score = 1.0;

		// Check for AI optimization patterns
		if (spec.ai?.optimization?.antiPatterns) {
			for (const antiPattern of spec.ai.optimization.antiPatterns) {
				if (componentCode.includes(antiPattern.pattern)) {
					issues.push({
						type: "warning" as const,
						message: `Anti-pattern detected: ${antiPattern.reason}`,
						suggestion: antiPattern.alternative,
					});
					score -= 0.1;
				}
			}
		}

		// Check for required accessibility attributes
		if (spec.accessibility?.role?.primary && !componentCode.includes("role=")) {
			issues.push({
				type: "error" as const,
				message: `Missing required role attribute: ${spec.accessibility.role.primary}`,
				suggestion: `Add role="${spec.accessibility.role.primary}" to the component`,
			});
			score -= 0.2;
		}

		return {
			valid: issues.filter((i) => i.type === "error").length === 0,
			score: Math.max(0, score),
			issues,
		};
	}

	/**
	 * Get available component specifications
	 */
	async getAvailableSpecs(): Promise<
		Array<{ name: string; category: string; path: string }>
	> {
		const specs = [];
		const categoriesPath = path.join(
			this.mcpPath,
			"docs/specifications/components",
		);

		try {
			if (!(await fs.pathExists(categoriesPath))) {
				return [];
			}

			const categories = await fs.readdir(categoriesPath);

			for (const category of categories) {
				const categoryPath = path.join(categoriesPath, category);
				const stat = await fs.stat(categoryPath);

				if (stat.isDirectory()) {
					const files = await fs.readdir(categoryPath);

					for (const file of files) {
						if (file.endsWith(".json")) {
							specs.push({
								name: path.basename(file, ".json"),
								category,
								path: path.join(categoryPath, file),
							});
						}
					}
				}
			}
		} catch (error) {
			consola.debug("Could not scan MCP specifications:", error);
		}

		return specs;
	}

	private async findSpecificationPath(
		componentName: string,
		category?: string,
	): Promise<string | null> {
		const possiblePaths = [];

		if (category) {
			possiblePaths.push(
				path.join(
					this.mcpPath,
					`docs/specifications/components/${category}/${componentName}.json`,
				),
				path.join(
					this.mcpPath,
					`docs/specifications/components/${category}/${componentName.toLowerCase()}.json`,
				),
			);
		} else {
			// Search all categories
			const categories = [
				"basic",
				"composite",
				"layout",
				"navigation",
				"feedback",
				"overlay",
				"form",
				"data-display",
				"specialized",
			];
			for (const cat of categories) {
				possiblePaths.push(
					path.join(
						this.mcpPath,
						`docs/specifications/components/${cat}/${componentName}.json`,
					),
					path.join(
						this.mcpPath,
						`docs/specifications/components/${cat}/${componentName.toLowerCase()}.json`,
					),
				);
			}
		}

		for (const specPath of possiblePaths) {
			if (await fs.pathExists(specPath)) {
				return specPath;
			}
		}

		return null;
	}

	/**
	 * Analyze project structure for AI generation context
	 * Story 1.2: Implement project structure analysis
	 */
	async analyzeProjectStructure(projectPath: string): Promise<{
		architecture: string;
		patterns: string[];
		components: string[];
		dependencies: string[];
		standards: string[];
		compliance: string[];
	}> {
		const cacheKey = `project_${projectPath}`;
		if (this.projectAnalysisCache.has(cacheKey)) {
			return this.projectAnalysisCache.get(cacheKey)!;
		}

		consola.debug("Analyzing project structure for AI generation context...");

		const analysis = {
			architecture: await this.detectArchitecture(projectPath),
			patterns: await this.detectExistingPatterns(projectPath),
			components: await this.indexComponents(projectPath),
			dependencies: await this.analyzeDependencies(projectPath),
			standards: await this.detectCodingStandards(projectPath),
			compliance: await this.detectComplianceRequirements(projectPath),
		};

		this.projectAnalysisCache.set(cacheKey, analysis);
		return analysis;
	}

	/**
	 * Recognize existing patterns in the codebase
	 * Story 1.2: Implement existing pattern recognition
	 */
	async recognizePatterns(
		projectPath: string,
		componentType?: string,
	): Promise<{
		detectedPatterns: Array<{
			name: string;
			confidence: number;
			examples: string[];
			recommendation: string;
		}>;
		suggestedPatterns: Array<{
			name: string;
			reason: string;
			benefits: string[];
		}>;
		missingPatterns: Array<{
			name: string;
			impact: string;
			implementation: string;
		}>;
	}> {
		consola.debug("Recognizing patterns in codebase...");

		const detectedPatterns = await this.detectCodebasePatterns(
			projectPath,
			componentType,
		);
		const suggestedPatterns = await this.suggestMissingPatterns(
			detectedPatterns,
			componentType,
		);
		const missingPatterns = await this.identifyPatternGaps(
			detectedPatterns,
			componentType,
		);

		return {
			detectedPatterns,
			suggestedPatterns,
			missingPatterns,
		};
	}

	/**
	 * Optimize AI prompts based on project context
	 * Story 1.2: Create AI prompt optimization system
	 */
	async optimizePrompt(
		basePrompt: string,
		context: {
			componentName: string;
			componentType: string;
			projectPath: string;
			requirements?: string[];
		},
	): Promise<{
		optimizedPrompt: string;
		contextualHints: string[];
		validationCriteria: string[];
		qualityMetrics: string[];
	}> {
		consola.debug("Optimizing AI prompt with project context...");

		// Analyze project for context
		const projectAnalysis = await this.analyzeProjectStructure(
			context.projectPath,
		);

		// Get component specification
		const spec = await this.loadSpecification(
			context.componentName,
			context.componentType,
		);

		// Build contextual hints
		const contextualHints = this.buildContextualHints(
			projectAnalysis,
			spec,
			context,
		);

		// Optimize the prompt
		const optimizedPrompt = this.enhancePromptWithContext(
			basePrompt,
			contextualHints,
			projectAnalysis,
			spec,
		);

		// Define validation criteria
		const validationCriteria = this.buildValidationCriteria(
			projectAnalysis,
			spec,
			context,
		);

		// Define quality metrics
		const qualityMetrics = this.buildQualityMetrics(projectAnalysis, spec);

		return {
			optimizedPrompt,
			contextualHints,
			validationCriteria,
			qualityMetrics,
		};
	}

	/**
	 * Perform compliance checking via AI integration
	 * Story 1.2: Implement compliance checking via AI integration
	 */
	async checkCompliance(
		code: string,
		componentName: string,
		complianceTypes: ("accessibility" | "norwegian" | "gdpr" | "security")[],
	): Promise<{
		overallScore: number;
		checks: Array<{
			type: string;
			passed: boolean;
			score: number;
			issues: string[];
			recommendations: string[];
			aiAnalysis?: string;
		}>;
		summary: {
			passed: number;
			failed: number;
			warnings: number;
		};
	}> {
		consola.debug(
			`Running compliance checks for ${componentName}: ${complianceTypes.join(", ")}`,
		);

		const checks = [];
		let totalScore = 0;

		for (const type of complianceTypes) {
			const check = await this.runComplianceCheck(code, componentName, type);
			checks.push(check);
			totalScore += check.score;
		}

		const overallScore = totalScore / complianceTypes.length;
		const summary = {
			passed: checks.filter((c) => c.passed).length,
			failed: checks.filter((c) => !c.passed && c.issues.length > 0).length,
			warnings: checks.filter((c) => c.issues.length > 0 && c.passed).length,
		};

		return {
			overallScore,
			checks,
			summary,
		};
	}

	/**
	 * Validate accessibility via AI
	 * Story 1.2: Create accessibility validation via AI
	 */
	async validateAccessibility(
		code: string,
		componentName: string,
		targetLevel: "A" | "AA" | "AAA" = "AAA",
	): Promise<{
		level: "A" | "AA" | "AAA";
		score: number;
		checks: Array<{
			rule: string;
			passed: boolean;
			message: string;
			suggestion?: string;
			aiRecommendation?: string;
		}>;
		aiAnalysis: {
			strengths: string[];
			weaknesses: string[];
			improvements: string[];
		};
	}> {
		consola.debug(
			`Validating accessibility for ${componentName} (target: WCAG ${targetLevel})`,
		);

		// Get accessibility specification
		const spec = await this.loadSpecification(componentName);
		const a11ySpec = spec?.accessibility;

		// Run accessibility checks
		const checks = await this.runAccessibilityChecks(
			code,
			targetLevel,
			a11ySpec,
		);

		// Calculate score and level
		const passedChecks = checks.filter((c) => c.passed).length;
		const score = (passedChecks / checks.length) * 100;
		const level = this.determineAccessibilityLevel(checks);

		// Generate AI analysis
		const aiAnalysis = await this.generateAccessibilityAnalysis(
			code,
			checks,
			targetLevel,
		);

		return {
			level,
			score,
			checks,
			aiAnalysis,
		};
	}

	// Helper methods for enhanced functionality
	private async detectArchitecture(projectPath: string): Promise<string> {
		const patterns = {
			"Clean Architecture": ["src/entities", "src/use-cases", "src/adapters"],
			"Hexagonal Architecture": [
				"src/domain",
				"src/infrastructure",
				"src/application",
			],
			"Layered Architecture": [
				"src/controllers",
				"src/services",
				"src/repositories",
			],
			"Component-Based": ["src/components", "src/hooks"],
			"Feature-Based": ["src/features", "src/modules"],
		};

		for (const [name, dirs] of Object.entries(patterns)) {
			const exists = await Promise.all(
				dirs.map((dir) => this.directoryExists(path.join(projectPath, dir))),
			);
			if (exists.some(Boolean)) {
				return name;
			}
		}

		return "Standard";
	}

	private async detectExistingPatterns(projectPath: string): Promise<string[]> {
		const patterns: string[] = [];

		// Check for common patterns
		const patternChecks = [
			{ pattern: "Custom Hooks", path: "src/hooks" },
			{ pattern: "Context Providers", path: "src/contexts" },
			{ pattern: "HOC Pattern", path: "src/hoc" },
			{ pattern: "Render Props", indicator: "render" },
			{ pattern: "Compound Components", indicator: "Children" },
		];

		for (const check of patternChecks) {
			if (
				check.path &&
				(await this.directoryExists(path.join(projectPath, check.path)))
			) {
				patterns.push(check.pattern);
			}
		}

		return patterns;
	}

	private async indexComponents(projectPath: string): Promise<string[]> {
		const components: string[] = [];
		const componentDirs = ["src/components", "components", "src/app"];

		for (const dir of componentDirs) {
			const fullPath = path.join(projectPath, dir);
			if (await this.directoryExists(fullPath)) {
				try {
					const files = await this.getFilesRecursively(fullPath);
					const componentFiles = files.filter(
						(f) => f.endsWith(".tsx") || f.endsWith(".jsx"),
					);
					components.push(
						...componentFiles.map((f) => path.basename(f, path.extname(f))),
					);
				} catch (error) {
					consola.debug(`Failed to index components in ${dir}:`, error);
				}
			}
		}

		return [...new Set(components)];
	}

	private async analyzeDependencies(projectPath: string): Promise<string[]> {
		try {
			const packageJsonPath = path.join(projectPath, "package.json");
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, "utf-8"),
			);
			return Object.keys({
				...packageJson.dependencies,
				...packageJson.devDependencies,
			});
		} catch {
			return [];
		}
	}

	private async detectCodingStandards(projectPath: string): Promise<string[]> {
		const standards: string[] = [];
		const checks = [
			{ file: ".eslintrc.json", standard: "ESLint" },
			{ file: "prettier.config.js", standard: "Prettier" },
			{ file: "tsconfig.json", standard: "TypeScript" },
			{ file: ".husky", standard: "Pre-commit Hooks" },
		];

		for (const check of checks) {
			if (await this.fileExists(path.join(projectPath, check.file))) {
				standards.push(check.standard);
			}
		}

		return standards;
	}

	private async detectComplianceRequirements(
		projectPath: string,
	): Promise<string[]> {
		const compliance: string[] = [];

		// Check for accessibility tools
		const deps = await this.analyzeDependencies(projectPath);
		if (deps.some((d) => d.includes("axe") || d.includes("aria"))) {
			compliance.push("Accessibility");
		}

		// Check for Norwegian compliance patterns
		if (await this.directoryExists(path.join(projectPath, "src/compliance"))) {
			compliance.push("Norwegian Compliance");
		}

		// Check for GDPR patterns
		if (await this.directoryExists(path.join(projectPath, "src/privacy"))) {
			compliance.push("GDPR");
		}

		return compliance;
	}

	private async detectCodebasePatterns(
		projectPath: string,
		componentType?: string,
	): Promise<
		Array<{
			name: string;
			confidence: number;
			examples: string[];
			recommendation: string;
		}>
	> {
		// Simplified pattern detection - in real implementation, this would be more sophisticated
		const patterns = [];

		// Detect React patterns
		const components = await this.indexComponents(projectPath);
		if (components.length > 5) {
			patterns.push({
				name: "Component Composition",
				confidence: 0.8,
				examples: components.slice(0, 3),
				recommendation: "Continue using component composition patterns",
			});
		}

		return patterns;
	}

	private async suggestMissingPatterns(
		detectedPatterns: any[],
		componentType?: string,
	): Promise<
		Array<{
			name: string;
			reason: string;
			benefits: string[];
		}>
	> {
		const suggestions = [];

		// Suggest patterns based on what's missing
		if (!detectedPatterns.some((p) => p.name.includes("Hook"))) {
			suggestions.push({
				name: "Custom Hooks",
				reason: "No custom hooks detected",
				benefits: ["Code reuse", "Logic separation", "Testability"],
			});
		}

		return suggestions;
	}

	private async identifyPatternGaps(
		detectedPatterns: any[],
		componentType?: string,
	): Promise<
		Array<{
			name: string;
			impact: string;
			implementation: string;
		}>
	> {
		return [
			{
				name: "Error Boundaries",
				impact: "Improved error handling and user experience",
				implementation: "Add React error boundary components",
			},
		];
	}

	private buildContextualHints(
		projectAnalysis: any,
		spec: ComponentSpecification | null,
		context: any,
	): string[] {
		const hints: string[] = [];

		hints.push(`Project uses ${projectAnalysis.architecture} architecture`);
		hints.push(`Existing patterns: ${projectAnalysis.patterns.join(", ")}`);
		hints.push(`Coding standards: ${projectAnalysis.standards.join(", ")}`);

		if (spec?.ai?.optimization?.hints) {
			hints.push(...spec.ai.optimization.hints);
		}

		return hints;
	}

	private enhancePromptWithContext(
		basePrompt: string,
		contextualHints: string[],
		projectAnalysis: any,
		spec: ComponentSpecification | null,
	): string {
		const contextSection = `

PROJECT CONTEXT:
- Architecture: ${projectAnalysis.architecture}
- Existing Components: ${projectAnalysis.components.length} components
- Patterns Used: ${projectAnalysis.patterns.join(", ")}
- Standards: ${projectAnalysis.standards.join(", ")}
- Compliance: ${projectAnalysis.compliance.join(", ")}

CONTEXTUAL HINTS:
${contextualHints.map((hint) => `- ${hint}`).join("\n")}

GENERATION REQUIREMENTS:
- Follow existing project patterns
- Maintain consistency with codebase
- Apply project-specific standards
- Ensure compliance requirements are met
`;

		return basePrompt + contextSection;
	}

	private buildValidationCriteria(
		projectAnalysis: any,
		spec: ComponentSpecification | null,
		context: any,
	): string[] {
		const criteria: string[] = [];

		criteria.push("Code compiles without TypeScript errors");
		criteria.push("Follows project architecture patterns");
		criteria.push("Includes proper accessibility attributes");

		if (spec?.compliance?.wcag) {
			criteria.push(`Meets WCAG ${spec.compliance.wcag.level} standards`);
		}

		if (projectAnalysis.compliance.includes("Norwegian Compliance")) {
			criteria.push("Includes Norwegian compliance features");
		}

		return criteria;
	}

	private buildQualityMetrics(
		projectAnalysis: any,
		spec: ComponentSpecification | null,
	): string[] {
		return [
			"Code quality score > 80",
			"Accessibility compliance > 90%",
			"Performance optimization present",
			"Error handling implemented",
			"TypeScript strict mode compliance",
		];
	}

	private async runComplianceCheck(
		code: string,
		componentName: string,
		type: string,
	): Promise<{
		type: string;
		passed: boolean;
		score: number;
		issues: string[];
		recommendations: string[];
		aiAnalysis?: string;
	}> {
		// Simplified compliance checking - would integrate with AI service in real implementation
		const issues: string[] = [];
		const recommendations: string[] = [];

		switch (type) {
			case "accessibility":
				if (!code.includes("aria-")) {
					issues.push("Missing ARIA attributes");
					recommendations.push("Add appropriate ARIA labels");
				}
				break;
			case "norwegian":
				if (!code.includes("lang=")) {
					issues.push("Missing language specification");
					recommendations.push("Add Norwegian language attributes");
				}
				break;
		}

		const score = Math.max(0, 100 - issues.length * 20);
		const passed = score >= 70;

		return {
			type,
			passed,
			score,
			issues,
			recommendations,
		};
	}

	private async runAccessibilityChecks(
		code: string,
		targetLevel: "A" | "AA" | "AAA",
		a11ySpec?: any,
	): Promise<
		Array<{
			rule: string;
			passed: boolean;
			message: string;
			suggestion?: string;
		}>
	> {
		const checks = [];

		// Basic accessibility checks
		checks.push({
			rule: "WCAG 1.3.1 - Semantic HTML",
			passed: /\b(nav|main|section|article|aside|header|footer)\b/.test(code),
			message: "Use semantic HTML elements",
			suggestion: "Replace div elements with semantic alternatives",
		});

		checks.push({
			rule: "WCAG 2.1.1 - Keyboard Navigation",
			passed: /tabIndex|onKey/.test(code),
			message: "Ensure keyboard accessibility",
			suggestion: "Add tabIndex and keyboard event handlers",
		});

		checks.push({
			rule: "WCAG 4.1.2 - ARIA Labels",
			passed: /aria-\w+/.test(code),
			message: "Include ARIA attributes",
			suggestion: "Add aria-label, aria-describedby, or role attributes",
		});

		return checks;
	}

	private determineAccessibilityLevel(
		checks: Array<{ rule: string; passed: boolean }>,
	): "A" | "AA" | "AAA" {
		const passedCount = checks.filter((c) => c.passed).length;
		const percentage = (passedCount / checks.length) * 100;

		if (percentage >= 95) return "AAA";
		if (percentage >= 85) return "AA";
		return "A";
	}

	private async generateAccessibilityAnalysis(
		code: string,
		checks: any[],
		targetLevel: string,
	): Promise<{
		strengths: string[];
		weaknesses: string[];
		improvements: string[];
	}> {
		const passedChecks = checks.filter((c) => c.passed);
		const failedChecks = checks.filter((c) => !c.passed);

		return {
			strengths: passedChecks.map((c) => c.rule),
			weaknesses: failedChecks.map((c) => c.message),
			improvements: failedChecks.map((c) => c.suggestion).filter(Boolean),
		};
	}

	// Utility methods
	private async directoryExists(dirPath: string): Promise<boolean> {
		try {
			const stat = await fs.stat(dirPath);
			return stat.isDirectory();
		} catch {
			return false;
		}
	}

	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	private async getFilesRecursively(dir: string): Promise<string[]> {
		const files: string[] = [];
		try {
			const entries = await fs.readdir(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					files.push(...(await this.getFilesRecursively(fullPath)));
				} else {
					files.push(fullPath);
				}
			}
		} catch (error) {
			consola.debug(`Failed to read directory ${dir}:`, error);
		}
		return files;
	}

	private getDefaultAIHints(platform: string): string[] {
		const baseHints = [
			"Use semantic HTML elements for better accessibility",
			"Implement proper TypeScript interfaces with readonly props",
			"Add comprehensive error handling with try-catch blocks",
			"Use semantic UI System components instead of hardcoded HTML",
			"Include WCAG AAA accessibility attributes",
			"Support Norwegian compliance with NSM classifications",
			// Enhanced AI hints for better generation
			"Follow existing project patterns and conventions",
			"Implement performance optimizations like React.memo",
			"Include proper JSDoc documentation",
			"Add data-testid attributes for testing",
			"Use consistent naming conventions",
			"Include proper loading and error states",
		];

		const platformHints = {
			react: [
				"Use React.forwardRef for DOM reference access",
				"Implement useCallback for event handlers to prevent re-renders",
				"Use useMemo for expensive calculations",
				"Add proper JSX.Element return type annotation",
				"Implement proper prop validation with TypeScript",
				"Use React.Suspense for lazy-loaded components",
				"Add displayName for better debugging",
			],
			vue: [
				"Use Composition API for better TypeScript support",
				"Implement proper reactivity with ref/reactive",
				"Use defineEmits for event handling",
				"Add proper component props validation",
				"Use defineExpose for component method access",
				"Implement proper lifecycle management",
			],
			angular: [
				"Use standalone components for better tree-shaking",
				"Implement proper OnInit and OnDestroy lifecycle hooks",
				"Use trackBy functions for *ngFor performance",
				"Add proper component input validation",
				"Use OnPush change detection strategy for performance",
				"Implement proper dependency injection",
			],
		};

		return [...baseHints, ...(platformHints[platform] || [])];
	}

	private estimateComplexity(componentName: string): {
		complexity: "simple" | "medium" | "complex";
		estimatedTokens: number;
		priority: "low" | "medium" | "high";
	} {
		const name = componentName.toLowerCase();

		// Simple components
		if (
			["button", "input", "text", "icon", "badge", "divider"].some((simple) =>
				name.includes(simple),
			)
		) {
			return { complexity: "simple", estimatedTokens: 800, priority: "high" };
		}

		// Complex components
		if (
			["table", "datagrid", "calendar", "chart", "editor", "carousel"].some(
				(complex) => name.includes(complex),
			)
		) {
			return {
				complexity: "complex",
				estimatedTokens: 2400,
				priority: "medium",
			};
		}

		// Medium complexity by default
		return { complexity: "medium", estimatedTokens: 1200, priority: "medium" };
	}
}

// Enhanced MCP client instance with AI-native capabilities
export const mcpClient = new MCPClient();
