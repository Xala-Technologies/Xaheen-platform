/**
 * Stack Adapter Architecture
 *
 * Provides an extensible system for supporting multiple technology stacks
 * (Next.js, Django, .NET, Angular, etc.) with a unified interface.
 */

import {
	GeneratedFile,
	GeneratorContext,
	StackAdapter,
	StackType,
} from "../../types/index.js";
import { NestJsAdapter } from "./adapters/nestjs.adapter.js";
import { NextJsAdapter } from "./adapters/nextjs.adapter.js";
// Future adapters
// import { DjangoAdapter } from './adapters/django.adapter.js';
// import { DotNetAdapter } from './adapters/dotnet.adapter.js';
// import { AngularAdapter } from './adapters/angular.adapter.js';
// import { VueAdapter } from './adapters/vue.adapter.js';
// import { LaravelAdapter } from './adapters/laravel.adapter.js';

export class StackAdapterRegistry {
	private static instance: StackAdapterRegistry;
	private adapters: Map<StackType, StackAdapter> = new Map();
	private currentStack: StackType = "nextjs"; // Default stack

	private constructor() {
		this.registerDefaultAdapters();
	}

	static getInstance(): StackAdapterRegistry {
		if (!StackAdapterRegistry.instance) {
			StackAdapterRegistry.instance = new StackAdapterRegistry();
		}
		return StackAdapterRegistry.instance;
	}

	private registerDefaultAdapters(): void {
		// Register built-in adapters
		this.registerAdapter("nextjs", new NextJsAdapter());
		this.registerAdapter("nestjs", new NestJsAdapter());

		// Future adapters will be registered here
		// this.registerAdapter('django', new DjangoAdapter());
		// this.registerAdapter('dotnet', new DotNetAdapter());
		// this.registerAdapter('angular', new AngularAdapter());
		// this.registerAdapter('vue', new VueAdapter());
		// this.registerAdapter('laravel', new LaravelAdapter());
	}

	registerAdapter(type: StackType, adapter: StackAdapter): void {
		this.adapters.set(type, adapter);
	}

	getAdapter(type?: StackType): StackAdapter {
		const stackType = type || this.currentStack;
		const adapter = this.adapters.get(stackType);

		if (!adapter) {
			throw new Error(`No adapter found for stack: ${stackType}`);
		}

		return adapter;
	}

	setCurrentStack(type: StackType): void {
		if (!this.adapters.has(type)) {
			throw new Error(`Stack type "${type}" is not registered`);
		}
		this.currentStack = type;
	}

	getCurrentStack(): StackType {
		return this.currentStack;
	}

	getAvailableStacks(): StackType[] {
		return Array.from(this.adapters.keys());
	}

	/**
	 * Detect the stack type from the project structure
	 */
	async detectStack(projectPath: string = "."): Promise<StackType> {
		// Check for Next.js
		if (
			(await this.fileExists(`${projectPath}/next.config.js`)) ||
			(await this.fileExists(`${projectPath}/next.config.ts`))
		) {
			return "nextjs";
		}

		// Check for NestJS
		if (await this.fileExists(`${projectPath}/nest-cli.json`)) {
			return "nestjs";
		}

		// Check for Django
		if (
			(await this.fileExists(`${projectPath}/manage.py`)) &&
			(await this.fileExists(`${projectPath}/requirements.txt`))
		) {
			return "django";
		}

		// Check for .NET
		if (
			(await this.fileExists(`${projectPath}/*.csproj`)) ||
			(await this.fileExists(`${projectPath}/*.sln`))
		) {
			return "dotnet";
		}

		// Check for Angular
		if (await this.fileExists(`${projectPath}/angular.json`)) {
			return "angular";
		}

		// Check for Vue
		if (await this.fileExists(`${projectPath}/vue.config.js`)) {
			return "vue";
		}

		// Check for Laravel
		if (
			(await this.fileExists(`${projectPath}/artisan`)) &&
			(await this.fileExists(`${projectPath}/composer.json`))
		) {
			return "laravel";
		}

		// Check for React (generic)
		if (await this.fileExists(`${projectPath}/package.json`)) {
			const fs = await import("fs/promises");
			const packageJson = JSON.parse(
				await fs.readFile(`${projectPath}/package.json`, "utf-8"),
			);

			if (packageJson.dependencies?.react) {
				return "react";
			}
		}

		// Default to Next.js for now
		return "nextjs";
	}

	private async fileExists(pattern: string): Promise<boolean> {
		const fs = await import("fs/promises");
		const glob = await import("glob");

		if (pattern.includes("*")) {
			const files = await glob.glob(pattern);
			return files.length > 0;
		}

		try {
			await fs.access(pattern);
			return true;
		} catch {
			return false;
		}
	}
}

/**
 * Universal Generator that uses stack adapters
 */
export class UniversalGenerator {
	private registry: StackAdapterRegistry;

	constructor() {
		this.registry = StackAdapterRegistry.getInstance();
	}

	async generateModel(context: GeneratorContext): Promise<GeneratedFile[]> {
		const adapter = this.registry.getAdapter(context.stackType);
		return adapter.generateModel(context);
	}

	async generateController(
		context: GeneratorContext,
	): Promise<GeneratedFile[]> {
		const adapter = this.registry.getAdapter(context.stackType);
		return adapter.generateController(context);
	}

	async generateService(context: GeneratorContext): Promise<GeneratedFile[]> {
		const adapter = this.registry.getAdapter(context.stackType);
		return adapter.generateService(context);
	}

	async generateMigration(context: GeneratorContext): Promise<GeneratedFile[]> {
		const adapter = this.registry.getAdapter(context.stackType);
		return adapter.generateMigration(context);
	}

	async generateRoute(context: GeneratorContext): Promise<GeneratedFile[]> {
		const adapter = this.registry.getAdapter(context.stackType);
		return adapter.generateRoute(context);
	}
}
