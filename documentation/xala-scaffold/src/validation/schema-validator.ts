import { z } from "zod";
import { logger } from "../utils/logger.js";
import {
	BaseValidator,
	createValidationRule,
	ValidationIssue,
	ValidationRule,
	ValidationSeverity,
} from "./base-validator.js";

// Schema validation types
export interface SchemaValidationContext {
	schemaType: "config" | "package" | "tsconfig" | "component-props" | "custom";
	schemaDefinition?: z.ZodSchema;
	strictMode: boolean;
	allowUnknownKeys: boolean;
}

// Predefined schemas for common file types
export const PREDEFINED_SCHEMAS = {
	// Package.json schema
	packageJson: z.object({
		name: z.string().min(1),
		version: z.string().regex(/^\d+\.\d+\.\d+/),
		description: z.string().optional(),
		main: z.string().optional(),
		scripts: z.record(z.string()).optional(),
		dependencies: z.record(z.string()).optional(),
		devDependencies: z.record(z.string()).optional(),
		peerDependencies: z.record(z.string()).optional(),
		keywords: z.array(z.string()).optional(),
		author: z
			.union([
				z.string(),
				z.object({
					name: z.string(),
					email: z.string().email().optional(),
					url: z.string().url().optional(),
				}),
			])
			.optional(),
		license: z.string().optional(),
		repository: z
			.union([
				z.string(),
				z.object({
					type: z.string(),
					url: z.string(),
				}),
			])
			.optional(),
		engines: z
			.object({
				node: z.string().optional(),
				npm: z.string().optional(),
			})
			.optional(),
	}),

	// TypeScript config schema
	tsconfig: z.object({
		compilerOptions: z.object({
			target: z.string(),
			lib: z.array(z.string()).optional(),
			module: z.string(),
			moduleResolution: z.string().optional(),
			esModuleInterop: z.boolean().optional(),
			allowSyntheticDefaultImports: z.boolean().optional(),
			strict: z.boolean().optional(),
			strictNullChecks: z.boolean().optional(),
			noImplicitAny: z.boolean().optional(),
			noImplicitReturns: z.boolean().optional(),
			noUnusedLocals: z.boolean().optional(),
			noUnusedParameters: z.boolean().optional(),
			exactOptionalPropertyTypes: z.boolean().optional(),
			skipLibCheck: z.boolean().optional(),
			jsx: z.enum(["react", "react-jsx", "react-jsxdev"]).optional(),
			declaration: z.boolean().optional(),
			outDir: z.string().optional(),
			rootDir: z.string().optional(),
			baseUrl: z.string().optional(),
			paths: z.record(z.array(z.string())).optional(),
		}),
		include: z.array(z.string()).optional(),
		exclude: z.array(z.string()).optional(),
		extends: z.string().optional(),
	}),

	// ESLint config schema
	eslintConfig: z.object({
		env: z.record(z.boolean()).optional(),
		extends: z.union([z.string(), z.array(z.string())]).optional(),
		parser: z.string().optional(),
		parserOptions: z
			.object({
				ecmaVersion: z.union([z.number(), z.string()]).optional(),
				sourceType: z.enum(["script", "module"]).optional(),
				ecmaFeatures: z.record(z.boolean()).optional(),
			})
			.optional(),
		plugins: z.array(z.string()).optional(),
		rules: z
			.record(
				z.union([
					z.string(),
					z.number(),
					z.array(z.union([z.string(), z.number(), z.record(z.any())])),
				]),
			)
			.optional(),
		settings: z.record(z.any()).optional(),
		overrides: z
			.array(
				z.object({
					files: z.union([z.string(), z.array(z.string())]),
					excludedFiles: z.union([z.string(), z.array(z.string())]).optional(),
					env: z.record(z.boolean()).optional(),
					extends: z.union([z.string(), z.array(z.string())]).optional(),
					parser: z.string().optional(),
					parserOptions: z.record(z.any()).optional(),
					plugins: z.array(z.string()).optional(),
					rules: z.record(z.any()).optional(),
				}),
			)
			.optional(),
	}),

	// Xala project config schema
	xalaConfig: z.object({
		name: z.string().min(1),
		version: z.string().regex(/^\d+\.\d+\.\d+/),
		platform: z.enum(["nextjs", "react", "nestjs", "library"]),
		styling: z.enum(["tailwind", "styled-components", "css-modules"]),
		localization: z.object({
			defaultLocale: z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]),
			supportedLocales: z.array(
				z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]),
			),
			fallbackLocale: z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]),
			rtlLocales: z.array(z.string()).optional(),
		}),
		compliance: z.object({
			nsm: z.object({
				classification: z.enum([
					"OPEN",
					"RESTRICTED",
					"CONFIDENTIAL",
					"SECRET",
				]),
				auditTrail: z.boolean(),
			}),
			gdpr: z.object({
				enabled: z.boolean(),
				dataRetention: z.number().optional(),
				consentRequired: z.boolean(),
			}),
			wcag: z.object({
				level: z.enum(["A", "AA", "AAA"]),
				testing: z.boolean(),
			}),
		}),
		features: z
			.object({
				authentication: z.boolean().optional(),
				database: z.boolean().optional(),
				api: z.boolean().optional(),
				cms: z.boolean().optional(),
				analytics: z.boolean().optional(),
			})
			.optional(),
	}),

	// Component props schema (for TypeScript interfaces)
	componentProps: z.object({
		name: z.string(),
		required: z.boolean(),
		type: z.string(),
		defaultValue: z.any().optional(),
		description: z.string().optional(),
	}),
};

