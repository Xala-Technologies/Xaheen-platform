# Specification API Reference

This document provides a comprehensive reference for programmatically working with Xala UI Component Specifications through JavaScript/TypeScript APIs, CLI commands, and REST endpoints.

## Table of Contents

- [JavaScript/TypeScript API](#javascripttypescript-api)
- [CLI API](#cli-api)
- [REST API](#rest-api)
- [Validation API](#validation-api)
- [Generation API](#generation-api)
- [Documentation API](#documentation-api)
- [Migration API](#migration-api)
- [Utilities API](#utilities-api)

## JavaScript/TypeScript API

### Installation

```bash
npm install @xala-technologies/ui-system-mcp
```

### Core Classes

#### SpecificationLoader

Load and parse component specifications:

```typescript
import { SpecificationLoader } from '@xala-technologies/ui-system-mcp';

const loader = new SpecificationLoader({
  schemaVersion: 'v5.2',
  validateOnLoad: true,
  cacheEnabled: true
});

// Load single specification
const spec = await loader.load('./specs/Button.json');

// Load multiple specifications
const specs = await loader.loadAll('./specs/**/*.json');

// Load with custom validation
const spec = await loader.load('./specs/Button.json', {
  validate: true,
  compliance: ['norwegian', 'wcag'],
  strict: true
});
```

**API Reference**:
```typescript
interface SpecificationLoader {
  load(path: string, options?: LoadOptions): Promise<ComponentSpecification>;
  loadAll(pattern: string, options?: LoadOptions): Promise<ComponentSpecification[]>;
  validate(spec: ComponentSpecification): ValidationResult;
  getSchema(): JsonSchema;
}

interface LoadOptions {
  validate?: boolean;
  compliance?: string[];
  strict?: boolean;
  cache?: boolean;
}
```

#### ComponentGenerator

Generate components from specifications:

```typescript
import { ComponentGenerator } from '@xala-technologies/ui-system-mcp';

const generator = new ComponentGenerator({
  platform: 'react',
  outputDir: './generated',
  templateDir: './templates'
});

// Generate single component
const result = await generator.generate(spec, {
  platform: 'react',
  includeTests: true,
  includeStories: true,
  includeDocs: true
});

// Generate for multiple platforms
const results = await generator.generateMultiPlatform(spec, ['react', 'vue']);

// Generate with AI optimization
const result = await generator.generateWithAI(spec, {
  model: 'gpt-4',
  optimize: true,
  hints: spec.ai?.optimization?.hints
});
```

**API Reference**:
```typescript
interface ComponentGenerator {
  generate(spec: ComponentSpecification, options?: GenerateOptions): Promise<GenerationResult>;
  generateMultiPlatform(spec: ComponentSpecification, platforms: string[]): Promise<GenerationResult[]>;
  generateWithAI(spec: ComponentSpecification, aiOptions: AIOptions): Promise<GenerationResult>;
  getTemplates(platform: string): Promise<Template[]>;
}

interface GenerateOptions {
  platform: string;
  includeTests?: boolean;
  includeStories?: boolean;
  includeDocs?: boolean;
  outputDir?: string;
}

interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors: Error[];
  warnings: Warning[];
  metadata: GenerationMetadata;
}
```

#### DocumentationGenerator

Generate documentation from specifications:

```typescript
import { DocumentationGenerator } from '@xala-technologies/ui-system-mcp';

const docGenerator = new DocumentationGenerator({
  outputDir: './docs',
  format: 'markdown',
  includeExamples: true
});

// Generate component documentation
const docs = await docGenerator.generateComponentDocs(spec);

// Generate API reference
const apiDocs = await docGenerator.generateAPIReference(spec);

// Generate usage examples
const examples = await docGenerator.generateExamples(spec);

// Generate complete documentation site
const site = await docGenerator.generateSite(specs, {
  theme: 'xala',
  interactive: true,
  search: true
});
```

**API Reference**:
```typescript
interface DocumentationGenerator {
  generateComponentDocs(spec: ComponentSpecification): Promise<Documentation>;
  generateAPIReference(spec: ComponentSpecification): Promise<Documentation>;
  generateExamples(spec: ComponentSpecification): Promise<Documentation>;
  generateSite(specs: ComponentSpecification[], options?: SiteOptions): Promise<DocumentationSite>;
}

interface Documentation {
  content: string;
  format: 'markdown' | 'html' | 'json';
  metadata: DocumentationMetadata;
}
```

#### SpecificationValidator

Validate specifications against schema and compliance requirements:

```typescript
import { SpecificationValidator } from '@xala-technologies/ui-system-mcp';

const validator = new SpecificationValidator({
  schemaVersion: 'v5.2',
  strictMode: true,
  complianceChecks: ['norwegian', 'wcag', 'performance']
});

// Validate single specification
const result = await validator.validate(spec);

// Validate multiple specifications
const results = await validator.validateAll(specs);

// Validate with custom rules
const result = await validator.validate(spec, {
  customRules: './validation-rules.json',
  skipRules: ['performance'],
  onlyRules: ['schema', 'compliance']
});

// Fix auto-fixable issues
const fixed = await validator.fix(spec);
```

**API Reference**:
```typescript
interface SpecificationValidator {
  validate(spec: ComponentSpecification, options?: ValidationOptions): Promise<ValidationResult>;
  validateAll(specs: ComponentSpecification[]): Promise<ValidationResult[]>;
  fix(spec: ComponentSpecification): Promise<ComponentSpecification>;
  getSchema(): JsonSchema;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
  compliance: ComplianceResult;
}
```

### Type Definitions

```typescript
// Core specification interface
interface ComponentSpecification {
  metadata: ComponentMetadata;
  compliance: ComplianceSection;
  props: PropsSection;
  accessibility: AccessibilitySection;
  platforms: PlatformsSection;
  variants?: VariantsSection;
  examples?: ExampleSection[];
  ai?: AISection;
  testing?: TestingSection;
  performance?: PerformanceSection;
}

interface ComponentMetadata {
  name: string;
  version: string;
  semanticVersion: string;
  category: ComponentCategory;
  subcategory?: string;
  description: string;
  keywords?: string[];
  maintainer?: Maintainer;
  stability: 'experimental' | 'beta' | 'stable' | 'deprecated';
  createdAt?: string;
  updatedAt?: string;
}

interface ComplianceSection {
  i18n: I18nCompliance;
  semantic: SemanticCompliance;
  wcag: WCAGCompliance;
  ssr: SSRCompliance;
  norwegian: NorwegianCompliance;
}

interface PropsSection {
  schema: Record<string, PropDefinition>;
  groups: PropGroups;
  composition?: CompositionProps;
}
```

### Utility Functions

```typescript
import { 
  parseSpecification,
  validateSpecification,
  generateComponent,
  migrateSpecification,
  getSpecificationMetadata
} from '@xala-technologies/ui-system-mcp/utils';

// Parse specification from string
const spec = parseSpecification(jsonString);

// Quick validation
const isValid = validateSpecification(spec);

// Quick generation
const component = await generateComponent(spec, 'react');

// Migration utilities
const migrated = await migrateSpecification(spec, 'v5.2');

// Extract metadata
const metadata = getSpecificationMetadata(spec);
```

## CLI API

### Core Commands

#### Generate Components

```bash
# Generate single component
npx xala-ui generate --spec ./specs/Button.json --platform react

# Generate with options
npx xala-ui generate \
  --spec ./specs/Button.json \
  --platform react \
  --output ./src/components \
  --include-tests \
  --include-stories \
  --include-docs

# Batch generation
npx xala-ui generate --all --platform react,vue --output ./generated

# AI-powered generation
npx xala-ui generate --spec ./specs/Button.json --ai --model gpt-4
```

#### Validate Specifications

```bash
# Basic validation
npx xala-ui validate --spec ./specs/Button.json

# Comprehensive validation
npx xala-ui validate \
  --spec ./specs/Button.json \
  --strict \
  --compliance norwegian \
  --performance \
  --report validation-report.json

# Batch validation
npx xala-ui validate --all --json --output validation-results.json
```

#### Generate Documentation

```bash
# Component documentation
npx xala-ui docs generate --spec ./specs/Button.json --output ./docs

# API reference
npx xala-ui docs api --spec ./specs/Button.json --format markdown

# Interactive documentation site
npx xala-ui docs site --all --output ./docs --interactive
```

#### Migration Commands

```bash
# Migrate specifications
npx xala-ui migrate --spec ./specs/Button.json --to v5.2

# Batch migration
npx xala-ui migrate --all --to v5.2 --backup ./backup

# Check migration compatibility
npx xala-ui migrate --check --spec ./specs/Button.json --to v5.2
```

### CLI Configuration

Create `.xalarc.json` for project configuration:

```json
{
  "$schema": "https://xala-technologies.com/schemas/config/v1.0.0",
  "schemaVersion": "v5.2",
  "defaults": {
    "platform": "react",
    "outputDir": "./generated",
    "includeTests": true,
    "includeStories": true,
    "includeDocs": true
  },
  "validation": {
    "strict": true,
    "compliance": ["norwegian", "wcag"],
    "performance": true
  },
  "generation": {
    "templates": "./templates",
    "ai": {
      "enabled": true,
      "model": "gpt-4",
      "provider": "openai"
    }
  },
  "documentation": {
    "format": "markdown",
    "interactive": true,
    "theme": "xala"
  }
}
```

## REST API

### Base URL

```
https://api.xala-ui.dev/v1/specifications
```

### Authentication

```bash
# Set API key
export XALA_API_KEY="your-api-key"

# Use in requests
curl -H "Authorization: Bearer $XALA_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.xala-ui.dev/v1/specifications
```

### Endpoints

#### Specification Management

```http
# Get all specifications
GET /specifications
Query Parameters:
  - category: string (filter by category)
  - platform: string (filter by platform)
  - version: string (filter by version)
  - limit: number (pagination limit)
  - offset: number (pagination offset)

# Get single specification
GET /specifications/{id}
Path Parameters:
  - id: string (specification ID)

# Create specification
POST /specifications
Body: ComponentSpecification

# Update specification
PUT /specifications/{id}
Body: ComponentSpecification

# Delete specification
DELETE /specifications/{id}
```

#### Validation

```http
# Validate specification
POST /specifications/validate
Body: {
  "specification": ComponentSpecification,
  "options": ValidationOptions
}

Response: ValidationResult
```

#### Generation

```http
# Generate component
POST /specifications/{id}/generate
Body: {
  "platform": string,
  "options": GenerateOptions
}

Response: GenerationResult
```

#### Documentation

```http
# Generate documentation
POST /specifications/{id}/documentation
Body: {
  "format": "markdown" | "html" | "json",
  "options": DocumentationOptions
}

Response: Documentation
```

### API Client

```typescript
import { XalaAPIClient } from '@xala-technologies/ui-system-mcp/client';

const client = new XalaAPIClient({
  apiKey: process.env.XALA_API_KEY,
  baseUrl: 'https://api.xala-ui.dev/v1'
});

// Get specifications
const specs = await client.getSpecifications({
  category: 'basic',
  limit: 10
});

// Validate specification
const validation = await client.validateSpecification(spec);

// Generate component
const result = await client.generateComponent(spec.id, {
  platform: 'react',
  includeTests: true
});
```

## Validation API

### Schema Validation

```typescript
import { validateSchema } from '@xala-technologies/ui-system-mcp/validation';

const result = validateSchema(spec, {
  schemaVersion: 'v5.2',
  strict: true
});

console.log(result.valid); // boolean
console.log(result.errors); // ValidationError[]
console.log(result.warnings); // ValidationWarning[]
```

### Norwegian Compliance Validation

```typescript
import { validateNorwegianCompliance } from '@xala-technologies/ui-system-mcp/validation';

const result = validateNorwegianCompliance(spec, {
  nsmLevel: 'RESTRICTED',
  gdprRequired: true,
  wcagLevel: 'AAA'
});
```

### Custom Validation Rules

```typescript
import { addValidationRule } from '@xala-technologies/ui-system-mcp/validation';

// Add custom rule
addValidationRule('custom-naming', {
  validate: (spec) => {
    return spec.metadata.name.endsWith('Component');
  },
  message: 'Component names must end with "Component"',
  severity: 'error'
});

// Use custom rules
const result = validateSchema(spec, {
  customRules: ['custom-naming']
});
```

## Generation API

### Template System

```typescript
import { TemplateEngine } from '@xala-technologies/ui-system-mcp/generation';

const engine = new TemplateEngine({
  templateDir: './templates',
  partials: './templates/partials'
});

// Register custom helpers
engine.registerHelper('capitalize', (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Generate from template
const code = await engine.render('react/component.tsx.hbs', {
  spec,
  platform: 'react'
});
```

### Multi-Platform Generation

```typescript
import { MultiPlatformGenerator } from '@xala-technologies/ui-system-mcp/generation';

const generator = new MultiPlatformGenerator();

const results = await generator.generate(spec, {
  platforms: ['react', 'vue', 'angular'],
  outputStrategy: 'separate', // or 'unified'
  sync: true // keep implementations in sync
});
```

### AI-Powered Generation

```typescript
import { AIGenerator } from '@xala-technologies/ui-system-mcp/generation';

const aiGenerator = new AIGenerator({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY
});

const result = await aiGenerator.generate(spec, {
  platform: 'react',
  optimizationHints: spec.ai?.optimization?.hints,
  complexity: spec.ai?.generation?.complexity
});
```

## Documentation API

### Markdown Generation

```typescript
import { MarkdownGenerator } from '@xala-technologies/ui-system-mcp/documentation';

const generator = new MarkdownGenerator({
  templates: './docs/templates',
  includeTableOfContents: true,
  includeBreadcrumbs: true
});

const docs = await generator.generate(spec, {
  sections: ['overview', 'props', 'examples', 'accessibility'],
  format: 'github-flavored-markdown'
});
```

### Interactive Documentation

```typescript
import { InteractiveDocsGenerator } from '@xala-technologies/ui-system-mcp/documentation';

const generator = new InteractiveDocsGenerator({
  framework: 'react',
  bundler: 'webpack',
  theme: 'xala'
});

const site = await generator.generateSite(specs, {
  navigation: true,
  search: true,
  playground: true,
  codeSandbox: true
});
```

## Migration API

### Specification Migration

```typescript
import { SpecificationMigrator } from '@xala-technologies/ui-system-mcp/migration';

const migrator = new SpecificationMigrator();

// Migrate to latest version
const migrated = await migrator.migrate(spec, {
  targetVersion: 'v5.2',
  backup: true,
  validate: true
});

// Check migration compatibility
const compatible = await migrator.checkCompatibility(spec, 'v5.2');

// Get migration path
const path = await migrator.getMigrationPath(spec.metadata.semanticVersion, 'v5.2');
```

### Batch Migration

```typescript
import { BatchMigrator } from '@xala-technologies/ui-system-mcp/migration';

const batchMigrator = new BatchMigrator({
  concurrency: 5,
  backup: true,
  validateAfter: true
});

const results = await batchMigrator.migrateAll(specs, {
  targetVersion: 'v5.2',
  onProgress: (progress) => console.log(`${progress.completed}/${progress.total}`),
  onError: (error, spec) => console.error(`Failed to migrate ${spec.metadata.name}:`, error)
});
```

## Utilities API

### Specification Utils

```typescript
import {
  isValidSpecification,
  getSpecificationVersion,
  compareVersions,
  mergeSpecifications,
  extractMetadata
} from '@xala-technologies/ui-system-mcp/utils';

// Validation
const valid = isValidSpecification(spec);

// Version management
const version = getSpecificationVersion(spec);
const isNewer = compareVersions('v5.2', 'v5.1'); // true

// Merging
const merged = mergeSpecifications(baseSpec, overrideSpec);

// Metadata extraction
const metadata = extractMetadata(spec);
```

### File System Utils

```typescript
import {
  loadSpecificationFile,
  saveSpecificationFile,
  findSpecificationFiles,
  createBackup
} from '@xala-technologies/ui-system-mcp/utils/fs';

// File operations
const spec = await loadSpecificationFile('./specs/Button.json');
await saveSpecificationFile(spec, './specs/Button.json');

// Discovery
const files = await findSpecificationFiles('./specs/**/*.json');

// Backup
await createBackup('./specs', './backup/2024-01-15');
```

### Performance Utils

```typescript
import {
  measurePerformance,
  analyzeBundleSize,
  estimateRenderTime
} from '@xala-technologies/ui-system-mcp/utils/performance';

// Performance measurement
const metrics = await measurePerformance(async () => {
  return generateComponent(spec, 'react');
});

// Bundle analysis
const bundleInfo = await analyzeBundleSize('./generated/Button.js');

// Render time estimation
const renderTime = estimateRenderTime(spec);
```

## Error Handling

### Error Types

```typescript
// Base error classes
class SpecificationError extends Error {
  constructor(message: string, public spec?: ComponentSpecification) {
    super(message);
  }
}

class ValidationError extends SpecificationError {
  constructor(
    message: string,
    public path: string,
    public value: any,
    spec?: ComponentSpecification
  ) {
    super(message, spec);
  }
}

class GenerationError extends SpecificationError {
  constructor(
    message: string,
    public platform: string,
    spec?: ComponentSpecification
  ) {
    super(message, spec);
  }
}
```

### Error Handling Patterns

```typescript
import { 
  SpecificationError,
  ValidationError,
  GenerationError 
} from '@xala-technologies/ui-system-mcp/errors';

try {
  const result = await generator.generate(spec, options);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed at ${error.path}: ${error.message}`);
  } else if (error instanceof GenerationError) {
    console.error(`Generation failed for ${error.platform}: ${error.message}`);
  } else if (error instanceof SpecificationError) {
    console.error(`Specification error: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Examples

### Complete Workflow Example

```typescript
import {
  SpecificationLoader,
  ComponentGenerator,
  DocumentationGenerator,
  SpecificationValidator
} from '@xala-technologies/ui-system-mcp';

async function completeWorkflow() {
  // 1. Load specification
  const loader = new SpecificationLoader();
  const spec = await loader.load('./specs/Button.json');

  // 2. Validate specification
  const validator = new SpecificationValidator();
  const validation = await validator.validate(spec);
  
  if (!validation.valid) {
    console.error('Validation failed:', validation.errors);
    return;
  }

  // 3. Generate component
  const generator = new ComponentGenerator();
  const component = await generator.generate(spec, {
    platform: 'react',
    includeTests: true,
    includeStories: true
  });

  // 4. Generate documentation
  const docGenerator = new DocumentationGenerator();
  const docs = await docGenerator.generateComponentDocs(spec);

  console.log('Workflow completed successfully!');
  console.log('Generated files:', component.files.map(f => f.path));
  console.log('Documentation:', docs.content.substring(0, 100) + '...');
}

completeWorkflow().catch(console.error);
```

## Related Resources

- [Component Specification Schema](../schema-reference.md)
- [Getting Started Guide](../getting-started.md)
- [Validation Guide](../guides/validation.md)
- [AI Usage Guide](../guides/ai-usage.md)

---

*This API reference provides comprehensive programmatic access to the Xala UI Component Specification System. Last updated: January 2024*