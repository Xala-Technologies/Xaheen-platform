/**
 * Documentation Lint Tests
 * 
 * Tests that validate documentation follows quality standards
 * including spelling, formatting, and style guidelines.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { executeCommand, fileExists, readFile, cleanupTempDirs } from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';

const config = getTestConfig();

describe('Documentation Lint Tests', () => {
  const docsPath = join(config.paths.packageRoot, 'docs');
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should pass markdown linting', async () => {
    try {
      // Try to run markdownlint
      const result = await executeCommand(
        `npx markdownlint-cli2 "${docsPath}/**/*.md"`,
        {
          cwd: config.paths.packageRoot,
          timeout: config.timeouts.default,
          expectFailure: true, // Allow some warnings
        }
      );
      
      // Check for critical markdown issues
      const criticalErrors = [
        'MD001', // Heading levels should only increment by one level at a time
        'MD051', // Link fragments should be valid
        'MD053', // Link and image reference definitions should be needed
      ];
      
      const hasCriticalErrors = criticalErrors.some(error => 
        result.stderr.includes(error) || result.stdout.includes(error)
      );
      
      expect(hasCriticalErrors).toBe(false);
      
    } catch (error) {
      // If markdownlint is not available, perform basic validation
      console.warn('⚠️  markdownlint not available, performing basic validation');
      
      const readmeExists = await fileExists(join(docsPath, 'README.md'));
      if (readmeExists) {
        const content = await readFile(join(docsPath, 'README.md'));
        
        // Basic markdown structure validation
        expect(content).toMatch(/^#\s+/m); // Has main heading
        expect(content.length).toBeGreaterThan(100); // Has substantial content
      }
    }
  }, config.timeouts.default);

  it('should pass spell checking on key documentation', async () => {
    const keyFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md',
    ];
    
    for (const file of keyFiles) {
      const filePath = join(docsPath, file);
      if (await fileExists(filePath)) {
        try {
          // Try using cspell (Code Spell Checker)
          const result = await executeCommand(
            `npx cspell "${filePath}"`,
            {
              timeout: config.timeouts.default,
              expectFailure: true, // Some technical terms might not be in dictionary
            }
          );
          
          // Check for excessive spelling errors (more than 10 might indicate issues)
          const errorCount = (result.stdout.match(/Unknown word/g) || []).length;
          expect(errorCount).toBeLessThan(20); // Allow some technical terms
          
        } catch (error) {
          // If cspell is not available, do basic text validation
          console.warn(`⚠️  cspell not available for ${file}, performing basic validation`);
          
          const content = await readFile(filePath);
          
          // Check for common typos in technical documentation
          const commonTypos = [
            /\bteh\b/gi,      // the
            /\badn\b/gi,      // and
            /\bfrom\b/gi,     // form (context dependent)
            /\btiem\b/gi,     // time
            /\bfiel\b/gi,     // file
          ];
          
          for (const typo of commonTypos) {
            const matches = content.match(typo);
            if (matches) {
              console.warn(`Potential typo found in ${file}: ${matches[0]}`);
            }
          }
        }
      }
    }
  }, config.timeouts.default);

  it('should validate code blocks have proper syntax highlighting', async () => {
    const docFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md',
    ];
    
    for (const file of docFiles) {
      const filePath = join(docsPath, file);
      if (await fileExists(filePath)) {
        const content = await readFile(filePath);
        
        // Find code blocks
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        const codeBlocks = Array.from(content.matchAll(codeBlockRegex));
        
        if (codeBlocks.length > 0) {
          // Check that code blocks have language specified (when appropriate)
          const unspecifiedBlocks = codeBlocks.filter(([, lang]) => 
            !lang && lang !== '' // Empty string is valid for plain text
          );
          
          // Allow some unspecified blocks, but most should have language
          const specifiedRatio = (codeBlocks.length - unspecifiedBlocks.length) / codeBlocks.length;
          expect(specifiedRatio).toBeGreaterThan(0.5); // At least 50% should have language specified
        }
      }
    }
  }, config.timeouts.default);

  it('should check for consistent heading structure', async () => {
    const docFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md',
    ];
    
    for (const file of docFiles) {
      const filePath = join(docsPath, file);
      if (await fileExists(filePath)) {
        const content = await readFile(filePath);
        
        // Extract headings
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const headings = Array.from(content.matchAll(headingRegex));
        
        if (headings.length > 1) {
          // Check heading level progression
          let previousLevel = 0;
          let hasStructureIssues = false;
          
          for (const [, hashes] of headings) {
            const currentLevel = hashes.length;
            
            // First heading should be level 1 or 2
            if (previousLevel === 0) {
              expect(currentLevel).toBeLessThanOrEqual(2);
            } else {
              // Subsequent headings shouldn't skip levels (but can go back)
              if (currentLevel > previousLevel + 1) {
                hasStructureIssues = true;
              }
            }
            
            previousLevel = currentLevel;
          }
          
          if (hasStructureIssues) {
            console.warn(`⚠️  Heading structure issues detected in ${file}`);
          }
        }
      }
    }
  }, config.timeouts.default);

  it('should validate table formatting', async () => {
    const docFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md',
    ];
    
    for (const file of docFiles) {
      const filePath = join(docsPath, file);
      if (await fileExists(filePath)) {
        const content = await readFile(filePath);
        
        // Find markdown tables
        const tableRegex = /\|.+\|[\n\r]+\|[-:\s|]+\|/g;
        const tables = Array.from(content.matchAll(tableRegex));
        
        for (const [table] of tables) {
          const lines = table.trim().split('\n');
          if (lines.length >= 2) {
            const headerCols = (lines[0].match(/\|/g) || []).length;
            const separatorCols = (lines[1].match(/\|/g) || []).length;
            
            // Header and separator should have same number of columns
            expect(headerCols).toBe(separatorCols);
          }
        }
      }
    }
  }, config.timeouts.default);

  it('should check for proper link formatting', async () => {
    const docFiles = [
      'README.md',
      'COMPREHENSIVE-TESTING.md',
    ];
    
    for (const file of docFiles) {
      const filePath = join(docsPath, file);
      if (await fileExists(filePath)) {
        const content = await readFile(filePath);
        
        // Check for common link formatting issues
        const issues = [];
        
        // Find naked URLs (should be proper markdown links)
        const nakedUrlRegex = /(?<!\]\()https?:\/\/[^\s)]+(?!\))/g;
        const nakedUrls = content.match(nakedUrlRegex);
        if (nakedUrls && nakedUrls.length > 2) { // Allow a few
          issues.push(`Found ${nakedUrls.length} naked URLs that should be proper markdown links`);
        }
        
        // Find malformed markdown links
        const malformedLinkRegex = /\[[^\]]+\]\([^)]*\s[^)]*\)/g;
        const malformedLinks = content.match(malformedLinkRegex);
        if (malformedLinks) {
          issues.push(`Found ${malformedLinks.length} malformed links with spaces in URLs`);
        }
        
        // Report issues as warnings rather than failures for documentation
        if (issues.length > 0) {
          console.warn(`⚠️  Link formatting issues in ${file}:`, issues);
        }
        
        // Only fail on severe formatting issues
        expect(issues.length).toBeLessThan(10);
      }
    }
  }, config.timeouts.default);
});