// Schema validator implementation
export class SchemaValidator extends BaseValidator {
	private schemas: Map<string, z.ZodSchema> = new Map();

	constructor(config: Partial<SchemaValidationContext> = {}) {
		super({
			rules: [],
			severity: "error",
			autofix: false,
			exclude: [],
			include: [],
			failFast: false,
			maxIssues: 1000,
			...config,
		});

		this.initializePredefinedSchemas();
	}

	initializeRules(): void {
		const rules: ValidationRule[] = [
			createValidationRule(
				"schema.json-syntax",
				"JSON Syntax Validation",
				"Validates that JSON files have correct syntax",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.package-json",
				"Package.json Schema",
				"Validates package.json against Node.js package schema",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.tsconfig",
				"TypeScript Config Schema",
				"Validates tsconfig.json against TypeScript schema",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.eslint-config",
				"ESLint Config Schema",
				"Validates ESLint configuration files",
				"schema",
				"warning",
				true,
			),
			createValidationRule(
				"schema.xala-config",
				"Xala Project Config",
				"Validates Xala project configuration",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.required-fields",
				"Required Fields",
				"Ensures all required fields are present",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.type-validation",
				"Type Validation",
				"Validates field types match schema definitions",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.format-validation",
				"Format Validation",
				"Validates string formats (email, URL, etc.)",
				"schema",
				"warning",
				true,
			),
			createValidationRule(
				"schema.constraint-validation",
				"Constraint Validation",
				"Validates value constraints (min, max, length, etc.)",
				"schema",
				"error",
				true,
			),
			createValidationRule(
				"schema.deprecated-fields",
				"Deprecated Fields",
				"Warns about deprecated or obsolete fields",
				"schema",
				"warning",
				true,
			),
		];

		for (const rule of rules) {
			this.rules.set(rule.id, rule);
		}
	}

	getDefaultRules(): ValidationRule[] {
		return Array.from(this.rules.values());
	}

	async validateFile(
		file: string,
		content: string,
	): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = [];

		try {
			// Determine file type and appropriate schema
			const fileType = this.getFileType(file);
			const schema = this.getSchemaForFile(file, fileType);

			if (!schema) {
				// Skip files without defined schemas
				return issues;
			}

			// Parse JSON content
			let data: any;
			try {
				data = JSON.parse(content);
			} catch (parseError) {
				if (this.isJsonFile(file)) {
					issues.push({
						id: `schema-json-syntax-${file}`,
						severity: "error",
						category: "schema",
						message: "Invalid JSON syntax",
						description:
							parseError instanceof Error
								? parseError.message
								: "JSON parsing failed",
						file,
						rule: "schema.json-syntax",
						fixable: false,
					});
				}
				return issues;
			}

			// Validate against schema
			const result = schema.safeParse(data);

			if (!result.success) {
				// Convert Zod errors to validation issues
				for (const error of result.error.errors) {
					const issue = this.createIssueFromZodError(error, file, fileType);
					issues.push(issue);
				}
			} else {
				// Additional validation for specific file types
				issues.push(
					...(await this.validateSpecificFileType(file, fileType, data)),
				);
			}
		} catch (error) {
			issues.push({
				id: `schema-validation-error-${file}`,
				severity: "error",
				category: "schema",
				message: "Schema validation failed",
				description:
					error instanceof Error ? error.message : "Unknown validation error",
				file,
				rule: "schema.validation-error",
				fixable: false,
			});
		}

