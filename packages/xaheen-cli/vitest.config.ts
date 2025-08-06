import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

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
			"src/test/config/**/*", // Exclude test configuration files themselves
			"src/test/factories/**/*", // Exclude test factories from being run as tests
			"src/test/utils/**/*", // Exclude test utilities from being run as tests
			"tests/**/*", // Exclude phase tests
		],
		coverage: {
			enabled: true,
			provider: "v8",
			reporter: ["text", "text-summary", "json", "html", "lcov", "clover"],
			reportsDirectory: "./coverage",
			all: true, // Include all files, even untested ones
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
				"tests/**/*", // Exclude phase tests
			],
			thresholds: {
				// Relaxed thresholds for current state
				global: {
					branches: 50,
					functions: 50,
					lines: 50,
					statements: 50,
				},
			},
			skipFull: false, // Show all files in coverage report
		},
		setupFiles: ["./src/test/setup.ts"],
		reporters: process.env.CI ? 
			["basic", "junit", "json"] :
			["default", "html"],
		outputFile: {
			json: "./test-results/results.json",
			junit: "./test-results/junit.xml",
			html: "./test-results/index.html",
		},
		// Test execution configuration
		pool: "forks", // Use fork pool for better isolation
		poolOptions: {
			forks: {
				singleFork: false,
				minForks: 1,
				maxForks: process.env.CI ? 2 : 4,
			},
		},
		fileParallelism: !process.env.CI, // Disable in CI for stability
		isolate: true, // Enable test isolation for reliability
		testTimeout: process.env.CI ? 30000 : 60000,
		hookTimeout: process.env.CI ? 15000 : 30000,
		retry: process.env.CI ? 3 : 1,
		bail: process.env.CI ? 5 : undefined,
		// Enable watch mode optimizations
		watchExclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/coverage/**",
			"**/test-results/**",
			"**/.git/**",
			"**/tests/**", // Exclude phase tests from watch
		],
		// Enhanced error handling
		passWithNoTests: true,
		logHeapUsage: true,
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
			"consola",
			"@clack/prompts",
		],
	},
	// Build configuration
	esbuild: {
		target: "node18",
		platform: "node",
	},
});