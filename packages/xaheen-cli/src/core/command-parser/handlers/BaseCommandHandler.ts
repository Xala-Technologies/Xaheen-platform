/**
 * Base Command Handler
 * Provides common functionality for all command handlers
 * Follows Template Method Pattern and DRY principle
 */

import type { CLICommand } from "../../../types/index";
import type { ICommandHandler, CommandExecutionResult } from "../interfaces/ICommandHandler";
import { logger } from "../../../utils/logger";
import { performance } from 'perf_hooks';

export abstract class BaseCommandHandler implements ICommandHandler {
  public abstract readonly domain: string;

  /**
   * Execute a command with common error handling and logging
   */
  public async execute(command: CLICommand): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Pre-execution validation
      if (!this.canHandle(command)) {
        throw new Error(`Handler for ${this.domain} cannot handle command: ${command.domain}:${command.action}`);
      }

      // Log command execution
      logger.debug(`Executing ${this.domain} command: ${command.action}`, {
        domain: command.domain,
        action: command.action,
        target: command.target,
        hasOptions: Object.keys(command.options || {}).length > 0,
      });

      // Execute the specific command
      const result = await this.executeCommand(command);

      // Log success
      const duration = Math.round(performance.now() - startTime);
      logger.debug(`Command ${this.domain}:${command.action} completed in ${duration}ms`);

      // Handle result if provided
      if (result) {
        await this.handleResult(result, command);
      }

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      logger.error(`Command ${this.domain}:${command.action} failed after ${duration}ms:`, error);
      
      // Handle error
      await this.handleError(error, command);
      throw error;
    }
  }

  /**
   * Abstract method for specific command execution
   * Must be implemented by concrete handlers
   */
  protected abstract executeCommand(command: CLICommand): Promise<CommandExecutionResult | void>;

  /**
   * Get supported actions for this domain
   * Must be implemented by concrete handlers
   */
  public abstract getSupportedActions(): string[];

  /**
   * Check if this handler can handle the given command
   */
  public canHandle(command: CLICommand): boolean {
    return command.domain === this.domain && this.getSupportedActions().includes(command.action);
  }

  /**
   * Validate command arguments and options
   */
  protected validateCommand(command: CLICommand): void {
    if (!command.domain) {
      throw new Error('Command domain is required');
    }
    if (!command.action) {
      throw new Error('Command action is required');
    }
    if (command.domain !== this.domain) {
      throw new Error(`Command domain '${command.domain}' does not match handler domain '${this.domain}'`);
    }
  }

  /**
   * Handle command execution result
   */
  protected async handleResult(result: CommandExecutionResult, command: CLICommand): Promise<void> {
    if (!result.success && result.error) {
      throw result.error;
    }

    if (result.message) {
      logger.info(result.message);
    }

    if (result.data && command.options?.json) {
      console.log(JSON.stringify(result.data, null, 2));
    }
  }

  /**
   * Handle command execution errors
   */
  protected async handleError(error: unknown, command: CLICommand): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (command.options?.verbose) {
      logger.error(`Detailed error for ${this.domain}:${command.action}:`, error);
    } else {
      logger.error(`Error in ${this.domain}:${command.action}: ${errorMessage}`);
    }
  }

  /**
   * Get required arguments for an action
   */
  protected getRequiredArguments(action: string): string[] {
    // Override in concrete handlers to specify required arguments
    return [];
  }

  /**
   * Get optional arguments for an action
   */
  protected getOptionalArguments(action: string): string[] {
    // Override in concrete handlers to specify optional arguments
    return [];
  }

  /**
   * Validate required arguments are present
   */
  protected validateRequiredArguments(command: CLICommand): void {
    const required = this.getRequiredArguments(command.action);
    const missing: string[] = [];

    for (const arg of required) {
      if (!command.arguments?.[arg] && !command.target && !command.options?.[arg]) {
        missing.push(arg);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required arguments: ${missing.join(', ')}`);
    }
  }

  /**
   * Get argument value from command (checks target, arguments, and options)
   */
  protected getArgumentValue(command: CLICommand, argName: string): any {
    return command.arguments?.[argName] || 
           command.options?.[argName] || 
           (argName === 'target' ? command.target : undefined);
  }

  /**
   * Check if verbose mode is enabled
   */
  protected isVerbose(command: CLICommand): boolean {
    return Boolean(command.options?.verbose);
  }

  /**
   * Check if JSON output is requested
   */
  protected isJsonOutput(command: CLICommand): boolean {
    return Boolean(command.options?.json);
  }

  /**
   * Create a success result
   */
  protected createSuccessResult(message?: string, data?: any): CommandExecutionResult {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Create an error result
   */
  protected createErrorResult(error: Error | string, data?: any): CommandExecutionResult {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(error),
      data,
    };
  }

  /**
   * Get handler metadata
   */
  public getMetadata(): BaseHandlerMetadata {
    return {
      domain: this.domain,
      actions: this.getSupportedActions(),
      description: `Command handler for ${this.domain} domain`,
      version: '1.0.0',
    };
  }
}

/**
 * Base handler metadata
 */
export interface BaseHandlerMetadata {
  domain: string;
  actions: string[];
  description: string;
  version: string;
}
