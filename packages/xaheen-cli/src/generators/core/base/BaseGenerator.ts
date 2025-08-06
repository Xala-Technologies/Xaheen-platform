/**
 * BaseGenerator
 * Abstract base class for all generators
 * Provides common functionality and implements the IGenerator interface
 */

import type { GeneratorResult } from "../../../types/index";
import { IGenerator } from "../interfaces/IGenerator";
import { logger } from "../../../utils/logger";

/**
 * Common options shared across all generators
 */
export interface BaseGeneratorOptions {
  name: string;
  dryRun?: boolean;
  force?: boolean;
  typescript?: boolean;
  verbose?: boolean;
  outputDir?: string;
}

/**
 * Base generator class implementing the IGenerator interface
 * @template TOptions - The options type specific to the generator
 */
export abstract class BaseGenerator<TOptions extends BaseGeneratorOptions> implements IGenerator<TOptions> {
  /**
   * Generate code artifacts based on the provided options
   * Must be implemented by subclasses
   * @param options - Configuration options for the generator
   * @returns Promise resolving to the generation result
   */
  abstract generate(options: TOptions): Promise<GeneratorResult>;

  /**
   * Validate the provided options
   * Can be overridden by subclasses to provide specific validation
   * @param options - Configuration options to validate
   * @returns Boolean indicating if options are valid
   */
  protected validateOptions(options: TOptions): boolean {
    if (!options.name) {
      logger.error('Name is required');
      return false;
    }
    
    return true;
  }

  /**
   * Format and create a success result
   * @param files - Generated files
   * @param commands - Commands to run after generation
   * @param nextSteps - Next steps to display to the user
   * @param message - Success message
   * @returns Generator result with success status
   */
  protected formatSuccessResult(
    files: string[],
    commands: string[] = [],
    nextSteps: string[] = [],
    message: string
  ): GeneratorResult {
    return {
      success: true,
      message,
      files,
      commands,
      nextSteps
    };
  }

  /**
   * Format and create an error result
   * @param message - Error message
   * @param error - Optional error object
   * @returns Generator result with failure status
   */
  protected formatErrorResult(message: string, error?: Error): GeneratorResult {
    if (error) {
      logger.error(message, error);
    } else {
      logger.error(message);
    }

    return {
      success: false,
      message: `Failed: ${message}${error ? ` - ${error.message}` : ''}`,
      files: [],
      commands: [],
      nextSteps: []
    };
  }

  /**
   * Format the name to follow conventions (kebab-case)
   * @param name - Raw name input
   * @returns Formatted name in kebab-case
   */
  protected formatName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Convert kebab-case to PascalCase
   * @param str - String in kebab-case
   * @returns String in PascalCase
   */
  protected toPascalCase(str: string): string {
    return str
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Convert kebab-case to camelCase
   * @param str - String in kebab-case
   * @returns String in camelCase
   */
  protected toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}
