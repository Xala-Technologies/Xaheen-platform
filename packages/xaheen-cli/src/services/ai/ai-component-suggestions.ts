/**
 * AI-Powered Component Suggestions System
 *
 * Story 1.2 Implementation: AI-powered component suggestions
 * - Analyzes existing codebase patterns
 * - Provides intelligent component recommendations
 * - Suggests reusable patterns and optimizations
 * - Integrates with MCP for enhanced suggestions
 */

import { logger } from "../../utils/logger";
import { mcpClient } from "../mcp/mcp-client";
import {
	AIContextIndexer,
	type CodebaseIndex,
	type ComponentIndex,
} from "./ai-context-indexer.js";
import { AIService, type ComponentContext } from "./ai-service";

export interface ComponentSuggestion {
	type:
		| "reuse"
		| "pattern"
		| "optimization"
		| "accessibility"
		| "performance"
		| "compliance";
	title: string;
	description: string;
	recommendation: string;
	code?: string;
	confidence: number;
	reasoning: string[];
	references: string[];
	impact: "low" | "medium" | "high";
	effort: "low" | "medium" | "high";
}

export interface SuggestionContext {
	componentName: string;
	componentType: string;
	description?: string;
	existingCode?: string;
	requirements?: string[];
}

export interface SuggestionOptions {
	includeReuse: boolean;
	includePatterns: boolean;
	includeOptimizations: boolean;
	includeAccessibility: boolean;
	includePerformance: boolean;
	includeCompliance: boolean;
	maxSuggestions: number;
	minConfidence: number;
}

export class AIComponentSuggestions {
	private aiService: AIService;
	private contextIndexer: AIContextIndexer;
	private codebaseIndex: CodebaseIndex | null = null;

	constructor(aiService?: AIService, projectPath?: string) {
		this.aiService = aiService || new AIService();
		this.contextIndexer = new AIContextIndexer(projectPath);
	}

	/**
	 * Generate AI-powered component suggestions
	 */
	async generateSuggestions(
		context: SuggestionContext,
		options: SuggestionOptions = this.getDefaultOptions(),
	): Promise<ComponentSuggestion[]> {
		logger.info(`🧠 Generating AI suggestions for ${context.componentName}...`);

		// Build codebase index if not available
		if (!this.codebaseIndex) {
			this.codebaseIndex = await this.contextIndexer.getIndex();
		}

		const suggestions: ComponentSuggestion[] = [];

		// Generate different types of suggestions in parallel
		const suggestionPromises = [];

		if (options.includeReuse) {
			suggestionPromises.push(this.generateReuseSuggestions(context));
		}
		if (options.includePatterns) {
			suggestionPromises.push(this.generatePatternSuggestions(context));
		}
		if (options.includeOptimizations) {
			suggestionPromises.push(this.generateOptimizationSuggestions(context));
		}
		if (options.includeAccessibility) {
			suggestionPromises.push(this.generateAccessibilitySuggestions(context));
		}
		if (options.includePerformance) {
			suggestionPromises.push(this.generatePerformanceSuggestions(context));
		}
		if (options.includeCompliance) {
			suggestionPromises.push(this.generateComplianceSuggestions(context));
		}

		const allSuggestions = await Promise.all(suggestionPromises);
		suggestions.push(...allSuggestions.flat());

		// Filter and rank suggestions
		const filteredSuggestions = suggestions
			.filter((s) => s.confidence >= options.minConfidence)
			.sort((a, b) => b.confidence - a.confidence)
			.slice(0, options.maxSuggestions);

		logger.success(`✨ Generated ${filteredSuggestions.length} AI suggestions`);

		return filteredSuggestions;
	}

	/**
	 * Generate suggestions for component reuse
	 */
	private async generateReuseSuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		if (!this.codebaseIndex) return [];

		const suggestions: ComponentSuggestion[] = [];
		const similarComponents = this.findSimilarComponents(
			context.componentName,
			context.componentType,
		);

		for (const similar of similarComponents.slice(0, 3)) {
			// Analyze if the existing component can be reused or extended
			const reuseAnalysis = await this.analyzeReuseOpportunity(
				context,
				similar,
			);

			if (reuseAnalysis.canReuse) {
				suggestions.push({
					type: "reuse",
					title: `Reuse existing ${similar.name} component`,
					description: `The existing ${similar.name} component has similar functionality and can be reused or extended.`,
					recommendation: reuseAnalysis.recommendation,
					code: reuseAnalysis.exampleCode,
					confidence: reuseAnalysis.confidence,
					reasoning: reuseAnalysis.reasoning,
					references: [similar.path],
					impact: "high",
					effort: "low",
				});
			}
		}

