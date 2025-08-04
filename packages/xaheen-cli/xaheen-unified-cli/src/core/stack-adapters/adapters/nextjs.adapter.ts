/**
 * Next.js Stack Adapter
 * 
 * Generates code for Next.js 14+ with App Router, Prisma, and TypeScript
 */

import { 
  BaseStackAdapter, 
  GeneratorContext, 
  GeneratedFile, 
  StackConfig, 
  StackPaths, 
  FileExtensions, 
  StackCommands, 
  StackDependencies,
  FieldType 
} from '../types.js';

export class NextJsAdapter extends BaseStackAdapter {
  readonly name = 'Next.js';
  readonly version = '14.0.0';
  readonly type = 'nextjs' as const;

  async generateModel(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const modelName = this.toPascalCase(context.name);
    const tableName = this.toSnakeCase(context.name) + 's';

    // Prisma schema
    files.push({
      path: `prisma/schema.prisma`,
      type: 'model',
      content: this.generatePrismaModel(modelName, tableName, context),
      description: 'Append to existing schema'
    });

    // TypeScript types
    files.push({
      path: `src/types/${this.toKebabCase(context.name)}.ts`,
      type: 'type',
      content: this.generateTypeDefinitions(modelName, context)
    });

    return files;
  }

  async generateController(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const modelName = this.toPascalCase(context.name);
    const routeName = this.pluralize(this.toKebabCase(context.name));

    // API Route handlers
    files.push({
      path: `src/app/api/${routeName}/route.ts`,
      type: 'controller',
      content: this.generateApiRoute(modelName, routeName, context)
    });

    files.push({
      path: `src/app/api/${routeName}/[id]/route.ts`,
      type: 'controller',
      content: this.generateApiRouteById(modelName, routeName, context)
    });

    // Validation schemas
    files.push({
      path: `src/lib/validations/${this.toKebabCase(context.name)}.ts`,
      type: 'validation',
      content: this.generateValidationSchema(modelName, context)
    });

    return files;
  }

  async generateService(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const modelName = this.toPascalCase(context.name);

    files.push({
      path: `src/services/${this.toKebabCase(context.name)}.service.ts`,
      type: 'service',
      content: this.generateServiceClass(modelName, context)
    });

    return files;
  }

  async generateComponent(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const componentName = this.toPascalCase(context.name);

    files.push({
      path: `src/components/${this.toKebabCase(context.name)}.tsx`,
      type: 'component',
      content: this.generateReactComponent(componentName, context)
    });

    return files;
  }

  async generatePage(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const pageName = this.toPascalCase(context.name);
    const routeName = this.pluralize(this.toKebabCase(context.name));

    files.push({
      path: `src/app/${routeName}/page.tsx`,
      type: 'page',
      content: this.generateNextPage(pageName, routeName, context)
    });

    files.push({
      path: `src/app/${routeName}/layout.tsx`,
      type: 'page',
      content: this.generatePageLayout(pageName, context)
    });

    return files;
  }

  async generateMigration(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    files.push({
      path: `prisma/migrations/${timestamp}_create_${this.toSnakeCase(context.name)}/migration.sql`,
      type: 'migration',
      content: this.generateSqlMigration(context)
    });

    return files;
  }

  async generateValidation(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const modelName = this.toPascalCase(context.name);

    files.push({
      path: `src/lib/validations/${this.toKebabCase(context.name)}.ts`,
      type: 'validation',
      content: this.generateZodSchema(modelName, context)
    });

    return files;
  }

  async generateTest(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const modelName = this.toPascalCase(context.name);

    files.push({
      path: `__tests__/${this.toKebabCase(context.name)}.test.ts`,
      type: 'test',
      content: this.generateJestTest(modelName, context)
    });

    return files;
  }

  async generateCrud(context: GeneratorContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Combine all generators
    files.push(...await this.generateModel(context));
    files.push(...await this.generateController(context));
    files.push(...await this.generateService(context));
    files.push(...await this.generatePage(context));
    
    // Add CRUD-specific components
    const componentName = this.toPascalCase(context.name);
    
    files.push({
      path: `src/components/${this.toKebabCase(context.name)}-form.tsx`,
      type: 'component',
      content: this.generateFormComponent(componentName, context)
    });

    files.push({
      path: `src/components/${this.toKebabCase(context.name)}-table.tsx`,
      type: 'component',
      content: this.generateTableComponent(componentName, context)
    });

    files.push({
      path: `src/hooks/use-${this.toKebabCase(context.name)}.ts`,
      type: 'component',
      content: this.generateReactHook(componentName, context)
    });

    return files;
  }