		return issues;
	}

	// Add custom schema
	addSchema(name: string, schema: z.ZodSchema): void {
		this.schemas.set(name, schema);
		logger.debug(`Added custom schema: ${name}`);
	}

	// Remove custom schema
	removeSchema(name: string): void {
		this.schemas.delete(name);
		logger.debug(`Removed schema: ${name}`);
	}

	// Get schema by name
	getSchema(name: string): z.ZodSchema | undefined {
		return this.schemas.get(name);
	}

	// List available schemas
	listSchemas(): string[] {
		return Array.from(this.schemas.keys());
	}

	// Validate data against specific schema
	async validateData(
		data: any,
		schemaName: string,
	): Promise<ValidationIssue[]> {
		const schema = this.schemas.get(schemaName);
		if (!schema) {
			throw new Error(`Schema not found: ${schemaName}`);
		}

		const result = schema.safeParse(data);
		if (result.success) {
			return [];
		}

		return result.error.errors.map((error) =>
			this.createIssueFromZodError(error, "data", schemaName),
		);
	}

	// Private helper methods
	private initializePredefinedSchemas(): void {
		for (const [name, schema] of Object.entries(PREDEFINED_SCHEMAS)) {
			this.schemas.set(name, schema);
		}
	}

	private getFileType(file: string): string {
		const fileName = file.toLowerCase();

		if (fileName.endsWith("package.json")) return "packageJson";
		if (fileName.endsWith("tsconfig.json")) return "tsconfig";
		if (fileName.includes("eslint") && fileName.endsWith(".json"))
			return "eslintConfig";
		if (fileName.endsWith("xala.config.json")) return "xalaConfig";
		if (fileName.endsWith(".json")) return "json";

		return "unknown";
	}

	private getSchemaForFile(
		file: string,
		fileType: string,
	): z.ZodSchema | undefined {
		return this.schemas.get(fileType);
	}

	private isJsonFile(file: string): boolean {
		return file.toLowerCase().endsWith(".json");
	}

	private createIssueFromZodError(
		error: z.ZodIssue,
		file: string,
		fileType: string,
	): ValidationIssue {
		const path = error.path.join(".");
		const message = this.formatZodErrorMessage(error);

		return {
			id: `schema-${fileType}-${path || "root"}`,
			severity: this.getErrorSeverity(error.code),
			category: "schema",
			message,
			description: `Path: ${path || "root"} - ${error.message}`,
			file,
			rule: this.getErrorRule(error.code),
			fixable: this.isErrorFixable(error.code),
			autofix: this.createAutoFix(error, file),
		};
	}

	private formatZodErrorMessage(error: z.ZodIssue): string {
		const path = error.path.length ? error.path.join(".") : "root";

		switch (error.code) {
			case "invalid_type":
				return `Expected ${error.expected} but received ${error.received} at ${path}`;
			case "too_small":
				return `Value at ${path} is too small (minimum: ${error.minimum})`;
			case "too_big":
				return `Value at ${path} is too big (maximum: ${error.maximum})`;
			case "invalid_string":
				return `Invalid string format at ${path}: ${error.validation}`;
			case "invalid_enum_value":
				return `Invalid enum value at ${path}. Expected: ${error.options.join(" | ")}`;
			case "unrecognized_keys":
				return `Unrecognized keys at ${path}: ${error.keys.join(", ")}`;
			default:
				return `Schema validation error at ${path}: ${error.message}`;
		}
	}

	private getErrorSeverity(code: z.ZodIssueCode): ValidationSeverity {
		switch (code) {
			case "invalid_type":
			case "too_small":
			case "too_big":
			case "invalid_enum_value":
				return "error";
			case "invalid_string":
			case "unrecognized_keys":
				return "warning";
			default:
				return "info";
		}
	}

	private getErrorRule(code: z.ZodIssueCode): string {
		switch (code) {
			case "invalid_type":
				return "schema.type-validation";
			case "too_small":
			case "too_big":
				return "schema.constraint-validation";
			case "invalid_string":
				return "schema.format-validation";
			case "invalid_enum_value":
				return "schema.type-validation";
			case "unrecognized_keys":
				return "schema.deprecated-fields";
			default:
				return "schema.validation-error";
		}
	}

	private isErrorFixable(code: z.ZodIssueCode): boolean {
		switch (code) {
			case "unrecognized_keys":
				return true;
			case "invalid_string":
				return false; // Some format issues might be auto-fixable
			default:
				return false;
		}
	}

	private createAutoFix(error: z.ZodIssue, file: string): any {
		if (error.code === "unrecognized_keys") {
			return {
				description: `Remove unrecognized keys: ${error.keys.join(", ")}`,
				operation: "delete",
				target: error.keys.join("|"),
			};
		}

		return undefined;
	}

	private async validateSpecificFileType(
		file: string,
		fileType: string,
		data: any,
	): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = [];

		switch (fileType) {
			case "packageJson":
				issues.push(...this.validatePackageJson(file, data));
				break;
			case "tsconfig":
				issues.push(...this.validateTsConfig(file, data));
				break;
			case "xalaConfig":
				issues.push(...this.validateXalaConfig(file, data));
				break;
		}

		return issues;
	}

	private validatePackageJson(file: string, data: any): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		// Check for required Xala dependencies
		const requiredDeps = [
			"@xala-technologies/ui-system",
			"@xala-technologies/foundation",
		];

		const allDeps = {
			...data.dependencies,
			...data.devDependencies,
		};

		for (const dep of requiredDeps) {
			if (!allDeps[dep]) {
				issues.push({
					id: `schema-package-missing-dep-${dep}`,
					severity: "warning",
					category: "schema",
					message: `Missing recommended dependency: ${dep}`,
					description: "This dependency is recommended for Xala projects",
					file,
					rule: "schema.required-fields",
					fixable: true,
					autofix: {
						description: `Add ${dep} to dependencies`,
						operation: "insert",
						target: "dependencies",
						replacement: `"${dep}": "latest"`,
					},
				});
			}
		}

		return issues;
	}

	private validateTsConfig(file: string, data: any): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		// Check for strict mode
		if (!data.compilerOptions?.strict) {
			issues.push({
				id: "schema-tsconfig-strict-mode",
				severity: "warning",
				category: "schema",
				message: "TypeScript strict mode is not enabled",
				description: "Xala projects should use strict TypeScript settings",
				file,
				rule: "schema.constraint-validation",
				fixable: true,
				autofix: {
					description: "Enable strict mode",
					operation: "replace",
					target: '"strict": false',
					replacement: '"strict": true',
				},
			});
		}

		return issues;
	}

	private validateXalaConfig(file: string, data: any): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		// Check Norwegian compliance settings
		if (
			data.compliance?.nsm?.classification === "OPEN" &&
			data.compliance?.gdpr?.enabled === false
		) {
			issues.push({
				id: "schema-xala-compliance-warning",
				severity: "info",
				category: "schema",
				message:
					"Consider enabling GDPR compliance even for OPEN classification",
				description:
					"GDPR compliance is recommended for all Norwegian projects",
				file,
				rule: "schema.constraint-validation",
				fixable: false,
			});
		}

		return issues;
	}
}

// Export utility functions
export function createSchemaValidator(
	schemas?: Record<string, z.ZodSchema>,
): SchemaValidator {
	const validator = new SchemaValidator();

	if (schemas) {
		for (const [name, schema] of Object.entries(schemas)) {
			validator.addSchema(name, schema);
		}
	}

	return validator;
}

export function validateJson(
	content: string,
	schema: z.ZodSchema,
): { valid: boolean; data?: any; errors?: z.ZodError } {
	try {
		const data = JSON.parse(content);
		const result = schema.safeParse(data);

		if (result.success) {
			return { valid: true, data: result.data };
		} else {
			return { valid: false, errors: result.error };
		}
	} catch (error) {
		return {
			valid: false,
			errors: new z.ZodError([
				{
					code: z.ZodIssueCode.custom,
					message: "Invalid JSON syntax",
					path: [],
				},
			]),
		};
	}
}
