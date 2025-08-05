/**
 * @fileoverview Hybrid Scaffolding Architecture - Main Export
 * @description Three-tier generator system combining Yeoman, Nx DevKit, and Hygen
 */

// ===== ORCHESTRATION =====
export { HybridScaffoldingOrchestrator } from "./hybrid-orchestrator.js";
// ===== SERVICE INTEGRATION =====
export {
	ComponentGeneratorService,
	createScaffoldingServiceInjector,
	createScaffoldingServiceRegistry,
	PageGeneratorService,
	ScaffoldingServiceInjector,
	ScaffoldingServiceRegistry,
	ServiceIntegratedOrchestrator,
} from "./service-integration.js";

// ===== TIER IMPLEMENTATIONS =====
export { YeomanIntegration } from "./tier1-yeoman-integration.js";
export { ASTTransformationEngine } from "./tier2-ast-transformations.js";
export { HygenIntegration } from "./tier3-hygen-integration.js";
// ===== CORE TYPES =====
export * from "./types.js";
// ===== VIRTUAL FILESYSTEM =====
export { createVirtualFS, VirtualFS } from "./virtual-fs.js";

// ===== FACTORY FUNCTIONS =====

import {
	createScaffoldingServiceRegistry,
	ServiceIntegratedOrchestrator,
} from "./service-integration.js";

/**
 * Create a new hybrid scaffolding orchestrator with all tiers integrated
 */
export function createHybridScaffolder(
	projectPath: string,
): ServiceIntegratedOrchestrator {
	const registry = createScaffoldingServiceRegistry();
	return new ServiceIntegratedOrchestrator(projectPath, registry);
}

/**
 * Create a basic orchestrator without service integration
 */
export function createBasicOrchestrator(
	projectPath: string,
): import("./hybrid-orchestrator.js").HybridScaffoldingOrchestrator {
	const { HybridScaffoldingOrchestrator } = require("./hybrid-orchestrator.js");
	return new HybridScaffoldingOrchestrator(projectPath);
}

// ===== UTILITY FUNCTIONS =====

export function validateProjectPath(projectPath: string): boolean {
	try {
		const path = require("path");
		const resolved = path.resolve(projectPath);
		return typeof resolved === "string" && resolved.length > 0;
	} catch {
		return false;
	}
}

export function getDefaultScaffoldingContext(
	projectName: string,
	projectPath: string,
	framework: string = "react",
): import("./types.js").ScaffoldingContext {
	return {
		projectPath,
		projectName,
		framework,
		features: [],
		dryRun: false,
		verbose: false,
	};
}

export function getDefaultHybridOptions(): import("./types.js").HybridScaffoldingOptions {
	return {
		tier1: {
			skipInstall: false,
			gitInit: true,
		},
		tier2: {
			transformations: [],
			imports: [],
			interfaces: [],
			routes: [],
		},
		tier3: {
			generatorName: "component",
			dryRun: false,
		},
		orchestration: {
			strategy: "sequential",
			rollbackOnError: true,
			continueOnWarning: true,
		},
	};
}
