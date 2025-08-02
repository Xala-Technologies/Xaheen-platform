import { consola } from "consola";
import type { AIProvider } from "./ai-generator";

// Intent types that the NLP processor can recognize
export type Intent = 
	| "generate_component"
	| "generate_page"
	| "generate_service"
	| "generate_hook"
	| "generate_layout"
	| "generate_model"
	| "generate_feature"
	| "optimize_code"
	| "check_compliance"
	| "debug_error"
	| "help"
	| "unknown";

// Entity types extracted from user input
export interface ExtractedEntity {
	type: "component_name" | "page_name" | "service_name" | "hook_name" | "feature_type" | "file_path" | "framework" | "ui_system" | "compliance_level";
	value: string;
	confidence: number;
	position: [number, number]; // start and end position in text
}

// Command parameters inferred from user input
export interface InferredParameters {
	name?: string;
	type?: string;
	framework?: string;
	ui?: string;
	compliance?: string;
	authentication?: boolean;
	testing?: boolean;
	documentation?: boolean;
	force?: boolean;
	[key: string]: any;
}

// NLP processing result
export interface NLPResult {
	intent: Intent;
	confidence: number;
	entities: ExtractedEntity[];
	parameters: InferredParameters;
	clarifications: string[];
	suggestedCommand: string;
	alternativeIntents: Intent[];
}

// Conversation context for multi-turn dialogs
export interface ConversationContext {
	sessionId: string;
	history: ConversationTurn[];
	currentTask?: string;
	pendingClarifications: string[];
	userPreferences: UserPreferences;
}

// Individual conversation turn
export interface ConversationTurn {
	timestamp: string;
	userInput: string;
	intent: Intent;
	response: string;
	success: boolean;
}

// User preferences learned over time
export interface UserPreferences {
	preferredFramework?: string;
	preferredUI?: string;
	preferredCompliance?: string;
	commonPatterns: string[];
	shortcuts: Record<string, string>;
}

/**
 * Natural Language Processing for CLI commands
 */
export class NLPProcessor {
	private aiProvider: AIProvider;
	private isEnabled: boolean;
	private conversations: Map<string, ConversationContext>;
	private intentPatterns: Map<Intent, RegExp[]>;
	private entityPatterns: Map<string, RegExp>;

	constructor(aiProvider: AIProvider = "disabled") {
		this.aiProvider = aiProvider;
		this.isEnabled = aiProvider !== "disabled";
		this.conversations = new Map();
		this.intentPatterns = this.initializeIntentPatterns();
		this.entityPatterns = this.initializeEntityPatterns();

		if (!this.isEnabled) {
			consola.info("NLP features disabled. Using pattern matching.");
		}
	}

	/**
	 * Process natural language input and extract intent/entities
	 */
	async processInput(
		input: string, 
		sessionId: string = "default"
	): Promise<NLPResult> {
		const context = this.getOrCreateContext(sessionId);
		
		try {
			let result: NLPResult;

			if (this.isEnabled) {
				result = await this.processWithAI(input, context);
			} else {
				result = this.processWithPatterns(input, context);
			}

			// Update conversation history
			this.updateConversationHistory(context, input, result);

			return result;
		} catch (error) {
			consola.warn("NLP processing failed, using patterns:", error);
			return this.processWithPatterns(input, context);
		}
	}

	/**
	 * Resolve ambiguity by asking clarifying questions
	 */
	async resolveAmbiguity(
		input: string, 
		possibleIntents: Intent[], 
		sessionId: string = "default"
	): Promise<string[]> {
		const clarifications: string[] = [];

		if (possibleIntents.includes("generate_component") && possibleIntents.includes("generate_page")) {
			clarifications.push("Did you want to create a reusable component or a full page?");
		}

		if (possibleIntents.includes("generate_service")) {
			clarifications.push("What type of service: API, business logic, or integration?");
		}

		// Add more clarification logic based on ambiguous intents
		return clarifications;
	}

