/**
 * @fileoverview AI-Driven Pattern Recommendations System - EPIC 13 Story 13.5
 * @description Intelligent pattern recommendations for template selection based on project context
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";
import { mcpClientService } from "../mcp/mcp-client.service.js";
import type { ProjectContext, ContextItem } from "../mcp/mcp-client.service.js";

// Schema definitions for pattern recommendations
const PatternRecommendationSchema = z.object({
	patternId: z.string(),
	patternName: z.string(),
	confidence: z.number().min(0).max(1),
	reasoning: z.string(),
	applicableScenarios: z.array(z.string()),
	benefits: z.array(z.string()),
	considerations: z.array(z.string()),
	estimatedComplexity: z.enum(["low", "medium", "high"]),
	estimatedTokenUsage: z.number().optional(),
	cost: z.object({
		development: z.number(),
		maintenance: z.number(),
		tokens: z.number(),
	}).optional(),
});

const LayoutPatternSchema = z.object({
	layoutType: z.enum(["grid", "list", "masonry", "carousel", "tabs", "accordion"]),
	recommendation: PatternRecommendationSchema,
	contextFactors: z.array(z.string()),
	adaptiveFeatures: z.array(z.string()),
});

const ComponentPatternSchema = z.object({
	componentType: z.string(),
	designPattern: z.enum(["atomic", "compound", "container", "presentational", "smart", "dumb"]),
	recommendation: PatternRecommendationSchema,
	stateManagement: z.enum(["local", "context", "redux", "zustand", "none"]),
	dataFlow: z.enum(["props", "context", "hooks", "hoc", "render-props"]),
});

const ArchitecturalPatternSchema = z.object({
	pattern: z.enum(["mvc", "mvvm", "clean", "hexagonal", "layered", "microservices", "monolith"]),
	recommendation: PatternRecommendationSchema,
	scalabilityFactors: z.array(z.string()),
	complexityFactors: z.array(z.string()),
});

const ProjectAnalysisSchema = z.object({
	projectSize: z.enum(["small", "medium", "large", "enterprise"]),
	complexity: z.enum(["simple", "moderate", "complex", "very-complex"]),
	teamSize: z.number(),
	timelineWeeks: z.number(),
	mainFeatures: z.array(z.string()),
	technicalRequirements: z.array(z.string()),
	businessRequirements: z.array(z.string()),
	complianceRequirements: z.array(z.string()),
});

export type PatternRecommendation = z.infer<typeof PatternRecommendationSchema>;
export type LayoutPattern = z.infer<typeof LayoutPatternSchema>;
export type ComponentPattern = z.infer<typeof ComponentPatternSchema>;
export type ArchitecturalPattern = z.infer<typeof ArchitecturalPatternSchema>;
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;

export interface RecommendationRequest {
	readonly templateType: "component" | "layout" | "page" | "service" | "architecture";
	readonly description?: string;
	readonly requirements?: string[];
	readonly constraints?: string[];
	readonly targetAudience?: string;
	readonly expectedLoad?: "low" | "medium" | "high";
	readonly budgetConstraints?: {
		maxTokens?: number;
		maxCost?: number;
		timeline?: number;
	};
}

export interface RecommendationResult {
	readonly primaryRecommendation: PatternRecommendation;
	readonly alternativeRecommendations: PatternRecommendation[];
	readonly projectAnalysis: ProjectAnalysis;
	readonly contextualFactors: string[];
	readonly riskAssessment: {
		technical: string[];
		business: string[];
		compliance: string[];
	};
	readonly implementationPlan: {
		phases: Array<{
			name: string;
			duration: number;
			complexity: "low" | "medium" | "high";
			tokenEstimate: number;
		}>;
		totalEstimate: {
			tokens: number;
			cost: number;
			timeWeeks: number;
		};
	};
}

/**
 * AI-Driven Pattern Recommender
 * Analyzes project context and provides intelligent pattern recommendations
 */
export class AIPatternRecommender {
	private isInitialized = false;
	private patternDatabase: Map<string, PatternRecommendation[]> = new Map();
	private analysisCache: Map<string, ProjectAnalysis> = new Map();

	constructor(private readonly projectRoot: string = process.cwd()) {
		this.initializePatternDatabase();
	}

