/**
 * Norwegian Compliance Service
 * 
 * Service implementation that integrates with the scaffolding system
 * to provide comprehensive Norwegian compliance checking and enforcement.
 * 
 * Features:
 * - Integration with existing service architecture
 * - Automated compliance checking during code generation
 * - Compliance report generation and storage
 * - Real-time compliance monitoring
 * - Integration with validation pipeline
 */

import { BaseService } from '../architecture/base-service.js';
import { IValidator, IValidationInput, IValidationResult } from '../architecture/interfaces.js';
import {
  NorwegianComplianceChecker,
  NorwegianComplianceConfig,
  ComplianceCheckResult,
  NSMClassification,
  createDefaultNorwegianConfig,
} from './norwegian-compliance.js';
import { logger } from '../utils/logger.js';
import { fileExists, writeFile, readFile } from '../utils/fs.js';
import path from 'path';

/**
 * Compliance service options
 */
export interface ComplianceServiceOptions {
  configPath?: string;
  outputDir?: string;
  enableAutoFix?: boolean;
  enableReporting?: boolean;
  reportFormats?: ('json' | 'html' | 'pdf')[];
  enableCaching?: boolean;
  cacheMaxAge?: number; // milliseconds
}

/**
 * Compliance check request
 */
export interface ComplianceCheckRequest {
  files: Map<string, string>;
  classification?: NSMClassification;
  projectName?: string;
  skipCategories?: ('nsm' | 'gdpr' | 'wcag' | 'service')[];
  generateReport?: boolean;
  reportFormat?: 'json' | 'html' | 'pdf';
}

/**
 * Compliance service result
 */
export interface ComplianceServiceResult {
  checkResult: ComplianceCheckResult;
  reportPaths?: string[];
  cacheHit?: boolean;
  duration: number;
}

/**
 * Norwegian Compliance Service
 * Implements the Norwegian compliance checking as a service
 */
export class NorwegianComplianceService extends BaseService implements IValidator {
  private checker?: NorwegianComplianceChecker;
  private config?: NorwegianComplianceConfig;
  private options: ComplianceServiceOptions;
  private cache = new Map<string, { result: ComplianceCheckResult; timestamp: number }>();
  
  constructor(options: ComplianceServiceOptions = {}) {
    super('NorwegianComplianceService', '1.0.0');
    this.options = {
      outputDir: 'compliance-reports',
      enableAutoFix: false,
      enableReporting: true,
      reportFormats: ['json'],
      enableCaching: true,
      cacheMaxAge: 300000, // 5 minutes
      ...options,
    };
  }
  
  /**
   * Initialize the compliance service
   */
  protected async doInitialize(): Promise<void> {
    const serviceLogger = this.createLogger();
    
    try {
      // Load configuration
      await this.loadConfiguration();
      
      // Initialize compliance checker
      if (this.config) {
        this.checker = new NorwegianComplianceChecker(this.config);
        serviceLogger.info('Norwegian compliance checker initialized');
      } else {
        throw new Error('Failed to load compliance configuration');
      }
      
      // Create output directory
      if (this.options.outputDir && this.options.enableReporting) {
        await this.ensureOutputDirectory();
      }
      
      serviceLogger.info('Norwegian compliance service initialized successfully');
      
    } catch (error) {
      serviceLogger.error('Failed to initialize compliance service:', error as Error);
      throw error;
    }
  }
  
  /**
   * Dispose the compliance service
   */
  protected async doDispose(): Promise<void> {
    const serviceLogger = this.createLogger();
    
    this.cache.clear();
    this.checker = undefined;
    this.config = undefined;
    
    serviceLogger.info('Norwegian compliance service disposed');
  }
  
  /**
   * Health check for the compliance service
   */
  protected async doHealthCheck(): Promise<boolean> {
    return !!(this.checker && this.config);
  }
  
  // IValidator implementation
  
