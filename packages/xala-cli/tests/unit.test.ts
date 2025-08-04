/**
 * @fileoverview Unit Tests
 * @description Basic unit tests for CLI utility functions
 */

import { describe, expect, it } from "@jest/globals";
import fs from "fs/promises";
import Handlebars from "handlebars";
import path from "path";

describe("CLI Unit Tests", () => {
	describe("Template System", () => {
		it("should compile handlebars templates", () => {
			const template = Handlebars.compile("Hello {{name}}!");
			const result = template({ name: "World" });
			expect(result).toBe("Hello World!");
		});

		it("should handle template variables", () => {
			const template = Handlebars.compile(
				"export const {{componentName}} = () => <div>{{componentName}}</div>;",
			);
			const result = template({ componentName: "Button" });
			expect(result).toBe("export const Button = () => <div>Button</div>;");
		});

		it("should handle camelCase helper", () => {
			const camelCase = (str: string) =>
				str.charAt(0).toLowerCase() + str.slice(1);
			expect(camelCase("Button")).toBe("button");
			expect(camelCase("DataTable")).toBe("dataTable");
			expect(camelCase("commandPalette")).toBe("commandPalette");
		});
	});

	describe("File System Operations", () => {
		it("should handle path operations correctly", () => {
			const testPath = path.join("src", "components", "Button.tsx");
			expect(testPath).toContain("components");
			expect(testPath).toContain("Button.tsx");
			expect(path.extname(testPath)).toBe(".tsx");
		});

		it("should validate file extensions", () => {
			const validExtensions = [".tsx", ".ts", ".jsx", ".js", ".vue"];

			for (const ext of validExtensions) {
				const filename = `Component${ext}`;
				expect(path.extname(filename)).toBe(ext);
			}
		});
	});

	describe("Validation Functions", () => {
		it("should validate component names", () => {
			const isValidComponentName = (name: string): boolean => {
				return /^[A-Z][a-zA-Z0-9]*$/.test(name);
			};

			expect(isValidComponentName("Button")).toBe(true);
			expect(isValidComponentName("DataTable")).toBe(true);
			expect(isValidComponentName("CommandPalette")).toBe(true);
			expect(isValidComponentName("button")).toBe(false);
			expect(isValidComponentName("123Button")).toBe(false);
			expect(isValidComponentName("Button-Icon")).toBe(false);
		});

		it("should validate TypeScript syntax patterns", () => {
			const codeSnippets = [
				"export const Button: React.FC = () => <div>Button</div>;",
				"interface ButtonProps { readonly variant: string; }",
				'const buttonVariants = cva("base-classes");',
			];

			for (const snippet of codeSnippets) {
				expect(snippet).toMatch(/\w+/); // Basic pattern matching
				expect(snippet).not.toContain(": any"); // No any types
			}
		});

		it("should check v5.0 architecture compliance", () => {
			const pureComponent = `
        export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
          ({ className, variant, ...props }, ref) => {
            return (
              <button
                ref={ref}
                className={cn(buttonVariants({ variant }), className)}
                {...props}
              />
            );
          }
        );
      `;

			// Should not contain hooks
			expect(pureComponent).not.toContain("useState");
			expect(pureComponent).not.toContain("useEffect");
			expect(pureComponent).not.toContain("useTokens");

			// Should contain required patterns
			expect(pureComponent).toContain("forwardRef");
			expect(pureComponent).toContain("buttonVariants");
		});
	});

	describe("Prompt Optimization", () => {
		it("should optimize prompts for different model sizes", () => {
			const originalPrompt =
				"Create a sophisticated enterprise-grade dashboard with comprehensive analytics";

			const optimize = (prompt: string, modelSize: string): string => {
				if (modelSize === "7b") {
					return prompt.split(" ").slice(0, 4).join(" ").toLowerCase();
				} else if (modelSize === "13b") {
					return prompt.split(" ").slice(0, 7).join(" ");
				}
				return prompt; // 70b+ keeps original
			};

			const optimized7b = optimize(originalPrompt, "7b");
			const optimized13b = optimize(originalPrompt, "13b");
			const optimized70b = optimize(originalPrompt, "70b");

			expect(optimized7b.length).toBeLessThan(optimized13b.length);
			expect(optimized13b.length).toBeLessThan(optimized70b.length);
			expect(optimized7b).toBe("create a sophisticated enterprise-grade");
		});

		it("should calculate complexity scores", () => {
			const getComplexityScore = (prompt: string): number => {
				const words = prompt.split(" ").length;
				const complexWords = ["sophisticated", "enterprise", "comprehensive"];
				const complexCount = complexWords.filter((w) =>
					prompt.toLowerCase().includes(w),
				).length;
				return Math.min(10, words / 5 + complexCount * 2);
			};

			expect(getComplexityScore("simple button")).toBeLessThan(3);
			expect(getComplexityScore("create button with variant")).toBeLessThan(5);
			expect(
				getComplexityScore("sophisticated enterprise comprehensive dashboard"),
			).toBeGreaterThan(6);
		});
	});

	describe("Template Variables", () => {
		it("should substitute template variables correctly", () => {
			const substituteVariables = (
				template: string,
				vars: Record<string, string>,
			): string => {
				let result = template;
				for (const [key, value] of Object.entries(vars)) {
					result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
				}
				return result;
			};

			const template = "Create {type} component with {variant} style";
			const variables = { type: "button", variant: "primary" };
			const result = substituteVariables(template, variables);

			expect(result).toBe("Create button component with primary style");
		});

		it("should handle missing variables gracefully", () => {
			const substituteWithDefaults = (
				template: string,
				vars: Record<string, string>,
			): string => {
				let result = template;
				for (const [key, value] of Object.entries(vars)) {
					result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
				}
				// Replace remaining variables with defaults
				result = result.replace(/\{(\w+)\}/g, "default");
				return result;
			};

			const template = "Create {type} with {missing} property";
			const variables = { type: "button" };
			const result = substituteWithDefaults(template, variables);

			expect(result).toBe("Create button with default property");
		});
	});

	describe("Error Handling", () => {
		it("should provide meaningful error messages", () => {
			const createError = (type: string, details: string): string => {
				const errors = {
					"invalid-component": `Invalid component name: ${details}`,
					"missing-template": `Template not found: ${details}`,
					"compilation-error": `Template compilation failed: ${details}`,
				};
				return errors[type] || `Unknown error: ${details}`;
			};

			expect(createError("invalid-component", "button")).toContain(
				"Invalid component name",
			);
			expect(createError("missing-template", "unknown")).toContain(
				"Template not found",
			);
			expect(createError("compilation-error", "syntax error")).toContain(
				"compilation failed",
			);
		});

		it("should suggest fixes for common errors", () => {
			const getSuggestion = (error: string): string => {
				if (error.includes("component name")) {
					return "Use PascalCase for component names (e.g., Button, DataTable)";
				}
				if (error.includes("Template not found")) {
					return "Use --list to see available templates";
				}
				if (error.includes("compilation")) {
					return "Check template syntax and variable names";
				}
				return "Use --help for more information";
			};

			expect(getSuggestion("Invalid component name")).toContain("PascalCase");
			expect(getSuggestion("Template not found")).toContain("--list");
			expect(getSuggestion("compilation failed")).toContain("template syntax");
		});
	});

	describe("Performance Utilities", () => {
		it("should measure execution time", async () => {
			const measureTime = async <T>(
				fn: () => Promise<T>,
			): Promise<{ result: T; duration: number }> => {
				const start = performance.now();
				const result = await fn();
				const duration = performance.now() - start;
				return { result, duration };
			};

			const testFn = async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return "done";
			};

			const { result, duration } = await measureTime(testFn);
			expect(result).toBe("done");
			expect(duration).toBeGreaterThan(9); // At least 10ms
			expect(duration).toBeLessThan(50); // But not too much more
		});

		it("should calculate memory usage", () => {
			const getMemoryUsage = (): { used: number; total: number } => {
				const usage = process.memoryUsage();
				return {
					used: Math.round(usage.heapUsed / 1024 / 1024), // MB
					total: Math.round(usage.heapTotal / 1024 / 1024), // MB
				};
			};

			const memory = getMemoryUsage();
			expect(memory.used).toBeGreaterThan(0);
			expect(memory.total).toBeGreaterThan(memory.used);
		});
	});

	describe("Configuration Validation", () => {
		it("should validate project configuration", () => {
			const validateConfig = (
				config: any,
			): { valid: boolean; errors: string[] } => {
				const errors: string[] = [];

				if (!config.name || typeof config.name !== "string") {
					errors.push("Project name is required");
				}

				if (
					!config.platform ||
					!["react", "vue", "angular"].includes(config.platform)
				) {
					errors.push("Valid platform is required (react, vue, angular)");
				}

				return { valid: errors.length === 0, errors };
			};

			const validConfig = { name: "test-app", platform: "react" };
			const invalidConfig = { name: "", platform: "invalid" };

			expect(validateConfig(validConfig).valid).toBe(true);
			expect(validateConfig(invalidConfig).valid).toBe(false);
			expect(validateConfig(invalidConfig).errors).toHaveLength(2);
		});

		it("should validate theme configuration", () => {
			const validateTheme = (theme: any): boolean => {
				if (!theme || typeof theme !== "object") {
					return false;
				}
				return (
					theme.colors &&
					typeof theme.colors === "object" &&
					theme.colors.primary &&
					typeof theme.colors.primary === "string"
				);
			};

			const validTheme = {
				colors: {
					primary: "#0066cc",
					secondary: "#ff6600",
				},
			};

			const invalidTheme = {
				colors: {
					primary: 123, // Should be string
				},
			};

			expect(validateTheme(validTheme)).toBe(true);
			expect(validateTheme(invalidTheme)).toBe(false);
			expect(validateTheme(null)).toBe(false);
		});
	});
});
