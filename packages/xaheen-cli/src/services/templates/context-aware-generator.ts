/**
 * Context-Aware Template Generation System
 * 
 * Intelligent template generation that adapts to business context, project patterns,
 * and domain-specific requirements. Provides smart defaults and patterns based on
 * detected or specified context.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import fs from 'fs-extra';
import path from 'node:path';
import { consola } from 'consola';
import { templateComposer, type CompositionContext } from './template-composition.js';
import { templateInheritance } from './template-inheritance.js';

export interface BusinessContextPattern {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly domain: 'ecommerce' | 'saas' | 'portfolio' | 'blog' | 'corporate' | 'government' | 'healthcare' | 'finance' | 'education';
  readonly patterns: readonly ContextPattern[];
  readonly requiredFeatures: readonly string[];
  readonly recommendedMixins: readonly string[];
  readonly compliance: readonly ComplianceRequirement[];
  readonly styling: ContextStyling;
  readonly metadata: ContextMetadata;
}

export interface ContextPattern {
  readonly name: string;
  readonly description: string;
  readonly template: string;
  readonly props: Record<string, any>;
  readonly conditions: Record<string, any>;
  readonly priority: number;
}

export interface ComplianceRequirement {
  readonly standard: 'WCAG' | 'GDPR' | 'NSM' | 'HIPAA' | 'PCI' | 'SOX' | 'ISO27001';
  readonly level: string;
  readonly required: boolean;
  readonly features: readonly string[];
}

export interface ContextStyling {
  readonly colorPalette: Record<string, string>;
  readonly typography: Record<string, string>;
  readonly spacing: Record<string, string>;
  readonly components: Record<string, any>;
  readonly responsive: boolean;
  readonly darkMode: boolean;
}

export interface ContextMetadata {
  readonly industry: string;
  readonly target_audience: string;
  readonly complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  readonly scale: 'small' | 'medium' | 'large' | 'enterprise';
  readonly performance_requirements: 'basic' | 'optimized' | 'high-performance';
}

export interface ProjectContext {
  readonly projectType: string;
  readonly framework: string;
  readonly packageManager: string;
  readonly hasDatabase: boolean;
  readonly hasAuth: boolean;
  readonly hasPayments: boolean;
  readonly hasAnalytics: boolean;
  readonly targetMarkets: readonly string[];
  readonly features: Record<string, boolean>;
}

export interface GenerationOptions {
  readonly outputPath: string;
  readonly overwrite: boolean;
  readonly generateTests: boolean;
  readonly generateStories: boolean;
  readonly generateDocs: boolean;
  readonly includeLocalization: boolean;
  readonly optimizeBundle: boolean;
}

export class ContextAwareGenerator {
  private businessPatterns: Map<string, BusinessContextPattern> = new Map();
  private contextCache: Map<string, CompositionContext> = new Map();

  constructor() {
    this.initializeBusinessPatterns();
  }

  /**
   * Detect business context from project structure and configuration
   */
  async detectBusinessContext(projectPath: string): Promise<{
    domain: string;
    confidence: number;
    patterns: readonly string[];
    recommendations: readonly string[];
  }> {
    consola.info(`Detecting business context for project at ${projectPath}`);

    const packageJsonPath = path.join(projectPath, 'package.json');
    const configFiles = await fs.readdir(projectPath).catch(() => []);
    
    let packageJson: any = {};
    try {
      packageJson = await fs.readJson(packageJsonPath);
    } catch {
      consola.warn('No package.json found, using file-based detection');
    }

    const detectionResults = await Promise.all([
      this.detectFromPackageJson(packageJson),
      this.detectFromFileStructure(projectPath, configFiles),
      this.detectFromDependencies(packageJson.dependencies || {}),
      this.detectFromKeywords(packageJson.keywords || [])
    ]);

    // Aggregate detection results
    const domainScores = new Map<string, number>();
    const allPatterns = new Set<string>();
    const allRecommendations = new Set<string>();

    for (const result of detectionResults) {
      domainScores.set(result.domain, (domainScores.get(result.domain) || 0) + result.confidence);
      result.patterns.forEach(p => allPatterns.add(p));
      result.recommendations.forEach(r => allRecommendations.add(r));
    }

    // Find highest scoring domain
    let topDomain = 'corporate';
    let maxScore = 0;
    for (const [domain, score] of domainScores) {
      if (score > maxScore) {
        maxScore = score;
        topDomain = domain;
      }
    }

    const confidence = Math.min(maxScore / detectionResults.length, 1.0);

    consola.success(`Detected business context: ${topDomain} (confidence: ${Math.round(confidence * 100)}%)`);

    return {
      domain: topDomain,
      confidence,
      patterns: Array.from(allPatterns),
      recommendations: Array.from(allRecommendations)
    };
  }

  /**
   * Generate context-aware component based on business domain
   */
  async generateContextAwareComponent(
    componentName: string,
    businessDomain: string,
    projectContext: ProjectContext,
    options: GenerationOptions
  ): Promise<void> {
    consola.info(`Generating context-aware component: ${componentName} for ${businessDomain} domain`);

    const pattern = this.businessPatterns.get(businessDomain);
    if (!pattern) {
      throw new Error(`Unknown business domain: ${businessDomain}`);
    }

    // Build composition context
    const compositionContext: CompositionContext = {
      componentName,
      platform: projectContext.framework,
      businessContext: businessDomain as any,
      theme: this.getThemeForDomain(businessDomain),
      accessibility: this.getAccessibilityLevel(pattern.compliance),
      norwegianCompliant: this.isNorwegianCompliant(pattern.compliance),
      props: this.buildContextProps(pattern, projectContext),
      features: this.buildContextFeatures(pattern, projectContext, options),
      customization: this.buildCustomization(pattern, projectContext)
    };

    // Select appropriate base template
    const baseTemplateId = this.selectBaseTemplate(componentName, pattern);
    const baseTemplate = templateInheritance.getBaseTemplate(baseTemplateId);
    
    if (!baseTemplate) {
      throw new Error(`Base template not found: ${baseTemplateId}`);
    }

    // Apply business context patterns
    const appliedPatterns = this.applyContextPatterns(baseTemplate.path, pattern.patterns, compositionContext);

    // Generate with template composer
    const result = await templateComposer.composeTemplate(
      appliedPatterns.template,
      appliedPatterns.slots,
      [...pattern.recommendedMixins], // Convert readonly array to mutable
      compositionContext
    );

    // Write primary component file
    const componentPath = path.join(options.outputPath, `${componentName}.tsx`);
    await fs.ensureDir(path.dirname(componentPath));
    await fs.writeFile(componentPath, result.template, 'utf-8');

    // Generate additional files based on options
    await this.generateAdditionalFiles(componentName, pattern, compositionContext, options);

    // Generate context-specific configuration files
    await this.generateContextConfiguration(pattern, projectContext, options.outputPath);

    consola.success(`Generated context-aware component: ${componentName}`);
  }

  /**
   * Detect business context from package.json
   */
  private async detectFromPackageJson(packageJson: any): Promise<{
    domain: string;
    confidence: number;
    patterns: readonly string[];
    recommendations: readonly string[];
  }> {
    const keywords = (packageJson.keywords || []).join(' ').toLowerCase();
    const description = (packageJson.description || '').toLowerCase();
    const name = (packageJson.name || '').toLowerCase();
    
    const text = `${keywords} ${description} ${name}`;

    // Domain detection patterns
    const domainPatterns = {
      ecommerce: ['shop', 'cart', 'product', 'payment', 'order', 'checkout', 'inventory', 'store'],
      saas: ['saas', 'subscription', 'billing', 'tenant', 'multi-tenant', 'dashboard', 'analytics'],
      finance: ['bank', 'finance', 'trading', 'investment', 'payment', 'crypto', 'fintech'],
      healthcare: ['health', 'medical', 'patient', 'clinic', 'hospital', 'telemedicine'],
      government: ['gov', 'public', 'civic', 'municipality', 'digital-services'],
      education: ['edu', 'learning', 'course', 'student', 'teacher', 'school', 'university'],
      portfolio: ['portfolio', 'personal', 'resume', 'showcase', 'artist', 'creative'],
      blog: ['blog', 'cms', 'content', 'article', 'news', 'publishing']
    };

    let bestMatch = 'corporate';
    let bestScore = 0;

    for (const [domain, patterns] of Object.entries(domainPatterns)) {
      const matches = patterns.filter(pattern => text.includes(pattern)).length;
      const score = matches / patterns.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = domain;
      }
    }

    return {
      domain: bestMatch,
      confidence: bestScore,
      patterns: domainPatterns[bestMatch as keyof typeof domainPatterns] || [],
      recommendations: this.getRecommendationsForDomain(bestMatch)
    };
  }

  /**
   * Detect business context from file structure
   */
  private async detectFromFileStructure(projectPath: string, files: string[]): Promise<{
    domain: string;
    confidence: number;
    patterns: readonly string[];
    recommendations: readonly string[];
  }> {
    const filePatterns = {
      ecommerce: ['cart', 'product', 'inventory', 'checkout', 'payment'],
      saas: ['dashboard', 'billing', 'subscription', 'tenant', 'admin'],
      government: ['compliance', 'nsm', 'gdpr', 'accessibility'],
      healthcare: ['patient', 'medical', 'hipaa', 'clinic'],
      finance: ['trading', 'portfolio', 'banking', 'pci'],
      education: ['course', 'student', 'learning', 'grade']
    };

    let bestMatch = 'corporate';
    let bestScore = 0;

    for (const [domain, patterns] of Object.entries(filePatterns)) {
      const matches = files.filter(file => 
        patterns.some(pattern => file.toLowerCase().includes(pattern))
      ).length;
      const score = matches / Math.max(files.length, 1);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = domain;
      }
    }

    return {
      domain: bestMatch,
      confidence: bestScore,
      patterns: [],
      recommendations: []
    };
  }

  /**
   * Detect business context from dependencies
   */
  private async detectFromDependencies(dependencies: Record<string, string>): Promise<{
    domain: string;
    confidence: number;
    patterns: readonly string[];
    recommendations: readonly string[];
  }> {
    const depNames = Object.keys(dependencies).join(' ').toLowerCase();

    const dependencyPatterns = {
      ecommerce: ['stripe', 'paypal', 'shopify', 'commerce', 'cart'],
      saas: ['auth0', 'clerk', 'supabase', 'prisma', 'billing'],
      finance: ['plaid', 'alpaca', 'coinbase', 'trading'],
      healthcare: ['fhir', 'medical', 'health'],
      government: ['govuk', 'civic', 'public'],
      blog: ['contentful', 'strapi', 'sanity', 'markdown']
    };

    let bestMatch = 'corporate';
    let bestScore = 0;

    for (const [domain, patterns] of Object.entries(dependencyPatterns)) {
      const matches = patterns.filter(pattern => depNames.includes(pattern)).length;
      const score = matches / patterns.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = domain;
      }
    }

    return {
      domain: bestMatch,
      confidence: bestScore,
      patterns: [],
      recommendations: []
    };
  }

  /**
   * Detect business context from keywords
   */
  private async detectFromKeywords(keywords: string[]): Promise<{
    domain: string;
    confidence: number;
    patterns: readonly string[];
    recommendations: readonly string[];
  }> {
    const keywordText = keywords.join(' ').toLowerCase();
    
    // Simple keyword matching
    if (keywordText.includes('ecommerce') || keywordText.includes('shop')) {
      return { domain: 'ecommerce', confidence: 0.8, patterns: [], recommendations: [] };
    }
    if (keywordText.includes('saas') || keywordText.includes('dashboard')) {
      return { domain: 'saas', confidence: 0.8, patterns: [], recommendations: [] };
    }
    if (keywordText.includes('blog') || keywordText.includes('cms')) {
      return { domain: 'blog', confidence: 0.8, patterns: [], recommendations: [] };
    }

    return { domain: 'corporate', confidence: 0.2, patterns: [], recommendations: [] };
  }

  /**
   * Get theme for business domain
   */
  private getThemeForDomain(domain: string): CompositionContext['theme'] {
    const themeMap: Record<string, CompositionContext['theme']> = {
      finance: 'finance',
      healthcare: 'healthcare',
      education: 'education',
      ecommerce: 'ecommerce',
      government: 'enterprise',
      saas: 'productivity',
      corporate: 'enterprise'
    };

    return themeMap[domain] || 'enterprise';
  }

  /**
   * Get accessibility level from compliance requirements
   */
  private getAccessibilityLevel(compliance: readonly ComplianceRequirement[]): 'A' | 'AA' | 'AAA' {
    const wcagReq = compliance.find(c => c.standard === 'WCAG');
    if (wcagReq?.level === 'AAA') return 'AAA';
    if (wcagReq?.level === 'AA') return 'AA';
    return 'A';
  }

  /**
   * Check if Norwegian compliance is required
   */
  private isNorwegianCompliant(compliance: readonly ComplianceRequirement[]): boolean {
    return compliance.some(c => c.standard === 'NSM' || c.features.includes('norwegian-locale'));
  }

  /**
   * Build context props based on pattern and project
   */
  private buildContextProps(pattern: BusinessContextPattern, project: ProjectContext): Record<string, any> {
    const props: Record<string, any> = {
      domain: pattern.domain,
      industry: pattern.metadata.industry,
      hasAuth: project.hasAuth,
      hasDatabase: project.hasDatabase,
      hasPayments: project.hasPayments
    };

    // Add domain-specific props
    if (pattern.domain === 'ecommerce') {
      props.currency = 'USD';
      props.taxEnabled = true;
      props.inventoryTracking = true;
    }

    if (pattern.domain === 'saas') {
      props.multiTenant = true;
      props.subscriptionModel = 'freemium';
      props.analyticsEnabled = true;
    }

    return props;
  }

  /**
   * Build context features based on pattern and options
   */
  private buildContextFeatures(
    pattern: BusinessContextPattern, 
    project: ProjectContext, 
    options: GenerationOptions
  ): Record<string, boolean> {
    return {
      darkMode: pattern.styling.darkMode,
      responsive: pattern.styling.responsive,
      analytics: project.hasAnalytics,
      tests: options.generateTests,
      storybook: options.generateStories,
      localization: options.includeLocalization,
      ...project.features
    };
  }

  /**
   * Build customization based on pattern and project
   */
  private buildCustomization(pattern: BusinessContextPattern, project: ProjectContext): Record<string, any> {
    return {
      styling: pattern.styling,
      branding: {
        colors: pattern.styling.colorPalette,
        typography: pattern.styling.typography
      },
      performance: pattern.metadata.performance_requirements,
      targetMarkets: project.targetMarkets
    };
  }

  /**
   * Select appropriate base template for context
   */
  private selectBaseTemplate(componentName: string, pattern: BusinessContextPattern): string {
    // Simple heuristic based on component name and domain
    const name = componentName.toLowerCase();
    
    if (name.includes('form') || name.includes('input')) {
      return 'form-component';
    }
    
    if (name.includes('layout') || name.includes('dashboard')) {
      return 'dashboard-layout';
    }
    
    return 'base-component';
  }

  /**
   * Apply context patterns to base template
   */
  private applyContextPatterns(
    templatePath: string, 
    patterns: readonly ContextPattern[], 
    context: CompositionContext
  ): { template: string; slots: any[] } {
    // This would normally load and process the template
    // For now, return placeholder
    return {
      template: `// Context-aware template for ${context.componentName}`,
      slots: []
    };
  }

  /**
   * Generate additional files based on context
   */
  private async generateAdditionalFiles(
    componentName: string,
    pattern: BusinessContextPattern,
    context: CompositionContext,
    options: GenerationOptions
  ): Promise<void> {
    const basePath = options.outputPath;

    // Generate tests if requested
    if (options.generateTests) {
      const testContent = this.generateTestFile(componentName, pattern, context);
      await fs.writeFile(path.join(basePath, `${componentName}.test.tsx`), testContent, 'utf-8');
    }

    // Generate stories if requested
    if (options.generateStories) {
      const storyContent = this.generateStoryFile(componentName, pattern, context);
      await fs.writeFile(path.join(basePath, `${componentName}.stories.tsx`), storyContent, 'utf-8');
    }

    // Generate localization files if requested
    if (options.includeLocalization) {
      await this.generateLocalizationFiles(componentName, pattern, basePath);
    }
  }

  /**
   * Generate test file content
   */
  private generateTestFile(componentName: string, pattern: BusinessContextPattern, context: CompositionContext): string {
    return `
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  ${pattern.compliance.map(c => `
  it('meets ${c.standard} ${c.level} compliance', () => {
    render(<${componentName} />);
    // Add ${c.standard} specific tests
  });
  `).join('')}
});
    `.trim();
  }

  /**
   * Generate story file content
   */
  private generateStoryFile(componentName: string, pattern: BusinessContextPattern, context: CompositionContext): string {
    return `
import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta = {
  title: '${pattern.domain}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ${pattern.domain.charAt(0).toUpperCase() + pattern.domain.slice(1)}Theme: Story = {
  args: {
    theme: '${context.theme}',
  },
};
    `.trim();
  }

  /**
   * Generate localization files
   */
  private async generateLocalizationFiles(componentName: string, pattern: BusinessContextPattern, basePath: string): Promise<void> {
    const localeDir = path.join(basePath, 'locales');
    await fs.ensureDir(localeDir);

    const locales = ['en', 'nb-NO'];
    for (const locale of locales) {
      const localeFile = path.join(localeDir, locale, `${componentName.toLowerCase()}.json`);
      await fs.ensureDir(path.dirname(localeFile));
      
      const translations = this.generateTranslations(componentName, locale, pattern);
      await fs.writeFile(localeFile, JSON.stringify(translations, null, 2), 'utf-8');
    }
  }

  /**
   * Generate translations for locale
   */
  private generateTranslations(componentName: string, locale: string, pattern: BusinessContextPattern): Record<string, string> {
    const baseTranslations = {
      title: componentName,
      loading: locale === 'nb-NO' ? 'Laster...' : 'Loading...',
      error: locale === 'nb-NO' ? 'En feil oppstod' : 'An error occurred',
      submit: locale === 'nb-NO' ? 'Send inn' : 'Submit',
      cancel: locale === 'nb-NO' ? 'Avbryt' : 'Cancel'
    };

    // Add domain-specific translations
    if (pattern.domain === 'ecommerce') {
      Object.assign(baseTranslations, {
        addToCart: locale === 'nb-NO' ? 'Legg til i handlekurv' : 'Add to Cart',
        checkout: locale === 'nb-NO' ? 'Til kassen' : 'Checkout',
        price: locale === 'nb-NO' ? 'Pris' : 'Price'
      });
    }

    return baseTranslations;
  }

  /**
   * Generate context-specific configuration
   */
  private async generateContextConfiguration(
    pattern: BusinessContextPattern,
    project: ProjectContext,
    outputPath: string
  ): Promise<void> {
    // Generate tailwind config for domain
    const tailwindConfigPath = path.join(outputPath, 'tailwind.config.js');
    const tailwindConfig = this.generateTailwindConfig(pattern);
    await fs.writeFile(tailwindConfigPath, tailwindConfig, 'utf-8');

    // Generate ESLint config for compliance
    if (pattern.compliance.length > 0) {
      const eslintConfigPath = path.join(outputPath, '.eslintrc.js');
      const eslintConfig = this.generateESLintConfig(pattern);
      await fs.writeFile(eslintConfigPath, eslintConfig, 'utf-8');
    }
  }

  /**
   * Generate Tailwind config for business context
   */
  private generateTailwindConfig(pattern: BusinessContextPattern): string {
    return `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: ${JSON.stringify(pattern.styling.colorPalette, null, 6)},
      fontFamily: ${JSON.stringify(pattern.styling.typography, null, 6)},
      spacing: ${JSON.stringify(pattern.styling.spacing, null, 6)},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    ${pattern.compliance.some(c => c.standard === 'WCAG') ? "require('@tailwindcss/accessibility')," : ''}
  ],
};
    `.trim();
  }

  /**
   * Generate ESLint config for compliance
   */
  private generateESLintConfig(pattern: BusinessContextPattern): string {
    const rules: string[] = ['@typescript-eslint/recommended'];
    
    if (pattern.compliance.some(c => c.standard === 'WCAG')) {
      rules.push('plugin:jsx-a11y/recommended');
    }

    return `
module.exports = {
  extends: [${rules.map(r => `'${r}'`).join(', ')}],
  rules: {
    ${pattern.compliance.some(c => c.standard === 'WCAG') ? `
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    ` : ''}
  },
};
    `.trim();
  }

  /**
   * Get recommendations for domain
   */
  private getRecommendationsForDomain(domain: string): readonly string[] {
    const recommendations: Record<string, readonly string[]> = {
      ecommerce: ['Add Stripe integration', 'Implement cart functionality', 'Add inventory tracking'],
      saas: ['Add authentication', 'Implement billing', 'Add analytics dashboard'],
      government: ['Ensure WCAG AAA compliance', 'Add Norwegian localization', 'Implement NSM classification'],
      healthcare: ['Ensure HIPAA compliance', 'Add patient data protection', 'Implement audit logging'],
      finance: ['Ensure PCI compliance', 'Add transaction monitoring', 'Implement fraud detection']
    };

    return recommendations[domain] || ['Add responsive design', 'Implement accessibility features'];
  }

  /**
   * Initialize built-in business patterns
   */
  private initializeBusinessPatterns(): void {
    // E-commerce pattern
    this.businessPatterns.set('ecommerce', {
      id: 'ecommerce',
      name: 'E-commerce Platform',
      description: 'Online retail and marketplace components',
      domain: 'ecommerce',
      patterns: [
        {
          name: 'product-catalog',
          description: 'Product listing and search',
          template: 'ecommerce/product-catalog.hbs',
          props: { searchable: true, filterable: true },
          conditions: { hasProducts: true },
          priority: 1
        }
      ],
      requiredFeatures: ['cart', 'payments', 'inventory'],
      recommendedMixins: ['analytics-tracking', 'seo-optimization'],
      compliance: [
        { standard: 'WCAG', level: 'AA', required: true, features: ['keyboard-navigation', 'screen-reader'] },
        { standard: 'GDPR', level: 'compliant', required: true, features: ['data-protection', 'consent'] }
      ],
      styling: {
        colorPalette: {
          primary: '#0070f3',
          secondary: '#7c3aed',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f8fafc'
        },
        typography: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: true
      },
      metadata: {
        industry: 'Retail',
        target_audience: 'Consumers',
        complexity: 'complex',
        scale: 'large',
        performance_requirements: 'optimized'
      }
    });

    // SaaS pattern
    this.businessPatterns.set('saas', {
      id: 'saas',
      name: 'SaaS Application',
      description: 'Software-as-a-Service dashboard and admin components',
      domain: 'saas',
      patterns: [
        {
          name: 'dashboard-layout',
          description: 'Main dashboard with metrics',
          template: 'saas/dashboard.hbs',
          props: { showMetrics: true, showCharts: true },
          conditions: { hasAnalytics: true },
          priority: 1
        }
      ],
      requiredFeatures: ['auth', 'billing', 'analytics', 'multi-tenancy'],
      recommendedMixins: ['analytics-tracking', 'subscription-management'],
      compliance: [
        { standard: 'WCAG', level: 'AA', required: true, features: ['accessibility'] },
        { standard: 'SOX', level: 'compliant', required: false, features: ['audit-logging'] }
      ],
      styling: {
        colorPalette: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          background: '#ffffff',
          surface: '#f1f5f9'
        },
        typography: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        components: {},
        responsive: true,
        darkMode: true
      },
      metadata: {
        industry: 'Technology',
        target_audience: 'Business users',
        complexity: 'complex',
        scale: 'enterprise',
        performance_requirements: 'high-performance'
      }
    });

    // Government pattern
    this.businessPatterns.set('government', {
      id: 'government',
      name: 'Government Services',
      description: 'Public sector and digital government components',
      domain: 'government',
      patterns: [
        {
          name: 'public-form',
          description: 'Citizen-facing forms with high accessibility',
          template: 'government/public-form.hbs',
          props: { accessibility: 'AAA', multilingual: true },
          conditions: { publicFacing: true },
          priority: 1
        }
      ],
      requiredFeatures: ['accessibility', 'multilingual', 'security'],
      recommendedMixins: ['norwegian-compliance', 'accessibility-enhanced'],
      compliance: [
        { standard: 'WCAG', level: 'AAA', required: true, features: ['full-accessibility'] },
        { standard: 'NSM', level: 'OPEN', required: true, features: ['security-classification'] },
        { standard: 'GDPR', level: 'compliant', required: true, features: ['privacy-protection'] }
      ],
      styling: {
        colorPalette: {
          primary: '#1d4ed8',
          secondary: '#6b7280',
          accent: '#059669',
          background: '#ffffff',
          surface: '#f9fafb'
        },
        typography: {
          heading: 'system-ui, sans-serif',
          body: 'system-ui, sans-serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: false
      },
      metadata: {
        industry: 'Government',
        target_audience: 'Citizens',
        complexity: 'enterprise',
        scale: 'large',
        performance_requirements: 'optimized'
      }
    });

    // Healthcare pattern
    this.businessPatterns.set('healthcare', {
      id: 'healthcare',
      name: 'Healthcare Platform',
      description: 'Medical and healthcare service components',
      domain: 'healthcare',
      patterns: [
        {
          name: 'patient-portal',
          description: 'Patient information and appointment management',
          template: 'healthcare/patient-portal.hbs',
          props: { secureMessaging: true, appointmentBooking: true },
          conditions: { hasPatientData: true },
          priority: 1
        }
      ],
      requiredFeatures: ['security', 'privacy', 'audit-trail', 'accessibility'],
      recommendedMixins: ['accessibility-enhanced', 'norwegian-compliance'],
      compliance: [
        { standard: 'WCAG', level: 'AAA', required: true, features: ['full-accessibility'] },
        { standard: 'HIPAA', level: 'compliant', required: true, features: ['data-encryption', 'audit-logging'] },
        { standard: 'GDPR', level: 'compliant', required: true, features: ['consent-management', 'data-protection'] }
      ],
      styling: {
        colorPalette: {
          primary: '#0ea5e9',
          secondary: '#64748b',
          accent: '#10b981',
          background: '#ffffff',
          surface: '#f8fafc'
        },
        typography: {
          heading: 'system-ui, sans-serif',
          body: 'system-ui, sans-serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: false
      },
      metadata: {
        industry: 'Healthcare',
        target_audience: 'Patients and Healthcare Providers',
        complexity: 'enterprise',
        scale: 'large',
        performance_requirements: 'high-performance'
      }
    });

    // Finance pattern
    this.businessPatterns.set('finance', {
      id: 'finance',
      name: 'Financial Services',
      description: 'Banking and financial service components',
      domain: 'finance',
      patterns: [
        {
          name: 'trading-dashboard',
          description: 'Financial trading and portfolio management',
          template: 'finance/trading-dashboard.hbs',
          props: { realTimeData: true, riskManagement: true },
          conditions: { hasFinancialData: true },
          priority: 1
        }
      ],
      requiredFeatures: ['security', 'audit-trail', 'real-time-data', 'compliance'],
      recommendedMixins: ['analytics-tracking', 'accessibility-enhanced'],
      compliance: [
        { standard: 'WCAG', level: 'AA', required: true, features: ['accessibility'] },
        { standard: 'PCI', level: 'compliant', required: true, features: ['payment-security'] },
        { standard: 'SOX', level: 'compliant', required: true, features: ['financial-reporting'] }
      ],
      styling: {
        colorPalette: {
          primary: '#1e40af',
          secondary: '#475569',
          accent: '#059669',
          background: '#ffffff',
          surface: '#f1f5f9'
        },
        typography: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        components: {},
        responsive: true,
        darkMode: true
      },
      metadata: {
        industry: 'Financial Services',
        target_audience: 'Financial Professionals',
        complexity: 'enterprise',
        scale: 'enterprise',
        performance_requirements: 'high-performance'
      }
    });

    // Education pattern
    this.businessPatterns.set('education', {
      id: 'education',
      name: 'Educational Platform',
      description: 'Learning management and educational components',
      domain: 'education',
      patterns: [
        {
          name: 'course-management',
          description: 'Course content and student progress tracking',
          template: 'education/course-management.hbs',
          props: { progressTracking: true, assessments: true },
          conditions: { hasCourses: true },
          priority: 1
        }
      ],
      requiredFeatures: ['accessibility', 'progress-tracking', 'content-management'],
      recommendedMixins: ['accessibility-enhanced', 'analytics-tracking'],
      compliance: [
        { standard: 'WCAG', level: 'AAA', required: true, features: ['full-accessibility'] },
        { standard: 'GDPR', level: 'compliant', required: true, features: ['student-privacy'] }
      ],
      styling: {
        colorPalette: {
          primary: '#7c3aed',
          secondary: '#6b7280',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f9fafb'
        },
        typography: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: true
      },
      metadata: {
        industry: 'Education',
        target_audience: 'Students and Educators',
        complexity: 'moderate',
        scale: 'large',
        performance_requirements: 'optimized'
      }
    });

    // Portfolio pattern
    this.businessPatterns.set('portfolio', {
      id: 'portfolio',
      name: 'Portfolio Showcase',
      description: 'Personal and professional portfolio components',
      domain: 'portfolio',
      patterns: [
        {
          name: 'project-showcase',
          description: 'Project gallery and case study presentation',
          template: 'portfolio/project-showcase.hbs',
          props: { imageGallery: true, caseStudies: true },
          conditions: { hasProjects: true },
          priority: 1
        }
      ],
      requiredFeatures: ['seo', 'responsive-design', 'image-optimization'],
      recommendedMixins: ['seo-optimization', 'analytics-tracking'],
      compliance: [
        { standard: 'WCAG', level: 'AA', required: true, features: ['accessibility'] }
      ],
      styling: {
        colorPalette: {
          primary: '#8b5cf6',
          secondary: '#64748b',
          accent: '#06b6d4',
          background: '#ffffff',
          surface: '#f8fafc'
        },
        typography: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: true
      },
      metadata: {
        industry: 'Creative',
        target_audience: 'Potential Clients and Employers',
        complexity: 'simple',
        scale: 'small',
        performance_requirements: 'optimized'
      }
    });

    // Blog pattern
    this.businessPatterns.set('blog', {
      id: 'blog',
      name: 'Blog Platform',
      description: 'Content management and publishing components',
      domain: 'blog',
      patterns: [
        {
          name: 'article-layout',
          description: 'Article display with reading experience optimization',
          template: 'blog/article-layout.hbs',
          props: { readingTime: true, tableOfContents: true },
          conditions: { hasContent: true },
          priority: 1
        }
      ],
      requiredFeatures: ['seo', 'content-management', 'search', 'comments'],
      recommendedMixins: ['seo-optimization', 'accessibility-enhanced'],
      compliance: [
        { standard: 'WCAG', level: 'AA', required: true, features: ['content-accessibility'] }
      ],
      styling: {
        colorPalette: {
          primary: '#059669',
          secondary: '#6b7280',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f9fafb'
        },
        typography: {
          heading: 'Georgia, serif',
          body: 'Georgia, serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: true
      },
      metadata: {
        industry: 'Publishing',
        target_audience: 'Readers',
        complexity: 'moderate',
        scale: 'medium',
        performance_requirements: 'optimized'
      }
    });

    // Corporate pattern (enhanced)
    this.businessPatterns.set('corporate', {
      id: 'corporate',
      name: 'Corporate Website',
      description: 'Professional corporate and business components',
      domain: 'corporate',
      patterns: [
        {
          name: 'company-profile',
          description: 'Company information and team presentation',
          template: 'corporate/company-profile.hbs',
          props: { teamDirectory: true, companyStats: true },
          conditions: { hasCompanyInfo: true },
          priority: 1
        }
      ],
      requiredFeatures: ['seo', 'contact-forms', 'professional-design'],
      recommendedMixins: ['seo-optimization', 'norwegian-compliance'],
      compliance: [
        { standard: 'WCAG', level: 'AA', required: true, features: ['accessibility'] },
        { standard: 'GDPR', level: 'compliant', required: true, features: ['privacy-compliance'] }
      ],
      styling: {
        colorPalette: {
          primary: '#1e40af',
          secondary: '#64748b',
          accent: '#059669',
          background: '#ffffff',
          surface: '#f8fafc'
        },
        typography: {
          heading: 'system-ui, sans-serif',
          body: 'system-ui, sans-serif'
        },
        spacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem'
        },
        components: {},
        responsive: true,
        darkMode: false
      },
      metadata: {
        industry: 'Professional Services',
        target_audience: 'Business Clients',
        complexity: 'moderate',
        scale: 'medium',
        performance_requirements: 'optimized'
      }
    });

    consola.success('Initialized business context patterns');
  }

  /**
   * Add technical context optimization patterns
   */
  addTechnicalOptimizations(composition: CompositionContext): CompositionContext {
    const optimized = { ...composition };

    // React-specific optimizations
    if (composition.platform === 'react' || composition.platform === 'nextjs') {
      optimized.features = {
        ...optimized.features,
        memo: true,
        useCallback: true,
        useMemo: true,
        lazy: composition.features?.lazy || false
      };
    }

    // Vue-specific optimizations
    if (composition.platform === 'vue') {
      optimized.features = {
        ...optimized.features,
        computed: true,
        watchers: true,
        compositionAPI: true
      };
    }

    // Angular-specific optimizations
    if (composition.platform === 'angular') {
      optimized.features = {
        ...optimized.features,
        onPush: true,
        trackBy: true,
        standalone: true
      };
    }

    // Svelte-specific optimizations
    if (composition.platform === 'svelte') {
      optimized.features = {
        ...optimized.features,
        stores: true,
        reactive: true,
        transitions: composition.features?.animations || false
      };
    }

    // TypeScript strict mode patterns
    if (optimized.features?.typescript) {
      optimized.customization = {
        ...optimized.customization,
        typeScript: {
          strict: true,
          noImplicitAny: true,
          exactOptionalPropertyTypes: true
        }
      };
    }

    // SSR optimization patterns
    if (composition.platform === 'nextjs' || optimized.features?.ssr) {
      optimized.features = {
        ...optimized.features,
        ssr: true,
        hydration: true,
        staticGeneration: true
      };
    }

    // Mobile-first responsive patterns
    if (optimized.features?.responsive) {
      optimized.customization = {
        ...optimized.customization,
        responsive: {
          strategy: 'mobile-first',
          breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
          containerQueries: true
        }
      };
    }

    return optimized;
  }

  /**
   * Add performance context integration
   */
  addPerformanceOptimizations(composition: CompositionContext): CompositionContext {
    const optimized = { ...composition };

    // Bundle size optimization
    if (optimized.customization?.performance === 'high-performance') {
      optimized.features = {
        ...optimized.features,
        treeShaking: true,
        codesplitting: true,
        dynamicImports: true,
        bundleAnalysis: true
      };
    }

    // Lazy loading patterns
    if (optimized.features?.lazy) {
      optimized.customization = {
        ...optimized.customization,
        lazyLoading: {
          images: true,
          components: true,
          routes: true,
          intersectionObserver: true
        }
      };
    }

    // Virtual scrolling for large datasets
    if (optimized.features?.virtualScrolling) {
      optimized.customization = {
        ...optimized.customization,
        virtualScrolling: {
          itemHeight: 'auto',
          overscan: 5,
          windowSize: 10
        }
      };
    }

    // Image optimization
    if (optimized.features?.imageOptimization) {
      optimized.customization = {
        ...optimized.customization,
        images: {
          responsive: true,
          webp: true,
          avif: true,
          placeholder: 'blur',
          sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        }
      };
    }

    // Caching patterns
    if (optimized.features?.caching) {
      optimized.customization = {
        ...optimized.customization,
        caching: {
          apiCache: true,
          staticAssets: true,
          serviceWorker: true,
          staleWhileRevalidate: true
        }
      };
    }

    // Prefetching patterns
    if (optimized.features?.prefetching) {
      optimized.customization = {
        ...optimized.customization,
        prefetching: {
          dns: true,
          preconnect: true,
          preload: true,
          prefetch: true
        }
      };
    }

    // Service worker patterns
    if (optimized.features?.serviceWorker) {
      optimized.customization = {
        ...optimized.customization,
        serviceWorker: {
          caching: true,
          offline: true,
          pushNotifications: false,
          backgroundSync: false
        }
      };
    }

    return optimized;
  }
}

// Singleton instance
export const contextAwareGenerator = new ContextAwareGenerator();