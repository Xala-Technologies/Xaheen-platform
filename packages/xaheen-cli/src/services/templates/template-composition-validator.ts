/**
 * Template Composition Validation System
 * 
 * Comprehensive validation for template inheritance chains, composition patterns,
 * and Norwegian compliance requirements.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import type { 
  BaseTemplate, 
  TemplateComposition, 
  TemplateSlot, 
  TemplateProp,
  TemplateMetadata 
} from './template-inheritance.js';
import { templateInheritance } from './template-inheritance.js';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
  readonly suggestions: readonly ValidationSuggestion[];
}

export interface ValidationError {
  readonly type: 'circular_dependency' | 'missing_template' | 'invalid_slot' | 'prop_mismatch' | 'compliance_violation';
  readonly message: string;
  readonly templateId?: string;
  readonly slotName?: string;
  readonly propName?: string;
  readonly severity: 'error' | 'warning';
}

export interface ValidationWarning {
  readonly type: 'performance' | 'accessibility' | 'compatibility' | 'best_practice';
  readonly message: string;
  readonly templateId?: string;
  readonly recommendation?: string;
}

export interface ValidationSuggestion {
  readonly type: 'optimization' | 'enhancement' | 'compliance' | 'accessibility';
  readonly message: string;
  readonly action: string;
  readonly impact: 'low' | 'medium' | 'high';
}

export interface ComplianceRequirement {
  readonly standard: 'WCAG' | 'NSM' | 'GDPR' | 'Norwegian';
  readonly level: string;
  readonly checks: readonly ComplianceCheck[];
}

export interface ComplianceCheck {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly validator: (template: BaseTemplate, composition: TemplateComposition) => boolean;
  readonly errorMessage: string;
}

export class TemplateCompositionValidator {
  private complianceRequirements: Map<string, ComplianceRequirement> = new Map();
  private validationCache: Map<string, ValidationResult> = new Map();

  constructor() {
    this.initializeComplianceRequirements();
  }

  /**
   * Validate template composition
   */
  async validateComposition(composition: TemplateComposition): Promise<ValidationResult> {
    const cacheKey = this.generateCacheKey(composition);
    
    // Check cache first
    const cached = this.validationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    consola.info(`Validating template composition: ${composition.baseTemplate}`);

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    try {
      // Validate inheritance chain
      const inheritanceValidation = await this.validateInheritanceChain(composition.baseTemplate);
      errors.push(...inheritanceValidation.errors);
      warnings.push(...inheritanceValidation.warnings);

      // Validate template composition
      const compositionValidation = await this.validateTemplateComposition(composition);
      errors.push(...compositionValidation.errors);
      warnings.push(...compositionValidation.warnings);

      // Validate slot usage
      const slotValidation = await this.validateSlotUsage(composition);
      errors.push(...slotValidation.errors);
      warnings.push(...slotValidation.warnings);

      // Validate prop compatibility
      const propValidation = await this.validatePropCompatibility(composition);
      errors.push(...propValidation.errors);
      warnings.push(...propValidation.warnings);

      // Validate Norwegian compliance
      const complianceValidation = await this.validateNorwegianCompliance(composition);
      errors.push(...complianceValidation.errors);
      warnings.push(...complianceValidation.warnings);

      // Validate accessibility requirements
      const accessibilityValidation = await this.validateAccessibility(composition);
      errors.push(...accessibilityValidation.errors);
      warnings.push(...accessibilityValidation.warnings);

      // Validate performance implications
      const performanceValidation = await this.validatePerformance(composition);
      warnings.push(...performanceValidation.warnings);
      suggestions.push(...performanceValidation.suggestions);

      // Generate optimization suggestions
      const optimizationSuggestions = await this.generateOptimizationSuggestions(composition);
      suggestions.push(...optimizationSuggestions);

    } catch (validationError) {
      errors.push({
        type: 'compliance_violation',
        message: `Validation error: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    const result: ValidationResult = {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      suggestions
    };

    // Cache result
    this.validationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Validate inheritance chain for circular dependencies
   */
  private async validateInheritanceChain(baseTemplateId: string): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const validateNode = (templateId: string): void => {
      if (visiting.has(templateId)) {
        errors.push({
          type: 'circular_dependency',
          message: `Circular dependency detected in inheritance chain: ${templateId}`,
          templateId,
          severity: 'error'
        });
        return;
      }

      if (visited.has(templateId)) {
        return;
      }

      const template = templateInheritance.getBaseTemplate(templateId);
      if (!template) {
        errors.push({
          type: 'missing_template',
          message: `Template not found: ${templateId}`,
          templateId,
          severity: 'error'
        });
        return;
      }

      visiting.add(templateId);

      if (template.extends) {
        validateNode(template.extends);
      }

      visiting.delete(templateId);
      visited.add(templateId);
    };

    validateNode(baseTemplateId);

    // Check chain depth
    const chainDepth = this.calculateInheritanceDepth(baseTemplateId);
    if (chainDepth > 5) {
      warnings.push({
        type: 'performance',
        message: `Deep inheritance chain detected (${chainDepth} levels). Consider flattening for better performance.`,
        templateId: baseTemplateId,
        recommendation: 'Consider using composition over deep inheritance'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate template composition structure
   */
  private async validateTemplateComposition(composition: TemplateComposition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate base template exists
    const baseTemplate = templateInheritance.getBaseTemplate(composition.baseTemplate);
    if (!baseTemplate) {
      errors.push({
        type: 'missing_template',
        message: `Base template not found: ${composition.baseTemplate}`,
        templateId: composition.baseTemplate,
        severity: 'error'
      });
      return { errors, warnings };
    }

    // Validate mixins exist
    for (const mixinId of composition.mixins) {
      const mixin = templateInheritance.getBaseTemplate(mixinId);
      if (!mixin) {
        errors.push({
          type: 'missing_template',
          message: `Mixin template not found: ${mixinId}`,
          templateId: mixinId,
          severity: 'error'
        });
      } else if (mixin.category !== 'utility') {
        warnings.push({
          type: 'best_practice',
          message: `Template ${mixinId} is used as mixin but not categorized as utility`,
          templateId: mixinId,
          recommendation: 'Use utility category for mixin templates'
        });
      }
    }

    // Check for conflicting mixins
    const mixinConflicts = this.detectMixinConflicts(composition.mixins);
    for (const conflict of mixinConflicts) {
      warnings.push({
        type: 'compatibility',
        message: `Potential conflict between mixins: ${conflict.mixin1} and ${conflict.mixin2}`,
        recommendation: 'Review mixin compatibility and order'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate slot usage
   */
  private async validateSlotUsage(composition: TemplateComposition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Get all slots from inheritance chain
    const allSlots = await this.collectAllSlots(composition.baseTemplate);
    const requiredSlots = allSlots.filter(slot => slot.required);
    const providedSlots = Object.keys(composition.slots);

    // Check required slots are provided
    for (const requiredSlot of requiredSlots) {
      if (!providedSlots.includes(requiredSlot.name)) {
        errors.push({
          type: 'invalid_slot',
          message: `Required slot '${requiredSlot.name}' is not provided`,
          slotName: requiredSlot.name,
          severity: 'error'
        });
      }
    }

    // Check for unknown slots
    const validSlotNames = allSlots.map(slot => slot.name);
    for (const providedSlot of providedSlots) {
      if (!validSlotNames.includes(providedSlot)) {
        warnings.push({
          type: 'best_practice',
          message: `Unknown slot '${providedSlot}' provided`,
          recommendation: 'Remove unused slots or add slot definition to template'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate prop compatibility
   */
  private async validatePropCompatibility(composition: TemplateComposition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Get all props from inheritance chain
    const allProps = await this.collectAllProps(composition.baseTemplate);
    const contextProps = Object.keys(composition.context);

    // Check for prop type mismatches
    for (const [propName, propValue] of Object.entries(composition.context)) {
      const propDef = allProps.find(p => p.name === propName);
      if (propDef) {
        const isValidType = this.validatePropType(propValue, propDef.type);
        if (!isValidType) {
          errors.push({
            type: 'prop_mismatch',
            message: `Prop '${propName}' expected type '${propDef.type}' but got '${typeof propValue}'`,
            propName,
            severity: 'error'
          });
        }
      }
    }

    // Check for missing required props
    const requiredProps = allProps.filter(prop => prop.required);
    for (const requiredProp of requiredProps) {
      if (!contextProps.includes(requiredProp.name) && !requiredProp.defaultValue) {
        errors.push({
          type: 'prop_mismatch',
          message: `Required prop '${requiredProp.name}' is missing`,
          propName: requiredProp.name,
          severity: 'error'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate Norwegian compliance
   */
  private async validateNorwegianCompliance(composition: TemplateComposition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const norwegianReq = this.complianceRequirements.get('Norwegian');
    if (!norwegianReq) return { errors, warnings };

    const baseTemplate = templateInheritance.getBaseTemplate(composition.baseTemplate);
    if (!baseTemplate) return { errors, warnings };

    // Run Norwegian compliance checks
    for (const check of norwegianReq.checks) {
      try {
        const isCompliant = check.validator(baseTemplate, composition);
        if (!isCompliant) {
          errors.push({
            type: 'compliance_violation',
            message: check.errorMessage,
            templateId: composition.baseTemplate,
            severity: 'error'
          });
        }
      } catch (checkError) {
        warnings.push({
          type: 'compliance',
          message: `Failed to run compliance check ${check.id}: ${checkError instanceof Error ? checkError.message : 'Unknown error'}`,
          recommendation: 'Review compliance configuration'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate accessibility requirements
   */
  private async validateAccessibility(composition: TemplateComposition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const wcagReq = this.complianceRequirements.get('WCAG');
    if (!wcagReq) return { errors, warnings };

    const baseTemplate = templateInheritance.getBaseTemplate(composition.baseTemplate);
    if (!baseTemplate) return { errors, warnings };

    // Run WCAG compliance checks
    for (const check of wcagReq.checks) {
      try {
        const isCompliant = check.validator(baseTemplate, composition);
        if (!isCompliant) {
          if (baseTemplate.metadata.wcagLevel === 'AAA') {
            errors.push({
              type: 'compliance_violation',
              message: check.errorMessage,
              templateId: composition.baseTemplate,
              severity: 'error'
            });
          } else {
            warnings.push({
              type: 'accessibility',
              message: check.errorMessage,
              templateId: composition.baseTemplate,
              recommendation: 'Consider upgrading to AAA compliance'
            });
          }
        }
      } catch (checkError) {
        warnings.push({
          type: 'accessibility',
          message: `Failed to run accessibility check ${check.id}: ${checkError instanceof Error ? checkError.message : 'Unknown error'}`,
          recommendation: 'Review accessibility configuration'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate performance implications
   */
  private async validatePerformance(composition: TemplateComposition): Promise<{
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  }> {
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Calculate total estimated tokens
    const totalTokens = await this.calculateTotalTokens(composition);
    if (totalTokens > 5000) {
      warnings.push({
        type: 'performance',
        message: `High token count detected (${totalTokens}). This may impact generation performance.`,
        recommendation: 'Consider simplifying template composition or splitting into multiple components'
      });

      suggestions.push({
        type: 'optimization',
        message: 'Template composition has high complexity',
        action: 'Consider code splitting or template simplification',
        impact: 'medium'
      });
    }

    // Check mixin count
    if (composition.mixins.length > 5) {
      warnings.push({
        type: 'performance',
        message: `Many mixins detected (${composition.mixins.length}). This may affect rendering performance.`,
        recommendation: 'Consider consolidating related mixins'
      });
    }

    return { warnings, suggestions };
  }

  /**
   * Generate optimization suggestions
   */
  private async generateOptimizationSuggestions(composition: TemplateComposition): Promise<ValidationSuggestion[]> {
    const suggestions: ValidationSuggestion[] = [];

    // Suggest accessibility enhancements
    const hasA11yMixin = composition.mixins.includes('accessibility-enhanced-mixin');
    if (!hasA11yMixin) {
      suggestions.push({
        type: 'accessibility',
        message: 'Consider adding accessibility enhancements',
        action: 'Add accessibility-enhanced-mixin to improve WCAG compliance',
        impact: 'high'
      });
    }

    // Suggest SEO optimization
    const hasSeoMixin = composition.mixins.includes('seo-optimization-mixin');
    const baseTemplate = templateInheritance.getBaseTemplate(composition.baseTemplate);
    if (!hasSeoMixin && baseTemplate?.category === 'page') {
      suggestions.push({
        type: 'optimization',
        message: 'Page component could benefit from SEO optimization',
        action: 'Add seo-optimization-mixin for better search engine visibility',
        impact: 'medium'
      });
    }

    // Suggest analytics tracking
    const hasAnalyticsMixin = composition.mixins.includes('analytics-tracking-mixin');
    if (!hasAnalyticsMixin) {
      suggestions.push({
        type: 'enhancement',
        message: 'Consider adding analytics tracking',
        action: 'Add analytics-tracking-mixin for user behavior insights',
        impact: 'low'
      });
    }

    return suggestions;
  }

  /**
   * Helper methods
   */
  private generateCacheKey(composition: TemplateComposition): string {
    return JSON.stringify({
      baseTemplate: composition.baseTemplate,
      mixins: composition.mixins.sort(),
      slots: Object.keys(composition.slots).sort(),
      overrides: Object.keys(composition.overrides).sort()
    });
  }

  private calculateInheritanceDepth(templateId: string, depth = 0): number {
    const template = templateInheritance.getBaseTemplate(templateId);
    if (!template || !template.extends) {
      return depth;
    }
    return this.calculateInheritanceDepth(template.extends, depth + 1);
  }

  private detectMixinConflicts(mixinIds: readonly string[]): Array<{ mixin1: string; mixin2: string }> {
    const conflicts: Array<{ mixin1: string; mixin2: string }> = [];
    
    // Define known conflicting mixins
    const conflictMap = new Map([
      ['analytics-tracking-mixin', ['seo-optimization-mixin']], // Potential script conflicts
    ]);

    for (let i = 0; i < mixinIds.length; i++) {
      for (let j = i + 1; j < mixinIds.length; j++) {
        const mixin1 = mixinIds[i];
        const mixin2 = mixinIds[j];
        
        const conflicts1 = conflictMap.get(mixin1) || [];
        const conflicts2 = conflictMap.get(mixin2) || [];
        
        if (conflicts1.includes(mixin2) || conflicts2.includes(mixin1)) {
          conflicts.push({ mixin1, mixin2 });
        }
      }
    }

    return conflicts;
  }

  private async collectAllSlots(templateId: string): Promise<TemplateSlot[]> {
    const template = templateInheritance.getBaseTemplate(templateId);
    if (!template) return [];

    let slots = [...template.slots];
    
    if (template.extends) {
      const parentSlots = await this.collectAllSlots(template.extends);
      slots = [...parentSlots, ...slots];
    }

    return slots;
  }

  private async collectAllProps(templateId: string): Promise<TemplateProp[]> {
    const template = templateInheritance.getBaseTemplate(templateId);
    if (!template) return [];

    let props = [...template.props];
    
    if (template.extends) {
      const parentProps = await this.collectAllProps(template.extends);
      props = [...parentProps, ...props];
    }

    return props;
  }

  private validatePropType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true; // Unknown type, allow it
    }
  }

  private async calculateTotalTokens(composition: TemplateComposition): Promise<number> {
    let totalTokens = 0;

    // Base template tokens
    const baseTemplate = templateInheritance.getBaseTemplate(composition.baseTemplate);
    if (baseTemplate) {
      totalTokens += baseTemplate.metadata.estimatedTokens;
    }

    // Mixin tokens
    for (const mixinId of composition.mixins) {
      const mixin = templateInheritance.getBaseTemplate(mixinId);
      if (mixin) {
        totalTokens += mixin.metadata.estimatedTokens;
      }
    }

    // Add overhead for composition complexity
    const compositionOverhead = composition.mixins.length * 50 + Object.keys(composition.slots).length * 25;
    totalTokens += compositionOverhead;

    return totalTokens;
  }

  /**
   * Initialize compliance requirements
   */
  private initializeComplianceRequirements(): void {
    // WCAG Compliance
    this.complianceRequirements.set('WCAG', {
      standard: 'WCAG',
      level: '2.1 AAA',
      checks: [
        {
          id: 'wcag-aria-labels',
          name: 'ARIA Labels',
          description: 'All interactive elements must have accessible names',
          validator: (template, composition) => {
            // Check if template includes aria-label props
            return template.props.some(prop => prop.name.includes('aria-label'));
          },
          errorMessage: 'Template missing ARIA label support for accessibility'
        },
        {
          id: 'wcag-keyboard-navigation',
          name: 'Keyboard Navigation',
          description: 'All functionality must be available via keyboard',
          validator: (template, composition) => {
            // Check if accessibility mixin is included
            return composition.mixins.includes('accessibility-enhanced-mixin');
          },
          errorMessage: 'Template does not include keyboard navigation support'
        },
        {
          id: 'wcag-color-contrast',
          name: 'Color Contrast',
          description: 'Text must have sufficient color contrast',
          validator: (template, composition) => {
            // Check if template uses semantic color tokens
            return template.metadata.tags.includes('ui-system');
          },
          errorMessage: 'Template may not meet color contrast requirements'
        }
      ]
    });

    // Norwegian Compliance
    this.complianceRequirements.set('Norwegian', {
      standard: 'Norwegian',
      level: 'Complete',
      checks: [
        {
          id: 'norwegian-locale',
          name: 'Norwegian Locale',
          description: 'Must support Norwegian language',
          validator: (template, composition) => {
            return template.metadata.norwegianCompliant;
          },
          errorMessage: 'Template does not support Norwegian locale'
        },
        {
          id: 'nsm-classification',
          name: 'NSM Classification',
          description: 'Must support NSM security classification',
          validator: (template, composition) => {
            return template.props.some(prop => prop.name === 'nsmClassification');
          },
          errorMessage: 'Template missing NSM classification support'
        },
        {
          id: 'gdpr-compliance',
          name: 'GDPR Compliance',
          description: 'Must support GDPR data protection requirements',
          validator: (template, composition) => {
            // Check if template supports data handling
            return template.metadata.tags.includes('gdpr') || 
                   template.category === 'utility' ||
                   composition.context.hasOwnProperty('dataProtection');
          },
          errorMessage: 'Template may not be GDPR compliant'
        }
      ]
    });

    consola.success('Initialized template composition validation system');
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
  }
}

// Singleton instance
export const templateCompositionValidator = new TemplateCompositionValidator();