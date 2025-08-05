/**
 * Terminal Integration Service
 * Provides terminal theme adaptation, ASCII art, emoji support, and enhanced visual feedback
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { execSync } from "child_process";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * Terminal capabilities
 */
export interface TerminalCapabilities {
	readonly supportsColor: boolean;
	readonly supports256Colors: boolean;
	readonly supportsTrueColor: boolean;
	readonly supportsEmoji: boolean;
	readonly supportsUnicode: boolean;
	readonly terminalType: string;
	readonly columns: number;
	readonly rows: number;
	readonly isInteractive: boolean;
	readonly isCIEnvironment: boolean;
}

/**
 * Color scheme
 */
export interface ColorScheme {
	readonly primary: string;
	readonly secondary: string;
	readonly success: string;
	readonly warning: string;
	readonly error: string;
	readonly info: string;
	readonly muted: string;
	readonly accent: string;
	readonly background: string;
	readonly foreground: string;
}

/**
 * ASCII art templates
 */
export interface ASCIIArt {
	readonly logo: string;
	readonly success: string;
	readonly error: string;
	readonly warning: string;
	readonly spinner: string[];
	readonly progress: string[];
	readonly decorations: {
		readonly border: string;
		readonly separator: string;
		readonly bullet: string;
		readonly arrow: string;
		readonly check: string;
		readonly cross: string;
	};
}

/**
 * Output formatting options
 */
export interface OutputOptions {
	readonly useColor?: boolean;
	readonly useEmoji?: boolean;
	readonly useASCIIArt?: boolean;
	readonly indentLevel?: number;
	readonly maxWidth?: number;
	readonly centerText?: boolean;
	readonly addPadding?: boolean;
	readonly category?: 'info' | 'success' | 'warning' | 'error' | 'debug';
}

/**
 * Terminal themes
 */
export type TerminalTheme = 'default' | 'dark' | 'light' | 'solarized' | 'monokai' | 'nord' | 'dracula' | 'material';

/**
 * Enhanced Terminal Integration Service
 */
export class TerminalIntegration extends EventEmitter {
	private capabilities: TerminalCapabilities;
	private currentTheme: TerminalTheme = 'default';
	private colorSchemes: Map<TerminalTheme, ColorScheme> = new Map();
	private asciiArt: ASCIIArt;
	private clipboardEnabled: boolean = false;

	constructor() {
		super();
		this.capabilities = this.detectTerminalCapabilities();
		this.initializeColorSchemes();
		this.initializeASCIIArt();
		this.detectClipboardSupport();
	}

	/**
	 * Initialize terminal integration
	 */
	public async initialize(): Promise<void> {
		try {
			// Auto-detect theme based on terminal
			await this.autoDetectTheme();
			
			// Set up keyboard shortcuts if supported
			if (this.capabilities.isInteractive) {
				this.setupKeyboardShortcuts();
			}

			logger.info(`Terminal integration initialized (${this.capabilities.terminalType})`);
		} catch (error) {
			logger.error("Failed to initialize terminal integration:", error);
			throw error;
		}
	}

	/**
	 * Set terminal theme
	 */
	public setTheme(theme: TerminalTheme): void {
		this.currentTheme = theme;
		const scheme = this.colorSchemes.get(theme);
		
		if (scheme) {
			// Apply theme colors to chalk
			chalk.level = this.capabilities.supportsTrueColor ? 3 : 
						  this.capabilities.supports256Colors ? 2 : 
						  this.capabilities.supportsColor ? 1 : 0;
		}
		
		this.emit('themeChanged', theme, scheme);
		logger.debug(`Terminal theme set to: ${theme}`);
	}

	/**
	 * Get current color scheme
	 */
	public getColorScheme(): ColorScheme {
		return this.colorSchemes.get(this.currentTheme) || this.colorSchemes.get('default')!;
	}

