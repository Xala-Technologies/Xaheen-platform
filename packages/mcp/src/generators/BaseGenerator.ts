/**
 * Base Generator Class for all MCP Generators
 */

import type { SupportedPlatform } from '../types/index.js';
import Handlebars from 'handlebars';

export abstract class BaseGenerator {
  protected handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars;
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  protected registerHelpers(): void {
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    this.handlebars.registerHelper('lt', (a: any, b: any) => a < b);
    this.handlebars.registerHelper('gt', (a: any, b: any) => a > b);
    this.handlebars.registerHelper('lte', (a: any, b: any) => a <= b);
    this.handlebars.registerHelper('gte', (a: any, b: any) => a >= b);
    this.handlebars.registerHelper('and', (a: any, b: any) => a && b);
    this.handlebars.registerHelper('or', (a: any, b: any) => a || b);
    this.handlebars.registerHelper('not', (a: any) => !a);
    this.handlebars.registerHelper('includes', (arr: any[], value: any) => arr?.includes(value));
    this.handlebars.registerHelper('json', (context: any) => JSON.stringify(context, null, 2));
  }

  /**
   * Render a template with context
   */
  protected renderTemplate(template: string, context: any): string {
    const compiledTemplate = this.handlebars.compile(template);
    return compiledTemplate(context);
  }

  /**
   * Get file extension for platform
   */
  protected getFileExtension(platform: SupportedPlatform): string {
    const extensionMap: Record<SupportedPlatform, string> = {
      react: 'tsx',
      nextjs: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      electron: 'tsx',
      'react-native': 'tsx',
    };
    
    return extensionMap[platform] || 'ts';
  }

  /**
   * Get component file extension
   */
  protected getComponentExtension(platform: SupportedPlatform): string {
    const extensionMap: Record<SupportedPlatform, string> = {
      react: '.tsx',
      nextjs: '.tsx',
      vue: '.vue',
      angular: '.component.ts',
      svelte: '.svelte',
      electron: '.tsx',
      'react-native': '.tsx',
    };
    
    return extensionMap[platform] || '.ts';
  }

  /**
   * Get styles file extension
   */
  protected getStylesExtension(platform: SupportedPlatform): string {
    const extensionMap: Record<SupportedPlatform, string> = {
      react: '.module.css',
      nextjs: '.module.css',
      vue: '', // Styles in .vue file
      angular: '.component.css',
      svelte: '', // Styles in .svelte file
      electron: '.module.css',
      'react-native': '.ts', // StyleSheet
    };
    
    return extensionMap[platform] || '.css';
  }

  /**
   * Get test file extension
   */
  protected getTestExtension(platform: SupportedPlatform): string {
    const extensionMap: Record<SupportedPlatform, string> = {
      react: '.test.tsx',
      nextjs: '.test.tsx',
      vue: '.spec.ts',
      angular: '.spec.ts',
      svelte: '.test.ts',
      electron: '.test.tsx',
      'react-native': '.test.tsx',
    };
    
    return extensionMap[platform] || '.test.ts';
  }

  /**
   * Format code based on platform
   */
  protected formatCode(code: string, platform: SupportedPlatform): string {
    // In a real implementation, this would use prettier or other formatters
    return code.trim();
  }

  /**
   * Validate generated code
   */
  protected validateCode(code: string, platform: SupportedPlatform): boolean {
    // Basic validation - in real implementation would use TypeScript compiler API
    return code.length > 0 && !code.includes('undefined') && !code.includes('null');
  }
}