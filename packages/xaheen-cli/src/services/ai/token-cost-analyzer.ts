/**
 * @fileoverview Token Usage Estimation and Cost Analysis System - EPIC 13 Story 13.5
 * @description Comprehensive token usage estimation and cost analysis for AI-powered template generation
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";
import type { PatternRecommendation } from "./ai-pattern-recommender";

// Schema definitions for token cost analysis
const TokenUsageEstimateSchema = z.object({
	templateType: z.string(),
	baseTokens: z.number().min(0),
	complexityMultiplier: z.number().min(1),
	featureTokens: z.record(z.number()),
	totalEstimatedTokens: z.number().min(0),
	confidence: z.number().min(0).max(1),
	factors: z.array(z.string()),
});

const CostBreakdownSchema = z.object({
	inputTokens: z.number().min(0),
	outputTokens: z.number().min(0),
	modelType: z.enum(["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]),
	costPerInputToken: z.number().min(0),
	costPerOutputToken: z.number().min(0),
	totalCost: z.number().min(0),
	currency: z.string().default("USD"),
});

const BudgetConstraintSchema = z.object({
	maxTokens: z.number().min(0).optional(),
	maxCost: z.number().min(0).optional(),
	timelineHours: z.number().min(0).optional(),
	priorityLevel: z.enum(["low", "medium", "high", "critical"]).default("medium"),
	costCenterCode: z.string().optional(),
	approvalRequired: z.boolean().default(false),
});

const UsageAnalyticsSchema = z.object({
	sessionId: z.string(),
	timestamp: z.date(),
	templateType: z.string(),
	actualTokensUsed: z.number().min(0),
	estimatedTokens: z.number().min(0),
	accuracyPercentage: z.number().min(0).max(100),
	actualCost: z.number().min(0),
	estimatedCost: z.number().min(0),
	modelUsed: z.string(),
	generationTime: z.number().min(0),
	successRate: z.number().min(0).max(1),
});

const CostOptimizationSuggestionSchema = z.object({
	type: z.enum(["model-switch", "template-simplification", "feature-reduction", "phased-approach"]),
	title: z.string(),
	description: z.string(),
	potentialSavings: z.object({
		tokens: z.number(),
		cost: z.number(),
		percentage: z.number(),
	}),
	implementationComplexity: z.enum(["low", "medium", "high"]),
	tradeoffs: z.array(z.string()),
	recommendation: z.string(),
});

export type TokenUsageEstimate = z.infer<typeof TokenUsageEstimateSchema>;
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>;
export type BudgetConstraint = z.infer<typeof BudgetConstraintSchema>;
export type UsageAnalytics = z.infer<typeof UsageAnalyticsSchema>;
export type CostOptimizationSuggestion = z.infer<typeof CostOptimizationSuggestionSchema>;

export interface CostAnalysisRequest {
	readonly templateType: string;
	readonly features: string[];
	readonly complexity: "low" | "medium" | "high";
	readonly platform: string;
	readonly customizations?: Record<string, any>;
	readonly budgetConstraints?: BudgetConstraint;
	readonly preferredModel?: string;
}

export interface CostAnalysisResult {
	readonly estimate: TokenUsageEstimate;
	readonly costBreakdown: CostBreakdown[];
	readonly optimizationSuggestions: CostOptimizationSuggestion[];
	readonly budgetCompliance: {
		meetsTokenBudget: boolean;
		meetsCostBudget: boolean;
		meetsTimelineBudget: boolean;
		overageDetails?: {
			tokenOverage: number;
			costOverage: number;
			timeOverage: number;
		};
	};
	readonly alternativeOptions: Array<{
		model: string;
		estimatedTokens: number;
		estimatedCost: number;
		qualityTradeoff: string;
	}>;
}

/**
 * Token Cost Analyzer for AI-powered template generation
 * Provides accurate cost estimation and optimization suggestions
 */
export class TokenCostAnalyzer {
	private readonly modelPricing: Map<string, { input: number; output: number }> = new Map();
	private readonly baseTokenEstimates: Map<string, number> = new Map();
	private readonly complexityMultipliers: Map<string, number> = new Map();
	private readonly featureTokenCosts: Map<string, number> = new Map();
	private readonly historicalData: UsageAnalytics[] = [];
	private readonly analyticsFile: string;

