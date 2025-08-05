/**
 * @fileoverview Documentation Generator System
 * @description Comprehensive documentation generation for the Xaheen CLI
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { BaseGenerator } from "../base.generator";

export interface DocumentationGeneratorOptions {
	readonly projectName: string;
	readonly projectType:
		| "web"
		| "api"
		| "microservice"
		| "fullstack"
		| "mobile"
		| "desktop";
	readonly framework?: string;
	readonly runtime:
		| "node"
		| "python"
		| "go"
		| "java"
		| "dotnet"
		| "php"
		| "rust";
	readonly version: string;
	readonly description?: string;
	readonly author?: string;
	readonly license?: string;
	readonly repository?: string;
	readonly enableOpenAPI: boolean;
	readonly enableSwaggerUI: boolean;
	readonly enableArchitectureDocs: boolean;
	readonly enableDeploymentGuides: boolean;
	readonly enableAPIReference: boolean;
	readonly enableClientSDK: boolean;
	readonly enableTroubleshooting: boolean;
	readonly enableGettingStarted: boolean;
	readonly enableDeveloperWorkflow: boolean;
	readonly enableCodeDocumentation: boolean;
	readonly enableMermaidDiagrams: boolean;
	readonly enableDocsify: boolean;
	readonly enableVitePress: boolean;
	readonly enableGitBookFormat: boolean;
	readonly languages: readonly string[];
	readonly deploymentTargets: readonly string[];
	readonly integrations: readonly string[];
	readonly databases: readonly string[];
	readonly outputDir: string;
}

export interface APIEndpoint {
	readonly path: string;
	readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	readonly summary: string;
	readonly description?: string;
	readonly parameters?: readonly APIParameter[];
	readonly requestBody?: APIRequestBody;
	readonly responses: Record<string, APIResponse>;
	readonly tags?: readonly string[];
	readonly security?: readonly SecurityRequirement[];
}

export interface APIParameter {
	readonly name: string;
	readonly in: "query" | "path" | "header" | "cookie";
	readonly description?: string;
	readonly required: boolean;
	readonly schema: APISchema;
}

export interface APIRequestBody {
	readonly description?: string;
	readonly required: boolean;
	readonly content: Record<string, APIMediaType>;
}

export interface APIResponse {
	readonly description: string;
	readonly content?: Record<string, APIMediaType>;
	readonly headers?: Record<string, APIParameter>;
}

export interface APIMediaType {
	readonly schema: APISchema;
	readonly examples?: Record<string, any>;
}

export interface APISchema {
	readonly type: string;
	readonly format?: string;
	readonly description?: string;
	readonly properties?: Record<string, APISchema>;
	readonly items?: APISchema;
	readonly required?: readonly string[];
	readonly example?: any;
}

export interface SecurityRequirement {
	readonly [name: string]: readonly string[];
}

export interface DocumentationResult {
	readonly success: boolean;
	readonly message: string;
	readonly files: readonly string[];
	readonly commands?: readonly string[];
	readonly nextSteps?: readonly string[];
	readonly error?: string;
}

export { APIReferenceGenerator } from "./api-reference.generator";
export { ArchitectureDocsGenerator } from "./architecture.generator";
export { ClientSDKGenerator } from "./client-sdk.generator";
export { CodeDocumentationGenerator } from "./code-documentation.generator";
export { DeploymentGuideGenerator } from "./deployment.generator";
export { DeveloperWorkflowGenerator } from "./developer-workflow.generator";
export { GettingStartedGenerator } from "./getting-started.generator";
// Re-export individual generators
export { OpenAPIGenerator } from "./openapi.generator";
export { TroubleshootingDocsGenerator } from "./troubleshooting.generator";

/**
 * Main Documentation Generator Factory
 */
export class DocumentationGeneratorFactory {
	static createOpenAPIGenerator(): OpenAPIGenerator {
		return new OpenAPIGenerator();
	}

	static createArchitectureDocsGenerator(): ArchitectureDocsGenerator {
		return new ArchitectureDocsGenerator();
	}

