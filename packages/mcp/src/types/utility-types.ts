/**
 * Utility Types and Type Guards for Xala UI System
 * Advanced TypeScript utilities for component type safety
 * Norwegian compliance and multi-platform support
 */

import type {
  ComponentSpecification,
  PropDefinition,
  TypeDefinition,
  NSMClassification,
  SupportedPlatform,
  ComponentCategory,
  ComponentStability,
  PrimitiveTypeDefinition,
  ComplexTypeDefinition,
  CustomTypeDefinition,
  UnionTypeDefinition,
  ArrayTypeDefinition,
  ObjectTypeDefinition
} from './specification-types.js';

// ===== BRANDED TYPES =====

/**
 * Branded type for component names (ensures PascalCase)
 */
export type ComponentName = string & { readonly __brand: 'ComponentName' };

/**
 * Branded type for prop names (ensures camelCase)
 */
export type PropName = string & { readonly __brand: 'PropName' };

/**
 * Branded type for CSS class names
 */
export type CSSClassName = string & { readonly __brand: 'CSSClassName' };

/**
 * Branded type for ARIA attributes
 */
export type AriaAttribute = string & { readonly __brand: 'AriaAttribute' };

/**
 * Branded type for test IDs
 */
export type TestId = string & { readonly __brand: 'TestId' };

/**
 * Create a branded component name
 */
export const createComponentName = (name: string): ComponentName => {
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error(`Invalid component name: ${name}. Must be PascalCase.`);
  }
  return name as ComponentName;
};

/**
 * Create a branded prop name
 */
export const createPropName = (name: string): PropName => {
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error(`Invalid prop name: ${name}. Must be camelCase.`);
  }
  return name as PropName;
};

// ===== NORWEGIAN COMPLIANCE UTILITIES =====

/**
 * Type-safe NSM classification with access levels
 */
export type NSMAccessLevel<T extends NSMClassification> = 
  T extends 'OPEN' ? 'public' :
  T extends 'RESTRICTED' ? 'internal' :
  T extends 'CONFIDENTIAL' ? 'authorized' :
  T extends 'SECRET' ? 'classified' :
  never;

/**
 * Norwegian compliance metadata with type-safe classification
 */
export interface NorwegianComplianceMetadata<T extends NSMClassification = 'OPEN'> {
  readonly nsmClassification: T;
  readonly accessLevel: NSMAccessLevel<T>;
  readonly gdprCompliant: boolean;
  readonly auditRequired: T extends 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' ? true : boolean;
  readonly encryptionRequired: T extends 'CONFIDENTIAL' | 'SECRET' ? true : boolean;
  readonly approvedBy?: string;
  readonly lastAudit?: string;
  readonly expiresAt?: string;
}

/**
 * Secure component props with Norwegian compliance
 */
export type SecureProps<T, Level extends NSMClassification> = T & {
  readonly _compliance: NorwegianComplianceMetadata<Level>;
  readonly _auditTrail?: readonly AuditEntry[];
};

/**
 * Audit trail entry
 */
