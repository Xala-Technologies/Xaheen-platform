/**
 * Global Setup for Phase 3 Tests
 * Runs once before all tests to prepare the environment
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { TEST_ENV } from '../config/test-config';
import { 
  detectPackageManagers, 
  isPackageManagerAvailable,
  getPackageManagerVersion 
} from './package-manager-utils';
import { validateTestEnvironment } from './test-setup';

export async function setup(): Promise<void> {
  console.log('🔧 Phase 3 Global Setup Starting...');
  
  try {
    // Validate test environment
    console.log('🔍 Validating test environment...');
    const validation = await validateTestEnvironment();
    
    if (!validation.valid) {
      console.error('❌ Test environment validation failed:');
      validation.issues.forEach(issue => console.error(`   - ${issue}`));
      throw new Error('Test environment is not suitable for running Phase 3 tests');
    }
    
    console.log('✅ Test environment validation passed');
    
    // Create test directories
    console.log('📁 Creating test directories...');
    if (!existsSync(TEST_ENV.tmpDir)) {
      await mkdir(TEST_ENV.tmpDir, { recursive: true });
    }
    
    const testResultsDir = join(TEST_ENV.tmpDir, 'test-results');
    if (!existsSync(testResultsDir)) {
      await mkdir(testResultsDir, { recursive: true });
    }
    
    console.log(`   Test directory: ${TEST_ENV.tmpDir}`);
    console.log(`   Results directory: ${testResultsDir}`);
    
    // Detect and validate package managers
    console.log('📦 Detecting package managers...');
    const detection = await detectPackageManagers();
    
    if (detection.available.length === 0) {
      throw new Error('No package managers detected. This should not happen in a Node.js environment.');
    }
    
    console.log(`   Available managers: ${detection.available.join(', ')}`);
    
    // Log versions for debugging
    const versionInfo: Record<string, string> = {};
    for (const [manager, version] of Object.entries(detection.versions)) {
      console.log(`   ${manager}: ${version}`);
      versionInfo[manager] = version;
    }
    
    // Set environment variables for test awareness
    for (const manager of ['npm', 'yarn', 'pnpm', 'bun']) {
      const available = await isPackageManagerAvailable(manager as any);
      process.env[`${manager.toUpperCase()}_AVAILABLE`] = available.toString();
      
      if (available) {
        const version = await getPackageManagerVersion(manager as any);
        if (version) {
          process.env[`${manager.toUpperCase()}_VERSION`] = version;
        }
      }
    }
    
    // Create environment info file
    const envInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      availablePackageManagers: detection.available,
      packageManagerVersions: versionInfo,
      testEnvironment: {
        tmpDir: TEST_ENV.tmpDir,
        cleanup: TEST_ENV.cleanup,
        verbose: TEST_ENV.verbose,
        maxConcurrentTests: TEST_ENV.maxConcurrentTests,
        testTimeout: TEST_ENV.testTimeout,
      },
      ci: !!(
        process.env.CI ||
        process.env.CONTINUOUS_INTEGRATION ||
        process.env.GITHUB_ACTIONS ||
        process.env.GITLAB_CI
      ),
    };
    
    const envInfoPath = join(testResultsDir, 'environment-info.json');
    await writeFile(envInfoPath, JSON.stringify(envInfo, null, 2));
    
    console.log(`   Environment info saved to: ${envInfoPath}`);
    
    // Verify critical package managers
    const criticalManagers = ['npm'];
    for (const manager of criticalManagers) {
      const available = await isPackageManagerAvailable(manager as any);
      if (!available) {
        throw new Error(`Critical package manager '${manager}' is not available`);
      }
    }
    
    // Performance baseline check
    console.log('⚡ Running performance baseline check...');
    const baselineStart = Date.now();
    
    // Simple baseline operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const baselineDuration = Date.now() - baselineStart;
    console.log(`   Baseline operation took ${baselineDuration}ms`);
    
    if (baselineDuration > 1000) {
      console.warn('⚠️  System appears to be running slowly, tests may take longer than expected');
    }
    
    // Create test fixtures directory
    const fixturesDir = join(TEST_ENV.tmpDir, 'fixtures');
    if (!existsSync(fixturesDir)) {
      await mkdir(fixturesDir, { recursive: true });
    }
    
    // Create common test fixtures
    await createTestFixtures(fixturesDir);
    
    console.log('✅ Phase 3 Global Setup Complete');
    console.log(`   Ready to run tests with ${detection.available.length} package managers`);
    console.log(`   Test timeout: ${TEST_ENV.testTimeout}ms`);
    console.log(`   Max concurrent tests: ${TEST_ENV.maxConcurrentTests}`);
    
  } catch (error) {
    console.error('❌ Phase 3 Global Setup Failed:', error);
    throw error;
  }
}

/**
 * Create common test fixtures
 */
