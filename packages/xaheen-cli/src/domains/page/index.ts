import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import type { CLICommand } from "../../types/index";
import { logger } from "../../utils/logger";

interface PageTemplate {
	name: string;
	description: string;
	type: "static" | "dynamic" | "api" | "auth" | "dashboard" | "landing";
	features: string[];
	dependencies?: string[];
}

export default class PageDomain {
	private pageTemplates: Map<string, PageTemplate>;

	constructor() {
		this.pageTemplates = this.initializePageTemplates();
	}

	private initializePageTemplates(): Map<string, PageTemplate> {
		const templates = new Map<string, PageTemplate>();

		// Common page templates
		templates.set("landing", {
			name: "Landing Page",
			description:
				"Marketing landing page with hero, features, and CTA sections",
			type: "landing",
			features: [
				"Hero Section",
				"Features Grid",
				"Testimonials",
				"CTA",
				"Footer",
			],
			dependencies: ["@xala-technologies/ui-system"],
		});

		templates.set("dashboard", {
			name: "Dashboard Page",
			description: "Analytics dashboard with charts, stats, and data tables",
			type: "dashboard",
			features: ["KPI Cards", "Charts", "Data Tables", "Filters", "Export"],
			dependencies: ["@xala-technologies/ui-system", "recharts"],
		});

		templates.set("auth-login", {
			name: "Login Page",
			description: "Authentication login page with form validation",
			type: "auth",
			features: ["Login Form", "Social Auth", "Remember Me", "Forgot Password"],
			dependencies: ["@xala-technologies/ui-system", "react-hook-form"],
		});

		templates.set("auth-register", {
			name: "Register Page",
			description: "User registration page with multi-step form",
			type: "auth",
			features: [
				"Registration Form",
				"Email Verification",
				"Terms Acceptance",
				"Social Auth",
			],
			dependencies: ["@xala-technologies/ui-system", "react-hook-form"],
		});

		templates.set("profile", {
			name: "Profile Page",
			description: "User profile page with editable information",
			type: "dynamic",
			features: [
				"Profile Info",
				"Avatar Upload",
				"Settings",
				"Activity History",
			],
			dependencies: ["@xala-technologies/ui-system"],
		});

		templates.set("pricing", {
			name: "Pricing Page",
			description: "Product pricing page with tier comparison",
			type: "static",
			features: ["Pricing Cards", "Feature Comparison", "FAQ", "Contact Sales"],
			dependencies: ["@xala-technologies/ui-system"],
		});

		templates.set("blog-list", {
			name: "Blog List Page",
			description: "Blog listing page with pagination and categories",
			type: "dynamic",
			features: ["Post Grid", "Categories", "Search", "Pagination", "Tags"],
			dependencies: ["@xala-technologies/ui-system"],
		});

		templates.set("blog-post", {
			name: "Blog Post Page",
			description: "Individual blog post page with content and comments",
			type: "dynamic",
			features: [
				"Article Content",
				"Author Info",
				"Comments",
				"Related Posts",
				"Share",
			],
			dependencies: ["@xala-technologies/ui-system", "@portabletext/react"],
		});

		templates.set("404", {
			name: "404 Error Page",
			description: "Custom 404 error page with navigation options",
			type: "static",
			features: [
				"Error Message",
				"Search",
				"Navigation Links",
				"Contact Support",
			],
			dependencies: ["@xala-technologies/ui-system"],
		});

		templates.set("settings", {
			name: "Settings Page",
			description: "Application settings page with tabs",
			type: "dynamic",
			features: [
				"Settings Tabs",
				"Profile Settings",
				"Notifications",
				"Security",
				"Billing",
			],
			dependencies: ["@xala-technologies/ui-system"],
		});

		return templates;
	}

	async generate(command: CLICommand): Promise<void> {
		const description = command.target;

		if (!description) {
			logger.error("Page description is required");
			this.showAvailableTemplates();
			return;
		}

		logger.info(`🤖 Generating page from description: "${description}"`);

		// Analyze description to determine page type
		const pageType = this.analyzePageType(description);
		const template = this.findBestTemplate(description, pageType);

		if (template) {
			logger.info(`📄 Using template: ${chalk.cyan(template.name)}`);
			logger.info(`   Type: ${template.type}`);
			logger.info(`   Features: ${template.features.join(", ")}`);

			// TODO: Integrate with AI service for intelligent generation
			logger.warn("AI page generation will be available in the next release");
			logger.info('Use "xaheen page create <name>" to create from templates');
		} else {
			logger.warn("No matching template found for your description");
			this.showAvailableTemplates();
		}
	}

