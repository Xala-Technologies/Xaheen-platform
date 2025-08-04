/**
 * Presets Domain Models
 * Single Responsibility: Encapsulate preset template behavior
 */

import type { PresetTemplate, ProjectType, StackState } from "../types/base";

export class PresetDefinition implements PresetTemplate {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly description: string,
		public readonly projectType: string,
		public readonly stack: Partial<StackState>,
		public readonly examples: readonly string[] = [],
	) {}

	public getProjectType(): ProjectType {
		return this.projectType as ProjectType;
	}

	public isForProjectType(projectType: ProjectType): boolean {
		return this.projectType === projectType;
	}

	public hasExamples(): boolean {
		return this.examples.length > 0;
	}

	public getStackConfiguration(): Partial<StackState> {
		return { ...this.stack };
	}
}

export class PresetRegistry {
	constructor(private readonly presets: readonly PresetDefinition[]) {}

	public getAllPresets(): readonly PresetDefinition[] {
		return this.presets;
	}

	public getPresetById(id: string): PresetDefinition | null {
		return this.presets.find((preset) => preset.id === id) || null;
	}

	public getPresetsForProjectType(
		projectType: ProjectType,
	): readonly PresetDefinition[] {
		return this.presets.filter((preset) =>
			preset.isForProjectType(projectType),
		);
	}

	public hasPresets(): boolean {
		return this.presets.length > 0;
	}

	public getPresetCount(): number {
		return this.presets.length;
	}
}
