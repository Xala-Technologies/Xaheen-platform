/**
 * Alias Resolver Middleware
 *
 * Processes command input to resolve aliases and expand shortcuts
 * before passing to the main command parser.
 */

import { AliasManagerService } from "../services/aliases/alias-manager.service.js";
import type { CLICommand } from "../types/index.js";
import { logger } from "../utils/logger.js";

export class AliasResolverMiddleware {
	private aliasManager: AliasManagerService;

	constructor() {
		this.aliasManager = new AliasManagerService();
	}

	/**
	 * Process raw command arguments and resolve aliases
	 */
	public processArguments(args: string[]): {
		resolved: boolean;
		command?: CLICommand;
		originalArgs: string[];
		expandedArgs?: string[];
	} {
		if (args.length === 0) {
			return { resolved: false, originalArgs: args };
		}

		const [firstArg, ...restArgs] = args;

		// Check if first argument is an alias
		if (this.aliasManager.isAlias(firstArg)) {
			const aliasedCommand = this.aliasManager.parseAliasedCommand(args);

			if (aliasedCommand) {
				logger.debug(
					`Resolved alias: ${firstArg} → ${JSON.stringify(aliasedCommand)}`,
				);
				return {
					resolved: true,
					command: aliasedCommand,
					originalArgs: args,
				};
			}
		}

		// Expand shortcuts in arguments even if no alias is found
		const expandedArgs = this.aliasManager.expandShortcuts(args);
		const hasExpansions = expandedArgs.some(
			(arg, index) => arg !== args[index],
		);

		if (hasExpansions) {
			logger.debug(
				`Expanded shortcuts: ${args.join(" ")} → ${expandedArgs.join(" ")}`,
			);
			return {
				resolved: false,
				originalArgs: args,
				expandedArgs,
			};
		}

		return { resolved: false, originalArgs: args };
	}

	/**
	 * Get suggestions for partial alias input
	 */
	public getSuggestions(partial: string): string[] {
		const suggestions = this.aliasManager.getSuggestions(partial);
		return suggestions.map(
			(alias) => `${alias.alias} (${alias.originalCommand})`,
		);
	}

	/**
	 * Show all available aliases and shortcuts
	 */
	public showAliasHelp(): string {
		return this.aliasManager.getAliasHelp();
	}

	/**
	 * Register a custom alias
	 */
	public registerCustomAlias(
		alias: string,
		originalCommand: string,
		description: string,
	): boolean {
		try {
			// Parse the original command to extract domain and action
			const parts = originalCommand.split(" ");
			if (parts.length < 2) {
				return false;
			}

			const domain = parts[0] as any; // We'll validate this exists in types
			const action = parts[1] as any;

			this.aliasManager.registerAlias({
				alias,
				originalCommand,
				domain,
				action,
				description,
				example: `xaheen ${alias}`,
			});

			return true;
		} catch (error) {
			logger.error(`Failed to register alias: ${error}`);
			return false;
		}
	}

	/**
	 * Remove a custom alias
	 */
	public removeCustomAlias(alias: string): boolean {
		return this.aliasManager.removeAlias(alias);
	}

	/**
	 * Get the alias manager for direct access
	 */
	public getAliasManager(): AliasManagerService {
		return this.aliasManager;
	}
}