  /**
   * Validate files for Norwegian compliance
   */
  async validate(input: IValidationInput): Promise<IValidationResult> {
    this.validateServiceState();
    
    const startTime = performance.now();
    const serviceLogger = this.createLogger();
    
    try {
      serviceLogger.info(`Starting Norwegian compliance validation for ${input.files.size} files`);
      
      // Check cache first
      if (this.options.enableCaching) {
        const cacheKey = this.generateCacheKey(input);
        const cached = this.getCachedResult(cacheKey);
        
        if (cached) {
          serviceLogger.debug('Using cached compliance result');
          return this.convertToValidationResult(cached, true);
        }
      }
      
      // Perform compliance check
      const checkResult = await this.checker!.checkCompliance(input.files, {
        skipNSM: input.options?.skipCategories?.includes('nsm'),
        skipGDPR: input.options?.skipCategories?.includes('gdpr'),
        skipWCAG: input.options?.skipCategories?.includes('wcag'),
        skipService: input.options?.skipCategories?.includes('service'),
      });
      
      // Cache result
      if (this.options.enableCaching) {
        const cacheKey = this.generateCacheKey(input);
        this.setCachedResult(cacheKey, checkResult);
      }
      
      // Generate reports if enabled
      if (this.options.enableReporting) {
        await this.generateReports(checkResult);
      }
      
      const duration = performance.now() - startTime;
      serviceLogger.info(`Compliance validation completed in ${duration.toFixed(2)}ms`);
      
      return this.convertToValidationResult(checkResult, false);
      
    } catch (error) {
      const duration = performance.now() - startTime;
      serviceLogger.error(`Compliance validation failed after ${duration.toFixed(2)}ms:`, error as Error);
      throw error;
    }
  }
  
  /**
   * Auto-fix compliance issues
   */
  async autofix(result: IValidationResult): Promise<{
    success: boolean;
    fixedFiles: Map<string, string>;
    unfixableIssues: any[];
    metrics: any;
  }> {
    this.validateServiceState();
    
    if (!this.options.enableAutoFix) {
      return {
        success: false,
        fixedFiles: new Map(),
        unfixableIssues: result.issues,
        metrics: { duration: 0, issuesFixed: 0, filesModified: 0 },
      };
    }
    
    const serviceLogger = this.createLogger();
    const startTime = performance.now();
    
    try {
      serviceLogger.info('Starting auto-fix for compliance issues');
      
      const fixedFiles = new Map<string, string>();
      const unfixableIssues: any[] = [];
      let issuesFixed = 0;
      
      // Process each issue
      for (const issue of result.issues) {
        if (issue.fixable && issue.suggestion) {
          // Apply the fix
          const success = await this.applyFix(issue as any, fixedFiles);
          if (success) {
            issuesFixed++;
          } else {
            unfixableIssues.push(issue);
          }
        } else {
          unfixableIssues.push(issue);
        }
      }
      
      const duration = performance.now() - startTime;
      const filesModified = fixedFiles.size;
      
      serviceLogger.info(`Auto-fix completed: ${issuesFixed} issues fixed, ${filesModified} files modified`);
      
      return {
        success: issuesFixed > 0,
        fixedFiles,
        unfixableIssues,
        metrics: { duration, issuesFixed, filesModified },
      };
      
    } catch (error) {
      serviceLogger.error('Auto-fix failed:', error as Error);
      throw error;
    }
  }
  
  /**
   * Get supported validation rules
   */
  getSupportedRules(): string[] {
    return [
      'nsm-security-headers',
      'nsm-authentication',
      'nsm-audit-logging',
      'nsm-data-encryption',
      'gdpr-consent-management',
      'gdpr-data-minimization',
      'gdpr-right-to-erasure',
      'gdpr-privacy-by-design',
      'wcag-alt-text',
      'wcag-keyboard-navigation',
      'wcag-color-contrast',
      'wcag-aria-labels',
      'service-norwegian-language',
      'service-universal-design',
    ];
  }
  
  /**
   * Set validation rules (no-op for compliance service)
   */
  setRules(rules: any[]): void {
    // Norwegian compliance rules are fixed and cannot be modified
    logger.warn('Norwegian compliance rules are fixed and cannot be modified');
  }
  
  // Public service methods
  
