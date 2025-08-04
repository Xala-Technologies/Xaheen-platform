import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import type { CLICommand } from "../../types/index.js";
import { logger } from "../../utils/logger.js";

interface ModelField {
	name: string;
	type:
		| "String"
		| "Int"
		| "Float"
		| "Boolean"
		| "DateTime"
		| "Json"
		| "Relation";
	required: boolean;
	unique?: boolean;
	default?: any;
	relation?: {
		type: "hasOne" | "hasMany" | "belongsTo" | "belongsToMany";
		model: string;
		foreignKey?: string;
	};
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
		enum?: string[];
	};
}

interface ModelSchema {
	name: string;
	tableName?: string;
	fields: ModelField[];
	indexes?: string[];
	timestamps: boolean;
	softDelete?: boolean;
	traits?: ("searchable" | "sluggable" | "versionable" | "auditable")[];
}

interface GeneratedArtifacts {
	prismaModel: string;
	migrationFile: string;
	backendController: string;
	backendService: string;
	backendValidation: string;
	frontendPage: string;
	frontendForm: string;
	frontendTable: string;
	apiTypes: string;
}

export default class ModelDomain {
	private modelSchemas: Map<string, ModelSchema> = new Map();

	constructor() {
		this.initializeCommonModels();
	}

	private initializeCommonModels(): void {
		// User model template
		this.modelSchemas.set("user", {
			name: "User",
			fields: [
				{ name: "id", type: "String", required: true, unique: true },
				{ name: "email", type: "String", required: true, unique: true },
				{ name: "name", type: "String", required: true },
				{ name: "password", type: "String", required: true },
				{ name: "avatar", type: "String", required: false },
				{ name: "emailVerified", type: "DateTime", required: false },
				{ name: "role", type: "String", required: true, default: "user" },
				{
					name: "posts",
					type: "Relation",
					required: false,
					relation: { type: "hasMany", model: "Post" },
				},
			],
			timestamps: true,
			softDelete: true,
			traits: ["searchable", "auditable"],
		});

		// Post model template
		this.modelSchemas.set("post", {
			name: "Post",
			fields: [
				{ name: "id", type: "String", required: true, unique: true },
				{ name: "title", type: "String", required: true },
				{ name: "slug", type: "String", required: true, unique: true },
				{ name: "content", type: "String", required: true },
				{ name: "excerpt", type: "String", required: false },
				{ name: "published", type: "Boolean", required: true, default: false },
				{ name: "authorId", type: "String", required: true },
				{
					name: "author",
					type: "Relation",
					required: false,
					relation: {
						type: "belongsTo",
						model: "User",
						foreignKey: "authorId",
					},
				},
				{
					name: "tags",
					type: "Relation",
					required: false,
					relation: { type: "belongsToMany", model: "Tag" },
				},
			],
			timestamps: true,
			traits: ["searchable", "sluggable", "versionable"],
		});

		// Product model template
		this.modelSchemas.set("product", {
			name: "Product",
			fields: [
				{ name: "id", type: "String", required: true, unique: true },
				{ name: "name", type: "String", required: true },
				{ name: "sku", type: "String", required: true, unique: true },
				{ name: "description", type: "String", required: false },
				{
					name: "price",
					type: "Float",
					required: true,
					validation: { min: 0 },
				},
				{
					name: "stock",
					type: "Int",
					required: true,
					default: 0,
					validation: { min: 0 },
				},
				{ name: "categoryId", type: "String", required: false },
				{
					name: "category",
					type: "Relation",
					required: false,
					relation: { type: "belongsTo", model: "Category" },
				},
				{ name: "images", type: "Json", required: false },
			],
			timestamps: true,
			indexes: ["sku", "categoryId"],
			traits: ["searchable"],
		});
	}

	async generate(command: CLICommand): Promise<void> {
		const modelName = command.target;

		if (!modelName) {
			logger.error("Model name is required");
			this.showAvailableTemplates();
			return;
		}

		logger.info(`🏗️  Generating full-stack model: ${chalk.green(modelName)}`);

		// Parse model definition or use template
		const schema = await this.parseModelSchema(modelName, command.options);

		try {
			// Generate all artifacts
			const artifacts = await this.generateArtifacts(schema);

			// Write files to project
			await this.writeArtifacts(schema, artifacts);

			logger.success(`✅ Model "${schema.name}" generated successfully!`);
			this.showGeneratedFiles(schema);
			this.showNextSteps(schema);
		} catch (error) {
			logger.error("Failed to generate model:", error);
		}
	}

