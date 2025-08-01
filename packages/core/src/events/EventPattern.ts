import type { IEventPattern } from "./interfaces";

/**
 * Event pattern implementation for wildcard matching
 */
export class EventPattern implements IEventPattern {
	private regex: RegExp;

	constructor(public readonly pattern: string) {
		// Convert wildcard pattern to regex
		// * matches any sequence of characters except dots
		// ** matches any sequence of characters including dots
		const regexPattern = pattern
			.split(".")
			.map((part) => {
				if (part === "**") {
					return ".*"; // Match anything including dots
				} else if (part === "*") {
					return "[^.]+"; // Match anything except dots
				} else {
					// Escape special regex characters
					return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				}
			})
			.join("\\.");

		this.regex = new RegExp(`^${regexPattern}$`);
	}

	/**
	 * Test if an event matches this pattern
	 */
	matches(event: string): boolean {
		return this.regex.test(event);
	}

	/**
	 * Create a pattern from a string
	 */
	static from(pattern: string): EventPattern {
		return new EventPattern(pattern);
	}

	/**
	 * Common patterns
	 */
	static readonly ALL = new EventPattern("**");
	static readonly NONE = new EventPattern("");
}

/**
 * Event pattern matcher for managing multiple patterns
 */
export class EventPatternMatcher {
	private patterns: EventPattern[] = [];

	/**
	 * Add a pattern
	 */
	add(pattern: string | EventPattern): void {
		if (typeof pattern === "string") {
			this.patterns.push(new EventPattern(pattern));
		} else {
			this.patterns.push(pattern);
		}
	}

	/**
	 * Remove a pattern
	 */
	remove(pattern: string | EventPattern): void {
		const patternStr = typeof pattern === "string" ? pattern : pattern.pattern;
		this.patterns = this.patterns.filter((p) => p.pattern !== patternStr);
	}

	/**
	 * Check if any pattern matches the event
	 */
	matches(event: string): boolean {
		return this.patterns.some((pattern) => pattern.matches(event));
	}

	/**
	 * Get all patterns that match the event
	 */
	getMatchingPatterns(event: string): EventPattern[] {
		return this.patterns.filter((pattern) => pattern.matches(event));
	}

	/**
	 * Clear all patterns
	 */
	clear(): void {
		this.patterns = [];
	}

	/**
	 * Get all patterns
	 */
	getPatterns(): EventPattern[] {
		return [...this.patterns];
	}
}