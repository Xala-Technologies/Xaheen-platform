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

// SOLID principles validation configuration
export interface SOLIDConfig {
  maxClassMethods: number;
  maxInterfaceMethods: number;
  maxFunctionParameters: number;
  maxClassDependencies: number;
  enforceInterfaceSegregation: boolean;
  enforceDependencyInversion: boolean;
  enforceOpenClosed: boolean;
  enforceLiskovSubstitution: boolean;
  enforceSingleResponsibility: boolean;
  allowedCouplingScore: number;
  maxClassSize: number;
  maxFileExports: number;
}

// Class analysis result
export interface ClassAnalysis {
  name: string;
  methods: string[];
  properties: string[];
  dependencies: string[];
  imports: string[];
  exports: string[];
  complexity: number;
  responsibilities: string[];
  isAbstract: boolean;
  implementsInterfaces: string[];
  extendsClass?: string;
}

// Interface analysis result
export interface InterfaceAnalysis {
  name: string;
  methods: string[];
  properties: string[];
  cohesion: number;
  size: number;
}

// Function analysis result
export interface FunctionAnalysis {
  name: string;
  parameters: string[];
  dependencies: string[];
  returnType?: string;
  complexity: number;
  responsibilities: string[];
}

// SOLID principles validator implementation
export class SOLIDValidator extends BaseValidator {
  private config: SOLIDConfig;
  
  constructor(config: Partial<SOLIDConfig> = {}) {
    super({
      rules: [],
      severity: 'warning',
      autofix: false,
      exclude: ['node_modules/**', 'dist/**', 'build/**', '**/*.test.ts', '**/*.test.tsx'],
      include: ['**/*.ts', '**/*.tsx'],
      failFast: false,
      maxIssues: 1000,
    });
    
    this.config = {
      maxClassMethods: 10,
      maxInterfaceMethods: 5,
      maxFunctionParameters: 5,
      maxClassDependencies: 7,
      enforceInterfaceSegregation: true,
      enforceDependencyInversion: true,
      enforceOpenClosed: true,
      enforceLiskovSubstitution: true,
      enforceSingleResponsibility: true,
      allowedCouplingScore: 10,
      maxClassSize: 200,
      maxFileExports: 5,
      ...config,
    };
  }
  
