/**
 * @fileoverview Live Preview Service for Interactive Tech Builder
 * @description Provides live preview and validation of stack configurations
 */

import {
	BuilderError,
	LivePreview,
	PreviewContext,
	StackConfiguration,
	ValidationError,
} from "./builder-types.js";
import { compatibilityChecker } from "./compatibility-checker.js";
import { projectGenerator } from "./project-generator.js";

export class LivePreviewService implements LivePreview {
	/**
	 * Generate preview context for a stack configuration
	 */
	async generatePreview(stack: StackConfiguration): Promise<PreviewContext> {
		try {
			// Generate project structure preview
			const projectStructure =
				await projectGenerator.getProjectStructurePreview(stack);

			// Generate dependencies preview
			const dependencies = await this.generateDependenciesPreview(stack);

			// Generate scripts preview
			const scripts = await this.generateScriptsPreview(stack);

			// Generate config files preview
			const configFiles = await this.generateConfigFilesPreview(stack);

			return {
				stack,
				projectStructure,
				dependencies,
				scripts,
				configFiles,
			};
		} catch (error) {
			throw new BuilderError(
				`Failed to generate preview: ${error instanceof Error ? error.message : String(error)}`,
				"PREVIEW_ERROR",
			);
		}
	}

	/**
	 * Validate configuration and return detailed errors
	 */
	async validateConfiguration(
		stack: StackConfiguration,
	): Promise<readonly ValidationError[]> {
		const errors: ValidationError[] = [];

		try {
			// Basic validation
			const basicErrors = compatibilityChecker.validateStack(stack);
			errors.push(...basicErrors);

			// Advanced validation
			const advancedErrors = await this.performAdvancedValidation(stack);
			errors.push(...advancedErrors);

			// Best practices validation
			const bestPracticesErrors = await this.validateBestPractices(stack);
			errors.push(...bestPracticesErrors);
		} catch (error) {
			errors.push(
				new ValidationError(
					`Validation failed: ${error instanceof Error ? error.message : String(error)}`,
					"validation",
					"general",
				),
			);
		}

		return errors;
	}

	/**
	 * Estimate generation time based on stack complexity
	 */
	estimateGenerationTime(stack: StackConfiguration): number {
		let baseTime = 2000; // Base 2 seconds

		// Frontend complexity
		if (stack.webFrontend && stack.webFrontend !== "none") {
			const frontends = Array.isArray(stack.webFrontend)
				? stack.webFrontend
				: [stack.webFrontend];
			baseTime += frontends.length * 1000;
		}

		// Backend complexity
		if (stack.backend && stack.backend !== "none") {
			baseTime += 1500;
		}

		// Database and ORM
		if (stack.database && stack.database !== "none") {
			baseTime += 1000;
			if (stack.orm && stack.orm !== "none") {
				baseTime += 500;
			}
		}

		// Authentication
		if (stack.auth && stack.auth !== "none") {
			baseTime += 800;
		}

		// UI System
		if (stack.uiSystem && stack.uiSystem !== "none") {
			baseTime += 600;
		}

		// Add-ons
		if (stack.addons && stack.addons.length > 0) {
			baseTime += stack.addons.length * 200;
		}

		// Additional services
		const services = [
			stack.analytics,
			stack.monitoring,
			stack.notifications,
			stack.payments,
			stack.search,
			stack.caching,
		].filter((service) => service && service !== "none");

		baseTime += services.length * 300;

		// Compliance requirements add complexity
		if (stack.compliance && Array.isArray(stack.compliance)) {
			baseTime += stack.compliance.filter((c) => c !== "none").length * 400;
		}

		return Math.round(baseTime);
	}

	/**
	 * Calculate project complexity
	 */
	calculateComplexity(
		stack: StackConfiguration,
	): "simple" | "moderate" | "complex" {
		let complexityScore = 0;

		// Frontend complexity
		if (stack.webFrontend && stack.webFrontend !== "none") {
			const frontends = Array.isArray(stack.webFrontend)
				? stack.webFrontend
				: [stack.webFrontend];
			complexityScore += frontends.length;
		}

		// Backend complexity
		if (stack.backend && stack.backend !== "none") {
			complexityScore += 2;
		}

		// Database complexity
		if (stack.database && stack.database !== "none") {
			complexityScore += 1;
			if (stack.orm && stack.orm !== "none") {
				complexityScore += 1;
			}
		}

		// Authentication complexity
		if (stack.auth && !["none", "basic"].includes(stack.auth)) {
			complexityScore += 2;
		}

		// SAAS features
		const saasFeatures = [
			stack.saasAdmin,
			stack.subscriptions,
			stack.licensing,
			stack.rbac,
			stack.multiTenancy,
		].filter((feature) => feature && feature !== "none");
		complexityScore += saasFeatures.length * 2;

		// Additional services
		const additionalServices = [
			stack.analytics,
			stack.monitoring,
			stack.notifications,
			stack.payments,
			stack.messaging,
			stack.search,
			stack.caching,
			stack.backgroundJobs,
		].filter((service) => service && service !== "none");
		complexityScore += additionalServices.length;

		// Compliance requirements
		if (stack.compliance && Array.isArray(stack.compliance)) {
			complexityScore += stack.compliance.filter((c) => c !== "none").length;
		}

		// Add-ons
		if (stack.addons && stack.addons.length > 0) {
			complexityScore += Math.ceil(stack.addons.length / 2);
		}

		// Classify complexity
		if (complexityScore <= 5) {
			return "simple";
		} else if (complexityScore <= 12) {
			return "moderate";
		} else {
			return "complex";
		}
	}

