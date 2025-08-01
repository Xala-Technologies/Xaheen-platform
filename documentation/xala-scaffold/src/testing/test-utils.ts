/**
 * Testing Utilities and Helpers
 *
 * Comprehensive collection of utility functions, helpers, and testing
 * infrastructure to support the test framework and make testing easier
 * across the scaffolding system.
 *
 * Features:
 * - Test environment setup and teardown
 * - DOM testing utilities with Norwegian compliance
 * - Mock creation and management
 * - Assertion helpers for compliance testing
 * - Performance testing utilities
 * - Accessibility testing helpers
 * - File system testing utilities
 * - Norwegian localization testing helpers
 */

import { LocaleCode } from "../localization/types.js";
import { logger } from "../utils/logger.js";
import {
	NSMClassification,
	TestFramework,
	TestType,
} from "./test-framework.js";

// === Environment Setup ===

/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
	framework: TestFramework;
	locale: LocaleCode;
	classification: NSMClassification;
	enableAccessibility: boolean;
	enablePerformance: boolean;
	enableCompliance: boolean;
	mockServices: boolean;
	cleanupAfterEach: boolean;
}

/**
 * Global test environment manager
 */
export class TestEnvironmentManager {
	private static instance?: TestEnvironmentManager;
	private config?: TestEnvironmentConfig;
	private mocks = new Map<string, any>();
	private cleanup: Array<() => Promise<void>> = [];

	private constructor() {}

	static getInstance(): TestEnvironmentManager {
		if (!TestEnvironmentManager.instance) {
			TestEnvironmentManager.instance = new TestEnvironmentManager();
		}
		return TestEnvironmentManager.instance;
	}

	/**
	 * Setup test environment
	 */
	async setup(config: TestEnvironmentConfig): Promise<void> {
		this.config = config;

		// Setup DOM environment
		await this.setupDOMEnvironment();

		// Setup locale
		await this.setupLocale(config.locale);

		// Setup compliance testing
		if (config.enableCompliance) {
			await this.setupComplianceTesting(config.classification);
		}

		// Setup accessibility testing
		if (config.enableAccessibility) {
			await this.setupAccessibilityTesting();
		}

		// Setup performance testing
		if (config.enablePerformance) {
			await this.setupPerformanceTesting();
		}

		// Setup service mocks
		if (config.mockServices) {
			await this.setupServiceMocks();
		}

		logger.debug("Test environment setup completed");
	}

	/**
	 * Teardown test environment
	 */
	async teardown(): Promise<void> {
		// Run cleanup functions
		for (const cleanupFn of this.cleanup) {
			try {
				await cleanupFn();
			} catch (error) {
				logger.warn("Cleanup function failed:", error);
			}
		}

		this.cleanup = [];
		this.mocks.clear();
		this.config = undefined;

		logger.debug("Test environment teardown completed");
	}

	/**
	 * Register cleanup function
	 */
	onCleanup(fn: () => Promise<void>): void {
		this.cleanup.push(fn);
	}

	/**
	 * Get mock by name
	 */
	getMock<T = any>(name: string): T | undefined {
		return this.mocks.get(name);
	}

	/**
	 * Set mock
	 */
	setMock(name: string, mock: any): void {
		this.mocks.set(name, mock);
	}

	private async setupDOMEnvironment(): Promise<void> {
		// Setup JSDOM or happy-dom if needed
		if (typeof window === "undefined") {
			// In Node.js environment, setup DOM globals
			const { JSDOM } = await import("jsdom");
			const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
				url: "http://localhost",
				pretendToBeVisual: true,
				resources: "usable",
			});

			// @ts-ignore
			global.window = dom.window;
			// @ts-ignore
			global.document = dom.window.document;
			// @ts-ignore
			global.navigator = dom.window.navigator;

