import { CommandMetadata } from './index.js';
import inquirer from 'inquirer';
import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { fileExists, ensureDir, copyDirectory } from '../utils/fs.js';
import { loadConfig } from '../config/index.js';
import { displayCompletionBanner } from '../utils/banner.js';
import { commonPrompts, GlobalOptions } from '../utils/options.js';
import {
  ScaffoldError,
  ValidationError,
  FileSystemError,
  assertFileSystem,
} from '../utils/errors.js';

// Init command options
interface InitOptions extends GlobalOptions {
  name?: string;
  platform?: string;
  template?: string;
  locales?: string[];
  path?: string;
  skipPrompts?: boolean;
}

// Project configuration
interface ProjectConfig {
  name: string;
  platform: 'nextjs' | 'remix' | 'vite' | 'cra' | 'react-native';
  template: string;
  locales: string[];
  defaultLocale: string;
  features: string[];
  compliance: {
    nsm: boolean;
    gdpr: boolean;
    wcag: 'AA' | 'AAA';
  };
  authentication?: string;
  database?: string;
  deployment?: string;
  cicd?: string;
}

// Validate project name
function validateProjectName(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return 'Project name is required';
  }
  
  // Check npm naming rules
  if (!/^[a-z0-9-~][a-z0-9-._~]*$/.test(name)) {
    return 'Project name must start with lowercase letter or number, and can only contain lowercase letters, numbers, hyphens, tildes, and periods';
  }
  
  if (name.length > 214) {
    return 'Project name must be less than 214 characters';
  }
  
  // Check for reserved names
  const reserved = ['node_modules', 'favicon.ico'];
  if (reserved.includes(name.toLowerCase())) {
    return `"${name}" is a reserved name`;
  }
  
  return true;
}

// Interactive prompts for init command
async function promptForConfig(options: InitOptions): Promise<ProjectConfig> {
  const config = await loadConfig();
  
  // Project name
  const { name } = options.name
    ? { name: options.name }
    : await inquirer.prompt([{
        ...commonPrompts.projectName,
        default: path.basename(process.cwd()),
      }]);
  
  // Platform selection
  const { platform } = options.platform
    ? { platform: options.platform }
    : await inquirer.prompt([commonPrompts.framework]);
  
  // Template selection based on platform
  const templates = getTemplatesForPlatform(platform);
  const { template } = options.template
    ? { template: options.template }
    : await inquirer.prompt([{
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: templates,
        default: templates[0].value,
      }]);
  
  // SaaS type selection (if applicable)
  let saasType;
  if (template === 'saas') {
    const { type } = await inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'Select SaaS type:',
      choices: [
        { name: 'Municipal Services', value: 'municipal' },
        { name: 'Healthcare', value: 'healthcare' },
        { name: 'Education', value: 'education' },
        { name: 'Finance', value: 'finance' },
        { name: 'E-commerce', value: 'ecommerce' },
        { name: 'Custom', value: 'custom' },
      ],
    }]);
    saasType = type;
  }
  
  // Feature selection
  const { features } = await inquirer.prompt([commonPrompts.features]);
  
  // Locale selection
  const defaultLocale = config.defaultLocale;
  const { locales } = options.locales
    ? { locales: options.locales }
    : await inquirer.prompt([{
        type: 'checkbox',
        name: 'locales',
        message: 'Select locales (space to select):',
        choices: [
          { name: 'Norwegian Bokmål (nb-NO)', value: 'nb-NO', checked: true },
          { name: 'Norwegian Nynorsk (nn-NO)', value: 'nn-NO', checked: false },
          { name: 'English (US)', value: 'en-US', checked: true },
          { name: 'Arabic (Saudi Arabia)', value: 'ar-SA', checked: false },
          { name: 'French (France)', value: 'fr-FR', checked: false },
        ],
        validate: (input) => input.length > 0 || 'At least one locale must be selected',
      }]);
  
  // Compliance configuration
  const compliance = features.includes('compliance')
    ? await promptForCompliance()
    : { nsm: false, gdpr: false, wcag: 'AA' as const };
  
  // Authentication (if feature selected)
  const authentication = features.includes('auth')
    ? await promptForAuthentication()
    : undefined;
  
  // Database (if API feature selected)
  const database = features.includes('api')
    ? await promptForDatabase()
    : undefined;
  
  // Deployment target
  const { deployment } = await inquirer.prompt([{
    type: 'list',
    name: 'deployment',
    message: 'Deployment target:',
    choices: [
      { name: 'Vercel', value: 'vercel' },
      { name: 'Netlify', value: 'netlify' },
      { name: 'AWS', value: 'aws' },
      { name: 'Azure', value: 'azure' },
      { name: 'Google Cloud', value: 'gcp' },
      { name: 'Self-hosted', value: 'self-hosted' },
      { name: 'Skip', value: 'skip' },
    ],
    default: platform === 'nextjs' ? 'vercel' : 'skip',
  }]);
  
  // CI/CD
  const cicd = features.includes('cicd')
    ? await promptForCICD()
    : undefined;
  
  return {
    name,
    platform,
    template: saasType ? `${template}-${saasType}` : template,
    locales,
    defaultLocale: locales.includes(defaultLocale) ? defaultLocale : locales[0],
    features,
    compliance,
    authentication,
    database,
    deployment,
    cicd,
  };
}

