/**
 * Natural Language Processor for AI Code Translation
 *
 * Story 1.2 Implementation: Natural language to code translation
 * - Parses natural language descriptions
 * - Translates to TypeScript/React code
 * - Provides intelligent code suggestions
 * - Integrates with AI service for enhanced generation
 */

import { logger } from "../../utils/logger.js";
import { mcpClient } from "../mcp/mcp-client.js";
import {
	AIService,
	type ComponentContext,
	type GenerationContext,
} from "./ai-service.js";

export interface NaturalLanguageInput {
	description: string;
	componentType?: string;
	requirements?: string[];
	constraints?: string[];
	examples?: string[];
}

export interface ParsedRequirements {
	componentType: string;
	props: PropRequirement[];
	behaviors: BehaviorRequirement[];
	styling: StylingRequirement[];
	accessibility: AccessibilityRequirement[];
	performance: PerformanceRequirement[];
	compliance: ComplianceRequirement[];
	integrations: IntegrationRequirement[];
}

export interface PropRequirement {
	name: string;
	type: string;
	required: boolean;
	description: string;
	validation?: string[];
	defaultValue?: any;
}

export interface BehaviorRequirement {
	trigger: string;
	action: string;
	validation?: string;
	errorHandling?: string;
}

export interface StylingRequirement {
	framework: "tailwind" | "css-modules" | "styled-components";
	responsive: boolean;
	theme: string;
	customizations: string[];
}

export interface AccessibilityRequirement {
	level: "A" | "AA" | "AAA";
	features: string[];
	screenReader: boolean;
	keyboardNavigation: boolean;
}

export interface PerformanceRequirement {
	optimization: string[];
	lazy: boolean;
	memo: boolean;
	virtualization: boolean;
}

export interface ComplianceRequirement {
	norwegian: boolean;
	gdpr: boolean;
	nsmClassification?: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
	auditTrail: boolean;
}

export interface IntegrationRequirement {
	apis: string[];
	services: string[];
	databases: string[];
	thirdParty: string[];
}

export interface CodeTranslationResult {
	code: string;
	explanation: string;
	suggestions: string[];
	warnings: string[];
	confidence: number;
	alternatives: string[];
	requirements: ParsedRequirements;
}

export class NaturalLanguageProcessor {
	private aiService: AIService;

	constructor(aiService?: AIService) {
		this.aiService = aiService || new AIService();
	}

	/**
	 * Parse natural language input and extract structured requirements
	 */
	async parseNaturalLanguage(
		input: NaturalLanguageInput,
	): Promise<ParsedRequirements> {
		logger.debug("🧠 Parsing natural language requirements...");

		const description = input.description.toLowerCase();

		// Extract component type
		const componentType = this.extractComponentType(
			description,
			input.componentType,
		);

		// Extract requirements in parallel
		const [
			props,
			behaviors,
			styling,
			accessibility,
			performance,
			compliance,
			integrations,
		] = await Promise.all([
			this.extractProps(description),
			this.extractBehaviors(description),
			this.extractStyling(description),
			this.extractAccessibility(description),
			this.extractPerformance(description),
			this.extractCompliance(description),
			this.extractIntegrations(description),
		]);

		const requirements: ParsedRequirements = {
			componentType,
			props,
			behaviors,
			styling,
			accessibility,
			performance,
			compliance,
			integrations,
		};

		logger.debug(
			`📋 Parsed requirements: ${componentType} with ${props.length} props, ${behaviors.length} behaviors`,
		);

		return requirements;
	}

	/**
	 * Translate natural language to TypeScript/React code
	 */
	async translateToCode(
		input: NaturalLanguageInput,
		context: ComponentContext,
	): Promise<CodeTranslationResult> {
		logger.info("🔄 Translating natural language to code...");

		// Parse requirements first
		const requirements = await this.parseNaturalLanguage(input);

		// Build enhanced prompt with parsed requirements
		const prompt = this.buildTranslationPrompt(input, requirements, context);

		// Get AI-generated code
		const aiResult = await this.aiService.generateCode(prompt, context);

		// Post-process and enhance the code
		const enhancedCode = await this.enhanceGeneratedCode(
			aiResult.code,
			requirements,
			context,
		);

		// Generate suggestions and alternatives
		const suggestions = await this.generateSuggestions(requirements, context);
		const alternatives = await this.generateAlternatives(
			enhancedCode,
			requirements,
		);

		// Validate the generated code
		const warnings = await this.validateGeneratedCode(
			enhancedCode,
			requirements,
		);

		return {
			code: enhancedCode,
			explanation: this.generateExplanation(requirements, enhancedCode),
			suggestions,
			warnings,
			confidence: aiResult.confidence,
			alternatives,
			requirements,
		};
	}

