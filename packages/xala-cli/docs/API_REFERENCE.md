# Xala UI CLI - Complete API Reference

## Command Line Interface

### Core Commands

#### `xala install`

**Description**: Automatically install and configure the Xala UI system in existing or new applications.

**Syntax**:
```bash
xala install [options]
```

**Options**:
| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--force` | `-f` | boolean | false | Force installation even if conflicts detected |
| `--skip-deps` | | boolean | false | Skip dependency installation |
| `--template` | `-t` | string | | Project template (saas, healthcare, finance, government) |
| `--industry` | `-i` | string | | Industry preset (healthcare, finance, government, retail) |
| `--platform` | `-p` | string | 'react' | Target platform (react, nextjs, vue, nuxt, angular) |
| `--theme` | | string | 'enterprise' | Default theme to apply |
| `--compliance` | `-c` | string | | Compliance requirements (nsm, gdpr, hipaa, sox, wcag-aaa) |
| `--backup` | | boolean | false | Create backup before installation |
| `--verbose` | `-v` | boolean | false | Enable verbose output |

**Examples**:
```bash
# Basic installation
xala install --platform react

# Healthcare application with compliance
xala install --template healthcare --compliance hipaa,wcag-aaa --theme healthcare

# Enterprise SaaS with Norwegian compliance
xala install --template saas --compliance nsm,gdpr --industry enterprise --backup
```

**Exit Codes**:
- `0`: Success
- `1`: Installation failed
- `2`: Dependency conflicts
- `3`: Platform not supported

---

#### `xala migrate`

**Description**: Analyze and migrate existing codebases to Xala UI system standards.

**Subcommands**:

##### `xala migrate analyze`

**Syntax**:
```bash
xala migrate analyze [path] [options]
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | No | Path to analyze (default: current directory) |

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--recursive` | boolean | false | Analyze subdirectories recursively |
| `--report` | boolean | false | Generate detailed HTML report |
| `--format` | string | 'console' | Output format (console, json, html, markdown) |
| `--output` | string | | Output file path for report |
| `--include-examples` | boolean | false | Include fix examples in report |
| `--min-score` | number | 0 | Minimum score threshold |

##### `xala migrate convert`

**Syntax**:
```bash
xala migrate convert <file> [options]
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `file` | string | Yes | File to convert |

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--dry-run` | boolean | false | Show changes without applying |
| `--backup` | boolean | false | Create backup before conversion |
| `--interactive` | boolean | false | Interactive mode with prompts |
| `--force` | boolean | false | Force conversion even with warnings |
| `--output` | string | | Output file (default: overwrite original) |
| `--format` | string | 'typescript' | Output format (typescript, javascript) |
| `--platform` | string | 'react' | Target platform |

**Examples**:
```bash
# Analyze entire project
xala migrate analyze --recursive --report --output analysis.html

# Convert component with backup
xala migrate convert src/Button.jsx --backup --interactive

