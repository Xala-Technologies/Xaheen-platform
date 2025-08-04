/**
 * Zod Validation Schemas for Component Specifications
 * Runtime validation with Norwegian compliance and type safety
 * Strict schema validation with comprehensive error reporting
 */

import { z } from 'zod';
import type {
  NSMClassification,
  ComponentStability,
  ComponentCategory,
  SemanticVersion,
  SupportedPlatform,
  PrimitiveType,
  ComplexType,
  CustomType,
  ValidationRuleType
} from '../types/specification-types.js';

// ===== NORWEGIAN COMPLIANCE SCHEMAS =====

/**
 * NSM Classification levels
 */
export const NSMClassificationSchema = z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'], {
  errorMap: (issue, ctx) => ({
    message: `Invalid NSM classification. Must be one of: OPEN, RESTRICTED, CONFIDENTIAL, SECRET. Got: ${ctx.data}`
  })
}) satisfies z.ZodSchema<NSMClassification>;

/**
 * Norwegian design system compliance
 */
export const NorwegianDesignSystemSchema = z.object({
  altinnCompliant: z.boolean().optional(),
  governmentApproved: z.boolean().optional()
});

/**
 * Norwegian compliance metadata
 */
export const NorwegianComplianceSchema = z.object({
  nsmClassification: NSMClassificationSchema.default('OPEN'),
  gdprCompliant: z.boolean().default(true),
  designSystem: NorwegianDesignSystemSchema.optional(),
  auditTrail: z.boolean().optional()
});

/**
 * Norwegian i18n support
 */
export const NorwegianI18nSchema = z.object({
  supported: z.boolean(),
  defaultLocale: z.enum(['nb-NO', 'nn-NO', 'en-US']).default('nb-NO'),
  supportedLocales: z.array(z.string().regex(/^[a-z]{2}-[A-Z]{2}$/)).default(['nb-NO', 'en-US', 'fr-FR', 'ar-SA']),
  textDirection: z.array(z.enum(['ltr', 'rtl'])).default(['ltr', 'rtl'])
});

// ===== COMPONENT METADATA SCHEMAS =====

/**
 * Component stability levels
 */
export const ComponentStabilitySchema = z.enum(['experimental', 'beta', 'stable', 'deprecated'], {
  errorMap: (issue, ctx) => ({
    message: `Invalid stability level. Must be one of: experimental, beta, stable, deprecated. Got: ${ctx.data}`
  })
}) satisfies z.ZodSchema<ComponentStability>;

/**
 * Component categories
 */
export const ComponentCategorySchema = z.enum([
  'basic', 'composite', 'layout', 'navigation', 'feedback', 
  'overlay', 'form', 'data-display', 'specialized'
], {
  errorMap: (issue, ctx) => ({
    message: `Invalid component category. Got: ${ctx.data}`
  })
}) satisfies z.ZodSchema<ComponentCategory>;

/**
 * Semantic version
 */
export const SemanticVersionSchema = z.enum(['v5.0', 'v5.1', 'v5.2'], {
  errorMap: (issue, ctx) => ({
    message: `Invalid semantic version. Must be one of: v5.0, v5.1, v5.2. Got: ${ctx.data}`
  })
}) satisfies z.ZodSchema<SemanticVersion>;

/**
 * Component maintainer
 */
export const ComponentMaintainerSchema = z.object({
  name: z.string().min(1, 'Maintainer name is required'),
  email: z.string().email('Invalid email format'),
  team: z.string().optional()
});

/**
 * Component metadata
 */
