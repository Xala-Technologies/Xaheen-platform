/**
 * Template Inheritance & Composition Service
 * 
 * Provides sophisticated template inheritance with slots, partials, and composition.
 * 
 * @author Xaheen CLI Template System
 * @since 2025-08-05
 */

import fs from 'fs-extra';
import path from 'node:path';
import Handlebars from 'handlebars';
import { consola } from 'consola';
import yaml from 'yaml';
import { templateLoader } from "./template-loader";
import type { NSMClassification } from "../compliance/nsm-classifier";

export interface TemplateSlot {
  readonly name: string;
  readonly required: boolean;
  readonly defaultContent?: string;
  readonly description?: string;
  readonly validation?: {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: RegExp;
  };
}

export interface TemplatePartial {
  readonly name: string;
  readonly path: string;
  readonly context?: Record<string, any>;
  readonly conditional?: string;
}

export interface BaseTemplate {
  readonly name: string;
  readonly path: string;
  readonly category: 'page' | 'component' | 'form' | 'dashboard' | 'layout';
  readonly slots: TemplateSlot[];
  readonly partials?: TemplatePartial[];
  readonly defaultContext?: Record<string, any>;
  readonly variants?: TemplateVariant[];
  readonly metadata?: {
    readonly description?: string;
    readonly tags?: string[];
    readonly compliance?: {
      readonly wcag: 'A' | 'AA' | 'AAA';
      readonly nsmClassification: NSMClassification;
      readonly gdprCompliant: boolean;
    };
  };
}

export interface TemplateVariant {
  readonly name: string;
  readonly description: string;
  readonly modifiers: Record<string, any>;
  readonly compliance?: {
    readonly darkMode?: boolean;
    readonly rtl?: boolean;
    readonly highContrast?: boolean;
    readonly reducedMotion?: boolean;
  };
}

export interface ChildTemplate {
  readonly name: string;
  readonly extends: string;
  readonly category: string;
  readonly overrides: Record<string, string>;
  readonly additionalContext?: Record<string, any>;
  readonly additionalSlots?: TemplateSlot[];
  readonly removeSlots?: string[];
}

export interface CompositeTemplate {
  readonly name: string;
  readonly components: Array<{
    readonly template: string;
    readonly slot?: string;
    readonly context?: Record<string, any>;
    readonly condition?: string;
  }>;
  readonly layout: string;
  readonly globalContext?: Record<string, any>;
}

export class TemplateInheritanceService {
  private baseTemplates: Map<string, BaseTemplate> = new Map();
  private childTemplates: Map<string, ChildTemplate> = new Map();
  private compositeTemplates: Map<string, CompositeTemplate> = new Map();
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private templatesPath: string;
  private templateRegistry: string;

  constructor() {
    this.templatesPath = path.resolve(__dirname, '../../templates');
    this.templateRegistry = path.join(this.templatesPath, 'template-registry.yaml');
    this.initializeHelpers();
  }

  /**
   * Initialize the template inheritance system
   */
  async initialize(): Promise<void> {
    try {
      await this.loadTemplateRegistry();
      await this.validateInheritanceHierarchy();
      consola.success('Template inheritance system initialized');
    } catch (error) {
      consola.error('Failed to initialize template inheritance:', error);
      throw error;
    }
  }

  /**
   * Load template registry from YAML
   */
  private async loadTemplateRegistry(): Promise<void> {
    try {
      if (await fs.pathExists(this.templateRegistry)) {
        const registryContent = await fs.readFile(this.templateRegistry, 'utf-8');
        const registry = yaml.parse(registryContent);

        // Load base templates
        if (registry.baseTemplates) {
          for (const template of registry.baseTemplates) {
            this.baseTemplates.set(template.name, template);
          }
        }

        // Load child templates
        if (registry.childTemplates) {
          for (const template of registry.childTemplates) {
            this.childTemplates.set(template.name, template);
          }
        }

        // Load composite templates
        if (registry.compositeTemplates) {
          for (const template of registry.compositeTemplates) {
            this.compositeTemplates.set(template.name, template);
          }
        }

        consola.info(`Loaded ${this.baseTemplates.size} base templates, ${this.childTemplates.size} child templates, ${this.compositeTemplates.size} composite templates`);
      } else {
        // Create default registry
        await this.createDefaultRegistry();
      }
    } catch (error) {
      consola.error('Failed to load template registry:', error);
      throw error;
    }
  }

