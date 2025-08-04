import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { CommandMetadata } from './index.js';
import { logger } from '../utils/logger.js';
import { ComponentGenerator } from '../services/component-generator.js';
import { ValidationError } from '../utils/errors.js';

export interface CreateOptions {
  readonly type?: string;
  readonly platform?: string;
  readonly output?: string;
  readonly template?: string;
  readonly props?: string;
  readonly story?: boolean;
  readonly test?: boolean;
  readonly docs?: boolean;
}

export const createCommand: CommandMetadata = {
  name: 'create',
  description: 'Create components, pages, and layouts',
  arguments: [
    {
      name: 'type',
      description: 'Type to create (component|page|layout|hook|service)',
      required: true
    },
    {
      name: 'name',
      description: 'Name of the item to create',
      required: true
    }
  ],
  options: [
    {
      flags: '--platform <platform>',
      description: 'Target platform (react|nextjs|vue|angular|svelte|react-native|electron)',
      defaultValue: 'react'
    },
    {
      flags: '--output <path>',
      description: 'Output directory'
    },
    {
      flags: '--template <template>',
      description: 'Template to use'
    },
    {
      flags: '--props <props>',
      description: 'Component props (comma-separated)'
    },
    {
      flags: '--story',
      description: 'Generate Storybook story',
      defaultValue: true
    },
    {
      flags: '--test',
      description: 'Generate test file',
      defaultValue: true
    },
    {
      flags: '--docs',
      description: 'Generate documentation',
      defaultValue: false
    }
  ],
  action: async (type: string, name: string, options: CreateOptions = {}) => {
    try {
      if (!type || !name) {
        throw new ValidationError('Both type and name are required. Example: xala create component UserCard');
      }

      logger.info(`Creating ${type}: ${name}`);

      const generator = new ComponentGenerator();
      const spinner = ora(`Creating ${type}...`).start();

      try {
        const config = await collectCreationInfo(type, name, options);
        const results = await generator.create(config);

        spinner.succeed(`${type} created successfully`);

        console.log(chalk.bold('\n📁 Generated Files:'));
        results.files.forEach(file => {
          console.log(`  ${chalk.cyan(file.path)} (${file.type})`);
        });

        console.log(chalk.bold('\n📝 Next Steps:'));
        console.log(`  1. Import: ${chalk.cyan(`import { ${name} } from './${results.importPath}'`)}`);
        if (options.story) {
          console.log(`  2. Storybook: ${chalk.cyan('npm run storybook')}`);
        }
        if (options.test) {
          console.log(`  3. Test: ${chalk.cyan(`npm test ${name}`)}`);
        }
        console.log(`  4. Preview: ${chalk.cyan('xala preview ' + name)}`);

      } catch (error) {
        spinner.fail(`Failed to create ${type}`);
        throw error;
      }

    } catch (error) {
      logger.error('Create command failed:', error);
      throw error;
    }
  }
};

async function collectCreationInfo(type: string, name: string, options: CreateOptions): Promise<any> {
  const questions: any[] = [];

  // Platform selection if not provided
  if (!options.platform || options.platform === 'react') {
    questions.push({
      type: 'list',
      name: 'platform',
      message: 'Select target platform:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Next.js', value: 'nextjs' },
        { name: 'Vue 3', value: 'vue' },
        { name: 'Angular', value: 'angular' },
        { name: 'Svelte/SvelteKit', value: 'svelte' },
        { name: 'React Native', value: 'react-native' },
        { name: 'Electron', value: 'electron' }
      ],
      default: 'react'
    });
  }

  // Component-specific questions
  if (type === 'component' && !options.props) {
    questions.push({
      type: 'input',
      name: 'props',
      message: 'Component props (comma-separated, ? for optional):',
      default: 'title?,children?,onClick?',
      validate: (input: string) => input.length > 0 || 'Props are required'
    });
  }

  // Template selection
  if (!options.template) {
    const templates = getTemplatesForType(type);
    if (templates.length > 1) {
      questions.push({
        type: 'list',
        name: 'template',
        message: `Select ${type} template:`,
        choices: templates
      });
    }
  }

  // Additional features
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: 'Select additional features:',
    choices: getFeatureChoices(type)
  });

  const answers = await inquirer.prompt(questions);

  return {
    type,
    name,
    platform: options.platform || answers.platform || 'react',
    output: options.output,
    template: options.template || answers.template,
    props: options.props || answers.props,
    features: answers.features || [],
    generateStory: options.story !== false,
    generateTest: options.test !== false,
    generateDocs: options.docs || false
  };
}

function getTemplatesForType(type: string): Array<{ name: string; value: string }> {
  switch (type) {
    case 'component':
      return [
        { name: 'Basic Component', value: 'basic' },
        { name: 'Form Component', value: 'form' },
        { name: 'Data Display', value: 'data' },
        { name: 'Layout Component', value: 'layout' },
        { name: 'Interactive Widget', value: 'widget' }
      ];

    case 'page':
      return [
        { name: 'Basic Page', value: 'basic' },
        { name: 'Dashboard Page', value: 'dashboard' },
        { name: 'Form Page', value: 'form' },
        { name: 'List Page', value: 'list' },
        { name: 'Detail Page', value: 'detail' }
      ];

    case 'layout':
      return [
        { name: 'Basic Layout', value: 'basic' },
        { name: 'Dashboard Layout', value: 'dashboard' },
        { name: 'Auth Layout', value: 'auth' },
        { name: 'Landing Layout', value: 'landing' }
      ];

    case 'hook':
      return [
        { name: 'State Hook', value: 'state' },
        { name: 'Effect Hook', value: 'effect' },
        { name: 'API Hook', value: 'api' },
        { name: 'Form Hook', value: 'form' }
      ];

    default:
      return [{ name: 'Default', value: 'default' }];
  }
}

function getFeatureChoices(type: string): Array<{ name: string; value: string }> {
  const commonFeatures = [
    { name: 'Responsive design', value: 'responsive' },
    { name: 'Dark mode support', value: 'darkMode' },
    { name: 'Accessibility (WCAG AAA)', value: 'accessibility' },
    { name: 'TypeScript strict mode', value: 'typescript' }
  ];

  const componentFeatures = [
    { name: 'Animation support', value: 'animations' },
    { name: 'Keyboard navigation', value: 'keyboard' },
    { name: 'Touch gestures', value: 'touch' },
    { name: 'Loading states', value: 'loading' },
    { name: 'Error boundaries', value: 'errorBoundary' }
  ];

  const pageFeatures = [
    { name: 'SEO optimization', value: 'seo' },
    { name: 'Meta tags', value: 'meta' },
    { name: 'Breadcrumbs', value: 'breadcrumbs' },
    { name: 'Page transitions', value: 'transitions' }
  ];

  switch (type) {
    case 'component':
      return [...commonFeatures, ...componentFeatures];
    case 'page':
      return [...commonFeatures, ...pageFeatures];
    default:
      return commonFeatures;
  }
}