/**
 * Registry Helper Functions
 * 
 * Utilities for working with npm registries, package publishing,
 * and version management in Phase 0 tests.
 */

import { executeCommand, createTempDir, readFile, writeFile, readPackageJson } from './test-helpers';
import { getTestConfig } from '../config/test-config';
import { join } from 'path';

const config = getTestConfig();

export interface PackageInfo {
  name: string;
  version: string;
  tarballPath: string;
  size: number;
}

export interface RegistryConfig {
  registry: string;
  token?: string;
  scope?: string;
}

/**
 * Pack the current package for testing
 */
export async function packPackage(sourceDir: string = config.paths.packageRoot): Promise<PackageInfo> {
  const packageJson = await readPackageJson(sourceDir);
  
  // Create a temporary directory for packing
  const tempDir = await createTempDir('package-pack');
  
  // Pack the package
  const result = await executeCommand(
    `${config.commands.packageManager} pack --pack-destination "${tempDir}"`,
    {
      cwd: sourceDir,
      timeout: config.timeouts.build,
    }
  );
  
  if (result.exitCode !== 0) {
    throw new Error(`Failed to pack package: ${result.stderr}`);
  }
  
  // Find the generated tarball
  const expectedTarballName = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
  const tarballPath = join(tempDir, expectedTarballName);
  
  // Get tarball size
  const fs = await import('fs');
  const stats = await fs.promises.stat(tarballPath);
  
  return {
    name: packageJson.name,
    version: packageJson.version,
    tarballPath,
    size: stats.size,
  };
}

/**
 * Validate packed package structure
 */
