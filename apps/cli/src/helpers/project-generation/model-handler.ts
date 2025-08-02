import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, text, confirm, multiselect } from "@clack/prompts";
import type { ProjectConfig, ORM, Database, Compliance } from "../../types";
import { detectProjectConfig } from "./detect-project-config";

// Field types based on database
export type FieldType = 
	| "string" 
	| "number" 
	| "boolean" 
	| "date" 
	| "datetime" 
	| "json" 
	| "uuid" 
	| "enum"
	| "decimal"
	| "text";

// Relationship types
export type RelationType = "hasOne" | "hasMany" | "belongsTo" | "belongsToMany";

// Model field interface
export interface ModelField {
	name: string;
	type: FieldType;
	optional: boolean;
	unique?: boolean;
	defaultValue?: string;
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
		email?: boolean;
	};
	gdprSensitive?: boolean;
	encrypted?: boolean;
}

// Model relationship interface
export interface ModelRelation {
	name: string;
	type: RelationType;
	model: string;
	foreignKey?: string;
	pivotTable?: string; // For many-to-many
}

// Model options interface
export interface ModelOptions {
	fields?: string[]; // Format: "name:string", "email:string:unique", etc.
	relations?: string[]; // Format: "posts:hasMany:Post", "profile:hasOne:Profile"
	withApi?: boolean;
	withValidation?: boolean;
	withAudit?: boolean;
	withSoftDelete?: boolean;
	gdprCompliant?: boolean;
	skipMigration?: boolean;
	force?: boolean;
}

// Model context interface
interface ModelContext {
	name: string;
	modelName: string; // PascalCase
	tableName: string; // snake_case
	fileName: string; // kebab-case
	fields: ModelField[];
	relations: ModelRelation[];
	orm: ORM;
	database: Database;
	compliance: Compliance;
	withApi: boolean;
	withValidation: boolean;
	withAudit: boolean;
	withSoftDelete: boolean;
	gdprCompliant: boolean;
	projectRoot: string;
	modelsDir: string;
	apiDir?: string;
}

/**
 * Generate a model in an existing project
 */
export async function generateModelHandler(
	name: string,
	options: ModelOptions = {}
): Promise<void> {
	try {
		// Step 1: Project root detection and validation
		const projectRoot = await detectProjectRoot();
		if (!projectRoot) {
			consola.error("Could not find project root. Are you in a xaheen project?");
			process.exit(1);
		}

		// Step 2: Load project configuration
		const projectConfig = await detectProjectConfig(projectRoot);
		if (!projectConfig) {
			consola.error("Could not detect project configuration. Is this a valid xaheen project?");
			process.exit(1);
		}

		// Step 3: Check database configuration
		if (!projectConfig.database || projectConfig.database === "none") {
			consola.error("Model generation requires a database. Please configure a database first.");
			process.exit(1);
		}

		if (!projectConfig.orm || projectConfig.orm === "none") {
			consola.error("Model generation requires an ORM. Please configure an ORM (Prisma or Drizzle).");
			process.exit(1);
		}

		// Step 4: Model naming convention
		const modelName = validateAndNormalizeModelName(name);
		const tableName = toSnakeCase(modelName);
		const fileName = toKebabCase(modelName);

		// Step 5: Parse fields
		const fields = options.fields 
			? parseFields(options.fields, projectConfig.database)
			: await promptForFields(projectConfig.database);

		// Step 6: Parse relationships
		const relations = options.relations
			? parseRelations(options.relations)
			: await promptForRelations();

		// Step 7: Determine directories
		const { modelsDir, apiDir } = await determineDirectories(
			projectRoot,
			projectConfig.orm,
			options.withApi ?? true
		);

		// Step 8: Check for existing model
		const modelPath = getModelPath(modelsDir, fileName, projectConfig.orm);
		if (await fs.pathExists(modelPath) && !options.force) {
			const shouldOverwrite = await confirm({
				message: `Model ${modelName} already exists. Overwrite?`,
				initialValue: false,
			});

			if (!shouldOverwrite) {
				consola.info("Model generation cancelled.");
				return;
			}
		}

		// Step 9: Add audit fields if needed
		if (options.withAudit ?? projectConfig.compliance !== "none") {
			fields.push(...getAuditFields());
		}

		// Step 10: Add soft delete field if needed
		if (options.withSoftDelete ?? false) {
			fields.push({
				name: "deletedAt",
				type: "datetime",
				optional: true,
			});
		}

		// Create model context
		const context: ModelContext = {
			name,
			modelName,
			tableName,
			fileName,
			fields,
			relations,
			orm: projectConfig.orm,
			database: projectConfig.database,
			compliance: projectConfig.compliance,
			withApi: options.withApi ?? true,
			withValidation: options.withValidation ?? true,
			withAudit: options.withAudit ?? projectConfig.compliance !== "none",
			withSoftDelete: options.withSoftDelete ?? false,
			gdprCompliant: options.gdprCompliant ?? projectConfig.compliance === "gdpr" || projectConfig.compliance === "norwegian",
			projectRoot,
			modelsDir,
			apiDir,
		};

		log.info(`Generating ${projectConfig.orm} model: ${modelName}`);

		// Use the model generator
		const { generateModel, type ModelGenerationOptions } = await import("../../generators/model-generator");
		
		const generationOptions: ModelGenerationOptions = {
			name,
			modelName,
			tableName,
			fileName,
			fields,
			relations,
			orm: projectConfig.orm,
			database: projectConfig.database,
			api: projectConfig.api,
			compliance: projectConfig.compliance,
			withValidation: options.withValidation ?? true,
			withAudit: options.withAudit ?? projectConfig.compliance !== "none",
			withSoftDelete: options.withSoftDelete ?? false,
			gdprCompliant: options.gdprCompliant ?? projectConfig.compliance === "gdpr" || projectConfig.compliance === "norwegian",
			withSeeding: true,
			withTests: true,
			withGraphQL: projectConfig.api === "orpc",
			projectRoot,
			modelsDir,
			apiDir,
		};

		const result = await generateModel(generationOptions);

		if (!result.success) {
			consola.error("Failed to generate model:");
			result.errors?.forEach(error => consola.error(`  - ${error}`));
			process.exit(1);
		}

		result.warnings?.forEach(warning => consola.warn(warning));

		// Generate or update migrations
		if (!options.skipMigration && result.migrations && result.migrations.length > 0) {
			consola.info("Migration commands:");
			result.migrations.forEach(cmd => consola.info(`  - ${cmd}`));
		}

		log.success(`Model ${modelName} generated successfully!`);
		
		// Display next steps
		displayNextSteps(context, result);

	} catch (error) {
		consola.error("Failed to generate model:", error);
		process.exit(1);
	}
}

