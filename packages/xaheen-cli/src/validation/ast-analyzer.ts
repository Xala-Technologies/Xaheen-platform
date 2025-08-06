/**
 * AST Analyzer - Advanced TypeScript/JavaScript AST parsing for validation
 * 
 * Provides deep code analysis for:
 * - TypeScript interface validation
 * - Component return type analysis
 * - Import/export validation
 * - React component pattern detection
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { parse } from '@typescript-eslint/parser';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

export interface ASTAnalysisResult {
  readonly interfaces: InterfaceAnalysis[];
  readonly components: ComponentAnalysis[];
  readonly imports: ImportAnalysis[];
  readonly exports: ExportAnalysis[];
  readonly issues: ASTIssue[];
}

export interface InterfaceAnalysis {
  readonly name: string;
  readonly properties: PropertyAnalysis[];
  readonly isPropsInterface: boolean;
  readonly hasReadonlyProperties: boolean;
  readonly location: CodeLocation;
}

export interface PropertyAnalysis {
  readonly name: string;
  readonly type: string;
  readonly isReadonly: boolean;
  readonly isOptional: boolean;
  readonly location: CodeLocation;
}

export interface ComponentAnalysis {
  readonly name: string;
  readonly returnType: string | null;
  readonly hasJSXReturnType: boolean;
  readonly props: string | null;
  readonly isExported: boolean;
  readonly location: CodeLocation;
  readonly jsx: JSXElementAnalysis[];
}

export interface JSXElementAnalysis {
  readonly tagName: string;
  readonly attributes: JSXAttributeAnalysis[];
  readonly isInteractive: boolean;
  readonly hasAriaLabel: boolean;
  readonly hasKeyboardHandler: boolean;
  readonly location: CodeLocation;
}

export interface JSXAttributeAnalysis {
  readonly name: string;
  readonly value: string;
  readonly location: CodeLocation;
}

export interface ImportAnalysis {
  readonly source: string;
  readonly specifiers: string[];
  readonly isDesignSystemImport: boolean;
  readonly location: CodeLocation;
}

export interface ExportAnalysis {
  readonly name: string;
  readonly type: 'default' | 'named';
  readonly location: CodeLocation;
}

export interface ASTIssue {
  readonly type: 'typescript' | 'accessibility' | 'imports' | 'components';
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly location: CodeLocation;
  readonly ruleId: string;
}

export interface CodeLocation {
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
}

// =============================================================================
// AST ANALYZER CLASS
// =============================================================================

export class ASTAnalyzer {
  private sourceCode: string;
  private ast: TSESTree.Program | null = null;
  private filePath: string;

  constructor(sourceCode: string, filePath: string) {
    this.sourceCode = sourceCode;
    this.filePath = filePath;
    this.parseAST();
  }

  /**
   * Analyze the entire AST
   */
  public analyze(): ASTAnalysisResult {
    if (!this.ast) {
      return {
        interfaces: [],
        components: [],
        imports: [],
        exports: [],
        issues: [{
          type: 'typescript',
          severity: 'error',
          message: 'Failed to parse TypeScript/JavaScript code',
          location: { line: 1, column: 1 },
          ruleId: 'ast-parse-error'
        }]
      };
    }

    const result: ASTAnalysisResult = {
      interfaces: [],
      components: [],
      imports: [],
      exports: [],
      issues: []
    };

    this.walkAST(this.ast, result);
    
    return result;
  }

  /**
   * Get specific analysis results
   */
  public getInterfaces(): InterfaceAnalysis[] {
    return this.analyze().interfaces;
  }

  public getComponents(): ComponentAnalysis[] {
    return this.analyze().components;
  }

  public getImports(): ImportAnalysis[] {
    return this.analyze().imports;
  }

  // =============================================================================
  // AST PARSING
  // =============================================================================

  private parseAST(): void {
    try {
      this.ast = parse(this.sourceCode, {
        loc: true,
        range: true,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: this.filePath.endsWith('.tsx') || this.filePath.endsWith('.jsx')
        }
      });
    } catch (error) {
      console.warn(`AST parsing failed for ${this.filePath}:`, error.message);
      this.ast = null;
    }
  }

  private walkAST(node: TSESTree.Node, result: ASTAnalysisResult): void {
    switch (node.type) {
      case AST_NODE_TYPES.TSInterfaceDeclaration:
        this.analyzeInterface(node as TSESTree.TSInterfaceDeclaration, result);
        break;
        
      case AST_NODE_TYPES.VariableDeclaration:
        this.analyzeVariableDeclaration(node as TSESTree.VariableDeclaration, result);
        break;
        
      case AST_NODE_TYPES.FunctionDeclaration:
        this.analyzeFunctionDeclaration(node as TSESTree.FunctionDeclaration, result);
        break;
        
      case AST_NODE_TYPES.ImportDeclaration:
        this.analyzeImportDeclaration(node as TSESTree.ImportDeclaration, result);
        break;
        
      case AST_NODE_TYPES.ExportDefaultDeclaration:
      case AST_NODE_TYPES.ExportNamedDeclaration:
        this.analyzeExportDeclaration(node as TSESTree.ExportDefaultDeclaration | TSESTree.ExportNamedDeclaration, result);
        break;
    }

    // Recursively walk child nodes
    for (const key in node) {
      const child = (node as any)[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && item.type) {
            this.walkAST(item, result);
          }
        }
      } else if (child && typeof child === 'object' && child.type) {
        this.walkAST(child, result);
      }
    }
  }

  // =============================================================================
  // ANALYSIS METHODS
  // =============================================================================

  private analyzeInterface(node: TSESTree.TSInterfaceDeclaration, result: ASTAnalysisResult): void {
    const interfaceName = node.id.name;
    const isPropsInterface = interfaceName.endsWith('Props');
    
    const properties: PropertyAnalysis[] = [];
    let hasReadonlyProperties = false;

    for (const member of node.body.body) {
      if (member.type === AST_NODE_TYPES.TSPropertySignature && member.key.type === AST_NODE_TYPES.Identifier) {
        const propName = member.key.name;
        const isReadonly = member.readonly || false;
        const isOptional = member.optional || false;
        
        if (isReadonly) {
          hasReadonlyProperties = true;
        }

        properties.push({
          name: propName,
          type: this.getTypeString(member.typeAnnotation),
          isReadonly,
          isOptional,
          location: this.getLocation(member)
        });

        // Check for CLAUDE.md compliance issues
        if (isPropsInterface && !isReadonly) {
          result.issues.push({
            type: 'typescript',
            severity: 'error',
            message: `Property '${propName}' in ${interfaceName} should be readonly`,
            location: this.getLocation(member),
            ruleId: 'claude-readonly-props'
          });
        }
      }
    }

    result.interfaces.push({
      name: interfaceName,
      properties,
      isPropsInterface,
      hasReadonlyProperties,
      location: this.getLocation(node)
    });
  }

  private analyzeVariableDeclaration(node: TSESTree.VariableDeclaration, result: ASTAnalysisResult): void {
    for (const declarator of node.declarations) {
      if (declarator.id.type === AST_NODE_TYPES.Identifier && declarator.init) {
        const componentName = declarator.id.name;
        
        // Check if this is a React component (starts with uppercase)
        if (this.isComponentName(componentName)) {
          const analysis = this.analyzeComponent(declarator, result);
          if (analysis) {
            result.components.push(analysis);
          }
        }
      }
    }
  }

  private analyzeFunctionDeclaration(node: TSESTree.FunctionDeclaration, result: ASTAnalysisResult): void {
    if (node.id && this.isComponentName(node.id.name)) {
      const analysis = this.analyzeFunctionComponent(node, result);
      if (analysis) {
        result.components.push(analysis);
      }
    }
  }

  private analyzeComponent(declarator: TSESTree.VariableDeclarator, result: ASTAnalysisResult): ComponentAnalysis | null {
    if (declarator.id.type !== AST_NODE_TYPES.Identifier || !declarator.init) {
      return null;
    }

    const componentName = declarator.id.name;
    let returnType: string | null = null;
    let hasJSXReturnType = false;

    // Check for return type annotation
    if (declarator.id.typeAnnotation) {
      returnType = this.getTypeString(declarator.id.typeAnnotation);
      hasJSXReturnType = returnType?.includes('JSX.Element') || false;
    }

    // Analyze arrow function component
    if (declarator.init.type === AST_NODE_TYPES.ArrowFunctionExpression) {
      const arrowFunc = declarator.init;
      
      // Check return type
      if (arrowFunc.returnType) {
        returnType = this.getTypeString(arrowFunc.returnType);
        hasJSXReturnType = returnType?.includes('JSX.Element') || false;
      }

      // Check if component is missing JSX.Element return type
      if (this.filePath.endsWith('.tsx') && !hasJSXReturnType) {
        result.issues.push({
          type: 'typescript',
          severity: 'error',
          message: `Component ${componentName} missing JSX.Element return type`,
          location: this.getLocation(declarator),
          ruleId: 'claude-jsx-return-type'
        });
      }

      // Analyze JSX elements
      const jsx = this.analyzeJSXElements(arrowFunc.body, result);

      return {
        name: componentName,
        returnType,
        hasJSXReturnType,
        props: this.getPropsParameter(arrowFunc.params),
        isExported: false, // Will be determined by export analysis
        location: this.getLocation(declarator),
        jsx
      };
    }

    return null;
  }

  private analyzeFunctionComponent(node: TSESTree.FunctionDeclaration, result: ASTAnalysisResult): ComponentAnalysis | null {
    if (!node.id) return null;

    const componentName = node.id.name;
    let returnType: string | null = null;
    let hasJSXReturnType = false;

    if (node.returnType) {
      returnType = this.getTypeString(node.returnType);
      hasJSXReturnType = returnType?.includes('JSX.Element') || false;
    }

    // Check if component is missing JSX.Element return type
    if (this.filePath.endsWith('.tsx') && !hasJSXReturnType) {
      result.issues.push({
        type: 'typescript',
        severity: 'error',
        message: `Component ${componentName} missing JSX.Element return type`,
        location: this.getLocation(node),
        ruleId: 'claude-jsx-return-type'
      });
    }

    // Analyze JSX elements
    const jsx = this.analyzeJSXElements(node.body, result);

    return {
      name: componentName,
      returnType,
      hasJSXReturnType,
      props: this.getPropsParameter(node.params),
      isExported: false,
      location: this.getLocation(node),
      jsx
    };
  }

  private analyzeJSXElements(node: TSESTree.Node, result: ASTAnalysisResult): JSXElementAnalysis[] {
    const elements: JSXElementAnalysis[] = [];

    const walkJSX = (node: TSESTree.Node) => {
      if (node.type === AST_NODE_TYPES.JSXElement) {
        const element = node as TSESTree.JSXElement;
        if (element.openingElement.name.type === AST_NODE_TYPES.JSXIdentifier) {
          const tagName = element.openingElement.name.name;
          const attributes = this.analyzeJSXAttributes(element.openingElement.attributes);
          
          const isInteractive = this.isInteractiveElement(tagName, attributes);
          const hasAriaLabel = attributes.some(attr => attr.name === 'aria-label');
          const hasKeyboardHandler = attributes.some(attr => attr.name === 'onKeyDown' || attr.name === 'onKeyPress');

          elements.push({
            tagName,
            attributes,
            isInteractive,
            hasAriaLabel,
            hasKeyboardHandler,
            location: this.getLocation(element)
          });

          // Accessibility validation
          if (isInteractive && !hasAriaLabel) {
            result.issues.push({
              type: 'accessibility',
              severity: 'error',
              message: `Interactive ${tagName} element missing aria-label`,
              location: this.getLocation(element),
              ruleId: 'wcag-aria-labels'
            });
          }

          if (isInteractive && attributes.some(attr => attr.name === 'onClick') && !hasKeyboardHandler) {
            result.issues.push({
              type: 'accessibility',
              severity: 'warning',
              message: `Interactive ${tagName} with onClick should have keyboard handler`,
              location: this.getLocation(element),
              ruleId: 'wcag-keyboard-navigation'
            });
          }
        }
      }

      // Recursively walk JSX children
      for (const key in node) {
        const child = (node as any)[key];
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && item.type) {
              walkJSX(item);
            }
          }
        } else if (child && typeof child === 'object' && child.type) {
          walkJSX(child);
        }
      }
    };

    walkJSX(node);
    return elements;
  }

  private analyzeJSXAttributes(attributes: TSESTree.JSXAttribute[]): JSXAttributeAnalysis[] {
    return attributes.map(attr => {
      if (attr.name.type === AST_NODE_TYPES.JSXIdentifier) {
        return {
          name: attr.name.name,
          value: this.getAttributeValue(attr.value),
          location: this.getLocation(attr)
        };
      }
      return {
        name: 'unknown',
        value: '',
        location: this.getLocation(attr)
      };
    });
  }

  private analyzeImportDeclaration(node: TSESTree.ImportDeclaration, result: ASTAnalysisResult): void {
    const source = (node.source.value as string) || '';
    const specifiers = node.specifiers.map(spec => {
      if (spec.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
        return spec.local.name;
      } else if (spec.type === AST_NODE_TYPES.ImportSpecifier) {
        return spec.imported.name;
      }
      return 'unknown';
    });

    const isDesignSystemImport = source === '@xaheen-ai/design-system';

    result.imports.push({
      source,
      specifiers,
      isDesignSystemImport,
      location: this.getLocation(node)
    });
  }

  private analyzeExportDeclaration(node: TSESTree.ExportDefaultDeclaration | TSESTree.ExportNamedDeclaration, result: ASTAnalysisResult): void {
    if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
      let name = 'default';
      if (node.declaration?.type === AST_NODE_TYPES.Identifier) {
        name = node.declaration.name;
      }
      
      result.exports.push({
        name,
        type: 'default',
        location: this.getLocation(node)
      });
    } else if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
      if (node.specifiers.length > 0) {
        for (const spec of node.specifiers) {
          if (spec.type === AST_NODE_TYPES.ExportSpecifier) {
            result.exports.push({
              name: spec.exported.name,
              type: 'named',
              location: this.getLocation(node)
            });
          }
        }
      }
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private isComponentName(name: string): boolean {
    return name.length > 0 && name[0] === name[0].toUpperCase();
  }

  private isInteractiveElement(tagName: string, attributes: JSXAttributeAnalysis[]): boolean {
    const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
    const hasClickHandler = attributes.some(attr => attr.name === 'onClick');
    
    return interactiveTags.includes(tagName.toLowerCase()) || hasClickHandler;
  }

  private getPropsParameter(params: TSESTree.Parameter[]): string | null {
    if (params.length > 0 && params[0].type === AST_NODE_TYPES.Identifier) {
      return params[0].name;
    }
    return null;
  }

  private getTypeString(typeNode: any): string {
    if (!typeNode) return 'unknown';
    
    // This is a simplified version - a full implementation would handle all TypeScript types
    if (typeNode.typeAnnotation?.type === AST_NODE_TYPES.TSTypeReference) {
      return typeNode.typeAnnotation.typeName?.name || 'unknown';
    }
    
    return 'unknown';
  }

  private getAttributeValue(valueNode: any): string {
    if (!valueNode) return '';
    
    if (valueNode.type === AST_NODE_TYPES.Literal) {
      return String(valueNode.value);
    }
    
    if (valueNode.type === AST_NODE_TYPES.JSXExpressionContainer) {
      return '[expression]';
    }
    
    return '';
  }

  private getLocation(node: TSESTree.Node): CodeLocation {
    return {
      line: node.loc?.start.line || 1,
      column: node.loc?.start.column || 1,
      endLine: node.loc?.end.line,
      endColumn: node.loc?.end.column
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createASTAnalyzer(sourceCode: string, filePath: string): ASTAnalyzer {
  return new ASTAnalyzer(sourceCode, filePath);
}

export default ASTAnalyzer;