	/**
	 * Generate dependencies preview
	 */
	private async generateDependenciesPreview(
		stack: StackConfiguration,
	): Promise<Record<string, string>> {
		const dependencies: Record<string, string> = {};

		// Core dependencies based on frontend
		if (stack.webFrontend && stack.webFrontend !== "none") {
			const frontend = Array.isArray(stack.webFrontend)
				? stack.webFrontend[0]
				: stack.webFrontend;

			switch (frontend) {
				case "next":
					dependencies.next = "^14.0.0";
					dependencies.react = "^18.0.0";
					dependencies["react-dom"] = "^18.0.0";
					break;
				case "react":
					dependencies.react = "^18.0.0";
					dependencies["react-dom"] = "^18.0.0";
					dependencies.vite = "^5.0.0";
					break;
				case "vue":
				case "nuxt":
					dependencies.vue = "^3.0.0";
					dependencies.nuxt = "^3.0.0";
					break;
				case "svelte":
					dependencies.svelte = "^4.0.0";
					dependencies["@sveltejs/kit"] = "^2.0.0";
					break;
				case "angular":
					dependencies["@angular/core"] = "^17.0.0";
					dependencies["@angular/cli"] = "^17.0.0";
					break;
			}
		}

		// Backend dependencies
		if (stack.backend && stack.backend !== "none") {
			switch (stack.backend) {
				case "hono":
					dependencies.hono = "^3.0.0";
					break;
				case "fastify":
					dependencies.fastify = "^4.0.0";
					break;
				case "express":
					dependencies.express = "^4.18.0";
					break;
				case "dotnet":
					// .NET dependencies would be in .csproj file
					break;
			}
		}

		// Database and ORM
		if (stack.orm && stack.orm !== "none") {
			switch (stack.orm) {
				case "prisma":
					dependencies["@prisma/client"] = "^5.0.0";
					break;
				case "drizzle":
					dependencies["drizzle-orm"] = "^0.28.0";
					break;
				case "typeorm":
					dependencies.typeorm = "^0.3.0";
					break;
			}
		}

		// UI System
		if (stack.uiSystem === "xala") {
			dependencies["@xala-technologies/ui"] = "^1.0.0";
			dependencies.tailwindcss = "^3.0.0";
		}

		// Authentication
		if (stack.auth && stack.auth !== "none") {
			switch (stack.auth) {
				case "clerk":
					dependencies["@clerk/nextjs"] = "^4.0.0";
					break;
				case "auth0":
					dependencies["@auth0/nextjs-auth0"] = "^3.0.0";
					break;
				case "better-auth":
					dependencies["better-auth"] = "^0.1.0";
					break;
			}
		}

		// Additional services
		if (stack.payments === "stripe") {
			dependencies.stripe = "^14.0.0";
		}

		if (stack.analytics === "vercel-analytics") {
			dependencies["@vercel/analytics"] = "^1.0.0";
		}

		if (stack.monitoring === "sentry") {
			dependencies["@sentry/node"] = "^7.0.0";
		}

		return dependencies;
	}

	/**
	 * Generate scripts preview
	 */
	private async generateScriptsPreview(
		stack: StackConfiguration,
	): Promise<Record<string, string>> {
		const scripts: Record<string, string> = {};

		// Development scripts
		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend)
				? stack.webFrontend[0]
				: stack.webFrontend;

