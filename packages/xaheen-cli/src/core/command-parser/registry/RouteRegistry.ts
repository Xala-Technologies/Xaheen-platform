/**
 * Route Registry Implementation
 * Central registry for all command routes
 * Follows Single Responsibility Principle (SRP)
 */

import type { CommandRoute } from "../../../types/index";
import type { IRouteRegistry } from "../interfaces/IRouteRegistrar";
import { logger } from "../../../utils/logger";

export class RouteRegistry implements IRouteRegistry {
  private routes: Map<string, CommandRoute> = new Map();
  private domainRoutes: Map<string, CommandRoute[]> = new Map();

  /**
   * Register a single route
   */
  public registerRoute(route: CommandRoute): void {
    if (this.routes.has(route.pattern)) {
      logger.warn(`Route pattern '${route.pattern}' is already registered. Overwriting.`);
    }

    this.routes.set(route.pattern, route);

    // Update domain routes index
    const domainRoutes = this.domainRoutes.get(route.domain) || [];
    const existingIndex = domainRoutes.findIndex(r => r.pattern === route.pattern);
    
    if (existingIndex >= 0) {
      domainRoutes[existingIndex] = route;
    } else {
      domainRoutes.push(route);
    }
    
    this.domainRoutes.set(route.domain, domainRoutes);

    logger.debug(`Registered route: ${route.pattern} -> ${route.domain}:${route.action}`);
  }

  /**
   * Register multiple routes
   */
  public registerRoutes(routes: CommandRoute[]): void {
    routes.forEach(route => this.registerRoute(route));
  }

  /**
   * Get a route by pattern
   */
  public getRoute(pattern: string): CommandRoute | undefined {
    return this.routes.get(pattern);
  }

  /**
   * Get all routes for a domain
   */
  public getRoutesByDomain(domain: string): CommandRoute[] {
    return this.domainRoutes.get(domain) || [];
  }

  /**
   * Get all registered routes
   */
  public getAllRoutes(): CommandRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Check if a route exists
   */
  public hasRoute(pattern: string): boolean {
    return this.routes.has(pattern);
  }

  /**
   * Get route statistics
   */
  public getStatistics(): RouteRegistryStatistics {
    const domainCounts = new Map<string, number>();
    
    for (const [domain, routes] of this.domainRoutes) {
      domainCounts.set(domain, routes.length);
    }

    return {
      totalRoutes: this.routes.size,
      totalDomains: this.domainRoutes.size,
      domainCounts: Object.fromEntries(domainCounts),
      patterns: Array.from(this.routes.keys()),
    };
  }

  /**
   * Clear all routes (useful for testing)
   */
  public clear(): void {
    this.routes.clear();
    this.domainRoutes.clear();
    logger.debug('Route registry cleared');
  }

  /**
   * Find routes by action
   */
  public getRoutesByAction(action: string): CommandRoute[] {
    return Array.from(this.routes.values()).filter(route => route.action === action);
  }

  /**
   * Find routes matching a pattern (fuzzy search)
   */
  public findRoutes(searchPattern: string): CommandRoute[] {
    const normalizedSearch = searchPattern.toLowerCase();
    return Array.from(this.routes.values()).filter(route => 
      route.pattern.toLowerCase().includes(normalizedSearch) ||
      route.domain.toLowerCase().includes(normalizedSearch) ||
      route.action.toLowerCase().includes(normalizedSearch)
    );
  }

  /**
   * Validate route integrity
   */
  public validateRoutes(): RouteValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [pattern, route] of this.routes) {
      // Check for required fields
      if (!route.domain) {
        errors.push(`Route '${pattern}' missing domain`);
      }
      if (!route.action) {
        errors.push(`Route '${pattern}' missing action`);
      }
      if (!route.handler) {
        errors.push(`Route '${pattern}' missing handler`);
      }

      // Check for potential issues
      if (pattern.includes(' ') && !pattern.includes('<') && !pattern.includes('[')) {
        warnings.push(`Route '${pattern}' has spaces but no parameters - might be incorrect`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Route registry statistics
 */
export interface RouteRegistryStatistics {
  totalRoutes: number;
  totalDomains: number;
  domainCounts: Record<string, number>;
  patterns: string[];
}

/**
 * Route validation result
 */
export interface RouteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
