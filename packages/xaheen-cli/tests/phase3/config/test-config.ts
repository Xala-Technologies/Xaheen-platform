/**
 * Phase 3 Test Configuration
 * Multi-Package-Manager Support Testing
 */

import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export interface PackageManagerConfig {
  readonly name: string;
  readonly command: string;
  readonly installCmd: string;
  readonly devCmd: string;
  readonly lockfile: string;
  readonly workspaceConfig?: string;
  readonly version?: string;
}

export interface TestProjectConfig {
  readonly name: string;
  readonly preset: string;
  readonly framework: string;
  readonly features?: string[];
}

export interface TestEnvironmentConfig {
  readonly tmpDir: string;
  readonly testTimeout: number;
  readonly maxConcurrentTests: number;
  readonly cleanup: boolean;
  readonly verbose: boolean;
}

/**
 * Supported Package Managers Configuration
 */
export const PACKAGE_MANAGERS: readonly PackageManagerConfig[] = [
  {
    name: 'npm',
    command: 'npm',
    installCmd: 'install',
    devCmd: 'run dev',
    lockfile: 'package-lock.json',
  },
  {
    name: 'yarn',
    command: 'yarn',
    installCmd: 'install',
    devCmd: 'dev',
    lockfile: 'yarn.lock',
    workspaceConfig: 'package.json', // workspaces field
  },
  {
    name: 'pnpm',
    command: 'pnpm',
    installCmd: 'install',
    devCmd: 'dev',
    lockfile: 'pnpm-lock.yaml',
    workspaceConfig: 'pnpm-workspace.yaml',
  },
  {
    name: 'bun',
    command: 'bun',
    installCmd: 'install',
    devCmd: 'dev',
    lockfile: 'bun.lockb',
  },
] as const;

/**
 * Test Project Templates
 */
export const TEST_PROJECTS: readonly TestProjectConfig[] = [
  {
    name: 'nextjs-basic',
    preset: 'nextjs',
    framework: 'Next.js',
    features: ['typescript', 'tailwind'],
  },
  {
    name: 'express-api',
    preset: 'backend-express',
    framework: 'Express.js',
    features: ['typescript', 'cors'],
  },
  {
    name: 'vue-spa',
    preset: 'vite-vue',
    framework: 'Vue.js',
    features: ['typescript', 'router'],
  },
] as const;

/**
 * Test Environment Configuration
 */
export const TEST_ENV: TestEnvironmentConfig = {
  tmpDir: join(tmpdir(), 'xaheen-phase3-tests'),
  testTimeout: 120000, // 2 minutes per test
  maxConcurrentTests: 4,
  cleanup: process.env.XAHEEN_TEST_CLEANUP !== 'false',
  verbose: process.env.XAHEEN_TEST_VERBOSE === 'true',
} as const;

/**
 * Performance Benchmarks (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  scaffoldDryRun: 500,
  scaffoldReal: 2000,
  npmInstall: 30000,
  yarnInstall: 25000,
  pnpmInstall: 20000,
  bunInstall: 15000,
  devServerStart: 10000,
} as const;

/**
 * Test Ports Configuration
 */
export const TEST_PORTS = {
  nextjs: 4000,
  express: 4001,
  vue: 4002,
  svelte: 4003,
  react: 4004,
} as const;

/**
 * Generate unique test directory name
 */
export function generateTestDir(prefix = 'test'): string {
  const randomId = randomBytes(4).toString('hex');
  return join(TEST_ENV.tmpDir, `${prefix}-${randomId}`);
}

/**
 * Get package manager by name
 */
export function getPackageManager(name: string): PackageManagerConfig | undefined {
  return PACKAGE_MANAGERS.find(pm => pm.name === name);
}

/**
 * Get test project by name
 */
export function getTestProject(name: string): TestProjectConfig | undefined {
  return TEST_PROJECTS.find(project => project.name === name);
}

/**
 * Monorepo Test Configurations
 */
export const MONOREPO_CONFIGS = {
  pnpm: {
    'pnpm-workspace.yaml': `packages:
  - 'apps/*'
  - 'packages/*'
  - 'libs/*'`,
    'package.json': {
      name: 'test-monorepo',
      private: true,
      workspaces: ['apps/*', 'packages/*'],
    },
  },
  yarn: {
    'package.json': {
      name: 'test-monorepo',
      private: true,
      workspaces: ['apps/*', 'packages/*', 'libs/*'],
    },
  },
  npm: {
    'package.json': {
      name: 'test-monorepo',
      private: true,
      workspaces: ['apps/*', 'packages/*'],
    },
  },
} as const;

/**
 * Lockfile Test Scenarios
 */
export const LOCKFILE_SCENARIOS = [
  {
    name: 'yarn-lock-only',
    files: ['yarn.lock'],
    expectedManager: 'yarn',
  },
  {
    name: 'package-lock-only',
    files: ['package-lock.json'],
    expectedManager: 'npm',
  },
  {
    name: 'pnpm-lock-only',
    files: ['pnpm-lock.yaml'],
    expectedManager: 'pnpm',
  },
  {
    name: 'bun-lock-only',
    files: ['bun.lockb'],
    expectedManager: 'bun',
  },
  {
    name: 'mixed-locks',
    files: ['package-lock.json', 'yarn.lock'],
    expectedManager: 'npm', // npm should take precedence
  },
  {
    name: 'all-locks',
    files: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    expectedManager: 'npm', // npm should take precedence
  },
] as const;

export type PackageManagerName = typeof PACKAGE_MANAGERS[number]['name'];
export type TestProjectName = typeof TEST_PROJECTS[number]['name'];
export type LockfileScenario = typeof LOCKFILE_SCENARIOS[number];