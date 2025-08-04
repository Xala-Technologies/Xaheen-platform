import { readFileSync } from "fs";
import { logger } from "../utils/logger.js";

export interface ValidationResult {
	readonly isValid: boolean;
	readonly violations: ReadonlyArray<string>;
	readonly suggestions: ReadonlyArray<string>;
	readonly score: number; // 0-100
	readonly details: {
		readonly accessibility: boolean;
		readonly designTokens: boolean;
		readonly localization: boolean;
		readonly typeScript: boolean;
		readonly solidPrinciples: boolean;
		readonly semanticComponents: boolean;
	};
}

export class ComplianceValidator {
	private readonly rules: ReadonlyArray<ComplianceRule>;

	constructor() {
		this.rules = [
			new NoRawHTMLRule(),
			new DesignTokensRule(),
			new LocalizationRule(),
			new AccessibilityRule(),
			new TypeScriptRule(),
			new FileStructureRule(),
			new SemanticComponentsRule(),
			new GridSystemRule(),
		];
	}

	async validateCode(
		code: string,
		platform: string,
	): Promise<ValidationResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const details = {
			accessibility: true,
			designTokens: true,
			localization: true,
			typeScript: true,
			solidPrinciples: true,
			semanticComponents: true,
		};

		for (const rule of this.rules) {
			const result = await rule.validate(code, platform);

			if (!result.passed) {
				violations.push(...result.violations);
				suggestions.push(...result.suggestions);

				// Update details based on rule type
				this.updateDetails(details, rule, false);
			}
		}

		const score = this.calculateScore(violations.length, this.rules.length);
		const isValid = violations.length === 0;

		return {
			isValid,
			violations,
			suggestions,
			score,
			details,
		};
	}

	async validateFile(
		filePath: string,
		platform: string,
	): Promise<ValidationResult> {
		try {
			const code = readFileSync(filePath, "utf-8");
			return await this.validateCode(code, platform);
		} catch (error) {
			logger.error(`Failed to read file ${filePath}:`, error);
			return {
				isValid: false,
				violations: [`Failed to read file: ${filePath}`],
				suggestions: ["Ensure the file exists and is readable"],
				score: 0,
				details: {
					accessibility: false,
					designTokens: false,
					localization: false,
					typeScript: false,
					solidPrinciples: false,
					semanticComponents: false,
				},
			};
		}
	}

	private updateDetails(
		details: any,
		rule: ComplianceRule,
		passed: boolean,
	): void {
		if (rule instanceof AccessibilityRule) {
			details.accessibility = passed;
		} else if (rule instanceof DesignTokensRule) {
			details.designTokens = passed;
		} else if (rule instanceof LocalizationRule) {
			details.localization = passed;
		} else if (rule instanceof TypeScriptRule) {
			details.typeScript = passed;
		} else if (rule instanceof SemanticComponentsRule) {
			details.semanticComponents = passed;
		}
	}

	private calculateScore(violationCount: number, totalRules: number): number {
		if (totalRules === 0) return 100;
		const violationRatio = violationCount / totalRules;
		return Math.max(0, Math.round((1 - violationRatio) * 100));
	}
}

// Base rule interface
interface ComplianceRule {
	validate(code: string, platform: string): Promise<RuleResult>;
}

interface RuleResult {
	readonly passed: boolean;
	readonly violations: ReadonlyArray<string>;
	readonly suggestions: ReadonlyArray<string>;
}