	constructor(private readonly projectRoot: string = process.cwd()) {
		this.analyticsFile = join(this.projectRoot, ".xaheen", "token-analytics.json");
		this.initializePricingData();
		this.initializeTokenEstimates();
		this.loadHistoricalData();
	}

	/**
	 * Analyze cost and token usage for a given template generation request
	 */
	async analyzeCost(request: CostAnalysisRequest): Promise<CostAnalysisResult> {
		try {
			logger.info(`💰 Analyzing cost for ${request.templateType} template...`);

			// Generate token usage estimate
			const estimate = await this.estimateTokenUsage(request);
			
			// Calculate cost breakdown for different models
			const costBreakdown = await this.calculateCostBreakdown(estimate, request.preferredModel);
			
			// Generate optimization suggestions
			const optimizationSuggestions = await this.generateOptimizationSuggestions(estimate, request);
			
			// Check budget compliance
			const budgetCompliance = this.checkBudgetCompliance(estimate, costBreakdown, request.budgetConstraints);
			
			// Generate alternative options
			const alternativeOptions = await this.generateAlternativeOptions(estimate, request);

			const result: CostAnalysisResult = {
				estimate,
				costBreakdown,
				optimizationSuggestions,
				budgetCompliance,
				alternativeOptions,
			};

			logger.success(`✅ Cost analysis completed: ${estimate.totalEstimatedTokens} tokens, $${costBreakdown[0]?.totalCost.toFixed(4)}`);
			return result;
		} catch (error) {
			logger.error("Failed to analyze cost:", error);
			throw new Error(`Cost analysis failed: ${error.message}`);
		}
	}

	/**
	 * Estimate token usage for a template generation request
	 */
	async estimateTokenUsage(request: CostAnalysisRequest): Promise<TokenUsageEstimate> {
		// Get base token estimate for template type
		const baseTokens = this.getBaseTokenEstimate(request.templateType);
		
		// Get complexity multiplier
		const complexityMultiplier = this.getComplexityMultiplier(request.complexity);
		
		// Calculate feature tokens
		const featureTokens: Record<string, number> = {};
		let totalFeatureTokens = 0;
		
		for (const feature of request.features) {
			const tokens = this.getFeatureTokenCost(feature);
			featureTokens[feature] = tokens;
			totalFeatureTokens += tokens;
		}

		// Platform-specific adjustments
		const platformAdjustment = this.getPlatformAdjustment(request.platform);
		
		// Customization complexity
		const customizationTokens = this.estimateCustomizationTokens(request.customizations);
		
		// Calculate total with historical accuracy adjustment
		const rawTotal = (baseTokens + totalFeatureTokens + customizationTokens) * complexityMultiplier * platformAdjustment;
		const accuracyAdjustment = this.getHistoricalAccuracyAdjustment(request.templateType);
		const totalEstimatedTokens = Math.ceil(rawTotal * accuracyAdjustment);

		// Factors that influenced the estimate
		const factors = [
			`Base tokens: ${baseTokens}`,
			`Complexity multiplier: ${complexityMultiplier}x`,
			`Features: ${request.features.length} (+${totalFeatureTokens} tokens)`,
			`Platform: ${request.platform} (${platformAdjustment}x)`,
			`Customizations: +${customizationTokens} tokens`,
			`Historical accuracy adjustment: ${accuracyAdjustment}x`,
		];

		// Confidence based on historical data
		const confidence = this.calculateEstimateConfidence(request);

		return TokenUsageEstimateSchema.parse({
			templateType: request.templateType,
			baseTokens,
			complexityMultiplier,
			featureTokens,
			totalEstimatedTokens,
			confidence,
			factors,
		});
	}

