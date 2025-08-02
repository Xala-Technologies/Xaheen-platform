/**
 * MANDATORY COMPLIANCE RULES - AUTOMATICALLY ENFORCED:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.)
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style={{}}, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 *
 * GENERATE: Business logic models and services
 * NOT: UI primitive components or wrappers around Xala components
 */

import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import type { ORM, Database, Compliance, API } from "../types";
import type { ModelField, ModelRelation } from "../helpers/project-generation/model-handler";

// Generation result interface
export interface GenerationResult {
	success: boolean;
	files: string[];
	errors?: string[];
	warnings?: string[];
	migrations?: string[];
}

// Model generation options
export interface ModelGenerationOptions {
	name: string;
	modelName: string; // PascalCase
	tableName: string; // snake_case
	fileName: string; // kebab-case
	fields: ModelField[];
	relations: ModelRelation[];
	orm: ORM;
	database: Database;
	api?: API;
	compliance: Compliance;
	withValidation: boolean;
	withAudit: boolean;
	withSoftDelete: boolean;
	gdprCompliant: boolean;
	withSeeding: boolean;
	withTests: boolean;
	withGraphQL: boolean;
	projectRoot: string;
	modelsDir: string;
	apiDir?: string;
	validationDir?: string;
	servicesDir?: string;
	seedsDir?: string;
	testsDir?: string;
}

// Template context for model generation
interface ModelTemplateContext {
	modelName: string;
	tableName: string;
	fileName: string;
	fields: ModelField[];
	relations: ModelRelation[];
	orm: ORM;
	database: Database;
	api?: API;
	hasTimestamps: boolean;
	hasAudit: boolean;
	hasSoftDelete: boolean;
	hasGdprFields: boolean;
	hasEncryptedFields: boolean;
	imports: string[];
	interfaces: string[];
	schemaDefinition: string;
	validationSchema: string;
	crudMethods: string[];
}

/**
 * Generate a model with all related files
 */
export async function generateModel(
	options: ModelGenerationOptions
): Promise<GenerationResult> {
	const result: GenerationResult = {
		success: false,
		files: [],
		errors: [],
		warnings: [],
		migrations: [],
	};

	try {
		// Prepare template context
		const context = prepareModelTemplateContext(options);

		// Generate model schema file
		const modelFile = await generateModelSchema(options, context);
		if (modelFile) {
			result.files.push(modelFile);
		}

		// Generate TypeScript interfaces
		const interfaceFile = await generateTypeScriptInterfaces(options, context);
		if (interfaceFile) {
			result.files.push(interfaceFile);
		}

		// Generate validation schemas
		if (options.withValidation) {
			const validationFile = await generateValidationSchema(options, context);
			if (validationFile) {
				result.files.push(validationFile);
			}
		}

		// Generate CRUD service
		const serviceFile = await generateCRUDService(options, context);
		if (serviceFile) {
			result.files.push(serviceFile);
		}

		// Generate API routes
		if (options.apiDir) {
			const apiFiles = await generateAPIRoutes(options, context);
			result.files.push(...apiFiles);
		}

		// Generate seed file
		if (options.withSeeding) {
			const seedFile = await generateSeedFile(options, context);
			if (seedFile) {
				result.files.push(seedFile);
			}
		}

		// Generate tests
		if (options.withTests) {
			const testFiles = await generateModelTests(options, context);
			result.files.push(...testFiles);
		}

		// Generate GraphQL schema if applicable
		if (options.withGraphQL && options.api === "trpc") {
			result.warnings?.push("GraphQL generation is not compatible with tRPC API");
		} else if (options.withGraphQL) {
			const graphqlFile = await generateGraphQLSchema(options, context);
			if (graphqlFile) {
				result.files.push(graphqlFile);
			}
		}

		// Generate migration info
		if (options.orm === "prisma" || options.orm === "drizzle") {
			result.migrations?.push(getMigrationCommand(options.orm));
		}

		result.success = true;
		
	} catch (error) {
		result.errors?.push(error instanceof Error ? error.message : String(error));
	}

	return result;
}

/**
 * Prepare template context with all necessary data
 */
function prepareModelTemplateContext(options: ModelGenerationOptions): ModelTemplateContext {
	const {
		modelName,
		tableName,
		fileName,
		fields,
		relations,
		orm,
		database,
		api,
		withAudit,
		withSoftDelete,
		gdprCompliant,
	} = options;

	// Check for special fields
	const hasTimestamps = fields.some(f => f.name === "createdAt" || f.name === "updatedAt");
	const hasAudit = withAudit || fields.some(f => f.name === "createdBy" || f.name === "updatedBy");
	const hasSoftDelete = withSoftDelete || fields.some(f => f.name === "deletedAt");
	const hasGdprFields = gdprCompliant || fields.some(f => f.gdprSensitive);
	const hasEncryptedFields = fields.some(f => f.encrypted);

	// Generate imports
	const imports = generateModelImports(options);

	// Generate interfaces
	const interfaces = generateInterfaces(options);

	// Generate schema definition
	const schemaDefinition = generateSchemaDefinition(options);

	// Generate validation schema
	const validationSchema = generateValidationSchemaContent(options);

	// Generate CRUD methods
	const crudMethods = generateCRUDMethods(options);

	return {
		modelName,
		tableName,
		fileName,
		fields,
		relations,
		orm,
		database,
		api,
		hasTimestamps,
		hasAudit,
		hasSoftDelete,
		hasGdprFields,
		hasEncryptedFields,
		imports,
		interfaces,
		schemaDefinition,
		validationSchema,
		crudMethods,
	};
}

