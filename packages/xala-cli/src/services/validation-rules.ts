/**
 * @fileoverview Template Validation Rules
 * @description Comprehensive validation rules for template compliance
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern, TypeScript Strict
 */

import { ValidationResult, ValidationRule } from "./template-validator.js";

// ============================================================================
// SEMANTIC COMPONENT RULES
// ============================================================================

export class NoRawHTMLRule implements ValidationRule {
	readonly name = "no-raw-html";
	readonly description =
		"Prevents usage of raw HTML elements in favor of semantic components";
	readonly severity = "error" as const;
	readonly category = "semantic" as const;

	validate(content: string, filePath: string): ValidationResult {
		const forbiddenElements = [
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
			"nav",
			"header",
			"footer",
			"main",
			"section",
			"article",
			"aside",
		];

		const violations: string[] = [];
		const suggestions: string[] = [];
		const matches: Array<{ line: number; column: number; match: string }> = [];

		const lines = content.split("\n");

		forbiddenElements.forEach((element) => {
			const regex = new RegExp(`<${element}[^>]*>`, "gi");

			lines.forEach((line, lineIndex) => {
				let match;
				while ((match = regex.exec(line)) !== null) {
					violations.push(`Raw HTML element <${element}> found`);
					suggestions.push(
						`Replace <${element}> with semantic component from @xala-technologies/ui-system`,
					);
					matches.push({
						line: lineIndex + 1,
						column: match.index + 1,
						match: match[0],
					});
				}
			});
		});

		return {
			passed: violations.length === 0,
			violations,
			warnings: [],
			suggestions,
			matches,
		};
	}
}

export class SemanticComponentUsageRule implements ValidationRule {
	readonly name = "semantic-component-usage";
	readonly description =
		"Ensures templates use semantic components from design system";
	readonly severity = "error" as const;
	readonly category = "semantic" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for required imports
		const requiredImports = [
			"@xala-technologies/ui-system",
			"class-variance-authority",
		];

		const hasRequiredImports = requiredImports.some(
			(imp) =>
				content.includes(`from '${imp}'`) || content.includes(`from "${imp}"`),
		);

		if (!hasRequiredImports) {
			violations.push("Missing semantic component imports");
			suggestions.push(
				"Import semantic components from @xala-technologies/ui-system",
			);
		}

		// Check for semantic component usage
		const semanticComponents = [
			"Card",
			"Stack",
			"Container",
			"Typography",
			"Button",
			"Input",
			"Select",
			"Checkbox",
			"Radio",
			"Switch",
			"Modal",
			"Dialog",
			"Popover",
			"Tooltip",
			"Badge",
			"Avatar",
			"Progress",
			"Skeleton",
			"Spinner",
		];

		const usedComponents = semanticComponents.filter(
			(comp) => content.includes(`<${comp}`) || content.includes(`{${comp}}`),
		);

