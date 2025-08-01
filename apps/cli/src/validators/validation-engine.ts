import { z } from 'zod';
import { GDPRValidator, type GDPRResult } from './gdpr-validator.js';
import { NSMValidator, type NSMResult } from './nsm-validator.js';
import { AccessibilityValidator, type WCAGResult } from './accessibility-validator.js';
import { NorwegianValidator, type NorwegianResult } from './norwegian-validator.js';
import type { GenerationResult } from '../types.js';

/**
 * Validation Engine
 * 
 * Centralized validation orchestration system that coordinates
 * all compliance validators with parallel execution, caching,
 * and comprehensive result aggregation
 */

// Validation types
export enum ValidationType {
  GDPR = 'gdpr',
  NSM = 'nsm',
  WCAG = 'wcag',
  NORWEGIAN = 'norwegian',
  CUSTOM = 'custom'
}

// Validation severity levels
export enum ValidationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Validation execution mode
export enum ValidationMode {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  HYBRID = 'hybrid'
}

// Cache strategy
export enum CacheStrategy {
  NONE = 'none',
  MEMORY = 'memory',
  DISK = 'disk',
  REDIS = 'redis'
}

// Validation configuration schema
const validationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  validators: z.array(z.nativeEnum(ValidationType)).default([
    ValidationType.GDPR,
    ValidationType.NSM,
    ValidationType.WCAG,
    ValidationType.NORWEGIAN
  ]),
  mode: z.nativeEnum(ValidationMode).default(ValidationMode.PARALLEL),
  timeout: z.number().default(30000), // 30 seconds
  retries: z.number().default(2),
  cache: z.object({
    strategy: z.nativeEnum(CacheStrategy).default(CacheStrategy.MEMORY),
    ttl: z.number().default(3600), // 1 hour
    maxSize: z.number().default(100)
  }),
  notifications: z.object({
    enabled: z.boolean().default(false),
    channels: z.array(z.string()).default([]),
    thresholds: z.object({
      error: z.number().default(1),
      warning: z.number().default(5)
    })
  }),
  scheduling: z.object({
    enabled: z.boolean().default(false),
    interval: z.number().default(86400000), // 24 hours
    immediate: z.boolean().default(true)
  }),
  reporting: z.object({
    formats: z.array(z.enum(['json', 'html', 'pdf', 'csv'])).default(['json']),
    outputPath: z.string().optional(),
    includeMetrics: z.boolean().default(true)
  })
});

export type ValidationConfig = z.infer<typeof validationConfigSchema>;

// Validation result aggregation schema
const aggregatedResultSchema = z.object({
  timestamp: z.string(),
  executionTime: z.number(),
  overallCompliant: z.boolean(),
  overallScore: z.number().min(0).max(100),
  totalIssues: z.number(),
  totalWarnings: z.number(),
  totalErrors: z.number(),
  validationResults: z.object({
    gdpr: z.any().optional(), // GDPRResult
    nsm: z.any().optional(),  // NSMResult
    wcag: z.any().optional(), // WCAGResult
    norwegian: z.any().optional() // NorwegianResult
  }),
  metadata: z.object({
    filePath: z.string(),
    fileSize: z.number(),
    linesOfCode: z.number(),
    validatorsRun: z.array(z.string()),
    cacheHit: z.boolean(),
    retryCount: z.number()
  }),
  metrics: z.object({
    performance: z.object({
      totalTime: z.number(),
      validationTimes: z.record(z.string(), z.number()),
      memoryUsage: z.number(),
      cpuUsage: z.number()
    }),
    coverage: z.object({
      linesAnalyzed: z.number(),
      functionsAnalyzed: z.number(),
      componentsAnalyzed: z.number()
    }),
    trends: z.object({
      scoreImprovement: z.number(),
      issueReduction: z.number(),
      complianceProgress: z.number()
    })
  }),
  recommendations: z.array(z.object({
    type: z.nativeEnum(ValidationType),
    severity: z.nativeEnum(ValidationSeverity),
    message: z.string(),
    action: z.string(),
    estimated_effort: z.string(),
    priority: z.number()
  })),
  summary: z.object({
    passed: z.number(),
    failed: z.number(),
    warnings: z.number(),
    criticalIssues: z.number(),
    complianceLevel: z.string(),
    nextSteps: z.array(z.string())
  })
});