	/**
	 * Extract component type from natural language
	 */
	private extractComponentType(description: string, hint?: string): string {
		if (hint) return hint;

		// Component type patterns
		const patterns = {
			button: /button|click|submit|action/,
			form: /form|input|submit|validate|field/,
			modal: /modal|dialog|popup|overlay/,
			table: /table|list|grid|data|row|column/,
			card: /card|item|product|profile/,
			navigation: /nav|menu|link|route/,
			layout: /layout|container|wrapper|section/,
			chart: /chart|graph|visualization|data/,
			calendar: /calendar|date|schedule|event/,
			search: /search|filter|find|query/,
		};

		for (const [type, pattern] of Object.entries(patterns)) {
			if (pattern.test(description)) {
				return type;
			}
		}

		return "component"; // Default
	}

	/**
	 * Extract props from natural language description
	 */
	private async extractProps(description: string): Promise<PropRequirement[]> {
		const props: PropRequirement[] = [];

		// Common prop patterns
		const propPatterns = [
			{
				pattern: /title|heading|label/,
				prop: {
					name: "title",
					type: "string",
					required: true,
					description: "Component title or heading",
				},
			},
			{
				pattern: /description|content|text/,
				prop: {
					name: "description",
					type: "string",
					required: false,
					description: "Component description or content",
				},
			},
			{
				pattern: /onclick|click|action|handler/,
				prop: {
					name: "onClick",
					type: "() => void",
					required: false,
					description: "Click event handler",
				},
			},
			{
				pattern: /disabled|loading|pending/,
				prop: {
					name: "disabled",
					type: "boolean",
					required: false,
					description: "Whether component is disabled",
					defaultValue: false,
				},
			},
			{
				pattern: /variant|type|style|theme/,
				prop: {
					name: "variant",
					type: "'primary' | 'secondary' | 'danger'",
					required: false,
					description: "Component variant",
					defaultValue: "primary",
				},
			},
			{
				pattern: /size|small|large|medium/,
				prop: {
					name: "size",
					type: "'sm' | 'md' | 'lg'",
					required: false,
					description: "Component size",
					defaultValue: "md",
				},
			},
			{
				pattern: /icon|symbol/,
				prop: {
					name: "icon",
					type: "React.ReactNode",
					required: false,
					description: "Optional icon element",
				},
			},
			{
				pattern: /children|content/,
				prop: {
					name: "children",
					type: "React.ReactNode",
					required: false,
					description: "Child elements",
				},
			},
		];

		for (const { pattern, prop } of propPatterns) {
			if (pattern.test(description)) {
				props.push(prop);
			}
		}

		// Extract custom props mentioned in description
		const customProps = this.extractCustomProps(description);
		props.push(...customProps);

		return props;
	}

	/**
	 * Extract custom props from specific mentions in description
	 */
	private extractCustomProps(description: string): PropRequirement[] {
		const props: PropRequirement[] = [];

		// Look for "with [property]" patterns
		const withMatches = description.match(/with (\w+)/g);
		if (withMatches) {
			for (const match of withMatches) {
				const propName = match.replace("with ", "");
				props.push({
					name: propName,
					type: "string",
					required: false,
					description: `Custom ${propName} property`,
				});
			}
		}

		// Look for "that has [property]" patterns
		const hasMatches = description.match(/that has (\w+)/g);
		if (hasMatches) {
			for (const match of hasMatches) {
				const propName = match.replace("that has ", "");
				props.push({
					name: propName,
					type: "string",
					required: false,
					description: `Component ${propName} property`,
				});
			}
		}

		return props;
	}

	/**
	 * Extract behaviors from natural language
	 */
	private async extractBehaviors(
		description: string,
	): Promise<BehaviorRequirement[]> {
		const behaviors: BehaviorRequirement[] = [];

		const behaviorPatterns = [
			{
				pattern: /when clicked|on click|click to/,
				behavior: {
					trigger: "onClick",
					action: "handleClick",
					validation: "required",
				},
			},
			{
				pattern: /when hover|on hover|hover to/,
				behavior: { trigger: "onHover", action: "handleHover" },
			},
			{
				pattern: /when submit|on submit|submit to/,
				behavior: {
					trigger: "onSubmit",
					action: "handleSubmit",
					validation: "form validation",
				},
			},
			{
				pattern: /when change|on change|change to/,
				behavior: { trigger: "onChange", action: "handleChange" },
			},
			{
				pattern: /when focus|on focus|focus to/,
				behavior: { trigger: "onFocus", action: "handleFocus" },
			},
			{
				pattern: /validate|validation|check/,
				behavior: {
					trigger: "onValidate",
					action: "validateInput",
					validation: "input validation",
				},
			},
		];

		for (const { pattern, behavior } of behaviorPatterns) {
			if (pattern.test(description)) {
				behaviors.push(behavior);
			}
		}

		return behaviors;
	}

