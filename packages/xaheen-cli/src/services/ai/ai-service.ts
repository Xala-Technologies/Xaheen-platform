/**
 * AI Service for Intelligent Code Generation
 *
 * Provides natural language to code generation capabilities using various AI providers
 */

import type { XaheenConfig } from "../../types/index.js";
import { logger } from "../../utils/logger.js";

export interface AIProvider {
	name: string;
	generateCode(
		prompt: string,
		context: GenerationContext,
	): Promise<GeneratedCode>;
	generateComponent(
		description: string,
		context: ComponentContext,
	): Promise<GeneratedComponent>;
	generateService(
		description: string,
		context: ServiceContext,
	): Promise<GeneratedService>;
	analyzeCode(code: string): Promise<CodeAnalysis>;
}

export interface GenerationContext {
	framework: string;
	platform: string;
	stack: string;
	projectPath: string;
	dependencies: string[];
	codeStyle: "typescript" | "javascript";
	uiSystem: string;
	compliance: {
		accessibility: string;
		norwegian: boolean;
		gdpr: boolean;
	};
}

export interface ComponentContext extends GenerationContext {
	componentType: "page" | "component" | "layout" | "form" | "modal";
	props?: Array<{
		name: string;
		type: string;
		required: boolean;
		description?: string;
	}>;
	features?: string[];
	styling: "tailwind" | "css-modules" | "styled-components";
}

export interface ServiceContext extends GenerationContext {
	serviceType: "api" | "business" | "data" | "utility";
	database?: string;
	authentication?: boolean;
	caching?: boolean;
}

export interface GeneratedCode {
	code: string;
	language: string;
	explanation: string;
	suggestions: string[];
	confidence: number;
}

export interface GeneratedComponent {
	component: string;
	styles?: string;
	tests?: string;
	stories?: string;
	types?: string;
	documentation: string;
	dependencies: string[];
	features: string[];
}

export interface GeneratedService {
	service: string;
	interface?: string;
	tests?: string;
	dto?: string;
	entity?: string;
	documentation: string;
	dependencies: string[];
	endpoints?: string[];
}

export interface CodeAnalysis {
	quality: number;
	issues: Array<{
		type: "error" | "warning" | "suggestion";
		message: string;
		line?: number;
		fix?: string;
	}>;
	suggestions: string[];
	complexity: number;
	maintainability: number;
}

/**
 * OpenAI Provider for GPT-4 based code generation
 */
export class OpenAIProvider implements AIProvider {
	name = "OpenAI GPT-4";
	private apiKey: string;
	private baseUrl = "https://api.openai.com/v1";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async generateCode(
		prompt: string,
		context: GenerationContext,
	): Promise<GeneratedCode> {
		const systemPrompt = this.buildSystemPrompt(context);
		const userPrompt = `Generate ${context.framework} code for: ${prompt}`;

		try {
			const response = await this.callOpenAI([
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			]);

			return this.parseCodeResponse(response, context);
		} catch (error) {
			logger.error("OpenAI API error:", error);
			throw new Error(`Failed to generate code: ${error}`);
		}
	}

	async generateComponent(
		description: string,
		context: ComponentContext,
	): Promise<GeneratedComponent> {
		const systemPrompt = this.buildComponentSystemPrompt(context);
		const userPrompt = `Create a ${context.componentType} component: ${description}

Requirements:
- Framework: ${context.framework}
- UI System: ${context.uiSystem}
- Styling: ${context.styling}
- TypeScript: ${context.codeStyle === "typescript"}
- Accessibility: ${context.compliance.accessibility} compliant
- Norwegian compliance: ${context.compliance.norwegian}
- GDPR compliance: ${context.compliance.gdpr}

${context.props ? `Props: ${JSON.stringify(context.props, null, 2)}` : ""}
${context.features ? `Features: ${context.features.join(", ")}` : ""}`;

		try {
			const response = await this.callOpenAI([
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			]);

			return this.parseComponentResponse(response, context);
		} catch (error) {
			logger.error("OpenAI component generation error:", error);
			throw new Error(`Failed to generate component: ${error}`);
		}
	}

	async generateService(
		description: string,
		context: ServiceContext,
	): Promise<GeneratedService> {
		const systemPrompt = this.buildServiceSystemPrompt(context);
		const userPrompt = `Create a ${context.serviceType} service: ${description}

Requirements:
- Framework: ${context.framework}
- Database: ${context.database || "None"}
- Authentication: ${context.authentication ? "Required" : "Not required"}
- Caching: ${context.caching ? "Required" : "Not required"}
- TypeScript: ${context.codeStyle === "typescript"}`;

		try {
			const response = await this.callOpenAI([
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			]);

			return this.parseServiceResponse(response, context);
		} catch (error) {
			logger.error("OpenAI service generation error:", error);
			throw new Error(`Failed to generate service: ${error}`);
		}
	}