  getConfig(): StackConfig {
    return {
      language: 'typescript',
      framework: 'Next.js',
      orm: 'Prisma',
      ui: '@xala-technologies/ui-system',
      testFramework: 'Jest',
      packageManager: 'bun',
      buildTool: 'Next.js',
      features: [
        'ssr',
        'ssg',
        'api-routes',
        'app-router',
        'server-components',
        'typescript',
        'prisma',
        'tailwind'
      ]
    };
  }

  getPaths(): StackPaths {
    return {
      src: 'src',
      models: 'prisma',
      controllers: 'src/app/api',
      services: 'src/services',
      components: 'src/components',
      pages: 'src/app',
      api: 'src/app/api',
      tests: '__tests__',
      migrations: 'prisma/migrations',
      config: 'src/config',
      public: 'public',
      assets: 'public/assets'
    };
  }

  getFileExtensions(): FileExtensions {
    return {
      script: '.ts',
      style: '.css',
      config: '.json',
      markup: '.tsx',
      template: '.tsx'
    };
  }

  getCommands(): StackCommands {
    return {
      install: 'bun install',
      dev: 'bun dev',
      build: 'bun run build',
      start: 'bun start',
      test: 'bun test',
      lint: 'bun lint',
      format: 'bun format',
      migrate: 'bunx prisma migrate dev',
      seed: 'bunx prisma db seed'
    };
  }

  getDependencies(): StackDependencies {
    return {
      core: [
        'next',
        'react',
        'react-dom',
        '@prisma/client',
        '@xala-technologies/ui-system',
        'zod'
      ],
      dev: [
        'typescript',
        '@types/react',
        '@types/node',
        'prisma',
        'tailwindcss',
        'eslint',
        'prettier'
      ],
      optional: [
        'react-hook-form',
        '@hookform/resolvers',
        'lucide-react',
        'swr',
        '@tanstack/react-query'
      ]
    };
  }

  // Private helper methods for generating specific file contents
  private generatePrismaModel(modelName: string, tableName: string, context: GeneratorContext): string {
    const fields = context.fields || [];
    
    let model = `model ${modelName} {\n`;
    model += `  id        String   @id @default(cuid())\n`;
    model += `  createdAt DateTime @default(now())\n`;
    model += `  updatedAt DateTime @updatedAt\n\n`;
    
    fields.forEach(field => {
      const prismaType = this.mapToPrismaType(field.type);
      const optional = field.required ? '' : '?';
      const unique = field.unique ? ' @unique' : '';
      model += `  ${field.name} ${prismaType}${optional}${unique}\n`;
    });
    
    model += `\n  @@map("${tableName}")\n`;
    model += `}`;
    
    return model;
  }

  private mapToPrismaType(type: FieldType): string {
    const typeMap: Record<FieldType, string> = {
      'string': 'String',
      'text': 'String',
      'integer': 'Int',
      'float': 'Float',
      'decimal': 'Decimal',
      'boolean': 'Boolean',
      'date': 'DateTime',
      'datetime': 'DateTime',
      'time': 'DateTime',
      'json': 'Json',
      'uuid': 'String',
      'enum': 'String',
      'array': 'Json',
      'object': 'Json',
      'reference': 'String'
    };
    return typeMap[type] || 'String';
  }

  private generateTypeDefinitions(modelName: string, context: GeneratorContext): string {
    return `import { Prisma, ${modelName} as Prisma${modelName} } from '@prisma/client';

export type ${modelName} = Prisma${modelName};
export type ${modelName}CreateInput = Prisma.${modelName}CreateInput;
export type ${modelName}UpdateInput = Prisma.${modelName}UpdateInput;
export type ${modelName}WhereInput = Prisma.${modelName}WhereInput;

export interface ${modelName}Response {
  data: ${modelName} | ${modelName}[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}`;
  }

  private generateApiRoute(modelName: string, routeName: string, context: GeneratorContext): string {
    const modelCamel = this.toCamelCase(modelName);
    
    return `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ${modelName}Schema } from '@/lib/validations/${this.toKebabCase(context.name)}';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    
    const [items, total] = await Promise.all([
      prisma.${modelCamel}.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.${modelCamel}.count()
    ]);
    
    return NextResponse.json({
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ${modelName}Schema.parse(body);
    const item = await prisma.${modelCamel}.create({ data: validated });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`;
  }

