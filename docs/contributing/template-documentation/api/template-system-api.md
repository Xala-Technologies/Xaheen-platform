# Template System API Reference

Complete API reference for the Xaheen CLI Template System, including TypeScript definitions, method signatures, and usage examples.

## 📚 Core API Overview

The Template System API provides programmatic access to template generation, validation, and management functionality.

### Main API Modules

- **`TemplateEngine`** - Core template processing and generation
- **`TemplateRegistry`** - Template discovery and management
- **`ValidationEngine`** - Template and output validation
- **`ContextProcessor`** - Context enrichment and processing
- **`CodeGenerator`** - Platform-specific code generation
- **`QualityAssurance`** - Quality checking and metrics

## 🏗️ TemplateEngine API

### Interface Definition

```typescript
interface TemplateEngine {
  // Template Loading
  loadTemplate(templatePath: string): Promise<Template>;
  loadTemplateFromRegistry(templateName: string): Promise<Template>;
  
  // Template Generation
  generateComponent(config: GenerationConfig): Promise<GenerationResult>;
  generateMultiPlatform(config: MultiPlatformConfig): Promise<MultiPlatformResult>;
  
  // Template Processing
  processTemplate(template: Template, context: GenerationContext): Promise<ProcessedTemplate>;
  
  // Validation
  validateTemplate(template: Template): Promise<ValidationResult>;
  validateOutput(output: GenerationResult): Promise<ValidationResult>;
}
```

### Core Types

#### Template Interface

```typescript
interface Template {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly category: TemplateCategory;
  readonly platforms: SupportedPlatform[];
  readonly schema: JSONSchema;
  readonly files: TemplateFile[];
  readonly hooks: TemplateHooks;
  readonly metadata: TemplateMetadata;
}

type TemplateCategory = 
  | 'components'
  | 'layouts'
  | 'pages'
  | 'patterns'
  | 'utilities';

type SupportedPlatform = 
  | 'react'
  | 'nextjs'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'electron'
  | 'react-native';

interface TemplateFile {
  readonly path: string;
  readonly content: string;
  readonly type: FileType;
  readonly encoding?: string;
}

type FileType = 
  | 'template'
  | 'asset'
  | 'config'
  | 'test'
  | 'story'
  | 'documentation';
```

#### Generation Configuration

```typescript
interface GenerationConfig {
  readonly templateName: string;
  readonly platform: SupportedPlatform;
  readonly outputPath: string;
  readonly input: Record<string, unknown>;
  readonly context?: GenerationContext;
  readonly options?: GenerationOptions;
}

interface GenerationContext {
  readonly projectContext?: ProjectContext;
  readonly businessContext?: BusinessContext;
  readonly norwegianContext?: NorwegianComplianceContext;
  readonly accessibilityContext?: AccessibilityContext;
  readonly performanceContext?: PerformanceContext;
}

interface GenerationOptions {
  readonly overwrite?: boolean;
  readonly skipValidation?: boolean;
  readonly generateTests?: boolean;
  readonly generateStories?: boolean;
  readonly generateDocs?: boolean;
  readonly format?: boolean;
  readonly lint?: boolean;
}
```

#### Generation Result

```typescript
interface GenerationResult {
  readonly success: boolean;
  readonly files: GeneratedFile[];
  readonly metadata: GenerationMetadata;
  readonly warnings: GenerationWarning[];
  readonly errors: GenerationError[];
  readonly metrics: GenerationMetrics;
}

interface GeneratedFile {
  readonly path: string;
  readonly content: string;
  readonly type: GeneratedFileType;
  readonly size: number;
  readonly hash: string;
}

type GeneratedFileType = 
  | 'component'
  | 'types'
  | 'styles'
  | 'test'
  | 'story'
  | 'documentation'
  | 'configuration';

interface GenerationMetadata {
  readonly templateId: string;
  readonly templateVersion: string;
  readonly platform: SupportedPlatform;
  readonly generatedAt: Date;
  readonly generationTime: number;
  readonly inputHash: string;
}
```

