import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".turbo"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"src/**/*.d.ts",
				"src/**/*.test.ts",
				"src/**/*.spec.ts",
				"coverage/",
				"*.config.*",
			],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
		},
		testTimeout: 30000,
		hookTimeout: 30000,
		setupFiles: ["./src/test/setup.ts"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@test": resolve(__dirname, "./src/test"),
		},
	},
});
