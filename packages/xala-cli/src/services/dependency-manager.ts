/**
 * @fileoverview Cross-CLI Dependency Management
 * @description Manages dependencies and compatibility between Xala UI CLI and external tools
 */

import chalk from "chalk";
import { exec } from "child_process";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import semver from "semver";
import { promisify } from "util";
import { logger } from "../utils/logger.js";

const execAsync = promisify(exec);

export interface DependencyInfo {
	name: string;
	version: string;
	required: boolean;
	compatible: boolean;
	minimumVersion: string;
	installedVersion?: string;
	installCommand: string;
	checkCommand: string;
}

export interface CompatibilityMatrix {
	xaheen: {
		[version: string]: {
			xalaUI: string[];
			node: string;
			npm: string;
			platforms: string[];
		};
	};
	platforms: {
		[platform: string]: {
			xalaUI: string[];
			dependencies: string[];
		};
	};
}

export class DependencyManager {
	private projectPath: string;
	private compatibilityMatrix: CompatibilityMatrix;

	constructor(projectPath: string = process.cwd()) {
		this.projectPath = projectPath;
		this.compatibilityMatrix = this.initializeCompatibilityMatrix();
	}

	/**
	 * Initialize compatibility matrix
	 */
	private initializeCompatibilityMatrix(): CompatibilityMatrix {
		return {
			xaheen: {
				"1.0.0": {
					xalaUI: ["1.0.0", "1.1.0"],
					node: ">=18.0.0",
					npm: ">=8.0.0",
					platforms: ["react", "nextjs", "vue", "nuxt", "angular"],
				},
				"1.1.0": {
					xalaUI: ["1.0.0", "1.1.0", "1.2.0"],
					node: ">=18.0.0",
					npm: ">=8.0.0",
					platforms: ["react", "nextjs", "vue", "nuxt", "angular", "svelte"],
				},
				"2.0.0": {
					xalaUI: ["1.2.0", "2.0.0"],
					node: ">=20.0.0",
					npm: ">=9.0.0",
					platforms: [
						"react",
						"nextjs",
						"vue",
						"nuxt",
						"angular",
						"svelte",
						"solid",
					],
				},
			},
			platforms: {
				react: {
					xalaUI: ["1.0.0", "1.1.0", "1.2.0", "2.0.0"],
					dependencies: ["react@>=17.0.0", "react-dom@>=17.0.0"],
				},
				nextjs: {
					xalaUI: ["1.0.0", "1.1.0", "1.2.0", "2.0.0"],
					dependencies: [
						"next@>=13.0.0",
						"react@>=17.0.0",
						"react-dom@>=17.0.0",
					],
				},
				vue: {
					xalaUI: ["1.0.0", "1.1.0", "1.2.0", "2.0.0"],
					dependencies: ["vue@>=3.0.0"],
				},
				nuxt: {
					xalaUI: ["1.0.0", "1.1.0", "1.2.0", "2.0.0"],
					dependencies: ["nuxt@>=3.0.0", "vue@>=3.0.0"],
				},
				angular: {
					xalaUI: ["1.1.0", "1.2.0", "2.0.0"],
					dependencies: ["@angular/core@>=15.0.0", "@angular/common@>=15.0.0"],
				},
			},
		};
	}

	/**
	 * Check all dependencies for current project
	 */
	async checkDependencies(): Promise<{
		compatible: boolean;
		dependencies: DependencyInfo[];
		recommendations: string[];
	}> {
		const dependencies: DependencyInfo[] = [];
		const recommendations: string[] = [];

		// Check Node.js version
		const nodeInfo = await this.checkNodeVersion();
		dependencies.push(nodeInfo);

		// Check npm/yarn/pnpm
		const packageManagerInfo = await this.checkPackageManager();
		dependencies.push(packageManagerInfo);

		// Check Xaheen if integrated
		const xaheenInfo = await this.checkXaheen();
		if (xaheenInfo) {
			dependencies.push(xaheenInfo);
		}

		// Check platform dependencies
		const platformDeps = await this.checkPlatformDependencies();
		dependencies.push(...platformDeps);

		// Check UI system dependencies
		const uiDeps = await this.checkUISystemDependencies();
		dependencies.push(...uiDeps);

		// Generate recommendations
		const incompatibleDeps = dependencies.filter((dep) => !dep.compatible);
		if (incompatibleDeps.length > 0) {
			recommendations.push("⚠️  Some dependencies are incompatible or missing:");
			incompatibleDeps.forEach((dep) => {
				recommendations.push(
					`   - ${dep.name}: ${dep.installedVersion || "not installed"} (requires ${dep.minimumVersion})`,
				);
				recommendations.push(`     Install: ${dep.installCommand}`);
			});
		}

		const compatible = dependencies.every((dep) => dep.compatible);

		return { compatible, dependencies, recommendations };
	}

