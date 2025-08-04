/**
 * @fileoverview Tier 2: TypeScript AST Transformations
 * @description Advanced TypeScript code manipulation using Nx DevKit
 */

import { Tree, formatFiles, generateFiles, joinPathFragments } from '@nx/devkit';
import * as ts from 'typescript';
import { join, dirname, relative } from 'path';
import { logger } from '../utils/logger.js';
import {
  ScaffoldingContext,
  GenerationResult,
  ASTTransformationOptions,
  ImportStatement,
  TypeScriptInterface,
  RouteConfiguration,
  VirtualFileSystem,
  ScaffoldingError,
  ASTTransformation,
  RefactoringOperation
} from './types.js';

export class ASTTransformationEngine {
  private readonly tree: Tree;
  private readonly virtualFs: VirtualFileSystem;
  private readonly options: ASTTransformationOptions;

  constructor(
    tree: Tree,
    virtualFs: VirtualFileSystem,
    options: ASTTransformationOptions = {}
  ) {
    this.tree = tree;
    this.virtualFs = virtualFs;
    this.options = {
      preserveComments: true,
      preserveWhitespace: true,
      validateTypes: true,
      backup: true,
      ...options
    };
  }

  // ===== MAIN TRANSFORMATION METHODS =====

  async transformFiles(
    context: ScaffoldingContext,
    transformations: readonly ASTTransformation[]
  ): Promise<GenerationResult> {
    const files: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.info(`Applying ${transformations.length} AST transformations`);

    try {
      for (const transformation of transformations) {
        const result = await this.applyTransformation(context, transformation);
        files.push(...result.files);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }

      // Format files if no errors
      if (errors.length === 0) {
        await formatFiles(this.tree);
      }

      return {
        success: errors.length === 0,
        files,
        errors,
        warnings
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        files,
        errors: [...errors, errorMessage],
        warnings
      };
    }
  }

  // ===== IMPORT MANAGEMENT =====

  async addImports(
    filePath: string,
    imports: readonly ImportStatement[]
  ): Promise<void> {
    const content = this.virtualFs.readFile(filePath);
    if (!content) {
      throw new ScaffoldingError(`File not found: ${filePath}`, 'FILE_NOT_FOUND');
    }

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const transformer = (context: ts.TransformationContext) => {
      return (rootNode: ts.Node) => {
        const visitNode = (node: ts.Node): ts.Node => {
          if (ts.isSourceFile(node)) {
            const existingImports = this.extractExistingImports(node);
            const newImports = this.createImportStatements(imports, existingImports);
            
            return ts.factory.updateSourceFile(
              node,
              [
                ...newImports,
                ...node.statements
              ],
              node.isDeclarationFile,
              node.referencedFiles,
              node.typeReferenceDirectives,
              node.hasNoDefaultLib,
              node.libReferenceDirectives
            );
          }
          return ts.visitEachChild(node, visitNode, context);
        };
        return visitNode(rootNode);
      };
    };

    const result = ts.transform(sourceFile, [transformer]);
    const printer = ts.createPrinter({
      preserveComments: this.options.preserveComments,
      preserveSourceNewlines: this.options.preserveWhitespace
    });

    const transformedContent = printer.printFile(result.transformed[0] as ts.SourceFile);
    this.virtualFs.writeFile(filePath, transformedContent);

    logger.debug(`Added ${imports.length} imports to ${filePath}`);
  }

  async optimizeImports(filePath: string): Promise<void> {
    const content = this.virtualFs.readFile(filePath);
    if (!content) {
      throw new ScaffoldingError(`File not found: ${filePath}`, 'FILE_NOT_FOUND');
    }

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Extract and optimize imports
    const imports = this.extractExistingImports(sourceFile);
    const optimizedImports = this.optimizeImportStatements(imports);

    // Remove existing imports and add optimized ones
    const statementsWithoutImports = sourceFile.statements.filter(
      statement => !ts.isImportDeclaration(statement)
    );

    const newSourceFile = ts.factory.updateSourceFile(
      sourceFile,
      [
        ...this.createImportStatements(optimizedImports, []),
        ...statementsWithoutImports
      ],
      sourceFile.isDeclarationFile,
      sourceFile.referencedFiles,
      sourceFile.typeReferenceDirectives,
      sourceFile.hasNoDefaultLib,
      sourceFile.libReferenceDirectives
    );

    const printer = ts.createPrinter({
      preserveComments: this.options.preserveComments,
      preserveSourceNewlines: this.options.preserveWhitespace
    });

    const optimizedContent = printer.printFile(newSourceFile);
    this.virtualFs.writeFile(filePath, optimizedContent);

    logger.debug(`Optimized imports in ${filePath}`);
  }

  // ===== INTERFACE GENERATION =====