	async create(command: CLICommand): Promise<void> {
		const modelName = command.target;

		if (!modelName) {
			logger.error("Model name is required");
			return;
		}

		logger.info(`📝 Creating model from template: ${chalk.green(modelName)}`);

		const template = command.options?.template || "user";
		const schema = this.modelSchemas.get(template);

		if (!schema) {
			logger.error(`Template "${template}" not found`);
			this.showAvailableTemplates();
			return;
		}

		// Customize schema with provided name
		const customSchema: ModelSchema = {
			...schema,
			name: this.toPascalCase(modelName),
			tableName: this.toSnakeCase(modelName),
		};

		try {
			const artifacts = await this.generateArtifacts(customSchema);
			await this.writeArtifacts(customSchema, artifacts);

			logger.success(`✅ Model "${customSchema.name}" created from template!`);
			this.showGeneratedFiles(customSchema);
			this.showNextSteps(customSchema);
		} catch (error) {
			logger.error("Failed to create model:", error);
		}
	}

	async migrate(command: CLICommand): Promise<void> {
		logger.info("🔄 Running database migrations...");

		try {
			// Run Prisma migrations
			const { execSync } = await import("child_process");

			logger.info("Generating Prisma client...");
			execSync("npx prisma generate", { stdio: "inherit" });

			logger.info("Running migrations...");
			execSync("npx prisma migrate dev", { stdio: "inherit" });

			logger.success("✅ Migrations completed successfully!");
		} catch (error) {
			logger.error("Migration failed:", error);
		}
	}

	async scaffold(command: CLICommand): Promise<void> {
		const modelName = command.target;

		if (!modelName) {
			logger.error("Model name is required");
			return;
		}

		logger.info(
			`🚀 Scaffolding complete CRUD for model: ${chalk.green(modelName)}`,
		);

		// Parse fields from command options
		const fields = this.parseFieldsFromOptions(command.options);

		const schema: ModelSchema = {
			name: this.toPascalCase(modelName),
			tableName: this.toSnakeCase(modelName),
			fields: fields.length > 0 ? fields : this.getDefaultFields(),
			timestamps: true,
			traits: ["searchable"],
		};

		try {
			const artifacts = await this.generateArtifacts(schema);
			await this.writeArtifacts(schema, artifacts);

			// Also generate admin pages
			await this.generateAdminPages(schema);

			logger.success(
				`✅ Complete CRUD scaffolding for "${schema.name}" created!`,
			);
			this.showGeneratedFiles(schema);
			this.showNextSteps(schema);
		} catch (error) {
			logger.error("Failed to scaffold model:", error);
		}
	}

	private async parseModelSchema(
		modelName: string,
		options: any,
	): Promise<ModelSchema> {
		// Check if using a template
		if (options?.template) {
			const template = this.modelSchemas.get(options.template);
			if (template) {
				return {
					...template,
					name: this.toPascalCase(modelName),
					tableName: this.toSnakeCase(modelName),
				};
			}
		}

		// Parse fields from options or interactive prompt
		const fields = this.parseFieldsFromOptions(options);

		return {
			name: this.toPascalCase(modelName),
			tableName: this.toSnakeCase(modelName),
			fields: fields.length > 0 ? fields : this.getDefaultFields(),
			timestamps: options?.timestamps !== false,
			softDelete: options?.softDelete === true,
			traits: options?.traits || [],
		};
	}

	private parseFieldsFromOptions(options: any): ModelField[] {
		const fields: ModelField[] = [];

		// Always include id field
		fields.push({
			name: "id",
			type: "String",
			required: true,
			unique: true,
		});

		// Parse fields from comma-separated string
		// Format: name:type:required,name2:type2:optional
		if (options?.fields) {
			const fieldDefs = options.fields.split(",");
			for (const fieldDef of fieldDefs) {
				const [name, type, required] = fieldDef.split(":");
				fields.push({
					name,
					type: (type || "String") as ModelField["type"],
					required: required !== "optional",
				});
			}
		}

		return fields;
	}