  /**
   * Create default template registry
   */
  private async createDefaultRegistry(): Promise<void> {
    const defaultRegistry = {
      version: '1.0.0',
      baseTemplates: [
        {
          name: 'base-page',
          path: 'base/base-page.hbs',
          category: 'page',
          slots: [
            {
              name: 'header',
              required: false,
              defaultContent: '{{> default-header}}',
              description: 'Page header content'
            },
            {
              name: 'content',
              required: true,
              description: 'Main page content'
            },
            {
              name: 'footer',
              required: false,
              defaultContent: '{{> default-footer}}',
              description: 'Page footer content'
            }
          ],
          variants: [
            {
              name: 'dark',
              description: 'Dark mode variant',
              modifiers: {
                theme: 'dark',
                backgroundColor: 'bg-gray-900',
                textColor: 'text-gray-100'
              },
              compliance: {
                darkMode: true,
                highContrast: true
              }
            },
            {
              name: 'rtl',
              description: 'Right-to-left variant',
              modifiers: {
                direction: 'rtl',
                textAlign: 'text-right'
              },
              compliance: {
                rtl: true
              }
            }
          ],
          metadata: {
            description: 'Base page template with header, content, and footer slots',
            tags: ['page', 'layout', 'base'],
            compliance: {
              wcag: 'AAA',
              nsmClassification: 'OPEN',
              gdprCompliant: true
            }
          }
        },
        {
          name: 'base-component',
          path: 'base/base-component.hbs',
          category: 'component',
          slots: [
            {
              name: 'props',
              required: true,
              description: 'Component props interface'
            },
            {
              name: 'render',
              required: true,
              description: 'Component render logic'
            },
            {
              name: 'styles',
              required: false,
              defaultContent: '{{> default-styles}}',
              description: 'Component styles'
            }
          ],
          metadata: {
            description: 'Base component template with TypeScript support',
            tags: ['component', 'typescript', 'base'],
            compliance: {
              wcag: 'AAA',
              nsmClassification: 'OPEN',
              gdprCompliant: true
            }
          }
        },
        {
          name: 'base-form',
          path: 'base/base-form.hbs',
          category: 'form',
          slots: [
            {
              name: 'fields',
              required: true,
              description: 'Form fields'
            },
            {
              name: 'validation',
              required: false,
              defaultContent: '{{> default-validation}}',
              description: 'Form validation logic'
            },
            {
              name: 'submission',
              required: true,
              description: 'Form submission handler'
            }
          ],
          variants: [
            {
              name: 'norwegian-compliance',
              description: 'Norwegian compliance variant with Altinn support',
              modifiers: {
                locale: 'nb-NO',
                dateFormat: 'dd.MM.yyyy',
                currencyFormat: 'NOK',
                altinnIntegration: true
              },
              compliance: {
                darkMode: false,
                rtl: false,
                highContrast: true,
                reducedMotion: true
              }
            }
          ],
          metadata: {
            description: 'Base form template with validation and submission',
            tags: ['form', 'validation', 'base'],
            compliance: {
              wcag: 'AAA',
              nsmClassification: 'RESTRICTED',
              gdprCompliant: true
            }
          }
        },
        {
          name: 'base-dashboard',
          path: 'base/base-dashboard.hbs',
          category: 'dashboard',
          slots: [
            {
              name: 'navigation',
              required: true,
              description: 'Dashboard navigation'
            },
            {
              name: 'widgets',
              required: true,
              description: 'Dashboard widgets'
            },
            {
              name: 'analytics',
              required: false,
              description: 'Analytics section'
            }
          ],
          metadata: {
            description: 'Base dashboard template with navigation and widgets',
            tags: ['dashboard', 'analytics', 'base'],
            compliance: {
              wcag: 'AAA',
              nsmClassification: 'CONFIDENTIAL',
              gdprCompliant: true
            }
          }
        }
      ],
      childTemplates: [
        {
          name: 'login-page',
          extends: 'base-page',
          category: 'page',
          overrides: {
            content: 'auth/login-form.hbs',
            header: 'auth/minimal-header.hbs'
          },
          additionalContext: {
            pageTitle: 'Login',
            requiresAuth: false
          }
        },
        {
          name: 'admin-dashboard',
          extends: 'base-dashboard',
          category: 'dashboard',
          overrides: {
            navigation: 'admin/sidebar-navigation.hbs',
            widgets: 'admin/admin-widgets.hbs'
          },
          additionalSlots: [
            {
              name: 'userManagement',
              required: true,
              description: 'User management section'
            }
          ]
        }
      ],
      compositeTemplates: [
        {
          name: 'full-stack-app',
          layout: 'base-page',
          components: [
            {
              template: 'navbar',
              slot: 'header',
              context: { theme: 'primary' }
            },
            {
              template: 'dashboard',
              slot: 'content',
              condition: 'isAuthenticated'
            },
            {
              template: 'login-form',
              slot: 'content',
              condition: '!isAuthenticated'
            }
          ],
          globalContext: {
            appName: 'Xaheen Application',
            version: '1.0.0'
          }
        }
      ]
    };

    await fs.writeFile(this.templateRegistry, yaml.stringify(defaultRegistry), 'utf-8');
    await this.loadTemplateRegistry();
  }

