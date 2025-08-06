import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Simplified Vitest configuration for reliable test execution
 * This configuration focuses on stability and proper coverage reporting
 */
export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: [
			"node_modules",
			"dist",
			".turbo",
			"test-output",
			"test-results",
			"coverage",
			"src/test/config/**/*",
			"src/test/factories/**/*", 
			"src/test/utils/**/*",
			"tests/**/*", // Exclude phase tests
		],
		coverage: {
			enabled: true,
			provider: "v8",
			reporter: ["text", "text-summary", "html", "json", "lcov"],
			reportsDirectory: "./coverage",
			all: true,
			include: [
				"src/**/*.ts",
				"!src/**/*.d.ts",
			],
			exclude: [
				"node_modules/",
				"dist/",
				"test-output/",
				"test-results/",
				"coverage/",
				"src/**/*.d.ts",
				"src/**/*.test.ts",
				"src/**/*.spec.ts",
				"src/test/**/*",
				"*.config.*",
				"**/*.stories.*",
				"**/*.mock.*",
				"tests/**/*",
			],
			thresholds: {
				global: {
					branches: 30,
					functions: 30,
					lines: 30,
					statements: 30,
				},
			},
			skipFull: false,
		},
		setupFiles: ["./src/test/setup.ts"],
		reporters: ["default", "html"],
		outputFile: {
			html: "./test-results/index.html",
			json: "./test-results/results.json",
		},
		// Simplified execution - sequential for stability
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true, // Single fork for maximum isolation
				minForks: 1,
				maxForks: 1,
			},
		},
		fileParallelism: false, // Disable for stability
		isolate: true,
		testTimeout: 30000,
		hookTimeout: 15000,
		retry: 1,
		bail: 10, // Stop after 10 failures
		passWithNoTests: true,
		logHeapUsage: false, // Disable for cleaner output
		silent: false,
		reporter: process.env.CI ? ["json", "junit"] : ["default"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@test": resolve(__dirname, "./src/test"),
		},
	},
	esbuild: {
		target: "node18",
		platform: "node",
	},
});