import { promises as fs } from 'fs';
import path from 'path';
import { homedir } from 'os';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { fileExists } from '../utils/fs.js';

// Configuration schema using Zod
const ConfigSchema = z.object({
  defaultLocale: z.string().default('nb-NO'),
  supportedLocales: z.array(z.string()).default(['nb-NO', 'nn-NO', 'en-US', 'ar-SA', 'fr-FR']),
  compliance: z.object({
    nsm: z.boolean().default(true),
    gdpr: z.boolean().default(true),
    wcag: z.enum(['AA', 'AAA']).default('AAA'),
  }).default({}),
  enterpriseStandards: z.object({
    enforce: z.boolean().default(true),
    autoFix: z.boolean().default(true),
  }).default({}),
  telemetry: z.object({
    enabled: z.boolean().default(false),
    endpoint: z.string().optional(),
  }).default({}),
  templates: z.object({
    customPath: z.string().optional(),
    preferLocal: z.boolean().default(false),
  }).default({}),
  git: z.object({
    autoCommit: z.boolean().default(false),
    commitMessage: z.string().default('feat: scaffold {type} {name}'),
  }).default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

// Default configuration
const defaultConfig: Config = {
  defaultLocale: 'nb-NO',
  supportedLocales: ['nb-NO', 'nn-NO', 'en-US', 'ar-SA', 'fr-FR'],
  compliance: {
    nsm: true,
    gdpr: true,
    wcag: 'AAA',
  },
  enterpriseStandards: {
    enforce: true,
    autoFix: true,
  },
  telemetry: {
    enabled: false,
  },
  templates: {
    preferLocal: false,
  },
  git: {
    autoCommit: false,
    commitMessage: 'feat: scaffold {type} {name}',
  },
};

// Configuration file paths
const CONFIG_FILENAME = '.xalarc.json';
const GLOBAL_CONFIG_PATH = path.join(homedir(), CONFIG_FILENAME);

// Configuration cache
let configCache: Config | null = null;

// Load configuration from file
export async function loadConfig(projectPath?: string): Promise<Config> {
  if (configCache) {
    return configCache;
  }

  const configs: Partial<Config>[] = [];
  
  // Load global config
  if (await fileExists(GLOBAL_CONFIG_PATH)) {
    try {
      const globalConfig = JSON.parse(await fs.readFile(GLOBAL_CONFIG_PATH, 'utf-8'));
      configs.push(globalConfig);
      logger.debug('Loaded global config from:', GLOBAL_CONFIG_PATH);
    } catch (error) {
      logger.warn('Failed to load global config:', error);
    }
  }
  
  // Load project config (walk up directory tree)
  if (projectPath) {
    const projectConfig = await loadProjectConfig(projectPath);
    if (projectConfig) {
      configs.push(projectConfig);
    }
  }
  
  // Load environment variables
  const envConfig = loadEnvConfig();
  if (envConfig) {
    configs.push(envConfig);
  }
  
  // Merge configurations (later configs override earlier ones)
  const mergedConfig = mergeConfigs(defaultConfig, ...configs);
  
  // Validate configuration
  try {
    configCache = ConfigSchema.parse(mergedConfig);
    logger.debug('Configuration loaded and validated');
    return configCache;
  } catch (error) {
    logger.error('Invalid configuration:', error);
    logger.info('Using default configuration');
    configCache = defaultConfig;
    return configCache;
  }
}

// Load project-specific config by walking up directory tree
async function loadProjectConfig(startPath: string): Promise<Partial<Config> | null> {
  let currentPath = path.resolve(startPath);
  const root = path.parse(currentPath).root;
  
  while (currentPath !== root) {
    const configPath = path.join(currentPath, CONFIG_FILENAME);
    
    if (await fileExists(configPath)) {
      try {
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        logger.debug('Loaded project config from:', configPath);
        return config;
      } catch (error) {
        logger.warn('Failed to load project config:', error);
        return null;
      }
    }
    
    currentPath = path.dirname(currentPath);
  }
  
  return null;
}

// Load configuration from environment variables
function loadEnvConfig(): Partial<Config> | null {
  const config: any = {};
  
  if (process.env.XALA_DEFAULT_LOCALE) {
    config.defaultLocale = process.env.XALA_DEFAULT_LOCALE;
  }
  
  if (process.env.XALA_TELEMETRY_ENABLED) {
    config.telemetry = {
      enabled: process.env.XALA_TELEMETRY_ENABLED === 'true',
    };
  }
  
  if (process.env.XALA_ENTERPRISE_STANDARDS) {
    config.enterpriseStandards = {
      enforce: process.env.XALA_ENTERPRISE_STANDARDS !== 'false',
    };
  }
  
  return Object.keys(config).length > 0 ? config : null;
}

// Merge multiple configurations
function mergeConfigs(...configs: Partial<Config>[]): Config {
  return configs.reduce((merged, config) => {
    return deepMerge(merged, config);
  }, {} as Config);
}

// Deep merge utility
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Save configuration to file
export async function saveConfig(config: Partial<Config>, global = false): Promise<void> {
  const configPath = global ? GLOBAL_CONFIG_PATH : path.join(process.cwd(), CONFIG_FILENAME);
  
  try {
    const currentConfig = await loadConfig();
    const updatedConfig = mergeConfigs(currentConfig, config);
    
    await fs.writeFile(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
      'utf-8'
    );
    
    logger.info(`Configuration saved to: ${configPath}`);
    
    // Clear cache
    configCache = null;
  } catch (error) {
    logger.error('Failed to save configuration:', error);
    throw error;
  }
}

// Generate config file
export async function generateConfigFile(global = false): Promise<void> {
  const configPath = global ? GLOBAL_CONFIG_PATH : path.join(process.cwd(), CONFIG_FILENAME);
  
  if (await fileExists(configPath)) {
    logger.warn(`Configuration file already exists: ${configPath}`);
    return;
  }
  
  try {
    await fs.writeFile(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      'utf-8'
    );
    
    logger.success(`Configuration file created: ${configPath}`);
  } catch (error) {
    logger.error('Failed to create configuration file:', error);
    throw error;
  }
}

// Get config value with path
export function getConfigValue(path: string): any {
  const config = configCache || defaultConfig;
  const keys = path.split('.');
  
  let value: any = config;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value;
}

// Export config type and default
export { defaultConfig };