#!/usr/bin/env node

/**
 * TypeScript Type Generation System for Xala UI Components
 * Generates strict TypeScript definitions from JSON component specifications
 * Includes Norwegian compliance validation and multi-platform support
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { z } from 'zod';
import {
  ComponentSpecification,
  TypeDefinition,
  PropDefinition,
  isPrimitiveType,
  isComplexType,
  isCustomType,
  isUnionType,
  isArrayType,
  isObjectType,
  NSMClassification,
  SupportedPlatform
} from '../src/types/specification-types.js';

// ===== CONFIGURATION =====

interface GenerationConfig {
  readonly inputDir: string;
  readonly outputDir: string;
  readonly includeValidation: boolean;
  readonly includeDocumentation: boolean;
  readonly platforms: readonly SupportedPlatform[];
  readonly nsmClassification: NSMClassification;
  readonly strictMode: boolean;
}

const DEFAULT_CONFIG: GenerationConfig = {
  inputDir: './docs/specifications/components',
  outputDir: './src/generated/types',
  includeValidation: true,
  includeDocumentation: true,
  platforms: ['react', 'vue', 'angular'],
  nsmClassification: 'OPEN',
  strictMode: true
};

// ===== TYPE GENERATION ENGINE =====

class TypeGenerator {
  private readonly config: GenerationConfig;
  private readonly generatedTypes = new Set<string>();
  private readonly imports = new Set<string>();
  private readonly exports = new Set<string>();

  constructor(config: GenerationConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Main entry point for type generation
   */
  public async generate(): Promise<void> {
    try {
      console.log('🚀 Starting TypeScript type generation...');
      
      // Ensure output directory exists
      await this.ensureOutputDirectory();
      
      // Find all component specification files
      const specFiles = await this.findSpecificationFiles();
      console.log(`📄 Found ${specFiles.length} specification files`);
      
      // Process each specification file
      const results = await Promise.all(
        specFiles.map(file => this.processSpecificationFile(file))
      );
      
      // Generate index file
      await this.generateIndexFile(results.filter(r => r !== null));
      
      // Generate utility types
      await this.generateUtilityTypes();
      
      // Generate validation schemas if enabled
      if (this.config.includeValidation) {
        await this.generateValidationSchemas();
      }
      
      console.log('✅ Type generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Type generation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.config.outputDir);
    } catch {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Find all JSON specification files
   */
  private async findSpecificationFiles(): Promise<string[]> {
    const pattern = path.join(this.config.inputDir, '**/*.json');
    return glob(pattern);
  }

  /**
   * Process a single specification file
   */
  private async processSpecificationFile(filePath: string): Promise<GeneratedTypeFile | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const spec: ComponentSpecification = JSON.parse(content);
      
      // Validate specification
      if (!this.validateSpecification(spec)) {
        console.warn(`⚠️  Skipping invalid specification: ${filePath}`);
        return null;
      }
      
      // Generate types for this component
      const typeDefinitions = await this.generateComponentTypes(spec);
      
      // Create output file
      const outputFile = this.getOutputFileName(spec.metadata.name);
      const outputPath = path.join(this.config.outputDir, outputFile);
      
      await fs.writeFile(outputPath, typeDefinitions);
      
      console.log(`✨ Generated types for ${spec.metadata.name}`);
      
      return {
        componentName: spec.metadata.name,
        fileName: outputFile,
        filePath: outputPath,
        exports: this.extractExports(typeDefinitions)
      };
      
    } catch (error) {
      console.error(`❌ Failed to process ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Validate component specification
   */
  private validateSpecification(spec: unknown): spec is ComponentSpecification {
    try {
      // Basic structure validation
      const basicValidation = z.object({
        metadata: z.object({
          name: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/),
          version: z.string(),
          category: z.string(),
          description: z.string().min(10).max(500)
        }),
        compliance: z.object({
          norwegian: z.object({
            nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'])
          })
        }),
        props: z.object({
          schema: z.record(z.any())
        }),
        accessibility: z.object({
          keyboardNavigation: z.object({
            supported: z.boolean()
          }),
          screenReader: z.object({
            announcements: z.array(z.any()),
            labels: z.any()
          })
        }),
        platforms: z.object({
          supported: z.array(z.string())
        })
      });
      
      basicValidation.parse(spec);
      return true;
      
    } catch (error) {
      console.error('Specification validation failed:', error);
      return false;
    }
  }

  /**
   * Generate TypeScript types for a component
   */
  private async generateComponentTypes(spec: ComponentSpecification): Promise<string> {
    const lines: string[] = [];
    
    // File header
    lines.push(this.generateFileHeader(spec));
    
    // Imports
    lines.push(this.generateImports(spec));
    
    // Norwegian compliance types if needed
    if (spec.compliance.norwegian.nsmClassification !== 'OPEN') {
      lines.push(this.generateComplianceTypes(spec));
    }
    
    // Main props interface
    lines.push(this.generatePropsInterface(spec));
    
    // Variant types if available
    if (spec.variants) {
      lines.push(this.generateVariantTypes(spec));
    }
    
    // Event handler types
    lines.push(this.generateEventHandlerTypes(spec));
    
    // Platform-specific types
    for (const platform of this.config.platforms) {
      if (spec.platforms.supported.includes(platform)) {
        lines.push(this.generatePlatformTypes(spec, platform));
      }
    }
    
    // Utility types
    lines.push(this.generateComponentUtilityTypes(spec));
    
    // Type guards
    lines.push(this.generateTypeGuards(spec));
    
    // Documentation if enabled
    if (this.config.includeDocumentation) {
      lines.push(this.generateDocumentationTypes(spec));
    }
    
    return lines.filter(line => line.length > 0).join('\n\n');
  }

  /**
   * Generate file header with metadata
   */
  private generateFileHeader(spec: ComponentSpecification): string {
    const nsmLevel = spec.compliance.norwegian.nsmClassification;
    const timestamp = new Date().toISOString();
    
    return `/**
 * ${spec.metadata.name} Component Type Definitions
 * Generated from component specification v${spec.metadata.version}
 * 
 * @description ${spec.metadata.description}
 * @category ${spec.metadata.category}
 * @stability ${spec.metadata.stability}
 * @nsmClassification ${nsmLevel}
 * @generatedAt ${timestamp}
 * 
 * ⚠️  DO NOT EDIT - This file is auto-generated
 * To modify types, update the component specification JSON file
 */`;
  }

  /**
   * Generate necessary imports
   */
  private generateImports(spec: ComponentSpecification): string {
    const imports: string[] = [
      "import type { ComponentProps, ReactNode, RefObject } from 'react';",
      "import type { NSMClassification } from '../specification-types.js';"
    ];
    
    // Add platform-specific imports
    for (const platform of spec.platforms.supported) {
      if (this.config.platforms.includes(platform as SupportedPlatform)) {
        switch (platform) {
          case 'vue':
            imports.push("import type { VNode } from 'vue';");
            break;
          case 'angular':
            imports.push("import type { TemplateRef } from '@angular/core';");
            break;
        }
      }
    }
    
    return imports.join('\n');
  }

  /**
   * Generate Norwegian compliance types
   */
  private generateComplianceTypes(spec: ComponentSpecification): string {
    const nsmLevel = spec.compliance.norwegian.nsmClassification;
    
    return `/**
 * Norwegian compliance metadata for ${spec.metadata.name}
 * NSM Classification: ${nsmLevel}
 */
export interface ${spec.metadata.name}ComplianceMetadata {
  readonly nsmClassification: '${nsmLevel}';
  readonly gdprCompliant: ${spec.compliance.norwegian.gdprCompliant};
  readonly auditTrail: ${spec.compliance.norwegian.auditTrail ?? false};
  readonly lastAudit?: string;
  readonly approvedBy?: string;
}`;
  }

  /**
   * Generate main props interface
   */
  private generatePropsInterface(spec: ComponentSpecification): string {
    const lines: string[] = [];
    
    // Main props interface
    lines.push(`/**
 * Props for the ${spec.metadata.name} component
 * 
 * @interface ${spec.metadata.name}Props
 * @description ${spec.metadata.description}
 */`);
    
    lines.push(`export interface ${spec.metadata.name}Props {`);
    
    // Generate props from schema
    for (const [propName, propDef] of Object.entries(spec.props.schema)) {
      lines.push(this.generatePropTypeDefinition(propName, propDef, 2));
    }
    
    // Add compliance metadata if restricted
    if (spec.compliance.norwegian.nsmClassification !== 'OPEN') {
      lines.push(`  /** Norwegian compliance metadata */`);
      lines.push(`  readonly _compliance?: ${spec.metadata.name}ComplianceMetadata;`);
    }
    
    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Generate prop type definition
   */
  private generatePropTypeDefinition(propName: string, propDef: PropDefinition, indent: number): string {
    const spaces = ' '.repeat(indent);
    const optional = propDef.required ? '' : '?';
    const readonly = this.config.strictMode ? 'readonly ' : '';
    
    // Generate JSDoc comment
    const jsdoc = this.generatePropJSDoc(propDef, indent);
    
    // Generate TypeScript type
    const tsType = this.generateTypeScriptType(propDef.type);
    
    return `${jsdoc}\n${spaces}${readonly}${propName}${optional}: ${tsType};`;
  }

  /**
   * Generate JSDoc comment for prop
   */
  private generatePropJSDoc(propDef: PropDefinition, indent: number): string {
    const spaces = ' '.repeat(indent);
    const lines: string[] = [];
    
    lines.push(`${spaces}/**`);
    lines.push(`${spaces} * ${propDef.description}`);
    
    if (propDef.defaultValue !== undefined) {
      lines.push(`${spaces} * @default ${JSON.stringify(propDef.defaultValue)}`);
    }
    
    if (propDef.examples && propDef.examples.length > 0) {
      lines.push(`${spaces} * @example ${JSON.stringify(propDef.examples[0].value)}`);
    }
    
    if (propDef.deprecated) {
      lines.push(`${spaces} * @deprecated since v${propDef.deprecated.since} - ${propDef.deprecated.reason}`);
      lines.push(`${spaces} * @see Use ${propDef.deprecated.alternative} instead`);
    }
    
    if (propDef.accessibility?.ariaAttribute) {
      lines.push(`${spaces} * @aria ${propDef.accessibility.ariaAttribute}`);
    }
    
    lines.push(`${spaces} */`);
    
    return lines.join('\n');
  }

  /**
   * Generate TypeScript type from type definition
   */
  private generateTypeScriptType(typeDef: TypeDefinition): string {
    if (isPrimitiveType(typeDef)) {
      return this.generatePrimitiveType(typeDef);
    } else if (isComplexType(typeDef)) {
      return this.generateComplexType(typeDef);
    } else if (isCustomType(typeDef)) {
      return this.generateCustomType(typeDef);
    } else if (isUnionType(typeDef)) {
      return this.generateUnionType(typeDef);
    } else if (isArrayType(typeDef)) {
      return this.generateArrayType(typeDef);
    } else if (isObjectType(typeDef)) {
      return this.generateObjectType(typeDef);
    } else {
      return 'unknown';
    }
  }

  /**
   * Generate primitive TypeScript type
   */
  private generatePrimitiveType(typeDef: { primitive: string; constraints?: any }): string {
    const baseType = typeDef.primitive;
    
    // Handle string enums
    if (baseType === 'string' && typeDef.constraints?.enum) {
      const values = typeDef.constraints.enum.map((v: string) => `'${v}'`).join(' | ');
      return values;
    }
    
    // Handle number enums
    if (baseType === 'number' && typeDef.constraints?.enum) {
      return typeDef.constraints.enum.join(' | ');
    }
    
    return baseType;
  }

  /**
   * Generate complex TypeScript type
   */
  private generateComplexType(typeDef: { complex: string; signature?: any; elementConstraints?: any }): string {
    switch (typeDef.complex) {
      case 'function':
        if (typeDef.signature) {
          const params = typeDef.signature.parameters
            .map((p: any) => `${p.name}${p.required ? '' : '?'}: ${p.type}`)
            .join(', ');
          return `(${params}) => ${typeDef.signature.returnType}`;
        }
        return '(...args: any[]) => any';
      
      case 'node':
        return 'ReactNode';
      
      case 'element':
        return 'JSX.Element';
      
      case 'component':
        return 'React.ComponentType<any>';
      
      case 'ref':
        return 'RefObject<HTMLElement>';
      
      case 'date':
        return 'Date';
      
      case 'file':
        return 'File';
      
      default:
        return 'unknown';
    }
  }

  /**
   * Generate custom TypeScript type
   */
  private generateCustomType(typeDef: { custom: string; values?: any[]; pattern?: string }): string {
    switch (typeDef.custom) {
      case 'color':
        return 'string'; // Could be more specific with branded types
      
      case 'size':
        return typeDef.values ? 
          typeDef.values.map(v => `'${v}'`).join(' | ') : 
          "'xs' | 'sm' | 'md' | 'lg' | 'xl'";
      
      case 'variant':
        return typeDef.values ? 
          typeDef.values.map(v => `'${v}'`).join(' | ') : 
          "'primary' | 'secondary' | 'success' | 'warning' | 'error'";
      
      case 'breakpoint':
        return "'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultra'";
      
      case 'locale':
        return "'nb-NO' | 'nn-NO' | 'en-US' | 'fr-FR' | 'ar-SA'";
      
      case 'email':
        return 'string'; // Brand with Email type
      
      case 'url':
        return 'string'; // Brand with URL type
      
      default:
        return 'string';
    }
  }

  /**
   * Generate union TypeScript type
   */
  private generateUnionType(typeDef: { union: any[]; discriminant?: string }): string {
    const types = typeDef.union.map(type => this.generateTypeScriptType(type));
    return types.join(' | ');
  }

  /**
   * Generate array TypeScript type
   */
  private generateArrayType(typeDef: { array: any; constraints?: any }): string {
    const itemType = this.generateTypeScriptType(typeDef.array);
    
    if (this.config.strictMode) {
      return `readonly ${itemType}[]`;
    }
    
    return `${itemType}[]`;
  }

  /**
   * Generate object TypeScript type
   */
  private generateObjectType(typeDef: { object: Record<string, any>; strict?: boolean }): string {
    const properties: string[] = [];
    
    for (const [key, value] of Object.entries(typeDef.object)) {
      const propType = this.generateTypeScriptType(value.type || value);
      const readonly = this.config.strictMode ? 'readonly ' : '';
      const optional = value.required === false ? '?' : '';
      properties.push(`  ${readonly}${key}${optional}: ${propType}`);
    }
    
    const strictness = typeDef.strict === false ? ' [key: string]: any;' : '';
    
    return `{\n${properties.join(';\n')};${strictness}\n}`;
  }

  /**
   * Generate variant types
   */
  private generateVariantTypes(spec: ComponentSpecification): string {
    if (!spec.variants) return '';
    
    const lines: string[] = [];
    
    // Simple variants
    if (spec.variants.simple) {
      for (const [variantName, variant] of Object.entries(spec.variants.simple)) {
        const values = Object.keys(variant.values).map(v => `'${v}'`).join(' | ');
        lines.push(`export type ${spec.metadata.name}${variantName.charAt(0).toUpperCase() + variantName.slice(1)} = ${values};`);
      }
    }
    
    // Compound variants
    if (spec.variants.compound) {
      lines.push(`export type ${spec.metadata.name}VariantProps = {`);
      
      // Extract all unique props from compound variants
      const variantProps = new Set<string>();
      spec.variants.compound.forEach(variant => {
        Object.keys(variant.conditions).forEach(prop => variantProps.add(prop));
      });
      
      variantProps.forEach(prop => {
        lines.push(`  readonly ${prop}?: string;`);
      });
      
      lines.push('};');
    }
    
    return lines.join('\n');
  }

  /**
   * Generate event handler types
   */
  private generateEventHandlerTypes(spec: ComponentSpecification): string {
    const lines: string[] = [];
    const eventHandlers: string[] = [];
    
    // Extract event handlers from props
    for (const [propName, propDef] of Object.entries(spec.props.schema)) {
      if (propName.startsWith('on') && propDef.type && 
          typeof propDef.type === 'object' && 'complex' in propDef.type && 
          propDef.type.complex === 'function') {
        eventHandlers.push(propName);
      }
    }
    
    if (eventHandlers.length > 0) {
      lines.push(`/**
 * Event handler types for ${spec.metadata.name}
 */`);
      lines.push(`export interface ${spec.metadata.name}EventHandlers {`);
      
      eventHandlers.forEach(handler => {
        const propDef = spec.props.schema[handler];
        const handlerType = this.generateTypeScriptType(propDef.type);
        lines.push(`  readonly ${handler}?: ${handlerType};`);
      });
      
      lines.push('}');
    }
    
    return lines.join('\n');
  }

  /**
   * Generate platform-specific types
   */
  private generatePlatformTypes(spec: ComponentSpecification, platform: SupportedPlatform): string {
    const lines: string[] = [];
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    
    lines.push(`/**
 * ${platformName}-specific props for ${spec.metadata.name}
 */`);
    
    switch (platform) {
      case 'react':
        lines.push(`export interface ${spec.metadata.name}ReactProps extends ${spec.metadata.name}Props {`);
        lines.push(`  readonly ref?: RefObject<HTMLElement>;`);
        lines.push(`  readonly key?: string | number;`);
        lines.push('}');
        break;
      
      case 'vue':
        lines.push(`export interface ${spec.metadata.name}VueProps extends ${spec.metadata.name}Props {`);
        lines.push(`  readonly ref?: string;`);
        lines.push(`  readonly slots?: Record<string, VNode>;`);
        lines.push('}');
        break;
      
      case 'angular':
        lines.push(`export interface ${spec.metadata.name}AngularProps extends ${spec.metadata.name}Props {`);
        lines.push(`  readonly templateRef?: TemplateRef<any>;`);
        lines.push('}');
        break;
    }
    
    return lines.join('\n');
  }

  /**
   * Generate utility types
   */
  private generateComponentUtilityTypes(spec: ComponentSpecification): string {
    const lines: string[] = [];
    
    // Required props type
    const requiredProps = spec.props.groups.required;
    if (requiredProps.length > 0) {
      const requiredUnion = requiredProps.map(p => `'${p}'`).join(' | ');
      lines.push(`export type ${spec.metadata.name}RequiredProps = ${requiredUnion};`);
    }
    
    // Optional props type
    const optionalProps = spec.props.groups.optional;
    if (optionalProps.length > 0) {
      const optionalUnion = optionalProps.map(p => `'${p}'`).join(' | ');
      lines.push(`export type ${spec.metadata.name}OptionalProps = ${optionalUnion};`);
    }
    
    // Prop keys type
    const allProps = Object.keys(spec.props.schema);
    const propsUnion = allProps.map(p => `'${p}'`).join(' | ');
    lines.push(`export type ${spec.metadata.name}PropKeys = ${propsUnion};`);
    
    // Partial props type for default values
    lines.push(`export type Partial${spec.metadata.name}Props = Partial<${spec.metadata.name}Props>;`);
    
    return lines.join('\n');
  }

  /**
   * Generate type guards
   */
  private generateTypeGuards(spec: ComponentSpecification): string {
    const lines: string[] = [];
    
    lines.push(`/**
 * Type guards for ${spec.metadata.name}
 */`);
    
    // Main props type guard
    lines.push(`export const is${spec.metadata.name}Props = (props: unknown): props is ${spec.metadata.name}Props => {`);
    lines.push(`  if (typeof props !== 'object' || props === null) return false;`);
    
    // Check required props
    for (const requiredProp of spec.props.groups.required) {
      lines.push(`  if (!('${requiredProp}' in props)) return false;`);
    }
    
    lines.push(`  return true;`);
    lines.push('};');
    
    return lines.join('\n');
  }

  /**
   * Generate documentation types
   */
  private generateDocumentationTypes(spec: ComponentSpecification): string {
    const lines: string[] = [];
    
    lines.push(`/**
 * Documentation metadata for ${spec.metadata.name}
 */`);
    lines.push(`export interface ${spec.metadata.name}Documentation {`);
    lines.push(`  readonly componentName: '${spec.metadata.name}';`);
    lines.push(`  readonly category: '${spec.metadata.category}';`);
    lines.push(`  readonly description: string;`);
    lines.push(`  readonly version: '${spec.metadata.version}';`);
    lines.push(`  readonly stability: '${spec.metadata.stability}';`);
    lines.push(`  readonly examples: readonly ComponentExample[];`);
    lines.push(`  readonly accessibility: AccessibilityDocumentation;`);
    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Get output file name for component
   */
  private getOutputFileName(componentName: string): string {
    const kebabCase = componentName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1);
    return `${kebabCase}.types.ts`;
  }

  /**
   * Extract exports from generated code
   */
  private extractExports(code: string): string[] {
    const exportRegex = /export (?:interface|type|const) ([A-Za-z0-9_]+)/g;
    const exports: string[] = [];
    let match;
    
    while ((match = exportRegex.exec(code)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  /**
   * Generate index file
   */
  private async generateIndexFile(results: GeneratedTypeFile[]): Promise<void> {
    const lines: string[] = [];
    
    lines.push(`/**
 * Generated Types Index
 * Auto-generated type definitions for all Xala UI components
 * 
 * @generated ${new Date().toISOString()}
 */`);
    
    // Export all generated types
    for (const result of results) {
      const relativePath = `./${result.fileName.replace('.ts', '.js')}`;
      lines.push(`export * from '${relativePath}';`);
    }
    
    // Generate components registry
    lines.push('');
    lines.push('/**
 * Component registry for type-safe component lookup
 */');
    lines.push('export const COMPONENT_TYPES = {');
    
    for (const result of results) {
      lines.push(`  ${result.componentName}: '${result.componentName}',`);
    }
    
    lines.push('} as const;');
    
    const indexPath = path.join(this.config.outputDir, 'index.ts');
    await fs.writeFile(indexPath, lines.join('\n'));
  }

  /**
   * Generate utility types file
   */
  private async generateUtilityTypes(): Promise<void> {
    const lines: string[] = [];
    
    lines.push(`/**
 * Utility Types for Xala UI System
 * Common types and utilities used across components
 */`);
    
    // Norwegian compliance utilities
    lines.push(this.generateNorwegianUtilities());
    
    // Generic component utilities
    lines.push(this.generateGenericUtilities());
    
    // Platform utilities
    lines.push(this.generatePlatformUtilities());
    
    const utilityPath = path.join(this.config.outputDir, 'utilities.ts');
    await fs.writeFile(utilityPath, lines.join('\n\n'));
  }

  /**
   * Generate Norwegian compliance utilities
   */
  private generateNorwegianUtilities(): string {
    return `/**
 * Norwegian Compliance Utilities
 */
export type NSMClassificationLevel = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

export interface ComplianceMetadata<T extends NSMClassificationLevel = 'OPEN'> {
  readonly nsmClassification: T;
  readonly gdprCompliant: boolean;
  readonly auditTrail: boolean;
  readonly approvedBy?: string;
  readonly lastAudit?: string;
  readonly expiresAt?: string;
}

export type SecureProps<T, Level extends NSMClassificationLevel> = T & {
  readonly _compliance: ComplianceMetadata<Level>;
};

export const isSecureProps = <T, Level extends NSMClassificationLevel>(
  props: unknown
): props is SecureProps<T, Level> => {
  return typeof props === 'object' && props !== null && '_compliance' in props;
};`;
  }

  /**
   * Generate generic utilities
   */
  private generateGenericUtilities(): string {
    return `/**
 * Generic Component Utilities
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type ComponentState = 'idle' | 'loading' | 'success' | 'error';

export interface BaseComponentProps {
  readonly id?: string;
  readonly className?: string;
  readonly testId?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: (event: Event) => void;
  readonly onKeyDown?: (event: KeyboardEvent) => void;
}

export type WithChildren<T> = T & {
  readonly children?: React.ReactNode;
};

export type WithRef<T, E extends HTMLElement = HTMLElement> = T & {
  readonly ref?: React.RefObject<E>;
};`;
  }

  /**
   * Generate platform utilities
   */
  private generatePlatformUtilities(): string {
    return `/**
 * Platform-Specific Utilities
 */
export type Platform = 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'web-components';

export interface PlatformAdapter<T> {
  readonly react?: T & { ref?: React.RefObject<HTMLElement> };
  readonly vue?: T & { ref?: string };
  readonly angular?: T & { templateRef?: any };
}

export type PlatformProps<T, P extends Platform> = 
  P extends 'react' ? T & { ref?: React.RefObject<HTMLElement> } :
  P extends 'vue' ? T & { ref?: string } :
  P extends 'angular' ? T & { templateRef?: any } :
  T;`;
  }

  /**
   * Generate Zod validation schemas
   */
  private async generateValidationSchemas(): Promise<void> {
    const lines: string[] = [];
    
    lines.push(`/**
 * Runtime Validation Schemas
 * Zod schemas for component props validation
 */`);
    lines.push(`import { z } from 'zod';`);
    
    // Base validation schemas
    lines.push(this.generateBaseValidationSchemas());
    
    const validationPath = path.join(this.config.outputDir, 'validation.ts');
    await fs.writeFile(validationPath, lines.join('\n\n'));
  }

  /**
   * Generate base validation schemas
   */
  private generateBaseValidationSchemas(): string {
    return `/**
 * Base Validation Schemas
 */
export const NSMClassificationSchema = z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']);

export const ComponentSizeSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);

export const ComponentVariantSchema = z.enum(['primary', 'secondary', 'success', 'warning', 'error']);

export const BaseComponentPropsSchema = z.object({
  id: z.string().optional(),
  className: z.string().optional(),
  testId: z.string().optional(),
  'aria-label': z.string().optional(),
  'aria-describedby': z.string().optional()
});

export const ComplianceMetadataSchema = z.object({
  nsmClassification: NSMClassificationSchema,
  gdprCompliant: z.boolean(),
  auditTrail: z.boolean(),
  approvedBy: z.string().optional(),
  lastAudit: z.string().optional(),
  expiresAt: z.string().optional()
});`;
  }
}

// ===== INTERFACES =====

interface GeneratedTypeFile {
  readonly componentName: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly exports: readonly string[];
}

// ===== CLI INTERFACE =====

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const config: Partial<GenerationConfig> = {};
  
  // Parse CLI arguments
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--input':
        config.inputDir = value;
        break;
      case '--output':
        config.outputDir = value;
        break;
      case '--platforms':
        config.platforms = value.split(',') as SupportedPlatform[];
        break;
      case '--nsm':
        config.nsmClassification = value as NSMClassification;
        break;
      case '--no-validation':
        config.includeValidation = false;
        break;
      case '--no-docs':
        config.includeDocumentation = false;
        break;
      case '--no-strict':
        config.strictMode = false;
        break;
    }
  }
  
  const generator = new TypeGenerator({ ...DEFAULT_CONFIG, ...config });
  await generator.generate();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TypeGenerator, GenerationConfig };
