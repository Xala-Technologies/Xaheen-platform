import chalk from "chalk";
import { CommandMetadata } from "./index.js";

export const syncCommand: CommandMetadata = {
	name: "sync",
	description: "Sync between platforms",
	action: async () => {
		console.log(chalk.bold("\n🔄 Platform Sync\n"));
		console.log("Platform synchronization features coming soon!");
		console.log("Use: xala tokens sync <platform> for token sync");
	},
};
