/**
 * @fileoverview Project Analysis Tools for Xala UI System MCP Server
 * @description Advanced codebase analysis, migration strategy, and project structure tools
 * @version 6.0.0
 */

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { glob } from "glob";
import { extname, join, relative } from "path";

export interface ProjectAnalysisResult {
	readonly framework: string;
	readonly packageManager: "npm" | "yarn" | "pnpm";
	readonly dependencies: Record<string, string>;
	readonly devDependencies: Record<string, string>;
	readonly components: ComponentAnalysis[];
	readonly migrationStrategy: MigrationStrategy;
	readonly recommendations: string[];
	readonly risks: string[];
	readonly estimatedEffort: string;
}

export interface ComponentAnalysis {
	readonly filePath: string;
	readonly componentName: string;
	readonly framework: string;
	readonly complexity: "low" | "medium" | "high";
	readonly dependencies: string[];
	readonly migrationPath: string;
	readonly equivalentXalaComponent?: string;
}

export interface MigrationStrategy {
	readonly approach: "incremental" | "complete" | "hybrid";
	readonly phases: MigrationPhase[];
	readonly timeline: string;
	readonly priority: string[];
}

export interface MigrationPhase {
	readonly name: string;
	readonly description: string;
	readonly components: string[];
	readonly estimatedDays: number;
	readonly dependencies: string[];
}

export class ProjectAnalyzer {
	/**
	 * Analyze existing project structure and dependencies
	 */
	async analyzeProject(projectPath: string): Promise<ProjectAnalysisResult> {
		const packageJson = this.readPackageJson(projectPath);
		const framework = this.detectFramework(packageJson);
		const packageManager = this.detectPackageManager(projectPath);
		const components = await this.analyzeComponents(projectPath, framework);
		const migrationStrategy = this.generateMigrationStrategy(
			components,
			framework,
		);

		return {
			framework,
			packageManager,
			dependencies: packageJson.dependencies || {},
			devDependencies: packageJson.devDependencies || {},
			components,
			migrationStrategy,
			recommendations: this.generateRecommendations(components, framework),
			risks: this.identifyRisks(components, framework),
			estimatedEffort: this.calculateEffort(components),
		};
	}

	/**
	 * Generate detailed migration report
	 */
	generateMigrationReport(analysis: ProjectAnalysisResult): string {
		return `# Xala UI System Migration Report

## Project Overview
- **Framework**: ${analysis.framework}
- **Package Manager**: ${analysis.packageManager}
- **Components Found**: ${analysis.components.length}
- **Estimated Migration Effort**: ${analysis.estimatedEffort}

## Migration Strategy: ${analysis.migrationStrategy.approach.toUpperCase()}
${analysis.migrationStrategy.phases
	.map(
		(phase) => `
### Phase ${phase.name}
- **Description**: ${phase.description}
- **Components**: ${phase.components.join(", ")}
- **Estimated Time**: ${phase.estimatedDays} days
- **Dependencies**: ${phase.dependencies.join(", ")}
`,
	)
	.join("")}

## Component Analysis
${analysis.components
	.map(
		(comp) => `
### ${comp.componentName}
- **File**: ${comp.filePath}
- **Complexity**: ${comp.complexity}
- **Migration Path**: ${comp.migrationPath}
${comp.equivalentXalaComponent ? `- **Xala Equivalent**: ${comp.equivalentXalaComponent}` : ""}
`,
	)
	.join("")}

## Recommendations
${analysis.recommendations.map((rec) => `- ${rec}`).join("\n")}

## Risk Assessment
${analysis.risks.map((risk) => `⚠️ ${risk}`).join("\n")}

## Next Steps
1. Review migration strategy and timeline
2. Set up Xala UI System in development environment
3. Begin with Phase 1 components
4. Implement incremental testing strategy
5. Plan team training and documentation updates
`;
	}

	/**
	 * Execute CLI command integration
	 */
	async executeCliCommand(
		command: string,
		workingDir: string,
	): Promise<string> {
		try {
			const result = execSync(command, {
				cwd: workingDir,
				encoding: "utf8",
				stdio: "pipe",
			});
			return result.toString();
		} catch (error: any) {
			throw new Error(`CLI command failed: ${error.message}`);
		}
	}

	/**
	 * Create new project structure with Xala UI System
	 */
	async createProjectStructure(
		projectPath: string,
		framework: string,
	): Promise<void> {
		const commands = this.getProjectSetupCommands(framework);

		for (const command of commands) {
			await this.executeCliCommand(command, projectPath);
		}
	}

