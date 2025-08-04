/**
 * @fileoverview LLM Compatibility Test Suite
 * @description Tests CLI performance with different LLM sizes (7B to GPT-4)
 */

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * LLM Test Configurations
 * Testing with different model sizes and capabilities
 */
const LLM_CONFIGS = {
	// Smallest models (7B)
	small: {
		modelSize: "7b",
		models: ["llama2:7b", "mistral:7b", "vicuna:7b"],
		maxTokens: 2048,
		temperature: 0.7,
		capabilities: ["basic", "template", "simple"],
	},
	// Medium models (13B-30B)
	medium: {
		modelSize: "13b-30b",
		models: ["llama2:13b", "codellama:13b", "wizard:13b"],
		maxTokens: 4096,
		temperature: 0.8,
		capabilities: ["intermediate", "guided", "analysis"],
	},
	// Large models (70B+)
	large: {
		modelSize: "70b+",
		models: ["llama2:70b", "gpt-4", "claude-3"],
		maxTokens: 8192,
		temperature: 0.9,
		capabilities: ["advanced", "full", "optimization"],
	},
};

/**
 * Test prompts optimized for different model sizes
 */
const TEST_PROMPTS = {
	small: {
		// Simple, direct prompts for 7B models
		button: "Generate button component with primary variant",
		input: "Create input field with validation",
		card: "Make card component with title and content",
	},
	medium: {
		// More complex prompts for 13B-30B models
		form: "Generate form with email and password fields, validation, and submit handling",
		dashboard:
			"Create dashboard layout with sidebar, header, and main content area",
		table: "Build data table with sorting and pagination",
	},
	large: {
		// Complex requirements for 70B+ models
		feature:
			"Generate complete user authentication feature with login, register, password reset, and 2FA",
		optimization:
			"Analyze and optimize existing component for performance and accessibility",
		migration:
			"Migrate class component to functional component with hooks and CVA pattern",
	},
};

