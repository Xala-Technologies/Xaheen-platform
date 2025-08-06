/**
 * License Route Registrar
 * Registers all license-related routes and command options
 * Follows Single Responsibility Principle (SRP)
 */

import type { Command } from 'commander';
import type { CLICommand } from "../../../types/index";
import type { CommandRoute } from "../interfaces/CommandTypes";
import type { IRouteRegistrar, IRouteRegistry, CommandOptionConfig } from "../interfaces/IRouteRegistrar";
import { logger } from "../../../utils/logger";

export class LicenseRouteRegistrar implements IRouteRegistrar {
  public readonly domain = 'license';

  /**
   * Get all license routes
   */
  public getRoutes(): CommandRoute[] {
    return [
      {
        pattern: 'license activate <key>',
        domain: 'license',
        action: 'activate',
        handler: this.createRouteHandler('activate'),
        description: 'Activate a license key',
        examples: [
          'xaheen license activate XAHEEN-XXXX-XXXX-XXXX',
          'xaheen license activate --key=XAHEEN-XXXX-XXXX-XXXX',
        ],
      },
      {
        pattern: 'license status',
        domain: 'license',
        action: 'status',
        handler: this.createRouteHandler('status'),
        description: 'Display current license status and information',
        examples: [
          'xaheen license status',
          'xaheen license status --detailed',
        ],
      },
      {
        pattern: 'license features',
        domain: 'license',
        action: 'features',
        handler: this.createRouteHandler('features'),
        description: 'List available and enabled features',
        examples: [
          'xaheen license features',
          'xaheen license features --all',
          'xaheen license features --category=generator',
        ],
      },
      {
        pattern: 'license validate',
        domain: 'license',
        action: 'validate',
        handler: this.createRouteHandler('validate'),
        description: 'Validate current license',
        examples: [
          'xaheen license validate',
          'xaheen license validate --verbose',
        ],
      },
      {
        pattern: 'license deactivate',
        domain: 'license',
        action: 'deactivate',
        handler: this.createRouteHandler('deactivate'),
        description: 'Deactivate current license',
        examples: [
          'xaheen license deactivate',
          'xaheen license deactivate --force',
        ],
      },
      {
        pattern: 'license upgrade',
        domain: 'license',
        action: 'upgrade',
        handler: this.createRouteHandler('upgrade'),
        description: 'Show upgrade options and pricing',
        examples: [
          'xaheen license upgrade',
          'xaheen license upgrade --tier=fullstack',
        ],
      },
      {
        pattern: 'license usage',
        domain: 'license',
        action: 'usage',
        handler: this.createRouteHandler('usage'),
        description: 'Display usage metrics and analytics',
        examples: [
          'xaheen license usage',
          'xaheen license usage --period=week',
          'xaheen license usage --export=json',
        ],
      },
      {
        pattern: 'license renewal',
        domain: 'license',
        action: 'renewal',
        handler: this.createRouteHandler('renewal'),
        description: 'Show renewal information and options',
        examples: [
          'xaheen license renewal',
          'xaheen license renewal --auto-renew',
        ],
      },
      {
        pattern: 'license addons',
        domain: 'license',
        action: 'addons',
        handler: this.createRouteHandler('addons'),
        description: 'Manage license add-ons and packages',
        examples: [
          'xaheen license addons',
          'xaheen license addons --available',
        ],
      },
      {
        pattern: 'license menu',
        domain: 'license',
        action: 'menu',
        handler: this.createRouteHandler('menu'),
        description: 'Interactive license management menu',
        examples: [
          'xaheen license menu',
        ],
      },
      {
        pattern: 'license diagnostics',
        domain: 'license',
        action: 'diagnostics',
        handler: this.createRouteHandler('diagnostics'),
        description: 'Run license system diagnostics',
        examples: [
          'xaheen license diagnostics',
          'xaheen license diagnostics --verbose',
        ],
      },
    ];
  }

  /**
   * Register routes with the commander program
   */
  public registerRoutes(program: Command, routeRegistry: IRouteRegistry): void {
    const routes = this.getRoutes();
    
    routes.forEach(route => {
      try {
        // Register with route registry
        routeRegistry.registerRoute(route);

        // Create commander command
        const command = program
          .command(route.pattern)
          .description(route.description || `Execute ${route.domain} ${route.action}`)
          .action(route.handler);

        // Add domain-specific options
        this.addCommandOptions(command, route.action);

        logger.debug(`Registered license route: ${route.pattern}`);
      } catch (error) {
        logger.error(`Failed to register license route ${route.pattern}:`, error);
      }
    });

    logger.info(`Registered ${routes.length} license routes`);
  }

