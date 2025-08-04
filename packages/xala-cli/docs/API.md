# Xala CLI API Reference

Complete API reference for all services, utilities, and interfaces in the Xala CLI.

## Core Services

### AICodeGenerator

AI-powered code generation with multiple provider support.

```typescript
import { AICodeGenerator } from '../services/ai-code-generator.js';
```

#### Constructor

```typescript
constructor(provider = 'openai')
```

**Parameters:**
- `provider` - AI provider ('openai' | 'anthropic')

#### Methods

##### generateComponent

```typescript
async generateComponent(request: AIGenerateRequest): Promise<GeneratedCode>
```

Generate a component from natural language description.

**Parameters:**
```typescript
interface AIGenerateRequest {
  readonly description: string;
  readonly platform: string;
  readonly componentType: string;
  readonly features: ReadonlyArray<string>;
  readonly compliance: string;
  readonly locale: string;
}
```

**Returns:**
```typescript
interface GeneratedCode {
  readonly code: string;
  readonly filename: string;
  readonly metadata: {
    readonly platform: string;
    readonly components: ReadonlyArray<string>;
    readonly tokens: ReadonlyArray<string>;
    readonly features: ReadonlyArray<string>;
  };
  readonly tests?: string;
  readonly stories?: string;
  readonly documentation?: string;
}
```

**Example:**
```typescript
const generator = new AICodeGenerator('openai');
const result = await generator.generateComponent({
  description: 'Patient information card with medical data display',
  platform: 'react',
  componentType: 'card',
  features: ['responsive', 'accessible', 'internationalized'],
  compliance: 'healthcare',
  locale: 'nb-NO'
});
```

##### getSuggestions

```typescript
async getSuggestions(context: string): Promise<ReadonlyArray<AISuggestion>>
```

Get AI-powered suggestions for improvements or patterns.

**Returns:**
```typescript
interface AISuggestion {
  readonly title: string;
  readonly description: string;
  readonly components: ReadonlyArray<string>;
  readonly patterns: ReadonlyArray<string>;
  readonly confidence: number;
}
```

##### explainConcept

```typescript
async explainConcept(concept: string): Promise<AIExplanation>
```

Get detailed explanations of design system concepts.

**Returns:**
```typescript
interface AIExplanation {
  readonly description: string;
  readonly examples: ReadonlyArray<string>;
  readonly complianceNotes?: string;
  readonly relatedConcepts: ReadonlyArray<string>;
}
```

---

### MultiPlatformBuilder

Handles builds across multiple platforms with optimization and analysis.

```typescript
import { MultiPlatformBuilder } from '../services/multi-platform-builder.js';
```

#### Methods

##### build

```typescript
async build(platform: string, options: BuildOptions): Promise<ReadonlyArray<BuildResult>>
```

Build for specified platform(s).

**Parameters:**
```typescript
interface BuildOptions {
  readonly optimize: boolean;
  readonly analyze: boolean;
  readonly outputDir: string;
  readonly environment: string;
  readonly watch: boolean;
  readonly sourcemap: boolean;
  readonly minify: boolean;
}
```

**Returns:**
```typescript
interface BuildResult {
  readonly platform: string;
  readonly status: 'success' | 'failed' | 'warning';
  readonly outputPath: string;
  readonly size: string;
  readonly buildTime: string;
  readonly warnings?: ReadonlyArray<string>;
  readonly errors?: ReadonlyArray<string>;
}
```

**Example:**
```typescript
const builder = new MultiPlatformBuilder();
const results = await builder.build('react', {
  optimize: true,
  analyze: true,
  outputDir: './dist',
  environment: 'production',
  watch: false,
  sourcemap: true,
  minify: true
});
```

##### analyzeBuild

```typescript
async analyzeBuild(buildPath: string): Promise<BuildAnalysis>
```

Analyze build output for optimization opportunities.

**Returns:**
```typescript
interface BuildAnalysis {
  readonly bundleSize: string;
  readonly moduleCount: number;
  readonly unusedCode: number;
  readonly duplicateModules: ReadonlyArray<string>;
  readonly recommendations: ReadonlyArray<string>;
}
```

---