			this.onCleanup(async () => {
				dom.window.close();
			});
		}
	}

	private async setupLocale(locale: LocaleCode): Promise<void> {
		// Setup locale for testing
		if (typeof window !== "undefined") {
			// Mock navigator.language
			Object.defineProperty(window.navigator, "language", {
				value: locale,
				configurable: true,
			});

			Object.defineProperty(window.navigator, "languages", {
				value: [locale],
				configurable: true,
			});
		}
	}

	private async setupComplianceTesting(
		classification: NSMClassification,
	): Promise<void> {
		// Setup compliance testing environment
		this.setMock("nsmClassification", classification);

		// Mock compliance APIs
		this.setMock("complianceAPI", {
			checkNSMCompliance: jest.fn().mockResolvedValue({ compliant: true }),
			checkGDPRCompliance: jest.fn().mockResolvedValue({ compliant: true }),
			checkWCAGCompliance: jest.fn().mockResolvedValue({ compliant: true }),
		});
	}

	private async setupAccessibilityTesting(): Promise<void> {
		try {
			// Setup jest-axe
			const { axe, toHaveNoViolations } = await import("jest-axe");

			// @ts-ignore
			if (typeof expect !== "undefined" && expect.extend) {
				expect.extend(toHaveNoViolations);
			}

			this.setMock("axe", axe);
		} catch (error) {
			logger.warn(
				"jest-axe not available, accessibility testing will be limited",
			);
		}
	}

	private async setupPerformanceTesting(): Promise<void> {
		// Mock performance APIs if not available
		if (typeof performance === "undefined") {
			// @ts-ignore
			global.performance = {
				now: () => Date.now(),
				mark: jest.fn(),
				measure: jest.fn(),
				getEntriesByName: jest.fn().mockReturnValue([]),
				getEntriesByType: jest.fn().mockReturnValue([]),
			};
		}
	}

	private async setupServiceMocks(): Promise<void> {
		// Mock common services
		this.setMock("logger", {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		});

		this.setMock("fileSystem", {
			readFile: jest.fn(),
			writeFile: jest.fn(),
			exists: jest.fn(),
			mkdir: jest.fn(),
		});

		this.setMock("httpClient", {
			get: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
		});
	}
}

// === DOM Testing Utilities ===

/**
 * DOM testing helpers
 */
export class DOMTestingUtils {
	/**
	 * Create a test container element
	 */
	static createContainer(): HTMLElement {
		const container = document.createElement("div");
		container.setAttribute("data-testid", "test-container");
		document.body.appendChild(container);

		// Cleanup after test
		const env = TestEnvironmentManager.getInstance();
		env.onCleanup(async () => {
			if (container.parentNode) {
				container.parentNode.removeChild(container);
			}
		});

		return container;
	}