/**
 * Generate model schema based on ORM
 */
async function generateModelSchema(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	const { orm, modelsDir, fileName } = options;

	let content = "";
	let filePath = "";

	if (orm === "prisma") {
		// Prisma uses a single schema file, so we append to it
		filePath = path.join(modelsDir, "schema.prisma");
		content = await generatePrismaSchema(options, context, filePath);
	} else if (orm === "drizzle") {
		filePath = path.join(modelsDir, `${fileName}.ts`);
		content = generateDrizzleSchema(options, context);
	} else if (orm === "mongoose") {
		filePath = path.join(modelsDir, `${fileName}.model.ts`);
		content = generateMongooseSchema(options, context);
	}

	if (content && filePath) {
		await fs.ensureDir(path.dirname(filePath));
		
		if (orm === "prisma" && await fs.pathExists(filePath)) {
			// Append to existing Prisma schema
			const existingContent = await fs.readFile(filePath, "utf-8");
			if (!existingContent.includes(`model ${options.modelName}`)) {
				content = existingContent + "\n\n" + content;
			} else {
				// Replace existing model
				const modelRegex = new RegExp(`model ${options.modelName} \\{[^}]+\\}`, "s");
				content = existingContent.replace(modelRegex, content);
			}
		}
		
		await fs.writeFile(filePath, content);
		return filePath;
	}

	return null;
}

/**
 * Generate Prisma schema
 */
async function generatePrismaSchema(
	options: ModelGenerationOptions,
	context: ModelTemplateContext,
	schemaPath: string
): Promise<string> {
	const { modelName, tableName, fields, relations, hasSoftDelete } = context;

	let schema = `model ${modelName} {\n`;

	// Add fields
	for (const field of fields) {
		schema += `  ${generatePrismaField(field, options.database)}\n`;
	}

	// Add relations
	for (const relation of relations) {
		schema += `  ${generatePrismaRelation(relation)}\n`;
	}

	// Add indexes
	const indexes: string[] = [];
	if (hasSoftDelete) {
		indexes.push("@@index([deletedAt])");
	}
	
	// Add unique fields as indexes
	const uniqueFields = fields.filter(f => f.unique && f.name !== "id");
	for (const field of uniqueFields) {
		indexes.push(`@@index([${field.name}])`);
	}

	if (indexes.length > 0) {
		schema += "\n" + indexes.map(idx => `  ${idx}`).join("\n") + "\n";
	}

	// Add table mapping if different from model name
	if (tableName !== modelName.toLowerCase()) {
		schema += `\n  @@map("${tableName}")\n`;
	}

	schema += "}";

	return schema;
}

/**
 * Generate Prisma field
 */
