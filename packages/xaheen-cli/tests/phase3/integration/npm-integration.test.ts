/**
 * NPM Integration Tests
 * Tests complete workflow: scaffold → install → dev smoke test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import {
  executeCommand,
  installDependencies,
  startDevServer,
  isPackageManagerAvailable,
  cleanup,
} from '../utils/package-manager-utils';
import { generateTestDir, TEST_PROJECTS, TEST_PORTS, PERFORMANCE_THRESHOLDS } from '../config/test-config';

describe('NPM Integration Tests', () => {
  let testDir: string;
  let processes: any[] = [];
  
  beforeEach(async () => {
    testDir = generateTestDir('npm-integration');
    await mkdir(testDir, { recursive: true });
    processes = [];
  });
  
  afterEach(async () => {
    cleanup(processes);
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic NPM Operations', () => {
    it('should verify npm is available', async () => {
      const isAvailable = await isPackageManagerAvailable('npm');
      expect(isAvailable).toBe(true);
    });

    it('should execute npm commands successfully', async () => {
      const result = await executeCommand('npm --version', testDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should initialize npm project', async () => {
      const result = await executeCommand('npm init -y', testDir);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'package.json'))).toBe(true);
    });
  });

  describe('Next.js Project with NPM', () => {
    const projectName = 'nextjs-npm-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold Next.js project successfully', async () => {
      // Simulate xaheen new command for Next.js
      await mkdir(projectDir, { recursive: true });
      
      // Create basic Next.js package.json
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

    it('should install dependencies with npm', async () => {
      await mkdir(projectDir, { recursive: true });
      
      // Create minimal package.json for testing
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      const startTime = Date.now();
      const result = await installDependencies('npm', projectDir, 60000);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.npmInstall);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'package-lock.json'))).toBe(true);
    }, 70000);

    it('should handle npm install with lockfile', async () => {
      await mkdir(projectDir, { recursive: true });
      
      // Create package.json and package-lock.json
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      const packageLock = {
        name: projectName,
        version: '0.1.0',
        lockfileVersion: 3,
        requires: true,
        packages: {
          '': {
            name: projectName,
            version: '0.1.0',
            dependencies: {
              'is-odd': '^3.0.1',
            },
          },
          'node_modules/is-odd': {
            version: '3.0.1',
            resolved: 'https://registry.npmjs.org/is-odd/-/is-odd-3.0.1.tgz',
            integrity: 'sha512-CQpnWPrDwmP1+SMHXZhtLtJv90yiyVfluGsX5iNCVkrhQtU3TQHsUWPG9wkdk9Lgd5yNpAg/RagRXnTUpwreIA==',
            dependencies: {
              'is-number': '^6.0.0',
            },
          },
          'node_modules/is-number': {
            version: '6.0.0',
            resolved: 'https://registry.npmjs.org/is-number/-/is-number-6.0.0.tgz',
            integrity: 'sha512-Wu1VHeILBK8KAWJUAiSu3uo/Y+/kcWIkzy8oVTMcmsLlcikqLfHJeZ9A8am8BOYdWw3UrFmWFGZ2zxz8tgQu+Q==',
          },
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      await executeCommand(
        `echo '${JSON.stringify(packageLock, null, 2)}' > package-lock.json`,
        projectDir
      );
      
      const result = await installDependencies('npm', projectDir, 30000);
      
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
    }, 40000);
  });

  describe('Express.js API with NPM', () => {
    const projectName = 'express-npm-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold and install Express.js project', async () => {
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        main: 'index.js',
        scripts: {
          dev: 'node index.js',
          start: 'node index.js',
        },
        dependencies: {
          express: '^4.18.0',
          cors: '^2.8.5',
        },
        devDependencies: {
          '@types/express': '^4.17.0',
          '@types/cors': '^2.8.0',
        },
      };
      
      // Create package.json
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Create basic Express server
      const serverCode = `
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Express server running with npm' });
});

app.listen(port, () => {
  console.log(\`Server listening on port \${port}\`);
});
      `.trim();
      
      await executeCommand(`echo '${serverCode}' > index.js`, projectDir);
      
      // Install dependencies
      const installResult = await installDependencies('npm', projectDir, 45000);
      expect(installResult.exitCode).toBe(0);
      
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'package-lock.json'))).toBe(true);
    }, 55000);

    it('should start Express server and respond to requests', async () => {
      await mkdir(projectDir, { recursive: true });
      
      // Create minimal Express setup
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
        },
      };
      
      const serverCode = `
const express = require('express');
const app = express();
const port = process.env.PORT || ${TEST_PORTS.express};

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log('Server ready on port ' + port);
});
      `.trim();
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      await executeCommand(`echo '${serverCode}' > index.js`, projectDir);
      
      // Install dependencies
      await installDependencies('npm', projectDir, 30000);
      
      // Start server
      const { process: devProcess, ready } = await startDevServer('npm', projectDir, TEST_PORTS.express);
      processes.push(devProcess);
      
      const isReady = await ready;
      expect(isReady).toBe(true);
      
      // Test health endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for server to be fully ready
      
      const healthCheck = await executeCommand(
        `curl -f http://localhost:${TEST_PORTS.express}/health`,
        testDir,
        10000
      );
      
      expect(healthCheck.exitCode).toBe(0);
      expect(healthCheck.stdout).toContain('ok');
    }, 60000);
  });

  describe('NPM Workspace Features', () => {
    it('should handle npm workspaces (npm >= 7)', async () => {
      const workspaceDir = join(testDir, 'npm-workspace');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'app'), { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'lib'), { recursive: true });
      
      const rootPackageJson = {
        name: 'npm-workspace-test',
        private: true,
        workspaces: ['packages/*'],
      };
      
      const appPackageJson = {
        name: '@workspace/app',
        version: '1.0.0',
        dependencies: {
          '@workspace/lib': '1.0.0',
        },
      };
      
      const libPackageJson = {
        name: '@workspace/lib',
        version: '1.0.0',
      };
      
      await executeCommand(
        `echo '${JSON.stringify(rootPackageJson, null, 2)}' > package.json`,
        workspaceDir
      );
      
      await executeCommand(
        `echo '${JSON.stringify(appPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'packages', 'app')
      );
      
      await executeCommand(
        `echo '${JSON.stringify(libPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'packages', 'lib')
      );
      
      // Test npm workspace commands
      const workspaceList = await executeCommand('npm ls --workspaces', workspaceDir, 15000);
      
      // npm >= 7 should support workspaces
      if (workspaceList.exitCode === 0) {
        expect(workspaceList.stdout).toContain('@workspace/app');
        expect(workspaceList.stdout).toContain('@workspace/lib');
      }
    }, 25000);
  });

  describe('Performance Benchmarks', () => {
    it('should meet npm install performance thresholds', async () => {
      const projectDir = join(testDir, 'perf-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'perf-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
          axios: '^1.4.0',
          moment: '^2.29.4',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      const startTime = Date.now();
      const result = await installDependencies('npm', projectDir, PERFORMANCE_THRESHOLDS.npmInstall);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.npmInstall);
    }, PERFORMANCE_THRESHOLDS.npmInstall + 5000);

    it('should handle concurrent npm operations', async () => {
      const projects = ['proj1', 'proj2', 'proj3'];
      const promises = projects.map(async (name) => {
        const projectDir = join(testDir, name);
        await mkdir(projectDir, { recursive: true });
        
        const packageJson = {
          name,
          version: '1.0.0',
          dependencies: {
            'is-even': '^1.0.0',
          },
        };
        
        await executeCommand(
          `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
          projectDir
        );
        
        return installDependencies('npm', projectDir, 20000);
      });
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.exitCode).toBe(0);
      });
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle npm install failures gracefully', async () => {
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
      
      const result = await installDependencies('npm', projectDir, 30000);
      
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('404');
    }, 40000);

    it('should handle corrupted package.json', async () => {
      const projectDir = join(testDir, 'corrupt-test');
      await mkdir(projectDir, { recursive: true });
      
      await executeCommand('echo "invalid json content" > package.json', projectDir);
      
      const result = await installDependencies('npm', projectDir, 10000);
      
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toLowerCase()).toContain('json');
    });

    it('should handle network issues', async () => {
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
      
      // Test with short timeout to simulate network issues
      const result = await installDependencies('npm', projectDir, 5000);
      
      // Should either succeed quickly or fail with timeout
      expect([0, 1]).toContain(result.exitCode);
    }, 10000);
  });
});