		if (usedComponents.length === 0 && hasRequiredImports) {
			warnings.push("No semantic components found despite imports");
			suggestions.push("Use semantic components from the design system");
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

export class ComponentStructureRule implements ValidationRule {
	readonly name = "component-structure";
	readonly description =
		"Validates proper React component structure with CVA pattern";
	readonly severity = "warning" as const;
	readonly category = "semantic" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for CVA pattern usage
		if (!content.includes("cva(") && content.includes("variants")) {
			warnings.push("Component uses variants but not CVA pattern");
			suggestions.push(
				"Use cva() function from class-variance-authority for variant management",
			);
		}

		// Check for forwardRef usage
		if (
			content.includes("interface") &&
			content.includes("Props") &&
			!content.includes("forwardRef")
		) {
			warnings.push(
				"Component should use React.forwardRef for better ref handling",
			);
			suggestions.push("Wrap component with React.forwardRef");
		}

		// Check for proper TypeScript interfaces
		if (
			content.includes("Props") &&
			!content.includes("interface") &&
			!content.includes("type")
		) {
			violations.push("Component props must be defined with interface or type");
			suggestions.push("Define component props with TypeScript interface");
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

// ============================================================================
// DESIGN TOKEN RULES
// ============================================================================

export class DesignTokenUsageRule implements ValidationRule {
	readonly name = "design-token-usage";
	readonly description =
		"Ensures proper design token usage instead of hardcoded values";
	readonly severity = "error" as const;
	readonly category = "tokens" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const matches: Array<{ line: number; column: number; match: string }> = [];

		const lines = content.split("\n");

		// Check for semantic Tailwind classes (these are design tokens)
		const semanticClasses = [
			"bg-primary",
			"bg-secondary",
			"bg-accent",
			"bg-card",
			"bg-background",
			"text-primary-foreground",
			"text-secondary-foreground",
			"text-accent-foreground",
			"text-card-foreground",
			"text-muted-foreground",
			"border-border",
			"border-input",
		];

		const usesSemanticClasses = semanticClasses.some((cls) =>
			content.includes(cls),
		);

		// Check for hardcoded color values
		const colorRegex = /#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(/g;

		lines.forEach((line, lineIndex) => {
			let match;
			while ((match = colorRegex.exec(line)) !== null) {
				violations.push(`Hardcoded color value found: ${match[0]}`);
				suggestions.push(
					"Use semantic Tailwind classes like bg-primary, text-foreground",
				);
				matches.push({
					line: lineIndex + 1,
					column: match.index + 1,
					match: match[0],
				});
			}
		});

		// Check for hardcoded spacing values
		const spacingRegex = /\d+px|\d+rem|\d+em/g;

		lines.forEach((line, lineIndex) => {
			// Skip if line contains Tailwind classes (these are allowed)
			if (line.includes("className=") || line.includes("class=")) {
				return;
			}

			let match;
			while ((match = spacingRegex.exec(line)) !== null) {
				violations.push(`Hardcoded spacing value found: ${match[0]}`);
				suggestions.push("Use Tailwind spacing classes like p-4, m-6, gap-8");
				matches.push({
					line: lineIndex + 1,
					column: match.index + 1,
					match: match[0],
				});
			}
		});

		return {
			passed: violations.length === 0,
			violations,
			warnings: [],
			suggestions,
			matches,
		};
	}
}

export class NoHardcodedValuesRule implements ValidationRule {
	readonly name = "no-hardcoded-values";
	readonly description =
		"Prevents hardcoded CSS values in favor of design tokens";
	readonly severity = "error" as const;
	readonly category = "tokens" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const matches: Array<{ line: number; column: number; match: string }> = [];

		const lines = content.split("\n");

		// Check for inline styles
		const inlineStyleRegex = /style\s*=\s*\{[^}]*\}/g;

		lines.forEach((line, lineIndex) => {
			let match;
			while ((match = inlineStyleRegex.exec(line)) !== null) {
				violations.push("Inline styles found");
				suggestions.push(
					"Use Tailwind CSS classes or CVA variants instead of inline styles",
				);
				matches.push({
					line: lineIndex + 1,
					column: match.index + 1,
					match: match[0],
				});
			}
		});

		// Check for arbitrary Tailwind values
		const arbitraryValueRegex = /\[[^\]]+\]/g;

		lines.forEach((line, lineIndex) => {
			let match;
			while ((match = arbitraryValueRegex.exec(line)) !== null) {
				violations.push(`Arbitrary Tailwind value found: ${match[0]}`);
				suggestions.push(
					"Use predefined Tailwind classes or add custom values to theme configuration",
				);
				matches.push({
					line: lineIndex + 1,
					column: match.index + 1,
					match: match[0],
				});
			}
		});

		return {
			passed: violations.length === 0,
			violations,
			warnings: [],
			suggestions,
			matches,
		};
	}
}

