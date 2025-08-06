/**
 * Shared Command Types
 * Common types used across the command parser system
 */

import type { CLICommand, CLIDomain, CLIAction } from "../../../types/index";
import type { ICommandHandler } from "./ICommandHandler";

/**
 * Command route definition
 */
export interface CommandRoute {
  pattern: string;
  domain: CLIDomain;
  action: CLIAction;
  handler: (command: CLICommand) => Promise<void>;
  legacy?: {
    [key: string]: string[];
  };
  description?: string;
  examples?: string[];
}

/**
 * Command handler factory interface
 */
export interface ICommandHandlerFactory {
  /**
   * Create a command handler for the specified domain
   * @param domain - The domain to create a handler for
   * @param dependencies - Optional dependencies to inject
   * @returns The command handler instance
   */
  createHandler(domain: CLIDomain, dependencies?: Record<string, any>): ICommandHandler;

  /**
   * Register a handler class for a domain
   * @param domain - The domain to register
   * @param handlerClass - The handler class constructor
   */
  registerHandler(domain: CLIDomain, handlerClass: new (...args: any[]) => ICommandHandler): void;

  /**
   * Check if a handler is registered for a domain
   * @param domain - The domain to check
   * @returns True if handler is registered
   */
  hasHandler(domain: CLIDomain): boolean;

  /**
   * Get all registered domains
   * @returns Array of registered domain names
   */
  getRegisteredDomains(): CLIDomain[];
}

/**
 * Command execution context
 */
export interface CommandExecutionContext {
  command: CLICommand;
  handler: ICommandHandler;
  startTime: number;
  metadata?: Record<string, any>;
}

/**
 * Command middleware interface
 */
export interface ICommandMiddleware {
  /**
   * Execute middleware before command handling
   * @param context - The command execution context
   * @returns Promise that resolves to continue execution or rejects to stop
   */
  before?(context: CommandExecutionContext): Promise<void>;

  /**
   * Execute middleware after command handling
   * @param context - The command execution context
   * @param result - The command execution result
   */
  after?(context: CommandExecutionContext, result: any): Promise<void>;

  /**
   * Handle errors during command execution
   * @param context - The command execution context
   * @param error - The error that occurred
   */
  onError?(context: CommandExecutionContext, error: Error): Promise<void>;
}

/**
 * Command parser configuration
 */
export interface CommandParserConfig {
  enableLegacySupport: boolean;
  enableAliases: boolean;
  enableMiddleware: boolean;
  defaultTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Domain registration info
 */
export interface DomainRegistration {
  domain: CLIDomain;
  handlerClass: new (...args: any[]) => ICommandHandler;
  registrarClass: new (...args: any[]) => import("./IRouteRegistrar").IRouteRegistrar;
  dependencies?: Record<string, any>;
}
