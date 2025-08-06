/**
 * Template Composition System
 * 
 * Advanced template composition with slot system, mixins, and context-aware generation.
 * Enables flexible content injection and reusable component patterns.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import fs from 'fs-extra';
import path from 'node:path';
import Handlebars from 'handlebars';
import { consola } from 'consola';
import type { BaseTemplate, TemplateComposition, InheritanceResult } from "./template-inheritance";

export interface TemplatePartial {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'ui' | 'layout' | 'logic' | 'data' | 'style';
  readonly content: string;
  readonly props: readonly string[];
  readonly dependencies: readonly string[];
  readonly platform: string;
}

export interface TemplateSlotConfig {
  readonly name: string;
  readonly content: string;
  readonly fallback?: string;
  readonly validation?: (content: string) => boolean;
  readonly transform?: (content: string) => string;
}

export interface TemplateMixin {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly content: string;
  readonly insertionPoint: 'before' | 'after' | 'replace' | 'wrap';
  readonly target?: string; // Selector or pattern to target
  readonly props: readonly string[];
  readonly conditions?: Record<string, any>; // When to apply this mixin
}

export interface CompositionContext {
  readonly componentName: string;
  readonly platform: string;
  readonly businessContext?: 'ecommerce' | 'saas' | 'portfolio' | 'blog' | 'corporate' | 'government';
  readonly theme: 'enterprise' | 'finance' | 'healthcare' | 'education' | 'ecommerce' | 'productivity';
  readonly accessibility: 'A' | 'AA' | 'AAA';
  readonly norwegianCompliant: boolean;
  readonly props: Record<string, any>;
  readonly features: Record<string, boolean>;
  readonly customization: Record<string, any>;
}

export interface CompositionResult {
  readonly template: string;
  readonly metadata: {
    readonly appliedPartials: readonly string[];
    readonly appliedMixins: readonly string[];
    readonly resolvedSlots: readonly string[];
    readonly generatedFiles: readonly string[];
    readonly dependencies: readonly string[];
  };
  readonly context: CompositionContext;
}

export class TemplateComposer {
  private partials: Map<string, TemplatePartial> = new Map();
  private mixins: Map<string, TemplateMixin> = new Map();
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.initializeHelpers();
    this.initializePartials();
    this.initializeMixins();
  }

  /**
   * Register a template partial
   */
  registerPartial(partial: TemplatePartial): void {
    this.partials.set(partial.id, partial);
    this.handlebars.registerPartial(partial.id, partial.content);
    consola.debug(`Registered template partial: ${partial.name} (${partial.id})`);
  }

  /**
   * Register a template mixin
   */
  registerMixin(mixin: TemplateMixin): void {
    this.mixins.set(mixin.id, mixin);
    consola.debug(`Registered template mixin: ${mixin.name} (${mixin.id})`);
  }

  /**
   * Compose template with advanced slot system and mixins
   */
  async composeTemplate(
    baseTemplate: string,
    slots: TemplateSlotConfig[],
    mixins: string[],
    context: CompositionContext
  ): Promise<CompositionResult> {
    consola.info(`Composing template for ${context.componentName} with ${slots.length} slots and ${mixins.length} mixins`);

    let composedTemplate = baseTemplate;
    const appliedPartials: string[] = [];
    const appliedMixins: string[] = [];
    const resolvedSlots: string[] = [];
    const dependencies = new Set<string>();

    // Process slots with validation and transformation
    for (const slot of slots) {
      const processedSlot = this.processSlot(slot, context);
      composedTemplate = this.injectSlot(composedTemplate, slot.name, processedSlot);
      resolvedSlots.push(slot.name);
    }

    // Apply mixins based on context
    for (const mixinId of mixins) {
      const mixin = this.mixins.get(mixinId);
      if (mixin && this.shouldApplyMixin(mixin, context)) {
        composedTemplate = this.applyMixin(composedTemplate, mixin, context);
        appliedMixins.push(mixinId);
        mixin.props.forEach(dep => dependencies.add(dep));
      }
    }

    // Apply context-aware transformations
    composedTemplate = this.applyContextTransformations(composedTemplate, context);

    // Compile with Handlebars
    const template = this.handlebars.compile(composedTemplate);
    const finalTemplate = template(context);

    return {
      template: finalTemplate,
      metadata: {
        appliedPartials,
        appliedMixins,
        resolvedSlots,
        generatedFiles: this.getGeneratedFiles(context),
        dependencies: Array.from(dependencies)
      },
      context
    };
  }

  /**
   * Process slot with validation and transformation
   */
  private processSlot(slot: TemplateSlotConfig, context: CompositionContext): string {
    let content = slot.content;

    // Apply validation if provided
    if (slot.validation && !slot.validation(content)) {
      consola.warn(`Slot ${slot.name} failed validation, using fallback`);
      content = slot.fallback || '';
    }

    // Apply transformation if provided
    if (slot.transform) {
      content = slot.transform(content);
    }

    // Apply context-specific transformations
    content = this.applySlotContextTransformations(content, slot.name, context);

    return content;
  }

  /**
   * Inject slot content into template
   */
  private injectSlot(template: string, slotName: string, content: string): string {
    // Replace slot blocks
    const slotBlockRegex = new RegExp(`\\{\\{#slot\\s+${slotName}\\}\\}[\\s\\S]*?\\{\\{/slot\\}\\}`, 'g');
    template = template.replace(slotBlockRegex, content);

    // Replace slot references
    const slotRefRegex = new RegExp(`\\{\\{>\\s*${slotName}\\}\\}`, 'g');
    template = template.replace(slotRefRegex, content);

    return template;
  }

  /**
   * Apply mixin to template
   */
  private applyMixin(template: string, mixin: TemplateMixin, context: CompositionContext): string {
    let processedMixin = mixin.content;

    // Replace mixin variables with context values
    processedMixin = this.handlebars.compile(processedMixin)(context);

    switch (mixin.insertionPoint) {
      case 'before':
        if (mixin.target) {
          const targetRegex = new RegExp(mixin.target, 'g');
          template = template.replace(targetRegex, `${processedMixin}\n$&`);
        } else {
          template = `${processedMixin}\n${template}`;
        }
        break;

      case 'after':
        if (mixin.target) {
          const targetRegex = new RegExp(mixin.target, 'g');
          template = template.replace(targetRegex, `$&\n${processedMixin}`);
        } else {
          template = `${template}\n${processedMixin}`;
        }
        break;

      case 'replace':
        if (mixin.target) {
          const targetRegex = new RegExp(mixin.target, 'g');
          template = template.replace(targetRegex, processedMixin);
        }
        break;

      case 'wrap':
        if (mixin.target) {
          const targetRegex = new RegExp(`(${mixin.target})`, 'g');
          template = template.replace(targetRegex, processedMixin.replace('$CONTENT$', '$1'));
        }
        break;
    }

    return template;
  }

  /**
   * Check if mixin should be applied based on context and conditions
   */
  private shouldApplyMixin(mixin: TemplateMixin, context: CompositionContext): boolean {
    if (!mixin.conditions) return true;

    return Object.entries(mixin.conditions).every(([key, value]) => {
      const contextValue = (context as any)[key];
      
      if (typeof value === 'boolean') {
        return contextValue === value;
      }
      
      if (Array.isArray(value)) {
        return value.includes(contextValue);
      }
      
      return contextValue === value;
    });
  }

  /**
   * Apply context-aware transformations to template
   */
  private applyContextTransformations(template: string, context: CompositionContext): string {
    let transformedTemplate = template;

    // Business context transformations
    if (context.businessContext) {
      transformedTemplate = this.applyBusinessContextTransforms(transformedTemplate, context.businessContext);
    }

    // Accessibility transformations
    if (context.accessibility === 'AAA') {
      transformedTemplate = this.applyAccessibilityTransforms(transformedTemplate);
    }

    // Norwegian compliance transformations
    if (context.norwegianCompliant) {
      transformedTemplate = this.applyNorwegianComplianceTransforms(transformedTemplate);
    }

    // Theme-specific transformations
    transformedTemplate = this.applyThemeTransforms(transformedTemplate, context.theme);

    return transformedTemplate;
  }

  /**
   * Apply slot-specific context transformations
   */
  private applySlotContextTransformations(
    content: string, 
    slotName: string, 
    context: CompositionContext
  ): string {
    // Apply platform-specific transformations
    if (context.platform === 'react-native') {
      content = this.applyReactNativeTransforms(content, slotName);
    }

    // Apply feature-specific transformations
    if (context.features.darkMode && slotName === 'styles') {
      content = this.applyDarkModeTransforms(content);
    }

    return content;
  }

  /**
   * Apply business context specific transforms
   */
  private applyBusinessContextTransforms(template: string, businessContext: string): string {
    const transforms: Record<string, (template: string) => string> = {
      ecommerce: (tpl) => this.addEcommerceFeatures(tpl),
      saas: (tpl) => this.addSaaSFeatures(tpl),
      government: (tpl) => this.addGovernmentCompliance(tpl),
      healthcare: (tpl) => this.addHealthcareCompliance(tpl),
      finance: (tpl) => this.addFinanceCompliance(tpl)
    };

    const transform = transforms[businessContext];
    return transform ? transform(template) : template;
  }

  /**
   * Apply accessibility transforms for AAA compliance
   */
  private applyAccessibilityTransforms(template: string): string {
    // Add skip links
    template = template.replace(
      '<main',
      '<div className="skip-links">\n  <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>\n</div>\n<main id="main-content"'
    );

    // Add aria labels where missing
    template = template.replace(
      /<button(?![^>]*aria-label)/g,
      '<button aria-label="Action button"'
    );

    // Add focus management
    template = template.replace(
      'className="',
      'className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 '
    );

    return template;
  }

  /**
   * Apply Norwegian compliance transforms
   */
  private applyNorwegianComplianceTransforms(template: string): string {
    // Add Norwegian language attributes
    template = template.replace('<html', '<html lang="nb-NO"');
    
    // Add Norwegian date formatting
    template = template.replace(
      /new Date\(\)\.toLocaleDateString\(\)/g,
      'new Date().toLocaleDateString("nb-NO")'
    );

    // Add GDPR compliance notice
    if (!template.includes('gdpr-compliance')) {
      template += '\n{/* GDPR Compliance Notice */}\n<div className="sr-only">GDPR-kompatibel komponent</div>';
    }

    return template;
  }

  /**
   * Apply theme-specific transforms
   */
  private applyThemeTransforms(template: string, theme: string): string {
    const themeClasses: Record<string, string> = {
      enterprise: 'bg-slate-50 text-slate-900 border-slate-200',
      finance: 'bg-blue-50 text-blue-900 border-blue-200',
      healthcare: 'bg-green-50 text-green-900 border-green-200',
      education: 'bg-indigo-50 text-indigo-900 border-indigo-200'
    };

    const themeClass = themeClasses[theme] || themeClasses.enterprise;
    
    // Apply theme classes to main containers
    template = template.replace(
      'className="',
      `className="${themeClass} `
    );

    return template;
  }

  /**
   * Add e-commerce specific features
   */
  private addEcommerceFeatures(template: string): string {
    // Add product schema markup
    template += '\n{/* E-commerce Schema */}\n<script type="application/ld+json">\n{JSON.stringify({ "@type": "Product" })}\n</script>';
    return template;
  }

  /**
   * Add SaaS specific features
   */
  private addSaaSFeatures(template: string): string {
    // Add subscription tracking
    template += '\n{/* SaaS Analytics */}\n<div data-analytics="saas-component" className="sr-only">SaaS tracking enabled</div>';
    return template;
  }

  /**
   * Add government compliance features
   */
  private addGovernmentCompliance(template: string): string {
    // Add NSM classification
    template += '\n{/* Government Compliance */}\n<meta name="nsm-classification" content="OPEN" />';
    return template;
  }

  /**
   * Add healthcare compliance features
   */
  private addHealthcareCompliance(template: string): string {
    // Add HIPAA compliance notice
    template += '\n{/* Healthcare Compliance */}\n<div className="sr-only">HIPAA-compliant component</div>';
    return template;
  }

  /**
   * Add finance compliance features
   */
  private addFinanceCompliance(template: string): string {
    // Add PCI compliance notice
    template += '\n{/* Finance Compliance */}\n<div className="sr-only">PCI-compliant component</div>';
    return template;
  }

  /**
   * Apply React Native specific transforms
   */
  private applyReactNativeTransforms(content: string, slotName: string): string {
    if (slotName === 'styles') {
      // Convert web styles to React Native
      content = content.replace(/className="/g, 'style={styles.');
      content = content.replace(/"/g, '}');
    }
    return content;
  }

  /**
   * Apply dark mode transforms
   */
  private applyDarkModeTransforms(content: string): string {
    // Add dark mode classes
    content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-900');
    content = content.replace(/text-black/g, 'text-black dark:text-white');
    return content;
  }

  /**
   * Get list of files that will be generated based on context
   */
  private getGeneratedFiles(context: CompositionContext): string[] {
    const files = [`${context.componentName}.tsx`];
    
    if (context.features.storybook) {
      files.push(`${context.componentName}.stories.tsx`);
    }
    
    if (context.features.tests) {
      files.push(`${context.componentName}.test.tsx`);
    }
    
    if (context.norwegianCompliant) {
      files.push(`locales/nb-NO/${context.componentName.toLowerCase()}.json`);
    }

    return files;
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHelpers(): void {
    // Conditional helper
    this.handlebars.registerHelper('if_eq', function(this: any, a: any, b: any, options: any) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    // Norwegian date helper
    this.handlebars.registerHelper('norwegian_date', function(date: Date) {
      return new Intl.DateTimeFormat('nb-NO').format(date);
    });

    // Accessibility helper
    const SafeString = this.handlebars.SafeString;
    this.handlebars.registerHelper('aria_label', function(text: string) {
      return new SafeString(`aria-label="${text}"`);
    });

    // Platform-specific helper (simplified - platform context needed from caller)
    this.handlebars.registerHelper('platform_specific', function(platform: string, content: string, targetPlatform: string) {
      return platform === targetPlatform ? content : '';
    });

    consola.debug('Initialized Handlebars helpers');
  }

  /**
   * Initialize built-in partials
   */
  private initializePartials(): void {
    // Error boundary partial
    this.registerPartial({
      id: 'error-boundary',
      name: 'Error Boundary',
      description: 'React error boundary wrapper',
      category: 'logic',
      content: `
        try {
          return (
            $CONTENT$
          );
        } catch (error) {
          console.error('Component error:', error);
          return (
            <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
              <p className="text-destructive font-medium">
                Error rendering component
              </p>
            </div>
          );
        }
      `,
      props: [],
      dependencies: [],
      platform: 'react'
    });

    // Loading state partial
    this.registerPartial({
      id: 'loading-state',
      name: 'Loading State',
      description: 'Loading spinner component',
      category: 'ui',
      content: `
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        )}
      `,
      props: ['isLoading'],
      dependencies: [],
      platform: 'react'
    });

    consola.debug('Initialized built-in partials');
  }

  /**
   * Initialize built-in mixins
   */
  private initializeMixins(): void {
    // Analytics mixin
    this.registerMixin({
      id: 'analytics-tracking',
      name: 'Analytics Tracking',
      description: 'Adds analytics tracking to components',
      content: `
        // Analytics tracking
        useEffect(() => {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'component_render', {
              component_name: '{{componentName}}',
              component_type: '{{category}}'
            });
          }
        }, []);
      `,
      insertionPoint: 'after',
      target: 'const \\[.*?\\] = useState',
      props: [],
      conditions: {
        features: { analytics: true }
      }
    });

    // Dark mode mixin
    this.registerMixin({
      id: 'dark-mode-support',
      name: 'Dark Mode Support',
      description: 'Adds dark mode theme support',
      content: `
        // Dark mode support
        const { theme, toggleTheme } = useTheme();
        const isDark = theme === 'dark';
      `,
      insertionPoint: 'after',
      target: 'const \\[.*?\\] = useState',
      props: [],
      conditions: {
        features: { darkMode: true }
      }
    });

    consola.debug('Initialized built-in mixins');
  }
}

// Singleton instance
export const templateComposer = new TemplateComposer();