// No raw HTML elements rule
class NoRawHTMLRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const htmlElements = [
			"div",
			"span",
			"p",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"button",
			"input",
			"textarea",
			"select",
			"form",
			"label",
			"ul",
			"ol",
			"li",
			"table",
			"tr",
			"td",
			"th",
			"thead",
			"tbody",
		];

		const violations: string[] = [];
		const suggestions: string[] = [];

		for (const element of htmlElements) {
			const regex = new RegExp(`<${element}[^>]*>`, "gi");
			if (regex.test(code)) {
				violations.push(`Raw HTML element found: <${element}>`);
				suggestions.push(
					`Replace <${element}> with semantic component from @xala-technologies/ui-system`,
				);
			}
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// Design tokens usage rule
class DesignTokensRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		// Check for hardcoded styles
		const hardcodedPatterns = [
			{ pattern: /style\s*=\s*\{/, violation: "Hardcoded inline styles found" },
			{
				pattern: /#[0-9a-fA-F]{3,6}/,
				violation: "Hardcoded color values found",
			},
			{ pattern: /\d+px/, violation: "Hardcoded pixel values found" },
			{ pattern: /margin:\s*\d+/, violation: "Hardcoded margin values found" },
			{
				pattern: /padding:\s*\d+/,
				violation: "Hardcoded padding values found",
			},
		];

		for (const { pattern, violation } of hardcodedPatterns) {
			if (pattern.test(code)) {
				violations.push(violation);
				suggestions.push(
					"Use design tokens instead: tokens.colors.*, tokens.spacing.*, etc.",
				);
			}
		}

		// Check for tokens usage
		const hasTokensImport =
			/import.*useTokens.*@xala-technologies\/ui-system/.test(code);
		const usesTokens = /tokens\.(colors|spacing|typography|borderRadius)/.test(
			code,
		);

		if (!hasTokensImport) {
			violations.push("Missing useTokens import");
			suggestions.push("Import useTokens from @xala-technologies/ui-system");
		}

		if (!usesTokens && hasTokensImport) {
			violations.push("Tokens imported but not used");
			suggestions.push(
				"Use design tokens for styling: tokens.colors.primary, tokens.spacing.medium, etc.",
			);
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// Localization rule
class LocalizationRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		// Check for hardcoded text
		const hardcodedTextPatterns = [
			/"[A-Z][a-z].*"/, // Strings starting with capital letter
			/'[A-Z][a-z].*'/, // Strings starting with capital letter
		];

		const hasLocalizationImport = /import.*useLocalization.*/.test(code);
		const usesTranslation = /t\s*\(/.test(code);

		if (!hasLocalizationImport) {
			violations.push("Missing useLocalization import");
			suggestions.push("Import useLocalization from hooks/useLocalization");
		}

		// Look for potential hardcoded text
		const textMatches = code.match(/(["'])[A-Z][^"']*\1/g);
		if (textMatches && textMatches.length > 0) {
			const filteredMatches = textMatches.filter(
				(match) =>
					!match.includes(".") && // Not property access
					!match.includes("/") && // Not paths
					!match.includes("#") && // Not colors
					!match.includes("import"), // Not imports
			);

			if (filteredMatches.length > 0) {
				violations.push("Potential hardcoded user-facing text found");
				suggestions.push(
					'Use t() function for all user-facing text: t("key", "default value")',
				);
			}
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// Accessibility rule
class AccessibilityRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		// Check for missing accessibility attributes
		const interactiveElements = [
			"Button",
			"Input",
			"Select",
			"Checkbox",
			"Radio",
		];

		for (const element of interactiveElements) {
			const elementRegex = new RegExp(`<${element}[^>]*>`, "g");
			const matches = code.match(elementRegex);

			if (matches) {
				for (const match of matches) {
					if (!match.includes("ariaLabel") && !match.includes("aria-label")) {
						violations.push(`${element} missing accessibility label`);
						suggestions.push(`Add ariaLabel prop to ${element} component`);
					}
				}
			}
		}

		// Check for color-only information
		if (code.includes("color=") && !code.includes("ariaLabel")) {
			violations.push("Color used for information without text alternative");
			suggestions.push("Provide text alternatives for color-coded information");
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// TypeScript rule
class TypeScriptRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		// Check for 'any' type usage
		if (/:\s*any\b/.test(code)) {
			violations.push('Usage of "any" type found');
			suggestions.push('Replace "any" with specific types');
		}

		// Check for missing return types on functions
		const functionMatches = code.match(
			/(?:function|const)\s+\w+\s*[=\(][^:)]*\)\s*(?!:)/g,
		);
		if (functionMatches && functionMatches.length > 0) {
			violations.push("Functions missing explicit return types");
			suggestions.push(
				"Add explicit return types to all functions: (): JSX.Element",
			);
		}

		// Check for proper interface usage
		if (
			code.includes("Props") &&
			!code.includes("interface") &&
			!code.includes("type")
		) {
			violations.push("Props used without interface definition");
			suggestions.push("Define props with interface or type");
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// File structure rule
class FileStructureRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		const lines = code.split("\n");

		if (lines.length > 200) {
			violations.push(`File has ${lines.length} lines (maximum 200 allowed)`);
			suggestions.push("Split large files into smaller, focused modules");
		}

		// Check for function length
		let functionLineCount = 0;
		let inFunction = false;

		for (const line of lines) {
			if (
				line.includes("function") ||
				line.includes("=>") ||
				line.includes("const")
			) {
				if (inFunction && functionLineCount > 20) {
					violations.push("Function exceeds 20 lines");
					suggestions.push("Break down large functions into smaller ones");
				}
				inFunction = true;
				functionLineCount = 1;
			} else if (inFunction) {
				functionLineCount++;
				if (line.trim() === "}" || line.trim() === "};") {
					inFunction = false;
				}
			}
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// Semantic components rule
class SemanticComponentsRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		const requiredImport = "@xala-technologies/ui-system";

		if (!code.includes(requiredImport)) {
			violations.push("Missing import from @xala-technologies/ui-system");
			suggestions.push(`Import semantic components from ${requiredImport}`);
		}

		// Check for semantic component usage
		const semanticComponents = [
			"Card",
			"Stack",
			"Typography",
			"Button",
			"Input",
			"Container",
		];
		const usedComponents = semanticComponents.filter((comp) =>
			code.includes(comp),
		);

		if (usedComponents.length === 0) {
			violations.push("No semantic components found");
			suggestions.push("Use semantic components from the design system");
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}

// Grid system rule (8pt grid)
class GridSystemRule implements ComplianceRule {
	async validate(code: string, platform: string): Promise<RuleResult> {
		const violations: string[] = [];
		const suggestions: string[] = [];

		// Check for non-8pt values in spacing
		const spacingMatches = code.match(/spacing\.(\w+)/g);
		if (spacingMatches) {
			// This would need to be enhanced to actually validate the token values
			// For now, we assume tokens follow 8pt grid
		}

		// Check for hardcoded values that don't follow 8pt grid
		const pixelMatches = code.match(/(\d+)px/g);
		if (pixelMatches) {
			for (const match of pixelMatches) {
				const value = parseInt(match);
				if (value % 8 !== 0) {
					violations.push(`Non-8pt grid value found: ${match}`);
					suggestions.push(
						"Use 8pt grid system: values should be multiples of 8px",
					);
				}
			}
		}

		return {
			passed: violations.length === 0,
			violations,
			suggestions,
		};
	}
}