export const ComponentMetadataSchema = z.object({
  name: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/, 'Component name must be PascalCase'),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/, 'Invalid semantic version format'),
  semanticVersion: SemanticVersionSchema,
  category: ComponentCategorySchema,
  subcategory: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  keywords: z.array(z.string()).optional(),
  maintainer: ComponentMaintainerSchema.optional(),
  stability: ComponentStabilitySchema.default('stable'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

// ===== TYPE DEFINITION SCHEMAS =====

/**
 * Primitive types
 */
export const PrimitiveTypeSchema = z.enum(['string', 'number', 'boolean', 'null', 'undefined']) satisfies z.ZodSchema<PrimitiveType>;

/**
 * Complex types
 */
export const ComplexTypeSchema = z.enum(['function', 'node', 'element', 'component', 'ref', 'date', 'file']) satisfies z.ZodSchema<ComplexType>;

/**
 * Custom types
 */
export const CustomTypeSchema = z.enum([
  'color', 'size', 'spacing', 'breakpoint', 'theme', 'variant', 'icon',
  'url', 'email', 'phone', 'currency', 'percentage', 'duration',
  'cssClass', 'cssProperty', 'keyboardKey', 'locale', 'timezone'
]) satisfies z.ZodSchema<CustomType>;

/**
 * String constraints
 */
export const StringConstraintsSchema = z.object({
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(0).optional(),
  pattern: z.string().optional(),
  format: z.enum(['email', 'uri', 'uuid', 'date', 'time', 'datetime', 'hostname', 'ipv4', 'ipv6']).optional(),
  enum: z.array(z.string()).optional()
}).refine(data => {
  if (data.minLength !== undefined && data.maxLength !== undefined) {
    return data.minLength <= data.maxLength;
  }
  return true;
}, {
  message: 'minLength must be less than or equal to maxLength'
});

/**
 * Number constraints
 */
export const NumberConstraintsSchema = z.object({
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  exclusiveMinimum: z.number().optional(),
  exclusiveMaximum: z.number().optional(),
  multipleOf: z.number().positive().optional(),
  integer: z.boolean().optional(),
  positive: z.boolean().optional(),
  enum: z.array(z.number()).optional()
}).refine(data => {
  if (data.minimum !== undefined && data.maximum !== undefined) {
    return data.minimum <= data.maximum;
  }
  return true;
}, {
  message: 'minimum must be less than or equal to maximum'
});

/**
 * Function signature
 */
export const FunctionSignatureSchema = z.object({
  parameters: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    required: z.boolean()
  })),
  returnType: z.string().min(1)
});

/**
 * Element constraints
 */
export const ElementConstraintsSchema = z.object({
  allowedElements: z.array(z.string()).optional(),
  forbiddenElements: z.array(z.string()).optional()
});

/**
 * Primitive type definition
 */
export const PrimitiveTypeDefinitionSchema = z.object({
  primitive: PrimitiveTypeSchema,
  constraints: z.union([StringConstraintsSchema, NumberConstraintsSchema]).optional()
});

/**
 * Complex type definition
 */
export const ComplexTypeDefinitionSchema = z.object({
  complex: ComplexTypeSchema,
  signature: FunctionSignatureSchema.optional(),
  elementConstraints: ElementConstraintsSchema.optional()
});

/**
 * Custom type definition
 */
export const CustomTypeDefinitionSchema = z.object({
  custom: CustomTypeSchema,
  format: z.string().optional(),
  values: z.array(z.unknown()).optional(),
  pattern: z.string().optional()
});

/**
 * Union type definition (recursive)
 */
export const UnionTypeDefinitionSchema: z.ZodLazy<z.ZodType<any>> = z.lazy(() => z.object({
  union: z.array(z.union([
    PrimitiveTypeDefinitionSchema,
    ComplexTypeDefinitionSchema,
    CustomTypeDefinitionSchema
  ])).min(2, 'Union type must have at least 2 types'),
  discriminant: z.string().optional()
}));

/**
 * Array type definition (recursive)
 */
export const ArrayTypeDefinitionSchema: z.ZodLazy<z.ZodType<any>> = z.lazy(() => z.object({
  array: z.union([
    PrimitiveTypeDefinitionSchema,
    ComplexTypeDefinitionSchema,
    CustomTypeDefinitionSchema,
    ObjectTypeDefinitionSchema
  ]),
  constraints: z.object({
    minItems: z.number().min(0).optional(),
    maxItems: z.number().min(0).optional(),
    uniqueItems: z.boolean().optional()
  }).refine(data => {
    if (data.minItems !== undefined && data.maxItems !== undefined) {
      return data.minItems <= data.maxItems;
    }
    return true;
  }, {
    message: 'minItems must be less than or equal to maxItems'
  }).optional()
}));

/**
 * Object type definition (recursive)
 */
