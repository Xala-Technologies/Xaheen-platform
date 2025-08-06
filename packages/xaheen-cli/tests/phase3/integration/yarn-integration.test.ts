/**
 * Yarn Integration Tests
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

describe('Yarn Integration Tests', () => {
  let testDir: string;
  let processes: any[] = [];
  let yarnAvailable: boolean;
  let yarnVersion: string | null;
  
  beforeEach(async () => {
    testDir = generateTestDir('yarn-integration');
    await mkdir(testDir, { recursive: true });
    processes = [];
    yarnAvailable = await isPackageManagerAvailable('yarn');
    yarnVersion = await getPackageManagerVersion('yarn');
  });
  
  afterEach(async () => {
    cleanup(processes);
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic Yarn Operations', () => {
    it('should verify yarn availability', async () => {
      if (!yarnAvailable) {
        console.warn('Yarn not available, skipping yarn-specific tests');
        return;
      }
      
      expect(yarnAvailable).toBe(true);
      expect(yarnVersion).toBeTruthy();
    });

    it('should execute yarn commands successfully', async () => {
      if (!yarnAvailable) return;
      
      const result = await executeCommand('yarn --version', testDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should initialize yarn project', async () => {
      if (!yarnAvailable) return;
      
      const result = await executeCommand('yarn init -y', testDir);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'package.json'))).toBe(true);
    });

    it('should detect yarn version type (classic vs modern)', async () => {
      if (!yarnAvailable || !yarnVersion) return;
      
      const majorVersion = parseInt(yarnVersion.split('.')[0]);
      const isModern = majorVersion >= 2;
      
      console.log(`Detected Yarn ${yarnVersion} (${isModern ? 'Modern' : 'Classic'})`);
      
      if (isModern) {
        // Test modern Yarn features
        const result = await executeCommand('yarn --help', testDir);
        expect(result.exitCode).toBe(0);
      } else {
        // Test classic Yarn features
        const result = await executeCommand('yarn --help', testDir);
        expect(result.exitCode).toBe(0);
      }
    });
  });

  describe('Next.js Project with Yarn', () => {
    const projectName = 'nextjs-yarn-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold Next.js project successfully', async () => {
      if (!yarnAvailable) return;
      
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

    it('should install dependencies with yarn', async () => {
      if (!yarnAvailable) return;
      
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
      const result = await installDependencies('yarn', projectDir, 60000);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.yarnInstall);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'yarn.lock'))).toBe(true);
    }, 70000);

    it('should handle yarn install with existing yarn.lock', async () => {
      if (!yarnAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      // Create yarn.lock content
      const yarnLock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

is-number@^6.0.0:
  version "6.0.0"
  resolved "https://registry.yarnpkg.com/is-number/-/is-number-6.0.0.tgz#0c3b0a8b7c1dc7c5b7d38ac9e4b9c2a58b0e8b9b"
  integrity sha512-Wu1VHeILBK8KAWJUAiSu3uo/Y+/kcWIkzy8oVTMcmsLlcikqLfHJeZ9A8am8BOYdWw3UrFmWFGZ2zxz8tgQu+Q==

is-odd@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/is-odd/-/is-odd-3.0.1.tgz#d6e5c7a4e61d3b5e0d2a4d8b9c3e9b4c5d6e7f8a"
  integrity sha512-CQpnWPrDwmP1+SMHXZhtLtJv90yiyVfluGsX5iNCVkrhQtU3TQHsUWPG9wkdk9Lgd5yNpAg/RagRXnTUpwreIA==
  dependencies:
    is-number "^6.0.0"
`;
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      await executeCommand(`echo '${yarnLock}' > yarn.lock`, projectDir);
      
      const result = await installDependencies('yarn', projectDir, 30000);
      
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
    }, 40000);
  });

  describe('React Project with Yarn', () => {
    const projectName = 'react-yarn-test';
    let projectDir: string;

    beforeEach(() => {
      projectDir = join(testDir, projectName);
    });

    it('should scaffold and install React project', async () => {
      if (!yarnAvailable) return;
      
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@vitejs/plugin-react': '^4.0.0',
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
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${TEST_PORTS.react}
  }
})
      `.trim();
      
      await executeCommand(`echo '${viteConfig}' > vite.config.js`, projectDir);
      
      // Create basic React app
      await mkdir(join(projectDir, 'src'), { recursive: true });
      
      const appContent = `
import React from 'react'

function App() {
  return (
    <div>
      <h1>React with Yarn Test</h1>
      <p>Server running successfully!</p>
    </div>
  )
}

export default App
      `.trim();
      
      const mainContent = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
      `.trim();
      
      await executeCommand(`echo '${appContent}' > src/App.jsx`, projectDir);
      await executeCommand(`echo '${mainContent}' > src/main.jsx`, projectDir);
      
      // Create index.html
      const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Yarn Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
      `.trim();
      
      await executeCommand(`echo '${indexHtml}' > index.html`, projectDir);
      
      // Install dependencies
      const installResult = await installDependencies('yarn', projectDir, 60000);
      expect(installResult.exitCode).toBe(0);
      
      expect(existsSync(join(projectDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(projectDir, 'yarn.lock'))).toBe(true);
    }, 70000);
  });

  describe('Yarn Workspace Features', () => {
    it('should handle yarn workspaces', async () => {
      if (!yarnAvailable) return;
      
      const workspaceDir = join(testDir, 'yarn-workspace');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'app'), { recursive: true });
      await mkdir(join(workspaceDir, 'packages', 'lib'), { recursive: true });
      
      const rootPackageJson = {
        name: 'yarn-workspace-test',
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
        main: 'index.js',
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
      
      // Create lib index.js
      await executeCommand(
        `echo 'module.exports = { hello: "from lib" };' > index.js`,
        join(workspaceDir, 'packages', 'lib')
      );
      
      // Install workspace dependencies
      const installResult = await installDependencies('yarn', workspaceDir, 45000);
      expect(installResult.exitCode).toBe(0);
      
      // Test yarn workspaces commands
      const workspaceInfo = await executeCommand('yarn workspaces info', workspaceDir, 10000);
      
      if (workspaceInfo.exitCode === 0) {
        expect(workspaceInfo.stdout).toContain('@workspace/app');
        expect(workspaceInfo.stdout).toContain('@workspace/lib');
      }
    }, 55000);

    it('should handle yarn workspace commands', async () => {
      if (!yarnAvailable) return;
      
      const workspaceDir = join(testDir, 'yarn-workspace-commands');
      await mkdir(workspaceDir, { recursive: true });
      await mkdir(join(workspaceDir, 'apps', 'web'), { recursive: true });
      
      const rootPackageJson = {
        name: 'workspace-commands-test',
        private: true,
        workspaces: ['apps/*'],
        scripts: {
          'test:all': 'yarn workspaces run test',
        },
      };
      
      const webPackageJson = {
        name: '@workspace/web',
        version: '1.0.0',
        scripts: {
          test: 'echo "Testing web app"',
        },
        dependencies: {
          lodash: '^4.17.21',
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
      
      // Install dependencies
      const installResult = await installDependencies('yarn', workspaceDir, 30000);
      expect(installResult.exitCode).toBe(0);
      
      // Test workspace-specific install
      const webInstall = await executeCommand(
        'yarn workspace @workspace/web add axios',
        workspaceDir,
        20000
      );
      
      if (webInstall.exitCode === 0) {
        expect(existsSync(join(workspaceDir, 'yarn.lock'))).toBe(true);
      }
    }, 60000);
  });

  describe('Yarn Performance Benchmarks', () => {
    it('should meet yarn install performance thresholds', async () => {
      if (!yarnAvailable) return;
      
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
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      const startTime = Date.now();
      const result = await installDependencies('yarn', projectDir, PERFORMANCE_THRESHOLDS.yarnInstall);
      const duration = Date.now() - startTime;
      
      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.yarnInstall);
      
      console.log(`Yarn install completed in ${duration}ms`);
    }, PERFORMANCE_THRESHOLDS.yarnInstall + 5000);

    it('should handle parallel yarn operations', async () => {
      if (!yarnAvailable) return;
      
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
        
        return installDependencies('yarn', projectDir, 20000);
      });
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.exitCode).toBe(0);
      });
    }, 30000);
  });

  describe('Yarn Version-Specific Features', () => {
    it('should handle Yarn Classic (1.x) features', async () => {
      if (!yarnAvailable || !yarnVersion) return;
      
      const majorVersion = parseInt(yarnVersion.split('.')[0]);
      
      if (majorVersion === 1) {
        // Test Yarn Classic specific features
        const result = await executeCommand('yarn help', testDir);
        expect(result.exitCode).toBe(0);
        
        // Classic yarn should support --frozen-lockfile
        const projectDir = join(testDir, 'classic-test');
        await mkdir(projectDir, { recursive: true });
        
        const packageJson = {
          name: 'classic-test',
          version: '1.0.0',
          dependencies: {
            lodash: '^4.17.21',
          },
        };
        
        await executeCommand(
          `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
          projectDir
        );
        
        // First install to create lock file
        await installDependencies('yarn', projectDir, 20000);
        
        // Test frozen lockfile
        const frozenResult = await executeCommand('yarn install --frozen-lockfile', projectDir, 15000);
        expect(frozenResult.exitCode).toBe(0);
      }
    });

    it('should handle Yarn Modern (2.x+) features', async () => {
      if (!yarnAvailable || !yarnVersion) return;
      
      const majorVersion = parseInt(yarnVersion.split('.')[0]);
      
      if (majorVersion >= 2) {
        // Test Yarn Modern specific features
        const result = await executeCommand('yarn --help', testDir);
        expect(result.exitCode).toBe(0);
        
        // Modern yarn should support plugin system
        const pluginResult = await executeCommand('yarn plugin --help', testDir, 10000);
        
        // Plugin command should exist (exit code 0) or show help
        expect([0, 1]).toContain(pluginResult.exitCode);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle yarn install failures gracefully', async () => {
      if (!yarnAvailable) return;
      
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
      
      const result = await installDependencies('yarn', projectDir, 30000);
      
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.toLowerCase()).toMatch(/(couldn't find package|not found|404)/);
    }, 40000);

    it('should handle corrupted yarn.lock', async () => {
      if (!yarnAvailable) return;
      
      const projectDir = join(testDir, 'corrupt-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'corrupt-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Create corrupted yarn.lock
      await executeCommand('echo "corrupted lockfile content" > yarn.lock', projectDir);
      
      const result = await installDependencies('yarn', projectDir, 20000);
      
      // Yarn should either fix the lockfile or fail gracefully
      expect([0, 1]).toContain(result.exitCode);
    });

    it('should handle network timeouts', async () => {
      if (!yarnAvailable) return;
      
      const projectDir = join(testDir, 'timeout-test');
      await mkdir(projectDir, { recursive: true });
      
      const packageJson = {
        name: 'timeout-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await executeCommand(
        `echo '${JSON.stringify(packageJson, null, 2)}' > package.json`,
        projectDir
      );
      
      // Test with very short timeout
      const result = await installDependencies('yarn', projectDir, 3000);
      
      // Should either succeed quickly or timeout gracefully
      expect([0, 1]).toContain(result.exitCode);
    }, 10000);
  });
});