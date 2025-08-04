/**
 * Unit Tests for Main CLI Entry Point
 * 
 * Tests the main CLI initialization, banner display, error handling,
 * and graceful shutdown behavior.
 */

import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { performance } from "perf_hooks";

// Mock all dependencies
vi.mock("./core/command-parser/index.js", () => ({
  CommandParser: vi.fn().mockImplementation(() => ({
    parse: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("./core/config-manager/index.js", () => ({
  ConfigManager: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("./core/stack-adapters/index.js", () => ({
  StackAdapterRegistry: {
    getInstance: vi.fn().mockReturnValue({
      detectStack: vi.fn().mockResolvedValue("nextjs"),
    }),
  },
}));

vi.mock("./utils/logger.js", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
  cliLogger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("chalk", () => ({
  default: {
    cyan: vi.fn((text) => text),
    bold: {
      white: vi.fn((text) => text),
    },
    gray: vi.fn((text) => text),
    green: vi.fn((text) => text),
  },
}));

describe("Main CLI Entry Point", () => {
  let mockExit: Mock;
  let consoleSpy: Mock;

  beforeEach(() => {
    mockExit = globalThis.__TEST_UTILS__.mockExit;
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.clearAllMocks();
    
    // Reset environment variables
    delete process.env.XAHEEN_NO_BANNER;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("Banner Display", () => {
    it("should display banner by default", async () => {
      // Import and run main after setting up mocks
      await import("./index.js");
      
      // Give time for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalled();
      const bannerCall = consoleSpy.mock.calls.find(call => 
        call[0] && call[0].includes("Xaheen CLI")
      );
      expect(bannerCall).toBeDefined();
    });

    it("should skip banner when XAHEEN_NO_BANNER is set", async () => {
      process.env.XAHEEN_NO_BANNER = "true";
      
      // Reset modules to ensure fresh import
      vi.resetModules();
      
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const bannerCall = consoleSpy.mock.calls.find(call => 
        call[0] && call[0].includes("Xaheen CLI")
      );
      expect(bannerCall).toBeUndefined();
    });
  });

  describe("Initialization", () => {
    it("should initialize core systems in correct order", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const { ConfigManager } = await import("./core/config-manager/index.js");
      const { StackAdapterRegistry } = await import("./core/stack-adapters/index.js");
      
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(ConfigManager).toHaveBeenCalled();
      expect(StackAdapterRegistry.getInstance).toHaveBeenCalled();
      expect(CommandParser).toHaveBeenCalled();
    });

    it("should detect stack correctly", async () => {
      const { StackAdapterRegistry } = await import("./core/stack-adapters/index.js");
      const mockRegistry = {
        detectStack: vi.fn().mockResolvedValue("react"),
      };
      (StackAdapterRegistry.getInstance as Mock).mockReturnValue(mockRegistry);
      
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockRegistry.detectStack).toHaveBeenCalled();
    });

    it("should set up global CLI context", async () => {
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if global context is available
      expect(global.__xaheen_cli).toBeDefined();
      expect(global.__xaheen_cli.configManager).toBeDefined();
      expect(global.__xaheen_cli.commandParser).toBeDefined();
      expect(global.__xaheen_cli.stackRegistry).toBeDefined();
    });
  });

  describe("Command Execution", () => {
    it("should parse command line arguments", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const mockParser = {
        parse: vi.fn().mockResolvedValue(undefined),
      };
      (CommandParser as Mock).mockImplementation(() => mockParser);
      
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockParser.parse).toHaveBeenCalledWith(process.argv);
    });

    it("should measure command execution time", async () => {
      const { logger } = await import("./utils/logger.js");
      
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Command completed in")
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle CLIError correctly", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const { CLIError } = await import("./types/index.js");
      const { cliLogger } = await import("./utils/logger.js");
      
      const error = new CLIError("Test error", "TEST_ERROR");
      const mockParser = {
        parse: vi.fn().mockRejectedValue(error),
      };
      (CommandParser as Mock).mockImplementation(() => mockParser);
      
      vi.resetModules();
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cliLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Test error")
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should handle COMMAND_NOT_FOUND error with help message", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const { CLIError } = await import("./types/index.js");
      const { cliLogger } = await import("./utils/logger.js");
      
      const error = new CLIError("Command not found", "COMMAND_NOT_FOUND");
      const mockParser = {
        parse: vi.fn().mockRejectedValue(error),
      };
      (CommandParser as Mock).mockImplementation(() => mockParser);
      
      vi.resetModules();
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cliLogger.info).toHaveBeenCalledWith(
        "Run `xaheen --help` to see available commands"
      );
    });

    it("should handle unexpected errors", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const { cliLogger } = await import("./utils/logger.js");
      
      const error = new Error("Unexpected error");
      const mockParser = {
        parse: vi.fn().mockRejectedValue(error),
      };
      (CommandParser as Mock).mockImplementation(() => mockParser);
      
      vi.resetModules();
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cliLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Unexpected error")
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should handle unknown error types", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const { cliLogger } = await import("./utils/logger.js");
      
      const mockParser = {
        parse: vi.fn().mockRejectedValue("string error"),
      };
      (CommandParser as Mock).mockImplementation(() => mockParser);
      
      vi.resetModules();
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cliLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Unknown error occurred")
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("Signal Handling", () => {
    it("should handle SIGINT gracefully", async () => {
      const { cliLogger } = await import("./utils/logger.js");
      
      await import("./index.js");
      
      // Simulate SIGINT
      process.emit("SIGINT", "SIGINT");
      
      expect(cliLogger.info).toHaveBeenCalledWith("CLI interrupted by user");
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("should handle SIGTERM gracefully", async () => {
      const { cliLogger } = await import("./utils/logger.js");
      
      await import("./index.js");
      
      // Simulate SIGTERM
      process.emit("SIGTERM", "SIGTERM");
      
      expect(cliLogger.info).toHaveBeenCalledWith("CLI terminated");
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe("Performance Tracking", () => {
    it("should track command execution time on success", async () => {
      const { logger } = await import("./utils/logger.js");
      
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const debugCalls = (logger.debug as Mock).mock.calls;
      const timeCall = debugCalls.find(call => 
        call[0] && call[0].includes("Command completed in")
      );
      expect(timeCall).toBeDefined();
      expect(timeCall[0]).toMatch(/Command completed in \d+ms/);
    });

    it("should track command execution time on error", async () => {
      const { CommandParser } = await import("./core/command-parser/index.js");
      const { CLIError } = await import("./types/index.js");
      const { cliLogger } = await import("./utils/logger.js");
      
      const error = new CLIError("Test error", "TEST_ERROR");
      const mockParser = {
        parse: vi.fn().mockRejectedValue(error),
      };
      (CommandParser as Mock).mockImplementation(() => mockParser);
      
      vi.resetModules();
      await import("./index.js");
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorCalls = (cliLogger.error as Mock).mock.calls;
      const timeCall = errorCalls.find(call => 
        call[0] && call[0].includes("ms)")
      );
      expect(timeCall).toBeDefined();
    });
  });
});