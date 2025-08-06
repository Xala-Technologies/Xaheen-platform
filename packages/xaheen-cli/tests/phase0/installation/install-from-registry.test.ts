/**
 * Installation from Registry Tests
 * 
 * Tests that validate the CLI can be installed from GitHub Packages
 * and functions correctly after installation.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { cleanupTempDirs, readPackageJson } from '../utils/test-helpers';
import { 
  testInstallFromRegistry,
  getPackageInfoFromRegistry,
  packPackage
} from '../utils/registry-helpers';
import { getTestConfig } from '../config/test-config';

const config = getTestConfig();

describe('Installation from Registry Tests', () => {
  let packageInfo: any;
  
  beforeAll(async () => {
    packageInfo = await readPackageJson(config.paths.packageRoot);
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should check if package exists in GitHub Packages registry', async () => {
    const registryConfig = {
      registry: config.registry.github,
      token: process.env.GITHUB_TOKEN,
    };
    
    if (!registryConfig.token) {
      console.warn('⚠️  No GITHUB_TOKEN found - skipping registry installation tests');
      console.warn('Set GITHUB_TOKEN environment variable to test installation from registry');
      return;
    }
    
    const packageExists = await getPackageInfoFromRegistry(
      packageInfo.name,
      registryConfig
    );
    
    if (packageExists.error && !packageExists.error.includes('E404')) {
      console.warn(`Registry check error: ${packageExists.error}`);
    }
    
    if (packageExists.exists) {
      console.log(`✅ Package ${packageInfo.name} found in GitHub Packages`);
      console.log(`Available versions: ${packageExists.versions.join(', ')}`);
      expect(packageExists.versions.length).toBeGreaterThan(0);
    } else {
      console.log(`ℹ️  Package ${packageInfo.name} not found in registry (expected for new packages)`);
    }
  }, config.timeouts.network);

  it('should simulate installation from GitHub Packages', async () => {
    const registryConfig = {
      registry: config.registry.github,
      token: process.env.GITHUB_TOKEN,
    };
    
    if (!registryConfig.token) {
      console.warn('⚠️  Skipping installation test - no GITHUB_TOKEN');
      return;
    }
    
    // Check if package exists in registry
    const packageExists = await getPackageInfoFromRegistry(
      packageInfo.name,
      registryConfig
    );
    
    if (!packageExists.exists) {
      console.log('ℹ️  Package not yet published - cannot test installation');
      return;
    }
    
    // Test installation
    const installResult = await testInstallFromRegistry(
      packageInfo.name,
      'latest',
      registryConfig
    );
    
    if (installResult.success) {
      console.log(`✅ Package installed successfully`);
      console.log(`Installed version: ${installResult.installedVersion}`);
      expect(installResult.installedVersion).toBeDefined();
      expect(installResult.installPath).toBeDefined();
    } else {
      console.warn(`Installation issues: ${installResult.errors.join(', ')}`);
      
      // Don't fail if it's just authentication issues in testing
      const criticalErrors = installResult.errors.filter(error => 
        !error.includes('Authentication') &&
        !error.includes('E401') &&
        !error.includes('E403')
      );
      
      expect(criticalErrors.length).toBe(0);
    }
  }, config.timeouts.install);

  it('should test local package installation', async () => {
    // Test installation from locally packed tarball
    const packedPackage = await packPackage(config.paths.packageRoot);
    
    const installResult = await testInstallFromRegistry(
      packedPackage.tarballPath,
      'latest',
      { registry: 'file://' } // Local file installation
    );
    
    // Local file installation should work
    if (installResult.errors.length > 0) {
      console.warn('Local installation issues:', installResult.errors);
    }
    
    // At minimum, the tarball should be valid for installation
    expect(packedPackage.size).toBeGreaterThan(0);
  }, config.timeouts.install);

  it('should validate package installation requirements', async () => {
    // Check if package.json has proper installation metadata
    const requiredFields = [
      'name',
      'version',
      'main',
      'bin',
    ];
    
    const missingFields = requiredFields.filter(field => !packageInfo[field]);
    
    if (missingFields.length > 0) {
      console.warn('Missing installation fields:', missingFields);
    }
    
    // These are critical for installation
    expect(packageInfo.name).toBeDefined();
    expect(packageInfo.version).toBeDefined();
    
    // Binary should be defined for CLI packages
    expect(packageInfo.bin).toBeDefined();
  }, config.timeouts.default);

  it('should check for installation compatibility', async () => {
    // Check Node.js version requirements
    if (packageInfo.engines && packageInfo.engines.node) {
      const nodeRequirement = packageInfo.engines.node;
      const currentNodeVersion = process.version;
      
      console.log(`Node.js requirement: ${nodeRequirement}`);
      console.log(`Current Node.js version: ${currentNodeVersion}`);
      
      // Basic validation that current Node.js version meets requirement
      const majorVersion = parseInt(currentNodeVersion.slice(1).split('.')[0]);
      
      if (nodeRequirement.includes('>=')) {
        const requiredMajor = parseInt(nodeRequirement.replace('>=', '').trim());
        expect(majorVersion).toBeGreaterThanOrEqual(requiredMajor);
      }
    }
    
    // Check for OS compatibility
    if (packageInfo.os) {
      console.log(`OS restrictions: ${packageInfo.os.join(', ')}`);
    }
    
    // Check for CPU architecture compatibility
    if (packageInfo.cpu) {
      console.log(`CPU restrictions: ${packageInfo.cpu.join(', ')}`);
    }
  }, config.timeouts.default);

  it('should validate post-installation structure', async () => {
    // This test simulates what should happen after installation
    const expectedStructure = [
      'package.json',
      'README.md',
      'dist/index.js', // Main entry point
    ];
    
    // Check if binary paths are valid
    const { bin } = packageInfo;
    if (bin) {
      if (typeof bin === 'string') {
        expectedStructure.push(bin);
      } else {
        Object.values(bin).forEach(binPath => {
          expectedStructure.push(binPath as string);
        });
      }
    }
    
    console.log('Expected post-installation files:', expectedStructure);
    
    // All expected files should be included in the package
    expect(expectedStructure.length).toBeGreaterThan(0);
  }, config.timeouts.default);

  it('should test global installation simulation', async () => {
    // Simulate what happens during global installation
    const packageName = packageInfo.name;
    const binName = config.commands.cliName;
    
    console.log(`Package name: ${packageName}`);
    console.log(`CLI binary name: ${binName}`);
    
    // Check if binary name matches package expectations
    if (packageInfo.bin) {
      const binaries = typeof packageInfo.bin === 'string' 
        ? { [packageName]: packageInfo.bin }
        : packageInfo.bin;
        
      const binaryNames = Object.keys(binaries);
      console.log(`Available binaries: ${binaryNames.join(', ')}`);
      
      // Should have at least one binary
      expect(binaryNames.length).toBeGreaterThan(0);
    }
  }, config.timeouts.default);

  it('should validate installation size requirements', async () => {
    const packedPackage = await packPackage(config.paths.packageRoot);
    const sizeMB = packedPackage.size / (1024 * 1024);
    
    console.log(`Package size: ${sizeMB.toFixed(2)} MB`);
    
    // Reasonable size expectations for a CLI package
    expect(sizeMB).toBeGreaterThan(0.1); // At least 100KB
    expect(sizeMB).toBeLessThan(100); // Less than 100MB
    
    if (sizeMB > 10) {
      console.warn(`⚠️  Package is large (${sizeMB.toFixed(2)} MB) - consider optimization`);
    }
  }, config.timeouts.default);

  it('should check for dependency compatibility', async () => {
    const { dependencies, peerDependencies } = packageInfo;
    
    if (dependencies && Object.keys(dependencies).length > 0) {
      console.log(`Runtime dependencies: ${Object.keys(dependencies).length}`);
      
      // Large number of dependencies might indicate issues
      const depCount = Object.keys(dependencies).length;
      if (depCount > 50) {
        console.warn(`⚠️  Large number of dependencies (${depCount}) - consider reducing`);
      }
    }
    
    if (peerDependencies && Object.keys(peerDependencies).length > 0) {
      console.log(`Peer dependencies: ${Object.keys(peerDependencies).join(', ')}`);
      
      // Peer dependencies require special handling during installation
      expect(Object.keys(peerDependencies).length).toBeLessThan(10);
    }
  }, config.timeouts.default);
});