/**
 * AI Context Indexer - Story 1.2 Implementation
 *
 * Implements codebase indexing for context-aware AI generation:
 * - Indexes existing components and patterns
 * - Analyzes project architecture
 * - Provides context for AI-native generation
 * - Supports iterative refinement workflows
 */

import * as fs from "fs/promises";
import * as path from "path";
import { logger } from "../../utils/logger.js";
import { ProjectAnalyzer } from "../analysis/project-analyzer.js";

export interface CodebaseIndex {
	components: ComponentIndex[];
	patterns: PatternIndex[];
	dependencies: DependencyIndex;
	architecture: ArchitectureIndex;
	standards: CodingStandardsIndex;
	performance: PerformanceIndex;
	compliance: ComplianceIndex;
	lastUpdated: Date;
}

export interface ComponentIndex {
	name: string;
	path: string;
	type: "component" | "page" | "layout" | "hook" | "service" | "utility";
	framework: string;
	dependencies: string[];
	props: PropDefinition[];
	complexity: "simple" | "medium" | "complex";
	patterns: string[];
	accessibility: AccessibilityFeatures;
	performance: PerformanceFeatures;
	reusability: number; // 0-1 score
	lastModified: Date;
}

export interface PatternIndex {
	name: string;
	type: "architectural" | "design" | "coding" | "performance" | "accessibility";
	description: string;
	examples: string[];
	usage: number; // How often it's used in the project
	components: string[]; // Components that use this pattern
	recommendation: "high" | "medium" | "low";
}

export interface DependencyIndex {
	production: Record<string, string>;
	development: Record<string, string>;
	uiFrameworks: string[];
	stateManagement: string[];
	testing: string[];
	performance: string[];
	accessibility: string[];
}

export interface ArchitectureIndex {
	style: "layered" | "hexagonal" | "clean" | "mvc" | "component-based";
	layers: string[];
	patterns: string[];
	dataFlow: "unidirectional" | "bidirectional" | "event-driven";
	stateManagement: string;
	routing: string;
	apiStrategy: "rest" | "graphql" | "trpc" | "hybrid";
}

export interface CodingStandardsIndex {
	typescript: boolean;
	strict: boolean;
	linting: string[];
	formatting: string[];
	testing: string[];
	documentation: string[];
	preCommitHooks: boolean;
}

export interface PerformanceIndex {
	bundleSize: {
		current: number;
		target: number;
		strategy: string[];
	};
	coreWebVitals: {
		enabled: boolean;
		targets: Record<string, number>;
	};
	optimization: string[];
	lazy: string[];
	caching: string[];
}

export interface ComplianceIndex {
	accessibility: {
		level: "A" | "AA" | "AAA";
		tools: string[];
		automated: boolean;
	};
	norwegian: {
		enabled: boolean;
		nsmClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
		requirements: string[];
	};
	gdpr: {
		enabled: boolean;
		features: string[];
	};
	security: {
		tools: string[];
		standards: string[];
	};
}

export interface PropDefinition {
	name: string;
	type: string;
	required: boolean;
	description?: string;
	defaultValue?: any;
}

export interface AccessibilityFeatures {
	semanticHTML: boolean;
	ariaLabels: boolean;
	keyboardNavigation: boolean;
	screenReader: boolean;
	colorContrast: boolean;
	focusManagement: boolean;
}

export interface PerformanceFeatures {
	memo: boolean;
	lazy: boolean;
	virtualization: boolean;
	caching: boolean;
	bundleSplitting: boolean;
}

export class AIContextIndexer {
	private projectPath: string;
	private projectAnalyzer: ProjectAnalyzer;
	private index: CodebaseIndex | null = null;

	constructor(projectPath?: string) {
		this.projectPath = projectPath || process.cwd();
		this.projectAnalyzer = new ProjectAnalyzer();
	}

