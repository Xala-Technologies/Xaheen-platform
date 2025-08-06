/**
 * Phase 8: Plugins & Marketplace Test Configuration
 * 
 * Centralized configuration for all Phase 8 testing scenarios
 */

export interface PluginMetadata {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly category: 'generator' | 'template' | 'integration' | 'tool' | 'theme';
  readonly keywords: readonly string[];
  readonly homepage?: string;
  readonly repository?: string;
  readonly license: string;
  readonly certified: boolean;
  readonly rating: number;
  readonly downloads: number;
  readonly lastUpdated: string;
  readonly xaheenVersion: string;
  readonly dependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
}

export interface PluginPackage {
  readonly metadata: PluginMetadata;
  readonly files: Record<string, string>;
  readonly commands?: readonly PluginCommand[];
  readonly templates?: readonly PluginTemplate[];
}

export interface PluginCommand {
  readonly name: string;
  readonly description: string;
  readonly usage: string;
  readonly options?: readonly PluginOption[];
}

export interface PluginOption {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'boolean' | 'number';
  readonly required: boolean;
  readonly default?: any;
}

export interface PluginTemplate {
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly variables?: readonly string[];
}

export interface VersionCompatibility {
  readonly cliVersion: string;
  readonly pluginVersion: string;
  readonly compatible: boolean;
  readonly warnings?: readonly string[];
  readonly breaking?: readonly string[];
}

