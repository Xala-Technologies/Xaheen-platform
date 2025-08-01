// AI Service Interfaces for Xala Scaffolding System
// Extends existing architecture with RAG and Local LLM capabilities
// Follows SOLID principles and Norwegian compliance requirements

import { IBaseService } from "../architecture/interfaces.js";
import { LocaleCode } from "../localization/types.js";
import { NorwegianCompliance } from "../types/compliance.js";

// === Core AI Service Interfaces ===

/**
 * Local LLM service interface - manages local language model interaction
 * Single Responsibility: Handle all LLM communication and model management
 */
export interface ILLMService extends IBaseService {
	// Model management
	listAvailableModels(): Promise<ILLMModel[]>;
	loadModel(modelName: string, options?: IModelLoadOptions): Promise<void>;
	unloadModel(modelName: string): Promise<void>;
	getCurrentModel(): ILLMModel | null;

	// Text generation
	generateText(
		prompt: string,
		options?: IGenerationOptions,
	): Promise<ILLMResponse>;
	generateCode(
		prompt: string,
		context?: ICodeContext,
		options?: ICodeGenerationOptions,
	): Promise<ICodeGenerationResponse>;

	// Chat functionality
	chat(
		messages: IChatMessage[],
		options?: IChatOptions,
	): Promise<IChatResponse>;

	// Health and monitoring
	getModelStats(): Promise<IModelStats>;
	isModelLoaded(modelName: string): Promise<boolean>;
}

/**
 * RAG (Retrieval-Augmented Generation) service interface
 * Single Responsibility: Handle retrieval and context augmentation for generation
 */
export interface IRAGService extends IBaseService {
	// Vector operations
	addToVectorStore(
		documents: IDocument[],
		options?: IVectorStoreOptions,
	): Promise<void>;
	searchSimilar(
		query: string,
		limit?: number,
		filters?: ISearchFilters,
	): Promise<ISearchResult[]>;

	// Context retrieval
	retrieveContext(
		query: string,
		projectContext?: IProjectContext,
	): Promise<IRetrievedContext>;
	retrieveCodePatterns(
		requirements: ICodeRequirements,
	): Promise<ICodePattern[]>;

	// Knowledge base operations
	updateKnowledgeBase(patterns: ICodePattern[]): Promise<void>;
	rebuildIndex(): Promise<void>;
	getIndexStats(): Promise<IIndexStats>;
}

/**
 * Knowledge base service interface
 * Single Responsibility: Manage code patterns, examples, and compliance rules
 */
export interface IKnowledgeBaseService extends IBaseService {
	// Pattern management
	addPattern(pattern: ICodePattern): Promise<void>;
	getPattern(id: string): Promise<ICodePattern | null>;
	searchPatterns(criteria: IPatternSearchCriteria): Promise<ICodePattern[]>;
	removePattern(id: string): Promise<void>;

	// Compliance rules
	addComplianceRule(rule: IComplianceRule): Promise<void>;
	getComplianceRules(classification?: string): Promise<IComplianceRule[]>;
	validateCompliance(
		code: string,
		rules: IComplianceRule[],
	): Promise<IComplianceValidationResult>;

	// Examples and templates
	addExample(example: ICodeExample): Promise<void>;
	getExamples(category: string, locale?: LocaleCode): Promise<ICodeExample[]>;

	// Seeding and initialization
	seedFromDirectory(path: string): Promise<void>;
	exportKnowledgeBase(): Promise<string>;
	importKnowledgeBase(data: string): Promise<void>;
}

/**
 * Context manager service interface
 * Single Responsibility: Track and manage project context and user preferences
 */
export interface IContextManagerService extends IBaseService {
	// Project context
	analyzeProject(projectPath: string): Promise<IProjectContext>;
	updateProjectContext(context: Partial<IProjectContext>): Promise<void>;
	getProjectContext(): IProjectContext | null;

	// User preferences
	getUserPreferences(): IUserPreferences;
	updateUserPreferences(preferences: Partial<IUserPreferences>): Promise<void>;

	// Generation history
	addGenerationHistory(entry: IGenerationHistoryEntry): Promise<void>;
	getGenerationHistory(limit?: number): Promise<IGenerationHistoryEntry[]>;

