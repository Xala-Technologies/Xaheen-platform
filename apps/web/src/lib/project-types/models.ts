/**
 * Project Types Domain Models
 * Single Responsibility: Encapsulate project type behavior and data
 */

import type { ProjectType, ProjectTypeConfig } from "../types/base";

export class ProjectTypeDefinition implements ProjectTypeConfig {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly description: string,
		public readonly icon: string,
		public readonly color: string,
		public readonly relevantCategories: readonly string[],
		public readonly defaultSelections: Record<string, string | string[]>,
	) {}

	public isRelevantCategory(category: string): boolean {
		return this.relevantCategories.includes(category);
	}

	public getDefaultForCategory(
		category: string,
	): string | string[] | undefined {
		return this.defaultSelections[category];
	}

	public hasDefaults(): boolean {
		return Object.keys(this.defaultSelections).length > 0;
	}

	public getProjectType(): ProjectType {
		return this.id as ProjectType;
	}
}

export class ProjectTypeRegistry {
	constructor(
		private readonly projectTypes: Map<ProjectType, ProjectTypeDefinition>,
	) {}

	public getProjectType(id: ProjectType): ProjectTypeDefinition | null {
		return this.projectTypes.get(id) || null;
	}

	public getAllProjectTypes(): readonly ProjectTypeDefinition[] {
		return Array.from(this.projectTypes.values());
	}

	public getProjectTypeIds(): readonly ProjectType[] {
		return Array.from(this.projectTypes.keys());
	}

	public hasProjectType(id: ProjectType): boolean {
		return this.projectTypes.has(id);
	}

	public findByRelevantCategory(
		category: string,
	): readonly ProjectTypeDefinition[] {
		return this.getAllProjectTypes().filter((pt) =>
			pt.isRelevantCategory(category),
		);
	}
}