	private getDefaultFields(): ModelField[] {
		return [
			{ name: "id", type: "String", required: true, unique: true },
			{ name: "name", type: "String", required: true },
			{ name: "description", type: "String", required: false },
		];
	}

	private async generateArtifacts(
		schema: ModelSchema,
	): Promise<GeneratedArtifacts> {
		return {
			prismaModel: this.generatePrismaModel(schema),
			migrationFile: this.generateMigration(schema),
			backendController: this.generateBackendController(schema),
			backendService: this.generateBackendService(schema),
			backendValidation: this.generateValidation(schema),
			frontendPage: this.generateFrontendPage(schema),
			frontendForm: this.generateFrontendForm(schema),
			frontendTable: this.generateFrontendTable(schema),
			apiTypes: this.generateApiTypes(schema),
		};
	}

	private generatePrismaModel(schema: ModelSchema): string {
		const fields = schema.fields
			.filter((f) => f.type !== "Relation")
			.map((field) => {
				let fieldDef = `  ${field.name} ${this.mapToPrismaType(field.type)}`;

				if (!field.required) fieldDef += "?";
				if (field.unique) fieldDef += " @unique";
				if (field.default !== undefined) {
					if (field.type === "String") {
						fieldDef += ` @default("${field.default}")`;
					} else if (
						field.type === "Boolean" ||
						field.type === "Int" ||
						field.type === "Float"
					) {
						fieldDef += ` @default(${field.default})`;
					} else if (field.default === "now") {
						fieldDef += " @default(now())";
					} else if (field.default === "uuid") {
						fieldDef += " @default(uuid())";
					}
				}

				return fieldDef;
			});

		// Add relations
		const relations = schema.fields
			.filter((f) => f.type === "Relation")
			.map((field) => {
				if (field.relation?.type === "hasMany") {
					return `  ${field.name} ${field.relation.model}[]`;
				} else if (field.relation?.type === "belongsTo") {
					return `  ${field.name} ${field.relation.model}? @relation(fields: [${field.relation.foreignKey}], references: [id])`;
				} else if (field.relation?.type === "belongsToMany") {
					return `  ${field.name} ${field.relation.model}[]`;
				}
				return "";
			});

		// Add timestamps
		if (schema.timestamps) {
			fields.push("  createdAt DateTime @default(now())");
			fields.push("  updatedAt DateTime @updatedAt");
		}

		// Add soft delete
		if (schema.softDelete) {
			fields.push("  deletedAt DateTime?");
		}

		// Add indexes
		const indexes = schema.indexes
			? `\n\n  @@index([${schema.indexes.join(", ")}])`
			: "";

		return `model ${schema.name} {
${fields.join("\n")}
${relations.filter((r) => r).join("\n")}

  @@map("${schema.tableName || this.toSnakeCase(schema.name)}")${indexes}
}`;
	}