export type AggregatedResult = z.infer<typeof aggregatedResultSchema>;

// Plugin interface for custom validators
export interface ValidationPlugin {
  name: string;
  version: string;
  validate(code: string, filePath: string, options?: any): Promise<any>;
  getMetadata(): {
    description: string;
    supportedFileTypes: string[];
    configurableOptions: Record<string, any>;
  };
}

// Cache interface
interface ValidationCache {
  get(key: string): Promise<AggregatedResult | null>;
  set(key: string, value: AggregatedResult, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

/**
 * Memory cache implementation
 */
class MemoryCache implements ValidationCache {
  private cache = new Map<string, { value: AggregatedResult; expires: number }>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize = 100, defaultTtl = 3600000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  async get(key: string): Promise<AggregatedResult | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: AggregatedResult, ttl?: number): Promise<void> {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const expires = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { value, expires });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async size(): Promise<number> {
    return this.cache.size;
  }
}

/**
 * Validation Engine
 */
export class ValidationEngine {
  private config: ValidationConfig;
  private validators: Map<ValidationType, any> = new Map();
  private plugins: Map<string, ValidationPlugin> = new Map();
  private cache: ValidationCache;
  private validationHistory: AggregatedResult[] = [];
  private scheduledValidation?: NodeJS.Timeout;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = validationConfigSchema.parse(config);
    this.initializeValidators();
    this.initializeCache();
    
    if (this.config.scheduling.enabled) {
      this.startScheduledValidation();
    }
  }

  /**
   * Initialize built-in validators
   */
  private initializeValidators(): void {
    this.validators.set(ValidationType.GDPR, new GDPRValidator());
    this.validators.set(ValidationType.NSM, new NSMValidator());
    this.validators.set(ValidationType.WCAG, new AccessibilityValidator());
    this.validators.set(ValidationType.NORWEGIAN, new NorwegianValidator());
  }

  /**
   * Initialize cache based on strategy
   */
  private initializeCache(): void {
    switch (this.config.cache.strategy) {
      case CacheStrategy.MEMORY:
        this.cache = new MemoryCache(this.config.cache.maxSize, this.config.cache.ttl * 1000);
        break;
      case CacheStrategy.NONE:
      default:
        this.cache = new MemoryCache(0, 0); // Disabled cache
        break;
    }
  }

  /**
   * Register a custom validation plugin
   */
  registerPlugin(plugin: ValidationPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a validation plugin
   */
  unregisterPlugin(name: string): void {
    this.plugins.delete(name);
  }

  /**
   * Run comprehensive validation with orchestration
   */
  async validateCode(
    code: string,
    filePath: string = 'unknown',
    overrideConfig?: Partial<ValidationConfig>
  ): Promise<AggregatedResult> {
    const startTime = Date.now();
    const config = { ...this.config, ...overrideConfig };
    
    // Check cache first
    const cacheKey = this.generateCacheKey(code, filePath, config);
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult && config.cache.strategy !== CacheStrategy.NONE) {
      return cachedResult;
    }

    let retryCount = 0;
    let validationResults: any = {};
    let totalErrors = 0;

    while (retryCount <= config.retries) {
      try {
        // Execute validations based on mode
        if (config.mode === ValidationMode.PARALLEL) {
          validationResults = await this.runParallelValidation(code, filePath, config);
        } else {
          validationResults = await this.runSequentialValidation(code, filePath, config);
        }
        break;
      } catch (error) {
        retryCount++;
        if (retryCount > config.retries) {
          throw new Error(`Validation failed after ${config.retries} retries: ${error}`);
        }
        await this.delay(1000 * retryCount); // Exponential backoff
      }
    }

    // Aggregate results
    const aggregatedResult = await this.aggregateResults(
      validationResults,
      code,
      filePath,
      startTime,
      retryCount
    );

    // Cache result
    if (config.cache.strategy !== CacheStrategy.NONE) {
      await this.cache.set(cacheKey, aggregatedResult, config.cache.ttl * 1000);
    }

    // Store in history
    this.validationHistory.push(aggregatedResult);
    if (this.validationHistory.length > 50) {
      this.validationHistory.shift(); // Keep last 50 results
    }

    // Send notifications if configured
    if (config.notifications.enabled) {
      await this.sendNotifications(aggregatedResult, config);
    }

    return aggregatedResult;
  }

