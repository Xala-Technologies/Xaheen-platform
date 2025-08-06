/**
 * Rich Output Formatter for Xaheen CLI
 * Provides advanced CLI output formatting, diffs, tables, and visual elements
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { readFileSync } from "fs";
import chalk from "chalk";
import Table from "cli-table3";
import { diffLines, diffChars, Change } from "diff";
import { logger } from "../../utils/logger";

/**
 * Output formatting options
 */
export interface OutputFormattingOptions {
	readonly colors?: boolean;
	readonly width?: number;
	readonly indent?: number;
	readonly theme?: OutputTheme;
	readonly verbose?: boolean;
}

/**
 * Output theme
 */
export interface OutputTheme {
	readonly primary: keyof typeof chalk;
	readonly secondary: keyof typeof chalk;
	readonly success: keyof typeof chalk;
	readonly error: keyof typeof chalk;
	readonly warning: keyof typeof chalk;
	readonly info: keyof typeof chalk;
	readonly muted: keyof typeof chalk;
	readonly accent: keyof typeof chalk;
}

/**
 * Diff options
 */
export interface DiffOptions {
	readonly context?: number;
	readonly ignoreWhitespace?: boolean;
	readonly ignoreCase?: boolean;
	readonly showLineNumbers?: boolean;
	readonly unifiedFormat?: boolean;
	readonly colors?: boolean;
}

/**
 * Table column definition
 */
export interface TableColumn {
	readonly key: string;
	readonly title: string;
	readonly width?: number;
	readonly align?: "left" | "center" | "right";
	readonly format?: (value: any) => string;
	readonly color?: keyof typeof chalk;
}

/**
 * Tree node for hierarchical display
 */
export interface TreeNode {
	readonly name: string;
	readonly children?: TreeNode[];
	readonly metadata?: Record<string, any>;
	readonly icon?: string;
	readonly color?: keyof typeof chalk;
}

/**
 * Box drawing characters
 */
const BOX_CHARS = {
	topLeft: "┌",
	topRight: "┐",
	bottomLeft: "└",
	bottomRight: "┘",
	horizontal: "─",
	vertical: "│",
	cross: "┼",
	teeUp: "┴",
	teeDown: "┬",
	teeLeft: "┤",
	teeRight: "├",
	heavy: {
		topLeft: "┏",
		topRight: "┓",
		bottomLeft: "┗",
		bottomRight: "┛",
		horizontal: "━",
		vertical: "┃",
		cross: "╋",
		teeUp: "┻",
		teeDown: "┳",
		teeLeft: "┫",
		teeRight: "┣",
	},
	double: {
		topLeft: "╔",
		topRight: "╗",
		bottomLeft: "╚",
		bottomRight: "╝",
		horizontal: "═",
		vertical: "║",
		cross: "╬",
		teeUp: "╩",
		teeDown: "╦",
		teeLeft: "╣",
		teeRight: "╠",
	},
	rounded: {
		topLeft: "╭",
		topRight: "╮",
		bottomLeft: "╰",
		bottomRight: "╯",
		horizontal: "─",
		vertical: "│",
	},
};

/**
 * Rich output formatter
 */
export class RichOutputFormatter {
	private readonly options: Required<OutputFormattingOptions>;
	private readonly theme: OutputTheme;

	constructor(options: OutputFormattingOptions = {}) {
		this.theme = options.theme || {
			primary: "cyan",
			secondary: "blue",
			success: "green",
			error: "red",
			warning: "yellow",
			info: "blue",
			muted: "gray",
			accent: "magenta",
		};

		this.options = {
			colors: options.colors !== false,
			width: options.width || (process.stdout.columns || 80),
			indent: options.indent || 2,
			theme: this.theme,
			verbose: options.verbose || false,
		};
	}

	/**
	 * Format success message
	 */
	public success(message: string, details?: string): string {
		const icon = this.options.colors ? chalk[this.theme.success]("✓") : "✓";
		const formattedMessage = this.options.colors
			? chalk[this.theme.success](message)
			: message;

		let output = `${icon} ${formattedMessage}`;

		if (details) {
			const formattedDetails = this.options.colors
				? chalk[this.theme.muted](details)
				: details;
			output += `\n  ${formattedDetails}`;
		}

		return output;
	}

	/**
	 * Format error message
	 */
	public error(message: string, details?: string): string {
		const icon = this.options.colors ? chalk[this.theme.error]("✗") : "✗";
		const formattedMessage = this.options.colors
			? chalk[this.theme.error](message)
			: message;

		let output = `${icon} ${formattedMessage}`;

		if (details) {
			const formattedDetails = this.options.colors
				? chalk[this.theme.muted](details)
				: details;
			output += `\n  ${formattedDetails}`;
		}

		return output;
	}

