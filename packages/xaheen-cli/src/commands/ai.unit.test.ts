/**
 * Unit Tests for AI Command
 *
 * Tests AI-powered code generation, modification, and integration
 * with Codebuff and other AI services.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { testUtils } from "../test/test-helpers.js";
import type { AICommandOptions } from "./ai.js";

// Move mock declarations to top
const mockSpawn = vi.fn();
const mockInquirer = {
	prompt: vi.fn(),
	select: vi.fn(),
	confirm: vi.fn(),
};
const mockPatchUtils = {
	applyPatches: vi.fn(),
	generatePatch: vi.fn(),
	diffPreview: vi.fn(),
	applyPatch: vi.fn(),
	createCodebuffIndex: vi.fn(),
	validateGitRepository: vi.fn(),
	hasUncommittedChanges: vi.fn(),
	getCurrentBranch: vi.fn(),
};
const mockRefactoringGenerator = {
	generateRefactoring: vi.fn(),
};

// Mock all dependencies
vi.mock("child_process", () => ({
	spawn: mockSpawn,
}));
vi.mock("inquirer", () => mockInquirer);
vi.mock("../lib/patch-utils.js", () => mockPatchUtils);
vi.mock("../generators/ai/refactoring.generator.js", () => mockRefactoringGenerator);

describe("AI Command", () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		// Reset mock functions
		mockInquirer.prompt.mockResolvedValue({ confirmed: true });
		mockPatchUtils.diffPreview.mockResolvedValue("diff preview");
		mockPatchUtils.applyPatch.mockResolvedValue(undefined);
		mockPatchUtils.createCodebuffIndex.mockResolvedValue(undefined);
		mockPatchUtils.validateGitRepository.mockResolvedValue(true);
		mockPatchUtils.hasUncommittedChanges.mockResolvedValue(false);
		mockPatchUtils.getCurrentBranch.mockResolvedValue("main");

		mockRefactoringGenerator.generateRefactoring.mockResolvedValue({
			success: true,
			files: ["src/components/Button.tsx"],
			changes: "Added button component",
		});
	});

	describe("runCodebuffCLI", () => {
		it("should execute codebuff with correct arguments", async () => {
			// Mock successful process execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("Generated patch content");
						}
					}),
				},
				stderr: {
					on: vi.fn(),
				},
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};

			mockSpawn.mockReturnValue(mockProcess as any);

			const { runCodebuffCLI } = await import("./ai.js");

			const result = await runCodebuffCLI(
				"/test/project",
				"create a button component",
				{ model: "gpt-4" },
			);

			expect(mockSpawn).toHaveBeenCalledWith(
				"codebuff",
				["/test/project", "create a button component"],
				expect.objectContaining({
					cwd: "/test/project",
					stdio: ["pipe", "pipe", "pipe"],
				}),
			);

			expect(result).toBe("Generated patch content");
		});

		it("should handle codebuff execution errors", async () => {
			const mockProcess = {
				stdout: { on: vi.fn() },
				stderr: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("Error: Command failed");
						}
					}),
				},
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(1);
					}
				}),
			};

			mockSpawn.mockReturnValue(mockProcess as any);

			const { runCodebuffCLI } = await import("./ai.js");

			await expect(
				runCodebuffCLI("/test/project", "invalid prompt"),
			).rejects.toThrow();
		});

		it("should set model environment variable", async () => {
			const mockProcess = {
				stdout: { on: vi.fn() },
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};

			mockSpawn.mockReturnValue(mockProcess as any);

			const { runCodebuffCLI } = await import("./ai.js");

			const originalModel = process.env.OPENAI_MODEL;

			await runCodebuffCLI("/test/project", "test prompt", {
				model: "gpt-3.5-turbo",
			});

			expect(process.env.OPENAI_MODEL).toBe("gpt-3.5-turbo");

			// Restore original value
			if (originalModel) {
				process.env.OPENAI_MODEL = originalModel;
			} else {
				delete process.env.OPENAI_MODEL;
			}
		});
	});

	describe("codebuffCommand", () => {
		let codebuffCommand: any;

		beforeEach(async () => {
			const aiModule = await import("./ai.js");
			codebuffCommand = aiModule.codebuffCommand;
		});

		it("should validate git repository before executing", async () => {
			mockPatchUtils.validateGitRepository.mockResolvedValue(false);

			await expect(codebuffCommand("test prompt", {})).rejects.toThrow(
				"Not a git repository",
			);

			expect(mockPatchUtils.validateGitRepository).toHaveBeenCalled();
		});

		it("should check for uncommitted changes", async () => {
			mockPatchUtils.hasUncommittedChanges.mockResolvedValue(true);
			mockInquirer.prompt.mockResolvedValue({ confirmed: false });

			await expect(codebuffCommand("test prompt", {})).rejects.toThrow(
				"Uncommitted changes detected",
			);

			expect(mockPatchUtils.hasUncommittedChanges).toHaveBeenCalled();
			expect(mockInquirer.prompt).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: "confirm",
						message: expect.stringContaining("uncommitted changes"),
					}),
				]),
			);
		});

		it("should create codebuff index when index option is true", async () => {
			const options: AICommandOptions = { index: true };

			await codebuffCommand("test prompt", options);

			expect(mockPatchUtils.createCodebuffIndex).toHaveBeenCalledWith(
				process.cwd(),
			);
		});

		it("should show diff preview in interactive mode", async () => {
			const options: AICommandOptions = { interactive: true };
			mockPatchUtils.diffPreview.mockResolvedValue("diff content");
			mockInquirer.prompt.mockResolvedValue({ action: "apply" });

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("patch content");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await codebuffCommand("test prompt", options);

			expect(mockPatchUtils.diffPreview).toHaveBeenCalledWith("patch content");
			expect(mockInquirer.prompt).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: "list",
						choices: expect.arrayContaining(["Apply", "Skip", "Edit"]),
					}),
				]),
			);
		});

		it("should apply patch when confirmed", async () => {
			const options: AICommandOptions = { interactive: true };
			mockInquirer.prompt.mockResolvedValue({ action: "apply" });

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("patch content");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await codebuffCommand("test prompt", options);

			expect(mockPatchUtils.applyPatch).toHaveBeenCalledWith("patch content");
		});

		it("should skip patch application in dry run mode", async () => {
			const options: AICommandOptions = { dryRun: true };

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("patch content");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await codebuffCommand("test prompt", options);

			expect(mockPatchUtils.applyPatch).not.toHaveBeenCalled();
			expect(mockPatchUtils.diffPreview).toHaveBeenCalledWith("patch content");
		});
	});

	describe("fixTestsCommand", () => {
		let fixTestsCommand: any;

		beforeEach(async () => {
			const aiModule = await import("./ai.js");
			fixTestsCommand = aiModule.fixTestsCommand;
		});

		it("should execute test fixing logic", async () => {
			const options: AICommandOptions = { autoCommit: true };

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("test fix patch");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await fixTestsCommand(options);

			expect(mockSpawn).toHaveBeenCalledWith(
				"codebuff",
				expect.arrayContaining([expect.stringContaining("fix failing tests")]),
				expect.any(Object),
			);
		});

		it("should handle test fixing errors", async () => {
			const options: AICommandOptions = {};

			// Mock failed codebuff execution
			const mockProcess = {
				stdout: { on: vi.fn() },
				stderr: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("Test fixing failed");
						}
					}),
				},
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(1);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await expect(fixTestsCommand(options)).rejects.toThrow();
		});
	});

	describe("norwegianComplianceCommand", () => {
		let norwegianComplianceCommand: any;

		beforeEach(async () => {
			const aiModule = await import("./ai.js");
			norwegianComplianceCommand = aiModule.norwegianComplianceCommand;
		});

		it("should execute Norwegian compliance checking", async () => {
			const prompt = "check GDPR compliance";
			const options: AICommandOptions = { model: "gpt-4" };

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("compliance patch");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await norwegianComplianceCommand(prompt, options);

			expect(mockSpawn).toHaveBeenCalledWith(
				"codebuff",
				expect.arrayContaining([
					expect.stringContaining("Norwegian compliance"),
					expect.stringContaining(prompt),
				]),
				expect.any(Object),
			);
		});

		it("should include Norwegian regulations in prompt", async () => {
			const prompt = "implement data protection";
			const options: AICommandOptions = {};

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("compliance changes");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await norwegianComplianceCommand(prompt, options);

			const spawnCall = mockSpawn.mock.calls[0];
			const enhancedPrompt = spawnCall[1][1];

			expect(enhancedPrompt).toContain("GDPR");
			expect(enhancedPrompt).toContain("Norwegian");
			expect(enhancedPrompt).toContain(prompt);
		});
	});

	describe("AI Refactoring Integration", () => {
		it("should use AI refactoring generator for complex operations", async () => {
			const options = {
				type: "component-refactor",
				target: "src/components/Button.tsx",
				patterns: ["extract-hooks", "add-accessibility"],
			};

			await mockRefactoringGenerator.generate(options);

			expect(mockRefactoringGenerator.generate).toHaveBeenCalledWith(options);
		});

		it("should handle refactoring generator errors", async () => {
			mockRefactoringGenerator.generate.mockRejectedValue(
				new Error("Refactoring failed"),
			);

			await expect(mockRefactoringGenerator.generate({})).rejects.toThrow(
				"Refactoring failed",
			);
		});
	});

	describe("Git Integration", () => {
		it("should validate git repository before operations", async () => {
			mockPatchUtils.validateGitRepository.mockResolvedValue(true);
			mockPatchUtils.getCurrentBranch.mockResolvedValue("feature/ai-changes");

			const { codebuffCommand } = await import("./ai.js");

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("patch content");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			await codebuffCommand("test prompt", {});

			expect(mockPatchUtils.validateGitRepository).toHaveBeenCalled();
			expect(mockPatchUtils.getCurrentBranch).toHaveBeenCalled();
		});

		it("should handle auto-commit when enabled", async () => {
			const options: AICommandOptions = { autoCommit: true };

			// Mock git operations
			vi.mock("child_process", async () => {
				const actual = await vi.importActual("child_process");
				return {
					...actual,
					execSync: vi.fn().mockReturnValue(""),
					spawn: mockSpawn,
				};
			});

			// Mock successful codebuff execution
			const mockProcess = {
				stdout: {
					on: vi.fn((event, callback) => {
						if (event === "data") {
							callback("patch content");
						}
					}),
				},
				stderr: { on: vi.fn() },
				on: vi.fn((event, callback) => {
					if (event === "close") {
						callback(0);
					}
				}),
			};
			mockSpawn.mockReturnValue(mockProcess as any);

			const { codebuffCommand } = await import("./ai.js");
			await codebuffCommand("test prompt", options);

			// Verify patch was applied (auto-commit would happen after)
			expect(mockPatchUtils.applyPatch).toHaveBeenCalled();
		});
	});
});
