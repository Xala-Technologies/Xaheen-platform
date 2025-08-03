import { Command } from "commander";
import { consola } from "consola";

export const doctorCommand = new Command("doctor")
	.description("Check system and project health")
	.action(async () => {
		consola.info("Running diagnostics...");
		consola.warn("Doctor command not yet implemented");
	});
