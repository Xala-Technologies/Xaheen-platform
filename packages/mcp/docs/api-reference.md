# MCP Server - API Reference

## 🔧 Complete MCP Tools Reference

The Xala UI System MCP Server provides comprehensive tools for AI-assisted development with the Universal Design System v5.0.

## 📋 Available Tools

### 1. get_component_specification

Get detailed component specifications with AI recommendations.

**Parameters:**
```typescript
interface GetComponentSpecParams {
  componentName: string;           // Component name (e.g., 'Button', 'Card')
  includeExamples?: boolean;       // Include usage examples (default: true)
  includeAITips?: boolean;         // Include AI-specific recommendations (default: true)
  includeAccessibility?: boolean;  // Include accessibility info (default: true)
  platform?: string;              // Target platform (default: 'universal')
}
```

**Returns:**
```typescript
interface ComponentSpecification {
  name: string;
  category: string;
  description: string;
  props: ComponentProp[];
  variants: ComponentVariant[];
  examples: CodeExample[];
  aiTips: AIRecommendation[];
  accessibility: AccessibilityInfo;
  performance: PerformanceInfo;
  compliance: ComplianceInfo;
}
```

**Example:**
```typescript
const buttonSpec = await mcp.call('get_component_specification', {
  componentName: 'Button',
  includeExamples: true,
  includeAITips: true
});

// Returns complete Button specification with variants, props, and AI tips
console.log(buttonSpec.variants); // ['primary', 'secondary', 'outline', 'ghost']
console.log(buttonSpec.aiTips);   // AI recommendations for optimal usage
```

### 2. generate_platform_code

Generate platform-specific component code with best practices.

**Parameters:**
```typescript
interface GeneratePlatformCodeParams {
  componentName: string;           // Component to generate
  platform: string;               // Target platform ('react', 'vue', 'angular', etc.)
  props?: Record<string, any>;     // Component props and values
  includeTypes?: boolean;          // Include TypeScript types (default: true)
  includeImports?: boolean;        // Include import statements (default: true)
  includeStyles?: boolean;         // Include styling (default: true)
  accessibility?: AccessibilityLevel; // Accessibility level
  compliance?: ComplianceOptions;  // Norwegian compliance options
}
```

**Returns:**
```typescript
interface GeneratedCode {
  code: string;                    // Generated component code
  imports: string[];               // Required import statements
  types: string;                   // TypeScript type definitions
  styles: string;                  // Styling information
  examples: string[];              // Usage examples
  metadata: CodeMetadata;          // Generation metadata
}
```

**Example:**
```typescript
const reactButton = await mcp.call('generate_platform_code', {
  componentName: 'Button',
  platform: 'react',
  props: {
    variant: 'primary',
    size: 'lg',
    children: 'Get Started',
    onClick: 'handleClick'
  },
  includeTypes: true,
  accessibility: 'WCAG_2_2_AAA'
});

console.log(reactButton.code);     // Generated React component
console.log(reactButton.imports);  // ['import { Button } from "@xala-technologies/ui-system"']
console.log(reactButton.types);    // TypeScript interfaces
```

### 3. get_layout_patterns

Retrieve intelligent layout patterns for common use cases.

**Parameters:**
```typescript
interface GetLayoutPatternsParams {
  pattern: string;                 // Pattern name ('dashboard', 'form', 'landing', etc.)
  platform: string;               // Target platform
  responsive?: boolean;            // Include responsive behavior (default: true)
  components?: string[];           // Specific components to include
  complexity?: 'simple' | 'medium' | 'complex'; // Pattern complexity
  accessibility?: AccessibilityLevel;
  compliance?: ComplianceOptions;
}
```

**Returns:**
```typescript
interface LayoutPattern {
  name: string;
  description: string;
  structure: string;               // Layout structure markup
  components: ComponentUsage[];    // Components used in pattern
  responsive: ResponsiveInfo;      // Responsive behavior
  accessibility: AccessibilityInfo;
  examples: CodeExample[];
  aiTags: string[];               // AI recognition tags
}
```

