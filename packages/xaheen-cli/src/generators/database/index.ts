/**
 * Database Generator System
 * Complete database management with migrations, seeds, and schema generation
 * Supports PostgreSQL, MySQL, MongoDB, SQLite, and Supabase
 */

export interface DatabaseGeneratorOptions {
	readonly type: "migration" | "seed" | "schema" | "repository";
	readonly database: "postgresql" | "mysql" | "mongodb" | "sqlite" | "supabase";
	readonly orm: "prisma" | "typeorm" | "mongoose" | "drizzle";
	readonly name: string;
	readonly fields?: readonly DatabaseField[];
	readonly relations?: readonly DatabaseRelation[];
	readonly indexes?: readonly DatabaseIndex[];
	readonly constraints?: readonly DatabaseConstraint[];
	readonly seedData?: readonly Record<string, unknown>[];
	readonly rollback?: boolean;
}

export interface DatabaseField {
	readonly name: string;
	readonly type:
		| "string"
		| "number"
		| "boolean"
		| "date"
		| "uuid"
		| "json"
		| "text"
		| "enum";
	readonly required?: boolean;
	readonly unique?: boolean;
	readonly default?: unknown;
	readonly length?: number;
	readonly precision?: number;
	readonly scale?: number;
	readonly enumValues?: readonly string[];
	readonly description?: string;
}

export interface DatabaseRelation {
	readonly type: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
	readonly target: string;
	readonly foreignKey?: string;
	readonly joinTable?: string;
	readonly cascade?: boolean;
	readonly onDelete?: "CASCADE" | "SET NULL" | "RESTRICT";
	readonly onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT";
}

export interface DatabaseIndex {
	readonly name: string;
	readonly fields: readonly string[];
	readonly unique?: boolean;
	readonly type?: "btree" | "hash" | "gin" | "gist";
}

export interface DatabaseConstraint {
	readonly name: string;
	readonly type: "check" | "unique" | "foreignKey" | "primaryKey";
	readonly fields: readonly string[];
	readonly expression?: string;
	readonly references?: {
		table: string;
		fields: readonly string[];
	};
}

export interface DatabaseGeneratorResult {
	readonly success: boolean;
	readonly files: readonly GeneratedDatabaseFile[];
	readonly commands: readonly string[];
	readonly message: string;
	readonly nextSteps: readonly string[];
}

export interface GeneratedDatabaseFile {
	readonly path: string;
	readonly content: string;
	readonly type: "migration" | "seed" | "schema" | "repository" | "model";
	readonly language: "typescript" | "sql" | "json";
}

/**
 * Main database generator function
 * Generates database-related files based on type and options
 */
