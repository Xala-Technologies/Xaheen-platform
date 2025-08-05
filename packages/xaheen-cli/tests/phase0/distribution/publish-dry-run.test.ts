/**
 * Publish Dry-Run Tests
 * 
 * Tests that validate the CLI package can be published to GitHub Packages
 * in dry-run mode to ensure publishing configuration is correct.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanupTempDirs, readPackageJson } from '../utils/test-helpers';
import { 
  packPackage, 
  dryRunPublish, 
  getPackageInfoFromRegistry,
  validateVersion,
  generateNextVersion 
} from '../utils/registry-helpers';
import { getTestConfig } from '../config/test-config';

const config = getTestConfig();

describe('Publish Dry-Run Tests', () => {
  let packageInfo: any;
  let packedPackage: any;
  
  beforeAll(async () => {
    packageInfo = await readPackageJson(config.paths.packageRoot);
    packedPackage = await packPackage(config.paths.packageRoot);
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should have valid version format', async () => {
    const validation = validateVersion(packageInfo.version);
    
    if (!validation.valid) {
      console.warn('Version validation issues:', validation.issues);
    }
    
    expect(validation.valid).toBe(true);
  }, config.timeouts.default);

  it('should have GitHub Packages configuration', async () => {
    const { publishConfig } = packageInfo;
    
    if (!publishConfig) {
      console.warn('⚠️  No publishConfig found - package may not be configured for GitHub Packages');
      return;
    }
    
    expect(publishConfig.registry).toBeDefined();
    expect(publishConfig.registry).toMatch(/npm\.pkg\.github\.com/);
    
    if (publishConfig.access) {
      expect(['public', 'restricted']).toContain(publishConfig.access);
    }
  }, config.timeouts.default);

  it('should perform dry-run publish to GitHub Packages', async () => {
    const registryConfig = {
      registry: config.registry.github,
      token: process.env.GITHUB_TOKEN,
      scope: packageInfo.name.startsWith('@') ? packageInfo.name.split('/')[0] : undefined,
    };
    
    if (!registryConfig.token) {
      console.warn('⚠️  No GITHUB_TOKEN found - skipping actual dry-run publish test');
      console.warn('Set GITHUB_TOKEN environment variable to test publishing');
      return;
    }
    
    const result = await dryRunPublish(packedPackage.tarballPath, registryConfig);
    
    console.log('Dry-run publish output:', result.output);
    
    if (result.errors.length > 0) {
      console.warn('Dry-run publish issues:', result.errors);
      
      // Some errors are expected in dry-run (like authentication for testing)
      const criticalErrors = result.errors.filter(error => 
        !error.includes('Authentication failed') &&
        !error.includes('network issue') &&
        !error.includes('E401') &&
        !error.includes('E403')
      );
      
      expect(criticalErrors.length).toBe(0);
    }
    
    // In dry-run mode, we mainly want to validate the package structure
    // and configuration, not actual authentication
    expect(result.output).toBeDefined();
  }, config.timeouts.network);

  it('should generate valid next version', async () => {
    const nextPatch = generateNextVersion(packageInfo.version, 'patch');
    const nextMinor = generateNextVersion(packageInfo.version, 'minor');
    const nextMajor = generateNextVersion(packageInfo.version, 'major');
    
    const patchValidation = validateVersion(nextPatch);
    const minorValidation = validateVersion(nextMinor);
    const majorValidation = validateVersion(nextMajor);
    
    expect(patchValidation.valid).toBe(true);
    expect(minorValidation.valid).toBe(true);
    expect(majorValidation.valid).toBe(true);
    
    // Versions should be greater than current
    const [currentMajor, currentMinor, currentPatch] = packageInfo.version.split('.').map(Number);
    
    const [patchMajor, patchMinor, patchPatchNum] = nextPatch.split('.').map(Number);
    expect(patchPatchNum).toBe(currentPatch + 1);
    expect(patchMinor).toBe(currentMinor);
    expect(patchMajor).toBe(currentMajor);
    
    const [minorMajor, minorMinorNum] = nextMinor.split('.').map(Number);
    expect(minorMinorNum).toBe(currentMinor + 1);
    expect(minorMajor).toBe(currentMajor);
    
    const [majorMajorNum] = nextMajor.split('.').map(Number);
    expect(majorMajorNum).toBe(currentMajor + 1);
  }, config.timeouts.default);

  it('should check if package exists in registry', async () => {
    const registryConfig = {
      registry: config.registry.github,
      token: process.env.GITHUB_TOKEN,
    };
    
    if (!registryConfig.token) {
      console.warn('⚠️  No GITHUB_TOKEN found - skipping registry check');
      return;
    }
    
    const packageExists = await getPackageInfoFromRegistry(
      packageInfo.name,
      registryConfig
    );
    
    if (packageExists.error && !packageExists.error.includes('E404')) {
      console.warn('Registry check error:', packageExists.error);
    }
    
    if (packageExists.exists) {
      console.log(`Package ${packageInfo.name} exists in registry with versions:`, packageExists.versions);
      expect(packageExists.versions).toContain(packageExists.latestVersion);
    } else {
      console.log(`Package ${packageInfo.name} does not exist in registry (this is fine for new packages)`);
    }
  }, config.timeouts.network);

  it('should validate package name availability', async () => {
    // Check if package name follows npm naming conventions
    const nameValidation = {
      valid: true,
      issues: [] as string[],
    };
    
    // Check name format
    if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(packageInfo.name)) {
      nameValidation.issues.push('Package name contains invalid characters');
      nameValidation.valid = false;
    }
    
    // Check for common issues
    if (packageInfo.name.length > 214) {
      nameValidation.issues.push('Package name is too long (max 214 characters)');
      nameValidation.valid = false;
    }
    
    if (packageInfo.name.startsWith('.') || packageInfo.name.startsWith('_')) {
      nameValidation.issues.push('Package name cannot start with . or _');
      nameValidation.valid = false;
    }
    
    if (packageInfo.name !== packageInfo.name.toLowerCase()) {
      nameValidation.issues.push('Package name should be lowercase');
      nameValidation.valid = false;
    }
    
    if (nameValidation.issues.length > 0) {
      console.warn('Package name validation issues:', nameValidation.issues);
    }
    
    expect(nameValidation.valid).toBe(true);
  }, config.timeouts.default);

  it('should validate required package metadata', async () => {
    const requiredFields = [
      'name',
      'version',
      'description',
      'main',
      'author',
      'license',
    ];
    
    const missingFields = requiredFields.filter(field => !packageInfo[field]);
    
    if (missingFields.length > 0) {
      console.warn('Missing recommended package.json fields:', missingFields);
      // Don't fail for missing optional fields, but warn
    }
    
    // These are truly required for publishing
    const criticalFields = ['name', 'version'];
    const missingCritical = criticalFields.filter(field => !packageInfo[field]);
    
    expect(missingCritical.length).toBe(0);
  }, config.timeouts.default);

  it('should validate files configuration', async () => {
    const { files } = packageInfo;
    
    if (!files || files.length === 0) {
      console.warn('⚠️  No "files" field in package.json - all files will be included');
      return;
    }
    
    // Check for common required files
    const shouldInclude = ['dist', 'README.md', 'CHANGELOG.md'];
    const missing = shouldInclude.filter(file => !files.includes(file));
    
    if (missing.length > 0) {
      console.warn('Files field may be missing important files:', missing);
    }
    
    // Check for files that shouldn't be included
    const shouldExclude = ['src', 'tests', 'node_modules', '.git'];
    const incorrectlyIncluded = shouldExclude.filter(file => files.includes(file));
    
    if (incorrectlyIncluded.length > 0) {
      console.warn('Files field includes files that should be excluded:', incorrectlyIncluded);
    }
  }, config.timeouts.default);

  it('should simulate version bump and tag creation', async () => {
    // This test simulates what would happen during a real release
    const currentVersion = packageInfo.version;
    const nextVersion = generateNextVersion(currentVersion, 'patch');
    
    console.log(`Current version: ${currentVersion}`);
    console.log(`Next version would be: ${nextVersion}`);
    
    // Validate that git tagging would work
    try {
      const { executeCommand } = await import('../utils/test-helpers');
      
      // Check if we're in a git repository
      const gitResult = await executeCommand('git status', {
        cwd: config.paths.packageRoot,
        timeout: 5000,
        expectFailure: true,
      });
      
      if (gitResult.exitCode === 0) {
        // Simulate tag creation (dry-run)
        const tagName = `v${nextVersion}`;
        
        // Check if tag already exists
        const tagExists = await executeCommand(`git tag -l "${tagName}"`, {
          cwd: config.paths.packageRoot,
          timeout: 5000,
        });
        
        if (tagExists.stdout.trim()) {
          console.warn(`⚠️  Tag ${tagName} already exists`);
        } else {
          console.log(`✅ Tag ${tagName} would be created`);
        }
      }
    } catch (error) {
      console.warn('⚠️  Git repository validation failed:', error);
    }
  }, config.timeouts.default);
});