function generatePrismaField(field: ModelField, database: Database): string {
	const fieldType = mapFieldTypeToPrisma(field.type, database);
	const attributes: string[] = [];

	if (field.name === "id") {
		attributes.push("@id");
		if (field.type === "uuid") {
			attributes.push("@default(uuid())");
		} else if (database === "mongodb") {
			attributes.push("@default(auto())", "@map(\"_id\")");
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

	const optional = field.optional ? "?" : "";
	const attrs = attributes.length > 0 ? " " + attributes.join(" ") : "";

	return `${field.name} ${fieldType}${optional}${attrs}`;
}

/**
 * Map field type to Prisma type
 */
function mapFieldTypeToPrisma(type: string, database: Database): string {
	const typeMap: Record<string, string> = {
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
	const { name, type, model, foreignKey } = relation;

	switch (type) {
		case "hasOne":
			return `${name} ${model}?`;
		case "hasMany":
			return `${name} ${model}[]`;
		case "belongsTo":
			return `${name} ${model} @relation(fields: [${foreignKey || name + "Id"}], references: [id])`;
		case "belongsToMany":
			return `${name} ${model}[]`;
		default:
			return "";
	}
}

/**
 * Generate Drizzle schema
 */
function generateDrizzleSchema(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): string {
	const { modelName, tableName, fields, relations, database } = context;
	const imports = generateDrizzleImports(fields, relations, database);

	let content = `${imports}

export const ${tableName} = ${getDrizzleTableFunction(database)}('${tableName}', {
`;

	// Add fields
	for (const field of fields) {
		content += `  ${generateDrizzleField(field, database)},\n`;
	}

	content = content.slice(0, -2); // Remove last comma
	content += "\n});";

	// Add type exports
	content += `\n\nexport type ${modelName} = typeof ${tableName}.$inferSelect;`;
	content += `\nexport type New${modelName} = typeof ${tableName}.$inferInsert;`;

	// Add relations
	if (relations.length > 0) {
		content += `\n\n// Relations\nexport const ${tableName}Relations = relations(${tableName}, ({ one, many }) => ({`;
		for (const relation of relations) {
			content += `\n  ${generateDrizzleRelation(relation, tableName)},`;
		}
		content = content.slice(0, -1); // Remove last comma
		content += "\n}));";
	}

	return content;
}

/**
 * Generate Drizzle imports
 */
function generateDrizzleImports(
	fields: ModelField[],
	relations: ModelRelation[],
	database: Database
): string {
	const imports = new Set<string>();
	
	// Table function
	imports.add(getDrizzleTableFunction(database));

	// Field types
	for (const field of fields) {
		imports.add(getDrizzleFieldType(field.type, database));
	}

	// Relations
	if (relations.length > 0) {
		imports.add("relations");
	}

	const dbImport = database === "postgres" ? "drizzle-orm/pg-core" :
					database === "mysql" ? "drizzle-orm/mysql-core" :
					"drizzle-orm/sqlite-core";

	return `import { ${Array.from(imports).join(", ")} } from '${dbImport}';`;
}

/**
 * Get Drizzle table function
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
function getDrizzleFieldType(type: string, database: Database): string {
	const typeMap: Record<string, Record<string, string>> = {
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
	const { name, type, model, foreignKey } = relation;
	const relatedTable = toSnakeCase(model);

	switch (type) {
		case "hasOne":
			return `${name}: one(${relatedTable})`;
		case "hasMany":
			return `${name}: many(${relatedTable})`;
		case "belongsTo":
			return `${name}: one(${relatedTable}, {
    fields: [${tableName}.${foreignKey || name + "Id"}],
    references: [${relatedTable}.id],
  })`;
		case "belongsToMany":
			return `${name}: many(${relatedTable})`;
		default:
			return "";
	}
}

/**
 * Generate Mongoose schema
 */
function generateMongooseSchema(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): string {
	const { modelName, fields, relations, hasSoftDelete, hasEncryptedFields } = context;

	let content = `import { Schema, model, Document } from 'mongoose';
${hasEncryptedFields ? "import { encrypt, decrypt } from '@/lib/encryption';\n" : ""}

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
		const arrayType = relation.type === "hasMany" || relation.type === "belongsToMany" ? "[]" : "";
		content += `  ${relation.name}?: any${arrayType}; // ${relation.model}\n`;
	}

	content += `}

const ${modelName}Schema = new Schema<I${modelName}>({
`;

	// Add schema fields
	for (const field of fields) {
		if (field.name !== "id") {
			content += `  ${generateMongooseField(field)},\n`;
		}
	}

	content = content.slice(0, -2); // Remove last comma
	content += `
}, {
  timestamps: true,
`;

	if (hasSoftDelete) {
		content += `  // Soft delete support
  deletedAt: { type: Date, default: null },
`;
	}

	content += `});
`;

	// Add middleware
	if (hasEncryptedFields) {
		content += generateMongooseEncryptionMiddleware(fields, modelName);
	}

	if (hasSoftDelete) {
		content += generateMongooseSoftDeleteMiddleware(modelName);
	}

	content += `\nexport const ${modelName} = model<I${modelName}>('${modelName}', ${modelName}Schema);`;

	return content;
}

/**
 * Map field type to TypeScript
 */
function mapFieldTypeToTypeScript(type: string): string {
	const typeMap: Record<string, string> = {
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
 * Generate Mongoose field
 */
function generateMongooseField(field: ModelField): string {
	const mongooseType = mapFieldTypeToMongoose(field.type);
	
	let fieldDef = `${field.name}: {
    type: ${mongooseType},
    required: ${!field.optional}`;

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
 * Map field type to Mongoose
 */
function mapFieldTypeToMongoose(type: string): string {
	const typeMap: Record<string, string> = {
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
function generateMongooseEncryptionMiddleware(fields: ModelField[], modelName: string): string {
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
 * Generate Mongoose soft delete middleware
 */
function generateMongooseSoftDeleteMiddleware(modelName: string): string {
	return `\n// Soft delete middleware
${modelName}Schema.pre('find', function() {
  this.where({ deletedAt: null });
});

${modelName}Schema.pre('findOne', function() {
  this.where({ deletedAt: null });
});
`;
}

/**
 * Generate TypeScript interfaces
 */
async function generateTypeScriptInterfaces(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	if (options.orm === "drizzle" || options.orm === "mongoose") {
		// These ORMs generate their own types
		return null;
	}

	const { projectRoot, modelName, fileName, fields, relations } = options;
	const typesDir = path.join(projectRoot, "src", "types");
	await fs.ensureDir(typesDir);

	const interfacePath = path.join(typesDir, `${fileName}.ts`);
	
	let content = `// Generated types for ${modelName}\n\n`;

	// Base interface
	content += `export interface ${modelName} {\n`;
	for (const field of fields) {
		const optional = field.optional ? "?" : "";
		content += `  ${field.name}${optional}: ${mapFieldTypeToTypeScript(field.type)};\n`;
	}
	
	// Add relation types
	for (const relation of relations) {
		const relationType = relation.type === "hasMany" || relation.type === "belongsToMany" 
			? `${relation.model}[]` 
			: `${relation.model}`;
		content += `  ${relation.name}?: ${relationType};\n`;
	}
	
	content += `}\n\n`;

	// Create input type (without auto-generated fields)
	const excludeFields = ["id", "createdAt", "updatedAt", "createdBy", "updatedBy", "version", "deletedAt"];
	const inputFields = fields.filter(f => !excludeFields.includes(f.name));
	
	content += `export interface Create${modelName}Input {\n`;
	for (const field of inputFields) {
		const optional = field.optional ? "?" : "";
		content += `  ${field.name}${optional}: ${mapFieldTypeToTypeScript(field.type)};\n`;
	}
	content += `}\n\n`;

	// Update input type (all fields optional)
	content += `export interface Update${modelName}Input {\n`;
	for (const field of inputFields) {
		content += `  ${field.name}?: ${mapFieldTypeToTypeScript(field.type)};\n`;
	}
	content += `}\n`;

	await fs.writeFile(interfacePath, content);
	return interfacePath;
}

/**
 * Generate validation schema
 */
async function generateValidationSchema(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	const { projectRoot, modelName, fileName, fields } = options;
	const validationDir = options.validationDir || path.join(projectRoot, "src", "validations");
	await fs.ensureDir(validationDir);

	const validationPath = path.join(validationDir, `${fileName}.validation.ts`);
	
	let content = `import { z } from 'zod';

// Create ${modelName} schema
export const create${modelName}Schema = z.object({
`;

	const excludeFields = ["id", "createdAt", "updatedAt", "createdBy", "updatedBy", "version", "deletedAt"];
	const inputFields = fields.filter(f => !excludeFields.includes(f.name));

	for (const field of inputFields) {
		const zodType = generateZodType(field);
		const optional = field.optional ? ".optional()" : "";
		content += `  ${field.name}: ${zodType}${optional},\n`;
	}

	content += `});

// Update ${modelName} schema (all fields optional)
export const update${modelName}Schema = create${modelName}Schema.partial();

// Query ${modelName} schema
export const query${modelName}Schema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  search: z.string().optional(),
});

// Types
export type Create${modelName}Input = z.infer<typeof create${modelName}Schema>;
export type Update${modelName}Input = z.infer<typeof update${modelName}Schema>;
export type Query${modelName}Input = z.infer<typeof query${modelName}Schema>;
`;

	await fs.writeFile(validationPath, content);
	return validationPath;
}

/**
 * Generate Zod type for a field
 */
function generateZodType(field: ModelField): string {
	let zodType = "";

	switch (field.type) {
		case "string":
		case "text":
		case "uuid":
			zodType = "z.string()";
			break;
		case "number":
		case "decimal":
			zodType = "z.number()";
			break;
		case "boolean":
			zodType = "z.boolean()";
			break;
		case "date":
		case "datetime":
			zodType = "z.date()";
			break;
		case "json":
			zodType = "z.object({})";
			break;
		case "enum":
			zodType = "z.enum(['option1', 'option2'])"; // Placeholder
			break;
		default:
			zodType = "z.string()";
	}

	// Add validation rules
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

	// Add GDPR compliance message
	if (field.gdprSensitive) {
		zodType += `.describe('GDPR sensitive field')`;
	}

	return zodType;
}

/**
 * Generate CRUD service
 */
async function generateCRUDService(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	const { projectRoot, modelName, fileName, orm } = options;
	const servicesDir = options.servicesDir || path.join(projectRoot, "src", "services");
	await fs.ensureDir(servicesDir);

	const servicePath = path.join(servicesDir, `${fileName}.service.ts`);
	
	let content = generateServiceImports(options);
	content += generateServiceClass(options, context);

	await fs.writeFile(servicePath, content);
	return servicePath;
}

/**
 * Generate service imports
 */
function generateServiceImports(options: ModelGenerationOptions): string {
	const { orm, modelName, fileName } = options;
	
	let imports = "";

	if (orm === "prisma") {
		imports = `import { prisma } from '@/lib/prisma';
import type { ${modelName} } from '@prisma/client';
`;
	} else if (orm === "drizzle") {
		imports = `import { db } from '@/lib/db';
import { ${options.tableName}, type ${modelName}, type New${modelName} } from '@/db/schema/${fileName}';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
`;
	} else if (orm === "mongoose") {
		imports = `import { ${modelName}, type I${modelName} } from '@/models/${fileName}.model';
`;
	}

	imports += `import { Create${modelName}Input, Update${modelName}Input, Query${modelName}Input } from '@/validations/${fileName}.validation';
`;

	if (options.gdprCompliant) {
		imports += `import { logAuditEvent } from '@/lib/audit';
import { maskSensitiveData } from '@/lib/gdpr';
`;
	}

	return imports;
}

/**
 * Generate service class
 */
function generateServiceClass(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): string {
	const { modelName, orm } = options;
	
	return `
export class ${modelName}Service {
  /**
   * Create a new ${modelName}
   */
  async create(data: Create${modelName}Input, userId?: string): Promise<${modelName}> {
    ${options.gdprCompliant ? `await logAuditEvent('${modelName}.create', userId, { action: 'create' });` : ""}
    
    ${generateCreateMethod(options)}
  }

  /**
   * Get ${modelName} by ID
   */
  async findById(id: string): Promise<${modelName} | null> {
    ${generateFindByIdMethod(options)}
  }

  /**
   * Get all ${modelName}s with pagination
   */
  async findMany(query: Query${modelName}Input): Promise<{
    data: ${modelName}[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    ${generateFindManyMethod(options)}
  }

  /**
   * Update ${modelName}
   */
  async update(id: string, data: Update${modelName}Input, userId?: string): Promise<${modelName}> {
    ${options.gdprCompliant ? `await logAuditEvent('${modelName}.update', userId, { action: 'update', id });` : ""}
    
    ${generateUpdateMethod(options)}
  }

  /**
   * Delete ${modelName}
   */
  async delete(id: string, userId?: string): Promise<void> {
    ${options.gdprCompliant ? `await logAuditEvent('${modelName}.delete', userId, { action: 'delete', id });` : ""}
    
    ${generateDeleteMethod(options)}
  }

  ${options.withSoftDelete ? generateSoftDeleteMethods(options) : ""}
  
  ${options.gdprCompliant ? generateGDPRMethods(options) : ""}
}

export const ${toLowerFirst(modelName)}Service = new ${modelName}Service();
`;
}

/**
 * Generate create method based on ORM
 */
function generateCreateMethod(options: ModelGenerationOptions): string {
	const { orm, modelName, tableName, withAudit } = options;
	
	switch (orm) {
		case "prisma":
			return `const result = await prisma.${toLowerFirst(modelName)}.create({
      data: {
        ...data,
        ${withAudit ? "createdBy: userId," : ""}
      },
    });
    return result;`;
    
		case "drizzle":
			return `const [result] = await db.insert(${tableName}).values({
      ...data,
      ${withAudit ? "createdBy: userId," : ""}
    }).returning();
    return result;`;
    
		case "mongoose":
			return `const result = await ${modelName}.create({
      ...data,
      ${withAudit ? "createdBy: userId," : ""}
    });
    return result.toObject();`;
    
		default:
			return "";
	}
}

/**
 * Generate findById method based on ORM
 */
function generateFindByIdMethod(options: ModelGenerationOptions): string {
	const { orm, modelName, tableName } = options;
	
	switch (orm) {
		case "prisma":
			return `const result = await prisma.${toLowerFirst(modelName)}.findUnique({
      where: { id },
    });
    return result;`;
    
		case "drizzle":
			return `const [result] = await db.select().from(${tableName}).where(eq(${tableName}.id, id)).limit(1);
    return result || null;`;
    
		case "mongoose":
			return `const result = await ${modelName}.findById(id);
    return result ? result.toObject() : null;`;
    
		default:
			return "";
	}
}

/**
 * Generate findMany method based on ORM
 */
function generateFindManyMethod(options: ModelGenerationOptions): string {
	const { orm, modelName, tableName } = options;
	const offset = "(query.page - 1) * query.limit";
	
	switch (orm) {
		case "prisma":
			return `const where = query.search ? {
      OR: [
        // Add searchable fields here
      ],
    } : {};

    const [data, total] = await Promise.all([
      prisma.${toLowerFirst(modelName)}.findMany({
        where,
        skip: ${offset},
        take: query.limit,
        orderBy: query.sortBy ? {
          [query.sortBy]: query.sortOrder,
        } : undefined,
      }),
      prisma.${toLowerFirst(modelName)}.count({ where }),
    ]);

    return {
      data,
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };`;
    
		case "drizzle":
			return `// Build where clause for search
    const whereConditions = [];
    if (query.search) {
      // Add searchable fields here
    }
    
    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    const [data, [{ count: total }]] = await Promise.all([
      db.select()
        .from(${tableName})
        .where(where)
        .limit(query.limit)
        .offset(${offset})
        .orderBy(query.sortOrder === 'desc' ? desc(${tableName}[query.sortBy || 'createdAt']) : asc(${tableName}[query.sortBy || 'createdAt'])),
      db.select({ count: sql\`count(*)\` })
        .from(${tableName})
        .where(where),
    ]);

    return {
      data,
      total: Number(total),
      page: query.page,
      totalPages: Math.ceil(Number(total) / query.limit),
    };`;
    
		case "mongoose":
			return `const query = ${modelName}.find();
    
    if (query.search) {
      // Add searchable fields here
    }
    
    const [data, total] = await Promise.all([
      query
        .skip(${offset})
        .limit(query.limit)
        .sort({ [query.sortBy || 'createdAt']: query.sortOrder === 'desc' ? -1 : 1 }),
      ${modelName}.countDocuments(query.getQuery()),
    ]);

    return {
      data: data.map(doc => doc.toObject()),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };`;
    
		default:
			return "";
	}
}

/**
 * Generate update method based on ORM
 */
function generateUpdateMethod(options: ModelGenerationOptions): string {
	const { orm, modelName, tableName, withAudit } = options;
	
	switch (orm) {
		case "prisma":
			return `const result = await prisma.${toLowerFirst(modelName)}.update({
      where: { id },
      data: {
        ...data,
        ${withAudit ? "updatedBy: userId," : ""}
      },
    });
    return result;`;
    
		case "drizzle":
			return `const [result] = await db.update(${tableName})
      .set({
        ...data,
        ${withAudit ? "updatedBy: userId," : ""}
        updatedAt: new Date(),
      })
      .where(eq(${tableName}.id, id))
      .returning();
    return result;`;
    
		case "mongoose":
			return `const result = await ${modelName}.findByIdAndUpdate(
      id,
      {
        ...data,
        ${withAudit ? "updatedBy: userId," : ""}
      },
      { new: true }
    );
    if (!result) throw new Error('${modelName} not found');
    return result.toObject();`;
    
		default:
			return "";
	}
}

/**
 * Generate delete method based on ORM
 */
function generateDeleteMethod(options: ModelGenerationOptions): string {
	const { orm, modelName, tableName, withSoftDelete } = options;
	
	if (withSoftDelete) {
		return `await this.softDelete(id, userId);`;
	}
	
	switch (orm) {
		case "prisma":
			return `await prisma.${toLowerFirst(modelName)}.delete({
      where: { id },
    });`;
    
		case "drizzle":
			return `await db.delete(${tableName}).where(eq(${tableName}.id, id));`;
    
		case "mongoose":
			return `await ${modelName}.findByIdAndDelete(id);`;
    
		default:
			return "";
	}
}

/**
 * Generate soft delete methods
 */
function generateSoftDeleteMethods(options: ModelGenerationOptions): string {
	const { modelName } = options;
	
	return `
  /**
   * Soft delete ${modelName}
   */
  async softDelete(id: string, userId?: string): Promise<void> {
    await this.update(id, { deletedAt: new Date() } as any, userId);
  }

  /**
   * Restore soft deleted ${modelName}
   */
  async restore(id: string, userId?: string): Promise<${modelName}> {
    ${options.gdprCompliant ? `await logAuditEvent('${modelName}.restore', userId, { action: 'restore', id });` : ""}
    return await this.update(id, { deletedAt: null } as any, userId);
  }

  /**
   * Find all including soft deleted
   */
  async findManyWithDeleted(query: Query${modelName}Input): Promise<{
    data: ${modelName}[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Implementation depends on ORM
    // This would bypass the soft delete filter
    return this.findMany(query);
  }`;
}

/**
 * Generate GDPR methods
 */
function generateGDPRMethods(options: ModelGenerationOptions): string {
	const { modelName } = options;
	
	return `
  /**
   * Export user data for GDPR compliance
   */
  async exportUserData(userId: string): Promise<${modelName}[]> {
    await logAuditEvent('${modelName}.export', userId, { action: 'export' });
    
    // Find all records related to this user
    const data = await this.findMany({ search: userId } as any);
    
    // Mask sensitive data if needed
    return data.data.map(item => maskSensitiveData(item));
  }

  /**
   * Anonymize user data for GDPR compliance
   */
  async anonymizeUserData(userId: string): Promise<void> {
    await logAuditEvent('${modelName}.anonymize', userId, { action: 'anonymize' });
    
    // Implementation depends on business logic
    // This would update all user-related fields to anonymous values
  }`;
}

/**
 * Generate API routes
 */
async function generateAPIRoutes(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string[]> {
	if (!options.apiDir) return [];

	const { apiDir, fileName } = options;
	const apiPath = path.join(apiDir, fileName);
	await fs.ensureDir(apiPath);

	const files: string[] = [];

	// Generate route.ts for Next.js App Router
	const routeFile = await generateNextAPIRoute(options, context, apiPath);
	if (routeFile) {
		files.push(routeFile);
	}

	// Generate [id]/route.ts for single resource operations
	const idRoutePath = path.join(apiPath, "[id]");
	await fs.ensureDir(idRoutePath);
	const idRouteFile = await generateNextAPIIdRoute(options, context, idRoutePath);
	if (idRouteFile) {
		files.push(idRouteFile);
	}

	return files;
}

/**
 * Generate Next.js API route for collection operations
 */
async function generateNextAPIRoute(
	options: ModelGenerationOptions,
	context: ModelTemplateContext,
	apiPath: string
): Promise<string | null> {
	const { modelName, fileName } = options;
	const routePath = path.join(apiPath, "route.ts");

	const content = `import { NextRequest, NextResponse } from 'next/server';
import { ${toLowerFirst(modelName)}Service } from '@/services/${fileName}.service';
import { create${modelName}Schema, query${modelName}Schema } from '@/validations/${fileName}.validation';
import { z } from 'zod';
${options.compliance !== "none" ? "import { requireAuth } from '@/lib/auth';" : ""}

${options.compliance !== "none" ? "// @requireAuth" : ""}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = query${modelName}Schema.parse({
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || 10),
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const result = await ${toLowerFirst(modelName)}Service.findMany(query);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error fetching ${modelName}s:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

${options.compliance !== "none" ? "// @requireAuth" : ""}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = create${modelName}Schema.parse(body);
    
    ${options.compliance !== "none" ? "// Get user ID from auth context\n    const userId = request.headers.get('x-user-id');" : ""}
    
    const result = await ${toLowerFirst(modelName)}Service.create(
      validatedData${options.compliance !== "none" ? ",\n      userId || undefined" : ""}
    );
    
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

	await fs.writeFile(routePath, content);
	return routePath;
}

/**
 * Generate Next.js API route for single resource operations
 */
async function generateNextAPIIdRoute(
	options: ModelGenerationOptions,
	context: ModelTemplateContext,
	idRoutePath: string
): Promise<string | null> {
	const { modelName, fileName } = options;
	const routePath = path.join(idRoutePath, "route.ts");

	const content = `import { NextRequest, NextResponse } from 'next/server';
import { ${toLowerFirst(modelName)}Service } from '@/services/${fileName}.service';
import { update${modelName}Schema } from '@/validations/${fileName}.validation';
import { z } from 'zod';
${options.compliance !== "none" ? "import { requireAuth } from '@/lib/auth';" : ""}

${options.compliance !== "none" ? "// @requireAuth" : ""}
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await ${toLowerFirst(modelName)}Service.findById(params.id);
    
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

${options.compliance !== "none" ? "// @requireAuth" : ""}
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = update${modelName}Schema.parse(body);
    
    ${options.compliance !== "none" ? "// Get user ID from auth context\n    const userId = request.headers.get('x-user-id');" : ""}
    
    const result = await ${toLowerFirst(modelName)}Service.update(
      params.id,
      validatedData${options.compliance !== "none" ? ",\n      userId || undefined" : ""}
    );
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating ${modelName}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

${options.compliance !== "none" ? "// @requireAuth" : ""}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ${options.compliance !== "none" ? "// Get user ID from auth context\n    const userId = request.headers.get('x-user-id');" : ""}
    
    await ${toLowerFirst(modelName)}Service.delete(
      params.id${options.compliance !== "none" ? ",\n      userId || undefined" : ""}
    );
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting ${modelName}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

	await fs.writeFile(routePath, content);
	return routePath;
}

/**
 * Generate seed file
 */
async function generateSeedFile(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	const { projectRoot, modelName, fileName, fields } = options;
	const seedsDir = options.seedsDir || path.join(projectRoot, "prisma", "seeds");
	await fs.ensureDir(seedsDir);

	const seedPath = path.join(seedsDir, `${fileName}.seed.ts`);
	
	const content = `import { ${toLowerFirst(modelName)}Service } from '@/services/${fileName}.service';
import { faker } from '@faker-js/faker';

export async function seed${modelName}s(count = 10) {
  console.log(\`Seeding \${count} ${modelName}s...\`);
  
  const ${toLowerFirst(modelName)}s = [];
  
  for (let i = 0; i < count; i++) {
    const data = {
${generateSeedData(fields)}
    };
    
    try {
      const ${toLowerFirst(modelName)} = await ${toLowerFirst(modelName)}Service.create(data);
      ${toLowerFirst(modelName)}s.push(${toLowerFirst(modelName)});
    } catch (error) {
      console.error(\`Error seeding ${modelName} \${i + 1}:\`, error);
    }
  }
  
  console.log(\`Seeded \${${toLowerFirst(modelName)}s.length} ${modelName}s\`);
  return ${toLowerFirst(modelName)}s;
}
`;

	await fs.writeFile(seedPath, content);
	return seedPath;
}

/**
 * Generate seed data for fields
 */
function generateSeedData(fields: ModelField[]): string {
	const excludeFields = ["id", "createdAt", "updatedAt", "createdBy", "updatedBy", "version", "deletedAt"];
	const seedFields = fields.filter(f => !excludeFields.includes(f.name));
	
	return seedFields.map(field => {
		const value = generateFakerValue(field);
		return `      ${field.name}: ${value},`;
	}).join("\n");
}

/**
 * Generate faker value for field type
 */
function generateFakerValue(field: ModelField): string {
	if (field.name.toLowerCase().includes("email")) {
		return "faker.internet.email()";
	}
	if (field.name.toLowerCase().includes("name")) {
		return "faker.person.fullName()";
	}
	if (field.name.toLowerCase().includes("phone")) {
		return "faker.phone.number()";
	}
	if (field.name.toLowerCase().includes("address")) {
		return "faker.location.streetAddress()";
	}
	
	switch (field.type) {
		case "string":
		case "text":
			return "faker.lorem.sentence()";
		case "number":
		case "decimal":
			return "faker.number.int({ min: 1, max: 100 })";
		case "boolean":
			return "faker.datatype.boolean()";
		case "date":
		case "datetime":
			return "faker.date.recent()";
		case "uuid":
			return "faker.string.uuid()";
		case "json":
			return "{}";
		default:
			return "null";
	}
}

/**
 * Generate model tests
 */
async function generateModelTests(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string[]> {
	const files: string[] = [];
	
	// Generate service tests
	const serviceTest = await generateServiceTests(options, context);
	if (serviceTest) {
		files.push(serviceTest);
	}
	
	// Generate API tests
	const apiTest = await generateAPITests(options, context);
	if (apiTest) {
		files.push(apiTest);
	}
	
	return files;
}

/**
 * Generate service tests
 */
async function generateServiceTests(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	const { projectRoot, modelName, fileName } = options;
	const testsDir = options.testsDir || path.join(projectRoot, "src", "__tests__", "services");
	await fs.ensureDir(testsDir);

	const testPath = path.join(testsDir, `${fileName}.service.test.ts`);
	
	const content = `import { ${toLowerFirst(modelName)}Service } from '@/services/${fileName}.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('${modelName}Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new ${modelName}', async () => {
      const data = {
        // Add test data
      };
      
      const result = await ${toLowerFirst(modelName)}Service.create(data);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find ${modelName} by id', async () => {
      // Create a test ${modelName} first
      const created = await ${toLowerFirst(modelName)}Service.create({
        // Add test data
      });
      
      const result = await ${toLowerFirst(modelName)}Service.findById(created.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
    });
    
    it('should return null for non-existent id', async () => {
      const result = await ${toLowerFirst(modelName)}Service.findById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update ${modelName}', async () => {
      // Create a test ${modelName} first
      const created = await ${toLowerFirst(modelName)}Service.create({
        // Add test data
      });
      
      const updateData = {
        // Add update data
      };
      
      const result = await ${toLowerFirst(modelName)}Service.update(created.id, updateData);
      
      expect(result).toBeDefined();
      // Add assertions for updated fields
    });
  });

  describe('delete', () => {
    it('should delete ${modelName}', async () => {
      // Create a test ${modelName} first
      const created = await ${toLowerFirst(modelName)}Service.create({
        // Add test data
      });
      
      await ${toLowerFirst(modelName)}Service.delete(created.id);
      
      const result = await ${toLowerFirst(modelName)}Service.findById(created.id);
      expect(result).toBeNull();
    });
  });
});
`;

	await fs.writeFile(testPath, content);
	return testPath;
}

/**
 * Generate API tests
 */
async function generateAPITests(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	if (!options.apiDir) return null;

	const { projectRoot, modelName, fileName } = options;
	const testsDir = path.join(projectRoot, "src", "__tests__", "api");
	await fs.ensureDir(testsDir);

	const testPath = path.join(testsDir, `${fileName}.api.test.ts`);
	
	const content = `import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/${fileName}/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/${fileName}/[id]/route';

describe('/api/${fileName}', () => {
  describe('GET /api/${fileName}', () => {
    it('should return paginated results', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/${fileName}?page=1&limit=10',
      });
      
      const response = await GET(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('totalPages');
    });
  });

  describe('POST /api/${fileName}', () => {
    it('should create a new ${modelName}', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          // Add test data
        },
      });
      
      const response = await POST(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
    });
    
    it('should return validation error for invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          // Invalid data
        },
      });
      
      const response = await POST(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Validation error');
    });
  });
});
`;

	await fs.writeFile(testPath, content);
	return testPath;
}

/**
 * Generate GraphQL schema
 */
async function generateGraphQLSchema(
	options: ModelGenerationOptions,
	context: ModelTemplateContext
): Promise<string | null> {
	const { projectRoot, modelName, fields } = options;
	const graphqlDir = path.join(projectRoot, "src", "graphql", "schemas");
	await fs.ensureDir(graphqlDir);

	const schemaPath = path.join(graphqlDir, `${options.fileName}.graphql`);
	
	let content = `type ${modelName} {
`;

	// Add fields
	for (const field of fields) {
		const graphqlType = mapFieldTypeToGraphQL(field);
		content += `  ${field.name}: ${graphqlType}\n`;
	}

	content += `}

input Create${modelName}Input {
`;

	// Add input fields (excluding auto-generated)
	const excludeFields = ["id", "createdAt", "updatedAt", "createdBy", "updatedBy", "version", "deletedAt"];
	const inputFields = fields.filter(f => !excludeFields.includes(f.name));
	
	for (const field of inputFields) {
		const graphqlType = mapFieldTypeToGraphQL(field);
		content += `  ${field.name}: ${graphqlType}\n`;
	}

	content += `}

input Update${modelName}Input {
`;

	// All fields optional for update
	for (const field of inputFields) {
		const graphqlType = mapFieldTypeToGraphQL({ ...field, optional: true });
		content += `  ${field.name}: ${graphqlType}\n`;
	}

	content += `}

type ${modelName}Connection {
  edges: [${modelName}Edge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ${modelName}Edge {
  node: ${modelName}!
  cursor: String!
}

extend type Query {
  ${toLowerFirst(modelName)}(id: ID!): ${modelName}
  ${toLowerFirst(modelName)}s(
    first: Int
    after: String
    last: Int
    before: String
    search: String
    sortBy: String
    sortOrder: SortOrder
  ): ${modelName}Connection!
}

extend type Mutation {
  create${modelName}(input: Create${modelName}Input!): ${modelName}!
  update${modelName}(id: ID!, input: Update${modelName}Input!): ${modelName}!
  delete${modelName}(id: ID!): Boolean!
}
`;

	await fs.writeFile(schemaPath, content);
	return schemaPath;
}

/**
 * Map field type to GraphQL type
 */
function mapFieldTypeToGraphQL(field: ModelField): string {
	const typeMap: Record<string, string> = {
		string: "String",
		text: "String",
		uuid: "ID",
		number: "Int",
		decimal: "Float",
		boolean: "Boolean",
		date: "DateTime",
		datetime: "DateTime",
		json: "JSON",
		enum: "String",
	};

	const baseType = typeMap[field.type] || "String";
	return field.optional ? baseType : `${baseType}!`;
}

/**
 * Generate model imports
 */
function generateModelImports(options: ModelGenerationOptions): string[] {
	const imports: string[] = [];

	if (options.orm === "prisma") {
		imports.push("import { PrismaClient } from '@prisma/client';");
	} else if (options.orm === "drizzle") {
		imports.push("import { drizzle } from 'drizzle-orm/node-postgres';");
	} else if (options.orm === "mongoose") {
		imports.push("import mongoose from 'mongoose';");
	}

	if (options.withValidation) {
		imports.push("import { z } from 'zod';");
	}

	if (options.gdprCompliant) {
		imports.push("import { encrypt, decrypt } from '@/lib/encryption';");
	}

	return imports;
}

/**
 * Generate interfaces
 */
function generateInterfaces(options: ModelGenerationOptions): string[] {
	// Interface generation is handled in generateTypeScriptInterfaces
	return [];
}

/**
 * Generate schema definition
 */
function generateSchemaDefinition(options: ModelGenerationOptions): string {
	// Schema definition is generated in the specific ORM methods
	return "";
}

/**
 * Generate validation schema content
 */
function generateValidationSchemaContent(options: ModelGenerationOptions): string {
	// Validation schema is generated in generateValidationSchema
	return "";
}

/**
 * Generate CRUD methods
 */
function generateCRUDMethods(options: ModelGenerationOptions): string[] {
	return ["create", "findById", "findMany", "update", "delete"];
}

/**
 * Get migration command based on ORM
 */
function getMigrationCommand(orm: ORM): string {
	switch (orm) {
		case "prisma":
			return "npx prisma migrate dev --name add_[model_name]";
		case "drizzle":
			return "npm run db:generate && npm run db:migrate";
		default:
			return "";
	}
}

/**
 * Convert to snake_case
 */
function toSnakeCase(str: string): string {
	return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Convert first letter to lowercase
 */
function toLowerFirst(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}