	/**
	 * Print with enhanced formatting
	 */
	public print(message: string, options: OutputOptions = {}): void {
		const scheme = this.getColorScheme();
		let formattedMessage = message;

		// Apply color coding
		if (options.useColor !== false && this.capabilities.supportsColor) {
			switch (options.category) {
				case 'success':
					formattedMessage = chalk.hex(scheme.success)(formattedMessage);
					break;
				case 'warning':
					formattedMessage = chalk.hex(scheme.warning)(formattedMessage);
					break;
				case 'error':
					formattedMessage = chalk.hex(scheme.error)(formattedMessage);
					break;
				case 'info':
					formattedMessage = chalk.hex(scheme.info)(formattedMessage);
					break;
				case 'debug':
					formattedMessage = chalk.hex(scheme.muted)(formattedMessage);
					break;
				default:
					formattedMessage = chalk.hex(scheme.foreground)(formattedMessage);
			}
		}

		// Add emoji prefix
		if (options.useEmoji !== false && this.capabilities.supportsEmoji) {
			const emoji = this.getCategoryEmoji(options.category);
			if (emoji) {
				formattedMessage = `${emoji} ${formattedMessage}`;
			}
		}

		// Apply indentation
		if (options.indentLevel) {
			const indent = '  '.repeat(options.indentLevel);
			formattedMessage = formattedMessage.split('\\n').map(line => `${indent}${line}`).join('\\n');
		}

		// Center text
		if (options.centerText && this.capabilities.columns) {
			const lines = formattedMessage.split('\\n');
			formattedMessage = lines.map(line => {
				const plainLength = this.getPlainTextLength(line);
				const padding = Math.max(0, Math.floor((this.capabilities.columns - plainLength) / 2));
				return ' '.repeat(padding) + line;
			}).join('\\n');
		}

		// Apply max width
		if (options.maxWidth) {
			const lines = formattedMessage.split('\\n');
			formattedMessage = lines.map(line => {
				const plainLength = this.getPlainTextLength(line);
				if (plainLength > options.maxWidth!) {
					return this.wrapText(line, options.maxWidth!);
				}
				return line;
			}).join('\\n');
		}

		// Add padding
		if (options.addPadding) {
			formattedMessage = `\\n${formattedMessage}\\n`;
		}

		console.log(formattedMessage);
	}

	/**
	 * Print ASCII art
	 */
	public printASCII(type: keyof ASCIIArt['decorations'] | 'logo' | 'success' | 'error' | 'warning', options: OutputOptions = {}): void {
		if (!this.capabilities.supportsUnicode && options.useASCIIArt !== true) {
			// Fallback for terminals without Unicode support
			return;
		}

		let art: string;
		const scheme = this.getColorScheme();

		switch (type) {
			case 'logo':
				art = this.asciiArt.logo;
				if (this.capabilities.supportsColor) {
					art = chalk.hex(scheme.primary)(art);
				}
				break;
			case 'success':
				art = this.asciiArt.success;
				if (this.capabilities.supportsColor) {
					art = chalk.hex(scheme.success)(art);
				}
				break;
			case 'error':
				art = this.asciiArt.error;
				if (this.capabilities.supportsColor) {
					art = chalk.hex(scheme.error)(art);
				}
				break;
			case 'warning':
				art = this.asciiArt.warning;
				if (this.capabilities.supportsColor) {
					art = chalk.hex(scheme.warning)(art);
				}
				break;
			default:
				art = this.asciiArt.decorations[type] || '';
		}

		if (art) {
			this.print(art, { ...options, useColor: false }); // Color already applied
		}
	}

	/**
	 * Create a bordered box around text
	 */
	public printBox(content: string, options: {
		readonly title?: string;
		readonly padding?: number;
		readonly style?: 'single' | 'double' | 'rounded' | 'thick';
		readonly color?: string;
	} = {}): void {
		const scheme = this.getColorScheme();
		const padding = options.padding ?? 1;
		const color = options.color ?? scheme.primary;
		
		const boxChars = this.getBoxCharacters(options.style || 'single');
		const lines = content.split('\\n');
		const maxContentWidth = Math.max(...lines.map(line => this.getPlainTextLength(line)));
		const boxWidth = maxContentWidth + (padding * 2);

		// Top border
		let topBorder = boxChars.topLeft + boxChars.horizontal.repeat(boxWidth) + boxChars.topRight;
		if (options.title) {
			const titlePadding = Math.max(0, boxWidth - options.title.length - 2);
			const leftPadding = Math.floor(titlePadding / 2);
			const rightPadding = titlePadding - leftPadding;
			topBorder = boxChars.topLeft + boxChars.horizontal.repeat(leftPadding) + 
						` ${options.title} ` + boxChars.horizontal.repeat(rightPadding) + boxChars.topRight;
		}

		if (this.capabilities.supportsColor) {
			console.log(chalk.hex(color)(topBorder));
		} else {
			console.log(topBorder);
		}

		// Content lines
		for (const line of lines) {
			const contentPadding = Math.max(0, maxContentWidth - this.getPlainTextLength(line));
			const paddedLine = ' '.repeat(padding) + line + ' '.repeat(contentPadding + padding);
			const boxLine = boxChars.vertical + paddedLine + boxChars.vertical;
			
			if (this.capabilities.supportsColor) {
				console.log(chalk.hex(color)(boxChars.vertical) + paddedLine + chalk.hex(color)(boxChars.vertical));
			} else {
				console.log(boxLine);
			}
		}

		// Bottom border
		const bottomBorder = boxChars.bottomLeft + boxChars.horizontal.repeat(boxWidth) + boxChars.bottomRight;
		if (this.capabilities.supportsColor) {
			console.log(chalk.hex(color)(bottomBorder));
		} else {
			console.log(bottomBorder);
		}
	}