  /**
   * Get command options for a specific action
   */
  public getCommandOptions(action: string): CommandOptionConfig[] {
    const commonOptions: CommandOptionConfig[] = [
      {
        flags: '--verbose',
        description: 'Enable verbose output',
        defaultValue: false,
      },
      {
        flags: '--json',
        description: 'Output in JSON format',
        defaultValue: false,
      },
    ];

    const actionOptions: Record<string, CommandOptionConfig[]> = {
      activate: [
        {
          flags: '--key <key>',
          description: 'License key to activate',
          required: false, // Can be provided as positional argument
        },
        {
          flags: '--offline',
          description: 'Activate in offline mode',
          defaultValue: false,
        },
      ],
      status: [
        {
          flags: '--detailed',
          description: 'Show detailed license information',
          defaultValue: false,
        },
        {
          flags: '--expiration',
          description: 'Show expiration details',
          defaultValue: false,
        },
      ],
      features: [
        {
          flags: '--all',
          description: 'Show all features (including unavailable)',
          defaultValue: false,
        },
        {
          flags: '--category <category>',
          description: 'Filter by feature category',
          choices: ['core', 'platform', 'generator', 'addon', 'enterprise'],
        },
        {
          flags: '--available-only',
          description: 'Show only available features',
          defaultValue: false,
        },
      ],
      validate: [
        {
          flags: '--server-check',
          description: 'Validate against license server',
          defaultValue: false,
        },
      ],
      deactivate: [
        {
          flags: '--force',
          description: 'Force deactivation without confirmation',
          defaultValue: false,
        },
        {
          flags: '--keep-data',
          description: 'Keep usage data after deactivation',
          defaultValue: false,
        },
      ],
      upgrade: [
        {
          flags: '--tier <tier>',
          description: 'Target license tier',
          choices: ['frontend', 'backend', 'fullstack', 'enterprise'],
        },
        {
          flags: '--compare',
          description: 'Compare current vs target tier',
          defaultValue: false,
        },
      ],
      usage: [
        {
          flags: '--period <period>',
          description: 'Usage period to display',
          choices: ['day', 'week', 'month', 'year'],
          defaultValue: 'month',
        },
        {
          flags: '--export <format>',
          description: 'Export usage data',
          choices: ['json', 'csv', 'html'],
        },
        {
          flags: '--feature <feature>',
          description: 'Show usage for specific feature',
        },
      ],
      renewal: [
        {
          flags: '--auto-renew',
          description: 'Enable auto-renewal',
          defaultValue: false,
        },
        {
          flags: '--payment-method <method>',
          description: 'Payment method for renewal',
          choices: ['card', 'invoice', 'paypal'],
        },
      ],
      addons: [
        {
          flags: '--available',
          description: 'Show available add-ons',
          defaultValue: false,
        },
        {
          flags: '--installed',
          description: 'Show installed add-ons',
          defaultValue: false,
        },
        {
          flags: '--category <category>',
          description: 'Filter by add-on category',
          choices: ['compliance', 'integration', 'monitoring', 'ai'],
        },
      ],
      diagnostics: [
        {
          flags: '--fix',
          description: 'Attempt to fix detected issues',
          defaultValue: false,
        },
        {
          flags: '--export <file>',
          description: 'Export diagnostics report',
        },
      ],
    };

    return [...commonOptions, ...(actionOptions[action] || [])];
  }

  /**
   * Add command-specific options to a commander command
   */
  private addCommandOptions(command: Command, action: string): void {
    const options = this.getCommandOptions(action);
    
    options.forEach(option => {
      if (option.choices) {
        command.option(option.flags, option.description, option.defaultValue);
      } else {
        command.option(option.flags, option.description, option.defaultValue);
      }
    });
  }

  /**
   * Create a route handler that delegates to the command handler factory
   */
  private createRouteHandler(action: string): (command: CLICommand) => Promise<void> {
    return async (command: CLICommand) => {
      // Get the handler factory from global context
      const handlerFactory = global.__xaheen_cli?.handlerFactory;
      if (!handlerFactory) {
        throw new Error('Command handler factory not available');
      }

      // Create a command object with the specified action
      const licenseCommand: CLICommand = {
        ...command,
        domain: this.domain,
        action
      };

      // Get the handler and execute
      const handler = handlerFactory.createHandler('license');
      await handler.execute(licenseCommand);
    };
  }

  /**
   * Get registrar metadata
   */
  public getMetadata(): LicenseRouteRegistrarMetadata {
    const routes = this.getRoutes();
    return {
      domain: this.domain,
      routeCount: routes.length,
      description: 'License management routes for feature-gated licensing system',
      version: '1.0.0',
      actions: routes.map(r => r.action),
      patterns: routes.map(r => r.pattern),
    };
  }
}

/**
 * License route registrar metadata
 */
export interface LicenseRouteRegistrarMetadata {
  domain: string;
  routeCount: number;
  description: string;
  version: string;
  actions: string[];
  patterns: string[];
}
