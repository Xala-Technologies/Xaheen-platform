#!/usr/bin/env tsx
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

interface FileSize {
	name: string;
	size: number;
	gzipSize: number;
}

async function getFileSize(filePath: string): Promise<FileSize | null> {
	try {
		const stats = await fs.stat(filePath);
		const content = await fs.readFile(filePath);
		const gzipSize = gzipSync(content).length;

		return {
			name: path.basename(filePath),
			size: stats.size,
			gzipSize,
		};
	} catch (error) {
		return null;
	}
}

async function analyzeBundle() {
	console.log("📊 Analyzing bundle sizes...\n");

	const distDir = path.join(rootDir, "dist");

	try {
		const files = await fs.readdir(distDir);
		const jsFiles = files.filter((f) => f.endsWith(".js"));

		const sizes: FileSize[] = [];

		for (const file of jsFiles) {
			const filePath = path.join(distDir, file);
			const size = await getFileSize(filePath);
			if (size) sizes.push(size);
		}

		// Sort by size
		sizes.sort((a, b) => b.size - a.size);

		// Display results
		console.log("File                          Size       Gzipped");
		console.log("─".repeat(50));

		let totalSize = 0;
		let totalGzipSize = 0;

		for (const file of sizes) {
			const name = file.name.padEnd(28);
			const size = formatBytes(file.size).padStart(10);
			const gzipSize = formatBytes(file.gzipSize).padStart(10);

			console.log(`${name} ${size} ${gzipSize}`);

			totalSize += file.size;
			totalGzipSize += file.gzipSize;
		}

		console.log("─".repeat(50));
		console.log(
			`${"Total".padEnd(28)} ${formatBytes(totalSize).padStart(10)} ${formatBytes(totalGzipSize).padStart(10)}`,
		);

		// Check against size budget
		const maxSize = 500 * 1024; // 500KB
		const maxGzipSize = 150 * 1024; // 150KB

		console.log("\n📏 Size Budget Check:");
		console.log(
			`  Max size: ${formatBytes(maxSize)} - ${totalSize <= maxSize ? "✅ PASS" : "❌ FAIL"}`,
		);
		console.log(
			`  Max gzip: ${formatBytes(maxGzipSize)} - ${totalGzipSize <= maxGzipSize ? "✅ PASS" : "❌ FAIL"}`,
		);
	} catch (error) {
		console.error("❌ Failed to analyze bundle:", error);
		console.log("\n💡 Make sure to run `npm run build` first");
		process.exit(1);
	}
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

analyzeBundle();
