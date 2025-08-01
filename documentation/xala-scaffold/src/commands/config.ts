import { CommandMetadata } from './index.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import {
  loadConfig,
  saveConfig,
  generateConfigFile,
  getConfigValue,
  Config,
} from '../config/index.js';
import { GlobalOptions } from '../utils/options.js';
import { displaySectionBanner } from '../utils/banner.js';

// Config command options
interface ConfigOptions extends GlobalOptions {
  init?: boolean;
  get?: string;
  set?: string;
  list?: boolean;
  global?: boolean;
  edit?: boolean;
}

// Execute config command
async function executeConfig(options: ConfigOptions): Promise<void> {
  // Initialize config file
  if (options.init) {
    await initializeConfig(options.global);
    return;
  }
  
  // Get config value
  if (options.get) {
    await getConfigValueCommand(options.get);
    return;
  }
  
  // Set config value
  if (options.set) {
    await setConfigValueCommand(options.set, options.global);
    return;
  }
  
  // List all config
  if (options.list) {
    await listConfig();
    return;
  }
  
  // Interactive edit
  if (options.edit) {
    await editConfigInteractive(options.global);
    return;
  }
  
  // Default: show current config
  await listConfig();
}

// Initialize configuration file
async function initializeConfig(global: boolean = false): Promise<void> {
  logger.info(`Creating ${global ? 'global' : 'project'} configuration file...`);
  
  try {
    await generateConfigFile(global);
    logger.success('Configuration file created successfully');
  } catch (error) {
    logger.error('Failed to create configuration file:', error);
    throw error;
  }
}

// Get configuration value
async function getConfigValueCommand(path: string): Promise<void> {
  const value = getConfigValue(path);
  
  if (value === undefined) {
    logger.warn(`Configuration key not found: ${path}`);
    return;
  }
  
  if (typeof value === 'object') {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(value);
  }
}

// Set configuration value
async function setConfigValueCommand(keyValue: string, global: boolean = false): Promise<void> {
  const [key, ...valueParts] = keyValue.split('=');
  const value = valueParts.join('=');
  
  if (!key || !value) {
    logger.error('Invalid format. Use: --set key=value');
    return;
  }
  
  // Parse value
  let parsedValue: any = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (/^\d+$/.test(value)) parsedValue = parseInt(value, 10);
  else if (/^\d+\.\d+$/.test(value)) parsedValue = parseFloat(value);
  else if (value.startsWith('[') && value.endsWith(']')) {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // Keep as string if JSON parse fails
    }
  }
  
  // Create nested object from dot notation
  const keys = key.split('.');
  const configUpdate: any = {};
  let current = configUpdate;
  
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = parsedValue;
  
  try {
    await saveConfig(configUpdate, global);
    logger.success(`Configuration updated: ${key} = ${value}`);
  } catch (error) {
    logger.error('Failed to save configuration:', error);
    throw error;
  }
}

// List all configuration
async function listConfig(): Promise<void> {
  const config = await loadConfig();
  
  displaySectionBanner('Current Configuration');
  
  // Display configuration in a formatted way
  displayConfigSection('Localization', {
    'Default Locale': config.defaultLocale,
    'Supported Locales': config.supportedLocales.join(', '),
  });
  
  displayConfigSection('Compliance', {
    'NSM Compliance': config.compliance.nsm ? 'Enabled' : 'Disabled',
    'GDPR Compliance': config.compliance.gdpr ? 'Enabled' : 'Disabled',
    'WCAG Level': config.compliance.wcag,
  });
  
  displayConfigSection('Enterprise Standards', {
    'Enforce Standards': config.enterpriseStandards.enforce ? 'Yes' : 'No',
    'Auto Fix': config.enterpriseStandards.autoFix ? 'Yes' : 'No',
  });
  
  displayConfigSection('Templates', {
    'Custom Path': config.templates.customPath || 'Not set',
    'Prefer Local': config.templates.preferLocal ? 'Yes' : 'No',
  });
  
  displayConfigSection('Git Integration', {
    'Auto Commit': config.git.autoCommit ? 'Yes' : 'No',
    'Commit Message': config.git.commitMessage,
  });
  
  displayConfigSection('Telemetry', {
    'Enabled': config.telemetry.enabled ? 'Yes' : 'No',
    'Endpoint': config.telemetry.endpoint || 'Not set',
  });
}

