/**
 * Command Generator Service
 * Single Responsibility: Generate CLI commands from stack configuration
 */

import type { StackState } from "../types/base";

export class CommandGeneratorService {
	/**
	 * Generate CLI command from stack configuration
	 */
	public generateCommand(stack: StackState): string {
		const parts: string[] = ["xaheen create"];

		// Add project name
		parts.push(this.escapeProjectName(stack.projectName));

		// Add framework flags
		if (stack.webFrontend.length > 0 && !stack.webFrontend.includes("none")) {
			parts.push(`--web=${stack.webFrontend.join(",")}`);
		}

		if (
			stack.nativeFrontend.length > 0 &&
			!stack.nativeFrontend.includes("none")
		) {
			parts.push(`--native=${stack.nativeFrontend.join(",")}`);
		}

		// Add backend and database
		if (stack.backend !== "none") {
			parts.push(`--backend=${stack.backend}`);
		}

		if (stack.database !== "none") {
			parts.push(`--database=${stack.database}`);
		}

		if (stack.orm !== "none") {
			parts.push(`--orm=${stack.orm}`);
		}

		// Add authentication
		if (stack.auth !== "none") {
			parts.push(`--auth=${stack.auth}`);
		}

		// Add UI system
		if (stack.uiSystem !== "none") {
			parts.push(`--ui=${stack.uiSystem}`);
		}

		// Add package manager
		if (stack.packageManager !== "bun") {
			parts.push(`--package-manager=${stack.packageManager}`);
		}

		// Add runtime
		if (stack.runtime !== "bun") {
			parts.push(`--runtime=${stack.runtime}`);
		}

		// Add integrations
		this.addIntegrationFlags(parts, stack);

		// Add compliance
		if (stack.compliance.length > 0 && !stack.compliance.includes("none")) {
			parts.push(`--compliance=${stack.compliance.join(",")}`);
		}

		// Add addons
		if (stack.addons.length > 0 && !stack.addons.includes("none")) {
			parts.push(`--addons=${stack.addons.join(",")}`);
		}

		// Add flags
		if (stack.git === "true") {
			parts.push("--git");
		}

		if (stack.install === "true") {
			parts.push("--install");
		}

		return parts.join(" ");
	}

	private escapeProjectName(projectName: string): string {
		// Escape project name if it contains spaces or special characters
		if (/[\s<>:"|?*]/.test(projectName)) {
			return `"${projectName.replace(/"/g, '\\"')}"`;
		}
		return projectName;
	}

	private addIntegrationFlags(parts: string[], stack: StackState): void {
		const integrations: Array<[string, string]> = [
			["notifications", stack.notifications],
			["documents", stack.documents],
			["payments", stack.payments],
			["analytics", stack.analytics],
			["monitoring", stack.monitoring],
			["messaging", stack.messaging],
			["testing", stack.testing],
			["devops", stack.devops],
			["search", stack.search],
			["caching", stack.caching],
			["backgroundJobs", stack.backgroundJobs],
			["i18n", stack.i18n],
			["cms", stack.cms],
			["security", stack.security],
		];

		for (const [flag, value] of integrations) {
			if (value && value !== "none") {
				parts.push(`--${flag}=${value}`);
			}
		}

		// Add SaaS-specific flags
		const saasIntegrations: Array<[string, string]> = [
			["saas-admin", stack.saasAdmin],
			["subscriptions", stack.subscriptions],
			["licensing", stack.licensing],
			["rbac", stack.rbac],
			["multi-tenancy", stack.multiTenancy],
		];

		for (const [flag, value] of saasIntegrations) {
			if (value && value !== "none") {
				parts.push(`--${flag}=${value}`);
			}
		}

		// Add deployment flags
		if (stack.webDeploy && stack.webDeploy !== "none") {
			parts.push(`--deploy=${stack.webDeploy}`);
		}

		if (stack.api && stack.api !== "none") {
			parts.push(`--api=${stack.api}`);
		}
	}

	/**
	 * Parse command back to stack configuration (for URL state)
	 */
	public parseCommand(command: string): Partial<StackState> {
		const parts = command.split(" ");
		const stack: Partial<StackState> = {};

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (part.startsWith("--")) {
				const [flag, value] = part.split("=");
				const flagName = flag.substring(2);

				switch (flagName) {
					case "web":
						stack.webFrontend = value?.split(",") || [];
						break;
					case "native":
						stack.nativeFrontend = value?.split(",") || [];
						break;
					case "backend":
						stack.backend = value;
						break;
					case "database":
						stack.database = value;
						break;
					case "orm":
						stack.orm = value;
						break;
					case "auth":
						stack.auth = value;
						break;
					case "ui":
						stack.uiSystem = value;
						break;
					case "package-manager":
						stack.packageManager = value;
						break;
					case "runtime":
						stack.runtime = value;
						break;
					case "compliance":
						stack.compliance = value?.split(",") || [];
						break;
					case "addons":
						stack.addons = value?.split(",") || [];
						break;
					case "git":
						stack.git = "true";
						break;
					case "install":
						stack.install = "true";
						break;
					// Add more parsing rules as needed
				}
			} else if (i === 2) {
				// Project name is the third part (after 'xaheen create')
				stack.projectName = part.replace(/^"|"$/g, ""); // Remove quotes
			}
		}

		return stack;
	}
}

/**
 * Singleton instance of the command generator service
 */
export const commandGeneratorService = new CommandGeneratorService();
