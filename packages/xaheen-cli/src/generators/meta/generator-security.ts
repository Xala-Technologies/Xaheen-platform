/**
 * Generator Security Scanner - Advanced security analysis and sandboxing
 * Provides vulnerability scanning, static analysis, and runtime sandboxing
 */
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
import {
  GeneratorRegistryEntry,
  SecurityVulnerability,
  SecurityScanResult,
  SandboxOptions,
  SecurityPolicy
} from './types';
import chalk from 'chalk';

export interface SecurityScannerConfig {
  readonly enabled: boolean;
  readonly strictMode: boolean;
  readonly sandboxEnabled: boolean;
  readonly scanTimeout: number; // milliseconds
  readonly maxMemoryUsage: number; // MB
  readonly allowedModules: readonly string[];
  readonly blockedPatterns: readonly RegExp[];
  readonly policies: SecurityPolicy[];
}

export interface StaticAnalysisResult {
  readonly vulnerabilities: readonly SecurityVulnerability[];
  readonly riskyPatterns: readonly RiskyPattern[];
  readonly dependencyIssues: readonly DependencyIssue[];
  readonly codeQuality: CodeQualityIssue[];
  readonly score: number; // 0-100
}

export interface RiskyPattern {
  readonly type: 'code-execution' | 'file-system' | 'network' | 'environment';
  readonly pattern: string;
  readonly location: string;
  readonly line: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly mitigation: string;
}

export interface DependencyIssue {
  readonly package: string;
  readonly version: string;
  readonly vulnerability: SecurityVulnerability;
  readonly patchAvailable: boolean;
  readonly patchVersion?: string;
}

export interface CodeQualityIssue {
  readonly type: 'complexity' | 'maintainability' | 'reliability' | 'security';
  readonly message: string;
  readonly location: string;
  readonly line: number;
  readonly severity: 'info' | 'warning' | 'error';
  readonly rule: string;
}

export interface SandboxResult {
  readonly success: boolean;
  readonly output: any;
  readonly errors: readonly string[];
  readonly resourceUsage: ResourceUsage;
  readonly executionTime: number;
  readonly violations: readonly SecurityViolation[];
}

export interface ResourceUsage {
  readonly memory: number; // bytes
  readonly cpu: number; // percentage
  readonly fileSystemReads: number;
  readonly fileSystemWrites: number;
  readonly networkRequests: number;
}

export interface SecurityViolation {
  readonly type: 'unauthorized-access' | 'resource-limit' | 'policy-violation';
  readonly description: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly timestamp: Date;
  readonly context: Record<string, any>;
}

export class GeneratorSecurityScanner extends EventEmitter {
  private config: SecurityScannerConfig;
  private vulnerabilityDatabase: Map<string, SecurityVulnerability[]> = new Map();
  private scanResults = new Map<string, SecurityScanResult>();
  private workers = new Map<string, Worker>();