  /**
   * Validate inheritance hierarchy
   */
  private async validateInheritanceHierarchy(): Promise<void> {
    for (const [name, child] of this.childTemplates) {
      if (!this.baseTemplates.has(child.extends) && !this.childTemplates.has(child.extends)) {
        throw new Error(`Child template '${name}' extends non-existent template '${child.extends}'`);
      }

      // Check for circular inheritance
      const visited = new Set<string>();
      let current = child.extends;
      while (current) {
        if (visited.has(current)) {
          throw new Error(`Circular inheritance detected for template '${name}'`);
        }
        visited.add(current);
        const parent = this.childTemplates.get(current);
        current = parent?.extends || null;
      }
    }
  }

  /**
   * Get base template by name
   */
  getBaseTemplate(name: string): BaseTemplate | undefined {
    return this.baseTemplates.get(name);
  }

  /**
   * Get child template by name
   */
  getChildTemplate(name: string): ChildTemplate | undefined {
    return this.childTemplates.get(name);
  }

  /**
   * Resolve template with inheritance
   */
  async resolveTemplate(templateName: string, context: Record<string, any> = {}): Promise<string> {
    try {
      // Check if it's a composite template
      const composite = this.compositeTemplates.get(templateName);
      if (composite) {
        return await this.resolveCompositeTemplate(composite, context);
      }

      // Check if it's a child template
      const child = this.childTemplates.get(templateName);
      if (child) {
        return await this.resolveChildTemplate(child, context);
      }

      // Check if it's a base template
      const base = this.baseTemplates.get(templateName);
      if (base) {
        return await this.resolveBaseTemplate(base, context);
      }

      throw new Error(`Template '${templateName}' not found`);
    } catch (error) {
      consola.error(`Failed to resolve template '${templateName}':`, error);
      throw error;
    }
  }

