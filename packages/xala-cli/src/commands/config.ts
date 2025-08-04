import chalk from "chalk";
import { CommandMetadata } from "./index.js";

export const configCommand: CommandMetadata = {
	name: "config",
	description: "Manage CLI configuration",
	action: async () => {
		console.log(chalk.bold("\n⚙️ Configuration Management\n"));
		console.log("Configuration management features coming soon!");
		console.log("Configuration is currently handled via xala.config.js");
	},
};