  async generateInterfaces(
    filePath: string,
    interfaces: readonly TypeScriptInterface[]
  ): Promise<void> {
    logger.info(`Generating ${interfaces.length} interfaces in ${filePath}`);

    const interfaceStatements = interfaces.map(iface => this.createInterfaceDeclaration(iface));
    const interfaceContent = interfaceStatements
      .map(stmt => this.printNode(stmt))
      .join('\n\n');

    // Check if file exists
    const existingContent = this.virtualFs.readFile(filePath);
    
    if (existingContent) {
      // Append to existing file
      const updatedContent = `${existingContent}\n\n${interfaceContent}`;
      this.virtualFs.writeFile(filePath, updatedContent);
    } else {
      // Create new file
      const header = `/**
 * Generated TypeScript interfaces
 * @generated by Xala CLI
 */

`;
      this.virtualFs.writeFile(filePath, header + interfaceContent);
    }
  }

  // ===== ROUTE REGISTRATION =====

  async registerRoutes(
    routerFilePath: string,
    routes: readonly RouteConfiguration[]
  ): Promise<void> {
    logger.info(`Registering ${routes.length} routes in ${routerFilePath}`);

    const content = this.virtualFs.readFile(routerFilePath);
    if (!content) {
      throw new ScaffoldingError(`Router file not found: ${routerFilePath}`, 'FILE_NOT_FOUND');
    }

    const sourceFile = ts.createSourceFile(
      routerFilePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Find route configuration and add new routes
    const transformer = this.createRouteTransformer(routes);
    const result = ts.transform(sourceFile, [transformer]);
    
    const printer = ts.createPrinter({
      preserveComments: this.options.preserveComments,
      preserveSourceNewlines: this.options.preserveWhitespace
    });

    const transformedContent = printer.printFile(result.transformed[0] as ts.SourceFile);
    this.virtualFs.writeFile(routerFilePath, transformedContent);
  }

  // ===== REFACTORING OPERATIONS =====

  async performRefactoring(
    context: ScaffoldingContext,
    operations: readonly RefactoringOperation[]
  ): Promise<GenerationResult> {
    const files: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const operation of operations) {
      try {
        const result = await this.executeRefactoringOperation(context, operation);
        files.push(...result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Refactoring failed for ${operation.type}: ${errorMessage}`);
      }
    }

    return {
      success: errors.length === 0,
      files,
      errors,
      warnings
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private async applyTransformation(
    context: ScaffoldingContext,
    transformation: ASTTransformation
  ): Promise<GenerationResult> {
    switch (transformation.type) {
      case 'add-property':
        return await this.addPropertyTransformation(transformation);
      case 'remove-property':
        return await this.removePropertyTransformation(transformation);
      case 'rename-symbol':
        return await this.renameSymbolTransformation(transformation);
      case 'extract-interface':
        return await this.extractInterfaceTransformation(transformation);
      case 'inline-type':
        return await this.inlineTypeTransformation(transformation);
      default:
        throw new ScaffoldingError(
          `Unknown transformation type: ${(transformation as any).type}`,
          'UNKNOWN_TRANSFORMATION'
        );
    }
  }

  private extractExistingImports(sourceFile: ts.SourceFile): ImportStatement[] {
    const imports: ImportStatement[] = [];

    sourceFile.statements.forEach(statement => {
      if (ts.isImportDeclaration(statement)) {
        const moduleSpecifier = (statement.moduleSpecifier as ts.StringLiteral).text;
        const importClause = statement.importClause;
        
        if (importClause) {
          const namedImports: string[] = [];
          let defaultImport: string | undefined;
          let namespaceImport: string | undefined;

          if (importClause.name) {
            defaultImport = importClause.name.text;
          }

          if (importClause.namedBindings) {
            if (ts.isNamespaceImport(importClause.namedBindings)) {
              namespaceImport = importClause.namedBindings.name.text;
            } else if (ts.isNamedImports(importClause.namedBindings)) {
              importClause.namedBindings.elements.forEach(element => {
                namedImports.push(element.name.text);
              });
            }
          }

          imports.push({
            moduleSpecifier,
            namedImports: namedImports.length > 0 ? namedImports : undefined,
            defaultImport,
            namespaceImport,
            isTypeOnly: statement.importClause?.isTypeOnly
          });
        }
      }
    });

    return imports;
  }

  private createImportStatements(
    imports: readonly ImportStatement[],
    existing: readonly ImportStatement[]
  ): ts.ImportDeclaration[] {
    // Merge with existing imports and remove duplicates
    const mergedImports = this.mergeImports([...existing, ...imports]);
    
    return mergedImports.map(importStmt => {
      const importClause = this.createImportClause(importStmt);
      
      return ts.factory.createImportDeclaration(
        undefined,
        importClause,
        ts.factory.createStringLiteral(importStmt.moduleSpecifier),
        undefined
      );
    });
  }

  private createImportClause(importStmt: ImportStatement): ts.ImportClause | undefined {
    const { defaultImport, namespaceImport, namedImports, isTypeOnly } = importStmt;

    if (!defaultImport && !namespaceImport && (!namedImports || namedImports.length === 0)) {
      return undefined;
    }

    let namedBindings: ts.NamedImportBindings | undefined;

    if (namespaceImport) {
      namedBindings = ts.factory.createNamespaceImport(
        ts.factory.createIdentifier(namespaceImport)
      );
    } else if (namedImports && namedImports.length > 0) {
      namedBindings = ts.factory.createNamedImports(
        namedImports.map(name =>
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(name)
          )
        )
      );
    }

    return ts.factory.createImportClause(
      isTypeOnly || false,
      defaultImport ? ts.factory.createIdentifier(defaultImport) : undefined,
      namedBindings
    );
  }

  private mergeImports(imports: readonly ImportStatement[]): ImportStatement[] {
    const merged = new Map<string, ImportStatement>();

    for (const importStmt of imports) {
      const existing = merged.get(importStmt.moduleSpecifier);
      
      if (existing) {
        // Merge imports from the same module
        const mergedNamedImports = [
          ...(existing.namedImports || []),
          ...(importStmt.namedImports || [])
        ];
        
        merged.set(importStmt.moduleSpecifier, {
          ...existing,
          namedImports: [...new Set(mergedNamedImports)],
          defaultImport: importStmt.defaultImport || existing.defaultImport,
          namespaceImport: importStmt.namespaceImport || existing.namespaceImport
        });
      } else {
        merged.set(importStmt.moduleSpecifier, importStmt);
      }
    }

    return Array.from(merged.values());
  }

  private optimizeImportStatements(imports: readonly ImportStatement[]): ImportStatement[] {
    // Sort imports by module specifier and optimize
    return imports
      .sort((a, b) => {
        // Local imports last
        const aIsLocal = a.moduleSpecifier.startsWith('.');
        const bIsLocal = b.moduleSpecifier.startsWith('.');
        
        if (aIsLocal !== bIsLocal) {
          return aIsLocal ? 1 : -1;
        }
        
        return a.moduleSpecifier.localeCompare(b.moduleSpecifier);
      })
      .map(importStmt => ({
        ...importStmt,
        namedImports: importStmt.namedImports?.sort()
      }));
  }

  private createInterfaceDeclaration(iface: TypeScriptInterface): ts.InterfaceDeclaration {
    const properties = iface.properties.map(prop => {
      const propSignature = ts.factory.createPropertySignature(
        prop.readonly ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)] : undefined,
        ts.factory.createIdentifier(prop.name),
        prop.optional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
        this.createTypeNode(prop.type)
      );

      // Add JSDoc comment if description exists
      if (prop.description) {
        ts.addSyntheticLeadingComment(
          propSignature,
          ts.SyntaxKind.MultiLineCommentTrivia,
          `* ${prop.description} `,
          true
        );
      }

      return propSignature;
    });

    const heritageClauses = iface.extends?.map(extend =>
      ts.factory.createHeritageClause(
        ts.SyntaxKind.ExtendsKeyword,
        [ts.factory.createExpressionWithTypeArguments(
          ts.factory.createIdentifier(extend),
          undefined
        )]
      )
    );

    return ts.factory.createInterfaceDeclaration(
      iface.exported ? [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)] : undefined,
      ts.factory.createIdentifier(iface.name),
      undefined,
      heritageClauses,
      properties
    );
  }

  private createTypeNode(typeString: string): ts.TypeNode {
    // Parse simple type strings - this could be enhanced for complex types
    switch (typeString) {
      case 'string':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case 'number':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case 'boolean':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case 'unknown':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
      default:
        // For complex types, create a type reference
        if (typeString.includes('[]')) {
          const elementType = typeString.replace('[]', '');
          return ts.factory.createArrayTypeNode(this.createTypeNode(elementType));
        }
        return ts.factory.createTypeReferenceNode(typeString);
    }
  }

  private createRouteTransformer(
    routes: readonly RouteConfiguration[]
  ): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
      return (sourceFile: ts.SourceFile) => {
        // Implementation for route registration transformation
        // This would find the routes array and add new routes
        return sourceFile; // Simplified for now
      };
    };
  }

  private printNode(node: ts.Node): string {
    const printer = ts.createPrinter({
      preserveComments: this.options.preserveComments,
      preserveSourceNewlines: this.options.preserveWhitespace
    });
    
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );
    
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }

  // Placeholder implementations for transformation methods
  private async addPropertyTransformation(transformation: ASTTransformation): Promise<GenerationResult> {
    // Implementation would go here
    return { success: true, files: [], errors: [], warnings: [] };
  }

  private async removePropertyTransformation(transformation: ASTTransformation): Promise<GenerationResult> {
    // Implementation would go here
    return { success: true, files: [], errors: [], warnings: [] };
  }

  private async renameSymbolTransformation(transformation: ASTTransformation): Promise<GenerationResult> {
    // Implementation would go here
    return { success: true, files: [], errors: [], warnings: [] };
  }

  private async extractInterfaceTransformation(transformation: ASTTransformation): Promise<GenerationResult> {
    // Implementation would go here
    return { success: true, files: [], errors: [], warnings: [] };
  }

  private async inlineTypeTransformation(transformation: ASTTransformation): Promise<GenerationResult> {
    // Implementation would go here
    return { success: true, files: [], errors: [], warnings: [] };
  }

  private async executeRefactoringOperation(
    context: ScaffoldingContext,
    operation: RefactoringOperation
  ): Promise<string[]> {
    // Implementation would go here
    return [];
  }
}