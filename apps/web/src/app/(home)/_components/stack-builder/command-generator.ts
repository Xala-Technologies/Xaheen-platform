import type { StackState } from "@/lib/types/index";
import { DEFAULT_STACK, isStackDefault } from "@/lib";

/**
 * Generates CLI command string from stack state
 * Follows Single Responsibility Principle - only handles command generation
 */
export const generateCommand = (stackState: StackState): string => {
	let base: string;
	switch (stackState.packageManager) {
		case "npm":
			base = "npx xaheen@latest";
			break;
		case "pnpm":
			base = "pnpm create xaheen@latest";
			break;
		default:
			base = "bun create xaheen@latest";
			break;
	}

	const projectName = stackState.projectName || "my-xaheen-app";
	const flags: string[] = ["--yes"];

	const checkDefault = <K extends keyof StackState>(
		key: K,
		value: StackState[K],
	) => isStackDefault(stackState, key, value);

	const combinedFrontends = [
		...stackState.webFrontend,
		...stackState.nativeFrontend,
	].filter((v, _, arr) => v !== "none" || arr.length === 1);

	if (
		!checkDefault("webFrontend", stackState.webFrontend) ||
		!checkDefault("nativeFrontend", stackState.nativeFrontend)
	) {
		if (combinedFrontends.length === 0 || combinedFrontends[0] === "none") {
			flags.push("--frontend none");
		} else {
			flags.push(`--frontend ${combinedFrontends.join(" ")}`);
		}
	}

	if (!checkDefault("backend", stackState.backend)) {
		flags.push(`--backend ${stackState.backend}`);
	}

	if (stackState.backend !== "convex") {
		if (!checkDefault("runtime", stackState.runtime)) {
			flags.push(`--runtime ${stackState.runtime}`);
		}
		if (!checkDefault("api", stackState.api)) {
			flags.push(`--api ${stackState.api}`);
		}

		const requiresExplicitDatabase = [
			"d1",
			"turso",
			"neon",
			"supabase",
			"prisma-postgres",
			"mongodb-atlas",
			"docker",
		].includes(stackState.dbSetup);

		if (
			!checkDefault("database", stackState.database) ||
			requiresExplicitDatabase
		) {
			flags.push(`--database ${stackState.database}`);
		}
		if (!checkDefault("orm", stackState.orm)) {
			flags.push(`--orm ${stackState.orm}`);
		}
		if (!checkDefault("auth", stackState.auth)) {
			if (stackState.auth === "false" && DEFAULT_STACK.auth === "true") {
				flags.push("--no-auth");
			}
		}
		if (!checkDefault("dbSetup", stackState.dbSetup)) {
			flags.push(`--db-setup ${stackState.dbSetup}`);
		}
	}

	if (!checkDefault("packageManager", stackState.packageManager)) {
		flags.push(`--package-manager ${stackState.packageManager}`);
	}

	if (!checkDefault("git", stackState.git)) {
		if (stackState.git === "false" && DEFAULT_STACK.git === "true") {
			flags.push("--no-git");
		}
	}

	if (
		stackState.webDeploy &&
		!checkDefault("webDeploy", stackState.webDeploy)
	) {
		flags.push(`--web-deploy ${stackState.webDeploy}`);
	}

	if (!checkDefault("install", stackState.install)) {
		if (stackState.install === "false" && DEFAULT_STACK.install === "true") {
			flags.push("--no-install");
		}
	}

	if (!checkDefault("addons", stackState.addons)) {
		if (stackState.addons.length > 0) {
			const validAddons = stackState.addons.filter((addon) =>
				[
					"pwa",
					"tauri",
					"starlight",
					"biome",
					"husky",
					"turborepo",
					"ultracite",
					"fumadocs",
					"oxlint",
				].includes(addon),
			);
			if (validAddons.length > 0) {
				flags.push(`--addons ${validAddons.join(" ")}`);
			} else {
				if (DEFAULT_STACK.addons.length > 0) {
					flags.push("--addons none");
				}
			}
		} else {
			if (DEFAULT_STACK.addons.length > 0) {
				flags.push("--addons none");
			}
		}
	}

	if (!checkDefault("examples", stackState.examples)) {
		if (stackState.examples.length > 0) {
			flags.push(`--examples ${stackState.examples.join(" ")}`);
		} else {
			if (DEFAULT_STACK.examples.length > 0) {
				flags.push("--examples none");
			}
		}
	}

	return `${base} ${projectName}${
		flags.length > 0 ? ` ${flags.join(" ")}` : ""
	}`;
};