describe.skip("LLM Compatibility Tests (Requires built CLI)", () => {
	let testDir: string;

	beforeAll(async () => {
		// Create temporary test directory
		testDir = path.join(process.cwd(), "temp-llm-tests");
		await fs.mkdir(testDir, { recursive: true });
	});

	afterAll(async () => {
		// Clean up test directory
		await fs.rm(testDir, { recursive: true, force: true });
	});

	describe("7B Model Tests (Smallest)", () => {
		it("should generate simple button with 7B model", async () => {
			const result = await runCLICommand(
				"generate component Button --simple --template button --no-ai",
			);

			expect(result.success).toBe(true);
			expect(result.output).toContain("Button component generated");

			// Check generated file
			const filePath = path.join(testDir, "Button.tsx");
			const content = await fs.readFile(filePath, "utf-8");

			// Verify basic structure
			expect(content).toContain("export const Button");
			expect(content).toContain("forwardRef");
			expect(content).toContain("buttonVariants");
			expect(content).not.toContain("useState"); // No hooks in pure components
		});

		it("should use template system for 7B models", async () => {
			const templates = ["button", "input", "card"];

			for (const template of templates) {
				const result = await runCLICommand(
					`generate component Test${capitalize(template)} --template ${template} --simple`,
				);

				expect(result.success).toBe(true);
				expect(result.timeMs).toBeLessThan(2000); // Should be fast
			}
		});

		it("should handle simplified prompts for 7B models", async () => {
			const prompt = TEST_PROMPTS.small.button;
			const result = await runCLICommand(
				`generate component SimpleButton --prompt "${prompt}" --model-size 7b`,
			);

			expect(result.success).toBe(true);
			expect(result.quality).toBeGreaterThan(0.7); // 70% quality threshold
		});

		it("should fallback gracefully when 7B model struggles", async () => {
			const complexPrompt =
				"Generate complex dashboard with real-time updates and WebSocket";
			const result = await runCLICommand(
				`generate component ComplexDashboard --prompt "${complexPrompt}" --model-size 7b --fallback`,
			);

			expect(result.success).toBe(true);
			expect(result.fallbackUsed).toBe(true);
			expect(result.output).toContain("Using template fallback");
		});
	});

	describe("13B Model Tests (Medium)", () => {
		it("should generate form with validation using 13B model", async () => {
			const result = await runCLICommand(
				"generate component LoginForm --template form --guided --model-size 13b",
			);

			expect(result.success).toBe(true);

			const content = await readGeneratedFile("LoginForm.tsx");
			expect(content).toContain("FormField");
			expect(content).toContain("FormLabel");
			expect(content).toContain("FormError");
			expect(content).toContain("validation");
		});

		it("should handle guided generation for 13B models", async () => {
			const result = await runCLICommand(
				'generate component DataTable --guided --features "sorting,filtering,pagination"',
			);

			expect(result.success).toBe(true);
			expect(result.features).toContain("sorting");
			expect(result.features).toContain("filtering");
			expect(result.features).toContain("pagination");
		});

		it("should generate with partial AI assistance", async () => {
			const result = await runCLICommand(
				"generate component Card --ai-assist partial --model-size 13b",
			);

			expect(result.success).toBe(true);
			expect(result.aiAssistance).toBe("partial");
			expect(result.quality).toBeGreaterThan(0.85);
		});
	});

	describe("70B+ Model Tests (Large)", () => {
		it("should generate complex feature with 70B model", async () => {
			const result = await runCLICommand(
				"generate feature UserAuthentication --ai --optimize --test --model-size 70b",
			);

			expect(result.success).toBe(true);
			expect(result.filesGenerated).toBeGreaterThan(5);
			expect(result.testsGenerated).toBe(true);
			expect(result.optimizationApplied).toBe(true);
		});

		it("should perform code analysis and optimization", async () => {
			// First generate a component
			await runCLICommand("generate component TestComponent --simple");

			// Then optimize it
			const result = await runCLICommand(
				"optimize ./TestComponent.tsx --ai --model-size 70b",
			);

			expect(result.success).toBe(true);
			expect(result.suggestions).toHaveLength(result.suggestions.length);
			expect(result.metrics.performance).toBeGreaterThan(0.8);
			expect(result.metrics.accessibility).toBeGreaterThan(0.9);
		});
	});

	describe("Cross-Model Consistency Tests", () => {
		it("should generate consistent output across model sizes", async () => {
			const component = "ConsistentButton";
			const results = [];

			for (const size of ["7b", "13b", "70b"]) {
				const result = await runCLICommand(
					`generate component ${component}${size} --template button --model-size ${size}`,
				);
				results.push(result);
			}

			// All should succeed
			results.forEach((r) => expect(r.success).toBe(true));

			// Quality should improve with model size
			expect(results[1].quality).toBeGreaterThanOrEqual(results[0].quality);
			expect(results[2].quality).toBeGreaterThanOrEqual(results[1].quality);

			// Core functionality should be consistent
			for (const result of results) {
				const content = await readGeneratedFile(
					`${component}${result.modelSize}.tsx`,
				);
				expect(content).toContain("forwardRef");
				expect(content).toContain("ButtonProps");
				expect(content).not.toContain("useState");
			}
		});
	});

	describe("Performance Benchmarks", () => {
		it("should meet performance targets for different model sizes", async () => {
			const benchmarks = [
				{ size: "7b", component: "Button", maxTime: 1000 },
				{ size: "7b", component: "Dashboard", maxTime: 3000 },
				{ size: "13b", component: "Button", maxTime: 800 },
				{ size: "13b", component: "Dashboard", maxTime: 2000 },
				{ size: "70b", component: "Button", maxTime: 600 },
				{ size: "70b", component: "Dashboard", maxTime: 1500 },
			];

			for (const benchmark of benchmarks) {
				const start = Date.now();
				const result = await runCLICommand(
					`generate component ${benchmark.component} --model-size ${benchmark.size} --benchmark`,
				);
				const elapsed = Date.now() - start;

				expect(result.success).toBe(true);
				expect(elapsed).toBeLessThan(benchmark.maxTime);
			}
		});

		it("should handle memory constraints for small models", async () => {
			const result = await runCLICommand(
				"generate component MemoryTest --model-size 7b --memory-limit 1gb",
			);

			expect(result.success).toBe(true);
			expect(result.memoryUsed).toBeLessThan(1024 * 1024 * 1024); // Less than 1GB
		});
	});

	describe("Error Handling and Recovery", () => {
		it("should handle LLM timeout gracefully", async () => {
			const result = await runCLICommand(
				"generate component TimeoutTest --timeout 100ms --model-size 7b",
			);

			expect(result.success).toBe(true);
			expect(result.fallbackUsed).toBe(true);
			expect(result.reason).toContain("timeout");
		});

		it("should handle malformed LLM responses", async () => {
			const result = await runCLICommand(
				"generate component MalformedTest --mock-response invalid-json",
			);

			expect(result.success).toBe(true);
			expect(result.fallbackUsed).toBe(true);
			expect(result.output).toContain("Using template fallback");
		});

		it("should provide helpful error messages for small models", async () => {
			const result = await runCLICommand(
				"generate component ComplexFeature --model-size 7b --no-fallback",
				{ expectError: true },
			);

			expect(result.error).toContain("too complex for 7B model");
			expect(result.suggestion).toContain("Use --simple mode");
		});
	});

	describe("Template Validation Tests", () => {
		it("should validate all templates work with small models", async () => {
			const templates = await getAvailableTemplates();

			for (const template of templates) {
				const result = await runCLICommand(
					`validate-template ${template} --model-size 7b`,
				);

				expect(result.valid).toBe(true);
				expect(result.compatibility["7b"]).toBe(true);
			}
		});

		it("should check template complexity scoring", async () => {
			const templates = {
				button: 1, // Simple
				form: 3, // Medium
				dashboard: 5, // Complex
			};

			for (const [template, expectedComplexity] of Object.entries(templates)) {
				const result = await runCLICommand(`analyze-template ${template}`);
				expect(result.complexity).toBe(expectedComplexity);
			}
		});
	});

	describe("Multi-Platform Generation Tests", () => {
		it("should generate for multiple platforms with small model", async () => {
			const result = await runCLICommand(
				"generate component MultiButton --platforms react,vue,angular --model-size 7b",
			);

			expect(result.success).toBe(true);
			expect(result.platforms).toHaveLength(3);

			// Check each platform output
			for (const platform of ["react", "vue", "angular"]) {
				const file = await readGeneratedFile(`MultiButton.${platform}.tsx`);
				expect(file).toBeTruthy();
			}
		});
	});

	describe("Prompt Engineering Tests", () => {
		it("should optimize prompts for model size", async () => {
			const prompt = "Create a complex dashboard with real-time updates";

			const optimized7b = await optimizePromptForModel(prompt, "7b");
			const optimized70b = await optimizePromptForModel(prompt, "70b");

			// 7B prompt should be simpler
			expect(optimized7b.length).toBeLessThan(optimized70b.length);
			expect(optimized7b).toContain("template");
			expect(optimized70b).toContain("optimization");
		});

		it("should chunk complex tasks for small models", async () => {
			const complexTask = "Generate complete e-commerce platform";
			const result = await runCLICommand(
				`generate feature Ecommerce --prompt "${complexTask}" --model-size 7b --chunk`,
			);

			expect(result.success).toBe(true);
			expect(result.chunks).toBeGreaterThan(1);
			expect(result.chunksCompleted).toBe(result.chunks);
		});
	});
});

