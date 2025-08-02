/**
 * Tech Stack Domain Models
 * Encapsulates tech stack related data and behavior
 */

import type { TechOption, TechCategory } from '../types/base';

export class TechStackOption implements TechOption {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly description: string,
		public readonly icon: string,
		public readonly color: string,
		public readonly isDefaultOption: boolean = false,
		public readonly className?: string
	) {}

	public isDefault(): boolean {
		return this.isDefaultOption;
	}

	public hasIcon(): boolean {
		return this.icon.length > 0;
	}
}

export class TechStackCategory {
	constructor(
		public readonly key: TechCategory,
		public readonly options: readonly TechStackOption[]
	) {}

	public getDefaultOption(): TechStackOption | null {
		return this.options.find(option => option.isDefault()) || null;
	}

	public getOptionById(id: string): TechStackOption | null {
		return this.options.find(option => option.id === id) || null;
	}

	public getAllOptions(): readonly TechStackOption[] {
		return this.options;
	}

	public hasOptions(): boolean {
		return this.options.length > 0;
	}
}

export class TechStackRegistry {
	constructor(
		private readonly categories: Map<TechCategory, TechStackCategory>
	) {}

	public getCategory(key: TechCategory): TechStackCategory | null {
		return this.categories.get(key) || null;
	}

	public getAllCategories(): readonly TechStackCategory[] {
		return Array.from(this.categories.values());
	}

	public getCategoryKeys(): readonly TechCategory[] {
		return Array.from(this.categories.keys());
	}

	public hasCategory(key: TechCategory): boolean {
		return this.categories.has(key);
	}
}