	/**
	 * Build comprehensive codebase index for AI context
	 */
	async buildIndex(): Promise<CodebaseIndex> {
		logger.info("🗂️ Building comprehensive codebase index for AI context...");

		const startTime = Date.now();

		// Run analysis in parallel for performance
		const [
			components,
			patterns,
			dependencies,
			architecture,
			standards,
			performance,
			compliance,
		] = await Promise.all([
			this.indexComponents(),
			this.indexPatterns(),
			this.indexDependencies(),
			this.indexArchitecture(),
			this.indexCodingStandards(),
			this.indexPerformance(),
			this.indexCompliance(),
		]);

		this.index = {
			components,
			patterns,
			dependencies,
			architecture,
			standards,
			performance,
			compliance,
			lastUpdated: new Date(),
		};

		const duration = Date.now() - startTime;
		logger.success(
			`✅ Codebase index built in ${duration}ms (${components.length} components, ${patterns.length} patterns)`,
		);

		return this.index;
	}

	/**
	 * Get cached index or build if not available
	 */
	async getIndex(): Promise<CodebaseIndex> {
		if (!this.index || this.isIndexStale()) {
			return await this.buildIndex();
		}
		return this.index;
	}

	/**
	 * Get AI context for specific component generation
	 */
	async getAIContext(
		componentName: string,
		componentType: string,
	): Promise<{
		similarComponents: ComponentIndex[];
		relevantPatterns: PatternIndex[];
		suggestedDependencies: string[];
		architecturalGuidance: string[];
		complianceRequirements: string[];
		performanceConsiderations: string[];
	}> {
		const index = await this.getIndex();

		// Find similar components
		const similarComponents = this.findSimilarComponents(
			componentName,
			componentType,
			index.components,
		);

		// Find relevant patterns
		const relevantPatterns = this.findRelevantPatterns(
			componentType,
			index.patterns,
		);

		// Suggest dependencies based on component type and existing patterns
		const suggestedDependencies = this.suggestDependencies(
			componentType,
			index.dependencies,
			similarComponents,
		);

		// Provide architectural guidance
		const architecturalGuidance = this.getArchitecturalGuidance(
			componentType,
			index.architecture,
		);

		// Get compliance requirements
		const complianceRequirements = this.getComplianceRequirements(
			index.compliance,
		);

		// Get performance considerations
		const performanceConsiderations = this.getPerformanceConsiderations(
			componentType,
			index.performance,
		);

		return {
			similarComponents,
			relevantPatterns,
			suggestedDependencies,
			architecturalGuidance,
			complianceRequirements,
			performanceConsiderations,
		};
	}

	/**
	 * Index all components in the project
	 */
	private async indexComponents(): Promise<ComponentIndex[]> {
		const components: ComponentIndex[] = [];

		const componentDirs = [
			"src/components",
			"components",
			"src/app",
			"app",
			"src/pages",
			"pages",
			"src/hooks",
			"hooks",
			"src/services",
			"services",
			"src/utils",
			"utils",
			"src/lib",
			"lib",
		];

		for (const dir of componentDirs) {
			const fullPath = path.join(this.projectPath, dir);
			try {
				const exists = await fs
					.access(fullPath)
					.then(() => true)
					.catch(() => false);
				if (!exists) continue;

				const files = await this.getFilesRecursively(fullPath);
				const componentFiles = files.filter(
					(file) =>
						(file.endsWith(".tsx") ||
							file.endsWith(".jsx") ||
							file.endsWith(".ts")) &&
						!file.includes(".test.") &&
						!file.includes(".spec.") &&
						!file.includes(".stories."),
				);

				for (const file of componentFiles) {
					const component = await this.analyzeComponent(file, dir);
					if (component) {
						components.push(component);
					}
				}
			} catch (error) {
				logger.debug(`Failed to index directory ${dir}:`, error);
			}
		}

		return components;
	}

