/**
 * Mock Template Engine for Unit Testing
 * Provides mock implementations of template engines for isolated testing
 */

import { vi } from "vitest";

export interface MockTemplateEngine {
	readonly compile: ReturnType<typeof vi.fn>;
	readonly render: ReturnType<typeof vi.fn>;
	readonly registerHelper: ReturnType<typeof vi.fn>;
	readonly registerPartial: ReturnType<typeof vi.fn>;
}

export interface MockTemplateResult {
	readonly content: string;
	readonly files: Array<{
		readonly path: string;
		readonly content: string;
	}>;
}

/**
 * Create a mock template engine for testing
 */
export function createMockTemplateEngine(): MockTemplateEngine {
	const compile = vi.fn().mockImplementation((template: string) => {
		return vi.fn().mockImplementation((context: Record<string, unknown>) => {
			// Simple template compilation mock
			let result = template;
			
			// Replace basic Handlebars-style variables
			Object.entries(context).forEach(([key, value]) => {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
				result = result.replace(regex, String(value));
			});
			
			return result;
		});
	});

	const render = vi.fn().mockImplementation((template: string, context: Record<string, unknown>) => {
		const compiledTemplate = compile(template);
		return compiledTemplate(context);
	});

	const registerHelper = vi.fn();
	const registerPartial = vi.fn();

	return {
		compile,
		render,
		registerHelper,
		registerPartial,
	};
}

/**
 * Mock template results for different backend components
 */
export const mockTemplateResults = {
	model: {
		nestjs: {
			content: `
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('{{tableName}}')
export class {{className}} {
  @PrimaryGeneratedColumn()
  id: number;

  {{#each fields}}
  @Column({{#if options}}{{{options}}}{{else}}'{{type}}'{{/if}})
  {{name}}: {{tsType}};

  {{/each}}
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`,
			files: [
				{
					path: "src/entities/{{kebabCase name}}.entity.ts",
					content: "// Generated NestJS entity",
				},
			],
		},
		express: {
			content: `
const mongoose = require('mongoose');

const {{camelCase name}}Schema = new mongoose.Schema({
  {{#each fields}}
  {{name}}: {
    type: {{mongoType}},
    {{#if required}}required: true,{{/if}}
    {{#if unique}}unique: true,{{/if}}
  },
  {{/each}}
}, {
  timestamps: true
});

module.exports = mongoose.model('{{name}}', {{camelCase name}}Schema);`,
			files: [
				{
					path: "src/models/{{kebabCase name}}.js",
					content: "// Generated Express model",
				},
			],
		},
	},
	endpoint: {
		nestjs: {
			content: `
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { {{className}}Service } from './{{kebabCase name}}.service';
import { Create{{className}}Dto, Update{{className}}Dto } from './dto';

@Controller('{{route}}')
export class {{className}}Controller {
  constructor(private readonly {{camelCase name}}Service: {{className}}Service) {}

  @Get()
  findAll(@Query() query: any) {
    return this.{{camelCase name}}Service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.{{camelCase name}}Service.findOne(+id);
  }

  @Post()
  create(@Body() create{{className}}Dto: Create{{className}}Dto) {
    return this.{{camelCase name}}Service.create(create{{className}}Dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() update{{className}}Dto: Update{{className}}Dto) {
    return this.{{camelCase name}}Service.update(+id, update{{className}}Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.{{camelCase name}}Service.remove(+id);
  }
}`,
			files: [
				{
					path: "src/{{kebabCase name}}/{{kebabCase name}}.controller.ts",
					content: "// Generated NestJS controller",
				},
			],
		},
		express: {
			content: `
const express = require('express');
const {{className}} = require('../models/{{kebabCase name}}');
const router = express.Router();

// GET /{{route}}
router.get('/', async (req, res) => {
  try {
    const items = await {{className}}.find(req.query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /{{route}}/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await {{className}}.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /{{route}}
router.post('/', async (req, res) => {
  try {
    const item = new {{className}}(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /{{route}}/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await {{className}}.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /{{route}}/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await {{className}}.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`,
			files: [
				{
					path: "src/routes/{{kebabCase name}}.js",
					content: "// Generated Express router",
				},
			],
		},
	},
	service: {
		nestjs: {
			content: `
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {{className}} } from './entities/{{kebabCase name}}.entity';
import { Create{{className}}Dto, Update{{className}}Dto } from './dto';

@Injectable()
export class {{className}}Service {
  constructor(
    @InjectRepository({{className}})
    private {{camelCase name}}Repository: Repository<{{className}}>,
  ) {}

  async create(create{{className}}Dto: Create{{className}}Dto): Promise<{{className}}> {
    const {{camelCase name}} = this.{{camelCase name}}Repository.create(create{{className}}Dto);
    return this.{{camelCase name}}Repository.save({{camelCase name}});
  }

  async findAll(query: any): Promise<{{className}}[]> {
    return this.{{camelCase name}}Repository.find(query);
  }

  async findOne(id: number): Promise<{{className}}> {
    const {{camelCase name}} = await this.{{camelCase name}}Repository.findOne({ where: { id } });
    if (!{{camelCase name}}) {
      throw new NotFoundException(\`{{className}} with ID \${id} not found\`);
    }
    return {{camelCase name}};
  }

  async update(id: number, update{{className}}Dto: Update{{className}}Dto): Promise<{{className}}> {
    await this.{{camelCase name}}Repository.update(id, update{{className}}Dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.{{camelCase name}}Repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(\`{{className}} with ID \${id} not found\`);
    }
  }
}`,
			files: [
				{
					path: "src/{{kebabCase name}}/{{kebabCase name}}.service.ts",
					content: "// Generated NestJS service",
				},
			],
		},
		express: {
			content: `
const {{className}} = require('../models/{{kebabCase name}}');

class {{className}}Service {
  async create(data) {
    const item = new {{className}}(data);
    return await item.save();
  }

  async findAll(query = {}) {
    return await {{className}}.find(query);
  }

  async findById(id) {
    const item = await {{className}}.findById(id);
    if (!item) {
      throw new Error('{{className}} not found');
    }
    return item;
  }

  async update(id, data) {
    const item = await {{className}}.findByIdAndUpdate(id, data, { new: true });
    if (!item) {
      throw new Error('{{className}} not found');
    }
    return item;
  }

  async delete(id) {
    const item = await {{className}}.findByIdAndDelete(id);
    if (!item) {
      throw new Error('{{className}} not found');
    }
    return item;
  }
}

module.exports = new {{className}}Service();`,
			files: [
				{
					path: "src/services/{{kebabCase name}}.service.js",
					content: "// Generated Express service",
				},
			],
		},
	},
};

