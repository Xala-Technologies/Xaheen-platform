import { z } from 'zod';
import { logger } from '../utils/logger.js';

// Validation severity levels
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Validation result
export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  summary: ValidationSummary;
  metadata: ValidationMetadata;
}

// Validation issue
export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: string;
  message: string;
  description?: string;
  suggestion?: string;
  file?: string;
  line?: number;
  column?: number;
  rule: string;
  fixable: boolean;
  autofix?: AutoFix;
}

// Auto-fix information
export interface AutoFix {
  description: string;
  operation: 'replace' | 'insert' | 'delete' | 'move';
  target: string;
  replacement?: string;
  position?: number;
}

// Validation summary
export interface ValidationSummary {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  fixableCount: number;
  categories: Record<string, number>;
  filesChecked: number;
  passedRules: number;
  failedRules: number;
}

// Validation metadata
export interface ValidationMetadata {
  validator: string;
  version: string;
  timestamp: string;
  duration: number;
  config: ValidationConfig;
}

// Validation configuration
export interface ValidationConfig {
  rules: ValidationRule[];
  severity: ValidationSeverity;
  autofix: boolean;
  exclude: string[];
  include: string[];
  failFast: boolean;
  maxIssues: number;
  customRules?: CustomRule[];
}

// Validation rule
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: ValidationSeverity;
  enabled: boolean;
  options?: Record<string, any>;
}

// Custom validation rule
export interface CustomRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: ValidationSeverity;
  validator: (context: ValidationContext) => ValidationIssue[];
}

// Validation context
export interface ValidationContext {
  file: string;
  content: string;
  ast?: any;
  config: ValidationConfig;
  metadata: Record<string, any>;
}

// Validation report
export interface ValidationReport {
  result: ValidationResult;
  details: ValidationDetails;
  recommendations: ValidationRecommendation[];
}

// Validation details
export interface ValidationDetails {
  byFile: Map<string, ValidationIssue[]>;
  byCategory: Map<string, ValidationIssue[]>;
  bySeverity: Map<ValidationSeverity, ValidationIssue[]>;
  byRule: Map<string, ValidationIssue[]>;
}

// Validation recommendation
export interface ValidationRecommendation {
  type: 'config' | 'rule' | 'practice' | 'refactor';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  benefits: string[];
  effort: 'low' | 'medium' | 'high';
  resources?: string[];
}

