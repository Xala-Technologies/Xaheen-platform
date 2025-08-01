/**
 * Code Analysis Engine
 *
 * Advanced code analysis system that provides deep insights into code quality,
 * patterns, compliance, and improvement opportunities. Integrates with AI and
 * RAG systems for intelligent analysis.
 *
 * Features:
 * - Comprehensive code quality metrics
 * - Pattern detection and classification
 * - Norwegian compliance analysis
 * - Security vulnerability detection
 * - Performance bottleneck identification
 * - Accessibility audit
 * - Architecture conformance checking
 * - Technical debt assessment
 */

import { parse as parseAST } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { EventEmitter } from "events";
import * as ts from "typescript";
import {
	IConfigurationService,
	IFileSystemService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { PatternMatcher } from "../../rag/pattern-matching/PatternMatcher.js";
import { LocaleCode, NorwegianCompliance } from "../../types/compliance.js";
import { AIServiceFactory } from "../services/AIServiceFactory.js";

/**
 * Code analysis options
 */
export interface ICodeAnalysisOptions {
	includeMetrics?: boolean;
	includePatterns?: boolean;
	includeCompliance?: boolean;
	includeSecurity?: boolean;
	includePerformance?: boolean;
	includeAccessibility?: boolean;
	includeArchitecture?: boolean;
	includeTechnicalDebt?: boolean;
	includeAIInsights?: boolean;
	maxIssues?: number;
	minSeverity?: "info" | "warning" | "error" | "critical";
	locale?: LocaleCode;
}

/**
 * Code quality metrics
 */
export interface ICodeMetrics {
	linesOfCode: number;
	cyclomaticComplexity: number;
	cognitiveComplexity: number;
	maintainabilityIndex: number;
	testCoverage?: number;
	duplicateCodePercentage: number;
	commentDensity: number;
	avgFunctionLength: number;
	maxFunctionLength: number;
	classCount: number;
	functionCount: number;
	importCount: number;
	exportCount: number;
	dependencyDepth: number;
	couplingScore: number;
	cohesionScore: number;
}

/**
 * Code issue
 */
export interface ICodeIssue {
	id: string;
	type:
		| "quality"
		| "pattern"
		| "compliance"
		| "security"
		| "performance"
		| "accessibility"
		| "architecture"
		| "debt";
	severity: "info" | "warning" | "error" | "critical";
	category: string;
	title: string;
	description: string;
	location: {
		file: string;
		line: number;
		column: number;
		endLine?: number;
		endColumn?: number;
	};
	impact: string;
	solution: string;
	effort: "low" | "medium" | "high";
	priority: "low" | "medium" | "high" | "urgent";
	tags: string[];
	references?: string[];
	autoFixable?: boolean;
	fix?: string;
}

/**
 * Pattern classification
 */
export interface IPatternClassification {
	pattern: string;
	category: string;
	instances: number;
	quality: "good" | "neutral" | "bad";
	description: string;
	recommendation?: string;
}

/**
 * Technical debt item
 */
export interface ITechnicalDebtItem {
	id: string;
	type:
		| "design"
		| "implementation"
		| "testing"
		| "documentation"
		| "dependency";
	description: string;
	impact: "low" | "medium" | "high" | "critical";
	effort: number; // hours
	priority: number; // 1-10
	location?: {
		file: string;
		line?: number;
	};
	tags: string[];
}

/**
 * Architecture conformance result
 */
export interface IArchitectureConformance {
	conforms: boolean;
	violations: Array<{
		rule: string;
		description: string;
		severity: "warning" | "error";
		locations: Array<{
			file: string;
			line: number;
		}>;
	}>;
	suggestions: string[];
	score: number; // 0-100
}

/**
 * Code analysis result
 */
export interface ICodeAnalysisResult {
	summary: {
		overallScore: number; // 0-100
		grade: "A" | "B" | "C" | "D" | "F";
		strengths: string[];
		weaknesses: string[];
		topIssues: ICodeIssue[];
	};
	metrics?: ICodeMetrics;
	patterns?: IPatternClassification[];
	issues: ICodeIssue[];
	compliance?: {
		norwegianCompliance: {
			compliant: boolean;
			score: number;
			violations: ICodeIssue[];
		};
		gdprCompliance?: {
			compliant: boolean;
			dataHandlingIssues: ICodeIssue[];
		};
		wcagCompliance?: {
			level: "A" | "AA" | "AAA" | "None";
			violations: ICodeIssue[];
		};
	};
	security?: {
		vulnerabilities: ICodeIssue[];
		riskLevel: "low" | "medium" | "high" | "critical";
	};
	performance?: {
		bottlenecks: ICodeIssue[];
		optimizationOpportunities: ICodeIssue[];
	};
	architecture?: IArchitectureConformance;
	technicalDebt?: {
		totalEffortHours: number;
		items: ITechnicalDebtItem[];
		debtRatio: number;
	};
	aiInsights?: {
		summary: string;
		recommendations: string[];
		refactoringOpportunities: Array<{
			description: string;
			impact: string;
			effort: string;
		}>;
	};
	metadata: {
		analyzedAt: Date;
		duration: number;
		filesAnalyzed: number;
		totalLines: number;
	};
}

/**
 * Code Analysis Engine
 */
export class CodeAnalysisEngine extends EventEmitter {
	private patternMatcher?: PatternMatcher;
	private aiServiceFactory?: AIServiceFactory;
	private initialized = false;

	// Analysis rules and thresholds
	private readonly COMPLEXITY_THRESHOLDS = {
		cyclomatic: { low: 5, medium: 10, high: 20 },
		cognitive: { low: 10, medium: 20, high: 40 },
		functionLength: { low: 20, medium: 50, high: 100 },
		fileLength: { low: 200, medium: 400, high: 800 },
	};

	private readonly QUALITY_THRESHOLDS = {
		maintainabilityIndex: { good: 80, fair: 60, poor: 40 },
		commentDensity: { good: 0.2, fair: 0.1, poor: 0.05 },
		duplicateCode: { good: 0.05, fair: 0.1, poor: 0.2 },
		testCoverage: { good: 0.8, fair: 0.6, poor: 0.4 },
	};

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		private readonly fileSystem: IFileSystemService,
	) {
		super();
	}

	/**
	 * Initialize the engine
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		try {
			this.logger.info("Initializing Code Analysis Engine");

			// Initialize pattern matcher
			this.patternMatcher = new PatternMatcher(this.logger);
			await this.patternMatcher.initialize();

			// Initialize AI services
			this.aiServiceFactory = new AIServiceFactory(
				this.logger,
				this.config,
				this.fileSystem,
			);
			await this.aiServiceFactory.initializeServices();

			this.initialized = true;
			this.emit("initialized");
		} catch (error) {
			this.logger.error(
				"Failed to initialize Code Analysis Engine",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Analyze code
	 */
	async analyzeCode(
		code: string,
		filePath: string,
		options: ICodeAnalysisOptions = {},
	): Promise<ICodeAnalysisResult> {
		await this.ensureInitialized();

		const startTime = Date.now();
		const issues: ICodeIssue[] = [];

		try {
			this.logger.debug("Starting code analysis", { filePath, options });

			// Parse AST
			const ast = this.parseCode(code, filePath);

			// Calculate metrics
			const metrics =
				options.includeMetrics !== false
					? await this.calculateMetrics(ast, code)
					: undefined;

			// Detect patterns
			const patterns =
				options.includePatterns !== false
					? await this.detectPatterns(code, ast)
					: undefined;

			// Check compliance
			const compliance =
				options.includeCompliance !== false
					? await this.checkCompliance(code, ast, options.locale)
					: undefined;

			// Security analysis
			const security =
				options.includeSecurity !== false
					? await this.analyzeSecurityThreats(code, ast)
					: undefined;

			// Performance analysis
			const performance =
				options.includePerformance !== false
					? await this.analyzePerformance(code, ast)
					: undefined;

			// Accessibility analysis
			if (options.includeAccessibility !== false && this.isUICode(code)) {
				const accessibilityIssues = await this.analyzeAccessibility(code, ast);
				issues.push(...accessibilityIssues);
			}

			// Architecture conformance
			const architecture =
				options.includeArchitecture !== false
					? await this.checkArchitectureConformance(code, filePath)
					: undefined;

			// Technical debt assessment
			const technicalDebt =
				options.includeTechnicalDebt !== false
					? await this.assessTechnicalDebt(code, ast, filePath)
					: undefined;

			// AI insights
			const aiInsights =
				options.includeAIInsights !== false
					? await this.getAIInsights(code, metrics, patterns, issues)
					: undefined;

			// Collect all issues
			if (compliance) {
				issues.push(...compliance.norwegianCompliance.violations);
				if (compliance.gdprCompliance) {
					issues.push(...compliance.gdprCompliance.dataHandlingIssues);
				}
				if (compliance.wcagCompliance) {
					issues.push(...compliance.wcagCompliance.violations);
				}
			}

			if (security) {
				issues.push(...security.vulnerabilities);
			}

			if (performance) {
				issues.push(...performance.bottlenecks);
				issues.push(...performance.optimizationOpportunities);
			}

			// Filter and sort issues
			const filteredIssues = this.filterAndSortIssues(issues, options);

			// Calculate overall score and grade
			const { score, grade } = this.calculateOverallScore(
				metrics,
				filteredIssues,
				compliance,
				security,
				architecture,
			);

			// Identify strengths and weaknesses
			const { strengths, weaknesses } = this.identifyStrengthsAndWeaknesses(
				metrics,
				patterns,
				filteredIssues,
			);

			const result: ICodeAnalysisResult = {
				summary: {
					overallScore: score,
					grade,
					strengths,
					weaknesses,
					topIssues: filteredIssues.slice(0, 5),
				},
				metrics,
				patterns,
				issues: filteredIssues,
				compliance,
				security,
				performance,
				architecture,
				technicalDebt,
				aiInsights,
				metadata: {
					analyzedAt: new Date(),
					duration: Date.now() - startTime,
					filesAnalyzed: 1,
					totalLines: code.split("\n").length,
				},
			};

			this.emit("analysisComplete", result);
			return result;
		} catch (error) {
			this.logger.error("Code analysis failed", error as Error);
			throw error;
		}
	}

	/**
	 * Analyze directory
	 */
	async analyzeDirectory(
		directoryPath: string,
		options: ICodeAnalysisOptions = {},
	): Promise<ICodeAnalysisResult[]> {
		await this.ensureInitialized();

		try {
			this.logger.info("Analyzing directory", { directoryPath });

			// Get all analyzable files
			const files = await this.getAnalyzableFiles(directoryPath);
			const results: ICodeAnalysisResult[] = [];

			// Analyze each file
			for (const file of files) {
				try {
					const content = await this.fileSystem.readFile(file);
					const result = await this.analyzeCode(content, file, options);
					results.push(result);
				} catch (error) {
					this.logger.warn(`Failed to analyze file: ${file}`, error as Error);
				}
			}

			return results;
		} catch (error) {
			this.logger.error("Directory analysis failed", error as Error);
			throw error;
		}
	}

	/**
	 * Get real-time insights
	 */
	async getRealTimeInsights(
		code: string,
		cursorPosition: { line: number; column: number },
	): Promise<{
		suggestions: string[];
		warnings: ICodeIssue[];
		quickFixes: Array<{ title: string; fix: string }>;
	}> {
		await this.ensureInitialized();

		try {
			// Parse code up to cursor position
			const partialCode = this.getCodeUpToCursor(code, cursorPosition);
			const ast = this.parseCode(partialCode, "temp.ts");

			// Get context-aware suggestions
			const suggestions = await this.getContextAwareSuggestions(
				ast,
				cursorPosition,
			);

			// Find immediate issues
			const warnings = await this.findImmediateIssues(partialCode, ast);

			// Generate quick fixes
			const quickFixes = await this.generateQuickFixes(warnings, code);

			return { suggestions, warnings, quickFixes };
		} catch (error) {
			this.logger.error("Failed to get real-time insights", error as Error);
			return { suggestions: [], warnings: [], quickFixes: [] };
		}
	}

	// === Private Helper Methods ===

	/**
	 * Ensure engine is initialized
	 */
	private async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
	}

	/**
	 * Parse code into AST
	 */
	private parseCode(code: string, filePath: string): any {
		const isTypeScript = filePath.endsWith(".ts") || filePath.endsWith(".tsx");

		if (isTypeScript) {
			// Use TypeScript parser
			const sourceFile = ts.createSourceFile(
				filePath,
				code,
				ts.ScriptTarget.Latest,
				true,
			);
			return sourceFile;
		} else {
			// Use Babel parser for JavaScript/JSX
			return parseAST(code, {
				sourceType: "module",
				plugins: ["jsx", "typescript"],
			});
		}
	}

	/**
	 * Calculate code metrics
	 */
	private async calculateMetrics(
		ast: any,
		code: string,
	): Promise<ICodeMetrics> {
		const metrics: ICodeMetrics = {
			linesOfCode: 0,
			cyclomaticComplexity: 0,
			cognitiveComplexity: 0,
			maintainabilityIndex: 0,
			duplicateCodePercentage: 0,
			commentDensity: 0,
			avgFunctionLength: 0,
			maxFunctionLength: 0,
			classCount: 0,
			functionCount: 0,
			importCount: 0,
			exportCount: 0,
			dependencyDepth: 0,
			couplingScore: 0,
			cohesionScore: 0,
		};

		// Count lines
		const lines = code.split("\n");
		metrics.linesOfCode = lines.filter((line) => line.trim().length > 0).length;

		// Count comments
		const commentLines = lines.filter(
			(line) =>
				line.trim().startsWith("//") ||
				line.trim().startsWith("/*") ||
				line.trim().startsWith("*"),
		).length;
		metrics.commentDensity = commentLines / metrics.linesOfCode;

		// Analyze AST
		if (ast.kind) {
			// TypeScript AST
			this.analyzeTypeScriptAST(ast, metrics);
		} else {
			// Babel AST
			this.analyzeBabelAST(ast, metrics);
		}

		// Calculate maintainability index
		metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(metrics);

		// Detect duplicate code
		metrics.duplicateCodePercentage = await this.detectDuplicateCode(code);

		return metrics;
	}

	/**
	 * Analyze TypeScript AST
	 */
	private analyzeTypeScriptAST(
		sourceFile: ts.SourceFile,
		metrics: ICodeMetrics,
	): void {
		const functionLengths: number[] = [];
		let complexityStack: number[] = [0];

		const visit = (node: ts.Node): void => {
			// Count imports
			if (ts.isImportDeclaration(node)) {
				metrics.importCount++;
			}

			// Count exports
			if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
				metrics.exportCount++;
			}

			// Count classes
			if (ts.isClassDeclaration(node)) {
				metrics.classCount++;
			}

			// Count functions and calculate complexity
			if (
				ts.isFunctionDeclaration(node) ||
				ts.isMethodDeclaration(node) ||
				ts.isArrowFunction(node)
			) {
				metrics.functionCount++;

				// Calculate function length
				const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
				const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
				const length = end.line - start.line + 1;
				functionLengths.push(length);

				// Start new complexity context
				complexityStack.push(0);
			}

			// Count complexity
			if (
				ts.isIfStatement(node) ||
				ts.isWhileStatement(node) ||
				ts.isForStatement(node) ||
				ts.isDoStatement(node) ||
				ts.isCaseClause(node)
			) {
				complexityStack[complexityStack.length - 1]++;
			}

			ts.forEachChild(node, visit);

			// Pop complexity context for functions
			if (
				ts.isFunctionDeclaration(node) ||
				ts.isMethodDeclaration(node) ||
				ts.isArrowFunction(node)
			) {
				const functionComplexity = complexityStack.pop() || 0;
				metrics.cyclomaticComplexity += functionComplexity + 1;
				metrics.cognitiveComplexity += this.calculateCognitiveComplexity(node);
			}
		};

		visit(sourceFile);

		// Calculate average and max function length
		if (functionLengths.length > 0) {
			metrics.avgFunctionLength =
				functionLengths.reduce((a, b) => a + b, 0) / functionLengths.length;
			metrics.maxFunctionLength = Math.max(...functionLengths);
		}
	}

	/**
	 * Analyze Babel AST
	 */
	private analyzeBabelAST(ast: any, metrics: ICodeMetrics): void {
		const functionLengths: number[] = [];

		traverse(ast, {
			ImportDeclaration() {
				metrics.importCount++;
			},
			ExportNamedDeclaration() {
				metrics.exportCount++;
			},
			ExportDefaultDeclaration() {
				metrics.exportCount++;
			},
			ClassDeclaration() {
				metrics.classCount++;
			},
			FunctionDeclaration(path) {
				metrics.functionCount++;
				const loc = path.node.loc;
				if (loc) {
					functionLengths.push(loc.end.line - loc.start.line + 1);
				}
			},
			ArrowFunctionExpression(path) {
				metrics.functionCount++;
				const loc = path.node.loc;
				if (loc) {
					functionLengths.push(loc.end.line - loc.start.line + 1);
				}
			},
		});

		// Calculate average and max function length
		if (functionLengths.length > 0) {
			metrics.avgFunctionLength =
				functionLengths.reduce((a, b) => a + b, 0) / functionLengths.length;
			metrics.maxFunctionLength = Math.max(...functionLengths);
		}

		// Simple complexity calculation for Babel AST
		metrics.cyclomaticComplexity = this.calculateBabelComplexity(ast);
		metrics.cognitiveComplexity = metrics.cyclomaticComplexity * 1.5; // Approximation
	}

	/**
	 * Calculate cognitive complexity for TypeScript node
	 */
	private calculateCognitiveComplexity(node: ts.Node): number {
		let complexity = 0;
		let nestingLevel = 0;

		const visit = (n: ts.Node): void => {
			// Increment for control flow
			if (
				ts.isIfStatement(n) ||
				ts.isWhileStatement(n) ||
				ts.isForStatement(n)
			) {
				complexity += 1 + nestingLevel;
				nestingLevel++;
			}

			// Increment for logical operators
			if (ts.isBinaryExpression(n)) {
				const op = n.operatorToken.kind;
				if (
					op === ts.SyntaxKind.AmpersandAmpersandToken ||
					op === ts.SyntaxKind.BarBarToken
				) {
					complexity++;
				}
			}

			ts.forEachChild(n, visit);

			// Decrement nesting level
			if (
				ts.isIfStatement(n) ||
				ts.isWhileStatement(n) ||
				ts.isForStatement(n)
			) {
				nestingLevel--;
			}
		};

		visit(node);
		return complexity;
	}

	/**
	 * Calculate complexity for Babel AST
	 */
	private calculateBabelComplexity(ast: any): number {
		let complexity = 1; // Base complexity

		traverse(ast, {
			IfStatement() {
				complexity++;
			},
			WhileStatement() {
				complexity++;
			},
			ForStatement() {
				complexity++;
			},
			DoWhileStatement() {
				complexity++;
			},
			SwitchCase() {
				complexity++;
			},
			ConditionalExpression() {
				complexity++;
			},
			LogicalExpression(path) {
				if (path.node.operator === "&&" || path.node.operator === "||") {
					complexity++;
				}
			},
		});

		return complexity;
	}

	/**
	 * Calculate maintainability index
	 */
	private calculateMaintainabilityIndex(metrics: ICodeMetrics): number {
		// Microsoft's maintainability index formula (simplified)
		const halsteadVolume = metrics.linesOfCode * Math.log2(metrics.linesOfCode);
		const cyclomaticComplexity = metrics.cyclomaticComplexity || 1;
		const linesOfCode = metrics.linesOfCode || 1;

		const maintainabilityIndex = Math.max(
			0,
			((171 -
				5.2 * Math.log(halsteadVolume) -
				0.23 * cyclomaticComplexity -
				16.2 * Math.log(linesOfCode)) *
				100) /
				171,
		);

		return Math.round(maintainabilityIndex);
	}

	/**
	 * Detect duplicate code
	 */
	private async detectDuplicateCode(code: string): Promise<number> {
		// Simple duplicate detection using line hashing
		const lines = code.split("\n").filter((line) => line.trim().length > 0);
		const lineHashes = new Map<string, number>();
		let duplicateLines = 0;

		for (const line of lines) {
			const normalized = line.trim().replace(/\s+/g, " ");
			if (normalized.length > 10) {
				// Ignore very short lines
				const count = lineHashes.get(normalized) || 0;
				if (count > 0) {
					duplicateLines++;
				}
				lineHashes.set(normalized, count + 1);
			}
		}

		return duplicateLines / lines.length;
	}

	/**
	 * Detect code patterns
	 */
	private async detectPatterns(
		code: string,
		ast: any,
	): Promise<IPatternClassification[]> {
		const patterns: IPatternClassification[] = [];

		// Use pattern matcher for advanced pattern detection
		const detectedPatterns = await this.patternMatcher!.analyzeCode(code);

		// Classify patterns
		for (const pattern of detectedPatterns) {
			patterns.push({
				pattern: pattern.pattern.name,
				category: pattern.pattern.category,
				instances: 1,
				quality: this.classifyPatternQuality(pattern.pattern),
				description: pattern.pattern.description,
				recommendation: pattern.pattern.recommendation,
			});
		}

		// Add manual pattern detection
		const manualPatterns = this.detectManualPatterns(code, ast);
		patterns.push(...manualPatterns);

		return patterns;
	}

	/**
	 * Classify pattern quality
	 */
	private classifyPatternQuality(pattern: any): "good" | "neutral" | "bad" {
		const goodPatterns = ["singleton", "factory", "observer", "strategy"];
		const badPatterns = ["god-object", "spaghetti", "copy-paste"];

		if (goodPatterns.some((p) => pattern.name.toLowerCase().includes(p))) {
			return "good";
		}
		if (badPatterns.some((p) => pattern.name.toLowerCase().includes(p))) {
			return "bad";
		}
		return "neutral";
	}

	/**
	 * Detect manual patterns
	 */
	private detectManualPatterns(
		code: string,
		ast: any,
	): IPatternClassification[] {
		const patterns: IPatternClassification[] = [];

		// React hooks pattern
		if (code.includes("useState") || code.includes("useEffect")) {
			patterns.push({
				pattern: "React Hooks",
				category: "framework",
				instances: (code.match(/use[A-Z]\w*/g) || []).length,
				quality: "good",
				description: "Modern React state management pattern",
			});
		}

		// Async/await pattern
		if (code.includes("async") && code.includes("await")) {
			patterns.push({
				pattern: "Async/Await",
				category: "concurrency",
				instances: (code.match(/async/g) || []).length,
				quality: "good",
				description: "Modern asynchronous programming pattern",
			});
		}

		// Error handling pattern
		if (code.includes("try") && code.includes("catch")) {
			patterns.push({
				pattern: "Try-Catch",
				category: "error-handling",
				instances: (code.match(/try\s*{/g) || []).length,
				quality: "good",
				description: "Proper error handling pattern",
			});
		}

		return patterns;
	}

	/**
	 * Check compliance
	 */
	private async checkCompliance(
		code: string,
		ast: any,
		locale?: LocaleCode,
	): Promise<any> {
		// Check Norwegian compliance
		const complianceIssues = await this.patternMatcher!.detectComplianceIssues(
			code,
			locale,
		);

		const norwegianViolations: ICodeIssue[] = complianceIssues.map(
			(issue, index) => ({
				id: `compliance-norwegian-${index}`,
				type: "compliance",
				severity: issue.severity as any,
				category: "norwegian-compliance",
				title: issue.rule,
				description: issue.description,
				location: {
					file: "current",
					line: issue.location.line,
					column: issue.location.column,
				},
				impact: "Compliance violation may lead to legal issues",
				solution: issue.solution,
				effort: "medium",
				priority: issue.severity === "critical" ? "urgent" : "high",
				tags: ["compliance", "norwegian", issue.rule.toLowerCase()],
				autoFixable: issue.autoFixable,
			}),
		);

		// GDPR compliance check
		const gdprIssues = this.checkGDPRCompliance(code);

		// WCAG compliance check
		const wcagIssues = this.isUICode(code)
			? await this.checkWCAGCompliance(code)
			: [];

		return {
			norwegianCompliance: {
				compliant: norwegianViolations.length === 0,
				score: Math.max(0, 100 - norwegianViolations.length * 10),
				violations: norwegianViolations,
			},
			gdprCompliance:
				gdprIssues.length > 0
					? {
							compliant: false,
							dataHandlingIssues: gdprIssues,
						}
					: undefined,
			wcagCompliance:
				wcagIssues.length > 0
					? {
							level: "None" as const,
							violations: wcagIssues,
						}
					: undefined,
		};
	}

	/**
	 * Check GDPR compliance
	 */
	private checkGDPRCompliance(code: string): ICodeIssue[] {
		const issues: ICodeIssue[] = [];
		const gdprKeywords = [
			"personalData",
			"userData",
			"email",
			"phone",
			"address",
			"ssn",
			"socialSecurity",
			"creditCard",
			"bankAccount",
		];

		gdprKeywords.forEach((keyword, index) => {
			if (code.toLowerCase().includes(keyword.toLowerCase())) {
				// Check if data is properly handled
				const hasEncryption =
					code.includes("encrypt") || code.includes("crypto");
				const hasConsent =
					code.includes("consent") || code.includes("permission");
				const hasAudit = code.includes("audit") || code.includes("log");

				if (!hasEncryption) {
					issues.push({
						id: `gdpr-encryption-${index}`,
						type: "compliance",
						severity: "error",
						category: "gdpr",
						title: "Unencrypted Personal Data",
						description: `Personal data field "${keyword}" appears to be handled without encryption`,
						location: {
							file: "current",
							line: 1,
							column: 1,
						},
						impact: "GDPR violation - personal data must be encrypted",
						solution:
							"Implement encryption for personal data storage and transmission",
						effort: "high",
						priority: "urgent",
						tags: ["gdpr", "security", "encryption"],
					});
				}

				if (!hasConsent) {
					issues.push({
						id: `gdpr-consent-${index}`,
						type: "compliance",
						severity: "warning",
						category: "gdpr",
						title: "Missing Consent Handling",
						description: `Personal data "${keyword}" processed without explicit consent handling`,
						location: {
							file: "current",
							line: 1,
							column: 1,
						},
						impact:
							"GDPR requires explicit consent for personal data processing",
						solution:
							"Implement consent management before processing personal data",
						effort: "medium",
						priority: "high",
						tags: ["gdpr", "consent", "privacy"],
					});
				}
			}
		});

		return issues;
	}

	/**
	 * Check WCAG compliance
	 */
	private async checkWCAGCompliance(code: string): Promise<ICodeIssue[]> {
		const issues: ICodeIssue[] = [];

		// Check for missing ARIA labels
		const buttonRegex = /<button[^>]*>/gi;
		const buttons = code.match(buttonRegex) || [];

		buttons.forEach((button, index) => {
			if (
				!button.includes("aria-label") &&
				!button.includes("aria-labelledby")
			) {
				issues.push({
					id: `wcag-aria-button-${index}`,
					type: "accessibility",
					severity: "error",
					category: "wcag",
					title: "Missing ARIA Label",
					description: "Button element missing accessible label",
					location: {
						file: "current",
						line: 1,
						column: 1,
					},
					impact: "Screen reader users cannot understand button purpose",
					solution: "Add aria-label or aria-labelledby attribute",
					effort: "low",
					priority: "high",
					tags: ["wcag", "aria", "accessibility"],
					autoFixable: true,
				});
			}
		});

		// Check for missing alt text
		const imgRegex = /<img[^>]*>/gi;
		const images = code.match(imgRegex) || [];

		images.forEach((img, index) => {
			if (!img.includes("alt=")) {
				issues.push({
					id: `wcag-alt-text-${index}`,
					type: "accessibility",
					severity: "error",
					category: "wcag",
					title: "Missing Alt Text",
					description: "Image element missing alternative text",
					location: {
						file: "current",
						line: 1,
						column: 1,
					},
					impact: "Images are not accessible to screen reader users",
					solution: "Add descriptive alt attribute",
					effort: "low",
					priority: "high",
					tags: ["wcag", "alt-text", "accessibility"],
					autoFixable: true,
				});
			}
		});

		return issues;
	}

	/**
	 * Analyze security threats
	 */
	private async analyzeSecurityThreats(code: string, ast: any): Promise<any> {
		const vulnerabilities: ICodeIssue[] = [];

		// SQL Injection check
		if (code.includes("query") && code.includes("${")) {
			vulnerabilities.push({
				id: "security-sql-injection",
				type: "security",
				severity: "critical",
				category: "injection",
				title: "Potential SQL Injection",
				description:
					"String interpolation in database queries can lead to SQL injection",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Attackers could manipulate database queries",
				solution: "Use parameterized queries or prepared statements",
				effort: "medium",
				priority: "urgent",
				tags: ["security", "sql-injection", "owasp"],
			});
		}

		// XSS check
		if (
			code.includes("dangerouslySetInnerHTML") ||
			(code.includes("innerHTML") && !code.includes("sanitize"))
		) {
			vulnerabilities.push({
				id: "security-xss",
				type: "security",
				severity: "critical",
				category: "xss",
				title: "Potential XSS Vulnerability",
				description: "Unsafe HTML rendering can lead to cross-site scripting",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Attackers could execute malicious scripts",
				solution: "Sanitize HTML content before rendering",
				effort: "medium",
				priority: "urgent",
				tags: ["security", "xss", "owasp"],
			});
		}

		// Hardcoded secrets check
		const secretPatterns = [
			/apiKey\s*[:=]\s*['"][^'"]+['"]/gi,
			/password\s*[:=]\s*['"][^'"]+['"]/gi,
			/secret\s*[:=]\s*['"][^'"]+['"]/gi,
			/token\s*[:=]\s*['"][^'"]+['"]/gi,
		];

		secretPatterns.forEach((pattern, index) => {
			if (pattern.test(code)) {
				vulnerabilities.push({
					id: `security-hardcoded-secret-${index}`,
					type: "security",
					severity: "critical",
					category: "secrets",
					title: "Hardcoded Secret",
					description: "Sensitive data should not be hardcoded",
					location: {
						file: "current",
						line: 1,
						column: 1,
					},
					impact: "Exposed credentials can be exploited",
					solution: "Use environment variables or secure key management",
					effort: "low",
					priority: "urgent",
					tags: ["security", "secrets", "credentials"],
				});
			}
		});

		const riskLevel = vulnerabilities.some((v) => v.severity === "critical")
			? "critical"
			: vulnerabilities.some((v) => v.severity === "error")
				? "high"
				: vulnerabilities.length > 0
					? "medium"
					: "low";

		return {
			vulnerabilities,
			riskLevel,
		};
	}

	/**
	 * Analyze performance
	 */
	private async analyzePerformance(code: string, ast: any): Promise<any> {
		const bottlenecks: ICodeIssue[] = [];
		const optimizationOpportunities: ICodeIssue[] = [];

		// Check for inefficient loops
		if (code.includes(".forEach") && code.includes(".map")) {
			optimizationOpportunities.push({
				id: "perf-chain-methods",
				type: "performance",
				severity: "warning",
				category: "optimization",
				title: "Chained Array Methods",
				description: "Multiple array iterations can be combined",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Unnecessary iterations impact performance",
				solution: "Combine array operations into a single iteration",
				effort: "low",
				priority: "medium",
				tags: ["performance", "optimization", "arrays"],
			});
		}

		// Check for unnecessary re-renders (React)
		if (
			code.includes("useState") &&
			!code.includes("useMemo") &&
			!code.includes("useCallback")
		) {
			optimizationOpportunities.push({
				id: "perf-react-memoization",
				type: "performance",
				severity: "info",
				category: "react",
				title: "Missing Memoization",
				description: "Consider memoizing expensive computations or callbacks",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Unnecessary re-renders can impact performance",
				solution:
					"Use useMemo for expensive computations and useCallback for functions",
				effort: "medium",
				priority: "low",
				tags: ["performance", "react", "memoization"],
			});
		}

		// Check for synchronous operations that could be async
		if (code.includes("readFileSync") || code.includes("writeFileSync")) {
			bottlenecks.push({
				id: "perf-sync-io",
				type: "performance",
				severity: "error",
				category: "io",
				title: "Synchronous I/O Operation",
				description: "Synchronous file operations block the event loop",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Blocks other operations from executing",
				solution: "Use asynchronous file operations",
				effort: "low",
				priority: "high",
				tags: ["performance", "io", "async"],
			});
		}

		return {
			bottlenecks,
			optimizationOpportunities,
		};
	}

	/**
	 * Analyze accessibility
	 */
	private async analyzeAccessibility(
		code: string,
		ast: any,
	): Promise<ICodeIssue[]> {
		const issues: ICodeIssue[] = [];

		// Check for keyboard navigation
		if (code.includes("onClick") && !code.includes("onKeyDown")) {
			issues.push({
				id: "a11y-keyboard-nav",
				type: "accessibility",
				severity: "warning",
				category: "keyboard",
				title: "Missing Keyboard Support",
				description: "Interactive elements should support keyboard navigation",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Keyboard users cannot interact with element",
				solution: "Add onKeyDown handler for Enter and Space keys",
				effort: "low",
				priority: "medium",
				tags: ["accessibility", "keyboard", "wcag"],
			});
		}

		// Check for focus indicators
		if (code.includes("outline: none") || code.includes("outline:none")) {
			issues.push({
				id: "a11y-focus-indicator",
				type: "accessibility",
				severity: "error",
				category: "focus",
				title: "Removed Focus Indicator",
				description: "Focus indicators must be visible for keyboard navigation",
				location: {
					file: "current",
					line: 1,
					column: 1,
				},
				impact: "Keyboard users cannot see focused element",
				solution: "Provide visible focus indicator or custom focus styles",
				effort: "low",
				priority: "high",
				tags: ["accessibility", "focus", "wcag"],
			});
		}

		return issues;
	}

	/**
	 * Check architecture conformance
	 */
	private async checkArchitectureConformance(
		code: string,
		filePath: string,
	): Promise<IArchitectureConformance> {
		const violations: any[] = [];
		const suggestions: string[] = [];

		// Check layer violations
		if (filePath.includes("/domain/") && code.includes('from "../ui/')) {
			violations.push({
				rule: "layer-dependency",
				description: "Domain layer should not depend on UI layer",
				severity: "error" as const,
				locations: [
					{
						file: filePath,
						line: 1,
					},
				],
			});
		}

		// Check naming conventions
		if (filePath.endsWith(".tsx") && !code.includes("export const")) {
			suggestions.push("React components should be exported as named exports");
		}

		// Check interface segregation
		const interfaceRegex = /interface\s+\w+\s*{[^}]*}/g;
		const interfaces = code.match(interfaceRegex) || [];

		interfaces.forEach((iface) => {
			const methodCount = (iface.match(/\w+\s*\(/g) || []).length;
			if (methodCount > 5) {
				violations.push({
					rule: "interface-segregation",
					description: "Interface has too many methods, consider splitting",
					severity: "warning" as const,
					locations: [
						{
							file: filePath,
							line: 1,
						},
					],
				});
			}
		});

		const score = Math.max(0, 100 - violations.length * 10);

		return {
			conforms: violations.length === 0,
			violations,
			suggestions,
			score,
		};
	}

	/**
	 * Assess technical debt
	 */
	private async assessTechnicalDebt(
		code: string,
		ast: any,
		filePath: string,
	): Promise<any> {
		const items: ITechnicalDebtItem[] = [];

		// Check for TODOs and FIXMEs
		const todoRegex = /\/\/\s*(TODO|FIXME|HACK|XXX):?\s*(.+)/gi;
		let match;
		while ((match = todoRegex.exec(code)) !== null) {
			items.push({
				id: `debt-todo-${items.length}`,
				type: "implementation",
				description: match[2],
				impact: "medium",
				effort: 2, // hours
				priority: match[1] === "FIXME" ? 8 : 5,
				location: {
					file: filePath,
					line: code.substring(0, match.index).split("\n").length,
				},
				tags: ["todo", match[1].toLowerCase()],
			});
		}

		// Check for deprecated APIs
		if (code.includes("@deprecated")) {
			items.push({
				id: "debt-deprecated",
				type: "dependency",
				description: "Using deprecated APIs",
				impact: "high",
				effort: 4,
				priority: 7,
				location: { file: filePath },
				tags: ["deprecated", "migration"],
			});
		}

		// Check for missing tests
		if (!filePath.includes(".test.") && !filePath.includes(".spec.")) {
			items.push({
				id: "debt-missing-tests",
				type: "testing",
				description: "Missing unit tests for this module",
				impact: "high",
				effort: 8,
				priority: 6,
				location: { file: filePath },
				tags: ["testing", "coverage"],
			});
		}

		const totalEffortHours = items.reduce((sum, item) => sum + item.effort, 0);
		const debtRatio = totalEffortHours / (code.split("\n").length * 0.1); // Rough estimate

		return {
			totalEffortHours,
			items,
			debtRatio,
		};
	}

	/**
	 * Get AI insights
	 */
	private async getAIInsights(
		code: string,
		metrics?: ICodeMetrics,
		patterns?: IPatternClassification[],
		issues?: ICodeIssue[],
	): Promise<any> {
		try {
			const aiService = this.aiServiceFactory!.createAICodeGeneratorService();

			// Analyze code with AI
			const analysis = await aiService.analyzeCode(code, {
				nsmClassification: "OPEN",
				gdprCompliant: true,
				wcagLevel: "AAA",
				supportedLanguages: ["nb-NO", "en-US"],
				auditTrail: false,
			});

			// Generate improvement suggestions
			const improvements = await aiService.improveCode(code, {
				nsmClassification: "OPEN",
				gdprCompliant: true,
				wcagLevel: "AAA",
				supportedLanguages: ["nb-NO", "en-US"],
				auditTrail: false,
			});

			const refactoringOpportunities = improvements.improvements.map((imp) => ({
				description: imp.description,
				impact: imp.impact || "Medium impact on code quality",
				effort:
					imp.category === "critical"
						? "high"
						: imp.category === "enhancement"
							? "low"
							: "medium",
			}));

			return {
				summary: analysis.summary,
				recommendations: [
					...analysis.suggestions,
					...improvements.improvements.slice(0, 3).map((i) => i.description),
				],
				refactoringOpportunities,
			};
		} catch (error) {
			this.logger.warn("Failed to get AI insights", error as Error);
			return undefined;
		}
	}

	/**
	 * Filter and sort issues
	 */
	private filterAndSortIssues(
		issues: ICodeIssue[],
		options: ICodeAnalysisOptions,
	): ICodeIssue[] {
		let filtered = issues;

		// Filter by severity
		if (options.minSeverity) {
			const severityOrder = ["info", "warning", "error", "critical"];
			const minIndex = severityOrder.indexOf(options.minSeverity);
			filtered = filtered.filter(
				(issue) => severityOrder.indexOf(issue.severity) >= minIndex,
			);
		}

		// Sort by priority and severity
		filtered.sort((a, b) => {
			const priorityOrder = ["urgent", "high", "medium", "low"];
			const severityOrder = ["critical", "error", "warning", "info"];

			const aPriority = priorityOrder.indexOf(a.priority);
			const bPriority = priorityOrder.indexOf(b.priority);

			if (aPriority !== bPriority) {
				return aPriority - bPriority;
			}

			return (
				severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
			);
		});

		// Limit number of issues
		if (options.maxIssues) {
			filtered = filtered.slice(0, options.maxIssues);
		}

		return filtered;
	}

	/**
	 * Calculate overall score and grade
	 */
	private calculateOverallScore(
		metrics?: ICodeMetrics,
		issues?: ICodeIssue[],
		compliance?: any,
		security?: any,
		architecture?: IArchitectureConformance,
	): { score: number; grade: "A" | "B" | "C" | "D" | "F" } {
		let score = 100;

		// Deduct for metrics
		if (metrics) {
			if (
				metrics.cyclomaticComplexity >
				this.COMPLEXITY_THRESHOLDS.cyclomatic.high
			) {
				score -= 10;
			} else if (
				metrics.cyclomaticComplexity >
				this.COMPLEXITY_THRESHOLDS.cyclomatic.medium
			) {
				score -= 5;
			}

			if (
				metrics.maintainabilityIndex <
				this.QUALITY_THRESHOLDS.maintainabilityIndex.poor
			) {
				score -= 15;
			} else if (
				metrics.maintainabilityIndex <
				this.QUALITY_THRESHOLDS.maintainabilityIndex.fair
			) {
				score -= 8;
			}

			if (
				metrics.duplicateCodePercentage >
				this.QUALITY_THRESHOLDS.duplicateCode.poor
			) {
				score -= 10;
			} else if (
				metrics.duplicateCodePercentage >
				this.QUALITY_THRESHOLDS.duplicateCode.fair
			) {
				score -= 5;
			}
		}

		// Deduct for issues
		if (issues) {
			const criticalCount = issues.filter(
				(i) => i.severity === "critical",
			).length;
			const errorCount = issues.filter((i) => i.severity === "error").length;
			const warningCount = issues.filter(
				(i) => i.severity === "warning",
			).length;

			score -= criticalCount * 10;
			score -= errorCount * 5;
			score -= warningCount * 2;
		}

		// Deduct for compliance
		if (
			compliance?.norwegianCompliance &&
			!compliance.norwegianCompliance.compliant
		) {
			score -= 15;
		}

		// Deduct for security
		if (security?.riskLevel === "critical") {
			score -= 20;
		} else if (security?.riskLevel === "high") {
			score -= 10;
		}

		// Deduct for architecture
		if (architecture && !architecture.conforms) {
			score -= 10;
		}

		score = Math.max(0, Math.min(100, score));

		const grade =
			score >= 90
				? "A"
				: score >= 80
					? "B"
					: score >= 70
						? "C"
						: score >= 60
							? "D"
							: "F";

		return { score: Math.round(score), grade };
	}

	/**
	 * Identify strengths and weaknesses
	 */
	private identifyStrengthsAndWeaknesses(
		metrics?: ICodeMetrics,
		patterns?: IPatternClassification[],
		issues?: ICodeIssue[],
	): { strengths: string[]; weaknesses: string[] } {
		const strengths: string[] = [];
		const weaknesses: string[] = [];

		if (metrics) {
			if (
				metrics.maintainabilityIndex >=
				this.QUALITY_THRESHOLDS.maintainabilityIndex.good
			) {
				strengths.push("High maintainability index");
			}
			if (
				metrics.cyclomaticComplexity <=
				this.COMPLEXITY_THRESHOLDS.cyclomatic.low
			) {
				strengths.push("Low cyclomatic complexity");
			}
			if (
				metrics.commentDensity >= this.QUALITY_THRESHOLDS.commentDensity.good
			) {
				strengths.push("Well-documented code");
			}

			if (
				metrics.maxFunctionLength >
				this.COMPLEXITY_THRESHOLDS.functionLength.high
			) {
				weaknesses.push("Long functions detected");
			}
			if (
				metrics.duplicateCodePercentage >
				this.QUALITY_THRESHOLDS.duplicateCode.fair
			) {
				weaknesses.push("High code duplication");
			}
		}

		if (patterns) {
			const goodPatterns = patterns.filter((p) => p.quality === "good");
			if (goodPatterns.length > 0) {
				strengths.push(`Uses ${goodPatterns.length} good design patterns`);
			}

			const badPatterns = patterns.filter((p) => p.quality === "bad");
			if (badPatterns.length > 0) {
				weaknesses.push(`Contains ${badPatterns.length} anti-patterns`);
			}
		}

		if (issues) {
			const criticalIssues = issues.filter((i) => i.severity === "critical");
			if (criticalIssues.length === 0) {
				strengths.push("No critical issues found");
			} else {
				weaknesses.push(
					`${criticalIssues.length} critical issues require immediate attention`,
				);
			}

			const securityIssues = issues.filter((i) => i.type === "security");
			if (securityIssues.length === 0) {
				strengths.push("No security vulnerabilities detected");
			}
		}

		return { strengths, weaknesses };
	}

	/**
	 * Check if code is UI code
	 */
	private isUICode(code: string): boolean {
		return (
			code.includes("jsx") ||
			code.includes("tsx") ||
			code.includes("React") ||
			code.includes("Vue") ||
			code.includes("Angular") ||
			code.includes("<template>") ||
			code.includes("className=") ||
			code.includes("style=")
		);
	}

	/**
	 * Get analyzable files
	 */
	private async getAnalyzableFiles(directoryPath: string): Promise<string[]> {
		const files: string[] = [];
		const extensions = [".ts", ".tsx", ".js", ".jsx"];

		const scanDirectory = async (dir: string) => {
			const entries = await this.fileSystem.readDirectory(dir);

			for (const entry of entries) {
				const fullPath = `${dir}/${entry}`;
				const isDirectory = !entry.includes(".");

				if (isDirectory && !entry.startsWith(".") && entry !== "node_modules") {
					await scanDirectory(fullPath);
				} else if (extensions.some((ext) => entry.endsWith(ext))) {
					files.push(fullPath);
				}
			}
		};

		await scanDirectory(directoryPath);
		return files;
	}

	/**
	 * Get code up to cursor position
	 */
	private getCodeUpToCursor(
		code: string,
		cursorPosition: { line: number; column: number },
	): string {
		const lines = code.split("\n");
		const relevantLines = lines.slice(0, cursorPosition.line);

		if (relevantLines.length > 0) {
			const lastLine = relevantLines[relevantLines.length - 1];
			relevantLines[relevantLines.length - 1] = lastLine.substring(
				0,
				cursorPosition.column,
			);
		}

		return relevantLines.join("\n");
	}

	/**
	 * Get context-aware suggestions
	 */
	private async getContextAwareSuggestions(
		ast: any,
		cursorPosition: { line: number; column: number },
	): Promise<string[]> {
		const suggestions: string[] = [];

		// Basic suggestions based on context
		suggestions.push("Complete current statement");
		suggestions.push("Add error handling");
		suggestions.push("Extract to function");
		suggestions.push("Add type annotation");

		return suggestions;
	}

	/**
	 * Find immediate issues
	 */
	private async findImmediateIssues(
		code: string,
		ast: any,
	): Promise<ICodeIssue[]> {
		const issues: ICodeIssue[] = [];

		// Check for syntax errors
		if (code.endsWith("{") && !code.includes("}")) {
			issues.push({
				id: "syntax-unclosed-brace",
				type: "quality",
				severity: "error",
				category: "syntax",
				title: "Unclosed brace",
				description: "Missing closing brace",
				location: {
					file: "current",
					line: code.split("\n").length,
					column: code.split("\n").pop()!.length,
				},
				impact: "Code will not compile",
				solution: "Add closing brace }",
				effort: "low",
				priority: "urgent",
				tags: ["syntax"],
				autoFixable: true,
				fix: "}",
			});
		}

		return issues;
	}

	/**
	 * Generate quick fixes
	 */
	private async generateQuickFixes(
		issues: ICodeIssue[],
		code: string,
	): Promise<Array<{ title: string; fix: string }>> {
		const quickFixes: Array<{ title: string; fix: string }> = [];

		for (const issue of issues) {
			if (issue.autoFixable && issue.fix) {
				quickFixes.push({
					title: `Fix: ${issue.title}`,
					fix: issue.fix,
				});
			}
		}

		return quickFixes;
	}
}