	/**
	 * Calculate cost breakdown for different AI models
	 */
	async calculateCostBreakdown(
		estimate: TokenUsageEstimate,
		preferredModel?: string
	): Promise<CostBreakdown[]> {
		const costBreakdowns: CostBreakdown[] = [];
		
		// Estimate input/output token split (typically 30% input, 70% output for generation)
		const inputTokens = Math.ceil(estimate.totalEstimatedTokens * 0.3);
		const outputTokens = Math.ceil(estimate.totalEstimatedTokens * 0.7);

		// Calculate costs for available models
		const modelsToAnalyze = preferredModel ? [preferredModel] : Array.from(this.modelPricing.keys());

		for (const modelType of modelsToAnalyze) {
			const pricing = this.modelPricing.get(modelType);
			if (!pricing) continue;

			const inputCost = inputTokens * pricing.input;
			const outputCost = outputTokens * pricing.output;
			const totalCost = inputCost + outputCost;

			costBreakdowns.push(CostBreakdownSchema.parse({
				inputTokens,
				outputTokens,
				modelType: modelType as any,
				costPerInputToken: pricing.input,
				costPerOutputToken: pricing.output,
				totalCost,
				currency: "USD",
			}));
		}

		// Sort by cost (lowest first)
		costBreakdowns.sort((a, b) => a.totalCost - b.totalCost);

		return costBreakdowns;
	}

	/**
	 * Generate cost optimization suggestions
	 */
	async generateOptimizationSuggestions(
		estimate: TokenUsageEstimate,
		request: CostAnalysisRequest
	): Promise<CostOptimizationSuggestion[]> {
		const suggestions: CostOptimizationSuggestion[] = [];

		// Model switching suggestion
		if (estimate.totalEstimatedTokens > 5000) {
			suggestions.push({
				type: "model-switch",
				title: "Use More Cost-Effective Model",
				description: "Switch to GPT-3.5-turbo or Claude Haiku for significant cost savings",
				potentialSavings: {
					tokens: 0,
					cost: estimate.totalEstimatedTokens * 0.00002, // Approximate savings
					percentage: 80,
				},
				implementationComplexity: "low",
				tradeoffs: ["Slightly lower code quality", "May require more iterations"],
				recommendation: "Use for initial prototyping, then refine with premium model",
			});
		}

		// Template simplification
		if (request.features.length > 5) {
			const excessFeatures = request.features.length - 5;
			const savingsTokens = excessFeatures * 500; // Approximate

			suggestions.push({
				type: "template-simplification",
				title: "Reduce Template Complexity",
				description: `Consider removing ${excessFeatures} less critical features to reduce complexity`,
				potentialSavings: {
					tokens: savingsTokens,
					cost: savingsTokens * 0.00003,
					percentage: (savingsTokens / estimate.totalEstimatedTokens) * 100,
				},
				implementationComplexity: "medium",
				tradeoffs: ["Reduced functionality", "May need manual implementation later"],
				recommendation: "Implement core features first, add advanced features in subsequent iterations",
			});
		}

		// Phased approach for large projects
		if (estimate.totalEstimatedTokens > 10000) {
			suggestions.push({
				type: "phased-approach",
				title: "Implement in Phases",
				description: "Break down the generation into smaller, manageable phases",
				potentialSavings: {
					tokens: 0,
					cost: 0,
					percentage: 0,
				},
				implementationComplexity: "medium",
				tradeoffs: ["Longer overall timeline", "More manual integration"],
				recommendation: "Phase 1: Core functionality, Phase 2: Advanced features, Phase 3: Optimizations",
			});
		}

		// Feature reduction for budget constraints
		if (request.budgetConstraints?.maxCost && estimate.totalEstimatedTokens * 0.00003 > request.budgetConstraints.maxCost) {
			const targetReduction = ((estimate.totalEstimatedTokens * 0.00003) - request.budgetConstraints.maxCost) / 0.00003;
			
			suggestions.push({
				type: "feature-reduction",
				title: "Reduce Features to Meet Budget",
				description: `Remove approximately ${Math.ceil(targetReduction / 500)} features to meet cost constraints`,
				potentialSavings: {
					tokens: targetReduction,
					cost: request.budgetConstraints.maxCost,
					percentage: (targetReduction / estimate.totalEstimatedTokens) * 100,
				},
				implementationComplexity: "low",
				tradeoffs: ["Reduced functionality", "Manual implementation needed"],
				recommendation: "Prioritize core business logic and user-facing features",
			});
		}

		return suggestions;
	}

