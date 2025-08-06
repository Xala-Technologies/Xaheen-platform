/**
 * Test Isolation Utilities
 * 
 * Provides utilities to properly isolate tests and prevent conflicts
 * between test runs, especially for command registration and singletons.
 */

import { vi } from "vitest";

/**
 * Setup test isolation to prevent conflicts between tests
 */
export function setupTestIsolation() {
	// Clear all module caches to ensure fresh imports
	vi.resetModules();
	
	// Mock commander to prevent command registration conflicts
	vi.mock("commander", () => {
		let commandCount = 0;
		
		const createMockCommand = () => {
			const commandId = ++commandCount;
			const commands: any[] = [];
			
			const mockCommand = {
				name: vi.fn((value?: string) => value ? mockCommand : `mock-command-${commandId}`),
				description: vi.fn().mockReturnThis(),
				version: vi.fn((value?: string) => value ? mockCommand : "1.0.0"),
				option: vi.fn().mockReturnThis(),
				argument: vi.fn().mockReturnThis(),
				action: vi.fn().mockReturnThis(),
				command: vi.fn((pattern: string) => {
					const subCommand = createMockCommand();
					subCommand.parent = mockCommand;
					commands.push(subCommand);
					return subCommand;
				}),
				addCommand: vi.fn().mockReturnThis(),
				parse: vi.fn().mockReturnThis(),
				parseAsync: vi.fn().mockReturnThis(),
				opts: vi.fn().mockReturnValue({}),
				args: [],
				parent: null,
				commands,
				allowUnknownOption: vi.fn().mockReturnThis(),
				helpInformation: vi.fn().mockReturnValue("Mock help information"),
				outputHelp: vi.fn(),
			};
			
			return mockCommand;
		};

		const Command = vi.fn().mockImplementation(() => createMockCommand());
		Command.prototype = createMockCommand();

		return {
			Command,
			program: createMockCommand(),
		};
	});

	// Mock process to prevent test pollution
	const mockProcess = {
		...process,
		exit: vi.fn(),
		cwd: vi.fn(() => "/test/workspace"),
		env: { ...process.env, NODE_ENV: "test" },
	};
	
	vi.stubGlobal("process", mockProcess);

	return {
		mockProcess,
		cleanup: () => {
			vi.restoreAllMocks();
			vi.resetModules();
		},
	};
}

/**
 * Create a fresh command parser instance for testing
 */
export function createFreshCommandParser() {
	// Reset any singleton instances
	const { CommandParser } = vi.importMock("../../core/command-parser/index.js") as any;
	if (CommandParser?.reset) {
		CommandParser.reset();
	}
	
	return CommandParser;
}

/**
 * Mock all domain handlers to prevent actual execution
 */
export function setupDomainMocks() {
	// Project domain
	vi.mock("../../domains/project/index.js", () => ({
		default: class MockProjectDomain {
			create = vi.fn().mockResolvedValue({ success: true });
			validate = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ projects: [] });
		},
	}));

	// Service domain
	vi.mock("../../domains/service/index.js", () => ({
		default: class MockServiceDomain {
			add = vi.fn().mockResolvedValue({ success: true });
			remove = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ services: [] });
		},
	}));

	// AI domain
	vi.mock("../../domains/ai/index.js", () => ({
		default: class MockAIDomain {
			generate = vi.fn().mockResolvedValue({ success: true });
			generateService = vi.fn().mockResolvedValue({ success: true });
			code = vi.fn().mockResolvedValue({ success: true });
			refactor = vi.fn().mockResolvedValue({ success: true });
		},
	}));

	// App domain
	vi.mock("../../domains/app/index.js", () => ({
		default: class MockAppDomain {
			create = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ apps: [] });
			add = vi.fn().mockResolvedValue({ success: true });
		},
	}));

	// Package domain
	vi.mock("../../domains/package/index.js", () => ({
		default: class MockPackageDomain {
			add = vi.fn().mockResolvedValue({ success: true });
			remove = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ packages: [] });
		},
	}));

	// Component domain
	vi.mock("../../domains/component/index.js", () => ({
		default: class MockComponentDomain {
			create = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ components: [] });
		},
	}));

	// Page domain
	vi.mock("../../domains/page/index.js", () => ({
		default: class MockPageDomain {
			create = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ pages: [] });
		},
	}));

	// Model domain
	vi.mock("../../domains/model/index.js", () => ({
		default: class MockModelDomain {
			create = vi.fn().mockResolvedValue({ success: true });
			list = vi.fn().mockResolvedValue({ models: [] });
		},
	}));

	// Make domain
	vi.mock("../../domains/make/index.js", () => ({
		default: class MockMakeDomain {
			execute = vi.fn().mockResolvedValue({ success: true });
			component = vi.fn().mockResolvedValue({ success: true });
			model = vi.fn().mockResolvedValue({ success: true });
			service = vi.fn().mockResolvedValue({ success: true });
			page = vi.fn().mockResolvedValue({ success: true });
		},
	}));

	// Help domain
	vi.mock("../../domains/help/index.js", () => ({
		default: class MockHelpDomain {
			show = vi.fn().mockResolvedValue({ success: true });
			search = vi.fn().mockResolvedValue({ results: [] });
			examples = vi.fn().mockResolvedValue({ examples: [] });
		},
	}));

	// Registry command handler
	vi.mock("../../core/command-parser/handlers/RegistryCommandHandler", () => ({
		RegistryCommandHandler: class MockRegistryCommandHandler {
			domain = 'registry';
			getSupportedActions = vi.fn().mockReturnValue(['add', 'list', 'info', 'search', 'build', 'serve']);
			canHandle = vi.fn().mockReturnValue(true);
			execute = vi.fn().mockResolvedValue(undefined);
			handleAdd = vi.fn().mockResolvedValue(undefined);
			handleList = vi.fn().mockResolvedValue(undefined);
			handleInfo = vi.fn().mockResolvedValue(undefined);
			handleSearch = vi.fn().mockResolvedValue(undefined);
			handleBuild = vi.fn().mockResolvedValue(undefined);
			handleServe = vi.fn().mockResolvedValue(undefined);
		},
	}));

	// Config manager
	vi.mock("../../core/config-manager/index.js", () => ({
		default: class MockConfigManager {
			get = vi.fn().mockReturnValue({});
			set = vi.fn();
			has = vi.fn().mockReturnValue(false);
			getConfig = vi.fn().mockReturnValue({});
		},
	}));

	// AI commands
	vi.mock("../../commands/ai.js", () => ({
		codebuffCommand: vi.fn().mockResolvedValue(undefined),
		fixTestsCommand: vi.fn().mockResolvedValue(undefined),
		norwegianComplianceCommand: vi.fn().mockResolvedValue(undefined),
	}));
}