export const ObjectTypeDefinitionSchema: z.ZodLazy<z.ZodType<any>> = z.lazy(() => z.object({
  object: z.record(z.string(), PropDefinitionSchema),
  strict: z.boolean().default(true)
}));

/**
 * Main type definition union
 */
export const TypeDefinitionSchema = z.union([
  PrimitiveTypeDefinitionSchema,
  ComplexTypeDefinitionSchema,
  CustomTypeDefinitionSchema,
  UnionTypeDefinitionSchema,
  ArrayTypeDefinitionSchema,
  ObjectTypeDefinitionSchema
]);

// ===== VALIDATION SCHEMAS =====

/**
 * Validation rule types
 */
export const ValidationRuleTypeSchema = z.enum([
  'required', 'minLength', 'maxLength', 'pattern', 'email', 'url',
  'min', 'max', 'integer', 'positive', 'custom'
]) satisfies z.ZodSchema<ValidationRuleType>;

/**
 * Validation rule
 */
export const ValidationRuleSchema = z.object({
  type: ValidationRuleTypeSchema,
  value: z.unknown().optional(),
  message: z.string().optional(),
  severity: z.enum(['error', 'warning']).default('error'),
  customValidator: z.string().optional()
});

/**
 * Dependency validation
 */
export const DependencyValidationSchema = z.object({
  prop: z.string().min(1),
  condition: z.string().min(1),
  rules: z.array(z.string())
});

/**
 * Cross validation
 */
export const CrossValidationSchema = z.object({
  props: z.array(z.string().min(1)).min(2, 'Cross validation requires at least 2 props'),
  validator: z.string().min(1),
  message: z.string().optional()
});

/**
 * Validation rules
 */
export const ValidationRulesSchema = z.object({
  rules: z.array(ValidationRuleSchema).optional(),
  dependencies: z.array(DependencyValidationSchema).optional(),
  crossValidation: z.array(CrossValidationSchema).optional()
});

// ===== PLATFORM SCHEMAS =====

/**
 * Supported platforms
 */
export const SupportedPlatformSchema = z.enum(['react', 'vue', 'angular', 'svelte', 'solid', 'web-components']) satisfies z.ZodSchema<SupportedPlatform>;

/**
 * Platform prop configuration
 */
export const PlatformPropConfigSchema = z.object({
  type: z.string().optional(),
  defaultValue: z.unknown().optional(),
  binding: z.string().optional(),
  transformer: z.string().optional()
});

/**
 * Platform configurations
 */
export const PlatformConfigsSchema = z.record(SupportedPlatformSchema, PlatformPropConfigSchema);

// ===== ACCESSIBILITY SCHEMAS =====

/**
 * Accessibility metadata
 */
export const AccessibilityMetadataSchema = z.object({
  ariaAttribute: z.string().optional(),
  screenReaderText: z.string().optional(),
  keyboardInteraction: z.boolean().optional()
});

/**
 * I18n metadata
 */
export const I18nMetadataSchema = z.object({
  translatable: z.boolean().optional(),
  key: z.string().optional(),
  context: z.string().optional()
});

/**
 * Prop example
 */
export const PropExampleSchema = z.object({
  value: z.unknown(),
  description: z.string().optional(),
  context: z.string().optional()
});

/**
 * Prop deprecation
 */
export const PropDeprecationSchema = z.object({
  since: z.string().min(1),
  reason: z.string().min(1),
  alternative: z.string().min(1)
});

/**
 * Prop definition (recursive reference)
 */
export const PropDefinitionSchema: z.ZodLazy<z.ZodType<any>> = z.lazy(() => z.object({
  type: TypeDefinitionSchema,
  description: z.string().min(5, 'Description must be at least 5 characters'),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  deprecated: PropDeprecationSchema.optional(),
  validation: ValidationRulesSchema.optional(),
  platforms: PlatformConfigsSchema.optional(),
  examples: z.array(PropExampleSchema).optional(),
  accessibility: AccessibilityMetadataSchema.optional(),
  i18n: I18nMetadataSchema.optional()
}));

// ===== COMPOSITION SCHEMAS =====

/**
 * Children composition
 */