export const TEST_CONFIG = {
  // Plugin registry configuration
  registry: {
    baseUrl: process.env.TEST_PLUGIN_REGISTRY_URL || 'http://localhost:3002',
    apiKey: 'test-registry-api-key-12345',
  },

  // Local plugin system configuration
  pluginSystem: {
    pluginsDir: process.env.TEST_PLUGINS_DIR || '/tmp/xaheen-test-plugins',
    configFile: 'xaheen-plugins.json',
    cacheDir: '/tmp/xaheen-plugin-cache',
  },

  // Test project directories
  projects: {
    outputDir: '/tmp/xaheen-phase8-tests',
    samplesDir: 'samples',
  },

  // Sample plugin packages for testing
  samplePlugins: [
    {
      metadata: {
        name: 'xaheen-auth-generator',
        version: '1.0.0',
        description: 'Generate authentication modules for your application',
        author: 'Xaheen Team',
        category: 'generator' as const,
        keywords: ['auth', 'authentication', 'generator', 'security'],
        homepage: 'https://github.com/xaheen/plugins/auth-generator',
        repository: 'https://github.com/xaheen/plugins',
        license: 'MIT',
        certified: true,
        rating: 4.8,
        downloads: 15420,
        lastUpdated: '2025-01-01T00:00:00Z',
        xaheenVersion: '^2.0.0',
        dependencies: {
          'chalk': '^5.0.0',
          'inquirer': '^9.0.0',
        },
      },
      files: {
        'package.json': JSON.stringify({
          name: 'xaheen-auth-generator',
          version: '1.0.0',
          main: 'index.js',
          xaheen: {
            type: 'generator',
            commands: ['auth'],
          },
        }, null, 2),
        'index.js': `
          module.exports = {
            name: 'auth',
            description: 'Generate authentication module',
            async execute(options) {
              console.log('Generating auth module...');
              return { success: true };
            }
          };
        `,
        'README.md': '# Auth Generator Plugin\n\nGenerates authentication modules.',
      },
      commands: [
        {
          name: 'auth',
          description: 'Generate authentication module',
          usage: 'xaheen generate auth [options]',
          options: [
            {
              name: 'provider',
              description: 'Authentication provider (local, oauth, saml)',
              type: 'string',
              required: false,
              default: 'local',
            },
            {
              name: 'with-signup',
              description: 'Include user registration',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
      ],
    },
    {
      metadata: {
        name: 'xaheen-stripe-integration',
        version: '2.1.0',
        description: 'Stripe payment integration plugin',
        author: 'Community',
        category: 'integration' as const,
        keywords: ['stripe', 'payments', 'billing', 'integration'],
        homepage: 'https://github.com/community/xaheen-stripe',
        repository: 'https://github.com/community/xaheen-stripe',
        license: 'MIT',
        certified: false,
        rating: 4.2,
        downloads: 8932,
        lastUpdated: '2024-12-15T10:30:00Z',
        xaheenVersion: '^2.0.0',
        dependencies: {
          'stripe': '^14.0.0',
        },
      },
      files: {
        'package.json': JSON.stringify({
          name: 'xaheen-stripe-integration',
          version: '2.1.0',
          main: 'index.js',
          xaheen: {
            type: 'integration',
            commands: ['stripe'],
          },
        }, null, 2),
        'index.js': `
          module.exports = {
            name: 'stripe',
            description: 'Add Stripe payment integration',
            async execute(options) {
              console.log('Setting up Stripe integration...');
              return { success: true };
            }
          };
        `,
        'templates/payment.hbs': '<div>Payment component template</div>',
      },
      commands: [
        {
          name: 'stripe',
          description: 'Add Stripe payment integration',
          usage: 'xaheen integration stripe [options]',
          options: [
            {
              name: 'subscription',
              description: 'Enable subscription billing',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    {
      metadata: {
        name: 'xaheen-tailwind-theme',
        version: '1.2.0',
        description: 'Beautiful Tailwind CSS theme presets',
        author: 'Design Team',
        category: 'theme' as const,
        keywords: ['tailwind', 'theme', 'css', 'design'],
        license: 'MIT',
        certified: true,
        rating: 4.9,
        downloads: 23450,
        lastUpdated: '2024-12-20T14:15:00Z',
        xaheenVersion: '^2.0.0',
        dependencies: {
          'tailwindcss': '^3.4.0',
        },
      },
      files: {
        'package.json': JSON.stringify({
          name: 'xaheen-tailwind-theme',
          version: '1.2.0',
          main: 'index.js',
          xaheen: {
            type: 'theme',
            commands: ['theme'],
          },
        }, null, 2),
        'index.js': `
          module.exports = {
            name: 'theme',
            description: 'Apply Tailwind theme preset',
            async execute(options) {
              console.log('Applying theme...');
              return { success: true };
            }
          };
        `,
        'themes/modern.json': JSON.stringify({
          colors: { primary: '#3b82f6' },
        }),
      },
    },
    {
      metadata: {
        name: 'xaheen-outdated-plugin',
        version: '0.5.0',
        description: 'An outdated plugin for testing compatibility',
        author: 'Legacy Author',
        category: 'tool' as const,
        keywords: ['legacy', 'outdated'],
        license: 'MIT',
        certified: false,
        rating: 2.1,
        downloads: 152,
        lastUpdated: '2023-06-01T00:00:00Z',
        xaheenVersion: '^1.0.0', // Incompatible with CLI v2
      },
      files: {
        'package.json': JSON.stringify({
          name: 'xaheen-outdated-plugin',
          version: '0.5.0',
          main: 'index.js',
        }, null, 2),
        'index.js': 'module.exports = { name: "legacy" };',
      },
    },
  ] satisfies readonly PluginPackage[],

  // Version compatibility matrix
  compatibilityMatrix: [
    {
      cliVersion: '2.0.0',
      pluginVersion: '1.0.0',
      compatible: true,
    },
    {
      cliVersion: '2.0.0',
      pluginVersion: '2.1.0',
      compatible: true,
    },
    {
      cliVersion: '2.0.0',
      pluginVersion: '0.5.0',
      compatible: false,
      warnings: ['Plugin requires CLI v1.x'],
      breaking: ['Command API has changed'],
    },
    {
      cliVersion: '2.1.0',
      pluginVersion: '1.0.0',
      compatible: true,
    },
    {
      cliVersion: '1.9.0',
      pluginVersion: '2.0.0',
      compatible: false,
      warnings: ['Plugin requires CLI v2.x'],
      breaking: ['New plugin system'],
    },
  ] satisfies readonly VersionCompatibility[],

  // Test timeouts and intervals
  timeouts: {
    pluginInstall: 30000, // 30 seconds
    pluginPublish: 45000, // 45 seconds
    registrySearch: 5000, // 5 seconds
    compatibilityCheck: 10000, // 10 seconds
  },

  // Feature flags for testing
  features: {
    enablePluginRegistry: true,
    enablePluginInstall: true,
    enablePluginPublish: true,
    enableVersionChecking: true,
    enablePluginCache: true,
  },

  // CLI version for testing
  cliVersion: '2.0.0',
} as const;

export type TestConfig = typeof TEST_CONFIG;
export type TestPlugin = typeof TEST_CONFIG.samplePlugins[0];
export type TestCompatibility = typeof TEST_CONFIG.compatibilityMatrix[0];