**Example:**
```typescript
const dashboardPattern = await mcp.call('get_layout_patterns', {
  pattern: 'dashboard',
  platform: 'react',
  responsive: true,
  components: ['Container', 'Stack', 'Card', 'Button', 'DataTable'],
  complexity: 'medium'
});

console.log(dashboardPattern.structure); // Complete dashboard layout
console.log(dashboardPattern.components); // Component usage details
```

### 4. transform_design_tokens

Transform design tokens to platform-specific formats.

**Parameters:**
```typescript
interface TransformDesignTokensParams {
  targetFormat: string;            // Target format ('css', 'js', 'scss', 'json', etc.)
  includeUtilities?: boolean;      // Include utility classes (default: true)
  minify?: boolean;               // Minify output (default: false)
  theme?: string;                 // Specific theme ('light', 'dark', 'high-contrast')
  platform?: string;             // Target platform for optimization
  customizations?: Record<string, any>; // Custom token overrides
}
```

**Returns:**
```typescript
interface TransformedTokens {
  format: string;                  // Output format
  content: string;                 // Transformed token content
  utilities: string;               // Utility classes (if requested)
  metadata: TokenMetadata;         // Transformation metadata
  imports: string[];               // Required imports
}
```

**Example:**
```typescript
const cssTokens = await mcp.call('transform_design_tokens', {
  targetFormat: 'css-custom-properties',
  includeUtilities: true,
  theme: 'light',
  minify: false
});

console.log(cssTokens.content);    // CSS custom properties
console.log(cssTokens.utilities);  // Utility classes
```

### 5. get_ai_recommendations

Get AI-optimized recommendations for component usage and patterns.

**Parameters:**
```typescript
interface GetAIRecommendationsParams {
  useCase: string;                 // Use case description or type
  platform: string;               // Target platform
  complexity?: 'simple' | 'medium' | 'complex';
  context?: string;                // Additional context
  constraints?: string[];          // Design or technical constraints
  accessibility?: AccessibilityLevel;
  performance?: PerformanceLevel;
}
```

**Returns:**
```typescript
interface AIRecommendations {
  components: string[];            // Recommended components
  layoutPattern: string;           // Recommended layout pattern
  props: Record<string, any>;      // Optimal prop configurations
  alternatives: Alternative[];     // Alternative approaches
  bestPractices: string[];        // Best practice recommendations
  warnings: string[];             // Potential issues to avoid
  optimizations: Optimization[];   // Performance optimizations
}
```

**Example:**
```typescript
const recommendations = await mcp.call('get_ai_recommendations', {
  useCase: 'admin dashboard with user management',
  platform: 'react',
  complexity: 'medium',
  accessibility: 'WCAG_2_2_AAA'
});

console.log(recommendations.components);    // ['Container', 'DataTable', 'Button', 'Modal']
console.log(recommendations.layoutPattern); // 'dashboard'
console.log(recommendations.bestPractices); // AI-generated best practices
```

### 6. validate_code

Comprehensive code validation for quality, accessibility, and compliance.

**Parameters:**
```typescript
interface ValidateCodeParams {
  code: string;                    // Code to validate
  platform: string;               // Target platform
  checks: ValidationCheck[];       // Validation checks to perform
  accessibility?: AccessibilityLevel;
  compliance?: ComplianceOptions;
  performance?: PerformanceLevel;
}

type ValidationCheck = 
  | 'accessibility' 
  | 'performance' 
  | 'responsive' 
  | 'semantics' 
  | 'token-usage' 
  | 'component-composition'
  | 'norwegian-compliance';
```

**Returns:**
```typescript
interface ValidationResult {
  score: number;                   // Overall quality score (0-100)
  passed: boolean;                 // Whether validation passed
  checks: CheckResult[];           // Individual check results
  warnings: ValidationWarning[];   // Non-critical issues
  errors: ValidationError[];       // Critical issues
  suggestions: string[];           // Improvement suggestions
  metrics: QualityMetrics;         // Performance and quality metrics
}
```