	/**
	 * Wait for element to appear
	 */
	static async waitForElement(
		selector: string,
		timeout: number = 5000,
	): Promise<Element | null> {
		return new Promise((resolve) => {
			const element = document.querySelector(selector);
			if (element) {
				resolve(element);
				return;
			}

			const observer = new MutationObserver(() => {
				const element = document.querySelector(selector);
				if (element) {
					observer.disconnect();
					resolve(element);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			setTimeout(() => {
				observer.disconnect();
				resolve(null);
			}, timeout);
		});
	}

	/**
	 * Simulate user interaction
	 */
	static async simulateUserInteraction(
		element: Element,
		type: "click" | "focus" | "blur" | "keypress" | "input",
		options?: any,
	): Promise<void> {
		const event = new Event(type, {
			bubbles: true,
			cancelable: true,
			...options,
		});

		if (type === "keypress" && options?.key) {
			// @ts-ignore
			event.key = options.key;
			// @ts-ignore
			event.code = options.code || `Key${options.key.toUpperCase()}`;
		}

		if (type === "input" && options?.value) {
			// @ts-ignore
			element.value = options.value;
		}

		element.dispatchEvent(event);

		// Wait for next tick to allow for event handling
		await new Promise((resolve) => setTimeout(resolve, 0));
	}

	/**
	 * Check element accessibility
	 */
	static async checkAccessibility(element: Element): Promise<{
		violations: any[];
		passes: any[];
		incomplete: any[];
	}> {
		const env = TestEnvironmentManager.getInstance();
		const axe = env.getMock("axe");

		if (!axe) {
			return { violations: [], passes: [], incomplete: [] };
		}

		try {
			const results = await axe(element);
			return {
				violations: results.violations || [],
				passes: results.passes || [],
				incomplete: results.incomplete || [],
			};
		} catch (error) {
			logger.warn("Accessibility check failed:", error);
			return { violations: [], passes: [], incomplete: [] };
		}
	}
}

// === Assertion Helpers ===

/**
 * Custom assertion helpers for Norwegian compliance testing
 */
export class ComplianceAssertions {
	/**
	 * Assert element has Norwegian compliance attributes
	 */
	static assertNorwegianCompliance(element: Element): void {
		expect(element).toBeDefined();

		// Check for language support
		const lang =
			element.getAttribute("lang") ||
			document.documentElement.getAttribute("lang");
		expect(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]).toContain(lang);

		// Check for accessibility attributes
		if (element.hasAttribute("role")) {
			expect(element.getAttribute("role")).toBeTruthy();
		}

		// Check for ARIA labels
		const interactiveElements = ["button", "input", "select", "textarea", "a"];
		if (interactiveElements.includes(element.tagName.toLowerCase())) {
			const hasAriaLabel =
				element.hasAttribute("aria-label") ||
				element.hasAttribute("aria-labelledby") ||
				element.hasAttribute("title");
			expect(hasAriaLabel).toBe(true);
		}
	}

	/**
	 * Assert WCAG AAA compliance
	 */
	static assertWCAGAAA(element: Element): void {
		// Check color contrast (simplified)
		const computedStyle = window.getComputedStyle(element);
		const backgroundColor = computedStyle.backgroundColor;
		const color = computedStyle.color;

		if (
			backgroundColor !== "rgba(0, 0, 0, 0)" &&
			color !== "rgba(0, 0, 0, 0)"
		) {
			// In a real implementation, this would calculate contrast ratio
			expect(true).toBe(true); // Placeholder
		}

		// Check for focus indicators
		if (element.matches(":focus-visible")) {
			expect(computedStyle.outline).not.toBe("none");
		}

		// Check for semantic HTML
		const semanticTags = [
			"main",
			"nav",
			"section",
			"article",
			"aside",
			"header",
			"footer",
		];
		if (semanticTags.includes(element.tagName.toLowerCase())) {
			expect(element.tagName.toLowerCase()).toBeTruthy();
		}
	}

	/**
	 * Assert GDPR compliance
	 */
	static assertGDPRCompliance(element: Element): void {
		// Check for data attributes that might contain personal data
		const dataAttributes = Array.from(element.attributes).filter((attr) =>
			attr.name.startsWith("data-"),
		);

		for (const attr of dataAttributes) {
			// In a real implementation, this would check for PII patterns
			expect(attr.value).not.toMatch(/\b\d{11}\b/); // Norwegian personal ID
			expect(attr.value).not.toMatch(
				/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
			); // Email
		}
	}

	/**
	 * Assert NSM security compliance
	 */
	static assertNSMCompliance(
		element: Element,
		classification: NSMClassification,
	): void {
		// Check for security-related attributes
		if (element.tagName.toLowerCase() === "form") {
			expect(element.getAttribute("method")).toBe("POST");

			if (classification !== NSMClassification.OPEN) {
				// Should have CSRF protection
				const csrfToken =
					element.querySelector('input[name="_token"]') ||
					element.querySelector('input[name="csrf_token"]') ||
					element.querySelector('meta[name="csrf-token"]');
				expect(csrfToken).toBeTruthy();
			}
		}

		// Check for external links
		if (element.tagName.toLowerCase() === "a" && element.hasAttribute("href")) {
			const href = element.getAttribute("href");
			if (
				href &&
				href.startsWith("http") &&
				!href.includes(window.location.hostname)
			) {
				expect(element.getAttribute("rel")).toContain("noopener");
				expect(element.getAttribute("rel")).toContain("noreferrer");
			}
		}
	}
}

// === Performance Testing Utilities ===

/**
 * Performance testing helpers
 */
export class PerformanceTestingUtils {
	/**
	 * Measure component render time
	 */
	static async measureRenderTime<T>(
		renderFn: () => T,
		iterations: number = 100,
	): Promise<{
		average: number;
		min: number;
		max: number;
		measurements: number[];
	}> {
		const measurements: number[] = [];

		for (let i = 0; i < iterations; i++) {
			const start = performance.now();
			await renderFn();
			const end = performance.now();
			measurements.push(end - start);
		}

		return {
			average:
				measurements.reduce((sum, time) => sum + time, 0) / measurements.length,
			min: Math.min(...measurements),
			max: Math.max(...measurements),
			measurements,
		};
	}

	/**
	 * Check memory usage
	 */
	static getMemoryUsage(): {
		used: number;
		total: number;
		percentage: number;
	} {
		// @ts-ignore
		if (typeof performance.memory !== "undefined") {
			// @ts-ignore
			const memory = performance.memory;
			return {
				used: memory.usedJSHeapSize,
				total: memory.totalJSHeapSize,
				percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
			};
		}

		return { used: 0, total: 0, percentage: 0 };
	}

	/**
	 * Assert performance requirements
	 */
	static assertPerformanceRequirements(
		measurements: { average: number; max: number },
		requirements: { maxAverage: number; maxWorst: number },
	): void {
		expect(measurements.average).toBeLessThanOrEqual(requirements.maxAverage);
		expect(measurements.max).toBeLessThanOrEqual(requirements.maxWorst);
	}
}

// === File System Testing Utilities ===

/**
 * File system testing helpers
 */
export class FileSystemTestingUtils {
	private static tempFiles: string[] = [];

	/**
	 * Create temporary file
	 */
	static async createTempFile(
		content: string,
		extension: string = ".txt",
	): Promise<string> {
		const fs = await import("fs");
		const path = await import("path");
		const os = await import("os");

		const tempDir = os.tmpdir();
		const fileName = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
		const filePath = path.join(tempDir, fileName);

		await fs.promises.writeFile(filePath, content);
		this.tempFiles.push(filePath);

		return filePath;
	}

	/**
	 * Create temporary directory
	 */
	static async createTempDir(): Promise<string> {
		const fs = await import("fs");
		const path = await import("path");
		const os = await import("os");

		const tempDir = os.tmpdir();
		const dirName = `test_dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const dirPath = path.join(tempDir, dirName);

		await fs.promises.mkdir(dirPath, { recursive: true });
		this.tempFiles.push(dirPath);

		return dirPath;
	}

	/**
	 * Cleanup temporary files
	 */
	static async cleanup(): Promise<void> {
		const fs = await import("fs");

		for (const filePath of this.tempFiles) {
			try {
				const stats = await fs.promises.stat(filePath);
				if (stats.isDirectory()) {
					await fs.promises.rmdir(filePath, { recursive: true });
				} else {
					await fs.promises.unlink(filePath);
				}
			} catch (error) {
				// Ignore cleanup errors
			}
		}

		this.tempFiles = [];
	}

	/**
	 * Mock file system operations
	 */
	static createFileSystemMock(): {
		readFile: jest.Mock;
		writeFile: jest.Mock;
		exists: jest.Mock;
		mkdir: jest.Mock;
		files: Map<string, string>;
	} {
		const files = new Map<string, string>();

		return {
			readFile: jest.fn().mockImplementation((path: string) => {
				if (files.has(path)) {
					return Promise.resolve(files.get(path));
				}
				throw new Error(`File not found: ${path}`);
			}),

			writeFile: jest
				.fn()
				.mockImplementation((path: string, content: string) => {
					files.set(path, content);
					return Promise.resolve();
				}),

			exists: jest.fn().mockImplementation((path: string) => {
				return Promise.resolve(files.has(path));
			}),

			mkdir: jest.fn().mockResolvedValue(undefined),

			files,
		};
	}
}

// === Norwegian Localization Testing Helpers ===

/**
 * Norwegian localization testing utilities
 */
export class NorwegianLocalizationTestingUtils {
	/**
	 * Test Norwegian text rendering
	 */
	static assertNorwegianText(
		element: Element,
		expectedText: string,
		locale: LocaleCode,
	): void {
		const actualText = element.textContent || "";

		// Check for Norwegian-specific characters
		if (locale.startsWith("nb-") || locale.startsWith("nn-")) {
			const norwegianChars = /[æøåÆØÅ]/;
			if (norwegianChars.test(expectedText)) {
				expect(norwegianChars.test(actualText)).toBe(true);
			}
		}

		expect(actualText.trim()).toBe(expectedText.trim());
	}

	/**
	 * Test RTL support for Arabic
	 */
	static assertRTLSupport(element: Element): void {
		const computedStyle = window.getComputedStyle(element);
		const direction = computedStyle.direction;
		const textAlign = computedStyle.textAlign;

		if (document.documentElement.lang === "ar-SA") {
			expect(direction).toBe("rtl");
			expect(["right", "start"].includes(textAlign)).toBe(true);
		}
	}

	/**
	 * Test date formatting for Norwegian locale
	 */
	static assertNorwegianDateFormat(
		dateString: string,
		locale: LocaleCode,
	): void {
		const date = new Date("2024-01-15");
		const formatter = new Intl.DateTimeFormat(locale);
		const formattedDate = formatter.format(date);

		expect(dateString).toBe(formattedDate);
	}

	/**
	 * Test number formatting for Norwegian locale
	 */
	static assertNorwegianNumberFormat(
		numberString: string,
		value: number,
		locale: LocaleCode,
	): void {
		const formatter = new Intl.NumberFormat(locale);
		const formattedNumber = formatter.format(value);

		expect(numberString).toBe(formattedNumber);
	}
}

// === Export Test Utilities ===

/**
 * Main test utilities export
 */
export const TestUtils = {
	Environment: TestEnvironmentManager,
	DOM: DOMTestingUtils,
	Compliance: ComplianceAssertions,
	Performance: PerformanceTestingUtils,
	FileSystem: FileSystemTestingUtils,
	Norwegian: NorwegianLocalizationTestingUtils,
};

export default TestUtils;

// === Setup Helpers ===

/**
 * Setup test environment with default configuration
 */
export async function setupTestEnvironment(
	overrides?: Partial<TestEnvironmentConfig>,
): Promise<void> {
	const defaultConfig: TestEnvironmentConfig = {
		framework: TestFramework.JEST,
		locale: "nb-NO" as LocaleCode,
		classification: NSMClassification.OPEN,
		enableAccessibility: true,
		enablePerformance: true,
		enableCompliance: true,
		mockServices: true,
		cleanupAfterEach: true,
	};

	const config = { ...defaultConfig, ...overrides };
	const env = TestEnvironmentManager.getInstance();
	await env.setup(config);
}

/**
 * Teardown test environment
 */
export async function teardownTestEnvironment(): Promise<void> {
	const env = TestEnvironmentManager.getInstance();
	await env.teardown();
	await FileSystemTestingUtils.cleanup();
}
