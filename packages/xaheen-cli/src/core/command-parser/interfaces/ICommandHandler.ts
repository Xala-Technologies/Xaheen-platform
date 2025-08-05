/**
 * Command Handler Interface
 * Defines the contract for all domain-specific command handlers
 * Follows Interface Segregation Principle (ISP)
 */

import type { CLICommand } from '../../../types/index.js';

export interface ICommandHandler {
  /**
   * The domain this handler is responsible for
   */
  readonly domain: string;

  /**
   * Execute a command for this domain
   * @param command - The CLI command to execute
   * @returns Promise that resolves when command completes
   */
  execute(command: CLICommand): Promise<void>;

  /**
   * Get supported actions for this domain
   * @returns Array of action names this handler supports
   */
  getSupportedActions(): string[];

  /**
   * Validate if this handler can execute the given command
   * @param command - The CLI command to validate
   * @returns True if this handler can execute the command
   */
  canHandle(command: CLICommand): boolean;
}

/**
 * Extended interface for handlers that need initialization
 */
export interface IInitializableCommandHandler extends ICommandHandler {
  /**
   * Initialize the handler with dependencies
   * @param dependencies - Handler-specific dependencies
   */
  initialize(dependencies?: Record<string, any>): Promise<void>;
}

/**
 * Command execution result
 */
export interface CommandExecutionResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}

/**
 * Command handler metadata
 */
export interface CommandHandlerMetadata {
  domain: string;
  actions: string[];
  description: string;
  version: string;
}