### ThemeGenerator

Comprehensive theme management and generation system.

```typescript
import { ThemeGenerator } from '../services/theme-generator.js';
```

#### Methods

##### createTheme

```typescript
async createTheme(config: ThemeConfig, options: GenerationOptions): Promise<void>
```

Create a new theme with specified configuration.

**Parameters:**
```typescript
interface ThemeConfig {
  readonly name: string;
  readonly brand: string;
  readonly industry: string;
  readonly colors: Record<string, string>;
  readonly accessibility: 'AA' | 'AAA';
  readonly features: ReadonlyArray<string>;
  readonly locales: ReadonlyArray<string>;
}

interface GenerationOptions {
  readonly outputDir: string;
  readonly preview: boolean;
}
```

**Example:**
```typescript
const generator = new ThemeGenerator();
await generator.createTheme({
  name: 'healthcare-pro',
  brand: 'Medical Corporation',
  industry: 'healthcare',
  colors: {
    primary: '#0891b2',
    secondary: '#065f46',
    accent: '#dc2626'
  },
  accessibility: 'AAA',
  features: ['dark-mode', 'high-contrast'],
  locales: ['en-US', 'nb-NO']
}, {
  outputDir: './src/themes',
  preview: true
});
```

##### applyTheme

```typescript
async applyTheme(themeName: string, projectPath: string): Promise<void>
```

Apply an existing theme to a project.

##### listThemes

```typescript
async listThemes(projectPath?: string): Promise<ThemeInfo[]>
```

List available themes.

**Returns:**
```typescript
interface ThemeInfo {
  readonly name: string;
  readonly description: string;
  readonly industry: string;
  readonly accessibility: string;
  readonly isActive: boolean;
}
```

##### customizeTheme

```typescript
async customizeTheme(themeName: string, customizations: Partial<ThemeConfig>): Promise<void>
```

Customize an existing theme with new configurations.

##### previewTheme

```typescript
async previewTheme(themeName: string): Promise<string>
```

Generate a preview of the theme's appearance.

---

### ProjectAnalyzer

Comprehensive project analysis for performance, accessibility, and compliance.

```typescript
import { ProjectAnalyzer } from '../services/project-analyzer.js';
```

#### Methods

##### analyze

```typescript
async analyze(projectPath: string, options: AnalysisOptions): Promise<AnalysisResults>
```

Perform comprehensive project analysis.

**Parameters:**
```typescript
interface AnalysisOptions {
  readonly performance: boolean;
  readonly accessibility: boolean;
  readonly compliance: boolean;
  readonly bundle: boolean;
  readonly outputDir: string;
  readonly format: string;
  readonly detailed: boolean;
}
```

**Returns:**
```typescript
interface AnalysisResults {
  readonly performance?: PerformanceAnalysis;
  readonly accessibility?: AccessibilityAnalysis;
  readonly compliance?: ComplianceAnalysis;
  readonly bundle?: BundleAnalysis;
  readonly reportPaths?: ReadonlyArray<string>;
  readonly recommendations?: ReadonlyArray<Recommendation>;
}
```

#### Analysis Result Types

##### PerformanceAnalysis

```typescript
interface PerformanceAnalysis {
  readonly bundleSize: string;
  readonly bundleScore: number;
  readonly loadTime: string;
  readonly loadScore: number;
  readonly firstPaint: string;
  readonly paintScore: number;
  readonly timeToInteractive: string;
  readonly interactiveScore: number;
  readonly overallScore: number;
  readonly issues?: ReadonlyArray<PerformanceIssue>;
}
```

##### AccessibilityAnalysis

```typescript
interface AccessibilityAnalysis {
  readonly wcagLevel: string;
  readonly contrastScore: number;
  readonly keyboardScore: number;
  readonly screenReaderScore: number;
  readonly overallScore: number;
  readonly violations?: ReadonlyArray<AccessibilityViolation>;
}
```

##### ComplianceAnalysis

```typescript
interface ComplianceAnalysis {
  readonly componentScore: number;
  readonly tokenScore: number;
  readonly i18nScore: number;
  readonly typeScore: number;
  readonly qualityScore: number;
  readonly overallScore: number;
  readonly violations?: ReadonlyArray<ComplianceViolation>;
}
```

