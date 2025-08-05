/**
 * @fileoverview AI Services Index - EPIC 13 Story 13.5
 * @description Main export file for all AI-Native Template System components
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

// Main AI-Native Template System
export {
	AINativeTemplateSystem,
	aiNativeTemplateSystem,
	type AITemplateRequest,
	type AITemplateResult,
	type AITemplateSystemConfig,
} from "./ai-native-template-system.js";

// AI Pattern Recommender
export {
	AIPatternRecommender,
	aiPatternRecommender,
	type PatternRecommendation,
	type LayoutPattern,
	type ComponentPattern,
	type ArchitecturalPattern,
	type ProjectAnalysis,
	type RecommendationRequest,
	type RecommendationResult,
} from "./ai-pattern-recommender.js";

// Token Cost Analyzer
export {
	TokenCostAnalyzer,
	tokenCostAnalyzer,
	type TokenUsageEstimate,
	type CostBreakdown,
	type BudgetConstraint,
	type UsageAnalytics,
	type CostOptimizationSuggestion,
	type CostAnalysisRequest,
	type CostAnalysisResult,
} from "./token-cost-analyzer.js";

// AI Quality Assurance
export {
	AIQualityAssurance,
	aiQualityAssurance,
	type AccessibilityIssue,
	type NorwegianComplianceIssue,
	type PerformanceIssue,
	type CodeQualityIssue,
	type QualityAssuranceReport,
	type QualityAssuranceRequest,
	type QualityFixResult,
} from "./ai-quality-assurance.js";

// Recommendation Scoring Engine
export {
	RecommendationScoringEngine,
	recommendationScoringEngine,
	type ScoringCriteria,
	type ScoringWeights,
	type ScoredRecommendation,
	type RankingConfig,
	type ScoringContext,
	type RankingResult,
} from "./recommendation-scoring-engine.js";

// Cost Optimization Engine
export {
	CostOptimizationEngine,
	costOptimizationEngine,
	type CostOptimizationStrategyType,
	type UsagePattern,
	type CostTrend,
	type OptimizationRecommendation,
	type OptimizationContext,
	type CostOptimizationResult,
	type UsageAnalyticsResult,
} from "./cost-optimization-engine.js";

// Performance Optimization Analyzer
export {
	PerformanceOptimizationAnalyzer,
	performanceOptimizationAnalyzer,
	type PerformanceIssue as PerfIssue,
	type OptimizationSuggestion,
	type PerformanceBenchmark,
	type PerformanceAnalysisResult,
	type PerformanceAnalysisRequest,
	type AutoOptimizationResult,
} from "./performance-optimization-analyzer.js";

// Base AI Service
export {
	AIService,
	OpenAIProvider,
	AnthropicProvider,
	type AIProvider,
	type GenerationContext,
	type ComponentContext,
	type ServiceContext,
	type GeneratedCode,
	type GeneratedComponent,
	type GeneratedService,
	type CodeAnalysis,
} from "./ai-service.js";

/**
 * AI-Native Template System Configuration
 * Default configuration for the entire AI system
 */
export const DEFAULT_AI_CONFIG = {
	enablePatternRecommendations: true,
	enableCostAnalysis: true,
	enableQualityAssurance: true,
	enablePerformanceOptimization: true,
	enableAutoOptimizations: true,
	defaultBudgetLimits: {
		maxTokens: 10000,
		maxCost: 50,
	},
	qualityThresholds: {
		accessibility: 85,
		performance: 80,
		maintainability: 75,
	},
} as const;

/**
 * Initialize all AI services
 * Convenience function to initialize the entire AI system
 */
export async function initializeAIServices(projectRoot?: string): Promise<void> {
	const root = projectRoot || process.cwd();
	
	await Promise.all([
		aiNativeTemplateSystem.initialize(),
		aiPatternRecommender.initialize(),
		aiQualityAssurance.initialize(),
	]);
}

/**
 * Get system analytics from all AI components
 */