	async analyzeCode(code: string): Promise<CodeAnalysis> {
		const systemPrompt = `You are a senior code reviewer. Analyze the provided code for:
1. Code quality and best practices
2. Potential issues and bugs
3. Performance optimizations
4. Security concerns
5. Maintainability
6. Accessibility compliance

Provide a JSON response with quality score (0-100), issues array, suggestions, complexity score, and maintainability score.`;

		try {
			const response = await this.callOpenAI([
				{ role: "system", content: systemPrompt },
				{ role: "user", content: `Analyze this code:\n\n${code}` },
			]);

			return this.parseAnalysisResponse(response);
		} catch (error) {
			logger.error("OpenAI code analysis error:", error);
			throw new Error(`Failed to analyze code: ${error}`);
		}
	}

	private buildSystemPrompt(context: GenerationContext): string {
		return `You are an expert ${context.framework} developer specializing in ${context.platform} applications.

Context:
- Framework: ${context.framework}
- Platform: ${context.platform}
- Stack: ${context.stack}
- UI System: ${context.uiSystem || "@xala-technologies/ui-system"}
- Code Style: ${context.codeStyle}
- Accessibility: ${context.compliance.accessibility} compliance required
- Norwegian compliance: ${context.compliance.norwegian}
- GDPR compliance: ${context.compliance.gdpr}

Generate high-quality, production-ready code that follows:
1. Best practices for ${context.framework}
2. TypeScript strict mode
3. WCAG ${context.compliance.accessibility} accessibility standards
4. Clean code principles
5. Proper error handling
6. Comprehensive documentation
7. Security best practices

Always include proper TypeScript types, JSDoc comments, and error handling.`;
	}

	private buildComponentSystemPrompt(context: ComponentContext): string {
		return `You are an expert React/Next.js component developer.

Generate a complete ${context.componentType} component with:
1. Main component file (.tsx)
2. Type definitions
3. Unit tests (if applicable)
4. Storybook stories (if applicable)
5. CSS/Tailwind styles
6. Documentation

Requirements:
- Use ${context.uiSystem} components only
- Follow ${context.styling} for styling
- Implement ${context.compliance.accessibility} accessibility
- Use semantic HTML
- Include proper ARIA labels
- Handle loading and error states
- Responsive design
- TypeScript strict mode
- Clean, maintainable code

Component should be production-ready and follow modern React patterns.`;
	}

	private buildServiceSystemPrompt(context: ServiceContext): string {
		return `You are an expert backend developer specializing in ${context.framework}.

Generate a complete ${context.serviceType} service with:
1. Service class implementation
2. Interface definitions
3. DTO classes (if applicable)
4. Entity models (if applicable)
5. Unit tests
6. API documentation
7. Error handling

Requirements:
- Follow ${context.framework} best practices
- Implement proper error handling
- Use dependency injection
- Include input validation
- Add comprehensive logging
- Follow SOLID principles
- TypeScript strict mode
- Security best practices

Service should be production-ready and scalable.`;
	}

	private async callOpenAI(
		messages: Array<{ role: string; content: string }>,
	): Promise<string> {
		// Simulated OpenAI API call - in real implementation, use actual OpenAI SDK
		logger.debug("Calling OpenAI API with messages:", messages.length);

		// For now, return a placeholder response
		return JSON.stringify({
			code: "// Generated code placeholder",
			explanation:
				"This is a placeholder response. Integrate with actual OpenAI API.",
			suggestions: ["Add proper error handling", "Include unit tests"],
			confidence: 0.85,
		});
	}

	private parseCodeResponse(
		response: string,
		context: GenerationContext,
	): GeneratedCode {
		try {
			const parsed = JSON.parse(response);
			return {
				code: parsed.code || "// Error parsing response",
				language: context.codeStyle,
				explanation: parsed.explanation || "No explanation provided",
				suggestions: parsed.suggestions || [],
				confidence: parsed.confidence || 0.5,
			};
		} catch {
			return {
				code: response,
				language: context.codeStyle,
				explanation: "Raw response from AI provider",
				suggestions: [],
				confidence: 0.5,
			};
		}
	}

	private parseComponentResponse(
		response: string,
		context: ComponentContext,
	): GeneratedComponent {
		// Parse the AI response into structured component data
		return {
			component: "// Generated component placeholder",
			documentation: "Component generated with AI assistance",
			dependencies: [context.uiSystem],
			features: context.features || [],
		};
	}

