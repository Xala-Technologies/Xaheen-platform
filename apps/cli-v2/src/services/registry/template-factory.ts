/**
 * Template Factory
 *
 * Factory pattern for creating service templates.
 * Open/Closed Principle: Open for extension (new providers), closed for modification.
 */

import type { ServiceTemplate, ServiceType } from "../../types/index.js";
import {
	Auth0TemplateProvider,
	BetterAuthTemplateProvider,
	ClerkTemplateProvider,
} from "./template-providers/auth-template-provider.js";
import { BaseTemplateProvider } from "./template-providers/base-template-provider.js";
import {
	NextJSTemplateProvider,
	NuxtTemplateProvider,
	RemixTemplateProvider,
} from "./template-providers/frontend-template-provider.js";

export interface ITemplateFactory {
	createTemplate(
		serviceType: ServiceType,
		provider: string,
	): ServiceTemplate | null;
	registerProvider(provider: BaseTemplateProvider): void;
}

export class TemplateFactory implements ITemplateFactory {
	private providers: Map<string, BaseTemplateProvider> = new Map();

	constructor() {
		this.registerDefaultProviders();
	}

	private registerDefaultProviders(): void {
		// Frontend providers
		this.registerProvider(new NextJSTemplateProvider());
		this.registerProvider(new NuxtTemplateProvider());
		this.registerProvider(new RemixTemplateProvider());

		// Auth providers
		this.registerProvider(new BetterAuthTemplateProvider());
		this.registerProvider(new ClerkTemplateProvider());
		this.registerProvider(new Auth0TemplateProvider());
	}

	registerProvider(provider: BaseTemplateProvider): void {
		const template = provider.createTemplate();
		const key = `${template.type}:${template.provider}`;
		this.providers.set(key, provider);
	}

	createTemplate(
		serviceType: ServiceType,
		provider: string,
	): ServiceTemplate | null {
		const key = `${serviceType}:${provider}`;
		const templateProvider = this.providers.get(key);

		if (!templateProvider) {
			return null;
		}

		return templateProvider.createTemplate();
	}

	getAvailableProviders(serviceType: ServiceType): string[] {
		const providers: string[] = [];

		for (const [key, provider] of this.providers) {
			const template = provider.createTemplate();
			if (template.type === serviceType) {
				providers.push(template.provider);
			}
		}

		return providers;
	}

	getAllTemplates(): ServiceTemplate[] {
		const templates: ServiceTemplate[] = [];

		for (const provider of this.providers.values()) {
			templates.push(provider.createTemplate());
		}

		return templates;
	}
}