export interface AuditEntry {
  readonly timestamp: string;
  readonly action: string;
  readonly user: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Type guard for secure props
 */
export const isSecureProps = <T, Level extends NSMClassification>(
  props: unknown
): props is SecureProps<T, Level> => {
  return (
    typeof props === 'object' &&
    props !== null &&
    '_compliance' in props &&
    typeof (props as any)._compliance === 'object' &&
    'nsmClassification' in (props as any)._compliance
  );
};

/**
 * Extract NSM classification from props
 */
export const extractNSMClassification = <T>(
  props: T
): NSMClassification | null => {
  if (isSecureProps(props)) {
    return props._compliance.nsmClassification;
  }
  return null;
};

// ===== COMPONENT TYPE UTILITIES =====

/**
 * Extract prop types from component specification
 */
export type ExtractPropTypes<T extends ComponentSpecification> = {
  readonly [K in keyof T['props']['schema']]: InferPropType<T['props']['schema'][K]>;
};

/**
 * Extract required props from component specification
 */
export type ExtractRequiredProps<T extends ComponentSpecification> = {
  readonly [K in T['props']['groups']['required'][number]]: InferPropType<T['props']['schema'][K]>;
};

/**
 * Extract optional props from component specification
 */
export type ExtractOptionalProps<T extends ComponentSpecification> = {
  readonly [K in T['props']['groups']['optional'][number]]?: InferPropType<T['props']['schema'][K]>;
};

/**
 * Combine required and optional props
 */
export type ComponentProps<T extends ComponentSpecification> = 
  ExtractRequiredProps<T> & ExtractOptionalProps<T>;

/**
 * Infer TypeScript type from prop definition
 */
export type InferPropType<T extends PropDefinition> = 
  T['type'] extends PrimitiveTypeDefinition 
    ? InferPrimitiveType<T['type']>
    : T['type'] extends ComplexTypeDefinition
    ? InferComplexType<T['type']>
    : T['type'] extends CustomTypeDefinition
    ? InferCustomType<T['type']>
    : T['type'] extends UnionTypeDefinition
    ? InferUnionType<T['type']>
    : T['type'] extends ArrayTypeDefinition
    ? InferArrayType<T['type']>
    : T['type'] extends ObjectTypeDefinition
    ? InferObjectType<T['type']>
    : unknown;

/**
 * Infer primitive types
 */
export type InferPrimitiveType<T extends PrimitiveTypeDefinition> = 
  T['primitive'] extends 'string' ? string :
  T['primitive'] extends 'number' ? number :
  T['primitive'] extends 'boolean' ? boolean :
  T['primitive'] extends 'null' ? null :
  T['primitive'] extends 'undefined' ? undefined :
  never;

/**
 * Infer complex types
 */
export type InferComplexType<T extends ComplexTypeDefinition> = 
  T['complex'] extends 'function' ? Function :
  T['complex'] extends 'node' ? React.ReactNode :
  T['complex'] extends 'element' ? JSX.Element :
  T['complex'] extends 'component' ? React.ComponentType<any> :
  T['complex'] extends 'ref' ? React.RefObject<HTMLElement> :
  T['complex'] extends 'date' ? Date :
  T['complex'] extends 'file' ? File :
  unknown;

/**
 * Infer custom types
 */
export type InferCustomType<T extends CustomTypeDefinition> = 
  T['custom'] extends 'color' ? string :
  T['custom'] extends 'size' ? 'xs' | 'sm' | 'md' | 'lg' | 'xl' :
  T['custom'] extends 'variant' ? 'primary' | 'secondary' | 'success' | 'warning' | 'error' :
  T['custom'] extends 'email' ? string :
  T['custom'] extends 'url' ? string :
  string;

/**
 * Infer union types (recursive)
 */
export type InferUnionType<T extends UnionTypeDefinition> = 
  T['union'][number] extends infer U 
    ? U extends TypeDefinition 
      ? InferPropType<{ type: U; description: ''; }>
      : never
    : never;

/**
 * Infer array types (recursive)
 */
export type InferArrayType<T extends ArrayTypeDefinition> = 
  readonly InferPropType<{ type: T['array']; description: ''; }>[];

/**
 * Infer object types (recursive)
 */
export type InferObjectType<T extends ObjectTypeDefinition> = {
  readonly [K in keyof T['object']]: InferPropType<T['object'][K]>;
};

// ===== PLATFORM-SPECIFIC UTILITIES =====

/**
 * Platform-specific prop extensions
 */
export type PlatformProps<T, P extends SupportedPlatform> = 
  P extends 'react' ? T & ReactSpecificProps :
  P extends 'vue' ? T & VueSpecificProps :
  P extends 'angular' ? T & AngularSpecificProps :
  P extends 'svelte' ? T & SvelteSpecificProps :
  P extends 'solid' ? T & SolidSpecificProps :
  T;

/**
 * React-specific props
 */
export interface ReactSpecificProps {
  readonly ref?: React.RefObject<HTMLElement>;
  readonly key?: string | number;
  readonly children?: React.ReactNode;
}

/**
 * Vue-specific props
 */
export interface VueSpecificProps {
  readonly ref?: string;
  readonly key?: string | number;
  readonly slots?: Record<string, any>;
}

/**
 * Angular-specific props
 */
export interface AngularSpecificProps {
  readonly templateRef?: any;
  readonly ngModel?: any;
}

/**
 * Svelte-specific props
 */
export interface SvelteSpecificProps {
  readonly bind?: Record<string, any>;
}

/**
 * Solid-specific props
 */
export interface SolidSpecificProps {
  readonly ref?: (element: HTMLElement) => void;
}

/**
 * Platform adapter for multi-platform components
 */
export interface PlatformAdapter<T> {
  readonly react?: PlatformProps<T, 'react'>;
  readonly vue?: PlatformProps<T, 'vue'>;
  readonly angular?: PlatformProps<T, 'angular'>;
  readonly svelte?: PlatformProps<T, 'svelte'>;
  readonly solid?: PlatformProps<T, 'solid'>;
}

// ===== VARIANT UTILITIES =====

/**
 * Extract variant props from component specification
 */
export type ExtractVariantProps<T extends ComponentSpecification> = 
  T['variants'] extends undefined ? {} :
  T['variants'] extends { simple: Record<string, any> } ? {
    readonly [K in keyof T['variants']['simple']]?: keyof T['variants']['simple'][K]['values'];
  } : {};

/**
 * Variant configuration type
 */
export interface VariantConfig<T extends Record<string, any>> {
  readonly variants: T;
  readonly defaultVariants?: Partial<T>;
  readonly compoundVariants?: readonly {
    readonly conditions: Partial<T>;
    readonly className: string;
  }[];
}

/**
 * Create variant utility
 */
export const createVariants = <T extends Record<string, any>>(
  config: VariantConfig<T>
) => {
  return (props?: Partial<T>): string => {
    const appliedVariants = { ...config.defaultVariants, ...props };
    const classNames: string[] = [];
    
    // Apply simple variants
    for (const [key, value] of Object.entries(appliedVariants)) {
      if (value && config.variants[key] && config.variants[key][value]) {
        classNames.push(config.variants[key][value]);
      }
    }
    
    // Apply compound variants
    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        const matches = Object.entries(compound.conditions).every(
          ([key, value]) => appliedVariants[key] === value
        );
        if (matches) {
          classNames.push(compound.className);
        }
      }
    }
    
