/**
 * Command Auto-Completion Service for Xaheen CLI
 * Integrates with shells for intelligent command completion
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { logger } from "../../utils/logger.js";
import AutoCompletionEngine, { type CompletionContext } from "./auto-completion-engine.js";

/**
 * Shell type enum
 */
export enum ShellType {
	BASH = "bash",
	ZSH = "zsh",
	FISH = "fish",
	POWERSHELL = "powershell",
	UNKNOWN = "unknown",
}

/**
 * Completion result for shell integration
 */
export interface ShellCompletionResult {
	readonly completions: string[];
	readonly description?: string;
	readonly prefix?: string;
}

/**
 * Auto-completion setup options
 */
export interface AutoCompletionSetupOptions {
	readonly shell?: ShellType;
	readonly global?: boolean;
	readonly force?: boolean;
	readonly verbose?: boolean;
}

/**
 * Command auto-completion service
 */
export class CommandAutoCompletion {
	private readonly engine: AutoCompletionEngine;
	private readonly projectPath: string;

	constructor(projectPath: string) {
		this.projectPath = projectPath;
		this.engine = new AutoCompletionEngine(projectPath);
	}

	/**
	 * Initialize auto-completion engine
	 */
	public async initialize(): Promise<void> {
		try {
			await this.engine.buildCommandTree();
			logger.info("Command auto-completion initialized");
		} catch (error) {
			logger.error("Failed to initialize auto-completion:", error);
			throw error;
		}
	}

	/**
	 * Get completions for command line
	 */
	public async getCompletions(
		line: string,
		position: number = line.length,
	): Promise<ShellCompletionResult> {
		try {
			const context = this.engine.parseCommandLine(line, position);
			const completions = await this.engine.getCompletions(context);

			return {
				completions: completions.map((item) => item.value),
				description: completions[0]?.description,
				prefix: context.currentArg,
			};
		} catch (error) {
			logger.error("Failed to get completions:", error);
			return { completions: [] };
		}
	}

	/**
	 * Setup shell auto-completion
	 */
	public async setupShellCompletion(
		options: AutoCompletionSetupOptions = {},
	): Promise<boolean> {
		try {
			const shell = options.shell || this.detectShell();
			
			if (shell === ShellType.UNKNOWN) {
				logger.error("Unable to detect shell type");
				return false;
			}

			const setupResult = await this.setupShellSpecificCompletion(shell, options);
			
			if (setupResult) {
				logger.info(`Auto-completion setup completed for ${shell}`);
				logger.info("Restart your shell or run 'source ~/.bashrc' (or equivalent) to enable completions");
			}

			return setupResult;
		} catch (error) {
			logger.error("Failed to setup shell completion:", error);
			return false;
		}
	}

	/**
	 * Remove shell auto-completion
	 */
	public async removeShellCompletion(shell?: ShellType): Promise<boolean> {
		try {
			const targetShell = shell || this.detectShell();
			
			if (targetShell === ShellType.UNKNOWN) {
				logger.error("Unable to detect shell type");
				return false;
			}

			const removeResult = await this.removeShellSpecificCompletion(targetShell);
			
			if (removeResult) {
				logger.info(`Auto-completion removed for ${targetShell}`);
			}

			return removeResult;
		} catch (error) {
			logger.error("Failed to remove shell completion:", error);
			return false;
		}
	}

	/**
	 * Handle completion request (called by shell scripts)
	 */
	public async handleCompletionRequest(args: string[]): Promise<void> {
		try {
			// Parse environment variables set by shell completion scripts
			const line = process.env.COMP_LINE || process.env._XAHEEN_COMPLETE || "";
			const point = parseInt(process.env.COMP_POINT || process.env._XAHEEN_COMPLETE_POINT || "0", 10);

			const result = await this.getCompletions(line, point);
			
			// Output completions for shell
			for (const completion of result.completions) {
				console.log(completion);
			}
		} catch (error) {
			logger.error("Failed to handle completion request:", error);
		}
	}

	/**
	 * Detect current shell
	 */
	private detectShell(): ShellType {
		try {
			// Check SHELL environment variable
			const shell = process.env.SHELL || "";
			
			if (shell.includes("bash")) {
				return ShellType.BASH;
			} else if (shell.includes("zsh")) {
				return ShellType.ZSH;
			} else if (shell.includes("fish")) {
				return ShellType.FISH;
			}

			// Check for PowerShell on Windows
			if (process.platform === "win32") {
				return ShellType.POWERSHELL;
			}

			// Try to detect from process
			try {
				const ps = execSync("ps -p $$ -o comm=", { encoding: "utf8" }).trim();
				if (ps.includes("bash")) return ShellType.BASH;
				if (ps.includes("zsh")) return ShellType.ZSH;
				if (ps.includes("fish")) return ShellType.FISH;
			} catch {
				// Ignore errors
			}

			return ShellType.UNKNOWN;
		} catch (error) {
			logger.warn("Failed to detect shell:", error);
			return ShellType.UNKNOWN;
		}
	}

