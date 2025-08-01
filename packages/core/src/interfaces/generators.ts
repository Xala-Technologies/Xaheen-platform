// Generator interfaces for code generation functionality

import type { IBaseService } from './core';
import type { NorwegianCompliance } from './types';

// === Generator Interfaces ===

/**
 * Code generator interface - generates code from templates
 */
export interface ICodeGenerator extends IBaseService {
  generateComponent(options: IComponentGenerationOptions): Promise<IGenerationResult>;
  generatePage(options: IPageGenerationOptions): Promise<IGenerationResult>;
  generateLayout(options: ILayoutGenerationOptions): Promise<IGenerationResult>;
  generateApi(options: IApiGenerationOptions): Promise<IGenerationResult>;
  generateTest(options: ITestGenerationOptions): Promise<IGenerationResult>;
  generateStory(options: IStoryGenerationOptions): Promise<IGenerationResult>;
}

/**
 * Base generation options - common properties for all generators
 */
export interface IBaseGenerationOptions {
  name: string;
  description?: string;
  outputPath: string;
  typescript?: boolean;
  localization?: boolean;
  compliance?: NorwegianCompliance;
  overwrite?: boolean;
  dryRun?: boolean;
}

/**
 * Component generation options
 */
export interface IComponentGenerationOptions extends IBaseGenerationOptions {
  type: 'functional' | 'class' | 'hook';
  props?: IComponentProp[];
  hasState?: boolean;
  hasEffects?: boolean;
  hasEvents?: boolean;
  accessibility?: IAccessibilityOptions;
  styling?: IStylingOptions;
}

/**
 * Page generation options
 */
export interface IPageGenerationOptions extends IBaseGenerationOptions {
  framework: 'nextjs' | 'react' | 'gatsby';
  layout?: string;
  sections?: IPageSection[];
  seo?: ISeoOptions;
  authentication?: boolean;
  staticGeneration?: boolean;
  serverSideRendering?: boolean;
}

/**
 * Layout generation options
 */
export interface ILayoutGenerationOptions extends IBaseGenerationOptions {
  type: 'base' | 'dashboard' | 'auth' | 'landing';
  hasHeader?: boolean;
  hasFooter?: boolean;
  hasSidebar?: boolean;
  hasNavigation?: boolean;
  responsive?: boolean;
  theme?: boolean;
}

/**
 * API generation options
 */
export interface IApiGenerationOptions extends IBaseGenerationOptions {
  framework: 'nextjs' | 'express' | 'fastify' | 'nestjs';
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[];
  authentication?: boolean;
  validation?: boolean;
  database?: boolean;
  rateLimit?: boolean;
  caching?: boolean;
}

/**
 * Test generation options
 */
export interface ITestGenerationOptions extends IBaseGenerationOptions {
  testType: 'unit' | 'integration' | 'e2e';
  framework: 'jest' | 'vitest' | 'playwright' | 'cypress';
  targetFile: string;
  coverage?: boolean;
  accessibility?: boolean;
}

/**
 * Story generation options
 */
export interface IStoryGenerationOptions extends IBaseGenerationOptions {
  componentName: string;
  componentPath: string;
  variants?: string[];
  interactions?: boolean;
  accessibility?: boolean;
  responsive?: boolean;
  darkMode?: boolean;
}

/**
 * Generation result interface
 */
export interface IGenerationResult {
  success: boolean;
  files: IGeneratedFile[];
  errors: string[];
  warnings: string[];
  metrics: IGenerationMetrics;
}

/**
 * Generated file interface
 */
export interface IGeneratedFile {
  path: string;
  content: string;
  size: number;
  type: 'component' | 'test' | 'story' | 'config' | 'type' | 'style';
  language: 'typescript' | 'javascript' | 'css' | 'scss' | 'json' | 'markdown';
}

/**
 * Generation metrics interface
 */
export interface IGenerationMetrics {
  duration: number;
  filesGenerated: number;
  linesOfCode: number;
  complexity: number;
  coverage?: number;
}

// === Common Supporting Interfaces ===

/**
 * Component prop interface
 */
export interface IComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  enumValues?: string[];
}

/**
 * Page section interface
 */
export interface IPageSection {
  name: string;
  title?: string;
  components: string[];
  props?: Record<string, any>;
}

/**
 * SEO options interface
 */
export interface ISeoOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * Accessibility options interface
 */
export interface IAccessibilityOptions {
  ariaSupport: boolean;
  keyboardNavigation: boolean;
  role?: string;
  announcements?: boolean;
}

/**
 * Styling options interface
 */
export interface IStylingOptions {
  tokenBased: boolean;
  tokens?: IDesignToken[];
  responsive?: boolean;
  darkMode?: boolean;
}

/**
 * Design token interface
 */
export interface IDesignToken {
  property: string;
  tokenPath: string;
  value?: any;
}

/**
 * Generator factory interface - creates generator instances
 */
export interface IGeneratorFactory {
  createComponentGenerator(): ICodeGenerator;
  createPageGenerator(): ICodeGenerator;
  createLayoutGenerator(): ICodeGenerator;
  createApiGenerator(): ICodeGenerator;
  createTestGenerator(): ICodeGenerator;
  createStoryGenerator(): ICodeGenerator;
}