### Methods

#### loadTemplate()

Load a template from the filesystem.

```typescript
async loadTemplate(templatePath: string): Promise<Template>
```

**Parameters:**
- `templatePath` - Path to template directory or template.json file

**Returns:**
- Promise resolving to loaded Template object

**Example:**
```typescript
const engine = new TemplateEngine();
const template = await engine.loadTemplate('./templates/button-template');
```

#### generateComponent()

Generate a component using a specified template.

```typescript
async generateComponent(config: GenerationConfig): Promise<GenerationResult>
```

**Parameters:**
- `config` - Generation configuration object

**Returns:**
- Promise resolving to GenerationResult with generated files

**Example:**
```typescript
const result = await engine.generateComponent({
  templateName: 'button-template',
  platform: 'react',
  outputPath: './src/components',
  input: {
    componentName: 'MyButton',
    variant: 'primary',
    size: 'medium'
  },
  options: {
    generateTests: true,
    generateStories: true
  }
});
```

## 🗄️ TemplateRegistry API

### Interface Definition

```typescript
interface TemplateRegistry {
  // Template Discovery
  searchTemplates(query: TemplateSearchQuery): Promise<TemplateSearchResult>;
  listTemplates(filter?: TemplateFilter): Promise<Template[]>;
  getTemplate(templateName: string): Promise<Template>;
  
  // Template Management
  registerTemplate(template: Template): Promise<void>;
  unregisterTemplate(templateName: string): Promise<void>;
  updateTemplate(templateName: string, template: Template): Promise<void>;
  
  // Template Metadata
  getTemplateMetadata(templateName: string): Promise<TemplateMetadata>;
  getTemplateVersions(templateName: string): Promise<string[]>;
  getTemplateStats(templateName: string): Promise<TemplateStats>;
}
```

### Search API

#### TemplateSearchQuery

```typescript
interface TemplateSearchQuery {
  readonly query?: string;
  readonly category?: TemplateCategory;
  readonly platform?: SupportedPlatform[];
  readonly features?: TemplateFeature[];
  readonly qualityScore?: QualityScoreRange;
  readonly norwegianCompliant?: boolean;
  readonly accessibility?: AccessibilityLevel;
  readonly author?: string;
  readonly tags?: string[];
  readonly sortBy?: TemplateSortOption;
  readonly limit?: number;
  readonly offset?: number;
}

interface QualityScoreRange {
  readonly min: number;
  readonly max: number;
}

type TemplateSortOption = 
  | 'relevance'
  | 'quality'
  | 'downloads'
  | 'updated'
  | 'name';

type AccessibilityLevel = 'A' | 'AA' | 'AAA';

type TemplateFeature = 
  | 'typescript'
  | 'accessibility'
  | 'norwegian-compliance'
  | 'testing'
  | 'storybook'
  | 'documentation'
  | 'responsive'
  | 'animations';
```

#### TemplateSearchResult

```typescript
interface TemplateSearchResult {
  readonly templates: TemplateSearchItem[];
  readonly total: number;
  readonly facets: SearchFacets;
  readonly suggestions: string[];
}

interface TemplateSearchItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: TemplateCategory;
  readonly platforms: SupportedPlatform[];
  readonly qualityScore: number;
  readonly downloadCount: number;
  readonly rating: number;
  readonly updatedAt: Date;
  readonly author: AuthorInfo;
}

interface SearchFacets {
  readonly categories: FacetCount[];
  readonly platforms: FacetCount[];
  readonly features: FacetCount[];
  readonly authors: FacetCount[];
}

interface FacetCount {
  readonly value: string;
  readonly count: number;
}
```

### Methods

#### searchTemplates()

Search for templates using advanced query options.

```typescript
async searchTemplates(query: TemplateSearchQuery): Promise<TemplateSearchResult>
```