// Base validator abstract class
export abstract class BaseValidator {
  protected config: ValidationConfig;
  protected rules: Map<string, ValidationRule> = new Map();
  protected customRules: Map<string, CustomRule> = new Map();
  
  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      rules: [],
      severity: 'error',
      autofix: false,
      exclude: [],
      include: [],
      failFast: false,
      maxIssues: 1000,
      ...config,
    };
    
    this.initializeRules();
    this.registerCustomRules();
  }
  
  // Abstract methods
  abstract initializeRules(): void;
  abstract validateFile(file: string, content: string): Promise<ValidationIssue[]>;
  abstract getDefaultRules(): ValidationRule[];
  
  // Main validation method
  async validate(
    files: string[] | Map<string, string>,
    context?: Record<string, any>
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    let filesChecked = 0;
    let passedRules = 0;
    let failedRules = 0;
    
    // Convert files to Map if needed
    const fileMap = Array.isArray(files) ? 
      await this.loadFiles(files) : 
      files;
    
    logger.info(`Starting validation of ${fileMap.size} files`);
    
    // Validate each file
    for (const [file, content] of fileMap) {
      // Check if file should be excluded
      if (this.shouldExclude(file)) {
        continue;
      }
      
      try {
        const fileIssues = await this.validateFile(file, content);
        issues.push(...fileIssues);
        filesChecked++;
        
        // Track rule statistics
        const uniqueRules = new Set(fileIssues.map(issue => issue.rule));
        failedRules += uniqueRules.size;
        passedRules += this.rules.size - uniqueRules.size;
        
        // Apply fail-fast if configured
        if (this.config.failFast && fileIssues.some(issue => issue.severity === 'error')) {
          logger.warn('Validation failed fast due to error');
          break;
        }
        
        // Check max issues limit
        if (issues.length >= this.config.maxIssues) {
          logger.warn(`Reached maximum issues limit (${this.config.maxIssues})`);
          break;
        }
        
      } catch (error) {
        logger.error(`Failed to validate file ${file}:`, error);
        issues.push({
          id: `validation-error-${file}`,
          severity: 'error',
          category: 'system',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file,
          rule: 'system.validation-error',
          fixable: false,
        });
      }
    }
    
    // Calculate results
    const duration = Date.now() - startTime;
    const summary = this.calculateSummary(issues, filesChecked, passedRules, failedRules);
    const score = this.calculateScore(summary);
    const valid = summary.errorCount === 0;
    
    const result: ValidationResult = {
      valid,
      score,
      issues,
      summary,
      metadata: {
        validator: this.constructor.name,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        duration,
        config: this.config,
      },
    };
    
    logger.info(`Validation completed: ${valid ? 'PASSED' : 'FAILED'} (${duration}ms)`);
    
    return result;
  }
  
  // Validate single file
  async validateSingleFile(file: string, content?: string): Promise<ValidationResult> {
    const fileContent = content || await this.loadFile(file);
    const fileMap = new Map([[file, fileContent]]);
    return this.validate(fileMap);
  }
  
  // Auto-fix issues
  async autofix(result: ValidationResult): Promise<Map<string, string>> {
    if (!this.config.autofix) {
      throw new Error('Auto-fix is disabled');
    }
    
    const fixes = new Map<string, string>();
    const fixableIssues = result.issues.filter(issue => issue.fixable && issue.autofix);
    
    logger.info(`Auto-fixing ${fixableIssues.length} issues`);
    
    // Group fixes by file
    const fixesByFile = new Map<string, ValidationIssue[]>();
    for (const issue of fixableIssues) {
      if (!issue.file) continue;
      
      if (!fixesByFile.has(issue.file)) {
        fixesByFile.set(issue.file, []);
      }
      fixesByFile.get(issue.file)!.push(issue);
    }
    
    // Apply fixes file by file
    for (const [file, fileIssues] of fixesByFile) {
      try {
        const originalContent = await this.loadFile(file);
        const fixedContent = await this.applyFixes(originalContent, fileIssues);
        fixes.set(file, fixedContent);
      } catch (error) {
        logger.error(`Failed to auto-fix file ${file}:`, error);
      }
    }
    
    return fixes;
  }
  
  // Generate validation report
  generateReport(result: ValidationResult): ValidationReport {
    const details = this.generateDetails(result.issues);
    const recommendations = this.generateRecommendations(result);
    
    return {
      result,
      details,
      recommendations,
    };
  }
  
  // Add custom rule
  addCustomRule(rule: CustomRule): void {
    this.customRules.set(rule.id, rule);
    logger.debug(`Added custom rule: ${rule.id}`);
  }
  
  // Remove custom rule
  removeCustomRule(ruleId: string): void {
    this.customRules.delete(ruleId);
    logger.debug(`Removed custom rule: ${ruleId}`);
  }
  
  // Enable/disable rule
  configureRule(ruleId: string, enabled: boolean, options?: Record<string, any>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      if (options) {
        rule.options = { ...rule.options, ...options };
      }
      logger.debug(`Configured rule ${ruleId}: enabled=${enabled}`);
    }
  }
  
  // Get rule information
  getRuleInfo(ruleId: string): ValidationRule | undefined {
    return this.rules.get(ruleId);
  }
  
  // List all rules
  listRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }
  
  // Protected helper methods
  protected registerCustomRules(): void {
    if (this.config.customRules) {
      for (const rule of this.config.customRules) {
        this.addCustomRule(rule);
      }
    }
  }
  
  protected shouldExclude(file: string): boolean {
    // Check exclude patterns
    for (const pattern of this.config.exclude) {
      if (this.matchesPattern(file, pattern)) {
        return true;
      }
    }
    
    // Check include patterns (if specified, file must match at least one)
    if (this.config.include.length > 0) {
      return !this.config.include.some(pattern => this.matchesPattern(file, pattern));
    }
    
    return false;
  }
  
  protected matchesPattern(file: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regex = new RegExp(
      pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
    );
    
    return regex.test(file);
  }
  
  protected async loadFiles(files: string[]): Promise<Map<string, string>> {
    const fileMap = new Map<string, string>();
    
    for (const file of files) {
      try {
        const content = await this.loadFile(file);
        fileMap.set(file, content);
      } catch (error) {
        logger.error(`Failed to load file ${file}:`, error);
      }
    }
    
    return fileMap;
  }
  
  protected async loadFile(file: string): Promise<string> {
    const fs = await import('fs/promises');
    return fs.readFile(file, 'utf-8');
  }
  
  protected calculateSummary(
    issues: ValidationIssue[],
    filesChecked: number,
    passedRules: number,
    failedRules: number
  ): ValidationSummary {
    const summary: ValidationSummary = {
      totalIssues: issues.length,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      fixableCount: 0,
      categories: {},
      filesChecked,
      passedRules,
      failedRules,
    };
    
    for (const issue of issues) {
      // Count by severity
      switch (issue.severity) {
        case 'error':
          summary.errorCount++;
          break;
        case 'warning':
          summary.warningCount++;
          break;
        case 'info':
          summary.infoCount++;
          break;
      }
      
      // Count fixable issues
      if (issue.fixable) {
        summary.fixableCount++;
      }
      
      // Count by category
      summary.categories[issue.category] = (summary.categories[issue.category] || 0) + 1;
    }
    
    return summary;
  }
  
  protected calculateScore(summary: ValidationSummary): number {
    const totalPossiblePoints = 100;
    
    // Deduct points for issues
    let deductions = 0;
    deductions += summary.errorCount * 10; // 10 points per error
    deductions += summary.warningCount * 3; // 3 points per warning
    deductions += summary.infoCount * 1; // 1 point per info
    
    // Cap deductions at total possible points
    deductions = Math.min(deductions, totalPossiblePoints);
    
    return Math.max(0, totalPossiblePoints - deductions);
  }
  
  protected async applyFixes(content: string, issues: ValidationIssue[]): Promise<string> {
    let fixedContent = content;
    
    // Sort issues by position (reverse order to maintain positions)
    const sortedIssues = issues
      .filter(issue => issue.autofix)
      .sort((a, b) => (b.line || 0) - (a.line || 0));
    
    for (const issue of sortedIssues) {
      if (!issue.autofix) continue;
      
      try {
        fixedContent = await this.applyFix(fixedContent, issue.autofix);
      } catch (error) {
        logger.error(`Failed to apply fix for issue ${issue.id}:`, error);
      }
    }
    
    return fixedContent;
  }
  
  protected async applyFix(content: string, fix: AutoFix): Promise<string> {
    switch (fix.operation) {
      case 'replace':
        return content.replace(fix.target, fix.replacement || '');
      
      case 'insert':
        const lines = content.split('\n');
        if (fix.position !== undefined && fix.position < lines.length) {
          lines.splice(fix.position, 0, fix.replacement || '');
        }
        return lines.join('\n');
      
      case 'delete':
        return content.replace(fix.target, '');
      
      default:
        throw new Error(`Unsupported fix operation: ${fix.operation}`);
    }
  }
  
  protected generateDetails(issues: ValidationIssue[]): ValidationDetails {
    const byFile = new Map<string, ValidationIssue[]>();
    const byCategory = new Map<string, ValidationIssue[]>();
    const bySeverity = new Map<ValidationSeverity, ValidationIssue[]>();
    const byRule = new Map<string, ValidationIssue[]>();
    
    for (const issue of issues) {
      // Group by file
      if (issue.file) {
        if (!byFile.has(issue.file)) {
          byFile.set(issue.file, []);
        }
        byFile.get(issue.file)!.push(issue);
      }
      
      // Group by category
      if (!byCategory.has(issue.category)) {
        byCategory.set(issue.category, []);
      }
      byCategory.get(issue.category)!.push(issue);
      
      // Group by severity
      if (!bySeverity.has(issue.severity)) {
        bySeverity.set(issue.severity, []);
      }
      bySeverity.get(issue.severity)!.push(issue);
      
      // Group by rule
      if (!byRule.has(issue.rule)) {
        byRule.set(issue.rule, []);
      }
      byRule.get(issue.rule)!.push(issue);
    }
    
    return {
      byFile,
      byCategory,
      bySeverity,
      byRule,
    };
  }
  
  protected generateRecommendations(result: ValidationResult): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];
    
    // High error count recommendation
    if (result.summary.errorCount > 10) {
      recommendations.push({
        type: 'practice',
        priority: 'high',
        title: 'Reduce Error Count',
        description: 'Your code has a high number of errors. Consider implementing stricter development practices.',
        benefits: [
          'Improved code quality',
          'Reduced debugging time',
          'Better maintainability',
        ],
        effort: 'medium',
        resources: [
          'ESLint configuration guide',
          'TypeScript best practices',
        ],
      });
    }
    
    // Many fixable issues recommendation
    if (result.summary.fixableCount > 5) {
      recommendations.push({
        type: 'config',
        priority: 'medium',
        title: 'Enable Auto-fix',
        description: 'Many issues can be automatically fixed. Consider enabling auto-fix in your workflow.',
        benefits: [
          'Reduced manual work',
          'Consistent code style',
          'Faster development',
        ],
        effort: 'low',
        resources: [
          'Auto-fix configuration',
          'CI/CD integration guide',
        ],
      });
    }
    
    // Low score recommendation
    if (result.score < 70) {
      recommendations.push({
        type: 'refactor',
        priority: 'high',
        title: 'Code Quality Improvement',
        description: 'Your code quality score is below recommended standards. Consider refactoring.',
        benefits: [
          'Better code quality',
          'Improved maintainability',
          'Reduced technical debt',
        ],
        effort: 'high',
        resources: [
          'Refactoring patterns',
          'Code review checklist',
        ],
      });
    }
    
    return recommendations;
  }
  
  // Static utility methods
  static createIssue(
    id: string,
    severity: ValidationSeverity,
    category: string,
    message: string,
    rule: string,
    options?: Partial<ValidationIssue>
  ): ValidationIssue {
    return {
      id,
      severity,
      category,
      message,
      rule,
      fixable: false,
      ...options,
    };
  }
  
  static createAutoFix(
    description: string,
    operation: AutoFix['operation'],
    target: string,
    replacement?: string,
    position?: number
  ): AutoFix {
    return {
      description,
      operation,
      target,
      replacement,
      position,
    };
  }
}

// Configuration schema
export const ValidationConfigSchema = z.object({
  rules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
    enabled: z.boolean(),
    options: z.record(z.any()).optional(),
  })),
  severity: z.enum(['error', 'warning', 'info']),
  autofix: z.boolean(),
  exclude: z.array(z.string()),
  include: z.array(z.string()),
  failFast: z.boolean(),
  maxIssues: z.number().positive(),
  customRules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })).optional(),
});

// Export utility functions
export function validateConfig(config: any): ValidationConfig {
  return ValidationConfigSchema.parse(config);
}

export function createValidationRule(
  id: string,
  name: string,
  description: string,
  category: string,
  severity: ValidationSeverity = 'error',
  enabled: boolean = true,
  options?: Record<string, any>
): ValidationRule {
  return {
    id,
    name,
    description,
    category,
    severity,
    enabled,
    options,
  };
}