**Example:**
```typescript
const validation = await mcp.call('validate_code', {
  code: generatedReactComponent,
  platform: 'react',
  checks: ['accessibility', 'performance', 'token-usage'],
  accessibility: 'WCAG_2_2_AAA'
});

console.log(validation.score);        // 95
console.log(validation.passed);       // true
console.log(validation.suggestions);  // Improvement recommendations
```

### 7. migrate_code

Migrate code between platforms or design system versions.

**Parameters:**
```typescript
interface MigrateCodeParams {
  sourceCode: string;              // Source code to migrate
  sourcePlatform: string;          // Source platform
  targetPlatform: string;          // Target platform
  sourceVersion?: string;          // Source design system version
  targetVersion?: string;          // Target design system version
  preserveLogic?: boolean;         // Preserve business logic (default: true)
  updateSyntax?: boolean;          // Update syntax patterns (default: true)
}
```

**Returns:**
```typescript
interface MigrationResult {
  migratedCode: string;            // Migrated code
  changes: MigrationChange[];      // List of changes made
  warnings: string[];              // Migration warnings
  manualSteps: string[];           // Manual migration steps required
  compatibility: CompatibilityInfo; // Compatibility information
}
```

**Example:**
```typescript
const migrated = await mcp.call('migrate_code', {
  sourceCode: vueComponent,
  sourcePlatform: 'vue',
  targetPlatform: 'react',
  preserveLogic: true,
  updateSyntax: true
});

console.log(migrated.migratedCode); // Migrated React component
console.log(migrated.changes);      // List of transformations
```

### 8. get_accessibility_info

Get detailed accessibility information and validation.

**Parameters:**
```typescript
interface GetAccessibilityInfoParams {
  componentName?: string;          // Specific component
  code?: string;                   // Code to analyze
  level: AccessibilityLevel;       // Target accessibility level
  includeTests?: boolean;          // Include test recommendations
}

type AccessibilityLevel = 'WCAG_2_1_A' | 'WCAG_2_1_AA' | 'WCAG_2_1_AAA' | 'WCAG_2_2_AAA';
```

**Returns:**
```typescript
interface AccessibilityInfo {
  compliance: AccessibilityCompliance;
  requirements: AccessibilityRequirement[];
  tests: AccessibilityTest[];
  improvements: AccessibilityImprovement[];
  screenReaderSupport: ScreenReaderInfo;
  keyboardNavigation: KeyboardNavigationInfo;
  colorContrast: ColorContrastInfo;
}
```

### 9. get_performance_metrics

Get performance information and optimization recommendations.

**Parameters:**
```typescript
interface GetPerformanceMetricsParams {
  componentName?: string;          // Specific component
  code?: string;                   // Code to analyze
  platform: string;               // Target platform
  target: 'development' | 'production';
  includeOptimizations?: boolean;  // Include optimization suggestions
}
```

**Returns:**
```typescript
interface PerformanceMetrics {
  bundleSize: BundleSizeInfo;
  renderTime: RenderTimeInfo;
  memoryUsage: MemoryUsageInfo;
  optimizations: PerformanceOptimization[];
  recommendations: string[];
  score: number;                   // Performance score (0-100)
}
```

### 10. get_server_info

Get MCP server information and capabilities.

**Parameters:**
```typescript
interface GetServerInfoParams {
  includeTools?: boolean;          // Include available tools list
  includeVersion?: boolean;        // Include version information
  includeCapabilities?: boolean;   // Include server capabilities
}
```

**Returns:**
```typescript
interface ServerInfo {
  name: string;                    // Server name
  version: string;                 // Server version
  designSystemVersion: string;     // Design system version
  tools: ToolInfo[];              // Available tools
  capabilities: ServerCapability[];
  supportedPlatforms: string[];    // Supported platforms
  configuration: ServerConfiguration;
}
```

## 📊 Data Types & Interfaces

### Core Types

```typescript
interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
  examples: any[];
}

interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
  example: string;
}

interface CodeExample {
  title: string;
  description: string;
  code: string;
  platform: string;
  language: string;
}

interface AIRecommendation {
  type: 'best-practice' | 'optimization' | 'alternative' | 'warning';
  message: string;
  code?: string;
  reasoning: string;
}
```

### Compliance Types

