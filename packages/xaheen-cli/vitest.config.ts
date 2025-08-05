import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { defaultOrchestrator } from "./src/test/config/parallel-test-config";

// Generate optimal Vitest configuration using our parallel test orchestrator
const parallelConfig = defaultOrchestrator.generateVitestConfig();

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
			"src/test/config/**/*", // Exclude test configuration files themselves
			"src/test/factories/**/*", // Exclude test factories from being run as tests
			"src/test/utils/**/*", // Exclude test utilities from being run as tests
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			reportsDirectory: "./coverage",
			exclude: [
				"node_modules/",
				"dist/",
				"test-output/",
				"src/**/*.d.ts",
				"src/**/*.test.ts",
				"src/**/*.spec.ts",
				"src/test/**/*",
				"coverage/",
				"*.config.*",
				"**/*.stories.*",
				"**/*.mock.*",
			],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
				// Per-file thresholds for critical components
				"src/services/mcp/mcp-client.service.ts": {
					branches: 90,
					functions: 90,
					lines: 90,
					statements: 90,
				},
				"src/generators/**/*.ts": {
					branches: 85,
					functions: 85,
					lines: 85,
					statements: 85,
				},
			},
		},
		setupFiles: ["./src/test/setup.ts"],
		reporters: ["default", "junit", "json", "html"],
		outputFile: {
			json: "./test-results/results.json",
			junit: "./test-results/junit.xml",
			html: "./test-results/index.html",
		},
		// Use parallel configuration from orchestrator
		...parallelConfig.test,
		// Override specific settings for our environment
		testTimeout: 120000, // 2 minutes for complex integration tests
		hookTimeout: 60000, // 1 minute for setup/teardown
		// Retry flaky tests with exponential backoff
		retry: 2,
		// Enable watch mode optimizations
		watchExclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/coverage/**",
			"**/test-results/**",
			"**/.git/**",
		],
		// Enable experimental features for better performance
		experimentalOptimizer: {
			enabled: true,
		},
		// Shard configuration for CI/CD
		shard: process.env.CI ? {
			current: parseInt(process.env.VITEST_SHARD_INDEX || "1"),
			count: parseInt(process.env.VITEST_SHARD_COUNT || "1"),
		} : undefined,
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@test": resolve(__dirname, "./src/test"),
			"@factories": resolve(__dirname, "./src/test/factories"),
			"@utils": resolve(__dirname, "./src/test/utils"),
		},
	},
	// Enable optimized dependencies for faster startup
	optimizeDeps: {
		include: [
			"vitest",
			"@vitest/runner",
			"@vitest/utils",
		],
	},
});