	/**
	 * Check budget compliance
	 */
	private checkBudgetCompliance(
		estimate: TokenUsageEstimate,
		costBreakdown: CostBreakdown[],
		constraints?: BudgetConstraint
	): CostAnalysisResult["budgetCompliance"] {
		if (!constraints) {
			return {
				meetsTokenBudget: true,
				meetsCostBudget: true,
				meetsTimelineBudget: true,
			};
		}

		const primaryCost = costBreakdown[0];
		const meetsTokenBudget = !constraints.maxTokens || estimate.totalEstimatedTokens <= constraints.maxTokens;
		const meetsCostBudget = !constraints.maxCost || primaryCost.totalCost <= constraints.maxCost;
		const meetsTimelineBudget = !constraints.timelineHours || this.estimateGenerationTime(estimate) <= constraints.timelineHours;

		const overageDetails = {
			tokenOverage: constraints.maxTokens ? Math.max(0, estimate.totalEstimatedTokens - constraints.maxTokens) : 0,
			costOverage: constraints.maxCost ? Math.max(0, primaryCost.totalCost - constraints.maxCost) : 0,
			timeOverage: constraints.timelineHours ? Math.max(0, this.estimateGenerationTime(estimate) - constraints.timelineHours) : 0,
		};

		return {
			meetsTokenBudget,
			meetsCostBudget,
			meetsTimelineBudget,
			overageDetails: (overageDetails.tokenOverage > 0 || overageDetails.costOverage > 0 || overageDetails.timeOverage > 0) 
				? overageDetails 
				: undefined,
		};
	}

	/**
	 * Generate alternative model options
	 */
	private async generateAlternativeOptions(
		estimate: TokenUsageEstimate,
		request: CostAnalysisRequest
	): Promise<CostAnalysisResult["alternativeOptions"]> {
		const alternatives: CostAnalysisResult["alternativeOptions"] = [];

		for (const [modelName, pricing] of this.modelPricing.entries()) {
			if (modelName === request.preferredModel) continue;

			const inputTokens = Math.ceil(estimate.totalEstimatedTokens * 0.3);
			const outputTokens = Math.ceil(estimate.totalEstimatedTokens * 0.7);
			const estimatedCost = (inputTokens * pricing.input) + (outputTokens * pricing.output);

			// Quality assessment based on model capabilities
			let qualityTradeoff = "Similar quality";
			if (modelName.includes("gpt-3.5")) {
				qualityTradeoff = "Slightly lower code quality, faster generation";
			} else if (modelName.includes("haiku")) {
				qualityTradeoff = "Good for simple templates, very fast";
			} else if (modelName.includes("opus")) {
				qualityTradeoff = "Highest quality, slower generation";
			}

			alternatives.push({
				model: modelName,
				estimatedTokens: estimate.totalEstimatedTokens,
				estimatedCost,
				qualityTradeoff,
			});
		}

		// Sort by cost
		alternatives.sort((a, b) => a.estimatedCost - b.estimatedCost);

		return alternatives;
	}

	/**
	 * Record actual usage for accuracy improvement
	 */
	async recordActualUsage(
		sessionId: string,
		templateType: string,
		estimatedTokens: number,
		actualTokensUsed: number,
		actualCost: number,
		modelUsed: string,
		generationTime: number,
		success: boolean
	): Promise<void> {
		const analytics: UsageAnalytics = {
			sessionId,
			timestamp: new Date(),
			templateType,
			actualTokensUsed,
			estimatedTokens,
			accuracyPercentage: (actualTokensUsed > 0) ? Math.min(100, (estimatedTokens / actualTokensUsed) * 100) : 0,
			actualCost,
			estimatedCost: estimatedTokens * 0.00003, // Default rate
			modelUsed,
			generationTime,
			successRate: success ? 1 : 0,
		};

		this.historicalData.push(analytics);
		await this.saveHistoricalData();

		logger.debug(`📊 Recorded usage analytics: ${actualTokensUsed} tokens, ${analytics.accuracyPercentage.toFixed(1)}% accuracy`);
	}

	/**
	 * Get usage analytics and trends
	 */
	getUsageAnalytics(timeRangeDays: number = 30, templateType?: string): {
		totalSessions: number;
		averageAccuracy: number;
		totalTokensUsed: number;
		totalCost: number;
		averageGenerationTime: number;
		successRate: number;
		trends: {
			accuracyTrend: "improving" | "declining" | "stable";
			costTrend: "increasing" | "decreasing" | "stable";
			performanceTrend: "improving" | "declining" | "stable";
		};
	} {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - timeRangeDays);