	/**
	 * Format warning message
	 */
	public warning(message: string, details?: string): string {
		const icon = this.options.colors ? chalk[this.theme.warning]("⚠") : "⚠";
		const formattedMessage = this.options.colors
			? chalk[this.theme.warning](message)
			: message;

		let output = `${icon} ${formattedMessage}`;

		if (details) {
			const formattedDetails = this.options.colors
				? chalk[this.theme.muted](details)
				: details;
			output += `\n  ${formattedDetails}`;
		}

		return output;
	}

	/**
	 * Format info message
	 */
	public info(message: string, details?: string): string {
		const icon = this.options.colors ? chalk[this.theme.info]("ℹ") : "ℹ";
		const formattedMessage = this.options.colors
			? chalk[this.theme.info](message)
			: message;

		let output = `${icon} ${formattedMessage}`;

		if (details) {
			const formattedDetails = this.options.colors
				? chalk[this.theme.muted](details)
				: details;
			output += `\n  ${formattedDetails}`;
		}

		return output;
	}

	/**
	 * Format header with optional subtitle
	 */
	public header(title: string, subtitle?: string): string {
		const titleColor = this.options.colors ? chalk[this.theme.primary] : (text: string) => text;
		const subtitleColor = this.options.colors ? chalk[this.theme.muted] : (text: string) => text;

		let output = titleColor(title);

		if (subtitle) {
			output += `\n${subtitleColor(subtitle)}`;
		}

		return output;
	}

	/**
	 * Create formatted table
	 */
	public table(data: any[], columns: TableColumn[]): string {
		try {
			// Configure table
			const table = new Table({
				head: columns.map((col) => {
					return this.options.colors
						? chalk[this.theme.primary](col.title)
						: col.title;
				}),
				colWidths: columns.map((col) => col.width || 20),
				colAligns: columns.map((col) => col.align || "left"),
				style: {
					head: this.options.colors ? [] : ["bold"],
					border: this.options.colors ? [] : ["grey"],
				},
			});

			// Add rows
			for (const row of data) {
				const formattedRow = columns.map((col) => {
					let value = row[col.key];

					// Apply column formatter
					if (col.format) {
						value = col.format(value);
					}

					// Apply column color
					if (this.options.colors && col.color) {
						value = chalk[col.color](value);
					}

					return String(value || "");
				});

				table.push(formattedRow);
			}

			return table.toString();
		} catch (error) {
			logger.error("Failed to create table:", error);
			return this.error("Failed to create table");
		}
	}

	/**
	 * Create file diff display
	 */
	public diff(
		oldContent: string,
		newContent: string,
		filename?: string,
		options: DiffOptions = {},
	): string {
		try {
			const diffOptions = {
				context: options.context || 3,
				ignoreWhitespace: options.ignoreWhitespace || false,
				ignoreCase: options.ignoreCase || false,
				showLineNumbers: options.showLineNumbers !== false,
				unifiedFormat: options.unifiedFormat !== false,
				colors: options.colors !== false && this.options.colors,
			};

			const changes = diffLines(oldContent, newContent, {
				ignoreWhitespace: diffOptions.ignoreWhitespace,
				ignoreCase: diffOptions.ignoreCase,
			});

			const output: string[] = [];

			// Add header
			if (filename) {
				const filenameFormatted = diffOptions.colors
					? chalk[this.theme.primary](filename)
					: filename;
				output.push(`diff --git a/${filename} b/${filename}`);
				output.push(`--- a/${filenameFormatted}`);
				output.push(`+++ b/${filenameFormatted}`);
			}

			// Process changes
			let oldLineNumber = 1;
			let newLineNumber = 1;

			for (const change of changes) {
				const lines = change.value.split("\n");
				if (lines[lines.length - 1] === "") {
					lines.pop(); // Remove empty line at end
				}

				for (const line of lines) {
					let prefix = " ";
					let formattedLine = line;
					let lineNum = "";

					if (change.added) {
						prefix = "+";
						if (diffOptions.colors) {
							formattedLine = chalk.green(line);
						}
						if (diffOptions.showLineNumbers) {
							lineNum = chalk.green(`${newLineNumber.toString().padStart(4)} `);
						}
						newLineNumber++;
					} else if (change.removed) {
						prefix = "-";
						if (diffOptions.colors) {
							formattedLine = chalk.red(line);
						}
						if (diffOptions.showLineNumbers) {
							lineNum = chalk.red(`${oldLineNumber.toString().padStart(4)} `);
						}
						oldLineNumber++;
					} else {
						if (diffOptions.showLineNumbers) {
							lineNum = chalk.gray(`${oldLineNumber.toString().padStart(4)} `);
						}
						oldLineNumber++;
						newLineNumber++;
					}

					const prefixFormatted = diffOptions.colors
						? (change.added ? chalk.green(prefix) : change.removed ? chalk.red(prefix) : prefix)
						: prefix;

					output.push(`${lineNum}${prefixFormatted}${formattedLine}`);
				}
			}

			return output.join("\n");
		} catch (error) {
			logger.error("Failed to create diff:", error);
			return this.error("Failed to create diff");
		}
	}