	/**
	 * Check Node.js version
	 */
	private async checkNodeVersion(): Promise<DependencyInfo> {
		const nodeVersion = process.version;
		const minimumVersion = "18.0.0";

		return {
			name: "Node.js",
			version: nodeVersion,
			required: true,
			compatible: semver.gte(nodeVersion, minimumVersion),
			minimumVersion,
			installedVersion: nodeVersion,
			installCommand: "https://nodejs.org/en/download/",
			checkCommand: "node --version",
		};
	}

	/**
	 * Check package manager
	 */
	private async checkPackageManager(): Promise<DependencyInfo> {
		try {
			// Try npm first
			const { stdout } = await execAsync("npm --version");
			const npmVersion = stdout.trim();
			const minimumVersion = "8.0.0";

			return {
				name: "npm",
				version: npmVersion,
				required: true,
				compatible: semver.gte(npmVersion, minimumVersion),
				minimumVersion,
				installedVersion: npmVersion,
				installCommand: "npm install -g npm@latest",
				checkCommand: "npm --version",
			};
		} catch {
			return {
				name: "npm",
				version: "not installed",
				required: true,
				compatible: false,
				minimumVersion: "8.0.0",
				installCommand: "https://nodejs.org/en/download/",
				checkCommand: "npm --version",
			};
		}
	}

	/**
	 * Check Xaheen CLI
	 */
	private async checkXaheen(): Promise<DependencyInfo | null> {
		try {
			const { stdout } = await execAsync("xaheen --version");
			const xaheenVersion = stdout.trim().replace(/^v/, "");
			const minimumVersion = "1.0.0";

			return {
				name: "@xaheen/cli",
				version: xaheenVersion,
				required: false,
				compatible: semver.gte(xaheenVersion, minimumVersion),
				minimumVersion,
				installedVersion: xaheenVersion,
				installCommand: "npm install -g @xaheen/cli@latest",
				checkCommand: "xaheen --version",
			};
		} catch {
			// Check if this is a Xaheen project
			const isXaheenProject = existsSync(
				path.join(this.projectPath, "xaheen.config.json"),
			);
			if (isXaheenProject) {
				return {
					name: "@xaheen/cli",
					version: "not installed",
					required: true,
					compatible: false,
					minimumVersion: "1.0.0",
					installCommand: "npm install -g @xaheen/cli@latest",
					checkCommand: "xaheen --version",
				};
			}
			return null;
		}
	}

	/**
	 * Check platform-specific dependencies
	 */
	private async checkPlatformDependencies(): Promise<DependencyInfo[]> {
		const dependencies: DependencyInfo[] = [];
		const packageJsonPath = path.join(this.projectPath, "package.json");

		if (!existsSync(packageJsonPath)) {
			return dependencies;
		}

		const packageContent = await fs.readFile(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(packageContent);
		const allDeps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};

		// Detect platform
		let platform = "react"; // default
		if (allDeps.next) platform = "nextjs";
		else if (allDeps.vue) platform = "vue";
		else if (allDeps.nuxt) platform = "nuxt";
		else if (allDeps["@angular/core"]) platform = "angular";

		const platformConfig = this.compatibilityMatrix.platforms[platform];
		if (!platformConfig) {
			return dependencies;
		}

		// Check each platform dependency
		for (const depSpec of platformConfig.dependencies) {
			const [depName, versionRange] = depSpec.split("@>=");
			const installedVersion = allDeps[depName!];

			dependencies.push({
				name: depName!,
				version: installedVersion || "not installed",
				required: true,
				compatible: installedVersion
					? semver.gte(installedVersion, versionRange!)
					: false,
				minimumVersion: versionRange!,
				installedVersion: installedVersion || undefined,
				installCommand: `npm install ${depName}@${versionRange}`,
				checkCommand: `npm list ${depName}`,
			});
		}

		return dependencies;
	}

