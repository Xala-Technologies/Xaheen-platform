/**
 * Template Loader Utility
 *
 * Handles loading and caching of external Handlebars templates.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
import type { NSMClassification } from '../compliance/nsm-classifier.js';
export interface TemplateMetadata {
    path: string;
    category: string;
    type: 'file' | 'component' | 'config';
    lastModified: number;
}
export declare class TemplateLoader {
    private templateCache;
    private metadataCache;
    private templatesPath;
    constructor();
    /**
     * Load a template by its path relative to templates directory
     */
    loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate>;
    /**
     * Render a template with context
     */
    renderTemplate(templatePath: string, context: any): Promise<string>;
    /**
     * Enhance template context with UI System version and metadata
     */
    private enhanceContext;
    /**
     * Get UI System version from package.json
     */
    private getUISystemVersion;
    /**
     * Get template by service configuration
     */
    getTemplatePath(serviceType: string, templateType: 'file' | 'component' | 'config', filename: string): string;
    /**
     * List all available templates
     */
    listTemplates(): Promise<TemplateMetadata[]>;
    /**
     * Clear template cache
     */
    clearCache(): void;
    /**
     * Pre-load commonly used templates
     */
    preloadTemplates(templatePaths: string[]): Promise<void>;
    /**
     * Validate template accessibility compliance
     */
    validateAccessibility(templatePath: string, context: {
        componentName: string;
        targetLevel?: 'A' | 'AA' | 'AAA';
        nsmClassification?: NSMClassification;
        norwegianCompliance?: boolean;
        platform?: string;
    }): Promise<import("./accessibility-validator.js").AccessibilityValidationResult>;
    /**
     * Register Handlebars helpers
     */
    private registerHelpers;
    /**
     * Validate template syntax
     */
    validateTemplate(templatePath: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * Get MCP component specifications for platform-specific generation
     */
    getMCPSpecs(componentName: string, platform: string): Promise<any>;
    /**
     * Get platform-specific patterns and optimizations
     */
    private getPlatformSpecificPatterns;
    /**
     * Get template content without compilation (for editing)
     */
    getTemplateContent(templatePath: string): Promise<string>;
    /**
     * Save template content
     */
    saveTemplate(templatePath: string, content: string): Promise<void>;
}
export declare const templateLoader: TemplateLoader;
//# sourceMappingURL=template-loader.d.ts.map