	// Learning and adaptation
	recordUserFeedback(
		generationId: string,
		feedback: IUserFeedback,
	): Promise<void>;
	getAdaptationInsights(): Promise<IAdaptationInsights>;
}

/**
 * AI-enhanced code generator service interface
 * Single Responsibility: Generate code using AI with existing generator integration
 */
export interface IAICodeGeneratorService extends IBaseService {
	// AI-enhanced generation
	generateComponentWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult>;
	generatePageWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult>;
	generateAPIWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult>;

	// Analysis and improvement
	analyzeCode(code: string, filePath: string): Promise<ICodeAnalysisResult>;
	suggestImprovements(
		code: string,
		context: IProjectContext,
	): Promise<IImprovementSuggestion[]>;

	// Interactive assistance
	chatAssistant(
		message: string,
		context?: IConversationContext,
	): Promise<IAssistantResponse>;

	// Validation and refinement
	validateAndRefineCode(
		code: string,
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeRefinementResult>;
}

// === Core Data Interfaces ===

/**
 * LLM model information
 */
export interface ILLMModel {
	name: string;
	displayName: string;
	description: string;
	size: number;
	type: "code" | "chat" | "instruct";
	languages: string[];
	capabilities: IModelCapabilities;
	isLoaded: boolean;
	loadedAt?: Date;
}

/**
 * Model capabilities
 */
export interface IModelCapabilities {
	codeGeneration: boolean;
	multiLanguage: boolean;
	norwegianSupport: boolean;
	maxContextLength: number;
	supportsFunction: boolean;
	supportsTools: boolean;
}

/**
 * Model loading options
 */
export interface IModelLoadOptions {
	gpuLayers?: number;
	contextSize?: number;
	batchSize?: number;
	threads?: number;
	temperature?: number;
	customOptions?: Record<string, any>;
}

/**
 * Text generation options
 */
export interface IGenerationOptions {
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	topK?: number;
	repeatPenalty?: number;
	stopSequences?: string[];
	streaming?: boolean;
}

/**
 * Code generation specific options
 */
export interface ICodeGenerationOptions extends IGenerationOptions {
	language: "typescript" | "javascript" | "jsx" | "tsx";
	framework?: string;
	compliance?: NorwegianCompliance;
	locale?: LocaleCode;
	includeTests?: boolean;
	includeDocumentation?: boolean;
}

/**
 * Code context for generation
 */
export interface ICodeContext {
	projectType: string;
	framework: string;
	dependencies: string[];
	existingFiles: Map<string, string>;
	codeStyle: ICodeStylePreferences;
	compliance: NorwegianCompliance;
	locale: LocaleCode;
}

/**
 * LLM response
 */
export interface ILLMResponse {
	text: string;
	finishReason: "stop" | "length" | "error";
	usage: ITokenUsage;
	metadata: Record<string, any>;
	generatedAt: Date;
}

/**
 * Code generation response
 */
export interface ICodeGenerationResponse extends ILLMResponse {
	code: string;
	language: string;
	explanation?: string;
	suggestions?: string[];
	complianceScore: number;
	qualityMetrics: ICodeQualityMetrics;
}

/**
 * Chat message
 */
export interface IChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
	timestamp?: Date;
	metadata?: Record<string, any>;
}

/**
 * Chat options
 */
export interface IChatOptions extends IGenerationOptions {
	systemPrompt?: string;
	context?: IConversationContext;
	tools?: ITool[];
}

/**
 * Chat response
 */
export interface IChatResponse {
	message: IChatMessage;
	usage: ITokenUsage;
	toolCalls?: IToolCall[];
	finishReason: "stop" | "length" | "tool_calls" | "error";
}

/**
 * Model statistics
 */
export interface IModelStats {
	modelName: string;
	isLoaded: boolean;
	memoryUsage: number;
	totalGenerations: number;
	averageResponseTime: number;
	uptime: number;
	lastUsed: Date;
	errorCount: number;
}

// === RAG System Interfaces ===

/**
 * Document for vector storage
 */
export interface IDocument {
	id: string;
	content: string;
	metadata: IDocumentMetadata;
	embedding?: number[];
}

