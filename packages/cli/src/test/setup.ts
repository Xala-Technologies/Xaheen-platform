/**
 * Test Setup and Global Configuration
 *
 * Sets up test environment, mocks, and utilities for CLI v2 testing.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { vi } from "vitest";

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
	select: vi.fn(),
	multiselect: vi.fn(),
	confirm: vi.fn(),
	text: vi.fn(),
	password: vi.fn(),
	spinner: vi.fn(() => ({
		start: vi.fn(),
		stop: vi.fn(),
		message: vi.fn(),
	})),
	isCancel: vi.fn(() => false),
	cancel: vi.fn(),
}));

// Mock process.exit to prevent tests from terminating
vi.stubGlobal("process", {
	...process,
	exit: vi.fn(),
	cwd: vi.fn(() => "/test/project"),
	argv: ["node", "xaheen", ...process.argv.slice(2)],
});

// Increase timeout for async operations
vi.setConfig({
	testTimeout: 30000,
	hookTimeout: 30000,
});