		return suggestions;
	}

	/**
	 * Generate suggestions for design patterns
	 */
	private async generatePatternSuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		if (!this.codebaseIndex) return [];

		const suggestions: ComponentSuggestion[] = [];
		const relevantPatterns = this.codebaseIndex.patterns.filter(
			(p) => p.recommendation === "high" && p.usage > 0,
		);

		for (const pattern of relevantPatterns.slice(0, 2)) {
			const patternSuggestion = await this.generatePatternSuggestion(
				context,
				pattern,
			);
			if (patternSuggestion) {
				suggestions.push(patternSuggestion);
			}
		}

		// Add AI-generated pattern suggestions
		const aiPatterns = await this.generateAIPatternSuggestions(context);
		suggestions.push(...aiPatterns);

		return suggestions;
	}

	/**
	 * Generate optimization suggestions
	 */
	private async generateOptimizationSuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		const suggestions: ComponentSuggestion[] = [];

		// Analyze existing code for optimization opportunities
		if (context.existingCode) {
			const optimizations = await this.analyzeOptimizationOpportunities(
				context.existingCode,
				context,
			);
			suggestions.push(...optimizations);
		}

		// Generate general optimization suggestions based on component type
		const generalOptimizations =
			await this.generateGeneralOptimizations(context);
		suggestions.push(...generalOptimizations);

		return suggestions;
	}

	/**
	 * Generate accessibility suggestions
	 */
	private async generateAccessibilitySuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		const suggestions: ComponentSuggestion[] = [];

		// Get MCP accessibility recommendations
		const mcpSpec = await mcpClient.loadSpecification(
			context.componentName,
			context.componentType,
		);

		if (mcpSpec?.accessibility) {
			const a11ySuggestion = await this.generateAccessibilitySuggestion(
				context,
				mcpSpec.accessibility,
			);
			if (a11ySuggestion) {
				suggestions.push(a11ySuggestion);
			}
		}

		// Generate general accessibility suggestions
		const generalA11y =
			await this.generateGeneralAccessibilitySuggestions(context);
		suggestions.push(...generalA11y);

		return suggestions;
	}

	/**
	 * Generate performance suggestions
	 */
	private async generatePerformanceSuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		const suggestions: ComponentSuggestion[] = [];

		// Analyze component complexity for performance recommendations
		const complexity = this.estimateComponentComplexity(context);

		if (complexity === "complex") {
			suggestions.push({
				type: "performance",
				title: "Add React.memo for performance optimization",
				description:
					"This complex component would benefit from memoization to prevent unnecessary re-renders.",
				recommendation:
					"Wrap the component with React.memo and use useCallback for event handlers",
				code: this.generateMemoizationCode(context.componentName),
				confidence: 0.8,
				reasoning: [
					"Component appears to be complex",
					"Memoization can prevent unnecessary re-renders",
					"Common pattern in the codebase",
				],
				references: [],
				impact: "medium",
				effort: "low",
			});
		}

		// Add lazy loading suggestions for large components
		if (context.componentType === "page" || complexity === "complex") {
			suggestions.push({
				type: "performance",
				title: "Consider lazy loading for better performance",
				description:
					"Large components can be lazy loaded to improve initial bundle size.",
				recommendation: "Use React.lazy and Suspense for code splitting",
				code: this.generateLazyLoadingCode(context.componentName),
				confidence: 0.7,
				reasoning: [
					"Component is a page or complex component",
					"Lazy loading improves initial load time",
					"Reduces bundle size",
				],
				references: [],
				impact: "high",
				effort: "low",
			});
		}

		return suggestions;
	}

	/**
	 * Generate compliance suggestions
	 */
	private async generateComplianceSuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		if (!this.codebaseIndex) return [];

		const suggestions: ComponentSuggestion[] = [];
		const compliance = this.codebaseIndex.compliance;

		// Norwegian compliance suggestions
		if (compliance.norwegian.enabled) {
			suggestions.push({
				type: "compliance",
				title: "Add Norwegian compliance features",
				description:
					"Implement NSM classification and Norwegian locale support.",
				recommendation:
					"Add NSM classification markers and Norwegian language support",
				code: this.generateNorwegianComplianceCode(context.componentName),
				confidence: 0.9,
				reasoning: [
					"Project has Norwegian compliance enabled",
					"NSM classification is required",
					"Norwegian locale support needed",
				],
				references: [],
				impact: "high",
				effort: "medium",
			});
		}

		// GDPR compliance suggestions
		if (compliance.gdpr.enabled) {
			suggestions.push({
				type: "compliance",
				title: "Implement GDPR compliance features",
				description: "Add data privacy controls and consent management.",
				recommendation:
					"Include GDPR consent handling and data privacy features",
				code: this.generateGDPRComplianceCode(context.componentName),
				confidence: 0.85,
				reasoning: [
					"Project has GDPR compliance enabled",
					"Data privacy controls required",
					"Consent management needed",
				],
				references: [],
				impact: "high",
				effort: "medium",
			});
		}

		return suggestions;
	}

	/**
	 * Find components similar to the one being created
	 */
	private findSimilarComponents(
		componentName: string,
		componentType: string,
	): ComponentIndex[] {
		if (!this.codebaseIndex) return [];

		const nameWords = componentName.toLowerCase().split(/(?=[A-Z])/);
		const components = this.codebaseIndex.components;

		return components
			.filter((comp) => {
				// Same type gets higher priority
				if (comp.type === componentType) return true;

				// Similar name patterns
				const compNameWords = comp.name.toLowerCase().split(/(?=[A-Z])/);
				const commonWords = nameWords.filter((word) =>
					compNameWords.some(
						(compWord) => compWord.includes(word) || word.includes(compWord),
					),
				);

				return commonWords.length > 0;
			})
			.sort((a, b) => {
				// Sort by reusability score and similarity
				if (a.type === componentType && b.type !== componentType) return -1;
				if (b.type === componentType && a.type !== componentType) return 1;
				return b.reusability - a.reusability;
			});
	}

	/**
	 * Analyze if an existing component can be reused
	 */
	private async analyzeReuseOpportunity(
		context: SuggestionContext,
		existing: ComponentIndex,
	): Promise<{
		canReuse: boolean;
		confidence: number;
		recommendation: string;
		reasoning: string[];
		exampleCode?: string;
	}> {
		const reasoning: string[] = [];
		let confidence = 0.5;

		// Check type compatibility
		if (existing.type === context.componentType) {
			reasoning.push("Same component type");
			confidence += 0.2;
		}

		// Check prop compatibility
		const hasCompatibleProps =
			existing.props.length > 0 &&
			existing.props.some(
				(prop) => prop.name === "children" || prop.name === "className",
			);

		if (hasCompatibleProps) {
			reasoning.push("Has flexible props like children or className");
			confidence += 0.15;
		}

		// Check reusability score
		if (existing.reusability > 0.7) {
			reasoning.push("High reusability score");
			confidence += 0.15;
		}

		// Check patterns used
		const hasGoodPatterns =
			existing.patterns.includes("children-pattern") ||
			existing.patterns.includes("React.memo");

		if (hasGoodPatterns) {
			reasoning.push("Uses good reusability patterns");
			confidence += 0.1;
		}

		const canReuse = confidence > 0.6;

		let recommendation = "";
		let exampleCode = "";

		if (canReuse) {
			if (existing.props.some((p) => p.name === "children")) {
				recommendation =
					"Reuse this component by passing your content as children";
				exampleCode = `import { ${existing.name} } from "${existing.path.replace(process.cwd(), ".")}";

export const ${context.componentName} = (): JSX.Element => {
  return (
    <${existing.name}>
      {/* Your custom content here */}
    </${existing.name}>
  );
};`;
			} else {
				recommendation = "Extend this component with additional props";
				exampleCode = `import { ${existing.name} } from "${existing.path.replace(process.cwd(), ".")}";

// Extend the existing component
export const ${context.componentName} = (props: ${context.componentName}Props): JSX.Element => {
  return <${existing.name} {...props} />;
};`;
			}
		} else {
			recommendation = "Create a new component as reuse potential is low";
		}

		return {
			canReuse,
			confidence,
			recommendation,
			reasoning,
			exampleCode: canReuse ? exampleCode : undefined,
		};
	}

	/**
	 * Generate pattern-based suggestions
	 */
	private async generatePatternSuggestion(
		context: SuggestionContext,
		pattern: any,
	): Promise<ComponentSuggestion | null> {
		// This would analyze the pattern and generate appropriate suggestions
		// For now, return a placeholder
		return {
			type: "pattern",
			title: `Apply ${pattern.name} pattern`,
			description: pattern.description,
			recommendation: `Consider implementing the ${pattern.name} pattern used in ${pattern.usage} other components`,
			confidence: 0.7,
			reasoning: [
				`Pattern is used in ${pattern.usage} components`,
				`High recommendation level: ${pattern.recommendation}`,
			],
			references: pattern.components,
			impact: "medium",
			effort: "medium",
		};
	}

	/**
	 * Generate AI-powered pattern suggestions
	 */
	private async generateAIPatternSuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		// Use AI service to analyze patterns and generate suggestions
		const prompt = `Analyze this component context and suggest design patterns:
Component: ${context.componentName}
Type: ${context.componentType}
Description: ${context.description || "No description provided"}

Suggest 1-2 relevant design patterns that would improve the component.`;

		try {
			const aiResult = await this.aiService.generateCode(prompt, {
				framework: "React",
				platform: "web",
				stack: "nextjs",
				projectPath: process.cwd(),
				dependencies: [],
				codeStyle: "typescript",
				uiSystem: "@xala-technologies/ui-system",
				compliance: { accessibility: "AAA", norwegian: false, gdpr: false },
			});

			// Parse AI response and create suggestions
			// This is a simplified implementation
			return [
				{
					type: "pattern",
					title: "AI-suggested pattern",
					description: "AI-generated pattern recommendation",
					recommendation: aiResult.explanation,
					confidence: aiResult.confidence,
					reasoning: aiResult.suggestions,
					references: [],
					impact: "medium",
					effort: "medium",
				},
			];
		} catch (error) {
			logger.debug("Failed to generate AI pattern suggestions:", error);
			return [];
		}
	}

	/**
	 * Analyze existing code for optimization opportunities
	 */
	private async analyzeOptimizationOpportunities(
		code: string,
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		const suggestions: ComponentSuggestion[] = [];

		// Check for missing React.memo
		if (!code.includes("React.memo") && code.includes("export const")) {
			suggestions.push({
				type: "optimization",
				title: "Add React.memo for performance",
				description:
					"Prevent unnecessary re-renders by wrapping component with React.memo",
				recommendation: "Wrap your component with React.memo",
				code: this.generateMemoizationCode(context.componentName),
				confidence: 0.7,
				reasoning: ["Component not memoized", "Can prevent re-renders"],
				references: [],
				impact: "medium",
				effort: "low",
			});
		}

		// Check for missing useCallback on event handlers
		if (code.includes("onClick") && !code.includes("useCallback")) {
			suggestions.push({
				type: "optimization",
				title: "Use useCallback for event handlers",
				description:
					"Optimize event handlers with useCallback to prevent child re-renders",
				recommendation: "Wrap event handlers with useCallback",
				code: `const handleClick = useCallback(() => {
  // Your click handler logic
}, [/* dependencies */]);`,
				confidence: 0.6,
				reasoning: [
					"Event handlers not optimized",
					"Can prevent child re-renders",
				],
				references: [],
				impact: "low",
				effort: "low",
			});
		}

		return suggestions;
	}

	/**
	 * Generate general optimization suggestions
	 */
	private async generateGeneralOptimizations(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		const suggestions: ComponentSuggestion[] = [];

		// Type-specific optimizations
		if (context.componentType === "table" || context.componentType === "list") {
			suggestions.push({
				type: "optimization",
				title: "Consider virtualization for large datasets",
				description:
					"Use virtual scrolling for better performance with large lists",
				recommendation:
					"Implement react-window or similar virtualization library",
				confidence: 0.8,
				reasoning: [
					"List/table components benefit from virtualization",
					"Improves performance with large datasets",
				],
				references: [],
				impact: "high",
				effort: "medium",
			});
		}

		return suggestions;
	}

	/**
	 * Generate accessibility suggestions
	 */
	private async generateAccessibilitySuggestion(
		context: SuggestionContext,
		accessibility: any,
	): Promise<ComponentSuggestion | null> {
		return {
			type: "accessibility",
			title: "Implement WCAG AAA accessibility",
			description:
				"Add comprehensive accessibility features for inclusive design",
			recommendation:
				"Include ARIA labels, keyboard navigation, and semantic HTML",
			code: this.generateAccessibilityCode(context.componentName),
			confidence: 0.9,
			reasoning: [
				"WCAG AAA compliance required",
				"Accessibility improves user experience",
				"Required for Norwegian compliance",
			],
			references: [],
			impact: "high",
			effort: "medium",
		};
	}

	/**
	 * Generate general accessibility suggestions
	 */
	private async generateGeneralAccessibilitySuggestions(
		context: SuggestionContext,
	): Promise<ComponentSuggestion[]> {
		const suggestions: ComponentSuggestion[] = [];

		// Always suggest basic accessibility
		suggestions.push({
			type: "accessibility",
			title: "Add basic accessibility features",
			description:
				"Implement essential accessibility attributes and semantic HTML",
			recommendation: "Use semantic HTML elements and add ARIA labels",
			code: `// Use semantic HTML
<main role="main">
  <h1>Page Title</h1>
  <nav aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</main>`,
			confidence: 0.85,
			reasoning: [
				"Accessibility is essential for inclusive design",
				"Improves SEO and user experience",
				"Required for compliance",
			],
			references: [],
			impact: "high",
			effort: "low",
		});

		return suggestions;
	}

	// Helper methods for generating code examples
	private generateMemoizationCode(componentName: string): string {
		return `import React from 'react';

export const ${componentName} = React.memo((props: ${componentName}Props): JSX.Element => {
  // Component implementation
  return (
    <div>
      {/* Your component content */}
    </div>
  );
});

${componentName}.displayName = '${componentName}';`;
	}

	private generateLazyLoadingCode(componentName: string): string {
		return `import React, { Suspense } from 'react';

// Lazy load the component
const ${componentName} = React.lazy(() => import('./${componentName}'));

// Usage with Suspense
export const LazyLoaded${componentName} = (): JSX.Element => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <${componentName} />
    </Suspense>
  );
};`;
	}

	private generateAccessibilityCode(componentName: string): string {
		return `export const ${componentName} = (props: ${componentName}Props): JSX.Element => {
  return (
    <main role="main" aria-labelledby="main-heading">
      <h1 id="main-heading" className="sr-only">
        ${componentName} Component
      </h1>
      <section aria-label="Main content">
        {/* Accessible content with ARIA labels */}
        <button
          aria-label="Perform action"
          onClick={handleClick}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Action Button
        </button>
      </section>
    </main>
  );
};`;
	}

	private generateNorwegianComplianceCode(componentName: string): string {
		return `// Norwegian compliance implementation
export const ${componentName} = (props: ${componentName}Props): JSX.Element => {
  // NSM classification marker
  const nsmClassification = "OPEN"; // Adjust based on data sensitivity
  
  return (
    <div data-nsm-classification={nsmClassification}>
      <header>
        {/* Norwegian locale support */}
        <h1 lang="no">{props.title || "Tittel"}</h1>
      </header>
      {/* Component content with Norwegian compliance */}
    </div>
  );
};`;
	}

	private generateGDPRComplianceCode(componentName: string): string {
		return `import { useState } from 'react';

export const ${componentName} = (props: ${componentName}Props): JSX.Element => {
  const [consent, setConsent] = useState(false);
  
  return (
    <div>
      {/* GDPR consent handling */}
      {!consent && (
        <div className="gdpr-banner">
          <p>We use cookies and collect data. Please consent to continue.</p>
          <button onClick={() => setConsent(true)}>
            Accept
          </button>
        </div>
      )}
      
      {consent && (
        <div>
          {/* Main component content */}
          <button onClick={() => handleDataDeletion()}>
            Delete My Data (GDPR Right)
          </button>
        </div>
      )}
    </div>
  );
};`;
	}

	private estimateComponentComplexity(
		context: SuggestionContext,
	): "simple" | "medium" | "complex" {
		const description = context.description?.toLowerCase() || "";
		const type = context.componentType;

		// Complex component types
		if (["table", "chart", "calendar", "editor"].includes(type)) {
			return "complex";
		}

		// Complex descriptions
		if (
			description.includes("interactive") ||
			description.includes("dynamic") ||
			description.includes("complex") ||
			description.includes("advanced")
		) {
			return "complex";
		}

		// Medium complexity
		if (["form", "modal", "navigation"].includes(type)) {
			return "medium";
		}

		return "simple";
	}

	private getDefaultOptions(): SuggestionOptions {
		return {
			includeReuse: true,
			includePatterns: true,
			includeOptimizations: true,
			includeAccessibility: true,
			includePerformance: true,
			includeCompliance: true,
			maxSuggestions: 10,
			minConfidence: 0.5,
		};
	}
}
