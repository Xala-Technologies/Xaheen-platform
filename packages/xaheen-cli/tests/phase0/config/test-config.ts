/**
 * Phase 0 Test Configuration
 * 
 * Centralized configuration for all Phase 0 tests including
 * timeouts, registry settings, and environment variables.
 */

export interface Phase0TestConfig {
  timeouts: {
    default: number;
    build: number;
    install: number;
    network: number;
  };
  registry: {
    staging: string;
    production: string;
    github: string;
  };
  paths: {
    tempDir: string;
    distDir: string;
    docsDir: string;
    packageRoot: string;
  };
  commands: {
    packageManager: 'bun' | 'npm' | 'yarn' | 'pnpm';
    cliName: string;
    binName: string;
  };
  cleanup: {
    enabled: boolean;
    retainOnFailure: boolean;
    maxTempDirs: number;
  };
}

/**
 * Default test configuration
 */
export const defaultConfig: Phase0TestConfig = {
  timeouts: {
    default: 30000, // 30 seconds
    build: 120000,  // 2 minutes for builds
    install: 60000, // 1 minute for installs
    network: 45000, // 45 seconds for network operations
  },
  registry: {
    staging: process.env.GITHUB_REGISTRY || 'https://npm.pkg.github.com',
    production: 'https://registry.npmjs.org',
    github: 'https://npm.pkg.github.com',
  },
  paths: {
    tempDir: process.env.TEST_TEMP_DIR || '/tmp/xaheen-cli-tests',
    distDir: './dist',
    docsDir: './docs',
    packageRoot: process.cwd(),
  },
  commands: {
    packageManager: (process.env.TEST_PACKAGE_MANAGER as any) || 'bun',
    cliName: 'xaheen',
    binName: 'xaheen',
  },
  cleanup: {
    enabled: process.env.CLEANUP_ON_EXIT !== 'false',
    retainOnFailure: process.env.RETAIN_ON_FAILURE === 'true',
    maxTempDirs: parseInt(process.env.MAX_TEMP_DIRS || '10'),
  },
};

/**
 * Environment-specific overrides
 */
export const getTestConfig = (): Phase0TestConfig => {
  const config = { ...defaultConfig };
  
  // CI environment adjustments
  if (process.env.CI) {
    config.timeouts.build = 300000; // 5 minutes in CI
    config.timeouts.install = 180000; // 3 minutes in CI
    config.cleanup.retainOnFailure = true; // Keep artifacts for debugging
  }
  
  // GitHub Actions specific
  if (process.env.GITHUB_ACTIONS) {
    config.registry.github = `https://npm.pkg.github.com/${process.env.GITHUB_REPOSITORY_OWNER}`;
  }
  
  return config;
};

/**
 * Validate required environment variables
 */
export const validateEnvironment = (): void => {
  const required = [
    'GITHUB_TOKEN',
  ] as const;
  
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables for full Phase 0 testing: ${missing.join(', ')}`);
    console.warn('Some tests may be skipped or run in mock mode.');
  }
};

/**
 * Get package.json information
 */
export const getPackageInfo = () => {
  try {
    const packagePath = './package.json';
    const packageJson = require(packagePath);
    
    return {
      name: packageJson.name,
      version: packageJson.version,
      main: packageJson.main,
      bin: packageJson.bin,
      publishConfig: packageJson.publishConfig,
    };
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error}`);
  }
};

/**
 * Test environment setup validation
 */
export const validateTestEnvironment = (): boolean => {
  const config = getTestConfig();
  
  // Check if required directories exist
  const requiredPaths = [
    config.paths.packageRoot,
  ];
  
  try {
    const fs = require('fs');
    for (const path of requiredPaths) {
      if (!fs.existsSync(path)) {
        console.error(`❌ Required path does not exist: ${path}`);
        return false;
      }
    }
    
    // Check if package.json is valid
    getPackageInfo();
    
    console.log('✅ Test environment validation passed');
    return true;
  } catch (error) {
    console.error(`❌ Test environment validation failed: ${error}`);
    return false;
  }
};