		let relevantData = this.historicalData.filter(d => d.timestamp >= cutoffDate);
		
		if (templateType) {
			relevantData = relevantData.filter(d => d.templateType === templateType);
		}

		if (relevantData.length === 0) {
			return {
				totalSessions: 0,
				averageAccuracy: 0,
				totalTokensUsed: 0,
				totalCost: 0,
				averageGenerationTime: 0,
				successRate: 0,
				trends: {
					accuracyTrend: "stable",
					costTrend: "stable",
					performanceTrend: "stable",
				},
			};
		}

		const totalSessions = relevantData.length;
		const averageAccuracy = relevantData.reduce((sum, d) => sum + d.accuracyPercentage, 0) / totalSessions;
		const totalTokensUsed = relevantData.reduce((sum, d) => sum + d.actualTokensUsed, 0);
		const totalCost = relevantData.reduce((sum, d) => sum + d.actualCost, 0);
		const averageGenerationTime = relevantData.reduce((sum, d) => sum + d.generationTime, 0) / totalSessions;
		const successRate = relevantData.reduce((sum, d) => sum + d.successRate, 0) / totalSessions;

		// Calculate trends (simplified)
		const midpoint = Math.floor(relevantData.length / 2);
		const firstHalf = relevantData.slice(0, midpoint);
		const secondHalf = relevantData.slice(midpoint);

		const getAverage = (data: UsageAnalytics[], field: keyof UsageAnalytics) => 
			data.reduce((sum, d) => sum + (d[field] as number), 0) / data.length;

		const accuracyTrend = this.calculateTrend(
			getAverage(firstHalf, "accuracyPercentage"),
			getAverage(secondHalf, "accuracyPercentage")
		);

		const costTrend = this.calculateTrend(
			getAverage(firstHalf, "actualCost"),
			getAverage(secondHalf, "actualCost")
		);

		const performanceTrend = this.calculateTrend(
			getAverage(secondHalf, "generationTime"), // Reversed because lower is better
			getAverage(firstHalf, "generationTime")
		);