  private generateApiRouteById(modelName: string, routeName: string, context: GeneratorContext): string {
    const modelCamel = this.toCamelCase(modelName);
    
    return `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ${modelName}UpdateSchema } from '@/lib/validations/${this.toKebabCase(context.name)}';
import { z } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.${modelCamel}.findUnique({ where: { id: params.id } });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = ${modelName}UpdateSchema.parse(body);
    const item = await prisma.${modelCamel}.update({
      where: { id: params.id },
      data: validated
    });
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.${modelCamel}.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}`;
  }

  private generateValidationSchema(modelName: string, context: GeneratorContext): string {
    return `import { z } from 'zod';

export const ${modelName}Schema = z.object({
  // Add your validation rules here
  name: z.string().min(1, 'Name is required'),
});

export const ${modelName}UpdateSchema = ${modelName}Schema.partial();

export type ${modelName}Input = z.infer<typeof ${modelName}Schema>;
export type ${modelName}UpdateInput = z.infer<typeof ${modelName}UpdateSchema>;`;
  }

  private generateServiceClass(modelName: string, context: GeneratorContext): string {
    const modelCamel = this.toCamelCase(modelName);
    
    return `import { prisma } from '@/lib/prisma';
import type { ${modelName} } from '@/types/${this.toKebabCase(context.name)}';

export class ${modelName}Service {
  async findAll(params?: { page?: number; limit?: number; search?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.${modelCamel}.findMany({ skip, take: limit }),
      prisma.${modelCamel}.count()
    ]);
    
    return { data, meta: { total, page, limit } };
  }
  
  async findById(id: string) {
    return prisma.${modelCamel}.findUnique({ where: { id } });
  }
  
  async create(data: any) {
    return prisma.${modelCamel}.create({ data });
  }
  
  async update(id: string, data: any) {
    return prisma.${modelCamel}.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return prisma.${modelCamel}.delete({ where: { id } });
  }
}`;
  }

  private generateReactComponent(componentName: string, context: GeneratorContext): string {
    return `'use client';

import React from 'react';
import { Card, Button, Text } from '@xala-technologies/ui-system';

interface ${componentName}Props {
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  return (
    <Card className={className} variant="elevated" padding="lg">
      <Text variant="h3">${componentName}</Text>
    </Card>
  );
};`;
  }

  private generateNextPage(pageName: string, routeName: string, context: GeneratorContext): string {
    return `import { Container, Card, Button, Text } from '@xala-technologies/ui-system';
import { ${pageName}Table } from '@/components/${this.toKebabCase(context.name)}-table';

export default function ${pageName}Page() {
  return (
    <Container size="xl" padding="lg">
      <Text variant="h1">${this.pluralize(pageName)}</Text>
      <${pageName}Table />
    </Container>
  );
}`;
  }

  private generatePageLayout(pageName: string, context: GeneratorContext): string {
    return `export default function ${pageName}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`;
  }

  private generateSqlMigration(context: GeneratorContext): string {
    const tableName = this.toSnakeCase(context.name) + 's';
    return `-- CreateTable
CREATE TABLE "${tableName}" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "${tableName}_pkey" PRIMARY KEY ("id")
);`;
  }

  private generateZodSchema(modelName: string, context: GeneratorContext): string {
    return this.generateValidationSchema(modelName, context);
  }

  private generateJestTest(modelName: string, context: GeneratorContext): string {
    return `describe('${modelName}', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});`;
  }

  private generateFormComponent(componentName: string, context: GeneratorContext): string {
    return `'use client';

import React from 'react';
import { Button, Input, Form } from '@xala-technologies/ui-system';

interface ${componentName}FormProps {
  onSubmit: (data: any) => void;
}

export const ${componentName}Form: React.FC<${componentName}FormProps> = ({ onSubmit }) => {
  return (
    <Form onSubmit={onSubmit}>
      <Input name="name" placeholder="Name" required />
      <Button type="submit">Submit</Button>
    </Form>
  );
};`;
  }

  private generateTableComponent(componentName: string, context: GeneratorContext): string {
    return `'use client';

import React from 'react';
import { Table, Badge } from '@xala-technologies/ui-system';

interface ${componentName}TableProps {
  items: any[];
}

export const ${componentName}Table: React.FC<${componentName}TableProps> = ({ items }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td><Badge>{item.status}</Badge></td>
            <td>Actions</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};`;
  }

  private generateReactHook(componentName: string, context: GeneratorContext): string {
    const routeName = this.pluralize(this.toKebabCase(context.name));
    
    return `import { useState, useEffect } from 'react';

export function use${componentName}() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/${routeName}');
      const data = await res.json();
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  return { items, loading, refetch: fetchItems };
}`;
  }
}