	/**
	 * Create a progress bar
	 */
	public createProgressBar(total: number, options: {
		readonly width?: number;
		readonly showPercentage?: boolean;
		readonly showCurrent?: boolean;
		readonly label?: string;
		readonly style?: 'blocks' | 'bar' | 'dots' | 'arrow';
	} = {}): {
		update: (current: number) => void;
		complete: () => void;
	} {
		const width = options.width ?? 40;
		const scheme = this.getColorScheme();
		let lastLength = 0;

		const update = (current: number) => {
			const percentage = Math.min(100, Math.max(0, (current / total) * 100));
			const filled = Math.floor((percentage / 100) * width);
			const empty = width - filled;

			let bar = '';
			switch (options.style || 'blocks') {
				case 'blocks':
					bar = '█'.repeat(filled) + '░'.repeat(empty);
					break;
				case 'bar':
					bar = '='.repeat(filled) + '-'.repeat(empty);
					break;
				case 'dots':
					bar = '●'.repeat(filled) + '○'.repeat(empty);
					break;
				case 'arrow':
					bar = '▶'.repeat(filled) + '▷'.repeat(empty);
					break;
			}

			let output = '';
			if (options.label) {
				output += `${options.label}: `;
			}

			output += `[${bar}]`;

			if (options.showPercentage) {
				output += ` ${percentage.toFixed(1)}%`;
			}

			if (options.showCurrent) {
				output += ` (${current}/${total})`;
			}

			// Clear previous line
			if (lastLength > 0) {
				process.stdout.write('\\r' + ' '.repeat(lastLength) + '\\r');
			}

			// Apply color
			if (this.capabilities.supportsColor) {
				const coloredBar = chalk.hex(scheme.success)('█'.repeat(filled)) + 
								   chalk.hex(scheme.muted)('░'.repeat(empty));
				output = output.replace(bar, coloredBar);
				output = chalk.hex(scheme.foreground)(output);
			}

			process.stdout.write(output);
			lastLength = this.getPlainTextLength(output);
		};

		const complete = () => {
			if (lastLength > 0) {
				process.stdout.write('\\n');
			}
		};

		return { update, complete };
	}

	/**
	 * Copy text to clipboard
	 */
	public async copyToClipboard(text: string): Promise<boolean> {
		if (!this.clipboardEnabled) {
			return false;
		}

		try {
			if (process.platform === 'darwin') {
				execSync('pbcopy', { input: text });
			} else if (process.platform === 'linux') {
				execSync('xclip -selection clipboard', { input: text });
			} else if (process.platform === 'win32') {
				execSync('clip', { input: text });
			} else {
				return false;
			}

			this.print('📋 Copied to clipboard', { category: 'success', useEmoji: true });
			return true;
		} catch (error) {
			logger.debug('Failed to copy to clipboard:', error);
			return false;
		}
	}

	/**
	 * Get terminal capabilities
	 */
	public getCapabilities(): TerminalCapabilities {
		return { ...this.capabilities };
	}

	/**
	 * Print color-coded categories
	 */
	public printCategorized(items: Array<{ category: string; items: string[] }>, options: OutputOptions = {}): void {
		const scheme = this.getColorScheme();

		for (const group of items) {
			// Print category header
			if (this.capabilities.supportsColor) {
				console.log(chalk.hex(scheme.accent).bold(`\\n${group.category.toUpperCase()}:`));
			} else {
				console.log(`\\n${group.category.toUpperCase()}:`);
			}

			// Print items
			for (const item of group.items) {
				const bullet = this.capabilities.supportsUnicode ? '  •' : '  -';
				const coloredBullet = this.capabilities.supportsColor ? 
					chalk.hex(scheme.primary)(bullet) : bullet;
				console.log(`${coloredBullet} ${item}`);
			}
		}
	}

	// Private methods

