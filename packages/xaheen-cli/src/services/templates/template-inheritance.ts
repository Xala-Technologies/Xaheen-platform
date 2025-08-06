/**
 * Template Inheritance System
 * 
 * Provides template inheritance capabilities with base templates, mixins,
 * and composition patterns for the Xaheen CLI.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { consola } from 'consola';
import type { NSMClassification } from '../compliance/nsm-classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BaseTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'component' | 'page' | 'layout' | 'utility';
  readonly platform: string;
  readonly path: string;
  readonly extends?: string; // Parent template ID
  readonly mixins?: readonly string[]; // Mixin template IDs
  readonly slots: readonly TemplateSlot[];
  readonly props: readonly TemplateProp[];
  readonly metadata: TemplateMetadata;
}

export interface TemplateSlot {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly defaultContent?: string;
  readonly allowedTypes?: readonly string[];
}

export interface TemplateProp {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  readonly description: string;
  readonly required: boolean;
  readonly defaultValue?: any;
  readonly validation?: string; // Regex or validation rule
}

export interface TemplateMetadata {
  readonly version: string;
  readonly author: string;
  readonly created: string;
  readonly lastModified: string;
  readonly tags: readonly string[];
  readonly complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  readonly estimatedTokens: number;
  readonly nsmClassification: NSMClassification;
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly norwegianCompliant: boolean;
}

export interface TemplateComposition {
  readonly baseTemplate: string;
  readonly mixins: readonly string[];
  readonly overrides: Record<string, any>;
  readonly slots: Record<string, string>;
  readonly context: Record<string, any>;
}

export interface InheritanceResult {
  readonly compiledTemplate: string;
  readonly resolvedProps: readonly TemplateProp[];
  readonly resolvedSlots: readonly TemplateSlot[];
  readonly inheritanceChain: readonly string[];
  readonly appliedMixins: readonly string[];
  readonly metadata: TemplateMetadata;
}

export class TemplateInheritance {
  private baseTemplates: Map<string, BaseTemplate> = new Map();
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.resolve(__dirname, '../../templates');
    this.initializeBaseTemplates();
  }

  /**
   * Register a base template
   */
  registerBaseTemplate(template: BaseTemplate): void {
    this.baseTemplates.set(template.id, template);
    consola.debug(`Registered base template: ${template.name} (${template.id})`);
  }

  /**
   * Get base template by ID
   */
  getBaseTemplate(id: string): BaseTemplate | null {
    return this.baseTemplates.get(id) || null;
  }

  /**
   * List all base templates
   */
  listBaseTemplates(category?: BaseTemplate['category'], platform?: string): BaseTemplate[] {
    const templates = Array.from(this.baseTemplates.values());
    
    return templates.filter(template => {
      if (category && template.category !== category) return false;
      if (platform && template.platform !== platform) return false;
      return true;
    });
  }

  /**
   * Compose template with inheritance and mixins
   */
  composeTemplate(composition: TemplateComposition): InheritanceResult {
    consola.info(`Composing template with base: ${composition.baseTemplate}`);

    const baseTemplate = this.baseTemplates.get(composition.baseTemplate);
    if (!baseTemplate) {
      throw new Error(`Base template not found: ${composition.baseTemplate}`);
    }

    // Build inheritance chain
    const inheritanceChain = this.buildInheritanceChain(baseTemplate.id);
    consola.debug(`Inheritance chain: ${inheritanceChain.join(' -> ')}`);

    // Resolve all templates in chain
    const chainTemplates = inheritanceChain.map(id => this.resolveTemplate(id));

    // Resolve mixins
    const mixinTemplates = composition.mixins.map(id => this.resolveTemplate(id));

    // Merge templates (base -> parent -> child, then mixins)
    let mergedTemplate = '';
    let resolvedProps: TemplateProp[] = [];
    let resolvedSlots: TemplateSlot[] = [];

    // Apply inheritance chain
    for (const template of chainTemplates) {
      mergedTemplate = this.mergeTemplateContent(mergedTemplate, template.content);
      resolvedProps = this.mergeProps(resolvedProps, template.props);
      resolvedSlots = this.mergeSlots(resolvedSlots, template.slots);
    }

    // Apply mixins
    for (const mixin of mixinTemplates) {
      mergedTemplate = this.applyMixin(mergedTemplate, mixin.content);
      resolvedProps = this.mergeProps(resolvedProps, mixin.props);
      resolvedSlots = this.mergeSlots(resolvedSlots, mixin.slots);
    }

    // Apply slot content
    const processedTemplate = this.processSlots(mergedTemplate, composition.slots);

    // Apply context and compile
    const finalTemplate = this.applyContext(processedTemplate, {
      ...composition.context,
      ...composition.overrides
    });

    return {
      compiledTemplate: finalTemplate,
      resolvedProps,
      resolvedSlots,
      inheritanceChain,
      appliedMixins: composition.mixins,
      metadata: this.mergeMetadata(chainTemplates.concat(mixinTemplates))
    };
  }

  /**
   * Create component from template composition
   */
  createComponent(
    componentName: string,
    composition: TemplateComposition,
    outputPath: string
  ): void {
    const result = this.composeTemplate(composition);
    
    // Compile template with component name
    const template = Handlebars.compile(result.compiledTemplate);
    const output = template({
      componentName,
      ...composition.context,
      ...composition.overrides
    });

    // Ensure output directory exists
    if (!existsSync(path.dirname(outputPath))) {
      mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    
    // Write component file
    writeFileSync(outputPath, output, 'utf-8');
    
    consola.success(`Created component: ${componentName} at ${outputPath}`);
  }

  /**
   * Build inheritance chain from child to root
   */
  private buildInheritanceChain(templateId: string): string[] {
    const chain: string[] = [];
    let currentId = templateId;

    while (currentId) {
      const template = this.baseTemplates.get(currentId);
      if (!template) {
        throw new Error(`Template not found in chain: ${currentId}`);
      }

      chain.unshift(currentId); // Add to beginning for root-first order
      currentId = template.extends || '';
    }

    return chain;
  }

  /**
   * Resolve template content and metadata
   */
  private resolveTemplate(templateId: string): {
    content: string;
    props: TemplateProp[];
    slots: TemplateSlot[];
    metadata: TemplateMetadata;
  } {
    const template = this.baseTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const templatePath = path.join(this.templatesPath, template.path);
    const content = readFileSync(templatePath, 'utf-8');

    return {
      content,
      props: [...template.props],
      slots: [...template.slots],
      metadata: template.metadata
    };
  }

  /**
   * Merge template content using Handlebars partials
   */
  private mergeTemplateContent(base: string, child: string): string {
    if (!base) return child;
    
    // Look for {{>parent}} or {{>super}} blocks in child
    if (child.includes('{{>parent}}') || child.includes('{{>super}}')) {
      return child.replace(/\{\{>(?:parent|super)\}\}/g, base);
    }
    
    // Default: child overrides base
    return child;
  }

  /**
   * Apply mixin to template
   */
  private applyMixin(template: string, mixin: string): string {
    // Look for mixin insertion points or append to template
    if (template.includes('{{>mixins}}')) {
      return template.replace('{{>mixins}}', mixin);
    }
    
    // Insert mixin before closing of main component
    const insertionPoint = template.lastIndexOf('  }\n);');
    if (insertionPoint !== -1) {
      return template.slice(0, insertionPoint) + 
             '\n    // Mixin content\n' +
             mixin + '\n' +
             template.slice(insertionPoint);
    }
    
    return template + '\n' + mixin;
  }

  /**
   * Process slot placeholders
   */
  private processSlots(template: string, slots: Record<string, string>): string {
    let processedTemplate = template;
    
    for (const [slotName, slotContent] of Object.entries(slots)) {
      const slotRegex = new RegExp(`\\{\\{#slot\\s+${slotName}\\}\\}[\\s\\S]*?\\{\\{/slot\\}\\}`, 'g');
      const fallbackRegex = new RegExp(`\\{\\{>\\s*${slotName}\\}\\}`, 'g');
      
      // Replace slot blocks
      processedTemplate = processedTemplate.replace(slotRegex, slotContent);
      // Replace slot references
      processedTemplate = processedTemplate.replace(fallbackRegex, slotContent);
    }
    
    return processedTemplate;
  }

  /**
   * Apply context variables to template
   */
  private applyContext(template: string, _context: Record<string, any>): string {
    // This would normally use Handlebars compilation, but for now we'll return as-is
    // The actual compilation happens when the template is used
    return template;
  }

  /**
   * Merge props from multiple templates
   */
  private mergeProps(base: TemplateProp[], additional: TemplateProp[]): TemplateProp[] {
    const merged = [...base];
    const existingNames = new Set(base.map(prop => prop.name));
    
    for (const prop of additional) {
      if (!existingNames.has(prop.name)) {
        merged.push(prop);
        existingNames.add(prop.name);
      }
    }
    
    return merged;
  }

  /**
   * Merge slots from multiple templates
   */
  private mergeSlots(base: TemplateSlot[], additional: TemplateSlot[]): TemplateSlot[] {
    const merged = [...base];
    const existingNames = new Set(base.map(slot => slot.name));
    
    for (const slot of additional) {
      if (!existingNames.has(slot.name)) {
        merged.push(slot);
        existingNames.add(slot.name);
      }
    }
    
    return merged;
  }

  /**
   * Merge metadata from multiple templates
   */
  private mergeMetadata(templates: Array<{ metadata: TemplateMetadata }>): TemplateMetadata {
    if (templates.length === 0) {
      throw new Error('No templates to merge metadata from');
    }

    const base = templates[0].metadata;
    const allTags = new Set<string>();
    let maxComplexity: TemplateMetadata['complexity'] = 'simple';
    let totalTokens = 0;
    let highestWCAG: 'A' | 'AA' | 'AAA' = 'A';
    let highestNSM: NSMClassification = 'OPEN';

    // Merge from all templates
    for (const template of templates) {
      const meta = template.metadata;
      
      // Collect tags
      meta.tags.forEach(tag => allTags.add(tag));
      
      // Get highest complexity
      const complexityOrder = { simple: 0, moderate: 1, complex: 2, advanced: 3 };
      if (complexityOrder[meta.complexity] > complexityOrder[maxComplexity]) {
        maxComplexity = meta.complexity;
      }
      
      // Sum tokens
      totalTokens += meta.estimatedTokens;
      
      // Get highest WCAG level
      const wcagOrder = { A: 0, AA: 1, AAA: 2 };
      if (wcagOrder[meta.wcagLevel] > wcagOrder[highestWCAG]) {
        highestWCAG = meta.wcagLevel;
      }
      
      // Get highest NSM classification
      const nsmOrder = { OPEN: 0, RESTRICTED: 1, CONFIDENTIAL: 2, SECRET: 3 };
      if (nsmOrder[meta.nsmClassification] > nsmOrder[highestNSM]) {
        highestNSM = meta.nsmClassification;
      }
    }

    return {
      ...base,
      tags: Array.from(allTags),
      complexity: maxComplexity,
      estimatedTokens: totalTokens,
      wcagLevel: highestWCAG,
      nsmClassification: highestNSM,
      norwegianCompliant: templates.every(t => t.metadata.norwegianCompliant),
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Initialize built-in base templates
   */
  private initializeBaseTemplates(): void {
    // Base Component Template
    this.registerBaseTemplate({
      id: 'base-component',
      name: 'Base Component',
      description: 'Base template for all React components with UI System integration',
      category: 'component',
      platform: 'react',
      path: 'base/base-component.hbs',
      slots: [
        {
          name: 'imports',
          description: 'Additional imports section',
          required: false,
          defaultContent: ''
        },
        {
          name: 'interfaces',
          description: 'Component interfaces and types',
          required: false,
          defaultContent: ''
        },
        {
          name: 'content',
          description: 'Main component content',
          required: true
        },
        {
          name: 'helpers',
          description: 'Helper functions and utilities',
          required: false,
          defaultContent: ''
        }
      ],
      props: [
        {
          name: 'componentName',
          type: 'string',
          description: 'Name of the component',
          required: true
        },
        {
          name: 'nsmClassification',
          type: 'string',
          description: 'NSM security classification',
          required: false,
          defaultValue: 'OPEN'
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['base', 'component', 'react', 'ui-system'],
        complexity: 'simple',
        estimatedTokens: 500,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Form Component Template
    this.registerBaseTemplate({
      id: 'form-component',
      name: 'Form Component',
      description: 'Base template for form components with validation',
      category: 'component',
      platform: 'react',
      path: 'base/form-component.hbs',
      extends: 'base-component',
      slots: [
        {
          name: 'form-fields',
          description: 'Form fields content',
          required: true
        },
        {
          name: 'validation',
          description: 'Validation logic',
          required: false,
          defaultContent: ''
        },
        {
          name: 'actions',
          description: 'Form action buttons',
          required: false,
          defaultContent: '<Button type="submit" variant="primary">Submit</Button>'
        }
      ],
      props: [
        {
          name: 'onSubmit',
          type: 'object',
          description: 'Form submission handler',
          required: false
        },
        {
          name: 'validation',
          type: 'object',
          description: 'Validation configuration',
          required: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['form', 'component', 'react', 'validation'],
        complexity: 'moderate',
        estimatedTokens: 800,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Dashboard Layout Template
    this.registerBaseTemplate({
      id: 'dashboard-layout',
      name: 'Dashboard Layout',
      description: 'Base template for dashboard layouts with navigation',
      category: 'layout',
      platform: 'react',
      path: 'base/dashboard-layout.hbs',
      extends: 'base-component',
      slots: [
        {
          name: 'header',
          description: 'Dashboard header content',
          required: false,
          defaultContent: '<Text variant="h1">Dashboard</Text>'
        },
        {
          name: 'sidebar',
          description: 'Sidebar navigation content',
          required: false,
          defaultContent: ''
        },
        {
          name: 'main-content',
          description: 'Main dashboard content area',
          required: true
        },
        {
          name: 'footer',
          description: 'Dashboard footer content',
          required: false,
          defaultContent: ''
        }
      ],
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Dashboard title',
          required: false,
          defaultValue: 'Dashboard'
        },
        {
          name: 'showSidebar',
          type: 'boolean',
          description: 'Whether to show sidebar',
          required: false,
          defaultValue: true
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['layout', 'dashboard', 'navigation', 'react'],
        complexity: 'complex',
        estimatedTokens: 1200,
        nsmClassification: 'RESTRICTED',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Norwegian Compliance Mixin
    this.registerBaseTemplate({
      id: 'norwegian-compliance-mixin',
      name: 'Norwegian Compliance Mixin', 
      description: 'Mixin for Norwegian compliance features',
      category: 'utility',
      platform: 'react',
      path: 'mixins/norwegian-compliance.hbs',
      slots: [],
      props: [
        {
          name: 'language',
          type: 'string',
          description: 'Norwegian language variant',
          required: false,
          defaultValue: 'nb-NO'
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['mixin', 'norwegian', 'compliance', 'i18n'],
        complexity: 'simple',
        estimatedTokens: 200,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Base Page Template
    this.registerBaseTemplate({
      id: 'base-page',
      name: 'Base Page',
      description: 'Base template for page components with SEO and metadata',
      category: 'page',
      platform: 'react',
      path: 'base/base-page.hbs',
      extends: 'base-component',
      slots: [
        {
          name: 'seo-head',
          description: 'Additional SEO head content',
          required: false,
          defaultContent: ''
        },
        {
          name: 'page-header',
          description: 'Page header content',
          required: false,
          defaultContent: ''
        },
        {
          name: 'page-content',
          description: 'Main page content',
          required: true
        },
        {
          name: 'page-footer',
          description: 'Page footer content',
          required: false,
          defaultContent: ''
        }
      ],
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Page title for SEO',
          required: false,
          defaultValue: 'Page'
        },
        {
          name: 'description',
          type: 'string',
          description: 'Page description for SEO',
          required: false
        },
        {
          name: 'canonicalUrl',
          type: 'string',
          description: 'Canonical URL for SEO',
          required: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['page', 'seo', 'metadata', 'react'],
        complexity: 'moderate',
        estimatedTokens: 1000,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Base Authentication Template
    this.registerBaseTemplate({
      id: 'base-auth',
      name: 'Base Authentication',
      description: 'Base template for authentication components with security patterns',
      category: 'component',
      platform: 'react',
      path: 'base/base-auth.hbs',
      extends: 'base-component',
      slots: [
        {
          name: 'auth-form',
          description: 'Authentication form content',
          required: true
        },
        {
          name: 'two-factor',
          description: 'Two-factor authentication content',
          required: false,
          defaultContent: ''
        },
        {
          name: 'auth-links',
          description: 'Authentication navigation links',
          required: false,
          defaultContent: ''
        }
      ],
      props: [
        {
          name: 'variant',
          type: 'string',
          description: 'Authentication variant',
          required: false,
          defaultValue: 'login'
        },
        {
          name: 'requireTwoFactor',
          type: 'boolean',
          description: 'Whether two-factor authentication is required',
          required: false,
          defaultValue: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['auth', 'security', 'component', 'react'],
        complexity: 'complex',
        estimatedTokens: 1500,
        nsmClassification: 'RESTRICTED',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Base Error Handling Template
    this.registerBaseTemplate({
      id: 'base-error',
      name: 'Base Error Handling',
      description: 'Base template for error components with user feedback',
      category: 'component',
      platform: 'react',
      path: 'base/base-error.hbs',
      extends: 'base-component',
      slots: [
        {
          name: 'error-details',
          description: 'Error details content',
          required: false,
          defaultContent: ''
        },
        {
          name: 'support-info',
          description: 'Support information content',
          required: false,
          defaultContent: ''
        }
      ],
      props: [
        {
          name: 'error',
          type: 'object',
          description: 'Error object',
          required: false
        },
        {
          name: 'statusCode',
          type: 'number',
          description: 'HTTP status code',
          required: false,
          defaultValue: 500
        },
        {
          name: 'showRetry',
          type: 'boolean',
          description: 'Whether to show retry button',
          required: false,
          defaultValue: true
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['error', 'feedback', 'component', 'react'],
        complexity: 'moderate',
        estimatedTokens: 1200,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Analytics Tracking Mixin
    this.registerBaseTemplate({
      id: 'analytics-tracking-mixin',
      name: 'Analytics Tracking Mixin',
      description: 'Mixin for analytics and performance tracking',
      category: 'utility',
      platform: 'react',
      path: 'mixins/analytics-tracking.hbs',
      slots: [],
      props: [
        {
          name: 'trackingId',
          type: 'string',
          description: 'Analytics tracking ID',
          required: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['mixin', 'analytics', 'tracking', 'performance'],
        complexity: 'simple',
        estimatedTokens: 300,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // Accessibility Enhanced Mixin
    this.registerBaseTemplate({
      id: 'accessibility-enhanced-mixin',
      name: 'Accessibility Enhanced Mixin',
      description: 'Mixin for advanced accessibility features',
      category: 'utility',
      platform: 'react',
      path: 'mixins/accessibility-enhanced.hbs',
      slots: [],
      props: [
        {
          name: 'hasForm',
          type: 'boolean',
          description: 'Whether component contains forms',
          required: false,
          defaultValue: false
        },
        {
          name: 'hasNavigation',
          type: 'boolean',
          description: 'Whether component contains navigation',
          required: false,
          defaultValue: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['mixin', 'accessibility', 'a11y', 'wcag'],
        complexity: 'moderate',
        estimatedTokens: 400,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    // SEO Optimization Mixin
    this.registerBaseTemplate({
      id: 'seo-optimization-mixin',
      name: 'SEO Optimization Mixin',
      description: 'Mixin for search engine optimization',
      category: 'utility',
      platform: 'react',
      path: 'mixins/seo-optimization.hbs',
      slots: [],
      props: [
        {
          name: 'isPage',
          type: 'boolean',
          description: 'Whether this is a page component',
          required: false,
          defaultValue: false
        },
        {
          name: 'breadcrumbs',
          type: 'array',
          description: 'Breadcrumb navigation items',
          required: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'CLI Template Generator Agent',
        created: '2025-01-03T00:00:00Z',
        lastModified: '2025-01-03T00:00:00Z',
        tags: ['mixin', 'seo', 'optimization', 'metadata'],
        complexity: 'moderate',
        estimatedTokens: 500,
        nsmClassification: 'OPEN',
        wcagLevel: 'AAA',
        norwegianCompliant: true
      }
    });

    consola.success('Initialized template inheritance system with base templates');
  }
}

// Singleton instance
export const templateInheritance = new TemplateInheritance();