	/**
	 * Create character-level diff for inline changes
	 */
	public inlineDiff(oldText: string, newText: string): string {
		try {
			const changes = diffChars(oldText, newText);
			const output: string[] = [];

			for (const change of changes) {
				if (change.added) {
					if (this.options.colors) {
						output.push(chalk.bgGreen.black(change.value));
					} else {
						output.push(`[+${change.value}+]`);
					}
				} else if (change.removed) {
					if (this.options.colors) {
						output.push(chalk.bgRed.white(change.value));
					} else {
						output.push(`[-${change.value}-]`);
					}
				} else {
					output.push(change.value);
				}
			}

			return output.join("");
		} catch (error) {
			logger.error("Failed to create inline diff:", error);
			return this.error("Failed to create inline diff");
		}
	}

	/**
	 * Create hierarchical tree display
	 */
	public tree(nodes: TreeNode[], options: { showIcons?: boolean } = {}): string {
		const output: string[] = [];

		const renderNode = (
			node: TreeNode,
			prefix: string = "",
			isLast: boolean = true,
		): void => {
			// Build node display
			const connector = isLast ? "└── " : "├── ";
			const icon = options.showIcons && node.icon ? `${node.icon} ` : "";
			
			const nodeName = this.options.colors && node.color
				? chalk[node.color](node.name)
				: node.name;

			output.push(`${prefix}${connector}${icon}${nodeName}`);

			// Render children
			if (node.children && node.children.length > 0) {
				const childPrefix = prefix + (isLast ? "    " : "│   ");
				
				for (let i = 0; i < node.children.length; i++) {
					const child = node.children[i];
					const isLastChild = i === node.children.length - 1;
					renderNode(child, childPrefix, isLastChild);
				}
			}
		};

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			const isLast = i === nodes.length - 1;
			renderNode(node, "", isLast);
		}