	private parseServiceResponse(
		response: string,
		context: ServiceContext,
	): GeneratedService {
		// Parse the AI response into structured service data
		return {
			service: "// Generated service placeholder",
			documentation: "Service generated with AI assistance",
			dependencies: [],
			endpoints: [],
		};
	}

	private parseAnalysisResponse(response: string): CodeAnalysis {
		try {
			const parsed = JSON.parse(response);
			return {
				quality: parsed.quality || 50,
				issues: parsed.issues || [],
				suggestions: parsed.suggestions || [],
				complexity: parsed.complexity || 50,
				maintainability: parsed.maintainability || 50,
			};
		} catch {
			return {
				quality: 50,
				issues: [
					{ type: "error", message: "Failed to parse analysis response" },
				],
				suggestions: [],
				complexity: 50,
				maintainability: 50,
			};
		}
	}
}

/**
 * Anthropic Claude Provider
 */
export class AnthropicProvider implements AIProvider {
	name = "Anthropic Claude";
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async generateCode(
		prompt: string,
		context: GenerationContext,
	): Promise<GeneratedCode> {
		// Placeholder implementation - integrate with actual Anthropic API
		logger.debug("Generating code with Anthropic Claude");
		return {
			code: "// Generated with Claude placeholder",
			language: context.codeStyle,
			explanation: "This is a placeholder for Claude integration",
			suggestions: [],
			confidence: 0.8,
		};
	}

	async generateComponent(
		description: string,
		context: ComponentContext,
	): Promise<GeneratedComponent> {
		return {
			component: "// Generated component with Claude",
			documentation: "Component generated with Claude assistance",
			dependencies: [context.uiSystem],
			features: context.features || [],
		};
	}

	async generateService(
		description: string,
		context: ServiceContext,
	): Promise<GeneratedService> {
		return {
			service: "// Generated service with Claude",
			documentation: "Service generated with Claude assistance",
			dependencies: [],
			endpoints: [],
		};
	}

	async analyzeCode(code: string): Promise<CodeAnalysis> {
		return {
			quality: 75,
			issues: [],
			suggestions: ["Consider adding more documentation"],
			complexity: 40,
			maintainability: 80,
		};
	}
}

/**
 * AI Service Manager
 */
export class AIService {
	private providers: Map<string, AIProvider> = new Map();
	private currentProvider: string = "openai";

	constructor(config?: XaheenConfig) {
		this.initializeProviders(config);
	}

	private initializeProviders(config?: XaheenConfig): void {
		// Initialize providers based on configuration
		const openaiKey = process.env.OPENAI_API_KEY || config?.ai?.apiKey;
		const anthropicKey = process.env.ANTHROPIC_API_KEY;

		if (openaiKey) {
			this.providers.set("openai", new OpenAIProvider(openaiKey));
		}

		if (anthropicKey) {
			this.providers.set("anthropic", new AnthropicProvider(anthropicKey));
		}

		if (config?.ai?.provider) {
			this.currentProvider = config.ai.provider;
		}
	}

	setProvider(providerName: string): void {
		if (!this.providers.has(providerName)) {
			throw new Error(`AI provider '${providerName}' not available`);
		}
		this.currentProvider = providerName;
	}

	getProvider(): AIProvider {
		const provider = this.providers.get(this.currentProvider);
		if (!provider) {
			throw new Error(
				`No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.`,
			);
		}
		return provider;
	}

	async generateCode(
		prompt: string,
		context: GenerationContext,
	): Promise<GeneratedCode> {
		const provider = this.getProvider();
		logger.info(`Generating code with ${provider.name}...`);
		return provider.generateCode(prompt, context);
	}

	async generateComponent(
		description: string,
		context: ComponentContext,
	): Promise<GeneratedComponent> {
		const provider = this.getProvider();
		logger.info(`Generating component with ${provider.name}...`);
		return provider.generateComponent(description, context);
	}

	async generateService(
		description: string,
		context: ServiceContext,
	): Promise<GeneratedService> {
		const provider = this.getProvider();
		logger.info(`Generating service with ${provider.name}...`);
		return provider.generateService(description, context);
	}

	async analyzeCode(code: string): Promise<CodeAnalysis> {
		const provider = this.getProvider();
		logger.info(`Analyzing code with ${provider.name}...`);
		return provider.analyzeCode(code);
	}

	getAvailableProviders(): string[] {
		return Array.from(this.providers.keys());
	}
}
