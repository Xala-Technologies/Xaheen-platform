/**
 * Locale-Aware Code Generation
 * Generates components, pages, and configurations with built-in localization support
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { isRTL } from '../utils/rtl-support';

/**
 * Generation result interface
 */
export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Component generation options
 */
export interface ComponentOptions {
  name: string;
  type?: 'functional' | 'class' | 'hook' | 'provider';
  locales: string[];
  primaryLocale?: string;
  outputPath?: string;
  useRTL?: boolean;
  typescript?: boolean;
  framework?: 'react' | 'vue' | 'angular' | 'svelte';
  ui?: 'default' | 'xala';
}

/**
 * Page generation options
 */
export interface PageOptions {
  name: string;
  route?: string;
  locales: string[];
  primaryLocale?: string;
  outputPath?: string;
  useRTL?: boolean;
  typescript?: boolean;
  framework?: 'nextjs' | 'nuxt' | 'sveltekit' | 'remix';
  layout?: string;
  auth?: boolean;
}

/**
 * Generate a localized component
 * @param options - Component generation options
 * @returns Generation result
 */
export async function generateLocalizedComponent(options: ComponentOptions): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: false,
    files: [],
    errors: [],
    warnings: [],
  };
  
  try {
    const {
      name,
      type = 'functional',
      locales,
      primaryLocale = 'en',
      outputPath,
      useRTL = false,
      typescript = true,
      framework = 'react',
      ui = 'default',
    } = options;
    
    // Validate component name
    if (!isValidComponentName(name)) {
      result.errors?.push(`Invalid component name: ${name}`);
      return result;
    }
    
    // Determine output directory
    const outputDir = outputPath || path.join(
      process.cwd(),
      'src',
      'components',
      name
    );
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate component file
    const componentTemplate = getComponentTemplate(framework, type, ui);
    const componentContent = generateComponentContent({
      name,
      type,
      locales,
      primaryLocale,
      useRTL,
      typescript,
      framework,
      template: componentTemplate,
    });
    
    const extension = typescript ? '.tsx' : '.jsx';
    const componentFile = path.join(outputDir, `${name}${extension}`);
    fs.writeFileSync(componentFile, componentContent, 'utf-8');
    result.files.push(componentFile);
    
    // Generate translation files
    const translationKeys = extractComponentTranslationKeys(name, type);
    for (const locale of locales) {
      const translationFile = path.join(outputDir, `${name}.${locale}.json`);
      const translations = generateComponentTranslations(translationKeys, locale, name);
      fs.writeFileSync(translationFile, JSON.stringify(translations, null, 2), 'utf-8');
      result.files.push(translationFile);
    }
    
    // Generate index file
    const indexContent = generateIndexFile(name, typescript);
    const indexFile = path.join(outputDir, `index${typescript ? '.ts' : '.js'}`);
    fs.writeFileSync(indexFile, indexContent, 'utf-8');
    result.files.push(indexFile);
    
    // Generate test file if requested
    if (type !== 'hook') {
      const testContent = generateComponentTest(name, framework, typescript);
      const testFile = path.join(outputDir, `${name}.test${extension}`);
      fs.writeFileSync(testFile, testContent, 'utf-8');
      result.files.push(testFile);
    }
    
    // Add RTL-specific styles if needed
    if (useRTL && hasRTLLocale(locales)) {
      const rtlStylesContent = generateRTLStyles(name);
      const rtlStylesFile = path.join(outputDir, `${name}.rtl.css`);
      fs.writeFileSync(rtlStylesFile, rtlStylesContent, 'utf-8');
      result.files.push(rtlStylesFile);
    }
    
    result.success = true;
    
  } catch (error) {
    result.errors?.push(`Component generation failed: ${error.message}`);
  }
  
  return result;
}

/**
 * Generate a localized page
 * @param options - Page generation options
 * @returns Generation result
 */