```typescript
interface ComplianceOptions {
  norwegian?: NorwegianCompliance;
  gdpr?: GDPRCompliance;
  accessibility?: AccessibilityCompliance;
}

interface NorwegianCompliance {
  nsmClassification: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  auditTrail: boolean;
  dataRetention: string;
}

interface GDPRCompliance {
  gdprCompliant: boolean;
  consentManagement: boolean;
  dataSubjectRights: boolean;
  dataCategories: string[];
}
```

### Quality Types

```typescript
interface QualityMetrics {
  accessibility: number;           // Accessibility score (0-100)
  performance: number;            // Performance score (0-100)
  maintainability: number;        // Maintainability score (0-100)
  reliability: number;            // Reliability score (0-100)
  security: number;              // Security score (0-100)
}

interface ValidationWarning {
  type: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'low' | 'medium' | 'high';
}

interface ValidationError {
  type: string;
  message: string;
  line?: number;
  column?: number;
  fix?: string;
}
```

## 🔍 Advanced Usage Examples

### AI-Powered Dashboard Generation

```typescript
// Step 1: Get AI recommendations
const recommendations = await mcp.call('get_ai_recommendations', {
  useCase: 'analytics dashboard with charts and KPIs',
  platform: 'react',
  complexity: 'medium',
  accessibility: 'WCAG_2_2_AAA'
});

// Step 2: Generate layout pattern
const layout = await mcp.call('get_layout_patterns', {
  pattern: recommendations.layoutPattern,
  platform: 'react',
  components: recommendations.components,
  responsive: true
});

// Step 3: Generate individual components
const components = await Promise.all(
  recommendations.components.map(componentName =>
    mcp.call('generate_platform_code', {
      componentName,
      platform: 'react',
      props: recommendations.props[componentName],
      accessibility: 'WCAG_2_2_AAA'
    })
  )
);

// Step 4: Validate final code
const validation = await mcp.call('validate_code', {
  code: layout.structure,
  platform: 'react',
  checks: ['accessibility', 'performance', 'responsive']
});
```

### Norwegian Compliance Generation

```typescript
// Generate NSM-compliant data table
const secureTable = await mcp.call('generate_platform_code', {
  componentName: 'DataTable',
  platform: 'react',
  compliance: {
    norwegian: {
      nsmClassification: 'KONFIDENSIELT',
      auditTrail: true,
      dataRetention: '7-years'
    },
    gdpr: {
      gdprCompliant: true,
      consentManagement: true,
      dataSubjectRights: true
    }
  },
  accessibility: 'WCAG_2_2_AAA'
});
```

### Cross-Platform Migration

```typescript
// Migrate React component to Vue
const migratedComponent = await mcp.call('migrate_code', {
  sourceCode: reactComponentCode,
  sourcePlatform: 'react',
  targetPlatform: 'vue',
  preserveLogic: true,
  updateSyntax: true
});

// Validate migrated code
const validation = await mcp.call('validate_code', {
  code: migratedComponent.migratedCode,
  platform: 'vue',
  checks: ['accessibility', 'performance', 'component-composition']
});
```

## 🚨 Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `COMPONENT_NOT_FOUND` | Component doesn't exist | Check available components |
| `PLATFORM_NOT_SUPPORTED` | Platform not supported | Use supported platform |
| `INVALID_PROPS` | Invalid component props | Check component specification |
| `VALIDATION_FAILED` | Code validation failed | Fix validation errors |
| `COMPLIANCE_ERROR` | Compliance check failed | Address compliance issues |

### Error Response Format

```typescript
interface MCPError {
  code: string;
  message: string;
  details?: any;
  suggestions?: string[];
}
```

## 🔧 Configuration Options

### Server Environment Variables

All environment variables from the [Getting Started](./getting-started.md) guide apply to API behavior:

- `AI_OPTIMIZATION_LEVEL`: Affects AI recommendation quality
- `NORWEGIAN_COMPLIANCE`: Enables compliance features
- `ACCESSIBILITY_LEVEL`: Sets default accessibility target
- `PERFORMANCE_MODE`: Affects code generation optimization

---

*MCP Server API Reference v2.0 - Complete tool documentation*