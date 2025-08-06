#!/usr/bin/env bun

/**
 * Simple Test Runner - Run tests with proper error handling
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

// Mock setup for problematic imports
const MOCK_SETUP = `
// Mock problematic imports
import { mock } from 'bun:test';

// Mock @xala-technologies/xala-mcp
mock.module('@xala-technologies/xala-mcp', () => ({
  XalaMCPClient: class MockXalaMCPClient {
    constructor() {}
    connect() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
    generateComponent() { return Promise.resolve({ success: true }); }
  },
  MCPError: class MockMCPError extends Error {},
  generateComponent: () => Promise.resolve({ success: true }),
  generateLayout: () => Promise.resolve({ success: true }),
  generatePage: () => Promise.resolve({ success: true }),
}));

// Mock playwright
mock.module('playwright', () => ({
  chromium: { launch: () => Promise.resolve({ close: () => {} }) },
  firefox: { launch: () => Promise.resolve({ close: () => {} }) },
  webkit: { launch: () => Promise.resolve({ close: () => {} }) },
}));

// Mock opentelemetry
mock.module('@opentelemetry/api', () => ({
  trace: { getTracer: () => ({}) },
  metrics: { getMeter: () => ({}) },
}));

// Mock glob
mock.module('glob', () => ({
  glob: () => Promise.resolve([]),
  globSync: () => [],
}));

// Mock inquirer
mock.module('inquirer', () => ({
  prompt: () => Promise.resolve({}),
  createPromptModule: () => () => Promise.resolve({}),
}));

// Mock chokidar
mock.module('chokidar', () => ({
  watch: () => ({ on: () => {}, close: () => {} }),
}));
`;

async function runTestFile(filePath: string, mockSetupFile: string): Promise<{ passed: boolean; output: string }> {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn('bun', ['test', filePath, '--preload', mockSetupFile], {
      cwd: path.dirname(filePath),
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000, // 30s timeout per file
      env: {
        ...process.env,
        NODE_ENV: 'test',
        BUN_ENV: 'test',
      },
    });

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      resolve({ passed: code === 0, output });
    });

    child.on('error', () => {
      resolve({ passed: false, output: 'Failed to spawn process' });
    });
  });
}

async function main() {
  console.log(chalk.cyan.bold('🚀 Simple Test Runner\n'));

  // Create mock setup file
  const mockSetupFile = path.join(__dirname, '.bun-test-setup.ts');
  await fs.writeFile(mockSetupFile, MOCK_SETUP);

  // Run a few key test files
  const testFiles = [
    'phase0/smoke/basic-validation.test.ts',
    'phase1/unit/command-handlers.test.ts',
    'phase2/unit/vue-preset.test.ts',
    'phase3/unit/npm-detector.test.ts',
    'phase4/unit/backend-utils.test.ts',
  ];

  let passed = 0;
  let failed = 0;

  for (const file of testFiles) {
    const fullPath = path.join(__dirname, file);
    if (await fs.pathExists(fullPath)) {
      process.stdout.write(`Testing ${file}... `);
      const result = await runTestFile(fullPath, mockSetupFile);
      if (result.passed) {
        console.log(chalk.green('✓'));
        passed++;
      } else {
        console.log(chalk.red('✗'));
        console.log(chalk.gray(result.output.split('\n')[0]));
        failed++;
      }
    } else {
      console.log(chalk.yellow(`Skipping ${file} (not found)`));
    }
  }

  // Clean up
  await fs.remove(mockSetupFile);

  console.log(chalk.cyan(`\nResults: ${passed} passed, ${failed} failed`));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);