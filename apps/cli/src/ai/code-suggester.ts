import { consola } from "consola";
import type { ProjectConfig, Compliance, UISystem } from "../types";
import type { AIProvider } from "./ai-generator";

// Code suggestion types
export type SuggestionType = 
	| "performance"
	| "security" 
	| "accessibility"
	| "compliance"
	| "best_practices"
	| "refactoring"
	| "testing"
	| "documentation";

// Code suggestion interface
export interface CodeSuggestion {
	type: SuggestionType;
	title: string;
	description: string;
	severity: "low" | "medium" | "high" | "critical";
	file?: string;
	line?: number;
	column?: number;
	originalCode?: string;
	suggestedCode?: string;
	reasoning: string;
	references?: string[];
}

// Analysis context
export interface AnalysisContext {
	projectConfig: ProjectConfig;
	framework: string;
	ui: UISystem;
	compliance: Compliance;
	codebase: string[];
	dependencies: string[];
}

// Suggestion result
export interface SuggestionResult {
	suggestions: CodeSuggestion[];
	summary: {
		total: number;
		bySeverity: Record<string, number>;
		byType: Record<string, number>;
	};
	score: number; // Overall code quality score (0-100)
}

/**
 * Intelligent code suggester for improvements and optimizations
 */
export class CodeSuggester {
	private aiProvider: AIProvider;
	private isEnabled: boolean;

	constructor(aiProvider: AIProvider = "disabled") {
		this.aiProvider = aiProvider;
		this.isEnabled = aiProvider !== "disabled";

		if (!this.isEnabled) {
			consola.info("Code suggestions using static analysis.");
		}
	}

	/**
	 * Analyze code and provide suggestions
	 */
	async analyzeCode(
		code: string,
		context: AnalysisContext,
		filePath?: string
	): Promise<SuggestionResult> {
		try {
			let suggestions: CodeSuggestion[];

			if (this.isEnabled) {
				suggestions = await this.analyzeWithAI(code, context, filePath);
			} else {
				suggestions = this.analyzeWithStaticRules(code, context, filePath);
			}

			const summary = this.generateSummary(suggestions);
			const score = this.calculateQualityScore(suggestions, code);

			return {
				suggestions,
				summary,
				score,
			};
		} catch (error) {
			consola.warn("Code analysis failed, using fallback:", error);
			return this.analyzeWithStaticRules(code, context, filePath);
		}
	}