export const ChildrenCompositionSchema = z.object({
  supported: z.boolean(),
  types: z.array(z.enum(['string', 'number', 'element', 'node', 'function'])).optional(),
  constraints: z.object({
    maxChildren: z.number().min(0).optional(),
    allowedComponents: z.array(z.string()).optional()
  }).optional()
});

/**
 * Slot definition
 */
export const SlotDefinitionSchema = z.object({
  required: z.boolean(),
  types: z.array(z.string()),
  description: z.string().min(1)
});

/**
 * Component composition
 */
export const ComponentCompositionSchema = z.object({
  children: ChildrenCompositionSchema.optional(),
  slots: z.record(z.string(), SlotDefinitionSchema).optional()
});

/**
 * Prop groups
 */
export const PropGroupsSchema = z.object({
  required: z.array(z.string()),
  optional: z.array(z.string()),
  deprecated: z.array(z.object({
    name: z.string().min(1),
    reason: z.string().min(1),
    alternative: z.string().min(1)
  }))
});

/**
 * Props specification
 */
export const PropsSpecificationSchema = z.object({
  schema: z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'Property name must be camelCase'), PropDefinitionSchema),
  groups: PropGroupsSchema,
  composition: ComponentCompositionSchema.optional()
});

// ===== VARIANT SCHEMAS =====

/**
 * Simple variant
 */
export const SimpleVariantSchema = z.object({
  values: z.record(z.string(), z.string()),
  defaultValue: z.string().min(1)
});

/**
 * Compound variant condition
 */
export const CompoundVariantConditionSchema = z.object({
  conditions: z.record(z.string(), z.unknown()),
  className: z.string().min(1),
  description: z.string().optional()
});

/**
 * Variant definitions
 */
export const VariantDefinitionsSchema = z.object({
  simple: z.record(z.string(), SimpleVariantSchema).optional(),
  compound: z.array(CompoundVariantConditionSchema).optional()
});

// ===== ACCESSIBILITY SPECIFICATION SCHEMAS =====

/**
 * ARIA role configuration
 */
export const AriaRoleConfigSchema = z.object({
  primary: z.string().min(1),
  additional: z.array(z.string()).optional()
});

/**
 * Keyboard pattern
 */
export const KeyboardPatternSchema = z.object({
  key: z.string().min(1),
  action: z.string().min(1),
  context: z.string().optional()
});

/**
 * Focus management
 */
export const FocusManagementSchema = z.object({
  trapFocus: z.boolean().optional(),
  restoreFocus: z.boolean().optional(),
  skipLinks: z.boolean().optional()
});

/**
 * Keyboard navigation
 */
export const KeyboardNavigationSchema = z.object({
  supported: z.boolean(),
  patterns: z.array(KeyboardPatternSchema),
  focusManagement: FocusManagementSchema.optional()
});

/**
 * Screen reader announcement
 */
export const ScreenReaderAnnouncementSchema = z.object({
  trigger: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(['polite', 'assertive'])
});

/**
 * Screen reader labels
 */
export const ScreenReaderLabelsSchema = z.object({
  required: z.array(z.string()),
  descriptions: z.record(z.string(), z.string()).optional()
});

/**
 * Screen reader configuration
 */
export const ScreenReaderConfigSchema = z.object({
  announcements: z.array(ScreenReaderAnnouncementSchema),
  labels: ScreenReaderLabelsSchema
});

/**
 * Accessibility testing
 */
export const AccessibilityTestingSchema = z.object({
  automated: z.array(z.string()).optional(),
  manual: z.array(z.string()).optional()
});

/**
 * Accessibility specification
 */
export const AccessibilitySpecificationSchema = z.object({
  role: AriaRoleConfigSchema,
  keyboardNavigation: KeyboardNavigationSchema,
  screenReader: ScreenReaderConfigSchema,
  testing: AccessibilityTestingSchema.optional()
});

// ===== COMPLIANCE SPECIFICATION SCHEMAS =====

/**
 * Semantic compliance
 */
export const SemanticComplianceSchema = z.object({
  htmlElements: z.array(z.string()),
  ariaRoles: z.array(z.string()),
  landmarks: z.boolean(),
  headingStructure: z.boolean().optional()
});

/**
 * WCAG compliance
 */