  /**
   * Run validations in parallel
   */
  private async runParallelValidation(
    code: string,
    filePath: string,
    config: ValidationConfig
  ): Promise<any> {
    const validationPromises: Promise<any>[] = [];
    const results: any = {};

    // Run built-in validators
    for (const validatorType of config.validators) {
      const validator = this.validators.get(validatorType);
      if (validator) {
        const promise = this.runValidatorWithTimeout(
          validator,
          validatorType,
          code,
          filePath,
          config.timeout
        );
        validationPromises.push(promise);
      }
    }

    // Run custom plugins
    for (const [name, plugin] of this.plugins) {
      const promise = this.runPluginWithTimeout(
        plugin,
        code,
        filePath,
        config.timeout
      );
      validationPromises.push(promise);
    }

    // Wait for all validations to complete
    const allResults = await Promise.allSettled(validationPromises);
    
    // Process results
    allResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const validatorType = config.validators[index] || 'custom';
        results[validatorType] = result.value;
      } else {
        console.warn(`Validation failed: ${result.reason}`);
      }
    });

    return results;
  }

  /**
   * Run validations sequentially
   */
  private async runSequentialValidation(
    code: string,
    filePath: string,
    config: ValidationConfig
  ): Promise<any> {
    const results: any = {};

    // Run built-in validators
    for (const validatorType of config.validators) {
      const validator = this.validators.get(validatorType);
      if (validator) {
        try {
          results[validatorType] = await this.runValidatorWithTimeout(
            validator,
            validatorType,
            code,
            filePath,
            config.timeout
          );
        } catch (error) {
          console.warn(`${validatorType} validation failed: ${error}`);
        }
      }
    }

    // Run custom plugins
    for (const [name, plugin] of this.plugins) {
      try {
        results[name] = await this.runPluginWithTimeout(
          plugin,
          code,
          filePath,
          config.timeout
        );
      } catch (error) {
        console.warn(`Plugin ${name} validation failed: ${error}`);
      }
    }

    return results;
  }

  /**
   * Run validator with timeout
   */
  private async runValidatorWithTimeout(
    validator: any,
    type: ValidationType,
    code: string,
    filePath: string,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      this.executeValidator(validator, type, code, filePath),
      this.timeoutPromise(timeout, `${type} validation timeout`)
    ]);
  }

  /**
   * Execute specific validator
   */
  private async executeValidator(
    validator: any,
    type: ValidationType,
    code: string,
    filePath: string
  ): Promise<any> {
    switch (type) {
      case ValidationType.GDPR:
        return await validator.validateGDPRCompliance(code, filePath);
      case ValidationType.NSM:
        return await validator.validateNSMCompliance(code, filePath);
      case ValidationType.WCAG:
        return await validator.validateWCAGCompliance(code, filePath);
      case ValidationType.NORWEGIAN:
        return await validator.validateNorwegianCompliance(code, filePath);
      default:
        throw new Error(`Unknown validator type: ${type}`);
    }
  }

  /**
   * Run plugin with timeout
   */
  private async runPluginWithTimeout(
    plugin: ValidationPlugin,
    code: string,
    filePath: string,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      plugin.validate(code, filePath),
      this.timeoutPromise(timeout, `Plugin ${plugin.name} timeout`)
    ]);
  }

  /**
   * Create timeout promise
   */
  private timeoutPromise(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  /**
   * Aggregate validation results
   */
  private async aggregateResults(
    validationResults: any,
    code: string,
    filePath: string,
    startTime: number,
    retryCount: number
  ): Promise<AggregatedResult> {
    const executionTime = Date.now() - startTime;
    
    // Calculate overall metrics
    let totalIssues = 0;
    let totalWarnings = 0;
    let totalErrors = 0;
    let totalScore = 0;
    let scoreCount = 0;

    // Process GDPR results
    if (validationResults.gdpr) {
      const gdpr = validationResults.gdpr as GDPRResult;
      totalIssues += gdpr.issues.length;
      totalWarnings += gdpr.issues.filter(i => i.severity === 'warning').length;
      totalErrors += gdpr.issues.filter(i => i.severity === 'error').length;
      totalScore += gdpr.score;
      scoreCount++;
    }

    // Process NSM results
    if (validationResults.nsm) {
      const nsm = validationResults.nsm as NSMResult;
      totalIssues += nsm.vulnerabilities.length;
      totalWarnings += nsm.vulnerabilities.filter(v => v.severity === 'medium').length;
      totalErrors += nsm.vulnerabilities.filter(v => v.severity === 'critical').length;
      totalScore += nsm.score;
      scoreCount++;
    }

    // Process WCAG results
    if (validationResults.wcag) {
      const wcag = validationResults.wcag as WCAGResult;
      const wcagIssues = Object.values(wcag.principles).reduce((sum, p) => sum + p.issues.length, 0);
      totalIssues += wcagIssues;
      totalWarnings += Object.values(wcag.principles).reduce((sum, p) => 
        sum + p.issues.filter(i => i.severity === 'warning').length, 0);
      totalErrors += Object.values(wcag.principles).reduce((sum, p) => 
        sum + p.issues.filter(i => i.severity === 'error').length, 0);
      totalScore += wcag.score;
      scoreCount++;
    }

    // Calculate overall score and compliance
    const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const overallCompliant = totalErrors === 0 && overallScore >= 85;

    // Generate metadata
    const metadata = {
      filePath,
      fileSize: code.length,
      linesOfCode: code.split('\n').length,
      validatorsRun: Object.keys(validationResults),
      cacheHit: false,
      retryCount
    };

    // Calculate performance metrics
    const metrics = {
      performance: {
        totalTime: executionTime,
        validationTimes: this.calculateValidationTimes(validationResults),
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage().user
      },
      coverage: {
        linesAnalyzed: code.split('\n').length,
        functionsAnalyzed: (code.match(/function|=>|class/g) || []).length,
        componentsAnalyzed: (code.match(/export\s+(const|function|class)/g) || []).length
      },
      trends: this.calculateTrends(overallScore, totalIssues)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(validationResults);

    // Create summary
    const summary = {
      passed: scoreCount,
      failed: totalErrors,
      warnings: totalWarnings,
      criticalIssues: totalErrors,
      complianceLevel: this.determineComplianceLevel(overallScore, totalErrors),
      nextSteps: this.generateNextSteps(validationResults, totalErrors)
    };

    return {
      timestamp: new Date().toISOString(),
      executionTime,
      overallCompliant,
      overallScore,
      totalIssues,
      totalWarnings,
      totalErrors,
      validationResults,
      metadata,
      metrics,
      recommendations,
      summary
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    code: string,
    filePath: string,
    config: ValidationConfig
  ): string {
    const contentHash = this.simpleHash(code);
    const configHash = this.simpleHash(JSON.stringify(config.validators));
    return `${filePath}:${contentHash}:${configHash}`;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate validation times
   */
  private calculateValidationTimes(results: any): Record<string, number> {
    const times: Record<string, number> = {};
    for (const [key] of Object.entries(results)) {
      times[key] = Math.random() * 1000; // Mock timing - would be actual in real implementation
    }
    return times;
  }

  /**
   * Calculate trends from history
   */
  private calculateTrends(currentScore: number, currentIssues: number): {
    scoreImprovement: number;
    issueReduction: number;
    complianceProgress: number;
  } {
    if (this.validationHistory.length === 0) {
      return { scoreImprovement: 0, issueReduction: 0, complianceProgress: 0 };
    }

    const lastResult = this.validationHistory[this.validationHistory.length - 1];
    const scoreImprovement = currentScore - lastResult.overallScore;
    const issueReduction = lastResult.totalIssues - currentIssues;
    const complianceProgress = (currentScore - 50) / 50 * 100; // Progress towards 100% compliance

    return { scoreImprovement, issueReduction, complianceProgress };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(results: any): AggregatedResult['recommendations'] {
    const recommendations: AggregatedResult['recommendations'] = [];

    // GDPR recommendations
    if (results.gdpr) {
      const gdpr = results.gdpr as GDPRResult;
      gdpr.issues.forEach(issue => {
        recommendations.push({
          type: ValidationType.GDPR,
          severity: issue.severity === 'error' ? ValidationSeverity.CRITICAL : ValidationSeverity.MEDIUM,
          message: issue.message,
          action: `Fix GDPR compliance issue: ${issue.message}`,
          estimated_effort: issue.severity === 'error' ? '2-4 hours' : '1-2 hours',
          priority: issue.severity === 'error' ? 1 : 3
        });
      });
    }

    // NSM recommendations
    if (results.nsm) {
      const nsm = results.nsm as NSMResult;
      nsm.vulnerabilities.forEach(vuln => {
        recommendations.push({
          type: ValidationType.NSM,
          severity: vuln.severity === 'critical' ? ValidationSeverity.CRITICAL : 
                   vuln.severity === 'high' ? ValidationSeverity.HIGH : ValidationSeverity.MEDIUM,
          message: vuln.description,
          action: `Address security vulnerability: ${vuln.description}`,
          estimated_effort: vuln.severity === 'critical' ? '4-8 hours' : '2-4 hours',
          priority: vuln.severity === 'critical' ? 1 : 2
        });
      });
    }

    // Sort by priority
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Determine compliance level
   */
  private determineComplianceLevel(score: number, errors: number): string {
    if (errors > 0) return 'Non-compliant';
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Poor';
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(results: any, totalErrors: number): string[] {
    const steps: string[] = [];

    if (totalErrors > 0) {
      steps.push('Address critical compliance issues immediately');
    }

    if (results.gdpr && !results.gdpr.compliant) {
      steps.push('Review and fix GDPR compliance issues');
    }

    if (results.nsm && results.nsm.vulnerabilities.length > 0) {
      steps.push('Implement security improvements');
    }

    if (results.wcag && !results.wcag.compliant) {
      steps.push('Improve accessibility compliance');
    }

    if (steps.length === 0) {
      steps.push('Maintain current compliance levels');
      steps.push('Consider additional security hardening');
    }

    return steps;
  }

  /**
   * Send notifications
   */
  private async sendNotifications(
    result: AggregatedResult,
    config: ValidationConfig
  ): Promise<void> {
    const { notifications } = config;
    
    if (result.totalErrors >= notifications.thresholds.error) {
      console.warn(`🚨 CRITICAL: ${result.totalErrors} compliance errors detected!`);
    }

    if (result.totalWarnings >= notifications.thresholds.warning) {
      console.warn(`⚠️  WARNING: ${result.totalWarnings} compliance warnings detected!`);
    }

    // In a real implementation, this would send notifications to configured channels
    // (Slack, email, Teams, etc.)
  }

  /**
   * Start scheduled validation
   */
  private startScheduledValidation(): void {
    if (this.scheduledValidation) {
      clearInterval(this.scheduledValidation);
    }

    this.scheduledValidation = setInterval(async () => {
      try {
        // In a real implementation, this would validate the entire codebase
        console.log('Running scheduled compliance validation...');
        // await this.validateProject();
      } catch (error) {
        console.error('Scheduled validation failed:', error);
      }
    }, this.config.scheduling.interval);
  }

  /**
   * Stop scheduled validation
   */
  stopScheduledValidation(): void {
    if (this.scheduledValidation) {
      clearInterval(this.scheduledValidation);
      this.scheduledValidation = undefined;
    }
  }

  /**
   * Get validation history
   */
  getValidationHistory(): AggregatedResult[] {
    return [...this.validationHistory];
  }

  /**
   * Get validation metrics
   */
  getValidationMetrics(): {
    totalValidations: number;
    averageScore: number;
    complianceRate: number;
    commonIssues: string[];
  } {
    if (this.validationHistory.length === 0) {
      return {
        totalValidations: 0,
        averageScore: 0,
        complianceRate: 0,
        commonIssues: []
      };
    }

    const totalValidations = this.validationHistory.length;
    const averageScore = this.validationHistory.reduce((sum, r) => sum + r.overallScore, 0) / totalValidations;
    const compliantValidations = this.validationHistory.filter(r => r.overallCompliant).length;
    const complianceRate = compliantValidations / totalValidations * 100;

    // Extract common issues (simplified)
    const allIssues: string[] = [];
    this.validationHistory.forEach(result => {
      result.recommendations.forEach(rec => {
        allIssues.push(rec.message);
      });
    });

    const issueCount = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);

    return {
      totalValidations,
      averageScore: Math.round(averageScore),
      complianceRate: Math.round(complianceRate),
      commonIssues
    };
  }

  /**
   * Export results in various formats
   */
  async exportResults(
    result: AggregatedResult,
    format: 'json' | 'html' | 'pdf' | 'csv' = 'json'
  ): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      
      case 'csv':
        return this.convertToCSV(result);
      
      case 'html':
        return this.convertToHTML(result);
      
      case 'pdf':
        // Would require PDF generation library
        return JSON.stringify(result, null, 2);
      
      default:
        return JSON.stringify(result, null, 2);
    }
  }

  /**
   * Convert result to CSV format
   */
  private convertToCSV(result: AggregatedResult): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Overall Score', result.overallScore.toString()],
      ['Compliant', result.overallCompliant.toString()],
      ['Total Issues', result.totalIssues.toString()],
      ['Total Warnings', result.totalWarnings.toString()],
      ['Total Errors', result.totalErrors.toString()],
      ['Execution Time', result.executionTime.toString()],
      ['Compliance Level', result.summary.complianceLevel]
    ];

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Convert result to HTML format
   */
  private convertToHTML(result: AggregatedResult): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { color: #333; border-bottom: 2px solid #4CAF50; }
        .score { font-size: 48px; color: ${result.overallCompliant ? '#4CAF50' : '#f44336'}; }
        .section { margin: 20px 0; }
        .metric { display: flex; justify-content: space-between; padding: 10px; background: #f5f5f5; margin: 5px 0; }
        .recommendations { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Compliance Validation Report</h1>
        <p>Generated: ${result.timestamp}</p>
    </div>
    
    <div class="section">
        <h2>Overall Score</h2>
        <div class="score">${result.overallScore}/100</div>
        <p>Status: ${result.overallCompliant ? '✅ Compliant' : '❌ Non-compliant'}</p>
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        <div class="metric"><span>Total Issues:</span><span>${result.totalIssues}</span></div>
        <div class="metric"><span>Warnings:</span><span>${result.totalWarnings}</span></div>
        <div class="metric"><span>Errors:</span><span>${result.totalErrors}</span></div>
        <div class="metric"><span>Compliance Level:</span><span>${result.summary.complianceLevel}</span></div>
    </div>
    
    <div class="section">
        <h2>Top Recommendations</h2>
        <div class="recommendations">
            ${result.recommendations.slice(0, 5).map(rec => 
                `<p><strong>${rec.type}</strong>: ${rec.message}</p>`
            ).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.stopScheduledValidation();
    await this.cache.clear();
    this.validationHistory.length = 0;
    this.plugins.clear();
  }
}

/**
 * Generate validation engine component
 */
export async function generateValidationEngineComponent(
  options: z.infer<typeof validationEngineOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate validation engine service
  const serviceContent = `
${options.typescript ? `
import type { 
  ValidationConfig,
  AggregatedResult,
  ValidationPlugin,
  ValidationType,
  ValidationMode
} from '../types/validation-engine';
` : ''}
import { ValidationEngine } from '../lib/validation-engine';

/**
 * Validation Engine Service for ${options.projectName}
 * Centralized validation orchestration and management
 */
export class ValidationEngineService {
  private engine: ValidationEngine;
  private isInitialized = false;

  constructor(config${options.typescript ? ': Partial<ValidationConfig>' : ''} = {}) {
    this.engine = new ValidationEngine({
      enabled: true,
      mode: 'parallel',
      timeout: 30000,
      retries: 2,
      cache: {
        strategy: 'memory',
        ttl: 3600,
        maxSize: 100
      },
      notifications: {
        enabled: false,
        channels: [],
        thresholds: { error: 1, warning: 5 }
      },
      scheduling: {
        enabled: false,
        interval: 86400000,
        immediate: true
      },
      reporting: {
        formats: ['json'],
        includeMetrics: true
      },
      ...config
    });
    this.isInitialized = true;
  }

  /**
   * Validate code with comprehensive analysis
   */
  async validateCode(
    code${options.typescript ? ': string' : ''},
    filePath${options.typescript ? ': string' : ''} = 'unknown'
  )${options.typescript ? ': Promise<AggregatedResult>' : ''} {
    if (!this.isInitialized) {
      throw new Error('ValidationEngineService not initialized');
    }

    try {
      const result = await this.engine.validateCode(code, filePath);
      
      // Log validation summary
      console.log(\`\\n🔍 Validation Complete for \${filePath}\`);
      console.log(\`   Score: \${result.overallScore}/100\`);
      console.log(\`   Status: \${result.overallCompliant ? '✅ Compliant' : '❌ Non-compliant'}\`);
      console.log(\`   Issues: \${result.totalIssues} (\${result.totalErrors} errors, \${result.totalWarnings} warnings)\`);
      console.log(\`   Time: \${result.executionTime}ms\\n\`);

      return result;
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    }
  }

  /**
   * Validate entire project
   */
  async validateProject(
    projectPath${options.typescript ? ': string' : ''} = process.cwd()
  )${options.typescript ? ': Promise<AggregatedResult[]>' : ''} {
    // In a real implementation, this would scan all files in the project
    const mockFiles = [
      { path: 'src/components/UserProfile.tsx', content: 'export const UserProfile = () => <div>Profile</div>;' },
      { path: 'src/services/auth.ts', content: 'export class AuthService { login() {} }' },
      { path: 'src/utils/helpers.ts', content: 'export const formatDate = (date) => date.toISOString();' }
    ];

    const results${options.typescript ? ': AggregatedResult[]' : ''} = [];

    for (const file of mockFiles) {
      try {
        const result = await this.validateCode(file.content, file.path);
        results.push(result);
      } catch (error) {
        console.warn(\`Skipped \${file.path}: \${error}\`);
      }
    }

    return results;
  }

  /**
   * Register custom validation plugin
   */
  registerPlugin(plugin${options.typescript ? ': ValidationPlugin' : ''})${options.typescript ? ': void' : ''} {
    this.engine.registerPlugin(plugin);
    console.log(\`Registered validation plugin: \${plugin.name}\`);
  }

  /**
   * Get validation metrics and analytics
   */
  getMetrics()${options.typescript ? ': ReturnType<ValidationEngine["getValidationMetrics"]>' : ''} {
    return this.engine.getValidationMetrics();
  }

  /**
   * Get validation history
   */
  getHistory()${options.typescript ? ': AggregatedResult[]' : ''} {
    return this.engine.getValidationHistory();
  }

  /**
   * Export validation results
   */
  async exportResults(
    result${options.typescript ? ': AggregatedResult' : ''},
    format${options.typescript ? ': "json" | "html" | "pdf" | "csv"' : ''} = 'json'
  )${options.typescript ? ': Promise<string>' : ''} {
    return await this.engine.exportResults(result, format);
  }

  /**
   * Generate compliance dashboard data
   */
  generateDashboard(
    results${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': any' : ''} {
    if (results.length === 0) {
      return {
        overallScore: 0,
        compliant: false,
        totalValidations: 0,
        frameworks: [],
        trends: { scoreImprovement: 0, issueReduction: 0 },
        topIssues: [],
        timeline: []
      };
    }

    const latest = results[results.length - 1];
    const metrics = this.getMetrics();

    return {
      overallScore: latest.overallScore,
      compliant: latest.overallCompliant,
      totalValidations: metrics.totalValidations,
      frameworks: Object.entries(latest.validationResults).map(([name, data]) => ({
        name,
        score: data?.score || 0,
        compliant: data?.compliant || false
      })),
      trends: latest.metrics.trends,
      topIssues: metrics.commonIssues.slice(0, 10),
      timeline: results.slice(-10).map(r => ({
        timestamp: r.timestamp,
        score: r.overallScore,
        issues: r.totalIssues
      }))
    };
  }

  /**
   * Start automated compliance monitoring
   */
  startMonitoring(
    interval${options.typescript ? ': number' : ''} = 86400000
  )${options.typescript ? ': void' : ''} {
    console.log('Starting automated compliance monitoring...');
    
    setInterval(async () => {
      try {
        const results = await this.validateProject();
        const metrics = this.getMetrics();
        
        console.log(\`\\n📊 Automated Compliance Check\`);
        console.log(\`   Average Score: \${metrics.averageScore}/100\`);
        console.log(\`   Compliance Rate: \${metrics.complianceRate}%\`);
        console.log(\`   Total Validations: \${metrics.totalValidations}\`);
        
        // Alert on degradation
        if (metrics.complianceRate < 80) {
          console.warn('🚨 Compliance rate below 80%! Immediate attention required.');
        }
      } catch (error) {
        console.error('Automated validation failed:', error);
      }
    }, interval);
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(
    results${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    if (results.length === 0) {
      return 'No validation results available for reporting.';
    }

    const latest = results[results.length - 1];
    const metrics = this.getMetrics();

    return \`
# Comprehensive Compliance Report - ${options.projectName}

## Executive Summary
- **Overall Score**: \${latest.overallScore}/100
- **Compliance Status**: \${latest.overallCompliant ? '✅ Compliant' : '❌ Non-compliant'}
- **Total Validations**: \${metrics.totalValidations}
- **Compliance Rate**: \${metrics.complianceRate}%
- **Report Date**: \${new Date().toLocaleDateString()}

## Validation Results

### GDPR Compliance
\${latest.validationResults.gdpr ? \`
- Score: \${latest.validationResults.gdpr.score}/100
- Status: \${latest.validationResults.gdpr.compliant ? '✅ Compliant' : '❌ Non-compliant'}
- Issues: \${latest.validationResults.gdpr.issues?.length || 0}
\` : 'Not validated'}

### NSM Security
\${latest.validationResults.nsm ? \`
- Score: \${latest.validationResults.nsm.score}/100
- Status: \${latest.validationResults.nsm.compliant ? '✅ Compliant' : '❌ Non-compliant'}
- Vulnerabilities: \${latest.validationResults.nsm.vulnerabilities?.length || 0}
\` : 'Not validated'}

### WCAG Accessibility
\${latest.validationResults.wcag ? \`
- Score: \${latest.validationResults.wcag.score}/100
- Status: \${latest.validationResults.wcag.compliant ? '✅ Compliant' : '❌ Non-compliant'}
- Issues: \${Object.values(latest.validationResults.wcag.principles || {}).reduce((sum, p) => sum + (p.issues?.length || 0), 0)}
\` : 'Not validated'}

## Performance Metrics
- **Average Execution Time**: \${latest.executionTime}ms
- **Memory Usage**: \${(latest.metrics.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB
- **Lines Analyzed**: \${latest.metrics.coverage.linesAnalyzed}

## Top Recommendations
\${latest.recommendations.slice(0, 5).map((rec, i) => 
  \`\${i + 1}. **\${rec.type}**: \${rec.message} (Priority: \${rec.priority})\`
).join('\\n')}

## Common Issues
\${metrics.commonIssues.slice(0, 5).map((issue, i) => 
  \`\${i + 1}. \${issue}\`
).join('\\n')}

## Next Steps
\${latest.summary.nextSteps.map((step, i) => 
  \`\${i + 1}. \${step}\`
).join('\\n')}

## Compliance Trends
- **Score Improvement**: \${latest.metrics.trends.scoreImprovement > 0 ? '+' : ''}\${latest.metrics.trends.scoreImprovement}
- **Issue Reduction**: \${latest.metrics.trends.issueReduction > 0 ? '+' : ''}\${latest.metrics.trends.issueReduction}
- **Progress**: \${latest.metrics.trends.complianceProgress.toFixed(1)}%

---
*Report generated by ${options.projectName} Validation Engine*
*\${new Date().toISOString()}*
\`;
  }

  /**
   * Clean up resources
   */
  async dispose()${options.typescript ? ': Promise<void>' : ''} {
    await this.engine.dispose();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const validationEngineService = new ValidationEngineService();

// Export example usage
export const exampleUsage = {
  async basicValidation() {
    const code = \`
      import React from 'react';
      export const Component = () => <div>Hello</div>;
    \`;
    
    const result = await validationEngineService.validateCode(code, 'Component.tsx');
    console.log('Validation result:', result.overallScore);
    return result;
  },

  async projectValidation() {
    const results = await validationEngineService.validateProject();
    const dashboard = validationEngineService.generateDashboard(results);
    console.log('Project dashboard:', dashboard);
    return results;
  },

  async exportReport() {
    const results = await validationEngineService.validateProject();
    const report = await validationEngineService.generateComplianceReport(results);
    console.log('Compliance report generated');
    return report;
  }
};`;

  files.set('services/validation-engine-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'Validation engine service created successfully'
  };
}

// Component options schema
const validationEngineOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export validation engine instance
export const validationEngine = new ValidationEngine();