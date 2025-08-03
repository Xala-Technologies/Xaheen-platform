import { Command } from "commander";
import { consola } from "consola";

export const bundleCommand = new Command("bundle")
	.description("Manage service bundles")
	.argument("[action]", "Action to perform (list, info, create)")
	.action(async (action) => {
		consola.info(`Bundle action: ${action || "list"}`);
		consola.warn("Bundle command not yet implemented");
	});