**Example:**
```typescript
const registry = new TemplateRegistry();
const results = await registry.searchTemplates({
  query: 'button component',
  category: 'components',
  platform: ['react', 'vue'],
  norwegianCompliant: true,
  qualityScore: { min: 8.0, max: 10.0 },
  sortBy: 'quality',
  limit: 20
});
```

#### getTemplate()

Get detailed template information.

```typescript
async getTemplate(templateName: string): Promise<Template>
```

**Example:**
```typescript
const template = await registry.getTemplate('@community/awesome-button');
```

## ✅ ValidationEngine API

### Interface Definition

```typescript
interface ValidationEngine {
  // Template Validation
  validateTemplateStructure(template: Template): Promise<StructureValidationResult>;
  validateTemplateSchema(template: Template): Promise<SchemaValidationResult>;
  validateTemplateFiles(template: Template): Promise<FileValidationResult>;
  
  // Output Validation
  validateGeneratedCode(files: GeneratedFile[]): Promise<CodeValidationResult>;
  validateAccessibility(files: GeneratedFile[]): Promise<AccessibilityValidationResult>;
  validateNorwegianCompliance(files: GeneratedFile[]): Promise<ComplianceValidationResult>;
  
  // Comprehensive Validation
  validateComplete(template: Template, output: GenerationResult): Promise<CompleteValidationResult>;
}
```

### Validation Results

#### ValidationResult Base

```typescript
interface ValidationResult {
  readonly success: boolean;
  readonly score: number;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly suggestions: ValidationSuggestion[];
  readonly metadata: ValidationMetadata;
}

interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
  readonly rule: string;
}

interface ValidationSuggestion {
  readonly type: 'improvement' | 'optimization' | 'best-practice';
  readonly message: string;
  readonly file?: string;
  readonly autoFixable: boolean;
}
```

#### Accessibility Validation

```typescript
interface AccessibilityValidationResult extends ValidationResult {
  readonly wcagLevel: AccessibilityLevel;
  readonly violations: AccessibilityViolation[];
  readonly recommendations: AccessibilityRecommendation[];
}

interface AccessibilityViolation {
  readonly rule: string;
  readonly impact: 'minor' | 'moderate' | 'serious' | 'critical';
  readonly description: string;
  readonly element?: string;
  readonly fixSuggestion: string;
}
```

#### Norwegian Compliance Validation

```typescript
interface ComplianceValidationResult extends ValidationResult {
  readonly complianceLevel: ComplianceLevel;
  readonly requirements: ComplianceRequirement[];
  readonly localizationSupport: LocalizationSupport;
}

type ComplianceLevel = 'none' | 'basic' | 'standard' | 'full';

interface ComplianceRequirement {
  readonly name: string;
  readonly description: string;
  readonly status: 'passed' | 'failed' | 'partial';
  readonly required: boolean;
  readonly documentation?: string;
}
```

### Methods

#### validateComplete()

Perform comprehensive validation of template and output.

```typescript
async validateComplete(
  template: Template, 
  output: GenerationResult
): Promise<CompleteValidationResult>
```

**Example:**
```typescript
const validator = new ValidationEngine();
const result = await validator.validateComplete(template, generationResult);

if (result.success) {
  console.log(`Validation passed with score: ${result.score}/10`);
} else {
  console.error('Validation failed:', result.errors);
}
```

## 🔧 ContextProcessor API

### Interface Definition

```typescript
interface ContextProcessor {
  // Context Collection
  collectProjectContext(projectPath: string): Promise<ProjectContext>;
  collectBusinessContext(businessType: BusinessType): Promise<BusinessContext>;
  collectNorwegianContext(requirements: NorwegianRequirements): Promise<NorwegianComplianceContext>;
  
  // Context Processing
  processContext(rawContext: RawContext): Promise<ProcessedContext>;
  enrichContext(context: GenerationContext, template: Template): Promise<EnrichedContext>;
  
  // Context Merging
  mergeContexts(...contexts: GenerationContext[]): Promise<MergedContext>;
}
```

