#!/usr/bin/env node

import { performance } from "perf_hooks";

const startTime = performance.now();

// Set process title
process.title = "xala-scaffold";

// Handle graceful shutdown
const shutdown = (signal) => {
	console.log(`\n${signal} received. Shutting down gracefully...`);
	process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
	console.error("\n❌ Uncaught Exception:", error.message);
	console.error(error.stack);
	process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
	console.error("\n❌ Unhandled Rejection at:", promise);
	console.error("Reason:", reason);
	process.exit(1);
});

// Check for updates (placeholder for now)
const checkForUpdates = async () => {
	// TODO: Implement update check
	// This will use npm registry to check for newer versions
};

// Main CLI entry point that will load the compiled dist files
import("../dist/cli.js")
	.then(async (module) => {
		// Check for updates in background
		checkForUpdates().catch(() => {
			// Silently ignore update check failures
		});

		// Performance timing
		if (process.env.DEBUG || process.argv.includes("--verbose")) {
			const endTime = performance.now();
			console.log(`⏱️  CLI loaded in ${(endTime - startTime).toFixed(2)}ms`);
		}
	})
	.catch((error) => {
		console.error("❌ Failed to load xala-scaffold CLI:", error.message);
		console.error(
			"\n💡 Please ensure the project is built by running: npm run build",
		);

		if (process.env.DEBUG) {
			console.error("\nStack trace:", error.stack);
		}

		process.exit(1);
	});