// Display configuration section
function displayConfigSection(title: string, values: Record<string, string>): void {
  console.log(chalk.bold.white(`\n${title}:`));
  Object.entries(values).forEach(([key, value]) => {
    console.log(`  ${chalk.gray(key + ':')} ${value}`);
  });
}

// Interactive configuration editor
async function editConfigInteractive(global: boolean = false): Promise<void> {
  const config = await loadConfig();
  
  logger.info('Interactive configuration editor');
  logger.info('Press Ctrl+C to cancel\n');
  
  // Localization settings
  const { defaultLocale } = await inquirer.prompt([{
    type: 'list',
    name: 'defaultLocale',
    message: 'Default locale:',
    choices: [
      { name: 'Norwegian Bokmål (nb-NO)', value: 'nb-NO' },
      { name: 'Norwegian Nynorsk (nn-NO)', value: 'nn-NO' },
      { name: 'English (US)', value: 'en-US' },
      { name: 'Arabic (Saudi Arabia)', value: 'ar-SA' },
      { name: 'French (France)', value: 'fr-FR' },
    ],
    default: config.defaultLocale,
  }]);
  
  const { supportedLocales } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'supportedLocales',
    message: 'Supported locales:',
    choices: [
      { name: 'Norwegian Bokmål (nb-NO)', value: 'nb-NO' },
      { name: 'Norwegian Nynorsk (nn-NO)', value: 'nn-NO' },
      { name: 'English (US)', value: 'en-US' },
      { name: 'Arabic (Saudi Arabia)', value: 'ar-SA' },
      { name: 'French (France)', value: 'fr-FR' },
    ],
    default: config.supportedLocales,
    validate: (input) => input.length > 0 || 'At least one locale must be selected',
  }]);
  
  // Compliance settings
  const { compliance } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'compliance',
    message: 'Compliance features:',
    choices: [
      { name: 'NSM Compliance', value: 'nsm', checked: config.compliance.nsm },
      { name: 'GDPR Compliance', value: 'gdpr', checked: config.compliance.gdpr },
    ],
  }]);
  
  const { wcagLevel } = await inquirer.prompt([{
    type: 'list',
    name: 'wcagLevel',
    message: 'WCAG accessibility level:',
    choices: [
      { name: 'AA (Recommended minimum)', value: 'AA' },
      { name: 'AAA (Highest level)', value: 'AAA' },
    ],
    default: config.compliance.wcag,
  }]);
  
  // Enterprise standards
  const { enforceStandards } = await inquirer.prompt([{
    type: 'confirm',
    name: 'enforceStandards',
    message: 'Enforce enterprise standards?',
    default: config.enterpriseStandards.enforce,
  }]);
  
  const { autoFix } = await inquirer.prompt([{
    type: 'confirm',
    name: 'autoFix',
    message: 'Auto-fix standard violations?',
    default: config.enterpriseStandards.autoFix,
    when: enforceStandards,
  }]);
  
  // Git settings
  const { autoCommit } = await inquirer.prompt([{
    type: 'confirm',
    name: 'autoCommit',
    message: 'Auto-commit generated files?',
    default: config.git.autoCommit,
  }]);
  
  // Build updated configuration
  const updatedConfig: Partial<Config> = {
    defaultLocale,
    supportedLocales,
    compliance: {
      nsm: compliance.includes('nsm'),
      gdpr: compliance.includes('gdpr'),
      wcag: wcagLevel,
    },
    enterpriseStandards: {
      enforce: enforceStandards,
      autoFix: autoFix || false,
    },
    git: {
      autoCommit,
      commitMessage: config.git.commitMessage,
    },
  };
  
  // Save configuration
  try {
    await saveConfig(updatedConfig, global);
    logger.success('Configuration saved successfully');
  } catch (error) {
    logger.error('Failed to save configuration:', error);
    throw error;
  }
}

// Command metadata
const configCommand: CommandMetadata = {
  name: 'config',
  alias: 'c',
  description: 'Manage Xala Scaffold configuration',
  options: [
    {
      flags: '--init',
      description: 'Initialize configuration file',
    },
    {
      flags: '--get <key>',
      description: 'Get configuration value',
    },
    {
      flags: '--set <key=value>',
      description: 'Set configuration value',
    },
    {
      flags: '--list',
      description: 'List all configuration',
    },
    {
      flags: '--global',
      description: 'Use global configuration',
    },
    {
      flags: '--edit',
      description: 'Interactive configuration editor',
    },
  ],
  action: executeConfig,
};

export default configCommand;