	/**
	 * Setup shell-specific completion
	 */
	private async setupShellSpecificCompletion(
		shell: ShellType,
		options: AutoCompletionSetupOptions,
	): Promise<boolean> {
		try {
			switch (shell) {
				case ShellType.BASH:
					return await this.setupBashCompletion(options);
				case ShellType.ZSH:
					return await this.setupZshCompletion(options);
				case ShellType.FISH:
					return await this.setupFishCompletion(options);
				case ShellType.POWERSHELL:
					return await this.setupPowerShellCompletion(options);
				default:
					logger.error(`Unsupported shell: ${shell}`);
					return false;
			}
		} catch (error) {
			logger.error(`Failed to setup ${shell} completion:`, error);
			return false;
		}
	}

	/**
	 * Setup Bash completion
	 */
	private async setupBashCompletion(
		options: AutoCompletionSetupOptions,
	): Promise<boolean> {
		const completionScript = `
# Xaheen CLI bash completion
_xaheen_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    
    # Set environment variables for completion
    export COMP_LINE="\${COMP_LINE}"
    export COMP_POINT="\${COMP_POINT}"
    
    # Get completions from CLI
    local completions
    completions=\$(xaheen --completion 2>/dev/null)
    
    if [ -n "\$completions" ]; then
        COMPREPLY=( \$(compgen -W "\$completions" -- "\$cur") )
    fi
    
    return 0
}

# Register completion
complete -F _xaheen_completion xaheen
`;

		return await this.addToShellConfig(".bashrc", completionScript, options);
	}

	/**
	 * Setup Zsh completion
	 */
	private async setupZshCompletion(
		options: AutoCompletionSetupOptions,
	): Promise<boolean> {
		const completionScript = `
# Xaheen CLI zsh completion
_xaheen() {
    local state line
    local -a completions
    
    # Set environment variables for completion
    export _XAHEEN_COMPLETE="\$words"
    export _XAHEEN_COMPLETE_POINT="\$CURSOR"
    
    # Get completions from CLI
    completions=(\${(f)"\$(xaheen --completion 2>/dev/null)"})
    
    if (( \${#completions[@]} > 0 )); then
        _describe 'xaheen' completions
    fi
}

# Register completion
compdef _xaheen xaheen

# Enable completion system if not already enabled
autoload -U compinit && compinit
`;

		return await this.addToShellConfig(".zshrc", completionScript, options);
	}

	/**
	 * Setup Fish completion
	 */
	private async setupFishCompletion(
		options: AutoCompletionSetupOptions,
	): Promise<boolean> {
		const completionScript = `
# Xaheen CLI fish completion
function __xaheen_complete
    set -l cmd (commandline -cp)
    set -l cursor (commandline -C)
    
    # Set environment variables for completion
    set -x _XAHEEN_COMPLETE "$cmd"
    set -x _XAHEEN_COMPLETE_POINT $cursor
    
    # Get completions from CLI
    xaheen --completion 2>/dev/null
end

complete -c xaheen -f -a "(__xaheen_complete)"
`;

		// Fish completions go in a specific directory
		const fishConfigDir = join(homedir(), ".config", "fish", "completions");
		const completionFile = join(fishConfigDir, "xaheen.fish");

		try {
			// Create directory if it doesn't exist
			if (!existsSync(fishConfigDir)) {
				const { mkdir } = await import("fs/promises");
				await mkdir(fishConfigDir, { recursive: true });
			}

			await writeFile(completionFile, completionScript);
			logger.info(`Fish completion script written to: ${completionFile}`);
			return true;
		} catch (error) {
			logger.error("Failed to setup Fish completion:", error);
			return false;
		}
	}