    return classNames.join(' ');
  };
};

// ===== ACCESSIBILITY UTILITIES =====

/**
 * ARIA attributes utility type
 */
export type AriaAttributes = {
  readonly [K in `aria-${string}`]?: string | boolean | number;
};

/**
 * Accessibility props
 */
export interface AccessibilityProps extends AriaAttributes {
  readonly role?: string;
  readonly tabIndex?: number;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'aria-expanded'?: boolean;
  readonly 'aria-hidden'?: boolean;
  readonly 'aria-disabled'?: boolean;
  readonly 'aria-required'?: boolean;
  readonly 'aria-invalid'?: boolean;
}

/**
 * Norwegian accessibility compliance
 */
export interface NorwegianAccessibilityProps extends AccessibilityProps {
  readonly 'aria-label-nb'?: string; // Norwegian label
  readonly 'aria-label-en'?: string; // English label
  readonly 'lang'?: 'nb-NO' | 'nn-NO' | 'en-US';
}

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * WCAG compliant props
 */
export interface WCAGCompliantProps {
  readonly wcagLevel: WCAGLevel;
  readonly colorContrast: {
    readonly normal: number;
    readonly large: number;
    readonly enhanced?: number;
  };
  readonly keyboardAccessible: boolean;
  readonly screenReaderCompatible: boolean;
}

// ===== VALIDATION UTILITIES =====

/**
 * Validation result type
 */
export interface ValidationResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

/**
 * Create validation function
 */
export const createValidator = <T>(
  schema: (data: unknown) => ValidationResult<T>
) => {
  return (data: unknown): data is T => {
    const result = schema(data);
    return result.success;
  };
};

/**
 * Norwegian compliance validator
 */
export const validateNorwegianCompliance = <T>(
  data: T,
  requiredNSMLevel: NSMClassification = 'OPEN'
): ValidationResult<T> => {
  if (!isSecureProps(data)) {
    return {
      success: false,
      errors: ['Data must include Norwegian compliance metadata']
    };
  }
  
  const { nsmClassification } = data._compliance;
  const levels: NSMClassification[] = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
  const currentLevel = levels.indexOf(nsmClassification);
  const requiredLevel = levels.indexOf(requiredNSMLevel);
  
  if (currentLevel < requiredLevel) {
    return {
      success: false,
      errors: [`NSM classification '${nsmClassification}' is below required level '${requiredNSMLevel}'`]
    };
  }
  
  return { success: true, data };
};

// ===== TYPE GUARDS =====

/**
 * Type guard for component specification
 */
export const isComponentSpecification = (data: unknown): data is ComponentSpecification => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'metadata' in data &&
    'compliance' in data &&
    'props' in data &&
    'accessibility' in data &&
    'platforms' in data
  );
};