	private generateMigration(schema: ModelSchema): string {
		const tableName = schema.tableName || this.toSnakeCase(schema.name);
		const columns = schema.fields
			.filter((f) => f.type !== "Relation")
			.map((field) => {
				const columnType = this.mapToSqlType(field.type);
				const nullable = field.required ? "NOT NULL" : "NULL";
				const unique = field.unique ? "UNIQUE" : "";
				return `  ${this.toSnakeCase(field.name)} ${columnType} ${nullable} ${unique}`.trim();
			});

		if (schema.timestamps) {
			columns.push("  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
			columns.push(
				"  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
			);
		}

		if (schema.softDelete) {
			columns.push("  deleted_at TIMESTAMP NULL");
		}

		return `-- Create ${tableName} table
CREATE TABLE IF NOT EXISTS ${tableName} (
${columns.join(",\n")}
);

${
	schema.indexes
		? schema.indexes
				.map(
					(idx) =>
						`CREATE INDEX idx_${tableName}_${this.toSnakeCase(idx)} ON ${tableName}(${this.toSnakeCase(idx)});`,
				)
				.join("\n")
		: ""
}`;
	}

	private generateBackendController(schema: ModelSchema): string {
		const modelName = schema.name;
		const modelNameLower = modelName.toLowerCase();
		const modelNamePlural = this.pluralize(modelNameLower);

		return `import { Request, Response } from 'express';
import { ${modelName}Service } from '../services/${modelNameLower}.service';
import { ${modelName}Validator } from '../validators/${modelNameLower}.validator';
import { handleError } from '../utils/error-handler';

export class ${modelName}Controller {
  private service: ${modelName}Service;

  constructor() {
    this.service = new ${modelName}Service();
  }

  async index(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = req.query;
      
      const result = await this.service.findAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sort: sort as string,
        order: order as 'asc' | 'desc'
      });

      res.json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ${modelNameLower} = await this.service.findById(id);

      if (!${modelNameLower}) {
        return res.status(404).json({
          success: false,
          message: '${modelName} not found'
        });
      }

      res.json({
        success: true,
        data: ${modelNameLower}
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validation = await ${modelName}Validator.create(req.body);
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      const ${modelNameLower} = await this.service.create(req.body);

      res.status(201).json({
        success: true,
        data: ${modelNameLower},
        message: '${modelName} created successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = await ${modelName}Validator.update(req.body);
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      const ${modelNameLower} = await this.service.update(id, req.body);

      res.json({
        success: true,
        data: ${modelNameLower},
        message: '${modelName} updated successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      res.json({
        success: true,
        message: '${modelName} deleted successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  }
}

export default new ${modelName}Controller();`;
	}

	private generateBackendService(schema: ModelSchema): string {
		const modelName = schema.name;
		const modelNameLower = modelName.toLowerCase();
		const hasSearch = schema.traits?.includes("searchable");

		return `import { PrismaClient, ${modelName} } from '@prisma/client';
import { PaginationParams, PaginatedResult } from '../types/pagination';

const prisma = new PrismaClient();

export class ${modelName}Service {
  async findAll(params: PaginationParams): Promise<PaginatedResult<${modelName}>> {
    const { page, limit, search, sort, order } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    ${
			hasSearch
				? `
    if (search) {
      where.OR = [
        ${schema.fields
					.filter(
						(f) =>
							f.type === "String" && f.name !== "id" && f.name !== "password",
					)
					.map(
						(f) => `{ ${f.name}: { contains: search, mode: 'insensitive' } }`,
					)
					.join(",\n        ")}
      ];
    }`
				: ""
		}
    ${
			schema.softDelete
				? `
    // Exclude soft deleted records
    where.deletedAt = null;`
				: ""
		}

    const [data, total] = await Promise.all([
      prisma.${modelNameLower}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order }
      }),
      prisma.${modelNameLower}.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string): Promise<${modelName} | null> {
    return prisma.${modelNameLower}.findUnique({
      where: { id }${schema.softDelete ? ",\n      deletedAt: null" : ""}
    });
  }

  async create(data: Omit<${modelName}, 'id' | 'createdAt' | 'updatedAt'${schema.softDelete ? " | 'deletedAt'" : ""}>): Promise<${modelName}> {
    return prisma.${modelNameLower}.create({
      data
    });
  }

  async update(id: string, data: Partial<Omit<${modelName}, 'id' | 'createdAt' | 'updatedAt'>>): Promise<${modelName}> {
    return prisma.${modelNameLower}.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    ${
			schema.softDelete
				? `await prisma.${modelNameLower}.update({
      where: { id },
      data: { deletedAt: new Date() }
    });`
				: `await prisma.${modelNameLower}.delete({
      where: { id }
    });`
		}
  }
}`;
	}

	private generateValidation(schema: ModelSchema): string {
		const modelName = schema.name;
		const validationRules = schema.fields
			.filter((f) => f.type !== "Relation" && f.name !== "id")
			.map((field) => {
				const rules: string[] = [];

				if (field.required) {
					rules.push(`.required('${field.name} is required')`);
				}

				if (field.type === "String") {
					rules.push(".string()");
					if (field.validation?.min) {
						rules.push(`.min(${field.validation.min})`);
					}
					if (field.validation?.max) {
						rules.push(`.max(${field.validation.max})`);
					}
					if (field.validation?.pattern) {
						rules.push(`.regex(/${field.validation.pattern}/)`);
					}
				} else if (field.type === "Int" || field.type === "Float") {
					rules.push(".number()");
					if (field.validation?.min !== undefined) {
						rules.push(`.min(${field.validation.min})`);
					}
					if (field.validation?.max !== undefined) {
						rules.push(`.max(${field.validation.max})`);
					}
				} else if (field.type === "Boolean") {
					rules.push(".boolean()");
				} else if (field.type === "DateTime") {
					rules.push(".date()");
				}

				if (field.unique) {
					rules.push(`.unique('${field.name} must be unique')`);
				}

				return `    ${field.name}: z${rules.join("")}${field.required ? "" : ".optional()"}`;
			});

		return `import { z } from 'zod';

const Create${modelName}Schema = z.object({
${validationRules.join(",\n")}
});

const Update${modelName}Schema = Create${modelName}Schema.partial();

export class ${modelName}Validator {
  static async create(data: any) {
    try {
      const validated = Create${modelName}Schema.parse(data);
      return { valid: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        };
      }
      throw error;
    }
  }

  static async update(data: any) {
    try {
      const validated = Update${modelName}Schema.parse(data);
      return { valid: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        };
      }
      throw error;
    }
  }
}`;
	}

	private generateFrontendPage(schema: ModelSchema): string {
		const modelName = schema.name;
		const modelNameLower = modelName.toLowerCase();
		const modelNamePlural = this.pluralize(modelName);

		return `'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Table,
  Badge,
  Input,
  Select,
  Modal
} from '@xala-technologies/ui-system';
import { ${modelName}Table } from './${modelNameLower}-table';
import { ${modelName}Form } from './${modelNameLower}-form';
import { use${modelName}s } from '@/hooks/use-${modelNameLower}s';
import { ${modelName} } from '@/types/${modelNameLower}';

export default function ${modelNamePlural}Page() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<${modelName} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    items, 
    loading, 
    error, 
    fetchItems, 
    createItem, 
    updateItem, 
    deleteItem 
  } = use${modelName}s();

  useEffect(() => {
    fetchItems({ search: searchTerm });
  }, [searchTerm]);

  const handleCreate = async (data: Partial<${modelName}>) => {
    await createItem(data);
    setIsCreateModalOpen(false);
    fetchItems();
  };

  const handleUpdate = async (id: string, data: Partial<${modelName}>) => {
    await updateItem(id, data);
    setSelectedItem(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
      fetchItems();
    }
  };

  return (
    <Container size="xl" padding="lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">${modelNamePlural}</h1>
        <Button 
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add ${modelName}
        </Button>
      </div>

      <Card variant="elevated" padding="lg">
        <div className="mb-4">
          <Input
            placeholder="Search ${modelNamePlural.toLowerCase()}..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <${modelName}Table
          items={items}
          loading={loading}
          onEdit={setSelectedItem}
          onDelete={handleDelete}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create ${modelName}"
      >
        <${modelName}Form
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Edit ${modelName}"
      >
        {selectedItem && (
          <${modelName}Form
            initialData={selectedItem}
            onSubmit={(data) => handleUpdate(selectedItem.id, data)}
            onCancel={() => setSelectedItem(null)}
          />
        )}
      </Modal>
    </Container>
  );
}`;
	}

	private generateFrontendForm(schema: ModelSchema): string {
		const modelName = schema.name;
		const formFields = schema.fields
			.filter(
				(f) =>
					f.type !== "Relation" &&
					f.name !== "id" &&
					!["createdAt", "updatedAt", "deletedAt"].includes(f.name),
			)
			.map((field) => {
				if (field.type === "Boolean") {
					return `
        <div className="form-group">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="${field.name}"
              checked={formData.${field.name} || false}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>${this.toTitleCase(field.name)}</span>
          </label>
        </div>`;
				} else if (field.validation?.enum) {
					return `
        <div className="form-group">
          <label>${this.toTitleCase(field.name)}</label>
          <Select
            name="${field.name}"
            value={formData.${field.name} || ''}
            onChange={handleChange}
            ${field.required ? "required" : ""}
          >
            <option value="">Select ${field.name}</option>
            ${field.validation.enum
							.map((val) => `<option value="${val}">${val}</option>`)
							.join("\n            ")}
          </Select>
        </div>`;
				} else {
					const inputType =
						field.type === "Int" || field.type === "Float"
							? "number"
							: field.type === "DateTime"
								? "datetime-local"
								: "text";
					return `
        <div className="form-group">
          <label>${this.toTitleCase(field.name)}</label>
          <Input
            type="${inputType}"
            name="${field.name}"
            value={formData.${field.name} || ''}
            onChange={handleChange}
            ${field.required ? "required" : ""}
            ${field.validation?.min !== undefined ? `min="${field.validation.min}"` : ""}
            ${field.validation?.max !== undefined ? `max="${field.validation.max}"` : ""}
          />
        </div>`;
				}
			});

		return `import React, { useState } from 'react';
import { Button, Input, Select } from '@xala-technologies/ui-system';
import { ${modelName} } from '@/types/${modelName.toLowerCase()}';

interface ${modelName}FormProps {
  initialData?: Partial<${modelName}>;
  onSubmit: (data: Partial<${modelName}>) => void;
  onCancel: () => void;
}

export function ${modelName}Form({ initialData, onSubmit, onCancel }: ${modelName}FormProps) {
  const [formData, setFormData] = useState<Partial<${modelName}>>(initialData || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      ${formFields.join("\n      ")}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}`;
	}

	private generateFrontendTable(schema: ModelSchema): string {
		const modelName = schema.name;
		const columns = schema.fields
			.filter(
				(f) =>
					f.type !== "Relation" && !["password", "deletedAt"].includes(f.name),
			)
			.slice(0, 5); // Show first 5 columns in table

		return `import React from 'react';
import { Table, Button, Badge } from '@xala-technologies/ui-system';
import { ${modelName} } from '@/types/${modelName.toLowerCase()}';

interface ${modelName}TableProps {
  items: ${modelName}[];
  loading: boolean;
  onEdit: (item: ${modelName}) => void;
  onDelete: (id: string) => void;
}

export function ${modelName}Table({ items, loading, onEdit, onDelete }: ${modelName}TableProps) {
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500">No items found</div>;
  }

  return (
    <Table>
      <thead>
        <tr>
          ${columns
						.map((col) => `<th>${this.toTitleCase(col.name)}</th>`)
						.join("\n          ")}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            ${columns
							.map((col) => {
								if (col.type === "Boolean") {
									return `<td>
              <Badge variant={item.${col.name} ? 'success' : 'default'}>
                {item.${col.name} ? 'Yes' : 'No'}
              </Badge>
            </td>`;
								} else if (col.type === "DateTime") {
									return `<td>{new Date(item.${col.name}).toLocaleDateString()}</td>`;
								} else {
									return `<td>{item.${col.name}}</td>`;
								}
							})
							.join("\n            ")}
            <td>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}`;
	}

	private generateApiTypes(schema: ModelSchema): string {
		const modelName = schema.name;
		const fields = schema.fields
			.filter((f) => f.type !== "Relation")
			.map((field) => {
				const tsType = this.mapToTypeScriptType(field.type);
				return `  ${field.name}${field.required ? "" : "?"}: ${tsType};`;
			});

		return `// ${modelName} type definitions

export interface ${modelName} {
${fields.join("\n")}
}

export interface Create${modelName}DTO extends Omit<${modelName}, 'id' | 'createdAt' | 'updatedAt'${schema.softDelete ? " | 'deletedAt'" : ""}> {}

export interface Update${modelName}DTO extends Partial<Create${modelName}DTO> {}

export interface ${modelName}Filter {
  search?: string;
  sortBy?: keyof ${modelName};
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Paginated${modelName}Response {
  data: ${modelName}[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}`;
	}

	private async writeArtifacts(
		schema: ModelSchema,
		artifacts: GeneratedArtifacts,
	): Promise<void> {
		const modelNameLower = schema.name.toLowerCase();

		// Write Prisma schema
		const prismaPath = "./prisma/schema.prisma";
		try {
			let prismaContent = await fs.readFile(prismaPath, "utf-8");
			prismaContent += "\n\n" + artifacts.prismaModel;
			await fs.writeFile(prismaPath, prismaContent);
			logger.info(`  ✓ Updated ${chalk.cyan(prismaPath)}`);
		} catch {
			logger.warn(
				"  ! Prisma schema file not found, creating models directory",
			);
			await fs.mkdir("./models", { recursive: true });
			await fs.writeFile(
				`./models/${modelNameLower}.prisma`,
				artifacts.prismaModel,
			);
		}

		// Write migration
		const migrationDir = "./prisma/migrations";
		await fs.mkdir(migrationDir, { recursive: true });
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		await fs.writeFile(
			path.join(migrationDir, `${timestamp}_create_${modelNameLower}.sql`),
			artifacts.migrationFile,
		);

		// Write backend files
		const backendDir = "./src/api";
		await fs.mkdir(path.join(backendDir, "controllers"), { recursive: true });
		await fs.mkdir(path.join(backendDir, "services"), { recursive: true });
		await fs.mkdir(path.join(backendDir, "validators"), { recursive: true });

		await fs.writeFile(
			path.join(backendDir, "controllers", `${modelNameLower}.controller.ts`),
			artifacts.backendController,
		);

		await fs.writeFile(
			path.join(backendDir, "services", `${modelNameLower}.service.ts`),
			artifacts.backendService,
		);

		await fs.writeFile(
			path.join(backendDir, "validators", `${modelNameLower}.validator.ts`),
			artifacts.backendValidation,
		);

		// Write frontend files
		const frontendDir = "./src";
		await fs.mkdir(
			path.join(frontendDir, "pages", this.pluralize(modelNameLower)),
			{ recursive: true },
		);
		await fs.mkdir(path.join(frontendDir, "types"), { recursive: true });

		await fs.writeFile(
			path.join(
				frontendDir,
				"pages",
				this.pluralize(modelNameLower),
				"page.tsx",
			),
			artifacts.frontendPage,
		);

		await fs.writeFile(
			path.join(
				frontendDir,
				"pages",
				this.pluralize(modelNameLower),
				`${modelNameLower}-form.tsx`,
			),
			artifacts.frontendForm,
		);

		await fs.writeFile(
			path.join(
				frontendDir,
				"pages",
				this.pluralize(modelNameLower),
				`${modelNameLower}-table.tsx`,
			),
			artifacts.frontendTable,
		);

		await fs.writeFile(
			path.join(frontendDir, "types", `${modelNameLower}.ts`),
			artifacts.apiTypes,
		);
	}

	private async generateAdminPages(schema: ModelSchema): Promise<void> {
		const modelName = schema.name;
		const modelNameLower = modelName.toLowerCase();
		const modelNamePlural = this.pluralize(modelName);

		// Generate admin dashboard page
		const adminDashboard = `import React from 'react';
import { Card, Container, Badge } from '@xala-technologies/ui-system';
import { use${modelName}Stats } from '@/hooks/use-${modelNameLower}-stats';

export default function ${modelName}AdminDashboard() {
  const { stats, loading } = use${modelName}Stats();

  return (
    <Container size="xl" padding="lg">
      <h1 className="text-3xl font-bold mb-6">${modelName} Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card padding="md">
          <h3 className="text-sm text-gray-600">Total ${modelNamePlural}</h3>
          <p className="text-2xl font-bold">{stats?.total || 0}</p>
        </Card>
        <Card padding="md">
          <h3 className="text-sm text-gray-600">Active</h3>
          <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
        </Card>
        <Card padding="md">
          <h3 className="text-sm text-gray-600">Inactive</h3>
          <p className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</p>
        </Card>
        <Card padding="md">
          <h3 className="text-sm text-gray-600">This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{stats?.thisMonth || 0}</p>
        </Card>
      </div>

      {/* Add charts, recent activity, etc. */}
    </Container>
  );
}`;

		const adminDir = "./src/pages/admin";
		await fs.mkdir(path.join(adminDir, modelNamePlural), { recursive: true });

		await fs.writeFile(
			path.join(adminDir, modelNamePlural, "dashboard.tsx"),
			adminDashboard,
		);
	}

	private showGeneratedFiles(schema: ModelSchema): void {
		const modelNameLower = schema.name.toLowerCase();
		const modelNamePlural = this.pluralize(modelNameLower);

		logger.info("\n📁 Generated files:");
		logger.info(chalk.gray("   Backend:"));
		logger.info(
			`     • ${chalk.cyan(`prisma/schema.prisma`)} (model definition)`,
		);
		logger.info(
			`     • ${chalk.cyan(`src/api/controllers/${modelNameLower}.controller.ts`)}`,
		);
		logger.info(
			`     • ${chalk.cyan(`src/api/services/${modelNameLower}.service.ts`)}`,
		);
		logger.info(
			`     • ${chalk.cyan(`src/api/validators/${modelNameLower}.validator.ts`)}`,
		);

		logger.info(chalk.gray("\n   Frontend:"));
		logger.info(
			`     • ${chalk.cyan(`src/pages/${modelNamePlural}/page.tsx`)}`,
		);
		logger.info(
			`     • ${chalk.cyan(`src/pages/${modelNamePlural}/${modelNameLower}-form.tsx`)}`,
		);
		logger.info(
			`     • ${chalk.cyan(`src/pages/${modelNamePlural}/${modelNameLower}-table.tsx`)}`,
		);
		logger.info(`     • ${chalk.cyan(`src/types/${modelNameLower}.ts`)}`);
	}

	private showNextSteps(schema: ModelSchema): void {
		logger.info(chalk.yellow("\n📋 Next steps:"));
		logger.info("   1. Run migrations:");
		logger.info(`      ${chalk.cyan("npx prisma migrate dev")}`);
		logger.info("   2. Generate Prisma client:");
		logger.info(`      ${chalk.cyan("npx prisma generate")}`);
		logger.info("   3. Add routes to your API:");
		logger.info(
			`      ${chalk.cyan(`import ${schema.name.toLowerCase()}Routes from './routes/${schema.name.toLowerCase()}';`)}`,
		);
		logger.info("   4. Add page to your app navigation");
	}

	private showAvailableTemplates(): void {
		logger.info("\n📋 Available model templates:");
		this.modelSchemas.forEach((schema, key) => {
			logger.info(
				`  • ${chalk.green(key)}: ${schema.fields.length} fields, ${schema.traits?.join(", ") || "no traits"}`,
			);
		});
		logger.info("\n💡 Usage examples:");
		logger.info("  xaheen model create user --template user");
		logger.info(
			'  xaheen model generate Product --fields "name:String,price:Float,stock:Int"',
		);
		logger.info("  xaheen model scaffold BlogPost --timestamps --soft-delete");
	}

	// Utility methods
	private toPascalCase(str: string): string {
		return str
			.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
			.replace(/^(.)/, (_, char) => char.toUpperCase());
	}

	private toSnakeCase(str: string): string {
		return str
			.replace(/([A-Z])/g, "_$1")
			.toLowerCase()
			.replace(/^_/, "")
			.replace(/\s+/g, "_");
	}

	private toTitleCase(str: string): string {
		return str
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase())
			.trim();
	}

	private pluralize(str: string): string {
		// Simple pluralization
		if (str.endsWith("y")) {
			return str.slice(0, -1) + "ies";
		} else if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch")) {
			return str + "es";
		} else {
			return str + "s";
		}
	}

	private mapToPrismaType(type: ModelField["type"]): string {
		const typeMap: Record<string, string> = {
			String: "String",
			Int: "Int",
			Float: "Float",
			Boolean: "Boolean",
			DateTime: "DateTime",
			Json: "Json",
		};
		return typeMap[type] || "String";
	}

	private mapToSqlType(type: ModelField["type"]): string {
		const typeMap: Record<string, string> = {
			String: "VARCHAR(255)",
			Int: "INTEGER",
			Float: "DECIMAL(10,2)",
			Boolean: "BOOLEAN",
			DateTime: "TIMESTAMP",
			Json: "JSON",
		};
		return typeMap[type] || "VARCHAR(255)";
	}

	private mapToTypeScriptType(type: ModelField["type"]): string {
		const typeMap: Record<string, string> = {
			String: "string",
			Int: "number",
			Float: "number",
			Boolean: "boolean",
			DateTime: "Date | string",
			Json: "any",
		};
		return typeMap[type] || "string";
	}
}
