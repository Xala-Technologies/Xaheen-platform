/**
 * Progress Indicator System for Xaheen CLI
 * Provides rich progress bars, spinners, and visual feedback
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * Progress bar style options
 */
export interface ProgressBarOptions {
	readonly total: number;
	readonly width?: number;
	readonly complete?: string;
	readonly incomplete?: string;
	readonly clear?: boolean;
	readonly renderThrottle?: number;
	readonly format?: string;
	readonly stream?: NodeJS.WriteStream;
	readonly head?: string;
	readonly callback?: (progress: ProgressBar) => void;
}

/**
 * Spinner options
 */
export interface SpinnerOptions {
	readonly text?: string;
	readonly spinner?: string | SpinnerDefinition;
	readonly color?: keyof typeof chalk;
	readonly hideCursor?: boolean;
	readonly interval?: number;
	readonly stream?: NodeJS.WriteStream;
	readonly prefixText?: string;
	readonly suffixText?: string;
}

/**
 * Spinner definition
 */
export interface SpinnerDefinition {
	readonly interval: number;
	readonly frames: readonly string[];
}

/**
 * Multi-progress options
 */
export interface MultiProgressOptions {
	readonly clear?: boolean;
	readonly autopadding?: boolean;
	readonly stream?: NodeJS.WriteStream;
	readonly formatBar?: (options: any, params: any, payload: any) => string;
}

/**
 * Progress event data
 */
export interface ProgressEventData {
	readonly current: number;
	readonly total: number;
	readonly percentage: number;
	readonly eta: number;
	readonly rate: number;
	readonly duration: number;
}

/**
 * Progress bar implementation
 */
export class ProgressBar extends EventEmitter {
	private readonly options: Required<ProgressBarOptions>;
	private current = 0;
	private readonly startTime = Date.now();
	private lastRenderTime = 0;
	private readonly stream: NodeJS.WriteStream;
	private isComplete = false;

	constructor(options: ProgressBarOptions) {
		super();
		
		this.options = {
			total: options.total,
			width: options.width || 40,
			complete: options.complete || "█",
			incomplete: options.incomplete || "░",
			clear: options.clear || false,
			renderThrottle: options.renderThrottle || 16,
			format: options.format || ":bar :percent :eta",
			stream: options.stream || process.stderr,
			head: options.head || "",
			callback: options.callback || (() => {}),
		};

		this.stream = this.options.stream;
	}

	/**
	 * Update progress
	 */
	public tick(delta: number = 1, tokens: Record<string, any> = {}): void {
		if (this.isComplete) {
			return;
		}

		this.current = Math.min(this.current + delta, this.options.total);

		// Throttle rendering
		const now = Date.now();
		if (now - this.lastRenderTime < this.options.renderThrottle && this.current < this.options.total) {
			return;
		}

		this.lastRenderTime = now;
		this.render(tokens);

		if (this.current >= this.options.total) {
			this.complete();
		}
	}

	/**
	 * Update progress to specific value
	 */
	public update(current: number, tokens: Record<string, any> = {}): void {
		if (this.isComplete) {
			return;
		}

		this.current = Math.min(current, this.options.total);
		this.render(tokens);

		if (this.current >= this.options.total) {
			this.complete();
		}
	}

	/**
	 * Complete progress bar
	 */
	public complete(): void {
		if (this.isComplete) {
			return;
		}

		this.isComplete = true;
		this.current = this.options.total;
		this.render();

		if (this.options.clear) {
			this.stream.cursorTo(0);
			this.stream.clearLine(1);
		} else {
			this.stream.write("\n");
		}

		this.options.callback(this);
		this.emit("complete");
	}

	/**
	 * Terminate progress bar
	 */
	public terminate(): void {
		if (this.options.clear) {
			this.stream.cursorTo(0);
			this.stream.clearLine(1);
		}
		this.isComplete = true;
	}