			switch (frontend) {
				case "next":
					scripts.dev = "next dev";
					scripts.build = "next build";
					scripts.start = "next start";
					break;
				case "react":
					scripts.dev = "vite dev";
					scripts.build = "vite build";
					scripts.preview = "vite preview";
					break;
				case "nuxt":
					scripts.dev = "nuxt dev";
					scripts.build = "nuxt build";
					scripts.preview = "nuxt preview";
					break;
			}
		}

		// Linting and type checking
		scripts.lint = "eslint . --ext .ts,.tsx,.js,.jsx";
		scripts["type-check"] = "tsc --noEmit";

		// Database scripts
		if (stack.orm === "prisma") {
			scripts["db:generate"] = "prisma generate";
			scripts["db:push"] = "prisma db push";
			scripts["db:migrate"] = "prisma migrate dev";
			scripts["db:studio"] = "prisma studio";
		} else if (stack.orm === "drizzle") {
			scripts["db:generate"] = "drizzle-kit generate";
			scripts["db:push"] = "drizzle-kit push";
			scripts["db:studio"] = "drizzle-kit studio";
		}

		// Testing scripts
		scripts.test = "jest";
		scripts["test:watch"] = "jest --watch";

		return scripts;
	}

	/**
	 * Generate config files preview
	 */
	private async generateConfigFilesPreview(
		stack: StackConfiguration,
	): Promise<readonly string[]> {
		const configFiles: string[] = [
			"package.json",
			"tsconfig.json",
			".gitignore",
			".env.example",
			"README.md",
		];

		// Frontend-specific config files
		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend)
				? stack.webFrontend[0]
				: stack.webFrontend;

			switch (frontend) {
				case "next":
					configFiles.push("next.config.js");
					break;
				case "react":
					configFiles.push("vite.config.ts");
					break;
				case "nuxt":
					configFiles.push("nuxt.config.ts");
					break;
				case "svelte":
					configFiles.push("svelte.config.js");
					break;
				case "angular":
					configFiles.push("angular.json");
					break;
			}
		}

		// UI System config
		if (stack.uiSystem === "xala") {
			configFiles.push("tailwind.config.js", "xala.config.js");
		}

		// ORM config files
		if (stack.orm === "prisma") {
			configFiles.push("prisma/schema.prisma");
		} else if (stack.orm === "drizzle") {
			configFiles.push("drizzle.config.ts");
		}

		// Deployment config files
		if (stack.webDeploy === "vercel") {
			configFiles.push("vercel.json");
		} else if (stack.webDeploy === "netlify") {
			configFiles.push("netlify.toml");
		} else if (stack.webDeploy === "docker") {
			configFiles.push("Dockerfile", "docker-compose.yml");
		}

		// Development and tooling configs
		configFiles.push(
			"eslint.config.js",
			"prettier.config.js",
			"jest.config.js",
		);

		// Add-on specific configs
		if (stack.addons.includes("turborepo")) {
			configFiles.push("turbo.json");
		}

		if (stack.addons.includes("biome")) {
			configFiles.push("biome.json");
		}

		return configFiles.sort();
	}

	/**
	 * Perform advanced validation checks
	 */
	private async performAdvancedValidation(
		stack: StackConfiguration,
	): Promise<ValidationError[]> {
		const errors: ValidationError[] = [];

		// Check for missing required dependencies
		if (stack.multiTenancy && (!stack.database || stack.database === "none")) {
			errors.push(
				new ValidationError(
					"Multi-tenancy requires a database",
					"multiTenancy",
					"database",
				),
			);
		}

		if (stack.rbac && (!stack.auth || stack.auth === "none")) {
			errors.push(
				new ValidationError(
					"Role-based access control requires authentication",
					"rbac",
					"auth",
				),
			);
		}

		if (stack.subscriptions && (!stack.payments || stack.payments === "none")) {
			errors.push(
				new ValidationError(
					"Subscription management requires payment processing",
					"subscriptions",
					"payments",
				),
			);
		}

		// Check for performance implications
		if (stack.addons.length > 10) {
			errors.push(
				new ValidationError(
					"Too many add-ons may impact build performance",
					"addons",
					"performance",
				),
			);
		}

		// Check for security implications
		if (stack.payments && (!stack.security || stack.security.length === 0)) {
			errors.push(
				new ValidationError(
					"Payment processing requires security measures",
					"payments",
					"security",
				),
			);
		}

		return errors;
	}

	/**
	 * Validate best practices
	 */
	private async validateBestPractices(
		stack: StackConfiguration,
	): Promise<ValidationError[]> {
		const errors: ValidationError[] = [];

		// Best practice: Use TypeScript for complex projects
		const complexity = this.calculateComplexity(stack);
		if (complexity === "complex" && !this.usesTypeScript(stack)) {
			errors.push(
				new ValidationError(
					"TypeScript is recommended for complex projects",
					"general",
					"typescript",
				),
			);
		}

		// Best practice: Use monitoring for production apps
		if (!stack.monitoring || stack.monitoring === "none") {
			errors.push(
				new ValidationError(
					"Monitoring is recommended for production applications",
					"monitoring",
					"production",
				),
			);
		}

		// Best practice: Use proper database for multi-user apps
		if (stack.auth && stack.auth !== "none" && stack.database === "sqlite") {
			errors.push(
				new ValidationError(
					"Consider using PostgreSQL or MySQL for multi-user applications",
					"database",
					"scaling",
				),
			);
		}

		// Best practice: Use CDN for static assets
		if (
			stack.webDeploy &&
			!["vercel", "netlify", "cloudflare"].includes(stack.webDeploy)
		) {
			errors.push(
				new ValidationError(
					"Consider using a CDN-enabled deployment platform for better performance",
					"webDeploy",
					"performance",
				),
			);
		}

		return errors;
	}

	/**
	 * Check if stack uses TypeScript
	 */
	private usesTypeScript(stack: StackConfiguration): boolean {
		const frontend = Array.isArray(stack.webFrontend)
			? stack.webFrontend[0]
			: stack.webFrontend;

		// Next.js, React with Vite, and most modern frameworks default to TypeScript
		return ["next", "react", "vue", "nuxt", "angular"].includes(frontend || "");
	}
}

// Export singleton instance
export const livePreview = new LivePreviewService();