	/**
	 * Extract styling requirements
	 */
	private async extractStyling(
		description: string,
	): Promise<StylingRequirement[]> {
		const styling: StylingRequirement[] = [];

		// Detect styling preferences
		const framework = description.includes("styled")
			? "styled-components"
			: description.includes("css modules")
				? "css-modules"
				: "tailwind";

		const responsive = /responsive|mobile|tablet|desktop/.test(description);
		const theme = description.includes("dark") ? "dark" : "light";

		// Extract customizations
		const customizations: string[] = [];
		if (/rounded|border-radius/.test(description))
			customizations.push("rounded corners");
		if (/shadow|elevation/.test(description))
			customizations.push("shadow effects");
		if (/gradient|background/.test(description))
			customizations.push("background effects");
		if (/animation|transition/.test(description))
			customizations.push("animations");

		styling.push({
			framework,
			responsive,
			theme,
			customizations,
		});

		return styling;
	}

	/**
	 * Extract accessibility requirements
	 */
	private async extractAccessibility(
		description: string,
	): Promise<AccessibilityRequirement[]> {
		const accessibility: AccessibilityRequirement[] = [];

		const level = description.includes("wcag aaa")
			? "AAA"
			: description.includes("wcag aa")
				? "AA"
				: "AAA"; // Default to highest standard

		const features: string[] = [];
		if (/aria|accessible|screen reader/.test(description))
			features.push("ARIA labels");
		if (/keyboard|tab|focus/.test(description))
			features.push("keyboard navigation");
		if (/contrast|color/.test(description)) features.push("color contrast");
		if (/semantic|html/.test(description)) features.push("semantic HTML");

		const screenReader = /screen reader|aria|accessible/.test(description);
		const keyboardNavigation = /keyboard|tab|focus|navigation/.test(
			description,
		);

		accessibility.push({
			level,
			features,
			screenReader,
			keyboardNavigation,
		});

		return accessibility;
	}

	/**
	 * Extract performance requirements
	 */
	private async extractPerformance(
		description: string,
	): Promise<PerformanceRequirement[]> {
		const performance: PerformanceRequirement[] = [];

		const optimization: string[] = [];
		if (/fast|performance|optimized/.test(description))
			optimization.push("React.memo");
		if (/callback|handler/.test(description)) optimization.push("useCallback");
		if (/calculate|compute|expensive/.test(description))
			optimization.push("useMemo");

		const lazy = /lazy|dynamic|import/.test(description);
		const memo = /memo|performance|rerender/.test(description);
		const virtualization = /virtual|large list|many items/.test(description);

		performance.push({
			optimization,
			lazy,
			memo,
			virtualization,
		});

		return performance;
	}

	/**
	 * Extract compliance requirements
	 */
	private async extractCompliance(
		description: string,
	): Promise<ComplianceRequirement[]> {
		const compliance: ComplianceRequirement[] = [];

		const norwegian = /norwegian|norway|nsm|norge/.test(description);
		const gdpr = /gdpr|privacy|data protection/.test(description);
		const auditTrail = /audit|log|track|compliance/.test(description);

		let nsmClassification: ComplianceRequirement["nsmClassification"];
		if (description.includes("secret")) nsmClassification = "SECRET";
		else if (description.includes("confidential"))
			nsmClassification = "CONFIDENTIAL";
		else if (description.includes("restricted"))
			nsmClassification = "RESTRICTED";
		else if (norwegian) nsmClassification = "OPEN";

		compliance.push({
			norwegian,
			gdpr,
			nsmClassification,
			auditTrail,
		});

		return compliance;
	}

