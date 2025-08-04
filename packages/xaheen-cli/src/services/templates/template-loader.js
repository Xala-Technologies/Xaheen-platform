/**
 * Template Loader Utility
 *
 * Handles loading and caching of external Handlebars templates.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { consola } from 'consola';
import { mcpClient } from '../mcp/mcp-client.js';
import { accessibilityValidator } from './accessibility-validator.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class TemplateLoader {
    templateCache = new Map();
    metadataCache = new Map();
    templatesPath;
    constructor() {
        this.templatesPath = path.resolve(__dirname, '../../templates');
        this.registerHelpers();
    }
    /**
     * Load a template by its path relative to templates directory
     */
    async loadTemplate(templatePath) {
        const cacheKey = templatePath;
        // Check if template is cached and still valid
        const cached = this.templateCache.get(cacheKey);
        const metadata = this.metadataCache.get(cacheKey);
        if (cached && metadata) {
            const fullPath = path.join(this.templatesPath, templatePath);
            const stats = await fs.stat(fullPath);
            // Return cached template if file hasn't changed
            if (stats.mtimeMs === metadata.lastModified) {
                return cached;
            }
        }
        // Load template from disk
        const fullPath = path.join(this.templatesPath, templatePath);
        if (!(await fs.pathExists(fullPath))) {
            throw new Error(`Template not found: ${templatePath}`);
        }
        const templateContent = await fs.readFile(fullPath, 'utf-8');
        const compiledTemplate = Handlebars.compile(templateContent);
        // Cache the template
        this.templateCache.set(cacheKey, compiledTemplate);
        // Cache metadata
        const stats = await fs.stat(fullPath);
        const pathParts = templatePath.split('/');
        this.metadataCache.set(cacheKey, {
            path: templatePath,
            category: pathParts[0],
            type: pathParts[1],
            lastModified: stats.mtimeMs
        });
        consola.debug(`Loaded template: ${templatePath}`);
        return compiledTemplate;
    }
    /**
     * Render a template with context
     */
    async renderTemplate(templatePath, context) {
        const template = await this.loadTemplate(templatePath);
        let enhancedContext = this.enhanceContext(context);
        // Add MCP intelligence if component name is provided
        if (context.componentName) {
            enhancedContext = await mcpClient.enhanceTemplateContext(enhancedContext, context.componentName);
        }
        return template(enhancedContext);
    }
    /**
     * Enhance template context with UI System version and metadata
     */
    enhanceContext(context) {
        return {
            ...context,
            // UI System metadata
            uiSystem: {
                version: this.getUISystemVersion(),
                semanticComponents: true,
                designTokens: true,
                accessibilityCompliant: true,
                norwegianCompliant: true
            },
            // Design token access
            tokens: {
                spacing: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
                colors: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
                sizes: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
                variants: ['solid', 'outline', 'ghost', 'link'],
                // Advanced design tokens
                typography: {
                    fontSizes: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
                    fontWeights: ['light', 'normal', 'medium', 'semibold', 'bold'],
                    lineHeights: ['tight', 'snug', 'normal', 'relaxed', 'loose']
                },
                effects: {
                    shadows: ['sm', 'md', 'lg', 'xl', '2xl'],
                    borders: ['none', 'thin', 'thick'],
                    radius: ['none', 'sm', 'md', 'lg', 'xl', 'full']
                }
            },
            // Responsive breakpoints
            breakpoints: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px'
            },
            // Accessibility helpers
            accessibility: {
                wcagLevel: 'AAA',
                ariaSupport: true,
                keyboardNavigation: true,
                screenReaderOptimized: true,
                // Default accessibility props
                defaults: {
                    button: {
                        role: 'button',
                        tabIndex: 0
                    },
                    form: {
                        noValidate: true,
                        role: 'form'
                    },
                    input: {
                        required: false,
                        'aria-invalid': 'false'
                    },
                    navigation: {
                        role: 'navigation',
                        'aria-label': 'Main navigation'
                    },
                    heading: {
                        role: 'heading'
                    },
                    dialog: {
                        role: 'dialog',
                        'aria-modal': 'true'
                    },
                    table: {
                        role: 'table'
                    },
                    list: {
                        role: 'list'
                    }
                }
            },
            // Norwegian compliance
            norwegian: {
                nsmClassifications: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
                gdprCompliant: true,
                altinnCompatible: true,
                localeSupport: ['nb-NO', 'nn-NO', 'en-NO']
            },
            // Internationalization
            i18n: {
                defaultLocale: 'nb-NO', // Norwegian Bokmål as default for Norwegian compliance
                supportedLocales: ['nb-NO', 'nn-NO', 'en-US', 'en-NO', 'ar-SA'], // Added Arabic for RTL
                namespaces: ['common', 'navigation', 'forms', 'errors', 'compliance', 'altinn', 'gdpr'],
                // Norwegian-specific defaults
                norwegianDefaults: {
                    currency: 'NOK',
                    dateFormat: 'dd.MM.yyyy',
                    numberFormat: 'nb-NO',
                    timezone: 'Europe/Oslo',
                    phoneFormat: '+47 ### ## ###',
                    postalCodeFormat: '#### ####'
                },
                // RTL support
                rtlLocales: ['ar-SA'],
                // Translation function placeholders
                functions: {
                    t: (key, options) => `{t('${key}'${options ? `, ${JSON.stringify(options)}` : ''})}`,
                    plural: (key, count) => `{t('${key}', { count: ${count} })}`,
                    interpolate: (key, variables) => `{t('${key}', ${JSON.stringify(variables)})}`,
                    formatCurrency: (amount, currency = 'NOK') => `{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: '${currency}' }).format(${amount})}`,
                    formatDate: (date) => `{new Date('${date}').toLocaleDateString('nb-NO')}`,
                    formatNumber: (number) => `{new Intl.NumberFormat('nb-NO').format(${number})}`
                }
            },
            // AI optimization metadata
            ai: {
                semanticNaming: true,
                predictablePatterns: true,
                tokenOptimized: true,
                compositionFriendly: true
            }
        };
    }
    /**
     * Get UI System version from package.json
     */
    getUISystemVersion() {
        try {
            // Try to load UI System package.json to get version
            const packagePath = path.resolve(process.cwd(), 'node_modules/@xala-technologies/ui-system/package.json');
            if (require('fs').existsSync(packagePath)) {
                const packageJson = require(packagePath);
                return packageJson.version || '5.0.0';
            }
        }
        catch (error) {
            consola.debug('Could not determine UI System version, using default');
        }
        return '5.0.0'; // Default version
    }
    /**
     * Get template by service configuration
     */
    getTemplatePath(serviceType, templateType, filename) {
        return `${serviceType}/${templateType}s/${filename}.hbs`;
    }
    /**
     * List all available templates
     */
    async listTemplates() {
        const templates = [];
        const scanDirectory = async (dir, category = '') => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    const newCategory = category ? `${category}/${entry.name}` : entry.name;
                    await scanDirectory(entryPath, newCategory);
                }
                else if (entry.name.endsWith('.hbs')) {
                    const relativePath = path.relative(this.templatesPath, entryPath);
                    const pathParts = relativePath.split('/');
                    const stats = await fs.stat(entryPath);
                    templates.push({
                        path: relativePath,
                        category: pathParts[0],
                        type: pathParts[1],
                        lastModified: stats.mtimeMs
                    });
                }
            }
        };
        await scanDirectory(this.templatesPath);
        return templates;
    }
    /**
     * Clear template cache
     */
    clearCache() {
        this.templateCache.clear();
        this.metadataCache.clear();
        consola.debug('Template cache cleared');
    }
    /**
     * Pre-load commonly used templates
     */
    async preloadTemplates(templatePaths) {
        const loadPromises = templatePaths.map(path => this.loadTemplate(path));
        await Promise.all(loadPromises);
        consola.debug(`Pre-loaded ${templatePaths.length} templates`);
    }
    /**
     * Validate template accessibility compliance
     */
    async validateAccessibility(templatePath, context) {
        try {
            const fullPath = path.join(this.templatesPath, templatePath);
            const templateContent = await fs.readFile(fullPath, 'utf-8');
            const validationContext = {
                templateContent,
                componentName: context.componentName,
                targetLevel: context.targetLevel || 'AAA',
                nsmClassification: context.nsmClassification || 'OPEN',
                norwegianCompliance: context.norwegianCompliance ?? true,
                platform: context.platform || 'react'
            };
            const result = await accessibilityValidator.validateTemplate(validationContext);
            if (!result.isValid) {
                consola.warn(`Accessibility issues found in ${templatePath}:`);
                result.violations.forEach(violation => {
                    consola.warn(`  - ${violation.description} (${violation.wcagCriterion})`);
                });
            }
            return result;
        }
        catch (error) {
            consola.error(`Failed to validate accessibility for ${templatePath}:`, error);
            throw error;
        }
    }
    /**
     * Register Handlebars helpers
     */
    registerHelpers() {
        // Conditional helpers
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('ne', (a, b) => a !== b);
        Handlebars.registerHelper('lt', (a, b) => a < b);
        Handlebars.registerHelper('gt', (a, b) => a > b);
        Handlebars.registerHelper('lte', (a, b) => a <= b);
        Handlebars.registerHelper('gte', (a, b) => a >= b);
        // Logical helpers
        Handlebars.registerHelper('and', (...args) => {
            return Array.prototype.slice.call(args, 0, -1).every(Boolean);
        });
        Handlebars.registerHelper('or', (...args) => {
            return Array.prototype.slice.call(args, 0, -1).some(Boolean);
        });
        Handlebars.registerHelper('not', (value) => !value);
        // String helpers
        Handlebars.registerHelper('capitalize', (str) => {
            if (typeof str !== 'string')
                return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        Handlebars.registerHelper('lowercase', (str) => {
            if (typeof str !== 'string')
                return '';
            return str.toLowerCase();
        });
        Handlebars.registerHelper('uppercase', (str) => {
            if (typeof str !== 'string')
                return '';
            return str.toUpperCase();
        });
        Handlebars.registerHelper('camelCase', (str) => {
            if (typeof str !== 'string')
                return '';
            return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
        });
        Handlebars.registerHelper('kebabCase', (str) => {
            if (typeof str !== 'string')
                return '';
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        });
        Handlebars.registerHelper('snakeCase', (str) => {
            if (typeof str !== 'string')
                return '';
            return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        });
        // JSON helpers
        Handlebars.registerHelper('json', (context, options) => {
            const spaces = options?.hash?.spaces || 2;
            return JSON.stringify(context, null, spaces);
        });
        Handlebars.registerHelper('jsonPretty', (context) => {
            return JSON.stringify(context, null, 2);
        });
        // Array helpers
        Handlebars.registerHelper('join', (array, separator = ', ') => {
            if (Array.isArray(array)) {
                return array.join(separator);
            }
            return '';
        });
        Handlebars.registerHelper('length', (array) => {
            if (Array.isArray(array)) {
                return array.length;
            }
            return 0;
        });
        // Framework-specific helpers
        Handlebars.registerHelper('isFramework', (framework, expected) => {
            return framework === expected;
        });
        Handlebars.registerHelper('hasFeature', (features, feature) => {
            if (Array.isArray(features)) {
                return features.includes(feature);
            }
            return false;
        });
        // UI System semantic component helpers - AI-Optimized
        Handlebars.registerHelper('if_contains', (array, value, options) => {
            if (Array.isArray(array) && array.includes(value)) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper('containerSize', (context) => {
            // Smart container sizing based on context
            if (context.type === 'dashboard')
                return 'xl';
            if (context.type === 'form')
                return 'md';
            if (context.type === 'landing')
                return 'full';
            return 'lg';
        });
        Handlebars.registerHelper('stackGap', (context) => {
            // Smart gap sizing for Stack components
            if (context.density === 'compact')
                return 'sm';
            if (context.density === 'spacious')
                return 'xl';
            return 'lg';
        });
        Handlebars.registerHelper('textVariant', (level) => {
            // Convert heading levels to Text variants
            const variants = {
                1: 'h1',
                2: 'h2',
                3: 'h3',
                4: 'h4',
                5: 'h5',
                6: 'h6'
            };
            return variants[level] || 'body';
        });
        Handlebars.registerHelper('buttonVariant', (context) => {
            // Smart button variant selection
            if (context.primary)
                return 'primary';
            if (context.destructive)
                return 'destructive';
            if (context.subtle)
                return 'ghost';
            return 'outline';
        });
        Handlebars.registerHelper('gridColumns', (count, responsive = true) => {
            if (responsive) {
                if (count <= 2)
                    return '{ base: 1, md: 2 }';
                if (count <= 3)
                    return '{ base: 1, md: 2, lg: 3 }';
                if (count <= 4)
                    return '{ base: 1, sm: 2, md: 3, lg: 4 }';
                return '{ base: 1, sm: 2, md: 4, lg: 6 }';
            }
            return count.toString();
        });
        // Norwegian compliance helpers
        Handlebars.registerHelper('nsmClassification', (level) => {
            const levels = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
            return levels.includes(level) ? level : 'OPEN';
        });
        Handlebars.registerHelper('i18nKey', (domain, key) => {
            return `${domain}.${key}`;
        });
        // Enhanced i18n helpers
        Handlebars.registerHelper('t', (key, options = {}) => {
            if (options && typeof options === 'object' && Object.keys(options).length > 0) {
                return `{t('${key}', ${JSON.stringify(options)})}`;
            }
            return `{t('${key}')}`;
        });
        Handlebars.registerHelper('tPlural', (key, count) => {
            return `{t('${key}', { count: ${count} })}`;
        });
        Handlebars.registerHelper('tWithVars', (key, variables) => {
            if (typeof variables === 'object') {
                return `{t('${key}', ${JSON.stringify(variables)})}`;
            }
            return `{t('${key}')}`;
        });
        Handlebars.registerHelper('locale', (supportedLocales) => {
            if (Array.isArray(supportedLocales)) {
                return supportedLocales.join("', '");
            }
            return "en', 'nb-NO', 'nn-NO";
        });
        Handlebars.registerHelper('norwegianLocale', () => {
            return "nb-NO";
        });
        Handlebars.registerHelper('i18nNamespace', (component) => {
            const namespaceMap = {
                navigation: 'navigation',
                form: 'forms',
                button: 'common',
                error: 'errors',
                modal: 'common',
                table: 'common'
            };
            return namespaceMap[component] || 'common';
        });
        Handlebars.registerHelper('accessibilityProps', (component) => {
            const props = [];
            if (component.ariaLabel)
                props.push(`aria-label="${component.ariaLabel}"`);
            if (component.ariaDescribedBy)
                props.push(`aria-describedby="${component.ariaDescribedBy}"`);
            if (component.role)
                props.push(`role="${component.role}"`);
            return props.join(' ');
        });
        // Enhanced accessibility helpers
        Handlebars.registerHelper('a11yProps', (elementType, customProps = {}) => {
            const defaults = {
                button: { role: 'button', tabIndex: '0' },
                form: { noValidate: true, role: 'form' },
                input: { required: false, 'aria-invalid': 'false' },
                navigation: { role: 'navigation', 'aria-label': 'Main navigation' },
                heading: { role: 'heading' },
                dialog: { role: 'dialog', 'aria-modal': 'true' },
                table: { role: 'table' },
                list: { role: 'list' }
            };
            const props = { ...defaults[elementType], ...customProps };
            return Object.entries(props).map(([key, value]) => {
                if (typeof value === 'boolean') {
                    return value ? key : '';
                }
                return `${key}="${value}"`;
            }).filter(Boolean).join(' ');
        });
        Handlebars.registerHelper('screenReaderOnly', (text) => {
            return `<span className="sr-only">${text}</span>`;
        });
        Handlebars.registerHelper('focusClasses', (element) => {
            const focusClasses = {
                button: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                input: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                link: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                card: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            };
            return focusClasses[element] || 'focus:outline-none focus:ring-2 focus:ring-primary-500';
        });
        Handlebars.registerHelper('keyboardNavigation', (element) => {
            const keyboardProps = {
                button: 'onKeyDown={(e) => e.key === "Enter" || e.key === " " ? onClick?.(e) : null}',
                link: 'onKeyDown={(e) => e.key === "Enter" ? onClick?.(e) : null}',
                tab: 'onKeyDown={(e) => e.key === "ArrowLeft" || e.key === "ArrowRight" ? handleTabNavigation(e) : null}'
            };
            return keyboardProps[element] || '';
        });
        // Semantic component import helpers
        Handlebars.registerHelper('uiSystemImports', (components) => {
            if (Array.isArray(components)) {
                return `import {\n  ${components.join(',\n  ')}\n} from '@xala-technologies/ui-system';`;
            }
            return "import { Container, Stack, Text, Button } from '@xala-technologies/ui-system';";
        });
        Handlebars.registerHelper('getSemanticComponent', (htmlTag) => {
            const mapping = {
                'div': 'Container',
                'span': 'Text',
                'p': 'Text',
                'h1': 'Text',
                'h2': 'Text',
                'h3': 'Text',
                'h4': 'Text',
                'h5': 'Text',
                'h6': 'Text',
                'button': 'Button',
                'input': 'Input',
                'select': 'Select',
                'textarea': 'Textarea',
                'nav': 'Navigation',
                'header': 'Header',
                'footer': 'Footer',
                'main': 'Main',
                'section': 'Container',
                'article': 'Card'
            };
            return mapping[htmlTag] || 'Container';
        });
        Handlebars.registerHelper('getResponsiveBreakpoints', (context) => {
            return JSON.stringify(context.breakpoints || {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px'
            });
        });
        Handlebars.registerHelper('getDesignTokens', (category) => {
            const tokens = {
                spacing: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
                colors: ['primary', 'secondary', 'success', 'warning', 'error'],
                sizes: ['xs', 'sm', 'md', 'lg', 'xl', 'full']
            };
            return JSON.stringify(tokens[category] || []);
        });
        // Responsive design helpers
        Handlebars.registerHelper('responsiveClasses', (base, responsive) => {
            if (!responsive || typeof responsive !== 'object')
                return base;
            const classes = [base];
            Object.entries(responsive).forEach(([breakpoint, value]) => {
                if (breakpoint !== 'base') {
                    classes.push(`${breakpoint}:${value}`);
                }
            });
            return classes.join(' ');
        });
        Handlebars.registerHelper('responsiveGrid', (columns) => {
            if (typeof columns === 'object') {
                return `grid-cols-${columns.base || 1} md:grid-cols-${columns.md || columns.base || 2} lg:grid-cols-${columns.lg || columns.md || 3}`;
            }
            return `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns || 3}`;
        });
        Handlebars.registerHelper('responsiveSpacing', (spacing) => {
            if (typeof spacing === 'object') {
                return `gap-${spacing.base || 'md'} md:gap-${spacing.md || spacing.base || 'lg'} lg:gap-${spacing.lg || spacing.md || 'xl'}`;
            }
            return `gap-${spacing || 'lg'}`;
        });
        Handlebars.registerHelper('mobileFirst', (property, values) => {
            if (typeof values === 'object') {
                const classes = [];
                if (values.base)
                    classes.push(`${property}-${values.base}`);
                if (values.sm)
                    classes.push(`sm:${property}-${values.sm}`);
                if (values.md)
                    classes.push(`md:${property}-${values.md}`);
                if (values.lg)
                    classes.push(`lg:${property}-${values.lg}`);
                if (values.xl)
                    classes.push(`xl:${property}-${values.xl}`);
                return classes.join(' ');
            }
            return `${property}-${values}`;
        });
        // Environment helpers
        Handlebars.registerHelper('isDev', () => process.env.NODE_ENV === 'development');
        Handlebars.registerHelper('isProd', () => process.env.NODE_ENV === 'production');
        // Date helpers
        Handlebars.registerHelper('currentYear', () => new Date().getFullYear());
        Handlebars.registerHelper('currentDate', () => new Date().toISOString().split('T')[0]);
        // MCP Intelligence helpers
        Handlebars.registerHelper('mcpAIHints', (context) => {
            if (context.mcp?.aiHints) {
                return context.mcp.aiHints.join('\n * ');
            }
            return '';
        });
        Handlebars.registerHelper('mcpComplexity', (context) => {
            return context.mcp?.complexity?.complexity || 'medium';
        });
        Handlebars.registerHelper('mcpTokens', (context) => {
            return context.mcp?.complexity?.estimatedTokens || 1200;
        });
        Handlebars.registerHelper('mcpPatterns', (context) => {
            if (context.mcp?.patterns?.patterns) {
                return context.mcp.patterns.patterns.map(p => `${p.pattern} - ${p.recommendation}`).join('\n * ');
            }
            return '';
        });
        Handlebars.registerHelper('mcpAntiPatterns', (context) => {
            if (context.mcp?.patterns?.antiPatterns) {
                return context.mcp.patterns.antiPatterns.map(p => `AVOID: ${p.pattern} - ${p.reason}. USE: ${p.alternative}`).join('\n * ');
            }
            return '';
        });
        Handlebars.registerHelper('mcpWCAGLevel', (context) => {
            return context.mcp?.compliance?.wcag?.level || 'AAA';
        });
        Handlebars.registerHelper('mcpNSMLevel', (context) => {
            return context.mcp?.compliance?.norwegian?.nsmClassification || 'OPEN';
        });
        Handlebars.registerHelper('mcpLocales', (context) => {
            if (context.mcp?.compliance?.i18n?.supportedLocales) {
                return context.mcp.compliance.i18n.supportedLocales.join("', '");
            }
            return "en', 'nb-NO";
        });
        // Platform-specific helpers
        Handlebars.registerHelper('platformImports', (platform) => {
            const patterns = this.getPlatformSpecificPatterns(platform);
            return patterns.imports.join(', ');
        });
        Handlebars.registerHelper('platformPatterns', (platform) => {
            const patterns = this.getPlatformSpecificPatterns(platform);
            return patterns.patterns.join('\n * ');
        });
        Handlebars.registerHelper('platformExtensions', (platform) => {
            const patterns = this.getPlatformSpecificPatterns(platform);
            return patterns.fileExtensions.join(', ');
        });
        Handlebars.registerHelper('platformTestFramework', (platform) => {
            const patterns = this.getPlatformSpecificPatterns(platform);
            return patterns.testFramework;
        });
        Handlebars.registerHelper('isElectron', (platform) => {
            return platform === 'electron';
        });
        Handlebars.registerHelper('isReactNative', (platform) => {
            return platform === 'react-native';
        });
        Handlebars.registerHelper('isSSRFramework', (platform) => {
            return ['nextjs', 'nuxtjs'].includes(platform);
        });
        Handlebars.registerHelper('isPlatformSpecific', (platform) => {
            const patterns = this.getPlatformSpecificPatterns(platform);
            return patterns.special?.platformSpecific || false;
        });
        Handlebars.registerHelper('hasNativeComponents', (platform) => {
            const patterns = this.getPlatformSpecificPatterns(platform);
            return patterns.special?.nativeComponents || false;
        });
        // Multi-platform generation helpers
        Handlebars.registerHelper('crossPlatformComponent', (componentName, platforms) => {
            if (Array.isArray(platforms)) {
                return platforms.map(platform => `${componentName}.${this.getPlatformSpecificPatterns(platform).fileExtensions[0]}`).join(', ');
            }
            return componentName;
        });
        // Norwegian locale and RTL helpers
        Handlebars.registerHelper('norwegianCurrency', (amount) => {
            return `{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(${amount})}`;
        });
        Handlebars.registerHelper('norwegianDate', (date) => {
            return `{new Date(${date}).toLocaleDateString('nb-NO')}`;
        });
        Handlebars.registerHelper('norwegianNumber', (number) => {
            return `{new Intl.NumberFormat('nb-NO').format(${number})}`;
        });
        Handlebars.registerHelper('norwegianPhone', (phone) => {
            // Format Norwegian phone number
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 8) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
            }
            return phone;
        });
        Handlebars.registerHelper('isRTL', (locale) => {
            const rtlLocales = ['ar-SA', 'ar', 'he', 'fa', 'ur'];
            return rtlLocales.includes(locale);
        });
        Handlebars.registerHelper('textDirection', (locale) => {
            const rtlLocales = ['ar-SA', 'ar', 'he', 'fa', 'ur'];
            return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
        });
        Handlebars.registerHelper('languageDirection', (context) => {
            const locale = context.i18n?.currentLocale || 'nb-NO';
            return context.i18n?.rtlLocales?.includes(locale) ? 'rtl' : 'ltr';
        });
        Handlebars.registerHelper('isNorwegianLocale', (locale) => {
            return ['nb-NO', 'nn-NO', 'en-NO'].includes(locale);
        });
        Handlebars.registerHelper('getDefaultLocale', () => {
            return 'nb-NO';
        });
        Handlebars.registerHelper('formatNorwegianPostalCode', (code) => {
            // Format Norwegian postal code (4 digits + 4 digits)
            const cleaned = code.replace(/\D/g, '');
            if (cleaned.length === 4) {
                return cleaned;
            }
            return code;
        });
        Handlebars.registerHelper('getNorwegianRegions', () => {
            return JSON.stringify([
                'Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland',
                'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark',
                'Vestland', 'Viken', 'Oslo'
            ]);
        });
        // GDPR and compliance helpers
        Handlebars.registerHelper('gdprLawfulBasis', (classification) => {
            const mapping = {
                'OPEN': 'legitimate-interests',
                'RESTRICTED': 'public-task',
                'CONFIDENTIAL': 'vital-interests',
                'SECRET': 'vital-interests'
            };
            return mapping[classification] || 'legitimate-interests';
        });
        Handlebars.registerHelper('dataRetentionPeriod', (classification) => {
            const periods = {
                'OPEN': 365, // 1 year
                'RESTRICTED': 1095, // 3 years
                'CONFIDENTIAL': 2555, // 7 years
                'SECRET': 10950 // 30 years
            };
            return periods[classification] || 365;
        });
        Handlebars.registerHelper('auditLevel', (classification) => {
            const levels = {
                'OPEN': 'basic',
                'RESTRICTED': 'enhanced',
                'CONFIDENTIAL': 'comprehensive',
                'SECRET': 'maximum'
            };
            return levels[classification] || 'basic';
        });
        consola.debug('Registered Handlebars helpers');
    }
    /**
     * Validate template syntax
     */
    async validateTemplate(templatePath) {
        try {
            const fullPath = path.join(this.templatesPath, templatePath);
            const templateContent = await fs.readFile(fullPath, 'utf-8');
            // Try to compile the template
            Handlebars.compile(templateContent);
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Get MCP component specifications for platform-specific generation
     */
    async getMCPSpecs(componentName, platform) {
        try {
            const spec = await mcpClient.loadSpecification(componentName);
            const hints = await mcpClient.getAIHints(componentName, platform);
            const complexity = await mcpClient.getComplexityEstimation(componentName);
            const patterns = await mcpClient.getPatterns(componentName);
            return {
                specification: spec,
                aiHints: hints,
                complexity,
                patterns,
                platformSpecific: this.getPlatformSpecificPatterns(platform)
            };
        }
        catch (error) {
            consola.debug(`Could not load MCP specs for ${componentName}:`, error);
            return null;
        }
    }
    /**
     * Get platform-specific patterns and optimizations
     */
    getPlatformSpecificPatterns(platform) {
        const patterns = {
            react: {
                imports: ['React', 'forwardRef', 'useState', 'useCallback', 'useMemo'],
                patterns: [
                    'Use forwardRef for DOM access',
                    'Implement proper TypeScript interfaces',
                    'Use semantic UI System components',
                    'Add proper error boundaries',
                    'Implement proper cleanup in useEffect'
                ],
                fileExtensions: ['.tsx', '.jsx'],
                testFramework: 'jest',
                storybook: true
            },
            vue: {
                imports: ['defineComponent', 'ref', 'reactive', 'computed', 'onMounted'],
                patterns: [
                    'Use Composition API for TypeScript support',
                    'Implement proper reactivity patterns',
                    'Use semantic UI System components',
                    'Add proper component validation',
                    'Use teleport for overlays'
                ],
                fileExtensions: ['.vue'],
                testFramework: 'vitest',
                storybook: true
            },
            angular: {
                imports: ['Component', 'Input', 'Output', 'EventEmitter', 'OnInit'],
                patterns: [
                    'Use standalone components',
                    'Implement proper lifecycle hooks',
                    'Use semantic UI System components',
                    'Add proper input validation',
                    'Use trackBy for performance'
                ],
                fileExtensions: ['.component.ts', '.component.html', '.component.scss'],
                testFramework: 'jasmine',
                storybook: true
            },
            svelte: {
                imports: ['createEventDispatcher', 'onMount', 'tick'],
                patterns: [
                    'Use semantic UI System components',
                    'Implement proper store patterns',
                    'Add proper component props',
                    'Use proper lifecycle functions',
                    'Implement proper reactivity'
                ],
                fileExtensions: ['.svelte'],
                testFramework: 'vitest',
                storybook: true
            },
            electron: {
                imports: ['app', 'BrowserWindow', 'ipcMain', 'ipcRenderer'],
                patterns: [
                    'Use proper IPC communication',
                    'Implement security best practices',
                    'Use semantic UI System in renderer',
                    'Add proper main process handling',
                    'Implement proper window management'
                ],
                fileExtensions: ['.ts', '.js'],
                testFramework: 'jest',
                storybook: false,
                special: {
                    mainProcess: true,
                    rendererProcess: true,
                    nodeIntegration: false,
                    contextIsolation: true
                }
            },
            'react-native': {
                imports: ['React', 'View', 'Text', 'StyleSheet', 'Platform'],
                patterns: [
                    'Use React Native semantic components',
                    'Implement platform-specific code',
                    'Use proper StyleSheet patterns',
                    'Add accessibility props',
                    'Handle platform differences'
                ],
                fileExtensions: ['.tsx', '.jsx'],
                testFramework: 'jest',
                storybook: true,
                special: {
                    platformSpecific: true,
                    nativeComponents: true,
                    flexboxDefault: true
                }
            },
            nextjs: {
                imports: ['Next', 'Image', 'Link', 'Head', 'useRouter'],
                patterns: [
                    'Use Next.js optimized components',
                    'Implement proper SSR patterns',
                    'Use semantic UI System components',
                    'Add proper SEO optimization',
                    'Use Next.js routing patterns'
                ],
                fileExtensions: ['.tsx', '.jsx'],
                testFramework: 'jest',
                storybook: true,
                special: {
                    ssr: true,
                    apiRoutes: true,
                    imageOptimization: true,
                    routing: true
                }
            },
            nuxtjs: {
                imports: ['defineNuxtComponent', 'useState', 'useFetch', 'navigateTo'],
                patterns: [
                    'Use Nuxt 3 composition patterns',
                    'Implement proper SSR patterns',
                    'Use semantic UI System components',
                    'Add proper SEO optimization',
                    'Use Nuxt routing patterns'
                ],
                fileExtensions: ['.vue'],
                testFramework: 'vitest',
                storybook: true,
                special: {
                    ssr: true,
                    apiRoutes: true,
                    autoImports: true,
                    routing: true
                }
            }
        };
        return patterns[platform] || patterns.react;
    }
    /**
     * Get template content without compilation (for editing)
     */
    async getTemplateContent(templatePath) {
        const fullPath = path.join(this.templatesPath, templatePath);
        return await fs.readFile(fullPath, 'utf-8');
    }
    /**
     * Save template content
     */
    async saveTemplate(templatePath, content) {
        const fullPath = path.join(this.templatesPath, templatePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content, 'utf-8');
        // Clear cached version
        this.templateCache.delete(templatePath);
        this.metadataCache.delete(templatePath);
        consola.debug(`Saved template: ${templatePath}`);
    }
}
// Singleton instance
export const templateLoader = new TemplateLoader();
//# sourceMappingURL=template-loader.js.map