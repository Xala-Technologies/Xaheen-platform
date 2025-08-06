/**
 * Template Domain - Advanced Template Inheritance & Composition
 * 
 * Handles template management commands including inheritance, composition,
 * and local template generation.
 * 
 * @author Xaheen CLI Template System
 * @since 2025-08-05
 */

import chalk from 'chalk';
import { consola } from 'consola';
import { select, text, confirm, multiselect } from '@clack/prompts';
import { promises as fs, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { CLIAction, CLICommand } from "../../types/index";
import { 
  templateInheritanceService,
  type BaseTemplate,
  type ChildTemplate,
  type TemplateSlot
} from '../../services/templates/template-inheritance.service.js';
import { LocalTemplateGenerator } from "../../services/templates/local-template-generator";
import { BaseGeneratorOptions } from "../../generators/base.generator";

export default class TemplateDomain {
  async handle(action: CLIAction, command: CLICommand): Promise<void> {
    switch (action) {
      case 'list':
        return this.list(command);
      case 'create':
        return this.create(command);
      case 'extend':
        return this.extend(command);
      case 'compose':
        return this.compose(command);
      case 'init':
        return this.init(command);
      case 'generate':
        return this.generate(command);
      default:
        throw new Error(`Unknown template action: ${action}`);
    }
  }

  /**
   * List available templates
   */
  async list(command: CLICommand): Promise<void> {
    try {
      // Initialize template inheritance service
      await templateInheritanceService.initialize();

      const templates = templateInheritanceService.getAllTemplates();

      consola.info(chalk.bold('\n📋 Available Templates\n'));

      // Base Templates
      if (templates.base.length > 0) {
        consola.info(chalk.cyan('Base Templates:'));
        templates.base.forEach(template => {
          consola.info(`  ${chalk.green('•')} ${chalk.bold(template.name)} (${template.category})`);
          consola.info(`    ${chalk.gray(template.metadata?.description || 'No description')}`);
          if (template.slots.length > 0) {
            consola.info(`    ${chalk.yellow('Slots:')} ${template.slots.map(s => s.name).join(', ')}`);
          }
          if (template.variants && template.variants.length > 0) {
            consola.info(`    ${chalk.magenta('Variants:')} ${template.variants.map(v => v.name).join(', ')}`);
          }
          if (template.metadata?.compliance) {
            consola.info(`    ${chalk.blue('Compliance:')} WCAG ${template.metadata.compliance.wcag}, NSM ${template.metadata.compliance.nsmClassification}`);
          }
        });
      }

      // Child Templates
      if (templates.child.length > 0) {
        consola.info(chalk.cyan('\nChild Templates:'));
        templates.child.forEach(template => {
          const hierarchy = templateInheritanceService.getTemplateHierarchy(template.name);
          consola.info(`  ${chalk.green('•')} ${chalk.bold(template.name)} extends ${chalk.yellow(template.extends)}`);
          consola.info(`    ${chalk.gray('Inheritance:')} ${hierarchy.join(' → ')}`);
          if (template.additionalSlots && template.additionalSlots.length > 0) {
            consola.info(`    ${chalk.yellow('Additional Slots:')} ${template.additionalSlots.map(s => s.name).join(', ')}`);
          }
        });
      }

      // Composite Templates
      if (templates.composite.length > 0) {
        consola.info(chalk.cyan('\nComposite Templates:'));
        templates.composite.forEach(template => {
          consola.info(`  ${chalk.green('•')} ${chalk.bold(template.name)} (layout: ${template.layout})`);
          consola.info(`    ${chalk.gray('Components:')} ${template.components.length} components`);
        });
      }

      // Local Templates
      const generator = new LocalTemplateGenerator(process.cwd());
      const localTemplates = await generator.listTemplates();
      
      if (localTemplates.length > 0) {
        consola.info(chalk.cyan('\nLocal Project Templates:'));
        localTemplates.forEach(template => {
          consola.info(`  ${chalk.green('•')} ${chalk.bold(template.name)} (${template.type})`);
          consola.info(`    ${chalk.gray(template.description)}`);
        });
      }
    } catch (error) {
      consola.error('Failed to list templates:', error);
      throw error;
    }
  }

  /**
   * Create a new template
   */
  async create(command: CLICommand): Promise<void> {
    try {
      await templateInheritanceService.initialize();

      const templateType = await select({
        message: 'Select template type:',
        options: [
          { value: 'base', label: 'Base Template (can be extended)' },
          { value: 'child', label: 'Child Template (extends another)' },
          { value: 'composite', label: 'Composite Template (combines multiple templates)' },
          { value: 'local', label: 'Local Project Template' }
        ]
      });

      if (templateType === 'base') {
        await this.createBaseTemplate(command);
      } else if (templateType === 'child') {
        await this.createChildTemplate(command);
      } else if (templateType === 'composite') {
        await this.createCompositeTemplate(command);
      } else if (templateType === 'local') {
        await this.createLocalTemplate(command);
      }
    } catch (error) {
      consola.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Extend an existing template
   */
  async extend(command: CLICommand): Promise<void> {
    try {
      await templateInheritanceService.initialize();

      const templates = templateInheritanceService.getAllTemplates();
      const extendableTemplates = [...templates.base, ...templates.child];

      if (extendableTemplates.length === 0) {
        consola.error('No templates available to extend');
        return;
      }

      const parentTemplate = command.arguments.parent || await select({
        message: 'Select parent template to extend:',
        options: extendableTemplates.map(t => ({
          value: t.name,
          label: `${t.name} (${t.category})`
        }))
      });

      const name = await text({
        message: 'Child template name:',
        placeholder: 'my-child-template',
        validate: (value) => {
          if (!value) return 'Name is required';
          if (!/^[a-z0-9-]+$/.test(value)) return 'Name must be lowercase with hyphens';
          return undefined;
        }
      });

      // Get parent template details
      const parent = templates.base.find(t => t.name === parentTemplate) || 
                     templates.child.find(t => t.name === parentTemplate);
      
      if (!parent) {
        consola.error('Parent template not found');
        return;
      }

      // Select slots to override
      const parentSlots = 'slots' in parent ? parent.slots : [];
      const slotsToOverride = await multiselect({
        message: 'Select slots to override:',
        options: parentSlots.map(s => ({
          value: s.name,
          label: `${s.name} ${s.required ? '(required)' : '(optional)'}`
        }))
      });

      // Create overrides
      const overrides: Record<string, string> = {};
      for (const slotName of slotsToOverride as string[]) {
        const overridePath = await text({
          message: `Override path for "${slotName}" slot:`,
          placeholder: `${name}/${slotName}.hbs`
        });
        overrides[slotName] = overridePath as string;
      }

      if (command.options.dryRun) {
        consola.info(chalk.yellow('[DRY RUN] Would create child template:'));
        consola.info(`  Name: ${name}`);
        consola.info(`  Extends: ${parentTemplate}`);
        consola.info(`  Overrides: ${Object.keys(overrides).join(', ')}`);
        return;
      }

      // Register child template
      await templateInheritanceService.registerChildTemplate({
        name: name as string,
        extends: parentTemplate as string,
        category: parent.category,
        overrides
      });

      consola.success(`Created child template: ${chalk.green(name)}`);
    } catch (error) {
      consola.error('Failed to extend template:', error);
      throw error;
    }
  }

  /**
   * Compose templates
   */
  async compose(command: CLICommand): Promise<void> {
    try {
      await templateInheritanceService.initialize();

      const name = await text({
        message: 'Composite template name:',
        placeholder: 'my-composite-template'
      });

      const templates = templateInheritanceService.getAllTemplates();
      const availableLayouts = templates.base.filter(t => t.category === 'page' || t.category === 'layout');

      const layout = await select({
        message: 'Select layout template:',
        options: availableLayouts.map(t => ({
          value: t.name,
          label: `${t.name} (${t.category})`
        }))
      });

      // Select components
      const components = await multiselect({
        message: 'Select components to include:',
        options: [...templates.base, ...templates.child].map(t => ({
          value: t.name,
          label: `${t.name} (${t.category})`
        }))
      });

      // Configure component slots
      const componentConfig = [];
      for (const component of components as string[]) {
        const slot = await text({
          message: `Which slot should "${component}" go into?`,
          placeholder: 'content'
        });
        
        componentConfig.push({
          template: component,
          slot: slot as string
        });
      }

      if (command.options.dryRun) {
        consola.info(chalk.yellow('[DRY RUN] Would create composite template:'));
        consola.info(`  Name: ${name}`);
        consola.info(`  Layout: ${layout}`);
        consola.info(`  Components: ${(components as string[]).join(', ')}`);
        return;
      }

      // Register composite template
      await templateInheritanceService.registerCompositeTemplate({
        name: name as string,
        layout: layout as string,
        components: componentConfig
      });

      consola.success(`Created composite template: ${chalk.green(name)}`);
    } catch (error) {
      consola.error('Failed to compose template:', error);
      throw error;
    }
  }

  /**
   * Initialize local template system
   */
  async init(command: CLICommand): Promise<void> {
    try {
      const projectRoot = process.cwd();
      const generator = new LocalTemplateGenerator(projectRoot);

      consola.start('Initializing local template system...');
      
      await generator.initialize();
      
      consola.success('Local template system initialized!');
      consola.info('\nNext steps:');
      consola.info('  1. Run "xaheen template create" to create a new template');
      consola.info('  2. Run "hygen <template-name> new" to use a template');
      consola.info('  3. Check _templates/ directory for available templates');
    } catch (error) {
      consola.error('Failed to initialize local templates:', error);
      throw error;
    }
  }

  /**
   * Generate from template
   */
  async generate(command: CLICommand): Promise<void> {
    try {
      await templateInheritanceService.initialize();

      const templates = templateInheritanceService.getAllTemplates();
      const allTemplates = [...templates.base, ...templates.child, ...templates.composite];

      const templateName = command.arguments.name || await select({
        message: 'Select template:',
        options: allTemplates.map(t => ({
          value: t.name,
          label: `${t.name} (${t.category || 'composite'})`
        }))
      });

      const componentName = await text({
        message: 'Component/Page name:',
        placeholder: 'MyComponent'
      });

      const outputPath = command.options.output || await text({
        message: 'Output path:',
        placeholder: 'src/components/MyComponent.tsx'
      });

      // Prepare context
      const context: Record<string, any> = {
        name: componentName as string,
        className: (componentName as string).replace(/[-_]/g, ''),
        ...this.parseSlots(command.options.slots || [])
      };

      // Add variant if specified
      if (command.options.variant) {
        context.variant = command.options.variant;
      }

      if (command.options.dryRun) {
        consola.info(chalk.yellow('[DRY RUN] Would generate:'));
        consola.info(`  Template: ${templateName}`);
        consola.info(`  Output: ${outputPath}`);
        consola.info(`  Context:`, context);
        return;
      }

      // Generate file
      await templateInheritanceService.generateFromInheritance(
        templateName as string,
        outputPath as string,
        context
      );

      consola.success(`Generated ${chalk.green(outputPath)} from template ${chalk.cyan(templateName)}`);
    } catch (error) {
      consola.error('Failed to generate from template:', error);
      throw error;
    }
  }

  /**
   * Create a base template
   */
  private async createBaseTemplate(command: CLICommand): Promise<void> {
    const name = await text({
      message: 'Template name:',
      placeholder: 'my-base-template',
      validate: (value) => {
        if (!value) return 'Name is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Name must be lowercase with hyphens';
        return undefined;
      }
    });

    const category = await select({
      message: 'Template category:',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'component', label: 'Component' },
        { value: 'form', label: 'Form' },
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'layout', label: 'Layout' }
      ]
    });

    const description = await text({
      message: 'Template description:',
      placeholder: 'A base template for...'
    });

    // Define slots
    const slots: TemplateSlot[] = [];
    let addMoreSlots = true;
    
    while (addMoreSlots) {
      const slotName = await text({
        message: 'Slot name (leave empty to finish):',
        placeholder: 'content'
      });

      if (!slotName) {
        addMoreSlots = false;
        continue;
      }

      const required = await confirm({
        message: `Is the "${slotName}" slot required?`,
        initialValue: false
      });

      const slotDescription = await text({
        message: `Description for "${slotName}" slot:`,
        placeholder: 'Slot for main content'
      });

      slots.push({
        name: slotName as string,
        required: required as boolean,
        description: slotDescription as string
      });
    }

    // Create template file
    const templatePath = `base/${name}.hbs`;
    const templateContent = this.generateBaseTemplateContent(name as string, category as string, slots);

    if (command.options.dryRun) {
      consola.info(chalk.yellow('[DRY RUN] Would create base template:'));
      consola.info(`  Name: ${name}`);
      consola.info(`  Category: ${category}`);
      consola.info(`  Path: ${templatePath}`);
      consola.info(`  Slots: ${slots.map(s => s.name).join(', ')}`);
      return;
    }

    // Save template
    const fullPath = path.join(process.cwd(), 'src/templates', templatePath);
    const dir = path.dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await fs.writeFile(fullPath, templateContent);

    // Register template
    await templateInheritanceService.registerBaseTemplate({
      name: name as string,
      path: templatePath,
      category: category as any,
      slots,
      metadata: {
        description: description as string,
        compliance: {
          wcag: 'AAA',
          nsmClassification: 'OPEN',
          gdprCompliant: true
        }
      }
    });

    consola.success(`Created base template: ${chalk.green(name)}`);
  }

  /**
   * Create a child template
   */
  private async createChildTemplate(command: CLICommand): Promise<void> {
    // Similar to extend command
    await this.extend(command);
  }

  /**
   * Create a composite template
   */
  private async createCompositeTemplate(command: CLICommand): Promise<void> {
    // Similar to compose command
    await this.compose(command);
  }

  /**
   * Create a local project template
   */
  private async createLocalTemplate(command: CLICommand): Promise<void> {
    const generator = new LocalTemplateGenerator(process.cwd());

    const name = await text({
      message: 'Template name:',
      placeholder: 'my-template',
      validate: (value) => {
        if (!value) return 'Name is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Name must be lowercase with hyphens';
        return undefined;
      }
    });

    const description = await text({
      message: 'Template description:',
      placeholder: 'Generate a new...'
    });

    const type = await select({
      message: 'Template type:',
      options: [
        { value: 'component', label: 'Component' },
        { value: 'page', label: 'Page' },
        { value: 'service', label: 'Service' },
        { value: 'hook', label: 'Hook' },
        { value: 'util', label: 'Utility' }
      ]
    });

    if (command.options.dryRun) {
      consola.info(chalk.yellow('[DRY RUN] Would create local template:'));
      consola.info(`  Name: ${name}`);
      consola.info(`  Type: ${type}`);
      consola.info(`  Description: ${description}`);
      return;
    }

    // Create basic template config
    await generator.createTemplate(name as string, {
      name: name as string,
      description: description as string,
      type: type as any,
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: `${type} name:`
        }
      ],
      files: [
        {
          path: `src/${type}s/<%= h.kebabCase(name) %>.<%= type === 'component' ? 'tsx' : 'ts' %>`,
          template: `${type}.hbs`
        }
      ]
    });

    consola.success(`Created local template: ${chalk.green(name)}`);
    consola.info(`Run "hygen ${name} new" to use this template`);
  }

  /**
   * Generate base template content
   */
  private generateBaseTemplateContent(
    name: string,
    category: string,
    slots: TemplateSlot[]
  ): string {
    const className = name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    
    return `{{!-- ${className} Template --}}
import React from 'react';
{{#if useSemanticUI}}
import { Container, Stack } from '@xala-technologies/ui-system';
{{/if}}
{{#if useI18n}}
import { useTranslation } from '@xala-technologies/i18n';
{{/if}}

{{!-- Props Interface --}}
{{#if (hasSlot 'props')}}
{{{slot 'props'}}}
{{else}}
export interface ${className}Props {
  readonly children?: React.ReactNode;
}
{{/if}}

{{!-- Main Component --}}
export const ${className} = (props: ${className}Props): JSX.Element => {
  {{#if useI18n}}
  const { t } = useTranslation();
  {{/if}}

  return (
    {{#if useSemanticUI}}
    <Container>
      <Stack gap="lg">
        ${slots.map(slot => `
        {{!-- ${slot.name} Slot --}}
        {{#if (hasSlot '${slot.name}')}}
        {{{slot '${slot.name}'}}}
        {{${slot.required ? '' : 'else'}/if}}${slot.required ? '' : `
        {{!-- Default ${slot.name} content --}}
        <div>${slot.description || 'Default content'}</div>
        {{/if}}`}`).join('\n')}
      </Stack>
    </Container>
    {{else}}
    <div>
      ${slots.map(slot => `
      {{#if (hasSlot '${slot.name}')}}
      {{{slot '${slot.name}'}}}
      {{/if}}`).join('\n')}
    </div>
    {{/if}}
  );
};`;
  }

  /**
   * Parse slot arguments
   */
  private parseSlots(slots: string[]): Record<string, any> {
    const parsedSlots: Record<string, any> = {};
    
    for (const slot of slots) {
      const [name, content] = slot.split(':');
      if (name && content) {
        parsedSlots[`slots.${name}`] = content;
      }
    }
    
    return parsedSlots;
  }
}