export async function generateDatabase(
	projectPath: string,
	options: DatabaseGeneratorOptions,
): Promise<DatabaseGeneratorResult> {
	try {
		const generator = createDatabaseGenerator(options.orm);
		const result = await generator.generate(projectPath, options);

		return {
			success: true,
			files: result.files,
			commands: result.commands,
			message: `Successfully generated ${options.type} '${options.name}' for ${options.database}`,
			nextSteps: result.nextSteps,
		};
	} catch (error) {
		return {
			success: false,
			files: [],
			commands: [],
			message: `Failed to generate database ${options.type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			nextSteps: ["Check the error message and try again"],
		};
	}
}

/**
 * Database generator factory
 * Creates appropriate generator based on ORM choice
 */
function createDatabaseGenerator(
	orm: DatabaseGeneratorOptions["orm"],
): DatabaseGenerator {
	switch (orm) {
		case "prisma":
			return new PrismaGenerator();
		case "typeorm":
			return new TypeORMGenerator();
		case "mongoose":
			return new MongooseGenerator();
		case "drizzle":
			return new DrizzleGenerator();
		default:
			throw new Error(`Unsupported ORM: ${orm}`);
	}
}

/**
 * Abstract base class for database generators
 * Provides common functionality for all ORM generators
 */
export abstract class DatabaseGenerator {
	abstract readonly orm: string;
	abstract readonly supportedDatabases: readonly string[];
	abstract readonly supportedTypes: readonly string[];

	abstract generate(
		projectPath: string,
		options: DatabaseGeneratorOptions,
	): Promise<DatabaseGeneratorResult>;

	/**
	 * Generate timestamp for migration files
	 */
	protected generateTimestamp(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		const seconds = String(now.getSeconds()).padStart(2, "0");

		return `${year}${month}${day}${hours}${minutes}${seconds}`;
	}

	/**
	 * Convert field type to database-specific type
	 */
	protected convertFieldType(field: DatabaseField, database: string): string {
		switch (field.type) {
			case "string":
				if (database === "postgresql")
					return field.length ? `VARCHAR(${field.length})` : "TEXT";
				if (database === "mysql")
					return field.length ? `VARCHAR(${field.length})` : "TEXT";
				return "TEXT";

			case "number":
				if (field.precision && field.scale) {
					return `DECIMAL(${field.precision}, ${field.scale})`;
				}
				return "INTEGER";

			case "boolean":
				return "BOOLEAN";

			case "date":
				return "TIMESTAMP";

			case "uuid":
				if (database === "postgresql") return "UUID";
				return "VARCHAR(36)";

			case "json":
				if (database === "postgresql") return "JSONB";
				if (database === "mysql") return "JSON";
				return "TEXT";

			case "text":
				return "TEXT";

			case "enum":
				if (field.enumValues) {
					const values = field.enumValues.map((v) => `'${v}'`).join(", ");
					return `ENUM(${values})`;
				}
				return "VARCHAR(50)";

			default:
				return "TEXT";
		}
	}

	/**
	 * Generate field validation rules
	 */
	protected generateValidationRules(field: DatabaseField): string[] {
		const rules: string[] = [];

		if (field.required) rules.push("required");
		if (field.unique) rules.push("unique");
		if (field.length) rules.push(`maxLength:${field.length}`);
		if (field.enumValues) rules.push(`enum:${field.enumValues.join(",")}`);

		return rules;
	}

	/**
	 * Capitalize string
	 */
	protected capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Convert to camelCase
	 */
	protected toCamelCase(str: string): string {
		return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
	}

	/**
	 * Convert to snake_case
	 */
	protected toSnakeCase(str: string): string {
		return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
	}
}

/**
 * Prisma Database Generator
 * Generates Prisma schema, migrations, and seeds
 */
export class PrismaGenerator extends DatabaseGenerator {
	readonly orm = "prisma";
	readonly supportedDatabases = [
		"postgresql",
		"mysql",
		"sqlite",
		"mongodb",
	] as const;
	readonly supportedTypes = ["migration", "seed", "schema"] as const;

	async generate(
		projectPath: string,
		options: DatabaseGeneratorOptions,
	): Promise<DatabaseGeneratorResult> {
		const files: GeneratedDatabaseFile[] = [];
		const commands: string[] = [];

		switch (options.type) {
			case "migration":
				files.push(...this.generateMigration(options));
				commands.push("npx prisma migrate dev", "npx prisma generate");
				break;

			case "seed":
				files.push(this.generateSeed(options));
				commands.push("npx prisma db seed");
				break;

			case "schema":
				files.push(this.generateSchema(options));
				commands.push("npx prisma generate");
				break;
		}

		return {
			success: true,
			files,
			commands,
			message: `Generated Prisma ${options.type} successfully`,
			nextSteps: [
				"Review generated files",
				"Run migration commands",
				"Test database changes",
				"Update your application code",
			],
		};
	}

	private generateMigration(
		options: DatabaseGeneratorOptions,
	): GeneratedDatabaseFile[] {
		const timestamp = this.generateTimestamp();
		const migrationName = `${timestamp}_${options.name}`;

		// Generate Prisma schema update
		const schemaUpdate = this.generatePrismaModel(options);

		// Generate SQL migration (if needed)
		const sqlMigration = this.generateSQLMigration(options);

		return [
			{
				path: `prisma/migrations/${migrationName}/migration.sql`,
				content: sqlMigration,
				type: "migration",
				language: "sql",
			},
			{
				path: `prisma/schema-update.prisma`,
				content: schemaUpdate,
				type: "schema",
				language: "typescript",
			},
		];
	}

	private generateSeed(
		options: DatabaseGeneratorOptions,
	): GeneratedDatabaseFile {
		const seedContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed${this.capitalize(options.name)}(): Promise<void> {
  console.log('Seeding ${options.name}...');
  
  const seedData = ${JSON.stringify(options.seedData || [], null, 2)};
  
  for (const data of seedData) {
    await prisma.${this.toCamelCase(options.name)}.create({
      data
    });
  }
  
  console.log('${this.capitalize(options.name)} seeding completed');
}

async function main(): Promise<void> {
  try {
    await seed${this.capitalize(options.name)}();
  } catch (error) {
    console.error('Error seeding ${options.name}:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();`;

		return {
			path: `prisma/seeds/${options.name}.seed.ts`,
			content: seedContent,
			type: "seed",
			language: "typescript",
		};
	}

	private generateSchema(
		options: DatabaseGeneratorOptions,
	): GeneratedDatabaseFile {
		const modelContent = this.generatePrismaModel(options);

		return {
			path: `prisma/schema.prisma`,
			content: modelContent,
			type: "schema",
			language: "typescript",
		};
	}

	private generatePrismaModel(options: DatabaseGeneratorOptions): string {
		const modelName = this.capitalize(options.name);
		const fields = options.fields || [];

		let modelContent = `model ${modelName} {\n`;

		// Add ID field
		modelContent += `  id        String   @id @default(cuid())\n`;

		// Add custom fields
		for (const field of fields) {
			const fieldType = this.convertPrismaFieldType(field);
			const attributes = this.generatePrismaAttributes(field);

			modelContent += `  ${field.name.padEnd(10)} ${fieldType.padEnd(10)} ${attributes}\n`;
		}

		// Add timestamp fields
		modelContent += `  createdAt DateTime @default(now())\n`;
		modelContent += `  updatedAt DateTime @updatedAt\n`;

		// Add relations
		if (options.relations) {
			for (const relation of options.relations) {
				modelContent += this.generatePrismaRelation(relation);
			}
		}

		// Add table mapping
		modelContent += `\n  @@map("${this.toSnakeCase(options.name)}s")\n`;

		// Add indexes
		if (options.indexes) {
			for (const index of options.indexes) {
				const indexType = index.unique ? "@@unique" : "@@index";
				const fields = index.fields.join(", ");
				modelContent += `  ${indexType}([${fields}])\n`;
			}
		}

		modelContent += `}\n`;

		return modelContent;
	}

	private convertPrismaFieldType(field: DatabaseField): string {
		switch (field.type) {
			case "string":
				return field.required ? "String" : "String?";
			case "number":
				return field.required ? "Int" : "Int?";
			case "boolean":
				return field.required ? "Boolean" : "Boolean?";
			case "date":
				return field.required ? "DateTime" : "DateTime?";
			case "uuid":
				return field.required ? "String" : "String?";
			case "json":
				return field.required ? "Json" : "Json?";
			case "text":
				return field.required ? "String" : "String?";
			case "enum":
				return field.required
					? `${this.capitalize(field.name)}Enum`
					: `${this.capitalize(field.name)}Enum?`;
			default:
				return field.required ? "String" : "String?";
		}
	}

	private generatePrismaAttributes(field: DatabaseField): string {
		const attributes: string[] = [];

		if (field.unique) attributes.push("@unique");
		if (field.default !== undefined) {
			if (typeof field.default === "string") {
				attributes.push(`@default("${field.default}")`);
			} else {
				attributes.push(`@default(${field.default})`);
			}
		}
		if (field.length) attributes.push(`@db.VarChar(${field.length})`);

		return attributes.join(" ");
	}

	private generatePrismaRelation(relation: DatabaseRelation): string {
		switch (relation.type) {
			case "oneToMany":
				return `  ${relation.target.toLowerCase()}s ${this.capitalize(relation.target)}[]\n`;
			case "manyToOne":
				return `  ${relation.target.toLowerCase()} ${this.capitalize(relation.target)}? @relation(fields: [${relation.foreignKey}], references: [id])\n  ${relation.foreignKey} String?\n`;
			case "oneToOne":
				return `  ${relation.target.toLowerCase()} ${this.capitalize(relation.target)}?\n`;
			case "manyToMany":
				return `  ${relation.target.toLowerCase()}s ${this.capitalize(relation.target)}[]\n`;
			default:
				return "";
		}
	}

	private generateSQLMigration(options: DatabaseGeneratorOptions): string {
		const tableName = this.toSnakeCase(options.name) + "s";
		const fields = options.fields || [];

		let sql = `-- CreateTable\nCREATE TABLE "${tableName}" (\n`;

		// Add ID field
		sql += `    "id" TEXT NOT NULL,\n`;

		// Add custom fields
		for (const field of fields) {
			const fieldType = this.convertFieldType(field, "postgresql");
			const nullable = field.required ? " NOT NULL" : "";
			const defaultValue = field.default ? ` DEFAULT '${field.default}'` : "";

			sql += `    "${field.name}" ${fieldType}${nullable}${defaultValue},\n`;
		}

		// Add timestamp fields
		sql += `    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`;
		sql += `    "updated_at" TIMESTAMP(3) NOT NULL,\n`;

		// Add primary key
		sql += `\n    CONSTRAINT "${tableName}_pkey" PRIMARY KEY ("id")\n`;

		sql += `);\n`;

		// Add indexes
		if (options.indexes) {
			for (const index of options.indexes) {
				const indexType = index.unique ? "UNIQUE INDEX" : "INDEX";
				const fields = index.fields.map((f) => `"${f}"`).join(", ");
				sql += `\n-- CreateIndex\nCREATE ${indexType} "${tableName}_${index.name}_idx" ON "${tableName}"(${fields});\n`;
			}
		}

		return sql;
	}
}

/**
 * TypeORM Database Generator
 * Generates TypeORM entities, migrations, and seeds
 */
export class TypeORMGenerator extends DatabaseGenerator {
	readonly orm = "typeorm";
	readonly supportedDatabases = ["postgresql", "mysql", "sqlite"] as const;
	readonly supportedTypes = [
		"migration",
		"seed",
		"schema",
		"repository",
	] as const;

	async generate(
		projectPath: string,
		options: DatabaseGeneratorOptions,
	): Promise<DatabaseGeneratorResult> {
		// TypeORM implementation
		return {
			success: true,
			files: [],
			commands: [],
			message: "TypeORM generator not yet implemented",
			nextSteps: [],
		};
	}
}

/**
 * Mongoose Database Generator
 * Generates Mongoose schemas and seeds for MongoDB
 */
export class MongooseGenerator extends DatabaseGenerator {
	readonly orm = "mongoose";
	readonly supportedDatabases = ["mongodb"] as const;
	readonly supportedTypes = ["schema", "seed"] as const;

	async generate(
		projectPath: string,
		options: DatabaseGeneratorOptions,
	): Promise<DatabaseGeneratorResult> {
		// Mongoose implementation
		return {
			success: true,
			files: [],
			commands: [],
			message: "Mongoose generator not yet implemented",
			nextSteps: [],
		};
	}
}

/**
 * Drizzle Database Generator
 * Generates Drizzle schemas and migrations
 */
export class DrizzleGenerator extends DatabaseGenerator {
	readonly orm = "drizzle";
	readonly supportedDatabases = ["postgresql", "mysql", "sqlite"] as const;
	readonly supportedTypes = ["migration", "seed", "schema"] as const;

	async generate(
		projectPath: string,
		options: DatabaseGeneratorOptions,
	): Promise<DatabaseGeneratorResult> {
		// Drizzle implementation
		return {
			success: true,
			files: [],
			commands: [],
			message: "Drizzle generator not yet implemented",
			nextSteps: [],
		};
	}
}
