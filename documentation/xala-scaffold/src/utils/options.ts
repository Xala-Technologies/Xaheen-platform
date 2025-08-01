import { Command } from 'commander';
import { logger } from './logger.js';
import { Config } from '../config/index.js';

// Global options interface
export interface GlobalOptions {
  verbose?: boolean;
  quiet?: boolean;
  noColor?: boolean;
  config?: string;
  locale?: string;
  dryRun?: boolean;
  force?: boolean;
  skipGit?: boolean;
  skipInstall?: boolean;
  skipValidation?: boolean;
}

// Configure global options for all commands
export function configureGlobalOptions(program: Command): void {
  program
    .option('-v, --verbose', 'Enable verbose output')
    .option('-q, --quiet', 'Suppress all output except errors')
    .option('--no-color', 'Disable colored output')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('-l, --locale <locale>', 'Set locale for messages (nb-NO, en-US, etc.)')
    .option('--dry-run', 'Preview changes without applying them')
    .option('-f, --force', 'Force operation without confirmation')
    .option('--skip-git', 'Skip Git operations')
    .option('--skip-install', 'Skip dependency installation')
    .option('--skip-validation', 'Skip validation checks')
    .hook('preAction', (thisCommand, actionCommand) => {
      const options = actionCommand.opts() as GlobalOptions;
      
      // Configure logger based on options
      if (options.verbose) {
        process.env.LOG_LEVEL = 'DEBUG';
      }
      if (options.quiet) {
        process.env.LOG_LEVEL = 'ERROR';
      }
      if (options.noColor === false) {
        process.env.FORCE_COLOR = '0';
      }
      
      // Log options in debug mode
      logger.debug('Global options:', options);
    });
}

// Parse and validate options
export function parseOptions<T extends GlobalOptions>(
  options: T,
  defaults?: Partial<T>
): T {
  // Merge with defaults
  const parsed = {
    ...defaults,
    ...options,
  };
  
  // Validate conflicting options
  if (parsed.verbose && parsed.quiet) {
    logger.warn('Both --verbose and --quiet specified. Using --verbose.');
    parsed.quiet = false;
  }
  
  return parsed;
}

// Option validation helpers
export function validateLocale(locale: string): boolean {
  const validLocales = ['nb-NO', 'nn-NO', 'en-US', 'ar-SA', 'fr-FR'];
  return validLocales.includes(locale);
}

export function validatePath(path: string): boolean {
  // Basic path validation
  if (!path || path.length === 0) return false;
  
  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(path)) return false;
  
  return true;
}

// Option prompt configurations
export interface PromptConfig {
  type: 'input' | 'password' | 'number' | 'confirm' | 'list' | 'checkbox' | 'expand' | 'editor';
  name: string;
  message: string;
  default?: any;
  choices?: Array<string | { name: string; value: any; short?: string }>;
  validate?: (input: any) => boolean | string | Promise<boolean | string>;
  filter?: (input: any) => any;
  when?: boolean | ((answers: any) => boolean);
  pageSize?: number;
  prefix?: string;
  suffix?: string;
}