/**
 * Detect the project root
 */
async function detectProjectRoot(): Promise<string | null> {
	let currentDir = process.cwd();
	const root = path.parse(currentDir).root;

	while (currentDir !== root) {
		const packageJsonPath = path.join(currentDir, "package.json");
		const xaheenConfigPath = path.join(currentDir, "xaheen.config.json");
		const btsstackConfigPath = path.join(currentDir, "btsstack.config.json");

		if (await fs.pathExists(packageJsonPath)) {
			if (await fs.pathExists(xaheenConfigPath) || await fs.pathExists(btsstackConfigPath)) {
				return currentDir;
			}

			try {
				const packageJson = await fs.readJson(packageJsonPath);
				if (packageJson.dependencies?.["@xaheen/cli"] || 
					packageJson.devDependencies?.["@xaheen/cli"] ||
					packageJson.dependencies?.["xaheen-tstack"] ||
					packageJson.devDependencies?.["xaheen-tstack"]) {
					return currentDir;
				}
			} catch (error) {
				// Continue searching
			}
		}

		currentDir = path.dirname(currentDir);
	}

	return null;
}

/**
 * Validate and normalize model name to PascalCase
 */
function validateAndNormalizeModelName(name: string): string {
	// Remove file extension if provided
	const cleanName = name.replace(/\.(ts|js|prisma)$/, "");

	// Check for invalid characters
	if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(cleanName)) {
		throw new Error(
			"Model name must start with a letter and contain only letters, numbers, and underscores"
		);
	}

	// Convert to PascalCase
	return toPascalCase(cleanName);
}

/**
 * Convert to PascalCase
 */
function toPascalCase(str: string): string {
	return str
		.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		.replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * Convert to snake_case
 */
function toSnakeCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1_$2")
		.toLowerCase();
}

/**
 * Convert to kebab-case
 */
function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.toLowerCase();
}

/**
 * Parse field definitions
 */
function parseFields(fieldStrings: string[], database: Database): ModelField[] {
	const fields: ModelField[] = [];

	// Always add ID field
	fields.push({
		name: "id",
		type: database === "mongodb" ? "string" : "uuid",
		optional: false,
		unique: true,
	});

	for (const fieldString of fieldStrings) {
		const parts = fieldString.split(":");
		if (parts.length < 2) {
			throw new Error(`Invalid field format: ${fieldString}. Expected format: "name:type[:modifiers]"`);
		}

		const [fieldName, fieldType, ...modifiers] = parts;
		
		// Validate field type
		if (!isValidFieldType(fieldType)) {
			throw new Error(`Invalid field type: ${fieldType}`);
		}

		const field: ModelField = {
			name: fieldName,
			type: fieldType as FieldType,
			optional: modifiers.includes("optional") || modifiers.includes("?"),
			unique: modifiers.includes("unique"),
		};

		// Check for GDPR sensitive data
		if (modifiers.includes("gdpr") || isGdprSensitiveField(fieldName)) {
			field.gdprSensitive = true;
		}

		// Check for encryption
		if (modifiers.includes("encrypted") || shouldEncryptField(fieldName)) {
			field.encrypted = true;
		}

		// Add validation rules
		if (fieldType === "email" || fieldName.toLowerCase().includes("email")) {
			field.validation = { email: true };
		}

		fields.push(field);
	}

	// Add timestamps
	fields.push(
		{ name: "createdAt", type: "datetime", optional: false },
		{ name: "updatedAt", type: "datetime", optional: false }
	);

	return fields;
}

/**
 * Parse relationship definitions
 */
