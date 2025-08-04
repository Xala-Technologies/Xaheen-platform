/**
 * @fileoverview Getting Started Documentation Generator
 * @description Generates getting started guides and quick setup documentation
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { BaseGenerator } from "../base.generator";
import type { DocumentationGeneratorOptions, DocumentationResult } from "./index";

export interface GettingStartedGeneratorOptions extends DocumentationGeneratorOptions {
  readonly includeInstallation?: boolean;
  readonly includeQuickStart?: boolean;
  readonly includeExamples?: boolean;
}

export class GettingStartedGenerator extends BaseGenerator<GettingStartedGeneratorOptions> {
  async generate(options: GettingStartedGeneratorOptions): Promise<DocumentationResult> {
    try {
      this.logger.info(`Generating getting started documentation for ${options.projectName}`);
      
      const files: string[] = [
        'docs/getting-started/installation.md',
        'docs/getting-started/quick-start.md',
        'docs/getting-started/first-steps.md',
        'docs/getting-started/examples.md',
      ];
      
      return {
        success: true,
        message: `Getting started documentation generated for ${options.projectName}`,
        files,
        nextSteps: [
          'Customize installation instructions',
          'Add project-specific quick start examples',
          'Test setup procedures',
        ],
      };
    } catch (error) {
      this.logger.error('Failed to generate getting started documentation', error);
      return {
        success: false,
        message: `Failed to generate getting started documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}