export async function generateLocalizedPage(options: PageOptions): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: false,
    files: [],
    errors: [],
    warnings: [],
  };
  
  try {
    const {
      name,
      route,
      locales,
      primaryLocale = 'en',
      outputPath,
      useRTL = false,
      typescript = true,
      framework = 'nextjs',
      layout,
      auth = false,
    } = options;
    
    // Validate page name
    if (!isValidPageName(name)) {
      result.errors?.push(`Invalid page name: ${name}`);
      return result;
    }
    
    // Determine output directory based on framework
    const outputDir = outputPath || getPageOutputPath(framework, name, route);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate page file(s) based on framework
    if (framework === 'nextjs') {
      // Generate page for each locale (App Router)
      for (const locale of locales) {
        const pageDir = path.join(outputDir, `[locale]`);
        if (!fs.existsSync(pageDir)) {
          fs.mkdirSync(pageDir, { recursive: true });
        }
        
        const pageContent = generateNextPageContent({
          name,
          locale,
          primaryLocale,
          useRTL,
          typescript,
          layout,
          auth,
        });
        
        const pageFile = path.join(pageDir, `page${typescript ? '.tsx' : '.jsx'}`);
        fs.writeFileSync(pageFile, pageContent, 'utf-8');
        result.files.push(pageFile);
      }
      
      // Generate layout if needed
      if (layout) {
        const layoutContent = generateNextLayoutContent({
          name: layout,
          locales,
          useRTL,
          typescript,
        });
        
        const layoutFile = path.join(outputDir, `[locale]`, `layout${typescript ? '.tsx' : '.jsx'}`);
        fs.writeFileSync(layoutFile, layoutContent, 'utf-8');
        result.files.push(layoutFile);
      }
      
      // Generate middleware for locale routing
      const middlewareContent = generateNextMiddleware(locales, primaryLocale);
      const middlewareFile = path.join(process.cwd(), 'src', `middleware${typescript ? '.ts' : '.js'}`);
      
      if (!fs.existsSync(middlewareFile)) {
        fs.writeFileSync(middlewareFile, middlewareContent, 'utf-8');
        result.files.push(middlewareFile);
      } else {
        result.warnings?.push('Middleware file already exists, skipping generation');
      }
    }
    
    // Generate page translations
    const pageTranslationKeys = extractPageTranslationKeys(name);
    for (const locale of locales) {
      const translationFile = path.join(outputDir, `${name}.${locale}.json`);
      const translations = generatePageTranslations(pageTranslationKeys, locale, name);
      fs.writeFileSync(translationFile, JSON.stringify(translations, null, 2), 'utf-8');
      result.files.push(translationFile);
    }
    
    result.success = true;
    
  } catch (error) {
    result.errors?.push(`Page generation failed: ${error.message}`);
  }
  
  return result;
}

/**
 * Add localization to existing project
 * @param projectPath - Path to project
 * @param locales - Locales to add
 */
export async function addLocalizationToExisting(
  projectPath: string,
  locales: string[]
): Promise<void> {
  // Check if project exists
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }
  
  // Detect project type
  const projectType = detectProjectType(projectPath);
  
  // Create localization directories
  const localizationDir = path.join(projectPath, 'src', 'localization');
  const languagesDir = path.join(localizationDir, 'languages');
  const utilsDir = path.join(localizationDir, 'utils');
  
  [localizationDir, languagesDir, utilsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Generate language files
  for (const locale of locales) {
    const langFile = path.join(languagesDir, `${locale}.json`);
    if (!fs.existsSync(langFile)) {
      const defaultTranslations = generateDefaultTranslations(locale);
      fs.writeFileSync(langFile, JSON.stringify(defaultTranslations, null, 2), 'utf-8');
    }
  }
  
  // Generate i18n configuration
  const i18nConfig = generateI18nConfig(locales, projectType);
  const configFile = path.join(localizationDir, 'i18n.config.ts');
  fs.writeFileSync(configFile, i18nConfig, 'utf-8');
  
  // Generate locale provider
  const providerContent = generateLocaleProvider(projectType);
  const providerFile = path.join(localizationDir, 'LocaleProvider.tsx');
  fs.writeFileSync(providerFile, providerContent, 'utf-8');
  
  // Update project configuration files
  updateProjectConfig(projectPath, locales, projectType);
}

/**
 * Helper functions
 */

function isValidComponentName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

function isValidPageName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

function hasRTLLocale(locales: string[]): boolean {
  return locales.some(locale => isRTL(locale));
}

function detectProjectType(projectPath: string): string {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return 'unknown';
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps['next']) return 'nextjs';
  if (deps['nuxt']) return 'nuxt';
  if (deps['@remix-run/react']) return 'remix';
  if (deps['@sveltejs/kit']) return 'sveltekit';
  if (deps['react']) return 'react';
  if (deps['vue']) return 'vue';
  
  return 'unknown';
}

function getComponentTemplate(framework: string, type: string, ui: string): string {
  // Return appropriate template based on framework and type
  const templatePath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'templates',
    'components',
    framework,
    `${type}.hbs`
  );
  
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  
  // Return default template
  return getDefaultComponentTemplate(framework, type);
}

function getDefaultComponentTemplate(framework: string, type: string): string {
  if (framework === 'react' && type === 'functional') {
    return `import React from 'react';
{{#if typescript}}
import type { FC } from 'react';
{{/if}}
import { useTranslation } from 'react-i18next';
{{#if useRTL}}
import { useRTL } from '../utils/rtl';
{{/if}}

{{#if typescript}}
interface {{name}}Props {
  // Add props here
}
{{/if}}

export const {{name}}{{#if typescript}}: FC<{{name}}Props>{{/if}} = (props) => {
  const { t } = useTranslation('{{camelCase name}}');
  {{#if useRTL}}
  const { isRTL, dir } = useRTL();
  {{/if}}
  
  return (
    <div{{#if useRTL}} dir={dir}{{/if}}>
      <h1>{t('title')}</h1>
      {/* Component content */}
    </div>
  );
};`;
  }
  
  return '// Template not found';
}

