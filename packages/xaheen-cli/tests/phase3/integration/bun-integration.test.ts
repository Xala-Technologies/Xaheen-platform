/**
 * Bun Integration Tests
 * Tests complete workflow: scaffold → install → dev smoke test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import {
  executeCommand,
  installDependencies,
  startDevServer,
  isPackageManagerAvailable,
  getPackageManagerVersion,
  cleanup,
} from '../utils/package-manager-utils';
import { generateTestDir, TEST_PORTS, PERFORMANCE_THRESHOLDS } from '../config/test-config';

describe('Bun Integration Tests', () => {
  let testDir: string;
  let processes: any[] = [];
  let bunAvailable: boolean;
  let bunVersion: string | null;
  
  beforeEach(async () => {
    testDir = generateTestDir('bun-integration');
    await mkdir(testDir, { recursive: true });
    processes = [];
    bunAvailable = await isPackageManagerAvailable('bun');
    bunVersion = await getPackageManagerVersion('bun');
  });
  
  afterEach(async () => {
    cleanup(processes);
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic Bun Operations', () => {
    it('should verify bun availability', async () => {
      if (!bunAvailable) {
        console.warn('Bun not available, skipping bun-specific tests');
        return;
      }
      
      expect(bunAvailable).toBe(true);
      expect(bunVersion).toBeTruthy();
    });

    it('should execute bun commands successfully', async () => {
      if (!bunAvailable) return;
      
      const result = await executeCommand('bun --version', testDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should initialize bun project', async () => {
      if (!bunAvailable) return;
      
      const result = await executeCommand('bun init -y', testDir);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'package.json'))).toBe(true);
    });

    it('should verify bun runtime features', async () => {
      if (!bunAvailable || !bunVersion) return;
      
      console.log(`Detected Bun ${bunVersion}`);
      
      // Test bun runtime
      const result = await executeCommand('bun --help', testDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toLowerCase()).toContain('install');
      expect(result.stdout.toLowerCase()).toContain('run');
    });
  });

  describe('Next.js Project with Bun', () => {
    const projectName = 'nextjs-bun-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold Next.js project successfully', async () => {
      if (!bunAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          eslint: '^8.0.0',
          'eslint-config-next': '^14.0.0',
          typescript: '^5.0.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
    }, 10000);

    it('should install dependencies with bun', async () => {
      if (!bunAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        dependencies: {
          lodash: '^4.17.21',
          axios: '^1.4.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      const startTime = Date.now();
      const result = await installDependencies('bun', projectDir, 60000);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.bunInstall);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'bun.lockb'))).toBe(true);
      
      console.log(`Bun install completed in ${duration}ms (expected < ${PERFORMANCE_THRESHOLDS.bunInstall}ms)`);
    }, 70000);

    it('should handle bun install with existing bun.lockb', async () => {
      if (!bunAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // First install to create lockfile
      const firstInstall = await installDependencies('bun', projectDir, 30000);
      expect(firstInstall.exitCode).toBe(0);
      
      // Second install should use existing lockfile
      const secondInstall = await installDependencies('bun', projectDir, 20000);
      expect(secondInstall.exitCode).toBe(0);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'bun.lockb'))).toBe(true);
    }, 60000);
  });

  describe('Express.js API with Bun', () => {
    const projectName = 'express-bun-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold and install Express.js project', async () => {
      if (!bunAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        main: 'index.js',
        scripts: {
          dev: 'bun run index.js',
          start: 'bun run index.js',
        },
        dependencies: {
          express: '^4.18.0',
          cors: '^2.8.5',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Create basic Express server optimized for Bun
      const serverCode = `
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || ${TEST_PORTS.express};

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    runtime: 'bun',
    timestamp: new Date().toISOString() 
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Express server running with Bun' });
});

app.listen(port, () => {
  console.log(\`Server ready on port \${port}\`);
});
      `.trim();
      
      await executeCommand(`echo '${serverCode}' > index.js`, projectDir);
      
      // Install dependencies
      const installResult = await installDependencies('bun', projectDir, 45000);
      expect(installResult.exitCode).toBe(0);
      
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'bun.lockb'))).toBe(true);
    }, 55000);

    it('should run Express server with bun runtime', async () => {
      if (!bunAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        scripts: {
          dev: 'bun run server.js',
        },
        dependencies: {
          express: '^4.18.0',
        },
      };
      
      const serverCode = `
const express = require('express');
const app = express();
const port = ${TEST_PORTS.express};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', runtime: 'bun' });
});

app.listen(port, () => {
  console.log('Server ready on port ' + port);
});
      `.trim();
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      await executeCommand(`echo '${serverCode}' > server.js`, projectDir);
      
      // Install dependencies
      await installDependencies('bun', projectDir, 30000);
      
      // Start server using bun
      const { process: devProcess, ready } = await startDevServer('bun', projectDir, TEST_PORTS.express);
      processes.push(devProcess);
      
      const isReady = await ready;
      expect(isReady).toBe(true);
      
      // Test health endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const healthCheck = await executeCommand(
        `curl -f http://localhost:${TEST_PORTS.express}/health`,
        testDir,
        10000
      );
      
      if (healthCheck.exitCode === 0) {
        expect(healthCheck.stdout).toContain('bun');
      }
    }, 60000);
  });

  describe('Bun-specific Features', () => {
    it('should test bun run command', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'bun-run-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'bun-run-test',
        version: '1.0.0',
        scripts: {
          hello: 'echo "Hello from Bun"',
          test: 'bun --version',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Test bun run
      const runResult = await executeCommand('bun run hello', projectDir, 10000);
      expect(runResult.exitCode).toBe(0);
      expect(runResult.stdout).toContain('Hello from Bun');
      
      const testResult = await executeCommand('bun run test', projectDir, 10000);
      expect(testResult.exitCode).toBe(0);
      expect(testResult.stdout).toMatch(/^\d+\.\d+\.\d+/);
    }, 20000);

    it('should test bun as JavaScript runtime', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'bun-runtime-test');
      await mkdir(projectDir, { recursive: true });
      
      // Create a simple JavaScript file
      const jsCode = `
console.log('Bun runtime test');
console.log('Process version:', process.version);
console.log('Bun version:', Bun?.version || 'Not available');
      `.trim();
      
      await executeCommand(`echo '${jsCode}' > test.js`, projectDir);
      
      // Run with bun runtime
      const result = await executeCommand('bun test.js', projectDir, 10000);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Bun runtime test');
    }, 15000);

    it('should test bun package manager features', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'bun-features-test');
      await mkdir(projectDir, { recursive: true });
      
      // Test bun add command
      const initResult = await executeCommand('bun init -y', projectDir);
      expect(initResult.exitCode).toBe(0);
      
      const addResult = await executeCommand('bun add lodash', projectDir, 30000);
      expect(addResult.exitCode).toBe(0);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'bun.lockb'))).toBe(true);
      
      // Verify package was added
      const packageJsonPath = join(projectDir, 'package.json');
      const packageJsonContent = await executeCommand(`cat ${packageJsonPath}`, projectDir);
      expect(packageJsonContent.stdout).toContain('lodash');
    }, 40000);
  });

  describe('Bun Performance Features', () => {
    it('should demonstrate bun install speed', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'perf-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'perf-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
          axios: '^1.4.0',
          moment: '^2.29.4',
          react: '^18.2.0',
          express: '^4.18.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      const startTime = Date.now();
      const result = await installDependencies('bun', projectDir, PERFORMANCE_THRESHOLDS.bunInstall);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.bunInstall);
      
      console.log(`Bun install completed in ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.bunInstall}ms)`);
      
      // Bun should be significantly faster than other package managers
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.npmInstall / 2);
    }, PERFORMANCE_THRESHOLDS.bunInstall + 5000);

    it('should test bun install caching', async () => {
      if (!bunAvailable) return;
      
      const proj1Dir = join(testDir, 'cache-test-1');
      const proj2Dir = join(testDir, 'cache-test-2');
      
      await mkdir(proj1Dir, { recursive: true });
      await mkdir(proj2Dir, { recursive: true });
      
      const packageJson = {
        name: 'cache-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
          axios: '^1.4.0',
        },
      };
      
      // First install
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        proj1Dir
      );
      
      const firstInstallStart = Date.now();
      const firstInstall = await installDependencies('bun', proj1Dir, 30000);
      const firstInstallDuration = Date.now() - firstInstallStart;
      
      expect(firstInstall.exitCode).toBe(0);
      
      // Second install (should use cache)
      await executeCommand(
        `echo '${JSON.stringify({ ...packageJson, name: 'cache-test-2' }, null, 2)}' > package.json`,
        proj2Dir
      );
      
      const secondInstallStart = Date.now();
      const secondInstall = await installDependencies('bun', proj2Dir, 20000);
      const secondInstallDuration = Date.now() - secondInstallStart;
      
      expect(secondInstall.exitCode).toBe(0);
      
      console.log(`First install: ${firstInstallDuration}ms, Second install: ${secondInstallDuration}ms`);
      
      // Second install should be faster due to caching
      expect(secondInstallDuration).toBeLessThanOrEqual(firstInstallDuration);
    }, 60000);
  });

  describe('Bun TypeScript Support', () => {
    it('should run TypeScript files directly', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'ts-test');
      await mkdir(projectDir, { recursive: true });
      
      // Create TypeScript file
      const tsCode = `
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Test User',
  age: 25
};

console.log('TypeScript test:', user);
console.log('Type checking works!');
      `.trim();
      
      await executeCommand(`echo '${tsCode}' > test.ts`, projectDir);
      
      // Run TypeScript file directly with bun
      const result = await executeCommand('bun test.ts', projectDir, 10000);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('TypeScript test');
      expect(result.stdout).toContain('Type checking works');
    }, 15000);

    it('should handle TypeScript with dependencies', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'ts-deps-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'ts-deps-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
        devDependencies: {
          '@types/lodash': '^4.14.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Install dependencies
      await installDependencies('bun', projectDir, 25000);
      
      // Create TypeScript file using lodash
      const tsCode = `
import * as _ from 'lodash';

const numbers = [1, 2, 3, 4, 5];
const doubled = _.map(numbers, n => n * 2);

console.log('Original:', numbers);
console.log('Doubled:', doubled);
      `.trim();
      
      await executeCommand(`echo '${tsCode}' > index.ts`, projectDir);
      
      // Run with bun
      const result = await executeCommand('bun index.ts', projectDir, 10000);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Original:');
      expect(result.stdout).toContain('Doubled:');
    }, 40000);
  });

  describe('Error Handling', () => {
    it('should handle bun install failures gracefully', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'error-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'error-test',
        version: '1.0.0',
        dependencies: {
          'non-existent-package-xyz-123': '^1.0.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      const result = await installDependencies('bun', projectDir, 30000);
      
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toLowerCase()).toMatch(/(not found|404|package.*doesn't exist)/);
    }, 40000);

    it('should handle invalid JavaScript/TypeScript files', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'invalid-test');
      await mkdir(projectDir, { recursive: true });
      
      // Create file with syntax error
      const invalidCode = `
console.log('Start');
invalid syntax here
console.log('End');
      `.trim();
      
      await executeCommand(`echo '${invalidCode}' > invalid.js`, projectDir);
      
      const result = await executeCommand('bun invalid.js', projectDir, 10000);
      
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toLowerCase()).toMatch(/(syntax|error|unexpected)/);
    });

    it('should handle network issues during install', async () => {
      if (!bunAvailable) return;
      
      const projectDir = join(testDir, 'network-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'network-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Test with very short timeout to simulate network issues
      const result = await installDependencies('bun', projectDir, 3000);
      
      // Should either succeed quickly or timeout gracefully
      expect([0, 1]).toContain(result.exitCode);
    }, 10000);
  });
});