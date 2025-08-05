/**
 * @fileoverview AI-Generate Command - EPIC 13 Story 13.5 Integration
 * @description Command interface for the AI-Native Template System
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { Command } from "commander";
import { z } from "zod";
import { logger } from "../utils/logger.js";
import { aiNativeTemplateSystem, type AITemplateRequest, type AITemplateResult } from "../services/ai/ai-native-template-system.js";
import { writeFile } from "fs/promises";
import { join, dirname } from "path";
import { mkdirSync } from "fs";

// Command options schema
const AIGenerateOptionsSchema = z.object({
	name: z.string(),
	type: z.enum(["component", "layout", "page", "service", "form", "data-table", "navigation"]),
	description: z.string().optional(),
	platform: z.enum(["react", "nextjs", "vue", "angular", "svelte", "electron", "react-native"]).default("react"),
	features: z.array(z.string()).optional(),
	accessibility: z.enum(["A", "AA", "AAA"]).default("AA"),
	norwegian: z.boolean().default(false),
	budget: z.number().optional(),
	maxTokens: z.number().optional(),
	teamSize: z.number().default(3),
	expertise: z.enum(["junior", "mid", "senior", "mixed"]).default("mid"),
	risk: z.enum(["low", "medium", "high"]).default("medium"),
	innovation: z.enum(["conservative", "balanced", "cutting-edge"]).default("balanced"),
	output: z.string().optional(),
	dryRun: z.boolean().default(false),
	verbose: z.boolean().default(false),
	compare: z.boolean().default(false),
	optimize: z.boolean().default(true),
	analyze: z.boolean().default(true),
});

type AIGenerateOptions = z.infer<typeof AIGenerateOptionsSchema>;

/**
 * AI Generate command implementation
 */
export class AIGenerateCommand {
	private readonly command: Command;

	constructor() {
		this.command = new Command("ai-generate")
			.alias("aig")
			.description("Generate templates with comprehensive AI intelligence")
			.argument("<name>", "Name of the template to generate")
			.option("-t, --type <type>", "Template type", "component")
			.option("-d, --description <desc>", "Template description")
			.option("-p, --platform <platform>", "Target platform", "react")
			.option("-f, --features <features...>", "Features to include")
			.option("-a, --accessibility <level>", "Accessibility level", "AA")
			.option("--norwegian", "Enable Norwegian compliance", false)
			.option("-b, --budget <amount>", "Budget limit in USD")
			.option("--max-tokens <tokens>", "Maximum tokens limit")
			.option("--team-size <size>", "Team size", "3")
			.option("--expertise <level>", "Team expertise level", "mid")
			.option("--risk <tolerance>", "Risk tolerance", "medium")
			.option("--innovation <focus>", "Innovation focus", "balanced")
			.option("-o, --output <dir>", "Output directory")
			.option("--dry-run", "Preview without generating files", false)
			.option("-v, --verbose", "Verbose output", false)
			.option("--compare", "Compare multiple approaches", false)
			.option("--no-optimize", "Disable automatic optimizations")
			.option("--no-analyze", "Skip analysis phase")
			.action(this.execute.bind(this));
	}

	/**
	 * Execute the AI generate command
	 */
	async execute(name: string, options: Record<string, any>): Promise<void> {
		try {
			// Parse and validate options
			const validatedOptions = this.parseOptions(name, options);
			
			if (validatedOptions.verbose) {
				logger.info("🤖 Starting AI-Native Template Generation...");
				logger.info(`Template: ${validatedOptions.name} (${validatedOptions.type})`);
				logger.info(`Platform: ${validatedOptions.platform}`);
				logger.info(`Features: ${validatedOptions.features?.join(", ") || "None"}`);
			}

			// Initialize AI Template System
			await aiNativeTemplateSystem.initialize();

			if (validatedOptions.compare) {
				await this.executeComparison(validatedOptions);
			} else {
				await this.executeSingleGeneration(validatedOptions);
			}

		} catch (error) {
			logger.error("AI generation failed:", error);
			process.exit(1);
		}
	}