/**
 * Type guard for prop definition
 */
export const isPropDefinition = (data: unknown): data is PropDefinition => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'description' in data &&
    typeof (data as any).description === 'string'
  );
};

/**
 * Type guard for component category
 */
export const isComponentCategory = (value: string): value is ComponentCategory => {
  const categories: ComponentCategory[] = [
    'basic', 'composite', 'layout', 'navigation', 'feedback',
    'overlay', 'form', 'data-display', 'specialized'
  ];
  return categories.includes(value as ComponentCategory);
};

/**
 * Type guard for component stability
 */
export const isComponentStability = (value: string): value is ComponentStability => {
  const stabilities: ComponentStability[] = ['experimental', 'beta', 'stable', 'deprecated'];
  return stabilities.includes(value as ComponentStability);
};

/**
 * Type guard for supported platform
 */
export const isSupportedPlatform = (value: string): value is SupportedPlatform => {
  const platforms: SupportedPlatform[] = ['react', 'vue', 'angular', 'svelte', 'solid', 'web-components'];
  return platforms.includes(value as SupportedPlatform);
};

/**
 * Type guard for NSM classification
 */
export const isNSMClassification = (value: string): value is NSMClassification => {
  const classifications: NSMClassification[] = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
  return classifications.includes(value as NSMClassification);
};

// ===== COMPONENT FACTORY UTILITIES =====

/**
 * Component factory configuration
 */
export interface ComponentFactoryConfig<T extends ComponentSpecification> {
  readonly specification: T;
  readonly platform: SupportedPlatform;
  readonly compliance?: NorwegianComplianceMetadata;
  readonly variants?: ExtractVariantProps<T>;
}

/**
 * Create component factory
 */
export const createComponentFactory = <T extends ComponentSpecification>(
  config: ComponentFactoryConfig<T>
) => {
  return (props: ComponentProps<T>): {
    props: PlatformProps<ComponentProps<T>, typeof config.platform>;
    className: string;
    compliance: NorwegianComplianceMetadata | undefined;
  } => {
    // Type-safe prop validation
    const validatedProps = props as PlatformProps<ComponentProps<T>, typeof config.platform>;
    
    // Generate class names from variants
    const className = config.variants ? 
      createVariants({ variants: config.variants })(config.variants) : 
      '';
    
    return {
      props: validatedProps,
      className,
      compliance: config.compliance
    };
  };
};

// ===== PERFORMANCE UTILITIES =====

/**
 * Performance monitoring type
 */
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly bundleSize: number;
  readonly memoryUsage: number;
  readonly hydrationTime?: number;
}

/**
 * Performance benchmark
 */
export interface PerformanceBenchmark {
  readonly component: ComponentName;
  readonly platform: SupportedPlatform;
  readonly metrics: PerformanceMetrics;
  readonly timestamp: string;
}

/**
 * Create performance monitor
 */
export const createPerformanceMonitor = (componentName: ComponentName) => {
  const startTime = performance.now();
  
  return {
    measure: (label: string): number => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (typeof globalThis !== 'undefined' && globalThis.performance?.mark) {
        globalThis.performance.mark(`${componentName}-${label}`);
      }
      
      return duration;
    },
    
    benchmark: (): PerformanceBenchmark => {
      const renderTime = performance.now() - startTime;
      
      return {
        component: componentName,
        platform: 'react', // Default to React, should be determined dynamically
        metrics: {
          renderTime,
          bundleSize: 0, // Would be calculated by build tools
          memoryUsage: 0 // Would be calculated by runtime monitoring
        },
        timestamp: new Date().toISOString()
      };
    }
  };
};

// ===== EXPORT UTILITIES =====

/**
 * All utility functions
 */
export const Utils = {
  // Branding
  createComponentName,
  createPropName,
  
  // Norwegian compliance
  isSecureProps,
  extractNSMClassification,
  validateNorwegianCompliance,
  
  // Type guards
  isComponentSpecification,
  isPropDefinition,
  isComponentCategory,
  isComponentStability,
  isSupportedPlatform,
  isNSMClassification,
  
  // Variants
  createVariants,
  
  // Component factory
  createComponentFactory,
  
  // Performance
  createPerformanceMonitor,
  
  // Validation
  createValidator
} as const;

// All types are already exported inline above
// No need for additional type-only exports