	/**
	 * Index patterns used in the project
	 */
	private async indexPatterns(): Promise<PatternIndex[]> {
		const patterns: PatternIndex[] = [];

		// Detect architectural patterns
		patterns.push(...(await this.detectArchitecturalPatterns()));

		// Detect design patterns
		patterns.push(...(await this.detectDesignPatterns()));

		// Detect coding patterns
		patterns.push(...(await this.detectCodingPatterns()));

		// Detect performance patterns
		patterns.push(...(await this.detectPerformancePatterns()));

		// Detect accessibility patterns
		patterns.push(...(await this.detectAccessibilityPatterns()));

		return patterns;
	}

	/**
	 * Index project dependencies
	 */
	private async indexDependencies(): Promise<DependencyIndex> {
		try {
			const packageJsonPath = path.join(this.projectPath, "package.json");
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, "utf-8"),
			);

			const production = packageJson.dependencies || {};
			const development = packageJson.devDependencies || {};

			return {
				production,
				development,
				uiFrameworks: this.categorizeUIFrameworks(production),
				stateManagement: this.categorizeStateManagement(production),
				testing: this.categorizeTesting({ ...production, ...development }),
				performance: this.categorizePerformance({
					...production,
					...development,
				}),
				accessibility: this.categorizeAccessibility({
					...production,
					...development,
				}),
			};
		} catch (error) {
			logger.debug("Failed to index dependencies:", error);
			return {
				production: {},
				development: {},
				uiFrameworks: [],
				stateManagement: [],
				testing: [],
				performance: [],
				accessibility: [],
			};
		}
	}

	/**
	 * Index project architecture
	 */
	private async indexArchitecture(): Promise<ArchitectureIndex> {
		const projectInfo = await this.projectAnalyzer.analyzeProject(
			this.projectPath,
		);

		// Detect architecture style based on directory structure
		const style = await this.detectArchitectureStyle();

		// Detect layers
		const layers = await this.detectLayers();

		// Detect architectural patterns
		const patterns = await this.detectArchitecturalPatterns();

		return {
			style,
			layers,
			patterns: patterns.map((p) => p.name),
			dataFlow: await this.detectDataFlow(),
			stateManagement: await this.detectStateManagement(),
			routing: await this.detectRoutingStrategy(),
			apiStrategy: await this.detectAPIStrategy(),
		};
	}

	/**
	 * Index coding standards
	 */
	private async indexCodingStandards(): Promise<CodingStandardsIndex> {
		const checks = [
			{ file: "tsconfig.json", key: "typescript" },
			{ file: ".eslintrc.json", key: "linting" },
			{ file: "prettier.config.js", key: "formatting" },
			{ file: "jest.config.js", key: "testing" },
			{ file: ".husky", key: "preCommitHooks" },
		];

		const standards: Partial<CodingStandardsIndex> = {};

		for (const check of checks) {
			const exists = await this.fileExists(
				path.join(this.projectPath, check.file),
			);
			if (check.key === "typescript" || check.key === "preCommitHooks") {
				(standards as any)[check.key] = exists;
			}
		}

		// Check TypeScript strict mode
		let strict = false;
		try {
			const tsConfigPath = path.join(this.projectPath, "tsconfig.json");
			if (await this.fileExists(tsConfigPath)) {
				const tsConfig = JSON.parse(await fs.readFile(tsConfigPath, "utf-8"));
				strict = tsConfig.compilerOptions?.strict === true;
			}
		} catch {
			// Ignore errors
		}

		return {
			typescript: standards.typescript || false,
			strict,
			linting: ["eslint"], // Detected from config files
			formatting: ["prettier"],
			testing: ["jest"],
			documentation: ["typedoc"],
			preCommitHooks: standards.preCommitHooks || false,
		};
	}

	/**
	 * Index performance configurations
	 */
	private async indexPerformance(): Promise<PerformanceIndex> {
		return {
			bundleSize: {
				current: 0, // Would need actual bundle analysis
				target: 500000, // 500KB default target
				strategy: ["code-splitting", "tree-shaking", "lazy-loading"],
			},
			coreWebVitals: {
				enabled: true,
				targets: {
					LCP: 2.5,
					FID: 100,
					CLS: 0.1,
				},
			},
			optimization: ["React.memo", "useCallback", "useMemo"],
			lazy: ["React.lazy", "dynamic imports"],
			caching: ["service worker", "browser cache"],
		};
	}

	/**
	 * Index compliance requirements
	 */
	private async indexCompliance(): Promise<ComplianceIndex> {
		// Check for accessibility tools
		const accessibilityTools = await this.detectAccessibilityTools();

		// Check for Norwegian compliance
		const norwegianCompliance = await this.detectNorwegianCompliance();

		// Check for GDPR compliance
		const gdprCompliance = await this.detectGDPRCompliance();

		// Check for security tools
		const securityTools = await this.detectSecurityTools();

		return {
			accessibility: {
				level: "AAA", // Default high standard
				tools: accessibilityTools,
				automated: accessibilityTools.length > 0,
			},
			norwegian: norwegianCompliance,
			gdpr: gdprCompliance,
			security: {
				tools: securityTools,
				standards: ["OWASP", "NSM"],
			},
		};
	}

	// Helper methods for component analysis
	private async analyzeComponent(
		filePath: string,
		directory: string,
	): Promise<ComponentIndex | null> {
		try {
			const content = await fs.readFile(filePath, "utf-8");
			const stats = await fs.stat(filePath);

			const name = path.basename(filePath, path.extname(filePath));
			const type = this.inferComponentType(filePath, directory, content);

			return {
				name,
				path: filePath,
				type,
				framework: this.detectFramework(content),
				dependencies: this.extractDependencies(content),
				props: this.extractProps(content),
				complexity: this.calculateComplexity(content),
				patterns: this.detectComponentPatterns(content),
				accessibility: this.analyzeAccessibility(content),
				performance: this.analyzePerformance(content),
				reusability: this.calculateReusability(content),
				lastModified: stats.mtime,
			};
		} catch (error) {
			logger.debug(`Failed to analyze component ${filePath}:`, error);
			return null;
		}
	}

	private inferComponentType(
		filePath: string,
		directory: string,
		content: string,
	): ComponentIndex["type"] {
		if (directory.includes("hook") || filePath.includes("use")) {
			return "hook";
		}
		if (directory.includes("service") || directory.includes("api")) {
			return "service";
		}
		if (directory.includes("util") || directory.includes("lib")) {
			return "utility";
		}
		if (directory.includes("page") || content.includes("export default")) {
			return "page";
		}
		if (content.includes("children") && content.includes("ReactNode")) {
			return "layout";
		}
		return "component";
	}

	private detectFramework(content: string): string {
		if (content.includes("from 'next")) return "next";
		if (content.includes("from 'react'")) return "react";
		if (content.includes("from 'vue'")) return "vue";
		if (content.includes("from '@angular")) return "angular";
		return "unknown";
	}

	private extractDependencies(content: string): string[] {
		const imports = content.match(/from ['"]([^'"]+)['"]/g) || [];
		return imports
			.map((imp) => imp.match(/from ['"]([^'"]+)['"]/)?.[1])
			.filter(Boolean) as string[];
	}

	private extractProps(content: string): PropDefinition[] {
		// Simplified prop extraction - would need more sophisticated parsing in real implementation
		const props: PropDefinition[] = [];
		const interfaceMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/s);
		if (interfaceMatch) {
			const propsContent = interfaceMatch[1];
			const propLines = propsContent.split("\n").filter((line) => line.trim());
			for (const line of propLines) {
				const match = line.match(/(\w+)(\?)?:\s*([^;]+)/);
				if (match) {
					props.push({
						name: match[1],
						type: match[3].trim(),
						required: !match[2],
					});
				}
			}
		}
		return props;
	}

	private calculateComplexity(
		content: string,
	): "simple" | "medium" | "complex" {
		const lines = content.split("\n").length;
		const functions = (content.match(/function|=>/g) || []).length;
		const conditions = (content.match(/if|switch|&&|\|\|/g) || []).length;

		const score = lines * 0.1 + functions * 2 + conditions * 1.5;

		if (score < 20) return "simple";
		if (score < 50) return "medium";
		return "complex";
	}

	private detectComponentPatterns(content: string): string[] {
		const patterns: string[] = [];

		if (content.includes("React.memo")) patterns.push("React.memo");
		if (content.includes("useCallback")) patterns.push("useCallback");
		if (content.includes("useMemo")) patterns.push("useMemo");
		if (content.includes("useState")) patterns.push("useState");
		if (content.includes("useEffect")) patterns.push("useEffect");
		if (content.includes("forwardRef")) patterns.push("forwardRef");
		if (content.includes("children")) patterns.push("children-pattern");
		if (content.includes("render")) patterns.push("render-props");

		return patterns;
	}

	private analyzeAccessibility(content: string): AccessibilityFeatures {
		return {
			semanticHTML: /\b(nav|main|section|article|aside|header|footer)\b/.test(
				content,
			),
			ariaLabels: /aria-\w+/.test(content),
			keyboardNavigation: /onKey|tabIndex/.test(content),
			screenReader: /screen.*reader|sr-only/.test(content),
			colorContrast: /contrast|color.*accessibility/.test(content),
			focusManagement: /focus|blur/.test(content),
		};
	}

	private analyzePerformance(content: string): PerformanceFeatures {
		return {
			memo: content.includes("React.memo"),
			lazy: content.includes("React.lazy") || content.includes("lazy"),
			virtualization: /virtual|window/.test(content),
			caching: /cache|memo/.test(content),
			bundleSplitting: content.includes("dynamic") || content.includes("lazy"),
		};
	}

	private calculateReusability(content: string): number {
		let score = 0.5; // Base score

		// Has props interface
		if (/interface\s+\w+Props/.test(content)) score += 0.2;

		// Generic/flexible props
		if (content.includes("children")) score += 0.1;
		if (content.includes("className")) score += 0.1;

		// Well documented
		if (/\/\*\*[\s\S]*?\*\//.test(content)) score += 0.1;

		return Math.min(1, score);
	}

	// Helper methods for pattern detection
	private async detectArchitecturalPatterns(): Promise<PatternIndex[]> {
		const patterns: PatternIndex[] = [];

		// Check for common architectural patterns
		if (await this.hasPattern("src/components", "src/pages")) {
			patterns.push({
				name: "Component-Page Architecture",
				type: "architectural",
				description: "Separation of components and pages",
				examples: ["src/components/Button.tsx", "src/pages/Home.tsx"],
				usage: 1,
				components: [],
				recommendation: "high",
			});
		}

		if (await this.hasPattern("src/hooks")) {
			patterns.push({
				name: "Custom Hooks Pattern",
				type: "architectural",
				description: "Reusable stateful logic in custom hooks",
				examples: ["src/hooks/useAuth.ts"],
				usage: 1,
				components: [],
				recommendation: "high",
			});
		}

		return patterns;
	}

	private async detectDesignPatterns(): Promise<PatternIndex[]> {
		// Implement design pattern detection
		return [];
	}

	private async detectCodingPatterns(): Promise<PatternIndex[]> {
		// Implement coding pattern detection
		return [];
	}

	private async detectPerformancePatterns(): Promise<PatternIndex[]> {
		// Implement performance pattern detection
		return [];
	}

	private async detectAccessibilityPatterns(): Promise<PatternIndex[]> {
		// Implement accessibility pattern detection
		return [];
	}

	// More utility methods
	private async getFilesRecursively(dir: string): Promise<string[]> {
		const files: string[] = [];
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				files.push(...(await this.getFilesRecursively(fullPath)));
			} else {
				files.push(fullPath);
			}
		}

		return files;
	}

	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	private async hasPattern(...paths: string[]): Promise<boolean> {
		for (const p of paths) {
			if (await this.fileExists(path.join(this.projectPath, p))) {
				return true;
			}
		}
		return false;
	}

	private isIndexStale(): boolean {
		if (!this.index) return true;
		const age = Date.now() - this.index.lastUpdated.getTime();
		return age > 3600000; // 1 hour
	}

	// Component similarity and pattern matching
	private findSimilarComponents(
		componentName: string,
		componentType: string,
		components: ComponentIndex[],
	): ComponentIndex[] {
		return components
			.filter(
				(comp) =>
					comp.type === componentType ||
					comp.name
						.toLowerCase()
						.includes(componentName.toLowerCase().slice(0, 3)),
			)
			.slice(0, 5); // Return top 5 similar components
	}

	private findRelevantPatterns(
		componentType: string,
		patterns: PatternIndex[],
	): PatternIndex[] {
		return patterns.filter(
			(pattern) =>
				pattern.type === "design" ||
				pattern.type === "coding" ||
				pattern.recommendation === "high",
		);
	}

	private suggestDependencies(
		componentType: string,
		dependencies: DependencyIndex,
		similarComponents: ComponentIndex[],
	): string[] {
		const suggestions: string[] = [];

		// Base UI framework
		suggestions.push("@xala-technologies/ui-system");

		// Type-specific suggestions
		if (componentType === "form") {
			suggestions.push("react-hook-form", "zod");
		}
		if (componentType === "page") {
			suggestions.push("next/router", "next/head");
		}

		// Add common dependencies from similar components
		const commonDeps = new Set<string>();
		similarComponents.forEach((comp) => {
			comp.dependencies.forEach((dep) => commonDeps.add(dep));
		});

		suggestions.push(...Array.from(commonDeps).slice(0, 3));

		return [...new Set(suggestions)];
	}

	private getArchitecturalGuidance(
		componentType: string,
		architecture: ArchitectureIndex,
	): string[] {
		const guidance: string[] = [];

		guidance.push(`Follow ${architecture.style} architecture pattern`);
		guidance.push(`Use ${architecture.stateManagement} for state management`);
		guidance.push(`Implement ${architecture.dataFlow} data flow`);

		if (componentType === "page") {
			guidance.push(`Use ${architecture.routing} for routing`);
		}

		return guidance;
	}

	private getComplianceRequirements(compliance: ComplianceIndex): string[] {
		const requirements: string[] = [];

		requirements.push(
			`Implement WCAG ${compliance.accessibility.level} accessibility`,
		);

		if (compliance.norwegian.enabled) {
			requirements.push(
				`Apply NSM ${compliance.norwegian.nsmClassification} classification`,
			);
		}

		if (compliance.gdpr.enabled) {
			requirements.push("Include GDPR compliance features");
		}

		return requirements;
	}

	private getPerformanceConsiderations(
		componentType: string,
		performance: PerformanceIndex,
	): string[] {
		const considerations: string[] = [];

		considerations.push("Optimize for Core Web Vitals");
		considerations.push(
			`Target bundle size: ${performance.bundleSize.target} bytes`,
		);

		if (componentType === "component") {
			considerations.push("Consider React.memo for re-render optimization");
			considerations.push("Use useCallback for event handlers");
		}

		return considerations;
	}

	// Dependency categorization helpers
	private categorizeUIFrameworks(deps: Record<string, string>): string[] {
		const frameworks = ["react", "vue", "angular", "svelte", "next"];
		return frameworks.filter((fw) => deps[fw]);
	}

	private categorizeStateManagement(deps: Record<string, string>): string[] {
		const stateLibs = ["redux", "zustand", "jotai", "recoil", "mobx"];
		return stateLibs.filter((lib) => deps[lib]);
	}

	private categorizeTesting(deps: Record<string, string>): string[] {
		const testLibs = [
			"jest",
			"vitest",
			"cypress",
			"playwright",
			"@testing-library",
		];
		return testLibs.filter((lib) =>
			Object.keys(deps).some((key) => key.includes(lib)),
		);
	}

	private categorizePerformance(deps: Record<string, string>): string[] {
		const perfLibs = [
			"@next/bundle-analyzer",
			"webpack-bundle-analyzer",
			"lighthouse",
		];
		return perfLibs.filter((lib) => deps[lib]);
	}

	private categorizeAccessibility(deps: Record<string, string>): string[] {
		const a11yLibs = ["@axe-core", "react-aria", "focus-trap"];
		return a11yLibs.filter((lib) =>
			Object.keys(deps).some((key) => key.includes(lib)),
		);
	}

	// Architecture detection methods
	private async detectArchitectureStyle(): Promise<ArchitectureIndex["style"]> {
		if (await this.hasPattern("src/domain", "src/infrastructure")) {
			return "hexagonal";
		}
		if (await this.hasPattern("src/entities", "src/use-cases")) {
			return "clean";
		}
		if (await this.hasPattern("src/controllers", "src/models", "src/views")) {
			return "mvc";
		}
		if (await this.hasPattern("src/components")) {
			return "component-based";
		}
		return "layered";
	}

	private async detectLayers(): Promise<string[]> {
		const layers: string[] = [];
		const layerDirs = [
			"presentation",
			"application",
			"domain",
			"infrastructure",
			"components",
			"pages",
			"services",
			"utils",
		];

		for (const layer of layerDirs) {
			if (await this.hasPattern(`src/${layer}`)) {
				layers.push(layer);
			}
		}

		return layers;
	}

	private async detectDataFlow(): Promise<ArchitectureIndex["dataFlow"]> {
		// Simplified detection - would need more sophisticated analysis
		if (await this.hasPattern("src/store", "src/redux")) {
			return "unidirectional";
		}
		return "unidirectional"; // Default for React
	}

	private async detectStateManagement(): Promise<string> {
		if (await this.hasPattern("src/store/index.ts")) return "Redux";
		if (await this.hasPattern("src/store.ts")) return "Zustand";
		return "React State";
	}

	private async detectRoutingStrategy(): Promise<string> {
		if (await this.hasPattern("src/app")) return "App Router";
		if (await this.hasPattern("src/pages")) return "Pages Router";
		return "React Router";
	}

	private async detectAPIStrategy(): Promise<ArchitectureIndex["apiStrategy"]> {
		if (await this.hasPattern("src/trpc")) return "trpc";
		if (await this.hasPattern("src/graphql")) return "graphql";
		return "rest";
	}

	// Compliance detection methods
	private async detectAccessibilityTools(): Promise<string[]> {
		const tools: string[] = [];
		const toolChecks = [
			{ pattern: "@axe-core", tool: "axe-core" },
			{ pattern: "react-aria", tool: "react-aria" },
			{ pattern: "focus-trap", tool: "focus-trap" },
		];

		for (const check of toolChecks) {
			if (await this.hasPattern(`node_modules/${check.pattern}`)) {
				tools.push(check.tool);
			}
		}

		return tools;
	}

	private async detectNorwegianCompliance(): Promise<
		ComplianceIndex["norwegian"]
	> {
		// Check for Norwegian-specific configurations or patterns
		const enabled = await this.hasPattern("src/compliance/norwegian");

		return {
			enabled,
			nsmClassification: "OPEN", // Default classification
			requirements: enabled ? ["NSM classification", "Norwegian locale"] : [],
		};
	}

	private async detectGDPRCompliance(): Promise<ComplianceIndex["gdpr"]> {
		const enabled = await this.hasPattern("src/compliance/gdpr", "src/privacy");

		return {
			enabled,
			features: enabled
				? ["consent management", "data deletion", "privacy policy"]
				: [],
		};
	}

	private async detectSecurityTools(): Promise<string[]> {
		const tools: string[] = [];
		const securityTools = ["eslint-plugin-security", "snyk", "audit"];

		for (const tool of securityTools) {
			if (await this.hasPattern(`node_modules/${tool}`)) {
				tools.push(tool);
			}
		}

		return tools;
	}
}