	/**
	 * Execute single template generation
	 */
	private async executeSingleGeneration(options: AIGenerateOptions): Promise<void> {
		// Build AI template request
		const request: AITemplateRequest = {
			name: options.name,
			type: options.type,
			description: options.description,
			platform: options.platform,
			features: options.features,
			budgetConstraints: {
				maxCost: options.budget,
				maxTokens: options.maxTokens,
			},
			qualityStandards: {
				accessibility: options.accessibility,
				norwegianCompliance: options.norwegian,
				codeQualityThreshold: 80,
			},
			organizationalContext: {
				teamSize: options.teamSize,
				expertiseLevel: options.expertise,
				riskTolerance: options.risk,
				innovationFocus: options.innovation,
			},
		};

		if (options.dryRun) {
			await this.previewGeneration(request);
			return;
		}

		// Generate template
		const startTime = Date.now();
		const result = await aiNativeTemplateSystem.generateTemplate(request);
		const duration = Date.now() - startTime;

		// Display results
		await this.displayResults(result, duration, options);

		// Write files if not dry run
		if (!options.dryRun) {
			await this.writeGeneratedFiles(result, options);
		}

		// Generate optimization roadmap if requested
		if (options.analyze && options.verbose) {
			await this.displayOptimizationRoadmap(result);
		}
	}

	/**
	 * Execute comparison between multiple approaches
	 */
	private async executeComparison(options: AIGenerateOptions): Promise<void> {
		logger.info("🔍 Comparing multiple template approaches...");

		const baseRequest: AITemplateRequest = {
			name: options.name,
			type: options.type,
			description: options.description,
			platform: options.platform,
			features: options.features,
			qualityStandards: {
				accessibility: options.accessibility,
				norwegianCompliance: options.norwegian,
				codeQualityThreshold: 80,
			},
			organizationalContext: {
				teamSize: options.teamSize,
				expertiseLevel: options.expertise,
				riskTolerance: options.risk,
				innovationFocus: options.innovation,
			},
		};

		// Define variations to compare
		const variations = [
			{
				name: "Cost-Optimized",
				modifications: {
					budgetConstraints: { maxCost: 10, maxTokens: 5000 },
					organizationalContext: { ...baseRequest.organizationalContext, riskTolerance: "low" as const },
				},
			},
			{
				name: "Performance-Focused",
				modifications: {
					features: [...(options.features || []), "performance-optimized", "lazy-loading"],
					qualityStandards: { ...baseRequest.qualityStandards, codeQualityThreshold: 90 },
				},
			},
			{
				name: "Innovation-Driven",
				modifications: {
					organizationalContext: { ...baseRequest.organizationalContext, innovationFocus: "cutting-edge" as const },
					features: [...(options.features || []), "experimental-features", "ai-enhanced"],
				},
			},
		];

		const comparison = await aiNativeTemplateSystem.compareTemplateApproaches(baseRequest, variations);

		// Display comparison results
		this.displayComparisonResults(comparison, options);
	}

	/**
	 * Preview generation without actual file creation
	 */
	private async previewGeneration(request: AITemplateRequest): Promise<void> {
		logger.info("👀 Previewing AI template generation...");
		
		console.log("\n📋 Generation Preview:");
		console.log(`  Template Name: ${request.name}`);
		console.log(`  Type: ${request.type}`);
		console.log(`  Platform: ${request.platform}`);
		console.log(`  Features: ${request.features?.join(", ") || "Default"}`);
		console.log(`  Quality Standards:`);
		console.log(`    - Accessibility: ${request.qualityStandards.accessibility}`);
		console.log(`    - Norwegian Compliance: ${request.qualityStandards.norwegianCompliance ? "Yes" : "No"}`);
		console.log(`  Budget Constraints:`);
		console.log(`    - Max Cost: ${request.budgetConstraints?.maxCost ? "$" + request.budgetConstraints.maxCost : "No limit"}`);
		console.log(`    - Max Tokens: ${request.budgetConstraints?.maxTokens || "No limit"}`);
		
		console.log("\n🎯 Expected Analysis:");
		console.log("  ✓ Pattern recommendations with MCP intelligence");
		console.log("  ✓ Token usage estimation and cost analysis");
		console.log("  ✓ Quality assurance with accessibility checks");
		console.log("  ✓ Performance optimization suggestions");
		console.log("  ✓ Norwegian compliance validation");
		console.log("  ✓ Automatic code optimizations");
		
		console.log("\n📁 Expected Files:");
		console.log(`  - src/components/${request.name}.tsx`);
		console.log(`  - src/types/${request.name}.types.ts`);
		console.log(`  - src/components/__tests__/${request.name}.test.tsx`);
		console.log(`  - src/components/${request.name}.stories.tsx`);
		
		logger.info("Preview complete. Use --no-dry-run to generate actual files.");
	}