		return output.join("\n");
	}

	/**
	 * Create boxed content
	 */
	public box(
		content: string,
		options: {
			title?: string;
			padding?: number;
			style?: "single" | "double" | "heavy" | "rounded";
			align?: "left" | "center" | "right";
		} = {},
	): string {
		const {
			title,
			padding = 1,
			style = "single",
			align = "left",
		} = options;

		const chars = style === "single" ? BOX_CHARS 
			: style === "double" ? BOX_CHARS.double
			: style === "heavy" ? BOX_CHARS.heavy
			: style === "rounded" ? BOX_CHARS.rounded
			: BOX_CHARS;

		const lines = content.split("\n");
		const maxContentWidth = Math.max(...lines.map((line) => line.length));
		const boxWidth = maxContentWidth + (padding * 2);

		const output: string[] = [];

		// Top border
		let topBorder = chars.topLeft + chars.horizontal.repeat(boxWidth) + chars.topRight;
		if (title) {
			const titleFormatted = this.options.colors
				? ` ${chalk[this.theme.primary](title)} `
				: ` ${title} `;
			const titleLength = title.length + 2; // Account for spaces
			
			if (titleLength < boxWidth) {
				const remainingWidth = boxWidth - titleLength;
				const leftPadding = Math.floor(remainingWidth / 2);
				const rightPadding = remainingWidth - leftPadding;
				
				topBorder = chars.topLeft + 
					chars.horizontal.repeat(leftPadding) +
					titleFormatted +
					chars.horizontal.repeat(rightPadding) +
					chars.topRight;
			}
		}
		
		output.push(topBorder);

		// Content lines
		for (const line of lines) {
			const paddingLeft = " ".repeat(padding);
			const paddingRight = " ".repeat(boxWidth - line.length - padding);
			
			let alignedLine = line;
			if (align === "center") {
				const totalPadding = boxWidth - line.length;
				const leftPad = Math.floor(totalPadding / 2);
				const rightPad = totalPadding - leftPad;
				alignedLine = " ".repeat(leftPad) + line + " ".repeat(rightPad);
			} else if (align === "right") {
				alignedLine = " ".repeat(boxWidth - line.length - padding) + line + " ".repeat(padding);
			} else {
				alignedLine = paddingLeft + line + paddingRight;
			}
			
			output.push(chars.vertical + alignedLine + chars.vertical);
		}

		// Bottom border
		output.push(chars.bottomLeft + chars.horizontal.repeat(boxWidth) + chars.bottomRight);

		return output.join("\n");
	}

	/**
	 * Create progress summary
	 */
	public progressSummary(
		completed: number,
		total: number,
		details: Array<{ name: string; status: "success" | "error" | "warning" | "pending" }>,
	): string {
		const percentage = Math.round((completed / total) * 100);
		const progressBar = this.createProgressBar(completed, total, 20);

		const output: string[] = [];

		// Progress header
		const headerText = `Progress: ${completed}/${total} (${percentage}%)`;
		output.push(this.options.colors ? chalk[this.theme.primary](headerText) : headerText);
		output.push(progressBar);
		output.push("");

		// Details
		for (const detail of details) {
			let icon = "";
			let color: keyof typeof chalk = "white";

			switch (detail.status) {
				case "success":
					icon = "✓";
					color = this.theme.success;
					break;
				case "error":
					icon = "✗";
					color = this.theme.error;
					break;
				case "warning":
					icon = "⚠";
					color = this.theme.warning;
					break;
				case "pending":
					icon = "⋯";
					color = this.theme.muted;
					break;
			}

			const formattedIcon = this.options.colors ? chalk[color](icon) : icon;
			const formattedName = this.options.colors ? chalk[color](detail.name) : detail.name;
			
			output.push(`  ${formattedIcon} ${formattedName}`);
		}

		return output.join("\n");
	}

	/**
	 * Create ASCII progress bar
	 */
	private createProgressBar(current: number, total: number, width: number): string {
		const percentage = current / total;
		const filled = Math.floor(percentage * width);
		const empty = width - filled;

		const filledChars = "█".repeat(filled);
		const emptyChars = "░".repeat(empty);

		if (this.options.colors) {
			return `[${chalk[this.theme.success](filledChars)}${chalk[this.theme.muted](emptyChars)}]`;
		}

		return `[${filledChars}${emptyChars}]`;
	}

	/**
	 * Format list with bullets
	 */
	public list(items: string[], options: { bullet?: string; indent?: number } = {}): string {
		const { bullet = "•", indent = 2 } = options;
		const indentStr = " ".repeat(indent);

		return items
			.map((item) => {
				const formattedBullet = this.options.colors
					? chalk[this.theme.accent](bullet)
					: bullet;
				return `${indentStr}${formattedBullet} ${item}`;
			})
			.join("\n");
	}

	/**
	 * Format numbered list
	 */
	public numberedList(items: string[], options: { indent?: number; start?: number } = {}): string {
		const { indent = 2, start = 1 } = options;
		const indentStr = " ".repeat(indent);

		return items
			.map((item, index) => {
				const number = start + index;
				const formattedNumber = this.options.colors
					? chalk[this.theme.accent](`${number}.`)
					: `${number}.`;
				return `${indentStr}${formattedNumber} ${item}`;
			})
			.join("\n");
	}

	/**
	 * Format key-value pairs
	 */
	public keyValue(
		pairs: Record<string, any>,
		options: { separator?: string; indent?: number } = {},
	): string {
		const { separator = ":", indent = 2 } = options;
		const indentStr = " ".repeat(indent);

		const maxKeyLength = Math.max(...Object.keys(pairs).map((key) => key.length));

		return Object.entries(pairs)
			.map(([key, value]) => {
				const paddedKey = key.padEnd(maxKeyLength);
				const formattedKey = this.options.colors
					? chalk[this.theme.secondary](paddedKey)
					: paddedKey;
				const formattedValue = String(value);
				
				return `${indentStr}${formattedKey}${separator} ${formattedValue}`;
			})
			.join("\n");
	}

	/**
	 * Create horizontal separator
	 */
	public separator(char: string = "─", width?: number): string {
		const separatorWidth = width || this.options.width;
		const line = char.repeat(separatorWidth);
		
		return this.options.colors ? chalk[this.theme.muted](line) : line;
	}

	/**
	 * Wrap text to specified width
	 */
	public wrap(text: string, width?: number): string {
		const wrapWidth = width || this.options.width;
		const words = text.split(" ");
		const lines: string[] = [];
		let currentLine = "";

		for (const word of words) {
			if (currentLine.length + word.length + 1 <= wrapWidth) {
				currentLine += (currentLine ? " " : "") + word;
			} else {
				if (currentLine) {
					lines.push(currentLine);
				}
				currentLine = word;
			}
		}

		if (currentLine) {
			lines.push(currentLine);
		}

		return lines.join("\n");
	}
}

/**
 * Default export
 */
export default RichOutputFormatter;