/**
 * Create a mock template loader
 */
export function createMockTemplateLoader() {
	return {
		loadTemplate: vi.fn().mockImplementation((templatePath: string) => {
			// Return a mock template based on the path
			if (templatePath.includes("model")) {
				return "Mock model template: {{name}}";
			}
			if (templatePath.includes("endpoint") || templatePath.includes("controller")) {
				return "Mock endpoint template: {{name}}";
			}
			if (templatePath.includes("service")) {
				return "Mock service template: {{name}}";
			}
			return "Mock template: {{name}}";
		}),
		
		loadPartial: vi.fn().mockImplementation((partialName: string) => {
			return `Mock partial: ${partialName}`;
		}),
		
		getTemplatePath: vi.fn().mockImplementation((framework: string, type: string) => {
			return `templates/${framework}/${type}.hbs`;
		}),
	};
}

/**
 * Create mock file system operations
 */
export function createMockFileSystem() {
	const files = new Map<string, string>();
	
	return {
		writeFile: vi.fn().mockImplementation(async (path: string, content: string) => {
			files.set(path, content);
		}),
		
		readFile: vi.fn().mockImplementation(async (path: string) => {
			const content = files.get(path);
			if (content === undefined) {
				throw new Error(`File not found: ${path}`);
			}
			return content;
		}),
		
		exists: vi.fn().mockImplementation(async (path: string) => {
			return files.has(path);
		}),
		
		mkdir: vi.fn().mockImplementation(async (path: string) => {
			// Mock directory creation
		}),
		
		getFiles: () => Array.from(files.keys()),
		getFileContent: (path: string) => files.get(path),
		clear: () => files.clear(),
	};
}

/**
 * Create mock command executor
 */
export function createMockCommandExecutor() {
	const executedCommands: Array<{ command: string; args: string[]; cwd?: string }> = [];
	
	return {
		execute: vi.fn().mockImplementation(async (command: string, args: string[], options?: { cwd?: string }) => {
			executedCommands.push({ command, args, cwd: options?.cwd });
			
			// Mock successful execution
			return {
				stdout: `Mock output for: ${command} ${args.join(" ")}`,
				stderr: "",
				exitCode: 0,
			};
		}),
		
		getExecutedCommands: () => [...executedCommands],
		clearHistory: () => executedCommands.length = 0,
	};
}

/**
 * Mock generator context for testing
 */
export function createMockGeneratorContext(overrides: Record<string, unknown> = {}) {
	return {
		projectPath: "/tmp/test-project",
		framework: "nestjs",
		name: "User",
		fields: [
			{ name: "name", type: "string", tsType: "string" },
			{ name: "email", type: "string", tsType: "string" },
		],
		...overrides,
	};
}

/**
 * Validate mock template compilation
 */
export function validateMockTemplate(
	engine: MockTemplateEngine,
	template: string,
	context: Record<string, unknown>,
	expectedOutput: string,
) {
	const compiledTemplate = engine.compile(template);
	const result = compiledTemplate(context);
	
	expect(result).toContain(expectedOutput);
	expect(engine.compile).toHaveBeenCalledWith(template);
}

/**
 * Create integration between mock components
 */
export function createMockIntegration() {
	const templateEngine = createMockTemplateEngine();
	const templateLoader = createMockTemplateLoader();
	const fileSystem = createMockFileSystem();
	const commandExecutor = createMockCommandExecutor();
	
	return {
		templateEngine,
		templateLoader,
		fileSystem,
		commandExecutor,
		
		// Helper to simulate complete generation flow
		simulateGeneration: async (type: "model" | "endpoint" | "service", context: Record<string, unknown>) => {
			const templatePath = templateLoader.getTemplatePath(context.framework as string, type);
			const template = templateLoader.loadTemplate(templatePath);
			const content = templateEngine.render(template, context);
			
			const outputPath = `src/${type}s/${context.name}.ts`;
			await fileSystem.writeFile(outputPath, content);
			
			return {
				templatePath,
				outputPath,
				content,
			};
		},
	};
}