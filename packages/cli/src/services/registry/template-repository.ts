/**
 * Template Repository
 *
 * Repository pattern for accessing templates.
 * Interface Segregation Principle: Specific interfaces for different operations.
 */

import type { ServiceTemplate, ServiceType } from "../../types/index.js";
import { TemplateFactory } from "./template-factory.js";

export interface ITemplateReader {
	getTemplate(
		serviceType: ServiceType,
		provider: string,
	): ServiceTemplate | null;
	getAllTemplates(): ServiceTemplate[];
	getTemplatesByType(serviceType: ServiceType): ServiceTemplate[];
}

export interface ITemplateValidator {
	validateTemplate(template: ServiceTemplate): boolean;
	validateCompatibility(template: ServiceTemplate, framework: string): boolean;
}

export interface ITemplateRepository
	extends ITemplateReader,
		ITemplateValidator {
	listProviders(serviceType: ServiceType): string[];
}

export class TemplateRepository implements ITemplateRepository {
	private factory: TemplateFactory;
	private cache: Map<string, ServiceTemplate> = new Map();

	constructor(factory?: TemplateFactory) {
		this.factory = factory || new TemplateFactory();
	}

	getTemplate(
		serviceType: ServiceType,
		provider: string,
	): ServiceTemplate | null {
		const cacheKey = `${serviceType}:${provider}`;

		// Check cache first
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!;
		}

		// Create from factory
		const template = this.factory.createTemplate(serviceType, provider);

		if (template) {
			this.cache.set(cacheKey, template);
		}

		return template;
	}

	getAllTemplates(): ServiceTemplate[] {
		return this.factory.getAllTemplates();
	}

	getTemplatesByType(serviceType: ServiceType): ServiceTemplate[] {
		return this.getAllTemplates().filter((t) => t.type === serviceType);
	}

	listProviders(serviceType: ServiceType): string[] {
		return this.factory.getAvailableProviders(serviceType);
	}

	validateTemplate(template: ServiceTemplate): boolean {
		// Basic validation
		if (!template.name || !template.type || !template.provider) {
			return false;
		}

		if (!template.version || !template.description) {
			return false;
		}

		// Validate injection points
		for (const point of template.injectionPoints) {
			if (!point.type || !point.target || !point.template) {
				return false;
			}
			if (typeof point.priority !== "number") {
				return false;
			}
		}

		// Validate env variables
		for (const env of template.envVariables) {
			if (!env.name || !env.description) {
				return false;
			}
		}

		// Validate dependencies
		for (const dep of template.dependencies) {
			if (!dep.serviceType) {
				return false;
			}
		}

		return true;
	}

	validateCompatibility(template: ServiceTemplate, framework: string): boolean {
		// If no frameworks specified, assume compatible with all
		if (template.frameworks.length === 0) {
			return true;
		}

		return template.frameworks.includes(framework);
	}

	clearCache(): void {
		this.cache.clear();
	}
}