async function createTestFixtures(fixturesDir: string): Promise<void> {
  console.log('🔨 Creating test fixtures...');
  
  // Simple package.json templates
  const packageJsonTemplates = {
    minimal: {
      name: 'test-project',
      version: '1.0.0',
      private: true,
    },
    
    withDependencies: {
      name: 'test-project-with-deps',
      version: '1.0.0',
      private: true,
      dependencies: {
        lodash: '^4.17.21',
      },
      devDependencies: {
        '@types/lodash': '^4.14.0',
      },
    },
    
    withScripts: {
      name: 'test-project-with-scripts',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'echo "dev script"',
        build: 'echo "build script"',
        test: 'echo "test script"',
      },
    },
    
    monorepoRoot: {
      name: 'test-monorepo',
      version: '1.0.0',
      private: true,
      workspaces: ['packages/*', 'apps/*'],
      scripts: {
        'build:all': 'npm run build --workspaces',
        'test:all': 'npm run test --workspaces',
      },
    },
  };
  
  for (const [name, template] of Object.entries(packageJsonTemplates)) {
    const templatePath = join(fixturesDir, `package-${name}.json`);
    await writeFile(templatePath, JSON.stringify(template, null, 2));
  }
  
  // Workspace configurations
  const workspaceConfigs = {
    'pnpm-workspace.yaml': `packages:
  - 'apps/*'
  - 'packages/*'
  - 'libs/*'

exclude:
  - '**/test/**'
  - '**/tests/**'`,
    
    'yarn-workspaces.json': JSON.stringify({
      name: 'yarn-workspace',
      private: true,
      workspaces: {
        packages: ['apps/*', 'packages/*'],
        nohoist: ['**/react', '**/react-dom'],
      },
    }, null, 2),
  };
  
  for (const [filename, content] of Object.entries(workspaceConfigs)) {
    const configPath = join(fixturesDir, filename);
    await writeFile(configPath, content);
  }
  
  // Simple lockfile templates
  const lockfileTemplates = {
    'package-lock-minimal.json': JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': {
          name: 'test-project',
          version: '1.0.0',
        },
      },
    }, null, 2),
    
    'yarn-lock-minimal': `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

`,
    
    'pnpm-lock-minimal.yaml': `lockfileVersion: '6.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

dependencies: {}

devDependencies: {}
`,
    
    'bun-lockb-minimal': 'bun-lockfile-format-v0\n[packages]\n',
  };
  
  for (const [filename, content] of Object.entries(lockfileTemplates)) {
    const lockfilePath = join(fixturesDir, filename);
    await writeFile(lockfilePath, content);
  }
  
  console.log(`   Created ${Object.keys(packageJsonTemplates).length + Object.keys(workspaceConfigs).length + Object.keys(lockfileTemplates).length} test fixtures`);
}

export async function teardown(): Promise<void> {
  console.log('🧹 Phase 3 Global Teardown...');
  
  // Cleanup is handled by individual test teardown
  // Global teardown just logs completion
  
  console.log('✅ Phase 3 Global Teardown Complete');
}