function parseRelations(relationStrings: string[]): ModelRelation[] {
	const relations: ModelRelation[] = [];

	for (const relationString of relationStrings) {
		const parts = relationString.split(":");
		if (parts.length < 3) {
			throw new Error(
				`Invalid relation format: ${relationString}. Expected format: "name:type:Model[:foreignKey]"`
			);
		}

		const [name, type, model, foreignKey] = parts;

		if (!isValidRelationType(type)) {
			throw new Error(`Invalid relation type: ${type}`);
		}

		relations.push({
			name,
			type: type as RelationType,
			model,
			foreignKey,
		});
	}

	return relations;
}

/**
 * Prompt for fields
 */
async function promptForFields(database: Database): Promise<ModelField[]> {
	const fields: ModelField[] = [
		{
			name: "id",
			type: database === "mongodb" ? "string" : "uuid",
			optional: false,
			unique: true,
		}
	];

	const wantsFields = await confirm({
		message: "Do you want to add fields to this model?",
		initialValue: true,
	});

	if (!wantsFields || typeof wantsFields === "symbol") {
		return [...fields, ...getTimestampFields()];
	}

	let addingFields = true;
	while (addingFields) {
		const fieldName = await text({
			message: "Field name:",
			validate: (value) => {
				if (!value) return "Field name is required";
				if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
					return "Invalid field name format";
				}
				if (fields.some(f => f.name === value)) {
					return "Field name already exists";
				}
				return;
			},
		});

		if (typeof fieldName === "symbol") break;

		const fieldType = await select({
			message: "Field type:",
			options: getFieldTypeOptions(database),
		});

		if (typeof fieldType === "symbol") break;

		const modifiers = await multiselect({
			message: "Field modifiers:",
			options: [
				{ value: "optional", label: "Optional" },
				{ value: "unique", label: "Unique" },
				{ value: "gdpr", label: "GDPR Sensitive" },
				{ value: "encrypted", label: "Encrypted" },
			],
			required: false,
		});

		const field: ModelField = {
			name: fieldName,
			type: fieldType as FieldType,
			optional: Array.isArray(modifiers) && modifiers.includes("optional"),
			unique: Array.isArray(modifiers) && modifiers.includes("unique"),
			gdprSensitive: Array.isArray(modifiers) && modifiers.includes("gdpr"),
			encrypted: Array.isArray(modifiers) && modifiers.includes("encrypted"),
		};

		// Add email validation
		if (fieldType === "string" && fieldName.toLowerCase().includes("email")) {
			field.validation = { email: true };
		}

		fields.push(field);

		const addAnother = await confirm({
			message: "Add another field?",
			initialValue: false,
		});

		if (typeof addAnother === "symbol" || !addAnother) {
			addingFields = false;
		}
	}

	return [...fields, ...getTimestampFields()];
}

/**
 * Prompt for relationships
 */
async function promptForRelations(): Promise<ModelRelation[]> {
	const relations: ModelRelation[] = [];

	const wantsRelations = await confirm({
		message: "Do you want to add relationships to this model?",
		initialValue: false,
	});

	if (!wantsRelations || typeof wantsRelations === "symbol") {
		return relations;
	}

	let addingRelations = true;
	while (addingRelations) {
		const relationName = await text({
			message: "Relationship name:",
			validate: (value) => {
				if (!value) return "Relationship name is required";
				if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
					return "Invalid relationship name format";
				}
				return;
			},
		});

		if (typeof relationName === "symbol") break;

		const relationType = await select({
			message: "Relationship type:",
			options: [
				{ value: "hasOne", label: "Has One" },
				{ value: "hasMany", label: "Has Many" },
				{ value: "belongsTo", label: "Belongs To" },
				{ value: "belongsToMany", label: "Belongs To Many (Many-to-Many)" },
			],
		});

		if (typeof relationType === "symbol") break;

		const relatedModel = await text({
			message: "Related model name:",
			validate: (value) => {
				if (!value) return "Related model name is required";
				return;
			},
		});

		if (typeof relatedModel === "symbol") break;

		relations.push({
			name: relationName,
			type: relationType as RelationType,
			model: toPascalCase(relatedModel),
		});

		const addAnother = await confirm({
			message: "Add another relationship?",
			initialValue: false,
		});

		if (typeof addAnother === "symbol" || !addAnother) {
			addingRelations = false;
		}
	}

	return relations;
}

/**
 * Check if field type is valid
 */
function isValidFieldType(type: string): boolean {
	const validTypes: FieldType[] = [
		"string", "number", "boolean", "date", "datetime", 
		"json", "uuid", "enum", "decimal", "text"
	];
	return validTypes.includes(type as FieldType);
}

/**
 * Check if relation type is valid
 */
function isValidRelationType(type: string): boolean {
	const validTypes: RelationType[] = ["hasOne", "hasMany", "belongsTo", "belongsToMany"];
	return validTypes.includes(type as RelationType);
}

/**
 * Check if field is GDPR sensitive
 */
function isGdprSensitiveField(fieldName: string): boolean {
	const sensitiveFields = [
		"email", "phone", "ssn", "address", "birthdate", 
		"firstName", "lastName", "name", "creditCard"
	];
	return sensitiveFields.some(field => 
		fieldName.toLowerCase().includes(field.toLowerCase())
	);
}

/**
 * Check if field should be encrypted
 */
function shouldEncryptField(fieldName: string): boolean {
	const encryptFields = ["ssn", "creditCard", "password", "token", "secret"];
	return encryptFields.some(field => 
		fieldName.toLowerCase().includes(field.toLowerCase())
	);
}

