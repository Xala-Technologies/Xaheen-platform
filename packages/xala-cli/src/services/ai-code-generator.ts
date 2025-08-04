import { NetworkError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export interface AIGenerateRequest {
	readonly description: string;
	readonly platform: string;
	readonly componentType: string;
	readonly features: ReadonlyArray<string>;
	readonly compliance: string;
	readonly locale: string;
}

export interface GeneratedCode {
	readonly code: string;
	readonly filename: string;
	readonly metadata: {
		readonly platform: string;
		readonly components: ReadonlyArray<string>;
		readonly tokens: ReadonlyArray<string>;
		readonly features: ReadonlyArray<string>;
	};
	readonly tests?: string;
	readonly stories?: string;
	readonly documentation?: string;
}

export interface AISuggestion {
	readonly title: string;
	readonly description: string;
	readonly components: ReadonlyArray<string>;
	readonly patterns: ReadonlyArray<string>;
	readonly confidence: number;
}

export interface AIExplanation {
	readonly description: string;
	readonly examples: ReadonlyArray<string>;
	readonly complianceNotes?: string;
	readonly relatedConcepts: ReadonlyArray<string>;
}

export class AICodeGenerator {
	private readonly provider: string;
	private readonly apiKey?: string;

	constructor(provider = "openai") {
		this.provider = provider;
		this.apiKey =
			process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
	}

	async generateComponent(request: AIGenerateRequest): Promise<GeneratedCode> {
		logger.info(
			`Generating ${request.platform} component: ${request.description}`,
		);

		try {
			const prompt = this.buildGenerationPrompt(request);
			const response = await this.callAI(prompt);

			return this.parseGeneratedCode(response, request);
		} catch (error) {
			logger.error("AI generation failed:", error);
			throw new NetworkError("Failed to generate code with AI");
		}
	}

	async getSuggestions(
		context: string,
		options: {
			platform: string;
			maxSuggestions: number;
		},
	): Promise<ReadonlyArray<AISuggestion>> {
		const prompt = this.buildSuggestionPrompt(context, options);
		const response = await this.callAI(prompt);

		return this.parseSuggestions(response);
	}

	async explainConcept(
		concept: string,
		options: {
			platform: string;
			includeExamples: boolean;
			includeCompliance: boolean;
		},
	): Promise<AIExplanation> {
		const prompt = this.buildExplanationPrompt(concept, options);
		const response = await this.callAI(prompt);

		return this.parseExplanation(response);
	}

	private buildGenerationPrompt(request: AIGenerateRequest): string {
		return `Generate a ${request.platform} component based on the following specifications:

Description: ${request.description}
Platform: ${request.platform}
Component Type: ${request.componentType}
Features: ${request.features.join(", ")}
Compliance Level: ${request.compliance}
Locale: ${request.locale}

MANDATORY COMPLIANCE RULES:
- NO raw HTML elements (div, span, p, h1-h6, button, input, etc.)
- ONLY use semantic components from @xala-technologies/ui-system
- NO hardcoded styling - use design tokens only
- Enhanced 8pt Grid System - all spacing in 8px increments
- WCAG 2.2 AAA compliance for accessibility
- NO hardcoded text - use t() function for all user-facing text
- MANDATORY localization support (${request.locale})
- Explicit TypeScript return types (no 'any' types)
- SOLID principles and component composition
- Maximum 200 lines per file, 20 lines per function

Required imports for ${request.platform}:
${this.getComplianceImports(request.platform)}

Generate the component following these patterns:
1. Use only semantic UI components (Card, Stack, Typography, Button, etc.)
2. All styling through design tokens: tokens.spacing.*, tokens.colors.*, etc.
3. All text through localization: t('key', 'default')
4. Proper TypeScript interfaces with readonly properties
5. WCAG AAA accessibility attributes

Respond with valid ${request.platform} code that strictly follows all compliance rules.`;
	}

	private buildSuggestionPrompt(
		context: string,
		options: {
			platform: string;
			maxSuggestions: number;
		},
	): string {
		return `Provide ${options.maxSuggestions} design system suggestions for: ${context}

Platform: ${options.platform}

Focus on:
- Component patterns from @xala-technologies/ui-system
- Design token usage
- Accessibility best practices
- Multi-language support
- Performance optimization

Return suggestions as JSON array with: title, description, components, patterns, confidence`;
	}

	private buildExplanationPrompt(
		concept: string,
		options: {
			platform: string;
			includeExamples: boolean;
			includeCompliance: boolean;
		},
	): string {
		return `Explain the design system concept: ${concept}

Platform context: ${options.platform}
Include examples: ${options.includeExamples}
Include compliance notes: ${options.includeCompliance}

Focus on:
- How it works in Xala Design System
- Best practices and patterns
- Implementation guidance
${options.includeCompliance ? "- Compliance requirements (WCAG, NSM, GDPR)" : ""}
${options.includeExamples ? "- Code examples" : ""}

Provide clear, practical explanation.`;
	}

	private async callAI(prompt: string): Promise<string> {
		// Mock implementation - in production, integrate with actual AI services
		logger.debug("Calling AI service with prompt length:", prompt.length);

		// Simulate AI response delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return this.getMockResponse(prompt);
	}

	private getMockResponse(prompt: string): string {
		// Mock responses based on prompt content
		if (prompt.includes("Generate a react component")) {
			return this.getMockReactComponent();
		} else if (prompt.includes("Provide") && prompt.includes("suggestions")) {
			return this.getMockSuggestions();
		} else if (prompt.includes("Explain")) {
			return this.getMockExplanation();
		}

		return "Mock AI response";
	}

	private getMockReactComponent(): string {
		return `import React from 'react';
import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../hooks/useLocalization';

export interface GeneratedComponentProps {
  readonly title?: string;
  readonly onAction?: () => void;
  readonly variant?: 'primary' | 'secondary';
}

export const GeneratedComponent = ({
  title,
  onAction,
  variant = 'primary'
}: GeneratedComponentProps): JSX.Element => {
  const tokens = useTokens();
  const { t } = useLocalization();

  return (
    <Card 
      padding={tokens.spacing.large}
      borderRadius={tokens.borderRadius.medium}
      backgroundColor={tokens.colors.surface.primary}
    >
      <Stack spacing={tokens.spacing.medium} direction="vertical">
        <Typography
          variant="heading2"
          color={tokens.colors.text.primary}
        >
          {title || t('generated.title', 'AI Generated Component')}
        </Typography>
        
        <Typography
          variant="body1"
          color={tokens.colors.text.secondary}
        >
          {t('generated.description', 'This component was generated by AI')}
        </Typography>
        
        {onAction && (
          <Button
            variant={variant}
            onClick={onAction}
            size="large"
            ariaLabel={t('generated.actionLabel', 'Perform action')}
          >
            {t('generated.actionText', 'Take Action')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};`;
	}

	private getMockSuggestions(): string {
		return JSON.stringify([
			{
				title: "User Dashboard Layout",
				description:
					"Comprehensive dashboard with navigation and content areas",
				components: ["Card", "Stack", "Navigation", "DataTable"],
				patterns: ["Dashboard Layout", "Responsive Grid"],
				confidence: 0.95,
			},
			{
				title: "Data Visualization Cards",
				description: "Interactive cards for displaying key metrics",
				components: ["Card", "Typography", "Progress", "Badge"],
				patterns: ["Metric Display", "Status Indicators"],
				confidence: 0.88,
			},
		]);
	}

	private getMockExplanation(): string {
		return JSON.stringify({
			description:
				"Design tokens are centralized design decisions that define the visual properties of your design system.",
			examples: [
				"tokens.colors.primary.500 - Primary brand color",
				"tokens.spacing.medium - 16px spacing unit",
				"tokens.typography.heading1 - Main heading styles",
			],
			complianceNotes:
				"Design tokens ensure consistency and make it easier to maintain WCAG compliance across all components.",
			relatedConcepts: [
				"Component Composition",
				"Theme System",
				"Accessibility",
			],
		});
	}

	private parseGeneratedCode(
		response: string,
		request: AIGenerateRequest,
	): GeneratedCode {
		// Extract code from AI response
		const codeMatch = response.match(/```(?:tsx?|jsx?)?\n([\s\S]*?)\n```/);
		const code = codeMatch?.[1] || response;

		// Generate filename based on description
		const componentName =
			this.extractComponentName(code) || "GeneratedComponent";
		const extension = this.getFileExtension(request.platform);

		return {
			code,
			filename: `${componentName}${extension}`,
			metadata: {
				platform: request.platform,
				components: this.extractUsedComponents(code),
				tokens: this.extractUsedTokens(code),
				features: request.features,
			},
		};
	}

	private parseSuggestions(response: string): ReadonlyArray<AISuggestion> {
		try {
			return JSON.parse(response);
		} catch {
			return [
				{
					title: "Default Suggestion",
					description: "Failed to parse AI suggestions",
					components: [],
					patterns: [],
					confidence: 0.5,
				},
			];
		}
	}

	private parseExplanation(response: string): AIExplanation {
		try {
			return JSON.parse(response);
		} catch {
			return {
				description: response,
				examples: [],
				relatedConcepts: [],
			};
		}
	}

	private extractComponentName(code: string): string | null {
		const match = code.match(/export (?:const|function) (\w+)/);
		return match?.[1] || null;
	}

	private extractUsedComponents(code: string): ReadonlyArray<string> {
		const componentMatches = code.match(
			/(?:import|from).*@xala-technologies\/ui-system.*\{([^}]+)\}/,
		);
		if (!componentMatches?.[1]) return [];

		return componentMatches[1]
			.split(",")
			.map((comp) => comp.trim())
			.filter((comp) => comp.length > 0);
	}

	private extractUsedTokens(code: string): ReadonlyArray<string> {
		const tokenMatches = code.match(/tokens\.(\w+(?:\.\w+)*)/g);
		return tokenMatches ? [...new Set(tokenMatches)] : [];
	}

	private getFileExtension(platform: string): string {
		switch (platform) {
			case "react":
			case "vue":
			case "angular":
				return ".tsx";
			case "flutter":
				return ".dart";
			case "ios":
				return ".swift";
			case "android":
				return ".kt";
			default:
				return ".ts";
		}
	}

	private getComplianceImports(platform: string): string {
		switch (platform) {
			case "react":
				return `import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../hooks/useLocalization';`;
			case "vue":
				return `import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../composables/useLocalization';`;
			default:
				return "";
		}
	}
}