### Context Types

#### ProjectContext

```typescript
interface ProjectContext {
  readonly framework: Framework;
  readonly version: string;
  readonly dependencies: DependencyInfo[];
  readonly devDependencies: DependencyInfo[];
  readonly buildTool: BuildTool;
  readonly packageManager: PackageManager;
  readonly tsConfig: TypeScriptConfig;
  readonly eslintConfig: ESLintConfig;
  readonly testFramework: TestFramework;
  readonly existingComponents: ComponentInfo[];
  readonly projectStructure: ProjectStructure;
}

type Framework = 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
type BuildTool = 'webpack' | 'vite' | 'rollup' | 'parcel' | 'esbuild';
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type TestFramework = 'jest' | 'vitest' | 'cypress' | 'playwright';
```

#### BusinessContext

```typescript
interface BusinessContext {
  readonly type: BusinessType;
  readonly industry: Industry;
  readonly targetAudience: TargetAudience;
  readonly brandGuidelines: BrandGuidelines;
  readonly designSystem: DesignSystemInfo;
  readonly requirements: BusinessRequirement[];
}

type BusinessType = 
  | 'ecommerce'
  | 'saas'
  | 'blog'
  | 'portfolio'
  | 'corporate'
  | 'educational'
  | 'government';

type Industry = 
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'retail'
  | 'government'
  | 'non-profit';
```

#### NorwegianComplianceContext

```typescript
interface NorwegianComplianceContext {
  readonly required: boolean;
  readonly level: ComplianceLevel;
  readonly wcagLevel: AccessibilityLevel;
  readonly locales: string[];
  readonly governmentStandards: GovernmentStandard[];
  readonly dataProtection: DataProtectionRequirements;
  readonly accessibility: AccessibilityRequirements;
}

interface GovernmentStandard {
  readonly name: string;
  readonly version: string;
  readonly requirements: string[];
  readonly documentation: string;
}
```

### Methods

#### collectProjectContext()

Analyze project structure and collect context information.

```typescript
async collectProjectContext(projectPath: string): Promise<ProjectContext>
```

**Example:**
```typescript
const processor = new ContextProcessor();
const context = await processor.collectProjectContext('./my-project');
console.log(`Framework: ${context.framework}, Version: ${context.version}`);
```

## 🚀 CodeGenerator API

### Interface Definition

```typescript
interface CodeGenerator {
  // Platform-Specific Generation
  generateReact(template: Template, context: GenerationContext): Promise<ReactGenerationResult>;
  generateVue(template: Template, context: GenerationContext): Promise<VueGenerationResult>;
  generateAngular(template: Template, context: GenerationContext): Promise<AngularGenerationResult>;
  generateSvelte(template: Template, context: GenerationContext): Promise<SvelteGenerationResult>;
  
  // Multi-Platform Generation
  generateMultiPlatform(template: Template, context: GenerationContext): Promise<MultiPlatformResult>;
  
  // File Generation
  generateComponentFile(template: TemplateFile, context: FileContext): Promise<GeneratedFile>;
  generateTestFile(component: GeneratedFile, context: TestContext): Promise<GeneratedFile>;
  generateStoryFile(component: GeneratedFile, context: StoryContext): Promise<GeneratedFile>;
  generateDocsFile(component: GeneratedFile, context: DocsContext): Promise<GeneratedFile>;
}
```

### Platform-Specific Results

#### ReactGenerationResult

```typescript
interface ReactGenerationResult extends GenerationResult {
  readonly componentFile: GeneratedFile;
  readonly typesFile?: GeneratedFile;
  readonly stylesFile?: GeneratedFile;
  readonly testFile?: GeneratedFile;
  readonly storyFile?: GeneratedFile;
  readonly indexFile?: GeneratedFile;
  readonly reactVersion: string;
  readonly hooks: string[];
  readonly dependencies: string[];
}
```

### Methods

#### generateReact()

