/**
 * Template Factory
 *
 * Factory pattern for creating service templates.
 * Open/Closed Principle: Open for extension (new providers), closed for modification.
 */

import type { ServiceTemplate, ServiceType } from "../../types/index";
import {
	Auth0TemplateProvider,
	BetterAuthTemplateProvider,
	ClerkTemplateProvider,
} from "./template-providers/auth-template-provider.js";
import {
	ExpressTemplateProvider,
	FastifyTemplateProvider,
	NestJSTemplateProvider,
} from "./template-providers/backend-template-provider.js";
import { BaseTemplateProvider } from "./template-providers/base-template-provider";
import {
	DrizzleTemplateProvider,
	MongooseTemplateProvider,
	PrismaTemplateProvider,
} from "./template-providers/database-template-provider.js";
import {
	NextJSTemplateProvider,
	NuxtTemplateProvider,
	ReactTemplateProvider,
	RemixTemplateProvider,
} from "./template-providers/frontend-template-provider.js";
import {
	AltinnTemplateProvider,
	BankIDTemplateProvider,
	VippsTemplateProvider,
} from "./template-providers/integrations-template-provider.js";

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
		this.registerProvider(new ReactTemplateProvider());
		this.registerProvider(new NuxtTemplateProvider());
		this.registerProvider(new RemixTemplateProvider());

		// Backend providers
		this.registerProvider(new ExpressTemplateProvider());
		this.registerProvider(new FastifyTemplateProvider());
		this.registerProvider(new NestJSTemplateProvider());

		// Database providers
		this.registerProvider(new PrismaTemplateProvider());
		this.registerProvider(new DrizzleTemplateProvider());
		this.registerProvider(new MongooseTemplateProvider());

		// Norwegian integrations providers
		this.registerProvider(new AltinnTemplateProvider());
		this.registerProvider(new BankIDTemplateProvider());
		this.registerProvider(new VippsTemplateProvider());

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
