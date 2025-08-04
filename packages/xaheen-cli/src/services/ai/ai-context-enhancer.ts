/**
 * AI Context Enhancement System
 * 
 * Optimizes template context for AI code generation with complexity estimation,
 * semantic hints, and predictable patterns for improved AI understanding.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import type { NSMClassification } from '../compliance/nsm-classifier.js';

export interface AIContextEnhancement {
  readonly complexity: ComplexityMetrics;
  readonly semanticHints: SemanticHints;
  readonly patterns: AIPatterns;
  readonly optimization: OptimizationHints;
  readonly generation: GenerationGuidance;
  readonly validation: ValidationCriteria;
}

export interface ComplexityMetrics {
  readonly componentComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  readonly estimatedTokens: number;
  readonly developmentTime: string; // e.g., "15 minutes"
  readonly maintenanceScore: number; // 1-10 scale
  readonly cognitiveLoad: 'low' | 'medium' | 'high';
  readonly aiDifficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
}

export interface SemanticHints {
  readonly primaryPurpose: string;
  readonly userInteractions: readonly string[];
  readonly dataFlow: readonly string[];
  readonly businessLogic: readonly string[];
  readonly integrationPoints: readonly string[];
  readonly accessibilityFeatures: readonly string[];
  readonly securityConsiderations: readonly string[];
}

export interface AIPatterns {
  readonly codeStructure: CodeStructurePattern;
  readonly namingConventions: NamingPattern;
  readonly componentComposition: CompositionPattern;
  readonly stateManagement: StatePattern;
  readonly errorHandling: ErrorPattern;
  readonly performance: PerformancePattern;
}

export interface CodeStructurePattern {
  readonly imports: ImportPattern;
  readonly interfaces: InterfacePattern;
  readonly component: ComponentPattern;
  readonly hooks: HookPattern;
  readonly helpers: HelperPattern;
  readonly exports: ExportPattern;
}

export interface ImportPattern {
  readonly order: readonly string[];
  readonly grouping: 'type' | 'source' | 'functionality';
  readonly aliasing: Record<string, string>;
}

export interface InterfacePattern {
  readonly propsNaming: string; // e.g., "ComponentNameProps"
  readonly readonly: boolean;
  readonly optional: string[]; // which props should be optional
  readonly required: string[]; // which props should be required
}

export interface ComponentPattern {
  readonly style: 'functional' | 'arrow' | 'declaration';
  readonly forwardRef: boolean;
  readonly displayName: boolean;
  readonly defaultProps: boolean;
}

export interface HookPattern {
  readonly order: readonly string[]; // useState, useEffect, useCallback, useMemo
  readonly naming: string; // prefix pattern
  readonly dependencies: 'explicit' | 'minimal' | 'comprehensive';
}

export interface HelperPattern {
  readonly location: 'inline' | 'bottom' | 'separate-file';
  readonly naming: string; // prefix pattern
  readonly pure: boolean; // prefer pure functions
}

export interface ExportPattern {
  readonly defaultExport: boolean;
  readonly namedExports: boolean;
  readonly typeExports: boolean;
}

export interface NamingPattern {
  readonly componentName: 'PascalCase' | 'camelCase';
  readonly propNames: 'camelCase' | 'kebab-case';
  readonly variableNames: 'camelCase' | 'snake_case';
  readonly functionNames: 'camelCase' | 'verb_noun';
  readonly constantNames: 'UPPER_CASE' | 'camelCase';
  readonly fileNames: 'kebab-case' | 'PascalCase' | 'camelCase';
}

export interface CompositionPattern {
  readonly preferredComponents: readonly string[];
  readonly avoidComponents: readonly string[];
  readonly nestingLimit: number;
  readonly conditionalRendering: 'ternary' | 'logical-and' | 'early-return';
  readonly listRendering: 'map' | 'forEach' | 'for-loop';
}

export interface StatePattern {
  readonly preferredHooks: readonly string[];
  readonly stateLocation: 'local' | 'parent' | 'global';
  readonly updatePatterns: readonly string[];
  readonly immutability: 'strict' | 'moderate' | 'flexible';
}

export interface ErrorPattern {
  readonly errorBoundaries: boolean;
  readonly tryBlocks: 'minimal' | 'comprehensive';
  readonly fallbackUI: boolean;
  readonly errorReporting: boolean;
}

export interface PerformancePattern {
  readonly memoization: readonly string[]; // useMemo, useCallback, React.memo
  readonly lazyLoading: boolean;
  readonly codesplitting: boolean;
  readonly bundleOptimization: boolean;
}

export interface OptimizationHints {
  readonly tokenEfficiency: TokenEfficiencyHints;
  readonly codeQuality: CodeQualityHints;
  readonly maintainability: MaintainabilityHints;
  readonly performance: PerformanceHints;
}

export interface TokenEfficiencyHints {
  readonly preferredStructures: readonly string[];
  readonly avoidVerbosity: readonly string[];
  readonly commonPatterns: readonly string[];
  readonly shortcuts: Record<string, string>;
}

export interface CodeQualityHints {
  readonly typeAnnotations: 'explicit' | 'inferred' | 'minimal';
  readonly documentation: 'comprehensive' | 'minimal' | 'none';
  readonly testing: 'unit' | 'integration' | 'e2e' | 'all';
  readonly linting: readonly string[];
}

export interface MaintainabilityHints {
  readonly modularity: 'high' | 'medium' | 'low';
  readonly reusability: readonly string[];
  readonly extensibility: readonly string[];
  readonly refactorability: readonly string[];
}

export interface PerformanceHints {
  readonly bundleSize: 'critical' | 'important' | 'moderate';
  readonly renderSpeed: 'critical' | 'important' | 'moderate';
  readonly memoryUsage: 'critical' | 'important' | 'moderate';
  readonly networkRequests: 'minimize' | 'optimize' | 'cache';
}

export interface GenerationGuidance {
  readonly stepByStep: readonly GenerationStep[];
  readonly commonPitfalls: readonly string[];
  readonly qualityChecks: readonly string[];
  readonly testingGuidance: readonly string[];
}

export interface GenerationStep {
  readonly step: number;
  readonly description: string;
  readonly focus: string;
  readonly validation: string;
}

export interface ValidationCriteria {
  readonly syntax: SyntaxValidation;
  readonly semantics: SemanticValidation;
  readonly accessibility: AccessibilityValidation;
  readonly performance: PerformanceValidation;
  readonly compliance: ComplianceValidation;
}

export interface SyntaxValidation {
  readonly typescript: boolean;
  readonly eslint: boolean;
  readonly prettier: boolean;
  readonly strictMode: boolean;
}

export interface SemanticValidation {
  readonly componentStructure: boolean;
  readonly propsValidation: boolean;
  readonly hookUsage: boolean;
  readonly errorHandling: boolean;
}

export interface AccessibilityValidation {
  readonly ariaLabels: boolean;
  readonly keyboardNavigation: boolean;
  readonly screenReader: boolean;
  readonly colorContrast: boolean;
}

export interface PerformanceValidation {
  readonly bundleSize: boolean;
  readonly renderMetrics: boolean;
  readonly memoryLeaks: boolean;
  readonly networkOptimization: boolean;
}

export interface ComplianceValidation {
  readonly nsmClassification: boolean;
  readonly gdprCompliance: boolean;
  readonly norwegianStandards: boolean;
  readonly wcagCompliance: boolean;
}

export class AIContextEnhancer {
  /**
   * Enhance template context for AI generation
   */
  enhanceTemplateContext(
    templateName: string,
    templateType: 'component' | 'page' | 'layout' | 'utility',
    requirements: {
      platform: string;
      complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
      nsmClassification: NSMClassification;
      norwegianCompliance: boolean;
      accessibility: 'A' | 'AA' | 'AAA';
      features: readonly string[];
    }
  ): AIContextEnhancement {
    consola.info(`Enhancing AI context for ${templateName} (${templateType})`);

    const complexity = this.calculateComplexityMetrics(requirements);
    const semanticHints = this.generateSemanticHints(templateName, templateType, requirements);
    const patterns = this.defineAIPatterns(templateType, requirements);
    const optimization = this.createOptimizationHints(requirements);
    const generation = this.buildGenerationGuidance(templateType, requirements);
    const validation = this.setupValidationCriteria(requirements);

    return {
      complexity,
      semanticHints,
      patterns,
      optimization,
      generation,
      validation
    };
  }

  /**
   * Calculate complexity metrics for AI planning
   */
  private calculateComplexityMetrics(requirements: any): ComplexityMetrics {
    const baseTokens = {
      simple: 200,
      moderate: 500,
      complex: 1000,
      advanced: 2000
    };

    const featureMultiplier = Math.max(1, requirements.features.length * 0.1);
    const complianceMultiplier = requirements.norwegianCompliance ? 1.3 : 1.1;
    const accessibilityMultiplier = requirements.accessibility === 'AAA' ? 1.4 : 1.2;

    const estimatedTokens = Math.round(
      baseTokens[requirements.complexity] * 
      featureMultiplier * 
      complianceMultiplier * 
      accessibilityMultiplier
    );

    const developmentTimeMap = {
      simple: '5-15 minutes',
      moderate: '15-45 minutes', 
      complex: '45-90 minutes',
      advanced: '2-4 hours'
    };

    const maintenanceScoreMap = {
      simple: 9,
      moderate: 7,
      complex: 5,
      advanced: 3
    };

    const cognitiveLoadMap = {
      simple: 'low' as const,
      moderate: 'medium' as const,
      complex: 'high' as const,
      advanced: 'high' as const
    };

    const aiDifficultyMap = {
      simple: 'easy' as const,
      moderate: 'moderate' as const,
      complex: 'challenging' as const,
      advanced: 'expert' as const
    };

    return {
      componentComplexity: requirements.complexity,
      estimatedTokens,
      developmentTime: developmentTimeMap[requirements.complexity],
      maintenanceScore: maintenanceScoreMap[requirements.complexity],
      cognitiveLoad: cognitiveLoadMap[requirements.complexity],
      aiDifficulty: aiDifficultyMap[requirements.complexity]
    };
  }

  /**
   * Generate semantic hints for AI understanding
   */
  private generateSemanticHints(templateName: string, templateType: string, requirements: any): SemanticHints {
    const purposeMap = {
      component: `Reusable ${templateName} component for UI composition`,
      page: `Complete ${templateName} page with navigation and content`,
      layout: `Layout wrapper for ${templateName} with common structure`,
      utility: `Utility component for ${templateName} functionality`
    };

    const baseInteractions = ['click', 'focus', 'blur', 'keyboard navigation'];
    const baseDataFlow = ['props input', 'state management', 'event handling'];
    const baseBusinessLogic = ['data validation', 'user feedback', 'error handling'];
    const baseIntegrations = ['UI System components', 'i18n translations'];

    const accessibilityFeatures = [
      'ARIA labels and roles',
      'Keyboard navigation support',
      'Screen reader compatibility',
      'Focus management',
      'Color contrast compliance'
    ];

    const securityConsiderations = [
      `NSM ${requirements.nsmClassification} classification`,
      'Input sanitization',
      'XSS prevention',
      'CSRF protection'
    ];

    if (requirements.norwegianCompliance) {
      securityConsiderations.push('GDPR compliance', 'Norwegian data protection');
    }

    return {
      primaryPurpose: purposeMap[templateType as keyof typeof purposeMap],
      userInteractions: baseInteractions,
      dataFlow: baseDataFlow,
      businessLogic: baseBusinessLogic,
      integrationPoints: baseIntegrations,
      accessibilityFeatures,
      securityConsiderations
    };
  }

  /**
   * Define AI-friendly patterns
   */
  private defineAIPatterns(templateType: string, requirements: any): AIPatterns {
    return {
      codeStructure: {
        imports: {
          order: ['React imports', 'UI System imports', 'Utility imports', 'Type imports'],
          grouping: 'functionality',
          aliasing: { 
            'React': 'React',
            '@xala-technologies/ui-system': 'UI components'
          }
        },
        interfaces: {
          propsNaming: '{{ComponentName}}Props',
          readonly: true,
          optional: ['data-testid', 'className', 'children'],
          required: ['id', 'title', 'required props based on functionality']
        },
        component: {
          style: 'arrow',
          forwardRef: true,
          displayName: true,
          defaultProps: false
        },
        hooks: {
          order: ['useState', 'useEffect', 'useCallback', 'useMemo', 'custom hooks'],
          naming: 'descriptive camelCase',
          dependencies: 'explicit'
        },
        helpers: {
          location: 'bottom',
          naming: 'verb + noun pattern',
          pure: true
        },
        exports: {
          defaultExport: true,
          namedExports: false,
          typeExports: true
        }
      },
      namingConventions: {
        componentName: 'PascalCase',
        propNames: 'camelCase',
        variableNames: 'camelCase',
        functionNames: 'camelCase',
        constantNames: 'UPPER_CASE',
        fileNames: 'kebab-case'
      },
      componentComposition: {
        preferredComponents: [
          'Container', 'Stack', 'Grid', 'Card', 'Text', 'Button', 'Input'
        ],
        avoidComponents: ['div', 'span', 'button', 'input'],
        nestingLimit: 5,
        conditionalRendering: 'logical-and',
        listRendering: 'map'
      },
      stateManagement: {
        preferredHooks: ['useState', 'useCallback', 'useMemo'],
        stateLocation: 'local',
        updatePatterns: ['functional updates', 'immutable updates'],
        immutability: 'strict'
      },
      errorHandling: {
        errorBoundaries: requirements.complexity !== 'simple',
        tryBlocks: 'minimal',
        fallbackUI: true,
        errorReporting: requirements.nsmClassification !== 'OPEN'
      },
      performance: {
        memoization: ['useCallback for event handlers', 'useMemo for expensive calculations'],
        lazyLoading: requirements.complexity === 'advanced',
        codesplitting: requirements.complexity === 'advanced',
        bundleOptimization: true
      }
    };
  }

  /**
   * Create optimization hints for AI
   */
  private createOptimizationHints(requirements: any): OptimizationHints {
    return {
      tokenEfficiency: {
        preferredStructures: [
          'Semantic component composition',
          'Hook-based state management',
          'Functional component patterns',
          'TypeScript interface definitions'
        ],
        avoidVerbosity: [
          'Excessive comments',
          'Redundant type annotations',
          'Unnecessary complexity',
          'Over-engineering'
        ],
        commonPatterns: [
          'forwardRef with TypeScript',
          'useCallback for event handlers',
          'useState with TypeScript',
          'Stack + Grid layouts'
        ],
        shortcuts: {
          'event handler': 'useCallback(() => {}, [])',
          'state hook': 'useState<Type>(initialValue)',
          'effect hook': 'useEffect(() => {}, [])',
          'semantic layout': 'Container > Stack > Grid pattern'
        }
      },
      codeQuality: {
        typeAnnotations: 'explicit',
        documentation: 'minimal',
        testing: 'unit',
        linting: ['ESLint', 'TypeScript', 'Accessibility']
      },
      maintainability: {
        modularity: 'high',
        reusability: ['Generic prop interfaces', 'Composable components'],
        extensibility: ['Slot patterns', 'Render prop patterns'],
        refactorability: ['Single responsibility', 'Clear dependencies']
      },
      performance: {
        bundleSize: 'important',
        renderSpeed: 'critical',
        memoryUsage: 'moderate',
        networkRequests: 'minimize'
      }
    };
  }

  /**
   * Build generation guidance for AI
   */
  private buildGenerationGuidance(templateType: string, requirements: any): GenerationGuidance {
    const baseSteps: GenerationStep[] = [
      {
        step: 1,
        description: 'Define imports and interfaces',
        focus: 'Type safety and semantic imports',
        validation: 'TypeScript compilation without errors'
      },
      {
        step: 2,
        description: 'Create component structure',
        focus: 'Semantic component composition',
        validation: 'Proper forwardRef and displayName'
      },
      {
        step: 3,
        description: 'Implement state and hooks',
        focus: 'Efficient state management',
        validation: 'Hook rules compliance'
      },
      {
        step: 4,
        description: 'Add accessibility features',
        focus: 'WCAG AAA compliance',
        validation: 'Accessibility testing passes'
      },
      {
        step: 5,
        description: 'Include Norwegian compliance',
        focus: 'NSM classification and GDPR',
        validation: 'Compliance validation passes'
      }
    ];

    const commonPitfalls = [
      'Forgetting forwardRef for component composition',
      'Not adding displayName for debugging',
      'Missing accessibility attributes',
      'Incorrect hook dependency arrays',
      'Not following semantic component patterns',
      'Missing Norwegian compliance features',
      'Inadequate TypeScript typing'
    ];

    const qualityChecks = [
      'TypeScript strict mode compilation',
      'ESLint passes without warnings',
      'Accessibility validation passes',
      'Norwegian compliance validation',
      'Performance metrics within thresholds',
      'Bundle size optimization',
      'Semantic component usage verification'
    ];

    const testingGuidance = [
      'Unit tests for component behavior',
      'Accessibility testing with screen readers',
      'Keyboard navigation testing',
      'Norwegian compliance validation',
      'Performance testing for render speed',
      'Type safety validation',
      'Cross-browser compatibility testing'
    ];

    return {
      stepByStep: baseSteps,
      commonPitfalls,
      qualityChecks,
      testingGuidance
    };
  }

  /**
   * Setup validation criteria
   */
  private setupValidationCriteria(requirements: any): ValidationCriteria {
    return {
      syntax: {
        typescript: true,
        eslint: true,
        prettier: true,
        strictMode: true
      },
      semantics: {
        componentStructure: true,
        propsValidation: true,
        hookUsage: true,
        errorHandling: true
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReader: true,
        colorContrast: true
      },
      performance: {
        bundleSize: true,
        renderMetrics: true,
        memoryLeaks: true,
        networkOptimization: true
      },
      compliance: {
        nsmClassification: true,
        gdprCompliance: requirements.norwegianCompliance,
        norwegianStandards: requirements.norwegianCompliance,
        wcagCompliance: true
      }
    };
  }

  /**
   * Generate AI-friendly template context variables
   */
  generateAITemplateContext(
    enhancement: AIContextEnhancement,
    templateName: string
  ): Record<string, any> {
    return {
      // AI Context Variables
      aiContext: {
        complexity: enhancement.complexity,
        hints: enhancement.semanticHints,
        patterns: enhancement.patterns,
        optimization: enhancement.optimization
      },

      // Template Generation Guidance
      mcpAIHints: [
        `Primary purpose: ${enhancement.semanticHints.primaryPurpose}`,
        `Complexity: ${enhancement.complexity.componentComplexity}`,
        `Estimated tokens: ${enhancement.complexity.estimatedTokens}`,
        `AI difficulty: ${enhancement.complexity.aiDifficulty}`,
        ...enhancement.generation.qualityChecks.slice(0, 3)
      ],

      mcpComplexity: enhancement.complexity.componentComplexity,
      mcpTokens: enhancement.complexity.estimatedTokens,
      mcpPatterns: enhancement.semanticHints.userInteractions.join(', '),

      // Code Structure Hints
      importOrder: enhancement.patterns.codeStructure.imports.order,
      componentStyle: enhancement.patterns.codeStructure.component.style,
      hookOrder: enhancement.patterns.codeStructure.hooks.order,

      // Quality Hints
      qualityChecks: enhancement.generation.qualityChecks,
      commonPitfalls: enhancement.generation.commonPitfalls,
      testingGuidance: enhancement.generation.testingGuidance,

      // Validation Criteria
      validationCriteria: enhancement.validation
    };
  }
}

// Singleton instance
export const aiContextEnhancer = new AIContextEnhancer();