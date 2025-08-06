/**
 * Comprehensive Tests for Main CLI Entry Point
 * 
 * Tests the main CLI initialization, banner display, system setup,
 * error handling, and process lifecycle management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performance } from 'perf_hooks';

// Mock all external dependencies before importing the main module
vi.mock('./core/command-parser/index', () => ({
  CommandParser: vi.fn().mockImplementation(() => ({
    parse: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('./core/config-manager/index', () => ({
  ConfigManager: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('./core/stack-adapters/index', () => ({
  StackAdapterRegistry: {
    getInstance: vi.fn().mockReturnValue({
      detectStack: vi.fn().mockResolvedValue('nextjs'),
    }),
  },
}));

vi.mock('./licensing/index', () => ({
  LicenseManager: vi.fn().mockImplementation(() => ({})),
  CLILicenseIntegration: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    displayLicenseStatus: vi.fn().mockResolvedValue(undefined),
  })),
  CLI_LICENSE_CONFIG: {},
}));

vi.mock('./core/command-parser/factories/CommandHandlerFactory', () => ({
  CommandHandlerFactory: vi.fn().mockImplementation(() => ({
    registerHandler: vi.fn(),
  })),
}));

vi.mock('./core/command-parser/registry/RouteRegistry', () => ({
  RouteRegistry: vi.fn().mockImplementation(() => ({
    registerRoutes: vi.fn(),
  })),
}));

vi.mock('./core/command-parser/handlers/LicenseCommandHandler', () => ({
  LicenseCommandHandler: vi.fn(),
}));

vi.mock('./core/command-parser/registrars/LicenseRouteRegistrar', () => ({
  LicenseRouteRegistrar: vi.fn().mockImplementation(() => ({
    getRoutes: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock('./core/command-parser/handlers/RegistryCommandHandler', () => ({
  RegistryCommandHandler: vi.fn(),
}));

vi.mock('./core/command-parser/registrars/RegistryRouteRegistrar', () => ({
  RegistryRouteRegistrar: vi.fn().mockImplementation(() => ({
    getRoutes: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock('./utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
  cliLogger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('./types/index', () => ({
  CLIError: class CLIError extends Error {
    constructor(message: string, public code: string = 'GENERAL_ERROR') {
      super(message);
      this.name = 'CLIError';
    }
  },
}));

vi.mock('chalk', () => ({
  default: {
    cyan: vi.fn((str) => str),
    bold: {
      white: vi.fn((str) => str),
    },
    gray: vi.fn((str) => str),
    green: vi.fn((str) => str),
  },
}));

// Mock performance module
vi.mock('perf_hooks', () => ({
  performance: {
    now: vi.fn(),
  },
}));

describe('Main CLI Entry Point', () => {
  let mockCommandParser: any;
  let mockConfigManager: any;
  let mockStackRegistry: any;
  let mockLicenseManager: any;
  let mockLicenseIntegration: any;
  let mockHandlerFactory: any;
  let mockRouteRegistry: any;

  const originalProcessExit = process.exit;
  const originalConsoleLog = console.log;
  const mockProcessExit = vi.fn();
  const mockConsoleLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock process.exit
    process.exit = mockProcessExit as any;
    console.log = mockConsoleLog;

    // Mock performance.now
    vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(1100);

    // Import the mocked classes
    const { CommandParser } = require('./core/command-parser/index');
    const { ConfigManager } = require('./core/config-manager/index');
    const { StackAdapterRegistry } = require('./core/stack-adapters/index');
    const { LicenseManager, CLILicenseIntegration } = require('./licensing/index');
    const { CommandHandlerFactory } = require('./core/command-parser/factories/CommandHandlerFactory');
    const { RouteRegistry } = require('./core/command-parser/registry/RouteRegistry');

    mockCommandParser = new CommandParser();
    mockConfigManager = new ConfigManager();
    mockStackRegistry = StackAdapterRegistry.getInstance();
    mockLicenseManager = new LicenseManager({});
    mockLicenseIntegration = new CLILicenseIntegration(mockLicenseManager);
    mockHandlerFactory = new CommandHandlerFactory();
    mockRouteRegistry = new RouteRegistry();
  });

  afterEach(() => {
    process.exit = originalProcessExit;
    console.log = originalConsoleLog;
    vi.resetModules();
  });

  describe('Banner Display', () => {
    it('should display the CLI banner by default', async () => {
      // Set environment to show banner
      process.env.XAHEEN_NO_BANNER = 'false';
      
      // Import and run main after setting up mocks
      const { main } = await import('./index');
      
      // Mock process.argv to prevent actual command parsing
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify banner was displayed
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('Xaheen CLI')
        );
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('Service-based architecture + AI-powered components')
        );
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should not display banner when XAHEEN_NO_BANNER is true', async () => {
      // Set environment to hide banner
      process.env.XAHEEN_NO_BANNER = 'true';
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify banner was not displayed
        expect(mockConsoleLog).not.toHaveBeenCalledWith(
          expect.stringContaining('Xaheen CLI')
        );
      } finally {
        process.argv = originalArgv;
        delete process.env.XAHEEN_NO_BANNER;
      }
    });
  });

  describe('System Initialization', () => {
    it('should initialize all core systems in correct order', async () => {
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify licensing system initialization
        expect(mockLicenseIntegration.initialize).toHaveBeenCalled();
        expect(mockLicenseIntegration.displayLicenseStatus).toHaveBeenCalled();
        
        // Verify stack detection
        expect(mockStackRegistry.detectStack).toHaveBeenCalled();
        
        // Verify handler registration
        expect(mockHandlerFactory.registerHandler).toHaveBeenCalledWith('license', expect.any(Function));
        expect(mockHandlerFactory.registerHandler).toHaveBeenCalledWith('registry', expect.any(Function));
        
        // Verify route registration
        expect(mockRouteRegistry.registerRoutes).toHaveBeenCalled();
        
        // Verify command parsing
        expect(mockCommandParser.parse).toHaveBeenCalledWith(process.argv);
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should set global CLI context', async () => {
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify global context is set
        expect((global as any).__xaheen_cli).toBeDefined();
        expect((global as any).__xaheen_cli.configManager).toBeDefined();
        expect((global as any).__xaheen_cli.commandParser).toBeDefined();
        expect((global as any).__xaheen_cli.stackRegistry).toBeDefined();
        expect((global as any).__xaheen_cli.licenseManager).toBeDefined();
        expect((global as any).__xaheen_cli.licenseIntegration).toBeDefined();
        expect((global as any).__xaheen_cli.handlerFactory).toBeDefined();
        expect((global as any).__xaheen_cli.routeRegistry).toBeDefined();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should measure and log execution time', async () => {
      const { logger } = require('./utils/logger');
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify performance measurement
        expect(performance.now).toHaveBeenCalledTimes(2);
        expect(logger.debug).toHaveBeenCalledWith('Initializing Xaheen CLI...');
        expect(logger.debug).toHaveBeenCalledWith('Command completed in 100ms');
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle CLIError with specific error codes', async () => {
      const { CLIError } = require('./types/index');
      const { cliLogger } = require('./utils/logger');
      
      // Mock command parser to throw CLIError
      mockCommandParser.parse.mockRejectedValue(
        new CLIError('Command not found', 'COMMAND_NOT_FOUND')
      );
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', 'invalid-command'];
      
      try {
        await main();
        
        // Verify error handling
        expect(cliLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Command not found')
        );
        expect(cliLogger.info).toHaveBeenCalledWith(
          'Run `xaheen --help` to see available commands'
        );
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle generic Error instances', async () => {
      const { cliLogger, logger } = require('./utils/logger');
      
      const testError = new Error('Test error message');
      testError.stack = 'Error stack trace';
      
      // Mock command parser to throw generic error
      mockCommandParser.parse.mockRejectedValue(testError);
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify error handling
        expect(cliLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Unexpected error: Test error message')
        );
        expect(logger.debug).toHaveBeenCalledWith('Stack trace:', 'Error stack trace');
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle unknown error types', async () => {
      const { cliLogger } = require('./utils/logger');
      
      // Mock command parser to throw non-Error object
      mockCommandParser.parse.mockRejectedValue('String error');
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify error handling
        expect(cliLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Unknown error occurred')
        );
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle initialization errors', async () => {
      const { cliLogger } = require('./utils/logger');
      
      // Mock license integration to throw error
      mockLicenseIntegration.initialize.mockRejectedValue(
        new Error('License initialization failed')
      );
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        // Verify error handling
        expect(cliLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Unexpected error: License initialization failed')
        );
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('Process Signal Handling', () => {
    let processEventHandlers: { [key: string]: Function } = {};

    beforeEach(() => {
      // Capture process event handlers
      const originalOn = process.on;
      process.on = vi.fn((event: string, handler: Function) => {
        processEventHandlers[event] = handler;
        return process;
      });
    });

    it('should handle SIGINT gracefully', async () => {
      const { cliLogger } = require('./utils/logger');
      
      // Import the module to register signal handlers
      await import('./index');
      
      // Simulate SIGINT
      if (processEventHandlers.SIGINT) {
        processEventHandlers.SIGINT();
      }
      
      expect(cliLogger.info).toHaveBeenCalledWith('CLI interrupted by user');
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it('should handle SIGTERM gracefully', async () => {
      const { cliLogger } = require('./utils/logger');
      
      // Import the module to register signal handlers
      await import('./index');
      
      // Simulate SIGTERM
      if (processEventHandlers.SIGTERM) {
        processEventHandlers.SIGTERM();
      }
      
      expect(cliLogger.info).toHaveBeenCalledWith('CLI terminated');
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });
  });

  describe('Global CLI Context Interface', () => {
    it('should define proper TypeScript interfaces', async () => {
      // Import the module
      await import('./index');
      
      // Verify the global interface is properly defined
      // This is more of a compilation test, but we can check the structure
      const globalCli = (global as any).__xaheen_cli;
      if (globalCli) {
        expect(typeof globalCli.configManager).toBe('object');
        expect(typeof globalCli.commandParser).toBe('object');
        expect(typeof globalCli.stackRegistry).toBe('object');
        expect(typeof globalCli.licenseManager).toBe('object');
        expect(typeof globalCli.licenseIntegration).toBe('object');
        expect(typeof globalCli.handlerFactory).toBe('object');
        expect(typeof globalCli.routeRegistry).toBe('object');
      }
    });
  });

  describe('Main Function Error Handling in Promise Catch', () => {
    it('should handle uncaught errors in main function', async () => {
      const { cliLogger } = require('./utils/logger');
      
      // Mock the main function to throw an error
      vi.doMock('./index', () => ({
        main: vi.fn().mockRejectedValue(new Error('Uncaught error')),
      }));
      
      // Re-import the module
      const { main } = await import('./index');
      
      try {
        await main();
      } catch (error) {
        // The catch block in the actual module should handle this
        expect(cliLogger.error).toHaveBeenCalledWith(
          'Failed to start CLI:', 
          expect.any(Error)
        );
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance for successful commands', async () => {
      const { logger } = require('./utils/logger');
      
      // Set up performance timing
      vi.mocked(performance.now)
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1150); // End time
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--version'];
      
      try {
        await main();
        
        expect(logger.debug).toHaveBeenCalledWith('Command completed in 150ms');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should track performance for failed commands', async () => {
      const { CLIError } = require('./types/index');
      const { cliLogger } = require('./utils/logger');
      
      // Set up performance timing
      vi.mocked(performance.now)
        .mockReturnValueOnce(2000) // Start time
        .mockReturnValueOnce(2075); // End time
      
      // Mock command parser to throw error
      mockCommandParser.parse.mockRejectedValue(
        new CLIError('Test error', 'TEST_ERROR')
      );
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', 'invalid'];
      
      try {
        await main();
        
        expect(cliLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Test error (75ms)')
        );
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('Stack Detection', () => {
    it('should log detected stack information', async () => {
      const { logger } = require('./utils/logger');
      
      // Mock stack detection to return specific stack
      mockStackRegistry.detectStack.mockResolvedValue('nextjs');
      
      const { main } = await import('./index');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        expect(mockStackRegistry.detectStack).toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith('Detected stack: nextjs');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('should handle stack detection failures', async () => {
      // Mock stack detection to throw error
      mockStackRegistry.detectStack.mockRejectedValue(
        new Error('Stack detection failed')
      );
      
      const { main } = await import('./index');
      const { cliLogger } = require('./utils/logger');
      
      const originalArgv = process.argv;
      process.argv = ['node', 'xaheen', '--help'];
      
      try {
        await main();
        
        expect(cliLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Stack detection failed')
        );
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } finally {
        process.argv = originalArgv;
      }
    });
  });
});