	/**
	 * Display generation results
	 */
	private async displayResults(result: AITemplateResult, duration: number, options: AIGenerateOptions): Promise<void> {
		console.log("\n🎉 AI Template Generation Complete!");
		console.log(`⏱️  Generation Time: ${(duration / 1000).toFixed(1)}s`);
		console.log(`💰 Cost: $${result.metadata.actualCost.toFixed(4)}`);
		console.log(`🎯 Tokens Used: ${result.metadata.tokensUsed.toLocaleString()}`);
		console.log(`📊 Quality Score: ${result.aiAnalysis.qualityAssurance.overallScore}/100`);
		console.log(`🚀 Performance Score: ${result.aiAnalysis.performanceAnalysis.overallScore}/100`);
		console.log(`🤖 AI Confidence: ${Math.round(result.insights.confidence * 100)}%`);

		console.log("\n📁 Generated Files:");
		for (const file of result.generatedFiles) {
			console.log(`  ✓ ${file.path} (${Math.round(file.size / 1024)}KB)`);
		}

		if (result.optimizations.appliedAutomatically.length > 0) {
			console.log("\n🔧 Automatic Optimizations Applied:");
			for (const optimization of result.optimizations.appliedAutomatically) {
				console.log(`  ✓ ${optimization}`);
			}
		}

		if (result.optimizations.suggestedManual.length > 0) {
			console.log("\n💡 Manual Optimization Suggestions:");
			for (const suggestion of result.optimizations.suggestedManual.slice(0, 5)) {
				console.log(`  • ${suggestion}`);
			}
		}

		if (options.verbose) {
			console.log("\n📈 Detailed Analysis:");
			console.log(`  Pattern: ${result.aiAnalysis.patternRecommendation.primaryRecommendation.patternName}`);
			console.log(`  Reasoning: ${result.aiAnalysis.patternRecommendation.primaryRecommendation.reasoning}`);
			console.log(`  Risk Assessment: ${result.insights.riskAssessment}`);
		}

		console.log("\n🚀 Next Steps:");
		for (const step of result.insights.nextSteps) {
			console.log(`  1. ${step}`);
		}
	}

	/**
	 * Display comparison results
	 */
	private displayComparisonResults(comparison: any, options: AIGenerateOptions): void {
		console.log("\n📊 Template Approach Comparison:");
		console.log(`Best Overall: ${comparison.bestApproach}\n`);

		for (const comp of comparison.comparison) {
			console.log(`${comp.approach}:`);
			console.log(`  Quality Score: ${comp.result.aiAnalysis.qualityAssurance.overallScore}/100`);
			console.log(`  Cost: $${comp.result.metadata.actualCost.toFixed(4)}`);
			console.log(`  Confidence: ${Math.round(comp.result.insights.confidence * 100)}%`);
			console.log(`  Recommendation: ${comp.recommendation.toUpperCase()}`);
			
			if (comp.pros.length > 0) {
				console.log(`  Pros: ${comp.pros.join(", ")}`);
			}
			if (comp.cons.length > 0) {
				console.log(`  Cons: ${comp.cons.join(", ")}`);
			}
			console.log("");
		}

		console.log("📈 Decision Matrix:");
		for (const criterion of comparison.decisionMatrix) {
			console.log(`  ${criterion.criteria} (weight: ${(criterion.weight * 100).toFixed(0)}%):`);
			for (const [approach, score] of Object.entries(criterion.scores)) {
				console.log(`    ${approach}: ${(score as number).toFixed(1)}`);
			}
		}
	}