	/**
	 * Setup PowerShell completion
	 */
	private async setupPowerShellCompletion(
		options: AutoCompletionSetupOptions,
	): Promise<boolean> {
		const completionScript = `
# Xaheen CLI PowerShell completion
Register-ArgumentCompleter -Native -CommandName xaheen -ScriptBlock {
    param(\$wordToComplete, \$commandAst, \$cursorPosition)
    
    \$env:_XAHEEN_COMPLETE = \$commandAst.ToString()
    \$env:_XAHEEN_COMPLETE_POINT = \$cursorPosition
    
    \$completions = & xaheen --completion 2>\$null
    
    if (\$completions) {
        \$completions | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new(\$_, \$_, 'ParameterValue', \$_)
        }
    }
}
`;

		return await this.addToShellConfig("Microsoft.PowerShell_profile.ps1", completionScript, options);
	}

	/**
	 * Add completion script to shell configuration
	 */
	private async addToShellConfig(
		configFile: string,
		script: string,
		options: AutoCompletionSetupOptions,
	): Promise<boolean> {
		try {
			const configPath = join(homedir(), configFile);
			const marker = "# Xaheen CLI completion";

			let configContent = "";
			let hasExistingCompletion = false;

			// Read existing config if it exists
			if (existsSync(configPath)) {
				configContent = await readFile(configPath, "utf8");
				hasExistingCompletion = configContent.includes(marker);
			}

			// Skip if already exists and not forcing
			if (hasExistingCompletion && !options.force) {
				logger.info(`Completion already exists in ${configFile}`);
				return true;
			}

			// Remove existing completion if forcing
			if (hasExistingCompletion && options.force) {
				configContent = this.removeExistingCompletion(configContent, marker);
			}

			// Add new completion
			const newContent = configContent + "\n" + script + "\n";
			await writeFile(configPath, newContent);

			logger.info(`Completion script added to: ${configPath}`);
			return true;
		} catch (error) {
			logger.error("Failed to add completion to shell config:", error);
			return false;
		}
	}

	/**
	 * Remove shell-specific completion
	 */
	private async removeShellSpecificCompletion(shell: ShellType): Promise<boolean> {
		try {
			const configFiles: Record<ShellType, string[]> = {
				[ShellType.BASH]: [".bashrc", ".bash_profile"],
				[ShellType.ZSH]: [".zshrc"],
				[ShellType.FISH]: [], // Fish uses separate completion files
				[ShellType.POWERSHELL]: ["Microsoft.PowerShell_profile.ps1"],
				[ShellType.UNKNOWN]: [],
			};

			const files = configFiles[shell];
			const marker = "# Xaheen CLI completion";

			for (const file of files) {
				const configPath = join(homedir(), file);
				
				if (existsSync(configPath)) {
					const configContent = await readFile(configPath, "utf8");
					
					if (configContent.includes(marker)) {
						const newContent = this.removeExistingCompletion(configContent, marker);
						await writeFile(configPath, newContent);
						logger.info(`Removed completion from: ${configPath}`);
					}
				}
			}

			// Handle Fish completion file
			if (shell === ShellType.FISH) {
				const fishCompletionFile = join(
					homedir(),
					".config",
					"fish",
					"completions",
					"xaheen.fish",
				);
				
				if (existsSync(fishCompletionFile)) {
					const { unlink } = await import("fs/promises");
					await unlink(fishCompletionFile);
					logger.info(`Removed Fish completion file: ${fishCompletionFile}`);
				}
			}

			return true;
		} catch (error) {
			logger.error(`Failed to remove ${shell} completion:`, error);
			return false;
		}
	}

	/**
	 * Remove existing completion from config content
	 */
	private removeExistingCompletion(content: string, marker: string): string {
		const lines = content.split("\n");
		const result: string[] = [];
		let inCompletionBlock = false;

		for (const line of lines) {
			if (line.includes(marker)) {
				inCompletionBlock = true;
				continue;
			}

			if (inCompletionBlock) {
				// Check if we've reached the end of the completion block
				if (line.trim() === "" && result[result.length - 1]?.trim() === "") {
					inCompletionBlock = false;
				}
				continue;
			}

			result.push(line);
		}

		return result.join("\n");
	}

	/**
	 * Test completion functionality
	 */
	public async testCompletion(): Promise<boolean> {
		try {
			const testCases = [
				"xaheen ",
				"xaheen g",
				"xaheen generate ",
				"xaheen generate comp",
				"xaheen plugin install ",
				"xaheen create --",
			];

			logger.info("Testing completion functionality...");

			for (const testCase of testCases) {
				const result = await this.getCompletions(testCase);
				logger.info(`"${testCase}" -> [${result.completions.join(", ")}]`);
			}

			logger.info("Completion test completed successfully");
			return true;
		} catch (error) {
			logger.error("Completion test failed:", error);
			return false;
		}
	}
}

/**
 * Default export
 */
export default CommandAutoCompletion;