/**
 * Interactive CLI Output System for Xaheen CLI
 * Provides animations, interactive elements, and enhanced visual feedback
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { stdin, stdout } from "process";
import chalk from "chalk";
import { logger } from "../../utils/logger";
import { Spinner } from "./progress-indicator";
import RichOutputFormatter from "./rich-output-formatter";

/**
 * Animation types
 */
export enum AnimationType {
	FADE_IN = "fadeIn",
	SLIDE_IN = "slideIn",
	BOUNCE = "bounce",
	PULSE = "pulse",
	TYPEWRITER = "typewriter",
	MATRIX = "matrix",
	WAVE = "wave",
	RAINBOW = "rainbow",
}

/**
 * Animation options
 */
export interface AnimationOptions {
	readonly duration?: number;
	readonly delay?: number;
	readonly repeat?: number;
	readonly speed?: number;
	readonly direction?: "forward" | "reverse" | "alternate";
	readonly easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

/**
 * Interactive element options
 */
export interface InteractiveOptions {
	readonly prompt?: string;
	readonly choices?: string[];
	readonly multiSelect?: boolean;
	readonly required?: boolean;
	readonly validation?: (value: string) => boolean | string;
	readonly transform?: (value: string) => string;
	readonly hint?: string;
}

/**
 * Banner options
 */
export interface BannerOptions {
	readonly font?: "standard" | "big" | "small" | "block" | "digital";
	readonly gradient?: [string, string];
	readonly animation?: AnimationType;
	readonly padding?: number;
	readonly width?: number;
	readonly align?: "left" | "center" | "right";
}

/**
 * Notification types
 */
export enum NotificationType {
	SUCCESS = "success",
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
	LOADING = "loading",
}

/**
 * Notification options
 */
export interface NotificationOptions {
	readonly title: string;
	readonly message?: string;
	readonly icon?: string;
	readonly timeout?: number;
	readonly persistent?: boolean;
	readonly actions?: Array<{
		label: string;
		action: () => void;
	}>;
}

/**
 * Interactive CLI output system
 */
export class InteractiveCLIOutput extends EventEmitter {
	private readonly formatter: RichOutputFormatter;
	private readonly animations: Map<string, NodeJS.Timeout> = new Map();
	private readonly notifications: Map<string, NotificationOptions> = new Map();
	private isRawMode = false;

	constructor() {
		super();
		this.formatter = new RichOutputFormatter({
			colors: true,
			verbose: false,
		});

		// Setup input handling
		this.setupInputHandling();
	}

	/**
	 * Setup input handling for interactive elements
	 */
	private setupInputHandling(): void {
		stdin.setEncoding("utf8");

		process.on("SIGINT", () => {
			this.cleanup();
			process.exit(0);
		});

		process.on("SIGTERM", () => {
			this.cleanup();
			process.exit(0);
		});
	}

	/**
	 * Enable raw mode for key capture
	 */
	private enableRawMode(): void {
		if (!this.isRawMode && stdin.isTTY) {
			stdin.setRawMode(true);
			this.isRawMode = true;
		}
	}

	/**
	 * Disable raw mode
	 */
	private disableRawMode(): void {
		if (this.isRawMode && stdin.isTTY) {
			stdin.setRawMode(false);
			this.isRawMode = false;
		}
	}

	/**
	 * Create animated banner
	 */
	public async animatedBanner(
		text: string,
		options: BannerOptions = {},
	): Promise<void> {
		try {
			const {
				font = "standard",
				gradient,
				animation = AnimationType.FADE_IN,
				padding = 2,
				width = process.stdout.columns || 80,
				align = "center",
			} = options;

			// Generate ASCII art (simplified implementation)
			const banner = this.generateASCIIArt(text, font);
			
			// Apply gradient if specified
			let coloredBanner = banner;
			if (gradient) {
				coloredBanner = this.applyGradient(banner, gradient[0], gradient[1]);
			}

			// Apply animation
			await this.animate(coloredBanner, animation, {
				duration: 2000,
				delay: 0,
			});

			// Add padding
			for (let i = 0; i < padding; i++) {
				console.log("");
			}
		} catch (error) {
			logger.error("Failed to create animated banner:", error);
		}
	}