	/**
	 * Get context-aware suggestions
	 */
	async getSuggestions(
		partialInput: string, 
		sessionId: string = "default"
	): Promise<string[]> {
		const context = this.getOrCreateContext(sessionId);
		const suggestions: string[] = [];

		// Based on conversation history
		if (context.history.length > 0) {
			const lastIntent = context.history[context.history.length - 1].intent;
			suggestions.push(...this.getContextualSuggestions(lastIntent, partialInput));
		}

		// Based on user preferences
		const prefs = context.userPreferences;
		if (prefs.commonPatterns.length > 0) {
			suggestions.push(...prefs.commonPatterns.filter(p => 
				p.toLowerCase().includes(partialInput.toLowerCase())
			));
		}

		// Common patterns
		if (partialInput.toLowerCase().includes("create") || partialInput.toLowerCase().includes("generate")) {
			suggestions.push(
				"create a new component",
				"generate a page with authentication",
				"create a service with caching",
				"generate a complete feature"
			);
		}

		return suggestions.slice(0, 5); // Limit to top 5 suggestions
	}

	/**
	 * Manage conversation flow
	 */
	async manageConversation(
		input: string, 
		sessionId: string = "default"
	): Promise<string> {
		const context = this.getOrCreateContext(sessionId);

		// Handle pending clarifications
		if (context.pendingClarifications.length > 0) {
			return this.handleClarificationResponse(input, context);
		}

		// Process new input
		const result = await this.processInput(input, sessionId);

		// If ambiguous, ask for clarification
		if (result.clarifications.length > 0) {
			context.pendingClarifications = result.clarifications;
			return result.clarifications[0];
		}

		return result.suggestedCommand;
	}

	/**
	 * Learn user patterns and preferences
	 */
	async learnFromInteraction(
		input: string,
		command: string,
		success: boolean,
		sessionId: string = "default"
	): Promise<void> {
		const context = this.getOrCreateContext(sessionId);

		if (success) {
			// Add to common patterns
			if (!context.userPreferences.commonPatterns.includes(input)) {
				context.userPreferences.commonPatterns.push(input);
			}

			// Create shortcuts for frequent patterns
			if (input.length > 10 && command.length > 0) {
				const shortcut = this.generateShortcut(input);
				context.userPreferences.shortcuts[shortcut] = command;
			}

			// Learn preferences from successful commands
			await this.extractPreferences(command, context);
		}

		consola.info(`Learning from interaction: ${success ? "success" : "failure"}`);
	}

	/**
	 * Analyze command history for patterns
	 */
	async analyzePatterns(sessionId: string = "default"): Promise<UserPreferences> {
		const context = this.getOrCreateContext(sessionId);
		const history = context.history;

		if (history.length === 0) {
			return context.userPreferences;
		}

		// Analyze framework preferences
		const frameworkCounts = new Map<string, number>();
		const uiCounts = new Map<string, number>();
		const complianceCounts = new Map<string, number>();

		history.forEach(turn => {
			if (turn.success && turn.intent.startsWith("generate_")) {
				// Extract patterns from successful generations
				// This would be more sophisticated in a real implementation
			}
		});

		// Update preferences based on analysis
		if (frameworkCounts.size > 0) {
			const mostUsed = Array.from(frameworkCounts.entries())
				.sort(([,a], [,b]) => b - a)[0];
			context.userPreferences.preferredFramework = mostUsed[0];
		}

		return context.userPreferences;
	}