export const WCAGComplianceSchema = z.object({
  level: z.enum(['A', 'AA', 'AAA']).default('AAA'),
  tested: z.boolean(),
  guidelines: z.array(z.string()),
  colorContrast: z.object({
    normal: z.number().min(4.5).optional(),
    large: z.number().min(3.0).optional(),
    enhanced: z.number().min(7.0).optional()
  }).optional()
});

/**
 * SSR compliance
 */
export const SSRComplianceSchema = z.object({
  supported: z.boolean(),
  hydrationSafe: z.boolean(),
  staticGeneration: z.boolean().optional()
});

/**
 * Compliance specification
 */
export const ComplianceSpecificationSchema = z.object({
  i18n: NorwegianI18nSchema,
  semantic: SemanticComplianceSchema,
  wcag: WCAGComplianceSchema,
  ssr: SSRComplianceSchema,
  norwegian: NorwegianComplianceSchema
});

// ===== PLATFORM SUPPORT SCHEMAS =====

/**
 * Code example
 */
export const CodeExampleSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  description: z.string().optional()
});

/**
 * Platform implementation
 */
export const PlatformImplementationSchema = z.object({
  templatePath: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  imports: z.array(z.object({
    module: z.string().min(1),
    imports: z.array(z.string())
  })).optional(),
  examples: z.array(CodeExampleSchema).optional()
});

/**
 * Platform support
 */
export const PlatformSupportSchema = z.object({
  supported: z.array(SupportedPlatformSchema).min(1, 'At least one platform must be supported'),
  primary: SupportedPlatformSchema.optional(),
  implementations: z.record(SupportedPlatformSchema, PlatformImplementationSchema).optional()
});

// ===== EXAMPLE AND TESTING SCHEMAS =====

/**
 * Component example
 */
export const ComponentExampleSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['basic', 'advanced', 'playground', 'real-world']).optional(),
  code: z.record(SupportedPlatformSchema, z.string()),
  props: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional()
});

/**
 * Unit test configuration
 */
export const UnitTestConfigSchema = z.object({
  required: z.array(z.string()).optional(),
  coverage: z.object({
    minimum: z.number().min(0).max(100).default(95)
  }).optional()
});

/**
 * Integration test configuration
 */
export const IntegrationTestConfigSchema = z.object({
  scenarios: z.array(z.string()).optional()
});

/**
 * Visual test configuration
 */
export const VisualTestConfigSchema = z.object({
  regression: z.boolean().optional(),
  responsive: z.boolean().optional()
});

/**
 * Testing specification
 */
export const TestingSpecificationSchema = z.object({
  unit: UnitTestConfigSchema.optional(),
  integration: IntegrationTestConfigSchema.optional(),
  visual: VisualTestConfigSchema.optional()
});

// ===== AI AND PERFORMANCE SCHEMAS =====

/**
 * AI pattern
 */
export const AIPatternSchema = z.object({
  pattern: z.string().min(1),
  context: z.string().min(1),
  recommendation: z.string().min(1)
});

/**
 * AI anti-pattern
 */
export const AIAntiPatternSchema = z.object({
  pattern: z.string().min(1),
  reason: z.string().min(1),
  alternative: z.string().min(1)
});

/**
 * AI optimization
 */
export const AIOptimizationSchema = z.object({
  hints: z.array(z.string()).optional(),
  patterns: z.array(AIPatternSchema).optional(),
  antiPatterns: z.array(AIAntiPatternSchema).optional()
});

/**
 * AI generation
 */
export const AIGenerationSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).optional(),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
  estimatedTokens: z.number().min(0).optional()
});

/**
 * AI documentation
 */
export const AIDocumentationSchema = z.object({
  autoGenerate: z.boolean().optional(),
  templates: z.array(z.string()).optional()
});

/**
 * AI specification
 */
export const AISpecificationSchema = z.object({
  optimization: AIOptimizationSchema.optional(),
  generation: AIGenerationSchema.optional(),
  documentation: AIDocumentationSchema.optional()
});

/**
 * Performance metrics
 */
export const PerformanceMetricsSchema = z.object({
  bundleSize: z.object({
    max: z.string().optional(),
    gzipped: z.string().optional()
  }).optional(),
  renderTime: z.object({
    initial: z.string().optional(),
    update: z.string().optional()
  }).optional()
});