/**
 * Document metadata
 */
export interface IDocumentMetadata {
	type: "code" | "documentation" | "example" | "pattern";
	language?: string;
	framework?: string;
	category: string;
	tags: string[];
	source: string;
	compliance?: NorwegianCompliance;
	locale?: LocaleCode;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Vector store options
 */
export interface IVectorStoreOptions {
	batchSize?: number;
	generateEmbeddings?: boolean;
	updateExisting?: boolean;
	metadata?: Record<string, any>;
}

/**
 * Search filters
 */
export interface ISearchFilters {
	type?: string[];
	language?: string[];
	framework?: string[];
	category?: string[];
	tags?: string[];
	compliance?: string[];
	locale?: LocaleCode[];
	dateRange?: {
		from: Date;
		to: Date;
	};
}

/**
 * Search result
 */
export interface ISearchResult {
	document: IDocument;
	score: number;
	relevanceExplanation?: string;
}

/**
 * Retrieved context for generation
 */
export interface IRetrievedContext {
	documents: ISearchResult[];
	summary: string;
	relevanceScore: number;
	complianceRules: IComplianceRule[];
	suggestions: string[];
}

/**
 * Code requirements for retrieval
 */
export interface ICodeRequirements {
	type: "component" | "page" | "layout" | "api" | "test";
	description: string;
	language: string;
	framework?: string;
	features?: string[];
	compliance?: NorwegianCompliance;
	locale?: LocaleCode;
}

/**
 * Code pattern
 */
export interface ICodePattern {
	id: string;
	name: string;
	description: string;
	category: string;
	tags: string[];
	code: string;
	language: string;
	framework?: string;
	usage: string;
	examples: ICodeExample[];
	compliance: NorwegianCompliance;
	qualityScore: number;
	usageCount: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Index statistics
 */
export interface IIndexStats {
	totalDocuments: number;
	totalPatterns: number;
	totalExamples: number;
	embeddingDimensions: number;
	indexSize: number;
	lastUpdated: Date;
	healthScore: number;
}

// === Knowledge Base Interfaces ===

/**
 * Pattern search criteria
 */
export interface IPatternSearchCriteria {
	query?: string;
	category?: string;
	tags?: string[];
	language?: string;
	framework?: string;
	compliance?: string;
	minQualityScore?: number;
	sortBy?: "relevance" | "quality" | "usage" | "date";
	limit?: number;
	offset?: number;
}

/**
 * Compliance rule
 */
export interface IComplianceRule {
	id: string;
	name: string;
	description: string;
	category: "nsm" | "gdpr" | "wcag" | "security" | "performance";
	severity: "error" | "warning" | "info";
	pattern: string | RegExp;
	replacement?: string;
	explanation: string;
	examples: {
		good: string[];
		bad: string[];
	};
	applicableLanguages: string[];
	locale: LocaleCode;
	isActive: boolean;
}

/**
 * Compliance validation result
 */
export interface IComplianceValidationResult {
	isValid: boolean;
	violations: IComplianceViolation[];
	suggestions: string[];
	score: number;
	appliedRules: string[];
}

/**
 * Compliance violation
 */
export interface IComplianceViolation {
	ruleId: string;
	ruleName: string;
	severity: "error" | "warning" | "info";
	message: string;
	line?: number;
	column?: number;
	suggestion?: string;
	autoFixable: boolean;
}

/**
 * Code example
 */
export interface ICodeExample {
	id: string;
	title: string;
	description: string;
	category: string;
	code: string;
	language: string;
	framework?: string;
	features: string[];
	compliance: NorwegianCompliance;
	locale: LocaleCode;
	difficulty: "beginner" | "intermediate" | "advanced";
	tags: string[];
	source: string;
	createdAt: Date;
}

// === Context Management Interfaces ===

/**
 * Project context
 */
export interface IProjectContext {
	projectPath: string;
	projectName: string;
	projectType: "nextjs" | "react" | "nestjs" | "library";
	framework: string;
	version: string;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	structure: IProjectStructure;
	codeStyle: ICodeStylePreferences;
	compliance: NorwegianCompliance;
	locale: LocaleCode;
	generationPreferences: IGenerationPreferences;
	analyzedAt: Date;
	metrics: IProjectMetrics;
}

/**
 * Project structure
 */
export interface IProjectStructure {
	srcDirectory: string;
	componentsDirectory?: string;
	pagesDirectory?: string;
	apiDirectory?: string;
	testDirectory?: string;
	configFiles: string[];
	importantFiles: string[];
	totalFiles: number;
	codeFiles: number;
}

/**
 * Code style preferences
 */
export interface ICodeStylePreferences {
	indentation: "spaces" | "tabs";
	indentSize: number;
	quotes: "single" | "double";
	semicolons: boolean;
	trailingComma: boolean;
	bracketSpacing: boolean;
	arrowParens: "always" | "avoid";
	endOfLine: "lf" | "crlf";
	printWidth: number;
}

/**
 * Generation preferences
 */
export interface IGenerationPreferences {
	preferredVariant: "functional" | "class";
	includeTests: boolean;
	includeStories: boolean;
	includeDocumentation: boolean;
	accessibilityLevel: "A" | "AA" | "AAA";
	complianceLevel: "basic" | "standard" | "strict";
	templatePreference: "minimal" | "standard" | "comprehensive";
}

/**
 * User preferences
 */
export interface IUserPreferences {
	defaultLocale: LocaleCode;
	preferredModels: string[];
	generationStyle: "conservative" | "balanced" | "creative";
	verbosity: "minimal" | "standard" | "detailed";
	autoValidation: boolean;
	autoTesting: boolean;
	learningEnabled: boolean;
	complianceStrictness: "lenient" | "standard" | "strict";
}

/**
 * Generation history entry
 */
export interface IGenerationHistoryEntry {
	id: string;
	timestamp: Date;
	type: "component" | "page" | "api" | "test" | "improvement";
	requirements: string;
	generatedCode: string;
	model: string;
	context: Partial<IProjectContext>;
	userFeedback?: IUserFeedback;
	qualityScore: number;
	complianceScore: number;
	success: boolean;
}

/**
 * User feedback
 */
export interface IUserFeedback {
	rating: 1 | 2 | 3 | 4 | 5;
	helpful: boolean;
	accurate: boolean;
	compliant: boolean;
	comments?: string;
	modifications?: string;
	timestamp: Date;
}

/**
 * Adaptation insights
 */
export interface IAdaptationInsights {
	commonPatterns: string[];
	preferredStyles: ICodeStylePreferences;
	successfulPrompts: string[];
	problematicAreas: string[];
	improvementAreas: string[];
	modelPerformance: Record<string, IModelPerformanceInsight>;
}

/**
 * Model performance insight
 */
export interface IModelPerformanceInsight {
	model: string;
	averageRating: number;
	successRate: number;
	averageComplianceScore: number;
	commonIssues: string[];
	recommendations: string[];
}

// === AI-Enhanced Generation Interfaces ===

/**
 * Natural language requirements
 */
export interface INaturalLanguageRequirements {
	description: string;
	type: "component" | "page" | "layout" | "api" | "test" | "improvement";
	features?: string[];
	constraints?: string[];
	examples?: string[];
	compliance?: NorwegianCompliance;
	locale?: LocaleCode;
	outputFormat?: "typescript" | "javascript";
	includeTests?: boolean;
	includeDocumentation?: boolean;
}

/**
 * Code generation result
 */
export interface ICodeGenerationResult {
	success: boolean;
	files: IGeneratedFile[];
	explanation: string;
	suggestions: string[];
	compliance: IComplianceValidationResult;
	quality: ICodeQualityMetrics;
	usage: ITokenUsage;
	generationId: string;
	model: string;
	timestamp: Date;
}

/**
 * Generated file
 */
export interface IGeneratedFile {
	path: string;
	content: string;
	type: "component" | "test" | "story" | "documentation" | "config";
	language: "typescript" | "javascript" | "css" | "markdown";
	size: number;
	description: string;
}

/**
 * Code analysis result
 */
export interface ICodeAnalysisResult {
	file: string;
	quality: ICodeQualityMetrics;
	compliance: IComplianceValidationResult;
	patterns: IIdentifiedPattern[];
	issues: ICodeIssue[];
	suggestions: IImprovementSuggestion[];
	complexity: IComplexityMetrics;
	dependencies: string[];
	exports: string[];
}

/**
 * Code quality metrics
 */
export interface ICodeQualityMetrics {
	maintainabilityIndex: number;
	cyclomaticComplexity: number;
	linesOfCode: number;
	testCoverage?: number;
	duplicateCode: number;
	technicalDebt: number;
	codeSmells: string[];
	overallScore: number;
}

/**
 * Identified pattern
 */
export interface IIdentifiedPattern {
	name: string;
	type: "design-pattern" | "anti-pattern" | "best-practice";
	confidence: number;
	location: ICodeLocation;
	description: string;
}

/**
 * Code issue
 */
export interface ICodeIssue {
	type: "error" | "warning" | "info" | "style";
	message: string;
	location: ICodeLocation;
	rule?: string;
	fixable: boolean;
	suggestion?: string;
}

/**
 * Code location
 */
export interface ICodeLocation {
	line: number;
	column: number;
	endLine?: number;
	endColumn?: number;
}

/**
 * Improvement suggestion
 */
export interface IImprovementSuggestion {
	id: string;
	title: string;
	description: string;
	category:
		| "performance"
		| "maintainability"
		| "compliance"
		| "accessibility"
		| "security";
	priority: "low" | "medium" | "high" | "critical";
	effort: "low" | "medium" | "high";
	impact: "low" | "medium" | "high";
	code?: string;
	explanation: string;
	examples?: string[];
}

/**
 * Complexity metrics
 */
export interface IComplexityMetrics {
	cyclomaticComplexity: number;
	cognitiveComplexity: number;
	nestingDepth: number;
	parameterCount: number;
	returnStatements: number;
	branches: number;
}

/**
 * Assistant response
 */
export interface IAssistantResponse {
	message: string;
	suggestions?: string[];
	code?: string;
	explanation?: string;
	followUp?: string[];
	confidence: number;
	sources?: string[];
}

/**
 * Conversation context
 */
export interface IConversationContext {
	conversationId: string;
	history: IChatMessage[];
	projectContext?: IProjectContext;
	currentFile?: string;
	selectedCode?: string;
	intent?: "generation" | "explanation" | "debugging" | "improvement";
}

/**
 * Code refinement result
 */
export interface ICodeRefinementResult {
	originalCode: string;
	refinedCode: string;
	changes: ICodeChange[];
	improvements: string[];
	complianceImprovements: string[];
	qualityImprovementScore: number;
	explanation: string;
}

/**
 * Code change
 */
export interface ICodeChange {
	type: "addition" | "deletion" | "modification";
	location: ICodeLocation;
	originalContent?: string;
	newContent: string;
	reason: string;
}

// === Utility Interfaces ===

/**
 * Token usage statistics
 */
export interface ITokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	estimatedCost?: number;
}

/**
 * Tool definition for function calling
 */
export interface ITool {
	name: string;
	description: string;
	parameters: Record<string, any>;
	handler: (args: Record<string, any>) => Promise<any>;
}

/**
 * Tool call result
 */
export interface IToolCall {
	id: string;
	tool: string;
	arguments: Record<string, any>;
	result?: any;
	error?: string;
}

/**
 * Project metrics
 */
export interface IProjectMetrics {
	totalLines: number;
	codeLines: number;
	commentLines: number;
	testLines: number;
	testCoverage?: number;
	complexity: number;
	maintainabilityIndex: number;
	technicalDebt: number;
	lastAnalyzed: Date;
}

// === Factory Interfaces for SOLID Architecture ===

/**
 * AI service factory interface - creates AI service instances
 */
export interface IAIServiceFactory {
	createLLMService(): ILLMService;
	createRAGService(): IRAGService;
	createKnowledgeBaseService(): IKnowledgeBaseService;
	createContextManagerService(): IContextManagerService;
	createAICodeGeneratorService(): IAICodeGeneratorService;
}

// === Re-exports for convenience ===
export {
	type LocaleCode,
	type NorwegianCompliance,
} from "../types/compliance.js";