	/**
	 * Initialize intent recognition patterns
	 */
	private initializeIntentPatterns(): Map<Intent, RegExp[]> {
		const patterns = new Map<Intent, RegExp[]>();

		patterns.set("generate_component", [
			/create?\s+(a\s+)?(new\s+)?component/i,
			/generate?\s+(a\s+)?(new\s+)?component/i,
			/make?\s+(a\s+)?(new\s+)?component/i,
			/(new|create|generate|make)\s+.*component/i,
		]);

		patterns.set("generate_page", [
			/create?\s+(a\s+)?(new\s+)?page/i,
			/generate?\s+(a\s+)?(new\s+)?page/i,
			/make?\s+(a\s+)?(new\s+)?page/i,
			/(new|create|generate|make)\s+.*page/i,
		]);

		patterns.set("generate_service", [
			/create?\s+(a\s+)?(new\s+)?service/i,
			/generate?\s+(a\s+)?(new\s+)?service/i,
			/make?\s+(a\s+)?(new\s+)?service/i,
			/(api|business|integration)\s+service/i,
		]);

		patterns.set("generate_hook", [
			/create?\s+(a\s+)?(new\s+)?hook/i,
			/generate?\s+(a\s+)?(new\s+)?hook/i,
			/make?\s+(a\s+)?(react\s+)?hook/i,
			/custom\s+hook/i,
		]);

		patterns.set("generate_layout", [
			/create?\s+(a\s+)?(new\s+)?layout/i,
			/generate?\s+(a\s+)?(new\s+)?layout/i,
			/make?\s+(a\s+)?(new\s+)?layout/i,
			/(app|page)\s+layout/i,
		]);

		patterns.set("generate_model", [
			/create?\s+(a\s+)?(new\s+)?model/i,
			/generate?\s+(a\s+)?(new\s+)?model/i,
			/database\s+model/i,
			/(prisma|drizzle|mongoose)\s+model/i,
		]);

		patterns.set("generate_feature", [
			/create?\s+(a\s+)?(new\s+)?feature/i,
			/generate?\s+(a\s+)?(complete\s+)?feature/i,
			/(crud|auth|dashboard|ecommerce|blog)\s+feature/i,
			/full\s+feature/i,
		]);

		patterns.set("optimize_code", [
			/optimize/i,
			/improve\s+performance/i,
			/make\s+.*faster/i,
			/refactor/i,
		]);

		patterns.set("check_compliance", [
			/check\s+compliance/i,
			/validate\s+.*compliance/i,
			/(gdpr|nsm|wcag)\s+check/i,
			/accessibility\s+check/i,
		]);

		patterns.set("debug_error", [
			/debug/i,
			/fix\s+error/i,
			/resolve\s+issue/i,
			/troubleshoot/i,
		]);

		patterns.set("help", [
			/help/i,
			/how\s+to/i,
			/what\s+can\s+you\s+do/i,
			/commands/i,
		]);

		return patterns;
	}

	/**
	 * Initialize entity extraction patterns
	 */
	private initializeEntityPatterns(): Map<string, RegExp> {
		const patterns = new Map<string, RegExp>();

		patterns.set("component_name", /(?:component|comp)\s+(?:called|named)\s+([A-Za-z][A-Za-z0-9]*)/i);
		patterns.set("page_name", /(?:page|route)\s+(?:called|named|for)\s+([A-Za-z][A-Za-z0-9]*)/i);
		patterns.set("service_name", /(?:service|api)\s+(?:called|named|for)\s+([A-Za-z][A-Za-z0-9]*)/i);
		patterns.set("framework", /(react|next|nuxt|svelte|solid)/i);
		patterns.set("ui_system", /(tailwind|xala|default)/i);
		patterns.set("compliance_level", /(gdpr|nsm|wcag|none)/i);

		return patterns;
	}

	/**
	 * Process input using AI (placeholder)
	 */
	private async processWithAI(
		input: string, 
		context: ConversationContext
	): Promise<NLPResult> {
		// This would use actual AI/NLP services in production
		consola.info("Processing with AI (simulated)");

		// Simulate AI processing
		await new Promise(resolve => setTimeout(resolve, 500));

		// Fall back to pattern matching for now
		return this.processWithPatterns(input, context);
	}

	/**
	 * Process input using pattern matching
	 */
	private processWithPatterns(
		input: string, 
		context: ConversationContext
	): NLPResult {
		const intent = this.recognizeIntent(input);
		const entities = this.extractEntities(input);
		const parameters = this.inferParameters(input, entities, context);
		const clarifications = this.identifyClarifications(intent, entities, parameters);
		const suggestedCommand = this.buildCommand(intent, parameters);
		const alternativeIntents = this.getAlternativeIntents(input, intent);

		return {
			intent,
			confidence: this.calculateConfidence(intent, entities),
			entities,
			parameters,
			clarifications,
			suggestedCommand,
			alternativeIntents,
		};
	}

	/**
	 * Recognize intent from input
	 */
	private recognizeIntent(input: string): Intent {
		for (const [intent, patterns] of this.intentPatterns.entries()) {
			for (const pattern of patterns) {
				if (pattern.test(input)) {
					return intent;
				}
			}
		}
		return "unknown";
	}

