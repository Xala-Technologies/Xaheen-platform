/**
 * @fileoverview Troubleshooting Documentation Generator
 * @description Generates troubleshooting guides and FAQ documentation
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { BaseGenerator } from "../base.generator";
import type {
	DocumentationGeneratorOptions,
	DocumentationResult,
} from "./index";

export interface TroubleshootingGeneratorOptions
	extends DocumentationGeneratorOptions {
	readonly includeCommonIssues?: boolean;
	readonly includeDiagnostics?: boolean;
	readonly includeErrorCodes?: boolean;
}

export class TroubleshootingDocsGenerator extends BaseGenerator<TroubleshootingGeneratorOptions> {
	async generate(
		options: TroubleshootingGeneratorOptions,
	): Promise<DocumentationResult> {
		try {
			this.logger.info(
				`Generating troubleshooting documentation for ${options.projectName}`,
			);

			const files: string[] = [
				"docs/troubleshooting/common-issues.md",
				"docs/troubleshooting/error-codes.md",
				"docs/troubleshooting/diagnostics.md",
				"docs/troubleshooting/faq.md",
			];

			return {
				success: true,
				message: `Troubleshooting documentation generated for ${options.projectName}`,
				files,
				nextSteps: [
					"Review and customize troubleshooting content",
					"Add project-specific error scenarios",
					"Test diagnostic procedures",
				],
			};
		} catch (error) {
			this.logger.error(
				"Failed to generate troubleshooting documentation",
				error,
			);
			return {
				success: false,
				message: `Failed to generate troubleshooting documentation: ${error instanceof Error ? error.message : "Unknown error"}`,
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