		return {
			totalSessions,
			averageAccuracy,
			totalTokensUsed,
			totalCost,
			averageGenerationTime,
			successRate,
			trends: {
				accuracyTrend,
				costTrend,
				performanceTrend,
			},
		};
	}

	// Private utility methods

	private initializePricingData(): void {
		// Current pricing as of 2024 (tokens per $1)
		this.modelPricing.set("gpt-4", { input: 0.00003, output: 0.00006 });
		this.modelPricing.set("gpt-4-turbo", { input: 0.00001, output: 0.00003 });
		this.modelPricing.set("gpt-3.5-turbo", { input: 0.0000005, output: 0.0000015 });
		this.modelPricing.set("claude-3-opus", { input: 0.000015, output: 0.000075 });
		this.modelPricing.set("claude-3-sonnet", { input: 0.000003, output: 0.000015 });
		this.modelPricing.set("claude-3-haiku", { input: 0.00000025, output: 0.00000125 });
	}

	private initializeTokenEstimates(): void {
		// Base token estimates for different template types
		this.baseTokenEstimates.set("component", 2000);
		this.baseTokenEstimates.set("layout", 3000);
		this.baseTokenEstimates.set("page", 4000);
		this.baseTokenEstimates.set("service", 3500);
		this.baseTokenEstimates.set("form", 2500);
		this.baseTokenEstimates.set("data-table", 3500);
		this.baseTokenEstimates.set("navigation", 2000);
		this.baseTokenEstimates.set("architecture", 5000);

		// Complexity multipliers
		this.complexityMultipliers.set("low", 1.0);
		this.complexityMultipliers.set("medium", 1.5);
		this.complexityMultipliers.set("high", 2.5);

		// Feature token costs
		this.featureTokenCosts.set("typescript", 200);
		this.featureTokenCosts.set("tests", 500);
		this.featureTokenCosts.set("stories", 300);
		this.featureTokenCosts.set("accessibility", 400);
		this.featureTokenCosts.set("internationalization", 600);
		this.featureTokenCosts.set("animations", 800);
		this.featureTokenCosts.set("responsive", 300);
		this.featureTokenCosts.set("theming", 400);
		this.featureTokenCosts.set("state-management", 700);
		this.featureTokenCosts.set("data-fetching", 600);
		this.featureTokenCosts.set("form-validation", 500);
		this.featureTokenCosts.set("error-handling", 300);
		this.featureTokenCosts.set("performance-optimization", 600);
		this.featureTokenCosts.set("security", 500);
		this.featureTokenCosts.set("logging", 200);
		this.featureTokenCosts.set("monitoring", 400);
	}

	private getBaseTokenEstimate(templateType: string): number {
		return this.baseTokenEstimates.get(templateType) || 2500;
	}

	private getComplexityMultiplier(complexity: string): number {
		return this.complexityMultipliers.get(complexity) || 1.5;
	}

	private getFeatureTokenCost(feature: string): number {
		return this.featureTokenCosts.get(feature) || 300;
	}

	private getPlatformAdjustment(platform: string): number {
		const adjustments: Record<string, number> = {
			"react": 1.0,
			"nextjs": 1.2,
			"vue": 1.1,
			"angular": 1.4,
			"svelte": 0.9,
			"electron": 1.3,
			"react-native": 1.3,
		};
		return adjustments[platform] || 1.0;
	}

	private estimateCustomizationTokens(customizations?: Record<string, any>): number {
		if (!customizations) return 0;
		
		const customizationCount = Object.keys(customizations).length;
		return customizationCount * 150; // Average tokens per customization
	}

	private getHistoricalAccuracyAdjustment(templateType: string): number {
		const historicalForType = this.historicalData.filter(d => d.templateType === templateType);
		if (historicalForType.length < 5) return 1.1; // Default buffer

		const avgAccuracy = historicalForType.reduce((sum, d) => sum + d.accuracyPercentage, 0) / historicalForType.length;
		return 100 / Math.max(avgAccuracy, 50); // Adjust based on historical accuracy
	}

	private calculateEstimateConfidence(request: CostAnalysisRequest): number {
		let confidence = 0.8; // Base confidence

		// Adjust based on template type familiarity
		const historicalForType = this.historicalData.filter(d => d.templateType === request.templateType);
		if (historicalForType.length > 10) confidence += 0.1;
		if (historicalForType.length > 50) confidence += 0.1;

		// Adjust based on complexity
		if (request.complexity === "low") confidence += 0.05;
		if (request.complexity === "high") confidence -= 0.1;

		// Adjust based on features
		if (request.features.length > 10) confidence -= 0.1;

		return Math.min(0.95, Math.max(0.5, confidence));
	}

	private estimateGenerationTime(estimate: TokenUsageEstimate): number {
		// Simplified time estimation: roughly 1 minute per 1000 tokens
		return Math.ceil(estimate.totalEstimatedTokens / 1000 * 60);
	}

	private calculateTrend(firstValue: number, secondValue: number): "improving" | "declining" | "stable" {
		const threshold = 0.05; // 5% threshold
		const change = (secondValue - firstValue) / firstValue;
		
		if (change > threshold) return "improving";
		if (change < -threshold) return "declining";
		return "stable";
	}

	private async loadHistoricalData(): Promise<void> {
		try {
			const data = await fs.readFile(this.analyticsFile, "utf-8");
			const parsed = JSON.parse(data);
			this.historicalData.push(...parsed.map((item: any) => ({
				...item,
				timestamp: new Date(item.timestamp),
			})));
		} catch (error) {
			// File doesn't exist or is invalid, start fresh
			logger.debug("No historical analytics data found, starting fresh");
		}
	}

	private async saveHistoricalData(): Promise<void> {
		try {
			await fs.mkdir(join(this.projectRoot, ".xaheen"), { recursive: true });
			await fs.writeFile(
				this.analyticsFile,
				JSON.stringify(this.historicalData, null, 2),
				"utf-8"
			);
		} catch (error) {
			logger.warn("Failed to save historical analytics data:", error);
		}
	}
}

/**
 * Create singleton token cost analyzer instance
 */
export const tokenCostAnalyzer = new TokenCostAnalyzer();