	static createDeploymentGuideGenerator(): DeploymentGuideGenerator {
		return new DeploymentGuideGenerator();
	}

	static createAPIReferenceGenerator(): APIReferenceGenerator {
		return new APIReferenceGenerator();
	}

	static createClientSDKGenerator(): ClientSDKGenerator {
		return new ClientSDKGenerator();
	}

	static createTroubleshootingDocsGenerator(): TroubleshootingDocsGenerator {
		return new TroubleshootingDocsGenerator();
	}

	static createGettingStartedGenerator(): GettingStartedGenerator {
		return new GettingStartedGenerator();
	}

	static createDeveloperWorkflowGenerator(): DeveloperWorkflowGenerator {
		return new DeveloperWorkflowGenerator();
	}

	static createCodeDocumentationGenerator(): CodeDocumentationGenerator {
		return new CodeDocumentationGenerator();
	}

	/**
	 * Generate comprehensive documentation suite
	 */
	static async generateComprehensiveDocumentation(
		options: DocumentationGeneratorOptions,
	): Promise<DocumentationResult> {
		const results: DocumentationResult[] = [];
		const allFiles: string[] = [];
		const allCommands: string[] = [];
		const allNextSteps: string[] = [];

		try {
			// Generate OpenAPI documentation
			if (options.enableOpenAPI) {
				const openAPIGenerator = this.createOpenAPIGenerator();
				const result = await openAPIGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Architecture documentation
			if (options.enableArchitectureDocs) {
				const architectureGenerator = this.createArchitectureDocsGenerator();
				const result = await architectureGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Deployment guides
			if (options.enableDeploymentGuides) {
				const deploymentGenerator = this.createDeploymentGuideGenerator();
				const result = await deploymentGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate API Reference
			if (options.enableAPIReference) {
				const apiReferenceGenerator = this.createAPIReferenceGenerator();
				const result = await apiReferenceGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Client SDKs
			if (options.enableClientSDK) {
				const sdkGenerator = this.createClientSDKGenerator();
				const result = await sdkGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Troubleshooting docs
			if (options.enableTroubleshooting) {
				const troubleshootingGenerator =
					this.createTroubleshootingDocsGenerator();
				const result = await troubleshootingGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Getting Started guide
			if (options.enableGettingStarted) {
				const gettingStartedGenerator = this.createGettingStartedGenerator();
				const result = await gettingStartedGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Developer Workflow docs
			if (options.enableDeveloperWorkflow) {
				const workflowGenerator = this.createDeveloperWorkflowGenerator();
				const result = await workflowGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			// Generate Code documentation
			if (options.enableCodeDocumentation) {
				const codeDocsGenerator = this.createCodeDocumentationGenerator();
				const result = await codeDocsGenerator.generate(options);
				results.push(result);
				if (result.success) {
					allFiles.push(...result.files);
					if (result.commands) allCommands.push(...result.commands);
					if (result.nextSteps) allNextSteps.push(...result.nextSteps);
				}
			}

			const failedResults = results.filter((r) => !r.success);
			if (failedResults.length > 0) {
				return {
					success: false,
					message: `Failed to generate some documentation components: ${failedResults.map((r) => r.message).join(", ")}`,
					files: allFiles,
					commands: allCommands,
					nextSteps: allNextSteps,
					error: failedResults.map((r) => r.error).join("; "),
				};
			}

			return {
				success: true,
				message: `Comprehensive documentation generated successfully for ${options.projectName}`,
				files: [...new Set(allFiles)], // Remove duplicates
				commands: [...new Set(allCommands)],
				nextSteps: [
					...allNextSteps,
					"",
					"Documentation Setup Complete:",
					"• Review and customize the generated documentation",
					"• Update configuration files with your specific details",
					"• Set up documentation hosting (GitHub Pages, Netlify, etc.)",
					"• Configure automatic documentation updates in CI/CD",
					"• Train team on documentation maintenance procedures",
				],
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to generate comprehensive documentation: ${error instanceof Error ? error.message : "Unknown error"}`,
				files: allFiles,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