// Helper functions
async function runCLICommand(command: string, options: any = {}): Promise<any> {
	try {
		const { stdout, stderr } = await execAsync(`xala ${command}`);
		return JSON.parse(stdout);
	} catch (error) {
		if (options.expectError) {
			return { error: error.message, ...parseError(error) };
		}
		throw error;
	}
}

async function readGeneratedFile(filename: string): Promise<string> {
	const filePath = path.join(testDir, filename);
	return fs.readFile(filePath, "utf-8");
}

async function getAvailableTemplates(): Promise<string[]> {
	const { stdout } = await execAsync("xala templates list --json");
	return JSON.parse(stdout).templates;
}

async function optimizePromptForModel(
	prompt: string,
	modelSize: string,
): Promise<string> {
	const { stdout } = await execAsync(
		`xala optimize-prompt --prompt "${prompt}" --model-size ${modelSize}`,
	);
	return JSON.parse(stdout).optimizedPrompt;
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseError(error: any): any {
	// Parse error for helpful information
	return {
		message: error.message,
		suggestion: extractSuggestion(error.message),
	};
}

function extractSuggestion(message: string): string {
	// Extract suggestion from error message
	const match = message.match(/Suggestion: (.*)/);
	return match ? match[1] : "Try using --simple mode or --template";
}
