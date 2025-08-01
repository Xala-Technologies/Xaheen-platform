/**
 * Learning System
 *
 * Machine learning system that improves from user feedback and interactions.
 * Tracks patterns, preferences, and outcomes to enhance AI performance over time.
 *
 * Features:
 * - User feedback collection and analysis
 * - Pattern recognition and adaptation
 * - Performance metrics tracking
 * - Preference learning
 * - Model fine-tuning suggestions
 * - Knowledge base evolution
 * - A/B testing support
 * - Continuous improvement loop
 */

import { EventEmitter } from "events";
import {
	IConfigurationService,
	IFileSystemService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { ChromaDBStore } from "../../rag/vector-store/ChromaDBStore.js";
import { LocaleCode, NorwegianCompliance } from "../../types/compliance.js";
import { AIServiceFactory } from "../services/AIServiceFactory.js";

/**
 * User feedback types
 */
export interface IUserFeedback {
	id: string;
	timestamp: Date;
	sessionId: string;
	userId?: string;
	type: "rating" | "correction" | "preference" | "report" | "implicit";
	category:
		| "code-quality"
		| "compliance"
		| "performance"
		| "usability"
		| "accuracy";
	context: {
		action: string;
		input: any;
		output: any;
		metadata?: Record<string, any>;
	};
	feedback: {
		rating?: number; // 1-5
		correction?: string;
		preference?: string;
		report?: string;
		implicit?: {
			accepted: boolean;
			modified: boolean;
			timeSpent: number;
			interactions: number;
		};
	};
	impact: "positive" | "negative" | "neutral";
}

/**
 * Learning pattern
 */
export interface ILearningPattern {
	id: string;
	pattern: string;
	category: string;
	frequency: number;
	successRate: number;
	userPreference: number; // 0-1
	contexts: Array<{
		locale: LocaleCode;
		framework: string;
		compliance: string;
		count: number;
	}>;
	examples: Array<{
		input: string;
		output: string;
		feedback: IUserFeedback;
	}>;
	lastUpdated: Date;
}

/**
 * Performance metrics
 */
export interface IPerformanceMetrics {
	totalInteractions: number;
	successfulInteractions: number;
	failedInteractions: number;
	averageRating: number;
	accuracyScore: number;
	complianceScore: number;
	performanceScore: number;
	userSatisfactionScore: number;
	improvementTrend: number; // -1 to 1
	topIssues: Array<{
		issue: string;
		frequency: number;
		impact: string;
	}>;
	topSuccesses: Array<{
		pattern: string;
		frequency: number;
		rating: number;
	}>;
}

/**
 * Model improvement suggestion
 */
export interface IModelImprovement {
	id: string;
	type:
		| "fine-tuning"
		| "retraining"
		| "parameter-adjustment"
		| "knowledge-update";
	priority: "low" | "medium" | "high" | "critical";
	description: string;
	rationale: string;
	expectedImpact: {
		metric: string;
		currentValue: number;
		expectedValue: number;
		confidence: number;
	};
	implementation: {
		steps: string[];
		effort: "low" | "medium" | "high";
		risk: "low" | "medium" | "high";
	};
	data: {
		feedbackCount: number;
		patterns: string[];
		examples: any[];
	};
}

/**
 * A/B test configuration
 */
export interface IABTest {
	id: string;
	name: string;
	description: string;
	startDate: Date;
	endDate?: Date;
	status: "active" | "completed" | "cancelled";
	variants: Array<{
		id: string;
		name: string;
		configuration: Record<string, any>;
		traffic: number; // percentage
	}>;
	metrics: string[];
	results?: {
		winner?: string;
		confidence: number;
		improvements: Record<string, number>;
	};
}

/**
 * Learning configuration
 */
export interface ILearningConfig {
	enableLearning: boolean;
	feedbackThreshold: number; // Min feedback for pattern recognition
	learningRate: number; // 0-1
	adaptationSpeed: "slow" | "medium" | "fast";
	privacyMode: "strict" | "balanced" | "minimal";
	retentionPeriod: number; // days
	autoImprove: boolean;
	abTestingEnabled: boolean;
}

/**
 * Learning System Service
 */
export class LearningSystem extends EventEmitter {
	private config: ILearningConfig;
	private vectorStore?: ChromaDBStore;
	private aiServiceFactory?: AIServiceFactory;
	private patterns = new Map<string, ILearningPattern>();
	private feedbackHistory: IUserFeedback[] = [];
	private activeTests = new Map<string, IABTest>();
	private initialized = false;

	constructor(
		private readonly logger: ILoggingService,
		private readonly configService: IConfigurationService,
		private readonly fileSystem: IFileSystemService,
	) {
		super();

		// Load configuration
		this.config = this.loadConfig();
	}

	/**
	 * Initialize the learning system
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		try {
			this.logger.info("Initializing Learning System");

			// Initialize vector store for pattern storage
			this.vectorStore = new ChromaDBStore(this.logger, this.configService);
			await this.vectorStore.initialize();

			// Initialize AI services
			this.aiServiceFactory = new AIServiceFactory(
				this.logger,
				this.configService,
				this.fileSystem,
			);
			await this.aiServiceFactory.initializeServices();

			// Load existing patterns and feedback
			await this.loadLearningData();

			// Start periodic analysis
			if (this.config.autoImprove) {
				this.startPeriodicAnalysis();
			}

			this.initialized = true;
			this.emit("initialized");
		} catch (error) {
			this.logger.error("Failed to initialize Learning System", error as Error);
			throw error;
		}
	}

	/**
	 * Record user feedback
	 */
	async recordFeedback(feedback: IUserFeedback): Promise<void> {
		await this.ensureInitialized();

		try {
			this.logger.debug("Recording user feedback", {
				type: feedback.type,
				category: feedback.category,
			});

			// Apply privacy settings
			const sanitizedFeedback = this.sanitizeFeedback(feedback);

			// Store feedback
			this.feedbackHistory.push(sanitizedFeedback);

			// Update patterns
			await this.updatePatterns(sanitizedFeedback);

			// Check for immediate improvements
			if (this.config.autoImprove) {
				await this.checkImmediateImprovements(sanitizedFeedback);
			}

			// Update A/B tests if applicable
			await this.updateABTests(sanitizedFeedback);

			this.emit("feedbackRecorded", sanitizedFeedback);

			// Persist if threshold reached
			if (this.feedbackHistory.length % 10 === 0) {
				await this.persistLearningData();
			}
		} catch (error) {
			this.logger.error("Failed to record feedback", error as Error);
		}
	}

	/**
	 * Get performance metrics
	 */
	async getPerformanceMetrics(timeRange?: {
		start: Date;
		end: Date;
	}): Promise<IPerformanceMetrics> {
		await this.ensureInitialized();

		const relevantFeedback = timeRange
			? this.feedbackHistory.filter(
					(f) => f.timestamp >= timeRange.start && f.timestamp <= timeRange.end,
				)
			: this.feedbackHistory;

		const totalInteractions = relevantFeedback.length;
		const successfulInteractions = relevantFeedback.filter(
			(f) => f.impact === "positive",
		).length;
		const failedInteractions = relevantFeedback.filter(
			(f) => f.impact === "negative",
		).length;

		// Calculate average rating
		const ratings = relevantFeedback
			.filter((f) => f.type === "rating" && f.feedback.rating)
			.map((f) => f.feedback.rating!);
		const averageRating =
			ratings.length > 0
				? ratings.reduce((a, b) => a + b, 0) / ratings.length
				: 0;

		// Calculate scores
		const accuracyScore = this.calculateAccuracyScore(relevantFeedback);
		const complianceScore = this.calculateComplianceScore(relevantFeedback);
		const performanceScore = this.calculatePerformanceScore(relevantFeedback);
		const userSatisfactionScore =
			this.calculateSatisfactionScore(relevantFeedback);

		// Calculate improvement trend
		const improvementTrend = this.calculateImprovementTrend(relevantFeedback);

		// Identify top issues and successes
		const topIssues = this.identifyTopIssues(relevantFeedback);
		const topSuccesses = this.identifyTopSuccesses(relevantFeedback);

		return {
			totalInteractions,
			successfulInteractions,
			failedInteractions,
			averageRating,
			accuracyScore,
			complianceScore,
			performanceScore,
			userSatisfactionScore,
			improvementTrend,
			topIssues,
			topSuccesses,
		};
	}

	/**
	 * Get model improvement suggestions
	 */
	async getImprovementSuggestions(): Promise<IModelImprovement[]> {
		await this.ensureInitialized();

		const suggestions: IModelImprovement[] = [];

		// Analyze patterns for improvement opportunities
		for (const [patternId, pattern] of this.patterns) {
			if (
				pattern.successRate < 0.7 &&
				pattern.frequency > this.config.feedbackThreshold
			) {
				suggestions.push({
					id: `improve-${patternId}`,
					type: "fine-tuning",
					priority: pattern.frequency > 100 ? "high" : "medium",
					description: `Improve ${pattern.pattern} pattern recognition`,
					rationale: `Success rate is ${(pattern.successRate * 100).toFixed(1)}% with ${pattern.frequency} occurrences`,
					expectedImpact: {
						metric: "accuracy",
						currentValue: pattern.successRate,
						expectedValue: Math.min(0.9, pattern.successRate + 0.2),
						confidence: 0.75,
					},
					implementation: {
						steps: [
							"Collect additional training examples",
							"Fine-tune model on pattern-specific data",
							"Validate improvements with test set",
							"Deploy updated model",
						],
						effort: "medium",
						risk: "low",
					},
					data: {
						feedbackCount: pattern.frequency,
						patterns: [pattern.pattern],
						examples: pattern.examples.slice(0, 10),
					},
				});
			}
		}

		// Check for knowledge base updates
		const outdatedPatterns = await this.findOutdatedPatterns();
		if (outdatedPatterns.length > 0) {
			suggestions.push({
				id: "knowledge-update",
				type: "knowledge-update",
				priority: "high",
				description: "Update knowledge base with new patterns",
				rationale: `${outdatedPatterns.length} patterns need updating based on user feedback`,
				expectedImpact: {
					metric: "relevance",
					currentValue: 0.7,
					expectedValue: 0.9,
					confidence: 0.8,
				},
				implementation: {
					steps: [
						"Review user corrections and preferences",
						"Update pattern templates and examples",
						"Reindex knowledge base",
						"Test updated patterns",
					],
					effort: "low",
					risk: "low",
				},
				data: {
					feedbackCount: outdatedPatterns.reduce(
						(sum, p) => sum + p.frequency,
						0,
					),
					patterns: outdatedPatterns.map((p) => p.pattern),
					examples: [],
				},
			});
		}

		// Check for parameter adjustments
		const metrics = await this.getPerformanceMetrics();
		if (metrics.userSatisfactionScore < 0.8) {
			suggestions.push({
				id: "parameter-adjustment",
				type: "parameter-adjustment",
				priority: "medium",
				description:
					"Adjust generation parameters for better user satisfaction",
				rationale: `User satisfaction score is ${(metrics.userSatisfactionScore * 100).toFixed(1)}%`,
				expectedImpact: {
					metric: "satisfaction",
					currentValue: metrics.userSatisfactionScore,
					expectedValue: 0.85,
					confidence: 0.7,
				},
				implementation: {
					steps: [
						"Analyze user preferences from feedback",
						"Adjust temperature and top-p parameters",
						"Increase context window for better understanding",
						"A/B test new parameters",
					],
					effort: "low",
					risk: "low",
				},
				data: {
					feedbackCount: metrics.totalInteractions,
					patterns: [],
					examples: [],
				},
			});
		}

		return suggestions;
	}

	/**
	 * Learn from code generation outcome
	 */
	async learnFromGeneration(input: {
		request: any;
		generated: any;
		accepted: boolean;
		modified?: boolean;
		modifications?: string;
		timeSpent: number;
	}): Promise<void> {
		await this.ensureInitialized();

		const feedback: IUserFeedback = {
			id: this.generateId(),
			timestamp: new Date(),
			sessionId: input.request.sessionId || "unknown",
			type: "implicit",
			category: "code-quality",
			context: {
				action: "code-generation",
				input: input.request,
				output: input.generated,
			},
			feedback: {
				implicit: {
					accepted: input.accepted,
					modified: input.modified || false,
					timeSpent: input.timeSpent,
					interactions: 1,
				},
			},
			impact: input.accepted
				? "positive"
				: input.modified
					? "neutral"
					: "negative",
		};

		await this.recordFeedback(feedback);

		// If modified, learn from the modifications
		if (input.modified && input.modifications) {
			await this.learnFromModifications(
				input.generated,
				input.modifications,
				input.request,
			);
		}
	}

	/**
	 * Start A/B test
	 */
	async startABTest(test: Omit<IABTest, "id" | "status">): Promise<string> {
		await this.ensureInitialized();

		if (!this.config.abTestingEnabled) {
			throw new Error("A/B testing is not enabled");
		}

		const testId = this.generateId();
		const abTest: IABTest = {
			...test,
			id: testId,
			status: "active",
		};

		this.activeTests.set(testId, abTest);

		this.logger.info("Started A/B test", { testId, name: test.name });
		this.emit("abTestStarted", abTest);

		return testId;
	}

	/**
	 * Get A/B test variant
	 */
	getABTestVariant(testId: string, userId?: string): string | null {
		const test = this.activeTests.get(testId);
		if (!test || test.status !== "active") {
			return null;
		}

		// Simple random assignment (in production, use consistent hashing)
		const random = userId ? this.hashString(userId + testId) : Math.random();

		let accumulator = 0;
		for (const variant of test.variants) {
			accumulator += variant.traffic / 100;
			if (random < accumulator) {
				return variant.id;
			}
		}

		return test.variants[0].id;
	}

	/**
	 * Complete A/B test
	 */
	async completeABTest(testId: string): Promise<IABTest> {
		const test = this.activeTests.get(testId);
		if (!test) {
			throw new Error(`A/B test not found: ${testId}`);
		}

		// Analyze results
		const results = await this.analyzeABTestResults(test);

		test.status = "completed";
		test.endDate = new Date();
		test.results = results;

		this.logger.info("Completed A/B test", { testId, winner: results.winner });
		this.emit("abTestCompleted", test);

		return test;
	}

	/**
	 * Get learning insights
	 */
	async getLearningInsights(): Promise<{
		summary: string;
		trends: Array<{
			metric: string;
			trend: "improving" | "declining" | "stable";
		}>;
		recommendations: string[];
		patterns: Array<{ pattern: string; insight: string }>;
	}> {
		await this.ensureInitialized();

		const metrics = await this.getPerformanceMetrics();
		const improvements = await this.getImprovementSuggestions();

		// Analyze trends
		const trends = [
			{
				metric: "User Satisfaction",
				trend:
					metrics.improvementTrend > 0.1
						? ("improving" as const)
						: metrics.improvementTrend < -0.1
							? ("declining" as const)
							: ("stable" as const),
			},
			{
				metric: "Code Quality",
				trend:
					metrics.accuracyScore > 0.8
						? ("improving" as const)
						: ("stable" as const),
			},
			{
				metric: "Compliance",
				trend:
					metrics.complianceScore > 0.9
						? ("stable" as const)
						: ("declining" as const),
			},
		];

		// Generate recommendations
		const recommendations = improvements
			.filter((i) => i.priority === "high" || i.priority === "critical")
			.map((i) => i.description);

		// Extract pattern insights
		const patternInsights = Array.from(this.patterns.values())
			.filter((p) => p.frequency > 10)
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 5)
			.map((p) => ({
				pattern: p.pattern,
				insight: `Used ${p.frequency} times with ${(p.successRate * 100).toFixed(1)}% success rate`,
			}));

		const summary = `The system has processed ${metrics.totalInteractions} interactions with an average rating of ${metrics.averageRating.toFixed(1)}/5. ${trends.filter((t) => t.trend === "improving").length} metrics are improving.`;

		return {
			summary,
			trends,
			recommendations,
			patterns: patternInsights,
		};
	}

	// === Private Helper Methods ===

	/**
	 * Ensure system is initialized
	 */
	private async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
	}

	/**
	 * Load configuration
	 */
	private loadConfig(): ILearningConfig {
		const defaultConfig: ILearningConfig = {
			enableLearning: true,
			feedbackThreshold: 5,
			learningRate: 0.1,
			adaptationSpeed: "medium",
			privacyMode: "balanced",
			retentionPeriod: 90,
			autoImprove: true,
			abTestingEnabled: false,
		};

		try {
			const userConfig = this.configService.get("learning", {});
			return { ...defaultConfig, ...userConfig };
		} catch {
			return defaultConfig;
		}
	}

	/**
	 * Load existing learning data
	 */
	private async loadLearningData(): Promise<void> {
		try {
			const dataPath = "./data/learning";

			// Load patterns
			const patternsFile = `${dataPath}/patterns.json`;
			if (await this.fileSystem.exists(patternsFile)) {
				const patternsData = JSON.parse(
					await this.fileSystem.readFile(patternsFile),
				);
				for (const pattern of patternsData) {
					this.patterns.set(pattern.id, {
						...pattern,
						lastUpdated: new Date(pattern.lastUpdated),
					});
				}
			}

			// Load recent feedback
			const feedbackFile = `${dataPath}/feedback.json`;
			if (await this.fileSystem.exists(feedbackFile)) {
				const feedbackData = JSON.parse(
					await this.fileSystem.readFile(feedbackFile),
				);
				this.feedbackHistory = feedbackData.map((f: any) => ({
					...f,
					timestamp: new Date(f.timestamp),
				}));

				// Apply retention policy
				const cutoffDate = new Date();
				cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);
				this.feedbackHistory = this.feedbackHistory.filter(
					(f) => f.timestamp > cutoffDate,
				);
			}

			this.logger.info("Loaded learning data", {
				patterns: this.patterns.size,
				feedback: this.feedbackHistory.length,
			});
		} catch (error) {
			this.logger.warn("Failed to load learning data", error as Error);
		}
	}

	/**
	 * Persist learning data
	 */
	private async persistLearningData(): Promise<void> {
		try {
			const dataPath = "./data/learning";
			await this.fileSystem.createDirectory(dataPath);

			// Save patterns
			const patterns = Array.from(this.patterns.values());
			await this.fileSystem.writeFile(
				`${dataPath}/patterns.json`,
				JSON.stringify(patterns, null, 2),
			);

			// Save recent feedback (apply retention policy)
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);
			const recentFeedback = this.feedbackHistory.filter(
				(f) => f.timestamp > cutoffDate,
			);

			await this.fileSystem.writeFile(
				`${dataPath}/feedback.json`,
				JSON.stringify(recentFeedback, null, 2),
			);

			this.logger.debug("Persisted learning data");
		} catch (error) {
			this.logger.error("Failed to persist learning data", error as Error);
		}
	}

	/**
	 * Sanitize feedback based on privacy settings
	 */
	private sanitizeFeedback(feedback: IUserFeedback): IUserFeedback {
		if (this.config.privacyMode === "strict") {
			// Remove all identifying information
			return {
				...feedback,
				userId: undefined,
				context: {
					...feedback.context,
					input: this.anonymizeData(feedback.context.input),
					output: this.anonymizeData(feedback.context.output),
				},
			};
		} else if (this.config.privacyMode === "balanced") {
			// Hash user IDs
			return {
				...feedback,
				userId: feedback.userId ? this.hashString(feedback.userId) : undefined,
			};
		}

		return feedback;
	}

	/**
	 * Anonymize data
	 */
	private anonymizeData(data: any): any {
		if (typeof data === "string") {
			// Remove potential PII
			return data
				.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
				.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
				.replace(/\b\d{9,}\b/g, "[ID]");
		}
		return data;
	}

	/**
	 * Update patterns based on feedback
	 */
	private async updatePatterns(feedback: IUserFeedback): Promise<void> {
		const patternKey = this.extractPatternKey(feedback);
		if (!patternKey) return;

		let pattern = this.patterns.get(patternKey);
		if (!pattern) {
			pattern = {
				id: patternKey,
				pattern: patternKey,
				category: feedback.category,
				frequency: 0,
				successRate: 0,
				userPreference: 0.5,
				contexts: [],
				examples: [],
				lastUpdated: new Date(),
			};
			this.patterns.set(patternKey, pattern);
		}

		// Update pattern metrics
		pattern.frequency++;
		pattern.successRate = this.updateSuccessRate(
			pattern.successRate,
			feedback.impact === "positive",
			pattern.frequency,
		);
		pattern.userPreference = this.updatePreference(
			pattern.userPreference,
			feedback,
			this.config.learningRate,
		);
		pattern.lastUpdated = new Date();

		// Update context tracking
		const context = this.extractContext(feedback);
		const existingContext = pattern.contexts.find(
			(c) =>
				c.locale === context.locale &&
				c.framework === context.framework &&
				c.compliance === context.compliance,
		);

		if (existingContext) {
			existingContext.count++;
		} else {
			pattern.contexts.push({ ...context, count: 1 });
		}

		// Add example if significant
		if (feedback.impact !== "neutral" && pattern.examples.length < 50) {
			pattern.examples.push({
				input: JSON.stringify(feedback.context.input),
				output: JSON.stringify(feedback.context.output),
				feedback,
			});
		}
	}

	/**
	 * Extract pattern key from feedback
	 */
	private extractPatternKey(feedback: IUserFeedback): string | null {
		const { action, input } = feedback.context;

		if (action === "code-generation" && input.type) {
			return `generate-${input.type}`;
		} else if (action === "code-analysis") {
			return "analyze-code";
		} else if (action === "compliance-check") {
			return `compliance-${input.compliance || "general"}`;
		}

		return action || null;
	}

	/**
	 * Extract context from feedback
	 */
	private extractContext(feedback: IUserFeedback): {
		locale: LocaleCode;
		framework: string;
		compliance: string;
	} {
		const input = feedback.context.input;
		return {
			locale: input.locale || "nb-NO",
			framework: input.framework || "unknown",
			compliance: input.compliance?.nsmClassification || "OPEN",
		};
	}

	/**
	 * Update success rate
	 */
	private updateSuccessRate(
		currentRate: number,
		success: boolean,
		totalCount: number,
	): number {
		const successValue = success ? 1 : 0;
		return (currentRate * (totalCount - 1) + successValue) / totalCount;
	}

	/**
	 * Update user preference
	 */
	private updatePreference(
		currentPreference: number,
		feedback: IUserFeedback,
		learningRate: number,
	): number {
		let targetValue = currentPreference;

		if (feedback.type === "rating" && feedback.feedback.rating) {
			targetValue = feedback.feedback.rating / 5;
		} else if (feedback.impact === "positive") {
			targetValue = 1;
		} else if (feedback.impact === "negative") {
			targetValue = 0;
		} else {
			targetValue = 0.5;
		}

		// Exponential moving average
		return currentPreference * (1 - learningRate) + targetValue * learningRate;
	}

	/**
	 * Check for immediate improvements
	 */
	private async checkImmediateImprovements(
		feedback: IUserFeedback,
	): Promise<void> {
		// If negative feedback on critical function, trigger immediate analysis
		if (
			feedback.impact === "negative" &&
			feedback.category === "compliance" &&
			feedback.type === "report"
		) {
			this.logger.warn("Critical negative feedback received", {
				category: feedback.category,
				report: feedback.feedback.report,
			});

			// Emit event for immediate action
			this.emit("criticalFeedback", feedback);
		}
	}

	/**
	 * Update A/B tests with feedback
	 */
	private async updateABTests(feedback: IUserFeedback): Promise<void> {
		for (const [testId, test] of this.activeTests) {
			if (test.status !== "active") continue;

			// Check if feedback is relevant to test metrics
			const relevantMetric = test.metrics.find(
				(m) =>
					feedback.category.includes(m) || feedback.context.action.includes(m),
			);

			if (relevantMetric) {
				// Record metric (in production, use proper analytics)
				this.emit("abTestMetric", {
					testId,
					metric: relevantMetric,
					value: feedback.impact === "positive" ? 1 : 0,
					variant: feedback.context.metadata?.abTestVariant,
				});
			}
		}
	}

	/**
	 * Start periodic analysis
	 */
	private startPeriodicAnalysis(): void {
		// Run analysis every hour
		setInterval(
			async () => {
				try {
					await this.runPeriodicAnalysis();
				} catch (error) {
					this.logger.error("Periodic analysis failed", error as Error);
				}
			},
			60 * 60 * 1000,
		);
	}

	/**
	 * Run periodic analysis
	 */
	private async runPeriodicAnalysis(): Promise<void> {
		this.logger.debug("Running periodic learning analysis");

		// Get improvement suggestions
		const suggestions = await this.getImprovementSuggestions();

		// Auto-apply low-risk improvements
		for (const suggestion of suggestions) {
			if (
				suggestion.priority === "critical" ||
				(suggestion.priority === "high" &&
					suggestion.implementation.risk === "low")
			) {
				this.logger.info("Auto-applying improvement", {
					id: suggestion.id,
					type: suggestion.type,
				});

				await this.applyImprovement(suggestion);
			}
		}

		// Clean up old data
		await this.cleanupOldData();

		// Persist current state
		await this.persistLearningData();
	}

	/**
	 * Apply improvement suggestion
	 */
	private async applyImprovement(
		improvement: IModelImprovement,
	): Promise<void> {
		switch (improvement.type) {
			case "knowledge-update":
				await this.updateKnowledgeBase(improvement.data);
				break;
			case "parameter-adjustment":
				await this.adjustParameters(improvement);
				break;
			case "fine-tuning":
				// Emit event for external fine-tuning process
				this.emit("fineTuningRequired", improvement);
				break;
		}
	}

	/**
	 * Update knowledge base
	 */
	private async updateKnowledgeBase(data: any): Promise<void> {
		const ragService = this.aiServiceFactory!.createRAGService();

		for (const example of data.examples) {
			await ragService.indexDocument({
				content: example.output,
				metadata: {
					pattern: example.input,
					feedback: "positive",
					updated: new Date().toISOString(),
				},
			});
		}
	}

	/**
	 * Adjust parameters
	 */
	private async adjustParameters(
		improvement: IModelImprovement,
	): Promise<void> {
		// Update configuration
		const currentConfig = this.configService.get("ai.generation", {});
		const newConfig = {
			...currentConfig,
			temperature: Math.max(
				0.1,
				Math.min(1.0, currentConfig.temperature + 0.1),
			),
			adaptedFromFeedback: true,
			lastAdapted: new Date().toISOString(),
		};

		this.configService.set("ai.generation", newConfig);
		this.emit("parametersAdjusted", newConfig);
	}

	/**
	 * Find outdated patterns
	 */
	private async findOutdatedPatterns(): Promise<ILearningPattern[]> {
		const outdated: ILearningPattern[] = [];
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		for (const pattern of this.patterns.values()) {
			if (pattern.lastUpdated < thirtyDaysAgo && pattern.successRate < 0.8) {
				outdated.push(pattern);
			}
		}

		return outdated;
	}

	/**
	 * Learn from modifications
	 */
	private async learnFromModifications(
		original: string,
		modified: string,
		context: any,
	): Promise<void> {
		try {
			const aiService = this.aiServiceFactory!.createAICodeGeneratorService();

			// Analyze the differences
			const analysis = await aiService.analyzeCode(
				`Original:\n${original}\n\nModified:\n${modified}`,
				context.compliance || {},
			);

			// Create feedback for the modification
			const feedback: IUserFeedback = {
				id: this.generateId(),
				timestamp: new Date(),
				sessionId: context.sessionId || "unknown",
				type: "correction",
				category: "code-quality",
				context: {
					action: "code-modification",
					input: { original, context },
					output: { modified, analysis },
				},
				feedback: {
					correction: modified,
				},
				impact: "positive", // User took time to improve it
			};

			await this.recordFeedback(feedback);
		} catch (error) {
			this.logger.warn("Failed to learn from modifications", error as Error);
		}
	}

	/**
	 * Analyze A/B test results
	 */
	private async analyzeABTestResults(test: IABTest): Promise<any> {
		// Simplified analysis (in production, use proper statistical methods)
		const variantMetrics = new Map<
			string,
			{ success: number; total: number }
		>();

		// Initialize variant metrics
		for (const variant of test.variants) {
			variantMetrics.set(variant.id, { success: 0, total: 0 });
		}

		// Aggregate feedback for test period
		const testFeedback = this.feedbackHistory.filter(
			(f) =>
				f.timestamp >= test.startDate &&
				(!test.endDate || f.timestamp <= test.endDate) &&
				f.context.metadata?.abTestId === test.id,
		);

		for (const feedback of testFeedback) {
			const variantId = feedback.context.metadata?.abTestVariant;
			if (variantId && variantMetrics.has(variantId)) {
				const metrics = variantMetrics.get(variantId)!;
				metrics.total++;
				if (feedback.impact === "positive") {
					metrics.success++;
				}
			}
		}

		// Determine winner
		let winner: string | undefined;
		let bestRate = 0;
		const improvements: Record<string, number> = {};

		for (const [variantId, metrics] of variantMetrics) {
			const successRate =
				metrics.total > 0 ? metrics.success / metrics.total : 0;
			improvements[variantId] = successRate;

			if (successRate > bestRate && metrics.total >= 10) {
				winner = variantId;
				bestRate = successRate;
			}
		}

		// Calculate confidence (simplified)
		const totalSamples = Array.from(variantMetrics.values()).reduce(
			(sum, m) => sum + m.total,
			0,
		);
		const confidence = Math.min(0.95, totalSamples / 100);

		return {
			winner,
			confidence,
			improvements,
		};
	}

	/**
	 * Clean up old data
	 */
	private async cleanupOldData(): Promise<void> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);

		// Remove old feedback
		const beforeCount = this.feedbackHistory.length;
		this.feedbackHistory = this.feedbackHistory.filter(
			(f) => f.timestamp > cutoffDate,
		);
		const removed = beforeCount - this.feedbackHistory.length;

		if (removed > 0) {
			this.logger.info(`Cleaned up ${removed} old feedback entries`);
		}

		// Clean up old pattern examples
		for (const pattern of this.patterns.values()) {
			if (pattern.examples.length > 50) {
				pattern.examples = pattern.examples.slice(-50);
			}
		}
	}

	/**
	 * Calculate accuracy score
	 */
	private calculateAccuracyScore(feedback: IUserFeedback[]): number {
		const accuracyFeedback = feedback.filter(
			(f) => f.category === "accuracy" || f.category === "code-quality",
		);

		if (accuracyFeedback.length === 0) return 0.5;

		const positiveCount = accuracyFeedback.filter(
			(f) => f.impact === "positive",
		).length;
		return positiveCount / accuracyFeedback.length;
	}

	/**
	 * Calculate compliance score
	 */
	private calculateComplianceScore(feedback: IUserFeedback[]): number {
		const complianceFeedback = feedback.filter(
			(f) => f.category === "compliance",
		);

		if (complianceFeedback.length === 0) return 1.0;

		const compliantCount = complianceFeedback.filter(
			(f) => f.impact !== "negative",
		).length;
		return compliantCount / complianceFeedback.length;
	}

	/**
	 * Calculate performance score
	 */
	private calculatePerformanceScore(feedback: IUserFeedback[]): number {
		const performanceFeedback = feedback.filter(
			(f) => f.category === "performance",
		);

		if (performanceFeedback.length === 0) return 0.5;

		const goodCount = performanceFeedback.filter(
			(f) => f.impact === "positive",
		).length;
		return goodCount / performanceFeedback.length;
	}

	/**
	 * Calculate satisfaction score
	 */
	private calculateSatisfactionScore(feedback: IUserFeedback[]): number {
		const ratings = feedback
			.filter((f) => f.type === "rating" && f.feedback.rating)
			.map((f) => f.feedback.rating! / 5);

		const implicitPositive = feedback.filter(
			(f) => f.type === "implicit" && f.impact === "positive",
		).length;

		const implicitTotal = feedback.filter((f) => f.type === "implicit").length;

		if (ratings.length === 0 && implicitTotal === 0) return 0.5;

		const explicitScore =
			ratings.length > 0
				? ratings.reduce((a, b) => a + b, 0) / ratings.length
				: 0;

		const implicitScore =
			implicitTotal > 0 ? implicitPositive / implicitTotal : 0;

		// Weight explicit ratings higher
		const totalWeight = ratings.length * 2 + implicitTotal;
		return totalWeight > 0
			? (explicitScore * ratings.length * 2 + implicitScore * implicitTotal) /
					totalWeight
			: 0.5;
	}

	/**
	 * Calculate improvement trend
	 */
	private calculateImprovementTrend(feedback: IUserFeedback[]): number {
		if (feedback.length < 10) return 0;

		// Compare first half with second half
		const midpoint = Math.floor(feedback.length / 2);
		const firstHalf = feedback.slice(0, midpoint);
		const secondHalf = feedback.slice(midpoint);

		const firstScore = this.calculateSatisfactionScore(firstHalf);
		const secondScore = this.calculateSatisfactionScore(secondHalf);

		return secondScore - firstScore;
	}

	/**
	 * Identify top issues
	 */
	private identifyTopIssues(feedback: IUserFeedback[]): Array<{
		issue: string;
		frequency: number;
		impact: string;
	}> {
		const issueMap = new Map<string, number>();

		feedback
			.filter((f) => f.impact === "negative")
			.forEach((f) => {
				const key = `${f.category}-${f.context.action}`;
				issueMap.set(key, (issueMap.get(key) || 0) + 1);
			});

		return Array.from(issueMap.entries())
			.map(([issue, frequency]) => ({
				issue,
				frequency,
				impact: frequency > 10 ? "High" : frequency > 5 ? "Medium" : "Low",
			}))
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 5);
	}

	/**
	 * Identify top successes
	 */
	private identifyTopSuccesses(feedback: IUserFeedback[]): Array<{
		pattern: string;
		frequency: number;
		rating: number;
	}> {
		const successMap = new Map<
			string,
			{ count: number; totalRating: number }
		>();

		feedback
			.filter((f) => f.impact === "positive")
			.forEach((f) => {
				const key = `${f.category}-${f.context.action}`;
				const current = successMap.get(key) || { count: 0, totalRating: 0 };
				current.count++;
				if (f.type === "rating" && f.feedback.rating) {
					current.totalRating += f.feedback.rating;
				} else {
					current.totalRating += 4; // Default good rating
				}
				successMap.set(key, current);
			});

		return Array.from(successMap.entries())
			.map(([pattern, data]) => ({
				pattern,
				frequency: data.count,
				rating: data.totalRating / data.count,
			}))
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 5);
	}

	/**
	 * Hash string for consistent assignment
	 */
	private hashString(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return Math.abs(hash).toString(36);
	}

	/**
	 * Generate unique ID
	 */
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
