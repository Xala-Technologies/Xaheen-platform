/**
 * @fileoverview Generator Executors - Index File
 * @description Exports domain-specific generator executors and shared types
 * @author Xala Technologies
 * @version 1.0.0
 */

import type {
  GeneratorOptions,
  GeneratorResult,
  GeneratorType,
} from "../../types/index.js";

// Re-export types for use by executor modules
export type {
  GeneratorOptions,
  GeneratorResult,
  GeneratorType,
};

import { 
  GeneratorDomain,
  IGeneratorRegistry
} from '../core/index.js';

/**
 * Project information interface
 */
export interface ProjectInfo {
  /** Project name */
  name: string;
  /** Project version */
  version: string;
  /** Project description */
  description?: string;
  /** Project author */
  author?: string;
  /** Project framework */
  framework?: string;
  /** Programming language */
  language?: string;
  /** Project dependencies */
  dependencies?: string[];
}

/**
 * Generator execution context
 */
export interface GeneratorContext {
  /** Generator type */
  type: GeneratorType;
  /** Name for the generated artifact */
  name: string;
  /** Generator options */
  options: GeneratorOptions;
  /** Project information */
  projectInfo: ProjectInfo;
}

/**
 * Generator Executor Interface
 * Each domain-specific executor must implement this interface
 */
export interface IGeneratorExecutor {
  /**
   * Executes a generator for the specific domain
   * @param context Generator execution context
   * @returns Promise that resolves to generator result
   */
  execute(context: GeneratorContext): Promise<GeneratorResult>;
  
  /**
   * Checks if the executor can handle a specific generator type
   * @param type Generator type to check
   * @returns True if the executor can handle this generator type
   */
  canHandle(type: GeneratorType): boolean;
  
  /**
   * Gets help text for a specific generator type
   * @param type Generator type 
   * @returns Help text for the generator
   */
  getHelp(type: GeneratorType): string;
}

// Export domain-specific executors
export { FrontendExecutor } from './frontend.executor.js';
export { BackendExecutor } from './backend.executor.js';
export { ComplianceExecutor } from './compliance.executor.js';
export { DevOpsExecutor } from './devops.executor.js';