export function getAISystemAnalytics(): {
	templateSystem: ReturnType<typeof aiNativeTemplateSystem.getSystemAnalytics>;
	costOptimization: ReturnType<typeof costOptimizationEngine.getPerformanceAnalytics>;
	patternRecommendations: any; // Would be implemented
	qualityAssurance: any; // Would be implemented
	performanceOptimization: any; // Would be implemented
} {
	return {
		templateSystem: aiNativeTemplateSystem.getSystemAnalytics(),
		costOptimization: costOptimizationEngine.getPerformanceAnalytics(),
		patternRecommendations: {}, // Placeholder
		qualityAssurance: {}, // Placeholder
		performanceOptimization: {}, // Placeholder
	};
}

/**
 * AI System Health Check
 * Verify all AI components are working correctly
 */
export async function checkAISystemHealth(): Promise<{
	overall: "healthy" | "degraded" | "unhealthy";
	components: Array<{
		name: string;
		status: "healthy" | "degraded" | "unhealthy";
		details: string;
	}>;
	recommendations: string[];
}> {
	const components = [];
	const recommendations = [];

	// Check each component
	try {
		// Template System
		const templateSystemMetrics = aiNativeTemplateSystem.getSystemAnalytics();
		const templateSystemHealthy = templateSystemMetrics.sessionMetrics.successRate > 0.8;
		components.push({
			name: "AI-Native Template System",
			status: templateSystemHealthy ? "healthy" : "degraded",
			details: `Success rate: ${Math.round(templateSystemMetrics.sessionMetrics.successRate * 100)}%`,
		});

		if (!templateSystemHealthy) {
			recommendations.push("Review template generation failures and improve error handling");
		}

		// Cost Optimization
		const costMetrics = costOptimizationEngine.getPerformanceAnalytics();
		const costSystemHealthy = costMetrics.averageAccuracy > 70;
		components.push({
			name: "Cost Optimization Engine",
			status: costSystemHealthy ? "healthy" : "degraded",
			details: `Accuracy: ${costMetrics.averageAccuracy.toFixed(1)}%`,
		});

		if (!costSystemHealthy) {
			recommendations.push("Calibrate cost estimation models with more historical data");
		}

		// Overall health
		const healthyComponents = components.filter(c => c.status === "healthy").length;
		const totalComponents = components.length;
		const overallHealthRatio = healthyComponents / totalComponents;

		let overall: "healthy" | "degraded" | "unhealthy";
		if (overallHealthRatio >= 0.8) {
			overall = "healthy";
		} else if (overallHealthRatio >= 0.6) {
			overall = "degraded";
			recommendations.push("Monitor system performance and consider maintenance");
		} else {
			overall = "unhealthy";
			recommendations.push("Immediate attention required - multiple AI components failing");
		}

		return {
			overall,
			components,
			recommendations,
		};
	} catch (error) {
		return {
			overall: "unhealthy",
			components: [{
				name: "System Check",
				status: "unhealthy",
				details: `Health check failed: ${error.message}`,
			}],
			recommendations: ["Investigate system health check failure"],
		};
	}
}

/**
 * Version information for the AI system
 */
export const AI_SYSTEM_VERSION = {
	version: "1.0.0",
	buildDate: new Date().toISOString(),
	components: {
		patternRecommender: "1.0.0",
		costAnalyzer: "1.0.0",
		qualityAssurance: "1.0.0",
		scoringEngine: "1.0.0",
		costOptimization: "1.0.0",
		performanceAnalyzer: "1.0.0",
	},
	features: [
		"AI-driven pattern recommendations",
		"Token usage estimation and cost analysis",
		"Quality assurance with accessibility checks",
		"Norwegian compliance validation",
		"Performance optimization suggestions",
		"Cost optimization strategies",
		"Recommendation scoring and ranking",
		"Automatic code optimizations",
		"Multi-template comparison",
		"Optimization roadmaps",
	],
} as const;