  initializeRules(): void {
    const rules: ValidationRule[] = [
      // Single Responsibility Principle (SRP)
      createValidationRule(
        'solid.srp.class-size',
        'Class Size (SRP)',
        `Classes should not exceed ${this.config.maxClassSize} lines`,
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.srp.method-count',
        'Method Count (SRP)',
        `Classes should not have more than ${this.config.maxClassMethods} methods`,
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.srp.file-exports',
        'File Exports (SRP)',
        `Files should not export more than ${this.config.maxFileExports} public entities`,
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.srp.mixed-concerns',
        'Mixed Concerns (SRP)',
        'Classes should not mix different types of responsibilities',
        'solid',
        'error',
        true
      ),
      
      // Open/Closed Principle (OCP)
      createValidationRule(
        'solid.ocp.switch-statements',
        'Switch Statements (OCP)',
        'Consider using polymorphism instead of switch statements',
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.ocp.type-checking',
        'Type Checking (OCP)',
        'Avoid explicit type checking; use polymorphism',
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.ocp.extension-over-modification',
        'Extension Over Modification (OCP)',
        'Prefer extension over modification of existing code',
        'solid',
        'info',
        true
      ),
      
      // Liskov Substitution Principle (LSP)
      createValidationRule(
        'solid.lsp.parameter-compatibility',
        'Parameter Compatibility (LSP)',
        'Subclass methods should accept same or broader parameter types',
        'solid',
        'error',
        true
      ),
      createValidationRule(
        'solid.lsp.return-compatibility',
        'Return Compatibility (LSP)',
        'Subclass methods should return same or narrower return types',
        'solid',
        'error',
        true
      ),
      createValidationRule(
        'solid.lsp.behavioral-substitution',
        'Behavioral Substitution (LSP)',
        'Subclasses should be behaviorally substitutable for their base classes',
        'solid',
        'warning',
        true
      ),
      
      // Interface Segregation Principle (ISP)
      createValidationRule(
        'solid.isp.interface-size',
        'Interface Size (ISP)',
        `Interfaces should not have more than ${this.config.maxInterfaceMethods} methods`,
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.isp.interface-cohesion',
        'Interface Cohesion (ISP)',
        'Interface methods should be cohesive',
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.isp.fat-interface',
        'Fat Interface (ISP)',
        'Interfaces should not force clients to depend on unused methods',
        'solid',
        'error',
        true
      ),
      
      // Dependency Inversion Principle (DIP)
      createValidationRule(
        'solid.dip.concrete-dependencies',
        'Concrete Dependencies (DIP)',
        'Depend on abstractions, not concretions',
        'solid',
        'error',
        true
      ),
      createValidationRule(
        'solid.dip.dependency-injection',
        'Dependency Injection (DIP)',
        'Use dependency injection instead of creating dependencies',
        'solid',
        'warning',
        true
      ),
      createValidationRule(
        'solid.dip.coupling',
        'High Coupling (DIP)',
        `Coupling score should not exceed ${this.config.allowedCouplingScore}`,
        'solid',
        'warning',
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
  
  async validateFile(file: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Skip non-TypeScript files
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
        return issues;
      }
      
      // Parse AST
      const ast = this.parseTypeScript(content, file);
      if (!ast) {
        return issues;
      }
      
      // Analyze file structure
      const analysis = this.analyzeFile(ast, content);
      
      // Apply SOLID validations
      if (this.config.enforceSingleResponsibility) {
        issues.push(...this.validateSRP(file, analysis, content));
      }
      
      if (this.config.enforceOpenClosed) {
        issues.push(...this.validateOCP(file, analysis, ast));
      }
      
      if (this.config.enforceLiskovSubstitution) {
        issues.push(...this.validateLSP(file, analysis, ast));
      }
      
      if (this.config.enforceInterfaceSegregation) {
        issues.push(...this.validateISP(file, analysis));
      }
      
      if (this.config.enforceDependencyInversion) {
        issues.push(...this.validateDIP(file, analysis, ast));
      }
      
    } catch (error) {
      logger.error(`SOLID validation failed for ${file}:`, error);
      issues.push({
        id: `solid-validation-error-${file}`,
        severity: 'error',
        category: 'solid',
        message: 'SOLID validation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        file,
        rule: 'solid.validation-error',
        fixable: false,
      });
    }
    
    return issues;
  }
  
  private parseTypeScript(content: string, file: string): t.File | null {
    try {
      return babel.parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
        ],
      });
    } catch (error) {
      logger.debug(`Failed to parse TypeScript file ${file}:`, error);
      return null;
    }
  }
  
  private analyzeFile(ast: t.File, content: string): {
    classes: ClassAnalysis[];
    interfaces: InterfaceAnalysis[];
    functions: FunctionAnalysis[];
    imports: string[];
    exports: string[];
    lines: number;
  } {
    const classes: ClassAnalysis[] = [];
    const interfaces: InterfaceAnalysis[] = [];
    const functions: FunctionAnalysis[] = [];
    const imports: string[] = [];
    const exports: string[] = [];
    const lines = content.split('\n').length;
    
    traverse(ast, {
      ImportDeclaration(path) {
        if (t.isStringLiteral(path.node.source)) {
          imports.push(path.node.source.value);
        }
      },
      
      ExportDeclaration(path) {
        if (t.isExportNamedDeclaration(path.node)) {
          path.node.specifiers?.forEach(spec => {
            if (t.isExportSpecifier(spec) && t.isIdentifier(spec.exported)) {
              exports.push(spec.exported.name);
            }
          });
        }
      },
      
      ClassDeclaration(path) {
        const analysis = this.analyzeClass(path);
        if (analysis) {
          classes.push(analysis);
        }
      },
      
      TSInterfaceDeclaration(path) {
        const analysis = this.analyzeInterface(path);
        if (analysis) {
          interfaces.push(analysis);
        }
      },
      
      'FunctionDeclaration|ArrowFunctionExpression'(path) {
        const analysis = this.analyzeFunction(path);
        if (analysis) {
          functions.push(analysis);
        }
      },
    });
    
    return { classes, interfaces, functions, imports, exports, lines };
  }
  
  private analyzeClass(path: any): ClassAnalysis | null {
    const node = path.node;
    
    if (!t.isClassDeclaration(node) || !node.id) {
      return null;
    }
    
    const methods: string[] = [];
    const properties: string[] = [];
    const dependencies: string[] = [];
    const implementsInterfaces: string[] = [];
    
    // Get implemented interfaces
    if (node.implements) {
      node.implements.forEach((impl: any) => {
        if (t.isTSExpressionWithTypeArguments(impl) && t.isIdentifier(impl.expression)) {
          implementsInterfaces.push(impl.expression.name);
        }
      });
    }
    
    // Get extended class
    let extendsClass: string | undefined;
    if (node.superClass && t.isIdentifier(node.superClass)) {
      extendsClass = node.superClass.name;
    }
    
    // Analyze class body
    node.body.body.forEach((member: any) => {
      if (t.isMethodDefinition(member) && t.isIdentifier(member.key)) {
        methods.push(member.key.name);
      } else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
        properties.push(member.key.name);
      }
    });
    
    // Calculate complexity and responsibilities
    const complexity = this.calculateClassComplexity(path);
    const responsibilities = this.identifyResponsibilities(methods, properties);
    
    return {
      name: node.id.name,
      methods,
      properties,
      dependencies,
      imports: [],
      exports: [],
      complexity,
      responsibilities,
      isAbstract: node.abstract || false,
      implementsInterfaces,
      extendsClass,
    };
  }
  
  private analyzeInterface(path: any): InterfaceAnalysis | null {
    const node = path.node;
    
    if (!t.isTSInterfaceDeclaration(node)) {
      return null;
    }
    
    const methods: string[] = [];
    const properties: string[] = [];
    
    node.body.body.forEach((member: any) => {
      if (t.isTSMethodSignature(member) && t.isIdentifier(member.key)) {
        methods.push(member.key.name);
      } else if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
        properties.push(member.key.name);
      }
    });
    
    const cohesion = this.calculateInterfaceCohesion(methods, properties);
    const size = methods.length + properties.length;
    
    return {
      name: node.id.name,
      methods,
      properties,
      cohesion,
      size,
    };
  }
  
  private analyzeFunction(path: any): FunctionAnalysis | null {
    const node = path.node;
    let name = 'anonymous';
    
    if (t.isFunctionDeclaration(node) && node.id) {
      name = node.id.name;
    } else if (path.parent && t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
      name = path.parent.id.name;
    }
    
    const parameters: string[] = [];
    node.params.forEach((param: any) => {
      if (t.isIdentifier(param)) {
        parameters.push(param.name);
      }
    });
    
    const complexity = this.calculateFunctionComplexity(path);
    const responsibilities = this.identifyFunctionResponsibilities(path);
    
    return {
      name,
      parameters,
      dependencies: [],
      complexity,
      responsibilities,
    };
  }
  
  // Single Responsibility Principle validation
  private validateSRP(file: string, analysis: any, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check file exports
    if (analysis.exports.length > this.config.maxFileExports) {
      issues.push({
        id: `solid-srp-file-exports-${file}`,
        severity: 'warning',
        category: 'solid',
        message: `Too many exports: ${analysis.exports.length} (max: ${this.config.maxFileExports})`,
        description: 'Files with many exports may have multiple responsibilities',
        file,
        rule: 'solid.srp.file-exports',
        fixable: false,
      });
    }
    
    // Check class sizes and method counts
    analysis.classes.forEach((classAnalysis: ClassAnalysis) => {
      if (classAnalysis.methods.length > this.config.maxClassMethods) {
        issues.push({
          id: `solid-srp-method-count-${file}-${classAnalysis.name}`,
          severity: 'warning',
          category: 'solid',
          message: `Class ${classAnalysis.name} has too many methods: ${classAnalysis.methods.length} (max: ${this.config.maxClassMethods})`,
          description: 'Classes with many methods may have multiple responsibilities',
          file,
          rule: 'solid.srp.method-count',
          fixable: false,
        });
      }
      
      // Check for mixed concerns
      if (classAnalysis.responsibilities.length > 2) {
        issues.push({
          id: `solid-srp-mixed-concerns-${file}-${classAnalysis.name}`,
          severity: 'error',
          category: 'solid',
          message: `Class ${classAnalysis.name} has mixed concerns: ${classAnalysis.responsibilities.join(', ')}`,
          description: 'Classes should have a single responsibility',
          file,
          rule: 'solid.srp.mixed-concerns',
          fixable: false,
        });
      }
    });
    
    return issues;
  }
  
  // Open/Closed Principle validation
  private validateOCP(file: string, analysis: any, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      SwitchStatement(path) {
        const node = path.node;
        
        if (node.cases.length > 3) {
          issues.push({
            id: `solid-ocp-switch-${file}-${node.loc?.start.line}`,
            severity: 'warning',
            category: 'solid',
            message: 'Large switch statement detected',
            description: 'Consider using polymorphism instead of switch statements',
            file,
            line: node.loc?.start.line,
            rule: 'solid.ocp.switch-statements',
            fixable: false,
          });
        }
      },
      
      // Detect type checking patterns
      BinaryExpression(path) {
        const node = path.node;
        
        if (node.operator === 'instanceof' || 
            (node.operator === '===' && this.isTypeofExpression(node.left))) {
          issues.push({
            id: `solid-ocp-type-check-${file}-${node.loc?.start.line}`,
            severity: 'warning',
            category: 'solid',
            message: 'Explicit type checking detected',
            description: 'Consider using polymorphism instead of type checking',
            file,
            line: node.loc?.start.line,
            rule: 'solid.ocp.type-checking',
            fixable: false,
          });
        }
      },
    });
    
    return issues;
  }
  
  // Liskov Substitution Principle validation
  private validateLSP(file: string, analysis: any, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for parameter and return type compatibility in inheritance
    analysis.classes.forEach((classAnalysis: ClassAnalysis) => {
      if (classAnalysis.extendsClass) {
        // This would require more sophisticated analysis with type information
        // For now, we'll add a basic check
        issues.push({
          id: `solid-lsp-inheritance-${file}-${classAnalysis.name}`,
          severity: 'info',
          category: 'solid',
          message: `Class ${classAnalysis.name} extends ${classAnalysis.extendsClass}`,
          description: 'Ensure subclass is behaviorally substitutable for its superclass',
          file,
          rule: 'solid.lsp.behavioral-substitution',
          fixable: false,
        });
      }
    });
    
    return issues;
  }
  
  // Interface Segregation Principle validation
  private validateISP(file: string, analysis: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    analysis.interfaces.forEach((interfaceAnalysis: InterfaceAnalysis) => {
      // Check interface size
      if (interfaceAnalysis.methods.length > this.config.maxInterfaceMethods) {
        issues.push({
          id: `solid-isp-interface-size-${file}-${interfaceAnalysis.name}`,
          severity: 'warning',
          category: 'solid',
          message: `Interface ${interfaceAnalysis.name} has too many methods: ${interfaceAnalysis.methods.length} (max: ${this.config.maxInterfaceMethods})`,
          description: 'Consider splitting large interfaces into smaller, focused ones',
          file,
          rule: 'solid.isp.interface-size',
          fixable: false,
        });
      }
      
      // Check cohesion
      if (interfaceAnalysis.cohesion < 0.5) {
        issues.push({
          id: `solid-isp-cohesion-${file}-${interfaceAnalysis.name}`,
          severity: 'warning',
          category: 'solid',
          message: `Interface ${interfaceAnalysis.name} has low cohesion (${interfaceAnalysis.cohesion.toFixed(2)})`,
          description: 'Interface methods should be related and cohesive',
          file,
          rule: 'solid.isp.interface-cohesion',
          fixable: false,
        });
      }
    });
    
    return issues;
  }
  
  // Dependency Inversion Principle validation
  private validateDIP(file: string, analysis: any, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for concrete dependencies
    traverse(ast, {
      NewExpression(path) {
        const node = path.node;
        
        if (t.isIdentifier(node.callee)) {
          issues.push({
            id: `solid-dip-concrete-dependency-${file}-${node.loc?.start.line}`,
            severity: 'warning',
            category: 'solid',
            message: `Direct instantiation of ${node.callee.name}`,
            description: 'Consider using dependency injection instead of direct instantiation',
            file,
            line: node.loc?.start.line,
            rule: 'solid.dip.dependency-injection',
            fixable: false,
          });
        }
      },
    });
    
    // Check coupling score
    analysis.classes.forEach((classAnalysis: ClassAnalysis) => {
      const couplingScore = this.calculateCouplingScore(classAnalysis);
      
      if (couplingScore > this.config.allowedCouplingScore) {
        issues.push({
          id: `solid-dip-coupling-${file}-${classAnalysis.name}`,
          severity: 'warning',
          category: 'solid',
          message: `Class ${classAnalysis.name} has high coupling score: ${couplingScore} (max: ${this.config.allowedCouplingScore})`,
          description: 'High coupling indicates tight dependencies; consider using abstractions',
          file,
          rule: 'solid.dip.coupling',
          fixable: false,
        });
      }
    });
    
    return issues;
  }
  
  // Helper methods for analysis
  private calculateClassComplexity(path: any): number {
    let complexity = 1;
    
    path.traverse({
      'IfStatement|ConditionalExpression|SwitchCase|ForStatement|WhileStatement'() {
        complexity++;
      },
    });
    
    return complexity;
  }
  
  private calculateFunctionComplexity(path: any): number {
    let complexity = 1;
    
    path.traverse({
      'IfStatement|ConditionalExpression|SwitchCase|ForStatement|WhileStatement|LogicalExpression'() {
        complexity++;
      },
    });
    
    return complexity;
  }
  
  private calculateInterfaceCohesion(methods: string[], properties: string[]): number {
    // Simple cohesion calculation based on naming similarity
    const allNames = [...methods, ...properties];
    
    if (allNames.length < 2) return 1;
    
    let similarityCount = 0;
    let totalPairs = 0;
    
    for (let i = 0; i < allNames.length; i++) {
      for (let j = i + 1; j < allNames.length; j++) {
        totalPairs++;
        if (this.calculateNameSimilarity(allNames[i], allNames[j]) > 0.3) {
          similarityCount++;
        }
      }
    }
    
    return totalPairs > 0 ? similarityCount / totalPairs : 1;
  }
  
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Simple Jaccard similarity based on common substrings
    const tokens1 = this.tokenizeName(name1);
    const tokens2 = this.tokenizeName(name2);
    
    const intersection = tokens1.filter(token => tokens2.includes(token));
    const union = [...new Set([...tokens1, ...tokens2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }
  
  private tokenizeName(name: string): string[] {
    // Split camelCase and PascalCase into tokens
    return name.replace(/([A-Z])/g, ' $1').toLowerCase().split(/\s+/).filter(Boolean);
  }
  
  private identifyResponsibilities(methods: string[], properties: string[]): string[] {
    const responsibilities: Set<string> = new Set();
    const allNames = [...methods, ...properties];
    
    // Simple heuristic-based responsibility identification
    allNames.forEach(name => {
      const lower = name.toLowerCase();
      
      if (lower.includes('render') || lower.includes('display') || lower.includes('show')) {
        responsibilities.add('rendering');
      }
      if (lower.includes('save') || lower.includes('store') || lower.includes('persist')) {
        responsibilities.add('data-persistence');
      }
      if (lower.includes('validate') || lower.includes('check') || lower.includes('verify')) {
        responsibilities.add('validation');
      }
      if (lower.includes('calculate') || lower.includes('compute') || lower.includes('process')) {
        responsibilities.add('computation');
      }
      if (lower.includes('handle') || lower.includes('on') || lower.includes('event')) {
        responsibilities.add('event-handling');
      }
    });
    
    return Array.from(responsibilities);
  }
  
  private identifyFunctionResponsibilities(path: any): string[] {
    const responsibilities: Set<string> = new Set();
    
    path.traverse({
      CallExpression(innerPath: any) {
        const node = innerPath.node;
        
        if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property)) {
          const method = node.callee.property.name.toLowerCase();
          
          if (method.includes('render') || method.includes('create')) {
            responsibilities.add('rendering');
          }
          if (method.includes('save') || method.includes('update')) {
            responsibilities.add('data-persistence');
          }
          if (method.includes('validate')) {
            responsibilities.add('validation');
          }
        }
      },
    });
    
    return Array.from(responsibilities);
  }
  
  private calculateCouplingScore(classAnalysis: ClassAnalysis): number {
    // Simple coupling score based on dependencies and imports
    return classAnalysis.dependencies.length + 
           classAnalysis.imports.length + 
           classAnalysis.implementsInterfaces.length +
           (classAnalysis.extendsClass ? 1 : 0);
  }
  
  private isTypeofExpression(node: any): boolean {
    return t.isUnaryExpression(node) && node.operator === 'typeof';
  }
}

// Export utility functions
export function createSOLIDValidator(config?: Partial<SOLIDConfig>): SOLIDValidator {
  return new SOLIDValidator(config);
}

export function getDefaultSOLIDConfig(): SOLIDConfig {
  return {
    maxClassMethods: 10,
    maxInterfaceMethods: 5,
    maxFunctionParameters: 5,
    maxClassDependencies: 7,
    enforceInterfaceSegregation: true,
    enforceDependencyInversion: true,
    enforceOpenClosed: true,
    enforceLiskovSubstitution: true,
    enforceSingleResponsibility: true,
    allowedCouplingScore: 10,
    maxClassSize: 200,
    maxFileExports: 5,
  };
}