  /**
   * Resolve base template
   */
  private async resolveBaseTemplate(template: BaseTemplate, context: Record<string, any>): Promise<string> {
    // Load and compile template
    const templateContent = await templateLoader.getTemplateContent(template.path);
    const compiled = Handlebars.compile(templateContent);

    // Merge contexts
    const mergedContext = {
      ...template.defaultContext,
      ...context,
      slots: await this.resolveSlots(template.slots, context.slots || {})
    };

    // Apply variant if specified
    if (context.variant && template.variants) {
      const variant = template.variants.find(v => v.name === context.variant);
      if (variant) {
        Object.assign(mergedContext, variant.modifiers);
      }
    }

    return compiled(mergedContext);
  }

  /**
   * Resolve child template
   */
  private async resolveChildTemplate(child: ChildTemplate, context: Record<string, any>): Promise<string> {
    // Get parent template
    const parent = this.baseTemplates.get(child.extends) || this.childTemplates.get(child.extends);
    if (!parent) {
      throw new Error(`Parent template '${child.extends}' not found`);
    }

    // Resolve overrides
    const overriddenSlots: Record<string, string> = {};
    for (const [slotName, overridePath] of Object.entries(child.overrides)) {
      const overrideContent = await templateLoader.renderTemplate(overridePath, context);
      overriddenSlots[slotName] = overrideContent;
    }

    // Merge contexts
    const mergedContext = {
      ...context,
      ...child.additionalContext,
      slots: {
        ...context.slots,
        ...overriddenSlots
      }
    };

    // Resolve parent template
    if ('extends' in parent) {
      return await this.resolveChildTemplate(parent as ChildTemplate, mergedContext);
    } else {
      return await this.resolveBaseTemplate(parent as BaseTemplate, mergedContext);
    }
  }

  /**
   * Resolve composite template
   */
  private async resolveCompositeTemplate(composite: CompositeTemplate, context: Record<string, any>): Promise<string> {
    const mergedContext = {
      ...composite.globalContext,
      ...context
    };

    // Resolve components
    const resolvedComponents: Record<string, string> = {};
    for (const component of composite.components) {
      // Check condition
      if (component.condition) {
        const conditionResult = this.evaluateCondition(component.condition, mergedContext);
        if (!conditionResult) continue;
      }

      // Resolve component
      const componentContext = {
        ...mergedContext,
        ...component.context
      };
      const componentContent = await this.resolveTemplate(component.template, componentContext);

      // Add to appropriate slot
      const slot = component.slot || 'content';
      if (!resolvedComponents[slot]) {
        resolvedComponents[slot] = '';
      }
      resolvedComponents[slot] += componentContent;
    }

    // Resolve layout with components
    const layoutContext = {
      ...mergedContext,
      slots: resolvedComponents
    };

    return await this.resolveTemplate(composite.layout, layoutContext);
  }

  /**
   * Resolve slots
   */
  private async resolveSlots(templateSlots: TemplateSlot[], providedSlots: Record<string, string>): Promise<Record<string, string>> {
    const resolved: Record<string, string> = {};

    for (const slot of templateSlots) {
      if (providedSlots[slot.name]) {
        // Validate slot content
        if (slot.validation) {
          this.validateSlotContent(slot, providedSlots[slot.name]);
        }
        resolved[slot.name] = providedSlots[slot.name];
      } else if (slot.required) {
        throw new Error(`Required slot '${slot.name}' not provided`);
      } else if (slot.defaultContent) {
        resolved[slot.name] = slot.defaultContent;
      } else {
        resolved[slot.name] = '';
      }
    }

    return resolved;
  }

  /**
   * Validate slot content
   */
  private validateSlotContent(slot: TemplateSlot, content: string): void {
    if (slot.validation) {
      if (slot.validation.minLength && content.length < slot.validation.minLength) {
        throw new Error(`Slot '${slot.name}' content is too short (min: ${slot.validation.minLength})`);
      }
      if (slot.validation.maxLength && content.length > slot.validation.maxLength) {
        throw new Error(`Slot '${slot.name}' content is too long (max: ${slot.validation.maxLength})`);
      }
      if (slot.validation.pattern && !slot.validation.pattern.test(content)) {
        throw new Error(`Slot '${slot.name}' content does not match required pattern`);
      }
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation (can be enhanced)
      const func = new Function('context', `with(context) { return ${condition}; }`);
      return func(context);
    } catch (error) {
      consola.warn(`Failed to evaluate condition '${condition}':`, error);
      return false;
    }
  }