// Get available templates for platform
function getTemplatesForPlatform(platform: string) {
  const templates = {
    nextjs: [
      { name: 'SaaS Application', value: 'saas' },
      { name: 'E-commerce', value: 'ecommerce' },
      { name: 'Dashboard', value: 'dashboard' },
      { name: 'Landing Page', value: 'landing' },
      { name: 'Blog', value: 'blog' },
      { name: 'Minimal', value: 'minimal' },
    ],
    remix: [
      { name: 'SaaS Application', value: 'saas' },
      { name: 'E-commerce', value: 'ecommerce' },
      { name: 'Dashboard', value: 'dashboard' },
      { name: 'Minimal', value: 'minimal' },
    ],
    vite: [
      { name: 'Single Page App', value: 'spa' },
      { name: 'Dashboard', value: 'dashboard' },
      { name: 'Component Library', value: 'library' },
      { name: 'Minimal', value: 'minimal' },
    ],
    cra: [
      { name: 'Single Page App', value: 'spa' },
      { name: 'Dashboard', value: 'dashboard' },
      { name: 'Minimal', value: 'minimal' },
    ],
    'react-native': [
      { name: 'Mobile App', value: 'mobile' },
      { name: 'Expo App', value: 'expo' },
      { name: 'Minimal', value: 'minimal' },
    ],
  };
  
  return templates[platform as keyof typeof templates] || templates.nextjs;
}

// Prompt for compliance configuration
async function promptForCompliance() {
  const { nsmLevel } = await inquirer.prompt([{
    type: 'list',
    name: 'nsmLevel',
    message: 'NSM classification level:',
    choices: [
      { name: 'Open (No classification)', value: 'OPEN' },
      { name: 'Internal (Company internal)', value: 'INTERNAL' },
      { name: 'Restricted (Need to know)', value: 'RESTRICTED' },
      { name: 'Confidential', value: 'CONFIDENTIAL' },
    ],
    default: 'INTERNAL',
  }]);
  
  const { gdprEnabled } = await inquirer.prompt([{
    type: 'confirm',
    name: 'gdprEnabled',
    message: 'Enable GDPR compliance?',
    default: true,
  }]);
  
  const { wcagLevel } = await inquirer.prompt([{
    type: 'list',
    name: 'wcagLevel',
    message: 'WCAG accessibility level:',
    choices: [
      { name: 'AA (Recommended)', value: 'AA' },
      { name: 'AAA (Highest)', value: 'AAA' },
    ],
    default: 'AAA',
  }]);
  
  return {
    nsm: nsmLevel !== 'OPEN',
    gdpr: gdprEnabled,
    wcag: wcagLevel,
  };
}

// Prompt for authentication method
async function promptForAuthentication() {
  const { auth } = await inquirer.prompt([{
    type: 'list',
    name: 'auth',
    message: 'Authentication method:',
    choices: [
      { name: 'Norwegian BankID', value: 'bankid' },
      { name: 'ID-porten', value: 'idporten' },
      { name: 'Altinn', value: 'altinn' },
      { name: 'OAuth 2.0 (Google, GitHub, etc.)', value: 'oauth' },
      { name: 'Email + Password', value: 'credentials' },
      { name: 'Magic Link', value: 'magic-link' },
      { name: 'Custom', value: 'custom' },
    ],
  }]);
  
  return auth;
}

// Prompt for database selection
async function promptForDatabase() {
  const { db } = await inquirer.prompt([{
    type: 'list',
    name: 'db',
    message: 'Database:',
    choices: [
      { name: 'PostgreSQL', value: 'postgresql' },
      { name: 'MySQL', value: 'mysql' },
      { name: 'MongoDB', value: 'mongodb' },
      { name: 'SQLite', value: 'sqlite' },
      { name: 'Supabase', value: 'supabase' },
      { name: 'PlanetScale', value: 'planetscale' },
      { name: 'None', value: 'none' },
    ],
    default: 'postgresql',
  }]);
  
  return db !== 'none' ? db : undefined;
}

