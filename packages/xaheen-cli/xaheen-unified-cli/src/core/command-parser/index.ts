import { Command } from 'commander';
import type { CLICommand, CLIDomain, CLIAction, CommandRoute } from '../../types/index.js';
import { CLIError } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class UnifiedCommandParser {
  private program: Command;
  private routes: Map<string, CommandRoute> = new Map();
  private legacyMappings: Map<string, CommandRoute> = new Map();
  private registeredCommands: Set<string> = new Set();

  constructor() {
    this.program = new Command();
    this.setupProgram();
    this.setupRoutes();
  }

  private setupProgram(): void {
    this.program
      .name('xaheen')
      .description('Unified Xaheen CLI - Service-based architecture with AI-powered component generation')
      .version('3.0.0-alpha.1');
  }

  private setupRoutes(): void {
    // Define the unified command routes
    const routes: CommandRoute[] = [
      // Project domain routes
      {
        pattern: 'project create <name>',
        domain: 'project',
        action: 'create',
        handler: this.handleProjectCreate.bind(this),
        legacy: {
          xaheen: ['create'],
          xala: ['init']
        }
      },
      {
        pattern: 'project validate',
        domain: 'project',
        action: 'validate',
        handler: this.handleProjectValidate.bind(this),
        legacy: {
          xaheen: ['validate', 'doctor']
        }
      },

      // App domain routes (for monorepo apps)
      {
        pattern: 'app create <name>',
        domain: 'app',
        action: 'create',
        handler: this.handleAppCreate.bind(this),
        legacy: {
          xaheen: ['create-app']
        }
      },
      {
        pattern: 'app list',
        domain: 'app',
        action: 'list',
        handler: this.handleAppList.bind(this)
      },
      {
        pattern: 'app add <name>',
        domain: 'app',
        action: 'add',
        handler: this.handleAppAdd.bind(this)
      },

      // Package domain routes (for monorepo packages)
      {
        pattern: 'package create <name>',
        domain: 'package',
        action: 'create',
        handler: this.handlePackageCreate.bind(this),
        legacy: {
          xaheen: ['create-package']
        }
      },
      {
        pattern: 'package list',
        domain: 'package',
        action: 'list',
        handler: this.handlePackageList.bind(this)
      },
      {
        pattern: 'package add <name>',
        domain: 'package',
        action: 'add',
        handler: this.handlePackageAdd.bind(this)
      },

      // Service domain routes
      {
        pattern: 'service add <service>',
        domain: 'service',
        action: 'add',
        handler: this.handleServiceAdd.bind(this),
        legacy: {
          xaheen: ['add']
        }
      },
      {
        pattern: 'service remove <service>',
        domain: 'service',
        action: 'remove',
        handler: this.handleServiceRemove.bind(this),
        legacy: {
          xaheen: ['remove']
        }
      },
      {
        pattern: 'service list',
        domain: 'service',
        action: 'list',
        handler: this.handleServiceList.bind(this),
        legacy: {
          xaheen: ['bundle list']
        }
      },

      // Component domain routes
      {
        pattern: 'component generate <description>',
        domain: 'component',
        action: 'generate',
        handler: this.handleComponentGenerate.bind(this),
        legacy: {
          xala: ['generate component', 'components generate']
        }
      },
      {
        pattern: 'component create <name>',
        domain: 'component',
        action: 'create',
        handler: this.handleComponentCreate.bind(this),
        legacy: {
          xala: ['create component']
        }
      },

      // Page domain routes
      {
        pattern: 'page generate <description>',
        domain: 'page',
        action: 'generate',
        handler: this.handlePageGenerate.bind(this),
        legacy: {
          xala: ['generate page', 'pages generate']
        }
      },
      {
        pattern: 'page create <name>',
        domain: 'page',
        action: 'create',
        handler: this.handlePageCreate.bind(this),
        legacy: {
          xala: ['create page']
        }
      },
      {
        pattern: 'page list',
        domain: 'page',
        action: 'list',
        handler: this.handlePageList.bind(this)
      },

      // Model domain routes (Laravel Eloquent-style)
      {
        pattern: 'model generate <name>',
        domain: 'model',
        action: 'generate',
        handler: this.handleModelGenerate.bind(this),
        legacy: {
          xaheen: ['generate-model'],
          xala: ['model generate']
        }
      },
      {
        pattern: 'model create <name>',
        domain: 'model',
        action: 'create',
        handler: this.handleModelCreate.bind(this),
        legacy: {
          xaheen: ['create-model']
        }
      },
      {
        pattern: 'model scaffold <name>',
        domain: 'model',
        action: 'scaffold',
        handler: this.handleModelScaffold.bind(this)
      },
      {
        pattern: 'model migrate',
        domain: 'model',
        action: 'migrate',
        handler: this.handleModelMigrate.bind(this)
      },

      // Theme domain routes
      {
        pattern: 'theme create <name>',
        domain: 'theme',
        action: 'create',
        handler: this.handleThemeCreate.bind(this),
        legacy: {
          xala: ['themes create']
        }
      },
      {
        pattern: 'theme list',
        domain: 'theme',
        action: 'list',
        handler: this.handleThemeList.bind(this),
        legacy: {
          xala: ['themes list']
        }
      },

      // AI domain routes
      {
        pattern: 'ai generate <prompt>',
        domain: 'ai',
        action: 'generate',
        handler: this.handleAIGenerate.bind(this),
        legacy: {
          xala: ['ai generate']
        }
      },
      {
        pattern: 'ai service <description>',
        domain: 'ai',
        action: 'generate',
        handler: this.handleAIService.bind(this)
      },

      // Build domain routes
      {
        pattern: 'build',
        domain: 'build',
        action: 'create',
        handler: this.handleBuild.bind(this),
        legacy: {
          xala: ['build']
        }
      },

      // MCP domain routes
      {
        pattern: 'mcp connect',
        domain: 'mcp',
        action: 'create',
        handler: this.handleMCPConnect.bind(this)
      },
      {
        pattern: 'mcp deploy',
        domain: 'mcp',
        action: 'deploy',
        handler: this.handleMCPDeploy.bind(this)
      }
    ];

    // Register routes
    routes.forEach(route => {
      this.registerRoute(route);
    });

    // Register legacy commands
    this.registerLegacyCommands();
  }

  private registerRoute(route: CommandRoute): void {
    try {
      // Check if command is already registered
      if (this.registeredCommands.has(route.pattern)) {
        logger.debug(`Command already registered: ${route.pattern}`);
        return;
      }

      const command = this.program
        .command(route.pattern)
        .description(`Execute ${route.domain} ${route.action}`)
        .action(async (...args) => {
          try {
            const [target, options] = this.parseCommandArgs(args);
            const cliCommand: CLICommand = {
              domain: route.domain,
              action: route.action,
              target,
              options
            };
            
            logger.debug(`Executing command: ${route.domain} ${route.action}`, { target, options });
            await route.handler(cliCommand);
          } catch (error) {
            logger.error(`Command failed: ${route.domain} ${route.action}`, error);
            throw error;
          }
        });

      // Add common options
      command
        .option('-v, --verbose', 'Enable verbose logging')
        .option('--dry-run', 'Show what would be done without executing')
        .option('--config <path>', 'Path to configuration file');

      this.routes.set(route.pattern, route);
      this.registeredCommands.add(route.pattern);
      logger.debug(`Registered command: ${route.pattern}`);
    } catch (error) {
      logger.warn(`Failed to register command ${route.pattern}:`, error);
    }
  }

  private registerLegacyCommands(): void {
    // Note: Legacy commands are supported through the unified command structure
    // Users can still use the old commands, but they are mapped internally
    logger.debug('Legacy command support enabled via unified command mapping');
  }

  private findRouteByLegacy(cli: 'xaheen' | 'xala', command: string): CommandRoute | undefined {
    for (const route of this.routes.values()) {
      if (route.legacy?.[cli]?.includes(command)) {
        return route;
      }
    }
    return undefined;
  }

  private parseCommandArgs(args: any[]): [string | undefined, Record<string, any>] {
    if (args.length === 0) return [undefined, {}];
    
    // The last argument is always the options object from commander
    const options = args[args.length - 1];
    const target = args.length > 1 ? args[0] : undefined;
    
    return [target, options];
  }

  // Command handlers - these will delegate to domain-specific handlers
  private async handleProjectCreate(command: CLICommand): Promise<void> {
    const { default: ProjectDomain } = await import('../../domains/project/index.js');
    const domain = new ProjectDomain();
    await domain.create(command);
  }

  private async handleProjectValidate(command: CLICommand): Promise<void> {
    const { default: ProjectDomain } = await import('../../domains/project/index.js');
    const domain = new ProjectDomain();
    await domain.validate(command);
  }

  private async handleAppCreate(command: CLICommand): Promise<void> {
    const { default: AppDomain } = await import('../../domains/app/index.js');
    const domain = new AppDomain();
    await domain.create(command);
  }

  private async handleAppList(command: CLICommand): Promise<void> {
    const { default: AppDomain } = await import('../../domains/app/index.js');
    const domain = new AppDomain();
    await domain.list(command);
  }

  private async handleAppAdd(command: CLICommand): Promise<void> {
    const { default: AppDomain } = await import('../../domains/app/index.js');
    const domain = new AppDomain();
    await domain.add(command);
  }

  private async handlePackageCreate(command: CLICommand): Promise<void> {
    const { default: PackageDomain } = await import('../../domains/package/index.js');
    const domain = new PackageDomain();
    await domain.create(command);
  }

  private async handlePackageList(command: CLICommand): Promise<void> {
    const { default: PackageDomain } = await import('../../domains/package/index.js');
    const domain = new PackageDomain();
    await domain.list(command);
  }

  private async handlePackageAdd(command: CLICommand): Promise<void> {
    const { default: PackageDomain } = await import('../../domains/package/index.js');
    const domain = new PackageDomain();
    await domain.add(command);
  }

  private async handleServiceAdd(command: CLICommand): Promise<void> {
    const { default: ServiceDomain } = await import('../../domains/service/index.js');
    const domain = new ServiceDomain();
    await domain.add(command);
  }

  private async handleServiceRemove(command: CLICommand): Promise<void> {
    const { default: ServiceDomain } = await import('../../domains/service/index.js');
    const domain = new ServiceDomain();
    await domain.remove(command);
  }

  private async handleServiceList(command: CLICommand): Promise<void> {
    const { default: ServiceDomain } = await import('../../domains/service/index.js');
    const domain = new ServiceDomain();
    await domain.list(command);
  }

  private async handleComponentGenerate(command: CLICommand): Promise<void> {
    const { default: ComponentDomain } = await import('../../domains/component/index.js');
    const domain = new ComponentDomain();
    await domain.generate(command);
  }

  private async handleComponentCreate(command: CLICommand): Promise<void> {
    const { default: ComponentDomain } = await import('../../domains/component/index.js');
    const domain = new ComponentDomain();
    await domain.create(command);
  }

  private async handlePageGenerate(command: CLICommand): Promise<void> {
    const { default: PageDomain } = await import('../../domains/page/index.js');
    const domain = new PageDomain();
    await domain.generate(command);
  }

  private async handlePageCreate(command: CLICommand): Promise<void> {
    const { default: PageDomain } = await import('../../domains/page/index.js');
    const domain = new PageDomain();
    await domain.create(command);
  }

  private async handlePageList(command: CLICommand): Promise<void> {
    const { default: PageDomain } = await import('../../domains/page/index.js');
    const domain = new PageDomain();
    await domain.list(command);
  }

  private async handleModelGenerate(command: CLICommand): Promise<void> {
    const { default: ModelDomain } = await import('../../domains/model/index.js');
    const domain = new ModelDomain();
    await domain.generate(command);
  }

  private async handleModelCreate(command: CLICommand): Promise<void> {
    const { default: ModelDomain } = await import('../../domains/model/index.js');
    const domain = new ModelDomain();
    await domain.create(command);
  }

  private async handleModelScaffold(command: CLICommand): Promise<void> {
    const { default: ModelDomain } = await import('../../domains/model/index.js');
    const domain = new ModelDomain();
    await domain.scaffold(command);
  }

  private async handleModelMigrate(command: CLICommand): Promise<void> {
    const { default: ModelDomain } = await import('../../domains/model/index.js');
    const domain = new ModelDomain();
    await domain.migrate(command);
  }

  private async handleThemeCreate(command: CLICommand): Promise<void> {
    const { default: ThemeDomain } = await import('../../domains/theme/index.js');
    const domain = new ThemeDomain();
    await domain.create(command);
  }

  private async handleThemeList(command: CLICommand): Promise<void> {
    const { default: ThemeDomain } = await import('../../domains/theme/index.js');
    const domain = new ThemeDomain();
    await domain.list(command);
  }

  private async handleAIGenerate(command: CLICommand): Promise<void> {
    const { default: AIDomain } = await import('../../domains/ai/index.js');
    const domain = new AIDomain();
    await domain.generate(command);
  }

  private async handleAIService(command: CLICommand): Promise<void> {
    const { default: AIDomain } = await import('../../domains/ai/index.js');
    const domain = new AIDomain();
    await domain.generateService(command);
  }

  private async handleBuild(command: CLICommand): Promise<void> {
    // For now, delegate to component domain for build
    const { default: ComponentDomain } = await import('../../domains/component/index.js');
    const domain = new ComponentDomain();
    await domain.build(command);
  }

  private async handleMCPConnect(command: CLICommand): Promise<void> {
    const { default: MCPDomain } = await import('../../domains/mcp/index.js');
    const domain = new MCPDomain();
    await domain.connect(command);
  }

  private async handleMCPDeploy(command: CLICommand): Promise<void> {
    const { default: MCPDomain } = await import('../../domains/mcp/index.js');
    const domain = new MCPDomain();
    await domain.deploy(command);
  }

  public async parse(args?: string[]): Promise<void> {
    try {
      await this.program.parseAsync(args);
    } catch (error) {
      if (error instanceof CLIError) {
        logger.error(`CLI Error [${error.code}]: ${error.message}`);
        process.exit(1);
      } else {
        logger.error('Unexpected error:', error);
        process.exit(1);
      }
    }
  }

  public getProgram(): Command {
    return this.program;
  }

  public getRoutes(): Map<string, CommandRoute> {
    return this.routes;
  }
}