Generate React-specific component code.

```typescript
async generateReact(
  template: Template, 
  context: GenerationContext
): Promise<ReactGenerationResult>
```

**Example:**
```typescript
const generator = new CodeGenerator();
const result = await generator.generateReact(buttonTemplate, {
  projectContext: projectCtx,
  norwegianContext: norwegianCtx
});
```

## 🔍 QualityAssurance API

### Interface Definition

```typescript
interface QualityAssurance {
  // Quality Scoring
  calculateQualityScore(template: Template, output: GenerationResult): Promise<QualityScore>;
  assessCodeQuality(files: GeneratedFile[]): Promise<CodeQualityReport>;
  assessAccessibility(files: GeneratedFile[]): Promise<AccessibilityReport>;
  assessPerformance(files: GeneratedFile[]): Promise<PerformanceReport>;
  
  // Quality Recommendations
  generateRecommendations(qualityScore: QualityScore): Promise<QualityRecommendation[]>;
  suggestImprovement(files: GeneratedFile[]): Promise<ImprovementSuggestion[]>;
}
```

### Quality Types

#### QualityScore

```typescript
interface QualityScore {
  readonly overall: number;           // 0-10
  readonly codeQuality: number;       // 0-10
  readonly accessibility: number;     // 0-10
  readonly performance: number;       // 0-10
  readonly maintainability: number;   // 0-10
  readonly testability: number;       // 0-10
  readonly documentation: number;     // 0-10
  readonly details: QualityDetails;
}

interface QualityDetails {
  readonly typeScriptCoverage: number;
  readonly eslintScore: number;
  readonly complexityScore: number;
  readonly duplicateCode: number;
  readonly testCoverage: number;
  readonly documentationCoverage: number;
  readonly accessibilityViolations: number;
  readonly performanceScore: number;
}
```

### Methods

#### calculateQualityScore()

Calculate comprehensive quality score for generated code.

```typescript
async calculateQualityScore(
  template: Template, 
  output: GenerationResult
): Promise<QualityScore>
```

**Example:**
```typescript
const qa = new QualityAssurance();
const score = await qa.calculateQualityScore(template, generationResult);
console.log(`Overall Quality: ${score.overall}/10`);
```

## 🔧 Utility Functions

### File System Utilities

```typescript
// File operations
export function readTemplateFile(path: string): Promise<string>;
export function writeGeneratedFile(file: GeneratedFile, outputPath: string): Promise<void>;
export function ensureDirectoryExists(path: string): Promise<void>;

// Template utilities
export function parseTemplateMetadata(content: string): TemplateMetadata;
export function validateTemplateName(name: string): boolean;
export function resolveTemplatePath(name: string, registry: TemplateRegistry): Promise<string>;
```

### Validation Utilities

```typescript
// Schema validation
export function validateJsonSchema(data: unknown, schema: JSONSchema): ValidationResult;
export function validateTypeScript(code: string): TypeScriptValidationResult;
export function validateAccessibilityMarkup(html: string): AccessibilityValidationResult;

// Code analysis
export function analyzeCodeComplexity(code: string): ComplexityAnalysis;
export function analyzeBundleSize(files: GeneratedFile[]): BundleSizeAnalysis;
export function analyzePerformanceMetrics(code: string): PerformanceMetrics;
```

### Context Utilities

```typescript
// Context helpers
export function mergeContexts(...contexts: GenerationContext[]): GenerationContext;
export function extractProjectInfo(packageJson: PackageJson): ProjectInfo;
export function detectFramework(dependencies: string[]): Framework;
export function inferBusinessContext(projectStructure: ProjectStructure): BusinessContext;
```

## 📚 Usage Examples

### Complete Component Generation