export async function validatePackedPackage(tarballPath: string): Promise<{
  valid: boolean;
  issues: string[];
  contents: string[];
}> {
  const issues: string[] = [];
  let contents: string[] = [];
  
  try {
    // Extract tarball contents list
    const result = await executeCommand(`tar -tzf "${tarballPath}"`, {
      timeout: config.timeouts.default,
    });
    
    if (result.exitCode !== 0) {
      issues.push('Failed to read tarball contents');
      return { valid: false, issues, contents };
    }
    
    contents = result.stdout.split('\n').filter(line => line.trim());
    
    // Check for required files
    const requiredFiles = [
      'package/package.json',
      'package/README.md',
      'package/dist/', // Should have built files
    ];
    
    for (const required of requiredFiles) {
      const hasFile = contents.some(file => file.includes(required));
      if (!hasFile) {
        issues.push(`Missing required file/directory: ${required}`);
      }
    }
    
    // Check for files that shouldn't be included
    const excludedPatterns = [
      'node_modules/',
      '.git/',
      'src/', // Should be built, not source
      '.env',
      '*.test.ts',
      '*.spec.ts',
    ];
    
    for (const pattern of excludedPatterns) {
      const hasExcluded = contents.some(file => 
        file.includes(pattern) || file.match(new RegExp(pattern.replace('*', '.*')))
      );
      if (hasExcluded) {
        issues.push(`Should not include: ${pattern}`);
      }
    }
    
    // Check package size (warn if too large)
    const fs = await import('fs');
    const stats = await fs.promises.stat(tarballPath);
    const sizeMB = stats.size / (1024 * 1024);
    
    if (sizeMB > 50) { // Warn if package is larger than 50MB
      issues.push(`Package size is large: ${sizeMB.toFixed(2)}MB`);
    }
    
  } catch (error) {
    issues.push(`Failed to validate package: ${error}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    contents,
  };
}

/**
 * Perform dry-run publish to registry
 */
export async function dryRunPublish(
  tarballPath: string,
  registryConfig: RegistryConfig
): Promise<{
  success: boolean;
  output: string;
  errors: string[];
}> {
  try {
    // Set up temporary .npmrc for the registry
    const tempDir = await createTempDir('npm-publish');
    const npmrcPath = join(tempDir, '.npmrc');
    
    let npmrcContent = `registry=${registryConfig.registry}\n`;
    
    if (registryConfig.token) {
      const registryUrl = new URL(registryConfig.registry);
      npmrcContent += `${registryUrl.hostname}/:_authToken=${registryConfig.token}\n`;
    }
    
    if (registryConfig.scope) {
      npmrcContent += `${registryConfig.scope}:registry=${registryConfig.registry}\n`;
    }
    
    await writeFile(npmrcPath, npmrcContent);
    
    // Perform dry-run publish
    const result = await executeCommand(
      `npm publish "${tarballPath}" --dry-run --userconfig="${npmrcPath}"`,
      {
        timeout: config.timeouts.network,
        expectFailure: true, // Dry-run might "fail" but give us the info we need
      }
    );
    
    const errors: string[] = [];
    
    // Check for common issues
    if (result.stderr.includes('ENOTFOUND')) {
      errors.push('Registry not found or network issue');
    }
    
    if (result.stderr.includes('E401') || result.stderr.includes('E403')) {
      errors.push('Authentication failed - check token');
    }
    
    if (result.stderr.includes('E409')) {
      errors.push('Version already exists');
    }
    
    if (result.stderr.includes('EPUBLISHCONFLICT')) {
      errors.push('Package name conflict');
    }
    
    // For dry-run, we mostly care about validation, not actual publishing
    const success = !errors.some(error => 
      error.includes('network issue') || 
      error.includes('Authentication failed')
    );
    
    return {
      success,
      output: result.stdout + '\n' + result.stderr,
      errors,
    };
    
  } catch (error) {
    return {
      success: false,
      output: '',
      errors: [`Dry-run publish failed: ${error}`],
    };
  }
}

/**
 * Test package installation from registry
 */
export async function testInstallFromRegistry(
  packageName: string,
  version: string,
  registryConfig: RegistryConfig
): Promise<{
  success: boolean;
  installedVersion?: string;
  installPath?: string;
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    // Create isolated environment for installation
    const testDir = await createTempDir('install-test');
    
    // Create minimal package.json
    const packageJson = {
      name: 'install-test',
      version: '1.0.0',
      private: true,
    };
    
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Set up .npmrc
    const npmrcPath = join(testDir, '.npmrc');
    let npmrcContent = `registry=${registryConfig.registry}\n`;
    
    if (registryConfig.token) {
      const registryUrl = new URL(registryConfig.registry);
      npmrcContent += `${registryUrl.hostname}/:_authToken=${registryConfig.token}\n`;
    }
    
    await writeFile(npmrcPath, npmrcContent);
    
    // Install the package
    const installCommand = version === 'latest' 
      ? `npm install ${packageName}`
      : `npm install ${packageName}@${version}`;
    
    const result = await executeCommand(installCommand, {
      cwd: testDir,
      timeout: config.timeouts.install,
      expectFailure: true,
    });
    
    if (result.exitCode !== 0) {
      errors.push(`Installation failed: ${result.stderr}`);
      return { success: false, errors };
    }
    
    // Verify installation
    const nodeModulesPath = join(testDir, 'node_modules', packageName);
    const fs = await import('fs');
    
    try {
      await fs.promises.access(nodeModulesPath);
      
      // Read installed package.json to get actual version
      const installedPackageJson = await readPackageJson(nodeModulesPath);
      
      return {
        success: true,
        installedVersion: installedPackageJson.version,
        installPath: nodeModulesPath,
        errors: [],
      };
      
    } catch (error) {
      errors.push(`Package not found after installation: ${error}`);
      return { success: false, errors };
    }
    
  } catch (error) {
    errors.push(`Installation test failed: ${error}`);
    return { success: false, errors };
  }
}

/**
 * Get package information from registry
 */
export async function getPackageInfoFromRegistry(
  packageName: string,
  registryConfig: RegistryConfig
): Promise<{
  exists: boolean;
  versions: string[];
  latestVersion?: string;
  error?: string;
}> {
  try {
    // Use npm view to get package info
    const result = await executeCommand(
      `npm view ${packageName} --registry=${registryConfig.registry} --json`,
      {
        timeout: config.timeouts.network,
        expectFailure: true,
      }
    );
    
    if (result.exitCode !== 0) {
      if (result.stderr.includes('E404')) {
        return { exists: false, versions: [] };
      }
      
      return {
        exists: false,
        versions: [],
        error: result.stderr,
      };
    }
    
    const packageInfo = JSON.parse(result.stdout);
    
    return {
      exists: true,
      versions: Array.isArray(packageInfo.versions) ? packageInfo.versions : [packageInfo.version],
      latestVersion: packageInfo.version,
    };
    
  } catch (error) {
    return {
      exists: false,
      versions: [],
      error: `Failed to get package info: ${error}`,
    };
  }
}

/**
 * Validate version format
 */
export function validateVersion(version: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Basic semver pattern
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?(\+[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$/;
  
  if (!semverRegex.test(version)) {
    issues.push('Version does not follow semantic versioning format');
  }
  
  // Check for common issues
  if (version.includes(' ')) {
    issues.push('Version contains spaces');
  }
  
  if (version.startsWith('v')) {
    issues.push('Version should not start with "v"');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Generate next version for testing
 */
export function generateNextVersion(currentVersion: string, type: 'patch' | 'minor' | 'major' = 'patch'): string {
  const parts = currentVersion.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${currentVersion}`);
  }
  
  let [major, minor, patch] = parts.map(Number);
  
  switch (type) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
  }
  
  return `${major}.${minor}.${patch}`;
}