export class TokenReferenceRule implements ValidationRule {
	readonly name = "token-reference";
	readonly description = "Validates proper token reference patterns";
	readonly severity = "warning" as const;
	readonly category = "tokens" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for CSS custom properties usage (should use Tailwind instead)
		if (content.includes("var(--") && !content.includes("css")) {
			warnings.push("CSS custom properties found");
			suggestions.push(
				"Use Tailwind semantic classes instead of CSS custom properties",
			);
		}

		// Check for consistent token naming
		const tokenPatterns = ["token.", "tokens.", "theme.", "design."];
		const hasTokenReferences = tokenPatterns.some((pattern) =>
			content.includes(pattern),
		);

		if (hasTokenReferences && !content.includes("useTokens")) {
			warnings.push("Token references found without useTokens hook");
			suggestions.push(
				"Use useTokens hook from @xala-technologies/ui-system for consistent token access",
			);
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

// ============================================================================
// ACCESSIBILITY RULES
// ============================================================================

export class AriaAttributesRule implements ValidationRule {
	readonly name = "aria-attributes";
	readonly description = "Ensures proper ARIA attributes for accessibility";
	readonly severity = "error" as const;
	readonly category = "accessibility" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const matches: Array<{ line: number; column: number; match: string }> = [];

		const lines = content.split("\n");

		// Interactive elements that require ARIA labels
		const interactiveElements = [
			"Button",
			"Input",
			"Select",
			"Checkbox",
			"Radio",
			"Switch",
		];

		interactiveElements.forEach((element) => {
			const elementRegex = new RegExp(`<${element}[^>]*>`, "g");

			lines.forEach((line, lineIndex) => {
				let match;
				while ((match = elementRegex.exec(line)) !== null) {
					const elementContent = match[0];

					if (
						!elementContent.includes("ariaLabel") &&
						!elementContent.includes("aria-label") &&
						!elementContent.includes("aria-labelledby") &&
						!elementContent.includes("aria-describedby")
					) {
						violations.push(`${element} missing accessibility label`);
						suggestions.push(
							`Add ariaLabel prop to ${element}: ariaLabel="Descriptive label"`,
						);
						matches.push({
							line: lineIndex + 1,
							column: match.index + 1,
							match: match[0],
						});
					}
				}
			});
		});

		// Check for images without alt text
		const imgRegex = /<img[^>]*>/g;

		lines.forEach((line, lineIndex) => {
			let match;
			while ((match = imgRegex.exec(line)) !== null) {
				if (!match[0].includes("alt=")) {
					violations.push("Image missing alt attribute");
					suggestions.push("Add alt attribute to images for screen readers");
					matches.push({
						line: lineIndex + 1,
						column: match.index + 1,
						match: match[0],
					});
				}
			}
		});

		return {
			passed: violations.length === 0,
			violations,
			warnings: [],
			suggestions,
			matches,
		};
	}
}

export class SemanticHTMLRule implements ValidationRule {
	readonly name = "semantic-html";
	readonly description = "Ensures proper semantic HTML structure";
	readonly severity = "warning" as const;
	readonly category = "accessibility" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for proper heading hierarchy
		const headingRegex = /<h[1-6][^>]*>/g;
		const headings = content.match(headingRegex);

		if (headings && headings.length > 1) {
			// Check if headings skip levels (h1 -> h3 without h2)
			const headingLevels = headings.map((h) => {
				const match = h.match(/h(\d)/);
				return parseInt(match?.[1] || "1");
			});

			for (let i = 1; i < headingLevels.length; i++) {
				if (headingLevels[i] - headingLevels[i - 1] > 1) {
					warnings.push("Heading hierarchy skips levels");
					suggestions.push(
						"Use sequential heading levels (h1, h2, h3...) for proper document structure",
					);
					break;
				}
			}
		}

		// Check for landmark elements
		const landmarkElements = [
			"main",
			"nav",
			"header",
			"footer",
			"aside",
			"section",
		];
		const hasLandmarks = landmarkElements.some((element) =>
			content.includes(`<${element}`),
		);

