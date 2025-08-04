/**
 * Stack Adapter Type Definitions
 *
 * Defines the contracts for stack adapters to implement
 */

export type StackType =
	| "nextjs" // Next.js (React framework)
	| "nestjs" // NestJS (Node.js backend)
	| "django" // Django (Python)
	| "dotnet" // .NET (C#)
	| "angular" // Angular (TypeScript)
	| "vue" // Vue.js
	| "laravel" // Laravel (PHP)
	| "rails" // Ruby on Rails
	| "spring" // Spring Boot (Java)
	| "express" // Express.js (Node.js)
	| "fastapi" // FastAPI (Python)
	| "react" // React (generic)
	| "svelte" // Svelte
	| "remix" // Remix
	| "nuxt" // Nuxt (Vue framework)
	| "gatsby" // Gatsby (React framework)
	| "custom"; // Custom stack

export interface GeneratorContext {
	name: string;
	stack?: StackType;
	options?: GeneratorOptions;
	fields?: ModelField[];
	relations?: ModelRelation[];
	projectPath?: string;
}

export interface GeneratorOptions {
	typescript?: boolean;
	javascript?: boolean;
	migration?: boolean;
	controller?: boolean;
	service?: boolean;
	repository?: boolean;
	validation?: boolean;
	test?: boolean;
	factory?: boolean;
	seeder?: boolean;
	api?: boolean;
	resource?: boolean;
	crud?: boolean;
	auth?: boolean;
	middleware?: boolean;
	force?: boolean;
	dry?: boolean;
}

export interface ModelField {
	name: string;
	type: FieldType;
	required?: boolean;
	unique?: boolean;
	index?: boolean;
	default?: any;
	validation?: FieldValidation;
}

export type FieldType =
	| "string"
	| "text"
	| "integer"
	| "float"
	| "decimal"
	| "boolean"
	| "date"
	| "datetime"
	| "time"
	| "json"
	| "uuid"
	| "enum"
	| "array"
	| "object"
	| "reference";

export interface FieldValidation {
	min?: number;
	max?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	enum?: string[];
	email?: boolean;
	url?: boolean;
	alpha?: boolean;
	numeric?: boolean;
	alphanumeric?: boolean;
}

export interface ModelRelation {
	name: string;
	type: "hasOne" | "hasMany" | "belongsTo" | "belongsToMany";
	model: string;
	foreignKey?: string;
	pivotTable?: string;
	cascade?: boolean;
}

export interface GeneratedFile {
	path: string;
	content: string;
	type: FileType;
	description?: string;
}

export type FileType =
	| "model"
	| "migration"
	| "controller"
	| "service"
	| "repository"
	| "component"
	| "page"
	| "view"
	| "template"
	| "test"
	| "config"
	| "route"
	| "middleware"
	| "validation"
	| "type"
	| "interface"
	| "enum"
	| "factory"
	| "seeder"
	| "fixture";

/**
 * Stack Adapter Interface
 * Every stack adapter must implement this interface
 */
export interface StackAdapter {
	readonly name: string;
	readonly version: string;
	readonly type: StackType;

