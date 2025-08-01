import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { logger } from '../utils/logger.js';
import { 
  BaseValidator, 
  ValidationRule, 
  ValidationIssue, 
  ValidationSeverity,
  createValidationRule 
} from './base-validator.js';

// Security validation configuration
export interface SecurityConfig {
  enforceCSRFProtection: boolean;
  enforceXSSPrevention: boolean;
  enforceInputSanitization: boolean;
  enforceAuthenticationChecks: boolean;
  enforceAuthorizationChecks: boolean;
  enforceSecureStorage: boolean;
  enforceHTTPSOnly: boolean;
  enforceContentSecurityPolicy: boolean;
  checkDangerousPatterns: boolean;
  checkSQLInjection: boolean;
  checkPathTraversal: boolean;
  checkCommandInjection: boolean;
  enforceNorwegianCompliance: boolean;
  checkSecretsExposure: boolean;
  validateDependencySecurityEnabled: boolean;
  maxSecurityScore: number;
}

// Security vulnerability types
export type SecurityVulnerabilityType = 
  | 'xss-vulnerability'
  | 'sql-injection'
  | 'path-traversal'
  | 'command-injection'
  | 'csrf-vulnerability'
  | 'insecure-storage'
  | 'secrets-exposure'
  | 'insecure-communication'
  | 'insufficient-authentication'
  | 'insufficient-authorization'
  | 'dangerous-function'
  | 'insecure-dependency'
  | 'information-disclosure'
  | 'improper-validation'
  | 'norwegian-compliance-violation';

// Security severity levels
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Dangerous patterns to detect
export interface DangerousPattern {
  pattern: RegExp;
  message: string;
  severity: SecuritySeverity;
  category: SecurityVulnerabilityType;
  description: string;
  recommendation: string;
}

// Security validator implementation
export class SecurityValidator extends BaseValidator {
  private config: SecurityConfig;
  private dangerousPatterns: DangerousPattern[];
  private dangerousFunctions = new Set([
    'eval', 'Function', 'setTimeout', 'setInterval',
    'document.write', 'document.writeln', 'innerHTML',
    'outerHTML', 'insertAdjacentHTML', 'createContextualFragment'
  ]);
  
  private sqlKeywords = new Set([
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
    'ALTER', 'TRUNCATE', 'EXEC', 'EXECUTE', 'UNION', 'OR', 'AND'
  ]);
  