/**
 * Get field type options based on database
 */
function getFieldTypeOptions(database: Database) {
	const commonOptions = [
		{ value: "string", label: "String" },
		{ value: "number", label: "Number" },
		{ value: "boolean", label: "Boolean" },
		{ value: "date", label: "Date" },
		{ value: "datetime", label: "DateTime" },
		{ value: "json", label: "JSON" },
		{ value: "text", label: "Text (Long String)" },
	];

	if (database !== "mongodb") {
		commonOptions.push(
			{ value: "uuid", label: "UUID" },
			{ value: "decimal", label: "Decimal" },
			{ value: "enum", label: "Enum" }
		);
	}

	return commonOptions;
}

/**
 * Get timestamp fields
 */
function getTimestampFields(): ModelField[] {
	return [
		{ name: "createdAt", type: "datetime", optional: false },
		{ name: "updatedAt", type: "datetime", optional: false },
	];
}

/**
 * Get audit fields
 */
function getAuditFields(): ModelField[] {
	return [
		{ name: "createdBy", type: "string", optional: true },
		{ name: "updatedBy", type: "string", optional: true },
		{ name: "version", type: "number", optional: false, defaultValue: "1" },
	];
}

/**
 * Determine directories for models and API
 */
async function determineDirectories(
	projectRoot: string,
	orm: ORM,
	withApi: boolean
): Promise<{ modelsDir: string; apiDir?: string }> {
	let modelsDir: string;
	let apiDir: string | undefined;

	if (orm === "prisma") {
		// Prisma uses a single schema file
		modelsDir = path.join(projectRoot, "prisma");
	} else if (orm === "drizzle") {
		// Drizzle uses separate model files
		const serverDir = path.join(projectRoot, "apps", "server");
		const srcServerDir = path.join(projectRoot, "src", "server");
		
		if (await fs.pathExists(serverDir)) {
			modelsDir = path.join(serverDir, "src", "db", "schema");
		} else if (await fs.pathExists(srcServerDir)) {
			modelsDir = path.join(srcServerDir, "db", "schema");
		} else {
			modelsDir = path.join(projectRoot, "src", "db", "schema");
		}
	} else {
		// Mongoose
		modelsDir = path.join(projectRoot, "src", "models");
	}

	await fs.ensureDir(modelsDir);

	if (withApi) {
		const appDir = path.join(projectRoot, "app");
		const srcAppDir = path.join(projectRoot, "src", "app");
		
		if (await fs.pathExists(srcAppDir)) {
			apiDir = path.join(srcAppDir, "api");
		} else if (await fs.pathExists(appDir)) {
			apiDir = path.join(appDir, "api");
		} else {
			apiDir = path.join(projectRoot, "src", "api");
		}
		
		await fs.ensureDir(apiDir);
	}

	return { modelsDir, apiDir };
}

/**
 * Get model file path based on ORM
 */
function getModelPath(modelsDir: string, fileName: string, orm: ORM): string {
	if (orm === "prisma") {
		return path.join(modelsDir, "schema.prisma");
	} else if (orm === "drizzle") {
		return path.join(modelsDir, `${fileName}.ts`);
	} else {
		return path.join(modelsDir, `${fileName}.model.ts`);
	}
}


/**
 * Generate Prisma model
 */
async function generatePrismaModel(context: ModelContext): Promise<void> {
	const { modelsDir, modelName, tableName, fields, relations } = context;
	const schemaPath = path.join(modelsDir, "schema.prisma");

	let schemaContent = "";
	if (await fs.pathExists(schemaPath)) {
		schemaContent = await fs.readFile(schemaPath, "utf-8");
	} else {
		// Create initial schema
		schemaContent = generatePrismaSchemaHeader(context);
	}

	// Check if model already exists
	if (schemaContent.includes(`model ${modelName}`)) {
		// Replace existing model
		const modelRegex = new RegExp(`model ${modelName} \\{[^}]+\\}`, "s");
		schemaContent = schemaContent.replace(modelRegex, generatePrismaModelContent(context));
	} else {
		// Append new model
		schemaContent += "\n\n" + generatePrismaModelContent(context);
	}

	await fs.writeFile(schemaPath, schemaContent);
}

/**
 * Generate Prisma schema header
 */
function generatePrismaSchemaHeader(context: ModelContext): string {
	const { database } = context;

	const provider = database === "mongodb" ? "mongodb" : database === "mysql" ? "mysql" : "postgresql";

	return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}