	private detectTerminalCapabilities(): TerminalCapabilities {
		const env = process.env;
		const term = env.TERM || '';
		const termProgram = env.TERM_PROGRAM || '';
		const colorTerm = env.COLORTERM || '';

		// Detect terminal type
		let terminalType = 'unknown';
		if (termProgram) {
			terminalType = termProgram.toLowerCase();
		} else if (term) {
			terminalType = term.toLowerCase();
		}

		// Check color support
		const supportsColor = !!(
			env.FORCE_COLOR ||
			env.NO_COLOR === undefined && (
				term.includes('color') ||
				term.includes('xterm') ||
				term.includes('screen') ||
				termProgram === 'iTerm.app' ||
				termProgram === 'Hyper'
			)
		);

		const supports256Colors = !!(
			supportsColor && (
				term.includes('256') ||
				colorTerm.includes('256') ||
				termProgram === 'iTerm.app'
			)
		);

		const supportsTrueColor = !!(
			supports256Colors && (
				colorTerm === 'truecolor' ||
				colorTerm === '24bit' ||
				termProgram === 'iTerm.app' ||
				termProgram === 'Hyper'
			)
		);

		// Check emoji and Unicode support
		const supportsEmoji = !!(
			env.LANG?.includes('UTF-8') ||
			env.LC_ALL?.includes('UTF-8') ||
			termProgram === 'iTerm.app' ||
			termProgram === 'Hyper' ||
			process.platform === 'darwin'
		);

		const supportsUnicode = supportsEmoji;

		// Get terminal size
		const columns = process.stdout.columns || 80;
		const rows = process.stdout.rows || 24;

		// Check if interactive
		const isInteractive = process.stdout.isTTY && process.stdin.isTTY;

		// Check if CI environment
		const isCIEnvironment = !!(
			env.CI ||
			env.CONTINUOUS_INTEGRATION ||
			env.BUILD_NUMBER ||
			env.GITHUB_ACTIONS ||
			env.GITLAB_CI
		);

		return {
			supportsColor,
			supports256Colors,
			supportsTrueColor,
			supportsEmoji,
			supportsUnicode,
			terminalType,
			columns,
			rows,
			isInteractive,
			isCIEnvironment,
		};
	}

	private initializeColorSchemes(): void {
		// Default theme
		this.colorSchemes.set('default', {
			primary: '#007ACC',
			secondary: '#6C7B7F',
			success: '#28A745',
			warning: '#FFC107',
			error: '#DC3545',
			info: '#17A2B8',
			muted: '#6C757D',
			accent: '#E83E8C',
			background: '#FFFFFF',
			foreground: '#212529',
		});

		// Dark theme
		this.colorSchemes.set('dark', {
			primary: '#61DAFB',
			secondary: '#ABB2BF',
			success: '#98C379',
			warning: '#E5C07B',
			error: '#E06C75',
			info: '#56B6C2',
			muted: '#5C6370',
			accent: '#C678DD',
			background: '#282C34',
			foreground: '#ABB2BF',
		});

		// Light theme
		this.colorSchemes.set('light', {
			primary: '#0366D6',
			secondary: '#586069',
			success: '#28A745',
			warning: '#F66A0A',
			error: '#D73A49',
			info: '#0366D6',
			muted: '#6A737D',
			accent: '#E36209',
			background: '#FAFBFC',
			foreground: '#24292E',
		});

		// Add more themes...
		this.colorSchemes.set('dracula', {
			primary: '#BD93F9',
			secondary: '#6272A4',
			success: '#50FA7B',
			warning: '#F1FA8C',
			error: '#FF5555',
			info: '#8BE9FD',
			muted: '#6272A4',
			accent: '#FF79C6',
			background: '#282A36',
			foreground: '#F8F8F2',
		});
	}

	private initializeASCIIArt(): void {
		this.asciiArt = {
			logo: `
 ██╗  ██╗ █████╗ ██╗  ██╗███████╗███████╗███╗   ██╗
 ╚██╗██╔╝██╔══██╗██║  ██║██╔════╝██╔════╝████╗  ██║
  ╚███╔╝ ███████║███████║█████╗  █████╗  ██╔██╗ ██║
  ██╔██╗ ██╔══██║██╔══██║██╔══╝  ██╔══╝  ██║╚██╗██║
 ██╔╝ ██╗██║  ██║██║  ██║███████╗███████╗██║ ╚████║
 ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝`,
			success: `
   ████████╗
   ╚══██╔══╝
      ██║   
      ██║   
      ██║   
      ╚═╝   `,
			error: `
   ██╗  ██╗
   ╚██╗██╔╝
    ╚███╔╝ 
    ██╔██╗ 
   ██╔╝ ██╗
   ╚═╝  ╚═╝`,
			warning: `
   ███████╗
   ╚══██╔══╝
      ██║   
      ██║   
      ██║   
      ╚═╝   `,
			spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
			progress: ['▱', '▰'],
			decorations: {
				border: '─',
				separator: '│',
				bullet: '•',
				arrow: '→',
				check: '✓',
				cross: '✗',
			},
		};
	}