# Batch conversion with dry run
xala migrate convert src/components/*.jsx --dry-run --format typescript
```

---

#### `xala check`

**Description**: Quick validation of components against UI system standards.

**Syntax**:
```bash
xala check <file> [options]
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `file` | string | Yes | Component file to check |

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--verbose` | boolean | false | Show detailed information |
| `--fix-suggestions` | boolean | false | Show specific fix commands |
| `--json` | boolean | false | Output as JSON |
| `--score-only` | boolean | false | Show only compatibility score |
| `--recursive` | boolean | false | Check all files in directory |

**JSON Output Schema**:
```typescript
interface CheckResult {
  file: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'requires-migration';
  checks: Array<{
    name: string;
    passed: boolean;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
    documentation?: string;
  }>;
  quickFixes: Array<{
    description: string;
    command: string;
    autoApply: boolean;
  }>;
  estimatedTime: string;
}
```

---

#### `xala xaheen`

**Description**: Integration commands for Xaheen full-stack CLI.

**Subcommands**:

##### `xala xaheen init`

**Syntax**:
```bash
xala xaheen init [options]
```

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--theme` | string | 'enterprise' | UI theme to apply |
| `--industry` | string | | Industry preset |
| `--compliance` | string | | Compliance requirements (comma-separated) |
| `--components` | string | | Initial components to generate |
| `--skip-ui-setup` | boolean | false | Skip initial UI setup |
| `--interactive` | boolean | false | Interactive setup mode |
| `--check-compatibility` | boolean | false | Only check compatibility |

##### `xala xaheen sync`

**Syntax**:
```bash
xala xaheen sync [options]
```

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--force` | boolean | false | Force sync even with conflicts |

---

#### `xala ai`

**Description**: AI-powered component generation.

**Syntax**:
```bash
xala ai generate <prompt> [options]
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `prompt` | string | Yes | Natural language description |

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--platform` | string | 'react' | Target platform |
| `--theme` | string | 'enterprise' | UI theme |
| `--model-size` | string | 'auto' | LLM size (7b, 13b, 70b+, auto) |
| `--output` | string | './src/components' | Output directory |
| `--format` | string | 'typescript' | Output format |
| `--complexity` | string | 'auto' | Complexity level (simple, moderate, complex, auto) |

**Examples**:
```bash
# Generate with specific requirements
xala ai generate "user profile form with avatar upload" --platform nextjs --theme healthcare

# Generate for smaller LLM
xala ai generate "simple button component" --model-size 7b --complexity simple

# Batch generation
xala ai generate-batch --from-file components.txt --platform react
```

---

### Global Options

Available for all commands:

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--config` | | string | './xala.config.json' | Config file path |
| `--verbose` | `-v` | boolean | false | Enable verbose output |
| `--debug` | | boolean | false | Enable debug mode |
| `--no-banner` | | boolean | false | Disable CLI banner |
| `--help` | `-h` | boolean | false | Show help |
| `--version` | `-V` | boolean | false | Show version |

---

## Programmatic API

### XaheenBridge Class

**Description**: Main integration bridge between Xala UI CLI and Xaheen CLI.

```typescript
class XaheenBridge {
  constructor(projectPath?: string);
}
```

#### Methods

##### `detectXaheenProject()`

```typescript
async detectXaheenProject(): Promise<boolean>
```

**Description**: Detects if the current directory contains a Xaheen project.

**Returns**: Promise resolving to boolean indicating if Xaheen project is detected.

**Example**:
```typescript
const bridge = new XaheenBridge('./my-project');
const isXaheenProject = await bridge.detectXaheenProject();
console.log('Is Xaheen project:', isXaheenProject);
```

##### `validateCompatibility()`

```typescript
async validateCompatibility(): Promise<void>
```

**Description**: Validates compatibility between Xaheen stack and Xala UI system.

**Throws**: Error if compatibility validation fails.

**Example**:
```typescript
try {
  await bridge.validateCompatibility();
  console.log('✅ Compatible');
} catch (error) {
  console.error('❌ Incompatible:', error.message);
}
```

##### `initializeXalaUI()`

```typescript
async initializeXalaUI(options: XaheenIntegrationOptions): Promise<void>
```

**Parameters**:
```typescript
interface XaheenIntegrationOptions {
  useXalaUI: boolean;
  theme?: string;
  industry?: string;
  compliance?: string[];
  components?: string[];
  skipUISetup?: boolean;
  interactive?: boolean;
}
```

**Description**: Initializes Xala UI system within a Xaheen project.

**Example**:
```typescript
await bridge.initializeXalaUI({
  useXalaUI: true,
  theme: 'healthcare',
  compliance: ['hipaa', 'wcag-aaa'],
  components: ['PatientForm', 'MedicalChart']
});
```

##### `setupIntegrationHooks()`

```typescript
async setupIntegrationHooks(): Promise<void>
```

**Description**: Creates integration hooks for automated workflows.

**Example**:
```typescript
await bridge.setupIntegrationHooks();
// Creates .xaheen/hooks/ directory with pre-build.sh, post-generate.sh
```

##### `createUnifiedWorkflow()`

```typescript
async createUnifiedWorkflow(): Promise<void>
```

**Description**: Generates unified development workflow script.

**Example**:
```typescript
await bridge.createUnifiedWorkflow();
// Creates xaheen-xala.sh script
```

---

### XalaProgrammaticAPI Class

**Description**: Programmatic interface for CLI operations.

#### Static Methods

##### `generateComponents()`

```typescript
static async generateComponents(
  components: string[],
  options: GenerationOptions
): Promise<GenerationResult>
```

**Parameters**:
```typescript
interface GenerationOptions {
  platform: string;
  theme?: string;
  outputDir?: string;
  compliance?: string[];
  format?: 'typescript' | 'javascript';
}

interface GenerationResult {
  success: boolean;
  generatedFiles: string[];
  errors: string[];
  warnings?: string[];
}
```

**Example**:
```typescript
const result = await XalaProgrammaticAPI.generateComponents(
  ['UserProfile', 'Dashboard', 'Settings'],
  {
    platform: 'nextjs',
    theme: 'enterprise',
    outputDir: './src/components',
    compliance: ['gdpr', 'wcag-aaa']
  }
);

console.log('Generated files:', result.generatedFiles);
if (result.errors.length > 0) {
  console.error('Errors:', result.errors);
}
```

##### `validateComponents()`

```typescript
static async validateComponents(
  filePaths: string[]
): Promise<ValidationResult>
```

**Parameters**:
```typescript
interface ValidationResult {
  overallScore: number;
  componentScores: Array<{
    file: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }>;
}
```

**Example**:
```typescript
const validation = await XalaProgrammaticAPI.validateComponents([
  './src/components/Button.tsx',
  './src/components/Input.tsx'
]);

console.log(`Overall score: ${validation.overallScore}%`);
validation.componentScores.forEach(component => {
  console.log(`${component.file}: ${component.score}%`);
  if (component.issues.length > 0) {
    console.log('Issues:', component.issues);
  }
});
```

##### `applyMigrations()`

```typescript
static async applyMigrations(
  filePaths: string[],
  options?: MigrationOptions
): Promise<MigrationResult>
```

**Parameters**:
```typescript
interface MigrationOptions {
  dryRun?: boolean;
  backup?: boolean;
  interactive?: boolean;
  platform?: string;
}

interface MigrationResult {
  success: boolean;
  migratedFiles: string[];
  errors: string[];
  backupLocation?: string;
}
```

**Example**:
```typescript
const result = await XalaProgrammaticAPI.applyMigrations(
  ['./src/components/OldButton.jsx'],
  {
    backup: true,
    platform: 'react'
  }
);

if (result.success) {
  console.log('Migration successful');
  console.log('Migrated files:', result.migratedFiles);
  if (result.backupLocation) {
    console.log('Backup created at:', result.backupLocation);
  }
} else {
  console.error('Migration failed:', result.errors);
}
```

---

### SharedConfigManager Class

**Description**: Unified configuration management system.

```typescript
class SharedConfigManager {
  constructor(projectPath?: string);
}
```

#### Methods

##### `loadConfig()`

```typescript
async loadConfig(): Promise<SharedProjectConfig>
```

**Returns**: Complete project configuration object.

**Example**:
```typescript
const configManager = new SharedConfigManager('./my-project');
const config = await configManager.loadConfig();
console.log('Project name:', config.name);
console.log('UI platform:', config.ui.platform);
```

##### `saveConfig()`

```typescript
async saveConfig(): Promise<void>
```

**Description**: Saves current configuration to file.

##### `updateConfig()`

```typescript
async updateConfig(updates: Partial<SharedProjectConfig>): Promise<void>
```

**Example**:
```typescript
await configManager.updateConfig({
  ui: {
    theme: 'healthcare',
    compliance: ['hipaa', 'wcag-aaa']
  }
});
```

##### `enableXaheenIntegration()`

```typescript
async enableXaheenIntegration(config: XaheenIntegrationConfig): Promise<void>
```

**Parameters**:
```typescript
interface XaheenIntegrationConfig {
  version: string;
  features: string[];
  autoSync?: boolean;
}
```

**Example**:
```typescript
await configManager.enableXaheenIntegration({
  version: '1.0.0',
  features: ['auth', 'dashboard', 'api'],
  autoSync: true
});
```

##### `isXaheenIntegrated()`

```typescript
isXaheenIntegrated(): boolean
```

**Returns**: Boolean indicating if Xaheen integration is enabled.

##### `exportForTool()`

```typescript
async exportForTool(tool: 'xaheen' | 'storybook' | 'figma'): Promise<Record<string, any>>
```

**Description**: Exports configuration optimized for specific tools.

**Example**:
```typescript
const storybookConfig = await configManager.exportForTool('storybook');
console.log('Storybook configuration:', storybookConfig);
```

##### `validateConfig()`

```typescript
async validateConfig(): Promise<ValidationResult>
```

**Returns**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}
```

**Example**:
```typescript
const validation = await configManager.validateConfig();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

---

### DependencyManager Class

**Description**: Cross-CLI dependency management and compatibility checking.

```typescript
class DependencyManager {
  constructor(projectPath?: string);
}
```

#### Methods

##### `checkDependencies()`

```typescript
async checkDependencies(): Promise<DependencyReport>
```

**Returns**:
```typescript
interface DependencyReport {
  compatible: boolean;
  dependencies: DependencyInfo[];
  recommendations: string[];
}

interface DependencyInfo {
  name: string;
  version: string;
  required: boolean;
  compatible: boolean;
  minimumVersion: string;
  installedVersion?: string;
  installCommand: string;
  checkCommand: string;
}
```

**Example**:
```typescript
const depManager = new DependencyManager('./my-project');
const report = await depManager.checkDependencies();

console.log('Overall compatibility:', report.compatible);
report.dependencies.forEach(dep => {
  console.log(`${dep.name}: ${dep.compatible ? '✅' : '❌'} ${dep.version}`);
});

if (report.recommendations.length > 0) {
  console.log('Recommendations:');
  report.recommendations.forEach(rec => console.log(`- ${rec}`));
}
```

##### `installMissingDependencies()`

```typescript
async installMissingDependencies(
  dependencies: DependencyInfo[]
): Promise<InstallationResult>
```

**Returns**:
```typescript
interface InstallationResult {
  success: boolean;
  installed: string[];
  failed: string[];
}
```

**Example**:
```typescript
const { dependencies } = await depManager.checkDependencies();
const missingDeps = dependencies.filter(dep => !dep.compatible && dep.required);

if (missingDeps.length > 0) {
  const result = await depManager.installMissingDependencies(missingDeps);
  console.log('Installed:', result.installed);
  if (result.failed.length > 0) {
    console.error('Failed to install:', result.failed);
  }
}
```

##### `checkXaheenCompatibility()`

```typescript
async checkXaheenCompatibility(
  xaheenVersion: string,
  xalaVersion: string
): Promise<CompatibilityResult>
```

**Returns**:
```typescript
interface CompatibilityResult {
  compatible: boolean;
  recommendations: string[];
}
```

**Example**:
```typescript
const compatibility = await depManager.checkXaheenCompatibility('1.0.0', '1.2.0');
if (!compatibility.compatible) {
  console.warn('Version compatibility issues:');
  compatibility.recommendations.forEach(rec => console.log(`- ${rec}`));
}
```

##### `generateDependencyReport()`

```typescript
async generateDependencyReport(): Promise<string>
```

**Returns**: Markdown-formatted dependency report.

**Example**:
```typescript
const report = await depManager.generateDependencyReport();
await fs.writeFile('dependency-report.md', report);
```

##### `autoFixDependencies()`

```typescript
async autoFixDependencies(): Promise<AutoFixResult>
```

**Returns**:
```typescript
interface AutoFixResult {
  success: boolean;
  fixes: string[];
  errors: string[];
}
```

**Example**:
```typescript
const result = await depManager.autoFixDependencies();
console.log('Applied fixes:', result.fixes);
if (result.errors.length > 0) {
  console.error('Errors during auto-fix:', result.errors);
}
```

---

## Type Definitions

### Core Configuration Types

```typescript
interface SharedProjectConfig {
  name: string;
  version: string;
  type: 'standalone' | 'xaheen-integrated' | 'custom';
  ui: UIConfig;
  integrations: IntegrationConfig;
  development: DevelopmentConfig;
  build: BuildConfig;
  compliance: ComplianceConfig;
}

interface UIConfig {
  system: 'xala';
  version: string;
  theme: string;
  platform: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'angular';
  compliance: string[];
  customizations: Record<string, any>;
}

interface IntegrationConfig {
  xaheen?: XaheenIntegrationConfig;
  storybook?: StorybookIntegrationConfig;
  figma?: FigmaIntegrationConfig;
}

interface XaheenIntegrationConfig {
  enabled: boolean;
  version: string;
  features: string[];
  autoSync: boolean;
  hooks: {
    preBuild?: string;
    postGenerate?: string;
    preDeployment?: string;
  };
}

interface DevelopmentConfig {
  hotReload: boolean;
  linting: boolean;
  testing: boolean;
  accessibility: boolean;
}

interface BuildConfig {
  outputDir: string;
  optimization: boolean;
  bundleAnalysis: boolean;
  sourceMap: boolean;
}

interface ComplianceConfig {
  norwegian: boolean;
  gdpr: boolean;
  wcag: 'A' | 'AA' | 'AAA';
  security: {
    csp: boolean;
    sanitization: boolean;
    audit: boolean;
  };
}
```

### Migration Types

```typescript
interface MigrationAnalysis {
  file: string;
  overallScore: number;
  complexity: 'simple' | 'moderate' | 'complex';
  issues: MigrationIssue[];
  recommendations: MigrationRecommendation[];
  estimatedTime: string;
}

interface MigrationIssue {
  category: 'architecture' | 'styling' | 'typescript' | 'accessibility' | 'performance';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  documentation?: string;
}

interface MigrationRecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  description: string;
  effort: 'easy' | 'moderate' | 'complex';
  automatable: boolean;
}
```

### Validation Types

```typescript
interface ComponentCheck {
  file: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'requires-migration';
  checks: CheckResult[];
  quickFixes: QuickFix[];
  estimatedTime: string;
}

interface CheckResult {
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  documentation?: string;
}

interface QuickFix {
  description: string;
  command: string;
  autoApply: boolean;
}
```

### AI Generation Types

```typescript
interface AIGenerationOptions {
  prompt: string;
  platform: string;
  theme?: string;
  modelSize?: '7b' | '13b' | '70b+' | 'auto';
  complexity?: 'simple' | 'moderate' | 'complex' | 'auto';
  outputDir?: string;
  format?: 'typescript' | 'javascript';
  compliance?: string[];
}

interface AIGenerationResult {
  success: boolean;
  generatedFiles: string[];
  prompt: string;
  modelUsed: string;
  tokensUsed: number;
  processingTime: number;
  errors: string[];
  warnings?: string[];
}
```

---

## Error Handling

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | SUCCESS | Operation completed successfully |
| 1 | GENERAL_ERROR | General error occurred |
| 2 | INVALID_CONFIG | Configuration validation failed |
| 3 | DEPENDENCY_ERROR | Dependency resolution failed |
| 4 | COMPATIBILITY_ERROR | Platform/version compatibility issue |
| 5 | FILE_NOT_FOUND | Required file not found |
| 6 | PERMISSION_ERROR | Insufficient permissions |
| 7 | NETWORK_ERROR | Network operation failed |
| 8 | VALIDATION_ERROR | Component validation failed |
| 9 | MIGRATION_ERROR | Migration operation failed |
| 10 | INTEGRATION_ERROR | Xaheen integration failed |

### Error Classes

```typescript
class XalaError extends Error {
  code: number;
  details?: Record<string, any>;
  
  constructor(message: string, code: number, details?: Record<string, any>) {
    super(message);
    this.name = 'XalaError';
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends XalaError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 8, details);
    this.name = 'ValidationError';
  }
}

class MigrationError extends XalaError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 9, details);
    this.name = 'MigrationError';
  }
}

class IntegrationError extends XalaError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 10, details);
    this.name = 'IntegrationError';
  }
}
```

### Error Handling Examples

```typescript
try {
  await XalaProgrammaticAPI.generateComponents(['Button'], {
    platform: 'react',
    theme: 'enterprise'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
    console.error('Details:', error.details);
  } else if (error instanceof XalaError) {
    console.error(`Error ${error.code}: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Event System

### Event Types

```typescript
type EventType = 
  | 'config:loaded'
  | 'config:updated'
  | 'component:generated'
  | 'component:validated'
  | 'migration:started'
  | 'migration:completed'
  | 'integration:initialized'
  | 'dependency:installed'
  | 'error:occurred';

interface EventData {
  type: EventType;
  timestamp: number;
  data: Record<string, any>;
}
```

### Event Listeners

```typescript
import { EventEmitter } from 'events';

class XalaEventEmitter extends EventEmitter {
  onConfigLoaded(callback: (config: SharedProjectConfig) => void): void {
    this.on('config:loaded', callback);
  }
  
  onComponentGenerated(callback: (result: GenerationResult) => void): void {
    this.on('component:generated', callback);
  }
  
  onError(callback: (error: XalaError) => void): void {
    this.on('error:occurred', callback);
  }
}

// Usage
const events = new XalaEventEmitter();

events.onComponentGenerated((result) => {
  console.log('Component generated:', result.generatedFiles);
});

events.onError((error) => {
  console.error('CLI Error:', error.message);
});
```

---

This comprehensive API reference provides complete documentation for both CLI and programmatic interfaces, including all type definitions, error handling, and usage examples.