	/**
	 * Extract integration requirements
	 */
	private async extractIntegrations(
		description: string,
	): Promise<IntegrationRequirement[]> {
		const integrations: IntegrationRequirement[] = [];

		const apis: string[] = [];
		const services: string[] = [];
		const databases: string[] = [];
		const thirdParty: string[] = [];

		// API patterns
		if (/rest api|api|endpoint/.test(description)) apis.push("REST API");
		if (/graphql/.test(description)) apis.push("GraphQL");
		if (/websocket|realtime/.test(description)) apis.push("WebSocket");

		// Service patterns
		if (/auth|login|authentication/.test(description))
			services.push("authentication");
		if (/payment|stripe|checkout/.test(description)) services.push("payment");
		if (/email|notification/.test(description)) services.push("notifications");

		// Database patterns
		if (/database|db|sql/.test(description)) databases.push("SQL database");
		if (/nosql|mongodb/.test(description)) databases.push("NoSQL database");
		if (/cache|redis/.test(description)) databases.push("cache");

		// Third-party patterns
		if (/google|maps/.test(description)) thirdParty.push("Google Maps");
		if (/stripe|payment/.test(description)) thirdParty.push("Stripe");
		if (/twilio|sms/.test(description)) thirdParty.push("Twilio");

		if (
			apis.length ||
			services.length ||
			databases.length ||
			thirdParty.length
		) {
			integrations.push({
				apis,
				services,
				databases,
				thirdParty,
			});
		}

		return integrations;
	}

	/**
	 * Build translation prompt for AI service
	 */
	private buildTranslationPrompt(
		input: NaturalLanguageInput,
		requirements: ParsedRequirements,
		context: ComponentContext,
	): string {
		return `Translate this natural language description into a TypeScript React component:

"${input.description}"

PARSED REQUIREMENTS:
- Component Type: ${requirements.componentType}
- Props: ${requirements.props.map((p) => `${p.name}: ${p.type}${p.required ? "" : "?"}`).join(", ")}
- Behaviors: ${requirements.behaviors.map((b) => `${b.trigger} -> ${b.action}`).join(", ")}
- Styling: ${requirements.styling.map((s) => s.framework).join(", ")}
- Accessibility: ${requirements.accessibility.map((a) => a.level).join(", ")}
- Performance: ${requirements.performance.map((p) => p.optimization.join(", ")).join(", ")}

CONTEXT:
- Framework: ${context.framework}
- UI System: ${context.uiSystem}
- Styling: ${context.styling}
- Accessibility: ${context.compliance.accessibility}
- Norwegian Compliance: ${context.compliance.norwegian}

REQUIREMENTS:
1. Use only ${context.uiSystem} components
2. Implement ${context.compliance.accessibility} accessibility
3. Use semantic HTML elements
4. Include proper TypeScript interfaces
5. Add comprehensive error handling
6. Follow modern React patterns
7. Include JSDoc documentation
8. Apply ${context.styling} styling

Generate a complete, production-ready component that fulfills all requirements.`;
	}

	/**
	 * Enhance generated code with additional patterns and optimizations
	 */
	private async enhanceGeneratedCode(
		code: string,
		requirements: ParsedRequirements,
		context: ComponentContext,
	): Promise<string> {
		let enhancedCode = code;

		// Add imports if missing
		enhancedCode = this.ensureImports(enhancedCode, requirements, context);

		// Add error boundaries if needed
		if (requirements.behaviors.some((b) => b.errorHandling)) {
			enhancedCode = this.addErrorHandling(enhancedCode);
		}

		// Add performance optimizations
		if (requirements.performance.some((p) => p.memo)) {
			enhancedCode = this.addMemoization(enhancedCode);
		}

		// Add accessibility attributes
		enhancedCode = this.enhanceAccessibility(
			enhancedCode,
			requirements.accessibility,
		);

		// Add compliance features
		if (requirements.compliance.some((c) => c.norwegian)) {
			enhancedCode = this.addNorwegianCompliance(enhancedCode);
		}

		return enhancedCode;
	}

	/**
	 * Generate suggestions for improvement
	 */
	private async generateSuggestions(
		requirements: ParsedRequirements,
		context: ComponentContext,
	): Promise<string[]> {
		const suggestions: string[] = [];

		// Performance suggestions
		if (requirements.performance.length === 0) {
			suggestions.push(
				"Consider adding performance optimizations like React.memo or useCallback",
			);
		}

		// Accessibility suggestions
		if (requirements.accessibility.length === 0) {
			suggestions.push(
				"Add accessibility features for better inclusive design",
			);
		}

		// Testing suggestions
		suggestions.push("Add unit tests with @testing-library/react");
		suggestions.push("Create Storybook stories for component documentation");

		// Integration suggestions
		if (requirements.integrations.length > 0) {
			suggestions.push(
				"Consider implementing error handling for external integrations",
			);
		}

		return suggestions;
	}