	/**
	 * Check UI system dependencies
	 */
	private async checkUISystemDependencies(): Promise<DependencyInfo[]> {
		const dependencies: DependencyInfo[] = [];
		const packageJsonPath = path.join(this.projectPath, "package.json");

		if (!existsSync(packageJsonPath)) {
			return dependencies;
		}

		const packageContent = await fs.readFile(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(packageContent);
		const allDeps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};

		// Required UI system dependencies
		const requiredDeps = [
			{ name: "tailwindcss", version: ">=3.0.0" },
			{ name: "class-variance-authority", version: ">=0.7.0" },
			{ name: "clsx", version: ">=1.2.0" },
			{ name: "tailwind-merge", version: ">=1.14.0" },
		];

		for (const dep of requiredDeps) {
			const installedVersion = allDeps[dep.name];
			const versionRange = dep.version.replace(">=", "");

			dependencies.push({
				name: dep.name,
				version: installedVersion || "not installed",
				required: true,
				compatible: installedVersion
					? semver.gte(installedVersion, versionRange)
					: false,
				minimumVersion: versionRange,
				installedVersion,
				installCommand: `npm install ${dep.name}@${dep.version}`,
				checkCommand: `npm list ${dep.name}`,
			});
		}

		return dependencies;
	}

	/**
	 * Install missing dependencies
	 */
	async installMissingDependencies(dependencies: DependencyInfo[]): Promise<{
		success: boolean;
		installed: string[];
		failed: string[];
	}> {
		const installed: string[] = [];
		const failed: string[] = [];

		const missingDeps = dependencies.filter(
			(dep) => !dep.compatible && dep.required,
		);

		for (const dep of missingDeps) {
			try {
				console.log(chalk.blue(`Installing ${dep.name}...`));

				// Skip global installations in automated mode
				if (dep.installCommand.includes("-g ")) {
					console.log(
						chalk.yellow(
							`⚠️  ${dep.name} requires global installation: ${dep.installCommand}`,
						),
					);
					failed.push(dep.name);
					continue;
				}

				await execAsync(dep.installCommand, { cwd: this.projectPath });
				installed.push(dep.name);
				console.log(chalk.green(`✓ ${dep.name} installed successfully`));
			} catch (error) {
				failed.push(dep.name);
				console.log(
					chalk.red(
						`❌ Failed to install ${dep.name}: ${error instanceof Error ? error.message : String(error)}`,
					),
				);
			}
		}

		return {
			success: failed.length === 0,
			installed,
			failed,
		};
	}

	/**
	 * Check compatibility between Xaheen and Xala UI versions
	 */
	async checkXaheenCompatibility(
		xaheenVersion: string,
		xalaVersion: string,
	): Promise<{
		compatible: boolean;
		recommendations: string[];
	}> {
		const recommendations: string[] = [];

		// Find closest matching Xaheen version in matrix
		const xaheenConfig =
			this.compatibilityMatrix.xaheen[xaheenVersion] ||
			this.getClosestVersion(
				xaheenVersion,
				Object.keys(this.compatibilityMatrix.xaheen),
			);

		if (!xaheenConfig) {
			return {
				compatible: false,
				recommendations: [`Xaheen version ${xaheenVersion} is not supported`],
			};
		}

		const compatible = xaheenConfig.xalaUI.some((version: string) =>
			semver.satisfies(xalaVersion, version),
		);

		if (!compatible) {
			recommendations.push(
				`Xaheen ${xaheenVersion} requires Xala UI version: ${xaheenConfig.xalaUI.join(" or ")}`,
			);
			recommendations.push(`Current Xala UI version: ${xalaVersion}`);
			recommendations.push(
				"Consider upgrading one of the tools for better compatibility",
			);
		}

		return { compatible, recommendations };
	}