/**
 * Performance specification
 */
export const PerformanceSpecificationSchema = z.object({
  metrics: PerformanceMetricsSchema.optional(),
  optimizations: z.array(z.string()).optional()
});

// ===== MAIN COMPONENT SPECIFICATION SCHEMA =====

/**
 * Complete component specification schema
 */
export const ComponentSpecificationSchema = z.object({
  metadata: ComponentMetadataSchema,
  compliance: ComplianceSpecificationSchema,
  props: PropsSpecificationSchema,
  variants: VariantDefinitionsSchema.optional(),
  accessibility: AccessibilitySpecificationSchema,
  platforms: PlatformSupportSchema,
  examples: z.array(ComponentExampleSchema).optional(),
  ai: AISpecificationSchema.optional(),
  testing: TestingSpecificationSchema.optional(),
  performance: PerformanceSpecificationSchema.optional()
}).refine(data => {
  // Cross-validation: ensure required props exist in schema
  const requiredProps = data.props.groups.required;
  const schemaKeys = Object.keys(data.props.schema);
  const missingProps = requiredProps.filter(prop => !schemaKeys.includes(prop));
  
  if (missingProps.length > 0) {
    throw new Error(`Required props not found in schema: ${missingProps.join(', ')}`);
  }
  
  return true;
}, {
  message: 'Props schema validation failed'
}).refine(data => {
  // Cross-validation: ensure optional props exist in schema
  const optionalProps = data.props.groups.optional;
  const schemaKeys = Object.keys(data.props.schema);
  const missingProps = optionalProps.filter(prop => !schemaKeys.includes(prop));
  
  if (missingProps.length > 0) {
    throw new Error(`Optional props not found in schema: ${missingProps.join(', ')}`);
  }
  
  return true;
}, {
  message: 'Props schema validation failed'
}).refine(data => {
  // Cross-validation: ensure primary platform is in supported list
  if (data.platforms.primary && !data.platforms.supported.includes(data.platforms.primary)) {
    throw new Error(`Primary platform '${data.platforms.primary}' must be in supported platforms list`);
  }
  
  return true;
}, {
  message: 'Platform configuration validation failed'
});

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate component specification with detailed error reporting
 */
export const validateComponentSpecification = (data: unknown): { 
  success: boolean; 
  data?: any; 
  errors?: string[];
} => {
  try {
    const result = ComponentSpecificationSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: [String(error)] };
  }
};

/**
 * Validate Norwegian compliance specifically
 */
export const validateNorwegianCompliance = (data: unknown): {
  success: boolean;
  data?: any;
  errors?: string[];
  nsmLevel?: NSMClassification;
} => {
  try {
    const result = NorwegianComplianceSchema.parse(data);
    return { 
      success: true, 
      data: result,
      nsmLevel: result.nsmClassification 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `Norwegian compliance error - ${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: [String(error)] };
  }
};

/**
 * Validate prop definition with type checking
 */
export const validatePropDefinition = (propName: string, data: unknown): {
  success: boolean;
  data?: any;
  errors?: string[];
  typeInfo?: string;
} => {
  try {
    const result = PropDefinitionSchema.parse(data);
    return { 
      success: true, 
      data: result,
      typeInfo: JSON.stringify(result.type)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `Prop '${propName}' error - ${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: [String(error)] };
  }
};

/**
 * Export all schemas for external use
 */
export const Schemas = {
  ComponentSpecification: ComponentSpecificationSchema,
  ComponentMetadata: ComponentMetadataSchema,
  PropDefinition: PropDefinitionSchema,
  TypeDefinition: TypeDefinitionSchema,
  NorwegianCompliance: NorwegianComplianceSchema,
  AccessibilitySpecification: AccessibilitySpecificationSchema,
  PlatformSupport: PlatformSupportSchema,
  ValidationRules: ValidationRulesSchema
} as const;

/**
 * Type inference helpers
 */
export type InferredComponentSpecification = z.infer<typeof ComponentSpecificationSchema>;
export type InferredPropDefinition = z.infer<typeof PropDefinitionSchema>;
export type InferredNorwegianCompliance = z.infer<typeof NorwegianComplianceSchema>;