`;
}

/**
 * Generate Prisma model content
 */
function generatePrismaModelContent(context: ModelContext): string {
	const { modelName, tableName, fields, relations, withSoftDelete } = context;

	let modelContent = `model ${modelName} {\n`;

	// Add fields
	for (const field of fields) {
		const fieldLine = generatePrismaField(field, context.database);
		modelContent += `  ${fieldLine}\n`;
	}

	// Add relations
	for (const relation of relations) {
		const relationLine = generatePrismaRelation(relation);
		modelContent += `  ${relationLine}\n`;
	}

	// Add indexes
	if (withSoftDelete) {
		modelContent += `\n  @@index([deletedAt])\n`;
	}

	// Add table mapping
	if (tableName !== modelName.toLowerCase()) {
		modelContent += `\n  @@map("${tableName}")\n`;
	}

	modelContent += "}";

	return modelContent;
}

/**
 * Generate Prisma field
 */
function generatePrismaField(field: ModelField, database: Database): string {
	let fieldType = mapFieldTypeToPrisma(field.type, database);
	let attributes: string[] = [];

	if (field.name === "id") {
		attributes.push("@id");
		if (field.type === "uuid") {
			attributes.push("@default(uuid())");
		} else if (database === "mongodb") {
			attributes.push("@default(auto())");
			fieldType = "String";
			attributes.push("@map(\"_id\")");
		}
	}

	if (field.unique && field.name !== "id") {
		attributes.push("@unique");
	}

	if (field.defaultValue) {
		attributes.push(`@default(${field.defaultValue})`);
	} else if (field.name === "createdAt") {
		attributes.push("@default(now())");
	} else if (field.name === "updatedAt") {
		attributes.push("@updatedAt");
	}

	const optionalMark = field.optional ? "?" : "";
	const attributeString = attributes.length > 0 ? " " + attributes.join(" ") : "";

	return `${field.name} ${fieldType}${optionalMark}${attributeString}`;
}

/**
 * Map field type to Prisma type
 */
function mapFieldTypeToPrisma(type: FieldType, database: Database): string {
	const typeMap: Record<FieldType, string> = {
		string: "String",
		number: "Int",
		boolean: "Boolean",
		date: "DateTime",
		datetime: "DateTime",
		json: "Json",
		uuid: "String",
		enum: "String",
		decimal: "Decimal",
		text: "String",
	};

	return typeMap[type] || "String";
}

/**
 * Generate Prisma relation
 */
function generatePrismaRelation(relation: ModelRelation): string {
	switch (relation.type) {
		case "hasOne":
			return `${relation.name} ${relation.model}?`;
		case "hasMany":
			return `${relation.name} ${relation.model}[]`;
		case "belongsTo":
			return `${relation.name} ${relation.model} @relation(fields: [${relation.foreignKey || relation.name + "Id"}], references: [id])`;
		case "belongsToMany":
			return `${relation.name} ${relation.model}[]`;
		default:
			return "";
	}
}

/**
 * Generate Drizzle model
 */
async function generateDrizzleModel(context: ModelContext): Promise<void> {
	const { modelsDir, fileName, modelName, tableName, fields, relations, database } = context;
	const modelPath = path.join(modelsDir, `${fileName}.ts`);

	const content = generateDrizzleModelContent(context);
	await fs.writeFile(modelPath, content);

	// Update schema index
	await updateDrizzleSchemaIndex(modelsDir, fileName, modelName);
}

/**
 * Generate Drizzle model content
 */
function generateDrizzleModelContent(context: ModelContext): string {
	const { modelName, tableName, fields, relations, database, withSoftDelete } = context;

	const imports = generateDrizzleImports(fields, database);
	
	let content = `${imports}

export const ${tableName} = ${getDrizzleTableFunction(database)}('${tableName}', {
`;

	// Add fields
	for (const field of fields) {
		const fieldLine = generateDrizzleField(field, database);
		content += `  ${fieldLine},\n`;
	}

	content = content.slice(0, -2); // Remove last comma
	content += "\n});";

	// Add type export
	content += `\n\nexport type ${modelName} = typeof ${tableName}.$inferSelect;`;
	content += `\nexport type New${modelName} = typeof ${tableName}.$inferInsert;`;

	// Add relations if any
	if (relations.length > 0) {
		content += `\n\n// Relations\nexport const ${tableName}Relations = relations(${tableName}, ({ one, many }) => ({`;
		for (const relation of relations) {
			const relationLine = generateDrizzleRelation(relation, tableName);
			content += `\n  ${relationLine},`;
		}
		content = content.slice(0, -1); // Remove last comma
		content += "\n}));";
	}

	return content;
}

/**
 * Generate Drizzle imports
 */
function generateDrizzleImports(fields: ModelField[], database: Database): string {
	const imports = new Set<string>();
	
	// Base imports
	if (database === "postgres" || database === "mysql") {
		imports.add(getDrizzleTableFunction(database));
	} else {
		imports.add("sqliteTable");
	}

	// Field type imports
	for (const field of fields) {
		const drizzleType = getDrizzleFieldType(field.type, database);
		imports.add(drizzleType);
	}

	// Always include relations
	imports.add("relations");

	const importPrefix = database === "postgres" ? "drizzle-orm/pg-core" : 
						database === "mysql" ? "drizzle-orm/mysql-core" : 
						"drizzle-orm/sqlite-core";

	return `import { ${Array.from(imports).join(", ")} } from '${importPrefix}';`;
}

/**
 * Get Drizzle table function based on database
 */
function getDrizzleTableFunction(database: Database): string {
	switch (database) {
		case "postgres":
			return "pgTable";
		case "mysql":
			return "mysqlTable";
		default:
			return "sqliteTable";
	}
}

/**
 * Get Drizzle field type
 */
function getDrizzleFieldType(type: FieldType, database: Database): string {
	const typeMap: Record<FieldType, Record<Database, string>> = {
		string: { postgres: "text", mysql: "varchar", sqlite: "text", mongodb: "text" },
		number: { postgres: "integer", mysql: "int", sqlite: "integer", mongodb: "integer" },
		boolean: { postgres: "boolean", mysql: "boolean", sqlite: "integer", mongodb: "integer" },
		date: { postgres: "date", mysql: "date", sqlite: "text", mongodb: "text" },
		datetime: { postgres: "timestamp", mysql: "datetime", sqlite: "text", mongodb: "text" },
		json: { postgres: "jsonb", mysql: "json", sqlite: "text", mongodb: "text" },
		uuid: { postgres: "uuid", mysql: "varchar", sqlite: "text", mongodb: "text" },
		enum: { postgres: "text", mysql: "enum", sqlite: "text", mongodb: "text" },
		decimal: { postgres: "decimal", mysql: "decimal", sqlite: "real", mongodb: "real" },
		text: { postgres: "text", mysql: "text", sqlite: "text", mongodb: "text" },
	};

	return typeMap[type]?.[database] || "text";
}

/**
 * Generate Drizzle field
 */
function generateDrizzleField(field: ModelField, database: Database): string {
	const fieldType = getDrizzleFieldType(field.type, database);
	let fieldDef = `${field.name}: ${fieldType}('${field.name}')`;

	// Add modifiers
	const modifiers: string[] = [];

	if (field.name === "id") {
		modifiers.push("primaryKey()");
		if (field.type === "uuid" && database === "postgres") {
			modifiers.push("defaultRandom()");
		}
	}

	if (field.unique && field.name !== "id") {
		modifiers.push("unique()");
	}

	if (!field.optional && field.name !== "id") {
		modifiers.push("notNull()");
	}

	if (field.defaultValue) {
		modifiers.push(`default(${field.defaultValue})`);
	} else if (field.name === "createdAt" || field.name === "updatedAt") {
		modifiers.push("defaultNow()");
	}

	if (modifiers.length > 0) {
		fieldDef += `.${modifiers.join(".")}`;
	}

	return fieldDef;
}

/**
 * Generate Drizzle relation
 */
function generateDrizzleRelation(relation: ModelRelation, tableName: string): string {
	switch (relation.type) {
		case "hasOne":
			return `${relation.name}: one(${toSnakeCase(relation.model)})`;
		case "hasMany":
			return `${relation.name}: many(${toSnakeCase(relation.model)})`;
		case "belongsTo":
			return `${relation.name}: one(${toSnakeCase(relation.model)}, {
    fields: [${tableName}.${relation.foreignKey || relation.name + "Id"}],
    references: [${toSnakeCase(relation.model)}.id],
  })`;
		case "belongsToMany":
			return `${relation.name}: many(${toSnakeCase(relation.model)})`;
		default:
			return "";
	}
}

/**
 * Update Drizzle schema index
 */
async function updateDrizzleSchemaIndex(modelsDir: string, fileName: string, modelName: string): Promise<void> {
	const indexPath = path.join(modelsDir, "index.ts");
	
	let content = "";
	if (await fs.pathExists(indexPath)) {
		content = await fs.readFile(indexPath, "utf-8");
	}

	const exportLine = `export * from './${fileName}';`;
	
	if (!content.includes(exportLine)) {
		content += (content ? "\n" : "") + exportLine;
		await fs.writeFile(indexPath, content);
	}
}

/**
 * Generate Mongoose model
 */
async function generateMongooseModel(context: ModelContext): Promise<void> {
	const { modelsDir, fileName, modelName, fields, relations } = context;
	const modelPath = path.join(modelsDir, `${fileName}.model.ts`);

	const content = generateMongooseModelContent(context);
	await fs.writeFile(modelPath, content);
}

/**
 * Generate Mongoose model content
 */
function generateMongooseModelContent(context: ModelContext): string {
	const { modelName, fields, relations, withSoftDelete, gdprCompliant } = context;

	let content = `import { Schema, model, Document } from 'mongoose';
${gdprCompliant ? "import { encrypt, decrypt } from '@/lib/encryption';\n" : ""}

export interface I${modelName} extends Document {
`;

	// Add field interfaces
	for (const field of fields) {
		if (field.name !== "id") {
			const optional = field.optional ? "?" : "";
			content += `  ${field.name}${optional}: ${mapFieldTypeToTypeScript(field.type)};\n`;
		}
	}

	// Add relation interfaces
	for (const relation of relations) {
		const relationType = relation.type === "hasMany" ? "[]" : "";
		content += `  ${relation.name}?: any${relationType}; // ${relation.model}\n`;
	}

	content += `}

const ${modelName}Schema = new Schema<I${modelName}>({
`;

	// Add schema fields
	for (const field of fields) {
		if (field.name !== "id") {
			const schemaField = generateMongooseSchemaField(field);
			content += `  ${schemaField},\n`;
		}
	}

	content = content.slice(0, -2); // Remove last comma
	content += `
}, {
  timestamps: true,
`;

	if (withSoftDelete) {
		content += `  // Soft delete support
  deletedAt: { type: Date, default: null },
`;
	}

	content += `});
`;

	// Add encryption middleware if needed
	if (gdprCompliant) {
		content += generateMongooseEncryptionMiddleware(context);
	}

	// Add soft delete plugin if needed
	if (withSoftDelete) {
		content += `\n// Soft delete plugin
${modelName}Schema.pre('find', function() {
  this.where({ deletedAt: null });
});

${modelName}Schema.pre('findOne', function() {
  this.where({ deletedAt: null });
});
`;
	}

	content += `\nexport const ${modelName} = model<I${modelName}>('${modelName}', ${modelName}Schema);`;

	return content;
}

/**
 * Map field type to TypeScript type
 */
function mapFieldTypeToTypeScript(type: FieldType): string {
	const typeMap: Record<FieldType, string> = {
		string: "string",
		number: "number",
		boolean: "boolean",
		date: "Date",
		datetime: "Date",
		json: "any",
		uuid: "string",
		enum: "string",
		decimal: "number",
		text: "string",
	};

	return typeMap[type] || "any";
}

/**
 * Generate Mongoose schema field
 */
function generateMongooseSchemaField(field: ModelField): string {
	const mongooseType = mapFieldTypeToMongoose(field.type);
	const required = !field.optional;
	
	let fieldDef = `${field.name}: {
    type: ${mongooseType},
    required: ${required}`;

	if (field.unique) {
		fieldDef += `,
    unique: true`;
	}

	if (field.defaultValue) {
		fieldDef += `,
    default: ${field.defaultValue}`;
	}

	if (field.validation?.email) {
		fieldDef += `,
    validate: {
      validator: (v: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v),
      message: 'Invalid email format'
    }`;
	}

	fieldDef += `
  }`;

	return fieldDef;
}

/**
 * Map field type to Mongoose type
 */
function mapFieldTypeToMongoose(type: FieldType): string {
	const typeMap: Record<FieldType, string> = {
		string: "String",
		number: "Number",
		boolean: "Boolean",
		date: "Date",
		datetime: "Date",
		json: "Schema.Types.Mixed",
		uuid: "String",
		enum: "String",
		decimal: "Number",
		text: "String",
	};

	return typeMap[type] || "String";
}

/**
 * Generate Mongoose encryption middleware
 */
function generateMongooseEncryptionMiddleware(context: ModelContext): string {
	const { modelName, fields } = context;
	const encryptedFields = fields.filter(f => f.encrypted);

	if (encryptedFields.length === 0) return "";

	let content = `\n// Encryption middleware
${modelName}Schema.pre('save', function(next) {
  if (this.isModified()) {
`;

	for (const field of encryptedFields) {
		content += `    if (this.${field.name}) {
      this.${field.name} = encrypt(this.${field.name});
    }\n`;
	}

	content += `  }
  next();
});

// Decryption middleware
${modelName}Schema.post('find', function(docs) {
  for (const doc of docs) {
`;

	for (const field of encryptedFields) {
		content += `    if (doc.${field.name}) {
      doc.${field.name} = decrypt(doc.${field.name});
    }\n`;
	}

	content += `  }
});
`;

	return content;
}

/**
 * Generate validation schemas
 */
async function generateValidationSchemas(context: ModelContext): Promise<void> {
	const { projectRoot, modelName, fileName, fields } = context;
	const validationDir = path.join(projectRoot, "src", "validations");
	await fs.ensureDir(validationDir);

	const validationPath = path.join(validationDir, `${fileName}.validation.ts`);
	const content = generateZodValidationSchema(context);
	
	await fs.writeFile(validationPath, content);
}

/**
 * Generate Zod validation schema
 */
function generateZodValidationSchema(context: ModelContext): string {
	const { modelName, fields } = context;

	let content = `import { z } from 'zod';

// Create schema
export const create${modelName}Schema = z.object({
`;

	for (const field of fields) {
		if (field.name !== "id" && !["createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt"].includes(field.name)) {
			const zodType = mapFieldTypeToZod(field);
			const optional = field.optional ? ".optional()" : "";
			content += `  ${field.name}: ${zodType}${optional},\n`;
		}
	}

	content += `});

// Update schema (all fields optional)
export const update${modelName}Schema = create${modelName}Schema.partial();

// Types
export type Create${modelName}Input = z.infer<typeof create${modelName}Schema>;
export type Update${modelName}Input = z.infer<typeof update${modelName}Schema>;
`;

	return content;
}

/**
 * Map field type to Zod type
 */
function mapFieldTypeToZod(field: ModelField): string {
	const baseType = (() => {
		switch (field.type) {
			case "string":
			case "text":
			case "uuid":
				return "z.string()";
			case "number":
			case "decimal":
				return "z.number()";
			case "boolean":
				return "z.boolean()";
			case "date":
			case "datetime":
				return "z.date()";
			case "json":
				return "z.object({})";
			case "enum":
				return "z.enum(['option1', 'option2'])"; // Placeholder
			default:
				return "z.string()";
		}
	})();

	// Add validation rules
	let zodType = baseType;

	if (field.validation) {
		if (field.validation.email) {
			zodType += ".email()";
		}
		if (field.validation.min !== undefined) {
			zodType += `.min(${field.validation.min})`;
		}
		if (field.validation.max !== undefined) {
			zodType += `.max(${field.validation.max})`;
		}
		if (field.validation.pattern) {
			zodType += `.regex(/${field.validation.pattern}/)`;
		}
	}

	return zodType;
}

/**
 * Generate API endpoints
 */
async function generateApiEndpoints(context: ModelContext): Promise<void> {
	if (!context.apiDir) return;

	const { apiDir, modelName, fileName } = context;
	const apiPath = path.join(apiDir, fileName);
	await fs.ensureDir(apiPath);

	// Generate CRUD endpoints
	await generateGetEndpoint(context, apiPath);
	await generatePostEndpoint(context, apiPath);
	await generatePutEndpoint(context, apiPath);
	await generateDeleteEndpoint(context, apiPath);
}

/**
 * Generate GET endpoint
 */
async function generateGetEndpoint(context: ModelContext, apiPath: string): Promise<void> {
	const { modelName, orm, tableName } = context;
	const content = `import { NextRequest, NextResponse } from 'next/server';
${orm === "prisma" ? "import { prisma } from '@/lib/prisma';" : ""}
${orm === "drizzle" ? `import { db } from '@/lib/db';\nimport { ${tableName} } from '@/db/schema';` : ""}
${orm === "mongoose" ? `import { ${modelName} } from '@/models/${context.fileName}.model';` : ""}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    ${generateGetQuery(context, "id")}
    
    if (!result) {
      return NextResponse.json(
        { error: '${modelName} not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching ${modelName}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    ${generateListQuery(context)}
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching ${modelName}s:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

	await fs.writeFile(path.join(apiPath, "route.ts"), content);
}

/**
 * Generate POST endpoint
 */
async function generatePostEndpoint(context: ModelContext, apiPath: string): Promise<void> {
	const { modelName, orm, tableName } = context;
	const content = `import { NextRequest, NextResponse } from 'next/server';
import { create${modelName}Schema } from '@/validations/${context.fileName}.validation';
${orm === "prisma" ? "import { prisma } from '@/lib/prisma';" : ""}
${orm === "drizzle" ? `import { db } from '@/lib/db';\nimport { ${tableName} } from '@/db/schema';` : ""}
${orm === "mongoose" ? `import { ${modelName} } from '@/models/${context.fileName}.model';` : ""}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = create${modelName}Schema.parse(body);
    
    ${generateCreateQuery(context, "validatedData")}
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating ${modelName}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

	await fs.writeFile(path.join(apiPath, "route.ts"), content);
}

/**
 * Generate query based on ORM
 */
function generateGetQuery(context: ModelContext, idVar: string): string {
	const { orm, modelName, tableName } = context;

	switch (orm) {
		case "prisma":
			return `const result = await prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.findUnique({
      where: { id: ${idVar} }
    });`;
		case "drizzle":
			return `const result = await db.select().from(${tableName}).where(eq(${tableName}.id, ${idVar})).limit(1);`;
		case "mongoose":
			return `const result = await ${modelName}.findById(${idVar});`;
		default:
			return "";
	}
}

/**
 * Generate list query based on ORM
 */
function generateListQuery(context: ModelContext): string {
	const { orm, modelName, tableName } = context;

	switch (orm) {
		case "prisma":
			return `const results = await prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.findMany();`;
		case "drizzle":
			return `const results = await db.select().from(${tableName});`;
		case "mongoose":
			return `const results = await ${modelName}.find();`;
		default:
			return "";
	}
}

/**
 * Generate create query based on ORM
 */
function generateCreateQuery(context: ModelContext, dataVar: string): string {
	const { orm, modelName, tableName } = context;

	switch (orm) {
		case "prisma":
			return `const result = await prisma.${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.create({
      data: ${dataVar}
    });`;
		case "drizzle":
			return `const result = await db.insert(${tableName}).values(${dataVar}).returning();`;
		case "mongoose":
			return `const result = await ${modelName}.create(${dataVar});`;
		default:
			return "";
	}
}

/**
 * Generate PUT endpoint
 */
async function generatePutEndpoint(context: ModelContext, apiPath: string): Promise<void> {
	// Similar to POST but with update logic
	// Implementation details omitted for brevity
}

/**
 * Generate DELETE endpoint
 */
async function generateDeleteEndpoint(context: ModelContext, apiPath: string): Promise<void> {
	// Implementation details omitted for brevity
}

/**
 * Generate migration
 */
async function generateMigration(context: ModelContext): Promise<void> {
	const { orm, projectRoot } = context;

	if (orm === "prisma") {
		consola.info("Run 'npx prisma migrate dev' to create the migration");
	} else if (orm === "drizzle") {
		consola.info("Run 'npm run db:generate' to generate the migration");
	}
}

/**
 * Display next steps
 */
function displayNextSteps(context: ModelContext, result: import("../../generators/model-generator").GenerationResult): void {
	const { modelName, orm } = context;
	const files = result.files.map(f => path.relative(context.projectRoot, f));

	const steps = [
		`Model ${modelName} created successfully!`,
		"",
		"Generated files:",
		...files.map(f => `  - ${f}`),
		"",
		"Next steps:",
	];

	if (orm === "prisma") {
		steps.push("1. Run 'npx prisma migrate dev' to create the database migration");
		steps.push("2. Run 'npx prisma generate' to update the Prisma client");
	} else if (orm === "drizzle") {
		steps.push("1. Run 'npm run db:generate' to generate the migration");
		steps.push("2. Run 'npm run db:migrate' to apply the migration");
	}

	if (result.migrations && result.migrations.length > 0) {
		steps.push("", "Migration commands:");
		result.migrations.forEach(cmd => steps.push(`  - ${cmd}`));
	}

	consola.box(steps.join("\n"));
}