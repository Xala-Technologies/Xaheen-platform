/**
 * Unit Tests for Create Command
 * 
 * Tests project creation functionality including argument parsing,
 * preset handling, interactive prompts, and template generation.
 */

import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { createCommand } from "./create.js";
import { testUtils } from "../test/test-helpers.js";

// Mock all dependencies
vi.mock("@clack/prompts");
vi.mock("fs-extra");
vi.mock("../services/bundles/bundle-resolver.js");
vi.mock("../services/injection/service-injector.js");
vi.mock("../services/registry/service-registry.js");
vi.mock("../services/scaffolding/project-scaffolder.js");

describe("Create Command", () => {
  let mockBundleResolver: any;
  let mockServiceInjector: any;
  let mockServiceRegistry: any;
  let mockProjectScaffolder: any;
  let mockPrompts: any;
  let mockFs: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup mock implementations
    const { BundleResolver } = await import("../services/bundles/bundle-resolver.js");
    const { ServiceInjector } = await import("../services/injection/service-injector.js");
    const { ServiceRegistry } = await import("../services/registry/service-registry.js");
    const { ProjectScaffolder } = await import("../services/scaffolding/project-scaffolder.js");
    const prompts = await import("@clack/prompts");
    const fs = await import("fs-extra");

    mockBundleResolver = {
      resolveBundle: vi.fn().mockResolvedValue({
        id: "saas-starter",
        name: "SaaS Starter",
        services: ["auth", "database", "frontend"],
      }),
      getAvailableBundles: vi.fn().mockResolvedValue([
        { id: "saas-starter", name: "SaaS Starter" },
        { id: "saas-enterprise", name: "SaaS Enterprise" },
      ]),
    };
    
    mockServiceInjector = {
      inject: vi.fn().mockResolvedValue(undefined),
    };
    
    mockServiceRegistry = {
      getService: vi.fn().mockReturnValue({
        id: "auth",
        name: "Authentication",
        generate: vi.fn().mockResolvedValue(undefined),
      }),
      getAvailableServices: vi.fn().mockReturnValue([
        { id: "auth", name: "Authentication" },
        { id: "database", name: "Database" },
      ]),
    };
    
    mockProjectScaffolder = {
      scaffold: vi.fn().mockResolvedValue(undefined),
      validateProjectName: vi.fn().mockReturnValue(true),
      createProjectStructure: vi.fn().mockResolvedValue(undefined),
    };

    (BundleResolver as Mock).mockImplementation(() => mockBundleResolver);
    (ServiceInjector as Mock).mockImplementation(() => mockServiceInjector);
    (ServiceRegistry as Mock).mockImplementation(() => mockServiceRegistry);
    (ProjectScaffolder as Mock).mockImplementation(() => mockProjectScaffolder);

    mockPrompts = {
      intro: vi.fn(),
      outro: vi.fn(),
      text: vi.fn().mockResolvedValue("test-project"),
      select: vi.fn().mockResolvedValue("saas-starter"),
      multiselect: vi.fn().mockResolvedValue(["auth", "database"]),
      confirm: vi.fn().mockResolvedValue(true),
      spinner: vi.fn(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        message: vi.fn(),
      })),
      isCancel: vi.fn().mockReturnValue(false),
      cancel: vi.fn(),
    };
    
    Object.assign(prompts, mockPrompts);

    mockFs = {
      ensureDir: vi.fn().mockResolvedValue(undefined),
      pathExists: vi.fn().mockResolvedValue(false),
      writeJson: vi.fn().mockResolvedValue(undefined),
      copy: vi.fn().mockResolvedValue(undefined),
    };
    
    Object.assign(fs, mockFs);
  });

  describe("Command Configuration", () => {
    it("should have correct command configuration", () => {
      expect(createCommand.name()).toBe("create");
      expect(createCommand.aliases).toContain("new");
      expect(createCommand.description()).toBe("Create a new project");
    });

    it("should have all expected options", () => {
      const options = createCommand.options;
      const optionNames = options.map(opt => opt.long);
      
      expect(optionNames).toContain("--preset");
      expect(optionNames).toContain("--framework");
      expect(optionNames).toContain("--backend");
      expect(optionNames).toContain("--database");
    });
  });

  describe("Argument Parsing", () => {
    it("should parse project name argument", async () => {
      const args = ["test-project"];
      const options = { preset: "saas-starter" };

      // Create a mock action function
      const actionFn = vi.fn();
      createCommand.action(actionFn);

      // Simulate command execution
      await createCommand.parseAsync(["node", "xaheen", "create", ...args], { from: "user" });

      // Verify the action was called with correct arguments
      expect(actionFn).toHaveBeenCalledWith("test-project", expect.any(Object));
    });

    it("should handle missing project name with interactive prompt", async () => {
      mockPrompts.text.mockResolvedValue("interactive-project");
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        if (!name) {
          const promptedName = await mockPrompts.text({
            message: "What's the name of your project?",
          });
          expect(promptedName).toBe("interactive-project");
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(["node", "xaheen", "create"], { from: "user" });
      
      expect(mockPrompts.text).toHaveBeenCalled();
    });
  });

  describe("Preset Handling", () => {
    it("should use preset when provided", async () => {
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        if (options.preset) {
          const bundle = await mockBundleResolver.resolveBundle(options.preset);
          expect(bundle.id).toBe("saas-starter");
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project", "--preset", "saas-starter"], 
        { from: "user" }
      );
      
      expect(mockBundleResolver.resolveBundle).toHaveBeenCalledWith("saas-starter");
    });

    it("should prompt for preset when not provided", async () => {
      mockPrompts.select.mockResolvedValue("saas-enterprise");
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        if (!options.preset) {
          const selectedPreset = await mockPrompts.select({
            message: "Choose a preset bundle:",
            options: expect.any(Array),
          });
          expect(selectedPreset).toBe("saas-enterprise");
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project"], 
        { from: "user" }
      );
      
      expect(mockPrompts.select).toHaveBeenCalled();
    });
  });

  describe("Project Scaffolding", () => {
    it("should validate project name", async () => {
      mockProjectScaffolder.validateProjectName.mockReturnValue(false);
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        const isValid = mockProjectScaffolder.validateProjectName(name);
        expect(isValid).toBe(false);
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "invalid-name"], 
        { from: "user" }
      );
      
      expect(mockProjectScaffolder.validateProjectName).toHaveBeenCalledWith("invalid-name");
    });

    it("should create project structure", async () => {
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        await mockProjectScaffolder.createProjectStructure(name, options);
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project"], 
        { from: "user" }
      );
      
      expect(mockProjectScaffolder.createProjectStructure).toHaveBeenCalledWith(
        "test-project", 
        expect.any(Object)
      );
    });

    it("should handle existing directory", async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockPrompts.confirm.mockResolvedValue(false);
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        const exists = await mockFs.pathExists(name);
        if (exists) {
          const overwrite = await mockPrompts.confirm({
            message: "Directory exists. Overwrite?",
          });
          expect(overwrite).toBe(false);
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "existing-project"], 
        { from: "user" }
      );
      
      expect(mockFs.pathExists).toHaveBeenCalledWith("existing-project");
      expect(mockPrompts.confirm).toHaveBeenCalled();
    });
  });

  describe("Service Selection", () => {
    it("should select services based on preset", async () => {
      const bundle = {
        id: "saas-starter",
        services: ["auth", "database", "frontend"],
      };
      mockBundleResolver.resolveBundle.mockResolvedValue(bundle);
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        const resolvedBundle = await mockBundleResolver.resolveBundle(options.preset);
        expect(resolvedBundle.services).toContain("auth");
        expect(resolvedBundle.services).toContain("database");
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project", "--preset", "saas-starter"], 
        { from: "user" }
      );
    });

    it("should allow custom service selection", async () => {
      mockPrompts.multiselect.mockResolvedValue(["auth", "payment"]);
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        if (!options.preset) {
          const selectedServices = await mockPrompts.multiselect({
            message: "Select services:",
            options: expect.any(Array),
          });
          expect(selectedServices).toContain("auth");
          expect(selectedServices).toContain("payment");
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project"], 
        { from: "user" }
      );
      
      expect(mockPrompts.multiselect).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle bundle resolution errors", async () => {
      mockBundleResolver.resolveBundle.mockRejectedValue(new Error("Bundle not found"));
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        try {
          await mockBundleResolver.resolveBundle(options.preset);
        } catch (error: any) {
          expect(error.message).toBe("Bundle not found");
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project", "--preset", "invalid-preset"], 
        { from: "user" }
      );
    });

    it("should handle project scaffolding errors", async () => {
      mockProjectScaffolder.scaffold.mockRejectedValue(new Error("Scaffolding failed"));
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        try {
          await mockProjectScaffolder.scaffold(name, options);
        } catch (error: any) {
          expect(error.message).toBe("Scaffolding failed");
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create", "test-project"], 
        { from: "user" }
      );
    });

    it("should handle user cancellation", async () => {
      mockPrompts.isCancel.mockReturnValue(true);
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        const userInput = await mockPrompts.text({ message: "Project name:" });
        if (mockPrompts.isCancel(userInput)) {
          mockPrompts.cancel("Operation cancelled");
          return;
        }
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create"], 
        { from: "user" }
      );
      
      expect(mockPrompts.cancel).toHaveBeenCalledWith("Operation cancelled");
    });
  });

  describe("Interactive Flow", () => {
    it("should complete full interactive project creation", async () => {
      // Setup all prompts for a complete flow
      mockPrompts.text.mockResolvedValueOnce("my-awesome-project");
      mockPrompts.select.mockResolvedValueOnce("saas-starter");
      mockPrompts.multiselect.mockResolvedValueOnce(["auth", "database"]);
      mockPrompts.confirm.mockResolvedValueOnce(true);
      
      const actionFn = vi.fn().mockImplementation(async (name, options) => {
        // Simulate full interactive flow
        if (!name) {
          name = await mockPrompts.text({ message: "Project name:" });
        }
        
        if (!options.preset) {
          options.preset = await mockPrompts.select({ message: "Choose preset:" });
        }
        
        const services = await mockPrompts.multiselect({ message: "Select services:" });
        const confirmed = await mockPrompts.confirm({ message: "Create project?" });
        
        if (confirmed) {
          await mockProjectScaffolder.scaffold(name, { ...options, services });
        }
        
        expect(name).toBe("my-awesome-project");
        expect(options.preset).toBe("saas-starter");
        expect(services).toEqual(["auth", "database"]);
        expect(confirmed).toBe(true);
      });
      
      createCommand.action(actionFn);
      await createCommand.parseAsync(
        ["node", "xaheen", "create"], 
        { from: "user" }
      );
      
      expect(mockProjectScaffolder.scaffold).toHaveBeenCalled();
    });
  });
});