/**
 * Version utility for consistent version loading across the CLI
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

let cachedVersion: string | null = null;

/**
 * Get the CLI version from package.json
 * This function handles different installation scenarios (local dev, npm link, global install)
 */
export function getVersion(): string {
	if (cachedVersion) {
		return cachedVersion;
	}

	try {
		// Try multiple possible paths for package.json
		const possiblePaths = [
			// For local development and npm link
			join(dirname(fileURLToPath(import.meta.url)), "../../package.json"),
			// For global installations
			join(dirname(fileURLToPath(import.meta.url)), "../package.json"),
			// Alternative for different build configurations
			join(process.cwd(), "package.json"),
		];

		let packageJson: any = null;
		let packageJsonPath = "";

		for (const path of possiblePaths) {
			try {
				const content = readFileSync(path, "utf-8");
				const parsed = JSON.parse(content);
				
				// Verify this is the correct package.json by checking the name
				if (parsed.name === "@xala-technologies/xaheen-cli") {
					packageJson = parsed;
					packageJsonPath = path;
					break;
				}
			} catch (error) {
				// Continue to next path if this one fails
				continue;
			}
		}

		if (!packageJson) {
			throw new Error("Could not find @xala-technologies/xaheen-cli package.json");
		}

		if (!packageJson.version) {
			throw new Error(`No version found in package.json at ${packageJsonPath}`);
		}

		cachedVersion = packageJson.version;
		return cachedVersion;
	} catch (error) {
		console.warn(`Warning: Could not load version from package.json: ${error.message}`);
		
		// Try environment variable as fallback
		if (process.env.npm_package_version) {
			cachedVersion = process.env.npm_package_version;
			return cachedVersion;
		}

		// Final fallback - but this should be the actual current version
		cachedVersion = "5.0.0";
		return cachedVersion;
	}
}

/**
 * Reset the cached version (useful for testing)
 */
export function resetVersionCache(): void {
	cachedVersion = null;
}