	/**
	 * Extract entities from input
	 */
	private extractEntities(input: string): ExtractedEntity[] {
		const entities: ExtractedEntity[] = [];

		for (const [entityType, pattern] of this.entityPatterns.entries()) {
			const match = input.match(pattern);
			if (match) {
				entities.push({
					type: entityType as any,
					value: match[1],
					confidence: 0.8,
					position: [match.index || 0, (match.index || 0) + match[0].length],
				});
			}
		}

		return entities;
	}

	/**
	 * Infer command parameters
	 */
	private inferParameters(
		input: string,
		entities: ExtractedEntity[],
		context: ConversationContext
	): InferredParameters {
		const parameters: InferredParameters = {};

		// Extract name from entities
		const nameEntity = entities.find(e => 
			e.type === "component_name" || 
			e.type === "page_name" || 
			e.type === "service_name" ||
			e.type === "hook_name"
		);
		if (nameEntity) {
			parameters.name = nameEntity.value;
		}

		// Extract other parameters
		entities.forEach(entity => {
			switch (entity.type) {
				case "framework":
					parameters.framework = entity.value.toLowerCase();
					break;
				case "ui_system":
					parameters.ui = entity.value.toLowerCase();
					break;
				case "compliance_level":
					parameters.compliance = entity.value.toLowerCase();
					break;
			}
		});

		// Infer boolean flags
		parameters.authentication = /auth|login|security/.test(input.toLowerCase());
		parameters.testing = /test|spec/.test(input.toLowerCase());
		parameters.documentation = /doc|documentation/.test(input.toLowerCase());
		parameters.force = /force|overwrite|replace/.test(input.toLowerCase());

		// Use context preferences as defaults
		const prefs = context.userPreferences;
		if (!parameters.framework && prefs.preferredFramework) {
			parameters.framework = prefs.preferredFramework;
		}
		if (!parameters.ui && prefs.preferredUI) {
			parameters.ui = prefs.preferredUI;
		}
		if (!parameters.compliance && prefs.preferredCompliance) {
			parameters.compliance = prefs.preferredCompliance;
		}

		return parameters;
	}

	/**
	 * Identify needed clarifications
	 */
	private identifyClarifications(
		intent: Intent,
		entities: ExtractedEntity[],
		parameters: InferredParameters
	): string[] {
		const clarifications: string[] = [];

		if (intent !== "unknown" && intent !== "help") {
			if (!parameters.name) {
				clarifications.push(`What would you like to name the ${intent.replace("generate_", "")}?`);
			}

			if (intent === "generate_service" && !parameters.type) {
				clarifications.push("What type of service: API, business logic, or integration?");
			}

			if (intent === "generate_feature" && !parameters.type) {
				clarifications.push("What type of feature: CRUD, auth, dashboard, ecommerce, or blog?");
			}
		}

		return clarifications;
	}

	/**
	 * Build CLI command from intent and parameters
	 */
	private buildCommand(intent: Intent, parameters: InferredParameters): string {
		if (intent === "unknown" || intent === "help") {
			return "xaheen --help";
		}

		const command = [`xaheen generate ${intent.replace("generate_", "")}`];

		if (parameters.name) {
			command.push(parameters.name);
		}

		if (parameters.type) {
			command.push(`--type ${parameters.type}`);
		}

		if (parameters.framework) {
			command.push(`--framework ${parameters.framework}`);
		}

		if (parameters.ui) {
			command.push(`--ui ${parameters.ui}`);
		}

		if (parameters.compliance) {
			command.push(`--compliance ${parameters.compliance}`);
		}

		if (parameters.authentication) {
			command.push("--auth");
		}

		if (parameters.testing) {
			command.push("--testing");
		}

		if (parameters.documentation) {
			command.push("--docs");
		}

		if (parameters.force) {
			command.push("--force");
		}

		return command.join(" ");
	}