  private secretPatterns = [
    /(?:api[_-]?key|apikey|secret[_-]?key|secretkey|access[_-]?token|accesstoken)\s*[:=]\s*['""][^'""]+['""]|/gi,
    /(?:password|passwd|pwd)\s*[:=]\s*['""][^'""]+['""]|/gi,
    /(?:private[_-]?key|privatekey)\s*[:=]\s*['""][^'""]+['""]|/gi,
    /(?:jwt[_-]?token|jwttoken|bearer[_-]?token|bearertoken)\s*[:=]\s*['""][^'""]+['""]|/gi,
    /(?:database[_-]?url|databaseurl|db[_-]?url|dburl)\s*[:=]\s*['""][^'""]+['""]|/gi,
  ];
  
  constructor(config: Partial<SecurityConfig> = {}) {
    super({
      rules: [],
      severity: 'error',
      autofix: false,
      exclude: ['node_modules/**', 'dist/**', 'build/**', '**/*.test.ts', '**/*.test.tsx'],
      include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      failFast: false,
      maxIssues: 1000,
    });
    
    this.config = {
      enforceCSRFProtection: true,
      enforceXSSPrevention: true,
      enforceInputSanitization: true,
      enforceAuthenticationChecks: true,
      enforceAuthorizationChecks: true,
      enforceSecureStorage: true,
      enforceHTTPSOnly: true,
      enforceContentSecurityPolicy: true,
      checkDangerousPatterns: true,
      checkSQLInjection: true,
      checkPathTraversal: true,
      checkCommandInjection: true,
      enforceNorwegianCompliance: true,
      checkSecretsExposure: true,
      validateDependencySecurityEnabled: true,
      maxSecurityScore: 8.0,
      ...config,
    };
    
    this.initializeDangerousPatterns();
  }
  
  initializeRules(): void {
    const rules: ValidationRule[] = [
      // XSS Prevention
      createValidationRule(
        'security.xss-prevention',
        'XSS Prevention',
        'Prevent Cross-Site Scripting vulnerabilities',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.dangerous-html',
        'Dangerous HTML Injection',
        'Avoid dangerous HTML injection methods',
        'security',
        'error',
        true
      ),
      
      // SQL Injection Prevention
      createValidationRule(
        'security.sql-injection',
        'SQL Injection Prevention',
        'Prevent SQL injection vulnerabilities',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.parameterized-queries',
        'Parameterized Queries',
        'Use parameterized queries for database operations',
        'security',
        'error',
        true
      ),
      
      // Path Traversal Prevention
      createValidationRule(
        'security.path-traversal',
        'Path Traversal Prevention',
        'Prevent path traversal attacks',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.file-access',
        'Secure File Access',
        'Validate file paths and access permissions',
        'security',
        'error',
        true
      ),
      
      // Authentication & Authorization
      createValidationRule(
        'security.authentication',
        'Authentication Required',
        'Ensure proper authentication checks',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.authorization',
        'Authorization Required',
        'Ensure proper authorization checks',
        'security',
        'error',
        true
      ),
      
      // Secure Storage
      createValidationRule(
        'security.secure-storage',
        'Secure Storage',
        'Use secure methods for sensitive data storage',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.local-storage',
        'Local Storage Security',
        'Avoid storing sensitive data in local storage',
        'security',
        'warning',
        true
      ),
      
      // CSRF Protection
      createValidationRule(
        'security.csrf-protection',
        'CSRF Protection',
        'Implement CSRF protection for state-changing operations',
        'security',
        'error',
        true
      ),
      
      // Secrets Exposure
      createValidationRule(
        'security.secrets-exposure',
        'Secrets Exposure',
        'Prevent exposure of secrets and sensitive data',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.hardcoded-secrets',
        'Hardcoded Secrets',
        'Avoid hardcoding secrets in source code',
        'security',
        'error',
        true
      ),
      
      // Dangerous Functions
      createValidationRule(
        'security.dangerous-functions',
        'Dangerous Functions',
        'Avoid using dangerous functions that can lead to vulnerabilities',
        'security',
        'error',
        true
      ),
      
      // HTTPS Enforcement
      createValidationRule(
        'security.https-only',
        'HTTPS Only',
        'Enforce HTTPS for all communications',
        'security',
        'warning',
        true
      ),
      
      // Content Security Policy
      createValidationRule(
        'security.csp',
        'Content Security Policy',
        'Implement proper Content Security Policy',
        'security',
        'warning',
        true
      ),
      
      // Norwegian Compliance
      createValidationRule(
        'security.norwegian-compliance',
        'Norwegian Security Compliance',
        'Ensure compliance with Norwegian security standards (NSM)',
        'security',
        'error',
        true
      ),
      createValidationRule(
        'security.gdpr-compliance',
        'GDPR Security Requirements',
        'Ensure GDPR security requirements are met',
        'security',
        'error',
        true
      ),
    ];
    
    for (const rule of rules) {
      this.rules.set(rule.id, rule);
    }
  }
  
  getDefaultRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }
  
  async validateFile(file: string, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    try {
      // Check for secrets exposure
      if (this.config.checkSecretsExposure) {
        issues.push(...this.validateSecretsExposure(file, content));
      }
      
      // Check dangerous patterns in content
      if (this.config.checkDangerousPatterns) {
        issues.push(...this.validateDangerousPatterns(file, content));
      }
      
      // Skip non-JS/TS files for AST analysis
      if (!this.isJavaScriptFile(file)) {
        return issues;
      }
      
      // Parse AST for deeper analysis
      const ast = this.parseCode(content, file);
      if (ast) {
        // XSS Prevention
        if (this.config.enforceXSSPrevention) {
          issues.push(...this.validateXSSPrevention(file, ast));
        }
        
        // SQL Injection Prevention
        if (this.config.checkSQLInjection) {
          issues.push(...this.validateSQLInjection(file, ast));
        }
        
        // Path Traversal Prevention
        if (this.config.checkPathTraversal) {
          issues.push(...this.validatePathTraversal(file, ast));
        }
        
        // Authentication & Authorization
        if (this.config.enforceAuthenticationChecks) {
          issues.push(...this.validateAuthentication(file, ast));
        }
        
        if (this.config.enforceAuthorizationChecks) {
          issues.push(...this.validateAuthorization(file, ast));
        }
        
        // Secure Storage
        if (this.config.enforceSecureStorage) {
          issues.push(...this.validateSecureStorage(file, ast));
        }
        
        // Dangerous Functions
        issues.push(...this.validateDangerousFunctions(file, ast));
        
        // HTTPS Enforcement
        if (this.config.enforceHTTPSOnly) {
          issues.push(...this.validateHTTPSUsage(file, ast));
        }
        
        // Norwegian Compliance
        if (this.config.enforceNorwegianCompliance) {
          issues.push(...this.validateNorwegianCompliance(file, ast, content));
        }
      }
      
    } catch (error) {
      logger.error(`Security validation failed for ${file}:`, error);
      issues.push({
        id: `security-validation-error-${file}`,
        severity: 'error',
        category: 'security',
        message: 'Security validation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        file,
        rule: 'security.validation-error',
        fixable: false,
      });
    }
    
    return issues;
  }
  
  private isJavaScriptFile(file: string): boolean {
    return /\.(js|jsx|ts|tsx)$/.test(file);
  }
  
  private parseCode(content: string, file: string): t.File | null {
    try {
      const isTypeScript = /\.tsx?$/.test(file);
      const isJSX = /\.(jsx|tsx)$/.test(file);
      
      return babel.parse(content, {
        sourceType: 'module',
        plugins: [
          ...(isTypeScript ? ['typescript'] : []),
          ...(isJSX ? ['jsx'] : []),
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
        ],
      });
    } catch (error) {
      logger.debug(`Failed to parse ${file}:`, error);
      return null;
    }
  }
  
  private initializeDangerousPatterns(): void {
    this.dangerousPatterns = [
      {
        pattern: /document\.write\s*\(/gi,
        message: 'document.write() can lead to XSS vulnerabilities',
        severity: 'high',
        category: 'xss-vulnerability',
        description: 'document.write can inject malicious content',
        recommendation: 'Use safe DOM manipulation methods',
      },
      {
        pattern: /innerHTML\s*=.*\+/gi,
        message: 'String concatenation with innerHTML can lead to XSS',
        severity: 'high',
        category: 'xss-vulnerability',
        description: 'Dynamic innerHTML assignment without sanitization',
        recommendation: 'Use textContent or sanitize HTML content',
      },
      {
        pattern: /eval\s*\(/gi,
        message: 'eval() is dangerous and can lead to code injection',
        severity: 'critical',
        category: 'command-injection',
        description: 'eval() executes arbitrary code',
        recommendation: 'Use safer alternatives like JSON.parse',
      },
      {
        pattern: /new\s+Function\s*\(/gi,
        message: 'Function constructor can lead to code injection',
        severity: 'critical',
        category: 'command-injection',
        description: 'Function constructor executes arbitrary code',
        recommendation: 'Use predefined functions instead',
      },
      {
        pattern: /localStorage\.setItem\s*\([^,]*,\s*.*(?:password|token|secret|key)/gi,
        message: 'Storing sensitive data in localStorage is insecure',
        severity: 'high',
        category: 'insecure-storage',
        description: 'Local storage is accessible to all scripts',
        recommendation: 'Use secure storage mechanisms',
      },
      {
        pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
        message: 'Using HTTP instead of HTTPS for external URLs',
        severity: 'medium',
        category: 'insecure-communication',
        description: 'HTTP traffic is not encrypted',
        recommendation: 'Use HTTPS for all external communications',
      },
      {
        pattern: /\.\.\//gi,
        message: 'Path traversal pattern detected',
        severity: 'high',
        category: 'path-traversal',
        description: 'Directory traversal can access unauthorized files',
        recommendation: 'Validate and sanitize file paths',
      },
      {
        pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP).*\+.*FROM/gi,
        message: 'Potential SQL injection vulnerability',
        severity: 'high',
        category: 'sql-injection',
        description: 'String concatenation in SQL queries',
        recommendation: 'Use parameterized queries',
      },
    ];
  }
  
  private validateSecretsExposure(file: string, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');
    
    this.secretPatterns.forEach(pattern => {
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              id: `security-secret-exposure-${file}-${index + 1}`,
              severity: 'error',
              category: 'security',
              message: 'Potential secret exposure detected',
              description: `Possible hardcoded secret: ${match.substring(0, 30)}...`,
              file,
              line: index + 1,
              rule: 'security.secrets-exposure',
              fixable: false,
            });
          });
        }
      });
    });
    
    return issues;
  }
  
