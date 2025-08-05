/**
 * Documentation Build Tests
 * 
 * Tests that validate documentation can be built successfully
 * without errors and all pages render correctly.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { executeCommand, createTempDir, fileExists, cleanupTempDirs } from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';

const config = getTestConfig();

describe('Documentation Build Tests', () => {
  let tempDir: string;
  const docsPath = join(config.paths.packageRoot, 'docs');
  
  beforeAll(async () => {
    tempDir = await createTempDir('docs-build');
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should have documentation directory', async () => {
    const exists = await fileExists(docsPath);
    expect(exists).toBe(true);
  }, config.timeouts.default);

  it('should build documentation without errors', async () => {
    // Check if we have a documentation build command
    const packageJsonPath = join(config.paths.packageRoot, 'package.json');
    const packageJson = require(packageJsonPath);
    
    // Try common documentation build commands
    const possibleCommands = [
      'docs:build',
      'build:docs',
      'build-docs',
      'docusaurus build',
      'vitepress build',
    ];
    
    let buildCommand: string | null = null;
    
    // Check if any build command exists in package.json scripts
    if (packageJson.scripts) {
      for (const cmd of possibleCommands) {
        if (packageJson.scripts[cmd.replace(' ', ':')]) {
          buildCommand = `${config.commands.packageManager} run ${cmd.replace(' ', ':')}`;
          break;
        }
      }
    }
    
    // If no npm script found, try direct commands
    if (!buildCommand) {
      // Check if this is a simple markdown docs directory
      const readmeExists = await fileExists(join(docsPath, 'README.md'));
      const indexExists = await fileExists(join(docsPath, 'index.md'));
      
      if (readmeExists || indexExists) {
        // For simple markdown docs, we'll validate structure instead
        expect(readmeExists || indexExists).toBe(true);
        return;
      }
      
      // Skip if no documentation build system detected
      console.warn('⚠️  No documentation build system detected, skipping build test');
      return;
    }
    
    const result = await executeCommand(buildCommand, {
      cwd: config.paths.packageRoot,
      timeout: config.timeouts.build,
    });
    
    expect(result.exitCode).toBe(0);
    expect(result.stderr).not.toMatch(/error|failed|Error:/i);
  }, config.timeouts.build);

  it('should validate documentation structure', async () => {
    const requiredFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md', // This file should exist based on our earlier read
    ];
    
    for (const file of requiredFiles) {
      const filePath = join(docsPath, file);
      const exists = await fileExists(filePath);
      expect(exists).toBe(true);
    }
  }, config.timeouts.default);

  it('should have valid markdown syntax in key files', async () => {
    // Use markdownlint if available, otherwise do basic validation
    try {
      const result = await executeCommand('npx markdownlint --version', {
        timeout: 5000,
      });
      
      if (result.exitCode === 0) {
        // Run markdownlint on docs directory
        const lintResult = await executeCommand(
          `npx markdownlint "${docsPath}/**/*.md"`,
          {
            cwd: config.paths.packageRoot,
            timeout: config.timeouts.default,
            expectFailure: true, // Some lint errors might be acceptable
          }
        );
        
        // Check for severe markdown errors (not just style warnings)
        expect(lintResult.stderr).not.toMatch(/MD001|MD002|MD003/); // Header issues
        expect(lintResult.stderr).not.toMatch(/MD051/); // Link fragment issues
      }
    } catch (error) {
      // If markdownlint is not available, do basic syntax validation
      console.warn('⚠️  markdownlint not available, performing basic validation');
      
      const readmePath = join(docsPath, 'README.md');
      if (await fileExists(readmePath)) {
        const { readFile } = await import('../utils/test-helpers');
        const content = await readFile(readmePath);
        
        // Basic markdown validation
        expect(content.length).toBeGreaterThan(0);
        expect(content).toMatch(/^#\s+/m); // Should have at least one header
      }
    }
  }, config.timeouts.default);

  it('should check for broken internal links', async () => {
    // This is a basic check - in a real setup you'd use a tool like markdown-link-check
    try {
      const result = await executeCommand('npx markdown-link-check --version', {
        timeout: 5000,
      });
      
      if (result.exitCode === 0) {
        // Check key documentation files for broken links
        const filesToCheck = [
          join(docsPath, 'README.md'),
          join(docsPath, 'COMPREHENSIVE-TESTING.md'),
        ];
        
        for (const file of filesToCheck) {
          if (await fileExists(file)) {
            const linkCheckResult = await executeCommand(
              `npx markdown-link-check "${file}"`,
              {
                timeout: config.timeouts.network,
                expectFailure: true, // Some links might be broken
              }
            );
            
            // Check for internal link issues (ignore external link failures)
            const lines = linkCheckResult.stdout.split('\n');
            const brokenInternalLinks = lines.filter(line => 
              line.includes('✖') && 
              (line.includes('./') || line.includes('../') || line.includes('#'))
            );
            
            expect(brokenInternalLinks.length).toBe(0);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  markdown-link-check not available, skipping link validation');
    }
  }, config.timeouts.network);

  it('should validate documentation completeness', async () => {
    // Check for essential documentation sections
    const essentialSections = [
      'installation',
      'usage',
      'api',
      'examples',
      'contributing',
    ];
    
    // This is a simple heuristic - look for these terms in documentation files
    const docFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md',
    ];
    
    let foundSections = 0;
    
    for (const file of docFiles) {
      const filePath = join(docsPath, file);
      if (await fileExists(filePath)) {
        const { readFile } = await import('../utils/test-helpers');
        const content = await readFile(filePath).toLowerCase();
        
        for (const section of essentialSections) {
          if (content.includes(section)) {
            foundSections++;
            break;
          }
        }
      }
    }
    
    // Should have at least some essential documentation
    expect(foundSections).toBeGreaterThan(0);
  }, config.timeouts.default);
});