// Prompt for CI/CD configuration
async function promptForCICD() {
  const { cicd } = await inquirer.prompt([{
    type: 'list',
    name: 'cicd',
    message: 'CI/CD pipeline:',
    choices: [
      { name: 'GitHub Actions', value: 'github-actions' },
      { name: 'GitLab CI', value: 'gitlab-ci' },
      { name: 'Bitbucket Pipelines', value: 'bitbucket' },
      { name: 'Jenkins', value: 'jenkins' },
      { name: 'CircleCI', value: 'circleci' },
      { name: 'Azure DevOps', value: 'azure-devops' },
    ],
    default: 'github-actions',
  }]);
  
  return cicd;
}

// Execute init command
async function executeInit(options: InitOptions): Promise<void> {
  logger.info('Initializing new Xala project...');
  
  // Get project configuration
  const projectConfig = options.skipPrompts && options.name && options.platform
    ? {
        name: options.name,
        platform: options.platform as any,
        template: options.template || 'minimal',
        locales: options.locales || ['nb-NO', 'en-US'],
        defaultLocale: 'nb-NO',
        features: ['compliance', 'i18n', 'testing', 'docs'],
        compliance: { nsm: true, gdpr: true, wcag: 'AAA' as const },
      }
    : await promptForConfig(options);
  
  // Determine project path
  const projectPath = options.path
    ? path.resolve(options.path)
    : path.join(process.cwd(), projectConfig.name);
  
  // Check if directory already exists
  if (await fileExists(projectPath)) {
    if (!options.force) {
      throw new FileSystemError(
        `Directory already exists: ${projectPath}`,
        projectPath,
        'create'
      );
    }
    logger.warn(`Directory exists, using --force to continue`);
  }
  
  // Dry run mode
  if (options.dryRun) {
    logger.info('\nDry run mode - no files will be created');
    logger.info('\nProject configuration:');
    console.log(JSON.stringify(projectConfig, null, 2));
    logger.info(`\nProject would be created at: ${projectPath}`);
    return;
  }
  
  // Create project
  const spinner = ora('Creating project structure...').start();
  
  try {
    // Create project directory
    await ensureDir(projectPath);
    
    // TODO: Copy template files
    // For now, create basic structure
    await createBasicStructure(projectPath, projectConfig);
    
    spinner.succeed('Project structure created');
    
    // TODO: Process templates
    spinner.start('Processing templates...');
    await processTemplates(projectPath, projectConfig);
    spinner.succeed('Templates processed');
    
    // TODO: Install dependencies
    if (!options.skipInstall) {
      spinner.start('Installing dependencies...');
      // await installDependencies(projectPath, projectConfig);
      spinner.succeed('Dependencies installed');
    }
    
    // TODO: Initialize Git
    if (!options.skipGit) {
      spinner.start('Initializing Git repository...');
      // await initializeGit(projectPath);
      spinner.succeed('Git repository initialized');
    }
    
    // Display completion message
    displayCompletionBanner(projectConfig.name, projectPath);
    
  } catch (error) {
    spinner.fail('Project creation failed');
    throw error;
  }
}

// Create basic project structure
async function createBasicStructure(projectPath: string, config: ProjectConfig): Promise<void> {
  // Create directories
  const dirs = [
    'src',
    'src/components',
    'src/pages',
    'src/styles',
    'src/utils',
    'src/hooks',
    'src/locales',
    'public',
    'tests',
  ];
  
  for (const dir of dirs) {
    await ensureDir(path.join(projectPath, dir));
  }
  
  // Create locale directories
  for (const locale of config.locales) {
    await ensureDir(path.join(projectPath, 'src/locales', locale));
  }
}

// Process templates with configuration
async function processTemplates(projectPath: string, config: ProjectConfig): Promise<void> {
  // TODO: Implement template processing
  // For now, create a basic package.json
  const packageJson = {
    name: config.name,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      test: 'jest',
    },
    dependencies: {},
    devDependencies: {},
  };
  
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Command metadata
const initCommand: CommandMetadata = {
  name: 'init',
  alias: 'i',
  description: 'Initialize a new Xala project with enterprise standards',
  options: [
    {
      flags: '-n, --name <name>',
      description: 'Project name',
    },
    {
      flags: '-p, --platform <platform>',
      description: 'Target platform (nextjs, remix, vite, cra, react-native)',
    },
    {
      flags: '-t, --template <template>',
      description: 'Project template',
    },
    {
      flags: '-l, --locales <locales...>',
      description: 'Supported locales (space-separated)',
    },
    {
      flags: '--path <path>',
      description: 'Custom project path',
    },
    {
      flags: '--skip-prompts',
      description: 'Skip interactive prompts and use defaults',
    },
  ],
  action: executeInit,
};

export default initCommand;