	/**
	 * Get closest version from available versions
	 */
	private getClosestVersion(
		targetVersion: string,
		availableVersions: string[],
	): any {
		const sortedVersions = availableVersions
			.filter((v) => semver.valid(v))
			.sort((a, b) => semver.compare(b, a)); // Latest first

		// Find the highest version that's <= target version
		for (const version of sortedVersions) {
			if (semver.lte(version, targetVersion)) {
				return this.compatibilityMatrix.xaheen[version];
			}
		}

		// If no lower version found, return the latest
		return this.compatibilityMatrix.xaheen[sortedVersions[0]!];
	}

	/**
	 * Generate dependency report
	 */
	async generateDependencyReport(): Promise<string> {
		const { compatible, dependencies, recommendations } =
			await this.checkDependencies();

		let report = "# Dependency Report\n\n";

		// Overall status
		report += `## Overall Status: ${compatible ? "✅ Compatible" : "❌ Issues Found"}\n\n`;

		// Dependencies table
		report += "## Dependencies\n\n";
		report += "| Name | Required | Installed | Minimum | Compatible |\n";
		report += "|------|----------|-----------|---------|------------|\n";

		for (const dep of dependencies) {
			const compatible_icon = dep.compatible ? "✅" : "❌";
			const required_icon = dep.required ? "✅" : "⭕";
			report += `| ${dep.name} | ${required_icon} | ${dep.installedVersion || "Not installed"} | ${dep.minimumVersion} | ${compatible_icon} |\n`;
		}

		// Recommendations
		if (recommendations.length > 0) {
			report += "\n## Recommendations\n\n";
			for (const rec of recommendations) {
				report += `- ${rec}\n`;
			}
		}

		return report;
	}

	/**
	 * Auto-fix common dependency issues
	 */
	async autoFixDependencies(): Promise<{
		success: boolean;
		fixes: string[];
		errors: string[];
	}> {
		const fixes: string[] = [];
		const errors: string[] = [];

		try {
			// Check and install missing dependencies
			const { dependencies } = await this.checkDependencies();
			const result = await this.installMissingDependencies(dependencies);

			fixes.push(...result.installed.map((dep) => `Installed ${dep}`));
			errors.push(...result.failed.map((dep) => `Failed to install ${dep}`));

			// Update package.json scripts if needed
			await this.updatePackageScripts();
			fixes.push("Updated package.json scripts");

			return {
				success: errors.length === 0,
				fixes,
				errors,
			};
		} catch (error) {
			errors.push(
				`Auto-fix failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			return { success: false, fixes, errors };
		}
	}

	/**
	 * Update package.json scripts for integration
	 */
	private async updatePackageScripts(): Promise<void> {
		const packageJsonPath = path.join(this.projectPath, "package.json");

		if (!existsSync(packageJsonPath)) return;

		const packageContent = await fs.readFile(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(packageContent);

		// Add or update scripts for Xala UI integration
		packageJson.scripts = packageJson.scripts || {};

		if (!packageJson.scripts["ui:check"]) {
			packageJson.scripts["ui:check"] = "xala check src/components/ --verbose";
		}

		if (!packageJson.scripts["ui:migrate"]) {
			packageJson.scripts["ui:migrate"] = "xala migrate analyze --report";
		}

		if (!packageJson.scripts["ui:dev"]) {
			packageJson.scripts["ui:dev"] = "xala dev --watch";
		}

		// If Xaheen is integrated, add unified commands
		if (existsSync(path.join(this.projectPath, "xaheen.config.json"))) {
			packageJson.scripts["dev:unified"] =
				'concurrently "xaheen dev" "xala dev --watch"';
			packageJson.scripts["build:unified"] =
				"xala migrate analyze && xaheen build";
		}

		await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
	}
}

/**
 * Global dependency manager instance
 */
export const dependencyManager = new DependencyManager();