/**
 * Setup file system mocks for testing
 */
export function setupFileSystemMocks() {
	vi.mock("fs-extra", () => ({
		pathExists: vi.fn().mockResolvedValue(true),
		readFile: vi.fn().mockResolvedValue("mock file content"),
		writeFile: vi.fn().mockResolvedValue(undefined),
		readJson: vi.fn().mockResolvedValue({}),
		writeJson: vi.fn().mockResolvedValue(undefined),
		ensureDir: vi.fn().mockResolvedValue(undefined),
		remove: vi.fn().mockResolvedValue(undefined),
		copy: vi.fn().mockResolvedValue(undefined),
		move: vi.fn().mockResolvedValue(undefined),
	}));

	vi.mock("node:fs", () => ({
		existsSync: vi.fn().mockReturnValue(true),
		readFileSync: vi.fn().mockReturnValue("mock file content"),
		writeFileSync: vi.fn().mockReturnValue(undefined),
		mkdirSync: vi.fn().mockReturnValue(undefined),
		readdirSync: vi.fn().mockReturnValue([]),
		statSync: vi.fn().mockReturnValue({ isDirectory: () => false, isFile: () => true }),
	}));
}

/**
 * Setup external dependencies mocks
 */
export function setupExternalMocks() {
	// Mock execa for command execution
	vi.mock("execa", () => ({
		execa: vi.fn().mockResolvedValue({
			stdout: "",
			stderr: "",
			exitCode: 0,
		}),
	}));

	// Mock codebuff
	vi.mock("codebuff", () => ({
		runCodebuff: vi.fn().mockResolvedValue({
			success: true,
			changes: [],
			message: "Mock codebuff response",
		}),
	}));

	// Mock inquirer
	vi.mock("inquirer", () => ({
		prompt: vi.fn().mockResolvedValue({}),
	}));

	// Mock ora spinner
	vi.mock("ora", () => ({
		default: vi.fn(() => ({
			start: vi.fn().mockReturnThis(),
			stop: vi.fn().mockReturnThis(),
			succeed: vi.fn().mockReturnThis(),
			fail: vi.fn().mockReturnThis(),
			text: "",
		})),
	}));

	// Mock chalk
	vi.mock("chalk", () => {
		const mockChalk = {
			blue: vi.fn((text: string) => text),
			green: vi.fn((text: string) => text),
			yellow: vi.fn((text: string) => text),
			red: vi.fn((text: string) => text),
			gray: vi.fn((text: string) => text),
			magenta: vi.fn((text: string) => text),
			cyan: vi.fn((text: string) => text),
			white: vi.fn((text: string) => text),
			black: vi.fn((text: string) => text),
			dim: vi.fn((text: string) => text),
			bold: vi.fn((text: string) => text),
		};
		
		return {
			default: mockChalk,
			...mockChalk,
		};
	});

	// Mock express
	vi.mock("express", () => ({
		default: vi.fn(() => ({
			use: vi.fn(),
			listen: vi.fn((port, host, callback) => callback?.()),
			get: vi.fn(),
		})),
		static: vi.fn(),
	}));

	// Mock cors
	vi.mock("cors", () => ({
		default: vi.fn(() => vi.fn()),
	}));

	// Mock node-fetch
	vi.mock("node-fetch", () => ({
		default: vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({}),
			statusText: "OK",
		}),
	}));
}