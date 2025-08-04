import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".turbo", "test-output"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
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
			],
			thresholds: {
				global: {
					branches: 75,
					functions: 75,
					lines: 75,
					statements: 75,
				},
			},
		},
		testTimeout: 60000,
		hookTimeout: 30000,
		setupFiles: ["./src/test/setup.ts"],
		reporters: ["verbose", "json"],
		outputFile: {
			json: "./test-output/test-results.json",
		},
		// Separate test configurations for different test types
		pool: "threads",
		poolOptions: {
			threads: {
				singleThread: false,
			},
		},
		// Enable concurrent execution for faster tests
		concurrent: true,
		maxConcurrency: 4,
		// Retry flaky tests
		retry: 1,
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@test": resolve(__dirname, "./src/test"),
		},
	},
});