	/**
	 * Display optimization roadmap
	 */
	private async displayOptimizationRoadmap(result: AITemplateResult): Promise<void> {
		const roadmap = await aiNativeTemplateSystem.generateOptimizationRoadmap(result);
		
		console.log("\n🗺️  Optimization Roadmap:");
		console.log(`Total Time: ${roadmap.totalEstimatedTime}`);
		console.log(`Expected ROI: ${roadmap.expectedROI}`);
		console.log(`Risk: ${roadmap.riskAssessment}\n`);

		for (const phase of roadmap.phases) {
			console.log(`${phase.name} (${phase.duration}):`);
			console.log(`  Priority: ${phase.priority.toUpperCase()}`);
			console.log(`  Expected Gains: ${phase.expectedGains}`);
			if (phase.optimizations.length > 0) {
				console.log(`  Optimizations:`);
				for (const opt of phase.optimizations.slice(0, 3)) {
					console.log(`    • ${opt}`);
				}
			}
			console.log("");
		}
	}

	/**
	 * Write generated files to disk
	 */
	private async writeGeneratedFiles(result: AITemplateResult, options: AIGenerateOptions): Promise<void> {
		const outputDir = options.output || process.cwd();
		
		logger.info(`📝 Writing ${result.generatedFiles.length} files to ${outputDir}...`);

		for (const file of result.generatedFiles) {
			const fullPath = join(outputDir, file.path);
			const dir = dirname(fullPath);
			
			// Ensure directory exists
			mkdirSync(dir, { recursive: true });
			
			// Write file
			await writeFile(fullPath, file.content, "utf-8");
			
			if (options.verbose) {
				console.log(`  ✓ ${file.path}`);
			}
		}

		// Write analysis report
		const reportPath = join(outputDir, ".xaheen", "generation-report.json");
		mkdirSync(dirname(reportPath), { recursive: true });
		await writeFile(reportPath, JSON.stringify(result, null, 2), "utf-8");

		logger.success(`✅ All files written successfully!`);
		logger.info(`📊 Generation report saved: ${reportPath}`);
	}

	/**
	 * Parse and validate command options
	 */
	private parseOptions(name: string, options: Record<string, any>): AIGenerateOptions {
		try {
			// Convert commander options to our schema format
			const parsedOptions = {
				name,
				type: options.type || "component",
				description: options.description,
				platform: options.platform || "react",
				features: options.features,
				accessibility: options.accessibility || "AA",
				norwegian: options.norwegian || false,
				budget: options.budget ? parseFloat(options.budget) : undefined,
				maxTokens: options.maxTokens ? parseInt(options.maxTokens) : undefined,
				teamSize: parseInt(options.teamSize) || 3,
				expertise: options.expertise || "mid",
				risk: options.risk || "medium",
				innovation: options.innovation || "balanced",
				output: options.output,
				dryRun: options.dryRun || false,
				verbose: options.verbose || false,
				compare: options.compare || false,
				optimize: options.optimize !== false,
				analyze: options.analyze !== false,
			};

			return AIGenerateOptionsSchema.parse(parsedOptions);
		} catch (error) {
			if (error instanceof z.ZodError) {
				logger.error("Invalid options provided:");
				for (const issue of error.issues) {
					logger.error(`  ${issue.path.join(".")}: ${issue.message}`);
				}
			}
			throw new Error("Failed to parse command options");
		}
	}

	/**
	 * Get the Commander command instance
	 */
	getCommand(): Command {
		return this.command;
	}
}

/**
 * Create and export the AI generate command
 */
export const aiGenerateCommand = new AIGenerateCommand();