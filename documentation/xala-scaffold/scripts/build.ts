#!/usr/bin/env tsx
import { promises as fs } from "fs";
import path from "path";
import { build } from "tsup";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function buildProject() {
	const isWatch = process.argv.includes("--watch");

	console.log(`🚀 Building xala-scaffold${isWatch ? " in watch mode" : ""}...`);

	try {
		await build({
			entry: ["src/index.ts", "src/cli.ts"],
			outDir: "dist",
			format: ["esm"],
			dts: true,
			sourcemap: true,
			clean: true,
			minify: !isWatch,
			treeshake: !isWatch,
			watch: isWatch,
			esbuildOptions(options) {
				options.platform = "node";
				options.target = "node18";
			},
			onSuccess: async () => {
				console.log("✅ Build completed successfully!");

				// Copy templates to dist
				const templatesSource = path.join(rootDir, "templates");
				const templatesDest = path.join(rootDir, "dist", "templates");

				try {
					await fs.cp(templatesSource, templatesDest, { recursive: true });
					console.log("📁 Templates copied to dist");
				} catch (error) {
					// Templates directory might not exist yet
					console.log(
						"⚠️  Templates directory not found (will be created later)",
					);
				}
			},
		});
	} catch (error) {
		console.error("❌ Build failed:", error);
		process.exit(1);
	}
}

buildProject();
