/**
 * Test Setup and Global Configuration
 *
 * Sets up test environment, mocks, and utilities for CLI v2 testing.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import { promises as fs, existsSync, mkdirSync, rmSync } from "node:fs";
import { afterEach, beforeEach, vi } from "vitest";
import { getDirname } from "../utils/esm-compat";

const __dirname = getDirname(import.meta.url);

// Mock consola to prevent log pollution during tests
vi.mock("consola", async () => {
	const actual = await vi.importActual("consola");
	return {
		...actual,
		consola: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			success: vi.fn(),
			debug: vi.fn(),
			log: vi.fn(),
			start: vi.fn(),
			ready: vi.fn(),
			fail: vi.fn(),
		},
	};
});

// Mock @clack/prompts to prevent interactive prompts during tests
vi.mock("@clack/prompts", () => ({
	intro: vi.fn(),
	outro: vi.fn(),
	select: vi.fn().mockResolvedValue("default"),
	multiselect: vi.fn().mockResolvedValue([]),
	confirm: vi.fn().mockResolvedValue(true),
	text: vi.fn().mockResolvedValue("test-input"),
	password: vi.fn().mockResolvedValue("test-password"),
	spinner: vi.fn(() => ({
		start: vi.fn(),
		stop: vi.fn(),
		message: vi.fn(),
	})),
	isCancel: vi.fn(() => false),
	cancel: vi.fn(),
}));

// Mock external services
vi.mock("codebuff", () => ({
	runCodebuff: vi.fn().mockResolvedValue({
		success: true,
		changes: [],
		message: "Mock codebuff response",
	}),
}));

// Mock execa for CLI testing with realistic responses
vi.mock("execa", () => ({
	execa: vi.fn().mockResolvedValue({
		stdout: "Mock command output",
		stderr: "",
		exitCode: 0,
		command: "mock-command",
		escapedCommand: "mock-command",
		failed: false,
		timedOut: false,
		isCanceled: false,
		killed: false,
	}),
}));

// Mock inquirer for interactive prompts
vi.mock("inquirer", () => ({
	prompt: vi.fn().mockResolvedValue({
		confirm: true,
		selection: "default",
		input: "mock-input",
	}),
}));

// Mock ora spinner for loading states
vi.mock("ora", () => ({
	default: vi.fn(() => ({
		start: vi.fn(),
		stop: vi.fn(),
		succeed: vi.fn(),
		fail: vi.fn(),
		warn: vi.fn(),
		info: vi.fn(),
		text: "",
		color: "cyan",
	})),
}));

// Mock fs-extra for compatibility with existing code
// Allow real directory operations but mock file operations for safety
vi.mock("fs-extra", async () => {
	const actual = await vi.importActual("fs-extra");
	return {
		...actual,
		default: {
			// Allow real directory operations
			ensureDir: actual.ensureDir,
			mkdir: actual.mkdir,
			mkdirSync: actual.mkdirSync,
			existsSync: actual.existsSync,
			pathExists: actual.pathExists,
			// Mock file operations for safety
			writeFile: vi.fn().mockResolvedValue(undefined),
			writeFileSync: vi.fn(),
			readFile: vi.fn().mockResolvedValue("mock file content"),
			readFileSync: vi.fn().mockReturnValue("mock file content"),
			remove: vi.fn().mockResolvedValue(undefined),
			removeSync: vi.fn(),
			copy: vi.fn().mockResolvedValue(undefined),
		},
		// Allow real directory operations
		ensureDir: actual.ensureDir,
		mkdir: actual.mkdir,
		mkdirSync: actual.mkdirSync,
		existsSync: actual.existsSync,
		pathExists: actual.pathExists,
		// Mock file operations for safety
		writeFile: vi.fn().mockResolvedValue(undefined),
		writeFileSync: vi.fn(),
		readFile: vi.fn().mockResolvedValue("mock file content"),
		readFileSync: vi.fn().mockReturnValue("mock file content"),
		remove: vi.fn().mockResolvedValue(undefined),
		removeSync: vi.fn(),
		copy: vi.fn().mockResolvedValue(undefined),
	};
});

// Mock fs operations for safety in tests - use native fs
const originalFs = {
	writeFile: fs.writeFile,
	mkdir: fs.mkdir,
	rm: fs.rm,
};

// Create a proper test directory for process.cwd() mock
const testCwd = path.resolve(__dirname, "../../test-output/mock-project");

// Mock process.exit to prevent tests from terminating
const mockExit = vi.fn();
vi.stubGlobal("process", {
	...process,
	exit: mockExit,
	on: vi.fn(),
	cwd: () => testCwd,
	argv: ["node", "xaheen", ...process.argv.slice(2)],
	// Ensure all process methods are available for Vitest
	memoryUsage: process.memoryUsage,
	cpuUsage: process.cpuUsage,
	hrtime: process.hrtime,
	nextTick: process.nextTick,
});

// Setup test directories
beforeEach(async () => {
	// Clear all mocks before each test
	vi.clearAllMocks();

	// Ensure test output directory exists
	const testOutputDir = path.resolve(__dirname, "../../test-output");
	const fsExtra = await import("fs-extra");
	await fsExtra.ensureDir(testOutputDir);

	// Ensure mock project directory exists for process.cwd() mock
	await fsExtra.ensureDir(testCwd);

	// Reset mock implementations with fresh state
	mockExit.mockReset();
	
	// Reset specific mocks that might accumulate state
	vi.mocked(vi.importActual("consola")).then((consola) => {
		if (consola.consola) {
			Object.values(consola.consola).forEach((fn) => {
				if (typeof fn === 'function' && 'mockReset' in fn) {
					fn.mockReset();
				}
			});
		}
	}).catch(() => {
		// Ignore if consola mock is not available
	});
});

afterEach(async () => {
	// Clean up any temporary files/directories created during tests
	// This helps prevent test pollution
	vi.resetAllMocks();
	
	// Additional cleanup for file system state
	try {
		const fsExtra = await import("fs-extra");
		// Clean up any test artifacts in the mock project directory
		const contents = await fsExtra.readdir(testCwd).catch(() => []);
		for (const item of contents) {
			if (item.startsWith('test-') || item.startsWith('mock-')) {
				await fsExtra.remove(path.join(testCwd, item)).catch(() => {
					// Ignore cleanup errors
				});
			}
		}
	} catch {
		// Ignore cleanup errors
	}
});

// Global test utilities
globalThis.__TEST_UTILS__ = {
	mockExit,
	originalFs,
};

// Increase timeout for async operations based on environment
vi.setConfig({
	testTimeout: process.env.CI ? 30000 : 60000,
	hookTimeout: process.env.CI ? 15000 : 30000,
});