function generateComponentContent(options: any): string {
  const template = Handlebars.compile(options.template);
  return template(options);
}

function extractComponentTranslationKeys(name: string, type: string): string[] {
  const baseKeys = ['title', 'description'];
  
  if (type === 'form') {
    baseKeys.push('submit', 'cancel', 'validation.required', 'validation.invalid');
  }
  
  return baseKeys;
}

function generateComponentTranslations(
  keys: string[],
  locale: string,
  componentName: string
): Record<string, any> {
  const translations: Record<string, any> = {};
  
  for (const key of keys) {
    const parts = key.split('.');
    let current = translations;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = `[${locale}] ${componentName} ${key}`;
  }
  
  return translations;
}

function generateIndexFile(name: string, typescript: boolean): string {
  return `export { ${name} } from './${name}';
${typescript ? `export type { ${name}Props } from './${name}';` : ''}
`;
}

function generateComponentTest(name: string, framework: string, typescript: boolean): string {
  if (framework === 'react') {
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});`;
  }
  
  return '// Test template not implemented';
}

function generateRTLStyles(name: string): string {
  return `/* RTL styles for ${name} */
[dir="rtl"] .${name} {
  text-align: right;
}

[dir="rtl"] .${name}__content {
  flex-direction: row-reverse;
}`;
}

function getPageOutputPath(framework: string, name: string, route?: string): string {
  const basePath = process.cwd();
  
  if (framework === 'nextjs') {
    const routePath = route || name;
    return path.join(basePath, 'src', 'app', routePath);
  }
  
  return path.join(basePath, 'src', 'pages', name);
}

function generateNextPageContent(options: any): string {
  return `import { useTranslations } from 'next-intl';
${options.typescript ? "import type { Metadata } from 'next';" : ''}

${options.typescript ? `export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: \`[${options.locale}] ${options.name} Page\`,
  };
}` : ''}

export default function ${options.name}Page() {
  const t = useTranslations('${options.name}');
  
  return (
    <div${options.useRTL ? ` dir="${isRTL(options.locale) ? 'rtl' : 'ltr'}"` : ''}>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}`;
}

function generateNextLayoutContent(options: any): string {
  return `import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(\`@/localization/languages/\${locale}.json\`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}`;
}

function generateNextMiddleware(locales: string[], defaultLocale: string): string {
  return `import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ${JSON.stringify(locales)},
  defaultLocale: '${defaultLocale}',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)']
};`;
}

function extractPageTranslationKeys(name: string): string[] {
  return [
    'title',
    'description',
    'meta.title',
    'meta.description',
    'meta.keywords',
  ];
}

function generatePageTranslations(
  keys: string[],
  locale: string,
  pageName: string
): Record<string, any> {
  const translations: Record<string, any> = {};
  
  for (const key of keys) {
    const parts = key.split('.');
    let current = translations;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = `[${locale}] ${pageName} ${key}`;
  }
  
  return translations;
}

function generateDefaultTranslations(locale: string): Record<string, any> {
  return {
    common: {
      welcome: `Welcome [${locale}]`,
      loading: `Loading [${locale}]`,
      error: `Error [${locale}]`,
      success: `Success [${locale}]`,
    },
    navigation: {
      home: `Home [${locale}]`,
      about: `About [${locale}]`,
      contact: `Contact [${locale}]`,
    },
  };
}

function generateI18nConfig(locales: string[], projectType: string): string {
  return `export const i18nConfig = {
  locales: ${JSON.stringify(locales)},
  defaultLocale: '${locales[0]}',
  namespaces: ['common', 'navigation'],
  defaultNamespace: 'common',
};

export type Locale = (typeof i18nConfig)['locales'][number];`;
}

function generateLocaleProvider(projectType: string): string {
  if (projectType === 'react' || projectType === 'nextjs') {
    return `import React, { createContext, useContext, useState } from 'react';
import { i18nConfig, type Locale } from './i18n.config';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(i18nConfig.defaultLocale);
  
  const t = (key: string) => {
    // Simple translation function - replace with actual implementation
    return \`[\${locale}] \${key}\`;
  };
  
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}`;
  }
  
  return '// Locale provider not implemented for this project type';
}

function updateProjectConfig(projectPath: string, locales: string[], projectType: string): void {
  // Update Next.js config
  if (projectType === 'nextjs') {
    const configPath = path.join(projectPath, 'next.config.js');
    if (fs.existsSync(configPath)) {
      // Add i18n configuration to existing config
      // This is simplified - in production, use proper AST manipulation
      console.log('Please manually add i18n configuration to next.config.js');
    }
  }
  
  // Update package.json with i18n dependencies
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // Add i18n dependencies based on project type
    if (projectType === 'react') {
      packageJson.dependencies['react-i18next'] = '^13.5.0';
      packageJson.dependencies['i18next'] = '^23.7.6';
    } else if (projectType === 'nextjs') {
      packageJson.dependencies['next-intl'] = '^3.3.0';
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  }
}