	// Core generators
	generateModel(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateController(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateService(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateRepository?(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateComponent(context: GeneratorContext): Promise<GeneratedFile[]>;
	generatePage(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateView?(context: GeneratorContext): Promise<GeneratedFile[]>;

	// Database generators
	generateMigration(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateSeeder?(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateFactory?(context: GeneratorContext): Promise<GeneratedFile[]>;

	// Validation and types
	generateValidation(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateTypes?(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateInterface?(context: GeneratorContext): Promise<GeneratedFile[]>;

	// Testing
	generateTest(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateE2ETest?(context: GeneratorContext): Promise<GeneratedFile[]>;

	// Composite generators
	generateCrud(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateApi?(context: GeneratorContext): Promise<GeneratedFile[]>;
	generateAuth?(context: GeneratorContext): Promise<GeneratedFile[]>;

	// Configuration and metadata
	getConfig(): StackConfig;
	getPaths(): StackPaths;
	getFileExtensions(): FileExtensions;
	getCommands(): StackCommands;
	getDependencies(): StackDependencies;

	// Validation
	validateContext(context: GeneratorContext): ValidationResult;
	isSupported(feature: string): boolean;
}

export interface StackConfig {
	language:
		| "typescript"
		| "javascript"
		| "python"
		| "csharp"
		| "java"
		| "php"
		| "ruby"
		| "go";
	framework: string;
	orm?: string;
	ui?: string;
	testFramework?: string;
	packageManager?:
		| "npm"
		| "yarn"
		| "pnpm"
		| "bun"
		| "pip"
		| "composer"
		| "gem"
		| "cargo"
		| "go"
		| "nuget"
		| "maven"
		| "gradle";
	buildTool?: string;
	features?: string[];
}

export interface StackPaths {
	src: string;
	models?: string;
	controllers?: string;
	services?: string;
	components?: string;
	pages?: string;
	views?: string;
	api?: string;
	tests?: string;
	migrations?: string;
	config?: string;
	public?: string;
	assets?: string;
}

export interface FileExtensions {
	script: string; // .ts, .js, .py, .cs, .java, etc.
	style: string; // .css, .scss, .less, etc.
	config: string; // .json, .yaml, .toml, etc.
	markup?: string; // .tsx, .jsx, .vue, .svelte, etc.
	template?: string; // .ejs, .hbs, .blade.php, etc.
}

export interface StackCommands {
	install: string;
	dev: string;
	build: string;
	start: string;
	test: string;
	lint?: string;
	format?: string;
	migrate?: string;
	seed?: string;
}

export interface StackDependencies {
	core: string[];
	dev: string[];
	optional?: string[];
	peer?: string[];
}

export interface ValidationResult {
	valid: boolean;
	errors?: string[];
	warnings?: string[];
	suggestions?: string[];
}

/**
 * Base adapter class that provides common functionality
 */
export abstract class BaseStackAdapter implements StackAdapter {
	abstract readonly name: string;
	abstract readonly version: string;
	abstract readonly type: StackType;

	// Must be implemented by each adapter
	abstract generateModel(context: GeneratorContext): Promise<GeneratedFile[]>;
	abstract generateController(
		context: GeneratorContext,
	): Promise<GeneratedFile[]>;
	abstract generateService(context: GeneratorContext): Promise<GeneratedFile[]>;
	abstract generateComponent(
		context: GeneratorContext,
	): Promise<GeneratedFile[]>;
	abstract generatePage(context: GeneratorContext): Promise<GeneratedFile[]>;
	abstract generateMigration(
		context: GeneratorContext,
	): Promise<GeneratedFile[]>;
	abstract generateValidation(
		context: GeneratorContext,
	): Promise<GeneratedFile[]>;
	abstract generateTest(context: GeneratorContext): Promise<GeneratedFile[]>;
	abstract generateCrud(context: GeneratorContext): Promise<GeneratedFile[]>;

	abstract getConfig(): StackConfig;
	abstract getPaths(): StackPaths;
	abstract getFileExtensions(): FileExtensions;
	abstract getCommands(): StackCommands;
	abstract getDependencies(): StackDependencies;

	// Common validation logic
	validateContext(context: GeneratorContext): ValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];
		const suggestions: string[] = [];

		if (!context.name) {
			errors.push("Name is required");
		}

		if (context.name && !/^[a-zA-Z][a-zA-Z0-9]*$/.test(context.name)) {
			warnings.push(
				"Name should start with a letter and contain only alphanumeric characters",
			);
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
			suggestions,
		};
	}

	isSupported(feature: string): boolean {
		const config = this.getConfig();
		return config.features?.includes(feature) || false;
	}

	// Helper methods for all adapters
	protected toPascalCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toUpperCase());
	}

	protected toCamelCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toLowerCase());
	}

	protected toKebabCase(str: string): string {
		return str
			.replace(/([A-Z])/g, "-$1")
			.toLowerCase()
			.replace(/^-/, "")
			.replace(/\s+/g, "-");
	}

	protected toSnakeCase(str: string): string {
		return str
			.replace(/([A-Z])/g, "_$1")
			.toLowerCase()
			.replace(/^_/, "")
			.replace(/\s+/g, "_");
	}

	protected pluralize(str: string): string {
		if (str.endsWith("y")) {
			return str.slice(0, -1) + "ies";
		} else if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch")) {
			return str + "es";
		} else {
			return str + "s";
		}
	}
}
