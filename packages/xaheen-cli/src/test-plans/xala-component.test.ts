/**
 * Xala Component Template Testing Suite
 *
 * Comprehensive tests for Xala specialized components including Norwegian compliance,
 * accessibility standards (WCAG AAA), GDPR compliance, and enterprise features.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TemplateLoader } from "../services/templates/template-loader.js";
import type { ProjectContext } from "../types/index.js";

describe("Xala Component Template Tests", () => {
	let templateLoader: TemplateLoader;

	// Test context for Xala components with Norwegian compliance
	const xalaContext: ProjectContext = {
		projectName: "XalaComplianceApp",
		projectPath: "/test/xala-project",
		framework: "next",
		packageManager: "bun",
		features: [
			"typescript",
			"tailwind",
			"accessibility",
			"internationalization",
		],

		// Norwegian Compliance Configuration
		norwegian: {
			altinn: true,
			bankid: true,
			vipps: true,
			language: "nb",
			region: "NO",
		},

		// Compliance Standards
		compliance: {
			gdpr: true,
			wcag: "AAA",
			iso27001: true,
			pci: false,
		},

		// Localization Configuration
		localization: {
			enabled: true,
			languages: ["nb", "en", "ar", "fr"],
			fallback: "en",
			rtl: true,
			regions: ["NO", "US", "AE", "FR"],
		},

		// Enterprise Features
		enterprise: {
			sso: true,
			audit: true,
			monitoring: true,
			multiTenant: true,
		},

		// UI/UX Configuration
		ui: {
			library: "xala-ui",
			theme: "adaptive",
			darkMode: true,
			colorScheme: "accessible",
		},

		// Integration Services
		integrations: {
			payments: ["vipps", "stripe"],
			authentication: ["bankid", "nextauth"],
			government: ["altinn"],
			communication: ["teams", "slack"],
		},
	};

	beforeEach(async () => {
		templateLoader = new TemplateLoader();
	});

	afterEach(async () => {
		// Cleanup if needed
	});

	describe("Core Xala Components", () => {
		it("should render xala-advanced.hbs correctly", async () => {
			const templatePath = "components/files/xala-advanced.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for advanced component patterns
			expect(result).toContain("xala-advanced");
			expect(result).toContain("export");

			// Check for accessibility features
			expect(result).toMatch(/aria-\w+/);
			expect(result).toMatch(/role=/);
			expect(result).toMatch(/tabIndex/);

			// Check for responsive design patterns
			expect(result).toContain("responsive");
			expect(result).toMatch(/md:|lg:|xl:/);

			// Check for theme support
			expect(result).toContain("theme");
			expect(result).toContain("dark:");
		});

		it("should render xala-error-boundary.hbs correctly", async () => {
			const templatePath = "components/files/xala-error-boundary.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for error boundary patterns
			expect(result).toContain("ErrorBoundary");
			expect(result).toContain("fallback");
			expect(result).toContain("error");
			expect(result).toContain("retry");

			// Check for accessibility in error states
			expect(result).toMatch(/aria-live/);
			expect(result).toMatch(/role="alert"/);

			// Check for localization support
			expect(result).toContain("t(");
			expect(result).toContain("translation");

			// Check for logging/monitoring integration
			expect(result).toContain("monitor");
			expect(result).toContain("log");
		});

		it("should render xala-test.hbs correctly", async () => {
			const templatePath = "components/files/xala-test.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for test component patterns
			expect(result).toContain("test");
			expect(result).toContain("data-testid");
			expect(result).toContain("aria-label");

			// Check for component testing utilities
			expect(result).toContain("render");
			expect(result).toContain("screen");
			expect(result).toContain("expect");

			// Check for accessibility testing
			expect(result).toContain("toBeAccessible");
			expect(result).toContain("axe");
		});

		it("should render xala-story.hbs correctly", async () => {
			const templatePath = "components/files/xala-story.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for Storybook patterns
			expect(result).toContain("Meta");
			expect(result).toContain("StoryObj");
			expect(result).toContain("export default");

			// Check for story variants
			expect(result).toContain("Default");
			expect(result).toContain("args:");
			expect(result).toContain("parameters:");

			// Check for accessibility addon integration
			expect(result).toContain("a11y");
			expect(result).toContain("accessibility");
		});
	});

	describe("Norwegian Compliance Components", () => {
		it("should render xala-display-norwegian.hbs correctly", async () => {
			const templatePath = "components/files/xala-display-norwegian.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for Norwegian-specific patterns
			expect(result).toContain("norwegian");
			expect(result).toContain("Norge");
			expect(result).toMatch(/nb|no-NO/);

			// Check for Norwegian service integrations
			expect(result).toMatch(/altinn|bankid|vipps/i);

			// Check for Norwegian date/number formatting
			expect(result).toContain("Intl.DateTimeFormat");
			expect(result).toContain("nb-NO");

			// Check for Norwegian accessibility standards
			expect(result).toContain("WCAG");
			expect(result).toContain("universell utforming");

			// Check for Norwegian legal compliance
			expect(result).toContain("personvern");
			expect(result).toContain("GDPR");
		});

		it("should render xala-form-norwegian.hbs correctly", async () => {
			const templatePath = "components/files/xala-form-norwegian.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for Norwegian form patterns
			expect(result).toContain("NorwegianForm");
			expect(result).toContain("PersonalNumber");
			expect(result).toContain("organisasjonsnummer");

			// Check for validation patterns
			expect(result).toContain("validate");
			expect(result).toContain("fødselsnummer");
			expect(result).toContain("postalnummer");

			// Check for accessibility requirements
			expect(result).toMatch(/aria-required/);
			expect(result).toMatch(/aria-invalid/);
			expect(result).toMatch(/aria-describedby/);

			// Check for Norwegian error messages
			expect(result).toContain("feilmelding");
			expect(result).toContain("påkrevd");

			// Check for BankID integration patterns
			expect(result).toContain("BankID");
			expect(result).toContain("authentication");
		});

		it("should render xala-layout-norwegian.hbs correctly", async () => {
			const templatePath = "components/files/xala-layout-norwegian.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for Norwegian layout patterns
			expect(result).toContain("NorwegianLayout");
			expect(result).toContain("header");
			expect(result).toContain("navigation");

			// Check for Norwegian government styling
			expect(result).toContain("designsystemet");
			expect(result).toContain("felles utseende");

			// Check for skip links (accessibility)
			expect(result).toContain("hopp til hovedinnhold");
			expect(result).toContain("skip-link");

			// Check for language switching
			expect(result).toContain("språkvelger");
			expect(result).toContain("language-switcher");
		});
	});

	describe("GDPR Compliance Components", () => {
		it("should render xala-display-gdpr.hbs correctly", async () => {
			const templatePath = "components/files/xala-display-gdpr.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for GDPR compliance patterns
			expect(result).toContain("GDPR");
			expect(result).toContain("consent");
			expect(result).toContain("privacy");
			expect(result).toContain("data protection");

			// Check for consent management
			expect(result).toContain("ConsentManager");
			expect(result).toContain("accept");
			expect(result).toContain("decline");
			expect(result).toContain("preferences");

			// Check for data subject rights
			expect(result).toContain("right to access");
			expect(result).toContain("right to erasure");
			expect(result).toContain("right to portability");

			// Check for privacy policy integration
			expect(result).toContain("privacy policy");
			expect(result).toContain("terms of service");

			// Check for cookie management
			expect(result).toContain("cookie");
			expect(result).toContain("tracking");
			expect(result).toContain("analytics");

			// Check for data retention
			expect(result).toContain("retention");
			expect(result).toContain("deletion");
			expect(result).toContain("storage");
		});
	});

	describe("WCAG AAA Accessibility Components", () => {
		it("should render xala-display-wcag-aaa.hbs correctly", async () => {
			const templatePath = "components/files/xala-display-wcag-aaa.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for WCAG AAA compliance patterns
			expect(result).toContain("WCAG");
			expect(result).toContain("AAA");
			expect(result).toContain("accessibility");

			// Check for color contrast compliance
			expect(result).toContain("contrast");
			expect(result).toContain("4.5:1");
			expect(result).toContain("7:1"); // AAA level

			// Check for keyboard navigation
			expect(result).toMatch(/tabIndex/);
			expect(result).toMatch(/onKeyDown/);
			expect(result).toMatch(/onKeyUp/);
			expect(result).toContain("Enter");
			expect(result).toContain("Space");
			expect(result).toContain("Escape");

			// Check for screen reader support
			expect(result).toMatch(/aria-label/);
			expect(result).toMatch(/aria-labelledby/);
			expect(result).toMatch(/aria-describedby/);
			expect(result).toMatch(/aria-expanded/);
			expect(result).toMatch(/aria-hidden/);
			expect(result).toMatch(/role=/);

			// Check for focus management
			expect(result).toContain("focus");
			expect(result).toContain("outline");
			expect(result).toContain("focus:");

			// Check for motion preferences
			expect(result).toContain("prefers-reduced-motion");
			expect(result).toContain("animation");

			// Check for text scaling support
			expect(result).toContain("text-base");
			expect(result).toContain("leading");
			expect(result).toContain("tracking");
		});
	});

	describe("ISO 27001 Security Components", () => {
		it("should render xala-display-iso27001.hbs correctly", async () => {
			const templatePath = "components/files/xala-display-iso27001.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for ISO 27001 security patterns
			expect(result).toContain("ISO27001");
			expect(result).toContain("security");
			expect(result).toContain("compliance");

			// Check for security controls
			expect(result).toContain("access control");
			expect(result).toContain("authentication");
			expect(result).toContain("encryption");

			// Check for audit logging
			expect(result).toContain("audit");
			expect(result).toContain("log");
			expect(result).toContain("monitoring");

			// Check for data classification
			expect(result).toContain("classification");
			expect(result).toContain("sensitive");
			expect(result).toContain("restricted");

			// Check for incident management
			expect(result).toContain("incident");
			expect(result).toContain("security event");
			expect(result).toContain("alert");

			// Check for risk management
			expect(result).toContain("risk");
			expect(result).toContain("assessment");
			expect(result).toContain("mitigation");
		});
	});

	describe("Component Integration Tests", () => {
		it("should render components with proper TypeScript types", async () => {
			const componentTemplates = [
				"components/files/xala-advanced.hbs",
				"components/files/xala-display-gdpr.hbs",
				"components/files/xala-display-wcag-aaa.hbs",
				"components/files/xala-form-norwegian.hbs",
			];

			for (const templatePath of componentTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					xalaContext,
				);

				// Check for TypeScript interface definitions
				expect(result).toMatch(/interface \w+Props/);
				expect(result).toMatch(/readonly \w+:/);

				// Check for proper component typing
				expect(result).toMatch(/\): JSX\.Element/);
				expect(result).toContain("React.ReactNode");

				// Check for default props handling
				expect(result).toMatch(/= \{/);
				expect(result).toContain("...");
			}
		});

		it("should render components with proper error handling", async () => {
			const componentTemplates = [
				"components/files/xala-error-boundary.hbs",
				"components/files/xala-advanced.hbs",
			];

			for (const templatePath of componentTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					xalaContext,
				);

				// Check for error handling patterns
				expect(result).toContain("try");
				expect(result).toContain("catch");
				expect(result).toContain("error");

				// Check for error logging
				expect(result).toContain("console.error");
				expect(result).toContain("Error rendering");

				// Check for fallback UI
				expect(result).toContain("fallback");
				expect(result).toContain("Something went wrong");
			}
		});

		it("should render components with internationalization support", async () => {
			const i18nTemplates = [
				"components/files/xala-display-norwegian.hbs",
				"components/files/xala-form-norwegian.hbs",
				"components/files/xala-display-gdpr.hbs",
			];

			for (const templatePath of i18nTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					xalaContext,
				);

				// Check for i18n patterns
				expect(result).toMatch(/t\(/);
				expect(result).toContain("useTranslation");
				expect(result).toContain("i18n");

				// Check for locale handling
				expect(result).toContain("locale");
				expect(result).toMatch(/nb|en|ar|fr/);

				// Check for RTL support
				expect(result).toContain("dir=");
				expect(result).toContain("rtl");
				expect(result).toContain("ltr");
			}
		});

		it("should render components with proper accessibility attributes", async () => {
			const accessibilityTemplates = [
				"components/files/xala-display-wcag-aaa.hbs",
				"components/files/xala-form-norwegian.hbs",
				"components/files/xala-advanced.hbs",
			];

			for (const templatePath of accessibilityTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					xalaContext,
				);

				// Check for ARIA attributes
				expect(result).toMatch(/aria-\w+/);
				expect(result).toMatch(/role=/);

				// Check for semantic HTML
				expect(result).toMatch(
					/<(header|main|nav|section|article|aside|footer)/,
				);

				// Check for keyboard navigation
				expect(result).toMatch(/tabIndex/);
				expect(result).toMatch(/onKeyDown|onKeyUp|onKeyPress/);

				// Check for focus management
				expect(result).toContain("focus");
				expect(result).toMatch(/focus:/);
			}
		});
	});

	describe("Template Context Variable Rendering", () => {
		it("should render Norwegian configuration correctly", async () => {
			const templatePath = "components/files/xala-display-norwegian.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check Norwegian context variables
			if (xalaContext.norwegian?.altinn) {
				expect(result).toContain("altinn");
			}
			if (xalaContext.norwegian?.bankid) {
				expect(result).toContain("bankid");
			}
			if (xalaContext.norwegian?.vipps) {
				expect(result).toContain("vipps");
			}
			if (xalaContext.norwegian?.language) {
				expect(result).toContain(xalaContext.norwegian.language);
			}
		});

		it("should render compliance configuration correctly", async () => {
			const complianceTemplates = [
				"components/files/xala-display-gdpr.hbs",
				"components/files/xala-display-wcag-aaa.hbs",
				"components/files/xala-display-iso27001.hbs",
			];

			for (const templatePath of complianceTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					xalaContext,
				);

				// Check compliance context variables
				if (xalaContext.compliance?.gdpr) {
					expect(result).toContain("gdpr");
				}
				if (xalaContext.compliance?.wcag) {
					expect(result).toContain(xalaContext.compliance.wcag);
				}
				if (xalaContext.compliance?.iso27001) {
					expect(result).toContain("iso27001");
				}
			}
		});

		it("should render localization configuration correctly", async () => {
			const templatePath = "components/files/xala-form-norwegian.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check localization context variables
			if (xalaContext.localization?.languages) {
				xalaContext.localization.languages.forEach((lang) => {
					expect(result).toContain(lang);
				});
			}
			if (xalaContext.localization?.rtl) {
				expect(result).toContain("rtl");
			}
			if (xalaContext.localization?.fallback) {
				expect(result).toContain(xalaContext.localization.fallback);
			}
		});
	});

	describe("Template Performance and Quality", () => {
		it("should render Xala components within performance limits", async () => {
			const complexTemplate = "components/files/xala-display-wcag-aaa.hbs";
			const iterations = 50;

			const startTime = performance.now();

			for (let i = 0; i < iterations; i++) {
				await templateLoader.renderTemplate(complexTemplate, xalaContext);
			}

			const endTime = performance.now();
			const avgTime = (endTime - startTime) / iterations;

			// Complex Xala components should render in less than 20ms on average
			expect(avgTime).toBeLessThan(20);
		});

		it("should include proper template metadata", async () => {
			const templatePath = "components/files/xala-advanced.hbs";
			const result = await templateLoader.renderTemplate(
				templatePath,
				xalaContext,
			);

			// Check for migration metadata comments
			expect(result).toContain("{{!-- Template:");
			expect(result).toContain("{{!-- Category:");
			expect(result).toContain("{{!-- Type:");
			expect(result).toContain("{{!-- Migrated from:");
		});

		it("should generate valid component output", async () => {
			const componentTemplates = [
				"components/files/xala-advanced.hbs",
				"components/files/xala-error-boundary.hbs",
				"components/files/xala-form-norwegian.hbs",
			];

			for (const templatePath of componentTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					xalaContext,
				);

				// Check for valid React component structure
				expect(result).toContain("export");
				expect(result).toMatch(/function \w+/);
				expect(result).toContain("return");
				expect(result).toContain("<");
				expect(result).toContain(">");

				// Check for proper JSX structure
				expect(result).toMatch(/<\w+/);
				expect(result).toMatch(/<\/\w+>/);

				// Check for proper prop destructuring
				expect(result).toMatch(/\{[^}]*\}/);
			}
		});
	});
});