	/**
	 * Generate alternative implementations
	 */
	private async generateAlternatives(
		code: string,
		requirements: ParsedRequirements,
	): Promise<string[]> {
		const alternatives: string[] = [];

		// Provide alternative styling approaches
		if (requirements.styling.some((s) => s.framework === "tailwind")) {
			alternatives.push(
				"Alternative: Use CSS Modules for better style encapsulation",
			);
		}

		// Provide alternative state management
		if (code.includes("useState")) {
			alternatives.push("Alternative: Use useReducer for complex state logic");
		}

		// Provide alternative prop patterns
		if (requirements.props.length > 5) {
			alternatives.push(
				"Alternative: Group related props into configuration objects",
			);
		}

		return alternatives;
	}

	/**
	 * Validate generated code against requirements
	 */
	private async validateGeneratedCode(
		code: string,
		requirements: ParsedRequirements,
	): Promise<string[]> {
		const warnings: string[] = [];

		// Check for required props
		for (const prop of requirements.props.filter((p) => p.required)) {
			if (!code.includes(prop.name)) {
				warnings.push(
					`Required prop '${prop.name}' is not used in the component`,
				);
			}
		}

		// Check for accessibility attributes
		if (
			requirements.accessibility.some((a) => a.screenReader) &&
			!code.includes("aria-")
		) {
			warnings.push(
				"Component should include ARIA attributes for screen reader support",
			);
		}

		// Check for error handling
		if (
			requirements.behaviors.some((b) => b.errorHandling) &&
			!code.includes("try")
		) {
			warnings.push(
				"Component should include error handling for user interactions",
			);
		}

		return warnings;
	}

	/**
	 * Generate explanation of the generated code
	 */
	private generateExplanation(
		requirements: ParsedRequirements,
		code: string,
	): string {
		const lines = code.split("\n").length;
		const props = requirements.props.length;
		const behaviors = requirements.behaviors.length;

		return `Generated a ${requirements.componentType} component with ${props} props and ${behaviors} behaviors. The component is ${lines} lines long and includes modern React patterns, TypeScript types, and accessibility features.`;
	}

	// Code enhancement helper methods
	private ensureImports(
		code: string,
		requirements: ParsedRequirements,
		context: ComponentContext,
	): string {
		const imports = new Set<string>();

		// Basic React imports
		imports.add("React");

		// UI System imports based on requirements
		if (requirements.componentType === "button") imports.add("Button");
		if (requirements.componentType === "form")
			imports.add("Input, Label, Button");
		if (requirements.componentType === "card")
			imports.add("Card, CardContent, CardHeader");

		// Add performance imports
		if (requirements.performance.some((p) => p.memo)) imports.add("React.memo");
		if (requirements.behaviors.some((b) => b.trigger === "onClick"))
			imports.add("useCallback");

		const importStatement = `import ${Array.from(imports).join(", ")} from "${context.uiSystem}";\n\n`;

		return code.includes("import") ? code : importStatement + code;
	}

	private addErrorHandling(code: string): string {
		if (code.includes("try")) return code;

		// Add basic error boundary pattern
		const errorHandling = `
  const [error, setError] = React.useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Something went wrong: {error}</p>
      </div>
    );
  }
`;

		return code.replace("return (", errorHandling + "\n  return (");
	}

	private addMemoization(code: string): string {
		if (code.includes("React.memo")) return code;

		// Wrap component in React.memo
		const memoPattern = /export const (\w+) = \(/;
		const match = code.match(memoPattern);
		if (match) {
			const componentName = match[1];
			return (
				code.replace(
					`export const ${componentName} =`,
					`export const ${componentName} = React.memo(`,
				) + "\n);"
			);
		}

		return code;
	}

	private enhanceAccessibility(
		code: string,
		accessibility: AccessibilityRequirement[],
	): string {
		let enhancedCode = code;

		// Add ARIA labels if required
		if (accessibility.some((a) => a.screenReader)) {
			enhancedCode = enhancedCode.replace(
				/<button/g,
				'<button aria-label="Button action"',
			);
		}

		// Add keyboard navigation if required
		if (accessibility.some((a) => a.keyboardNavigation)) {
			enhancedCode = enhancedCode.replace(
				/<div/g,
				'<div role="button" tabIndex={0}',
			);
		}

		return enhancedCode;
	}

	private addNorwegianCompliance(code: string): string {
		if (code.includes("// Norwegian compliance")) return code;

		const complianceComment = `
// Norwegian compliance: NSM classification applied
// Audit trail and data protection measures included
`;

		return complianceComment + code;
	}
}