	private async autoDetectTheme(): Promise<void> {
		// Try to detect terminal theme based on environment
		const env = process.env;
		
		if (env.TERM_PROGRAM === 'iTerm.app') {
			// Try to detect iTerm theme
			this.setTheme('dark'); // Default to dark for iTerm
		} else if (env.COLORTERM === 'truecolor') {
			this.setTheme('dark');
		} else if (env.TERM?.includes('256')) {
			this.setTheme('default');
		} else {
			// Fallback to default
			this.setTheme('default');
		}
	}

	private setupKeyboardShortcuts(): void {
		if (!this.capabilities.isInteractive) {
			return;
		}

		// Set up basic keyboard shortcuts
		process.stdin.setRawMode?.(true);
		process.stdin.resume();
		process.stdin.setEncoding('utf8');

		process.stdin.on('data', (key) => {
			// Ctrl+C - Exit
			if (key === '\\u0003') {
				process.exit(0);
			}
			
			// Ctrl+L - Clear screen
			if (key === '\\u000C') {
				console.clear();
				this.emit('screenCleared');
			}
		});
	}

	private detectClipboardSupport(): void {
		try {
			if (process.platform === 'darwin') {
				execSync('which pbcopy', { stdio: 'ignore' });
				this.clipboardEnabled = true;
			} else if (process.platform === 'linux') {
				execSync('which xclip', { stdio: 'ignore' });
				this.clipboardEnabled = true;
			} else if (process.platform === 'win32') {
				execSync('where clip', { stdio: 'ignore' });
				this.clipboardEnabled = true;
			}
		} catch (error) {
			this.clipboardEnabled = false;
		}
	}

	private getCategoryEmoji(category?: string): string | null {
		if (!this.capabilities.supportsEmoji) {
			return null;
		}

		switch (category) {
			case 'success': return '✅';
			case 'error': return '❌';
			case 'warning': return '⚠️';
			case 'info': return 'ℹ️';
			case 'debug': return '🐛';
			default: return null;
		}
	}

	private getPlainTextLength(text: string): number {
		// Remove ANSI color codes and Unicode characters for length calculation
		return text.replace(/\\u001B\\[[0-9;]*m/g, '').length;
	}

	private wrapText(text: string, maxWidth: number): string {
		const words = text.split(' ');
		const lines: string[] = [];
		let currentLine = '';

		for (const word of words) {
			if ((currentLine + word).length > maxWidth) {
				if (currentLine) {
					lines.push(currentLine.trim());
					currentLine = word + ' ';
				} else {
					lines.push(word);
				}
			} else {
				currentLine += word + ' ';
			}
		}

		if (currentLine) {
			lines.push(currentLine.trim());
		}

		return lines.join('\\n');
	}

	private getBoxCharacters(style: 'single' | 'double' | 'rounded' | 'thick'): {
		topLeft: string;
		topRight: string;
		bottomLeft: string;
		bottomRight: string;
		horizontal: string;
		vertical: string;
	} {
		switch (style) {
			case 'double':
				return {
					topLeft: '╔',
					topRight: '╗',
					bottomLeft: '╚',
					bottomRight: '╝',
					horizontal: '═',
					vertical: '║',
				};
			case 'rounded':
				return {
					topLeft: '╭',
					topRight: '╮',
					bottomLeft: '╰',
					bottomRight: '╯',
					horizontal: '─',
					vertical: '│',
				};
			case 'thick':
				return {
					topLeft: '┏',
					topRight: '┓',
					bottomLeft: '┗',
					bottomRight: '┛',
					horizontal: '━',
					vertical: '┃',
				};
			default: // single
				return {
					topLeft: '┌',
					topRight: '┐',
					bottomLeft: '└',
					bottomRight: '┘',
					horizontal: '─',
					vertical: '│',
				};
		}
	}
}

/**
 * Default export
 */
export default TerminalIntegration;