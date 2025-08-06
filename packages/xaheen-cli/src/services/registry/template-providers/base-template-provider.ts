/**
 * Base Template Provider
 *
 * Abstract base class for service template providers.
 * Follows Single Responsibility Principle - only responsible for template structure.
 */

import type { ServiceTemplate, ServiceType } from "../../../types/index";

export abstract class BaseTemplateProvider {
	protected readonly serviceType: ServiceType;
	protected readonly provider: string;
	protected readonly version: string;

	constructor(serviceType: ServiceType, provider: string, version: string) {
		this.serviceType = serviceType;
		this.provider = provider;
		this.version = version;
	}

	abstract createTemplate(): ServiceTemplate;

	protected createBaseTemplate(
		name: string,
		description: string,
	): Partial<ServiceTemplate> {
		return {
			name,
			type: this.serviceType,
			provider: this.provider,
			version: this.version,
			description,
			injectionPoints: [],
			envVariables: [],
			dependencies: [],
			postInjectionSteps: [],
			frameworks: [],
			databases: [],
			platforms: ["web"],
			tags: [],
		};
	}

	protected createFileInjectionPoint(
		target: string,
		template: string,
		priority = 50,
	) {
		return {
			type: "file-create" as const,
			target,
			template,
			priority,
		};
	}

	protected createJsonMergePoint(
		target: string,
		content: Record<string, any>,
		priority = 50,
	) {
		return {
			type: "json-merge" as const,
			target,
			template: JSON.stringify(content, null, 2),
			priority,
		};
	}

	protected createEnvVariable(
		name: string,
		description: string,
		required = false,
		defaultValue?: string,
	) {
		return {
			name,
			description,
			required,
			defaultValue,
			type: "string" as const,
			sensitive: name.includes("SECRET") || name.includes("KEY"),
		};
	}

	protected createDependency(
		serviceType: ServiceType,
		provider?: string,
		required = false,
	) {
		return {
			serviceType,
			provider,
			required,
		};
	}
}
