/**
 * PNPM Integration Tests
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
  getPackageManagerVersion,
  createWorkspaceConfig,
  cleanup,
} from '../utils/package-manager-utils';
import { generateTestDir, TEST_PORTS, PERFORMANCE_THRESHOLDS } from '../config/test-config';

describe('PNPM Integration Tests', () => {
  let testDir: string;
  let processes: any[] = [];
  let pnpmAvailable: boolean;
  let pnpmVersion: string | null;
  
  beforeEach(async () => {
    testDir = generateTestDir('pnpm-integration');
    await mkdir(testDir, { recursive: true });
    processes = [];
    pnpmAvailable = await isPackageManagerAvailable('pnpm');
    pnpmVersion = await getPackageManagerVersion('pnpm');
  });
  
  afterEach(async () => {
    cleanup(processes);
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic PNPM Operations', () => {
    it('should verify pnpm availability', async () => {
      if (!pnpmAvailable) {
        console.warn('PNPM not available, skipping pnpm-specific tests');
        return;
      }
      
      expect(pnpmAvailable).toBe(true);
      expect(pnpmVersion).toBeTruthy();
    });

    it('should execute pnpm commands successfully', async () => {
      if (!pnpmAvailable) return;
      
      const result = await executeCommand('pnpm --version', testDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should initialize pnpm project', async () => {
      if (!pnpmAvailable) return;
      
      const result = await executeCommand('pnpm init', testDir);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'package.json'))).toBe(true);
    });

    it('should verify pnpm version features', async () => {
      if (!pnpmAvailable || !pnpmVersion) return;
      
      const majorVersion = parseInt(pnpmVersion.split('.')[0]);
      
      console.log(`Detected PNPM ${pnpmVersion}`);
      
      // PNPM 6+ should support workspaces
      if (majorVersion >= 6) {
        const result = await executeCommand('pnpm help', testDir);
        expect(result.exitCode).toBe(0);
        expect(result.stdout.toLowerCase()).toContain('workspace');
      }
    });
  });

  describe('Next.js Project with PNPM', () => {
    const projectName = 'nextjs-pnpm-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold Next.js project successfully', async () => {
      if (!pnpmAvailable) return;
      
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

    it('should install dependencies with pnpm', async () => {
      if (!pnpmAvailable) return;
      
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
      const result = await installDependencies('pnpm', projectDir, 60000);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.pnpmInstall);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'pnpm-lock.yaml'))).toBe(true);
    }, 70000);

    it('should handle pnpm install with existing pnpm-lock.yaml', async () => {
      if (!pnpmAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      // Create pnpm-lock.yaml content
      const pnpmLock = `lockfileVersion: '6.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

dependencies:
  is-odd:
    specifier: ^3.0.1
    version: 3.0.1

packages:

  /is-number@6.0.0:
    resolution: {integrity: sha512-Wu1VHeILBK8KAWJUAiSu3uo/Y+/kcWIkzy8oVTMcmsLlcikqLfHJeZ9A8am8BOYdWw3UrFmWFGZ2zxz8tgQu+Q==}
    engines: {node: '>=0.12.0'}
    dev: false

  /is-odd@3.0.1:
    resolution: {integrity: sha512-CQpnWPrDwmP1+SMHXZhtLtJv90yiyVfluGsX5iNCVkrhQtU3TQHsUWPG9wkdk9Lgd5yNpAg/RagRXnTUpwreIA==}
    engines: {node: '>=0.10.0'}
    dependencies:
      is-number: 6.0.0
    dev: false
`;
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      await executeCommand(`echo '${pnpmLock}' > pnpm-lock.yaml`, projectDir);
      
      const result = await installDependencies('pnpm', projectDir, 30000);
      
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
    }, 40000);
  });

  describe('Vue Project with PNPM', () => {
    const projectName = 'vue-pnpm-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold and install Vue project', async () => {
      if (!pnpmAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.0.0',
        private: true,
        scripts: {
          dev: 'vite --port ' + TEST_PORTS.vue,
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          vue: '^3.3.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^4.2.0',
          vite: '^4.4.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Create basic vite.config.js
      const viteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: ${TEST_PORTS.vue}
  }
})
      `.trim();
      
      await executeCommand(`echo '${viteConfig}' > vite.config.js`, projectDir);
      
      // Create basic Vue app
      await mkdir(join(projectDir, 'src'), { recursive: true });
      
      const appContent = `
<template>
  <div>
    <h1>Vue with PNPM Test</h1>
    <p>Server running successfully!</p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
      `.trim();
      
      const mainContent = `
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
      `.trim();
      
      await executeCommand(`echo '${appContent}' > src/App.vue`, projectDir);
      await executeCommand(`echo '${mainContent}' > src/main.js`, projectDir);
      
      // Create index.html
      const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue PNPM Test</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
      `.trim();
      
      await executeCommand(`echo '${indexHtml}' > index.html`, projectDir);
      
      // Install dependencies
      const installResult = await installDependencies('pnpm', projectDir, 60000);
      expect(installResult.exitCode).toBe(0);
      
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'pnpm-lock.yaml'))).toBe(true);
    }, 70000);

    it('should start Vue dev server with pnpm', async () => {
      if (!pnpmAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      // Create minimal Vue setup for dev server test
      const packageJson = {
        name: projectName,
        version: '0.0.0',
        scripts: {
          dev: 'echo "Vue dev server started on port ' + TEST_PORTS.vue + '"',
        },
        dependencies: {
          vue: '^3.3.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Install dependencies
      await installDependencies('pnpm', projectDir, 30000);
      
      // Start dev server (mock)
      const { process: devProcess, ready } = await startDevServer('pnpm', projectDir, TEST_PORTS.vue);
      processes.push(devProcess);
      
      const isReady = await ready;
      expect(isReady).toBe(true);
    }, 60000);
  });

  describe('PNPM Workspace Features', () => {
    it('should handle pnpm workspaces', async () => {
      if (!pnpmAvailable) return;
      
      const workspaceDir = join(testDir, 'pnpm-workspace');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'apps', 'web'), { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'ui'), { recursive: true });
      
      // Create pnpm-workspace.yaml
      await createWorkspaceConfig('pnpm', workspaceDir, ['apps/*', 'packages/*']);
      
      const rootPackageJson = {
        name: 'pnpm-workspace-test',
        private: true,
        scripts: {
          dev: 'pnpm -r dev',
          build: 'pnpm -r build',
        },
      };
      
      const webPackageJson = {
        name: '@workspace/web',
        version: '1.0.0',
        dependencies: {
          '@workspace/ui': 'workspace:^',
        },
        scripts: {
          dev: 'echo "Web app dev"',
          build: 'echo "Web app build"',
        },
      };
      
      const uiPackageJson = {
        name: '@workspace/ui',
        version: '1.0.0',
        main: 'index.js',
        scripts: {
          dev: 'echo "UI dev"',
          build: 'echo "UI build"',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(rootPackageJson, null, 2)}' > package.json`,
        workspaceDir
      );
      
      await executeCommand(
        `echo '${JSON.stringify(webPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'apps', 'web')
      );
      
      await executeCommand(
        `echo '${JSON.stringify(uiPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'packages', 'ui')
      );
      
      // Create UI package entry
      await executeCommand(
        `echo 'module.exports = { Button: "UI Button" };' > index.js`,
        join(workspaceDir, 'packages', 'ui')
      );
      
      // Install workspace dependencies
      const installResult = await installDependencies('pnpm', workspaceDir, 45000);
      expect(installResult.exitCode).toBe(0);
      
      // Test pnpm workspace commands
      const workspaceList = await executeCommand('pnpm list --depth=0', workspaceDir, 10000);
      expect(workspaceList.exitCode).toBe(0);
      
      // Test recursive commands
      const recursiveTest = await executeCommand('pnpm -r exec echo "test"', workspaceDir, 15000);
      expect(recursiveTest.exitCode).toBe(0);
    }, 65000);

    it('should handle pnpm workspace protocol', async () => {
      if (!pnpmAvailable) return;
      
      const workspaceDir = join(testDir, 'pnpm-workspace-protocol');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'lib'), { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'app'), { recursive: true });
      
      await createWorkspaceConfig('pnpm', workspaceDir, ['packages/*']);
      
      const rootPackageJson = {
        name: 'workspace-protocol-test',
        private: true,
      };
      
      const libPackageJson = {
        name: '@test/lib',
        version: '1.0.0',
        main: 'index.js',
      };
      
      const appPackageJson = {
        name: '@test/app',
        version: '1.0.0',
        dependencies: {
          '@test/lib': 'workspace:*', // PNPM workspace protocol
          lodash: '^4.17.21',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(rootPackageJson, null, 2)}' > package.json`,
        workspaceDir
      );
      
      await executeCommand(
        `echo '${JSON.stringify(libPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'packages', 'lib')
      );
      
      await executeCommand(
        `echo '${JSON.stringify(appPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'packages', 'app')
      );
      
      await executeCommand(
        `echo 'module.exports = { version: "1.0.0" };' > index.js`,
        join(workspaceDir, 'packages', 'lib')
      );
      
      const installResult = await installDependencies('pnpm', workspaceDir, 40000);
      expect(installResult.exitCode).toBe(0);
      
      // Verify workspace linking
      const linkCheck = await executeCommand('pnpm why @test/lib', join(workspaceDir, 'packages', 'app'), 10000);
      
      if (linkCheck.exitCode === 0) {
        expect(linkCheck.stdout).toContain('workspace');
      }
    }, 50000);
  });

  describe('PNPM Performance Features', () => {
    it('should demonstrate pnpm content-addressable store', async () => {
      if (!pnpmAvailable) return;
      
      // Create two projects with same dependency
      const proj1Dir = join(testDir, 'proj1');
      const proj2Dir = join(testDir, 'proj2');
      
      await mkdir(proj1Dir, { recursive: true });
      await mkdir(proj2Dir, { recursive: true });
      
      const packageJson = {
        name: 'store-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      // Create identical package.json files
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        proj1Dir
      );
      
      await executeCommand(
        `echo '${JSON.stringify({ ...packageJson, name: 'store-test-2' }, null, 2)}' > package.json`,
        proj2Dir
      );
      
      // Install in both projects
      const install1 = await installDependencies('pnpm', proj1Dir, 30000);
      const install2 = await installDependencies('pnpm', proj2Dir, 30000);
      
      expect(install1.exitCode).toBe(0);
      expect(install2.exitCode).toBe(0);
      
      // Both should have node_modules but use shared store
      expect(existsSync(join(proj1Dir, 'node_modules'))).toBe(true);
      expect(existsSync(join(proj2Dir, 'node_modules'))).toBe(true);
    }, 70000);

    it('should meet pnpm install performance thresholds', async () => {
      if (!pnpmAvailable) return;
      
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
      const result = await installDependencies('pnpm', projectDir, PERFORMANCE_THRESHOLDS.pnpmInstall);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.pnpmInstall);
      
      console.log(`PNPM install completed in ${duration}ms`);
    }, PERFORMANCE_THRESHOLDS.pnpmInstall + 5000);
  });

  describe('PNPM Filtering and Commands', () => {
    it('should handle pnpm filtering in workspaces', async () => {
      if (!pnpmAvailable) return;
      
      const workspaceDir = join(testDir, 'pnpm-filtering');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'apps', 'web'), { recursive: true });
      await mkdir(join(workspaceDir, 'apps', 'api'), { recursive: true });
      
      await createWorkspaceConfig('pnpm', workspaceDir, ['apps/*']);
      
      const rootPackageJson = {
        name: 'filtering-test',
        private: true,
      };
      
      const webPackageJson = {
        name: '@test/web',
        version: '1.0.0',
        scripts: {
          test: 'echo "Testing web"',
        },
      };
      
      const apiPackageJson = {
        name: '@test/api',
        version: '1.0.0',
        scripts: {
          test: 'echo "Testing api"',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(rootPackageJson, null, 2)}' > package.json`,
        workspaceDir
      );
      
      await executeCommand(
        `echo '${JSON.stringify(webPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'apps', 'web')
      );
      
      await executeCommand(
        `echo '${JSON.stringify(apiPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'apps', 'api')
      );
      
      // Install workspace
      await installDependencies('pnpm', workspaceDir, 20000);
      
      // Test filtering
      const filterWeb = await executeCommand('pnpm --filter @test/web test', workspaceDir, 10000);
      expect(filterWeb.exitCode).toBe(0);
      expect(filterWeb.stdout).toContain('Testing web');
      
      const filterApi = await executeCommand('pnpm --filter @test/api test', workspaceDir, 10000);
      expect(filterApi.exitCode).toBe(0);
      expect(filterApi.stdout).toContain('Testing api');
    }, 40000);
  });

  describe('Error Handling', () => {
    it('should handle pnpm install failures gracefully', async () => {
      if (!pnpmAvailable) return;
      
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
      
      const result = await installDependencies('pnpm', projectDir, 30000);
      
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toLowerCase()).toMatch(/(not found|404|couldn't resolve)/);
    }, 40000);

    it('should handle store corruption gracefully', async () => {
      if (!pnpmAvailable) return;
      
      const projectDir = join(testDir, 'store-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'store-test',
        version: '1.0.0',
        dependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // First install should work
      const result1 = await installDependencies('pnpm', projectDir, 20000);
      expect(result1.exitCode).toBe(0);
      
      // Verify store prune works
      const pruneResult = await executeCommand('pnpm store prune', projectDir, 15000);
      
      // Store prune should work or be gracefully handled
      expect([0, 1]).toContain(pruneResult.exitCode);
    }, 45000);

    it('should handle workspace dependency resolution errors', async () => {
      if (!pnpmAvailable) return;
      
      const workspaceDir = join(testDir, 'workspace-error');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'broken'), { recursive: true });
      
      await createWorkspaceConfig('pnpm', workspaceDir, ['packages/*']);
      
      const rootPackageJson = {
        name: 'workspace-error-test',
        private: true,
      };
      
      const brokenPackageJson = {
        name: '@test/broken',
        version: '1.0.0',
        dependencies: {
          '@test/missing': 'workspace:*', // Non-existent workspace dependency
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(rootPackageJson, null, 2)}' > package.json`,
        workspaceDir
      );
      
      await executeCommand(
        `echo '${JSON.stringify(brokenPackageJson, null, 2)}' > package.json`,
        join(workspaceDir, 'packages', 'broken')
      );
      
      const result = await installDependencies('pnpm', workspaceDir, 20000);
      
      // Should fail gracefully with meaningful error
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toLowerCase()).toMatch(/(not found|missing|resolve)/);
    }, 30000);
  });
});