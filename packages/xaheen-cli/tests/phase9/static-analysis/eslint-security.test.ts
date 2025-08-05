/**
 * ESLint Security Testing Suite
 * 
 * Tests static analysis rules focused on security vulnerabilities
 * and code quality issues in the Xaheen CLI codebase.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, resolve } from 'path';
import { ESLint } from 'eslint';

const execAsync = promisify(exec);

interface ESLintResult {
  filePath: string;
  messages: Array<{
    ruleId: string | null;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType?: string;
    messageId?: string;
    endLine?: number;
    endColumn?: number;
  }>;
  suppressedMessages: Array<any>;
  errorCount: number;
  fatalErrorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
  usedDeprecatedRules: Array<any>;
}

interface SecurityTestCase {
  name: string;
  code: string;
  expectedRules: string[];
  severity: 'error' | 'warning';
}

describe('Phase 9: Static Analysis - ESLint Security', () => {
  let eslint: ESLint;
  const configPath = resolve(__dirname, '../config/eslint.security.config.js');
  const testOutputDir = resolve(process.cwd(), 'test-output/static-analysis');
  const tempDir = join(testOutputDir, 'temp');

  beforeAll(async () => {
    // Ensure output directories exist
    await mkdir(testOutputDir, { recursive: true });
    await mkdir(tempDir, { recursive: true });

    // Initialize ESLint with security configuration
    eslint = new ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      cwd: process.cwd(),
    });
  });

  afterAll(async () => {
    // Cleanup is handled by the test runner
  });

  describe('Configuration Validation', () => {
    it('should load security ESLint configuration without errors', async () => {
      const configExists = await access(configPath).then(() => true).catch(() => false);
      expect(configExists).toBe(true);

      // Test that ESLint can load the configuration
      const isPathIgnored = await eslint.isPathIgnored('test-file.ts');
      expect(typeof isPathIgnored).toBe('boolean');
    });

    it('should have security-focused plugins enabled', async () => {
      const config = await eslint.calculateConfigForFile(join(tempDir, 'test.ts'));
      const plugins = config.plugins || [];
      
      expect(plugins).toContain('security');
      expect(plugins).toContain('security-node');
      expect(plugins).toContain('no-unsanitized');
      expect(plugins).toContain('no-secrets');
    });

    it('should enforce strict TypeScript rules', async () => {
      const config = await eslint.calculateConfigForFile(join(tempDir, 'test.ts'));
      const rules = config.rules || {};
      
      expect(rules['@typescript-eslint/no-explicit-any']).toEqual(['error']);
      expect(rules['@typescript-eslint/no-unsafe-assignment']).toEqual(['error']);
      expect(rules['@typescript-eslint/no-unsafe-call']).toEqual(['error']);
    });
  });

  describe('Security Rule Detection', () => {
    const securityTestCases: SecurityTestCase[] = [
      {
        name: 'should detect unsafe regex patterns',
        code: `
          const regex = new RegExp(userInput);
          const result = /^(a+)+$/.test(input);
        `,
        expectedRules: ['security/detect-unsafe-regex'],
        severity: 'error',
      },
      {
        name: 'should detect eval usage',
        code: `
          const code = "console.log('Hello')";
          eval(code);
          const fn = new Function('return 1');
        `,
        expectedRules: ['no-eval', 'no-new-func'],
        severity: 'error',
      },
      {
        name: 'should detect child process usage',
        code: `
          import { exec } from 'child_process';
          exec('ls -la');
        `,
        expectedRules: ['security/detect-child-process'],
        severity: 'error',
      },
      {
        name: 'should detect non-literal fs filename',
        code: `
          import { readFile } from 'fs';
          const filename = getUserInput();
          readFile(filename, callback);
        `,
        expectedRules: ['security/detect-non-literal-fs-filename'],
        severity: 'error',
      },
      {
        name: 'should detect object injection',
        code: `
          const key = getUserInput();
          const obj = {};
          obj[key] = 'value';
        `,
        expectedRules: ['security/detect-object-injection'],
        severity: 'error',
      },
      {
        name: 'should detect possible timing attacks',
        code: `
          function compareTokens(userToken: string, validToken: string) {
            return userToken === validToken;
          }
        `,
        expectedRules: ['security/detect-possible-timing-attacks'],
        severity: 'error',
      },
      {
        name: 'should detect pseudoRandomBytes usage',
        code: `
          import crypto from 'crypto';
          const bytes = crypto.pseudoRandomBytes(16);
        `,
        expectedRules: ['security/detect-pseudoRandomBytes'],
        severity: 'error',
      },
      {
        name: 'should detect any types',
        code: `
          function processData(data: any) {
            return data.someProperty;
          }
        `,
        expectedRules: ['@typescript-eslint/no-explicit-any'],
        severity: 'error',
      },
      {
        name: 'should detect unsafe assignments',
        code: `
          const data: any = getUserInput();
          const result: string = data;
        `,
        expectedRules: ['@typescript-eslint/no-unsafe-assignment'],
        severity: 'error',
      },
      {
        name: 'should detect secrets in code',
        code: `
          const apiKey = 'sk-1234567890abcdef';
          const password = 'super-secret-password-123';
          const token = 'ghp_1234567890abcdef1234567890abcdef12345';
        `,
        expectedRules: ['no-secrets/no-secrets'],
        severity: 'error',
      },
    ];

    securityTestCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const testFilePath = join(tempDir, `${testCase.name.replace(/[^a-zA-Z0-9]/g, '_')}.ts`);
        
        // Write test code to file
        await writeFile(testFilePath, testCase.code);
        
        // Run ESLint on the test file
        const results = await eslint.lintFiles([testFilePath]);
        const result = results[0];
        
        expect(result).toBeDefined();
        expect(result.messages.length).toBeGreaterThan(0);
        
        // Check that expected rules are triggered
        const triggeredRules = result.messages.map(msg => msg.ruleId).filter(Boolean);
        
        for (const expectedRule of testCase.expectedRules) {
          expect(triggeredRules).toContain(expectedRule);
        }
        
        // Check severity
        const hasExpectedSeverity = result.messages.some(msg => 
          testCase.expectedRules.includes(msg.ruleId!) &&
          (testCase.severity === 'error' ? msg.severity === 2 : msg.severity === 1)
        );
        expect(hasExpectedSeverity).toBe(true);
      });
    });
  });

  describe('Source Code Analysis', () => {
    const criticalPaths = [
      'src/core/command-parser',
      'src/commands',
      'src/services/security',
      'src/services/compliance',
    ];

    criticalPaths.forEach((path) => {
      it(`should pass security analysis for ${path}`, async () => {
        const fullPath = resolve(process.cwd(), path);
        
        try {
          // Check if path exists
          await access(fullPath);
          
          // Run ESLint on the path
          const results = await eslint.lintFiles([`${fullPath}/**/*.ts`]);
          
          // Filter for security-related errors
          const securityErrors = results.flatMap(result => 
            result.messages.filter(msg => 
              msg.severity === 2 && 
              msg.ruleId?.includes('security') ||
              msg.ruleId?.includes('no-secrets') ||
              msg.ruleId?.includes('no-unsanitized')
            )
          );
          
          // Generate report for any security errors found
          if (securityErrors.length > 0) {
            const reportPath = join(testOutputDir, `security-errors-${path.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
            await writeFile(reportPath, JSON.stringify(securityErrors, null, 2));
          }
          
          expect(securityErrors.length).toBe(0);
        } catch (error) {
          // If path doesn't exist, skip the test
          if ((error as any).code === 'ENOENT') {
            console.warn(`Path ${path} does not exist, skipping security analysis`);
            return;
          }
          throw error;
        }
      });
    });
  });

  describe('TypeScript Strict Mode', () => {
    it('should enforce strict TypeScript compilation', async () => {
      try {
        const { stdout, stderr } = await execAsync('npx tsc --noEmit --strict');
        
        // TypeScript should compile without errors in strict mode
        expect(stderr).toBe('');
        
        // Write TypeScript output to report
        if (stdout) {
          const reportPath = join(testOutputDir, 'typescript-strict-output.txt');
          await writeFile(reportPath, stdout);
        }
      } catch (error) {
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        
        // Write errors to report
        const reportPath = join(testOutputDir, 'typescript-strict-errors.txt');
        await writeFile(reportPath, errorOutput);
        
        // Fail the test if there are TypeScript errors
        expect(errorOutput).toBe('');
      }
    });

    it('should have no any types in critical modules', async () => {
      const criticalFiles = [
        'src/core/command-parser/**/*.ts',
        'src/commands/security-*.ts',
        'src/services/security/**/*.ts',
      ];
      
      for (const pattern of criticalFiles) {
        try {
          const results = await eslint.lintFiles([pattern]);
          const anyTypeErrors = results.flatMap(result =>
            result.messages.filter(msg => 
              msg.ruleId === '@typescript-eslint/no-explicit-any' && 
              msg.severity === 2
            )
          );
          
          expect(anyTypeErrors.length).toBe(0);
        } catch (error) {
          // If no files match pattern, skip
          if ((error as any).message?.includes('No files matching')) {
            continue;
          }
          throw error;
        }
      }
    });
  });

  describe('Code Quality Metrics', () => {
    it('should generate comprehensive security analysis report', async () => {
      // Run ESLint on entire source directory
      const results = await eslint.lintFiles(['src/**/*.ts']);
      
      // Calculate metrics
      const totalFiles = results.length;
      const filesWithErrors = results.filter(r => r.errorCount > 0).length;
      const filesWithWarnings = results.filter(r => r.warningCount > 0).length;
      const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
      const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
      
      // Security-specific metrics
      const securityErrors = results.flatMap(r => 
        r.messages.filter(msg => 
          msg.severity === 2 && 
          (msg.ruleId?.includes('security') || 
           msg.ruleId?.includes('no-secrets') ||
           msg.ruleId?.includes('no-unsanitized'))
        )
      );
      
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles,
          filesWithErrors,
          filesWithWarnings,
          totalErrors,
          totalWarnings,
          securityErrors: securityErrors.length,
        },
        securityFindings: securityErrors.map(error => ({
          file: results.find(r => r.messages.includes(error))?.filePath,
          rule: error.ruleId,
          message: error.message,
          line: error.line,
          column: error.column,
          severity: error.severity,
        })),
        qualityMetrics: {
          errorRate: totalErrors / totalFiles,
          warningRate: totalWarnings / totalFiles,
          securityErrorRate: securityErrors.length / totalFiles,
        },
      };
      
      // Write comprehensive report
      const reportPath = join(testOutputDir, 'security-analysis-report.json');
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Assert quality thresholds
      expect(report.summary.securityErrors).toBe(0);
      expect(report.qualityMetrics.errorRate).toBeLessThan(0.1); // < 10% files with errors
      expect(report.qualityMetrics.securityErrorRate).toBe(0); // No security errors allowed
    });
  });

  describe('Prettier Formatting', () => {
    it('should validate code formatting with Prettier', async () => {
      try {
        const { stdout, stderr } = await execAsync('npx prettier --check "src/**/*.ts"');
        
        if (stderr) {
          const reportPath = join(testOutputDir, 'prettier-errors.txt');
          await writeFile(reportPath, stderr);
        }
        
        expect(stderr).toBe('');
      } catch (error) {
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        
        // Write formatting errors to report
        const reportPath = join(testOutputDir, 'prettier-format-errors.txt');
        await writeFile(reportPath, errorOutput);
        
        // In CI, fail on formatting errors; locally, just warn
        if (process.env.CI === 'true') {
          expect(errorOutput).toBe('');
        } else {
          console.warn('Prettier formatting issues found. Run `npm run format` to fix.');
        }
      }
    });
  });
});

// Helper functions for test setup
async function createTestFile(filename: string, content: string): Promise<string> {
  const testOutputDir = resolve(process.cwd(), 'test-output/static-analysis/temp');
  await mkdir(testOutputDir, { recursive: true });
  
  const filePath = join(testOutputDir, filename);
  await writeFile(filePath, content);
  return filePath;
}

export { createTestFile };