  private validateDangerousPatterns(file: string, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');
    
    this.dangerousPatterns.forEach(dangerousPattern => {
      lines.forEach((line, index) => {
        if (dangerousPattern.pattern.test(line)) {
          const severity = this.mapSecuritySeverityToValidationSeverity(dangerousPattern.severity);
          
          issues.push({
            id: `security-dangerous-pattern-${file}-${index + 1}`,
            severity,
            category: 'security',
            message: dangerousPattern.message,
            description: `${dangerousPattern.description}\nRecommendation: ${dangerousPattern.recommendation}`,
            file,
            line: index + 1,
            rule: 'security.dangerous-functions',
            fixable: false,
          });
        }
      });
    });
    
    return issues;
  }
  
  private validateXSSPrevention(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check for dangerous DOM manipulation
      MemberExpression(path) {
        const node = path.node;
        
        if (t.isIdentifier(node.property)) {
          const propertyName = node.property.name;
          
          // Check innerHTML usage
          if (propertyName === 'innerHTML') {
            const parent = path.parent;
            if (t.isAssignmentExpression(parent) && parent.operator === '=') {
              issues.push({
                id: `security-innerHTML-${file}-${node.loc?.start.line}`,
                severity: 'error',
                category: 'security',
                message: 'Dangerous innerHTML assignment',
                description: 'innerHTML can lead to XSS vulnerabilities',
                file,
                line: node.loc?.start.line,
                rule: 'security.xss-prevention',
                fixable: false,
              });
            }
          }
          
          // Check outerHTML usage
          if (propertyName === 'outerHTML') {
            issues.push({
              id: `security-outerHTML-${file}-${node.loc?.start.line}`,
              severity: 'error',
              category: 'security',
              message: 'Dangerous outerHTML usage',
              description: 'outerHTML can lead to XSS vulnerabilities',
              file,
              line: node.loc?.start.line,
              rule: 'security.xss-prevention',
              fixable: false,
            });
          }
        }
      },
      
      // Check for React dangerouslySetInnerHTML
      JSXAttribute(path) {
        const node = path.node;
        
        if (t.isJSXIdentifier(node.name) && node.name.name === 'dangerouslySetInnerHTML') {
          issues.push({
            id: `security-dangerous-inner-html-${file}-${node.loc?.start.line}`,
            severity: 'warning',
            category: 'security',
            message: 'Use of dangerouslySetInnerHTML',
            description: 'Ensure HTML content is properly sanitized before using dangerouslySetInnerHTML',
            file,
            line: node.loc?.start.line,
            rule: 'security.dangerous-html',
            fixable: false,
          });
        }
      },
    });
    
    return issues;
  }
  
  private validateSQLInjection(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check for SQL query construction
      TemplateLiteral(path) {
        const node = path.node;
        const templateString = node.quasis.map(q => q.value.cooked).join('${...}');
        
        // Check if template contains SQL keywords
        const upperTemplate = templateString.toUpperCase();
        const hasSQLKeywords = Array.from(this.sqlKeywords).some(keyword => 
          upperTemplate.includes(keyword)
        );
        
        if (hasSQLKeywords && node.expressions.length > 0) {
          issues.push({
            id: `security-sql-injection-${file}-${node.loc?.start.line}`,
            severity: 'error',
            category: 'security',
            message: 'Potential SQL injection vulnerability in template literal',
            description: 'SQL queries with user input should use parameterized queries',
            file,
            line: node.loc?.start.line,
            rule: 'security.sql-injection',
            fixable: false,
          });
        }
      },
      
      // Check for string concatenation with SQL
      BinaryExpression(path) {
        const node = path.node;
        
        if (node.operator === '+') {
          const leftString = this.getStringValue(node.left);
          const rightString = this.getStringValue(node.right);
          
          if (leftString || rightString) {
            const combinedString = (leftString || '') + (rightString || '');
            const upperString = combinedString.toUpperCase();
            
            const hasSQLKeywords = Array.from(this.sqlKeywords).some(keyword => 
              upperString.includes(keyword)
            );
            
            if (hasSQLKeywords) {
              issues.push({
                id: `security-sql-concat-${file}-${node.loc?.start.line}`,
                severity: 'error',
                category: 'security',
                message: 'Potential SQL injection via string concatenation',
                description: 'Use parameterized queries instead of string concatenation',
                file,
                line: node.loc?.start.line,
                rule: 'security.sql-injection',
                fixable: false,
              });
            }
          }
        }
      },
    });
    
    return issues;
  }
  
  private validatePathTraversal(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check file system operations
      CallExpression(path) {
        const node = path.node;
        
        if (t.isMemberExpression(node.callee)) {
          const object = node.callee.object;
          const property = node.callee.property;
          
          // Check fs operations
          if (t.isIdentifier(object) && object.name === 'fs' && 
              t.isIdentifier(property)) {
            
            const dangerousFSMethods = [
              'readFile', 'readFileSync', 'writeFile', 'writeFileSync',
              'open', 'openSync', 'unlink', 'unlinkSync'
            ];
            
            if (dangerousFSMethods.includes(property.name)) {
              // Check if first argument contains user input
              const firstArg = node.arguments[0];
              if (firstArg && !t.isStringLiteral(firstArg)) {
                issues.push({
                  id: `security-path-traversal-${file}-${node.loc?.start.line}`,
                  severity: 'error',
                  category: 'security',
                  message: `Potential path traversal in ${property.name}`,
                  description: 'Validate and sanitize file paths to prevent directory traversal',
                  file,
                  line: node.loc?.start.line,
                  rule: 'security.path-traversal',
                  fixable: false,
                });
              }
            }
          }
        }
      },
    });
    
    return issues;
  }
  
  private validateAuthentication(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check for API routes without authentication
      FunctionDeclaration(path) {
        const node = path.node;
        
        if (node.id && this.isAPIHandler(node.id.name)) {
          const hasAuthCheck = this.hasAuthenticationCheck(path);
          
          if (!hasAuthCheck) {
            issues.push({
              id: `security-missing-auth-${file}-${node.loc?.start.line}`,
              severity: 'warning',
              category: 'security',
              message: `API handler ${node.id.name} may be missing authentication`,
              description: 'API handlers should include authentication checks',
              file,
              line: node.loc?.start.line,
              rule: 'security.authentication',
              fixable: false,
            });
          }
        }
      },
    });
    
    return issues;
  }
  
  private validateAuthorization(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check for authorization in sensitive operations
      CallExpression(path) {
        const node = path.node;
        
        if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property)) {
          const methodName = node.callee.property.name;
          
          // Check for sensitive database operations
          const sensitiveOperations = ['delete', 'update', 'create', 'destroy'];
          
          if (sensitiveOperations.includes(methodName.toLowerCase())) {
            // Check if there's authorization logic nearby
            const hasAuthz = this.hasAuthorizationCheck(path);
            
            if (!hasAuthz) {
              issues.push({
                id: `security-missing-authz-${file}-${node.loc?.start.line}`,
                severity: 'warning',
                category: 'security',
                message: `Sensitive operation ${methodName} may lack authorization`,
                description: 'Sensitive operations should include authorization checks',
                file,
                line: node.loc?.start.line,
                rule: 'security.authorization',
                fixable: false,
              });
            }
          }
        }
      },
    });
    
    return issues;
  }
  
  private validateSecureStorage(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check localStorage usage
      MemberExpression(path) {
        const node = path.node;
        
        if (t.isIdentifier(node.object) && node.object.name === 'localStorage' &&
            t.isIdentifier(node.property) && node.property.name === 'setItem') {
          
          const parent = path.parent;
          if (t.isCallExpression(parent)) {
            const secondArg = parent.arguments[1];
            
            // Check if storing sensitive data patterns
            if (secondArg && this.containsSensitiveData(secondArg)) {
              issues.push({
                id: `security-insecure-storage-${file}-${node.loc?.start.line}`,
                severity: 'error',
                category: 'security',
                message: 'Storing sensitive data in localStorage',
                description: 'Sensitive data should not be stored in localStorage',
                file,
                line: node.loc?.start.line,
                rule: 'security.secure-storage',
                fixable: false,
              });
            }
          }
        }
      },
    });
    
    return issues;
  }
  
  private validateDangerousFunctions(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check for dangerous function calls
      CallExpression(path) {
        const node = path.node;
        
        if (t.isIdentifier(node.callee)) {
          const functionName = node.callee.name;
          
          if (this.dangerousFunctions.has(functionName)) {
            issues.push({
              id: `security-dangerous-function-${file}-${node.loc?.start.line}`,
              severity: 'error',
              category: 'security',
              message: `Dangerous function usage: ${functionName}`,
              description: `${functionName} can lead to security vulnerabilities`,
              file,
              line: node.loc?.start.line,
              rule: 'security.dangerous-functions',
              fixable: false,
            });
          }
        }
      },
    });
    
    return issues;
  }
  
  private validateHTTPSUsage(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      // Check for HTTP URLs
      StringLiteral(path) {
        const node = path.node;
        
        if (node.value.startsWith('http://') && 
            !node.value.includes('localhost') && 
            !node.value.includes('127.0.0.1')) {
          
          issues.push({
            id: `security-http-url-${file}-${node.loc?.start.line}`,
            severity: 'warning',
            category: 'security',
            message: 'Using HTTP instead of HTTPS',
            description: 'External URLs should use HTTPS for secure communication',
            file,
            line: node.loc?.start.line,
            rule: 'security.https-only',
            fixable: true,
            autofix: {
              description: 'Convert HTTP to HTTPS',
              operation: 'replace',
              target: node.value,
              replacement: node.value.replace('http://', 'https://'),
            },
          });
        }
      },
    });
    
    return issues;
  }
  
  private validateNorwegianCompliance(file: string, ast: t.File, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for NSM compliance markers
    if (!content.includes('NSM') && !content.includes('GDPR') && 
        file.includes('auth') || file.includes('security')) {
      issues.push({
        id: `security-nsm-compliance-${file}`,
        severity: 'info',
        category: 'security',
        message: 'Consider NSM compliance documentation',
        description: 'Security-related files should include NSM compliance information',
        file,
        rule: 'security.norwegian-compliance',
        fixable: false,
      });
    }
    
    // Check for GDPR compliance in data handling
    traverse(ast, {
      CallExpression(path) {
        const node = path.node;
        
        if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property)) {
          const methodName = node.callee.property.name;
          
          // Check for data collection methods
          if (['save', 'create', 'store', 'log'].includes(methodName.toLowerCase())) {
            // Look for personal data indicators
            const hasPersonalData = this.hasPersonalDataIndicators(node);
            
            if (hasPersonalData) {
              issues.push({
                id: `security-gdpr-compliance-${file}-${node.loc?.start.line}`,
                severity: 'warning',
                category: 'security',
                message: 'Personal data handling detected',
                description: 'Ensure GDPR compliance for personal data processing',
                file,
                line: node.loc?.start.line,
                rule: 'security.gdpr-compliance',
                fixable: false,
              });
            }
          }
        }
      },
    });
    
    return issues;
  }
  
  // Helper methods
  private mapSecuritySeverityToValidationSeverity(severity: SecuritySeverity): ValidationSeverity {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      case 'info':
      default:
        return 'info';
    }
  }
  
  private getStringValue(node: t.Node): string | null {
    if (t.isStringLiteral(node)) {
      return node.value;
    }
    if (t.isTemplateLiteral(node)) {
      return node.quasis.map(q => q.value.cooked).join('${...}');
    }
    return null;
  }
  
  private isAPIHandler(functionName: string): boolean {
    const apiPatterns = ['handler', 'api', 'endpoint', 'route'];
    return apiPatterns.some(pattern => 
      functionName.toLowerCase().includes(pattern)
    );
  }
  
  private hasAuthenticationCheck(path: any): boolean {
    // Simple heuristic to check for authentication patterns
    let hasAuth = false;
    
    path.traverse({
      Identifier(innerPath: any) {
        const name = innerPath.node.name.toLowerCase();
        if (name.includes('auth') || name.includes('token') || name.includes('user')) {
          hasAuth = true;
        }
      },
    });
    
    return hasAuth;
  }
  
  private hasAuthorizationCheck(path: any): boolean {
    // Simple heuristic to check for authorization patterns
    let hasAuthz = false;
    
    // Look in the same scope for authorization checks
    const scope = path.scope;
    scope.traverse(scope.block, {
      Identifier(innerPath: any) {
        const name = innerPath.node.name.toLowerCase();
        if (name.includes('role') || name.includes('permission') || 
            name.includes('authorize') || name.includes('allow')) {
          hasAuthz = true;
        }
      },
    });
    
    return hasAuthz;
  }
  
  private containsSensitiveData(node: t.Node): boolean {
    const sensitiveKeywords = ['password', 'token', 'secret', 'key', 'auth'];
    
    if (t.isStringLiteral(node)) {
      return sensitiveKeywords.some(keyword => 
        node.value.toLowerCase().includes(keyword)
      );
    }
    
    if (t.isIdentifier(node)) {
      return sensitiveKeywords.some(keyword => 
        node.name.toLowerCase().includes(keyword)
      );
    }
    
    return false;
  }
  
  private hasPersonalDataIndicators(node: t.CallExpression): boolean {
    const personalDataKeywords = [
      'email', 'name', 'address', 'phone', 'birth', 'ssn', 'id',
      'personal', 'profile', 'user', 'customer', 'contact'
    ];
    
    // Check arguments for personal data indicators
    return node.arguments.some(arg => {
      if (t.isObjectExpression(arg)) {
        return arg.properties.some(prop => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            return personalDataKeywords.some(keyword => 
              prop.key.name.toLowerCase().includes(keyword)
            );
          }
          return false;
        });
      }
      return false;
    });
  }
}

// Export utility functions
export function createSecurityValidator(
  config?: Partial<SecurityConfig>
): SecurityValidator {
  return new SecurityValidator(config);
}

export function getDefaultSecurityConfig(): SecurityConfig {
  return {
    enforceCSRFProtection: true,
    enforceXSSPrevention: true,
    enforceInputSanitization: true,
    enforceAuthenticationChecks: true,
    enforceAuthorizationChecks: true,
    enforceSecureStorage: true,
    enforceHTTPSOnly: true,
    enforceContentSecurityPolicy: true,
    checkDangerousPatterns: true,
    checkSQLInjection: true,
    checkPathTraversal: true,
    checkCommandInjection: true,
    enforceNorwegianCompliance: true,
    checkSecretsExposure: true,
    validateDependencySecurityEnabled: true,
    maxSecurityScore: 8.0,
  };
}