	async create(command: CLICommand): Promise<void> {
		const pageName = command.target;

		if (!pageName) {
			logger.error("Page name is required");
			this.showAvailableTemplates();
			return;
		}

		const templateKey = command.options?.template || "landing";
		const template = this.pageTemplates.get(templateKey);

		if (!template) {
			logger.error(`Template "${templateKey}" not found`);
			this.showAvailableTemplates();
			return;
		}

		logger.info(`📄 Creating ${template.name}: ${chalk.green(pageName)}`);

		// Generate page code
		const pageCode = this.generatePageCode(pageName, template);

		// Determine output path
		const outputDir = command.options?.output || "./src/pages";
		const fileName = this.formatFileName(pageName);
		const outputPath = path.join(outputDir, `${fileName}.tsx`);

		try {
			// Ensure directory exists
			await fs.mkdir(outputDir, { recursive: true });

			// Write page file
			await fs.writeFile(outputPath, pageCode);

			logger.success(
				`✅ Page created successfully at: ${chalk.cyan(outputPath)}`,
			);
			logger.info(`   Template: ${template.name}`);
			logger.info(`   Features: ${template.features.length} included`);

			if (template.dependencies && template.dependencies.length > 0) {
				logger.info(`   Dependencies to install:`);
				template.dependencies.forEach((dep) => {
					logger.info(`     - ${dep}`);
				});
			}
		} catch (error) {
			logger.error("Failed to create page:", error);
		}
	}

	async list(command: CLICommand): Promise<void> {
		logger.info(chalk.cyan("\n📄 Available Page Templates:\n"));

		const templatesByType = new Map<string, PageTemplate[]>();

		// Group templates by type
		this.pageTemplates.forEach((template) => {
			const templates = templatesByType.get(template.type) || [];
			templates.push(template);
			templatesByType.set(template.type, templates);
		});

		// Display templates by type
		templatesByType.forEach((templates, type) => {
			logger.info(chalk.yellow(`  ${type.toUpperCase()} Pages:`));

			templates.forEach((template) => {
				logger.info(`    • ${chalk.green(template.name)}`);
				logger.info(`      ${chalk.gray(template.description)}`);
				logger.info(
					`      Features: ${chalk.cyan(template.features.join(", "))}`,
				);
				logger.info("");
			});
		});

		logger.info(chalk.gray("\n  Usage:"));
		logger.info(
			chalk.gray("    xaheen page create <name> --template <template-key>"),
		);
		logger.info(
			chalk.gray('    xaheen page generate "description of your page"'),
		);
	}

	private analyzePageType(description: string): string {
		const desc = description.toLowerCase();

		if (
			desc.includes("dashboard") ||
			desc.includes("analytics") ||
			desc.includes("admin")
		) {
			return "dashboard";
		}
		if (
			desc.includes("login") ||
			desc.includes("signin") ||
			desc.includes("auth")
		) {
			return "auth";
		}
		if (
			desc.includes("landing") ||
			desc.includes("hero") ||
			desc.includes("marketing")
		) {
			return "landing";
		}
		if (
			desc.includes("blog") ||
			desc.includes("article") ||
			desc.includes("post")
		) {
			return "dynamic";
		}
		if (desc.includes("api") || desc.includes("endpoint")) {
			return "api";
		}

		return "static";
	}

	private findBestTemplate(
		description: string,
		pageType: string,
	): PageTemplate | undefined {
		const desc = description.toLowerCase();

		// Try to find exact match first
		for (const [key, template] of this.pageTemplates) {
			if (desc.includes(key) || template.name.toLowerCase().includes(desc)) {
				return template;
			}
		}

		// Find by type
		for (const template of this.pageTemplates.values()) {
			if (template.type === pageType) {
				return template;
			}
		}

		return undefined;
	}

	private generatePageCode(pageName: string, template: PageTemplate): string {
		const componentName = this.toPascalCase(pageName);

		return `/**
 * ${componentName} Page
 * Generated with Xaheen Unified CLI v3.0.0
 * Template: ${template.name}
 * 
 * Features:
${template.features.map((f) => ` * - ${f}`).join("\n")}
 */

'use client';

import React from 'react';
import {
  Container,
  Card,
  Button,
  Typography,
  Badge,
} from '@xala-technologies/ui-system';

interface ${componentName}Props {
  // Add your props here
}

export default function ${componentName}({}: ${componentName}Props): React.JSX.Element {
  return (
    <Container size="lg" padding="xl">
      <Typography variant="h1">${pageName}</Typography>
      
      {/* ${template.name} Template */}
      <Card variant="elevated" padding="lg">
        <Typography variant="body">
          This is your ${template.type} page generated from the ${template.name} template.
        </Typography>
        
        {/* TODO: Implement the following features */}
        ${template.features
					.map(
						(feature) => `
        {/* ${feature} */}`,
					)
					.join("")}
      </Card>
    </Container>
  );
}`;
	}

	private formatFileName(name: string): string {
		return name
			.replace(/([A-Z])/g, "-$1")
			.toLowerCase()
			.replace(/^-/, "")
			.replace(/\s+/g, "-");
	}

	private toPascalCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toUpperCase());
	}

	private showAvailableTemplates(): void {
		logger.info("\nAvailable page templates:");
		this.pageTemplates.forEach((template, key) => {
			logger.info(`  • ${chalk.green(key)}: ${template.description}`);
		});
	}
}
