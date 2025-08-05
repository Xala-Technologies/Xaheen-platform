/**
 * Lockfile Scenarios Tests
 * Tests edge cases with different lockfile combinations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectPackageManagerFromLockfile,
  createLockfile,
  installDependencies,
  isPackageManagerAvailable,
} from '../utils/package-manager-utils';
import { generateTestDir, LOCKFILE_SCENARIOS, PACKAGE_MANAGERS } from '../config/test-config';

describe('Lockfile Scenarios', () => {
  let testDir: string;
  
  beforeEach(async () => {
    testDir = generateTestDir('lockfile-scenarios');
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Single Lockfile Detection', () => {
    it.each(LOCKFILE_SCENARIOS.filter(s => s.files.length === 1))(
      'should detect $expectedManager from $name scenario',
      async (scenario) => {
        // Create the specified lockfile
        for (const file of scenario.files) {
          const managerConfig = PACKAGE_MANAGERS.find(pm => pm.lockfile === file);
          if (managerConfig) {
            await createLockfile(managerConfig.name, testDir, true);
          }
        }
        
        const detected = detectPackageManagerFromLockfile(testDir);
        expect(detected).toBe(scenario.expectedManager);
      }
    );
  });

  describe('Multiple Lockfile Scenarios', () => {
    it('should prioritize npm when both package-lock.json and yarn.lock exist', async () => {
      await createLockfile('npm', testDir, true);
      await createLockfile('yarn', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
    });

    it('should prioritize npm in complex multi-lockfile scenario', async () => {
      // Create all possible lockfiles
      await createLockfile('npm', testDir, true);
      await createLockfile('yarn', testDir, true);
      await createLockfile('pnpm', testDir, true);
      await createLockfile('bun', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
      
      // Verify all files exist
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
      expect(existsSync(join(testDir, 'yarn.lock'))).toBe(true);
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
      expect(existsSync(join(testDir, 'bun.lockb'))).toBe(true);
    });

    it('should handle priority order correctly without npm', async () => {
      // Create lockfiles excluding npm
      await createLockfile('yarn', testDir, true);
      await createLockfile('pnpm', testDir, true);
      await createLockfile('bun', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      // Should pick yarn (first in priority after npm)
      expect(detected).toBe('yarn');
    });

    it('should handle partial lockfile combinations', async () => {
      const scenarios = [
        { files: ['yarn', 'pnpm'], expected: 'yarn' },
        { files: ['pnpm', 'bun'], expected: 'pnpm' },
        { files: ['yarn', 'bun'], expected: 'yarn' },
      ];
      
      for (const scenario of scenarios) {
        const scenarioDir = join(testDir, scenario.files.join('-'));
        await mkdir(scenarioDir, { recursive: true });
        
        for (const manager of scenario.files) {
          await createLockfile(manager as any, scenarioDir, true);
        }
        
        const detected = detectPackageManagerFromLockfile(scenarioDir);
        expect(detected).toBe(scenario.expected);
      }
    });
  });

  describe('Corrupted Lockfile Handling', () => {
    it('should detect npm from corrupted package-lock.json', async () => {
      // Create corrupted package-lock.json
      await writeFile(join(testDir, 'package-lock.json'), 'corrupted json content');
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm'); // Should still detect based on filename
    });

    it('should detect yarn from corrupted yarn.lock', async () => {
      // Create corrupted yarn.lock
      await writeFile(join(testDir, 'yarn.lock'), 'corrupted yarn lockfile content');
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('yarn');
    });

    it('should handle empty lockfiles', async () => {
      // Create empty lockfiles
      await writeFile(join(testDir, 'package-lock.json'), '');
      await writeFile(join(testDir, 'yarn.lock'), '');
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm'); // npm takes precedence
    });

    it('should handle binary lockfiles', async () => {
      // Create binary bun.lockb file
      const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
      await writeFile(join(testDir, 'bun.lockb'), binaryContent);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('bun');
    });
  });

  describe('Lockfile Content Validation', () => {
    it('should work with realistic npm lockfile', async () => {
      const realisticNpmLock = {
        name: 'test-project',
        version: '1.0.0',
        lockfileVersion: 3,
        requires: true,
        packages: {
          '': {
            name: 'test-project',
            version: '1.0.0',
            dependencies: {
              lodash: '^4.17.21',
            },
          },
          'node_modules/lodash': {
            version: '4.17.21',
            resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
            integrity: 'sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==',
          },
        },
      };
      
      await writeFile(
        join(testDir, 'package-lock.json'),
        JSON.stringify(realisticNpmLock, null, 2)
      );
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
    });

    it('should work with realistic yarn lockfile', async () => {
      const realisticYarnLock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
`;
      
      await writeFile(join(testDir, 'yarn.lock'), realisticYarnLock);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('yarn');
    });

    it('should work with realistic pnpm lockfile', async () => {
      const realisticPnpmLock = `lockfileVersion: '6.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

dependencies:
  lodash:
    specifier: ^4.17.21
    version: 4.17.21

packages:

  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==}
    dev: false
`;
      
      await writeFile(join(testDir, 'pnpm-lock.yaml'), realisticPnpmLock);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('pnpm');
    });
  });

  describe('Lockfile-Based Installation', () => {
    it('should install using detected package manager from lockfile', async () => {
      const npmAvailable = await isPackageManagerAvailable('npm');
      if (!npmAvailable) return;
      
      // Create package.json and npm lockfile
      const packageJson = {
        name: 'lockfile-install-test',
        version: '1.0.0',
        dependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      const simpleNpmLock = {
        name: 'lockfile-install-test',
        version: '1.0.0',
        lockfileVersion: 3,
        requires: true,
        packages: {
          '': {
            dependencies: {
              'is-even': '^1.0.0',
            },
          },
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      await writeFile(
        join(testDir, 'package-lock.json'),
        JSON.stringify(simpleNpmLock, null, 2)
      );
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
      
      // Install using detected manager
      const result = await installDependencies(detected!, testDir, 30000);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'node_modules'))).toBe(true);
    }, 40000);

    it('should handle lockfile mismatch with package.json', async () => {
      // Create package.json with different dependencies than lockfile suggests
      const packageJson = {
        name: 'mismatch-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21', // Different from lockfile
        },
      };
      
      const mismatchedLock = {
        name: 'mismatch-test',
        version: '1.0.0',
        lockfileVersion: 3,
        requires: true,
        packages: {
          '': {
            dependencies: {
              axios: '^1.4.0', // Different from package.json
            },
          },
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      await writeFile(
        join(testDir, 'package-lock.json'),
        JSON.stringify(mismatchedLock, null, 2)
      );
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
      
      // Detection should still work despite mismatch
      expect(detected).toBeTruthy();
    });
  });

  describe('Nested Directory Lockfile Detection', () => {
    it('should not detect lockfiles in node_modules', async () => {
      // Create lockfile in node_modules (should be ignored)
      await mkdir(join(testDir, 'node_modules', 'some-package'), { recursive: true });
      await createLockfile('npm', join(testDir, 'node_modules', 'some-package'), true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBeNull(); // Should not detect lockfile in node_modules
    });

    it('should detect lockfiles in project root only', async () => {
      // Create subdirectory with its own lockfile
      const subDir = join(testDir, 'subdirectory');
      await mkdir(subDir, { recursive: true });
      await createLockfile('yarn', subDir, true);
      
      // Create lockfile in root
      await createLockfile('npm', testDir, true);
      
      // Detection should only consider root directory
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
      
      const subDetected = detectPackageManagerFromLockfile(subDir);
      expect(subDetected).toBe('yarn');
    });
  });

  describe('Lockfile Recovery Scenarios', () => {
    it('should handle missing lockfile during installation', async () => {
      const npmAvailable = await isPackageManagerAvailable('npm');
      if (!npmAvailable) return;
      
      const packageJson = {
        name: 'missing-lockfile-test',
        version: '1.0.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // No lockfile present - should be detected as null
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBeNull();
      
      // Install should still work and create lockfile
      const result = await installDependencies('npm', testDir, 25000);
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
      
      // After installation, should detect npm
      const afterInstall = detectPackageManagerFromLockfile(testDir);
      expect(afterInstall).toBe('npm');
    }, 35000);

    it('should handle lockfile regeneration', async () => {
      const yarnAvailable = await isPackageManagerAvailable('yarn');
      if (!yarnAvailable) return;
      
      const packageJson = {
        name: 'regeneration-test',
        version: '1.0.0',
        dependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Create corrupted yarn.lock
      await writeFile(join(testDir, 'yarn.lock'), 'corrupted content');
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('yarn');
      
      // Yarn should regenerate the lockfile
      const result = await installDependencies('yarn', testDir, 30000);
      
      // Installation might succeed (yarn fixes lockfile) or fail gracefully
      expect([0, 1]).toContain(result.exitCode);
    }, 40000);
  });

  describe('Cross-Platform Lockfile Compatibility', () => {
    it('should handle Windows line endings in lockfiles', async () => {
      const yarnLockWithCRLF = `# yarn lockfile v1\r\n\r\nlodash@^4.17.21:\r\n  version "4.17.21"\r\n`;
      
      await writeFile(join(testDir, 'yarn.lock'), yarnLockWithCRLF);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('yarn');
    });

    it('should handle Unix line endings in lockfiles', async () => {
      const yarnLockWithLF = `# yarn lockfile v1\n\nlodash@^4.17.21:\n  version "4.17.21"\n`;
      
      await writeFile(join(testDir, 'yarn.lock'), yarnLockWithLF);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('yarn');
    });

    it('should handle Unicode characters in lockfiles', async () => {
      const lockfileWithUnicode = {
        name: 'unicode-test-ñ-α-β',
        version: '1.0.0',
        lockfileVersion: 3,
        packages: {},
      };
      
      await writeFile(
        join(testDir, 'package-lock.json'),
        JSON.stringify(lockfileWithUnicode, null, 2)
      );
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
    });
  });
});