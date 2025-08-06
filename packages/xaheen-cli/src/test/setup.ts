/**
 * Test Setup and Global Configuration
 *
 * Sets up test environment, mocks, and utilities for CLI v2 testing.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, vi } from "vitest";
import { getDirname } from "../utils/esm-compat.js";

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

// Mock execa for CLI testing
vi.mock("execa", () => ({
	execa: vi.fn(),
}));

// Mock fs operations for safety in tests
const originalFs = {
	writeFile: fs.writeFile,
	writeFileSync: fs.writeFileSync,
	mkdir: fs.mkdir,
	mkdirSync: fs.mkdirSync,
	remove: fs.remove,
	removeSync: fs.removeSync,
};

// Mock process.exit to prevent tests from terminating
const mockExit = vi.fn();
vi.stubGlobal("process", {
	...process,
	exit: mockExit,
	on: vi.fn(),
	cwd: () => "/test/project",
	argv: ["node", "xaheen", ...process.argv.slice(2)],
});

// Setup test directories
beforeEach(async () => {
	// Clear all mocks before each test
	vi.clearAllMocks();

	// Ensure test output directory exists
	const testOutputDir = path.resolve(__dirname, "../../test-output");
	await fs.ensureDir(testOutputDir);

	// Reset mock implementations
	mockExit.mockReset();
});

afterEach(async () => {
	// Clean up any temporary files/directories created during tests
	// This helps prevent test pollution
	vi.resetAllMocks();
});

// Global test utilities
globalThis.__TEST_UTILS__ = {
	mockExit,
	originalFs,
};

// Increase timeout for async operations
vi.setConfig({
	testTimeout: 60000,
	hookTimeout: 30000,
});
