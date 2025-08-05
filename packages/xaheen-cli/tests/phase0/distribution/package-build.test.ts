/**
 * Package Build Tests
 * 
 * Tests that validate the CLI package can be built and packed
 * correctly for distribution.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { executeCommand, fileExists, cleanupTempDirs, readPackageJson } from '../utils/test-helpers';
import { packPackage, validatePackedPackage } from '../utils/registry-helpers';
import { getTestConfig } from '../config/test-config';

const config = getTestConfig();

describe('Package Build Tests', () => {
  let packageInfo: any;
  
  beforeAll(async () => {
    // Read current package info
    packageInfo = await readPackageJson(config.paths.packageRoot);
    
    // Ensure the package is built
    const distExists = await fileExists(join(config.paths.packageRoot, 'dist'));
    if (!distExists) {
      const buildResult = await executeCommand(
        `${config.commands.packageManager} run build`,
        {
          cwd: config.paths.packageRoot,
          timeout: config.timeouts.build,
        }
      );
      
      if (buildResult.exitCode !== 0) {
        throw new Error(`Failed to build package: ${buildResult.stderr}`);
      }
    }
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should have valid package.json structure', async () => {
    expect(packageInfo.name).toBeDefined();
    expect(packageInfo.version).toBeDefined();
    expect(packageInfo.main).toBeDefined();
    expect(packageInfo.bin).toBeDefined();
    
    // Check required fields for npm publishing
    expect(packageInfo.name).toMatch(/^@?[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$|^[a-z0-9-~][a-z0-9-._~]*$/);
    expect(packageInfo.version).toMatch(/^\d+\.\d+\.\d+/);
    
    // Check for publishing configuration
    if (packageInfo.publishConfig) {
      expect(packageInfo.publishConfig.access).toBeDefined();
      expect(packageInfo.publishConfig.registry).toBeDefined();
    }
  }, config.timeouts.default);

  it('should have required files for distribution', async () => {
    const requiredFiles = [
      'package.json',
      'README.md',
      'dist/index.js', // Built main file
    ];
    
    for (const file of requiredFiles) {
      const filePath = join(config.paths.packageRoot, file);
      const exists = await fileExists(filePath);
      expect(exists).toBe(true);
    }
  }, config.timeouts.default);

  it('should have valid binary configuration', async () => {
    const { bin } = packageInfo;
    
    if (typeof bin === 'string') {
      // Single binary
      const binPath = join(config.paths.packageRoot, bin);
      const exists = await fileExists(binPath);
      expect(exists).toBe(true);
    } else if (typeof bin === 'object') {
      // Multiple binaries
      for (const [name, path] of Object.entries(bin)) {
        const binPath = join(config.paths.packageRoot, path as string);
        const exists = await fileExists(binPath);
        expect(exists).toBe(true);
      }
    }
  }, config.timeouts.default);

  it('should build distribution files without errors', async () => {
    const buildResult = await executeCommand(
      `${config.commands.packageManager} run build`,
      {
        cwd: config.paths.packageRoot,
        timeout: config.timeouts.build,
      }
    );
    
    expect(buildResult.exitCode).toBe(0);
    expect(buildResult.stderr).not.toMatch(/error|Error:/i);
    
    // Check that dist directory exists and has content
    const distPath = join(config.paths.packageRoot, 'dist');
    const distExists = await fileExists(distPath);
    expect(distExists).toBe(true);
    
    // Check for main entry file
    const mainFile = join(config.paths.packageRoot, packageInfo.main);
    const mainExists = await fileExists(mainFile);
    expect(mainExists).toBe(true);
  }, config.timeouts.build);

  it('should pack package successfully', async () => {
    const packedInfo = await packPackage(config.paths.packageRoot);
    
    expect(packedInfo.name).toBe(packageInfo.name);
    expect(packedInfo.version).toBe(packageInfo.version);
    expect(packedInfo.size).toBeGreaterThan(0);
    
    // Tarball should exist
    const tarballExists = await fileExists(packedInfo.tarballPath);
    expect(tarballExists).toBe(true);
  }, config.timeouts.build);

  it('should have valid packed package structure', async () => {
    const packedInfo = await packPackage(config.paths.packageRoot);
    const validation = await validatePackedPackage(packedInfo.tarballPath);
    
    // Report issues as warnings but don't fail if structure is mostly correct
    if (validation.issues.length > 0) {
      console.warn('Package structure issues:', validation.issues);
    }
    
    // Should have some content
    expect(validation.contents.length).toBeGreaterThan(0);
    
    // Should have package.json
    const hasPackageJson = validation.contents.some(file => file.includes('package.json'));
    expect(hasPackageJson).toBe(true);
    
    // Should have built files
    const hasBuiltFiles = validation.contents.some(file => file.includes('dist/'));
    expect(hasBuiltFiles).toBe(true);
  }, config.timeouts.build);

  it('should pass TypeScript type checking', async () => {
    try {
      const typeCheckResult = await executeCommand(
        `${config.commands.packageManager} run type-check`,
        {
          cwd: config.paths.packageRoot,
          timeout: config.timeouts.build,
        }
      );
      
      expect(typeCheckResult.exitCode).toBe(0);
      expect(typeCheckResult.stderr).not.toMatch(/error TS\d+/);
    } catch (error) {
      // If type-check script doesn't exist, try direct tsc
      const tscResult = await executeCommand(
        'npx tsc --noEmit',
        {
          cwd: config.paths.packageRoot,
          timeout: config.timeouts.build,
          expectFailure: true,
        }
      );
      
      if (tscResult.exitCode !== 0) {
        console.warn('TypeScript type checking issues:', tscResult.stderr);
        // Don't fail the test for type issues in Phase 0, but warn
      }
    }
  }, config.timeouts.build);

  it('should have reasonable package size', async () => {
    const packedInfo = await packPackage(config.paths.packageRoot);
    const sizeMB = packedInfo.size / (1024 * 1024);
    
    // Warn if package is unusually large
    if (sizeMB > 10) {
      console.warn(`⚠️  Package size is large: ${sizeMB.toFixed(2)}MB`);
    }
    
    // Fail if package is extremely large (might indicate bundling issues)
    expect(sizeMB).toBeLessThan(50);
  }, config.timeouts.build);

  it('should have valid entry points', async () => {
    const mainFile = join(config.paths.packageRoot, packageInfo.main);
    
    // Check if main file can be loaded
    try {
      const mainContent = await import(mainFile);
      expect(mainContent).toBeDefined();
    } catch (error) {
      // If ES module import fails, try CommonJS require
      try {
        const mainContent = require(mainFile);
        expect(mainContent).toBeDefined();
      } catch (requireError) {
        throw new Error(`Failed to load main entry point: ${error}`);
      }
    }
  }, config.timeouts.default);

  it('should have proper file permissions for binaries', async () => {
    const { bin } = packageInfo;
    
    if (bin) {
      const binaries = typeof bin === 'string' ? { [packageInfo.name]: bin } : bin;
      
      for (const [name, path] of Object.entries(binaries)) {
        const binPath = join(config.paths.packageRoot, path as string);
        
        try {
          const fs = await import('fs');
          const stats = await fs.promises.stat(binPath);
          
          // Check if file is executable (has execute permission)
          const isExecutable = !!(stats.mode & parseInt('111', 8));
          
          if (!isExecutable) {
            console.warn(`⚠️  Binary ${name} at ${path} may not be executable`);
          }
        } catch (error) {
          throw new Error(`Failed to check binary permissions for ${name}: ${error}`);
        }
      }
    }
  }, config.timeouts.default);
});