/**
 * Service Registry
 *
 * Main service registry implementation following SOLID principles.
 * Manages service templates and configurations for the CLI.
 */

import { consola } from "consola";
import type {
	IServiceRegistry,
	ServiceConfiguration,
	ServiceTemplate,
	ServiceType,
} from "../../types/index.js";
import { TemplateFactory } from "./template-factory";
import {
	type ITemplateRepository,
	TemplateRepository,
} from "./template-repository.js";

export class ServiceRegistry implements IServiceRegistry {
	private repository: ITemplateRepository;
	private services: Map<string, ServiceConfiguration> = new Map();
	private initialized = false;

	constructor(repository?: ITemplateRepository) {
		this.repository =
			repository || new TemplateRepository(new TemplateFactory());
	}

	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		consola.debug("Initializing Service Registry...");

		try {
			// Load all templates to validate them
			const templates = this.repository.getAllTemplates();

			for (const template of templates) {
				if (!this.repository.validateTemplate(template)) {
					consola.warn(`Invalid template: ${template.name}`);
					continue;
				}

				// Create service configuration from template
				const config: ServiceConfiguration = {
					serviceId: `${template.type}-${template.provider}`,
					serviceType: template.type,
					provider: template.provider,
					version: template.version,
					required: false,
					priority: 50,
					configuration: template,
					environmentVariables: template.envVariables.map((env) => ({
						name: env.name,
						value: env.defaultValue,
						required: env.required,
					})),
					dependencies: template.dependencies.map((dep) => ({
						serviceType: dep.serviceType,
						provider: dep.provider || "",
						version: dep.version || "",
					})),
					postInstallSteps: template.postInjectionSteps.map(
						(step) => step.description,
					),
					verificationSteps: [],
				};

				const key = `${template.type}:${template.provider}`;
				this.services.set(key, config);
			}

			this.initialized = true;
			consola.success(
				`Service Registry initialized with ${this.services.size} services`,
			);
		} catch (error) {
			consola.error("Failed to initialize Service Registry:", error);
			throw error;
		}
	}

	async getTemplate(
		serviceType: ServiceType,
		provider: string,
	): Promise<ServiceTemplate | null> {
		await this.ensureInitialized();
		return this.repository.getTemplate(serviceType, provider);
	}

	async listTemplates(serviceType: ServiceType): Promise<ServiceTemplate[]> {
		await this.ensureInitialized();
		return this.repository.getTemplatesByType(serviceType);
	}

	async getServiceAsync(
		serviceType: ServiceType,
		provider: string,
	): Promise<ServiceConfiguration | null> {
		await this.ensureInitialized();
		const key = `${serviceType}:${provider}`;
		return this.services.get(key) || null;
	}

	async listServices(
		serviceType?: ServiceType,
	): Promise<ServiceConfiguration[]> {
		await this.ensureInitialized();

		const services = Array.from(this.services.values());

		if (serviceType) {
			return services.filter((s) => s.serviceType === serviceType);
		}

		return services;
	}

	async registerTemplate(template: ServiceTemplate): Promise<void> {
		await this.ensureInitialized();

		if (!this.repository.validateTemplate(template)) {
			throw new Error(`Invalid template: ${template.name}`);
		}

		// Create service configuration
		const config: ServiceConfiguration = {
			serviceId: `${template.type}-${template.provider}-custom`,
			serviceType: template.type,
			provider: template.provider,
			version: template.version,
			required: false,
			priority: 50,
			configuration: template,
			environmentVariables: template.envVariables.map((env) => ({
				name: env.name,
				value: env.defaultValue,
				required: env.required,
			})),
			dependencies: template.dependencies.map((dep) => ({
				serviceType: dep.serviceType,
				provider: dep.provider || "",
				version: dep.version || "",
			})),
			postInstallSteps: template.postInjectionSteps.map(
				(step) => step.description,
			),
			verificationSteps: [],
		};

		const key = `${template.type}:${template.provider}`;
		this.services.set(key, config);

		consola.success(
			`Registered template: ${template.type}:${template.provider}`,
		);
	}

	async validateTemplate(template: ServiceTemplate): Promise<boolean> {
		return this.repository.validateTemplate(template);
	}

	async searchTemplates(query: string): Promise<ServiceTemplate[]> {
		await this.ensureInitialized();

		const allTemplates = this.repository.getAllTemplates();
		const searchTerm = query.toLowerCase();

		return allTemplates.filter((template) => {
			return (
				template.name.toLowerCase().includes(searchTerm) ||
				template.description.toLowerCase().includes(searchTerm) ||
				template.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
				template.provider.toLowerCase().includes(searchTerm)
			);
		});
	}

	async getCompatibleTemplates(
		serviceType: ServiceType,
		framework: string,
	): Promise<ServiceTemplate[]> {
		await this.ensureInitialized();

		const templates = await this.listTemplates(serviceType);

		return templates.filter((template) =>
			this.repository.validateCompatibility(template, framework),
		);
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
	}

	// Additional methods expected by tests
	getAllServices(): ServiceConfiguration[] {
		return Array.from(this.services.values());
	}

	getServicesByCategory(category: string): ServiceConfiguration[] {
		return Array.from(this.services.values()).filter(
			service => service.serviceType === category || service.configuration?.category === category
		);
	}

	registerService(service: ServiceConfiguration): void {
		this.services.set(service.serviceId, service);
	}

	checkCompatibility(services: ServiceConfiguration[]): { compatible: boolean; conflicts?: string[] } {
		const conflicts: string[] = [];
		const providers = new Set<string>();
		const types = new Map<string, string>();

		for (const service of services) {
			const key = `${service.serviceType}:${service.provider}`;
			
			if (providers.has(key)) {
				conflicts.push(`Duplicate service: ${key}`);
			}
			providers.add(key);

			// Check for type conflicts (e.g., multiple databases)
			if (types.has(service.serviceType)) {
				const existingProvider = types.get(service.serviceType);
				if (existingProvider !== service.provider) {
					conflicts.push(`Type conflict: ${service.serviceType} has multiple providers (${existingProvider}, ${service.provider})`);
				}
			}
			types.set(service.serviceType, service.provider);
		}

		return {
			compatible: conflicts.length === 0,
			conflicts: conflicts.length > 0 ? conflicts : undefined
		};
	}

	// Add getService method for compatibility with tests
	getService(serviceId: string): ServiceConfiguration | undefined {
		return this.get(serviceId);
	}

	// Implement missing interface methods
	register(service: ServiceConfiguration): void {
		this.registerService(service);
	}

	get(name: string): ServiceConfiguration | undefined {
		return this.services.get(name);
	}

	list(): ServiceConfiguration[] {
		return this.getAllServices();
	}
}

// Re-export related modules for convenience
export { TemplateFactory } from "./template-factory";
export { BaseTemplateProvider } from "./template-providers/base-template-provider";
export { TemplateRepository } from "./template-repository";
