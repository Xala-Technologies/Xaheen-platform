import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: false,
	clean: true,
	minify: false,
	splitting: false,
	target: "es2022",
	outDir: "dist",
});