	/**
	 * Create typewriter effect
	 */
	public async typewriter(
		text: string,
		options: { speed?: number; cursor?: boolean } = {},
	): Promise<void> {
		const { speed = 50, cursor = true } = options;

		return new Promise((resolve) => {
			let i = 0;
			const cursorChar = cursor ? "▋" : "";

			const typeInterval = setInterval(() => {
				// Clear line and rewrite with current progress
				stdout.cursorTo(0);
				stdout.clearLine(1);
				
				const currentText = text.slice(0, i + 1);
				const displayText = currentText + (cursor ? cursorChar : "");
				
				stdout.write(displayText);

				i++;

				if (i >= text.length) {
					clearInterval(typeInterval);
					
					// Remove cursor
					if (cursor) {
						setTimeout(() => {
							stdout.cursorTo(0);
							stdout.clearLine(1);
							stdout.write(text);
							resolve();
						}, 500);
					} else {
						resolve();
					}
				}
			}, speed);
		});
	}

	/**
	 * Create matrix rain effect
	 */
	public async matrixRain(duration: number = 3000): Promise<void> {
		const width = process.stdout.columns || 80;
		const height = process.stdout.rows || 24;
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
		
		const matrix: Array<Array<{ char: string; age: number }>> = [];
		
		// Initialize matrix
		for (let x = 0; x < width; x++) {
			matrix[x] = [];
			for (let y = 0; y < height; y++) {
				matrix[x][y] = { char: " ", age: 0 };
			}
		}

		// Hide cursor
		stdout.write("\u001B[?25l");

		const startTime = Date.now();
		
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				// Clear screen
				stdout.write("\u001B[2J\u001B[H");

				// Update matrix
				for (let x = 0; x < width; x++) {
					// Random chance to start new drop
					if (Math.random() < 0.1) {
						const char = chars[Math.floor(Math.random() * chars.length)];
						matrix[x][0] = { char, age: 0 };
					}

					// Move drops down and age them
					for (let y = height - 1; y > 0; y--) {
						matrix[x][y] = { ...matrix[x][y - 1], age: matrix[x][y - 1].age + 1 };
					}
					matrix[x][0] = { char: " ", age: 0 };
				}

				// Render matrix
				for (let y = 0; y < height; y++) {
					let line = "";
					for (let x = 0; x < width; x++) {
						const cell = matrix[x][y];
						
						if (cell.char === " ") {
							line += " ";
						} else {
							// Apply color based on age
							if (cell.age === 0) {
								line += chalk.white.bold(cell.char);
							} else if (cell.age < 3) {
								line += chalk.green.bold(cell.char);
							} else if (cell.age < 6) {
								line += chalk.green(cell.char);
							} else {
								line += chalk.green.dim(cell.char);
							}
						}
					}
					stdout.write(line);
					if (y < height - 1) stdout.write("\n");
				}

				// Check if duration elapsed
				if (Date.now() - startTime >= duration) {
					clearInterval(interval);
					
					// Clear screen and show cursor
					stdout.write("\u001B[2J\u001B[H");
					stdout.write("\u001B[?25h");
					
					resolve();
				}
			}, 100);
		});
	}

	/**
	 * Create pulsing effect
	 */
	public async pulse(
		text: string,
		options: { color?: keyof typeof chalk; duration?: number; pulses?: number } = {},
	): Promise<void> {
		const { color = "cyan", duration = 2000, pulses = 3 } = options;
		const pulseInterval = duration / (pulses * 2); // Each pulse has fade in and fade out

		return new Promise((resolve) => {
			let currentPulse = 0;
			let fadingIn = true;

			const interval = setInterval(() => {
				stdout.cursorTo(0);
				stdout.clearLine(1);

				const intensity = fadingIn ? "bold" : "dim";
				const coloredText = (chalk[color] as any)[intensity](text);
				stdout.write(coloredText);

				if (fadingIn) {
					fadingIn = false;
				} else {
					fadingIn = true;
					currentPulse++;
				}

				if (currentPulse >= pulses) {
					clearInterval(interval);
					stdout.cursorTo(0);
					stdout.clearLine(1);
					stdout.write(text);
					resolve();
				}
			}, pulseInterval);
		});
	}

	/**
	 * Create rainbow text effect
	 */
	public rainbow(text: string): string {
		const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"] as const;
		let result = "";

		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const colorIndex = i % colors.length;
			const colorFunc = chalk[colors[colorIndex]];
			result += colorFunc(char);
		}

		return result;
	}

	/**
	 * Create wave animation
	 */
	public async wave(
		text: string,
		options: { duration?: number; height?: number } = {},
	): Promise<void> {
		const { duration = 3000, height = 3 } = options;
		const startTime = Date.now();

		return new Promise((resolve) => {
			const interval = setInterval(() => {
				stdout.cursorTo(0);
				stdout.clearLine(1);

				const elapsed = Date.now() - startTime;
				const progress = (elapsed / duration) * Math.PI * 2;

				let waveText = "";
				for (let i = 0; i < text.length; i++) {
					const char = text[i];
					const waveOffset = Math.sin(progress + i * 0.5) * height;
					const colorIntensity = Math.abs(waveOffset) / height;
					
					const color = colorIntensity > 0.7 ? "cyan" : 
								  colorIntensity > 0.4 ? "blue" : "gray";
					
					waveText += chalk[color](char);
				}

				stdout.write(waveText);

				if (elapsed >= duration) {
					clearInterval(interval);
					stdout.cursorTo(0);
					stdout.clearLine(1);
					stdout.write(text);
					resolve();
				}
			}, 50);
		});
	}

	/**
	 * Create interactive menu
	 */
	public async interactiveMenu(
		title: string,
		choices: Array<{ label: string; value: string; description?: string }>,
		options: { multiSelect?: boolean; defaultIndex?: number } = {},
	): Promise<string | string[]> {
		const { multiSelect = false, defaultIndex = 0 } = options;

		this.enableRawMode();

		return new Promise((resolve) => {
			let selectedIndex = defaultIndex;
			let selectedItems: Set<number> = new Set();

			const renderMenu = () => {
				// Clear screen
				stdout.write("\u001B[2J\u001B[H");

				// Title
				console.log(chalk.cyan.bold(title));
				console.log("");

				// Render choices
				for (let i = 0; i < choices.length; i++) {
					const choice = choices[i];
					const isSelected = i === selectedIndex;
					const isChecked = selectedItems.has(i);

					let prefix = "  ";
					if (multiSelect) {
						prefix = isChecked ? chalk.green("✓ ") : "  ";
					}

					if (isSelected) {
						const arrow = chalk.cyan("❯ ");
						const label = chalk.cyan.bold(choice.label);
						console.log(`${arrow}${prefix}${label}`);
						
						if (choice.description) {
							console.log(`    ${chalk.gray(choice.description)}`);
						}
					} else {
						const label = chalk.white(choice.label);
						console.log(`  ${prefix}${label}`);
						
						if (choice.description && i === selectedIndex) {
							console.log(`    ${chalk.gray(choice.description)}`);
						}
					}
				}

				// Instructions
				console.log("");
				if (multiSelect) {
					console.log(chalk.gray("Use ↑↓ to navigate, SPACE to select, ENTER to confirm"));
				} else {
					console.log(chalk.gray("Use ↑↓ to navigate, ENTER to select"));
				}
			};

			const onKeyPress = (chunk: Buffer) => {
				const key = chunk.toString();

				switch (key) {
					case "\u001b[A": // Up arrow
						selectedIndex = Math.max(0, selectedIndex - 1);
						renderMenu();
						break;

					case "\u001b[B": // Down arrow
						selectedIndex = Math.min(choices.length - 1, selectedIndex + 1);
						renderMenu();
						break;

					case " ": // Space (for multi-select)
						if (multiSelect) {
							if (selectedItems.has(selectedIndex)) {
								selectedItems.delete(selectedIndex);
							} else {
								selectedItems.add(selectedIndex);
							}
							renderMenu();
						}
						break;

					case "\r": // Enter
					case "\n":
						this.disableRawMode();
						stdin.removeListener("data", onKeyPress);

						if (multiSelect) {
							const results = Array.from(selectedItems).map(i => choices[i].value);
							resolve(results);
						} else {
							resolve(choices[selectedIndex].value);
						}
						break;

					case "\u0003": // Ctrl+C
						this.disableRawMode();
						stdin.removeListener("data", onKeyPress);
						process.exit(0);
						break;
				}
			};

			stdin.on("data", onKeyPress);
			renderMenu();
		});
	}

	/**
	 * Create notification system
	 */
	public notification(
		type: NotificationType,
		options: NotificationOptions,
	): string {
		const notificationId = Date.now().toString();
		
		// Store notification
		this.notifications.set(notificationId, options);

		// Create notification display
		const notification = this.createNotificationDisplay(type, options);
		
		// Display notification
		console.log(notification);

		// Handle auto-dismiss
		if (!options.persistent && options.timeout) {
			setTimeout(() => {
				this.dismissNotification(notificationId);
			}, options.timeout);
		}

		return notificationId;
	}

	/**
	 * Dismiss notification
	 */
	public dismissNotification(notificationId: string): void {
		this.notifications.delete(notificationId);
	}

	/**
	 * Create loading animation with custom spinner
	 */
	public createLoadingAnimation(
		text: string,
		spinnerType: string = "dots",
	): Spinner {
		return new Spinner({
			text,
			spinner: spinnerType,
			color: "cyan",
		});
	}

	/**
	 * Create countdown timer
	 */
	public async countdown(
		seconds: number,
		options: { message?: string; onTick?: (remaining: number) => void } = {},
	): Promise<void> {
		const { message = "Starting in", onTick } = options;

		return new Promise((resolve) => {
			let remaining = seconds;

			const interval = setInterval(() => {
				stdout.cursorTo(0);
				stdout.clearLine(1);
				
				const countdownText = `${message} ${chalk.cyan.bold(remaining)}s`;
				stdout.write(countdownText);

				if (onTick) {
					onTick(remaining);
				}

				remaining--;

				if (remaining < 0) {
					clearInterval(interval);
					stdout.cursorTo(0);
					stdout.clearLine(1);
					resolve();
				}
			}, 1000);
		});
	}

	/**
	 * Cleanup resources
	 */
	public cleanup(): void {
		// Clear all animations
		for (const [id, timeout] of this.animations) {
			clearTimeout(timeout);
		}
		this.animations.clear();

		// Disable raw mode
		this.disableRawMode();

		// Show cursor
		stdout.write("\u001B[?25h");
	}

	// Private helper methods

	private async animate(
		content: string,
		type: AnimationType,
		options: AnimationOptions,
	): Promise<void> {
		switch (type) {
			case AnimationType.FADE_IN:
				return this.animateFadeIn(content, options);
			case AnimationType.TYPEWRITER:
				return this.typewriter(content, { speed: options.speed || 50 });
			case AnimationType.PULSE:
				return this.pulse(content, { duration: options.duration || 2000 });
			case AnimationType.WAVE:
				return this.wave(content, { duration: options.duration || 3000 });
			case AnimationType.MATRIX:
				return this.matrixRain(options.duration || 3000);
			default:
				console.log(content);
		}
	}

	private async animateFadeIn(
		content: string,
		options: AnimationOptions,
	): Promise<void> {
		const { duration = 1000 } = options;
		const steps = 10;
		const stepDuration = duration / steps;

		return new Promise((resolve) => {
			let step = 0;

			const interval = setInterval(() => {
				stdout.cursorTo(0);
				stdout.clearLine(1);

				const opacity = step / steps;
				const dimmedContent = opacity < 0.5 
					? chalk.gray.dim(content)
					: opacity < 0.8
					? chalk.gray(content)
					: content;

				stdout.write(dimmedContent);

				step++;

				if (step > steps) {
					clearInterval(interval);
					stdout.cursorTo(0);
					stdout.clearLine(1);
					stdout.write(content);
					resolve();
				}
			}, stepDuration);
		});
	}

	private generateASCIIArt(text: string, font: string): string {
		// Simplified ASCII art generation
		// In a real implementation, this would use a proper ASCII art library
		const lines = [];
		
		switch (font) {
			case "big":
				lines.push(`  ${text.split("").join("   ")}  `);
				lines.push(`╔═${"═".repeat(text.length * 4 - 1)}═╗`);
				lines.push(`║ ${text.split("").join(" │ ")} ║`);
				lines.push(`╚═${"═".repeat(text.length * 4 - 1)}═╝`);
				break;
			
			case "block":
				lines.push(`██${"██".repeat(text.length)}██`);
				lines.push(`██ ${text} ██`);
				lines.push(`██${"██".repeat(text.length)}██`);
				break;
				
			default:
				lines.push(text);
		}

		return lines.join("\n");
	}

	private applyGradient(text: string, startColor: string, endColor: string): string {
		// Simplified gradient application
		const lines = text.split("\n");
		return lines.map((line, index) => {
			const ratio = index / (lines.length - 1);
			return ratio < 0.5 ? chalk[startColor as keyof typeof chalk](line) : chalk[endColor as keyof typeof chalk](line);
		}).join("\n");
	}

	private createNotificationDisplay(
		type: NotificationType,
		options: NotificationOptions,
	): string {
		let icon = options.icon || "";
		let color: keyof typeof chalk = "white";

		if (!icon) {
			switch (type) {
				case NotificationType.SUCCESS:
					icon = "✓";
					color = "green";
					break;
				case NotificationType.ERROR:
					icon = "✗";
					color = "red";
					break;
				case NotificationType.WARNING:
					icon = "⚠";
					color = "yellow";
					break;
				case NotificationType.INFO:
					icon = "ℹ";
					color = "blue";
					break;
				case NotificationType.LOADING:
					icon = "⋯";
					color = "cyan";
					break;
			}
		}

		const formattedIcon = chalk[color](icon);
		const formattedTitle = chalk[color].bold(options.title);
		
		let notification = `${formattedIcon} ${formattedTitle}`;
		
		if (options.message) {
			notification += `\n  ${chalk.gray(options.message)}`;
		}

		return this.formatter.box(notification, {
			padding: 1,
			style: "rounded",
		});
	}
}

/**
 * Default export
 */
export default InteractiveCLIOutput;