  /**
   * Check compliance for files
   */
  async checkCompliance(request: ComplianceCheckRequest): Promise<ComplianceServiceResult> {
    this.validateServiceState();
    
    const startTime = performance.now();
    const serviceLogger = this.createLogger();
    
    try {
      serviceLogger.info(`Checking compliance for ${request.files.size} files`);
      
      // Use provided configuration or default
      if (request.classification && request.projectName) {
        const tempConfig = createDefaultNorwegianConfig(request.projectName, request.classification);
        const tempChecker = new NorwegianComplianceChecker(tempConfig);
        
        const checkResult = await tempChecker.checkCompliance(request.files, {
          skipNSM: request.skipCategories?.includes('nsm'),
          skipGDPR: request.skipCategories?.includes('gdpr'),
          skipWCAG: request.skipCategories?.includes('wcag'),
          skipService: request.skipCategories?.includes('service'),
        });
        
        let reportPaths: string[] | undefined;
        
        if (request.generateReport && this.options.enableReporting) {
          reportPaths = await this.generateSpecificReports(
            checkResult,
            request.reportFormat ? [request.reportFormat] : this.options.reportFormats!
          );
        }
        
        const duration = performance.now() - startTime;
        
        return {
          checkResult,
          reportPaths,
          duration,
        };
      }
      
      // Use default checker
      const checkResult = await this.checker!.checkCompliance(request.files, {
        skipNSM: request.skipCategories?.includes('nsm'),
        skipGDPR: request.skipCategories?.includes('gdpr'),
        skipWCAG: request.skipCategories?.includes('wcag'),
        skipService: request.skipCategories?.includes('service'),
      });
      
      let reportPaths: string[] | undefined;
      
      if (request.generateReport && this.options.enableReporting) {
        reportPaths = await this.generateSpecificReports(
          checkResult,
          request.reportFormat ? [request.reportFormat] : this.options.reportFormats!
        );
      }
      
      const duration = performance.now() - startTime;
      
      return {
        checkResult,
        reportPaths,
        duration,
      };
      
    } catch (error) {
      serviceLogger.error('Compliance check failed:', error as Error);
      throw error;
    }
  }
  
  /**
   * Get compliance configuration
   */
  getConfiguration(): NorwegianComplianceConfig | undefined {
    return this.config;
  }
  
  /**
   * Update compliance configuration
   */
  async updateConfiguration(
    config: Partial<NorwegianComplianceConfig>
  ): Promise<void> {
    this.validateServiceState();
    
    if (!this.config) {
      throw new Error('No base configuration loaded');
    }
    
    this.config = { ...this.config, ...config };
    this.checker = new NorwegianComplianceChecker(this.config);
    
    // Save updated configuration
    if (this.options.configPath) {
      await this.saveConfiguration();
    }
    
    // Clear cache since configuration changed
    this.cache.clear();
    
    const serviceLogger = this.createLogger();
    serviceLogger.info('Compliance configuration updated');
  }
  
  /**
   * Get compliance statistics
   */
  getStatistics(): {
    totalChecks: number;
    cacheHits: number;
    cacheSize: number;
    averageCheckTime?: number;
    commonIssues: { code: string; count: number }[];
  } {
    // Implementation would track statistics
    return {
      totalChecks: 0,
      cacheHits: 0,
      cacheSize: this.cache.size,
      commonIssues: [],
    };
  }
  
  /**
   * Clear compliance cache
   */
  clearCache(): void {
    this.cache.clear();
    const serviceLogger = this.createLogger();
    serviceLogger.info('Compliance cache cleared');
  }
  
  // Private methods
  
  private async loadConfiguration(): Promise<void> {
    if (this.options.configPath && await fileExists(this.options.configPath)) {
      try {
        const configContent = await readFile(this.options.configPath);
        this.config = JSON.parse(configContent);
        logger.debug(`Loaded compliance configuration from: ${this.options.configPath}`);
      } catch (error) {
        logger.warn(`Failed to load compliance configuration, using default:`, error);
        this.config = createDefaultNorwegianConfig('Default Project');
      }
    } else {
      this.config = createDefaultNorwegianConfig('Default Project');
      logger.debug('Using default compliance configuration');
    }
  }
  
