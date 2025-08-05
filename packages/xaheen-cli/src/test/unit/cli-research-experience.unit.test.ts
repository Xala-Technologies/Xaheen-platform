/**
 * Unit Tests for CLI Research-Driven Developer Experience Components
 * Tests individual components and their core functionality
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// Import components to test
import AutoCompletionEngine, { type CompletionItem } from "../../services/cli/auto-completion-engine.js";
import RichOutputFormatter from "../../services/cli/rich-output-formatter.js";
import { ProgressBar, Spinner } from "../../services/cli/progress-indicator.js";

describe("CLI Research-Driven Developer Experience - Unit Tests", () => {
	let testDir: string;

	beforeEach(() => {
		testDir = mkdtempSync(join(tmpdir(), "xaheen-unit-test-"));
		jest.clearAllMocks();
	});

	afterEach(() => {
		try {
			rmSync(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	describe("AutoCompletionEngine", () => {
		let engine: AutoCompletionEngine;

		beforeEach(() => {
			engine = new AutoCompletionEngine(testDir);
		});

		describe("parseCommandLine", () => {
			it("should parse simple command", () => {
				const context = engine.parseCommandLine("xaheen generate", 15);
				
				expect(context.command).toEqual(["generate"]);
				expect(context.currentArg).toBe("generate");
				expect(context.isOption).toBe(false);
			});

			it("should parse command with subcommand", () => {
				const context = engine.parseCommandLine("xaheen generate component", 25);
				
				expect(context.command).toEqual(["generate", "component"]);
				expect(context.currentArg).toBe("component");
				expect(context.isOption).toBe(false);
			});

			it("should parse command with option", () => {
				const context = engine.parseCommandLine("xaheen generate --help", 22);
				
				expect(context.command).toEqual(["generate"]);
				expect(context.isOption).toBe(true);
				expect(context.optionName).toBe("--help");
			});

			it("should handle partial commands", () => {
				const context = engine.parseCommandLine("xaheen gen", 10);
				
				expect(context.command).toEqual(["gen"]);
				expect(context.currentArg).toBe("gen");
				expect(context.isOption).toBe(false);
			});

			it("should handle empty command", () => {
				const context = engine.parseCommandLine("xaheen ", 7);
				
				expect(context.command).toEqual([""]);
				expect(context.currentArg).toBe("");
				expect(context.isOption).toBe(false);
			});
		});

		describe("fuzzyFilter", () => {
			let testItems: CompletionItem[];

			beforeEach(() => {
				testItems = [
					{ label: "generate", value: "generate", kind: "command" },
					{ label: "create", value: "create", kind: "command" },
					{ label: "plugin", value: "plugin", kind: "command" },
					{ label: "generator", value: "generator", kind: "subcommand" },
					{ label: "component", value: "component", kind: "generator" },
				];
			});

			it("should filter items by exact match", () => {
				const filtered = engine.fuzzyFilter(testItems, "generate");
				
				expect(filtered.length).toBeGreaterThan(0);
				expect(filtered[0].label).toBe("generate");
			});

			it("should filter items by partial match", () => {
				const filtered = engine.fuzzyFilter(testItems, "gen");
				
				expect(filtered.length).toBeGreaterThan(0);
				expect(filtered.some(item => item.label === "generate")).toBe(true);
				expect(filtered.some(item => item.label === "generator")).toBe(true);
			});

			it("should handle case insensitive matching", () => {
				const filtered = engine.fuzzyFilter(testItems, "GEN");
				
				expect(filtered.length).toBeGreaterThan(0);
				expect(filtered.some(item => item.label === "generate")).toBe(true);
			});

			it("should return empty array for no matches", () => {
				const filtered = engine.fuzzyFilter(testItems, "xyz");
				
				expect(filtered.length).toBe(0);
			});

			it("should handle empty query", () => {
				const filtered = engine.fuzzyFilter(testItems, "");
				
				expect(filtered.length).toBe(testItems.length);
			});

			it("should score items correctly", () => {
				const filtered = engine.fuzzyFilter(testItems, "gen");
				
				// Items should be sorted by score (higher is better)
				for (let i = 0; i < filtered.length - 1; i++) {
					expect(filtered[i].score).toBeGreaterThanOrEqual(filtered[i + 1].score);
				}
			});
		});

		describe("Levenshtein Distance", () => {
			it("should calculate exact matches correctly", () => {
				const items = [{ label: "test", value: "test", kind: "command" as const }];
				const filtered = engine.fuzzyFilter(items, "test");
				
				expect(filtered[0].score).toBe(1.0); // Exact match should have perfect score
			});

			it("should calculate partial matches correctly", () => {
				const items = [{ label: "testing", value: "testing", kind: "command" as const }];
				const filtered = engine.fuzzyFilter(items, "test");
				
				expect(filtered[0].score).toBeGreaterThan(0.5);
				expect(filtered[0].score).toBeLessThan(1.0);
			});
		});
	});

	describe("RichOutputFormatter", () => {
		let formatter: RichOutputFormatter;

		beforeEach(() => {
			formatter = new RichOutputFormatter({ colors: false }); // Disable colors for testing
		});

		describe("Message Formatting", () => {
			it("should format success messages", () => {
				const message = formatter.success("Operation completed");
				
				expect(message).toContain("✓");
				expect(message).toContain("Operation completed");
			});

			it("should format error messages", () => {
				const message = formatter.error("Operation failed");
				
				expect(message).toContain("✗");
				expect(message).toContain("Operation failed");
			});

			it("should format warning messages", () => {
				const message = formatter.warning("Warning message");
				
				expect(message).toContain("⚠");
				expect(message).toContain("Warning message");
			});

			it("should format info messages", () => {
				const message = formatter.info("Info message");
				
				expect(message).toContain("ℹ");
				expect(message).toContain("Info message");
			});

			it("should format messages with details", () => {
				const message = formatter.success("Success", "Additional details");
				
				expect(message).toContain("Success");
				expect(message).toContain("Additional details");
			});
		});

		describe("Table Creation", () => {
			it("should create basic table", () => {
				const data = [
					{ name: "John", age: 30 },
					{ name: "Jane", age: 25 },
				];

				const columns = [
					{ key: "name", title: "Name" },
					{ key: "age", title: "Age" },
				];

				const table = formatter.table(data, columns);
				
				expect(table).toContain("Name");
				expect(table).toContain("Age");
				expect(table).toContain("John");
				expect(table).toContain("Jane");
				expect(table).toContain("30");
				expect(table).toContain("25");
			});

			it("should handle empty data", () => {
				const columns = [
					{ key: "name", title: "Name" },
				];

				const table = formatter.table([], columns);
				
				expect(table).toContain("Name");
			});

			it("should apply column formatting", () => {
				const data = [{ number: 1234.56 }];
				const columns = [{
					key: "number",
					title: "Number",
					format: (value: number) => `$${value.toFixed(2)}`,
				}];

				const table = formatter.table(data, columns);
				
				expect(table).toContain("$1234.56");
			});
		});

		describe("Diff Creation", () => {
			it("should create simple diff", () => {
				const oldContent = "line 1\nline 2\nline 3";
				const newContent = "line 1\nmodified line 2\nline 3";

				const diff = formatter.diff(oldContent, newContent);
				
				expect(diff).toContain("line 1");
				expect(diff).toContain("modified line 2");
				expect(diff).toContain("+");
				expect(diff).toContain("-");
			});

			it("should handle additions", () => {
				const oldContent = "line 1\nline 2";
				const newContent = "line 1\nline 2\nline 3";

				const diff = formatter.diff(oldContent, newContent);
				
				expect(diff).toContain("+");
				expect(diff).toContain("line 3");
			});

			it("should handle deletions", () => {
				const oldContent = "line 1\nline 2\nline 3";
				const newContent = "line 1\nline 3";

				const diff = formatter.diff(oldContent, newContent);
				
				expect(diff).toContain("-");
				expect(diff).toContain("line 2");
			});

			it("should handle filename in diff", () => {
				const diff = formatter.diff("old", "new", "test.txt");
				
				expect(diff).toContain("test.txt");
			});
		});

		describe("Inline Diff", () => {
			it("should create character-level diff", () => {
				const oldText = "Hello world";
				const newText = "Hello beautiful world";

				const inlineDiff = formatter.inlineDiff(oldText, newText);
				
				expect(inlineDiff).toContain("Hello");
				expect(inlineDiff).toContain("world");
				expect(inlineDiff).toContain("beautiful");
			});

			it("should handle completely different text", () => {
				const oldText = "abc";
				const newText = "xyz";

				const inlineDiff = formatter.inlineDiff(oldText, newText);
				
				expect(typeof inlineDiff).toBe("string");
				expect(inlineDiff.length).toBeGreaterThan(0);
			});
		});

		describe("Tree Structure", () => {
			it("should create simple tree", () => {
				const nodes = [
					{ name: "root" },
					{ name: "child" },
				];

				const tree = formatter.tree(nodes);
				
				expect(tree).toContain("root");
				expect(tree).toContain("child");
				expect(tree).toContain("└──");
			});

			it("should create nested tree", () => {
				const nodes = [
					{
						name: "root",
						children: [
							{ name: "child1" },
							{ name: "child2" },
						],
					},
				];

				const tree = formatter.tree(nodes);
				
				expect(tree).toContain("root");
				expect(tree).toContain("child1");
				expect(tree).toContain("child2");
				expect(tree).toContain("├──");
				expect(tree).toContain("└──");
			});

			it("should handle tree with icons", () => {
				const nodes = [
					{ name: "folder", icon: "📁" },
					{ name: "file", icon: "📄" },
				];

				const tree = formatter.tree(nodes, { showIcons: true });
				
				expect(tree).toContain("📁");
				expect(tree).toContain("📄");
			});
		});

		describe("Box Creation", () => {
			it("should create simple box", () => {
				const boxed = formatter.box("Hello World");
				
				expect(boxed).toContain("Hello World");
				expect(boxed).toContain("┌");
				expect(boxed).toContain("┐");
				expect(boxed).toContain("└");
				expect(boxed).toContain("┘");
			});

			it("should create box with title", () => {
				const boxed = formatter.box("Content", { title: "Title" });
				
				expect(boxed).toContain("Content");
				expect(boxed).toContain("Title");
			});

			it("should handle different box styles", () => {
				const styles = ["single", "double", "heavy", "rounded"] as const;
				
				for (const style of styles) {
					const boxed = formatter.box("Test", { style });
					expect(typeof boxed).toBe("string");
					expect(boxed.length).toBeGreaterThan(0);
				}
			});

			it("should handle different alignments", () => {
				const alignments = ["left", "center", "right"] as const;
				
				for (const align of alignments) {
					const boxed = formatter.box("Test", { align });
					expect(typeof boxed).toBe("string");
					expect(boxed.length).toBeGreaterThan(0);
				}
			});
		});

		describe("List Formatting", () => {
			it("should create bullet list", () => {
				const items = ["Item 1", "Item 2", "Item 3"];
				const list = formatter.list(items);
				
				expect(list).toContain("Item 1");
				expect(list).toContain("Item 2");
				expect(list).toContain("Item 3");
				expect(list).toContain("•");
			});

			it("should create numbered list", () => {
				const items = ["First", "Second", "Third"];
				const list = formatter.numberedList(items);
				
				expect(list).toContain("First");
				expect(list).toContain("Second");
				expect(list).toContain("Third");
				expect(list).toContain("1.");
				expect(list).toContain("2.");
				expect(list).toContain("3.");
			});

			it("should handle custom bullet", () => {
				const items = ["Item 1"];
				const list = formatter.list(items, { bullet: "-" });
				
				expect(list).toContain("-");
			});

			it("should handle custom start number", () => {
				const items = ["Item"];
				const list = formatter.numberedList(items, { start: 5 });
				
				expect(list).toContain("5.");
			});
		});

		describe("Key-Value Formatting", () => {
			it("should format key-value pairs", () => {
				const pairs = {
					name: "John",
					age: 30,
					city: "New York",
				};

				const formatted = formatter.keyValue(pairs);
				
				expect(formatted).toContain("name");
				expect(formatted).toContain("John");
				expect(formatted).toContain("age");
				expect(formatted).toContain("30");
				expect(formatted).toContain("city");
				expect(formatted).toContain("New York");
			});

			it("should handle custom separator", () => {
				const pairs = { key: "value" };
				const formatted = formatter.keyValue(pairs, { separator: "=" });
				
				expect(formatted).toContain("=");
			});
		});

		describe("Text Wrapping", () => {
			it("should wrap long text", () => {
				const longText = "This is a very long text that should be wrapped to multiple lines.";
				const wrapped = formatter.wrap(longText, 20);
				
				expect(wrapped).toContain("\n");
				expect(wrapped.split("\n").length).toBeGreaterThan(1);
			});

			it("should not wrap short text", () => {
				const shortText = "Short text";
				const wrapped = formatter.wrap(shortText, 50);
				
				expect(wrapped).toBe(shortText);
			});

			it("should handle single words longer than width", () => {
				const longWord = "verylongwordthatcannotbewrapped";
				const wrapped = formatter.wrap(longWord, 10);
				
				expect(wrapped).toBe(longWord);
			});
		});

		describe("Progress Summary", () => {
			it("should create progress summary", () => {
				const summary = formatter.progressSummary(3, 5, [
					{ name: "Task 1", status: "success" },
					{ name: "Task 2", status: "success" },
					{ name: "Task 3", status: "success" },
					{ name: "Task 4", status: "error" },
					{ name: "Task 5", status: "pending" },
				]);
				
				expect(summary).toContain("3/5");
				expect(summary).toContain("60%");
				expect(summary).toContain("Task 1");
				expect(summary).toContain("Task 5");
			});
		});

		describe("Separator", () => {
			it("should create separator", () => {
				const separator = formatter.separator();
				
				expect(typeof separator).toBe("string");
				expect(separator.length).toBeGreaterThan(0);
			});

			it("should create custom separator", () => {
				const separator = formatter.separator("=", 10);
				
				expect(separator).toBe("==========");
			});
		});
	});

	describe("Progress Indicators", () => {
		describe("ProgressBar", () => {
			it("should create progress bar", () => {
				const bar = new ProgressBar({ total: 100 });
				
				expect(bar).toBeDefined();
			});

			it("should tick progress", (done) => {
				const bar = new ProgressBar({
					total: 10,
					callback: () => {
						done();
					},
				});
				
				// Tick to completion
				for (let i = 0; i < 10; i++) {
					bar.tick();
				}
			});

			it("should update progress", (done) => {
				const bar = new ProgressBar({
					total: 100,
					callback: () => {
						done();
					},
				});
				
				bar.update(100);
			});

			it("should emit complete event", (done) => {
				const bar = new ProgressBar({ total: 1 });
				
				bar.on("complete", () => {
					done();
				});
				
				bar.tick();
			});

			it("should emit progress events", (done) => {
				const bar = new ProgressBar({ total: 2 });
				
				bar.on("progress", (data) => {
					expect(data.current).toBeDefined();
					expect(data.total).toBeDefined();
					expect(data.percentage).toBeDefined();
					done();
				});
				
				bar.tick();
			});

			it("should handle completion gracefully", () => {
				const bar = new ProgressBar({ total: 10 });
				
				// Complete the bar
				bar.complete();
				
				// These should not cause issues
				bar.tick();
				bar.update(5);
				bar.complete();
			});

			it("should terminate correctly", () => {
				const bar = new ProgressBar({ total: 10 });
				
				expect(() => {
					bar.terminate();
				}).not.toThrow();
			});
		});

		describe("Spinner", () => {
			it("should create spinner", () => {
				const spinner = new Spinner();
				
				expect(spinner).toBeDefined();
			});

			it("should start and stop spinner", () => {
				const spinner = new Spinner({ text: "Loading..." });
				
				expect(() => {
					spinner.start();
					spinner.stop();
				}).not.toThrow();
			});

			it("should update text", () => {
				const spinner = new Spinner();
				
				expect(() => {
					spinner.updateText("New text");
				}).not.toThrow();
			});

			it("should handle success", () => {
				const spinner = new Spinner();
				
				expect(() => {
					spinner.succeed("Success message");
				}).not.toThrow();
			});

			it("should handle failure", () => {
				const spinner = new Spinner();
				
				expect(() => {
					spinner.fail("Error message");
				}).not.toThrow();
			});

			it("should handle warning", () => {
				const spinner = new Spinner();
				
				expect(() => {
					spinner.warn("Warning message");
				}).not.toThrow();
			});

			it("should handle info", () => {
				const spinner = new Spinner();
				
				expect(() => {
					spinner.info("Info message");
				}).not.toThrow();
			});

			it("should stop and persist with custom symbol", () => {
				const spinner = new Spinner();
				
				expect(() => {
					spinner.stopAndPersist("★", "Custom message");
				}).not.toThrow();
			});

			it("should emit start and stop events", (done) => {
				const spinner = new Spinner();
				let eventCount = 0;
				
				spinner.on("start", () => {
					eventCount++;
					if (eventCount === 2) done();
				});
				
				spinner.on("stop", () => {
					eventCount++;
					if (eventCount === 2) done();
				});
				
				spinner.start();
				setTimeout(() => spinner.stop(), 100);
			});
		});
	});

	describe("Error Handling", () => {
		describe("AutoCompletionEngine Error Handling", () => {
			it("should handle malformed command lines", () => {
				const engine = new AutoCompletionEngine(testDir);
				
				expect(() => {
					engine.parseCommandLine("", 0);
				}).not.toThrow();
				
				expect(() => {
					engine.parseCommandLine("   ", 3);
				}).not.toThrow();
			});

			it("should handle invalid positions", () => {
				const engine = new AutoCompletionEngine(testDir);
				
				expect(() => {
					engine.parseCommandLine("xaheen generate", -1);
				}).not.toThrow();
				
				expect(() => {
					engine.parseCommandLine("xaheen generate", 1000);
				}).not.toThrow();
			});
		});

		describe("RichOutputFormatter Error Handling", () => {
			it("should handle invalid table data", () => {
				const formatter = new RichOutputFormatter();
				
				// Should not throw with invalid data
				expect(() => {
					formatter.table(null as any, []);
				}).not.toThrow();
				
				expect(() => {
					formatter.table([], null as any);
				}).not.toThrow();
			});

			it("should handle diff with null content", () => {
				const formatter = new RichOutputFormatter();
				
				expect(() => {
					formatter.diff(null as any, "new");
				}).not.toThrow();
				
				expect(() => {
					formatter.diff("old", null as any);
				}).not.toThrow();
			});
		});

		describe("Progress Indicators Error Handling", () => {
			it("should handle invalid progress bar configuration", () => {
				expect(() => {
					new ProgressBar({ total: 0 });
				}).not.toThrow();
				
				expect(() => {
					new ProgressBar({ total: -1 });
				}).not.toThrow();
			});

			it("should handle excessive ticking", () => {
				const bar = new ProgressBar({ total: 5 });
				
				expect(() => {
					for (let i = 0; i < 20; i++) {
						bar.tick();
					}
				}).not.toThrow();
			});
		});
	});

	describe("Edge Cases", () => {
		describe("AutoCompletionEngine Edge Cases", () => {
			it("should handle Unicode characters", () => {
				const engine = new AutoCompletionEngine(testDir);
				const items = [
					{ label: "café", value: "cafe", kind: "command" as const },
					{ label: "naïve", value: "naive", kind: "command" as const },
				];
				
				const filtered = engine.fuzzyFilter(items, "café");
				expect(filtered.length).toBeGreaterThan(0);
			});

			it("should handle very long strings", () => {
				const engine = new AutoCompletionEngine(testDir);
				const longString = "a".repeat(1000);
				const items = [{ label: longString, value: longString, kind: "command" as const }];
				
				expect(() => {
					engine.fuzzyFilter(items, "a");
				}).not.toThrow();
			});
		});

		describe("RichOutputFormatter Edge Cases", () => {
			it("should handle very wide content", () => {
				const formatter = new RichOutputFormatter();
				const wideContent = "x".repeat(200);
				
				expect(() => {
					formatter.box(wideContent);
				}).not.toThrow();
			});

			it("should handle multiline content in boxes", () => {
				const formatter = new RichOutputFormatter();
				const multilineContent = "line 1\nline 2\nline 3";
				
				const boxed = formatter.box(multilineContent);
				expect(boxed).toContain("line 1");
				expect(boxed).toContain("line 2");
				expect(boxed).toContain("line 3");
			});

			it("should handle empty content", () => {
				const formatter = new RichOutputFormatter();
				
				expect(() => {
					formatter.box("");
					formatter.list([]);
					formatter.keyValue({});
				}).not.toThrow();
			});
		});
	});
});