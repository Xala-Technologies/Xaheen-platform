/**
 * Comprehensive Tests for CommandParser
 * 
 * Tests command registration, route handling, argument parsing,
 * alias resolution, and all command execution paths.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { CommandParser } from './index';
import type { CLICommand, CommandRoute } from '../../types/index';

// Mock all external dependencies
vi.mock('../../middleware/alias-resolver.middleware', () => ({
  AliasResolverMiddleware: vi.fn().mockImplementation(() => ({
    getAliasManager: vi.fn().mockReturnValue({
      getAllAliases: vi.fn().mockReturnValue([
        {
          alias: 'c',
          originalCommand: 'component create',
          description: 'Create component shortcut'
        }
      ])
    }),
    processArguments: vi.fn().mockReturnValue({
      resolved: true,
      command: { domain: 'component', action: 'create', target: 'TestComponent' }
    }),
    showAliasHelp: vi.fn().mockReturnValue('Alias help text')
  }))
}));

vi.mock('./handlers/RegistryCommandHandler', () => ({
  RegistryCommandHandler: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('../../commands/ai-generate', () => ({
  aiGenerateCommand: {
    getCommand: vi.fn().mockReturnValue(new Command('ai-generate'))
  }
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('../../types/index', () => ({
  CLIError: class CLIError extends Error {
    constructor(message: string, public code: string = 'GENERAL_ERROR') {
      super(message);
      this.name = 'CLIError';
    }
  }
}));

// Mock all domain imports
const mockDomains = {
  project: { create: vi.fn(), validate: vi.fn() },
  app: { create: vi.fn(), list: vi.fn(), add: vi.fn() },
  package: { create: vi.fn(), list: vi.fn(), add: vi.fn() },
  service: { add: vi.fn(), remove: vi.fn(), list: vi.fn() },
  component: { generate: vi.fn(), create: vi.fn(), build: vi.fn() },
  page: { generate: vi.fn(), create: vi.fn(), list: vi.fn() },
  model: { generate: vi.fn(), create: vi.fn(), scaffold: vi.fn(), migrate: vi.fn() },
  theme: { create: vi.fn(), list: vi.fn() },
  template: { list: vi.fn(), create: vi.fn(), extend: vi.fn(), compose: vi.fn(), init: vi.fn(), generate: vi.fn() },
  ai: { generate: vi.fn(), generateService: vi.fn() },
  mcp: { 
    connect: vi.fn(), index: vi.fn(), deploy: vi.fn(), analyze: vi.fn(), 
    suggestions: vi.fn(), context: vi.fn(), generate: vi.fn(), list: vi.fn(),
    info: vi.fn(), disconnect: vi.fn(), test: vi.fn(), configInit: vi.fn(),
    configShow: vi.fn(), pluginList: vi.fn(), pluginRegister: vi.fn(),
    pluginUnregister: vi.fn(), pluginEnable: vi.fn(), pluginDisable: vi.fn()
  },
  help: { show: vi.fn(), search: vi.fn(), examples: vi.fn() },
  make: { execute: vi.fn() }
};

// Mock domain modules
Object.entries(mockDomains).forEach(([domain, methods]) => {
  vi.doMock(`../../domains/${domain}/index`, () => ({
    default: vi.fn().mockImplementation(() => methods)
  }));
});

// Mock command modules
vi.mock('../../commands/ai', () => ({
  codebuffCommand: vi.fn(),
  fixTestsCommand: vi.fn(),
  norwegianComplianceCommand: vi.fn()
}));

vi.mock('../../lib/patch-utils', () => ({
  createCodebuffIndex: vi.fn()
}));

vi.mock('../../commands/security-audit', () => ({
  securityAuditCommand: { parseAsync: vi.fn() }
}));

vi.mock('../../commands/compliance-report', () => ({
  complianceReportCommand: { parseAsync: vi.fn() }
}));

vi.mock('../../commands/license-compliance', () => ({
  createLicenseComplianceCommand: () => ({ parseAsync: vi.fn() })
}));

vi.mock('../../commands/security-scan.command', () => ({
  securityScanCommand: { parseAsync: vi.fn() }
}));

vi.mock('../../commands/modernize-templates', () => ({
  modernizeTemplatesCommand: { parseAsync: vi.fn() }
}));

vi.mock('../../commands/docs', () => ({
  docsCommand: { parseAsync: vi.fn() }
}));

vi.mock('../../commands/deploy', () => ({
  createDeployCommand: () => ({ parseAsync: vi.fn() })
}));

describe('CommandParser', () => {
  let parser: CommandParser;
  let mockConsoleLog: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog = vi.fn();
    console.log = mockConsoleLog;
    
    // Reset singleton instance
    (CommandParser as any).instance = undefined;
    parser = new CommandParser();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize as singleton', () => {
      const parser1 = new CommandParser();
      const parser2 = new CommandParser();
      expect(parser1).toBe(parser2);
    });

    it('should get singleton instance', () => {
      const instance1 = CommandParser.getInstance();
      const instance2 = CommandParser.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton instance', () => {
      const instance1 = CommandParser.getInstance();
      CommandParser.reset();
      const instance2 = CommandParser.getInstance();
      expect(instance1).not.toBe(instance2);
    });

    it('should setup program with correct metadata', () => {
      const program = parser.getProgram();
      expect(program.name()).toBe('xaheen');
      expect(program.description()).toContain('Service-based architecture');
      expect(program.version()).toBe('3.0.0');
    });

    it('should register all command routes', () => {
      const routes = parser.getRoutes();
      expect(routes.size).toBeGreaterThan(50); // We have many routes
      
      // Check some key routes exist
      expect(Array.from(routes.keys())).toContain('project create <name>');
      expect(Array.from(routes.keys())).toContain('registry add <components...>');
      expect(Array.from(routes.keys())).toContain('ai generate <prompt>');
    });
  });

  describe('Command Registration', () => {
    it('should register route with handler', () => {
      const testRoute: CommandRoute = {
        pattern: 'test command <arg>',
        domain: 'test',
        action: 'command',
        handler: vi.fn()
      };
      
      (parser as any).registerRoute(testRoute);
      
      const routes = parser.getRoutes();
      expect(routes.has('test command <arg>')).toBe(true);
      expect(routes.get('test command <arg>')).toBe(testRoute);
    });

    it('should not register duplicate commands', () => {
      const { logger } = require('../../utils/logger');
      
      const testRoute: CommandRoute = {
        pattern: 'duplicate <arg>',
        domain: 'test',
        action: 'duplicate',
        handler: vi.fn()
      };
      
      (parser as any).registerRoute(testRoute);
      (parser as any).registerRoute(testRoute);
      
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Command already registered')
      );
    });

    it('should handle route registration errors gracefully', () => {
      const { logger } = require('../../utils/logger');
      
      const invalidRoute = {
        pattern: null,
        domain: 'test',
        action: 'test',
        handler: vi.fn()
      } as any;
      
      (parser as any).registerRoute(invalidRoute);
      
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to register command'),
        expect.any(Error)
      );
    });
  });

  describe('Argument Parsing', () => {
    it('should parse command arguments correctly', () => {
      const args = ['target-value', { verbose: true, dryRun: false }];
      const [target, options] = (parser as any).parseCommandArgs(args);
      
      expect(target).toBe('target-value');
      expect(options).toEqual({ verbose: true, dryRun: false });
    });

    it('should handle empty arguments', () => {
      const [target, options] = (parser as any).parseCommandArgs([]);
      
      expect(target).toBeUndefined();
      expect(options).toEqual({});
    });

    it('should handle options-only arguments', () => {
      const args = [{ verbose: true }];
      const [target, options] = (parser as any).parseCommandArgs(args);
      
      expect(target).toBeUndefined();
      expect(options).toEqual({ verbose: true });
    });
  });

  describe('Alias Commands', () => {
    it('should setup alias commands', () => {
      // The constructor already calls setupAliasCommands
      const program = parser.getProgram();
      const commands = program.commands.map(cmd => cmd.name());
      
      expect(commands).toContain('c'); // Alias for component create
    });

    it('should find route for command', () => {
      const testCommand: CLICommand = {
        domain: 'project',
        action: 'create',
        target: 'test-project',
        arguments: {},
        options: {}
      };
      
      const route = (parser as any).findRouteForCommand(testCommand);
      expect(route).toBeDefined();
      expect(route.domain).toBe('project');
      expect(route.action).toBe('create');
    });

    it('should handle alias resolution errors', () => {
      const { logger } = require('../../utils/logger');
      
      // Mock alias manager to return invalid alias
      const aliasResolver = (parser as any).aliasResolver;
      aliasResolver.getAliasManager().getAllAliases.mockReturnValue([
        { alias: 'invalid', originalCommand: 'nonexistent', description: 'Invalid alias' }
      ]);
      
      // Re-initialize with invalid alias
      CommandParser.reset();
      parser = new CommandParser();
      
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to register alias command'),
        expect.any(Error)
      );
    });
  });

  describe('Command Execution', () => {
    describe('Project Domain', () => {
      it('should handle project create command', async () => {
        const command: CLICommand = {
          domain: 'project',
          action: 'create',
          target: 'test-project',
          arguments: { target: 'test-project' },
          options: {}
        };
        
        await (parser as any).handleProjectCreate(command);
        expect(mockDomains.project.create).toHaveBeenCalledWith(command);
      });

      it('should handle project validate command', async () => {
        const command: CLICommand = {
          domain: 'project',
          action: 'validate',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleProjectValidate(command);
        expect(mockDomains.project.validate).toHaveBeenCalledWith(command);
      });
    });

    describe('App Domain', () => {
      it('should handle app create command', async () => {
        const command: CLICommand = {
          domain: 'app',
          action: 'create',
          target: 'test-app',
          arguments: { target: 'test-app' },
          options: {}
        };
        
        await (parser as any).handleAppCreate(command);
        expect(mockDomains.app.create).toHaveBeenCalledWith(command);
      });

      it('should handle app list command', async () => {
        const command: CLICommand = {
          domain: 'app',
          action: 'list',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleAppList(command);
        expect(mockDomains.app.list).toHaveBeenCalledWith(command);
      });

      it('should handle app add command', async () => {
        const command: CLICommand = {
          domain: 'app',
          action: 'add',
          target: 'test-app',
          arguments: { target: 'test-app' },
          options: {}
        };
        
        await (parser as any).handleAppAdd(command);
        expect(mockDomains.app.add).toHaveBeenCalledWith(command);
      });
    });

    describe('Service Domain', () => {
      it('should handle service add command', async () => {
        const command: CLICommand = {
          domain: 'service',
          action: 'add',
          target: 'auth-service',
          arguments: { target: 'auth-service' },
          options: {}
        };
        
        await (parser as any).handleServiceAdd(command);
        expect(mockDomains.service.add).toHaveBeenCalledWith(command);
      });

      it('should handle service remove command', async () => {
        const command: CLICommand = {
          domain: 'service',
          action: 'remove',
          target: 'auth-service',
          arguments: { target: 'auth-service' },
          options: {}
        };
        
        await (parser as any).handleServiceRemove(command);
        expect(mockDomains.service.remove).toHaveBeenCalledWith(command);
      });

      it('should handle service list command', async () => {
        const command: CLICommand = {
          domain: 'service',
          action: 'list',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleServiceList(command);
        expect(mockDomains.service.list).toHaveBeenCalledWith(command);
      });
    });

    describe('Component Domain', () => {
      it('should handle component generate command', async () => {
        const command: CLICommand = {
          domain: 'component',
          action: 'generate',
          target: 'Generate a button component',
          arguments: { target: 'Generate a button component' },
          options: {}
        };
        
        await (parser as any).handleComponentGenerate(command);
        expect(mockDomains.component.generate).toHaveBeenCalledWith(command);
      });

      it('should handle component create command', async () => {
        const command: CLICommand = {
          domain: 'component',
          action: 'create',
          target: 'Button',
          arguments: { target: 'Button' },
          options: {}
        };
        
        await (parser as any).handleComponentCreate(command);
        expect(mockDomains.component.create).toHaveBeenCalledWith(command);
      });
    });

    describe('AI Domain', () => {
      it('should handle AI generate command', async () => {
        const command: CLICommand = {
          domain: 'ai',
          action: 'generate',
          target: 'Create a login form',
          arguments: { target: 'Create a login form' },
          options: {}
        };
        
        await (parser as any).handleAIGenerate(command);
        expect(mockDomains.ai.generate).toHaveBeenCalledWith(command);
      });

      it('should handle AI service command', async () => {
        const command: CLICommand = {
          domain: 'ai',
          action: 'generate',
          target: 'User authentication service',
          arguments: { target: 'User authentication service' },
          options: {}
        };
        
        await (parser as any).handleAIService(command);
        expect(mockDomains.ai.generateService).toHaveBeenCalledWith(command);
      });

      it('should handle AI code command', async () => {
        const { codebuffCommand } = require('../../commands/ai');
        
        const command: CLICommand = {
          domain: 'ai',
          action: 'code',
          target: 'Fix this function',
          arguments: { target: 'Fix this function' },
          options: { model: 'gpt-4', dryRun: true }
        };
        
        await (parser as any).handleAICode(command);
        expect(codebuffCommand).toHaveBeenCalledWith('Fix this function', {
          model: 'gpt-4',
          dryRun: true,
          autoCommit: true,
          interactive: true,
          index: undefined
        });
      });

      it('should handle AI fix tests command', async () => {
        const { fixTestsCommand } = require('../../commands/ai');
        
        const command: CLICommand = {
          domain: 'ai',
          action: 'fix-tests',
          arguments: {},
          options: { model: 'gpt-4' }
        };
        
        await (parser as any).handleAIFixTests(command);
        expect(fixTestsCommand).toHaveBeenCalledWith({
          model: 'gpt-4',
          dryRun: undefined,
          autoCommit: true,
          interactive: true
        });
      });

      it('should handle AI Norwegian command', async () => {
        const { norwegianComplianceCommand } = require('../../commands/ai');
        
        const command: CLICommand = {
          domain: 'ai',
          action: 'norwegian',
          target: 'Make this GDPR compliant',
          arguments: { target: 'Make this GDPR compliant' },
          options: { dryRun: false }
        };
        
        await (parser as any).handleAINorwegian(command);
        expect(norwegianComplianceCommand).toHaveBeenCalledWith('Make this GDPR compliant', {
          model: undefined,
          dryRun: false,
          autoCommit: true,
          interactive: true,
          index: undefined
        });
      });

      it('should handle AI index command', async () => {
        const { createCodebuffIndex } = require('../../lib/patch-utils');
        
        const command: CLICommand = {
          domain: 'ai',
          action: 'index',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleAIIndex(command);
        expect(createCodebuffIndex).toHaveBeenCalledWith(process.cwd());
      });
    });

    describe('Registry Domain', () => {
      it('should handle registry add command', async () => {
        const command: CLICommand = {
          domain: 'registry',
          action: 'add',
          target: 'button',
          arguments: {},
          options: {}
        };
        
        const registryHandler = (parser as any).registryHandler;
        await (parser as any).handleRegistryAdd(command);
        
        expect(registryHandler.execute).toHaveBeenCalledWith({
          ...command,
          arguments: { components: ['button'] }
        });
      });

      it('should handle registry list command', async () => {
        const command: CLICommand = {
          domain: 'registry',
          action: 'list',
          arguments: {},
          options: {}
        };
        
        const registryHandler = (parser as any).registryHandler;
        await (parser as any).handleRegistryList(command);
        
        expect(registryHandler.execute).toHaveBeenCalledWith({
          ...command,
          action: 'list'
        });
      });

      it('should handle registry search command', async () => {
        const command: CLICommand = {
          domain: 'registry',
          action: 'search',
          target: 'button',
          arguments: {},
          options: {}
        };
        
        const registryHandler = (parser as any).registryHandler;
        await (parser as any).handleRegistrySearch(command);
        
        expect(registryHandler.execute).toHaveBeenCalledWith({
          ...command,
          action: 'search',
          arguments: { query: 'button' }
        });
      });

      it('should handle registry command errors', async () => {
        const { logger } = require('../../utils/logger');
        const registryHandler = (parser as any).registryHandler;
        
        registryHandler.execute.mockRejectedValue(new Error('Registry error'));
        
        const command: CLICommand = {
          domain: 'registry',
          action: 'add',
          target: 'button',
          arguments: {},
          options: {}
        };
        
        await expect(
          (parser as any).handleRegistryAdd(command)
        ).rejects.toThrow('Registry error');
        
        expect(logger.error).toHaveBeenCalledWith(
          'Registry add command failed:', 
          expect.any(Error)
        );
      });
    });

    describe('MCP Domain', () => {
      it('should handle MCP connect command', async () => {
        const command: CLICommand = {
          domain: 'mcp',
          action: 'create',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleMCPConnect(command);
        expect(mockDomains.mcp.connect).toHaveBeenCalledWith(command);
      });

      it('should handle MCP test command', async () => {
        const command: CLICommand = {
          domain: 'mcp',
          action: 'test',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleMCPTest(command);
        expect(mockDomains.mcp.test).toHaveBeenCalledWith(command);
      });

      it('should handle all MCP plugin commands', async () => {
        const pluginCommands = [
          'pluginList', 'pluginRegister', 'pluginUnregister', 
          'pluginEnable', 'pluginDisable'
        ];
        
        for (const action of pluginCommands) {
          const command: CLICommand = {
            domain: 'mcp',
            action,
            arguments: {},
            options: {}
          };
          
          await (parser as any)[`handleMCP${action.charAt(0).toUpperCase() + action.slice(1)}`](command);
          expect(mockDomains.mcp[action]).toHaveBeenCalledWith(command);
        }
      });
    });

    describe('Security Commands', () => {
      it('should handle security audit command', async () => {
        const { securityAuditCommand } = require('../../commands/security-audit');
        
        const command: CLICommand = {
          domain: 'security',
          action: 'audit',
          arguments: {},
          options: { tools: 'npm-audit', format: 'json' }
        };
        
        await (parser as any).handleSecurityAudit(command);
        expect(securityAuditCommand.parseAsync).toHaveBeenCalledWith([
          '--tools', 'npm-audit',
          '--format', 'json'
        ]);
      });

      it('should handle compliance report command', async () => {
        const { complianceReportCommand } = require('../../commands/compliance-report');
        
        const command: CLICommand = {
          domain: 'security',
          action: 'compliance',
          arguments: {},
          options: { standards: 'gdpr,owasp', format: 'html' }
        };
        
        await (parser as any).handleComplianceReport(command);
        expect(complianceReportCommand.parseAsync).toHaveBeenCalledWith([
          '--standards', 'gdpr,owasp',
          '--format', 'html'
        ]);
      });

      it('should handle security scan command', async () => {
        const { securityScanCommand } = require('../../commands/security-scan.command');
        
        const command: CLICommand = {
          domain: 'security',
          action: 'scan',
          arguments: {},
          options: { types: 'code,deps', format: 'sarif' },
          args: ['/path/to/project']
        };
        
        await (parser as any).handleSecurityScan(command);
        expect(securityScanCommand.parseAsync).toHaveBeenCalledWith([
          '/path/to/project',
          '--types', 'code,deps',
          '--format', 'sarif'
        ]);
      });
    });

    describe('Template Modernization', () => {
      it('should handle template modernize command', async () => {
        const { modernizeTemplatesCommand } = require('../../commands/modernize-templates');
        
        const command: CLICommand = {
          domain: 'templates',
          action: 'modernize',
          target: '**/*.hbs',
          arguments: {},
          options: { 'wcag-level': 'AAA', 'auto-fix': true }
        };
        
        await (parser as any).handleTemplateModernize(command);
        expect(modernizeTemplatesCommand.parseAsync).toHaveBeenCalledWith([
          '--target', '**/*.hbs',
          '--wcag-level', 'AAA',
          '--auto-fix'
        ]);
      });
    });

    describe('Documentation Commands', () => {
      it('should handle docs generate command', async () => {
        const { docsCommand } = require('../../commands/docs');
        
        const command: CLICommand = {
          domain: 'docs',
          action: 'generate',
          arguments: { type: 'api' },
          options: { format: 'html' }
        };
        
        await (parser as any).handleDocsGenerate(command);
        expect(docsCommand.parseAsync).toHaveBeenCalledWith([
          '--type', 'api',
          '--format', 'html'
        ]);
      });

      it('should handle docs portal command', async () => {
        const { docsCommand } = require('../../commands/docs');
        
        const command: CLICommand = {
          domain: 'docs',
          action: 'portal',
          arguments: {},
          options: { theme: 'dark' }
        };
        
        await (parser as any).handleDocsPortal(command);
        expect(docsCommand.parseAsync).toHaveBeenCalledWith([
          '--portal',
          '--theme', 'dark'
        ]);
      });
    });

    describe('Deployment Commands', () => {
      it('should handle deploy command', async () => {
        const { createDeployCommand } = require('../../commands/deploy');
        const mockDeployCommand = { parseAsync: vi.fn() };
        vi.mocked(createDeployCommand).mockReturnValue(mockDeployCommand);
        
        const command: CLICommand = {
          domain: 'deploy',
          action: 'generate',
          arguments: {},
          options: { environment: 'prod', monitoring: true }
        };
        
        await (parser as any).handleDeploy(command);
        expect(mockDeployCommand.parseAsync).toHaveBeenCalledWith([
          '--environment', 'prod',
          '--monitoring'
        ]);
      });

      it('should handle deploy docker command', async () => {
        const { createDeployCommand } = require('../../commands/deploy');
        const mockDeployCommand = { parseAsync: vi.fn() };
        vi.mocked(createDeployCommand).mockReturnValue(mockDeployCommand);
        
        const command: CLICommand = {
          domain: 'deploy',
          action: 'docker',
          arguments: {},
          options: { build: true, tag: 'latest' }
        };
        
        await (parser as any).handleDeployDocker(command);
        expect(mockDeployCommand.parseAsync).toHaveBeenCalledWith([
          'docker',
          '--build',
          '--tag', 'latest'
        ]);
      });
    });

    describe('Help Commands', () => {
      it('should handle help command', async () => {
        const command: CLICommand = {
          domain: 'help',
          action: 'show',
          target: 'project',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleHelp(command);
        expect(mockDomains.help.show).toHaveBeenCalledWith(command);
      });

      it('should handle aliases command', async () => {
        const command: CLICommand = {
          domain: 'help',
          action: 'show',
          arguments: {},
          options: {}
        };
        
        await (parser as any).handleAliases(command);
        
        // Should call alias resolver
        const aliasResolver = (parser as any).aliasResolver;
        expect(aliasResolver.showAliasHelp).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle CLI errors during parsing', async () => {
      const { CLIError } = require('../../types/index');
      const { logger } = require('../../utils/logger');
      
      const mockProgram = {
        parseAsync: vi.fn().mockRejectedValue(new CLIError('Test error', 'TEST_ERROR'))
      };
      
      (parser as any).program = mockProgram;
      
      const mockProcessExit = vi.fn();
      const originalExit = process.exit;
      process.exit = mockProcessExit as any;
      
      try {
        await parser.parse(['--invalid']);
        
        expect(logger.error).toHaveBeenCalledWith('CLI Error [TEST_ERROR]: Test error');
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.exit = originalExit;
      }
    });

    it('should handle generic errors during parsing', async () => {
      const { logger } = require('../../utils/logger');
      
      const mockProgram = {
        parseAsync: vi.fn().mockRejectedValue(new Error('Generic error'))
      };
      
      (parser as any).program = mockProgram;
      
      const mockProcessExit = vi.fn();
      const originalExit = process.exit;
      process.exit = mockProcessExit as any;
      
      try {
        await parser.parse(['--invalid']);
        
        expect(logger.error).toHaveBeenCalledWith('Unexpected error:', expect.any(Error));
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.exit = originalExit;
      }
    });
  });

  describe('Legacy Command Support', () => {
    it('should find route by legacy mapping', () => {
      const route = (parser as any).findRouteByLegacy('xaheen', 'create');
      expect(route).toBeDefined();
      expect(route.domain).toBe('project');
      expect(route.action).toBe('create');
    });

    it('should return undefined for non-existent legacy command', () => {
      const route = (parser as any).findRouteByLegacy('xaheen', 'nonexistent');
      expect(route).toBeUndefined();
    });
  });

  describe('AI Command Setup', () => {
    it('should setup AI commands', () => {
      const { logger } = require('../../utils/logger');
      
      // AI commands should be set up during initialization
      expect(logger.debug).toHaveBeenCalledWith(
        'Registered AI-Native Template System commands'
      );
    });

    it('should handle AI command setup errors', () => {
      const { logger } = require('../../utils/logger');
      const { aiGenerateCommand } = require('../../commands/ai-generate');
      
      // Mock AI command to throw error
      aiGenerateCommand.getCommand.mockImplementation(() => {
        throw new Error('AI command error');
      });
      
      // Reset and re-initialize to trigger error
      CommandParser.reset();
      parser = new CommandParser();
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to register AI commands:',
        expect.any(Error)
      );
    });
  });

  describe('Program Access', () => {
    it('should provide access to commander program', () => {
      const program = parser.getProgram();
      expect(program).toBeInstanceOf(Command);
    });

    it('should provide access to routes', () => {
      const routes = parser.getRoutes();
      expect(routes).toBeInstanceOf(Map);
      expect(routes.size).toBeGreaterThan(0);
    });
  });
});