  private async saveConfiguration(): Promise<void> {
    if (!this.config || !this.options.configPath) {
      return;
    }
    
    try {
      const configContent = JSON.stringify(this.config, null, 2);
      await writeFile(this.options.configPath, configContent);
      logger.debug(`Saved compliance configuration to: ${this.options.configPath}`);
    } catch (error) {
      logger.error('Failed to save compliance configuration:', error);
    }
  }
  
  private async ensureOutputDirectory(): Promise<void> {
    const fs = await import('fs');
    const { promises: fsPromises } = fs;
    
    try {
      await fsPromises.mkdir(this.options.outputDir!, { recursive: true });
    } catch (error) {
      logger.debug(`Output directory already exists or creation failed: ${this.options.outputDir}`);
    }
  }
  
  private generateCacheKey(input: IValidationInput): string {
    const filesHash = Array.from(input.files.entries())
      .map(([path, content]) => `${path}:${content.length}`)
      .join('|');
    
    const optionsHash = JSON.stringify(input.options || {});
    
    return `${filesHash}|${optionsHash}`;
  }
  
  private getCachedResult(cacheKey: string): ComplianceCheckResult | null {
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.options.cacheMaxAge!) {
      return cached.result;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }
  
  private setCachedResult(cacheKey: string, result: ComplianceCheckResult): void {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
    
    // Clean up old cache entries if cache gets too large
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
  
  private convertToValidationResult(
    checkResult: ComplianceCheckResult,
    fromCache: boolean
  ): IValidationResult {
    return {
      isValid: checkResult.isCompliant,
      issues: checkResult.issues.map(issue => ({
        file: issue.file || '',
        line: issue.line || 0,
        column: issue.column || 0,
        rule: issue.code,
        message: issue.message,
        severity: issue.severity as any,
        fixable: !!issue.fix,
        suggestion: issue.fix?.description,
      })),
      metrics: {
        totalFiles: checkResult.auditInfo.filesChecked,
        totalIssues: checkResult.issues.length,
        errorCount: checkResult.issues.filter(i => i.severity === 'critical').length,
        warningCount: checkResult.warnings.length,
        infoCount: checkResult.recommendations.length,
        duration: checkResult.auditInfo.duration,
      },
      suggestions: checkResult.recommendations.map(r => r.message),
    };
  }
  
  private async applyFix(issue: any, fixedFiles: Map<string, string>): Promise<boolean> {
    // Implementation would apply specific fixes based on issue type
    // This is a simplified version
    return false;
  }
  
  private async generateReports(checkResult: ComplianceCheckResult): Promise<void> {
    if (!this.options.reportFormats || this.options.reportFormats.length === 0) {
      return;
    }
    
    await this.generateSpecificReports(checkResult, this.options.reportFormats);
  }
  
  private async generateSpecificReports(
    checkResult: ComplianceCheckResult,
    formats: ('json' | 'html' | 'pdf')[]
  ): Promise<string[]> {
    const reportPaths: string[] = [];
    
    for (const format of formats) {
      try {
        const reportContent = await this.checker!.generateComplianceReport(checkResult, format);
        const fileName = `compliance-report-${checkResult.auditInfo.checkId}.${format}`;
        const filePath = path.join(this.options.outputDir!, fileName);
        
        await writeFile(filePath, reportContent);
        reportPaths.push(filePath);
        
        logger.debug(`Generated ${format.toUpperCase()} compliance report: ${filePath}`);
        
      } catch (error) {
        logger.error(`Failed to generate ${format} report:`, error);
      }
    }
    
    return reportPaths;
  }
}

/**
 * Create a configured Norwegian compliance service
 */
export function createNorwegianComplianceService(
  options: ComplianceServiceOptions = {}
): NorwegianComplianceService {
  return new NorwegianComplianceService(options);
}

/**
 * Create compliance service with default Norwegian configuration
 */
export function createDefaultComplianceService(
  projectName: string,
  classification: NSMClassification = NSMClassification.OPEN,
  options: ComplianceServiceOptions = {}
): NorwegianComplianceService {
  const config = createDefaultNorwegianConfig(projectName, classification);
  const configPath = path.join(process.cwd(), 'norwegian-compliance.json');
  
  return new NorwegianComplianceService({
    configPath,
    ...options,
  });
}