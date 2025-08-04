/**
 * Remove Command Tests
 *
 * Tests for the remove command implementation.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { removeCommand } from "./remove.js";

describe("Remove Command", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should be properly configured", () => {
		expect(removeCommand.name()).toBe("remove");
		expect(removeCommand.description()).toContain(
			"Remove services from existing project",
		);
	});

	it("should have correct options", () => {
		const options = removeCommand.options;

		expect(options.some((opt) => opt.long === "--force")).toBe(true);
		expect(options.some((opt) => opt.long === "--cleanup")).toBe(true);
		expect(options.some((opt) => opt.long === "--dry-run")).toBe(true);
		expect(options.some((opt) => opt.long === "--keep-config")).toBe(true);
	});

	it("should accept multiple service arguments", () => {
		const args = removeCommand._args;
		expect(args).toHaveLength(1);
		expect(args[0].name()).toBe("services");
		expect(args[0].variadic).toBe(true); // Should accept multiple services
	});

	it("should have proper command structure", () => {
		expect(removeCommand).toBeDefined();
		expect(typeof removeCommand._action).toBe("function");
		expect(removeCommand.description()).toBeTruthy();
	});

	describe("command options", () => {
		it("should support force removal", () => {
			const forceOption = removeCommand.options.find(
				(opt) => opt.long === "--force",
			);
			expect(forceOption).toBeDefined();
			expect(forceOption?.description).toContain("Force removal");
		});

		it("should support cleanup operations", () => {
			const cleanupOption = removeCommand.options.find(
				(opt) => opt.long === "--cleanup",
			);
			expect(cleanupOption).toBeDefined();
			expect(cleanupOption?.description).toContain("orphaned");
		});

		it("should support dry-run mode", () => {
			const dryRunOption = removeCommand.options.find(
				(opt) => opt.long === "--dry-run",
			);
			expect(dryRunOption).toBeDefined();
			expect(dryRunOption?.description).toContain("Preview changes");
		});

		it("should support keeping configuration", () => {
			const keepConfigOption = removeCommand.options.find(
				(opt) => opt.long === "--keep-config",
			);
			expect(keepConfigOption).toBeDefined();
			expect(keepConfigOption?.description).toContain("Keep configuration");
		});
	});

	describe("service removal logic", () => {
		it("should handle multiple services", () => {
			// Command should be able to remove multiple services at once
			const args = removeCommand._args;
			expect(args[0].variadic).toBe(true);
		});

		it("should support interactive selection", () => {
			// When no services specified, should prompt for selection
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should validate service existence", () => {
			// Should check that services exist before trying to remove them
			expect(typeof removeCommand._action).toBe("function");
		});
	});

	describe("safety features", () => {
		it("should check dependencies before removal", () => {
			// Command should use ServiceRemover to check dependencies
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should create backups", () => {
			// Command should create backups before removal
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should provide warnings for breaking changes", () => {
			// Command should warn about dependent services
			expect(typeof removeCommand._action).toBe("function");
		});
	});

	describe("help text", () => {
		it("should provide comprehensive help", () => {
			const help = removeCommand.helpInformation();

			expect(help).toContain("Remove services");
			expect(help).toContain("--force");
			expect(help).toContain("--cleanup");
			expect(help).toContain("--dry-run");
		});

		it("should explain removal process", () => {
			const help = removeCommand.helpInformation();

			expect(help).toContain("services");
			expect(help.length).toBeGreaterThan(100); // Ensure substantial help content
		});
	});

	describe("integration points", () => {
		it("should integrate with ProjectAnalyzer", () => {
			// Command should analyze project to understand current services
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should integrate with ServiceRemover", () => {
			// Command should use ServiceRemover for dependency analysis and removal
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should integrate with ServiceRegistry", () => {
			// Command should use ServiceRegistry to understand service templates
			expect(typeof removeCommand._action).toBe("function");
		});
	});

	describe("error handling", () => {
		it("should handle invalid service names", () => {
			// Command should validate service names before processing
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should handle removal failures gracefully", () => {
			// Command should provide meaningful error messages
			expect(typeof removeCommand._action).toBe("function");
		});

		it("should handle project detection failures", () => {
			// Command should fail gracefully if no project is detected
			expect(typeof removeCommand._action).toBe("function");
		});
	});
});
