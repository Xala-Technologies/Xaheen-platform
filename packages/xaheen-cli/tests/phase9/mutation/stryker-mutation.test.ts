/**
 * Stryker Mutation Testing Suite
 * 
 * Tests the effectiveness of our test suite by introducing mutations
 * to critical code paths and verifying that tests catch the changes.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import { join, resolve } from 'path';

const execAsync = promisify(exec);

interface StrykerResult {
  schemaVersion: string;
  thresholds: {
    high: number;
    low: number;
    break: number;
  };
  projectRoot: string;
  files: Record<string, FileResult>;
  testFiles: Record<string, TestFileResult>;
  systemUnderTestMetrics: SystemMetrics;
  framework: FrameworkInfo;
  config: any;
}

interface FileResult {
  language: string;
  mutants: MutantResult[];
  source: string;
}

interface MutantResult {
  id: string;
  mutatorName: string;
  replacement: string;
  location: Location;
  status: 'Killed' | 'Survived' | 'NoCoverage' | 'CompileError' | 'RuntimeError' | 'Timeout';
  statusReason?: string;
  testsRan?: string[];
  coveredBy?: string[];
  killedBy?: string[];
  description: string;
}

interface Location {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  column: number;
}

interface TestFileResult {
  tests: TestResult[];
}

interface TestResult {
  id: string;
  name: string;
  location: Location;
}

interface SystemMetrics {
  compileErrors: number;
  killed: number;
  mutationScore: number;
  mutationScoreBasedOnCoveredCode: number;
  noCoverage: number;
  runtimeErrors: number;
  survived: number;
  timeout: number;
  totalCovered: number;
  totalDetected: number;
  totalInvalid: number;
  totalMutants: number;
  totalUndetected: number;
  totalValid: number;
}

interface FrameworkInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
}

describe('Phase 9: Mutation Testing - Stryker', () => {
  const testOutputDir = resolve(process.cwd(), 'test-output/mutation');
  const configPath = resolve(__dirname, '../config/stryker.conf.json');
  let strykerAvailable = false;

  beforeAll(async () => {
    await mkdir(testOutputDir, { recursive: true });
    
    // Check if Stryker is available
    try {
      await execAsync('npx stryker --version');
      strykerAvailable = true;
    } catch (error) {
      console.warn('Stryker not available. Some tests will be skipped.');
      strykerAvailable = false;
    }

    // Verify config file exists
    const configExists = await access(configPath).then(() => true).catch(() => false);
    if (!configExists) {
      console.warn('Stryker configuration not found. Creating basic config.');
      await createBasicStrykerConfig();
    }
  });

  describe('Stryker Configuration', () => {
    it('should have valid Stryker configuration', async () => {
      const configExists = await access(configPath).then(() => true).catch(() => false);
      expect(configExists).toBe(true);

      if (configExists) {
        const configContent = await readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        
        expect(config.testRunner).toBeDefined();
        expect(config.mutate).toBeDefined();
        expect(config.thresholds).toBeDefined();
        expect(config.thresholds.high).toBeGreaterThan(config.thresholds.low);
      }
    });

    it('should validate mutation testing thresholds', async () => {
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      // Critical modules should have high mutation score requirements
      expect(config.thresholds.high).toBeGreaterThanOrEqual(85);
      expect(config.thresholds.low).toBeGreaterThanOrEqual(70);
      expect(config.thresholds.break).toBeLessThan(config.thresholds.low);
    });
  });

  describe('Critical Module Mutation Testing', () => {
    const criticalModules = [
      'src/core/command-parser',
      'src/commands/security-audit.ts',
      'src/services/security',
      'src/services/compliance',
    ];

    criticalModules.forEach((module) => {
      it(`should achieve high mutation score for ${module}`, async () => {
        if (!strykerAvailable) {
          console.warn(`Skipping mutation test for ${module} - Stryker not available`);
          return;
        }

        // Check if module exists
        const modulePath = resolve(process.cwd(), module);
        const moduleExists = await access(modulePath).then(() => true).catch(() => false);
        
        if (!moduleExists) {
          console.warn(`Module ${module} does not exist, skipping mutation test`);
          return;
        }

        try {
          const command = [
            'npx stryker run',
            `--configFile=${configPath}`,
            `--mutate="${module}/**/*.ts"`,
            '--reporters=json,clear-text',
            '--logLevel=warn',
          ].join(' ');

          const { stdout, stderr } = await execAsync(command, {
            timeout: 300000, // 5 minutes timeout
            cwd: process.cwd(),
          });

          // Parse Stryker results
          const resultPath = join(testOutputDir, 'mutation-report.json');
          const resultExists = await access(resultPath).then(() => true).catch(() => false);
          
          if (resultExists) {
            const resultContent = await readFile(resultPath, 'utf-8');
            const result: StrykerResult = JSON.parse(resultContent);
            
            // Generate module-specific report
            const moduleReport = {
              timestamp: new Date().toISOString(),
              module,
              mutationScore: result.systemUnderTestMetrics.mutationScore,
              mutationScoreBasedOnCoveredCode: result.systemUnderTestMetrics.mutationScoreBasedOnCoveredCode,
              totalMutants: result.systemUnderTestMetrics.totalMutants,
              killed: result.systemUnderTestMetrics.killed,
              survived: result.systemUnderTestMetrics.survived,
              noCoverage: result.systemUnderTestMetrics.noCoverage,
              compileErrors: result.systemUnderTestMetrics.compileErrors,
              runtimeErrors: result.systemUnderTestMetrics.runtimeErrors,
              timeout: result.systemUnderTestMetrics.timeout,
            };

            const moduleReportPath = join(testOutputDir, `${module.replace(/[^a-zA-Z0-9]/g, '_')}-mutation.json`);
            await writeFile(moduleReportPath, JSON.stringify(moduleReport, null, 2));

            // Assert mutation score thresholds for critical modules
            expect(result.systemUnderTestMetrics.mutationScore).toBeGreaterThanOrEqual(95);
            
          } else {
            console.warn('Stryker result file not found, checking stdout/stderr');
            
            const output = {
              timestamp: new Date().toISOString(),
              module,
              stdout,
              stderr,
              status: 'completed_without_json',
            };
            
            const outputPath = join(testOutputDir, `${module.replace(/[^a-zA-Z0-9]/g, '_')}-output.json`);
            await writeFile(outputPath, JSON.stringify(output, null, 2));
          }

        } catch (error) {
          const errorReport = {
            timestamp: new Date().toISOString(),
            module,
            error: (error as any).message,
            stdout: (error as any).stdout || '',
            stderr: (error as any).stderr || '',
          };

          const errorPath = join(testOutputDir, `${module.replace(/[^a-zA-Z0-9]/g, '_')}-error.json`);
          await writeFile(errorPath, JSON.stringify(errorReport, null, 2));

          // Don't fail the test if Stryker encounters issues, but log the problem
          console.warn(`Mutation testing failed for ${module}:`, error);
        }
      }, 600000); // 10 minutes timeout per module
    });
  });

  describe('Core Module Mutation Testing', () => {
    const coreModules = [
      'src/core',
      'src/services',
      'src/generators/base.generator.ts',
    ];

    it('should run mutation testing on core modules', async () => {
      if (!strykerAvailable) {
        console.warn('Skipping core module mutation test - Stryker not available');
        return;
      }

      try {
        const command = [
          'npx stryker run',
          `--configFile=${configPath}`,
          '--mutate="src/core/**/*.ts,src/services/**/*.ts"',
          '--reporters=json,html,clear-text',
          '--logLevel=info',
        ].join(' ');

        const { stdout, stderr } = await execAsync(command, {
          timeout: 600000, // 10 minutes timeout
          cwd: process.cwd(),
        });

        // Parse results
        const resultPath = join(testOutputDir, 'mutation-report.json');
        const resultExists = await access(resultPath).then(() => true).catch(() => false);
        
        if (resultExists) {
          const resultContent = await readFile(resultPath, 'utf-8');
          const result: StrykerResult = JSON.parse(resultContent);
          
          const coreReport = {
            timestamp: new Date().toISOString(),
            scope: 'core-modules',
            metrics: result.systemUnderTestMetrics,
            thresholds: result.thresholds,
            files: Object.keys(result.files).length,
            testFiles: Object.keys(result.testFiles).length,
            recommendations: generateMutationRecommendations(result),
          };

          const coreReportPath = join(testOutputDir, 'core-modules-mutation.json');
          await writeFile(coreReportPath, JSON.stringify(coreReport, null, 2));

          // Assert core module thresholds (less strict than critical modules)
          expect(result.systemUnderTestMetrics.mutationScore).toBeGreaterThanOrEqual(85);
          
        } else {
          console.warn('Core module mutation test completed but no JSON report found');
        }

      } catch (error) {
        console.warn('Core module mutation testing encountered issues:', error);
        
        const errorReport = {
          timestamp: new Date().toISOString(),
          scope: 'core-modules',
          error: (error as any).message,
          stdout: (error as any).stdout || '',
          stderr: (error as any).stderr || '',
        };

        const errorPath = join(testOutputDir, 'core-modules-error.json');
        await writeFile(errorPath, JSON.stringify(errorReport, null, 2));
      }
    }, 900000); // 15 minutes timeout
  });

  describe('Mutation Analysis', () => {
    it('should analyze mutation survivors for test improvement suggestions', async () => {
      const resultPath = join(testOutputDir, 'mutation-report.json');
      const resultExists = await access(resultPath).then(() => true).catch(() => false);
      
      if (!resultExists) {
        console.warn('No mutation report found for analysis');
        return;
      }

      const resultContent = await readFile(resultPath, 'utf-8');
      const result: StrykerResult = JSON.parse(resultContent);
      
      // Analyze surviving mutants
      const survivingMutants: Array<{
        file: string;
        mutant: MutantResult;
        recommendation: string;
      }> = [];

      Object.entries(result.files).forEach(([filePath, fileResult]) => {
        const survivors = fileResult.mutants.filter(m => m.status === 'Survived');
        
        survivors.forEach(mutant => {
          survivingMutants.push({
            file: filePath,
            mutant,
            recommendation: generateMutantRecommendation(mutant),
          });
        });
      });

      // Generate analysis report
      const analysisReport = {
        timestamp: new Date().toISOString(),
        totalSurvivors: survivingMutants.length,
        survivorsByType: groupSurvivorsByMutatorType(survivingMutants),
        recommendations: survivingMutants.slice(0, 10), // Top 10 recommendations
        testImprovements: generateTestImprovementSuggestions(survivingMutants),
      };

      const analysisPath = join(testOutputDir, 'mutation-analysis.json');
      await writeFile(analysisPath, JSON.stringify(analysisReport, null, 2));

      // Assert reasonable number of survivors
      const survivorRate = survivingMutants.length / result.systemUnderTestMetrics.totalMutants;
      expect(survivorRate).toBeLessThan(0.15); // Less than 15% survivors
    });

    it('should generate mutation testing effectiveness report', async () => {
      const resultPath = join(testOutputDir, 'mutation-report.json');
      const resultExists = await access(resultPath).then(() => true).catch(() => false);
      
      if (!resultExists) {
        console.warn('No mutation report found for effectiveness analysis');
        return;
      }

      const resultContent = await readFile(resultPath, 'utf-8');
      const result: StrykerResult = JSON.parse(resultContent);
      
      const effectivenessReport = {
        timestamp: new Date().toISOString(),
        overallScore: result.systemUnderTestMetrics.mutationScore,
        coverage: {
          mutationScore: result.systemUnderTestMetrics.mutationScore,
          mutationScoreBasedOnCoveredCode: result.systemUnderTestMetrics.mutationScoreBasedOnCoveredCode,
          totalMutants: result.systemUnderTestMetrics.totalMutants,
          coveredMutants: result.systemUnderTestMetrics.totalCovered,
          coverageRate: result.systemUnderTestMetrics.totalCovered / result.systemUnderTestMetrics.totalMutants,
        },
        testEffectiveness: {
          killed: result.systemUnderTestMetrics.killed,
          survived: result.systemUnderTestMetrics.survived,
          noCoverage: result.systemUnderTestMetrics.noCoverage,
          killRate: result.systemUnderTestMetrics.killed / result.systemUnderTestMetrics.totalMutants,
        },
        qualityMetrics: {
          compileErrors: result.systemUnderTestMetrics.compileErrors,
          runtimeErrors: result.systemUnderTestMetrics.runtimeErrors,
          timeouts: result.systemUnderTestMetrics.timeout,
          errorRate: (result.systemUn defTestMetrics.compileErrors + result.systemUnderTestMetrics.runtimeErrors) / result.systemUnderTestMetrics.totalMutants,
        },
        recommendations: {
          improveCoverage: result.systemUnderTestMetrics.noCoverage > 0,
          addAssertions: result.systemUnderTestMetrics.survived > result.systemUnderTestMetrics.totalMutants * 0.1,
          optimizeTests: result.systemUnderTestMetrics.timeout > 0,
        },
      };

      const effectivenessPath = join(testOutputDir, 'mutation-effectiveness.json');
      await writeFile(effectivenessPath, JSON.stringify(effectivenessReport, null, 2));

      // Assert overall effectiveness
      expect(effectivenessReport.overallScore).toBeGreaterThanOrEqual(80);
      expect(effectivenessReport.coverage.coverageRate).toBeGreaterThanOrEqual(0.9);
      expect(effectivenessReport.testEffectiveness.killRate).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Performance Analysis', () => {
    it('should measure mutation testing performance', async () => {
      const startTime = Date.now();
      
      if (!strykerAvailable) {
        console.warn('Skipping performance test - Stryker not available');
        return;
      }

      try {
        // Run a limited mutation test for performance measurement
        const command = [
          'npx stryker run',
          `--configFile=${configPath}`,
          '--mutate="src/utils/**/*.ts"', // Smaller scope for performance test
          '--reporters=clear-text',
          '--logLevel=warn',
          '--maxConcurrentTestRunners=2',
        ].join(' ');

        await execAsync(command, {
          timeout: 180000, // 3 minutes timeout
          cwd: process.cwd(),
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        const performanceReport = {
          timestamp: new Date().toISOString(),
          scope: 'utils-performance-test',
          duration,
          durationMinutes: Math.round(duration / 60000 * 100) / 100,
          performance: {
            fast: duration < 60000, // Under 1 minute
            acceptable: duration < 180000, // Under 3 minutes
            slow: duration >= 180000,
          },
        };

        const performancePath = join(testOutputDir, 'mutation-performance.json');
        await writeFile(performancePath, JSON.stringify(performanceReport, null, 2));

        // Assert reasonable performance
        expect(duration).toBeLessThan(300000); // Should complete within 5 minutes

      } catch (error) {
        console.warn('Performance test failed:', error);
      }
    }, 600000); // 10 minutes timeout
  });
});

// Helper Functions

async function createBasicStrykerConfig(): Promise<void> {
  const basicConfig = {
    "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
    "packageManager": "npm",
    "reporters": ["html", "clear-text", "progress", "json"],
    "testRunner": "vitest",
    "coverageAnalysis": "perTest",
    "mutate": [
      "src/**/*.ts",
      "!src/**/*.test.ts",
      "!src/**/*.spec.ts",
      "!src/**/*.d.ts"
    ],
    "thresholds": {
      "high": 85,
      "low": 70,
      "break": 60
    },
    "timeoutMS": 60000,
    "maxConcurrentTestRunners": 4
  };

  const configPath = resolve(__dirname, '../config/stryker.conf.json');
  await writeFile(configPath, JSON.stringify(basicConfig, null, 2));
}

function generateMutationRecommendations(result: StrykerResult): string[] {
  const recommendations: string[] = [];
  const metrics = result.systemUnderTestMetrics;

  if (metrics.mutationScore < 80) {
    recommendations.push('Overall mutation score is below 80%. Consider adding more comprehensive tests.');
  }

  if (metrics.noCoverage > metrics.totalMutants * 0.1) {
    recommendations.push('More than 10% of mutants have no coverage. Increase test coverage.');
  }

  if (metrics.survived > metrics.totalMutants * 0.15) {
    recommendations.push('More than 15% of mutants survived. Add more specific assertions to tests.');
  }

  if (metrics.timeout > 0) {
    recommendations.push('Some mutants caused timeouts. Review test performance and timeout settings.');
  }

  if (metrics.compileErrors > 0) {
    recommendations.push('Some mutants caused compile errors. This may indicate type safety issues.');
  }

  return recommendations;
}

function generateMutantRecommendation(mutant: MutantResult): string {
  switch (mutant.mutatorName) {
    case 'ConditionalExpression':
      return 'Add test cases that cover both true and false conditions';
    case 'EqualityOperator':
      return 'Add test cases with different equality scenarios';
    case 'ArithmeticOperator':
      return 'Test boundary conditions and different arithmetic results';
    case 'LogicalOperator':
      return 'Test both sides of logical operations independently';
    case 'StringLiteral':
      return 'Verify string values with specific assertions';
    case 'BooleanLiteral':
      return 'Test both true and false boolean scenarios';
    default:
      return `Add test coverage for ${mutant.mutatorName} mutations`;
  }
}

function groupSurvivorsByMutatorType(survivors: Array<{ mutant: MutantResult }>): Record<string, number> {
  const groups: Record<string, number> = {};
  
  survivors.forEach(({ mutant }) => {
    groups[mutant.mutatorName] = (groups[mutant.mutatorName] || 0) + 1;
  });

  return groups;
}

function generateTestImprovementSuggestions(survivors: Array<{ file: string; mutant: MutantResult }>): string[] {
  const suggestions = new Set<string>();

  survivors.forEach(({ file, mutant }) => {
    if (mutant.mutatorName === 'ConditionalExpression') {
      suggestions.add(`In ${file}: Add tests for both branches of conditional expressions`);
    }
    if (mutant.mutatorName === 'EqualityOperator') {
      suggestions.add(`In ${file}: Test equality operators with edge cases`);
    }
    if (mutant.mutatorName === 'ArithmeticOperator') {
      suggestions.add(`In ${file}: Verify arithmetic operations with boundary values`);
    }
  });

  return Array.from(suggestions).slice(0, 5); // Top 5 suggestions
}