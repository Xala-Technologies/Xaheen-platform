/**
 * Project Analyzer Service
 *
 * Analyzes existing projects to detect framework, services,
 * and configuration for intelligent service addition.
 *
 * @author DevOps Expert Agent
 * @since 2025-01-03
 */
export interface ProjectInfo {
	isValid: boolean;
	name: string;
	framework?: string;
	backend?: string;
	database?: string;
	platform?: string;
	packageManager?: "npm" | "pnpm" | "yarn" | "bun";
	typescript: boolean;
	git?: boolean;
	services: string[];
	features?: string[];
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	scripts?: Record<string, string>;
}
export declare class ProjectAnalyzer {
	analyzeProject(projectPath: string): Promise<ProjectInfo>;
	private invalidProject;
	private detectTypeScript;
	private detectGit;
	private detectPackageManager;
	private detectFramework;
	private detectBackend;
	private detectDatabase;
	private detectServices;
	private detectPlatform;
	private detectServiceFromFileName;
}
//# sourceMappingURL=project-analyzer.d.ts.map
