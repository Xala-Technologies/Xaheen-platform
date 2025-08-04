import { existsSync, readFileSync } from "fs";
import Handlebars from "handlebars";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TemplateContext {
	readonly [key: string]: any;
}

export class TemplateEngine {
	private readonly handlebars: typeof Handlebars;
	private readonly templateCache: Map<string, HandlebarsTemplateDelegate>;

	constructor() {
		this.handlebars = Handlebars.create();
		this.templateCache = new Map();
		this.registerHelpers();
	}

	render(templatePath: string, context: TemplateContext = {}): string {
		try {
			const template = this.getTemplate(templatePath);
			return template(context);
		} catch (error) {
			logger.error(`Failed to render template ${templatePath}:`, error);
			throw error;
		}
	}

	private getTemplate(templatePath: string): HandlebarsTemplateDelegate {
		if (this.templateCache.has(templatePath)) {
			return this.templateCache.get(templatePath)!;
		}

		const fullPath = this.resolveTemplatePath(templatePath);

		if (!existsSync(fullPath)) {
			throw new Error(`Template not found: ${templatePath}`);
		}

		const templateSource = readFileSync(fullPath, "utf-8");
		const compiledTemplate = this.handlebars.compile(templateSource);

		this.templateCache.set(templatePath, compiledTemplate);
		return compiledTemplate;
	}

	private resolveTemplatePath(templatePath: string): string {
		// Try relative to CLI templates directory first
		const cliTemplatesPath = join(__dirname, "../../templates", templatePath);
		if (existsSync(cliTemplatesPath)) {
			return cliTemplatesPath;
		}

		// Try relative to project root templates
		const projectTemplatesPath = join(process.cwd(), "templates", templatePath);
		if (existsSync(projectTemplatesPath)) {
			return projectTemplatesPath;
		}

		// Default to CLI templates
		return cliTemplatesPath;
	}

	private registerHelpers(): void {
		// Register conditional helpers
		this.handlebars.registerHelper("if_eq", (a, b, options) => {
			return a === b ? options.fn(this) : options.inverse(this);
		});

		this.handlebars.registerHelper("if_contains", (array, value, options) => {
			return Array.isArray(array) && array.includes(value)
				? options.fn(this)
				: options.inverse(this);
		});

		// Register string helpers
		this.handlebars.registerHelper("camelCase", (str: string) => {
			return (
				str.charAt(0).toLowerCase() +
				str
					.slice(1)
					.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
			);
		});

		this.handlebars.registerHelper("pascalCase", (str: string) => {
			return (
				str.charAt(0).toUpperCase() +
				str
					.slice(1)
					.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
			);
		});

		this.handlebars.registerHelper("kebabCase", (str: string) => {
			return str
				.replace(/([a-z])([A-Z])/g, "$1-$2")
				.toLowerCase()
				.replace(/\s+/g, "-");
		});

		this.handlebars.registerHelper("snakeCase", (str: string) => {
			return str
				.replace(/([a-z])([A-Z])/g, "$1_$2")
				.toLowerCase()
				.replace(/\s+/g, "_");
		});

		// Register platform-specific helpers
		this.handlebars.registerHelper("platformExtension", (platform: string) => {
			switch (platform) {
				case "react":
				case "vue":
				case "angular":
					return ".tsx";
				case "flutter":
					return ".dart";
				case "ios":
					return ".swift";
				case "android":
					return ".kt";
				default:
					return ".ts";
			}
		});

		// Register compliance helpers
		this.handlebars.registerHelper("complianceImports", (platform: string) => {
			switch (platform) {
				case "react":
					return `import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../hooks/useLocalization';`;
				case "vue":
					return `import { Card, Stack, Typography, Button } from '@xala-technologies/ui-system';
import { useTokens } from '@xala-technologies/ui-system';
import { useLocalization } from '../composables/useLocalization';`;
				default:
					return "";
			}
		});

		// Register token helpers
		this.handlebars.registerHelper("tokenReference", (tokenPath: string) => {
			return `tokens.${tokenPath}`;
		});

		// Register localization helpers
		this.handlebars.registerHelper(
			"translateKey",
			(key: string, defaultValue?: string) => {
				const args = defaultValue ? `'${key}', '${defaultValue}'` : `'${key}'`;
				return `t(${args})`;
			},
		);

		// Register date helpers
		this.handlebars.registerHelper("currentYear", () => {
			return new Date().getFullYear();
		});

		this.handlebars.registerHelper("currentDate", () => {
			return new Date().toISOString().split("T")[0];
		});

		// Register utility helpers
		this.handlebars.registerHelper("json", (context: any) => {
			return JSON.stringify(context, null, 2);
		});

		this.handlebars.registerHelper("join", (array: any[], separator = ", ") => {
			return Array.isArray(array) ? array.join(separator) : "";
		});

		this.handlebars.registerHelper("indent", (text: string, spaces = 2) => {
			const indent = " ".repeat(spaces);
			return text
				.split("\n")
				.map((line) => (line ? indent + line : line))
				.join("\n");
		});
	}

	// Method to register custom helpers from external sources
	registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
		this.handlebars.registerHelper(name, helper);
	}

	// Method to register partials
	registerPartial(name: string, templatePath: string): void {
		const fullPath = this.resolveTemplatePath(templatePath);
		if (existsSync(fullPath)) {
			const partialSource = readFileSync(fullPath, "utf-8");
			this.handlebars.registerPartial(name, partialSource);
		}
	}

	// Method to clear template cache (useful for development)
	clearCache(): void {
		this.templateCache.clear();
	}
}