  /**
   * Register custom base template
   */
  async registerBaseTemplate(template: BaseTemplate): Promise<void> {
    this.baseTemplates.set(template.name, template);
    await this.saveRegistry();
  }

  /**
   * Register custom child template
   */
  async registerChildTemplate(template: ChildTemplate): Promise<void> {
    this.childTemplates.set(template.name, template);
    await this.validateInheritanceHierarchy();
    await this.saveRegistry();
  }

  /**
   * Register composite template
   */
  async registerCompositeTemplate(template: CompositeTemplate): Promise<void> {
    this.compositeTemplates.set(template.name, template);
    await this.saveRegistry();
  }

  /**
   * Save registry to disk
   */
  private async saveRegistry(): Promise<void> {
    const registry = {
      version: '1.0.0',
      baseTemplates: Array.from(this.baseTemplates.values()),
      childTemplates: Array.from(this.childTemplates.values()),
      compositeTemplates: Array.from(this.compositeTemplates.values())
    };

    await fs.writeFile(this.templateRegistry, yaml.stringify(registry), 'utf-8');
  }

  /**
   * Generate template from inheritance
   */
  async generateFromInheritance(
    templateName: string,
    outputPath: string,
    context: Record<string, any>
  ): Promise<void> {
    try {
      const content = await this.resolveTemplate(templateName, context);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, content, 'utf-8');
      consola.success(`Generated ${outputPath} from template '${templateName}'`);
    } catch (error) {
      consola.error(`Failed to generate from template '${templateName}':`, error);
      throw error;
    }
  }

  /**
   * Initialize Handlebars helpers for inheritance
   */
  private initializeHelpers(): void {
    // Slot helper
    Handlebars.registerHelper('slot', function(name: string, options: any) {
      const slots = options.data.root.slots || {};
      return new Handlebars.SafeString(slots[name] || '');
    });

    // Has slot helper
    Handlebars.registerHelper('hasSlot', function(name: string, options: any) {
      const slots = options.data.root.slots || {};
      return !!slots[name];
    });

    // Partial with context helper
    Handlebars.registerHelper('partialWithContext', function(name: string, context: any, options: any) {
      const partial = Handlebars.partials[name];
      if (!partial) return '';
      
      const mergedContext = {
        ...options.data.root,
        ...context
      };
      
      return new Handlebars.SafeString(partial(mergedContext));
    });

    // Variant helper
    Handlebars.registerHelper('variant', function(variantName: string, options: any) {
      return options.data.root.variant === variantName;
    });

    // Compliance helper
    Handlebars.registerHelper('compliance', function(type: string, options: any) {
      const compliance = options.data.root.compliance || {};
      return compliance[type] || false;
    });

    consola.debug('Registered template inheritance helpers');
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): {
    base: BaseTemplate[];
    child: ChildTemplate[];
    composite: CompositeTemplate[];
  } {
    return {
      base: Array.from(this.baseTemplates.values()),
      child: Array.from(this.childTemplates.values()),
      composite: Array.from(this.compositeTemplates.values())
    };
  }

  /**
   * Get template hierarchy
   */
  getTemplateHierarchy(templateName: string): string[] {
    const hierarchy: string[] = [templateName];
    
    let current = this.childTemplates.get(templateName);
    while (current) {
      hierarchy.push(current.extends);
      current = this.childTemplates.get(current.extends);
    }
    
    return hierarchy;
  }
}

// Singleton instance
export const templateInheritanceService = new TemplateInheritanceService();