	private readPackageJson(projectPath: string): any {
		const packageJsonPath = join(projectPath, "package.json");
		if (!existsSync(packageJsonPath)) {
			throw new Error("package.json not found");
		}
		return JSON.parse(readFileSync(packageJsonPath, "utf8"));
	}

	private detectFramework(packageJson: any): string {
		const deps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};

		if (deps["next"]) return "Next.js";
		if (deps["react"]) return "React";
		if (deps["vue"]) return "Vue.js";
		if (deps["@angular/core"]) return "Angular";
		if (deps["svelte"]) return "Svelte";
		if (deps["electron"]) return "Electron";

		return "Unknown";
	}

	private detectPackageManager(projectPath: string): "npm" | "yarn" | "pnpm" {
		if (existsSync(join(projectPath, "pnpm-lock.yaml"))) return "pnpm";
		if (existsSync(join(projectPath, "yarn.lock"))) return "yarn";
		return "npm";
	}

	private async analyzeComponents(
		projectPath: string,
		framework: string,
	): Promise<ComponentAnalysis[]> {
		const patterns = this.getComponentPatterns(framework);
		const components: ComponentAnalysis[] = [];

		for (const pattern of patterns) {
			const files = glob.sync(pattern, { cwd: projectPath });

			for (const file of files) {
				const fullPath = join(projectPath, file);
				const content = readFileSync(fullPath, "utf8");
				const analysis = this.analyzeComponentFile(file, content, framework);
				components.push(analysis);
			}
		}

		return components;
	}

	private getComponentPatterns(framework: string): string[] {
		switch (framework) {
			case "React":
			case "Next.js":
				return [
					"src/**/*.{tsx,jsx}",
					"components/**/*.{tsx,jsx}",
					"pages/**/*.{tsx,jsx}",
				];
			case "Vue.js":
				return ["src/**/*.vue", "components/**/*.vue"];
			case "Angular":
				return ["src/**/*.component.ts", "src/**/*.component.html"];
			case "Svelte":
				return ["src/**/*.svelte"];
			default:
				return ["src/**/*.{js,ts,jsx,tsx}"];
		}
	}

	private analyzeComponentFile(
		filePath: string,
		content: string,
		framework: string,
	): ComponentAnalysis {
		const componentName = this.extractComponentName(filePath, content);
		const complexity = this.assessComplexity(content);
		const dependencies = this.extractDependencies(content);
		const migrationPath = this.determineMigrationPath(content, framework);
		const equivalentXalaComponent = this.findXalaEquivalent(
			componentName,
			content,
		);

		return {
			filePath,
			componentName,
			framework,
			complexity,
			dependencies,
			migrationPath,
			equivalentXalaComponent,
		};
	}

	private extractComponentName(filePath: string, content: string): string {
		const fileName =
			filePath
				.split("/")
				.pop()
				?.replace(/\.(tsx|jsx|vue|ts|js)$/, "") || "Unknown";

		// Try to extract from export statements
		const exportMatch = content.match(
			/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/,
		);
		if (exportMatch && exportMatch[1]) {
			return exportMatch[1];
		}

		return fileName;
	}

	private assessComplexity(content: string): "low" | "medium" | "high" {
		const lines = content.split("\n").length;
		const hooks = (content.match(/use\w+/g) || []).length;
		const props = (content.match(/props\./g) || []).length;

		if (lines > 200 || hooks > 5 || props > 10) return "high";
		if (lines > 100 || hooks > 2 || props > 5) return "medium";
		return "low";
	}

	private extractDependencies(content: string): string[] {
		const importMatches =
			content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
		return importMatches
			.map((match) => match.match(/from\s+['"]([^'"]+)['"]/)?.[1])
			.filter(Boolean) as string[];
	}

	private determineMigrationPath(content: string, framework: string): string {
		if (content.includes("styled-components"))
			return "Replace styled-components with CVA patterns";
		if (content.includes("@emotion"))
			return "Replace Emotion with Xala design tokens";
		if (content.includes("material-ui") || content.includes("@mui"))
			return "Replace Material-UI with Xala components";
		if (content.includes("antd"))
			return "Replace Ant Design with Xala components";
		if (content.includes("chakra-ui"))
			return "Replace Chakra UI with Xala components";

		return "Direct migration to Xala UI System";
	}

	private findXalaEquivalent(
		componentName: string,
		content: string,
	): string | undefined {
		const name = componentName.toLowerCase();

		if (name.includes("button")) return "Button";
		if (name.includes("input")) return "Input";
		if (name.includes("form")) return "Form";
		if (name.includes("card")) return "Card";
		if (name.includes("modal") || name.includes("dialog")) return "Dialog";
		if (name.includes("table")) return "DataTable";
		if (name.includes("nav")) return "Navigation";
		if (name.includes("header")) return "Header";
		if (name.includes("footer")) return "Footer";
		if (name.includes("sidebar")) return "Sidebar";
		if (name.includes("layout")) return "WebLayout or AdminLayout";

		return undefined;
	}

	private generateMigrationStrategy(
		components: ComponentAnalysis[],
		framework: string,
	): MigrationStrategy {
		const lowComplexity = components.filter((c) => c.complexity === "low");
		const mediumComplexity = components.filter(
			(c) => c.complexity === "medium",
		);
		const highComplexity = components.filter((c) => c.complexity === "high");

		const phases: MigrationPhase[] = [
			{
				name: "1 - Foundation",
				description: "Set up Xala UI System and migrate basic components",
				components: lowComplexity.slice(0, 5).map((c) => c.componentName),
				estimatedDays: 5,
				dependencies: ["@xala-technologies/ui-system"],
			},
			{
				name: "2 - Core Components",
				description: "Migrate medium complexity components",
				components: mediumComplexity.map((c) => c.componentName),
				estimatedDays: 10,
				dependencies: ["Phase 1 completion"],
			},
			{
				name: "3 - Complex Components",
				description: "Migrate high complexity and custom components",
				components: highComplexity.map((c) => c.componentName),
				estimatedDays: 15,
				dependencies: ["Phase 2 completion", "Custom component analysis"],
			},
		];

		return {
			approach: components.length > 20 ? "incremental" : "complete",
			phases,
			timeline: `${phases.reduce((sum, phase) => sum + phase.estimatedDays, 0)} days`,
			priority: ["Button", "Input", "Form", "Layout", "Navigation"],
		};
	}

	private generateRecommendations(
		components: ComponentAnalysis[],
		framework: string,
	): string[] {
		const recommendations: string[] = [
			"Start with low-complexity components to build team confidence",
			"Set up Xala UI System design tokens early in the process",
			"Create component mapping documentation for team reference",
			"Implement automated testing for migrated components",
		];

		if (framework === "Next.js") {
			recommendations.push(
				"Leverage Next.js App Router with Xala UI System providers",
			);
		}

		if (components.some((c) => c.dependencies.includes("styled-components"))) {
			recommendations.push(
				"Gradually replace styled-components with CVA patterns",
			);
		}

		return recommendations;
	}

	private identifyRisks(
		components: ComponentAnalysis[],
		framework: string,
	): string[] {
		const risks: string[] = [];

		const highComplexityCount = components.filter(
			(c) => c.complexity === "high",
		).length;
		if (highComplexityCount > 5) {
			risks.push(
				`${highComplexityCount} high-complexity components may require significant refactoring`,
			);
		}

		const customComponents = components.filter(
			(c) => !c.equivalentXalaComponent,
		);
		if (customComponents.length > 0) {
			risks.push(
				`${customComponents.length} components have no direct Xala equivalent`,
			);
		}

		if (framework === "Unknown") {
			risks.push("Unknown framework may require custom integration approach");
		}

		return risks;
	}

	private calculateEffort(components: ComponentAnalysis[]): string {
		const totalDays = components.reduce((sum, comp) => {
			switch (comp.complexity) {
				case "low":
					return sum + 0.5;
				case "medium":
					return sum + 2;
				case "high":
					return sum + 5;
				default:
					return sum + 1;
			}
		}, 0);

		if (totalDays < 5) return "Small (< 1 week)";
		if (totalDays < 15) return "Medium (2-3 weeks)";
		if (totalDays < 30) return "Large (1 month)";
		return "Extra Large (> 1 month)";
	}

	private getProjectSetupCommands(framework: string): string[] {
		const baseCommands = [
			"npm install @xala-technologies/ui-system",
			"npm install class-variance-authority clsx tailwind-merge",
		];

		switch (framework) {
			case "Next.js":
				return [
					...baseCommands,
					"npm install @next/font",
					"npx tailwindcss init -p",
				];
			case "React":
				return [
					...baseCommands,
					"npm install react-router-dom",
					"npx tailwindcss init -p",
				];
			default:
				return baseCommands;
		}
	}
}