	/**
	 * Get performance optimization suggestions
	 */
	async getPerformanceSuggestions(
		code: string,
		context: AnalysisContext
	): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];

		// React-specific optimizations
		if (context.framework === "react" || context.framework === "next") {
			suggestions.push(...this.getReactPerformanceSuggestions(code));
		}

		// Bundle size optimizations
		suggestions.push(...this.getBundleSizeSuggestions(code));

		// General performance patterns
		suggestions.push(...this.getGeneralPerformanceSuggestions(code));

		return suggestions;
	}

	/**
	 * Get security recommendations
	 */
	async getSecuritySuggestions(
		code: string,
		context: AnalysisContext
	): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];

		// XSS prevention
		suggestions.push(...this.getXSSPrevention(code));

		// Input validation
		suggestions.push(...this.getInputValidationSuggestions(code));

		// Authentication/Authorization
		suggestions.push(...this.getAuthSuggestions(code));

		// Data encryption
		suggestions.push(...this.getEncryptionSuggestions(code));

		// Norwegian NSM compliance
		if (context.compliance === "nsm") {
			suggestions.push(...this.getNSMComplianceSuggestions(code));
		}

		return suggestions;
	}

	/**
	 * Get accessibility improvement suggestions
	 */
	async getAccessibilitySuggestions(
		code: string,
		context: AnalysisContext
	): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];

		// ARIA attributes
		suggestions.push(...this.getARIASuggestions(code));

		// Semantic HTML
		suggestions.push(...this.getSemanticHTMLSuggestions(code));

		// Keyboard navigation
		suggestions.push(...this.getKeyboardNavSuggestions(code));

		// Color contrast
		suggestions.push(...this.getColorContrastSuggestions(code));

		// WCAG compliance
		if (context.compliance === "wcag") {
			suggestions.push(...this.getWCAGSuggestions(code));
		}

		return suggestions;
	}

	/**
	 * Get architecture improvement recommendations
	 */
	async getArchitectureSuggestions(
		codebase: string[],
		context: AnalysisContext
	): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];

		// Dependency analysis
		suggestions.push(...this.getDependencySuggestions(codebase));

		// Code organization
		suggestions.push(...this.getOrganizationSuggestions(codebase));

		// Pattern recommendations
		suggestions.push(...this.getPatternSuggestions(codebase, context));

		return suggestions;
	}

	/**
	 * Get testing coverage improvements
	 */
	async getTestingSuggestions(
		code: string,
		context: AnalysisContext
	): Promise<CodeSuggestion[]> {
		const suggestions: CodeSuggestion[] = [];

		// Missing tests
		suggestions.push(...this.getMissingTestSuggestions(code));

		// Test quality
		suggestions.push(...this.getTestQualitySuggestions(code));

		// Coverage improvements
		suggestions.push(...this.getCoverageSuggestions(code));

		return suggestions;
	}

	/**
	 * Analyze with AI (placeholder for real AI integration)
	 */
	private async analyzeWithAI(
		code: string,
		context: AnalysisContext,
		filePath?: string
	): Promise<SuggestionResult> {
		// This would integrate with actual AI services in production
		consola.info("AI code analysis (simulated)");
		
		// Fall back to static analysis for now
		return this.analyzeWithStaticRules(code, context, filePath);
	}

	/**
	 * Analyze with static rules
	 */
	private analyzeWithStaticRules(
		code: string,
		context: AnalysisContext,
		filePath?: string
	): SuggestionResult {
		const suggestions: CodeSuggestion[] = [];

		// Performance suggestions
		suggestions.push(...this.getReactPerformanceSuggestions(code));
		suggestions.push(...this.getBundleSizeSuggestions(code));

		// Security suggestions
		suggestions.push(...this.getXSSPrevention(code));
		suggestions.push(...this.getInputValidationSuggestions(code));

		// Accessibility suggestions
		suggestions.push(...this.getARIASuggestions(code));
		suggestions.push(...this.getSemanticHTMLSuggestions(code));

		// Best practices
		suggestions.push(...this.getBestPracticeSuggestions(code, context));

		// Compliance-specific suggestions
		if (context.compliance !== "none") {
			suggestions.push(...this.getComplianceSuggestions(code, context));
		}

		const summary = this.generateSummary(suggestions);
		const score = this.calculateQualityScore(suggestions, code);

		return { suggestions, summary, score };
	}

	/**
	 * React-specific performance suggestions
	 */
	private getReactPerformanceSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// React.memo suggestion
		if (code.includes("export const") && code.includes("props") && !code.includes("React.memo")) {
			suggestions.push({
				type: "performance",
				title: "Consider using React.memo",
				description: "Wrap functional component with React.memo to prevent unnecessary re-renders",
				severity: "medium",
				reasoning: "React.memo can optimize performance by memoizing component renders",
				suggestedCode: "export const Component = React.memo(({ props }) => { ... });",
				references: ["https://reactjs.org/docs/react-api.html#reactmemo"]
			});
		}

		// useCallback suggestion
		if (code.includes("onClick") && !code.includes("useCallback")) {
			suggestions.push({
				type: "performance",
				title: "Use useCallback for event handlers",
				description: "Wrap event handlers with useCallback to prevent unnecessary re-renders",
				severity: "medium",
				reasoning: "useCallback prevents child component re-renders when parent re-renders",
				suggestedCode: "const handleClick = useCallback(() => { ... }, [dependencies]);",
				references: ["https://reactjs.org/docs/hooks-reference.html#usecallback"]
			});
		}

		// useMemo suggestion
		if (code.includes("const") && code.includes("filter") && !code.includes("useMemo")) {
			suggestions.push({
				type: "performance",
				title: "Use useMemo for expensive calculations",
				description: "Wrap expensive computations with useMemo",
				severity: "medium",
				reasoning: "useMemo prevents expensive calculations on every render",
				suggestedCode: "const filteredData = useMemo(() => data.filter(...), [data]);",
				references: ["https://reactjs.org/docs/hooks-reference.html#usememo"]
			});
		}

		return suggestions;
	}

	/**
	 * Bundle size optimization suggestions
	 */
	private getBundleSizeSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Tree shaking improvements
		if (code.includes("import *")) {
			suggestions.push({
				type: "performance",
				title: "Use named imports for tree shaking",
				description: "Replace wildcard imports with specific named imports",
				severity: "medium",
				reasoning: "Named imports enable better tree shaking and smaller bundle size",
				originalCode: "import * as utils from './utils';",
				suggestedCode: "import { specificFunction } from './utils';",
				references: ["https://webpack.js.org/guides/tree-shaking/"]
			});
		}

		// Dynamic imports
		if (code.includes("import") && code.includes("React") && !code.includes("lazy")) {
			suggestions.push({
				type: "performance",
				title: "Consider lazy loading components",
				description: "Use React.lazy for code splitting large components",
				severity: "low",
				reasoning: "Lazy loading reduces initial bundle size",
				suggestedCode: "const Component = React.lazy(() => import('./Component'));",
				references: ["https://reactjs.org/docs/code-splitting.html"]
			});
		}

		return suggestions;
	}

	/**
	 * XSS prevention suggestions
	 */
	private getXSSPrevention(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// dangerouslySetInnerHTML usage
		if (code.includes("dangerouslySetInnerHTML")) {
			suggestions.push({
				type: "security",
				title: "Sanitize HTML content",
				description: "dangerouslySetInnerHTML can introduce XSS vulnerabilities",
				severity: "high",
				reasoning: "Unsanitized HTML can execute malicious scripts",
				suggestedCode: "Use DOMPurify.sanitize() before setting HTML",
				references: ["https://owasp.org/www-community/attacks/xss/"]
			});
		}

		// Direct DOM manipulation
		if (code.includes("innerHTML") || code.includes("outerHTML")) {
			suggestions.push({
				type: "security",
				title: "Avoid direct DOM manipulation",
				description: "Direct innerHTML manipulation can introduce XSS risks",
				severity: "high",
				reasoning: "Use React's JSX or sanitize content before insertion",
				references: ["https://owasp.org/www-community/attacks/xss/"]
			});
		}

		return suggestions;
	}

	/**
	 * Input validation suggestions
	 */
	private getInputValidationSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Missing input validation
		if (code.includes("req.body") && !code.includes("validate")) {
			suggestions.push({
				type: "security",
				title: "Add input validation",
				description: "API endpoints should validate input data",
				severity: "high",
				reasoning: "Unvalidated input can lead to security vulnerabilities",
				suggestedCode: "const validatedData = validateSchema(req.body);",
				references: ["https://owasp.org/www-community/vulnerabilities/Improper_Input_Validation"]
			});
		}

		// SQL injection prevention
		if (code.includes("SELECT") && code.includes("${")) {
			suggestions.push({
				type: "security",
				title: "Use parameterized queries",
				description: "String interpolation in SQL queries can cause injection",
				severity: "critical",
				reasoning: "Parameterized queries prevent SQL injection attacks",
				suggestedCode: "db.query('SELECT * FROM users WHERE id = ?', [userId]);",
				references: ["https://owasp.org/www-community/attacks/SQL_Injection"]
			});
		}

		return suggestions;
	}

	/**
	 * Authentication suggestions
	 */
	private getAuthSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Missing authentication
		if (code.includes("app.post") && !code.includes("auth")) {
			suggestions.push({
				type: "security",
				title: "Add authentication middleware",
				description: "API endpoints should require authentication",
				severity: "high",
				reasoning: "Unprotected endpoints can be accessed by unauthorized users",
				suggestedCode: "app.post('/api/data', authenticateToken, handler);",
				references: ["https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication"]
			});
		}

		// Password handling
		if (code.includes("password") && !code.includes("hash")) {
			suggestions.push({
				type: "security",
				title: "Hash passwords",
				description: "Passwords should be hashed before storage",
				severity: "critical",
				reasoning: "Plain text passwords are a major security risk",
				suggestedCode: "const hashedPassword = await bcrypt.hash(password, 10);",
				references: ["https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure"]
			});
		}

		return suggestions;
	}

	/**
	 * Encryption suggestions
	 */
	private getEncryptionSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Sensitive data handling
		if ((code.includes("email") || code.includes("personal")) && !code.includes("encrypt")) {
			suggestions.push({
				type: "security",
				title: "Encrypt sensitive data",
				description: "Personal information should be encrypted at rest",
				severity: "high",
				reasoning: "Unencrypted personal data violates privacy regulations",
				references: ["https://gdpr.eu/encryption/"]
			});
		}

		return suggestions;
	}

	/**
	 * NSM compliance suggestions
	 */
	private getNSMComplianceSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Security classification
		if (!code.includes("@security-classification")) {
			suggestions.push({
				type: "compliance",
				title: "Add NSM security classification",
				description: "Code should include NSM security classification",
				severity: "medium",
				reasoning: "NSM requires proper security classification of data and code",
				suggestedCode: "// @security-classification: RESTRICTED",
				references: ["https://nsm.no/"]
			});
		}

		return suggestions;
	}

	/**
	 * ARIA accessibility suggestions
	 */
	private getARIASuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Missing aria-label
		if (code.includes("<button") && !code.includes("aria-label")) {
			suggestions.push({
				type: "accessibility",
				title: "Add aria-label to buttons",
				description: "Interactive elements should have accessible labels",
				severity: "medium",
				reasoning: "Screen readers need labels to describe button purpose",
				suggestedCode: '<button aria-label="Description of button action">',
				references: ["https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html"]
			});
		}

		// Missing role attributes
		if (code.includes("<div") && code.includes("onClick") && !code.includes("role=")) {
			suggestions.push({
				type: "accessibility",
				title: "Add role attribute for interactive divs",
				description: "Clickable divs should have proper ARIA roles",
				severity: "medium",
				reasoning: "Assistive technology needs role information for interactive elements",
				suggestedCode: '<div role="button" onClick={handleClick}>',
				references: ["https://www.w3.org/WAI/ARIA/apg/patterns/"]
			});
		}

		return suggestions;
	}

	/**
	 * Semantic HTML suggestions
	 */
	private getSemanticHTMLSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Use semantic elements
		if (code.includes('<div className="header"')) {
			suggestions.push({
				type: "accessibility",
				title: "Use semantic HTML elements",
				description: "Replace div with semantic header element",
				severity: "low",
				reasoning: "Semantic elements provide better structure for screen readers",
				originalCode: '<div className="header">',
				suggestedCode: '<header className="header">',
				references: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header"]
			});
		}

		return suggestions;
	}

	/**
	 * Keyboard navigation suggestions
	 */
	private getKeyboardNavSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Missing tabIndex
		if (code.includes("onClick") && !code.includes("tabIndex")) {
			suggestions.push({
				type: "accessibility",
				title: "Add keyboard navigation support",
				description: "Interactive elements should be keyboard accessible",
				severity: "medium",
				reasoning: "Users should be able to navigate using keyboard",
				suggestedCode: '<div onClick={handler} tabIndex={0} onKeyPress={keyHandler}>',
				references: ["https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html"]
			});
		}

		return suggestions;
	}

	/**
	 * Color contrast suggestions
	 */
	private getColorContrastSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Low contrast colors
		if (code.includes("text-gray-400") || code.includes("text-gray-300")) {
			suggestions.push({
				type: "accessibility",
				title: "Improve color contrast",
				description: "Text color may not meet WCAG contrast requirements",
				severity: "medium",
				reasoning: "Insufficient contrast makes text hard to read",
				suggestedCode: "Use text-gray-600 or darker for better contrast",
				references: ["https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"]
			});
		}

		return suggestions;
	}

	/**
	 * WCAG compliance suggestions
	 */
	private getWCAGSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Missing alt text
		if (code.includes("<img") && !code.includes("alt=")) {
			suggestions.push({
				type: "compliance",
				title: "Add alt text to images",
				description: "Images must have alternative text for WCAG compliance",
				severity: "medium",
				reasoning: "Alt text is required for screen reader accessibility",
				suggestedCode: '<img src="..." alt="Description of image" />',
				references: ["https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html"]
			});
		}

		return suggestions;
	}

	/**
	 * General performance suggestions
	 */
	private getGeneralPerformanceSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Large images
		if (code.includes('src="') && code.includes('.jpg')) {
			suggestions.push({
				type: "performance",
				title: "Optimize images",
				description: "Consider using next-generation image formats",
				severity: "low",
				reasoning: "WebP and AVIF formats provide better compression",
				suggestedCode: "Use Next.js Image component for automatic optimization",
				references: ["https://nextjs.org/docs/api-reference/next/image"]
			});
		}

		return suggestions;
	}

	/**
	 * Best practice suggestions
	 */
	private getBestPracticeSuggestions(code: string, context: AnalysisContext): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// TypeScript usage
		if (!code.includes(": ") && code.includes("function")) {
			suggestions.push({
				type: "best_practices",
				title: "Add TypeScript types",
				description: "Functions should have explicit type annotations",
				severity: "medium",
				reasoning: "Type annotations improve code safety and documentation",
				references: ["https://www.typescriptlang.org/docs/handbook/functions.html"]
			});
		}

		return suggestions;
	}

	/**
	 * Compliance-specific suggestions
	 */
	private getComplianceSuggestions(code: string, context: AnalysisContext): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		if (context.compliance === "gdpr") {
			suggestions.push(...this.getGDPRSuggestions(code));
		}

		return suggestions;
	}

	/**
	 * GDPR compliance suggestions
	 */
	private getGDPRSuggestions(code: string): CodeSuggestion[] {
		const suggestions: CodeSuggestion[] = [];

		// Personal data handling
		if (code.includes("personal") && !code.includes("consent")) {
			suggestions.push({
				type: "compliance",
				title: "Add GDPR consent handling",
				description: "Personal data processing requires user consent",
				severity: "high",
				reasoning: "GDPR requires explicit consent for personal data processing",
				references: ["https://gdpr.eu/consent/"]
			});
		}

		return suggestions;
	}

	/**
	 * Additional analysis methods would go here...
	 */
	private getDependencySuggestions(codebase: string[]): CodeSuggestion[] {
		return [];
	}

	private getOrganizationSuggestions(codebase: string[]): CodeSuggestion[] {
		return [];
	}

	private getPatternSuggestions(codebase: string[], context: AnalysisContext): CodeSuggestion[] {
		return [];
	}

	private getMissingTestSuggestions(code: string): CodeSuggestion[] {
		return [];
	}

	private getTestQualitySuggestions(code: string): CodeSuggestion[] {
		return [];
	}

	private getCoverageSuggestions(code: string): CodeSuggestion[] {
		return [];
	}

	/**
	 * Generate summary of suggestions
	 */
	private generateSummary(suggestions: CodeSuggestion[]) {
		const bySeverity = suggestions.reduce((acc, s) => {
			acc[s.severity] = (acc[s.severity] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byType = suggestions.reduce((acc, s) => {
			acc[s.type] = (acc[s.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			total: suggestions.length,
			bySeverity,
			byType,
		};
	}

	/**
	 * Calculate overall code quality score
	 */
	private calculateQualityScore(suggestions: CodeSuggestion[], code: string): number {
		let score = 100;

		// Deduct points based on severity
		suggestions.forEach(s => {
			switch (s.severity) {
				case "critical":
					score -= 20;
					break;
				case "high":
					score -= 10;
					break;
				case "medium":
					score -= 5;
					break;
				case "low":
					score -= 2;
					break;
			}
		});

		// Bonus points for good practices
		if (code.includes("TypeScript")) score += 5;
		if (code.includes("aria-")) score += 5;
		if (code.includes("useCallback") || code.includes("useMemo")) score += 5;

		return Math.max(0, Math.min(100, score));
	}
}

/**
 * Create code suggester instance
 */
export function createCodeSuggester(aiProvider: AIProvider = "disabled"): CodeSuggester {
	return new CodeSuggester(aiProvider);
}