// Create prompt configurations for common options
export const commonPrompts = {
  projectName: {
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    validate: (input: string) => {
      if (!input || input.trim().length === 0) {
        return 'Project name is required';
      }
      if (!/^[a-z0-9-_]+$/i.test(input)) {
        return 'Project name can only contain letters, numbers, hyphens, and underscores';
      }
      return true;
    },
  } as PromptConfig,
  
  projectType: {
    type: 'list',
    name: 'projectType',
    message: 'Project type:',
    choices: [
      { name: 'Full Application', value: 'app', short: 'App' },
      { name: 'Component Library', value: 'library', short: 'Library' },
      { name: 'Single Component', value: 'component', short: 'Component' },
      { name: 'Page Template', value: 'page', short: 'Page' },
    ],
    default: 'app',
  } as PromptConfig,
  
  framework: {
    type: 'list',
    name: 'framework',
    message: 'Framework:',
    choices: [
      { name: 'Next.js 14+ (App Router)', value: 'nextjs', short: 'Next.js' },
      { name: 'Remix', value: 'remix', short: 'Remix' },
      { name: 'Vite + React', value: 'vite', short: 'Vite' },
      { name: 'React (CRA)', value: 'cra', short: 'CRA' },
    ],
    default: 'nextjs',
  } as PromptConfig,
  
  locale: {
    type: 'list',
    name: 'locale',
    message: 'Default locale:',
    choices: [
      { name: 'Norwegian Bokmål (nb-NO)', value: 'nb-NO', short: 'nb-NO' },
      { name: 'Norwegian Nynorsk (nn-NO)', value: 'nn-NO', short: 'nn-NO' },
      { name: 'English (US)', value: 'en-US', short: 'en-US' },
      { name: 'Arabic (Saudi Arabia)', value: 'ar-SA', short: 'ar-SA' },
      { name: 'French (France)', value: 'fr-FR', short: 'fr-FR' },
    ],
    default: 'nb-NO',
  } as PromptConfig,
  
  features: {
    type: 'checkbox',
    name: 'features',
    message: 'Select features:',
    choices: [
      { name: 'Norwegian Compliance (NSM, GDPR)', value: 'compliance', checked: true },
      { name: 'Multi-language Support', value: 'i18n', checked: true },
      { name: 'Dark Mode', value: 'darkMode', checked: true },
      { name: 'Authentication', value: 'auth', checked: false },
      { name: 'API Integration', value: 'api', checked: false },
      { name: 'Testing Setup', value: 'testing', checked: true },
      { name: 'CI/CD Pipeline', value: 'cicd', checked: false },
      { name: 'Documentation', value: 'docs', checked: true },
    ],
  } as PromptConfig,
  
  gitInit: {
    type: 'confirm',
    name: 'gitInit',
    message: 'Initialize Git repository?',
    default: true,
  } as PromptConfig,
  
  install: {
    type: 'confirm',
    name: 'install',
    message: 'Install dependencies?',
    default: true,
  } as PromptConfig,
};

// Option transformation utilities
export function transformKebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function transformCamelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-/, '');
}

// Option serialization for configs
export function serializeOptions(options: GlobalOptions): Record<string, any> {
  const serialized: Record<string, any> = {};
  
  Object.entries(options).forEach(([key, value]) => {
    // Skip undefined values
    if (value === undefined) return;
    
    // Transform boolean flags
    if (typeof value === 'boolean') {
      serialized[transformCamelToKebab(key)] = value;
    } else {
      serialized[transformCamelToKebab(key)] = value;
    }
  });
  
  return serialized;
}

// Option deserialization from configs
export function deserializeOptions(serialized: Record<string, any>): GlobalOptions {
  const options: GlobalOptions = {};
  
  Object.entries(serialized).forEach(([key, value]) => {
    const camelKey = transformKebabToCamel(key) as keyof GlobalOptions;
    (options as any)[camelKey] = value;
  });
  
  return options;
}

// Merge options from different sources
export function mergeOptions(
  cliOptions: GlobalOptions,
  configOptions: Partial<GlobalOptions>,
  envOptions: Partial<GlobalOptions>
): GlobalOptions {
  // Priority: CLI > ENV > Config
  return {
    ...configOptions,
    ...envOptions,
    ...cliOptions,
  };
}

// Environment variable mapping
export function loadOptionsFromEnv(): Partial<GlobalOptions> {
  const options: Partial<GlobalOptions> = {};
  
  if (process.env.XALA_VERBOSE === 'true') options.verbose = true;
  if (process.env.XALA_QUIET === 'true') options.quiet = true;
  if (process.env.XALA_NO_COLOR === 'true') options.noColor = true;
  if (process.env.XALA_CONFIG) options.config = process.env.XALA_CONFIG;
  if (process.env.XALA_LOCALE) options.locale = process.env.XALA_LOCALE;
  if (process.env.XALA_DRY_RUN === 'true') options.dryRun = true;
  if (process.env.XALA_FORCE === 'true') options.force = true;
  if (process.env.XALA_SKIP_GIT === 'true') options.skipGit = true;
  if (process.env.XALA_SKIP_INSTALL === 'true') options.skipInstall = true;
  if (process.env.XALA_SKIP_VALIDATION === 'true') options.skipValidation = true;
  
  return options;
}