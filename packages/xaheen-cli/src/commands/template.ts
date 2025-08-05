/**
 * Template Command - Advanced Template Inheritance & Composition
 * 
 * CLI command for managing template inheritance, composition, and local templates.
 * 
 * @author Xaheen CLI Template System
 * @since 2025-08-05
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { consola } from 'consola';
import { select, text, confirm, multiselect } from '@clack/prompts';
import path from 'node:path';
import fs from 'fs-extra';
import { 
  templateInheritanceService,
  type BaseTemplate,
  type ChildTemplate,
  type TemplateSlot
} from '../services/templates/template-inheritance.service.js';
import { LocalTemplateGenerator } from '../services/templates/local-template-generator.js';
import { BaseGeneratorOptions } from '../generators/base.generator.js';

interface TemplateCommandOptions extends BaseGeneratorOptions {
  readonly list?: boolean;
  readonly create?: boolean;
  readonly extend?: string;
  readonly compose?: boolean;
  readonly init?: boolean;
  readonly variant?: string;
  readonly slots?: string[];
  readonly output?: string;
}

export const templateCommand = new Command('template')
  .description('Manage advanced template inheritance and composition')
  .option('-l, --list', 'List available templates')
  .option('-c, --create', 'Create a new template')
  .option('-e, --extend <parent>', 'Extend an existing template')
  .option('--compose', 'Create a composite template')
  .option('-i, --init', 'Initialize local template system in project')
  .option('-v, --variant <variant>', 'Use a specific template variant')
  .option('-s, --slots <slots...>', 'Provide slot content (format: slotName:content)')
  .option('-o, --output <path>', 'Output path for generated file')
  .option('--dry-run', 'Preview what would be generated')
  .option('--force', 'Overwrite existing files')
  .action(async (options: TemplateCommandOptions) => {
    try {
      // Initialize template inheritance service
      await templateInheritanceService.initialize();

      if (options.list) {
        await listTemplates();
      } else if (options.init) {
        await initializeLocalTemplates();
      } else if (options.create) {
        await createTemplate(options);
      } else if (options.extend) {
        await extendTemplate(options);
      } else if (options.compose) {
        await composeTemplate(options);
      } else {
        await interactiveMode(options);
      }
    } catch (error) {
      consola.error('Template command failed:', error);
      process.exit(1);
    }
  });

/**
 * List available templates
 */
async function listTemplates(): Promise<void> {
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
}

/**
 * Initialize local template system
 */
async function initializeLocalTemplates(): Promise<void> {
  const projectRoot = process.cwd();
  const generator = new LocalTemplateGenerator(projectRoot);

  consola.start('Initializing local template system...');
  
  await generator.initialize();
  
  consola.success('Local template system initialized!');
  consola.info('\nNext steps:');
  consola.info('  1. Run "xaheen template --create" to create a new template');
  consola.info('  2. Run "hygen <template-name> new" to use a template');
  consola.info('  3. Check _templates/ directory for available templates');
}

/**
 * Create a new template
 */
async function createTemplate(options: TemplateCommandOptions): Promise<void> {
  const templateType = await select({
    message: 'Select template type:',
    options: [
      { value: 'base', label: 'Base Template (can be extended)' },
      { value: 'child', label: 'Child Template (extends another)' },
      { value: 'local', label: 'Local Project Template' }
    ]
  });

  if (templateType === 'base') {
    await createBaseTemplate(options);
  } else if (templateType === 'child') {
    await createChildTemplate(options);
  } else if (templateType === 'local') {
    await createLocalTemplate(options);
  }
}

/**
 * Create a base template
 */
async function createBaseTemplate(options: TemplateCommandOptions): Promise<void> {
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
  const templateContent = generateBaseTemplateContent(name as string, category as string, slots);

  if (options.dryRun) {
    consola.info(chalk.yellow('[DRY RUN] Would create base template:'));
    consola.info(`  Name: ${name}`);
    consola.info(`  Category: ${category}`);
    consola.info(`  Path: ${templatePath}`);
    consola.info(`  Slots: ${slots.map(s => s.name).join(', ')}`);
    return;
  }

  // Save template
  const fullPath = path.join(process.cwd(), 'src/templates', templatePath);
  await fs.ensureDir(path.dirname(fullPath));
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
async function createChildTemplate(options: TemplateCommandOptions): Promise<void> {
  const templates = templateInheritanceService.getAllTemplates();
  const extendableTemplates = [...templates.base, ...templates.child];

  if (extendableTemplates.length === 0) {
    consola.error('No templates available to extend');
    return;
  }

  const parentTemplate = await select({
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

  if (options.dryRun) {
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
}

/**
 * Create a local project template
 */
async function createLocalTemplate(options: TemplateCommandOptions): Promise<void> {
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

  if (options.dryRun) {
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
 * Extend an existing template
 */
async function extendTemplate(options: TemplateCommandOptions): Promise<void> {
  if (!options.extend) {
    consola.error('Parent template name required');
    return;
  }

  await createChildTemplate({ ...options, create: true });
}

/**
 * Compose templates
 */
async function composeTemplate(options: TemplateCommandOptions): Promise<void> {
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

  consola.success(`Created composite template: ${chalk.green(name)}`);
  consola.info(`  Layout: ${layout}`);
  consola.info(`  Components: ${(components as string[]).join(', ')}`);
}

/**
 * Interactive mode
 */
async function interactiveMode(options: TemplateCommandOptions): Promise<void> {
  const action = await select({
    message: 'What would you like to do?',
    options: [
      { value: 'generate', label: 'Generate from template' },
      { value: 'create', label: 'Create new template' },
      { value: 'list', label: 'List available templates' },
      { value: 'init', label: 'Initialize local templates' }
    ]
  });

  if (action === 'generate') {
    await generateFromTemplate(options);
  } else if (action === 'create') {
    await createTemplate(options);
  } else if (action === 'list') {
    await listTemplates();
  } else if (action === 'init') {
    await initializeLocalTemplates();
  }
}

/**
 * Generate from template
 */
async function generateFromTemplate(options: TemplateCommandOptions): Promise<void> {
  const templates = templateInheritanceService.getAllTemplates();
  const allTemplates = [...templates.base, ...templates.child, ...templates.composite];

  const templateName = await select({
    message: 'Select template:',
    options: allTemplates.map(t => ({
      value: t.name,
      label: `${t.name} (${t.category || 'composite'})`
    }))
  });

  const name = await text({
    message: 'Component/Page name:',
    placeholder: 'MyComponent'
  });

  const outputPath = options.output || await text({
    message: 'Output path:',
    placeholder: 'src/components/MyComponent.tsx'
  });

  // Prepare context
  const context: Record<string, any> = {
    name: name as string,
    className: (name as string).replace(/[-_]/g, ''),
    ...parseSlots(options.slots || [])
  };

  // Add variant if specified
  if (options.variant) {
    context.variant = options.variant;
  }

  if (options.dryRun) {
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
}

/**
 * Generate base template content
 */
function generateBaseTemplateContent(
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
function parseSlots(slots: string[]): Record<string, any> {
  const parsedSlots: Record<string, any> = {};
  
  for (const slot of slots) {
    const [name, content] = slot.split(':');
    if (name && content) {
      parsedSlots[`slots.${name}`] = content;
    }
  }
  
  return parsedSlots;
}