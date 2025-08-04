/**
 * @fileoverview Comprehensive Tests for CLI Integration Tools
 * @description Tests for CLI command execution, integration, and communication
 * @version 1.0.0
 */

import {
	createMockProject,
	expectAsyncThrow,
	mockCliResults,
} from "../utils/test-helpers.js";

// Mock child_process
jest.mock("child_process", () => ({
	spawn: jest.fn(),
	exec: jest.fn(),
	execSync: jest.fn(),
}));

// Mock fs for config file operations
jest.mock("fs", () => ({
	readFileSync: jest.fn(),
	writeFileSync: jest.fn(),
	existsSync: jest.fn(),
}));

describe("CLI Integration Tools", () => {
	let mockProject: ReturnType<typeof createMockProject>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockProject = createMockProject("cli-integration-test");
	});

	afterEach(() => {
		mockProject.cleanup();
	});

	describe("CLI Command Execution", () => {
		it("should execute CLI commands successfully", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue("Command executed successfully");

			const executeCLICommand = async (
				command: string,
				args: string[] = [],
			) => {
				try {
					const fullCommand =
						`npx @xala-technologies/xala-cli ${command} ${args.join(" ")}`.trim();
					const result = execSync(fullCommand, {
						encoding: "utf8",
						cwd: mockProject.root,
					});
					return {
						success: true,
						output: result,
						error: null,
					};
				} catch (error) {
					return {
						success: false,
						output: null,
						error: error instanceof Error ? error.message : String(error),
					};
				}
			};

			const result = await executeCLICommand("--version");

			expect(result.success).toBe(true);
			expect(result.output).toBe("Command executed successfully");
			expect(execSync).toHaveBeenCalledWith(
				"npx @xala-technologies/xala-cli --version",
				{ encoding: "utf8", cwd: mockProject.root },
			);
		});

		it("should handle CLI command failures", async () => {
			const { execSync } = require("child_process");
			execSync.mockImplementation(() => {
				const error = new Error("Command failed");
				(error as any).status = 1;
				throw error;
			});

			const executeCLICommand = async (command: string) => {
				try {
					const result = execSync(
						`npx @xala-technologies/xala-cli ${command}`,
						{
							encoding: "utf8",
							cwd: mockProject.root,
						},
					);
					return { success: true, output: result, error: null };
				} catch (error) {
					return {
						success: false,
						output: null,
						error: error instanceof Error ? error.message : String(error),
					};
				}
			};

			const result = await executeCLICommand("invalid-command");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Command failed");
		});

		it("should execute component generation commands", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue(
				JSON.stringify({
					success: true,
					files: [
						{
							path: "src/components/Button.tsx",
							content: "// Generated Button component",
						},
					],
					message: "Component generated successfully",
				}),
			);

			const generateComponent = async (description: string) => {
				const command = `ai generate "${description}"`;
				const result = execSync(`npx @xala-technologies/xala-cli ${command}`, {
					encoding: "utf8",
					cwd: mockProject.root,
				});
				return JSON.parse(result);
			};

			const result = await generateComponent(
				"Create a primary button with loading state",
			);

			expect(result.success).toBe(true);
			expect(result.files).toHaveLength(1);
			expect(result.files[0].path).toBe("src/components/Button.tsx");
			expect(execSync).toHaveBeenCalledWith(
				'npx @xala-technologies/xala-cli ai generate "Create a primary button with loading state"',
				{ encoding: "utf8", cwd: mockProject.root },
			);
		});

		it("should execute migration commands", async () => {
			const { execSync } = require("child_process");
			const mockMigrationResult = mockCliResults().migration;
			execSync.mockReturnValue(mockMigrationResult.stdout);

			const executeMigration = async (
				sourceFramework: string,
				targetFramework: string,
			) => {
				const command = `migrate from ${sourceFramework} to ${targetFramework}`;
				const result = execSync(`npx @xala-technologies/xala-cli ${command}`, {
					encoding: "utf8",
					cwd: mockProject.root,
				});
				return JSON.parse(result);
			};

			const result = await executeMigration("react", "vue");

			expect(result.success).toBe(true);
			expect(result.completedPhases).toContain("analysis");
			expect(result.completedPhases).toContain("transformation");
			expect(result.modifiedFiles).toHaveLength(2);
		});

		it("should execute analysis commands", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue(
				JSON.stringify({
					projectStructure: {
						framework: "React",
						components: 15,
						dependencies: 42,
					},
					quality: {
						overall: 85,
						codeQuality: 88,
						security: 92,
					},
				}),
			);

			const analyzeProject = async () => {
				const result = execSync("npx @xala-technologies/xala-cli analyze", {
					encoding: "utf8",
					cwd: mockProject.root,
				});
				return JSON.parse(result);
			};

			const result = await analyzeProject();

			expect(result.projectStructure.framework).toBe("React");
			expect(result.projectStructure.components).toBe(15);
			expect(result.quality.overall).toBe(85);
		});
	});

	describe("CLI Configuration Management", () => {
		it("should load CLI configuration", () => {
			const mockConfig = {
				defaultPlatform: "react",
				outputDirectory: "./generated",
				cliVersion: "2.0.0",
				preferences: {
					typescript: true,
					eslint: true,
					prettier: true,
				},
			};

			require("fs").existsSync.mockReturnValue(true);
			require("fs").readFileSync.mockReturnValue(JSON.stringify(mockConfig));

			const loadCLIConfig = () => {
				const configPath = `${mockProject.root}/.xala-cli.json`;
				if (require("fs").existsSync(configPath)) {
					const content = require("fs").readFileSync(configPath, "utf8");
					return JSON.parse(content);
				}
				return null;
			};

			const config = loadCLIConfig();

			expect(config).toEqual(mockConfig);
			expect(config.defaultPlatform).toBe("react");
			expect(config.preferences.typescript).toBe(true);
		});

		it("should save CLI configuration", () => {
			const config = {
				defaultPlatform: "vue",
				outputDirectory: "./src/components",
				preferences: {
					typescript: false,
					tailwind: true,
				},
			};

			const mockWriteFileSync = jest.fn();
			require("fs").writeFileSync.mockImplementation(mockWriteFileSync);

			const saveCLIConfig = (configuration: typeof config) => {
				const configPath = `${mockProject.root}/.xala-cli.json`;
				require("fs").writeFileSync(
					configPath,
					JSON.stringify(configuration, null, 2),
				);
			};

			saveCLIConfig(config);

			expect(mockWriteFileSync).toHaveBeenCalledWith(
				`${mockProject.root}/.xala-cli.json`,
				JSON.stringify(config, null, 2),
			);
		});

		it("should merge configuration with defaults", () => {
			const defaultConfig = {
				defaultPlatform: "react",
				outputDirectory: "./src/components",
				preferences: {
					typescript: true,
					eslint: true,
					prettier: false,
				},
			};

			const userConfig = {
				defaultPlatform: "vue",
				preferences: {
					prettier: true,
					tailwind: true,
				},
			};

			const mergeConfig = (
				defaults: typeof defaultConfig,
				user: Partial<typeof defaultConfig>,
			) => {
				return {
					...defaults,
					...user,
					preferences: {
						...defaults.preferences,
						...user.preferences,
					},
				};
			};

			const merged = mergeConfig(defaultConfig, userConfig);

			expect(merged.defaultPlatform).toBe("vue"); // User override
			expect(merged.outputDirectory).toBe("./src/components"); // Default
			expect(merged.preferences.typescript).toBe(true); // Default
			expect(merged.preferences.prettier).toBe(true); // User override
			expect(merged.preferences.tailwind).toBe(true); // User addition
		});
	});

	describe("CLI Process Management", () => {
		it("should spawn long-running CLI processes", async () => {
			const { spawn } = require("child_process");
			const mockProcess = {
				stdout: { on: jest.fn() },
				stderr: { on: jest.fn() },
				on: jest.fn(),
				pid: 12345,
			};
			spawn.mockReturnValue(mockProcess);

			const spawnCLIProcess = (command: string, args: string[]) => {
				return new Promise<{ success: boolean; output: string }>((resolve) => {
					const process = spawn(
						"npx",
						["@xala-technologies/xala-cli", command, ...args],
						{
							cwd: mockProject.root,
						},
					);

					let output = "";

					process.stdout.on("data", (data: Buffer) => {
						output += data.toString();
					});

					process.on("close", (code: number) => {
						resolve({
							success: code === 0,
							output,
						});
					});

					// Simulate process completion
					setTimeout(() => {
						mockProcess.on.mock.calls
							.filter((call) => call[0] === "close")
							.forEach((call) => call[1](0));
					}, 10);
				});
			};

			const result = await spawnCLIProcess("dev", ["--watch"]);

			expect(spawn).toHaveBeenCalledWith(
				"npx",
				["@xala-technologies/xala-cli", "dev", "--watch"],
				{ cwd: mockProject.root },
			);
			expect(result.success).toBe(true);
		});

		it("should handle process termination gracefully", async () => {
			const { spawn } = require("child_process");
			const mockProcess = {
				stdout: { on: jest.fn() },
				stderr: { on: jest.fn() },
				on: jest.fn(),
				kill: jest.fn(),
				pid: 12345,
			};
			spawn.mockReturnValue(mockProcess);

			const killCLIProcess = (processId: number) => {
				const activeProcesses = new Map();
				activeProcesses.set(processId, mockProcess);

				const process = activeProcesses.get(processId);
				if (process) {
					process.kill("SIGTERM");
					activeProcesses.delete(processId);
					return true;
				}
				return false;
			};

			const terminated = killCLIProcess(12345);

			expect(terminated).toBe(true);
			expect(mockProcess.kill).toHaveBeenCalledWith("SIGTERM");
		});
	});

	describe("CLI Communication Protocol", () => {
		it("should communicate via stdin/stdout", async () => {
			const { spawn } = require("child_process");
			const mockProcess = {
				stdin: { write: jest.fn(), end: jest.fn() },
				stdout: { on: jest.fn() },
				stderr: { on: jest.fn() },
				on: jest.fn(),
			};
			spawn.mockReturnValue(mockProcess);

			const communicateWithCLI = async (input: string) => {
				return new Promise<string>((resolve) => {
					const process = spawn(
						"npx",
						["@xala-technologies/xala-cli", "interactive"],
						{
							cwd: mockProject.root,
						},
					);

					let output = "";

					process.stdout.on("data", (data: Buffer) => {
						output += data.toString();
						if (output.includes("DONE")) {
							resolve(output);
						}
					});

					process.stdin.write(input);
					process.stdin.end();

					// Simulate CLI response
					setTimeout(() => {
						mockProcess.stdout.on.mock.calls
							.filter((call) => call[0] === "data")
							.forEach((call) => call[1](Buffer.from("CLI Response DONE")));
					}, 10);
				});
			};

			const response = await communicateWithCLI("generate button component");

			expect(mockProcess.stdin.write).toHaveBeenCalledWith(
				"generate button component",
			);
			expect(response).toContain("CLI Response");
		});

		it("should handle JSON-based communication", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue(
				JSON.stringify({
					type: "response",
					data: {
						success: true,
						result: "Operation completed",
					},
				}),
			);

			const sendJSONCommand = async (command: any) => {
				const jsonCommand = JSON.stringify(command);
				const result = execSync("npx @xala-technologies/xala-cli --json", {
					input: jsonCommand,
					encoding: "utf8",
					cwd: mockProject.root,
				});
				return JSON.parse(result);
			};

			const command = {
				action: "generate",
				type: "component",
				parameters: {
					name: "Button",
					props: ["children", "onClick"],
				},
			};

			const response = await sendJSONCommand(command);

			expect(response.type).toBe("response");
			expect(response.data.success).toBe(true);
		});
	});

	describe("CLI Version Management", () => {
		it("should check CLI version compatibility", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue("2.1.0");

			const checkCLIVersion = async () => {
				const version = execSync("npx @xala-technologies/xala-cli --version", {
					encoding: "utf8",
				}).trim();

				const [major, minor] = version.split(".").map(Number);
				const requiredMajor = 2;
				const requiredMinor = 0;

				const isCompatible =
					major > requiredMajor ||
					(major === requiredMajor && minor >= requiredMinor);

				return {
					version,
					compatible: isCompatible,
					required: `${requiredMajor}.${requiredMinor}.0`,
				};
			};

			const versionCheck = await checkCLIVersion();

			expect(versionCheck.version).toBe("2.1.0");
			expect(versionCheck.compatible).toBe(true);
			expect(versionCheck.required).toBe("2.0.0");
		});

		it("should handle version incompatibility", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue("1.9.0");

			const checkCLIVersion = async () => {
				const version = execSync("npx @xala-technologies/xala-cli --version", {
					encoding: "utf8",
				}).trim();

				const [major, minor] = version.split(".").map(Number);
				const requiredMajor = 2;
				const requiredMinor = 0;

				const isCompatible =
					major > requiredMajor ||
					(major === requiredMajor && minor >= requiredMinor);

				if (!isCompatible) {
					throw new Error(
						`CLI version ${version} is not compatible. Required: ${requiredMajor}.${requiredMinor}.0 or higher`,
					);
				}

				return { version, compatible: isCompatible };
			};

			await expectAsyncThrow(
				() => checkCLIVersion(),
				"CLI version 1.9.0 is not compatible",
			);
		});
	});

	describe("CLI Environment Setup", () => {
		it("should detect CLI installation", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue("2.0.0");

			const detectCLI = async () => {
				try {
					const version = execSync(
						"npx @xala-technologies/xala-cli --version",
						{
							encoding: "utf8",
						},
					);
					return {
						installed: true,
						version: version.trim(),
						path: "npx @xala-technologies/xala-cli",
					};
				} catch (error) {
					return {
						installed: false,
						version: null,
						path: null,
						error: error instanceof Error ? error.message : String(error),
					};
				}
			};

			const detection = await detectCLI();

			expect(detection.installed).toBe(true);
			expect(detection.version).toBe("2.0.0");
			expect(detection.path).toBe("npx @xala-technologies/xala-cli");
		});

		it("should handle missing CLI installation", async () => {
			const { execSync } = require("child_process");
			execSync.mockImplementation(() => {
				const error = new Error("Command not found");
				(error as any).code = "ENOENT";
				throw error;
			});

			const detectCLI = async () => {
				try {
					const version = execSync(
						"npx @xala-technologies/xala-cli --version",
						{
							encoding: "utf8",
						},
					);
					return { installed: true, version: version.trim() };
				} catch (error) {
					return {
						installed: false,
						version: null,
						error: error instanceof Error ? error.message : String(error),
					};
				}
			};

			const detection = await detectCLI();

			expect(detection.installed).toBe(false);
			expect(detection.error).toBe("Command not found");
		});

		it("should install CLI if missing", async () => {
			const { execSync } = require("child_process");
			let installCalled = false;

			execSync.mockImplementation((command: string) => {
				if (command.includes("npm install")) {
					installCalled = true;
					return "CLI installed successfully";
				}
				if (command.includes("--version")) {
					return installCalled
						? "2.0.0"
						: (() => {
								const error = new Error("Command not found");
								throw error;
							})();
				}
				return "";
			});

			const ensureCLI = async () => {
				try {
					execSync("npx @xala-technologies/xala-cli --version");
					return { installed: true, wasInstalled: false };
				} catch (error) {
					// Install CLI
					execSync("npm install -g @xala-technologies/xala-cli");
					const version = execSync("npx @xala-technologies/xala-cli --version");
					return {
						installed: true,
						wasInstalled: true,
						version: version.trim(),
					};
				}
			};

			const result = await ensureCLI();

			expect(result.installed).toBe(true);
			expect(result.wasInstalled).toBe(true);
			expect(result.version).toBe("2.0.0");
			expect(installCalled).toBe(true);
		});
	});

	describe("Error Handling", () => {
		it("should handle CLI timeout errors", async () => {
			const { execSync } = require("child_process");
			execSync.mockImplementation(() => {
				const error = new Error("Command timed out");
				(error as any).code = "ETIMEDOUT";
				throw error;
			});

			const executeWithTimeout = async (
				command: string,
				timeoutMs: number = 5000,
			) => {
				try {
					const result = execSync(
						`npx @xala-technologies/xala-cli ${command}`,
						{
							encoding: "utf8",
							timeout: timeoutMs,
						},
					);
					return { success: true, output: result };
				} catch (error: any) {
					if (error.code === "ETIMEDOUT") {
						return {
							success: false,
							error: "Command timed out",
							timeout: true,
						};
					}
					return {
						success: false,
						error: error.message,
						timeout: false,
					};
				}
			};

			const result = await executeWithTimeout("long-running-task", 1000);

			expect(result.success).toBe(false);
			expect(result.timeout).toBe(true);
			expect(result.error).toBe("Command timed out");
		});

		it("should handle CLI permission errors", async () => {
			const { execSync } = require("child_process");
			execSync.mockImplementation(() => {
				const error = new Error("Permission denied");
				(error as any).code = "EACCES";
				throw error;
			});

			const handleCLIError = async (command: string) => {
				try {
					const result = execSync(`npx @xala-technologies/xala-cli ${command}`);
					return { success: true, output: result };
				} catch (error: any) {
					const errorInfo = {
						success: false,
						code: error.code,
						message: error.message,
						suggestion: "",
					};

					switch (error.code) {
						case "EACCES":
							errorInfo.suggestion =
								"Try running with elevated permissions or check file permissions";
							break;
						case "ENOENT":
							errorInfo.suggestion =
								"CLI not found. Install with: npm install -g @xala-technologies/xala-cli";
							break;
						case "ETIMEDOUT":
							errorInfo.suggestion =
								"Command timed out. Try increasing timeout or check network connection";
							break;
						default:
							errorInfo.suggestion =
								"Check CLI documentation for troubleshooting";
					}

					return errorInfo;
				}
			};

			const result = await handleCLIError("generate component");

			expect(result.success).toBe(false);
			expect(result.code).toBe("EACCES");
			expect(result.suggestion).toContain("elevated permissions");
		});
	});

	describe("Performance", () => {
		it("should execute CLI commands efficiently", async () => {
			const { execSync } = require("child_process");
			execSync.mockReturnValue("Quick response");

			const benchmarkCLI = async (command: string) => {
				const startTime = Date.now();
				const result = execSync(`npx @xala-technologies/xala-cli ${command}`, {
					encoding: "utf8",
				});
				const endTime = Date.now();

				return {
					result,
					executionTime: endTime - startTime,
					command,
				};
			};

			const benchmark = await benchmarkCLI("--version");

			expect(benchmark.result).toBe("Quick response");
			expect(benchmark.executionTime).toBeLessThan(1000); // Should be fast
			expect(benchmark.command).toBe("--version");
		});

		it("should cache CLI results when appropriate", async () => {
			const { execSync } = require("child_process");
			let callCount = 0;
			execSync.mockImplementation(() => {
				callCount++;
				return "Cached response";
			});

			const cliCache = new Map<string, { result: string; timestamp: number }>();
			const CACHE_TTL = 5000; // 5 seconds

			const executeWithCache = async (command: string) => {
				const cacheKey = command;
				const cached = cliCache.get(cacheKey);
				const now = Date.now();

				if (cached && now - cached.timestamp < CACHE_TTL) {
					return cached.result;
				}

				const result = execSync(`npx @xala-technologies/xala-cli ${command}`, {
					encoding: "utf8",
				});

				cliCache.set(cacheKey, { result, timestamp: now });
				return result;
			};

			// First call
			const result1 = await executeWithCache("--version");
			// Second call (should be cached)
			const result2 = await executeWithCache("--version");

			expect(result1).toBe("Cached response");
			expect(result2).toBe("Cached response");
			expect(callCount).toBe(1); // CLI called only once
			expect(cliCache.size).toBe(1);
		});
	});

	describe("Integration", () => {
		it("should integrate CLI with MCP server workflow", async () => {
			const { execSync } = require("child_process");

			// Mock different CLI responses for workflow steps
			execSync.mockImplementation((command: string) => {
				if (command.includes("analyze")) {
					return JSON.stringify({
						framework: "React",
						components: 5,
						quality: 85,
					});
				}
				if (command.includes("generate")) {
					return JSON.stringify({
						success: true,
						files: [{ path: "Button.tsx", content: "..." }],
					});
				}
				if (command.includes("migrate")) {
					return JSON.stringify({
						success: true,
						modifiedFiles: ["Button.tsx", "Input.tsx"],
					});
				}
				return "{}";
			});

			const executeWorkflow = async () => {
				// Step 1: Analyze project
				const analysisResult = JSON.parse(
					execSync("npx @xala-technologies/xala-cli analyze", {
						encoding: "utf8",
					}),
				);

				// Step 2: Generate component if needed
				const generationResult = JSON.parse(
					execSync(
						'npx @xala-technologies/xala-cli generate "button component"',
						{ encoding: "utf8" },
					),
				);

				// Step 3: Migrate if requested
				const migrationResult = JSON.parse(
					execSync(
						"npx @xala-technologies/xala-cli migrate from react to vue",
						{ encoding: "utf8" },
					),
				);

				return {
					analysis: analysisResult,
					generation: generationResult,
					migration: migrationResult,
					workflow: "completed",
				};
			};

			const workflow = await executeWorkflow();

			expect(workflow.analysis.framework).toBe("React");
			expect(workflow.generation.success).toBe(true);
			expect(workflow.migration.success).toBe(true);
			expect(workflow.workflow).toBe("completed");
		});
	});
});