  constructor(config?: Partial<SecurityScannerConfig>) {
    super();
    
    this.config = {
      enabled: true,
      strictMode: true,
      sandboxEnabled: true,
      scanTimeout: 30000, // 30 seconds
      maxMemoryUsage: 256, // 256 MB
      allowedModules: [
        'path',
        'fs',
        'util',
        'crypto',
        'os',
        'events',
        'stream',
        'buffer',
        'string_decoder',
        'querystring',
        'url'
      ],
      blockedPatterns: [
        /eval\s*\(/,
        /Function\s*\(/,
        /process\.exit/,
        /child_process/,
        /cluster/,
        /vm\./,
        /require\s*\(\s*['"`][\w\-\.\/]+['"`]\s*\)/,
        /import\s*\(\s*['"`][\w\-\.\/]+['"`]\s*\)/,
        /\.\.\/.*\.\./,
        /\/etc\/passwd/,
        /\/proc\//,
        /\/dev\//
      ],
      policies: [
        {
          name: 'no-eval',
          description: 'Prohibit use of eval() and Function() constructor',
          severity: 'critical',
          enabled: true
        },
        {
          name: 'no-process-exit',
          description: 'Prohibit calling process.exit()',
          severity: 'high',
          enabled: true
        },
        {
          name: 'limited-fs-access',
          description: 'Restrict file system access to allowed paths',
          severity: 'medium',
          enabled: true
        },
        {
          name: 'no-network-access',
          description: 'Prohibit network requests in templates',
          severity: 'medium',
          enabled: false
        }
      ],
      ...config
    };

    this.setupSecurityScanner();
  }

  /**
   * Setup security scanner
   */
  private async setupSecurityScanner(): Promise<void> {
    if (!this.config.enabled) return;

    // Load vulnerability database
    await this.loadVulnerabilityDatabase();

    console.log('🔒 Generator Security Scanner initialized');
  }

  /**
   * Scan generator for security issues
   */
  async scanGenerator(entry: GeneratorRegistryEntry): Promise<SecurityScanResult> {
    if (!this.config.enabled) {
      return {
        generatorId: entry.metadata.id,
        scannedAt: new Date(),
        passed: true,
        score: 100,
        vulnerabilities: [],
        staticAnalysis: {
          vulnerabilities: [],
          riskyPatterns: [],
          dependencyIssues: [],
          codeQuality: [],
          score: 100
        },
        dynamicAnalysis: null,
        recommendations: []
      };
    }

    console.log(`🔍 Scanning generator for security issues: ${chalk.cyan(entry.metadata.name)}`);

    const startTime = Date.now();

    try {
      // Perform static analysis
      const staticAnalysis = await this.performStaticAnalysis(entry);

      // Perform dynamic analysis if enabled
      let dynamicAnalysis: SandboxResult | null = null;
      if (this.config.sandboxEnabled) {
        dynamicAnalysis = await this.performDynamicAnalysis(entry);
      }

      // Calculate overall security score
      const score = this.calculateSecurityScore(staticAnalysis, dynamicAnalysis);

      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(staticAnalysis, dynamicAnalysis);

      // Combine all vulnerabilities
      const allVulnerabilities = [
        ...staticAnalysis.vulnerabilities,
        ...(dynamicAnalysis?.violations.map(v => this.violationToVulnerability(v)) || [])
      ];

      const result: SecurityScanResult = {
        generatorId: entry.metadata.id,
        scannedAt: new Date(),
        passed: score >= 70 && allVulnerabilities.filter(v => v.severity === 'critical').length === 0,
        score,
        vulnerabilities: allVulnerabilities,
        staticAnalysis,
        dynamicAnalysis,
        recommendations
      };

      // Cache result
      this.scanResults.set(entry.metadata.id, result);

      // Log results
      this.logScanResults(result, Date.now() - startTime);

      // Emit events
      this.emit('scan:completed', { generatorId: entry.metadata.id, result });

      if (!result.passed) {
        this.emit('scan:failed', { generatorId: entry.metadata.id, result });
      }

      return result;

    } catch (error: any) {
      const errorResult: SecurityScanResult = {
        generatorId: entry.metadata.id,
        scannedAt: new Date(),
        passed: false,
        score: 0,
        vulnerabilities: [{
          id: 'scan-error',
          severity: 'high',
          type: 'scan-failure',
          description: `Security scan failed: ${error.message}`,
          affectedComponent: 'scanner',
          discoveredAt: new Date(),
          cwe: 'CWE-754',
          cvss: 5.0
        }],
        staticAnalysis: {
          vulnerabilities: [],
          riskyPatterns: [],
          dependencyIssues: [],
          codeQuality: [],
          score: 0
        },
        dynamicAnalysis: null,
        recommendations: ['Fix scanning errors before proceeding']
      };

      this.scanResults.set(entry.metadata.id, errorResult);
      this.emit('scan:error', { generatorId: entry.metadata.id, error });

      return errorResult;
    }
  }

  /**
   * Perform static code analysis
   */
  private async performStaticAnalysis(entry: GeneratorRegistryEntry): Promise<StaticAnalysisResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const riskyPatterns: RiskyPattern[] = [];
    const dependencyIssues: DependencyIssue[] = [];
    const codeQuality: CodeQualityIssue[] = [];

    // Analyze implementation file
    if (entry.implementation) {
      const implementationIssues = await this.analyzeFile(entry.implementation);
      riskyPatterns.push(...implementationIssues.patterns);
      codeQuality.push(...implementationIssues.quality);
    }

    // Analyze template files
    for (const template of entry.templates) {
      if (template.path && await this.fileExists(template.path)) {
        const templateIssues = await this.analyzeFile(template.path);
        riskyPatterns.push(...templateIssues.patterns);
        codeQuality.push(...templateIssues.quality);
      }
    }

    // Check dependencies for known vulnerabilities
    for (const dep of entry.metadata.dependencies) {
      const depVulnerabilities = this.vulnerabilityDatabase.get(dep.id) || [];
      for (const vuln of depVulnerabilities) {
        if (this.versionMatches(dep.version, vuln.affectedVersions || [])) {
          dependencyIssues.push({
            package: dep.id,
            version: dep.version,
            vulnerability: vuln,
            patchAvailable: !!vuln.fixedIn,
            patchVersion: vuln.fixedIn
          });
        }
      }
    }

    // Convert dependency issues to vulnerabilities
    vulnerabilities.push(...dependencyIssues.map(issue => issue.vulnerability));

    // Convert risky patterns to vulnerabilities
    const criticalPatterns = riskyPatterns.filter(p => p.severity === 'critical');
    vulnerabilities.push(...criticalPatterns.map(pattern => ({
      id: `pattern-${pattern.type}-${Date.now()}`,
      severity: pattern.severity,
      type: pattern.type,
      description: pattern.description,
      affectedComponent: pattern.location,
      discoveredAt: new Date(),
      cwe: this.getCWEForPattern(pattern.type),
      cvss: this.getCVSSForSeverity(pattern.severity)
    } as SecurityVulnerability)));

    // Calculate static analysis score
    const score = this.calculateStaticAnalysisScore(vulnerabilities, riskyPatterns, codeQuality);

    return {
      vulnerabilities,
      riskyPatterns,
      dependencyIssues,
      codeQuality,
      score
    };
  }

  /**
   * Analyze a single file for security issues
   */
  private async analyzeFile(filePath: string): Promise<{
    patterns: RiskyPattern[];
    quality: CodeQualityIssue[];
  }> {
    const patterns: RiskyPattern[] = [];
    const quality: CodeQualityIssue[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Check for blocked patterns
        for (const blockedPattern of this.config.blockedPatterns) {
          if (blockedPattern.test(line)) {
            patterns.push({
              type: this.getPatternType(blockedPattern),
              pattern: blockedPattern.source,
              location: filePath,
              line: lineNumber,
              severity: this.getPatternSeverity(blockedPattern),
              description: `Potentially dangerous pattern detected: ${blockedPattern.source}`,
              mitigation: this.getPatternMitigation(blockedPattern)
            });
          }
        }

        // Check for code quality issues
        if (line.length > 120) {
          quality.push({
            type: 'maintainability',
            message: 'Line too long (>120 characters)',
            location: filePath,
            line: lineNumber,
            severity: 'warning',
            rule: 'max-line-length'
          });
        }

        if (line.includes('TODO') || line.includes('FIXME')) {
          quality.push({
            type: 'maintainability',
            message: 'TODO/FIXME comment found',
            location: filePath,
            line: lineNumber,
            severity: 'info',
            rule: 'no-todo-comments'
          });
        }

        if (line.includes('console.log') && !line.includes('//')) {
          quality.push({
            type: 'maintainability',
            message: 'Console.log statement should be removed',
            location: filePath,
            line: lineNumber,
            severity: 'warning',
            rule: 'no-console'
          });
        }
      }

      // Check for complexity issues
      const functionCount = (content.match(/function\s+\w+/g) || []).length;
      const classCount = (content.match(/class\s+\w+/g) || []).length;

      if (functionCount > 20) {
        quality.push({
          type: 'complexity',
          message: `High function count: ${functionCount} functions in single file`,
          location: filePath,
          line: 1,
          severity: 'warning',
          rule: 'max-functions-per-file'
        });
      }

      if (content.length > 50000) {
        quality.push({
          type: 'maintainability',
          message: `File is very large: ${content.length} characters`,
          location: filePath,
          line: 1,
          severity: 'warning',
          rule: 'max-file-size'
        });
      }

    } catch (error: any) {
      quality.push({
        type: 'reliability',
        message: `Failed to analyze file: ${error.message}`,
        location: filePath,
        line: 1,
        severity: 'error',
        rule: 'file-analysis-error'
      });
    }

    return { patterns, quality };
  }

  /**
   * Perform dynamic analysis in sandbox
   */
  private async performDynamicAnalysis(entry: GeneratorRegistryEntry): Promise<SandboxResult> {
    return new Promise((resolve, reject) => {
      const workerId = `sandbox-${entry.metadata.id}-${Date.now()}`;
      
      // Create sandbox worker
      const worker = new Worker(path.join(__dirname, 'sandbox-worker.js'), {
        workerData: {
          generatorPath: entry.implementation,
          options: {
            timeout: this.config.scanTimeout,
            maxMemory: this.config.maxMemoryUsage,
            allowedModules: this.config.allowedModules
          }
        }
      });

      this.workers.set(workerId, worker);

      const startTime = Date.now();
      let resolved = false;

      // Set timeout
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          worker.terminate();
          this.workers.delete(workerId);
          resolve({
            success: false,
            output: null,
            errors: ['Execution timeout'],
            resourceUsage: {
              memory: 0,
              cpu: 0,
              fileSystemReads: 0,
              fileSystemWrites: 0,
              networkRequests: 0
            },
            executionTime: this.config.scanTimeout,
            violations: [{
              type: 'resource-limit',
              description: 'Execution timed out',
              severity: 'medium',
              timestamp: new Date(),
              context: { timeout: this.config.scanTimeout }
            }]
          });
        }
      }, this.config.scanTimeout);

      worker.on('message', (result: SandboxResult) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          worker.terminate();
          this.workers.delete(workerId);
          resolve({
            ...result,
            executionTime: Date.now() - startTime
          });
        }
      });

      worker.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          worker.terminate();
          this.workers.delete(workerId);
          resolve({
            success: false,
            output: null,
            errors: [error.message],
            resourceUsage: {
              memory: 0,
              cpu: 0,
              fileSystemReads: 0,
              fileSystemWrites: 0,
              networkRequests: 0
            },
            executionTime: Date.now() - startTime,
            violations: [{
              type: 'policy-violation',
              description: `Worker error: ${error.message}`,
              severity: 'high',
              timestamp: new Date(),
              context: { error: error.message }
            }]
          });
        }
      });

      // Start sandbox execution
      worker.postMessage({ action: 'execute' });
    });
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(
    staticAnalysis: StaticAnalysisResult,
    dynamicAnalysis: SandboxResult | null
  ): number {
    let score = 100;

    // Penalize based on static analysis
    score = Math.min(score, staticAnalysis.score);

    // Penalize based on dynamic analysis
    if (dynamicAnalysis) {
      const criticalViolations = dynamicAnalysis.violations.filter(v => v.severity === 'critical').length;
      const highViolations = dynamicAnalysis.violations.filter(v => v.severity === 'high').length;
      const mediumViolations = dynamicAnalysis.violations.filter(v => v.severity === 'medium').length;

      score -= (criticalViolations * 30 + highViolations * 15 + mediumViolations * 5);
    }

    return Math.max(0, score);
  }

  /**
   * Calculate static analysis score
   */
  private calculateStaticAnalysisScore(
    vulnerabilities: readonly SecurityVulnerability[],
    riskyPatterns: readonly RiskyPattern[],
    codeQuality: readonly CodeQualityIssue[]
  ): number {
    let score = 100;

    // Penalize vulnerabilities
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium').length;

    score -= (criticalVulns * 25 + highVulns * 15 + mediumVulns * 5);

    // Penalize risky patterns
    const criticalPatterns = riskyPatterns.filter(p => p.severity === 'critical').length;
    const highPatterns = riskyPatterns.filter(p => p.severity === 'high').length;

    score -= (criticalPatterns * 20 + highPatterns * 10);

    // Penalize code quality issues
    const errors = codeQuality.filter(q => q.severity === 'error').length;
    const warnings = codeQuality.filter(q => q.severity === 'warning').length;

    score -= (errors * 5 + warnings * 2);

    return Math.max(0, score);
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    staticAnalysis: StaticAnalysisResult,
    dynamicAnalysis: SandboxResult | null
  ): string[] {
    const recommendations: string[] = [];

    // Static analysis recommendations
    if (staticAnalysis.vulnerabilities.length > 0) {
      const criticalVulns = staticAnalysis.vulnerabilities.filter(v => v.severity === 'critical');
      if (criticalVulns.length > 0) {
        recommendations.push(`Address ${criticalVulns.length} critical security vulnerabilities immediately`);
      }
    }

    if (staticAnalysis.dependencyIssues.length > 0) {
      const patchable = staticAnalysis.dependencyIssues.filter(d => d.patchAvailable);
      if (patchable.length > 0) {
        recommendations.push(`Update ${patchable.length} dependencies with available security patches`);
      }
    }

    if (staticAnalysis.riskyPatterns.length > 0) {
      const codeExecution = staticAnalysis.riskyPatterns.filter(p => p.type === 'code-execution');
      if (codeExecution.length > 0) {
        recommendations.push('Remove or secure code execution patterns (eval, Function constructor)');
      }
    }

    // Dynamic analysis recommendations
    if (dynamicAnalysis && !dynamicAnalysis.success) {
      recommendations.push('Fix runtime errors that prevent safe execution');
    }

    if (dynamicAnalysis?.violations.length && dynamicAnalysis.violations.length > 0) {
      const unauthorizedAccess = dynamicAnalysis.violations.filter(v => v.type === 'unauthorized-access');
      if (unauthorizedAccess.length > 0) {
        recommendations.push('Remove unauthorized file system or network access');
      }
    }

    // General recommendations
    if (staticAnalysis.score < 70) {
      recommendations.push('Improve code quality and remove security anti-patterns');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security scan passed - consider regular re-scanning as dependencies change');
    }

    return recommendations;
  }

  /**
   * Load vulnerability database
   */
  private async loadVulnerabilityDatabase(): Promise<void> {
    try {
      const dbPath = path.join(__dirname, '../../../data/vulnerabilities.json');
      const dbData = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
      
      for (const [packageName, vulnerabilities] of Object.entries(dbData)) {
        this.vulnerabilityDatabase.set(packageName, vulnerabilities as SecurityVulnerability[]);
      }

      console.log(`🛡️  Loaded ${this.vulnerabilityDatabase.size} package vulnerability entries`);
    } catch {
      // Create minimal vulnerability database if file doesn't exist
      this.createMinimalVulnerabilityDatabase();
    }
  }

  /**
   * Create minimal vulnerability database
   */
  private createMinimalVulnerabilityDatabase(): void {
    const commonVulnerabilities = new Map<string, SecurityVulnerability[]>([
      ['lodash', [{
        id: 'CVE-2020-8203',
        severity: 'high',
        type: 'prototype-pollution',
        description: 'Prototype pollution in lodash',
        affectedComponent: 'lodash',
        discoveredAt: new Date('2020-07-15'),
        cwe: 'CWE-1321',
        cvss: 7.4,
        affectedVersions: ['<4.17.19'],
        fixedIn: '4.17.19'
      }]],
      ['axios', [{
        id: 'CVE-2021-3749',
        severity: 'medium',
        type: 'request-smuggling',
        description: 'HTTP request smuggling in axios',
        affectedComponent: 'axios',
        discoveredAt: new Date('2021-08-31'),
        cwe: 'CWE-444',
        cvss: 5.6,
        affectedVersions: ['<0.21.2'],
        fixedIn: '0.21.2'
      }]]
    ]);

    this.vulnerabilityDatabase = commonVulnerabilities;
  }

  /**
   * Helper methods for pattern analysis
   */
  private getPatternType(pattern: RegExp): RiskyPattern['type'] {
    const source = pattern.source;
    if (source.includes('eval') || source.includes('Function')) return 'code-execution';
    if (source.includes('fs') || source.includes('file')) return 'file-system';
    if (source.includes('http') || source.includes('net')) return 'network';
    if (source.includes('process') || source.includes('env')) return 'environment';
    return 'code-execution';
  }

  private getPatternSeverity(pattern: RegExp): RiskyPattern['severity'] {
    const source = pattern.source;
    if (source.includes('eval') || source.includes('Function')) return 'critical';
    if (source.includes('process.exit') || source.includes('child_process')) return 'high';
    return 'medium';
  }

  private getPatternMitigation(pattern: RegExp): string {
    const source = pattern.source;
    if (source.includes('eval')) return 'Use safer alternatives like JSON.parse() or template engines';
    if (source.includes('Function')) return 'Use arrow functions or regular function declarations';
    if (source.includes('process.exit')) return 'Use proper error handling instead of process.exit()';
    return 'Review and validate the necessity of this pattern';
  }

  private getCWEForPattern(type: RiskyPattern['type']): string {
    switch (type) {
      case 'code-execution': return 'CWE-94';
      case 'file-system': return 'CWE-22';
      case 'network': return 'CWE-918';
      case 'environment': return 'CWE-200';
      default: return 'CWE-1004';
    }
  }

  private getCVSSForSeverity(severity: string): number {
    switch (severity) {
      case 'critical': return 9.0;
      case 'high': return 7.0;
      case 'medium': return 5.0;
      case 'low': return 3.0;
      default: return 0.0;
    }
  }

  /**
   * Utility methods
   */
  private violationToVulnerability(violation: SecurityViolation): SecurityVulnerability {
    return {
      id: `violation-${Date.now()}`,
      severity: violation.severity,
      type: violation.type,
      description: violation.description,
      affectedComponent: 'runtime',
      discoveredAt: violation.timestamp,
      cwe: this.getCWEForViolationType(violation.type),
      cvss: this.getCVSSForSeverity(violation.severity)
    };
  }

  private getCWEForViolationType(type: SecurityViolation['type']): string {
    switch (type) {
      case 'unauthorized-access': return 'CWE-862';
      case 'resource-limit': return 'CWE-770';
      case 'policy-violation': return 'CWE-1188';
      default: return 'CWE-1004';
    }
  }

  private versionMatches(version: string, affectedVersions: string[]): boolean {
    // Simplified version matching - would use semver in production
    return affectedVersions.some(affected => {
      if (affected.startsWith('<')) {
        return version < affected.substring(1);
      }
      if (affected.startsWith('>=')) {
        return version >= affected.substring(2);
      }
      return version === affected;
    });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Log scan results
   */
  private logScanResults(result: SecurityScanResult, executionTime: number): void {
    console.log(`\n🔒 Security Scan Results for ${chalk.cyan(result.generatorId)}:`);
    console.log(`   Overall Score: ${this.getScoreColor(result.score)}${result.score}/100${chalk.reset()}`);
    console.log(`   Status: ${result.passed ? chalk.green('✅ Passed') : chalk.red('❌ Failed')}`);
    console.log(`   Scan Time: ${chalk.yellow(executionTime)}ms`);
    
    if (result.vulnerabilities.length > 0) {
      console.log(`   Vulnerabilities: ${chalk.red(result.vulnerabilities.length)}`);
      result.vulnerabilities.slice(0, 3).forEach(vuln => {
        console.log(`     • ${chalk.red(vuln.description)} (${vuln.severity})`);
      });
      if (result.vulnerabilities.length > 3) {
        console.log(`     ... and ${result.vulnerabilities.length - 3} more`);
      }
    }

    if (result.staticAnalysis.riskyPatterns.length > 0) {
      console.log(`   Risky Patterns: ${chalk.yellow(result.staticAnalysis.riskyPatterns.length)}`);
    }

    if (result.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      result.recommendations.slice(0, 2).forEach(rec => {
        console.log(`     • ${rec}`);
      });
    }
  }

  private getScoreColor(score: number): string {
    if (score >= 90) return chalk.green;
    if (score >= 70) return chalk.yellow;
    if (score >= 50) return chalk.orange;
    return chalk.red;
  }

  /**
   * Get cached scan result
   */
  getCachedScanResult(generatorId: string): SecurityScanResult | null {
    return this.scanResults.get(generatorId) || null;
  }

  /**
   * Clear scan cache
   */
  clearScanCache(): void {
    this.scanResults.clear();
    console.log('🧹 Security scan cache cleared');
  }

  /**
   * Dispose security scanner
   */
  async dispose(): Promise<void> {
    // Terminate all workers
    for (const [workerId, worker] of this.workers) {
      await worker.terminate();
      this.workers.delete(workerId);
    }

    this.scanResults.clear();
    this.vulnerabilityDatabase.clear();

    console.log('🔒 Generator Security Scanner disposed');
  }
}