**Example:**
```typescript
const analyzer = new ProjectAnalyzer();
const results = await analyzer.analyze('./src', {
  performance: true,
  accessibility: true,
  compliance: true,
  bundle: true,
  outputDir: './reports',
  format: 'html',
  detailed: true
});

console.log(`Overall performance score: ${results.performance?.overallScore}`);
```

---

### DevServer

Express-based development server with hot-reload and advanced features.

```typescript
import { DevServer } from '../services/dev-server.js';
```

#### Methods

##### start

```typescript
async start(options: DevServerOptions): Promise<void>
```

Start the development server.

**Parameters:**
```typescript
interface DevServerOptions {
  readonly port: number;
  readonly host: string;
  readonly https: boolean;
  readonly open: boolean;
  readonly proxy?: Record<string, string>;
  readonly theme?: string;
  readonly platform: string;
}
```

**Example:**
```typescript
const server = new DevServer();
await server.start({
  port: 3001,
  host: 'localhost',
  https: true,
  open: true,
  proxy: {
    '/api': 'http://localhost:4000'
  },
  theme: 'healthcare-dark',
  platform: 'react'
});
```

##### stop

```typescript
async stop(): Promise<void>
```

Gracefully stop the development server.

##### reload

```typescript
async reload(files?: ReadonlyArray<string>): Promise<void>
```

Trigger hot-reload for specified files or all files.

---

### ComplianceValidator

Validates code against Norwegian compliance standards and enterprise rules.

```typescript
import { ComplianceValidator } from '../services/compliance-validator.js';
```

#### Methods

##### validate

```typescript
async validate(filePath: string, rules?: ValidationRules): Promise<ValidationResult>
```

Validate a file against compliance rules.

**Parameters:**
```typescript
interface ValidationRules {
  readonly nsmCompliance: boolean;
  readonly gdprCompliance: boolean;
  readonly wcagLevel: 'AA' | 'AAA';
  readonly typeScriptStrict: boolean;
  readonly componentUsage: boolean;
  readonly tokenUsage: boolean;
  readonly i18nUsage: boolean;
}
```

**Returns:**
```typescript
interface ValidationResult {
  readonly isValid: boolean;
  readonly score: number;
  readonly violations: ReadonlyArray<ComplianceViolation>;
  readonly suggestions: ReadonlyArray<string>;
}

interface ComplianceViolation {
  readonly rule: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
  readonly fix?: string;
}
```

**Example:**
```typescript
const validator = new ComplianceValidator();
const result = await validator.validate('./src/components/UserCard.tsx', {
  nsmCompliance: true,
  gdprCompliance: true,
  wcagLevel: 'AAA',
  typeScriptStrict: true,
  componentUsage: true,
  tokenUsage: true,
  i18nUsage: true
});

if (!result.isValid) {
  result.violations.forEach(violation => {
    console.error(`${violation.severity}: ${violation.message}`);
  });
}
```

---

### TemplateEngine

Handlebars-based template processing with enterprise features.

```typescript
import { TemplateEngine } from '../services/template-engine.js';
```

#### Methods

##### render

```typescript
async render(templatePath: string, context: TemplateContext): Promise<string>
```

Render a template with provided context.

**Parameters:**
```typescript
interface TemplateContext {
  readonly platform: string;
  readonly componentName: string;
  readonly props?: Record<string, any>;
  readonly features?: ReadonlyArray<string>;
  readonly theme?: string;
  readonly locale?: string;
  readonly [key: string]: any;
}
```

**Example:**
```typescript
const engine = new TemplateEngine();
const result = await engine.render('./templates/react/component.tsx.hbs', {
  platform: 'react',
  componentName: 'UserCard',
  props: {
    name: 'string',
    email: 'string',
    avatar: 'string'
  },
  features: ['responsive', 'accessible'],
  theme: 'healthcare-light',
  locale: 'nb-NO'
});
```

##### registerHelper

```typescript
registerHelper(name: string, helper: HandlebarsHelper): void
```

Register a custom Handlebars helper function.

##### registerPartial