```typescript
import { 
  TemplateEngine, 
  TemplateRegistry, 
  ContextProcessor,
  ValidationEngine 
} from '@xaheen-ai/template-system';

async function generateComponent() {
  // Initialize services
  const engine = new TemplateEngine();
  const registry = new TemplateRegistry();
  const contextProcessor = new ContextProcessor();
  const validator = new ValidationEngine();
  
  // Find template
  const searchResults = await registry.searchTemplates({
    query: 'button',
    category: 'components',
    platform: ['react'],
    norwegianCompliant: true,
    qualityScore: { min: 8.0, max: 10.0 }
  });
  
  const templateName = searchResults.templates[0].name;
  const template = await registry.getTemplate(templateName);
  
  // Collect context
  const projectContext = await contextProcessor.collectProjectContext('./');
  const norwegianContext = await contextProcessor.collectNorwegianContext({
    required: true,
    level: 'full',
    wcagLevel: 'AAA'
  });
  
  // Generate component
  const result = await engine.generateComponent({
    templateName,
    platform: 'react',
    outputPath: './src/components',
    input: {
      componentName: 'MyButton',
      variant: 'primary',
      size: 'medium',
      accessibility: {
        ariaLabel: 'Primary action button'
      }
    },
    context: {
      projectContext,
      norwegianContext
    },
    options: {
      generateTests: true,
      generateStories: true,
      generateDocs: true
    }
  });
  
  // Validate result
  const validation = await validator.validateComplete(template, result);
  
  if (validation.success) {
    console.log('✅ Component generated successfully!');
    console.log(`Quality Score: ${validation.score}/10`);
    
    // Write files to disk
    for (const file of result.files) {
      await writeFile(file.path, file.content);
    }
  } else {
    console.error('❌ Generation failed validation:', validation.errors);
  }
}
```

### Custom Template Creation

```typescript
import { Template, TemplateEngine } from '@xaheen-ai/template-system';

async function createCustomTemplate() {
  const template: Template = {
    id: 'custom-card',
    name: 'Custom Card Template',
    version: '1.0.0',
    description: 'A customizable card component',
    category: 'components',
    platforms: ['react', 'vue'],
    schema: {
      type: 'object',
      properties: {
        componentName: { type: 'string' },
        variant: { 
          type: 'string', 
          enum: ['default', 'elevated', 'outlined'] 
        }
      },
      required: ['componentName']
    },
    files: [
      {
        path: '{{componentName}}.tsx',
        content: `
          import React from 'react';
          import { {{componentName}}Props } from './types';
          
          export const {{componentName}} = ({ 
            children, 
            variant = '{{variant}}' 
          }: {{componentName}}Props): JSX.Element => {
            return (
              <div className="card card-{{variant}}">
                {children}
              </div>
            );
          };
        `,
        type: 'template'
      }
    ],
    hooks: {},
    metadata: {
      author: 'Developer Name',
      tags: ['card', 'container'],
      license: 'MIT'
    }
  };
  
  const engine = new TemplateEngine();
  const result = await engine.generateComponent({
    templateName: 'custom-card',
    platform: 'react',
    outputPath: './src/components',
    input: {
      componentName: 'ProductCard',
      variant: 'elevated'
    }
  });
  
  return result;
}
```

## 🔍 Error Handling

### Error Types

```typescript
// Base error class
export class TemplateSystemError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
}

// Specific error types
export class TemplateNotFoundError extends TemplateSystemError {}
export class ValidationError extends TemplateSystemError {}
export class GenerationError extends TemplateSystemError {}
export class ContextProcessingError extends TemplateSystemError {}
```

### Error Handling Example

```typescript
try {
  const result = await engine.generateComponent(config);
} catch (error) {
  if (error instanceof TemplateNotFoundError) {
    console.error('Template not found:', error.message);
    // Suggest alternatives
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.details);
    // Show validation errors
  } else if (error instanceof GenerationError) {
    console.error('Generation failed:', error.message);
    // Provide recovery options
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

**This API reference provides comprehensive documentation for integrating with the Xaheen CLI Template System programmatically.**

For more examples and advanced usage, see our [Template Development Guide](../usage/template-development.md).