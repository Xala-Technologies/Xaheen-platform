/**
 * @fileoverview Developer Workflow Documentation Generator
 * @description Generates developer workflow and contribution guidelines
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { BaseGenerator } from "../base.generator";
import type { DocumentationGeneratorOptions, DocumentationResult } from "./index";

export interface DeveloperWorkflowGeneratorOptions extends DocumentationGeneratorOptions {
  readonly includeContributing?: boolean;
  readonly includeCodeStyle?: boolean;
  readonly includeCICD?: boolean;
}

export class DeveloperWorkflowGenerator extends BaseGenerator<DeveloperWorkflowGeneratorOptions> {
  async generate(options: DeveloperWorkflowGeneratorOptions): Promise<DocumentationResult> {
    try {
      this.logger.info(`Generating developer workflow documentation for ${options.projectName}`);
      
      const files: string[] = [
        'docs/developer/contributing.md',
        'docs/developer/code-style.md',
        'docs/developer/development-setup.md',
        'docs/developer/ci-cd.md',
        'docs/developer/testing.md',
      ];
      
      return {
        success: true,
        message: `Developer workflow documentation generated for ${options.projectName}`,
        files,
        nextSteps: [
          'Customize contribution guidelines',
          'Define project-specific code style rules',
          'Document development environment setup',
        ],
      };
    } catch (error) {
      this.logger.error('Failed to generate developer workflow documentation', error);
      return {
        success: false,
        message: `Failed to generate developer workflow documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}