```typescript
registerPartial(name: string, template: string): void
```

Register a partial template for reuse.

---

### ComponentGenerator

Generate components with proper structure and compliance.

```typescript
import { ComponentGenerator } from '../services/component-generator.js';
```

#### Methods

##### scaffold

```typescript
async scaffold(name: string, options: ScaffoldOptions): Promise<ComponentFiles>
```

Generate a complete component scaffold.

**Parameters:**
```typescript
interface ScaffoldOptions {
  readonly type: 'basic' | 'composite' | 'layout';
  readonly platform: string;
  readonly props: Record<string, string>;
  readonly variants?: ReadonlyArray<string>;
  readonly accessibility: boolean;
  readonly tests: boolean;
  readonly stories: boolean;
  readonly outputDir: string;
}
```

**Returns:**
```typescript
interface ComponentFiles {
  readonly component: string;
  readonly types?: string;
  readonly styles?: string;
  readonly tests?: string;
  readonly stories?: string;
  readonly documentation?: string;
}
```

---

### TokenManager

Manage design tokens across platforms with validation and synchronization.

```typescript
import { TokenManager } from '../services/token-manager.js';
```

#### Methods

##### generate

```typescript
async generate(options: TokenGenerationOptions): Promise<TokenOutput>
```

Generate token files for specified platforms.

**Parameters:**
```typescript
interface TokenGenerationOptions {
  readonly platforms: ReadonlyArray<string>;
  readonly formats: ReadonlyArray<TokenFormat>;
  readonly outputDir: string;
  readonly theme?: string;
  readonly includeDocumentation: boolean;
}

type TokenFormat = 'json' | 'css' | 'scss' | 'ts' | 'swift' | 'kotlin';
```

##### validate

```typescript
async validate(tokenPath: string): Promise<TokenValidationResult>
```

Validate token consistency and compliance.

---

## Utility Classes

### Logger

Structured logging with color-coded output and multiple levels.

```typescript
import { logger } from '../utils/logger.js';
```

#### Interface

```typescript
interface Logger {
  readonly debug: (message: string, ...args: any[]) => void;
  readonly info: (message: string, ...args: any[]) => void;
  readonly warn: (message: string, ...args: any[]) => void;
  readonly error: (message: string, ...args: any[]) => void;
  readonly success: (message: string, ...args: any[]) => void;
}
```

**Example:**
```typescript
import { logger } from '../utils/logger.js';

logger.info('Starting theme generation...');
logger.success('Theme created successfully');
logger.warn('Theme already exists, overwriting...');
logger.error('Failed to create theme:', error);
logger.debug('Debug information:', debugData);
```

### Error Classes

Structured error hierarchy with specific error types and codes.

```typescript
import { 
  ValidationError, 
  ConfigurationError, 
  BuildError, 
  NetworkError 
} from '../utils/errors.js';
```

#### Error Types

##### ValidationError

```typescript
class ValidationError extends XalaError {
  readonly code = 2;
  readonly category = 'validation';
  
  constructor(message: string, public readonly violations?: ReadonlyArray<string>) {
    super(message);
  }
}
```

##### ConfigurationError

```typescript
class ConfigurationError extends XalaError {
  readonly code = 3;
  readonly category = 'configuration';
}
```

##### BuildError

```typescript
class BuildError extends XalaError {
  readonly code = 4;
  readonly category = 'build';
}
```

##### NetworkError

```typescript
class NetworkError extends XalaError {
  readonly code = 5;
  readonly category = 'network';
}
```

**Example:**
```typescript
import { ValidationError } from '../utils/errors.js';

if (!isValidComponent(code)) {
  throw new ValidationError('Component validation failed', [
    'Missing accessibility attributes',
    'Non-semantic elements used',
    'Hardcoded text without i18n'
  ]);
}
```

---

## Configuration Types

### XalaConfig

Main configuration interface for projects.

```typescript
interface XalaConfig {
  readonly name: string;
  readonly platform: Platform;
  readonly industry: Industry;
  readonly theme: ThemeConfig;
  readonly i18n: I18nConfig;
  readonly accessibility: AccessibilityConfig;
  readonly enterprise: EnterpriseConfig;
  readonly ai: AIConfig;
  readonly build: BuildConfig;
  readonly dev: DevConfig;
}
```