	/**
	 * Get alternative intents for ambiguous input
	 */
	private getAlternativeIntents(input: string, primaryIntent: Intent): Intent[] {
		const alternatives: Intent[] = [];

		if (primaryIntent === "unknown") {
			// Check which intents had partial matches
			for (const [intent, patterns] of this.intentPatterns.entries()) {
				const score = this.calculateIntentScore(input, patterns);
				if (score > 0.3 && score < 0.7) {
					alternatives.push(intent);
				}
			}
		}

		return alternatives.slice(0, 3); // Top 3 alternatives
	}

	/**
	 * Calculate confidence score
	 */
	private calculateConfidence(intent: Intent, entities: ExtractedEntity[]): number {
		if (intent === "unknown") return 0.1;

		let confidence = 0.6; // Base confidence for recognized intent

		// Boost confidence based on entities found
		confidence += entities.length * 0.1;

		// Boost confidence for high-confidence entities
		const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
		if (avgEntityConfidence > 0.8) {
			confidence += 0.2;
		}

		return Math.min(confidence, 1.0);
	}

	/**
	 * Calculate intent score for pattern matching
	 */
	private calculateIntentScore(input: string, patterns: RegExp[]): number {
		let maxScore = 0;

		for (const pattern of patterns) {
			const match = input.match(pattern);
			if (match) {
				const score = match[0].length / input.length;
				maxScore = Math.max(maxScore, score);
			}
		}

		return maxScore;
	}

	/**
	 * Get or create conversation context
	 */
	private getOrCreateContext(sessionId: string): ConversationContext {
		if (!this.conversations.has(sessionId)) {
			this.conversations.set(sessionId, {
				sessionId,
				history: [],
				pendingClarifications: [],
				userPreferences: {
					commonPatterns: [],
					shortcuts: {},
				},
			});
		}

		return this.conversations.get(sessionId)!;
	}

	/**
	 * Update conversation history
	 */
	private updateConversationHistory(
		context: ConversationContext,
		input: string,
		result: NLPResult
	): void {
		context.history.push({
			timestamp: new Date().toISOString(),
			userInput: input,
			intent: result.intent,
			response: result.suggestedCommand,
			success: result.confidence > 0.5,
		});

		// Keep only last 50 interactions
		if (context.history.length > 50) {
			context.history = context.history.slice(-50);
		}
	}

	/**
	 * Handle clarification response
	 */
	private handleClarificationResponse(
		input: string,
		context: ConversationContext
	): string {
		// Process the clarification response
		const clarification = context.pendingClarifications.shift();
		
		// This would be more sophisticated in a real implementation
		return `Thank you for clarifying. Processing: ${input}`;
	}

	/**
	 * Get contextual suggestions based on last intent
	 */
	private getContextualSuggestions(lastIntent: Intent, partialInput: string): string[] {
		const suggestions: string[] = [];

		switch (lastIntent) {
			case "generate_component":
				suggestions.push("create another component", "generate a page for this component");
				break;
			case "generate_page":
				suggestions.push("create components for this page", "add authentication to the page");
				break;
			case "generate_service":
				suggestions.push("create tests for the service", "generate API documentation");
				break;
		}

		return suggestions;
	}

	/**
	 * Extract preferences from successful command
	 */
	private async extractPreferences(
		command: string,
		context: ConversationContext
	): Promise<void> {
		if (command.includes("--framework")) {
			const match = command.match(/--framework\s+(\w+)/);
			if (match) {
				context.userPreferences.preferredFramework = match[1];
			}
		}

		if (command.includes("--ui")) {
			const match = command.match(/--ui\s+(\w+)/);
			if (match) {
				context.userPreferences.preferredUI = match[1];
			}
		}

		if (command.includes("--compliance")) {
			const match = command.match(/--compliance\s+(\w+)/);
			if (match) {
				context.userPreferences.preferredCompliance = match[1];
			}
		}
	}

	/**
	 * Generate shortcut for frequent pattern
	 */
	private generateShortcut(input: string): string {
		// Simple shortcut generation - take first letters of words
		return input
			.split(" ")
			.map(word => word.charAt(0))
			.join("")
			.toLowerCase();
	}
}

/**
 * Create NLP processor instance
 */
export function createNLPProcessor(aiProvider: AIProvider = "disabled"): NLPProcessor {
	return new NLPProcessor(aiProvider);
}