	/**
	 * Render progress bar
	 */
	private render(tokens: Record<string, any> = {}): void {
		const ratio = this.current / this.options.total;
		const percentage = Math.floor(ratio * 100);
		const duration = Date.now() - this.startTime;
		const rate = this.current / (duration / 1000) || 0;
		const eta = rate > 0 ? Math.ceil((this.options.total - this.current) / rate) : 0;

		// Build progress bar
		const completeLength = Math.floor(this.options.width * ratio);
		const incompleteLength = this.options.width - completeLength;
		
		const complete = this.options.complete.repeat(completeLength);
		const incomplete = this.options.incomplete.repeat(incompleteLength);
		const bar = complete + incomplete;

		// Format string tokens
		const formatTokens = {
			...tokens,
			bar: chalk.cyan(bar),
			current: this.current,
			total: this.options.total,
			percent: `${percentage}%`,
			percentage,
			eta: this.formatTime(eta),
			rate: rate.toFixed(1),
			duration: this.formatTime(duration / 1000),
		};

		let formatted = this.options.format;
		for (const [key, value] of Object.entries(formatTokens)) {
			formatted = formatted.replace(new RegExp(`:${key}`, "g"), String(value));
		}

		// Write to stream
		this.stream.cursorTo(0);
		this.stream.write(formatted);
		this.stream.clearLine(1);

		// Emit progress event
		const eventData: ProgressEventData = {
			current: this.current,
			total: this.options.total,
			percentage,
			eta,
			rate,
			duration: duration / 1000,
		};

		this.emit("progress", eventData);
	}

	/**
	 * Format time in seconds to human readable
	 */
	private formatTime(seconds: number): string {
		if (seconds < 60) {
			return `${Math.floor(seconds)}s`;
		}
		
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		
		if (minutes < 60) {
			return `${minutes}m${Math.floor(remainingSeconds)}s`;
		}
		
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		
		return `${hours}h${remainingMinutes}m`;
	}
}

/**
 * Spinner implementation
 */
export class Spinner extends EventEmitter {
	private readonly options: Required<SpinnerOptions>;
	private interval: NodeJS.Timeout | null = null;
	private currentFrame = 0;
	private readonly stream: NodeJS.WriteStream;
	private isSpinning = false;

