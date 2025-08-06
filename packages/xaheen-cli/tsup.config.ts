import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	minify: process.env.NODE_ENV === "production",
	treeshake: true,
	splitting: false,
	shims: true,
	esbuildOptions(options) {
		options.platform = "node";
		options.target = "node18";
	},
	// External dependencies that should not be bundled
	external: [
		"node:*",
		"ts-morph",
		"prism-react-renderer/themes/github",
		"prism-react-renderer/themes/dracula",
		// Server-side dependencies that shouldn't be in CLI
		"express",
		"cors",
		"@trpc/server",
		"ioredis",
		"body-parser",
		"winston",
		// MCP dependencies
		"@xala-technologies/xala-mcp",
		"@xaheen/design-system",
	],
	noExternal: ["@clack/prompts", "consola", "chalk"],
});
