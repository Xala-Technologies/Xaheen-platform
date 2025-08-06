/**
 * Service Injector Implementation
 *
 * Handles injection of services into project templates.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import { consola } from "consola";
import fs from "fs-extra";
import Handlebars from "handlebars";
import type {
	IServiceInjector,
	ProjectContext,
	ServiceConfiguration,
	ServiceInjectionResult,
	ServiceTemplate,
} from "../../types/index.js";
import { templateLoader } from "../templates/template-loader";

export class ServiceInjector implements IServiceInjector {
	private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

	constructor() {
		this.registerHelpers();
	}

	async injectService(
		service: ServiceConfiguration,
		template: ServiceTemplate,
		projectPath: string,
		projectContext: ProjectContext,
		options: any = {},
	): Promise<ServiceInjectionResult> {
		const startTime = Date.now();
		consola.debug(
			`Injecting service: ${service.serviceType}:${service.provider}`,
		);

		const injectedFiles: string[] = [];
		const createdFiles: string[] = [];
		const errors: string[] = [];
		const warnings: string[] = [];

		try {
			// Process injection points
			for (const injectionPoint of template.injectionPoints) {
				try {
					const targetPath = path.join(projectPath, injectionPoint.target);

					switch (injectionPoint.type) {
						case "file-create":
							if ((await fs.pathExists(targetPath)) && !options.force) {
								warnings.push(`File already exists: ${injectionPoint.target}`);
								continue;
							}

							const content = await this.renderTemplate(
								injectionPoint.template,
								{
									...projectContext,
									service,
									config: service.configuration,
								},
							);

							await fs.ensureDir(path.dirname(targetPath));
							await fs.writeFile(targetPath, content);
							createdFiles.push(injectionPoint.target);
							consola.success(`Created: ${injectionPoint.target}`);
							break;

						case "json-merge":
							if (!(await fs.pathExists(targetPath))) {
								errors.push(`Target file not found: ${injectionPoint.target}`);
								continue;
							}

							const existingJson = await fs.readJson(targetPath);
							const mergeContent = await this.renderTemplate(
								injectionPoint.template,
								{
									...projectContext,
									service,
									config: service.configuration,
								},
							);
							const mergeJson = JSON.parse(mergeContent);

							const merged = this.deepMerge(existingJson, mergeJson);
							await fs.writeJson(targetPath, merged, { spaces: 2 });
							injectedFiles.push(injectionPoint.target);
							consola.success(`Updated: ${injectionPoint.target}`);
							break;

						case "file-append":
							if (!(await fs.pathExists(targetPath))) {
								errors.push(`Target file not found: ${injectionPoint.target}`);
								continue;
							}

							const appendContent = await this.renderTemplate(
								injectionPoint.template,
								{
									...projectContext,
									service,
									config: service.configuration,
								},
							);

							const existingContent = await fs.readFile(targetPath, "utf-8");
							await fs.writeFile(
								targetPath,
								existingContent + "\n" + appendContent,
							);
							injectedFiles.push(injectionPoint.target);
							consola.success(`Appended to: ${injectionPoint.target}`);
							break;

						default:
							warnings.push(
								`Unsupported injection type: ${injectionPoint.type}`,
							);
					}
				} catch (error) {
					errors.push(
						`Failed to process injection point ${injectionPoint.target}: ${error}`,
					);
				}
			}

			// Add environment variables
			if (template.envVariables.length > 0) {
				const envPath = path.join(projectPath, ".env.example");
				const envContent = template.envVariables
					.map(
						(env) =>
							`# ${env.description}\n${env.name}=${env.defaultValue || ""}`,
					)
					.join("\n\n");

				if (await fs.pathExists(envPath)) {
					const existing = await fs.readFile(envPath, "utf-8");
					await fs.writeFile(envPath, existing + "\n\n" + envContent);
				} else {
					await fs.writeFile(envPath, envContent);
				}
				injectedFiles.push(".env.example");
			}

			return {
				serviceId: service.serviceId,
				serviceType: service.serviceType,
				provider: service.provider,
				status: errors.length > 0 ? "failed" : "success",
				injectedFiles,
				createdFiles,
				environmentVariables: template.envVariables.map((env) => ({
					name: env.name,
					value: env.defaultValue || "",
					required: env.required,
				})),
				postInstallSteps: template.postInjectionSteps.map(
					(step) => step.description,
				),
				errors,
				warnings,
				injectionTime: Date.now() - startTime,
				injectedAt: new Date(),
			};
		} catch (error) {
			return {
				serviceId: service.serviceId,
				serviceType: service.serviceType,
				provider: service.provider,
				status: "failed",
				injectedFiles: [],
				createdFiles: [],
				environmentVariables: [],
				postInstallSteps: [],
				errors: [error instanceof Error ? error.message : String(error)],
				warnings,
				injectionTime: Date.now() - startTime,
				injectedAt: new Date(),
			};
		}
	}

	async injectServices(
		services: ServiceConfiguration[],
		projectPath: string,
		projectContext: ProjectContext,
		options: any = {},
	): Promise<ServiceInjectionResult[]> {
		const results: ServiceInjectionResult[] = [];

		for (const service of services) {
			// Get template from service configuration
			const template = service.configuration as ServiceTemplate;
			if (!template || !template.injectionPoints) {
				results.push({
					serviceId: service.serviceId,
					serviceType: service.serviceType,
					provider: service.provider,
					status: "failed",
					injectedFiles: [],
					createdFiles: [],
					environmentVariables: [],
					postInstallSteps: [],
					errors: ["Invalid service template"],
					warnings: [],
					injectionTime: 0,
					injectedAt: new Date(),
				});
				continue;
			}

			const result = await this.injectService(
				service,
				template,
				projectPath,
				projectContext,
				options,
			);

			results.push(result);

			if (result.status === "failed" && service.required) {
				consola.error(
					`Required service ${service.serviceType} failed to inject`,
				);
				break;
			}
		}

		return results;
	}

	private async renderTemplate(
		template: string,
		context: any,
	): Promise<string> {
		// Check if template is a file path or inline template
		if (template.includes("/") && !template.includes("\n")) {
			// It's a file path, use template loader
			return await templateLoader.renderTemplate(template, context);
		} else {
			// It's an inline template, use the existing caching mechanism
			let compiledTemplate = this.templateCache.get(template);

			if (!compiledTemplate) {
				compiledTemplate = Handlebars.compile(template);
				this.templateCache.set(template, compiledTemplate);
			}

			return compiledTemplate(context);
		}
	}

	private deepMerge(target: any, source: any): any {
		const result = { ...target };

		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				if (
					typeof source[key] === "object" &&
					source[key] !== null &&
					!Array.isArray(source[key])
				) {
					result[key] = this.deepMerge(result[key] || {}, source[key]);
				} else if (Array.isArray(source[key]) && Array.isArray(result[key])) {
					// Merge arrays by concatenating unique values
					result[key] = [...new Set([...result[key], ...source[key]])];
				} else {
					result[key] = source[key];
				}
			}
		}

		return result;
	}

	private registerHelpers(): void {
		// Register common Handlebars helpers
		Handlebars.registerHelper("eq", (a, b) => a === b);
		Handlebars.registerHelper("ne", (a, b) => a !== b);
		Handlebars.registerHelper("lt", (a, b) => a < b);
		Handlebars.registerHelper("gt", (a, b) => a > b);
		Handlebars.registerHelper("lte", (a, b) => a <= b);
		Handlebars.registerHelper("gte", (a, b) => a >= b);
		Handlebars.registerHelper("and", (...args) => {
			return Array.prototype.slice.call(args, 0, -1).every(Boolean);
		});
		Handlebars.registerHelper("or", (...args) => {
			return Array.prototype.slice.call(args, 0, -1).some(Boolean);
		});
		Handlebars.registerHelper("not", (value) => !value);
		Handlebars.registerHelper("json", (context) =>
			JSON.stringify(context, null, 2),
		);
		Handlebars.registerHelper("capitalize", (str) => {
			if (typeof str !== "string") return "";
			return str.charAt(0).toUpperCase() + str.slice(1);
		});
		Handlebars.registerHelper("lowercase", (str) => {
			if (typeof str !== "string") return "";
			return str.toLowerCase();
		});
		Handlebars.registerHelper("uppercase", (str) => {
			if (typeof str !== "string") return "";
			return str.toUpperCase();
		});
	}
}