		if (!hasLandmarks && content.length > 1000) {
			warnings.push("Large template missing landmark elements");
			suggestions.push(
				"Use semantic HTML5 landmarks (main, nav, header, footer) for better structure",
			);
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

export class KeyboardNavigationRule implements ValidationRule {
	readonly name = "keyboard-navigation";
	readonly description = "Ensures keyboard navigation support";
	readonly severity = "warning" as const;
	readonly category = "accessibility" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for focus management
		const interactiveElements = content.match(
			/<(Button|Input|Select|Checkbox|Radio)[^>]*>/g,
		);

		if (interactiveElements && interactiveElements.length > 0) {
			const hasFocusManagement =
				content.includes("tabIndex") ||
				content.includes("autoFocus") ||
				content.includes("onKeyDown") ||
				content.includes("onKeyPress");

			if (!hasFocusManagement) {
				warnings.push("Interactive elements may need focus management");
				suggestions.push(
					"Consider adding tabIndex, autoFocus, or keyboard event handlers for better navigation",
				);
			}
		}

		// Check for skip links in large templates
		if (content.length > 2000 && !content.includes("skip-to-content")) {
			warnings.push("Large template missing skip navigation links");
			suggestions.push(
				"Add skip links for keyboard users to bypass repetitive content",
			);
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

export class ColorContrastRule implements ValidationRule {
	readonly name = "color-contrast";
	readonly description = "Validates color contrast for accessibility";
	readonly severity = "warning" as const;
	readonly category = "accessibility" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for color-only information
		const colorClasses = content.match(
			/text-(red|green|yellow|blue|purple|pink|indigo)-\d+/g,
		);

		if (colorClasses && colorClasses.length > 0) {
			const hasTextAlternatives =
				content.includes("ariaLabel") ||
				content.includes("title=") ||
				content.includes("sr-only");

			if (!hasTextAlternatives) {
				warnings.push("Color used for information without text alternatives");
				suggestions.push(
					"Provide text alternatives for color-coded information (icons, labels, or screen reader text)",
				);
			}
		}

		// Check for semantic color usage
		const hasSemanticColors =
			content.includes("text-destructive") ||
			content.includes("text-success") ||
			content.includes("text-warning") ||
			content.includes("bg-destructive") ||
			content.includes("bg-success");

		if (!hasSemanticColors && colorClasses) {
			warnings.push("Consider using semantic color classes");
			suggestions.push(
				"Use semantic color classes like text-destructive, bg-success for better accessibility",
			);
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

export class ScreenReaderRule implements ValidationRule {
	readonly name = "screen-reader";
	readonly description = "Ensures screen reader compatibility";
	readonly severity = "warning" as const;
	readonly category = "accessibility" as const;

	validate(content: string, filePath: string): ValidationResult {
		const violations: string[] = [];
		const suggestions: string[] = [];
		const warnings: string[] = [];

		// Check for screen reader only content
		const hasComplexContent =
			content.includes("table") ||
			content.includes("chart") ||
			content.includes("graph") ||
			content.includes("visualization");

		if (hasComplexContent && !content.includes("sr-only")) {
			warnings.push("Complex content may need screen reader descriptions");
			suggestions.push(
				"Add sr-only classes with descriptive text for complex visual content",
			);
		}

		// Check for proper live regions
		const hasDynamicContent =
			content.includes("useState") ||
			content.includes("loading") ||
			content.includes("error");

		if (hasDynamicContent && !content.includes("aria-live")) {
			warnings.push("Dynamic content may need live regions");
			suggestions.push(
				"Add aria-live attributes to announce dynamic content changes",
			);
		}

		return {
			passed: violations.length === 0,
			violations,
			warnings,
			suggestions,
		};
	}
}

// Export all validation rules from extended file
export * from "./validation-rules-extended.js";
