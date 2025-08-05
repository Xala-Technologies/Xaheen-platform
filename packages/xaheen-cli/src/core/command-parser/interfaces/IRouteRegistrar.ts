/**
 * Route Registrar Interface
 * Defines the contract for domain-specific route registration
 * Follows Single Responsibility Principle (SRP)
 */

import type { Command } from 'commander';
import type { CommandRoute } from '../../../types/index.js';

export interface IRouteRegistrar {
  /**
   * The domain this registrar handles
   */
  readonly domain: string;

  /**
   * Get all routes for this domain
   * @returns Array of command routes
   */
  getRoutes(): CommandRoute[];

  /**
   * Register routes with the commander program
   * @param program - The commander program instance
   * @param routeRegistry - The route registry for registration
   */
  registerRoutes(program: Command, routeRegistry: IRouteRegistry): void;

  /**
   * Get domain-specific command options
   * @param action - The action to get options for
   * @returns Command options configuration
   */
  getCommandOptions(action: string): CommandOptionConfig[];
}

/**
 * Route Registry Interface
 * Central registry for all command routes
 */
export interface IRouteRegistry {
  /**
   * Register a single route
   * @param route - The route to register
   */
  registerRoute(route: CommandRoute): void;

  /**
   * Register multiple routes
   * @param routes - Array of routes to register
   */
  registerRoutes(routes: CommandRoute[]): void;

  /**
   * Get a route by pattern
   * @param pattern - The command pattern to find
   * @returns The matching route or undefined
   */
  getRoute(pattern: string): CommandRoute | undefined;

  /**
   * Get all routes for a domain
   * @param domain - The domain to get routes for
   * @returns Array of routes for the domain
   */
  getRoutesByDomain(domain: string): CommandRoute[];

  /**
   * Get all registered routes
   * @returns Array of all routes
   */
  getAllRoutes(): CommandRoute[];

  /**
   * Check if a route exists
   * @param pattern - The command pattern to check
   * @returns True if route exists
   */
  hasRoute(pattern: string): boolean;
}

/**
 * Command option configuration
 */
export interface CommandOptionConfig {
  flags: string;
  description: string;
  defaultValue?: any;
  choices?: string[];
  required?: boolean;
}

/**
 * Route registrar metadata
 */
export interface RouteRegistrarMetadata {
  domain: string;
  routeCount: number;
  description: string;
  version: string;
}