	// Predefined spinner definitions
	private static readonly spinners: Record<string, SpinnerDefinition> = {
		dots: { interval: 80, frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] },
		dots2: { interval: 80, frames: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"] },
		dots3: { interval: 80, frames: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"] },
		line: { interval: 130, frames: ["-", "\\", "|", "/"] },
		pipe: { interval: 100, frames: ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"] },
		simpleDots: { interval: 400, frames: [".  ", ".. ", "...", "   "] },
		simpleDotsScrolling: { interval: 200, frames: [".  ", ".. ", "...", " ..", "  .", "   "] },
		star: { interval: 70, frames: ["✶", "✸", "✹", "✺", "✹", "✷"] },
		star2: { interval: 80, frames: ["+", "x", "*"] },
		flip: { interval: 70, frames: ["_", "_", "_", "-", "`", "`", "'", "´", "-", "_", "_", "_"] },
		hamburger: { interval: 100, frames: ["☱", "☲", "☴"] },
		growVertical: { interval: 120, frames: ["▁", "▃", "▄", "▅", "▆", "▇", "▆", "▅", "▄", "▃"] },
		growHorizontal: { interval: 120, frames: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "▊", "▋", "▌", "▍", "▎"] },
		balloon: { interval: 140, frames: [" ", ".", "o", "O", "@", "*", " "] },
		balloon2: { interval: 120, frames: [".", "o", "O", "°", "O", "o", "."] },
		noise: { interval: 100, frames: ["▓", "▒", "░"] },
		bounce: { interval: 120, frames: ["⠁", "⠂", "⠄", "⠂"] },
		boxBounce: { interval: 120, frames: ["▖", "▘", "▝", "▗"] },
		boxBounce2: { interval: 100, frames: ["▌", "▀", "▐", "▄"] },
		triangle: { interval: 50, frames: ["◢", "◣", "◤", "◥"] },
		arc: { interval: 100, frames: ["◜", "◠", "◝", "◞", "◡", "◟"] },
		circle: { interval: 120, frames: ["◡", "⊙", "◠"] },
		squareCorners: { interval: 180, frames: ["◰", "◳", "◲", "◱"] },
		circleQuarters: { interval: 120, frames: ["◴", "◷", "◶", "◵"] },
		circleHalves: { interval: 50, frames: ["◐", "◓", "◑", "◒"] },
		squish: { interval: 100, frames: ["╫", "╪"] },
		toggle: { interval: 250, frames: ["⊶", "⊷"] },
		toggle2: { interval: 80, frames: ["▫", "▪"] },
		toggle3: { interval: 120, frames: ["□", "■"] },
		toggle4: { interval: 100, frames: ["■", "□", "▪", "▫"] },
		toggle5: { interval: 100, frames: ["▮", "▯"] },
		toggle6: { interval: 300, frames: ["ဝ", "၀"] },
		toggle7: { interval: 80, frames: ["⦾", "⦿"] },
		toggle8: { interval: 100, frames: ["◍", "◌"] },
		toggle9: { interval: 100, frames: ["◉", "◎"] },
		toggle10: { interval: 100, frames: ["㊂", "㊀", "㊁"] },
		toggle11: { interval: 50, frames: ["⧇", "⧆"] },
		toggle12: { interval: 120, frames: ["☗", "☖"] },
		toggle13: { interval: 80, frames: ["=", "*", "-"] },
		arrow: { interval: 100, frames: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"] },
		arrow2: { interval: 80, frames: ["⬆️ ", "↗️ ", "➡️ ", "↘️ ", "⬇️ ", "↙️ ", "⬅️ ", "↖️ "] },
		arrow3: { interval: 120, frames: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"] },
		bouncingBar: { interval: 80, frames: ["[    ]", "[=   ]", "[==  ]", "[=== ]", "[ ===]", "[  ==]", "[   =]", "[    ]", "[   =]", "[  ==]", "[ ===]", "[====]", "[=== ]", "[==  ]", "[=   ]"] },
		bouncingBall: { interval: 80, frames: ["( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)", "(    ● )", "(   ●  )", "(  ●   )", "( ●    )", "(●     )"] },
		smiley: { interval: 200, frames: ["😄 ", "😝 "] },
		monkey: { interval: 300, frames: ["🙈 ", "🙈 ", "🙉 ", "🙊 "] },
		hearts: { interval: 100, frames: ["💛 ", "💙 ", "💜 ", "💚 ", "❤️ "] },
		clock: { interval: 100, frames: ["🕐 ", "🕑 ", "🕒 ", "🕓 ", "🕔 ", "🕕 ", "🕖 ", "🕗 ", "🕘 ", "🕙 ", "🕚 "] },
		earth: { interval: 180, frames: ["🌍 ", "🌎 ", "🌏 "] },
		moon: { interval: 80, frames: ["🌑 ", "🌒 ", "🌓 ", "🌔 ", "🌕 ", "🌖 ", "🌗 ", "🌘 "] },
		runner: { interval: 140, frames: ["🚶 ", "🏃 "] },
		pong: { interval: 80, frames: ["▐⠂       ▌", "▐⠈       ▌", "▐ ⠂      ▌", "▐ ⠠      ▌", "▐  ⡀     ▌", "▐  ⠠     ▌", "▐   ⠂    ▌", "▐   ⠈    ▌", "▐    ⠂   ▌", "▐    ⠠   ▌", "▐     ⡀  ▌", "▐     ⠠  ▌", "▐      ⠂ ▌", "▐      ⠈ ▌", "▐       ⠂▌", "▐       ⠠▌", "▐       ⡀▌", "▐      ⠠ ▌", "▐      ⠂ ▌", "▐     ⠈  ▌", "▐     ⠂  ▌", "▐    ⠠   ▌", "▐    ⡀   ▌", "▐   ⠠    ▌", "▐   ⠂    ▌", "▐  ⠈     ▌", "▐  ⠂     ▌", "▐ ⠠      ▌", "▐ ⡀      ▌", "▐⠠       ▌"] },
		shark: { interval: 120, frames: ["▐|\\____________▌", "▐_|\\___________▌", "▐__|\\__________▌", "▐___|\\_________▌", "▐____|\\________▌", "▐_____|\\_______▌", "▐______|\\______▌", "▐_______|\\_____▌", "▐________|\\____▌", "▐_________|\\___▌", "▐__________|\\__▌", "▐___________|\\_▌", "▐____________|\\▌", "▐____________/|▌", "▐___________/|_▌", "▐__________/|__▌", "▐_________/|___▌", "▐________/|____▌", "▐_______/|_____▌", "▐______/|______▌", "▐_____/|_______▌", "▐____/|________▌", "▐___/|_________▌", "▐__/|__________▌", "▐_/|___________▌", "▐/|____________▌"] },
		dqpb: { interval: 100, frames: ["d", "q", "p", "b"] },
		weather: { interval: 100, frames: ["☀️ ", "☀️ ", "☀️ ", "🌤 ", "⛅️ ", "🌥 ", "☁️ ", "🌧 ", "⛈ ", "🌩 ", "🌨 ", "❄️ ", "💨 ", "💨 ", "💨 ", "🌪 ", "🌈 "] },
		christmas: { interval: 400, frames: ["🌲", "🎄"] }
	};

	constructor(options: SpinnerOptions = {}) {
		super();

		let spinnerDef: SpinnerDefinition;
		
		if (typeof options.spinner === "string") {
			spinnerDef = Spinner.spinners[options.spinner] || Spinner.spinners.dots;
		} else if (options.spinner) {
			spinnerDef = options.spinner;
		} else {
			spinnerDef = Spinner.spinners.dots;
		}

		this.options = {
			text: options.text || "",
			spinner: spinnerDef,
			color: options.color || "cyan",
			hideCursor: options.hideCursor !== false,
			interval: options.interval || spinnerDef.interval,
			stream: options.stream || process.stderr,
			prefixText: options.prefixText || "",
			suffixText: options.suffixText || "",
		};

		this.stream = this.options.stream;
	}

	/**
	 * Start spinner
	 */
	public start(text?: string): this {
		if (this.isSpinning) {
			return this;
		}

		if (text) {
			this.options.text = text;
		}

		this.isSpinning = true;

		if (this.options.hideCursor) {
			this.stream.write("\u001B[?25l"); // Hide cursor
		}

		this.interval = setInterval(() => {
			this.render();
		}, this.options.interval);

		this.emit("start");
		return this;
	}

	/**
	 * Stop spinner
	 */
	public stop(): this {
		if (!this.isSpinning) {
			return this;
		}

		this.isSpinning = false;

		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}

		this.stream.cursorTo(0);
		this.stream.clearLine(1);

		if (this.options.hideCursor) {
			this.stream.write("\u001B[?25h"); // Show cursor
		}

		this.emit("stop");
		return this;
	}

	/**
	 * Update spinner text
	 */
	public updateText(text: string): this {
		this.options.text = text;
		return this;
	}

	/**
	 * Succeed spinner with checkmark
	 */
	public succeed(text?: string): this {
		this.stopAndPersist(chalk.green("✓"), text);
		return this;
	}

	/**
	 * Fail spinner with cross
	 */
	public fail(text?: string): this {
		this.stopAndPersist(chalk.red("✗"), text);
		return this;
	}

	/**
	 * Warn spinner with warning symbol
	 */
	public warn(text?: string): this {
		this.stopAndPersist(chalk.yellow("⚠"), text);
		return this;
	}

	/**
	 * Info spinner with info symbol
	 */
	public info(text?: string): this {
		this.stopAndPersist(chalk.blue("ℹ"), text);
		return this;
	}

	/**
	 * Stop and persist with custom symbol
	 */
	public stopAndPersist(symbol?: string, text?: string): this {
		this.stop();

		const finalText = text || this.options.text;
		const finalSymbol = symbol || "";

		if (finalSymbol || finalText) {
			this.stream.write(
				`${this.options.prefixText}${finalSymbol} ${finalText}${this.options.suffixText}\n`,
			);
		}

		return this;
	}

	/**
	 * Render current frame
	 */
	private render(): void {
		const spinner = this.options.spinner as SpinnerDefinition;
		const frame = spinner.frames[this.currentFrame];
		
		const coloredFrame = chalk[this.options.color](frame);
		const output = `${this.options.prefixText}${coloredFrame} ${this.options.text}${this.options.suffixText}`;

		this.stream.cursorTo(0);
		this.stream.write(output);
		this.stream.clearLine(1);

		this.currentFrame = (this.currentFrame + 1) % spinner.frames.length;
	}
}

/**
 * Multi-progress manager for handling multiple progress bars
 */
export class MultiProgress extends EventEmitter {
	private readonly options: Required<MultiProgressOptions>;
	private readonly progressBars: ProgressBar[] = [];
	private readonly stream: NodeJS.WriteStream;

	constructor(options: MultiProgressOptions = {}) {
		super();

		this.options = {
			clear: options.clear !== false,
			autopadding: options.autopadding !== false,
			stream: options.stream || process.stderr,
			formatBar: options.formatBar || this.defaultFormatBar.bind(this),
		};

		this.stream = this.options.stream;
	}

	/**
	 * Create new progress bar
	 */
	public newBar(format: string, options: Omit<ProgressBarOptions, "format">): ProgressBar {
		const bar = new ProgressBar({
			...options,
			format,
			stream: this.stream,
		});

		this.progressBars.push(bar);
		
		bar.on("progress", () => {
			this.render();
		});

		return bar;
	}

	/**
	 * Remove progress bar
	 */
	public removeBar(bar: ProgressBar): void {
		const index = this.progressBars.indexOf(bar);
		if (index !== -1) {
			this.progressBars.splice(index, 1);
			this.render();
		}
	}

	/**
	 * Terminate all progress bars
	 */
	public terminate(): void {
		for (const bar of this.progressBars) {
			bar.terminate();
		}
		this.progressBars.length = 0;
	}

	/**
	 * Render all progress bars
	 */
	private render(): void {
		// Move cursor up to redraw all bars
		if (this.progressBars.length > 0) {
			this.stream.moveCursor(0, -this.progressBars.length);
		}

		// Render each bar
		for (const bar of this.progressBars) {
			// Re-render each bar (this is simplified - actual implementation would need more coordination)
		}
	}

	/**
	 * Default format bar function
	 */
	private defaultFormatBar(options: any, params: any, payload: any): string {
		return `:bar :percent :etas`;
	}
}

/**
 * Progress indicator factory
 */
export class ProgressIndicatorFactory {
	/**
	 * Create progress bar
	 */
	public static createProgressBar(options: ProgressBarOptions): ProgressBar {
		return new ProgressBar(options);
	}

	/**
	 * Create spinner
	 */
	public static createSpinner(options: SpinnerOptions = {}): Spinner {
		return new Spinner(options);
	}

	/**
	 * Create multi-progress manager
	 */
	public static createMultiProgress(options: MultiProgressOptions = {}): MultiProgress {
		return new MultiProgress(options);
	}

	/**
	 * Get available spinner types
	 */
	public static getAvailableSpinners(): readonly string[] {
		return Object.keys((Spinner as any).spinners);
	}

	/**
	 * Create quick progress bar for common tasks
	 */
	public static createQuickProgress(
		text: string,
		total: number,
		options: Partial<ProgressBarOptions> = {},
	): ProgressBar {
		return new ProgressBar({
			total,
			format: `${chalk.cyan(text)} :bar :percent :etas`,
			...options,
		});
	}

	/**
	 * Create quick spinner for common tasks
	 */
	public static createQuickSpinner(
		text: string,
		options: Partial<SpinnerOptions> = {},
	): Spinner {
		return new Spinner({
			text,
			spinner: "dots",
			...options,
		});
	}
}

/**
 * Default exports
 */
export { ProgressBar, Spinner, MultiProgress };
export default ProgressIndicatorFactory;