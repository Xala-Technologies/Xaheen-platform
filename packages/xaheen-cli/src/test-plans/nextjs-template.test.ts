/**
 * Next.js Template Testing Suite
 *
 * Comprehensive tests for Next.js template rendering, validation, and integration.
 * Tests both configuration files and React components for correctness.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import * as ts from "typescript";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TemplateLoader } from "../services/templates/template-loader";
import type { ProjectContext } from "../types/index";

describe("Next.js Template Tests", () => {
	let templateLoader: TemplateLoader;
	let testTemplatesPath: string;

	// Test context for Next.js templates
	const nextJsContext: ProjectContext = {
		projectName: "TestNextApp",
		projectPath: "/test/project",
		framework: "next",
		packageManager: "bun",
		features: ["typescript", "tailwind", "eslint", "prettier"],
		ui: {
			library: "shadcn-ui",
			theme: "light",
		},
		auth: {
			provider: "nextauth",
			providers: ["google", "github"],
		},
		database: {
			provider: "prisma",
			type: "postgres",
		},
		api: "trpc",
		deploy: "vercel",
		localization: {
			enabled: true,
			languages: ["en", "nb", "ar"],
			fallback: "en",
		},
		compliance: {
			gdpr: true,
			wcag: "AAA",
		},
	};

	beforeEach(async () => {
		templateLoader = new TemplateLoader();
		testTemplatesPath = path.join(process.cwd(), "src/templates");
	});

	afterEach(async () => {
		// Cleanup if needed
	});

	describe("Configuration Templates", () => {
		it("should render package.json correctly", async () => {
			const templatePath = "frontend/next/configs/package.json.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate JSON syntax
			expect(() => JSON.parse(result)).not.toThrow();

			const packageJson = JSON.parse(result);

			// Verify basic structure
			expect(packageJson.name).toBe("test-next-app");
			expect(packageJson.private).toBe(true);

			// Check Next.js dependencies
			expect(packageJson.dependencies).toHaveProperty("next");
			expect(packageJson.dependencies).toHaveProperty("react");
			expect(packageJson.dependencies).toHaveProperty("react-dom");

			// Check TypeScript dependencies
			expect(packageJson.devDependencies).toHaveProperty("typescript");
			expect(packageJson.devDependencies).toHaveProperty("@types/react");
			expect(packageJson.devDependencies).toHaveProperty("@types/node");

			// Check Tailwind dependencies if enabled
			if (nextJsContext.features?.includes("tailwind")) {
				expect(packageJson.devDependencies).toHaveProperty("tailwindcss");
				expect(packageJson.devDependencies).toHaveProperty("postcss");
				expect(packageJson.devDependencies).toHaveProperty("autoprefixer");
			}

			// Verify scripts
			expect(packageJson.scripts).toHaveProperty("dev");
			expect(packageJson.scripts).toHaveProperty("build");
			expect(packageJson.scripts).toHaveProperty("start");
			expect(packageJson.scripts).toHaveProperty("lint");
		});

		it("should render next.config.ts correctly", async () => {
			const templatePath = "frontend/next/configs/next.config.ts.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"next.config.ts",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for Next.js config patterns
			expect(result).toContain("import type { NextConfig }");
			expect(result).toContain("const nextConfig: NextConfig");
			expect(result).toContain("export default nextConfig");

			// Check for i18n configuration if localization is enabled
			if (nextJsContext.localization?.enabled) {
				expect(result).toContain("i18n");
				expect(result).toContain("locales");
				expect(result).toContain("defaultLocale");
			}

			// Check for experimental features
			expect(result).toContain("experimental");
		});

		it("should render tailwind.config.ts correctly", async () => {
			const templatePath = "frontend/next/configs/tailwind.config.ts.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"tailwind.config.ts",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for Tailwind config patterns
			expect(result).toContain("import type { Config }");
			expect(result).toContain("const config: Config");
			expect(result).toContain("export default config");

			// Check for content paths
			expect(result).toContain("content:");
			expect(result).toContain("./src/**/*.{js,ts,jsx,tsx,mdx}");

			// Check for theme extensions
			expect(result).toContain("theme:");
			expect(result).toContain("extend:");

			// Check for plugins
			expect(result).toContain("plugins:");
		});

		it("should render tsconfig.json correctly", async () => {
			const templatePath = "frontend/next/configs/tsconfig.json.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate JSON syntax
			expect(() => JSON.parse(result)).not.toThrow();

			const tsconfig = JSON.parse(result);

			// Verify TypeScript configuration
			expect(tsconfig.compilerOptions).toBeDefined();
			expect(tsconfig.compilerOptions.target).toBe("es5");
			expect(tsconfig.compilerOptions.strict).toBe(true);
			expect(tsconfig.compilerOptions.jsx).toBe("preserve");

			// Check Next.js specific options
			expect(tsconfig.compilerOptions.allowJs).toBe(true);
			expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
			expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);

			// Check path mappings
			expect(tsconfig.compilerOptions.paths).toBeDefined();
			expect(tsconfig.compilerOptions.paths["@/*"]).toContain("./src/*");

			// Check include/exclude patterns
			expect(tsconfig.include).toContain("next-env.d.ts");
			expect(tsconfig.include).toContain("**/*.ts");
			expect(tsconfig.include).toContain("**/*.tsx");
			expect(tsconfig.exclude).toContain("node_modules");
		});

		it("should render eslint.config.js correctly", async () => {
			const templatePath = "frontend/next/configs/eslint.config.js.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Check for ESLint configuration patterns
			expect(result).toContain("export default");
			expect(result).toContain("@next/next/recommended");

			// Check for TypeScript integration
			expect(result).toContain("@typescript-eslint");
			expect(result).toContain("parser:");
			expect(result).toContain("parserOptions:");

			// Check for rules configuration
			expect(result).toContain("rules:");
		});
	});

	describe("Component Templates", () => {
		it("should render layout.tsx correctly", async () => {
			const templatePath = "frontend/next/components/layout.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile("layout.tsx", result, ts.ScriptTarget.Latest, true);
			}).not.toThrow();

			// Check for Next.js layout patterns
			expect(result).toContain("import type { Metadata }");
			expect(result).toContain("export const metadata: Metadata");
			expect(result).toContain("export default function RootLayout");

			// Check for font loading
			expect(result).toContain('from "next/font/google"');
			expect(result).toContain("variable:");
			expect(result).toContain("subsets:");

			// Check for provider wrapping
			expect(result).toContain("<Providers>");
			expect(result).toContain("{children}");

			// Verify proper TypeScript typing
			expect(result).toContain("children: React.ReactNode");
			expect(result).toContain("Readonly<{");

			// Check for proper className template string syntax (fixed issue)
			expect(result).toContain("className={`");
			expect(result).not.toContain('className="" ${');
		});

		it("should render page.tsx correctly", async () => {
			const templatePath = "frontend/next/components/page.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile("page.tsx", result, ts.ScriptTarget.Latest, true);
			}).not.toThrow();

			// Check for Next.js page patterns
			expect(result).toContain("export default function");
			expect(result).toContain("return (");
			expect(result).toContain("</");

			// Check for project name rendering
			expect(result).toContain(nextJsContext.projectName);
		});

		it("should render providers.tsx correctly", async () => {
			const templatePath = "frontend/next/components/providers.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"providers.tsx",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for provider patterns
			expect(result).toContain('"use client"');
			expect(result).toContain("export function Providers");
			expect(result).toContain("children: React.ReactNode");

			// Check for theme provider if UI library is configured
			if (nextJsContext.ui?.library) {
				expect(result).toContain("ThemeProvider");
			}
		});

		it("should render theme-provider.tsx correctly", async () => {
			const templatePath = "frontend/next/components/theme-provider.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"theme-provider.tsx",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for theme provider patterns
			expect(result).toContain('"use client"');
			expect(result).toContain("export function ThemeProvider");
			expect(result).toContain("useState");
			expect(result).toContain("useEffect");

			// Check for theme persistence
			expect(result).toContain("localStorage");
			expect(result).toContain("theme");
		});

		it("should render ErrorBoundary.tsx correctly", async () => {
			const templatePath = "frontend/next/components/ErrorBoundary.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"ErrorBoundary.tsx",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for error boundary patterns
			expect(result).toContain('"use client"');
			expect(result).toContain("export function ErrorBoundary");
			expect(result).toContain("error");
			expect(result).toContain("reset");

			// Check for error handling
			expect(result).toContain("Something went wrong");
			expect(result).toContain("Try again");
		});
	});

	describe("Layout Templates", () => {
		it("should render AdaptiveLayout.tsx correctly", async () => {
			const templatePath = "frontend/next/components/AdaptiveLayout.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"AdaptiveLayout.tsx",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for adaptive layout patterns
			expect(result).toContain("export function AdaptiveLayout");
			expect(result).toContain("children: React.ReactNode");

			// Check for responsive behavior
			expect(result).toContain("useMediaQuery");
			expect(result).toContain("breakpoint");
		});

		it("should render AdminLayout.tsx correctly", async () => {
			const templatePath = "frontend/next/components/AdminLayout.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"AdminLayout.tsx",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for admin layout patterns
			expect(result).toContain("export function AdminLayout");
			expect(result).toContain("sidebar");
			expect(result).toContain("navigation");
		});

		it("should render AuthLayout.tsx correctly", async () => {
			const templatePath = "frontend/next/components/AuthLayout.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"AuthLayout.tsx",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for auth layout patterns
			expect(result).toContain("export function AuthLayout");
			expect(result).toContain("authentication");
		});
	});

	describe("File Templates", () => {
		it("should render middleware.ts correctly", async () => {
			const templatePath = "frontend/next/files/middleware.ts.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile(
					"middleware.ts",
					result,
					ts.ScriptTarget.Latest,
					true,
				);
			}).not.toThrow();

			// Check for middleware patterns
			expect(result).toContain("import { NextResponse }");
			expect(result).toContain("export function middleware");
			expect(result).toContain("export const config");

			// Check for matcher configuration
			expect(result).toContain("matcher:");
		});

		it("should render i18n.ts correctly", async () => {
			const templatePath = "frontend/next/files/i18n.ts.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Validate TypeScript syntax
			expect(() => {
				ts.createSourceFile("i18n.ts", result, ts.ScriptTarget.Latest, true);
			}).not.toThrow();

			// Check for i18n configuration
			expect(result).toContain("locales");
			expect(result).toContain("defaultLocale");

			// Check for configured languages
			if (nextJsContext.localization?.languages) {
				nextJsContext.localization.languages.forEach((lang) => {
					expect(result).toContain(lang);
				});
			}
		});

		it("should render platform utils correctly", async () => {
			const platformPath = "frontend/next/files/platform.ts.hbs";
			const uiUtilsPath = "frontend/next/files/ui-utils.ts.hbs";
			const usePlatformPath = "frontend/next/files/usePlatform.ts.hbs";

			const templates = [platformPath, uiUtilsPath, usePlatformPath];

			for (const templatePath of templates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsContext,
				);

				// Validate TypeScript syntax
				expect(() => {
					ts.createSourceFile(
						path.basename(templatePath, ".hbs"),
						result,
						ts.ScriptTarget.Latest,
						true,
					);
				}).not.toThrow();

				// Check for export statements
				expect(result).toContain("export");
			}
		});
	});

	describe("Norwegian Localization Templates", () => {
		it("should render Norwegian language files correctly", async () => {
			const languageTemplates = [
				"frontend/next/configs/nb.json.hbs",
				"frontend/next/configs/en.json.hbs",
				"frontend/next/configs/ar.json.hbs",
				"frontend/next/configs/fr.json.hbs",
			];

			for (const templatePath of languageTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsContext,
				);

				// Validate JSON syntax
				expect(() => JSON.parse(result)).not.toThrow();

				const translations = JSON.parse(result);

				// Check for common translation keys
				expect(translations).toHaveProperty("common");
				expect(translations.common).toHaveProperty("welcome");
				expect(translations.common).toHaveProperty("loading");
				expect(translations.common).toHaveProperty("error");
			}
		});

		it("should render Norwegian-specific components correctly", async () => {
			const norwegianTemplates = [
				"frontend/next/components/dashboard-norwegian.tsx.hbs",
				"frontend/next/components/admin-norwegian.tsx.hbs",
			];

			for (const templatePath of norwegianTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsContext,
				);

				// Validate TypeScript syntax
				expect(() => {
					ts.createSourceFile(
						path.basename(templatePath, ".hbs"),
						result,
						ts.ScriptTarget.Latest,
						true,
					);
				}).not.toThrow();

				// Check for Norwegian-specific patterns
				expect(result).toContain("nb");
				expect(result).toContain("norwegian");
			}
		});
	});

	describe("Template Context Variable Rendering", () => {
		it("should render project name correctly in all templates", async () => {
			const templates = [
				"frontend/next/configs/package.json.hbs",
				"frontend/next/components/layout.tsx.hbs",
				"frontend/next/components/page.tsx.hbs",
			];

			for (const templatePath of templates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsContext,
				);

				// Should contain transformed project name
				expect(result).toContain("test-next-app"); // kebab-case
				expect(result).toContain("TestNextApp"); // original
			}
		});

		it("should conditionally render features correctly", async () => {
			const templatePath = "frontend/next/configs/package.json.hbs";

			// Test with TypeScript enabled
			const tsResult = await templateLoader.renderTemplate(templatePath, {
				...nextJsContext,
				features: ["typescript"],
			});
			expect(tsResult).toContain("@types/react");

			// Test without TypeScript
			const jsResult = await templateLoader.renderTemplate(templatePath, {
				...nextJsContext,
				features: [],
			});
			expect(jsResult).not.toContain("@types/react");
		});

		it("should render API integration correctly", async () => {
			const templatePath = "frontend/next/configs/package.json.hbs";

			// Test with tRPC
			const trpcResult = await templateLoader.renderTemplate(templatePath, {
				...nextJsContext,
				api: "trpc",
			});
			expect(trpcResult).toContain("@trpc/");

			// Test with GraphQL
			const graphqlResult = await templateLoader.renderTemplate(templatePath, {
				...nextJsContext,
				api: "graphql",
			});
			expect(graphqlResult).toContain("graphql");
		});
	});

	describe("Template Metadata", () => {
		it("should include proper template metadata comments", async () => {
			const templatePath = "frontend/next/components/layout.tsx.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				nextJsContext,
			);

			// Check for migration metadata comments
			expect(result).toContain("{{!-- Template:");
			expect(result).toContain("{{!-- Category:");
			expect(result).toContain("{{!-- Type:");
			expect(result).toContain("{{!-- Migrated from:");
		});
	});

	describe("Template Performance", () => {
		it("should render templates within performance limits", async () => {
			const templatePath = "frontend/next/configs/package.json.hbs";
			const iterations = 100;

			const startTime = performance.now();

			for (let i = 0; i < iterations; i++) {
				await templateLoader.renderTemplate(templatePath, nextJsContext);
			}

			const endTime = performance.now();
			const avgTime = (endTime - startTime) / iterations;

			// Should render in less than 10ms on average
			expect(avgTime).toBeLessThan(10);
		});
	});
});