	/**
	 * Initialize the pattern recommender with project context
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			logger.info("🧠 Initializing AI Pattern Recommender...");

			// Ensure MCP client is initialized
			if (!mcpClientService.isClientConnected()) {
				await mcpClientService.initialize(this.projectRoot);
			}

			// Load project context if not already loaded
			if (!mcpClientService.getProjectContext()) {
				await mcpClientService.loadProjectContext(this.projectRoot);
			}

			// Load context items for analysis
			await mcpClientService.loadContextItems({
				includePatterns: ["**/*.{ts,tsx,js,jsx,vue,svelte}"],
				excludePatterns: ["node_modules/**", "dist/**", ".git/**"],
				maxFileSize: 512 * 1024, // 512KB
			});

			this.isInitialized = true;
			logger.success("✅ AI Pattern Recommender initialized");
		} catch (error) {
			logger.error("Failed to initialize AI Pattern Recommender:", error);
			throw new Error(`Pattern Recommender initialization failed: ${error.message}`);
		}
	}

	/**
	 * Get intelligent pattern recommendations based on request and project context
	 */
	async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
		await this.ensureInitialized();

		try {
			logger.info(`🎯 Analyzing project for ${request.templateType} pattern recommendations...`);

			// Analyze project context
			const projectAnalysis = await this.analyzeProjectContext(request);
			
			// Get contextual factors
			const contextualFactors = await this.extractContextualFactors(request);
			
			// Generate recommendations using MCP intelligence
			const recommendations = await this.generateRecommendations(request, projectAnalysis, contextualFactors);
			
			// Assess risks and create implementation plan
			const riskAssessment = await this.assessRisks(recommendations[0], projectAnalysis);
			const implementationPlan = await this.createImplementationPlan(recommendations[0], projectAnalysis, request.budgetConstraints);

			const result: RecommendationResult = {
				primaryRecommendation: recommendations[0],
				alternativeRecommendations: recommendations.slice(1),
				projectAnalysis,
				contextualFactors,
				riskAssessment,
				implementationPlan,
			};

			logger.success(`✅ Generated ${recommendations.length} pattern recommendations`);
			return result;
		} catch (error) {
			logger.error("Failed to generate pattern recommendations:", error);
			throw new Error(`Pattern recommendation failed: ${error.message}`);
		}
	}

	/**
	 * Get layout-specific recommendations (grid vs list, etc.)
	 */
	async getLayoutRecommendations(
		contentType: string,
		dataCharacteristics: {
			itemCount: number;
			itemComplexity: "simple" | "medium" | "complex";
			updateFrequency: "static" | "occasional" | "frequent";
			interactionLevel: "view-only" | "interactive" | "highly-interactive";
		},
		constraints?: {
			screenSizes: string[];
			performanceRequirements: string[];
		}
	): Promise<LayoutPattern[]> {
		await this.ensureInitialized();

		try {
			logger.info("📐 Analyzing layout pattern requirements...");

			const projectContext = mcpClientService.getProjectContext();
			const contextItems = mcpClientService.getContextItems();

			// Analyze existing layouts in the project
			const existingLayouts = this.analyzeExistingLayouts(contextItems);
			
			// Generate layout-specific recommendations
			const layoutRecommendations: LayoutPattern[] = [];

			// Grid vs List analysis
			if (dataCharacteristics.itemCount > 50 && dataCharacteristics.itemComplexity === "simple") {
				layoutRecommendations.push(await this.createGridRecommendation(dataCharacteristics, existingLayouts));
			}

			if (dataCharacteristics.interactionLevel === "highly-interactive" || dataCharacteristics.itemComplexity === "complex") {
				layoutRecommendations.push(await this.createListRecommendation(dataCharacteristics, existingLayouts));
			}

			// Masonry for varied content
			if (contentType.includes("media") || contentType.includes("card")) {
				layoutRecommendations.push(await this.createMasonryRecommendation(dataCharacteristics));
			}

			// Sort by confidence
			layoutRecommendations.sort((a, b) => b.recommendation.confidence - a.recommendation.confidence);

			logger.success(`✅ Generated ${layoutRecommendations.length} layout recommendations`);
			return layoutRecommendations;
		} catch (error) {
			logger.error("Failed to generate layout recommendations:", error);
			throw error;
		}
	}

	/**
	 * Get component pattern recommendations
	 */
	async getComponentPatternRecommendations(
		componentDescription: string,
		requirements: {
			reusability: "low" | "medium" | "high";
			complexity: "simple" | "medium" | "complex";
			stateManagement: boolean;
			dataFlow: "static" | "dynamic" | "realtime";
		}
	): Promise<ComponentPattern[]> {
		await this.ensureInitialized();

		try {
			logger.info("🧩 Analyzing component pattern requirements...");

			const patterns: ComponentPattern[] = [];

			// Atomic design patterns
			if (requirements.reusability === "high" && requirements.complexity === "simple") {
				patterns.push(await this.createAtomicComponentPattern(componentDescription, requirements));
			}

			// Compound component patterns
			if (requirements.complexity === "complex" && requirements.stateManagement) {
				patterns.push(await this.createCompoundComponentPattern(componentDescription, requirements));
			}

			// Container/Presentational patterns
			if (requirements.dataFlow === "dynamic" || requirements.dataFlow === "realtime") {
				patterns.push(await this.createContainerComponentPattern(componentDescription, requirements));
			}

			// Sort by confidence and complexity
			patterns.sort((a, b) => {
				const confidenceDiff = b.recommendation.confidence - a.recommendation.confidence;
				if (confidenceDiff !== 0) return confidenceDiff;
				
				const complexityWeight = { low: 1, medium: 2, high: 3 };
				return complexityWeight[a.recommendation.estimatedComplexity] - complexityWeight[b.recommendation.estimatedComplexity];
			});

			logger.success(`✅ Generated ${patterns.length} component pattern recommendations`);
			return patterns;
		} catch (error) {
			logger.error("Failed to generate component pattern recommendations:", error);
			throw error;
		}
	}

	/**
	 * Analyze project context to understand structure and requirements
	 */
	private async analyzeProjectContext(request: RecommendationRequest): Promise<ProjectAnalysis> {
		const cacheKey = `${request.templateType}-${JSON.stringify(request.requirements || [])}`;
		
		if (this.analysisCache.has(cacheKey)) {
			return this.analysisCache.get(cacheKey)!;
		}

		const projectContext = mcpClientService.getProjectContext();
		const contextItems = mcpClientService.getContextItems();

		// Analyze project size and complexity
		const projectSize = this.determineProjectSize(contextItems);
		const complexity = this.determineProjectComplexity(contextItems, projectContext);
		
		// Estimate team size from git contributors (simplified)
		const teamSize = await this.estimateTeamSize();
		
		// Analyze timeline from package.json scripts and dependencies
		const timelineWeeks = this.estimateProjectTimeline(projectContext, contextItems);
		
		// Extract features and requirements from code analysis
		const mainFeatures = this.extractMainFeatures(contextItems);
		const technicalRequirements = this.extractTechnicalRequirements(projectContext, contextItems);
		const businessRequirements = this.extractBusinessRequirements(request, contextItems);
		const complianceRequirements = this.extractComplianceRequirements(contextItems);

		const analysis = ProjectAnalysisSchema.parse({
			projectSize,
			complexity,
			teamSize,
			timelineWeeks,
			mainFeatures,
			technicalRequirements,
			businessRequirements,
			complianceRequirements,
		});

		this.analysisCache.set(cacheKey, analysis);
		return analysis;
	}

	/**
	 * Extract contextual factors that influence pattern selection
	 */
	private async extractContextualFactors(request: RecommendationRequest): Promise<string[]> {
		const projectContext = mcpClientService.getProjectContext();
		const contextItems = mcpClientService.getContextItems();
		const factors: string[] = [];

		// Framework-specific factors
		if (projectContext?.framework) {
			factors.push(`Framework: ${projectContext.framework}`);
			
			// Framework-specific patterns
			switch (projectContext.framework) {
				case "next":
					factors.push("Server-side rendering capabilities", "App Router architecture");
					break;
				case "react":
					factors.push("Client-side rendering", "Component-based architecture");
					break;
				case "vue":
					factors.push("Progressive framework", "Composition API available");
					break;
				case "angular":
					factors.push("Enterprise framework", "Dependency injection system");
					break;
			}
		}

		// Language-specific factors
		if (projectContext?.language === "typescript") {
			factors.push("TypeScript type safety", "Advanced type system available");
		}

		// Existing patterns in codebase
		const existingPatterns = this.detectExistingPatterns(contextItems);
		factors.push(...existingPatterns.map(p => `Existing pattern: ${p}`));

		// UI library detection
		const uiLibraries = this.detectUILibraries(contextItems);
		factors.push(...uiLibraries.map(lib => `UI Library: ${lib}`));

		// State management detection
		const stateManagement = this.detectStateManagement(contextItems);
		if (stateManagement) {
			factors.push(`State Management: ${stateManagement}`);
		}

		// Testing setup
		const testingFrameworks = this.detectTestingFrameworks(contextItems);
		factors.push(...testingFrameworks.map(fw => `Testing: ${fw}`));

		// Styling approach
		const stylingApproach = this.detectStylingApproach(contextItems);
		if (stylingApproach) {
			factors.push(`Styling: ${stylingApproach}`);
		}

		return factors;
	}

	/**
	 * Generate pattern recommendations using AI analysis
	 */
	private async generateRecommendations(
		request: RecommendationRequest,
		analysis: ProjectAnalysis,
		contextualFactors: string[]
	): Promise<PatternRecommendation[]> {
		const recommendations: PatternRecommendation[] = [];

		// Use MCP to get intelligent recommendations
		try {
			const mcpClient = mcpClientService.getMCPClient();
			if (mcpClient) {
				const mcpRecommendations = await mcpClient.getRecommendations({
					type: request.templateType,
					projectAnalysis: analysis,
					contextualFactors,
					requirements: request.requirements,
					constraints: request.constraints,
				});

				// Convert MCP recommendations to our format
				if (mcpRecommendations?.recommendations) {
					for (const mcpRec of mcpRecommendations.recommendations) {
						recommendations.push(PatternRecommendationSchema.parse({
							patternId: mcpRec.id,
							patternName: mcpRec.name,
							confidence: mcpRec.confidence,
							reasoning: mcpRec.reasoning,
							applicableScenarios: mcpRec.scenarios || [],
							benefits: mcpRec.benefits || [],
							considerations: mcpRec.considerations || [],
							estimatedComplexity: mcpRec.complexity || "medium",
							estimatedTokenUsage: mcpRec.tokenEstimate,
							cost: mcpRec.cost,
						}));
					}
				}
			}
		} catch (error) {
			logger.warn("MCP recommendations failed, using fallback:", error);
		}

		// Fallback to rule-based recommendations if MCP fails
		if (recommendations.length === 0) {
			recommendations.push(...await this.getFallbackRecommendations(request, analysis, contextualFactors));
		}

		// Sort by confidence and complexity
		recommendations.sort((a, b) => {
			const confidenceDiff = b.confidence - a.confidence;
			if (confidenceDiff !== 0) return confidenceDiff;
			
			const complexityWeight = { low: 1, medium: 2, high: 3 };
			return complexityWeight[a.estimatedComplexity] - complexityWeight[b.estimatedComplexity];
		});

		return recommendations.slice(0, 5); // Top 5 recommendations
	}

	/**
	 * Assess risks for the recommended pattern
	 */
	private async assessRisks(
		recommendation: PatternRecommendation,
		analysis: ProjectAnalysis
	): Promise<{
		technical: string[];
		business: string[];
		compliance: string[];
	}> {
		const risks = {
			technical: [] as string[],
			business: [] as string[],
			compliance: [] as string[],
		};

		// Technical risks
		if (recommendation.estimatedComplexity === "high") {
			risks.technical.push("High implementation complexity may lead to development delays");
			risks.technical.push("Requires experienced developers familiar with the pattern");
		}

		if (analysis.teamSize < 3 && recommendation.estimatedComplexity === "high") {
			risks.technical.push("Small team may struggle with complex pattern implementation");
		}

		// Business risks
		if (recommendation.estimatedTokenUsage && recommendation.estimatedTokenUsage > 10000) {
			risks.business.push("High token usage may exceed budget constraints");
		}

		if (analysis.timelineWeeks < 4 && recommendation.estimatedComplexity !== "low") {
			risks.business.push("Tight timeline may not allow for proper pattern implementation");
		}

		// Compliance risks
		if (analysis.complianceRequirements.includes("norwegian") && !recommendation.considerations.some(c => c.includes("norwegian"))) {
			risks.compliance.push("Pattern may not fully address Norwegian compliance requirements");
		}

		if (analysis.complianceRequirements.includes("accessibility") && !recommendation.benefits.some(b => b.includes("accessibility"))) {
			risks.compliance.push("Pattern may not inherently support accessibility requirements");
		}

		return risks;
	}

	/**
	 * Create implementation plan with phases and estimates
	 */
	private async createImplementationPlan(
		recommendation: PatternRecommendation,
		analysis: ProjectAnalysis,
		budgetConstraints?: RecommendationRequest["budgetConstraints"]
	): Promise<RecommendationResult["implementationPlan"]> {
		const phases: Array<{
			name: string;
			duration: number;
			complexity: "low" | "medium" | "high";
			tokenEstimate: number;
		}> = [];

		// Phase 1: Setup and Foundation
		phases.push({
			name: "Setup and Foundation",
			duration: 1,
			complexity: "low",
			tokenEstimate: Math.ceil((recommendation.estimatedTokenUsage || 1000) * 0.2),
		});

		// Phase 2: Core Implementation
		phases.push({
			name: "Core Implementation",
			duration: recommendation.estimatedComplexity === "high" ? 3 : recommendation.estimatedComplexity === "medium" ? 2 : 1,
			complexity: recommendation.estimatedComplexity,
			tokenEstimate: Math.ceil((recommendation.estimatedTokenUsage || 1000) * 0.5),
		});

		// Phase 3: Integration and Testing
		phases.push({
			name: "Integration and Testing",
			duration: 1,
			complexity: "medium",
			tokenEstimate: Math.ceil((recommendation.estimatedTokenUsage || 1000) * 0.2),
		});

		// Phase 4: Documentation and Optimization
		phases.push({
			name: "Documentation and Optimization",
			duration: 1,
			complexity: "low",
			tokenEstimate: Math.ceil((recommendation.estimatedTokenUsage || 1000) * 0.1),
		});

		// Adjust phases based on budget constraints
		if (budgetConstraints?.maxTokens) {
			const totalTokens = phases.reduce((sum, phase) => sum + phase.tokenEstimate, 0);
			if (totalTokens > budgetConstraints.maxTokens) {
				// Scale down token estimates proportionally
				const scaleFactor = budgetConstraints.maxTokens / totalTokens;
				phases.forEach(phase => {
					phase.tokenEstimate = Math.ceil(phase.tokenEstimate * scaleFactor);
				});
			}
		}

		if (budgetConstraints?.timeline) {
			const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
			if (totalDuration > budgetConstraints.timeline) {
				// Compress phases or suggest alternative approach
				const compressionFactor = budgetConstraints.timeline / totalDuration;
				phases.forEach(phase => {
					phase.duration = Math.max(1, Math.ceil(phase.duration * compressionFactor));
				});
			}
		}

		const totalEstimate = {
			tokens: phases.reduce((sum, phase) => sum + phase.tokenEstimate, 0),
			cost: recommendation.cost?.development || 0,
			timeWeeks: phases.reduce((sum, phase) => sum + phase.duration, 0),
		};

		return {
			phases,
			totalEstimate,
		};
	}

	// Utility methods for pattern analysis
	
	private determineProjectSize(contextItems: ContextItem[]): ProjectAnalysis["projectSize"] {
		const fileCount = contextItems.length;
		const totalSize = contextItems.reduce((sum, item) => sum + (item.size || 0), 0);
		
		if (fileCount < 20 && totalSize < 1024 * 1024) return "small";
		if (fileCount < 100 && totalSize < 10 * 1024 * 1024) return "medium";
		if (fileCount < 500 && totalSize < 50 * 1024 * 1024) return "large";
		return "enterprise";
	}

	private determineProjectComplexity(contextItems: ContextItem[], projectContext?: ProjectContext): ProjectAnalysis["complexity"] {
		let complexityScore = 0;
		
		// Framework complexity
		const framework = projectContext?.framework;
		if (framework === "angular" || framework === "next") complexityScore += 2;
		else if (framework === "react" || framework === "vue") complexityScore += 1;
		
		// File structure complexity
		const directories = new Set(contextItems.map(item => item.path.split('/')[0]));
		complexityScore += Math.min(directories.size / 5, 3);
		
		// Code complexity indicators
		const complexPatterns = ['async', 'await', 'Promise', 'Observable', 'Redux', 'Context'];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		complexityScore += complexPatterns.filter(pattern => codeContent.includes(pattern)).length / 2;
		
		if (complexityScore < 2) return "simple";
		if (complexityScore < 4) return "moderate";
		if (complexityScore < 6) return "complex";
		return "very-complex";
	}

	private async estimateTeamSize(): Promise<number> {
		// Simplified team size estimation
		// In real implementation, could analyze git contributors
		return 3; // Default assumption
	}

	private estimateProjectTimeline(projectContext?: ProjectContext, contextItems?: ContextItem[]): number {
		// Simplified timeline estimation based on project size and complexity
		const fileCount = contextItems?.length || 0;
		if (fileCount < 20) return 2;
		if (fileCount < 100) return 6;
		if (fileCount < 500) return 12;
		return 24;
	}

	private extractMainFeatures(contextItems: ContextItem[]): string[] {
		const features: string[] = [];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		// Feature detection based on code patterns
		if (codeContent.includes('auth') || codeContent.includes('login')) features.push('Authentication');
		if (codeContent.includes('database') || codeContent.includes('prisma') || codeContent.includes('mongoose')) features.push('Database Integration');
		if (codeContent.includes('api') || codeContent.includes('fetch') || codeContent.includes('axios')) features.push('API Integration');
		if (codeContent.includes('form') || codeContent.includes('input')) features.push('Forms');
		if (codeContent.includes('chart') || codeContent.includes('graph')) features.push('Data Visualization');
		if (codeContent.includes('socket') || codeContent.includes('websocket')) features.push('Real-time Communication');
		
		return features;
	}

	private extractTechnicalRequirements(projectContext?: ProjectContext, contextItems?: ContextItem[]): string[] {
		const requirements: string[] = [];
		
		if (projectContext?.language === 'typescript') requirements.push('TypeScript Support');
		if (projectContext?.framework) requirements.push(`${projectContext.framework} Framework`);
		
		const codeContent = contextItems?.map(item => item.content || '').join(' ') || '';
		if (codeContent.includes('test') || codeContent.includes('jest') || codeContent.includes('vitest')) {
			requirements.push('Testing Framework');
		}
		if (codeContent.includes('storybook')) requirements.push('Component Documentation');
		
		return requirements;
	}

	private extractBusinessRequirements(request: RecommendationRequest, contextItems: ContextItem[]): string[] {
		const requirements: string[] = [];
		
		// Extract from request
		if (request.requirements) {
			requirements.push(...request.requirements);
		}
		
		// Infer from code
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		if (codeContent.includes('payment') || codeContent.includes('stripe')) requirements.push('Payment Processing');
		if (codeContent.includes('email') || codeContent.includes('notification')) requirements.push('Communication');
		if (codeContent.includes('admin') || codeContent.includes('dashboard')) requirements.push('Administrative Interface');
		
		return requirements;
	}

	private extractComplianceRequirements(contextItems: ContextItem[]): string[] {
		const requirements: string[] = [];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('aria') || codeContent.includes('accessibility')) requirements.push('accessibility');
		if (codeContent.includes('gdpr') || codeContent.includes('privacy')) requirements.push('gdpr');
		if (codeContent.includes('norwegian') || codeContent.includes('nb-NO')) requirements.push('norwegian');
		
		return requirements;
	}

	private detectExistingPatterns(contextItems: ContextItem[]): string[] {
		const patterns: string[] = [];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('useContext') || codeContent.includes('createContext')) patterns.push('Context Pattern');
		if (codeContent.includes('HOC') || codeContent.includes('withAuth')) patterns.push('Higher-Order Component');
		if (codeContent.includes('render props') || codeContent.includes('children as function')) patterns.push('Render Props');
		if (codeContent.includes('compound component')) patterns.push('Compound Component');
		
		return patterns;
	}

	private detectUILibraries(contextItems: ContextItem[]): string[] {
		const libraries: string[] = [];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('tailwind') || codeContent.includes('tw-')) libraries.push('Tailwind CSS');
		if (codeContent.includes('material-ui') || codeContent.includes('@mui')) libraries.push('Material-UI');
		if (codeContent.includes('ant-design') || codeContent.includes('antd')) libraries.push('Ant Design');
		if (codeContent.includes('chakra-ui')) libraries.push('Chakra UI');
		if (codeContent.includes('@xala-technologies/ui-system')) libraries.push('Xala UI System');
		
		return libraries;
	}

	private detectStateManagement(contextItems: ContextItem[]): string | null {
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('redux') || codeContent.includes('@reduxjs')) return 'Redux';
		if (codeContent.includes('zustand')) return 'Zustand';
		if (codeContent.includes('jotai')) return 'Jotai';
		if (codeContent.includes('recoil')) return 'Recoil';
		if (codeContent.includes('useContext') && codeContent.includes('useReducer')) return 'Context + Reducer';
		
		return null;
	}

	private detectTestingFrameworks(contextItems: ContextItem[]): string[] {
		const frameworks: string[] = [];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('jest')) frameworks.push('Jest');
		if (codeContent.includes('vitest')) frameworks.push('Vitest');
		if (codeContent.includes('@testing-library')) frameworks.push('Testing Library');
		if (codeContent.includes('cypress')) frameworks.push('Cypress');
		if (codeContent.includes('playwright')) frameworks.push('Playwright');
		
		return frameworks;
	}

	private detectStylingApproach(contextItems: ContextItem[]): string | null {
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('styled-components')) return 'Styled Components';
		if (codeContent.includes('emotion')) return 'Emotion';
		if (codeContent.includes('tailwind') || codeContent.includes('tw-')) return 'Tailwind CSS';
		if (codeContent.includes('.module.css') || codeContent.includes('styles.')) return 'CSS Modules';
		
		return null;
	}

	// Layout pattern creation methods
	
	private async createGridRecommendation(
		dataCharacteristics: any,
		existingLayouts: string[]
	): Promise<LayoutPattern> {
		return LayoutPatternSchema.parse({
			layoutType: "grid",
			recommendation: {
				patternId: "responsive-grid",
				patternName: "Responsive Grid Layout",
				confidence: 0.9,
				reasoning: "Grid layout is optimal for large datasets with simple items",
				applicableScenarios: ["Product catalogs", "Image galleries", "Card listings"],
				benefits: ["Efficient space usage", "Good performance", "Responsive design"],
				considerations: ["Item size consistency", "Loading states", "Accessibility"],
				estimatedComplexity: "low",
				estimatedTokenUsage: 2500,
				cost: { development: 500, maintenance: 100, tokens: 2500 },
			},
			contextFactors: [`${dataCharacteristics.itemCount} items`, "Simple item complexity"],
			adaptiveFeatures: ["Auto-fit columns", "Responsive breakpoints", "Virtual scrolling"],
		});
	}

	private async createListRecommendation(
		dataCharacteristics: any,
		existingLayouts: string[]
	): Promise<LayoutPattern> {
		return LayoutPatternSchema.parse({
			layoutType: "list",
			recommendation: {
				patternId: "interactive-list",
				patternName: "Interactive List Layout",
				confidence: 0.85,
				reasoning: "List layout provides better interaction patterns for complex items",
				applicableScenarios: ["Data tables", "Complex cards", "Interactive elements"],
				benefits: ["Better accessibility", "Rich interactions", "Detailed information display"],
				considerations: ["Performance with large datasets", "Mobile optimization"],
				estimatedComplexity: "medium",
				estimatedTokenUsage: 3500,
				cost: { development: 750, maintenance: 150, tokens: 3500 },
			},
			contextFactors: ["High interaction level", "Complex item structure"],
			adaptiveFeatures: ["Sortable items", "Filtering", "Pagination", "Selection"],
		});
	}

	private async createMasonryRecommendation(dataCharacteristics: any): Promise<LayoutPattern> {
		return LayoutPatternSchema.parse({
			layoutType: "masonry",
			recommendation: {
				patternId: "masonry-layout",
				patternName: "Masonry Layout",
				confidence: 0.75,
				reasoning: "Masonry layout handles varied content sizes efficiently",
				applicableScenarios: ["Media galleries", "Blog posts", "Mixed content"],
				benefits: ["Dynamic height handling", "Visual appeal", "Space optimization"],
				considerations: ["Implementation complexity", "Performance optimization"],
				estimatedComplexity: "high",
				estimatedTokenUsage: 4500,
				cost: { development: 1000, maintenance: 200, tokens: 4500 },
			},
			contextFactors: ["Variable content sizes", "Media-rich content"],
			adaptiveFeatures: ["Auto-arrange", "Responsive columns", "Lazy loading"],
		});
	}

	// Component pattern creation methods
	
	private async createAtomicComponentPattern(
		description: string,
		requirements: any
	): Promise<ComponentPattern> {
		return ComponentPatternSchema.parse({
			componentType: "atomic",
			designPattern: "atomic",
			recommendation: {
				patternId: "atomic-component",
				patternName: "Atomic Design Component",
				confidence: 0.9,
				reasoning: "Atomic pattern promotes reusability and consistency",
				applicableScenarios: ["UI libraries", "Design systems", "Reusable components"],
				benefits: ["High reusability", "Consistent design", "Easy testing"],
				considerations: ["Over-abstraction risk", "Learning curve"],
				estimatedComplexity: "low",
				estimatedTokenUsage: 2000,
			},
			stateManagement: "local",
			dataFlow: "props",
		});
	}

	private async createCompoundComponentPattern(
		description: string,
		requirements: any
	): Promise<ComponentPattern> {
		return ComponentPatternSchema.parse({
			componentType: "compound",
			designPattern: "compound",
			recommendation: {
				patternId: "compound-component",
				patternName: "Compound Component Pattern",
				confidence: 0.8,
				reasoning: "Compound pattern handles complex component composition well",
				applicableScenarios: ["Modal dialogs", "Form builders", "Complex widgets"],
				benefits: ["Flexible composition", "Clean API", "Maintainable structure"],
				considerations: ["Higher complexity", "Context dependencies"],
				estimatedComplexity: "high",
				estimatedTokenUsage: 5000,
			},
			stateManagement: "context",
			dataFlow: "context",
		});
	}

	private async createContainerComponentPattern(
		description: string,
		requirements: any
	): Promise<ComponentPattern> {
		return ComponentPatternSchema.parse({
			componentType: "container",
			designPattern: "container",
			recommendation: {
				patternId: "container-component",
				patternName: "Container/Presentational Pattern",
				confidence: 0.85,
				reasoning: "Separation of concerns for data and presentation",
				applicableScenarios: ["Data-driven components", "API integration", "State management"],
				benefits: ["Clear separation", "Testable logic", "Reusable presentations"],
				considerations: ["Additional abstraction", "Props drilling"],
				estimatedComplexity: "medium",
				estimatedTokenUsage: 3500,
			},
			stateManagement: "context",
			dataFlow: "hooks",
		});
	}

	private analyzeExistingLayouts(contextItems: ContextItem[]): string[] {
		const layouts: string[] = [];
		const codeContent = contextItems.map(item => item.content || '').join(' ');
		
		if (codeContent.includes('grid') || codeContent.includes('grid-cols')) layouts.push('Grid');
		if (codeContent.includes('flex') || codeContent.includes('flexbox')) layouts.push('Flexbox');
		if (codeContent.includes('masonry')) layouts.push('Masonry');
		
		return layouts;
	}

	private async getFallbackRecommendations(
		request: RecommendationRequest,
		analysis: ProjectAnalysis,
		contextualFactors: string[]
	): Promise<PatternRecommendation[]> {
		// Fallback rule-based recommendations
		const fallbackRecommendations: PatternRecommendation[] = [];

		// Simple fallback logic based on template type
		switch (request.templateType) {
			case "component":
				fallbackRecommendations.push({
					patternId: "functional-component",
					patternName: "Functional Component with Hooks",
					confidence: 0.7,
					reasoning: "Standard React functional component pattern",
					applicableScenarios: ["Most React components"],
					benefits: ["Simple", "Modern", "Testable"],
					considerations: ["State management", "Performance"],
					estimatedComplexity: "low",
					estimatedTokenUsage: 2000,
				});
				break;
			case "layout":
				fallbackRecommendations.push({
					patternId: "responsive-layout",
					patternName: "Responsive Layout Pattern",
					confidence: 0.7,
					reasoning: "Standard responsive layout approach",
					applicableScenarios: ["Web applications"],
					benefits: ["Mobile-friendly", "Flexible", "Standard"],
					considerations: ["Browser support", "Complexity"],
					estimatedComplexity: "medium",
					estimatedTokenUsage: 3000,
				});
				break;
			default:
				fallbackRecommendations.push({
					patternId: "standard-pattern",
					patternName: "Standard Implementation Pattern",
					confidence: 0.6,
					reasoning: "Default implementation approach",
					applicableScenarios: ["General use cases"],
					benefits: ["Simple", "Reliable"],
					considerations: ["May not be optimal"],
					estimatedComplexity: "medium",
					estimatedTokenUsage: 2500,
				});
		}

		return fallbackRecommendations;
	}

	private initializePatternDatabase(): void {
		// Initialize pattern database with common patterns
		// This would be loaded from a more comprehensive database in production
		
		const componentPatterns: PatternRecommendation[] = [
			{
				patternId: "functional-hooks",
				patternName: "Functional Component with Hooks",
				confidence: 0.9,
				reasoning: "Modern React standard with excellent performance",
				applicableScenarios: ["Most React components", "State management", "Side effects"],
				benefits: ["Simple", "Performant", "Testable", "Modern"],
				considerations: ["Hook rules", "Re-rendering optimization"],
				estimatedComplexity: "low",
				estimatedTokenUsage: 2000,
			},
			{
				patternId: "compound-component",
				patternName: "Compound Component Pattern",
				confidence: 0.8,
				reasoning: "Excellent for complex, configurable components",
				applicableScenarios: ["Modal dialogs", "Form builders", "Complex widgets"],
				benefits: ["Flexible API", "Composable", "Maintainable"],
				considerations: ["Context complexity", "Learning curve"],
				estimatedComplexity: "high",
				estimatedTokenUsage: 5000,
			},
		];

		this.patternDatabase.set("component", componentPatterns);
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize();
		}
	}
}

/**
 * Create singleton pattern recommender instance
 */
export const aiPatternRecommender = new AIPatternRecommender();