#### Related Types

```typescript
type Platform = 'react' | 'vue' | 'angular' | 'flutter' | 'ios' | 'android';
type Industry = 'saas' | 'healthcare' | 'finance' | 'education' | 'government' | 'ecommerce';

interface I18nConfig {
  readonly defaultLocale: string;
  readonly locales: ReadonlyArray<string>;
  readonly fallbackLocale: string;
}

interface AccessibilityConfig {
  readonly level: 'AA' | 'AAA';
  readonly enforceContrastRatios: boolean;
  readonly keyboardNavigation: boolean;
  readonly screenReaderSupport: boolean;
}

interface EnterpriseConfig {
  readonly nsmCompliance: boolean;
  readonly gdprCompliance: boolean;
  readonly auditTrail: boolean;
  readonly roleBasedAccess: boolean;
}

interface AIConfig {
  readonly provider: 'openai' | 'anthropic';
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
}
```

---

## Usage Examples

### Complete Component Generation Workflow

```typescript
import { AICodeGenerator, ComplianceValidator, ComponentGenerator } from './services';

// 1. Generate component with AI
const aiGenerator = new AICodeGenerator('openai');
const generatedCode = await aiGenerator.generateComponent({
  description: 'Patient appointment card with status indicators and actions',
  platform: 'react',
  componentType: 'card',
  features: ['responsive', 'accessible', 'internationalized'],
  compliance: 'healthcare',
  locale: 'nb-NO'
});

// 2. Validate compliance
const validator = new ComplianceValidator();
const validationResult = await validator.validate(generatedCode.code, {
  nsmCompliance: true,
  gdprCompliance: true,
  wcagLevel: 'AAA',
  typeScriptStrict: true,
  componentUsage: true,
  tokenUsage: true,
  i18nUsage: true
});

// 3. Create component files if valid
if (validationResult.isValid) {
  const componentGenerator = new ComponentGenerator();
  await componentGenerator.scaffold('AppointmentCard', {
    type: 'composite',
    platform: 'react',
    props: {
      appointment: 'Appointment',
      onEdit: 'Function',
      onCancel: 'Function'
    },
    accessibility: true,
    tests: true,
    stories: true,
    outputDir: './src/components'
  });
}
```

### Multi-Platform Build Pipeline

```typescript
import { MultiPlatformBuilder, ProjectAnalyzer } from './services';

// 1. Build for multiple platforms
const builder = new MultiPlatformBuilder();
const buildResults = await builder.build('all', {
  optimize: true,
  analyze: true,
  outputDir: './dist',
  environment: 'production',
  watch: false,
  sourcemap: true,
  minify: true
});

// 2. Analyze build results
const analyzer = new ProjectAnalyzer();
for (const result of buildResults) {
  if (result.status === 'success') {
    const analysis = await analyzer.analyze(result.outputPath, {
      performance: true,
      accessibility: true,
      compliance: true,
      bundle: true,
      outputDir: `./reports/${result.platform}`,
      format: 'html',
      detailed: true
    });
    
    console.log(`${result.platform} - Performance Score: ${analysis.performance?.overallScore}`);
  }
}
```

### Theme Development Workflow

```typescript
import { ThemeGenerator, DevServer } from './services';

// 1. Create custom theme
const themeGenerator = new ThemeGenerator();
await themeGenerator.createTheme({
  name: 'medical-professional',
  brand: 'Healthcare Solutions Inc.',
  industry: 'healthcare',
  colors: {
    primary: '#0891b2',
    secondary: '#065f46',
    accent: '#dc2626',
    neutral: '#64748b'
  },
  accessibility: 'AAA',
  features: ['dark-mode', 'high-contrast', 'reduced-motion'],
  locales: ['en-US', 'nb-NO', 'sv-SE']
}, {
  outputDir: './src/themes',
  preview: true
});

// 2. Start development server with new theme
const server = new DevServer();
await server.start({
  port: 3001,
  host: 'localhost',
  https: true,
  open: true,
  theme: 'medical-professional',
  platform: 'react'
});
```